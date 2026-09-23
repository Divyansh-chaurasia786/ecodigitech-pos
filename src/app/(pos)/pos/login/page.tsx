"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  AlertCircle,
  Store,
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
    <div className="min-h-screen relative flex items-center justify-center bg-[#07090e] text-slate-100 overflow-hidden p-4 sm:p-6 font-sans select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[128px] pointer-events-none animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Decorative Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md z-10 space-y-6">
        
        {/* Top Portal Switcher Bar */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-1.5 rounded-full shadow-2xl">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg text-xs font-bold">
            <Store className="w-3.5 h-3.5" />
            <span>Store POS Sign-In</span>
          </div>

          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all text-xs font-semibold cursor-pointer group"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>Super Admin Portal</span>
            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Brand & Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
              <Image
                src="/brand/logo.png"
                alt="EcoDigiTech POS"
                width={160}
                height={42}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Counter Terminal Login
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Sign in to your store billing workstation
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-950/90 border border-rose-800/90 text-rose-200 text-xs rounded-2xl font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Email Address or Store Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. store@ecodigitech.com or 9876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none font-medium transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/pos/forgot-password"
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-bold transition-colors"
                >
                  Forgot password?
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
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-300" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-violet-600/25 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Direct Link to Admin Page Box */}
          <div className="pt-2">
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-400 font-medium">Are you a Super Admin?</span>
              </div>
              <Link
                href="/admin/login"
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-colors"
              >
                Go to Admin Login →
              </Link>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="border-t border-slate-800/60 pt-4 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              🔒 Multi-Tenant Enterprise Security Protected
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}


