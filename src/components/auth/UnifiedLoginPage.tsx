"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  QrCode,
  CheckCircle2,
} from "lucide-react";

export function UnifiedLoginPage({ initialTab = "STORE" }: { initialTab?: "STORE" | "ADMIN" }) {
  const [activeTab, setActiveTab] = useState<"STORE" | "ADMIN">(initialTab);
  const [rememberMe, setRememberMe] = useState(true);

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
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-[#120824] via-[#241034] to-[#0c1838] text-white overflow-hidden p-4 sm:p-6 font-sans select-none">
      {/* Soft Blurred Background Ambient Orbs (Matching Reference Photo) */}
      <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-rose-600/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[450px] h-[450px] bg-purple-600/25 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="relative w-full max-w-[420px] z-10">
        <div className="relative backdrop-blur-3xl bg-white/[0.08] border border-white/[0.18] rounded-[38px] p-8 sm:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.55)] space-y-7 overflow-hidden">
          
          {/* Subtle Card Inner Top/Bottom Ambient Lighting */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-rose-500/15 via-purple-500/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/20 via-indigo-500/10 to-transparent pointer-events-none" />

          {/* ELEGANT FLOATING BRAND LOGO HEADER (Seamless, Prominent Logo) */}
          <div className="relative z-10 flex flex-col items-center space-y-2 pt-2">
            <div className="relative group flex justify-center">
              {/* Soft Ambient Radial Glow behind Logo */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/35 via-fuchsia-500/35 to-blue-500/35 rounded-full blur-2xl opacity-90 pointer-events-none" />
              
              <Image
                src="/brand/logo.png"
                alt="EcoDigiTech POS"
                width={320}
                height={85}
                className="h-16 sm:h-20 w-auto object-contain relative z-10 drop-shadow-[0_6px_20px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>
            
            <p className="text-[11px] font-bold tracking-[0.25em] text-white/80 uppercase pt-1 font-sans">
              Store Counter Terminal
            </p>
          </div>

          {/* STORE POS LOGIN FORM */}
          {activeTab === "STORE" && (
            <div className="relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {storeError && (
                <div className="p-3 bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>{storeError}</span>
                </div>
              )}

              <form onSubmit={handleStoreLogin} className="space-y-6">
                {/* Store Username / Email Underline Input */}
                <div className="relative border-b border-white/35 focus-within:border-white transition-colors py-1">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-white/80 shrink-0" />
                    <input
                      type="text"
                      required
                      placeholder="Store Username or Email"
                      value={storeIdentifier}
                      onChange={(e) => setStoreIdentifier(e.target.value)}
                      className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none font-medium py-1.5"
                    />
                  </div>
                </div>

                {/* Password Underline Input */}
                <div className="relative border-b border-white/35 focus-within:border-white transition-colors py-1">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-white/80 shrink-0" />
                    <input
                      type={showStorePassword ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={storePassword}
                      onChange={(e) => setStorePassword(e.target.value)}
                      className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none font-medium py-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStorePassword(!showStorePassword)}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer"
                    >
                      {showStorePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password Row */}
                <div className="flex items-center justify-between text-xs font-normal pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-white/80">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-white/10 border-white/30 text-indigo-500 focus:ring-0 focus:ring-offset-0 accent-indigo-500 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <Link
                    href="/pos/forgot-password"
                    className="font-bold text-violet-300 hover:text-white transition-colors hover:underline text-xs"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Glowing Multi-Color Gradient Action Button */}
                <button
                  type="submit"
                  disabled={storeLoading}
                  className="w-full bg-gradient-to-r from-[#480d2d] via-[#35104e] to-[#3a62db] hover:from-[#581138] hover:to-[#456ef0] text-white font-bold tracking-widest text-sm py-3.5 rounded-full shadow-lg transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 uppercase mt-2 border border-white/15"
                >
                  {storeLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>SIGNING IN...</span>
                    </>
                  ) : (
                    <span>LOGIN</span>
                  )}
                </button>

                {/* Clear Forgot Password Helper */}
                <div className="text-center pt-1">
                  <Link
                    href="/pos/forgot-password"
                    className="text-xs text-white/70 hover:text-white font-semibold transition-colors hover:underline inline-flex items-center gap-1"
                  >
                    <span>Forgot Password? Reset Store Account via OTP</span>
                    <span>→</span>
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* SUPER ADMIN FORM (FOR DEDICATED /admin/login ROUTE ONLY) */}
          {activeTab === "ADMIN" && (
            <div className="relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-white tracking-tight">Super Admin Terminal</h2>
              </div>

              {adminError && (
                <div className="p-3 bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              {adminStep === "CREDENTIALS" ? (
                <form onSubmit={handleAdminCredentials} className="space-y-6">
                  {/* Admin Email Underline Input */}
                  <div className="relative border-b border-white/35 focus-within:border-white transition-colors py-1">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-white/80 shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="Admin Email ID"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none font-medium py-1.5"
                      />
                    </div>
                  </div>

                  {/* Admin Password Underline Input */}
                  <div className="relative border-b border-white/35 focus-within:border-white transition-colors py-1">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-white/80 shrink-0" />
                      <input
                        type={showAdminPassword ? "text" : "password"}
                        required
                        placeholder="Admin Password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-transparent text-white placeholder-white/60 text-sm focus:outline-none font-medium py-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="text-white/70 hover:text-white transition-colors cursor-pointer"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full bg-gradient-to-r from-[#480d2d] via-[#35104e] to-[#3a62db] hover:from-[#581138] hover:to-[#456ef0] text-white font-bold tracking-widest text-sm py-3.5 rounded-full shadow-lg transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 uppercase mt-2 border border-white/15"
                  >
                    {adminLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>AUTHENTICATING...</span>
                      </>
                    ) : (
                      <span>PROCEED 2FA</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAdminTotp} className="space-y-5 text-xs">
                  {isEnrollment && qrCodeUrl ? (
                    <div className="text-center space-y-3 p-4 bg-black/40 rounded-2xl border border-white/20">
                      <div className="inline-flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                        <QrCode className="w-4 h-4" />
                        <span>Authenticator Enrollment</span>
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCodeUrl} alt="TOTP Enrollment QR Code" className="w-32 h-32 mx-auto rounded-xl border border-white/20 bg-white p-2" />
                      <p className="text-[10px] font-mono text-white/70 break-all bg-black/50 p-2 rounded-lg border border-white/10">
                        Secret: {secretToSave}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center space-y-1 p-3 bg-black/30 rounded-2xl border border-white/15">
                      <p className="text-xs text-emerald-300 font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Google Authenticator TOTP</span>
                      </p>
                      <p className="text-[11px] text-white/70">Enter 6-digit verification code</p>
                    </div>
                  )}

                  <div className="relative border-b border-white/40 py-1">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={totpToken}
                      onChange={(e) => setTotpToken(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-transparent text-center font-mono text-xl tracking-widest text-emerald-300 placeholder-white/30 focus:outline-none py-1.5"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAdminStep("CREDENTIALS")}
                      className="w-1/3 bg-white/10 hover:bg-white/20 text-white text-xs py-3 rounded-full font-bold transition-colors cursor-pointer border border-white/20"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={adminLoading}
                      className="w-2/3 bg-gradient-to-r from-[#480d2d] to-[#3a62db] text-white font-bold tracking-widest text-xs py-3 rounded-full transition-all cursor-pointer shadow-lg border border-white/15 uppercase"
                    >
                      {adminLoading ? "VERIFYING..." : "VERIFY & LOGIN"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* EcoDigiTech Brand Footer */}
          <div className="relative z-10 text-center pt-2">
            <p className="text-[10px] text-white/50 tracking-wider uppercase font-medium">
              EcoDigiTech POS Billing Software
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
