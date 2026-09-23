"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Wrench,
  Smartphone,
  Users,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Store,
  Receipt,
  HelpCircle,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export default function PosSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      name: "Billing Terminal",
      href: "/pos/billing",
      icon: ShoppingCart,
    },
    {
      name: "Inventory & Stock",
      href: "/pos/inventory",
      icon: Package,
    },
    {
      name: "Repair Lab",
      href: "/pos/repairs",
      icon: Wrench,
      badge: "Active",
      badgeColor: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    },
    {
      name: "Used Phone Intake",
      href: "/pos/intake",
      icon: Smartphone,
    },
    {
      name: "Customer Khata",
      href: "/pos/customers",
      icon: Users,
    },
    {
      name: "Settings & Modules",
      href: "/pos/settings/modules",
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`relative transition-all duration-300 ease-in-out flex flex-col border-r shadow-lg z-30 select-none ${
        collapsed ? "w-20" : "w-64"
      } ${
        theme === "dark"
          ? "bg-slate-900 border-slate-800 text-slate-200"
          : "bg-white border-slate-200 text-slate-700"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                EcoDigiTech
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Retail & Repair POS
              </span>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg transition-colors ${
            theme === "dark"
              ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          }`}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? theme === "dark"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
                  : theme === "dark"
                  ? "hover:bg-slate-800/80 text-slate-400 hover:text-slate-100"
                  : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive
                      ? "text-emerald-500"
                      : "text-slate-400 group-hover:text-emerald-500"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </div>

              {!collapsed && item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Controls & Mode Toggle */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
            theme === "dark"
              ? "bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
            {!collapsed && (
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            )}
          </div>
          {!collapsed && (
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {theme}
            </span>
          )}
        </button>

        {/* User / Cashier Status */}
        {!collapsed && (
          <div className="pt-2 flex items-center justify-between text-xs px-2 text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium text-slate-300">Counter #1</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">v1.0.4</span>
          </div>
        )}
      </div>
    </aside>
  );
}
