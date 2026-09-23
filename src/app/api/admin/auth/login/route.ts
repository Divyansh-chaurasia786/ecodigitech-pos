import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email, role: "SUPER_ADMIN" },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid master credentials or unauthorized role." },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid master credentials." },
        { status: 401 }
      );
    }

    // If TOTP is already configured
    if (user.totpSecret) {
      return NextResponse.json({
        success: true,
        requireTotp: true,
        requireEnrollment: false,
      });
    }

    // Generate new secret for initial enrollment
    const newSecret = generateSecret();
    const otpauthUrl = generateURI({
      secret: newSecret,
      label: email,
      issuer: "EcoDigiTech Super Admin",
    });
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    return NextResponse.json({
      success: true,
      requireTotp: true,
      requireEnrollment: true,
      secret: newSecret,
      qrCodeUrl,
    });
  } catch (error) {
    console.error("Super Admin Login Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
