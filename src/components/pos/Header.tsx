"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  ShieldCheck,
  Smartphone,
  Users,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Download,
  Zap,
  Receipt,
  Search,
  Laptop,
  CheckCircle2,
  Monitor,
  RefreshCw,
} from "lucide-react";
import { usePwaInstall } from "@/components/pwa/PwaInstallProvider";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const {
    isInstalled,
    promptInstall,
    isUpdateAvailable,
    newVersion,
    applyUpdate,
    checkForUpdates,
  } = usePwaInstall();

  const [dynamicProfile, setDynamicProfile] = useState<{
    logoUrl?: string;
    businessName?: string;
    storeSubName?: string;
    gstin?: string;
  }>({});

  const checkScrollability = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

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

  const storeName = dynamicProfile.businessName || "Ecovista Global Pvt Ltd";
  const storeBranch = dynamicProfile.storeSubName || "Allahpur Store";
  const storeGstin = dynamicProfile.gstin || "U46304PN2025PTC241116";

  useEffect(() => {
    checkScrollability();
    const el = navRef.current;
    if (!el) return;

    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => checkScrollability());
      resizeObserver.observe(el);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const handleScrollClick = (direction: "left" | "right") => {
    if (navRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      navRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      localStorage.removeItem("pos_user");
      localStorage.removeItem("pos_session");
      await fetch("/api/pos/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      window.location.href = "/pos/login";
    }
  }

  const navLinks = [
    {
      name: "POS Billing",
      shortName: "Billing",
      href: "/pos/billing",
      icon: ShoppingCart,
    },
    {
      name: "Dashboard",
      shortName: "Dashboard",
      href: "/pos/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Inventory Master",
      shortName: "Inventory",
      href: "/pos/inventory",
      icon: Boxes,
    },
    {
      name: "Warranty & Repair",
      shortName: "Repair Lab",
      href: "/pos/repairs",
      icon: ShieldCheck,
    },
    {
      name: "Used Phone Intake",
      shortName: "Intake",
      href: "/pos/intake",
      icon: Smartphone,
    },
    {
      name: "Customer Khata",
      shortName: "Khata",
      href: "/pos/customers",
      icon: Users,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 select-none shadow-xs shrink-0 print:hidden">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 sm:gap-4 md:gap-6">
        {/* Left: Official Brand Logo & Navigation Links */}
        <div className="flex items-center gap-3 md:gap-5 lg:gap-6 min-w-0 flex-1 h-14">
          {/* Official EcoDigiTech Brand Logo & Company Store Name */}
          <Link href="/pos/billing" className="flex items-center gap-2.5 lg:gap-3 shrink-0 group">
            <div className="relative flex items-center h-14">
              <Image
                src={dynamicProfile.logoUrl || "/brand/logo.png"}
                alt="EcoDigiTech Official Logo"
                width={220}
                height={70}
                className="h-10 sm:h-11 lg:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col justify-center border-l border-slate-200 pl-3 text-left">
              <span className="font-extrabold text-xs lg:text-sm tracking-tight text-slate-900 leading-none truncate max-w-[120px] md:max-w-[160px] lg:max-w-[200px]">
                {storeName}
              </span>
              <span className="text-[10px] text-fuchsia-700 font-bold tracking-wide mt-0.5 truncate">
                {storeBranch}
              </span>
            </div>
          </Link>

          {/* Horizontal Nav Bar with Auto-Hiding Scroll Arrows */}
          <div className="relative flex items-center min-w-0 flex-1 h-full px-1">
            {/* Left Scroll Arrow Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScrollClick("left")}
                aria-label="Scroll left"
                className="absolute left-0 z-20 p-1.5 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-fuchsia-700 hover:bg-fuchsia-50 rounded-full shadow-md transition-all cursor-pointer -ml-1.5 flex items-center justify-center active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <nav
              ref={navRef}
              onScroll={checkScrollability}
              className="flex items-center gap-1 min-w-0 flex-1 h-full overflow-x-auto scrollbar-none scroll-smooth px-1"
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-2 md:px-2.5 lg:px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 lg:gap-2 whitespace-nowrap border shrink-0 ${
                      isActive
                        ? "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 font-extrabold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent font-semibold"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-fuchsia-700" : "text-slate-400"}`} />
                    <span className="hidden xl:inline">{link.name}</span>
                    <span className="inline xl:hidden">{link.shortName}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Scroll Arrow Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScrollClick("right")}
                aria-label="Scroll right"
                className="absolute right-0 z-20 p-1.5 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-fuchsia-700 hover:bg-fuchsia-50 rounded-full shadow-md transition-all cursor-pointer -mr-1.5 flex items-center justify-center active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right: User Profile Pill & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 h-9">
          {isUpdateAvailable && (
            <button
              onClick={applyUpdate}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
              title={`Software Update ${newVersion} Available - Click to Update App (Data Preserved)`}
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
              <span>Update App</span>
            </button>
          )}

          {!isInstalled && (
            <button
              onClick={promptInstall}
              className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm shadow-fuchsia-500/20 active:scale-95"
              title="Install EcoDigiTech POS as Native Desktop Application"
            >
              <Download className="w-3.5 h-3.5 text-white animate-bounce shrink-0" />
              <span>Install App</span>
            </button>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-700 text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0 relative">
                RS
                {isUpdateAvailable && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full animate-ping" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[110px]">
                  Rahul Sharma
                </div>
                <div className="text-[9px] text-fuchsia-700 font-mono font-bold leading-none mt-1">
                  ● Cashier #04
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${
                  showUserDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs text-slate-900">
                <div className="p-3 bg-slate-50 rounded-xl mb-2 border border-slate-100 space-y-1.5">
                  <div className="border-b border-slate-200/80 pb-2">
                    <p className="font-extrabold text-xs text-slate-900">{storeName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{storeBranch}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: {storeGstin}</p>
                  </div>
                  <div className="pt-1">
                    <div className="text-xs font-bold text-slate-900">Rahul Sharma</div>
                    <div className="text-[11px] text-slate-500 truncate">rahul@ecodigitech.com</div>
                  </div>
                  <div className="pt-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
                      CASHIER
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      Main Counter
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  {isUpdateAvailable ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span>Update Available ({newVersion})</span>
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full border border-emerald-300">
                          Data Safe
                        </span>
                      </div>
                      <p className="text-[10.5px] text-emerald-700 leading-tight">
                        New features available. Sales &amp; inventory data remain 100% safe.
                      </p>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          applyUpdate();
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Update App Now</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        checkForUpdates();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-purple-900 hover:bg-purple-50 font-bold transition-colors text-left border border-transparent hover:border-purple-100 cursor-pointer text-xs"
                    >
                      <RefreshCw className="w-4 h-4 text-purple-600" />
                      <span>Check for Software Updates</span>
                    </button>
                  )}

                  {!isInstalled && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        promptInstall();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-fuchsia-900 hover:bg-fuchsia-50 font-bold transition-colors text-left border border-transparent hover:border-fuchsia-100 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-fuchsia-600" />
                      <span>Install Desktop App</span>
                    </button>
                  )}

                  <Link
                    href="/pos/settings/modules"
                    onClick={() => setShowUserDropdown(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-50 font-bold transition-colors text-left border border-transparent hover:border-slate-100"
                  >
                    <Settings className="w-4 h-4 text-slate-600" />
                    <span>Store &amp; Print Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left font-bold border border-transparent hover:border-rose-100 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out / End Shift</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
