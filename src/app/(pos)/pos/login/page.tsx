"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, KeyRound, ArrowRight } from "lucide-react";

export default function POSLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        throw new Error(data.error || "Login failed");
      }

      router.push("/pos/billing");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 select-none">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center">
            <Image
              src="/brand/logo.png"
              alt="EcoDigiTech POS"
              width={160}
              height={45}
              className="h-9 w-auto object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Store Counter Terminal Sign-In</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Access Multi-Tenant POS, Inventory & Khata Ledger
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Address or Phone Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. owner@store.com or 9876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">Account Password *</label>
              <Link
                href="/pos/forgot-password"
                className="text-[11px] text-fuchsia-700 hover:text-fuchsia-900 font-extrabold"
              >
                Owner Self-Reset OTP?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:border-fuchsia-600 focus:outline-none font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black py-3 rounded-xl text-xs sm:text-sm shadow-md shadow-fuchsia-500/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{loading ? "Signing in..." : "Launch Counter Terminal"}</span>
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Cashier credential resets are strictly restricted to Merchant Owners.
          </p>
        </div>
      </div>
    </div>
  );
}
