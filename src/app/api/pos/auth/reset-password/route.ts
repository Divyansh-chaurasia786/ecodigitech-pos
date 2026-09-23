import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { identifier, otp, newPassword } = await request.json();

    if (!identifier || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Identifier, OTP code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters long." },
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
        role: "MERCHANT_OWNER",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Merchant Owner account not found." },
        { status: 404 }
      );
    }

    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email: user.email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: "OTP code expired or invalid. Please request a new OTP." },
        { status: 400 }
      );
    }

    const isOtpValid = await bcrypt.compare(otp.trim(), resetTokenRecord.otpHash);
    if (!isOtpValid) {
      return NextResponse.json(
        { error: "Invalid OTP verification code." },
        { status: 400 }
      );
    }

    // Hash new password and update user credentials
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // Delete used reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. Please log in with your new credentials.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resetting password." },
      { status: 500 }
    );
  }
}
