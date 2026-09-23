"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { A4GstInvoice } from "@/components/hardware/A4GstInvoice";
import { CartItem, InvoiceSummary } from "@/types/pos";
import {
  ArrowLeft,
  BookOpen,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Printer,
  Share2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  History,
  Calendar,
  Clock,
  Plus,
  X,
  FileText,
  Sparkles,
  Copy,
  Check,
  Building2,
  Receipt,
  Wallet,
  ShieldCheck,
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  invoiceNumber: string;
  type: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  balanceAdded: number;
  paymentMode: string;
  balanceAfter: number;
  items?: {
    title: string;
    quantity: number;
    sellingPrice: number;
    hsnSacCode?: string;
    gstRate?: number;
    imei?: string;
    serialNumber?: string;
  }[];
  shippedToCustomer?: any;
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstin?: string;
  currentBalance: number;
  creditLimit: number;
  createdAt: string;
  totalLifetimeSpend: number;
  transactions: Transaction[];
}

export default function CustomerKhataPage() {
  const params = useParams();
  const customerId = (params?.id as string) || "cust-1";

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTx, setSearchTx] = useState("");
  const [txFilter, setTxFilter] = useState<"ALL" | "UDHAAR" | "SETTLEMENT" | "REGULAR">("ALL");

  // Settlement Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"UPI" | "CASH" | "CARD" | "NET_BANKING">("UPI");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  // Print Receipt State
  const [receiptData, setReceiptData] = useState<{
    customerName: string;
    customerPhone: string;
    amountPaid: number;
    paymentMode: string;
    remainingBalance: number;
    date: string;
    receiptNo: string;
  } | null>(null);

  // Selected invoice modal view
  const [selectedTxForBill, setSelectedTxForBill] = useState<Transaction | null>(null);
  const [billPrintMode, setBillPrintMode] = useState<"A4_GST" | "THERMAL_80MM">("A4_GST");
  const [storeProfile, setStoreProfile] = useState({
    businessName: "EcoDigiTech Mobile Hub",
    storeSubName: "Main Retail & Repair Lab Store",
    storeAddress: "Main Market, Saharanpur, Uttar Pradesh - 247001",
    storePhone: "+91 98765 43210",
    gstin: "09AAAAA0000A1Z5",
    placeOfSupply: "Uttar Pradesh (09)",
    logoUrl: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("company_store_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setStoreProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {}
  }, []);

  function handlePrintBill(mode: "A4_GST" | "THERMAL_80MM") {
    setBillPrintMode(mode);
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
    setTimeout(() => {
      window.print();
    }, 150);
  }

  function handlePrintStatement() {
    if (typeof document !== "undefined") {
      let styleEl = document.getElementById("dynamic-print-page-size");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "dynamic-print-page-size";
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `@media print { @page { size: A4 portrait !important; margin: 10mm !important; } }`;
    }
    window.print();
  }

  useEffect(() => {
    async function fetchCustomerData() {
      setLoading(true);
      try {
        let baseCustomer: CustomerData | null = null;
        const res = await fetch(`/api/pos/customers/${customerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.customer) {
            baseCustomer = data.customer;
          }
        }

        // Check if localStorage has saved customer info or custom transactions
        if (typeof window !== "undefined") {
          const savedDbStr = localStorage.getItem("company_customers_db");
          if (savedDbStr) {
            try {
              const savedList = JSON.parse(savedDbStr);
              const match = savedList.find(
                (c: any) => c.id === customerId || c.phone === customerId || (baseCustomer && c.phone === baseCustomer.phone)
              );
              if (match) {
                baseCustomer = {
                  id: match.id || customerId,
                  name: match.name || baseCustomer?.name || "Customer Account",
                  phone: match.phone || baseCustomer?.phone || "",
                  email: match.email || baseCustomer?.email || "",
                  address: match.address || baseCustomer?.address || "",
                  gstin: match.gstin || baseCustomer?.gstin || "",
                  currentBalance: typeof match.currentBalance === "number" ? match.currentBalance : (baseCustomer?.currentBalance || 0),
                  creditLimit: match.creditLimit || baseCustomer?.creditLimit || 25000,
                  createdAt: baseCustomer?.createdAt || new Date().toISOString(),
                  totalLifetimeSpend: match.totalLifetimeSpend || baseCustomer?.totalLifetimeSpend || 0,
                  transactions: baseCustomer?.transactions || [],
                };
              }
            } catch (e) {
              console.error(e);
            }
          }

          // Check for custom saved transactions in localStorage for this customer
          const savedTxStr = localStorage.getItem(`company_customer_ledger_${customerId}`);
          if (savedTxStr && baseCustomer) {
            try {
              const savedTxs = JSON.parse(savedTxStr);
              if (Array.isArray(savedTxs) && savedTxs.length > 0) {
                baseCustomer.transactions = savedTxs;
              }
            } catch (e) {
              console.error(e);
            }
          }
        }

        setCustomer(baseCustomer);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerData();
  }, [customerId]);

  async function handleSettlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!customer) return;

    const paid = Number(paymentAmount);
    if (!paid || paid <= 0) {
      setError("Please enter a valid payment amount greater than zero.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      let newBal = Math.max(0, customer.currentBalance - paid);
      try {
        const res = await fetch(`/api/pos/customers/${customer.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: paid, paymentMode }),
        });
        const data = await res.json();
        if (data.newBalance !== undefined) {
          newBal = data.newBalance;
        }
      } catch (e) {
        console.warn("Settlement API notice:", e);
      }

      const receiptNo = `REC-${Date.now().toString().slice(-6)}`;

      setReceiptData({
        customerName: customer.name,
        customerPhone: customer.phone,
        amountPaid: paid,
        paymentMode,
        remainingBalance: newBal,
        date: new Date().toLocaleDateString("en-IN"),
        receiptNo,
      });

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        invoiceNumber: receiptNo,
        type: "SETTLEMENT",
        description: `Khata Credit Settlement (${paymentMode})`,
        totalAmount: paid,
        paidAmount: paid,
        balanceAdded: 0,
        paymentMode,
        balanceAfter: newBal,
      };

      const updatedTransactions = [newTx, ...customer.transactions];

      setCustomer((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentBalance: newBal,
          transactions: updatedTransactions,
        };
      });

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(`company_customer_ledger_${customer.id}`, JSON.stringify(updatedTransactions));
        const savedDbStr = localStorage.getItem("company_customers_db");
        let savedList = savedDbStr ? JSON.parse(savedDbStr) : [];
        let updatedList = savedList.map((c: any) =>
          c.id === customer.id || c.phone === customer.phone ? { ...c, currentBalance: newBal } : c
        );
        localStorage.setItem("company_customers_db", JSON.stringify(updatedList));
      }

      setMessage(`Recorded payment of ₹${paid.toLocaleString("en-IN")} via ${paymentMode}.`);
      setPaymentAmount("");
      setIsPayModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Settlement error.");
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate Account Age
  function getAccountAge(createdStr: string) {
    const created = new Date(createdStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
    if (diffMonths <= 0) return "New Customer";
    if (diffMonths === 1) return "1 Month Old";
    return `${diffMonths} Months Old`;
  }

  const handleCopyInvoice = (invNumber: string) => {
    navigator.clipboard.writeText(invNumber);
    setCopiedInvoice(invNumber);
    setTimeout(() => setCopiedInvoice(null), 2000);
  };

  if (loading || !customer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-xs font-mono text-slate-400 space-y-3">
        <div className="p-3 bg-fuchsia-50 border border-fuchsia-200 rounded-2xl animate-spin text-fuchsia-600">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="font-extrabold text-slate-700">Loading Customer Credit Ledger...</p>
      </div>
    );
  }

  const creditUtilization = Math.min(100, (customer.currentBalance / customer.creditLimit) * 100);
  const isHighRisk = creditUtilization > 80;
  const isModerateRisk = creditUtilization > 50 && creditUtilization <= 80;
  const availableCredit = Math.max(0, customer.creditLimit - customer.currentBalance);

  // Initials for Customer Avatar
  const nameParts = customer.name.trim().split(" ");
  const avatarInitials = nameParts.length >= 2 
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase() 
    : customer.name.slice(0, 2).toUpperCase();

  // Filter transactions
  const filteredTransactions = customer.transactions.filter((tx) => {
    const matchesSearch =
      tx.invoiceNumber.toLowerCase().includes(searchTx.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTx.toLowerCase()) ||
      tx.paymentMode.toLowerCase().includes(searchTx.toLowerCase());

    if (txFilter === "UDHAAR") return matchesSearch && tx.balanceAdded > 0;
    if (txFilter === "SETTLEMENT") return matchesSearch && tx.type === "SETTLEMENT";
    if (txFilter === "REGULAR") return matchesSearch && tx.type === "REGULAR_SALE";
    return matchesSearch;
  });

  const whatsappMessage = encodeURIComponent(
    `Hello ${customer.name}, greeting from EcoDigiTech Store! Your current store khata credit balance is ₹${customer.currentBalance.toLocaleString("en-IN")}. Please visit us to settle your dues. Thank you!`
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col font-sans text-slate-900 overflow-y-auto space-y-4 pb-8 select-none px-2 sm:px-4">
      {/* Printable Payment Settlement Receipt Slip */}
      {receiptData && (
        <div className="hidden print:block font-mono text-xs p-4 max-w-[80mm] mx-auto space-y-3 bg-white text-black">
          <div className="text-center border-b pb-2">
            <h2 className="font-extrabold text-sm uppercase">KHATA PAYMENT RECEIPT</h2>
            <p className="text-[10px]">Merchant Store Credit Settlement</p>
          </div>
          <div>
            <p>Receipt #: <strong>{receiptData.receiptNo}</strong></p>
            <p>Date: {receiptData.date}</p>
            <p>Customer: {receiptData.customerName} ({receiptData.customerPhone})</p>
          </div>
          <div className="border-t border-b py-2 space-y-1">
            <p>Payment Mode: <strong>{receiptData.paymentMode}</strong></p>
            <p className="text-sm">Amount Received: <strong>₹{receiptData.amountPaid.toFixed(2)}</strong></p>
            <p>Remaining Credit Balance: <strong>₹{receiptData.remainingBalance.toFixed(2)}</strong></p>
          </div>
          <div className="text-[9px] pt-4 flex justify-between">
            <span>Customer Sign: ________</span>
            <span>Authorized Cashier: ________</span>
          </div>
          <div className="text-[8px] text-center pt-2 text-slate-500">
            Powered by EcoDigiTech | pos.ecodigitech.com
          </div>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="space-y-4 print:hidden">
        {/* Top Navigation & Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/pos/customers"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-fuchsia-700 bg-white border border-slate-200 hover:border-fuchsia-300 px-3.5 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-fuchsia-600" />
            <span>Back to Khata Directory</span>
          </Link>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ACID Verified Customer Ledger</span>
          </div>
        </div>

        {/* SECTION 1: Customer Profile Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            {/* Customer Avatar & Primary Meta */}
            <div className="flex items-start sm:items-center space-x-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-purple-700 text-white font-black text-lg flex items-center justify-center shadow-md shadow-fuchsia-500/20 shrink-0 border border-white/20">
                {avatarInitials}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2.5 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {customer.name}
                  </h1>
                  <span className="text-[10px] bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase">
                    Credit Ledger
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                      customer.currentBalance > 0
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {customer.currentBalance > 0 ? "Khata Active" : "No Dues Outstanding"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap font-medium">
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-fuchsia-600 shrink-0" />
                    <span className="font-mono font-bold text-slate-900">{customer.phone}</span>
                  </div>

                  {customer.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{customer.email}</span>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-xs">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={`https://wa.me/91${customer.phone}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer active:scale-95"
                title="Send Khata Balance Reminder on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Dues</span>
              </a>

              <button
                onClick={handlePrintStatement}
                className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Print Full Ledger Report"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print Statement</span>
              </button>

              <button
                onClick={() => {
                  setError("");
                  setPaymentAmount(customer.currentBalance > 0 ? customer.currentBalance.toString() : "");
                  setIsPayModalOpen(true);
                }}
                className="h-9 px-4 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-fuchsia-600/20 transition-all cursor-pointer active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>Receive Settlement Payment</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: 4-Tile Executive KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tile 1: Outstanding Balance */}
            <div className="bg-gradient-to-br from-white to-rose-50/40 border border-rose-200/80 rounded-2xl p-3.5 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider">
                  Khata Dues Balance
                </span>
                <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-black font-mono text-rose-600 tracking-tight">
                ₹{customer.currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>

              <p className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <span>Credit Limit:</span>
                <span className="font-bold text-slate-700">₹{customer.creditLimit.toLocaleString("en-IN")}</span>
              </p>
            </div>

            {/* Tile 2: Credit Risk Status & Gauge */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  Risk Gauge Status
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                    isHighRisk
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : isModerateRisk
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {isHighRisk ? "HIGH RISK (>80%)" : isModerateRisk ? "MODERATE (50-80%)" : "LOW RISK (<50%)"}
                </span>
              </div>

              <div className="text-xl font-extrabold font-mono text-slate-900 tracking-tight">
                {creditUtilization.toFixed(1)}% <span className="text-xs font-semibold text-slate-500 font-sans">Used</span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighRisk
                      ? "bg-gradient-to-r from-rose-500 to-red-600"
                      : isModerateRisk
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                  }`}
                  style={{ width: `${creditUtilization}%` }}
                />
              </div>
            </div>

            {/* Tile 3: Available Store Credit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">
                  Available Store Credit
                </span>
                <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-black font-mono text-emerald-600 tracking-tight">
                ₹{availableCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>

              <p className="text-[11px] font-mono text-slate-500">
                Buffer for new credit billing
              </p>
            </div>

            {/* Tile 4: Total Lifetime Spend */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  Lifetime Spend
                </span>
                <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                ₹{customer.totalLifetimeSpend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>

              <p className="text-[11px] font-mono text-slate-500">
                Tenure: <span className="font-bold text-slate-700">{getAccountAge(customer.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-2xl font-bold flex justify-between items-center shadow-2xs animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
            {receiptData && (
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1 rounded-xl text-xs flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            )}
          </div>
        )}

        {/* SECTION 3: Transaction History & Udhaar Ledger Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs flex-1 flex flex-col">
          {/* Table Header & Search Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Transaction History &amp; Udhaar Ledger</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {customer.transactions.length} Total Ledger Activity Records
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Field */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Invoice # or Item..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-fuchsia-600 focus:outline-none"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                {(["ALL", "UDHAAR", "SETTLEMENT", "REGULAR"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTxFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      txFilter === filter
                        ? "bg-white text-fuchsia-800 shadow-2xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="flex-1 overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-sans font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-800 select-none">
                  <th className="py-3 px-3.5">Date</th>
                  <th className="py-3 px-3.5">Ref / Invoice #</th>
                  <th className="py-3 px-3.5">Description / Items</th>
                  <th className="py-3 px-3.5 text-right">Total Amount</th>
                  <th className="py-3 px-3.5 text-right">Paid Amount</th>
                  <th className="py-3 px-3.5 text-right">Balance Added</th>
                  <th className="py-3 px-3.5 text-center">Mode</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-sans">
                      <FileText className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                      <p className="font-bold">No transaction records found matching active filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isUdhaar = tx.balanceAdded > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">{tx.date}</td>
                        <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-fuchsia-800 bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 rounded-lg text-[11px]">
                              {tx.invoiceNumber}
                            </span>
                            <button
                              onClick={() => handleCopyInvoice(tx.invoiceNumber)}
                              className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                              title="Copy Invoice #"
                            >
                              {copiedInvoice === tx.invoiceNumber ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-slate-700 max-w-xs truncate font-sans font-medium">
                          {tx.description}
                        </td>
                        <td className="py-3 px-3.5 text-right font-extrabold text-slate-900 whitespace-nowrap">
                          ₹{tx.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3.5 text-right font-black text-emerald-700 whitespace-nowrap">
                          ₹{tx.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td
                          className={`py-3 px-3.5 text-right font-black whitespace-nowrap ${
                            isUdhaar ? "text-rose-600" : "text-slate-400"
                          }`}
                        >
                          {isUdhaar ? `+₹${tx.balanceAdded.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹0.00"}
                        </td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              tx.paymentMode === "UDHAAR"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : tx.type === "SETTLEMENT"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-800 border-slate-200"
                            }`}
                          >
                            {tx.paymentMode}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedTxForBill(tx)}
                            className="px-2.5 py-1 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 rounded-lg text-xs font-extrabold font-sans transition-all cursor-pointer active:scale-95 flex items-center space-x-1"
                          >
                            <Receipt className="w-3 h-3 text-fuchsia-600" />
                            <span>View Slip</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* QUICK PAY SETTLEMENT MODAL */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-purple-700 text-white shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Receive Khata Settlement</h2>
                  <p className="text-xs text-slate-500 font-medium">Record store credit payment &amp; issue receipt</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSettlePayment} className="space-y-4">
              {/* Outstanding Balance Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  Current Dues Outstanding
                </span>
                <span className="text-2xl font-black font-mono text-rose-600">
                  ₹{customer.currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Amount Input & Quick Fill Buttons */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900">
                  Settlement Amount Received (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={customer.currentBalance > 0 ? customer.currentBalance : 100000}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-24 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-fuchsia-600 focus:ring-2 focus:ring-fuchsia-600/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(customer.currentBalance.toString())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-fuchsia-50 text-fuchsia-800 px-2.5 py-1 rounded-lg border border-fuchsia-200 font-mono font-extrabold hover:bg-fuchsia-100 cursor-pointer"
                  >
                    Full Clear
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Quick:</span>
                  {[
                    { label: "Full Dues", val: customer.currentBalance },
                    { label: "50% Dues", val: Math.round(customer.currentBalance / 2) },
                    { label: "₹5,000", val: 5000 },
                    { label: "₹2,000", val: 2000 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setPaymentAmount(preset.val.toString())}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Mode Toggles */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-900">Select Payment Mode *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["UPI", "CASH", "CARD", "NET_BANKING"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                        paymentMode === mode
                          ? "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 text-white border-transparent shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mode.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remaining Balance Preview */}
              {paymentAmount && Number(paymentAmount) > 0 && (
                <div className="p-3 bg-fuchsia-50/60 border border-fuchsia-200 rounded-xl text-xs font-mono text-fuchsia-950 flex justify-between">
                  <span>Remaining Credit Dues:</span>
                  <span className="font-extrabold">
                    ₹{Math.max(0, customer.currentBalance - Number(paymentAmount)).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:opacity-95 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-fuchsia-600/20 cursor-pointer active:scale-95"
                >
                  {submitting ? "Processing..." : "✓ Record Settlement & Print Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REAL TAX INVOICE & RECEIPT MODAL */}
      {selectedTxForBill && customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in zoom-in-95 duration-150">
          {/* Background Printable Wrapper for window.print() */}
          {(() => {
            const itemsList: CartItem[] = (selectedTxForBill.items && selectedTxForBill.items.length > 0)
              ? selectedTxForBill.items.map((i: any, idx: number) => {
                  const unitPrice = i.sellingPrice || selectedTxForBill.totalAmount;
                  const qty = i.quantity || 1;
                  const total = unitPrice * qty;
                  const gstRate = i.gstRate || 18;
                  const taxable = total / (1 + gstRate / 100);
                  const taxAmount = total - taxable;
                  return {
                    id: `item-${idx}`,
                    category: "ACCESSORY" as const,
                    title: i.title || selectedTxForBill.description || "Mobile Device / Repair Service",
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
                })
              : [
                  {
                    id: `item-0`,
                    category: "ACCESSORY" as const,
                    title: selectedTxForBill.description || `Invoice ${selectedTxForBill.invoiceNumber}`,
                    unitPrice: selectedTxForBill.totalAmount,
                    purchasePrice: selectedTxForBill.totalAmount * 0.7,
                    quantity: 1,
                    hsnSacCode: "8517",
                    gstRate: 18,
                    taxableAmount: selectedTxForBill.totalAmount / 1.18,
                    taxAmount: selectedTxForBill.totalAmount - selectedTxForBill.totalAmount / 1.18,
                    totalAmount: selectedTxForBill.totalAmount,
                  },
                ];

            const totalAmt = selectedTxForBill.totalAmount;
            const taxableSum = itemsList.reduce((acc, it) => acc + it.taxableAmount, 0);
            const taxSum = itemsList.reduce((acc, it) => acc + it.taxAmount, 0);

            const invSummary: InvoiceSummary = {
              subtotal: taxableSum,
              taxableAmount: taxableSum,
              taxAmount: taxSum,
              cgst: taxSum / 2,
              sgst: taxSum / 2,
              igst: 0,
              discount: 0,
              grandTotal: totalAmt,
              tenderMode: (selectedTxForBill.paymentMode as any) || "UPI",
              amountPaid: selectedTxForBill.paidAmount,
              changeDue: 0,
            };

            return (
              <div className="hidden print:block fixed inset-0 z-[99999] bg-white">
                <A4GstInvoice
                  invoiceNumber={selectedTxForBill.invoiceNumber}
                  dateTime={selectedTxForBill.date}
                  storeName={storeProfile.businessName}
                  storeSubName={storeProfile.storeSubName}
                  storeAddress={storeProfile.storeAddress}
                  storePhone={storeProfile.storePhone}
                  storeGstin={storeProfile.gstin}
                  placeOfSupply={storeProfile.placeOfSupply}
                  customer={{
                    name: customer.name,
                    phone: customer.phone,
                    address: customer.address,
                    gstin: customer.gstin,
                  }}
                  shippedToCustomer={selectedTxForBill.shippedToCustomer || null}
                  items={itemsList}
                  summary={invSummary}
                  isThermal80mm={billPrintMode === "THERMAL_80MM"}
                  forceShowOnScreen={false}
                  logoUrl={storeProfile.logoUrl}
                />
              </div>
            );
          })()}

          {/* Interactive Modal Frame for On-Screen View */}
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden print:hidden">
            {/* Modal Top Header Banner */}
            <div className="bg-gradient-to-r from-fuchsia-700 via-pink-700 to-purple-800 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    Bill / Tax Invoice — {selectedTxForBill.invoiceNumber}
                  </h2>
                  <p className="text-xs text-fuchsia-100 font-medium">
                    Customer: {customer.name} ({customer.phone})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTxForBill(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar (Print mode selector & Buttons) */}
            <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-2 bg-slate-200/70 p-1 rounded-xl">
                <button
                  onClick={() => setBillPrintMode("A4_GST")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billPrintMode === "A4_GST"
                      ? "bg-white text-fuchsia-900 shadow-sm font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  A4 GST Tax Invoice
                </button>
                <button
                  onClick={() => setBillPrintMode("THERMAL_80MM")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billPrintMode === "THERMAL_80MM"
                      ? "bg-white text-fuchsia-900 shadow-sm font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  80mm Thermal Receipt
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyInvoice(selectedTxForBill.invoiceNumber)}
                  className="h-9 px-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedInvoice === selectedTxForBill.invoiceNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Bill #</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handlePrintBill(billPrintMode)}
                  className="h-9 px-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 shadow-md shadow-fuchsia-600/20 cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print {billPrintMode === "THERMAL_80MM" ? "80mm Slip" : "A4 Invoice"}</span>
                </button>
              </div>
            </div>

            {/* Modal Body: Interactive On-Screen Bill Preview */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100/70 flex justify-center">
              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md border border-slate-200 p-4">
                {(() => {
                  const itemsList: CartItem[] = (selectedTxForBill.items && selectedTxForBill.items.length > 0)
                    ? selectedTxForBill.items.map((i: any, idx: number) => {
                        const unitPrice = i.sellingPrice || selectedTxForBill.totalAmount;
                        const qty = i.quantity || 1;
                        const total = unitPrice * qty;
                        const gstRate = i.gstRate || 18;
                        const taxable = total / (1 + gstRate / 100);
                        const taxAmount = total - taxable;
                        return {
                          id: `item-${idx}`,
                          category: "ACCESSORY" as const,
                          title: i.title || selectedTxForBill.description || "Mobile Device / Repair Service",
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
                      })
                    : [
                        {
                          id: `item-0`,
                          category: "ACCESSORY" as const,
                          title: selectedTxForBill.description || `Invoice ${selectedTxForBill.invoiceNumber}`,
                          unitPrice: selectedTxForBill.totalAmount,
                          purchasePrice: selectedTxForBill.totalAmount * 0.7,
                          quantity: 1,
                          hsnSacCode: "8517",
                          gstRate: 18,
                          taxableAmount: selectedTxForBill.totalAmount / 1.18,
                          taxAmount: selectedTxForBill.totalAmount - selectedTxForBill.totalAmount / 1.18,
                          totalAmount: selectedTxForBill.totalAmount,
                        },
                      ];

                  const totalAmt = selectedTxForBill.totalAmount;
                  const taxableSum = itemsList.reduce((acc, it) => acc + it.taxableAmount, 0);
                  const taxSum = itemsList.reduce((acc, it) => acc + it.taxAmount, 0);

                  const invSummary: InvoiceSummary = {
                    subtotal: taxableSum,
                    taxableAmount: taxableSum,
                    taxAmount: taxSum,
                    cgst: taxSum / 2,
                    sgst: taxSum / 2,
                    igst: 0,
                    discount: 0,
                    grandTotal: totalAmt,
                    tenderMode: (selectedTxForBill.paymentMode as any) || "UPI",
                    amountPaid: selectedTxForBill.paidAmount,
                    changeDue: 0,
                  };

                  return (
                    <A4GstInvoice
                      invoiceNumber={selectedTxForBill.invoiceNumber}
                      dateTime={selectedTxForBill.date}
                      storeName={storeProfile.businessName}
                      storeSubName={storeProfile.storeSubName}
                      storeAddress={storeProfile.storeAddress}
                      storePhone={storeProfile.storePhone}
                      storeGstin={storeProfile.gstin}
                      placeOfSupply={storeProfile.placeOfSupply}
                      customer={{
                        name: customer.name,
                        phone: customer.phone,
                        address: customer.address,
                        gstin: customer.gstin,
                      }}
                      shippedToCustomer={selectedTxForBill.shippedToCustomer || null}
                      items={itemsList}
                      summary={invSummary}
                      isThermal80mm={billPrintMode === "THERMAL_80MM"}
                      forceShowOnScreen={true}
                      logoUrl={storeProfile.logoUrl}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
