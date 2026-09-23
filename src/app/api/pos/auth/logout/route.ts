import { NextResponse } from "next/server";
import { clearPosSessionCookie } from "@/lib/auth";

export async function POST() {
  await clearPosSessionCookie();
  return NextResponse.json({ success: true });
}
