"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"CREDENTIALS" | "TOTP">("CREDENTIALS");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-mono tracking-widest bg-red-950 text-red-400 border border-red-800 px-3 py-1 rounded-full">
            Isolated Security Terminal
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Portal</h1>
          <p className="text-xs text-slate-400">
            EcoDigiTech Multi-Tenant SaaS Master Administration
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg text-center font-mono">
            {error}
          </div>
        )}

        {step === "CREDENTIALS" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Master Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecodigitech.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Master Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-md"
            >
              {loading ? "Authenticating Master Key..." : "Authenticate & Proceed &rarr;"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleTotpSubmit} className="space-y-4">
            {isEnrollment && qrCodeUrl ? (
              <div className="text-center space-y-3 p-4 bg-slate-950 rounded-lg border border-slate-800">
                <p className="text-xs text-amber-400 font-semibold">
                  Initial TOTP Enrollment Required
                </p>
                <p className="text-xs text-slate-400">
                  Scan this QR code with Google Authenticator or 1Password:
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="TOTP Enrollment QR Code" className="w-36 h-36 mx-auto rounded border border-slate-800" />
                <p className="text-[10px] font-mono text-slate-500 break-all">
                  Secret: {secretToSave}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-300 font-semibold">Google Authenticator TOTP</p>
                <p className="text-xs text-slate-500">Enter the 6-digit verification code from your authenticator app</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 text-center">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-center font-mono text-xl tracking-widest text-emerald-400 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("CREDENTIALS")}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-lg"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-md"
              >
                {loading ? "Verifying TOTP..." : "Verify & Log In"}
              </button>
            </div>
          </form>
        )}

        <div className="border-t border-slate-800 pt-4 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            🔒 Strictly Isolated Environment. No public password reset endpoints exist. Recover access via server CLI: <code className="text-slate-400 font-mono">scripts/reset-superadmin.ts</code>
          </p>
        </div>
      </div>
    </div>
  );
}
