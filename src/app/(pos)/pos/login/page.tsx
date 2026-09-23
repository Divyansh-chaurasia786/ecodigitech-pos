"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Smartphone,
  BookOpen,
  Store,
  Layers,
  Sparkles,
} from "lucide-react";

export default function POSLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/pos/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please check credentials.");
      }

      window.location.href = "/pos/billing";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 text-white overflow-hidden p-4 sm:p-6 lg:p-8 font-sans select-none">
      {/* Ambient Lighting Background */}
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />

      {/* Decorative Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      {/* Main Container - Split View on Desktop */}
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        
        {/* LEFT COLUMN: Premium Feature & Brand Showcase */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left hidden sm:block">
          {/* Brand Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                Multi-Tenant Retail &amp; Repair Engine
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 shadow-xl">
                <Image
                  src="/brand/logo.png"
                  alt="EcoDigiTech POS"
                  width={200}
                  height={55}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Next-Gen Retail POS <br />
              <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                &amp; SAC 9987 Repair Suite
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">
              Purpose-built for electronics retailers, smartphone stores, and repair labs. Experience sub-50ms barcode scanning, Section 15(5) margin GST, and atomic Khata ledger tracking.
            </p>
          </div>

          {/* Feature Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1 hover:border-fuchsia-500/40 transition-colors">
              <div className="flex items-center gap-2 font-bold text-fuchsia-300">
                <Zap className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span>Sub-50ms HID Scanner</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Global keystroke capture gun integration without active input focus.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Section 15(5) Margin GST</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Conceals phone purchase price while auto-calculating tax on gross margin.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <Wrench className="w-4 h-4 text-purple-400 shrink-0" />
                <span>SAC 9987 Repair Lab</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Job sheets (`REP-1001`), pattern lock capture, and technician billing.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl space-y-1 hover:border-pink-500/40 transition-colors">
              <div className="flex items-center gap-2 font-bold text-pink-300">
                <BookOpen className="w-4 h-4 text-pink-400 shrink-0" />
                <span>ACID Customer Khata</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Atomic credit balance mutation with strict tenant credit limit checks.
              </p>
            </div>
          </div>

          {/* Metrics Footer Bar */}
          <div className="pt-2 flex items-center gap-6 border-t border-slate-800/80 text-slate-400 text-xs font-mono">
            <div>
              <span className="font-bold text-white block text-sm">&lt; 50ms</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Scan Latency</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="font-bold text-emerald-400 block text-sm">100% ACID</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Stock Integrity</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="font-bold text-fuchsia-400 block text-sm">Multi-Tenant</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Isolated Cloud</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sleek Glassmorphic Sign-In Form */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/85 border border-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6">
            
            {/* Form Header */}
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Store className="w-5 h-5 text-fuchsia-400" />
                <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">
                  Store Counter Sign-In
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Access Terminal
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Enter your merchant owner or cashier credentials below
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-800/90 text-rose-200 text-xs rounded-xl font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sign-In Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 uppercase text-[10.5px] tracking-wider">
                  Email Address or Store Phone *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. owner@store.com or 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3.5 text-white placeholder-slate-600 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-slate-300 uppercase text-[10.5px] tracking-wider">
                    Terminal Password *
                  </label>
                  <Link
                    href="/pos/forgot-password"
                    className="text-[11px] text-fuchsia-400 hover:text-fuchsia-300 font-extrabold transition-colors"
                  >
                    Owner Self-Reset OTP?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-3.5 text-white placeholder-slate-600 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none font-medium transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white font-black py-4 rounded-xl text-xs sm:text-sm shadow-xl shadow-fuchsia-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Terminal...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Launch Counter Terminal</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Security Note */}
            <div className="border-t border-slate-800/80 pt-4 text-center space-y-1.5">
              <p className="text-[11px] text-slate-400 font-medium">
                🔒 Cashier credential resets are strictly restricted to Merchant Owners.
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Powered by EcoDigiTech | pos.ecodigitech.com
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

