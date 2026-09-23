"use client";

import React from "react";
import { CartItem, CustomerInfo, InvoiceSummary } from "@/types/pos";
import { getPlaceOfSupplyFromAddress } from "@/utils/gstUtils";

interface A4GstInvoiceProps {
  invoiceNumber: string;
  dateTime: string;
  storeName?: string;
  storeSubName?: string;
  storeAddress?: string;
  storePhone?: string;
  storeGstin?: string;
  placeOfSupply?: string;
  reverseCharge?: string;
  customer?: CustomerInfo | null;
  shippedToCustomer?: CustomerInfo | null;
  items: CartItem[];
  summary: InvoiceSummary;
  isThermal80mm?: boolean;
  forceShowOnScreen?: boolean;
  logoUrl?: string;
}

// Convert numbers into Indian Currency words (e.g. 12500 -> Twelve Thousand Five Hundred)
function numberToWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return "Zero";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(num: number): string {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + a[num % 10] : "");
    if (num < 1000) return a[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + inWords(num % 100) : "");
    if (num < 100000) return inWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + inWords(num % 1000) : "");
    if (num < 10000000) return inWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + inWords(num % 100000) : "");
    return inWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + inWords(num % 10000000) : "");
  }

  return `Rupees ${inWords(rounded)} Only`;
}

export function A4GstInvoice({
  invoiceNumber,
  dateTime,
  storeName = "EcoFone Mobile Store",
  storeSubName = "Main Branch",
  storeAddress = "123 Market Street, Commercial Hub",
  storePhone = "+91 98765 43210",
  storeGstin = "07AAAAA0000A1Z5",
  placeOfSupply,
  reverseCharge = "N",
  customer,
  shippedToCustomer,
  items = [],
  summary,
  isThermal80mm = false,
  forceShowOnScreen = false,
  logoUrl,
}: A4GstInvoiceProps) {
  const formattedDate = dateTime ? dateTime.split(",")[0] : new Date().toLocaleDateString("en-IN");
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  // Automatically derive Indian State Place of Supply from store address if not explicitly set
  const resolvedPlaceOfSupply = getPlaceOfSupplyFromAddress(storeAddress, placeOfSupply);
  const shipCustomer = shippedToCustomer || customer;

  // Automatically update page size style tag so browser print preview auto-selects 80mm or A4
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    let styleEl = document.getElementById("dynamic-print-page-size");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-print-page-size";
      document.head.appendChild(styleEl);
    }
    if (isThermal80mm) {
      styleEl.innerHTML = `@media print { @page { size: 80mm auto !important; margin: 0 !important; } }`;
      document.body.classList.add("print-mode-80mm");
      document.body.classList.remove("print-mode-a4");
    } else {
      styleEl.innerHTML = `@media print { @page { size: A4 portrait !important; margin: 0 !important; } }`;
      document.body.classList.add("print-mode-a4");
      document.body.classList.remove("print-mode-80mm");
    }
  }, [isThermal80mm]);

  // Minimum rows to fit cleanly on A4 vs 80mm
  const minRows = isThermal80mm ? 1 : 4;
  const emptyRowsCount = Math.max(0, minRows - items.length);

  // ----------------------------------------------------
  // 80mm THERMAL RECEIPT LAYOUT ADAPTATION
  // ----------------------------------------------------
  if (isThermal80mm) {
    return (
      <div className={`a4-gst-invoice thermal-80mm ${forceShowOnScreen ? "block" : "hidden print:block"} text-black bg-white font-sans leading-snug w-full border border-black box-border select-none p-1.5 text-[10.5px]`}>
        {/* Top Header Section */}
        <div className="p-1 border-b border-black text-center space-y-0.5">
          <div className="flex justify-between items-center text-[10px] font-bold border-b border-slate-300 pb-0.5 mb-1">
            <span>GSTIN: {storeGstin}</span>
            <span className="italic font-mono text-[9px]">Original Copy</span>
          </div>
          {Boolean(logoUrl?.trim()) && (
            <img
              src={logoUrl}
              alt="Company Logo"
              className="h-10 w-auto object-contain mx-auto mb-1 shrink-0"
              style={{ maxHeight: "40px", width: "auto" }}
            />
          )}
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">TAX INVOICE</h2>
          <h1 className="text-base font-black tracking-tight uppercase leading-tight">{storeName}</h1>
          <p className="text-[10px] font-semibold text-slate-700">
            {storeSubName}{storeAddress ? ` | ${storeAddress}` : ""}
          </p>
          {storePhone && (
            <p className="text-[10px] font-semibold text-slate-600 font-mono">
              Ph: {storePhone}
            </p>
          )}
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-2 border-b border-black font-sans text-[10px] p-1 gap-y-0.5 border-collapse">
          <div><span className="font-bold">Invoice No:</span> {invoiceNumber}</div>
          <div><span className="font-bold">Dated:</span> {formattedDate}</div>
          <div><span className="font-bold">Place of Supply:</span> {resolvedPlaceOfSupply}</div>
          <div><span className="font-bold">Rev. Charge:</span> {reverseCharge}</div>
        </div>

        {/* Billed To */}
        <div className="border-b border-black font-sans text-[10.5px] p-1.5 space-y-0.5">
          <p className="font-bold italic">Billed to :</p>
          <p className="font-bold text-[11.5px]">{customer?.name || "Avnip Kumar"}</p>
          <p className="text-[10px]">{customer?.address || "Prayagraj"}</p>
          {customer?.gstin && (
            <p className="text-[10px]"><span className="font-semibold">GSTIN / UIN: </span>{customer.gstin}</p>
          )}
        </div>

        {shippedToCustomer && (
          <div className="border-b border-black font-sans text-[10.5px] p-1.5 space-y-0.5">
            <p className="font-bold italic">Shipped to :</p>
            <p className="font-bold text-[11.5px]">{shippedToCustomer.name}</p>
            <p className="text-[10px]">{shippedToCustomer.address || customer?.address || "Prayagraj"}</p>
            {shippedToCustomer.gstin && (
              <p className="text-[10px]"><span className="font-semibold">GSTIN / UIN: </span>{shippedToCustomer.gstin}</p>
            )}
          </div>
        )}

        {/* Main Item Table Grid for 80mm */}
        <table className="w-full text-left border-b border-black text-[10.5px] font-sans border-collapse">
          <thead>
            <tr className="border-b border-black bg-slate-100 font-bold text-[10.5px]">
              <th className="p-1 border-r border-black w-4 text-center">#</th>
              <th className="p-1 border-r border-black">Item Description</th>
              <th className="p-1 border-r border-black text-center w-8">Qty</th>
              <th className="p-1 border-r border-black text-right w-12">Rate</th>
              <th className="p-1 text-right w-14">Amount(₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const cgstAmount = (item.taxAmount / 2).toFixed(2);
              const sgstAmount = (item.taxAmount / 2).toFixed(2);
              const gstDetail = item.gstRate > 0
                ? `HSN:${item.hsnSacCode || "--"} | CGST:${(item.gstRate/2)}% (₹${cgstAmount}) SGST:${(item.gstRate/2)}% (₹${sgstAmount})`
                : `HSN:${item.hsnSacCode || "--"} | Tax Exempt`;

              return (
                <React.Fragment key={item.id || idx}>
                  <tr className="border-t border-slate-200">
                    <td className="p-1 border-r border-black text-center align-top font-semibold">{idx + 1}</td>
                    <td className="p-1 border-r border-black align-top font-bold text-[11px]">
                      {item.title}
                    </td>
                    <td className="p-1 border-r border-black text-center align-top font-semibold">{item.quantity}</td>
                    <td className="p-1 border-r border-black text-right align-top">{item.unitPrice.toLocaleString("en-IN")}</td>
                    <td className="p-1 text-right font-bold align-top">{item.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr className="border-b border-black text-[9px] text-slate-700 bg-slate-50/50">
                    <td className="border-r border-black"></td>
                    <td colSpan={4} className="px-1 py-0.5 font-mono leading-tight">
                      {gstDetail} {item.imei1 ? `| IMEI:${item.imei1}` : ""}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Grand Total Row */}
        <div className="flex justify-between items-center border-b border-black p-1.5 text-[11px] font-bold bg-slate-50">
          <span>Grand Total ({totalQty.toFixed(2)} Pcs)</span>
          <span className="text-[13px] font-black">₹ {summary.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>

        {/* Tax Rate Summary */}
        <div className="border-b border-black p-1 text-[9.5px]">
          <div className="font-bold border-b border-slate-300 pb-0.5 mb-0.5 text-[10px]">GST Tax Summary</div>
          <div className="grid grid-cols-5 text-center font-mono text-[9px]">
            <div><span className="block font-sans font-semibold">Rate</span>{items[0]?.gstRate ? `${items[0].gstRate}%` : "Exempt"}</div>
            <div><span className="block font-sans font-semibold">Taxable</span>{summary.taxableAmount.toFixed(2)}</div>
            <div><span className="block font-sans font-semibold">CGST</span>{summary.cgst.toFixed(2)}</div>
            <div><span className="block font-sans font-semibold">SGST</span>{summary.sgst.toFixed(2)}</div>
            <div><span className="block font-sans font-semibold">Total</span>{summary.taxAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Amount in Words */}
        <div className="border-b border-black p-1 font-bold text-[10.5px] bg-slate-50/50">
          {numberToWords(summary.grandTotal)}
        </div>

        {/* Terms & Conditions + Signatures */}
        <div className="p-1 space-y-1 text-[9.5px] font-sans">
          <div>
            <p className="font-bold underline text-[10px]">Terms &amp; Conditions</p>
            <ol className="list-decimal list-inside text-[9px] text-slate-800 leading-tight">
              <li>Goods once sold will not be taken back.</li>
              <li>Interest @ 18% p.a. charged if payment delayed.</li>
              <li>Subject to &apos;{resolvedPlaceOfSupply.split(" ")[0]}&apos; Jurisdiction.</li>
            </ol>
          </div>
          <div className="flex justify-between items-end pt-3 border-t border-slate-300">
            <div>
              <p className="font-bold text-[9px]">Receiver&apos;s Signature</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[9px]">For {storeName}</p>
              <p className="pt-4 font-bold text-[10px]">Auth. Signatory</p>
            </div>
          </div>
          {/* Footer EcoDigiTech Branding & Logo */}
          <div className="pt-2 border-t border-black text-[8.5px] font-sans flex items-center justify-center space-x-1.5">
            <img
              src="/brand/logo.png"
              alt="EcoDigiTech Logo"
              className="h-4 w-auto object-contain shrink-0"
              style={{ height: "16px", width: "auto" }}
            />
            <span>Powered &amp; Managed by EcoDigiTech • www.ecodigitech.com</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL A4 SINGLE-PAGE GST INVOICE LAYOUT
  // ----------------------------------------------------
  return (
    <div
      className={`a4-gst-invoice ${forceShowOnScreen ? "block" : "hidden print:block"} text-black bg-white font-sans leading-tight w-full border-1.5 border-black h-full flex flex-col justify-between box-border select-none p-0 text-[10px]`}
    >
      {/* Top Header Section */}
      <div>
        {/* GSTIN & Tax Invoice Title */}
        <div className="p-3 border-b border-black flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Boolean(logoUrl?.trim()) && (
              <img
                src={logoUrl}
                alt="Company Logo"
                className="h-12 w-auto object-contain max-w-[150px] shrink-0"
                style={{ maxHeight: "48px", width: "auto" }}
              />
            )}
            <div>
              <p className="font-sans text-[10px] font-bold">
                GSTIN : <span className="font-semibold">{storeGstin}</span>
              </p>
              <h1 className="text-base font-black tracking-tight uppercase leading-tight pt-0.5">{storeName}</h1>
              <p className="text-[10px] font-semibold text-slate-700">
                {storeSubName}{storeAddress ? ` | ${storeAddress}` : ""}
              </p>
              {storePhone && (
                <p className="text-[10px] font-semibold text-slate-600 font-mono">
                  Ph: {storePhone}
                </p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-[9px] text-slate-500 italic">Original Copy</div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">TAX INVOICE</h2>
          </div>
        </div>

        {/* Invoice Meta Grid (Invoice No, Date, Place of Supply, Reverse Charge) */}
        <div className="grid grid-cols-2 border-b border-black font-sans text-[11px]">
          <div className="p-2 border-r border-black space-y-1">
            <div className="flex">
              <span className="w-24 font-semibold">Invoice No.</span>
              <span>: {invoiceNumber}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-semibold">Dated</span>
              <span>: {formattedDate}</span>
            </div>
          </div>
          <div className="p-2 space-y-1">
            <div className="flex">
              <span className="w-32 font-semibold">Place of Supply</span>
              <span>: {resolvedPlaceOfSupply}</span>
            </div>
            <div className="flex">
              <span className="w-32 font-semibold">Reverse Charge</span>
              <span>: {reverseCharge}</span>
            </div>
          </div>
        </div>

        {/* Billed To / Shipped To Grid */}
        <div className="grid grid-cols-2 border-b border-black font-sans text-[11px]">
          <div className="p-2 border-r border-black flex flex-col justify-between space-y-1 min-h-[75px]">
            <div>
              <p className="font-bold italic">Billed to :</p>
              <p className="font-bold text-xs">{customer?.name || "Avnip Kumar"}</p>
              <p>{customer?.address || "Prayagraj"}</p>
            </div>
            <p className="pt-2">
              <span className="font-semibold">GSTIN / UIN : </span>
              {customer?.gstin || ""}
            </p>
          </div>
          <div className="p-2 flex flex-col justify-between space-y-1 min-h-[75px]">
            <div>
              <p className="font-bold italic">Shipped to :</p>
              <p className="font-bold text-xs">{shipCustomer?.name || customer?.name || "Avnip Kumar"}</p>
              <p>{shipCustomer?.address || customer?.address || "Prayagraj"}</p>
            </div>
            <p className="pt-2">
              <span className="font-semibold">GSTIN / UIN : </span>
              {shipCustomer?.gstin || customer?.gstin || ""}
            </p>
          </div>
        </div>

        {/* Main Item Table Grid with Full Height Vertical Lines */}
        <table className="w-full text-left border-b border-black text-[10.5px] font-sans border-collapse">
          <thead>
            <tr className="border-b border-black bg-slate-100 font-bold text-[10px] text-center">
              <th className="p-1 border-r border-black w-7">S.N.</th>
              <th className="p-1 border-r border-black text-left">Description of Goods</th>
              <th className="p-1 border-r border-black w-20">HSN/SAC Code</th>
              <th className="p-1 border-r border-black w-20 text-center">Qty. Unit</th>
              <th className="p-1 border-r border-black w-20 text-right">List Price</th>
              <th className="p-1 border-r border-black w-16 text-right">Discount</th>
              <th className="p-1 border-r border-black w-14 text-center">CGST Rate</th>
              <th className="p-1 border-r border-black w-16 text-right">CGST Amount</th>
              <th className="p-1 border-r border-black w-14 text-center">SGST Rate</th>
              <th className="p-1 border-r border-black w-16 text-right">SGST Amount</th>
              <th className="p-1 text-right w-24">Amount( ₹ )</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const cgstRate = item.gstRate > 0 ? `${(item.gstRate / 2).toFixed(2)} %` : "Exempt";
              const sgstRate = item.gstRate > 0 ? `${(item.gstRate / 2).toFixed(2)} %` : "Exempt";
              const cgstAmount = (item.taxAmount / 2).toFixed(2);
              const sgstAmount = (item.taxAmount / 2).toFixed(2);

              return (
                <tr key={item.id || idx}>
                  <td className="p-1.5 border-r border-black text-center align-top">{idx + 1}.</td>
                  <td className="p-1.5 border-r border-black align-top font-semibold">
                    <div>{item.title}</div>
                    {item.imei1 && <div className="text-[9.5px] text-slate-700 font-mono">IMEI: {item.imei1}</div>}
                  </td>
                  <td className="p-1.5 border-r border-black text-center align-top">{item.hsnSacCode || ""}</td>
                  <td className="p-1.5 border-r border-black text-center align-top font-semibold">{item.quantity.toFixed(2)} Pcs.</td>
                  <td className="p-1.5 border-r border-black text-right align-top">{item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  <td className="p-1.5 border-r border-black text-right align-top">0.00 %</td>
                  <td className="p-1.5 border-r border-black text-center align-top">{cgstRate}</td>
                  <td className="p-1.5 border-r border-black text-right align-top">{item.gstRate > 0 ? cgstAmount : "0.00"}</td>
                  <td className="p-1.5 border-r border-black text-center align-top">{sgstRate}</td>
                  <td className="p-1.5 border-r border-black text-right align-top">{item.gstRate > 0 ? sgstAmount : "0.00"}</td>
                  <td className="p-1.5 text-right font-bold align-top">{item.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
              );
            })}

            {/* Empty Vertical Grid Lines Filler Rows to match Busy Accounting Layout */}
            {Array.from({ length: emptyRowsCount }).map((_, idx) => (
              <tr key={`empty-${idx}`} className="h-7">
                <td className="border-r border-black text-center"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grand Total, Tax Summary, Words & Signatures Footer */}
      <div>
        {/* Grand Total Row */}
        <div className="flex justify-between items-center border-b border-black py-1 px-2 text-[11px] font-bold">
          <div className="w-1/2 text-center font-bold">Grand Total</div>
          <div className="w-32 text-center font-bold">{totalQty.toFixed(2)} Pcs.</div>
          <div className="border border-black px-3 py-1 font-bold text-xs bg-slate-50 min-w-[120px] text-right">
            ₹ &nbsp; {summary.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Tax Rate Breakdown Table Grid */}
        <div className="border-b border-black p-2 text-[10px]">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="font-bold text-slate-800">
                <th className="pr-4">Tax Rate</th>
                <th className="pr-4">Taxable Amt.</th>
                <th className="pr-4">CGST Amt.</th>
                <th className="pr-4">SGST Amt.</th>
                <th>Total Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{items[0]?.gstRate ? `${items[0].gstRate}%` : "Exempt"}</td>
                <td>{summary.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>{summary.cgst > 0 ? summary.cgst.toFixed(2) : "--"}</td>
                <td>{summary.sgst > 0 ? summary.sgst.toFixed(2) : "--"}</td>
                <td>{summary.taxAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="border-b border-black p-2 font-bold text-xs bg-slate-50/50">
          {numberToWords(summary.grandTotal)}
        </div>

        {/* Terms & Conditions + Signatures Grid */}
        <div className="grid grid-cols-12 text-[10.5px] border-t border-black font-sans">
          {/* Terms (Col 7) */}
          <div className="col-span-7 border-r border-black p-2 space-y-1">
            <p className="font-bold underline">Terms &amp; Conditions</p>
            <p className="text-[10px] text-slate-800">E.& O.E.</p>
            <ol className="list-decimal list-inside text-[10px] text-slate-800 space-y-0.5 leading-snug">
              <li>Goods once sold will not be taken back.</li>
              <li>Interest @ 18% p.a. will be charged if the payment is not made within the stipulated time.</li>
              <li>Subject to &apos;{resolvedPlaceOfSupply.replace(/\s*\(\d+\)/, "").trim()}&apos; Jurisdiction only.</li>
            </ol>
          </div>

          {/* Signatures (Col 5) */}
          <div className="col-span-5 p-2 flex flex-col justify-between min-h-[90px] text-right font-sans">
            <div className="text-left font-bold">Receiver&apos;s Signature :</div>
            <div className="pt-6">
              <p className="font-bold text-[11px]">For {storeName}</p>
              <p className="pt-6 font-bold text-xs text-slate-900">Authorised Signatory</p>
            </div>
          </div>
        </div>

        {/* Footer EcoDigiTech Branding & Logo */}
        <div className="p-2 border-t border-black flex items-center justify-center space-x-2 text-[9.5px] text-slate-700 font-mono bg-slate-50">
          <img
            src="/brand/logo.png"
            alt="EcoDigiTech Logo"
            className="h-4 w-auto object-contain shrink-0"
            style={{ height: "18px", width: "auto" }}
          />
          <span>Powered &amp; Managed by EcoDigiTech | Multi-Store Mobile POS &amp; ERP Automation • www.ecodigitech.com</span>
        </div>
      </div>
    </div>
  );
}


