"use client";

import React, { useState, useEffect } from "react";
import { Store, Clock, Wifi, MapPin } from "lucide-react";

interface StoreStripProps {
  storeName?: string;
  storeCode?: string;
  cashierName?: string;
}

export function StoreStrip({
  storeName: propStoreName,
  storeCode = "ECO-01",
  cashierName = "Rahul Sharma",
}: StoreStripProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [dynamicProfile, setDynamicProfile] = useState<{
    businessName?: string;
    storeSubName?: string;
    gstin?: string;
  }>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("company_store_settings");
      if (saved) {
        setDynamicProfile(JSON.parse(saved));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const displayStoreName = dynamicProfile.businessName || propStoreName || "Ecovista Global Pvt Ltd";
  const displayBranch = dynamicProfile.storeSubName || "Prayagraj Allahpur Store";
  const displayGstin = dynamicProfile.gstin || "U46304PN2025PTC241116";

  useEffect(() => {
    setCurrentTime(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-100/90 border-b border-slate-200 text-slate-700 select-none backdrop-blur-md">
      <div className="max-w-[1536px] mx-auto px-4 py-1.5 flex items-center justify-between text-xs">
        {/* Left: Store info & Branch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-fuchsia-700" />
            <span className="font-extrabold text-slate-900 text-xs tracking-tight">{displayStoreName}</span>
            <span className="px-1.5 py-0.5 rounded bg-fuchsia-50 text-fuchsia-800 text-[10px] font-mono font-bold border border-fuchsia-200">
              {storeCode}
            </span>
          </div>
          <span className="text-slate-300 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1.5 text-slate-500 text-[11px]">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{displayBranch}</span>
            <span className="text-slate-400 font-mono text-[10px]">(GSTIN: {displayGstin})</span>
          </div>
        </div>

        {/* Right: Operator, Live Clock & Status */}
        <div className="flex items-center gap-4 text-slate-600 text-[11px]">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
            <span>Operator:</span>
            <span className="text-slate-900 font-bold">{cashierName}</span>
          </div>

          <div className="flex items-center gap-1 text-fuchsia-800 font-mono font-semibold bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 rounded-full text-[10px]">
            <Wifi className="w-3 h-3 animate-pulse text-fuchsia-600" />
            <span>CLOUD SYNC ACTIVE</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-fuchsia-800 font-bold">{currentTime || "09:00:00 AM"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
