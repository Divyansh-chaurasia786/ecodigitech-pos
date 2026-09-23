"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, KeyRound, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

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
        window.location.href = "/login";
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#120824] via-[#241034] to-[#0c1838] text-white overflow-hidden p-4 sm:p-6 font-sans select-none">
      {/* Background Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-rose-600/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-[420px] z-10">
        <div className="relative backdrop-blur-3xl bg-white/[0.08] border border-white/[0.18] rounded-[38px] p-8 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.55)] space-y-6 overflow-hidden">
          
          {/* Header Logo */}
          <div className="relative z-10 flex flex-col items-center space-y-2 pt-1">
            <div className="relative group flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/35 via-fuchsia-500/35 to-blue-500/35 rounded-full blur-2xl opacity-90 pointer-events-none" />
              <Image
                src="/brand/logo.png"
                alt="EcoDigiTech POS"
                width={280}
                height={75}
                className="h-14 sm:h-16 w-auto object-contain relative z-10 drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>
            <p className="text-[11px] font-bold tracking-[0.22em] text-white/80 uppercase pt-1 font-sans">
              Password Recovery
            </p>
          </div>

          {/* Feedback Banners */}
          {cashierRestricted ? (
            <div className="p-3 bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs rounded-xl space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-300">
                ⚠️ Cashier Reset Policy
              </p>
              <p className="text-[11px] leading-relaxed text-white/80">
                Cashiers cannot self-reset credentials. Please ask your <strong>Store Owner</strong> to update your password in staff settings.
              </p>
            </div>
          ) : error ? (
            <div className="p-3 bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {message && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {step === "REQUEST_OTP" ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="relative border-b border-white/35 focus-within:border-white transition-colors py-1">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white/80 shrink-0" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Store Owner Email or Mobile"
                    className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none font-medium py-1.5"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#480d2d] via-[#35104e] to-[#3a62db] hover:from-[#581138] hover:to-[#456ef0] text-white font-bold tracking-widest text-xs py-3.5 rounded-full shadow-lg transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 uppercase border border-white/15"
              >
                {loading ? "SENDING OTP..." : "SEND OTP CODE"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {debugOtp && (
                <div className="p-2 bg-black/40 text-emerald-300 text-xs rounded-xl border border-white/15 font-mono text-center">
                  Dev Mode OTP: <strong>{debugOtp}</strong>
                </div>
              )}

              <div className="relative border-b border-white/35 focus-within:border-white transition-colors py-1">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-white/80 shrink-0" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-Digit OTP"
                    className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none font-mono tracking-widest py-1.5 text-center"
                  />
                </div>
              </div>

              <div className="relative border-b border-white/35 focus-within:border-white transition-colors py-1">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-white/80 shrink-0" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password (Min 8 chars)"
                    className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none font-medium py-1.5"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#480d2d] via-[#35104e] to-[#3a62db] hover:from-[#581138] hover:to-[#456ef0] text-white font-bold tracking-widest text-xs py-3.5 rounded-full shadow-lg transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 uppercase border border-white/15"
              >
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-white/70 hover:text-white font-semibold transition-colors hover:underline inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
