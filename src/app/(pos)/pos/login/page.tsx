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

  function handleQuickDemoFill() {
    setIdentifier("store@ecodigitech.com");
    setPassword("Demo123!Password");
    setError("");
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 text-white overflow-hidden p-4 sm:p-6 select-none font-sans">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-lg z-10">
        {/* Top Floating Badge */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest">
              POS Terminal Cloud • v1.0.4 Online
            </span>
          </div>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6">
          {/* Header & Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center">
              <div className="relative p-2 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 shadow-lg">
                <Image
                  src="/brand/logo.png"
                  alt="EcoDigiTech POS"
                  width={180}
                  height={50}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Store Counter Sign-In
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Multi-Tenant Retail POS, Inventory &amp; SAC 9987 Repair Lab
              </p>
            </div>
          </div>

          {/* Quick Demo Fill Shortcut */}
          <div className="bg-gradient-to-r from-fuchsia-950/40 via-purple-950/40 to-slate-900/80 border border-fuchsia-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shrink-0 border border-fuchsia-500/30">
                <Zap className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-fuchsia-200">Testing Counter Terminal?</p>
                <p className="text-[10.5px] text-fuchsia-400/80 truncate">Fill demo store credentials in 1-click</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-3 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-extrabold text-xs transition-all shrink-0 cursor-pointer shadow-sm shadow-fuchsia-500/30 active:scale-95"
            >
              Auto-Fill
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800/90 text-rose-200 text-xs rounded-xl font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
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
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-slate-600 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none font-medium transition-colors"
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
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-600 focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 focus:outline-none font-medium transition-colors"
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
              className="w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-fuchsia-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
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

          {/* Feature Badges Grid */}
          <div className="pt-2 grid grid-cols-2 gap-2 text-[10.5px]">
            <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sub-50ms HID Scanner</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
              <span>Section 15(5) GST</span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="border-t border-slate-800/80 pt-4 text-center space-y-1">
            <p className="text-[11px] text-slate-400 font-medium">
              Cashier credential resets are strictly restricted to Merchant Owners.
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Powered by EcoDigiTech | pos.ecodigitech.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
