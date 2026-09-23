"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Zap,
  RefreshCw,
  Wrench,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Building2,
} from "lucide-react";

export default function MarketingLandingPage() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    gstin: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pos/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      window.location.href = "https://pos.ecodigitech.com/pos/billing";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-24 pb-20 text-slate-900">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 px-6 text-center space-y-8 max-w-6xl mx-auto">
        {/* Animated Badge */}
        <div className="inline-flex items-center space-x-2 bg-fuchsia-50 border border-fuchsia-200 px-4 py-2 rounded-full text-xs font-bold text-fuchsia-800 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-600 animate-pulse" />
          <span>Next-Gen Cloud Retail & Repair POS Engine</span>
          <span className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
            v1.0 Ready
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-slate-900">
          Sub-50ms Counter Billing, <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-[#4D0F56] via-[#A81B84] to-[#D91A7A] bg-clip-text text-transparent">
            Refurbished Margin GST
          </span>{" "}
          & Repair Lab
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Engineered specifically for mobile phone retailers, consumer electronics stores, and repair laboratories. Automate high-speed HID barcode scanning, Section 15(5) Margin GST, repair lab job sheets, and customer Khata ledgers.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button
            onClick={() => setIsSignupOpen(true)}
            className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black px-8 py-4 rounded-2xl text-base shadow-lg shadow-fuchsia-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Start 30-Day Cardless Free Trial</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#pricing"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-8 py-4 rounded-2xl text-base border border-slate-200 transition-all shadow-xs"
          >
            <span>View Transparent Plans</span>
          </a>
        </div>

        {/* Live Interactive Terminal Mockup Box */}
        <div className="pt-6 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700" />
            
            {/* Terminal Top Window Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs font-mono text-slate-500 ml-2">
                  pos.ecodigitech.com • Main Counter Billing Station
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-fuchsia-600 animate-ping" />
                <span className="text-[11px] font-mono text-fuchsia-800 font-bold">
                  HID Barcode Listener ONLINE
                </span>
              </div>
            </div>

            {/* Terminal Metric Preview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Today&apos;s Sales</span>
                <div className="text-2xl font-black text-slate-900 font-mono">₹1,42,850</div>
                <span className="text-[10px] text-fuchsia-700 font-semibold">↑ 18 Invoices Completed</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Margin Tax Saved</span>
                <div className="text-2xl font-black text-purple-700 font-mono">₹18,420</div>
                <span className="text-[10px] text-purple-600 font-semibold">Section 15(5) Scheme</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Repair Tickets</span>
                <div className="text-2xl font-black text-blue-700 font-mono">12 Active</div>
                <span className="text-[10px] text-blue-600 font-semibold">SAC 9987 Service Billing</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Udhaar Ledger</span>
                <div className="text-2xl font-black text-amber-700 font-mono">₹34,500</div>
                <span className="text-[10px] text-amber-600 font-semibold">ACID Credit Limit Check</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE MODULES GRID */}
      <section id="modules" className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Four Specialized Modules in One Unified Cloud Engine
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Everything your electronics store needs from billing counter to lab technician desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-fuchsia-300 transition-all hover:-translate-y-1 group space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center text-fuchsia-700 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Sub-50ms Barcode Billing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Global HID hardware listener captures keypress bursts under 50ms without search input focus, creating cart items in seconds.
            </p>
            <div className="text-[11px] font-mono text-fuchsia-700 font-bold">
              ✓ Hardware Gun Auto-Detect
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 transition-all hover:-translate-y-1 group space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Section 15(5) Margin GST</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Refurbished phone margin tax engine calculating GST strictly on gross profit margin while concealing acquisition costs on thermal receipts.
            </p>
            <div className="text-[11px] font-mono text-purple-700 font-bold">
              ✓ Conceals Purchase Price
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all hover:-translate-y-1 group space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Repair Lab Job Sheets</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Issue ticket job sheets (`REP-1001`), capture pattern locks, track technician repair stages, and bill under SAC 9987 (18% GST).
            </p>
            <div className="text-[11px] font-mono text-blue-700 font-bold">
              ✓ SAC 9987 GST Compliance
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-all hover:-translate-y-1 group space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Customer Khata Ledger</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ACID-compliant store credit balance tracking, customer credit limit enforcement inside atomic transactions, and one-click repayments.
            </p>
            <div className="text-[11px] font-mono text-amber-700 font-bold">
              ✓ Prisma ACID Guarantee
            </div>
          </div>
        </div>
      </section>

      {/* PRICING MATRIX */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            100% Automated, Self-Serve Transparent Pricing
          </h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Zero sales calls required. Register your merchant store in under 60 seconds and start billing immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan 1 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 space-y-6 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full inline-block">
                Evaluation
              </span>
              <h3 className="text-2xl font-bold text-slate-900">30-Day Free Trial</h3>
              <div className="text-4xl font-black text-slate-900 font-mono">
                ₹0 <span className="text-xs text-slate-500 font-sans font-normal">/ 30 days</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full unrestricted feature access for evaluation. Zero credit card required to start.
              </p>
              <ul className="text-xs text-slate-700 space-y-2.5 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-700 shrink-0" />
                  <span>Unlimited Barcode & IMEI Billing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-700 shrink-0" />
                  <span>Margin Scheme & SAC 9987 Billing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-700 shrink-0" />
                  <span>Used Phone Intake & Customer Khata</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-700 shrink-0" />
                  <span>Thermal Printing (58mm & 80mm)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setIsSignupOpen(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs transition-colors"
            >
              Start Free Trial Now &rarr;
            </button>
          </div>

          {/* Plan 2 */}
          <div className="p-8 rounded-3xl bg-white border border-purple-200 space-y-6 flex flex-col justify-between hover:border-purple-400 transition-all shadow-xs">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full inline-block">
                Semi-Annual Prepaid
              </span>
              <h3 className="text-2xl font-bold text-slate-900">6-Month Access</h3>
              <div className="text-4xl font-black text-slate-900 font-mono">
                ₹4,999 <span className="text-xs text-slate-500 font-sans font-normal">/ 180 days</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prepaid Razorpay checkout with instant 180-day subscription renewal.
              </p>
              <ul className="text-xs text-slate-700 space-y-2.5 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Everything in Free Trial</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Razorpay Dynamic UPI QR Integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Multi-User Owner & Cashier Roles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Priority Technical Support</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setIsSignupOpen(true)}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              Choose 6-Month Plan &rarr;
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-3xl bg-white border-2 border-fuchsia-500 space-y-6 flex flex-col justify-between relative shadow-xl overflow-hidden">
            <div className="absolute top-4 right-4 bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full tracking-wider shadow-sm">
              Best Value (Save 25%)
            </div>
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-800 bg-fuchsia-50 border border-fuchsia-200 px-3 py-1 rounded-full inline-block">
                Annual Prepaid
              </span>
              <h3 className="text-2xl font-bold text-slate-900">1-Year Access</h3>
              <div className="text-4xl font-black text-fuchsia-700 font-mono">
                ₹8,999 <span className="text-xs text-slate-500 font-sans font-normal">/ 365 days</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prepaid annual subscription with 365 days valid till extension.
              </p>
              <ul className="text-xs text-slate-700 space-y-2.5 pt-2 border-t border-slate-100">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-700 shrink-0" />
                  <span>Everything in 6-Month Plan</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-700 shrink-0" />
                  <span>25% Discount vs Semi-Annual Plan</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-700 shrink-0" />
                  <span>Unlimited Multi-Branch Cashiers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-700 shrink-0" />
                  <span>Guaranteed Price Lock for Renewal</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setIsSignupOpen(true)}
              className="w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black py-4 rounded-xl text-xs transition-colors shadow-md shadow-fuchsia-500/20"
            >
              Get Annual Access Now &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* REGISTRATION MODAL */}
      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-fuchsia-700" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Register Merchant Store POS
                </h3>
              </div>
              <button
                onClick={() => setIsSignupOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))}
                    placeholder="Apex Mobile Hub"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData((p) => ({ ...p, ownerName: e.target.value }))}
                    placeholder="Vikram Malhotra"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="owner@apexmobile.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Account Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Store GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData((p) => ({ ...p, gstin: e.target.value }))}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Store Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Connaught Place, New Delhi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-xs transition-colors shadow-md shadow-fuchsia-500/20 mt-2"
              >
                {loading ? "Activating Merchant Store..." : "Activate 30-Day Trial Instantly &rarr;"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
