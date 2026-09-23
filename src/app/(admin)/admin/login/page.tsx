"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Store,
} from "lucide-react";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"CREDENTIALS" | "TOTP">("CREDENTIALS");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  
  const [isEnrollment, setIsEnrollment] = useState(false);
  const [secretToSave, setSecretToSave] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (data.requireEnrollment) {
        setIsEnrollment(true);
        setSecretToSave(data.secret);
        setQrCodeUrl(data.qrCodeUrl);
      }

      setStep("TOTP");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleTotpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          token: totpToken,
          secretToSave: isEnrollment ? secretToSave : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "TOTP verification failed");
      }

      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#07090e] text-slate-100 overflow-hidden p-4 sm:p-6 font-sans select-none">
      {/* Dynamic Security Ambient Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-[128px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-[128px] pointer-events-none animate-pulse delay-1000" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md z-10 space-y-6">
        
        {/* Top Switcher Bar */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl p-1.5 rounded-full shadow-2xl">
          <Link
            href="/pos/login"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all text-xs font-semibold cursor-pointer group"
          >
            <Store className="w-3.5 h-3.5 text-violet-400 group-hover:scale-110 transition-transform" />
            <span>Store POS Sign-In</span>
          </Link>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Admin Console</span>
          </div>
        </div>

        {/* Master Admin Card */}
        <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
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
                Super Admin Master Console
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Isolated 2FA Multi-Tenant Governance Terminal
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-950/90 border border-rose-800/90 text-rose-200 text-xs rounded-2xl font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "CREDENTIALS" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Master Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ecodigitech.com"
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none font-medium transition-all"
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
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Master Key...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Authenticate &amp; Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTotpSubmit} className="space-y-4 text-xs">
              {isEnrollment && qrCodeUrl ? (
                <div className="text-center space-y-3 p-4 bg-slate-950/90 rounded-2xl border border-amber-500/30">
                  <div className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <QrCode className="w-4 h-4" />
                    <span>Initial Google Authenticator Enrollment</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Scan this QR code with Google Authenticator or 1Password:
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="TOTP Enrollment QR Code" className="w-36 h-36 mx-auto rounded-xl border border-slate-800 bg-white p-2" />
                  <p className="text-[10px] font-mono text-slate-500 break-all bg-slate-900 p-2 rounded-lg border border-slate-800">
                    Secret: {secretToSave}
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-1 p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Google Authenticator TOTP</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Enter the 6-digit verification code from your authenticator app</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 text-center">
                  6-Digit Security Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center font-mono text-xl tracking-widest text-emerald-400 placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("CREDENTIALS")}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-3 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
                >
                  {loading ? "Verifying..." : "Verify & Log In"}
                </button>
              </div>
            </form>
          )}

          {/* Return to Store POS Sign-In link */}
          <div className="pt-2">
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="text-slate-400 font-medium">Not a Super Admin?</span>
              </div>
              <Link
                href="/pos/login"
                className="text-violet-400 hover:text-violet-300 font-bold hover:underline transition-colors"
              >
                Go to Store POS Login →
              </Link>
            </div>
          </div>

          {/* Security Rules Footer */}
          <div className="border-t border-slate-800/80 pt-4 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
              🔒 Isolated Admin Governance Environment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

