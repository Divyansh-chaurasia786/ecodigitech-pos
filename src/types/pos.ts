export type ProductCategory = "BRAND_NEW" | "REFURBISHED" | "ACCESSORY" | "REPAIR_PART";

export interface ProductItem {
  id: string;
  category: ProductCategory;
  title: string;
  barcode?: string | null;
  imei1?: string | null;
  imei2?: string | null;
  serialNumber?: string | null;
  purchasePrice: number;
  sellingPrice: number; // Inclusive MRP
  stockQuantity: number;
  hsnSacCode: string;
  gstRate: number; // e.g. 18.0
}

export interface CartItem {
  id: string;
  productId?: string;
  category: ProductCategory;
  title: string;
  barcode?: string;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  unitPrice: number;
  purchasePrice: number;
  quantity: number;
  hsnSacCode?: string;
  gstRate: number;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CustomerInfo {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  aadhaarNo?: string;
  panNo?: string;
  address?: string;
}

export type TenderMode = "CASH" | "UPI" | "CARD" | "UDHAAR" | "SPLIT";

export interface InvoiceSummary {
  subtotal: number;
  taxableAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  grandTotal: number;
  tenderMode: TenderMode;
  amountPaid: number;
  changeDue: number;
}
