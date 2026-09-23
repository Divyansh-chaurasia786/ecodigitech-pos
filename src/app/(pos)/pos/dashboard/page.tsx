"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  Calendar,
  Award,
  BookOpen,
  ChevronRight,
  Smartphone,
  Flame,
  BarChart3,
  Layers,
  ArrowDownRight,
  PlusCircle,
  Receipt,
  Trash2,
} from "lucide-react";

// Real 7-Day Sales & Profit Velocity Data (Tue Sep 15 to Mon Sep 21)
const INITIAL_VELOCITY_DAYS = [
  { day: "TUE", date: "15", fullDate: "Sep 15, 2026", revenue: 58600, profit: 16800, invoices: 21, pill: "₹58.6k", pillType: "green" },
  { day: "WED", date: "16", fullDate: "Sep 16, 2026", revenue: 32900, profit: 9300, invoices: 14, pill: "₹32.9k", pillType: "purple" },
  { day: "THU", date: "17", fullDate: "Sep 17, 2026", revenue: 71800, profit: 20600, invoices: 25, pill: "₹71.8k", pillType: "green" },
  { day: "FRI", date: "18", fullDate: "Sep 18, 2026", revenue: 54100, profit: 15500, invoices: 19, pill: "₹54.1k", pillType: "green" },
  { day: "SAT", date: "19", fullDate: "Sep 19, 2026", revenue: 38200, profit: 10700, invoices: 15, pill: "₹38.2k", pillType: "purple" },
  { day: "SUN", date: "20", fullDate: "Sep 20, 2026", revenue: 62400, profit: 18100, invoices: 22, pill: "₹62.4k", pillType: "green" },
  { day: "MON", date: "21", fullDate: "Sep 21, 2026 (Today)", revenue: 48950, profit: 14690, invoices: 18, pill: "₹48.9k", pillType: "active" },
];

// Mock 12-Month Financial Performance Data
const INITIAL_MONTHLY_DATA = [
  { day: "JAN", date: "01", fullDate: "Jan 2026", revenue: 120000, profit: 35000, invoices: 42, pill: "₹120k", pillType: "green" },
  { day: "FEB", date: "02", fullDate: "Feb 2026", revenue: 90000, profit: 40000, invoices: 35, pill: "₹90k", pillType: "purple" },
  { day: "MAR", date: "03", fullDate: "Mar 2026", revenue: 160000, profit: 55000, invoices: 54, pill: "₹160k", pillType: "green" },
  { day: "APR", date: "04", fullDate: "Apr 2026", revenue: 140000, profit: 48000, invoices: 48, pill: "₹140k", pillType: "green" },
  { day: "MAY", date: "05", fullDate: "May 2026", revenue: 165000, profit: 53000, invoices: 52, pill: "₹165k", pillType: "green" },
  { day: "JUN", date: "06", fullDate: "Jun 2026", revenue: 130000, profit: 52000, invoices: 44, pill: "₹130k", pillType: "purple" },
  { day: "JUL", date: "07", fullDate: "Jul 2026", revenue: 170000, profit: 51000, invoices: 58, pill: "₹170k", pillType: "green" },
];

interface StoreExpense {
  id: string;
  category: string;
  title: string;
  amount: number;
  paymentMode: "CASH" | "UPI" | "CARD";
  date: string;
  voucherNo: string;
}

// Pre-logged Store Operating Expenses
const INITIAL_EXPENSES: StoreExpense[] = [
  { id: "exp-1", category: "⚡ Utilities & Electricity", title: "Monthly Shop Electricity Bill", amount: 4500, paymentMode: "UPI", date: "2026-09-20", voucherNo: "EXP-8841" },
  { id: "exp-2", category: "☕ Staff Refreshment", title: "Daily Tea & Snacks Expense", amount: 850, paymentMode: "CASH", date: "2026-09-21", voucherNo: "EXP-8842" },
  { id: "exp-3", category: "🏢 Store Rent", title: "September Shop Advance Rent", amount: 15000, paymentMode: "UPI", date: "2026-09-15", voucherNo: "EXP-8843" },
];

// Top 10 Selling Mobile Phones Data Source (Raw Models Data - Strictly Sorted #1 to #10 by Unit Sales Volume)
const BASE_PHONE_MODELS = [
  { model: "iPhone 15 Pro Max", variant: "256GB • Natural Titanium", brand: "Apple 🍏", unitsSold: 48, revenue: 6240000, profit: 624000, margin: "10.0%", status: "🏆 #1 Unit Seller", pillColor: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },
  { model: "Samsung Galaxy S24 Ultra", variant: "512GB • Titanium Gray", brand: "Samsung 📱", unitsSold: 42, revenue: 5459580, profit: 600550, margin: "11.0%", status: "⚡ #2 Top Volume", pillColor: "bg-purple-100 text-purple-800 border-purple-200" },
  { model: "Refurbished iPhone 13", variant: "128GB • Midnight (Sec 15(5))", brand: "Apple Refurb 🔄", unitsSold: 38, revenue: 1329620, profit: 332405, margin: "25.0%", status: "🔥 #3 High Margin", pillColor: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { model: "OnePlus 12 5G", variant: "512GB • Silky Black", brand: "OnePlus ⚡", unitsSold: 35, revenue: 2274650, profit: 272958, margin: "12.0%", status: "📱 #4 High Demand", pillColor: "bg-red-100 text-red-800 border-red-200" },
  { model: "Nothing Phone (2a)", variant: "256GB • White Glyph", brand: "Nothing 💡", unitsSold: 31, revenue: 867690, profit: 130153, margin: "15.0%", status: "💡 #5 Popular Pick", pillColor: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { model: "Realme GT 6 5G", variant: "256GB • Fluid Silver", brand: "Realme 🚀", unitsSold: 26, revenue: 1065740, profit: 127888, margin: "12.0%", status: "🚀 #6 Fast Mover", pillColor: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { model: "Vivo V30 Pro 5G", variant: "256GB • Andaman Blue", brand: "Vivo 🌟", unitsSold: 22, revenue: 923780, profit: 138560, margin: "15.0%", status: "🌟 #7 Camera Pick", pillColor: "bg-blue-100 text-blue-800 border-blue-200" },
  { model: "Samsung Galaxy A55 5G", variant: "128GB • Awesome Navy", brand: "Samsung 📱", unitsSold: 18, revenue: 719820, profit: 86378, margin: "12.0%", status: "📱 #8 Steady Seller", pillColor: "bg-slate-200 text-slate-800 border-slate-300" },
  { model: "iQOO 12 5G", variant: "256GB • Legend Edition", brand: "iQOO 🎮", unitsSold: 15, revenue: 794850, profit: 95380, margin: "12.0%", status: "🎮 #9 Gaming Pick", pillColor: "bg-amber-100 text-amber-800 border-amber-200" },
  { model: "Xiaomi 14 Ultra", variant: "512GB • Black Leather", brand: "Xiaomi 📸", unitsSold: 11, revenue: 1099890, profit: 131986, margin: "12.0%", status: "📸 #10 Flagship", pillColor: "bg-zinc-200 text-zinc-900 border-zinc-300" },
];

// Top Repeat Customers
const TOP_CUSTOMERS = [
  { name: "Rajesh Kumar", phone: "+91 98765 12345", totalOrders: 14, totalSpent: 128500, khataBalance: 0, status: "CLEAR" },
  { name: "Anand Verma", phone: "+91 98112 34567", totalOrders: 9, totalSpent: 84900, khataBalance: 4500, status: "DUE" },
  { name: "Pooja Sharma", phone: "+91 99988 77665", totalOrders: 11, totalSpent: 72400, khataBalance: 0, status: "CLEAR" },
  { name: "Suresh Gupta", phone: "+91 98711 22334", totalOrders: 7, totalSpent: 59300, khataBalance: 12000, status: "DUE" },
];

export default function POSDashboardPage() {
  const [timePeriod, setTimePeriod] = useState<"7DAY" | "MONTHLY">("7DAY");
  const activeDataset = timePeriod === "7DAY" ? INITIAL_VELOCITY_DAYS : INITIAL_MONTHLY_DATA;
  const [selectedDate, setSelectedDate] = useState<string>(activeDataset[activeDataset.length - 1].date);

  // Phone Sort Metric State - DEFAULT TO "units" (MOST SELLING UNITS FIRST: #1 28 units, #2 25 units...)
  const [phoneSortKey, setPhoneSortKey] = useState<"units" | "revenue" | "profit">("units");

  // DYNAMICALLY SORT TOP SELLING PHONES STRICTLY BY UNITS SOLD DESCENDING
  const sortedPhones = [...BASE_PHONE_MODELS]
    .sort((a, b) => {
      if (phoneSortKey === "revenue") return b.revenue - a.revenue;
      if (phoneSortKey === "profit") return b.profit - a.profit;
      return b.unitsSold - a.unitsSold; // DEFAULT: Units Sold
    })
    .map((phone, idx) => ({
      ...phone,
      rank: idx + 1,
      share: Math.round(
        (phone[phoneSortKey === "units" ? "unitsSold" : phoneSortKey === "profit" ? "profit" : "revenue"] /
          Math.max(
            ...BASE_PHONE_MODELS.map(
              (p) => p[phoneSortKey === "units" ? "unitsSold" : phoneSortKey === "profit" ? "profit" : "revenue"]
            )
          )) *
          100
      ),
    }));

  // Store Expenses State
  const [expenses, setExpenses] = useState<StoreExpense[]>(INITIAL_EXPENSES);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [showExpenseTable, setShowExpenseTable] = useState(false);
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState("");

  // New Expense Form Inputs
  const [expCategory, setExpCategory] = useState("⚡ Utilities & Electricity");
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expMode, setExpMode] = useState<"CASH" | "UPI" | "CARD">("UPI");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expVoucher, setExpVoucher] = useState("");

  // 100% DYNAMIC Calculations from Active Dataset + Logged Store Expenses
  const rawRevenue = activeDataset.reduce((acc, d) => acc + d.revenue, 0);
  const rawProfit = activeDataset.reduce((acc, d) => acc + d.profit, 0);
  const totalLoggedExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // COGS + Operating Expenses
  const totalCost = (rawRevenue - rawProfit) + totalLoggedExpenses;
  const totalRevenue = rawRevenue;
  const netProfit = Math.max(0, rawRevenue - totalCost);
  const profitMarginPercent = ((netProfit / (totalRevenue || 1)) * 100).toFixed(1);
  const totalInvoices = activeDataset.reduce((acc, d) => acc + d.invoices, 0);

  // Handle Add Store Expense Form Submission
  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(expAmount);
    if (!amt || amt <= 0) return;

    const newExpense: StoreExpense = {
      id: `exp-${Date.now()}`,
      category: expCategory,
      title: expTitle || `${expCategory} Expense`,
      amount: amt,
      paymentMode: expMode,
      date: expDate,
      voucherNo: expVoucher || `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setExpenseSuccessMsg(`Recorded store expense of ₹${amt.toLocaleString("en-IN")} (${expCategory})`);
    
    // Reset Form
    setExpTitle("");
    setExpAmount("");
    setExpVoucher("");
    setIsExpenseModalOpen(false);

    setTimeout(() => setExpenseSuccessMsg(""), 4000);
  }

  function handleDeleteExpense(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  // Active Selected Day Item
  const activeItem = activeDataset.find((d) => d.date === selectedDate) || activeDataset[activeDataset.length - 1];

  // Graph Calculations
  const width = 800;
  const height = 260;
  const paddingX = 50;
  const paddingTop = 40;
  const paddingBottom = 45;

  const maxRevenue = Math.max(...activeDataset.map((d) => d.revenue)) * 1.15;
  const maxProfit = maxRevenue * 0.35;
  const stepX = (width - 2 * paddingX) / (activeDataset.length - 1);

  // Dynamic green (Gross Revenue) coordinate points
  const greenPoints = activeDataset.map((d, i) => ({
    x: paddingX + i * stepX,
    y: height - paddingBottom - (d.revenue / maxRevenue) * (height - paddingTop - paddingBottom),
    val: d.revenue,
    day: d.day,
    date: d.date,
  }));

  // Dynamic purple (Net Profit) coordinate points
  const purplePoints = activeDataset.map((d, i) => ({
    x: paddingX + i * stepX,
    y: height - paddingBottom - (d.profit / maxProfit) * (height - paddingTop - paddingBottom),
    val: d.profit,
    day: d.day,
    date: d.date,
  }));

  // Catmull-Rom to Cubic Bezier Curve Converter
  function getCatmullRomBezierPath(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }

  function getAreaPath(pts: { x: number; y: number }[]) {
    if (pts.length === 0) return "";
    const line = getCatmullRomBezierPath(pts);
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    const bottomY = height - paddingBottom;
    return `${line} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  const greenPath = getCatmullRomBezierPath(greenPoints);
  const purplePath = getCatmullRomBezierPath(purplePoints);

  const greenArea = getAreaPath(greenPoints);
  const purpleArea = getAreaPath(purplePoints);

  // Dynamic Y-axis grid ticks
  const yGridTicks = [
    { label: `₹${Math.round((maxRevenue * 0.75) / 1000)}k`, y: height - paddingBottom - (0.75) * (height - paddingTop - paddingBottom) },
    { label: `₹${Math.round((maxRevenue * 0.5) / 1000)}k`, y: height - paddingBottom - (0.5) * (height - paddingTop - paddingBottom) },
    { label: `₹${Math.round((maxRevenue * 0.25) / 1000)}k`, y: height - paddingBottom - (0.25) * (height - paddingTop - paddingBottom) },
    { label: "₹0", y: height - paddingBottom },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col font-sans text-slate-900 overflow-y-auto space-y-4 pb-6 select-none pr-1">
      {/* Toast Notification Banner for Logged Expenses */}
      {expenseSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center justify-between shadow-sm animate-fadeIn shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-base">✓</span>
            <span>{expenseSuccessMsg}</span>
          </div>
          <button
            onClick={() => setShowExpenseTable(true)}
            className="text-emerald-700 underline font-extrabold hover:text-emerald-900 cursor-pointer"
          >
            View Expense Ledger →
          </button>
        </div>
      )}

      {/* 1. Header Banner & Quick Action Buttons */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-purple-700 text-white shadow-md">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Profit &amp; Loss Executive Dashboard</h1>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                Most Sold Mobile Leaderboard
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Live Store Sales Performance, Dynamic Velocity Curves &amp; Top Selling Devices (Sorted #1 by Units Sold)
            </p>
          </div>
        </div>

        {/* Action Buttons: Add Expense & POS Terminal */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold border border-rose-200 px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <span>+ Write Store Expense</span>
          </button>

          <button
            onClick={() => setShowExpenseTable(!showExpenseTable)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 px-3 py-2 rounded-xl text-xs flex items-center space-x-1 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-slate-600" />
            <span>Expenses ({expenses.length})</span>
          </button>

          <Link
            href="/pos/billing"
            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 transition-all cursor-pointer shrink-0"
          >
            <ShoppingCart className="w-4 h-4 text-slate-500" />
            <span>POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* 2. DYNAMIC Top Metric KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: GROSS SALES REVENUE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold text-slate-700">Gross sales revenue</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-emerald-600">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Gross Sales across active period</span>
            </div>
          </div>
        </div>

        {/* Card 2: DYNAMIC TOTAL EXPENSES (COGS + Operating Expenses) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:border-rose-300 transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold text-slate-700">Total expenses &amp; COGS</span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-rose-600">
              ₹{totalCost.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center space-x-1 text-rose-600 text-xs font-bold mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>COGS + ₹{totalLoggedExpenses.toLocaleString("en-IN")} Logged Expenses</span>
            </div>
          </div>
        </div>

        {/* Card 3: DYNAMIC NET PROFIT */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold text-slate-700">Net store profit</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-emerald-600">
              ₹{netProfit.toLocaleString("en-IN")}
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold mt-1">
              <span className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-xs font-extrabold">
                {profitMarginPercent}% Net Margin (After Expenses)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: KHATA UDHAAR DUE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs hover:border-amber-300 transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold text-slate-700">Khata udhaar due</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-amber-700">
              ₹24,800
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1 flex items-center justify-between">
              <span>{totalInvoices} Bills Issued</span>
              <Link href="/pos/customers" className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline">
                View Ledger →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* EXPENSES LOGGED LEDGER DRAWER / TABLE */}
      {showExpenseTable && (
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm space-y-3 shrink-0 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-rose-600" />
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                Logged Store Operating Expenses ({expenses.length} Records)
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
              >
                + Write Expense
              </button>
              <button
                onClick={() => setShowExpenseTable(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Expense Category</th>
                  <th className="py-2.5 px-3">Title / Description</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400 font-sans">
                      No operating expenses recorded yet. Click <strong>+ Write Store Expense</strong> above to add one.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-slate-600">{exp.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{exp.voucherNo}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-700">
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-900 font-medium">{exp.title}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-bold">{exp.paymentMode}</td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-600">
                        -₹{exp.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC DELIVERABLE SALES VELOCITY GRAPH COMPONENT */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Deliverable Sales Velocity</h2>
              <p className="text-xs text-slate-400 font-medium">Daily store sales productivity & net profit velocity curves</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs font-semibold gap-1">
              <button
                onClick={() => {
                  setTimePeriod("7DAY");
                  setSelectedDate(INITIAL_VELOCITY_DAYS[INITIAL_VELOCITY_DAYS.length - 1].date);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timePeriod === "7DAY"
                    ? "bg-white text-fuchsia-800 font-bold shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                7-Day Velocity
              </button>
              <button
                onClick={() => {
                  setTimePeriod("MONTHLY");
                  setSelectedDate(INITIAL_MONTHLY_DATA[INITIAL_MONTHLY_DATA.length - 1].date);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timePeriod === "MONTHLY"
                    ? "bg-white text-fuchsia-800 font-bold shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Monthly View
              </button>
            </div>

            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>₹{totalRevenue.toLocaleString("en-IN")} Sales Velocity</span>
            </span>
          </div>
        </div>

        {/* Dynamic Calendar Cards Selector Row */}
        <div className="grid grid-cols-7 gap-2.5">
          {activeDataset.map((dayItem) => {
            const isSelected = selectedDate === dayItem.date;
            return (
              <button
                key={dayItem.date}
                onClick={() => setSelectedDate(dayItem.date)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[75px] gap-1 ${
                  isSelected
                    ? "border-2 border-fuchsia-600 bg-fuchsia-50/50 text-fuchsia-950 font-bold shadow-xs"
                    : "border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/70 text-slate-700"
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dayItem.day}</span>
                <span className="text-sm font-black font-mono text-slate-900">{dayItem.date}</span>
                <span className="text-xs font-mono font-bold text-slate-800">{dayItem.pill}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Floating Information Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="font-bold text-slate-900 font-sans">{activeItem.fullDate}:</span>
            <span className="text-slate-600">{activeItem.invoices} Customer Invoices Issued</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-emerald-700 font-bold">
              Gross Sales: <strong>₹{activeItem.revenue.toLocaleString("en-IN")}</strong>
            </span>
            <span className="text-purple-700 font-bold">
              Net Profit: <strong>₹{activeItem.profit.toLocaleString("en-IN")}</strong> ({((activeItem.profit / activeItem.revenue) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* DYNAMIC Double Bezier Curve Graph SVG */}
        <div className="pt-2 pb-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none font-sans">
            <defs>
              <linearGradient id="realGreenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="realPurpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y-Axis Horizontal Gridlines */}
            {yGridTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  x1={paddingX - 10}
                  y1={tick.y}
                  x2={width - paddingX + 10}
                  y2={tick.y}
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                />
                <text
                  x={paddingX - 15}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 font-semibold"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Area Fills */}
            <path d={greenArea} fill="url(#realGreenGrad)" />
            <path d={purpleArea} fill="url(#realPurpleGrad)" />

            {/* Dashed Purple Net Profit Curve Line */}
            <path
              d={purplePath}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />

            {/* Solid Green Gross Revenue Curve Line */}
            <path
              d={greenPath}
              fill="none"
              stroke="#10B981"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Dynamic Nodes & Value Labels */}
            {greenPoints.map((pt, idx) => {
              const purpPt = purplePoints[idx];
              const isSelected = activeDataset[idx].date === selectedDate;

              return (
                <g key={idx}>
                  {/* Purple Net Profit Circle Node */}
                  <circle
                    cx={purpPt.x}
                    cy={purpPt.y}
                    r={isSelected ? 6 : 4.5}
                    fill="#8B5CF6"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* Green Gross Revenue Circle Node */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 7 : 5.5}
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />

                  {/* Callout Value Badge above Revenue Node */}
                  <rect
                    x={pt.x - 22}
                    y={pt.y - 20}
                    width="44"
                    height="14"
                    rx="4"
                    fill={isSelected ? "#4338CA" : "#065F46"}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 9}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-white font-black"
                  >
                    ₹{Math.round(pt.val / 1000)}k
                  </text>
                </g>
              );
            })}

            {/* X-Axis Day Labels */}
            {activeDataset.map((dayItem, idx) => {
              const x = paddingX + idx * stepX;
              const isSelected = dayItem.date === selectedDate;

              return (
                <text
                  key={`x-${idx}`}
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-sans font-extrabold ${isSelected ? "fill-indigo-600" : "fill-slate-500"}`}
                >
                  {dayItem.day} {dayItem.date}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Graph Footer & REAL Legend Totals */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-bold">
          <div className="flex flex-wrap items-center gap-6 text-slate-700">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Gross Revenue: <strong className="text-slate-900 font-mono">₹{totalRevenue.toLocaleString("en-IN")}</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              <span>Net Profit: <strong className="text-slate-900 font-mono">₹{netProfit.toLocaleString("en-IN")}</strong></span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Total Expenses: <strong className="text-slate-900 font-mono">₹{totalCost.toLocaleString("en-IN")}</strong></span>
            </span>
          </div>

          <Link
            href="/pos/billing"
            className="text-indigo-600 hover:text-indigo-800 text-xs font-extrabold flex items-center space-x-1 self-end sm:self-auto cursor-pointer"
          >
            <span>Live Sales Terminal</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4. Main Section: Left Table (Ledger) + Right Column (MOST SELLING MOBILE PHONES STRICTLY ORDERED #1 BY UNITS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Span 7): Financial Performance Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-fuchsia-600" />
                <span>Financial Performance & Margin Breakdown</span>
              </h3>
              <span className="text-[10px] font-bold bg-fuchsia-50 text-fuchsia-700 px-2.5 py-0.5 rounded-full border border-fuchsia-200">
                P&L Verified
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Expenses (COGS)</th>
                    <th className="py-2.5 px-3 text-right">Net Profit</th>
                    <th className="py-2.5 px-3 text-center">Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {activeDataset.map((row, idx) => {
                    const margin = ((row.profit / row.revenue) * 100).toFixed(1);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold font-sans text-slate-900">{row.fullDate}</td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-600">
                          ₹{row.revenue.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-orange-600">
                          ₹{(row.revenue - row.profit).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                          ₹{row.profit.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-600">
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Span 5): MOST SELLING PHONES STRICTLY SORTED #1 BY UNITS SOLD */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 shrink-0 gap-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-lg border border-fuchsia-100">
                <Smartphone className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Top 10 Selling Phones</span>
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                </h3>
                <p className="text-xs text-slate-500">Ranked #1 to #10 by highest {phoneSortKey}</p>
              </div>
            </div>

            {/* Interactive Sort Order Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setPhoneSortKey("units")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  phoneSortKey === "units"
                    ? "bg-white text-fuchsia-800 font-bold shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Units Sold
              </button>
              <button
                onClick={() => setPhoneSortKey("revenue")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  phoneSortKey === "revenue"
                    ? "bg-white text-fuchsia-800 font-bold shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setPhoneSortKey("profit")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  phoneSortKey === "profit"
                    ? "bg-white text-fuchsia-800 font-bold shadow-2xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Profit
              </button>
            </div>
          </div>

          {/* Scrollable Container for Top 10 Phones Sorted #1 by Units Sold */}
          <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-300">
            {sortedPhones.map((phone) => (
              <div
                key={`${phone.model}-${phone.rank}`}
                className={`p-3 border rounded-xl transition-all space-y-2 group shrink-0 ${
                  phone.rank === 1
                    ? "bg-gradient-to-r from-amber-50/70 via-white to-fuchsia-50/40 border-amber-300 shadow-2xs"
                    : "bg-slate-50/80 border-slate-200/80 hover:border-fuchsia-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                        phone.rank === 1
                          ? "bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-xs ring-2 ring-amber-300"
                          : phone.rank === 2
                          ? "bg-slate-400 text-white shadow-2xs"
                          : phone.rank === 3
                          ? "bg-amber-800 text-white shadow-2xs"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      #{phone.rank}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                        <span>{phone.model}</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">{phone.variant}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${phone.pillColor}`}>
                    {phone.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-slate-200/60">
                  <span className="text-slate-900 font-extrabold flex items-center space-x-1.5">
                    <span className="bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200 px-2 py-0.5 rounded-md text-[11px] font-black">
                      {phone.unitsSold} Units
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans font-semibold">Sold Volume</span>
                  </span>
                  <div className="text-right">
                    <span className="font-black text-slate-900">₹{phone.revenue.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-emerald-600 block font-bold">
                      Profit: ₹{phone.profit.toLocaleString("en-IN")} ({phone.margin})
                    </span>
                  </div>
                </div>

                {/* Sales Share Volume Bar */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 rounded-full group-hover:from-fuchsia-500 group-hover:to-purple-500 transition-all"
                    style={{ width: `${phone.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Top Repeat Customers & Customer Credit Ledger Breakdown */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
              <Award className="w-4 h-4 text-fuchsia-600" />
              <span>Top Repeat Customers & Udhaar Credit Status</span>
            </h3>
            <p className="text-xs text-slate-500">High lifetime value customers and active store khata balances</p>
          </div>
          <Link
            href="/pos/customers"
            className="text-xs font-bold text-fuchsia-700 hover:text-fuchsia-900 flex items-center space-x-1 border border-fuchsia-200 px-3 py-1.5 rounded-xl bg-fuchsia-50 transition-colors"
          >
            <span>Customer Khata Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TOP_CUSTOMERS.map((cust, idx) => (
            <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 truncate">{cust.name}</span>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    cust.status === "CLEAR"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {cust.status === "CLEAR" ? "No Due" : `Due ₹${cust.khataBalance}`}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500">{cust.phone}</p>
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[10px]">{cust.totalOrders} Orders</span>
                <span className="font-black text-slate-900">₹{cust.totalSpent.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECORD STORE EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Write Store Expense</h2>
                  <p className="text-[11px] text-slate-500">Record shop operating expenses to update net store profit</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Expense Category *
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                >
                  <option value="⚡ Utilities & Electricity">⚡ Utilities & Electricity</option>
                  <option value="🏢 Store Rent">🏢 Store Rent & Maintenance</option>
                  <option value="👥 Staff Wages & Salaries">👥 Staff Wages & Salaries</option>
                  <option value="☕ Staff Refreshment">☕ Tea, Coffee & Staff Snacks</option>
                  <option value="📣 Marketing & Ads">📣 Marketing & Local Advertising</option>
                  <option value="🚚 Transport & Freight">🚚 Transport & Logistics</option>
                  <option value="🛠️ Repair Lab Tools">🛠️ Repair Lab Equipment & Supplies</option>
                  <option value="📦 Miscellaneous Store Expense">📦 Miscellaneous Store Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Expense Description / Title *
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Monthly Shop Electricity Bill, Staff Lunch"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Expense Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="Enter amount ₹"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-rose-600 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={expMode}
                    onChange={(e) => setExpMode(e.target.value as "CASH" | "UPI" | "CARD")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                  >
                    <option value="UPI">UPI</option>
                    <option value="CASH">CASH</option>
                    <option value="CARD">CARD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Voucher / Ref # (Optional)
                  </label>
                  <input
                    type="text"
                    value={expVoucher}
                    onChange={(e) => setExpVoucher(e.target.value)}
                    placeholder="EXP-8845"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center space-x-1.5"
                >
                  <span>✓ Record Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
