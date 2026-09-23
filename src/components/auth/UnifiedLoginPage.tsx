"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  KeyRound,
  QrCode,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function UnifiedLoginPage({ initialTab = "STORE" }: { initialTab?: "STORE" | "ADMIN" }) {
  const [activeTab, setActiveTab] = useState<"STORE" | "ADMIN">(initialTab);

  // --- STORE POS STATE ---
  const [storeIdentifier, setStoreIdentifier] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [showStorePassword, setShowStorePassword] = useState(false);
  const [storeError, setStoreError] = useState("");
  const [storeLoading, setStoreLoading] = useState(false);

  // --- ADMIN STATE ---
  const [adminStep, setAdminStep] = useState<"CREDENTIALS" | "TOTP">("CREDENTIALS");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [totpToken, setTotpToken] = useState("");
  const [isEnrollment, setIsEnrollment] = useState(false);
  const [secretToSave, setSecretToSave] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Handle POS Store Login
  async function handleStoreLogin(e: React.FormEvent) {
    e.preventDefault();
    setStoreError("");
    setStoreLoading(true);

    try {
      const res = await fetch("/api/pos/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: storeIdentifier, password: storePassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please check credentials.");
      }

      window.location.href = "/pos/billing";
    } catch (err: unknown) {
      setStoreError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setStoreLoading(false);
    }
  }

  // Handle Admin Step 1 (Credentials)
  async function handleAdminCredentials(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please check admin credentials.");
      }

      if (data.requireEnrollment) {
        setIsEnrollment(true);
        setSecretToSave(data.secret);
        setQrCodeUrl(data.qrCodeUrl);
      }

      setAdminStep("TOTP");
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setAdminLoading(false);
    }
  }

  // Handle Admin Step 2 (TOTP Verification)
  async function handleAdminTotp(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);

    try {
      const res = await fetch("/api/admin/auth/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          token: totpToken,
          secretToSave: isEnrollment ? secretToSave : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "TOTP verification failed.");
      }

      window.location.href = "/admin";
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setAdminLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#07090e] text-slate-100 overflow-hidden p-4 sm:p-6 lg:p-10 font-sans select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_20%_-20%,rgba(168,85,247,0.15),rgba(255,255,255,0))]" />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_80%_120%,rgba(16,185,129,0.12),rgba(255,255,255,0))]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Decorative Grid Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Main Grid Container */}
      <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        
        {/* LEFT PANEL: Modern SaaS Brand & Feature Showcase */}
        <div className="lg:col-span-6 space-y-8 text-left hidden lg:block">
          
          {/* Brand Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                Unified Cloud POS &amp; Governance Portal
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700/80 shadow-2xl">
                <Image
                  src="/brand/logo.png"
                  alt="EcoDigiTech POS"
                  width={210}
                  height={55}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Enterprise POS Billing <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                &amp; Super Admin Governance
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">
              High-speed counter billing software, repair job sheet management, and multi-tenant store provisioning platform.
            </p>
          </div>

          {/* Glass Feature Box */}
          <div className="relative p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl shadow-2xl space-y-4 overflow-hidden group">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-violet-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-extrabold text-white">Select Your Access Portal</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Single Sign-On Engine
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-violet-300 text-[11.5px]">
                  <Store className="w-3.5 h-3.5 text-violet-400" />
                  <span>Store POS Portal</span>
                </div>
                <p className="text-[10.5px] text-slate-400">Merchant owners &amp; cashiers for counter sales, billing &amp; inventory.</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-300 text-[11.5px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Super Admin Portal</span>
                </div>
                <p className="text-[10.5px] text-slate-400">Master 2FA governance terminal for platform tenant provisioning.</p>
              </div>
            </div>
          </div>

          {/* Operational Status */}
          <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-300">
              System Operational • Secure 256-bit SSL Encrypted
            </span>
          </div>

        </div>

        {/* RIGHT PANEL: Sleek Unified Sign-In Card with Role Switcher */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* SEGMENTED TAB SWITCHER */}
            <div className="p-1 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-1 text-xs font-bold select-none">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("STORE");
                  setStoreError("");
                }}
                className={`py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "STORE"
                    ? "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 text-white shadow-lg shadow-violet-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Store POS Sign-In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("ADMIN");
                  setAdminError("");
                }}
                className={`py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "ADMIN"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Super Admin</span>
              </button>
            </div>

            {/* TAB CONTENT 1: STORE POS LOGIN */}
            {activeTab === "STORE" && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Store Counter Terminal
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Sign in with your merchant owner or cashier credentials
                  </p>
                </div>

                {storeError && (
                  <div className="p-3.5 bg-rose-950/90 border border-rose-800/90 text-rose-200 text-xs rounded-2xl font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{storeError}</span>
                  </div>
                )}

                <form onSubmit={handleStoreLogin} className="space-y-4">
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
                        value={storeIdentifier}
                        onChange={(e) => setStoreIdentifier(e.target.value)}
                        className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none font-medium transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Terminal Password
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
                        type={showStorePassword ? "text" : "password"}
                        required
                        placeholder="••••••••••••"
                        value={storePassword}
                        onChange={(e) => setStorePassword(e.target.value)}
                        className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStorePassword(!showStorePassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showStorePassword ? <EyeOff className="w-4 h-4 text-slate-300" /> : <Eye className="w-4 h-4 text-slate-500" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={storeLoading}
                    className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-violet-600/25 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                  >
                    {storeLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating Terminal...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Counter Terminal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT 2: SUPER ADMIN LOGIN */}
            {activeTab === "ADMIN" && (
              <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Super Admin Master Console
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Isolated 2FA Multi-Tenant Governance Terminal
                  </p>
                </div>

                {adminError && (
                  <div className="p-3.5 bg-rose-950/90 border border-rose-800/90 text-rose-200 text-xs rounded-2xl font-semibold flex items-center gap-2.5 font-mono">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {adminStep === "CREDENTIALS" ? (
                  <form onSubmit={handleAdminCredentials} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Master Admin Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@ecodigitech.com"
                          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none font-medium transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Master Admin Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showAdminPassword ? "text" : "password"}
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none font-medium transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={adminLoading}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/25 transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                    >
                      {adminLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Authenticating Master Key...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Authenticate &amp; Proceed 2FA</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAdminTotp} className="space-y-4 text-xs">
                    {isEnrollment && qrCodeUrl ? (
                      <div className="text-center space-y-3 p-4 bg-slate-950/90 rounded-2xl border border-amber-500/30">
                        <div className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                          <QrCode className="w-4 h-4" />
                          <span>Initial Authenticator Enrollment</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Scan QR code with Google Authenticator:
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
                        onClick={() => setAdminStep("CREDENTIALS")}
                        className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-3 rounded-xl font-bold transition-colors cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={adminLoading}
                        className="w-2/3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
                      >
                        {adminLoading ? "Verifying..." : "Verify & Log In"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Footer Security Note */}
            <div className="border-t border-slate-800/60 pt-4 text-center">
              <p className="text-[11px] text-slate-500 font-medium">
                🔒 EcoDigiTech Unified Multi-Tenant Security System
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
