"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Receipt,
  Printer,
  FileText,
  User,
  Phone,
  Smartphone,
  ShieldCheck,
  X,
  Copy,
  Check,
  ExternalLink,
  Filter,
  Sparkles,
  Calendar,
  CreditCard,
  Building2,
  Boxes,
} from "lucide-react";
import { A4GstInvoice } from "@/components/hardware/A4GstInvoice";

export interface UniversalBillRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  type: "SALES_INVOICE" | "REPAIR_BILL" | "KHATA_SETTLEMENT" | "INTAKE_SLIP";
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerGstin?: string;
  customerPan?: string;
  customerId?: string;
  items: Array<{
    title: string;
    quantity: number;
    sellingPrice: number;
    imei?: string;
    serialNumber?: string;
    hsnSacCode?: string;
    gstRate?: number;
  }>;
  imeiOrSerials: string[];
  totalAmount: number;
  paidAmount: number;
  balanceAdded: number;
  paymentMode: string;
}

// Pre-seeded searchable mobile store invoices (with IMEI, customer, and serial numbers)
const INITIAL_SEARCHABLE_BILLS: UniversalBillRecord[] = [
  {
    id: "bill-101",
    invoiceNumber: "INV-2026-0040",
    date: "2026-09-19",
    type: "SALES_INVOICE",
    customerName: "Ramesh Sharma",
    customerPhone: "9876543210",
    customerAddress: "Connaught Place, New Delhi",
    customerGstin: "07AAAAA0000A1Z5",
    customerId: "cust-1",
    items: [
      {
        title: "iPhone 15 Pro Max (256GB - Natural Titanium)",
        quantity: 1,
        sellingPrice: 144900,
        imei: "354890123456789",
        serialNumber: "DX3H9012345",
        hsnSacCode: "8517",
        gstRate: 18,
      },
      {
        title: "Samsung 25W Fast Charger + Type C Cable",
        quantity: 1,
        sellingPrice: 4000,
        hsnSacCode: "8504",
        gstRate: 18,
      },
    ],
    imeiOrSerials: ["354890123456789", "354890123456790", "DX3H9012345"],
    totalAmount: 148900,
    paidAmount: 144900,
    balanceAdded: 4000,
    paymentMode: "UDHAAR",
  },
  {
    id: "bill-102",
    invoiceNumber: "INV-2026-0038",
    date: "2026-09-18",
    type: "SALES_INVOICE",
    customerName: "Ramesh Sharma",
    customerPhone: "9876543210",
    customerAddress: "Connaught Place, New Delhi",
    customerId: "cust-1",
    items: [
      {
        title: "Samsung Galaxy S22 Ultra (Refurbished - Like New)",
        quantity: 1,
        sellingPrice: 46999,
        imei: "359876543210987",
        serialNumber: "R53N9098765",
        hsnSacCode: "8517",
        gstRate: 18,
      },
    ],
    imeiOrSerials: ["359876543210987", "R53N9098765"],
    totalAmount: 46999,
    paidAmount: 42499,
    balanceAdded: 4500,
    paymentMode: "UDHAAR",
  },
  {
    id: "bill-103",
    invoiceNumber: "INV-2026-0035",
    date: "2026-09-15",
    type: "SALES_INVOICE",
    customerName: "Anita Gupta",
    customerPhone: "9812345678",
    customerAddress: "Sector 18, Noida, UP",
    customerId: "cust-2",
    items: [
      {
        title: "Anker 65W GaN Fast Wall Charger",
        quantity: 1,
        sellingPrice: 2999,
        serialNumber: "ANK-65W-901122",
        hsnSacCode: "8504",
        gstRate: 18,
      },
    ],
    imeiOrSerials: ["ANK-65W-901122"],
    totalAmount: 2999,
    paidAmount: 2999,
    balanceAdded: 0,
    paymentMode: "UPI",
  },
  {
    id: "bill-104",
    invoiceNumber: "INV-2026-0042",
    date: "2026-09-20",
    type: "REPAIR_BILL",
    customerName: "Vikram Malhotra",
    customerPhone: "9899887766",
    customerAddress: "DLF Cyber City, Gurugram, HR",
    customerId: "cust-3",
    items: [
      {
        title: "iPhone 13 OLED Display Panel Replacement",
        quantity: 1,
        sellingPrice: 7500,
        serialNumber: "DSP-IP13-8899",
        hsnSacCode: "9987",
        gstRate: 18,
      },
    ],
    imeiOrSerials: ["DSP-IP13-8899", "358711223344556"],
    totalAmount: 7500,
    paidAmount: 0,
    balanceAdded: 7500,
    paymentMode: "UDHAAR",
  },
  {
    id: "bill-105",
    invoiceNumber: "INV-2026-0039",
    date: "2026-09-17",
    type: "SALES_INVOICE",
    customerName: "Vikram Malhotra",
    customerPhone: "9899887766",
    customerAddress: "DLF Cyber City, Gurugram, HR",
    customerId: "cust-3",
    items: [
      {
        title: "Matte Back Cover + Tempered Glass Guard",
        quantity: 2,
        sellingPrice: 6700,
        hsnSacCode: "3926",
        gstRate: 18,
      },
    ],
    imeiOrSerials: [],
    totalAmount: 6700,
    paidAmount: 0,
    balanceAdded: 6700,
    paymentMode: "UDHAAR",
  },
  {
    id: "bill-106",
    invoiceNumber: "INV-2026-0031",
    date: "2026-09-14",
    type: "SALES_INVOICE",
    customerName: "Rajesh Verma",
    customerPhone: "9823456789",
    customerAddress: "Civil Lines, Saharanpur, UP",
    customerId: "cust-4",
    items: [
      {
        title: "Tempered Glass Guard + 33W Fast Charger",
        quantity: 1,
        sellingPrice: 3200,
        hsnSacCode: "8504",
        gstRate: 18,
      },
    ],
    imeiOrSerials: [],
    totalAmount: 3200,
    paidAmount: 0,
    balanceAdded: 3200,
    paymentMode: "UDHAAR",
  },
];

interface UniversalBillSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UniversalBillSearchModal({ isOpen, onClose }: UniversalBillSearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "SALES_INVOICE" | "REPAIR_BILL" | "KHATA_SETTLEMENT">("ALL");
  const [allBills, setAllBills] = useState<UniversalBillRecord[]>(INITIAL_SEARCHABLE_BILLS);
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  // Selected bill for viewing/printing modal preview
  const [previewBill, setPreviewBill] = useState<UniversalBillRecord | null>(null);
  const [previewPrintMode, setPreviewPrintMode] = useState<"A4_GST" | "THERMAL_80MM">("A4_GST");

  // Load all bills from localStorage (company_customers_db, company_customer_ledger_*, company_local_repair_tickets)
  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== "undefined") {
      try {
        const aggregated: UniversalBillRecord[] = [...INITIAL_SEARCHABLE_BILLS];
        const addedIds = new Set(aggregated.map((b) => b.invoiceNumber));

        // 1. Load from saved customers DB
        const savedCustomersStr = localStorage.getItem("company_customers_db");
        if (savedCustomersStr) {
          const customers: any[] = JSON.parse(savedCustomersStr);
          customers.forEach((c) => {
            const custId = c.id || c.phone;
            const ledgerKey = `company_customer_ledger_${custId}`;
            const savedLedgerStr = localStorage.getItem(ledgerKey);
            if (savedLedgerStr) {
              const txs: any[] = JSON.parse(savedLedgerStr);
              txs.forEach((tx) => {
                if (tx.invoiceNumber && !addedIds.has(tx.invoiceNumber)) {
                  addedIds.add(tx.invoiceNumber);
                  aggregated.push({
                    id: tx.id || `bill-${Date.now()}`,
                    invoiceNumber: tx.invoiceNumber,
                    date: tx.date || new Date().toISOString().split("T")[0],
                    type: tx.type === "SETTLEMENT" ? "KHATA_SETTLEMENT" : "SALES_INVOICE",
                    customerName: c.name || "Customer",
                    customerPhone: c.phone || "",
                    customerAddress: c.address || "",
                    customerGstin: c.gstin || "",
                    customerId: custId,
                    items: [
                      {
                        title: tx.description || `Invoice ${tx.invoiceNumber}`,
                        quantity: 1,
                        sellingPrice: tx.totalAmount || 0,
                      },
                    ],
                    imeiOrSerials: [],
                    totalAmount: tx.totalAmount || 0,
                    paidAmount: tx.paidAmount || 0,
                    balanceAdded: tx.balanceAdded || 0,
                    paymentMode: tx.paymentMode || "CASH",
                  });
                }
              });
            }
          });
        }

        // 2. Load from repair lab tickets
        const savedRepairsStr = localStorage.getItem("company_local_repair_tickets");
        if (savedRepairsStr) {
          const tickets: any[] = JSON.parse(savedRepairsStr);
          tickets.forEach((t) => {
            const invNum = `REP-${t.id.replace(/\D/g, "") || t.id}`;
            if (!addedIds.has(invNum)) {
              addedIds.add(invNum);
              const imeis: string[] = [];
              if (t.imeiOrSerial) imeis.push(t.imeiOrSerial);

              aggregated.push({
                id: t.id,
                invoiceNumber: invNum,
                date: t.createdAt ? new Date(t.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                type: "REPAIR_BILL",
                customerName: t.customer?.name || "Repair Customer",
                customerPhone: t.customer?.phone || "",
                customerId: t.customer?.id,
                items: [
                  {
                    title: `Mobile Repair: ${t.deviceName} (${t.problemDescription})`,
                    quantity: 1,
                    sellingPrice: t.estimatedCost || 0,
                    imei: t.imeiOrSerial,
                    hsnSacCode: "9987",
                    gstRate: 18,
                  },
                ],
                imeiOrSerials: imeis,
                totalAmount: t.estimatedCost || 0,
                paidAmount: t.advancePaid || 0,
                balanceAdded: Math.max(0, (t.estimatedCost || 0) - (t.advancePaid || 0)),
                paymentMode: t.status === "DELIVERED" ? "CASH" : "UDHAAR",
              });
            }
          });
        }

        setAllBills(aggregated);
      } catch (e) {
        console.error("Failed loading aggregated bills:", e);
      }
    }
  }, [isOpen]);

  // Filter bills by search query (Invoice #, Customer Name, Phone, IMEI / Serial, Item Title)
  const filteredBills = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");

    return allBills.filter((bill) => {
      // Type Filter
      if (activeFilter !== "ALL" && bill.type !== activeFilter) {
        return false;
      }

      if (!q) return true;

      // 1. Invoice Number Match
      if (bill.invoiceNumber.toLowerCase().includes(q)) return true;

      // 2. Customer Name Match
      if (bill.customerName.toLowerCase().includes(q)) return true;

      // 3. Customer Mobile Phone Match (only evaluate if search query contains digits)
      if (qDigits.length > 0 && bill.customerPhone.replace(/\D/g, "").includes(qDigits)) return true;

      // 4. IMEI or Serial Number Match
      if (bill.imeiOrSerials.some((code) => code.toLowerCase().includes(q))) return true;

      // 5. Item Title / Description Match
      if (
        bill.items.some(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            (i.imei && i.imei.toLowerCase().includes(q)) ||
            (i.serialNumber && i.serialNumber.toLowerCase().includes(q))
        )
      )
        return true;

      // 6. Date Match
      if (bill.date.includes(q)) return true;

      return false;
    });
  }, [allBills, query, activeFilter]);

  const handleCopyInvoice = (invNum: string) => {
    navigator.clipboard.writeText(invNum);
    setCopiedInvoice(invNum);
    setTimeout(() => setCopiedInvoice(null), 2000);
  };

  const handleTriggerPrintPreview = (bill: UniversalBillRecord, mode: "A4_GST" | "THERMAL_80MM") => {
    setPreviewBill(bill);
    setPreviewPrintMode(mode);

    setTimeout(() => {
      if (typeof document !== "undefined") {
        let styleEl = document.getElementById("dynamic-print-page-size");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "dynamic-print-page-size";
          document.head.appendChild(styleEl);
        }
        if (mode === "THERMAL_80MM") {
          styleEl.innerHTML = `@media print { @page { size: 80mm auto !important; margin: 0 !important; } }`;
          document.body.classList.add("print-mode-80mm");
          document.body.classList.remove("print-mode-a4");
        } else {
          styleEl.innerHTML = `@media print { @page { size: A4 portrait !important; margin: 0 !important; } }`;
          document.body.classList.add("print-mode-a4");
          document.body.classList.remove("print-mode-80mm");
        }
      }
      window.print();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in zoom-in-95 duration-150">
      {/* Printable On-Screen Preview Modal */}
      {previewBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-4 print:hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-fuchsia-400" />
                <h3 className="font-extrabold text-sm tracking-tight">Print GST Tax Invoice Voucher ({previewBill.invoiceNumber})</h3>
              </div>
              <button
                onClick={() => setPreviewBill(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Options Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">Printer Format:</span>
                <button
                  onClick={() => setPreviewPrintMode("A4_GST")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    previewPrintMode === "A4_GST"
                      ? "bg-fuchsia-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  📄 A4 Tax Invoice
                </button>
                <button
                  onClick={() => setPreviewPrintMode("THERMAL_80MM")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    previewPrintMode === "THERMAL_80MM"
                      ? "bg-fuchsia-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  🧾 80mm Thermal Receipt
                </button>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold px-5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>🖨️ Print Invoice Now</span>
              </button>
            </div>

            {/* Modal On-Screen Document Preview */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100/70 flex justify-center">
              <div
                id="printable-receipt-container"
                className={`bg-white shadow-md text-black box-border printable-active-target ${
                  previewPrintMode === "A4_GST" ? "w-full max-w-[190mm]" : "w-full max-w-[80mm]"
                }`}
              >
                <A4GstInvoice
                  forceShowOnScreen={true}
                  invoiceNumber={previewBill.invoiceNumber}
                  dateTime={previewBill.date}
                  storeName="EcoDigiTech Mobile Hub"
                  storeSubName="Main Retail & Repair Lab Store"
                  storeAddress="Main Market, Saharanpur, Uttar Pradesh - 247001"
                  storePhone="+91 98765 43210"
                  storeGstin="09AAAAA0000A1Z5"
                  placeOfSupply="Uttar Pradesh (09)"
                  customer={{
                    name: previewBill.customerName,
                    phone: previewBill.customerPhone,
                    address: previewBill.customerAddress,
                    gstin: previewBill.customerGstin,
                  }}
                  items={previewBill.items.map((i, idx) => {
                    const gstRate = i.gstRate || 18;
                    const unitPrice = i.sellingPrice;
                    const qty = i.quantity || 1;
                    const total = unitPrice * qty;
                    const taxable = total / (1 + gstRate / 100);
                    const taxAmount = total - taxable;

                    return {
                      id: `item-${idx}`,
                      category: "ACCESSORY" as const,
                      title: i.title,
                      imei1: i.imei,
                      serialNumber: i.serialNumber,
                      unitPrice: unitPrice,
                      purchasePrice: unitPrice * 0.7,
                      quantity: qty,
                      hsnSacCode: i.hsnSacCode || "8517",
                      gstRate: gstRate,
                      taxableAmount: taxable,
                      taxAmount: taxAmount,
                      totalAmount: total,
                    };
                  })}
                  summary={{
                    subtotal: previewBill.totalAmount / 1.18,
                    taxableAmount: previewBill.totalAmount / 1.18,
                    taxAmount: previewBill.totalAmount - previewBill.totalAmount / 1.18,
                    cgst: (previewBill.totalAmount - previewBill.totalAmount / 1.18) / 2,
                    sgst: (previewBill.totalAmount - previewBill.totalAmount / 1.18) / 2,
                    igst: 0,
                    discount: 0,
                    grandTotal: previewBill.totalAmount,
                    tenderMode: (previewBill.paymentMode as any) || "UPI",
                    amountPaid: previewBill.totalAmount,
                    changeDue: 0,
                  }}
                  isThermal80mm={previewPrintMode === "THERMAL_80MM"}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden print:hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Hero Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-fuchsia-950 to-purple-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Universal Mobile Bill &amp; Invoice Search</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Realtime Search</span>
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-medium leading-snug">
                Search sales invoices, repair lab receipts &amp; khata slips by Customer Name, Mobile #, Bill #, IMEI or Serial Number.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input & Quick Category Filters Bar */}
        <div className="p-4 bg-slate-50/90 border-b border-slate-200 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-600 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type Customer Name (e.g. Vikram), Mobile (9899887766), Bill # (INV-2026-0040), or IMEI..."
              className="w-full h-12 pl-11 pr-12 bg-white border border-slate-300 focus:border-fuchsia-600 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-fuchsia-600/20 transition-all font-mono"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 font-bold p-1 text-xs transition-colors cursor-pointer"
                title="Clear search query"
              >
                ✕
              </button>
            ) : (
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 rounded-md shadow-2xs pointer-events-none">
                Esc to close
              </kbd>
            )}
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filter:</span>
              <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                {(["ALL", "SALES_INVOICE", "REPAIR_BILL", "KHATA_SETTLEMENT"] as const).map((filter) => {
                  const isActive = activeFilter === filter;
                  const label =
                    filter === "ALL"
                      ? "All Records"
                      : filter === "SALES_INVOICE"
                      ? "Sales Invoices"
                      : filter === "REPAIR_BILL"
                      ? "Repair Lab Bills"
                      : "Khata Settlements";

                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
                        isActive
                          ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500 font-semibold bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
              Matching: <strong className="text-fuchsia-700 font-black">{filteredBills.length}</strong> record{filteredBills.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Results List Scrollable Container */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 bg-slate-100/60">
          {filteredBills.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-2xs p-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-fuchsia-50 border border-fuchsia-100 flex items-center justify-center text-fuchsia-600 shadow-2xs">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <p className="font-extrabold text-sm text-slate-800">No matching bills found for &quot;{query}&quot;</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Try searching by 10-digit customer mobile number (e.g. 9899887766), customer name (e.g. Vikram), or 15-digit IMEI code.
                </p>
              </div>
            </div>
          ) : (
            filteredBills.map((bill) => {
              const isUdhaar = bill.balanceAdded > 0;
              return (
                <div
                  key={`${bill.invoiceNumber}-${bill.id}`}
                  className="bg-white border border-slate-200 hover:border-fuchsia-400/80 rounded-2xl p-4 shadow-2xs hover:shadow-md space-y-3 transition-all group"
                >
                  {/* Top Bar: Category Pill & Invoice # */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border shadow-2xs ${
                          bill.type === "SALES_INVOICE"
                            ? "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200"
                            : bill.type === "REPAIR_BILL"
                            ? "bg-purple-50 text-purple-900 border-purple-200"
                            : "bg-emerald-50 text-emerald-900 border-emerald-200"
                        }`}
                      >
                        {bill.type === "SALES_INVOICE"
                          ? "🛒 SALES INVOICE"
                          : bill.type === "REPAIR_BILL"
                          ? "🛠️ REPAIR LAB BILL"
                          : "💳 KHATA SETTLEMENT"}
                      </span>

                      <div className="flex items-center space-x-1.5 font-mono">
                        <span className="font-black text-xs text-slate-900">{bill.invoiceNumber}</span>
                        <button
                          onClick={() => handleCopyInvoice(bill.invoiceNumber)}
                          className="text-slate-400 hover:text-fuchsia-700 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Copy Invoice #"
                        >
                          {copiedInvoice === bill.invoiceNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <span className="text-xs text-slate-400 font-mono font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{bill.date}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-500">Payment:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-extrabold uppercase border ${
                          bill.paymentMode === "UDHAAR"
                            ? "bg-amber-50 text-amber-900 border-amber-200"
                            : "bg-emerald-50 text-emerald-900 border-emerald-200"
                        }`}
                      >
                        {bill.paymentMode}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info & Financial Breakdown Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    {/* Customer Info Column */}
                    <div className="md:col-span-6 space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="w-3.5 h-3.5 text-fuchsia-600 shrink-0" />
                        <span className="font-extrabold text-xs text-slate-900">{bill.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs font-mono text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold">{bill.customerPhone}</span>
                        {bill.customerAddress && (
                          <span className="text-slate-400 truncate max-w-[200px]">({bill.customerAddress})</span>
                        )}
                      </div>
                    </div>

                    {/* Financial Summary Column */}
                    <div className="md:col-span-6 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 font-sans block">Total Bill Amount:</span>
                        <span className="font-black text-slate-900 text-xs">
                          ₹{bill.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-sans block">Amount Paid:</span>
                        <span className="font-black text-emerald-700 text-xs">
                          ₹{bill.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-sans block">Udhaar Dues:</span>
                        <span className={`font-black text-xs ${isUdhaar ? "text-rose-600" : "text-slate-400"}`}>
                          {isUdhaar ? `+₹${bill.balanceAdded.toLocaleString("en-IN")}` : "₹0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items List & IMEI Badges Row */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-sans">
                      Billed Mobile Items &amp; IMEI / Serial Numbers:
                    </span>
                    <div className="space-y-1">
                      {bill.items.map((item, idx) => (
                        <div key={idx} className="flex flex-wrap items-center justify-between text-xs font-mono bg-purple-50/40 p-2 rounded-xl border border-purple-100/80">
                          <span className="font-bold text-slate-900 font-sans text-xs flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{item.title} (x{item.quantity})</span>
                          </span>

                          <div className="flex items-center space-x-2 flex-wrap">
                            {item.imei && (
                              <span className="text-[10px] font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded-lg border border-purple-200 font-bold">
                                IMEI: {item.imei}
                              </span>
                            )}
                            {item.serialNumber && (
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 font-bold">
                                SN: {item.serialNumber}
                              </span>
                            )}
                            <span className="font-extrabold text-slate-900">
                              ₹{(item.sellingPrice * item.quantity).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Toolbar Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                    {bill.customerId && (
                      <Link
                        href={`/pos/customers/${bill.customerId}`}
                        onClick={onClose}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        <span>Open Khata</span>
                      </Link>
                    )}

                    <button
                      onClick={() => handleTriggerPrintPreview(bill, "THERMAL_80MM")}
                      className="px-3 py-1.5 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1 active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-fuchsia-700" />
                      <span>Print 80mm Roll</span>
                    </button>

                    <button
                      onClick={() => handleTriggerPrintPreview(bill, "A4_GST")}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print A4 GST Bill</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
