import { NextResponse } from "next/server";
import { getPosSession } from "@/lib/auth";

export async function GET() {
  const session = await getPosSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: session,
  });
}
