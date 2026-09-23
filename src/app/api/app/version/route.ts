import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "2.1.0",
    buildDate: new Date().toISOString().split("T")[0],
    appName: "EcoDigiTech POS & Mobile ERP",
    dataSafeNotice: "All sales, inventory, and customer khata records are preserved in central database.",
  });
}
