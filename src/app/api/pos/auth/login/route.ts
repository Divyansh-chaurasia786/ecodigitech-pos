import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signPosToken, setPosSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email or phone number and password are required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier },
        ],
        role: { in: ["MERCHANT_OWNER", "CASHIER"] },
      },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.tenantId || !user.tenant) {
      return NextResponse.json(
        { error: "Invalid credentials or account not associated with an active store." },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Generate POS Session JWT token and set HTTP-only pos_session cookie
    const jwtToken = await signPosToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role as "MERCHANT_OWNER" | "CASHIER",
    });

    await setPosSessionCookie(jwtToken);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        businessName: user.tenant.businessName,
      },
    });
  } catch (error) {
    console.error("POS Merchant Login Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during POS login." },
      { status: 500 }
    );
  }
}
