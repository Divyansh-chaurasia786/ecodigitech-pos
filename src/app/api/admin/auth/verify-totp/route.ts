import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verify } from "otplib";
import { signAdminToken, setAdminSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, token, secretToSave } = await request.json();

    if (!email || !password || !token) {
      return NextResponse.json(
        { error: "Email, password, and 6-digit TOTP token are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { email, role: "SUPER_ADMIN" },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid master credentials." },
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

    let totpSecretToUse = user.totpSecret;

    // Handle initial enrollment verification
    if (!totpSecretToUse && secretToSave) {
      totpSecretToUse = secretToSave;
    }

    if (!totpSecretToUse) {
      return NextResponse.json(
        { error: "TOTP secret uninitialized. Please restart login process." },
        { status: 400 }
      );
    }

    const isValidToken = await verify({
      token: token.trim(),
      secret: totpSecretToUse,
    });

    if (!isValidToken) {
      return NextResponse.json(
        { error: "Invalid TOTP verification code. Please check Google Authenticator." },
        { status: 401 }
      );
    }

    // Save TOTP secret if this was initial enrollment
    if (!user.totpSecret && secretToSave) {
      await prisma.user.update({
        where: { id: user.id },
        data: { totpSecret: secretToSave },
      });
    }

    // Issue Super Admin JWT token and set HTTP-only admin_session cookie
    const jwtToken = await signAdminToken({
      userId: user.id,
      email: user.email,
      role: "SUPER_ADMIN",
    });

    await setAdminSessionCookie(jwtToken);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Super Admin TOTP Verification Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during TOTP verification." },
      { status: 500 }
    );
  }
}
