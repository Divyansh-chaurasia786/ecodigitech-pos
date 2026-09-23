import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "ecodigitech_webhook_secret_2026";

    // Retrieve encrypted webhook secret if configured in SystemSetting
    const systemSettingWebhook = await prisma.systemSetting.findUnique({
      where: { key: "RAZORPAY_WEBHOOK_SECRET_ENC" },
    });
    if (systemSettingWebhook?.valueEnc) {
      try {
        webhookSecret = decrypt(systemSettingWebhook.valueEnc);
      } catch {
        // Fallback
      }
    }

    // Verify HMAC-SHA256 signature
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.error("Invalid Razorpay Webhook Signature!");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);

    if (event.event === "order.paid" || event.event === "payment.captured") {
      const entity = event.payload.payment.entity;
      const orderNotes = entity.notes || {};
      const tenantId = orderNotes.tenantId;
      const planType = orderNotes.planType || "6_MONTH";

      if (tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
        });

        if (tenant) {
          const now = new Date();
          const currentValidTill = new Date(tenant.validTill);
          const baseDate = currentValidTill > now ? currentValidTill : now;

          const daysToAdd = planType === "1_YEAR" ? 365 : 180;
          const newValidTill = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

          await prisma.$transaction([
            // 1. Update Tenant Subscription status & validTill
            prisma.tenant.update({
              where: { id: tenant.id },
              data: {
                status: "ACTIVE",
                validTill: newValidTill,
              },
            }),
            // 2. Log subscription extension record
            prisma.subscriptionLog.create({
              data: {
                tenantId: tenant.id,
                planType,
                razorpayOrderId: entity.order_id || "N/A",
                razorpayPaymentId: entity.id || "N/A",
                amount: Number(entity.amount) / 100,
                validFrom: baseDate,
                validTo: newValidTill,
              },
            }),
          ]);

          console.log(`[SUBSCRIPTION-WEBHOOK] Tenant '${tenant.id}' extended by ${daysToAdd} days. Valid till: ${newValidTill}`);
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay Webhook Processing Error:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
