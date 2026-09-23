"use client";

import { useState } from "react";
import Link from "next/link";

export default function MerchantForgotPasswordPage() {
  const [step, setStep] = useState<"REQUEST_OTP" | "RESET_PASSWORD">("REQUEST_OTP");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [error, setError] = useState("");
  const [cashierRestricted, setCashierRestricted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState("");

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCashierRestricted(false);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/pos/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "CASHIER_RESTRICTED" || res.status === 403) {
          setCashierRestricted(true);
          throw new Error(data.message || "Cashiers cannot self-reset passwords.");
        }
        throw new Error(data.error || "Failed to dispatch OTP.");
      }

      setMessage(data.message || "OTP code sent successfully.");
      if (data.debugOtp) {
        setDebugOtp(data.debugOtp);
      }
      setStep("RESET_PASSWORD");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "OTP request failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/pos/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setMessage("Password updated successfully! Redirecting to sign in...");
      setTimeout(() => {
        window.location.href = "/pos/login";
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Merchant Self-Serve Recovery</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Reset Store Owner Password via OTP Verification
          </p>
        </div>

        {cashierRestricted ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs rounded-lg space-y-2">
            <p className="font-bold flex items-center gap-1">
              ⚠️ Cashier Password Reset Policy
            </p>
            <p className="leading-relaxed">
              Cashier accounts cannot self-reset credentials from the login screen. Please ask your <strong>Merchant Store Owner</strong> to reset your password from the store staff dashboard.
            </p>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        ) : null}

        {message && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-lg text-center font-medium">
            {message}
          </div>
        )}

        {step === "REQUEST_OTP" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Store Owner Email or Mobile
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="owner@store.com or 9876543210"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-md"
            >
              {loading ? "Requesting OTP..." : "Send OTP Verification Code &rarr;"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {debugOtp && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs rounded border border-blue-200 dark:border-blue-800 font-mono text-center">
                Dev Mode OTP: <strong>{debugOtp}</strong>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-center font-mono text-lg text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                New Password (Min. 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-md"
            >
              {loading ? "Updating Password..." : "Update Password & Log In"}
            </button>
          </form>
        )}

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 text-center">
          <Link href="/pos/login" className="text-xs text-slate-600 dark:text-slate-400 hover:underline font-medium">
            &larr; Back to Counter Sign-In
          </Link>
        </div>
      </div>
    </div>
  );
}
