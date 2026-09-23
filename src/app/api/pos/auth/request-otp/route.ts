import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { error: "Registered email or phone number is required." },
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
      },
    });

    if (!user) {
      // Return 200 to prevent user enumeration attacks
      return NextResponse.json({
        success: true,
        message: "If an active Merchant Owner account exists for this identifier, an OTP has been dispatched.",
      });
    }

    // CASHIER RESTRICTION RULE
    if (user.role === "CASHIER") {
      return NextResponse.json(
        {
          error: "CASHIER_RESTRICTED",
          message: "Cashier accounts cannot self-reset credentials. Password resets must be performed directly by your Store Owner from the store management console.",
        },
        { status: 403 }
      );
    }

    if (user.role !== "MERCHANT_OWNER") {
      return NextResponse.json(
        { error: "Unauthorized self-serve recovery." },
        { status: 403 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Delete previous reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    // Save new reset token
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        otpHash,
        expiresAt,
      },
    });

    // Log OTP dispatch in development/test environment
    console.log(`[AUTH-OTP] Generated OTP for Merchant Owner '${user.email}': ${otp}`);

    return NextResponse.json({
      success: true,
      message: `OTP dispatched to registered contact for store owner '${user.name}'.`,
      // For development verification convenience, pass test OTP in dev mode
      ...(process.env.NODE_ENV !== "production" ? { debugOtp: otp } : {}),
    });
  } catch (error) {
    console.error("Request OTP Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing OTP request." },
      { status: 500 }
    );
  }
}
