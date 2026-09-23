import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signPosToken, setPosSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, ownerName, email, phone, password, gstin, address } = body;

    if (!businessName || !ownerName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Business name, owner name, email, phone, and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if user or tenant already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: cleanEmail }, { phone: cleanPhone }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email or phone number already exists." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validTill = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30-Day Trial

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant Profile
      const tenant = await tx.tenant.create({
        data: {
          businessName: businessName.trim(),
          ownerName: ownerName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          gstin: gstin ? gstin.trim() : null,
          address: address ? address.trim() : null,
          status: "TRIAL",
          validTill,
          moduleNewPhones: true,
          moduleRefurbished: true,
          moduleBuyIn: true,
          moduleRepairs: true,
          moduleAccessories: true,
        },
      });

      // 2. Create MERCHANT_OWNER User
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          role: "MERCHANT_OWNER",
          name: ownerName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash: hashedPassword,
        },
      });

      return { tenant, user };
    });

    // Sign POS JWT session and set HTTP-only cookie
    const jwtToken = await signPosToken({
      userId: result.user.id,
      tenantId: result.tenant.id,
      email: result.user.email,
      role: "MERCHANT_OWNER",
    });

    await setPosSessionCookie(jwtToken);

    return NextResponse.json({
      success: true,
      message: "30-Day Free Trial store registered successfully.",
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        tenantId: result.tenant.id,
        businessName: result.tenant.businessName,
      },
    });
  } catch (error) {
    console.error("Self-Serve Signup Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during store registration." },
      { status: 500 }
    );
  }
}
