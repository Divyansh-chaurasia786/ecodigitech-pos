"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldAlert,
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Terminal,
  Zap,
  ArrowRight,
  QrCode,
  CheckCircle2,
  AlertCircle,
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

  function handleQuickAdminFill() {
    setEmail("admin@ecodigitech.com");
    setPassword("Admin123!Password");
    setError("");
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 text-white overflow-hidden p-4 sm:p-6 font-sans select-none">
      {/* Dynamic Security Ambient Glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-lg z-10 space-y-6">
        {/* Isolated Security Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 backdrop-blur-xl shadow-2xl">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest">
              Isolated Security Governance Terminal
            </span>
          </div>
        </div>

        {/* Master Admin Card */}
        <div className="bg-slate-900/85 border border-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center">
              <div className="p-2 bg-slate-950 rounded-2xl border border-slate-800 shadow-md">
                <Image
                  src="/brand/logo.png"
                  alt="EcoDigiTech POS"
                  width={170}
                  height={45}
                  className="h-9 w-auto object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Super Admin Master Console
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Multi-Tenant Tenant Provisioning, TOTP Governance &amp; Subscriptions
              </p>
            </div>
          </div>

          {/* Quick Fill Demo Helper */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200">Local Dev Master Admin?</p>
                <p className="text-[10.5px] text-slate-400 font-mono truncate">admin@ecodigitech.com</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickAdminFill}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold text-xs transition-colors shrink-0 cursor-pointer border border-slate-700 active:scale-95"
            >
              Fill Credentials
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-800/90 text-rose-200 text-xs rounded-xl font-semibold flex items-center gap-2.5 animate-in fade-in zoom-in-95 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === "CREDENTIALS" ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5 uppercase text-[10.5px] tracking-wider">
                  Master Email Address *
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
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5 uppercase text-[10.5px] tracking-wider">
                  Master Password *
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
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium transition-colors"
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
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
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
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                >
                  {loading ? "Verifying..." : "Verify & Log In"}
                </button>
              </div>
            </form>
          )}

          {/* Security Rules Footer */}
          <div className="border-t border-slate-800/80 pt-4 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
              🔒 Isolated Environment. No public password reset endpoints exist. CLI recovery: <code className="text-slate-400">scripts/reset-superadmin.ts</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

