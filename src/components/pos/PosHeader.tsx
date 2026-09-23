"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Store, User, MapPin, FileText, LogOut, Settings } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";


interface PosHeaderProps {
  storeName?: string;
  storeBranch?: string;
  storeGstin?: string;
  managerName?: string;
  cashierName?: string;
  activeShift?: string;
}

export function PosHeader({
  storeName: propStoreName,
  storeBranch: propStoreBranch,
  storeGstin: propStoreGstin,
  managerName = "Vikram Malhotra (Store Owner)",
  cashierName = "Rahul Sharma (Cashier #04)",
  activeShift = "Morning Shift (09:00 AM - 06:00 PM)",
}: PosHeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dynamicProfile, setDynamicProfile] = useState<{
    businessName?: string;
    storeSubName?: string;
    gstin?: string;
    logoUrl?: string;
  }>({});

  useEffect(() => {
    function syncSettings() {
      try {
        const saved = localStorage.getItem("company_store_settings");
        if (saved) {
          setDynamicProfile(JSON.parse(saved));
        }
      } catch (err) {
        console.error(err);
      }
    }
    syncSettings();
    window.addEventListener("store_settings_updated", syncSettings);
    return () => window.removeEventListener("store_settings_updated", syncSettings);
  }, []);

  const storeName = dynamicProfile.businessName || propStoreName || "Ecovista Global Pvt Ltd";
  const storeBranch = dynamicProfile.storeSubName || propStoreBranch || "Prayagraj Allahpur Store";
  const storeGstin = dynamicProfile.gstin || propStoreGstin || "U46304PN2025PTC241116";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    try {
      localStorage.removeItem("pos_user");
      localStorage.removeItem("pos_session");
      await fetch("/api/pos/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Sign out request error:", err);
    } finally {
      window.location.href = "/pos/login";
    }
  }

  // Get initials for store avatar
  const initials = storeName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={`border-b px-4 py-2.5 flex items-center justify-between select-none transition-colors duration-200 ${
        theme === "dark"
          ? "bg-slate-900 border-slate-800 text-white"
          : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}
    >
      {/* LEFT: Merchant Store Branding & Branch Badge */}
      <div className="flex items-center space-x-4">
        {/* Admin Uploaded Brand Logo */}
        <Image
          src={dynamicProfile.logoUrl || "/brand/logo.png"}
          alt="EcoDigiTech Brand Logo"
          width={160}
          height={60}
          className="h-11 sm:h-12 w-auto object-contain shrink-0"
          priority
        />
        <div className="h-9 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="font-black text-base md:text-lg tracking-tight text-slate-900 dark:text-white">{storeName}</h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border hidden sm:inline-flex items-center gap-1.5 ${
                theme === "dark"
                  ? "bg-slate-800 text-emerald-400 border-slate-700"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> {storeBranch}
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-0.5">
            GSTIN: <span className="font-bold text-slate-700 dark:text-slate-200">{storeGstin}</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Store Details & Staff Profile Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          className={`flex items-center space-x-3 border px-3 py-1.5 rounded-xl transition-all ${
            theme === "dark"
              ? "bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
          }`}
        >
          <div className="text-right text-xs hidden sm:block">
            <p className="font-bold">{cashierName.split(" ")[0]}</p>
            <p className="text-[10px] text-emerald-500 font-mono font-medium">● Active Terminal</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-emerald-500/20">
            {cashierName.slice(0, 1)}
          </div>
          <span className="text-slate-400 text-xs">▼</span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-4 z-50 space-y-4 text-xs transition-all ${
              theme === "dark"
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 space-y-1">
              <p className="font-extrabold text-sm">{storeName}</p>
              <p className="text-slate-400">Branch: {storeBranch}</p>
              <p className="text-slate-400 font-mono text-[11px]">GSTIN: {storeGstin}</p>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Store Manager</span>
                <span className="font-semibold">{managerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Cashier</span>
                <span className="font-semibold text-emerald-500">{cashierName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Shift</span>
                <span className="font-mono">{activeShift}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push("/pos/settings/modules");
                }}
                className="w-full bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 font-extrabold py-2 rounded-xl text-xs transition-colors border border-fuchsia-200 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-fuchsia-700" />
                <span>Store &amp; Print Settings</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-2 rounded-xl text-xs transition-colors border border-red-500/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out / End Shift</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
