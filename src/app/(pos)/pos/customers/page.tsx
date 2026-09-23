"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, BookOpen, ArrowRight, Plus, Phone, AlertCircle, ShieldCheck } from "lucide-react";

interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  currentBalance: number;
  creditLimit: number;
  totalLifetimeSpend: number;
  lastActive: string;
}

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust-1",
    name: "Ramesh Sharma",
    phone: "9876543210",
    currentBalance: 8500.0,
    creditLimit: 25000.0,
    totalLifetimeSpend: 42500.0,
    lastActive: "2026-09-19",
  },
  {
    id: "cust-2",
    name: "Anita Gupta",
    phone: "9812345678",
    currentBalance: 0.0,
    creditLimit: 15000.0,
    totalLifetimeSpend: 18900.0,
    lastActive: "2026-09-15",
  },
  {
    id: "cust-3",
    name: "Vikram Malhotra",
    phone: "9899887766",
    currentBalance: 14200.0,
    creditLimit: 30000.0,
    totalLifetimeSpend: 95000.0,
    lastActive: "2026-09-20",
  },
];

export default function CustomerDirectoryPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("company_customers_db");
      if (saved) {
        try {
          const localCustomers: any[] = JSON.parse(saved);
          const map = new Map<string, CustomerRecord>();
          INITIAL_CUSTOMERS.forEach((c) => map.set(c.id, c));
          localCustomers.forEach((lc, idx) => {
            const id = lc.id || `cust-saved-${idx}`;
            const existing = map.get(id);
            map.set(id, {
              id,
              name: lc.name || "Customer",
              phone: lc.phone || "",
              currentBalance: typeof lc.currentBalance === "number" ? lc.currentBalance : (existing?.currentBalance || 0),
              creditLimit: lc.creditLimit || existing?.creditLimit || 25000,
              totalLifetimeSpend: lc.totalLifetimeSpend || existing?.totalLifetimeSpend || 0,
              lastActive: existing?.lastActive || new Date().toISOString().split("T")[0],
            });
          });
          setCustomers(Array.from(map.values()));
        } catch (e) {
          console.error("Failed to parse saved customers:", e);
        }
      }
    }
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col font-sans text-slate-900 overflow-y-auto space-y-4 px-4 sm:px-6 lg:px-8 py-4 pb-6 select-none">
      {/* 1. Top Action Header Banner with Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white shadow-xs shrink-0">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Customer Khata / Udhaar Ledger Directory</h1>
            <p className="text-xs text-slate-500 font-medium">
              ACID-compliant stock deduction, credit limit checks, and customer credit ledger tracking
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Customer Name or Mobile Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-10 pr-4 rounded-xl text-xs font-medium border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fuchsia-600 focus:outline-none transition-all"
            />
          </div>

          <Link
            href="/pos/billing"
            className="h-9 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white text-xs font-bold px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-fuchsia-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Billing Customer</span>
          </Link>
        </div>
      </div>

      {/* 2. Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((customer) => {
          return (
            <div
              key={customer.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-fuchsia-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-sm text-slate-900">{customer.name}</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                      customer.currentBalance > 0
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {customer.currentBalance > 0 ? "Khata Active" : "No Outstanding"}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-fuchsia-600" />
                  <span className="font-mono font-bold">{customer.phone}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Khata Balance Due:</span>
                    <span className={`font-black ${customer.currentBalance > 0 ? "text-amber-700" : "text-emerald-700"}`}>
                      ₹{customer.currentBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span className="font-sans">Store Credit Limit:</span>
                    <span>₹{customer.creditLimit.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span className="font-sans">Lifetime Spend:</span>
                    <span className="font-bold text-slate-900">₹{customer.totalLifetimeSpend.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono font-medium">Last Txn: {customer.lastActive}</span>
                <Link
                  href={`/pos/customers/${customer.id}`}
                  className="text-xs font-bold text-fuchsia-700 hover:text-fuchsia-900 flex items-center space-x-1 border border-fuchsia-200 px-3 py-1.5 rounded-xl bg-fuchsia-50 transition-colors cursor-pointer"
                >
                  <span>Open Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
