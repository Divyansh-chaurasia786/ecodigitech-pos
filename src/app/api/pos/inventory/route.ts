import { NextRequest, NextResponse } from "next/server";

// Sample initial in-memory dataset for seamless instant demo mode,
// easily queryable alongside Prisma DB
let mockInventory = [
  {
    id: "prod-101",
    category: "BRAND_NEW",
    title: "Samsung Galaxy S24 Ultra 5G (12GB RAM, 256GB - Titanium Gray)",
    barcode: "8901234567890",
    imei1: "358901234567890",
    serialNumber: "R5CR104ABC",
    purchasePrice: 110000,
    sellingPrice: 129999,
    stockQuantity: 4,
    hsnSacCode: "8517",
    gstRate: 18.0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-102",
    category: "REFURBISHED",
    title: "Apple iPhone 15 Pro Max 256GB (Refurbished - Grade A+)",
    barcode: "194253012345",
    imei1: "359012345678901",
    serialNumber: "F17X901XYZ",
    purchasePrice: 92000,
    sellingPrice: 108000,
    stockQuantity: 2,
    hsnSacCode: "8517",
    gstRate: 18.0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-103",
    category: "ACCESSORY",
    title: "Anker 65W GaN Fast Wall Charger (USB-C Power Delivery)",
    barcode: "848061012346",
    purchasePrice: 1800,
    sellingPrice: 2999,
    stockQuantity: 18,
    hsnSacCode: "8504",
    gstRate: 18.0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-104",
    category: "REPAIR_PART",
    title: "Original OLED Display Assembly for iPhone 14 Pro",
    barcode: "RP-IP14P-OLED",
    purchasePrice: 12500,
    sellingPrice: 18500,
    stockQuantity: 1, // Low stock!
    hsnSacCode: "8517",
    gstRate: 18.0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-105",
    category: "ACCESSORY",
    title: "Spigen Tough Armor Heavy Duty Case for S24 Ultra",
    barcode: "880989674001",
    purchasePrice: 850,
    sellingPrice: 1499,
    stockQuantity: 12,
    hsnSacCode: "3926",
    gstRate: 18.0,
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const category = searchParams.get("category") || "";

  let filtered = mockInventory;

  if (category && category !== "ALL") {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.barcode?.toLowerCase().includes(search) ||
        item.imei1?.includes(search) ||
        item.hsnSacCode.includes(search)
    );
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if bulk import (array of items)
    if (Array.isArray(body.items) || Array.isArray(body)) {
      const itemsToImport = Array.isArray(body.items) ? body.items : body;
      const imported: any[] = [];

      for (const item of itemsToImport) {
        if (!item.title || !item.sellingPrice) continue;
        const newItem = {
          id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: item.category || "BRAND_NEW",
          title: item.title,
          barcode: item.barcode || `BC-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          imei1: item.imei1 || null,
          serialNumber: item.serialNumber || null,
          purchasePrice: Number(item.purchasePrice) || 0,
          sellingPrice: Number(item.sellingPrice) || 0,
          stockQuantity: Number(item.stockQuantity) || 1,
          hsnSacCode: item.hsnSacCode || "8517",
          gstRate: Number(item.gstRate) || 18.0,
          updatedAt: new Date().toISOString(),
        };
        mockInventory.unshift(newItem);
        imported.push(newItem);
      }

      return NextResponse.json({ success: true, count: imported.length, data: imported }, { status: 201 });
    }

    if (!body.title || !body.sellingPrice || !body.category) {
      return NextResponse.json(
        { success: false, error: "Title, Category, and Selling Price are required" },
        { status: 400 }
      );
    }

    const newItem = {
      id: `prod-${Date.now()}`,
      category: body.category,
      title: body.title,
      barcode: body.barcode || `BC-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      imei1: body.imei1 || null,
      serialNumber: body.serialNumber || null,
      purchasePrice: Number(body.purchasePrice) || 0,
      sellingPrice: Number(body.sellingPrice),
      stockQuantity: Number(body.stockQuantity) || 1,
      hsnSacCode: body.hsnSacCode || "8517",
      gstRate: Number(body.gstRate) || 18.0,
      updatedAt: new Date().toISOString(),
    };

    mockInventory.unshift(newItem);

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, stockQuantity, sellingPrice, purchasePrice, title } = body;

    const itemIndex = mockInventory.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (typeof stockQuantity === "number") {
      mockInventory[itemIndex].stockQuantity = stockQuantity;
    }
    if (typeof sellingPrice === "number") {
      mockInventory[itemIndex].sellingPrice = sellingPrice;
    }
    if (typeof purchasePrice === "number") {
      mockInventory[itemIndex].purchasePrice = purchasePrice;
    }
    if (title && typeof title === "string") {
      mockInventory[itemIndex].title = title;
    }
    mockInventory[itemIndex].updatedAt = new Date().toISOString();

    return NextResponse.json({ success: true, data: mockInventory[itemIndex] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
