"use client";

import Link from "next/link";
import Image from "next/image";
import { Store, ArrowRight, RefreshCw } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#07090e] text-slate-100 p-4 sm:p-6 font-sans select-none">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10 space-y-6 text-center">
        {/* Brand Header */}
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

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono font-bold">
              ERROR 404 • ROUTE NOT FOUND
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight pt-2">
              Page Not Found
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              The requested page route does not exist or has been updated in the latest release.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login"
              className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg shadow-violet-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Go to Sign-In Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload App (Ctrl + R)</span>
            </button>
          </div>

          <div className="border-t border-slate-800/60 pt-4 text-[11px] text-slate-500 font-medium">
            🔒 EcoDigiTech POS • Single Sign-On Engine
          </div>
        </div>
      </div>
    </div>
  );
}
