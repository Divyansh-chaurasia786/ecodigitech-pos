import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPosSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getPosSession();
    if (!session || !session.tenantId) {
      // Demo tickets fallback for workstation view
      const demoTickets = [
        {
          id: "rep-1001",
          deviceName: "iPhone 13 Pro 128GB Sierra Blue",
          problemDescription: "[🛠️ PAID REPAIR LAB] | Broken Display Screen Assembly Replacement | Acc: Battery Case",
          pinPattern: "1234",
          estimatedCost: 8500.0,
          advancePaid: 2000.0,
          status: "IN_PROGRESS",
          sacCode: "9987",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          customer: { name: "Ramesh Sharma", phone: "9876543210" },
        },
        {
          id: "rep-1002",
          deviceName: "Samsung Galaxy S23 Ultra (512GB)",
          problemDescription: "[🛡️ IN-STORE WARRANTY CLAIM] | Charging Port Defect | Acc: None",
          pinPattern: null,
          estimatedCost: 0.0,
          advancePaid: 0.0,
          status: "RECEIVED",
          sacCode: "9987",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          customer: { name: "Anita Gupta", phone: "9812345678" },
        },
      ];

      return NextResponse.json({ success: true, tickets: demoTickets });
    }

    const tickets = await prisma.repairTicket.findMany({
      where: { tenantId: session.tenantId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error("Get Repair Tickets Error:", error);
    return NextResponse.json(
      { error: "An error occurred fetching repair tickets." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      deviceName,
      problemDescription,
      pinPattern,
      estimatedCost,
      advancePaid,
    } = body;

    const session = await getPosSession();
    if (!session || !session.tenantId) {
      // Standalone workstation / demo ticket creation
      const newTicket = {
        id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        deviceName: deviceName || "Mobile Device",
        problemDescription: problemDescription || "Repair Service",
        pinPattern: pinPattern || null,
        estimatedCost: Number(estimatedCost) || 0,
        advancePaid: Number(advancePaid) || 0,
        status: "RECEIVED",
        sacCode: "9987",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        customer: {
          id: `cust-${Date.now()}`,
          name: customerName || "Customer",
          phone: customerPhone || "9876543210",
        },
      };

      return NextResponse.json({
        success: true,
        message: "Repair Ticket & Job Sheet created successfully.",
        ticket: newTicket,
      });
    }

    if (!customerName || !customerPhone || !deviceName || !problemDescription || estimatedCost === undefined) {
      return NextResponse.json(
        { error: "Customer name, phone, device name, problem description, and estimated cost are required." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Find or create customer
      let customer = await tx.customer.findFirst({
        where: { tenantId: session.tenantId, phone: customerPhone.trim() },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            tenantId: session.tenantId,
            name: customerName.trim(),
            phone: customerPhone.trim(),
          },
        });
      }

      // Create repair ticket
      const ticket = await tx.repairTicket.create({
        data: {
          tenantId: session.tenantId,
          customerId: customer.id,
          deviceName: deviceName.trim(),
          problemDescription: problemDescription.trim(),
          pinPattern: pinPattern || null,
          estimatedCost: Number(estimatedCost),
          advancePaid: Number(advancePaid || 0),
          status: "RECEIVED",
          sacCode: "9987",
        },
        include: { customer: true },
      });

      return ticket;
    });

    return NextResponse.json({
      success: true,
      message: "Repair Ticket & Job Sheet created successfully.",
      ticket: result,
    });
  } catch (error) {
    console.error("Create Repair Ticket Error:", error);
    return NextResponse.json(
      { error: "An error occurred while creating repair ticket." },
      { status: 500 }
    );
  }
}

