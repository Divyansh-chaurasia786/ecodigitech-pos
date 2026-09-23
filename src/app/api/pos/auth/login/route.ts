import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signPosToken, setPosSessionCookie } from "@/lib/auth";

// Offline / Demo Store User Fallback for testing & local development
const DEMO_STORE_USER = {
  id: "demo-store-user-123",
  tenantId: "demo-tenant-123",
  name: "EcoDigiTech Demo Store Owner",
  email: "store@ecodigitech.com",
  phone: "9876543210",
  role: "MERCHANT_OWNER" as const,
  businessName: "EcoDigiTech Demo Store",
};

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

    let user;
    try {
      user = await prisma.user.findFirst({
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
    } catch (dbError) {
      console.warn("⚠️ Database connection failed. Checking offline demo credentials...", dbError);
      
      // Fallback for demo testing when local PostgreSQL is offline
      if (
        (cleanIdentifier === "store@ecodigitech.com" || cleanIdentifier === "9876543210") &&
        password === "Store123!Password"
      ) {
        const jwtToken = await signPosToken({
          userId: DEMO_STORE_USER.id,
          tenantId: DEMO_STORE_USER.tenantId,
          email: DEMO_STORE_USER.email,
          role: DEMO_STORE_USER.role,
        });

        await setPosSessionCookie(jwtToken);

        return NextResponse.json({
          success: true,
          user: DEMO_STORE_USER,
        });
      }

      return NextResponse.json(
        { error: "Database server offline. Start PostgreSQL or use demo credentials (store@ecodigitech.com / Store123!Password)." },
        { status: 503 }
      );
    }

    if (!user || !user.tenantId || !user.tenant) {
      // If DB is online but user record not found, check if it matches test store credentials
      if (
        (cleanIdentifier === "store@ecodigitech.com" || cleanIdentifier === "9876543210") &&
        password === "Store123!Password"
      ) {
        const jwtToken = await signPosToken({
          userId: DEMO_STORE_USER.id,
          tenantId: DEMO_STORE_USER.tenantId,
          email: DEMO_STORE_USER.email,
          role: DEMO_STORE_USER.role,
        });

        await setPosSessionCookie(jwtToken);

        return NextResponse.json({
          success: true,
          user: DEMO_STORE_USER,
        });
      }

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
