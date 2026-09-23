"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Globe, ExternalLink } from "lucide-react";

export function PosFooter() {
  const [logoUrl, setLogoUrl] = useState("/brand/logo.png");

  useEffect(() => {
    function syncSettings() {
      try {
        const saved = localStorage.getItem("company_store_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
        }
      } catch (err) {
        console.error(err);
      }
    }
    syncSettings();
    window.addEventListener("store_settings_updated", syncSettings);
    return () => window.removeEventListener("store_settings_updated", syncSettings);
  }, []);

  return (
    <footer className="bg-white/95 backdrop-blur-md border-t border-slate-200/90 text-slate-700 py-2.5 select-none mt-auto shadow-xs shrink-0 print:hidden">
      <div className="max-w-[1536px] mx-auto w-full px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* LEFT: Premium Website & Technology Branding */}
        <div className="flex items-center gap-3.5">
          <Image
            src={logoUrl}
            alt="EcoDigiTech Logo"
            width={160}
            height={160}
            className="h-14 w-auto object-contain shrink-0"
          />

          <div className="flex flex-col justify-center border-l border-slate-200 pl-3 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Powered by</span>
              <span className="text-xs font-bold bg-gradient-to-r from-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
                EcoDigiTech
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <a
                href="https://ecodigitech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-fuchsia-700 hover:text-fuchsia-900 transition-colors group"
              >
                <Globe className="w-3 h-3 text-fuchsia-600 group-hover:rotate-12 transition-transform" />
                <span>www.ecodigitech.com</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100" />
              </a>

              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-medium text-slate-500 tracking-tight hidden lg:inline">
                Strategy | Creativity | Growth
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Keyboard Hotkeys Reference Bar */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-semibold shadow-2xs">
            <kbd className="text-fuchsia-700 font-bold">[/]</kbd>
            <span>Search</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-semibold shadow-2xs">
            <kbd className="text-fuchsia-700 font-bold">[Ctrl+K]</kbd>
            <span>Cust</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-semibold shadow-2xs">
            <kbd className="text-fuchsia-700 font-bold">[F2]</kbd>
            <span>Disc</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-semibold shadow-2xs">
            <kbd className="text-fuchsia-700 font-bold">[F8]</kbd>
            <span>Cash</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-semibold shadow-2xs">
            <kbd className="text-fuchsia-700 font-bold">[F9]</kbd>
            <span>UPI</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-semibold shadow-2xs">
            <kbd className="text-fuchsia-700 font-bold">[F10]</kbd>
            <span>Credit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}



