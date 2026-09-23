import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { getPosSession } from "@/lib/auth";
import { getPlaceOfSupplyFromAddress } from "@/utils/gstUtils";

export async function GET() {
  try {
    const session = await getPosSession();
    const isOwner = !session || session.role === "MERCHANT_OWNER";
    const userRole = session?.role || "MERCHANT_OWNER";

    if (!session || !session.tenantId) {
      const demoAddress = "123 Market Street, Commercial Hub";
      return NextResponse.json({
        success: true,
        isOwner: true,
        userRole: "MERCHANT_OWNER",
        modules: {
          id: "demo-tenant",
          businessName: "EcoFone Mobile Store",
          storeSubName: "Main Branch",
          storeAddress: demoAddress,
          storePhone: "+91 98765 43210",
          gstin: "07AAAAA0000A1Z5",
          placeOfSupply: getPlaceOfSupplyFromAddress(demoAddress, "Delhi (07)"),
          invoicePrefix: "INV/2026/",
          invoiceNextNumber: 1,
          defaultPrintMode: "A4_GST",
          moduleNewPhones: true,
          moduleRefurbished: true,
          moduleBuyIn: true,
          moduleRepairs: true,
          moduleAccessories: true,
        },
      });
    }

    let tenant = null;
    try {
      tenant = await withDbTimeout(
        prisma.tenant.findUnique({
          where: { id: session.tenantId },
          select: {
            id: true,
            businessName: true,
            gstin: true,
            address: true,
            phone: true,
            moduleNewPhones: true,
            moduleRefurbished: true,
            moduleBuyIn: true,
            moduleRepairs: true,
            moduleAccessories: true,
          },
        }),
        600
      );
    } catch (dbErr) {
      console.warn("Prisma DB query for tenant settings timed out or failed, using demo fallback:", dbErr);
    }

    const tenantAddress = tenant?.address || "123 Market Street, Commercial Hub";

    return NextResponse.json({
      success: true,
      isOwner,
      userRole,
      modules: {
        id: tenant?.id || "demo-tenant",
        businessName: tenant?.businessName || "EcoFone Mobile Store",
        storeSubName: "Main Branch",
        storeAddress: tenantAddress,
        storePhone: tenant?.phone || "+91 98765 43210",
        gstin: tenant?.gstin || "07AAAAA0000A1Z5",
        placeOfSupply: getPlaceOfSupplyFromAddress(tenantAddress, "Delhi (07)"),
        invoicePrefix: "INV/2026/",
        invoiceNextNumber: 1,
        defaultPrintMode: "A4_GST",
        logoUrl: "/brand/logo.png",
        moduleNewPhones: tenant?.moduleNewPhones ?? true,
        moduleRefurbished: tenant?.moduleRefurbished ?? true,
        moduleBuyIn: tenant?.moduleBuyIn ?? true,
        moduleRepairs: tenant?.moduleRepairs ?? true,
        moduleAccessories: tenant?.moduleAccessories ?? true,
      },
    });
  } catch (error) {
    console.error("Get Module Settings Error:", error);
    return NextResponse.json(
      { error: "An error occurred fetching store settings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getPosSession();
    const body = await request.json();

    const {
      businessName,
      storeSubName,
      storeAddress,
      storePhone,
      gstin,
      placeOfSupply,
      invoicePrefix,
      invoiceNextNumber,
      defaultPrintMode,
      logoUrl,
      moduleNewPhones,
      moduleRefurbished,
      moduleBuyIn,
      moduleRepairs,
      moduleAccessories,
    } = body;

    const isOwner = !session || session.role === "MERCHANT_OWNER";

    // Enforce role check: Only MERCHANT_OWNER can update tenant store branding details in DB
    if (session && session.tenantId && isOwner) {
      await prisma.tenant.update({
        where: { id: session.tenantId },
        data: {
          ...(businessName ? { businessName } : {}),
          ...(gstin !== undefined ? { gstin } : {}),
          ...(storeAddress !== undefined ? { address: storeAddress } : {}),
          ...(typeof moduleNewPhones === "boolean" ? { moduleNewPhones } : {}),
          ...(typeof moduleRefurbished === "boolean" ? { moduleRefurbished } : {}),
          ...(typeof moduleBuyIn === "boolean" ? { moduleBuyIn } : {}),
          ...(typeof moduleRepairs === "boolean" ? { moduleRepairs } : {}),
          ...(typeof moduleAccessories === "boolean" ? { moduleAccessories } : {}),
        },
      });
    }

    return NextResponse.json({
      success: true,
      isOwner,
      message: isOwner
        ? "Store profile & print layout settings saved successfully."
        : "Workstation print layout saved successfully. (Store details require Admin authority).",
      modules: {
        businessName: businessName || "EcoFone Mobile Store",
        storeSubName: storeSubName || "Main Branch",
        storeAddress: storeAddress || "123 Market Street, Commercial Hub",
        storePhone: storePhone || "+91 98765 43210",
        gstin: gstin || "07AAAAA0000A1Z5",
        placeOfSupply: placeOfSupply || "Delhi (07)",
        invoicePrefix: invoicePrefix || "INV/2026/",
        invoiceNextNumber: Number(invoiceNextNumber) || 1,
        defaultPrintMode: defaultPrintMode || "A4_GST",
        logoUrl: logoUrl || "/brand/logo.png",
        moduleNewPhones,
        moduleRefurbished,
        moduleBuyIn,
        moduleRepairs,
        moduleAccessories,
      },
    });
  } catch (error) {
    console.error("Update Module Settings Error:", error);
    return NextResponse.json(
      { error: "An error occurred updating store settings." },
      { status: 500 }
    );
  }
}
