import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPosSession } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const session = await getPosSession();
    if (!session || !session.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType } = await request.json();
    if (planType !== "6_MONTH" && planType !== "1_YEAR") {
      return NextResponse.json(
        { error: "Invalid planType. Expected '6_MONTH' or '1_YEAR'." },
        { status: 400 }
      );
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = planType === "6_MONTH" ? 499900 : 899900; // ₹4,999 or ₹8,999

    // Retrieve encrypted Razorpay secret from SystemSetting or Tenant
    let razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_ecodigitech";
    let razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_ecodigitech";

    const systemSettingKey = await prisma.systemSetting.findUnique({
      where: { key: "RAZORPAY_KEY_ID" },
    });
    const systemSettingSecret = await prisma.systemSetting.findUnique({
      where: { key: "RAZORPAY_SECRET_ENC" },
    });

    if (systemSettingKey?.valueEnc) {
      try {
        razorpayKeyId = decrypt(systemSettingKey.valueEnc);
      } catch {
        // Fallback to plain/env
      }
    }

    if (systemSettingSecret?.valueEnc) {
      try {
        razorpaySecret = decrypt(systemSettingSecret.valueEnc);
      } catch {
        // Fallback to plain/env
      }
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpaySecret,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `sub_${session.tenantId.slice(0, 8)}_${Date.now()}`,
      notes: {
        tenantId: session.tenantId,
        planType,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
      planType,
    });
  } catch (error: any) {
    console.error("Razorpay Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred creating Razorpay order." },
      { status: 500 }
    );
  }
}
