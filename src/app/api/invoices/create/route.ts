import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPosSession } from "@/lib/auth";
import { enforceSubscriptionLock, SubscriptionLockedError } from "@/lib/subscriptionGuard";
import { CartItem, TenderMode } from "@/types/pos";

export async function POST(request: Request) {
  try {
    const session = await getPosSession();
    if (!session || !session.tenantId) {
      return NextResponse.json(
        { error: "You do not have the authority to update or generate checkout invoices. Please contact your Store Administrator." },
        { status: 401 }
      );
    }

    const tenantId = session.tenantId;

    // RULE 3.6 / RULE 5.3: Enforce subscription write lockout (HTTP 403 SUBSCRIPTION_LOCKED)
    try {
      await enforceSubscriptionLock(tenantId);
    } catch (lockError) {
      if (lockError instanceof SubscriptionLockedError) {
        return NextResponse.json(
          {
            error: "SUBSCRIPTION_LOCKED",
            message: lockError.message,
          },
          { status: 403 }
        );
      }
      throw lockError;
    }

    const body = await request.json();
    const {
      customerId,
      customerName,
      customerPhone,
      items,
      paymentMode,
      discount,
    } = body as {
      customerId?: string;
      customerName?: string;
      customerPhone?: string;
      items: CartItem[];
      paymentMode: TenderMode;
      discount?: number;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart cannot be empty." }, { status: 400 });
    }

    const discountAmount = Number(discount || 0);

    // ACID Transaction for Invoice Creation, Stock Deduction, and Khata Balance Mutation
    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Fetch Tenant for credit limit check
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
      });
      if (!tenant) throw new Error("Tenant profile not found.");

      // 2. Customer resolution / Khata credit check
      let customerRecord = null;
      if (customerId) {
        customerRecord = await tx.customer.findFirst({
          where: { id: customerId, tenantId },
        });
      } else if (customerPhone) {
        customerRecord = await tx.customer.findFirst({
          where: { tenantId, phone: customerPhone.trim() },
        });
        if (!customerRecord && customerName) {
          customerRecord = await tx.customer.create({
            data: {
              tenantId,
              name: customerName.trim(),
              phone: customerPhone.trim(),
            },
          });
        }
      }

      // Calculate totals
      let totalAmountSum = 0;
      let taxAmountSum = 0;

      for (const item of items) {
        totalAmountSum += item.totalAmount;
        taxAmountSum += item.taxAmount;
      }

      const grandTotal = Math.max(0, totalAmountSum - discountAmount);

      // Handle Khata / Udhaar credit limit validation
      if (paymentMode === "UDHAAR" || paymentMode === "SPLIT") {
        if (!customerRecord) {
          throw new Error("Customer profile is required to issue Udhaar / Credit billing.");
        }
        const newBalance = customerRecord.currentBalance + grandTotal;
        if (newBalance > tenant.creditLimit) {
          throw new Error(
            `Customer credit limit exceeded. Current balance (₹${customerRecord.currentBalance}) + invoice total (₹${grandTotal}) exceeds store limit of ₹${tenant.creditLimit}.`
          );
        }

        // Update Customer Khata balance
        await tx.customer.update({
          where: { id: customerRecord.id },
          data: { currentBalance: newBalance },
        });
      }

      // 3. Generate unique invoice number
      const count = await tx.invoice.count({ where: { tenantId } });
      const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1)
        .toString()
        .padStart(4, "0")}`;

      // 4. Create Invoice Record
      const createdInvoice = await tx.invoice.create({
        data: {
          tenantId,
          invoiceNumber,
          customerId: customerRecord ? customerRecord.id : null,
          totalAmount: grandTotal,
          taxAmount: taxAmountSum,
          paymentMode,
          paymentStatus: paymentMode === "UDHAAR" ? "PENDING" : "COMPLETED",
          viralFooter: "Powered by EcoDigiTech | pos.ecodigitech.com",
        },
      });

      // 5. Create InvoiceItems & deduct product stock
      for (const item of items) {
        // Freeze item snapshot onto InvoiceItem
        await tx.invoiceItem.create({
          data: {
            tenantId,
            invoiceId: createdInvoice.id,
            productId: item.productId || null,
            itemType: item.category,
            title: item.title,
            imei1: item.imei1 || null,
            imei2: item.imei2 || null,
            unitPrice: item.unitPrice,
            purchasePrice: item.purchasePrice,
            quantity: item.quantity,
            gstRate: item.gstRate,
            taxAmount: item.taxAmount,
            totalAmount: item.totalAmount,
          },
        });

        // Deduct inventory stock
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return createdInvoice;
    });

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error: any) {
    console.error("Invoice Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred creating invoice." },
      { status: 400 }
    );
  }
}
