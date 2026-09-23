"use client";

import { CartItem, CustomerInfo, InvoiceSummary } from "@/types/pos";

interface ThermalReceiptProps {
  invoiceNumber: string;
  dateTime: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeGstin?: string;
  customer?: CustomerInfo | null;
  items: CartItem[];
  summary: InvoiceSummary;
  logoUrl?: string;
}

export function ThermalReceipt({
  invoiceNumber,
  dateTime,
  storeName = "EcoFone Mobile Store",
  storeAddress = "123 Market Street, Commercial Hub",
  storePhone = "+91 98765 43210",
  storeGstin = "07AAAAA0000A1Z5",
  customer,
  items = [],
  summary,
  logoUrl,
}: ThermalReceiptProps) {
  return (
    <div className="thermal-receipt hidden print:block text-black bg-white font-mono text-[11px] leading-tight w-full max-w-[80mm] mx-auto p-2 box-border select-none">
      {/* Store Header */}
      <div className="text-center border-b-2 border-black pb-2 mb-2 space-y-0.5">
        {Boolean(logoUrl?.trim()) && (
          <img
            src={logoUrl}
            alt="Company Logo"
            className="h-10 w-auto object-contain mx-auto mb-1 shrink-0"
          />
        )}
        <h1 className="font-black text-sm uppercase tracking-wide">{storeName}</h1>
        <p className="text-[10px] font-medium">{storeAddress}</p>
        <p className="text-[10px] font-medium">Ph: {storePhone}</p>
        {storeGstin && <p className="text-[10px] font-bold">GSTIN: {storeGstin}</p>}
      </div>

      {/* Invoice Meta */}
      <div className="border-b border-black pb-1.5 mb-2 text-[10px] space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>Inv #: <span>{invoiceNumber}</span></span>
          <span suppressHydrationWarning>{dateTime}</span>
        </div>
        {customer && (
          <div className="pt-0.5 space-y-0.5">
            <p className="font-bold">Cust: {customer.name} ({customer.phone})</p>
            {customer.address && <p className="text-[9.5px]">Addr: {customer.address}</p>}
            {customer.gstin && <p className="text-[9.5px] font-bold">GSTIN: {customer.gstin}</p>}
            {customer.aadhaarNo && <p className="text-[9.5px]">Aadhaar: {customer.aadhaarNo}</p>}
            {customer.panNo && <p className="text-[9.5px]">PAN: {customer.panNo}</p>}
          </div>
        )}
      </div>

      {/* Item Table */}
      <table className="w-full text-left border-b-2 border-black mb-2 text-[10px]">
        <thead>
          <tr className="border-y border-black font-extrabold uppercase">
            <th className="py-1">Item</th>
            <th className="text-center py-1">Qty</th>
            <th className="text-right py-1">Price</th>
            <th className="text-right py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id || idx} className="border-b border-dashed border-slate-300">
              <td className="py-1 pr-1 align-top">
                <div className="font-bold">{item.title}</div>
                {item.imei1 && <div className="text-[9px] text-slate-800">IMEI: {item.imei1}</div>}
                {item.serialNumber && <div className="text-[9px] text-slate-800">SN: {item.serialNumber}</div>}
              </td>
              <td className="text-center align-top py-1 font-bold">{item.quantity}</td>
              <td className="text-right align-top py-1">₹{item.unitPrice.toFixed(2)}</td>
              <td className="text-right align-top py-1 font-bold">₹{item.totalAmount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tax & Summary Split */}
      <div className="space-y-1 text-[10px] pb-1.5 mb-1.5">
        <div className="flex justify-between">
          <span>Subtotal (Excl. Tax):</span>
          <span>₹{summary.taxableAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>CGST (9% / 2.5%):</span>
          <span>₹{summary.cgst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>SGST (9% / 2.5%):</span>
          <span>₹{summary.sgst.toFixed(2)}</span>
        </div>
        {summary.discount > 0 && (
          <div className="flex justify-between font-bold text-red-700">
            <span>Discount:</span>
            <span>-₹{summary.discount.toFixed(2)}</span>
          </div>
        )}

        {/* Highlighted Grand Total Box */}
        <div className="flex justify-between font-black text-xs border-y-2 border-black py-1.5 my-1.5 uppercase">
          <span>GRAND TOTAL:</span>
          <span>₹{summary.grandTotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-[9.5px] font-bold">
          <span>Payment Mode:</span>
          <span className="uppercase">{summary.tenderMode}</span>
        </div>
      </div>

      {/* Mandatory EcoDigiTech Footer Branding with Logo */}
      <div className="text-center pt-2 text-[9px] font-bold space-y-1 border-t border-black">
        <p>Thank you for shopping with us!</p>
        <div className="pt-0.5 flex items-center justify-center space-x-1.5">
          <img
            src="/brand/logo.png"
            alt="EcoDigiTech Logo"
            className="h-4 w-auto object-contain shrink-0"
            style={{ height: "16px", width: "auto" }}
          />
          <span className="text-[9.5px] font-black tracking-tight">
            Powered &amp; Managed by EcoDigiTech | pos.ecodigitech.com
          </span>
        </div>
      </div>
    </div>
  );
}
