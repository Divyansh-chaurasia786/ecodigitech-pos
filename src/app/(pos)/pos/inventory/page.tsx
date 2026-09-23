"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  AlertTriangle,
  Barcode,
  Tag,
  Layers,
  TrendingUp,
  RefreshCw,
  Smartphone,
  Wrench,
  CheckCircle2,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface InventoryItem {
  id: string;
  category: string;
  title: string;
  barcode?: string;
  imei1?: string;
  serialNumber?: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  hsnSacCode: string;
  gstRate: number;
  updatedAt: string;
}

export interface CustomCategory {
  val: string;
  label: string;
  isCustom?: boolean;
}

const DEFAULT_CATEGORIES: CustomCategory[] = [
  { val: "BRAND_NEW", label: "Brand New Phones" },
  { val: "REFURBISHED", label: "Refurbished (Sec 15(5))" },
  { val: "ACCESSORY", label: "Accessories" },
  { val: "REPAIR_PART", label: "Repair Parts" },
];

export default function InventoryPage() {
  const { theme } = useTheme();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [highlightLowStock, setHighlightLowStock] = useState(false);

  // DYNAMIC CATEGORIES (Loaded from localStorage)
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(DEFAULT_CATEGORIES);

  const fetchInventory = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/pos/inventory?search=${encodeURIComponent(
          search
        )}&category=${encodeURIComponent(selectedCategory)}`
      );
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Load Custom Categories / Inventory Sections from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("company_inventory_categories");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomCategories(parsed);
        }
      }
    } catch (err) {
      console.error("Failed loading inventory categories", err);
    }
  }, []);

  function getCategoryLabel(val: string) {
    const match = customCategories.find((c) => c.val === val);
    if (match) return match.label;
    return val.replace(/_/g, " ");
  }

  // Temporary 2.5-second red flash for low stock items on KPI click
  function handleTriggerLowStockFlash() {
    setHighlightLowStock(true);
    setTimeout(() => {
      setHighlightLowStock(false);
    }, 2500);
  }

  // Stats Calculations
  const totalSKUs = items.length;
  const totalStockValue = items.reduce(
    (acc, item) => acc + item.sellingPrice * item.stockQuantity,
    0
  );
  const lowStockCount = items.filter((item) => item.stockQuantity <= 2).length;

  return (
    <div className="flex-1 min-h-0 flex flex-col font-sans text-slate-900 overflow-y-auto space-y-4 pb-6 select-none pr-1">
      {/* 1. Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Inventory &amp; Stock Master Catalog</h1>
            <p className="text-xs text-slate-500 font-medium">
              Store Read-Only View • Intake devices require Admin approval before listing in active stock
            </p>
          </div>
        </div>

        {/* Read-Only Status Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 select-none shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Store Read-Only Mode (Managed via Admin)</span>
          </span>
        </div>
      </div>

      {/* Admin Approval Requirement Info Alert Banner */}
      <div className="bg-purple-50/80 border border-purple-200 p-3 rounded-2xl text-purple-950 flex items-center justify-between gap-3 text-xs font-medium shadow-2xs shrink-0">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
          <span>
            <strong>Store Workflow Notice:</strong> Mobile intakes completed on the Used Phone Intake page are sent to the <strong>Admin Verification Queue</strong>. Devices will appear in this active inventory catalog only after Admin approval.
          </span>
        </div>
      </div>

      {/* 2. KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-fuchsia-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Total catalog SKUs</span>
            <div className="p-2 rounded-xl bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">{totalSKUs} SKUs</div>
          <span className="text-xs text-fuchsia-700 font-bold inline-block">● Active Verified Inventory</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-fuchsia-300 transition-all space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Inventory valuation</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{totalStockValue.toLocaleString("en-IN")}
          </div>
          <span className="text-xs text-slate-500 font-medium inline-block">Retail Value (Incl. Tax)</span>
        </div>

        <div
          className={`border rounded-2xl p-4 shadow-2xs transition-all space-y-2 select-none ${
            highlightLowStock
              ? "bg-rose-50 border-2 border-rose-500 ring-4 ring-rose-200/60 shadow-md"
              : "bg-white border-slate-200 hover:border-rose-400 hover:shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className={`text-xs font-bold text-slate-700 ${highlightLowStock ? "text-rose-950 font-black" : ""}`}>
              Low stock warnings
            </span>
            <div
              className={`p-2 rounded-xl border transition-colors ${
                highlightLowStock ? "bg-rose-600 text-white border-rose-700 animate-pulse" : "bg-rose-50 text-rose-600 border-rose-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-black font-mono ${highlightLowStock ? "text-rose-700 text-3xl font-extrabold" : "text-rose-600"}`}>
            {lowStockCount} Items
          </div>
          <div className="pt-1">
            <span className="text-xs text-rose-700 font-bold">
              {lowStockCount > 0 ? "Requires Immediate Reorder" : "All Stock Levels Healthy"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Category Filter Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Title, Barcode, or IMEI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fuchsia-600 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={fetchInventory}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-fuchsia-800 transition-colors cursor-pointer shrink-0"
              title="Refresh Inventory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-fuchsia-700" : ""}`} />
            </button>
          </div>

          {/* Low Stock Highlight Button */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleTriggerLowStockFlash}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                highlightLowStock
                  ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Highlight Low Stock Red</span>
            </button>
          </div>
        </div>

        {/* Dynamic Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white shadow-2xs"
                : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Catalog</span>
          </button>

          {customCategories.map((cat) => {
            const isSelected = selectedCategory === cat.val;
            return (
              <button
                key={cat.val}
                onClick={() => setSelectedCategory(cat.val)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white shadow-2xs"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Products Catalog Table (Strictly Read-Only) */}
      <div className="flex-1 min-h-0 overflow-y-auto max-h-[calc(100vh-320px)] pr-1 scrollbar-thin">
        {loading ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <div className="inline-flex items-center gap-2 text-xs font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-fuchsia-600" />
              <span>Loading inventory product catalog...</span>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 space-y-1">
            <Package className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-xs text-slate-700">No products found in catalog.</p>
            <p className="text-[11px] text-slate-400">Try adjusting search term or category filter.</p>
          </div>
        ) : (
          /* COMPACT READ-ONLY DATA TABLE VIEW */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-black uppercase tracking-wider border-b border-slate-200 bg-slate-50/80 text-slate-500">
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Barcode / IMEI</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-center">Stock Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {items.map((item) => {
                    const isLowStock = item.stockQuantity <= 2;
                    const isFlashedRed = highlightLowStock && isLowStock;

                    return (
                      <tr
                        key={item.id}
                        className={`transition-all duration-300 ${
                          isFlashedRed
                            ? "bg-rose-100/90 border-l-4 border-l-rose-600 border-y border-rose-300 shadow-sm animate-pulse"
                            : "hover:bg-fuchsia-50/30"
                        }`}
                      >
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 font-sans text-xs truncate">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                            <span>HSN: {item.hsnSacCode}</span>
                            <span>GST: {item.gstRate}%</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              item.category === "BRAND_NEW"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : item.category === "REFURBISHED"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : item.category === "ACCESSORY"
                                ? "bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {getCategoryLabel(item.category)}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {item.barcode && (
                            <div className="flex items-center gap-1 font-bold">
                              <Barcode className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.barcode}</span>
                            </div>
                          )}
                          {item.imei1 && (
                            <div className="text-[10px] text-purple-700 font-bold">IMEI: {item.imei1}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="font-black text-fuchsia-800 text-xs">
                            ₹{item.sellingPrice.toLocaleString("en-IN")}
                          </div>
                          {item.purchasePrice > 0 && (
                            <div className="text-[9px] text-slate-400">
                              Buy: ₹{item.purchasePrice.toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`font-black px-2.5 py-1 rounded-lg text-xs transition-colors ${
                              isFlashedRed
                                ? "bg-rose-600 text-white font-extrabold border border-rose-700 shadow-xs"
                                : isLowStock
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-slate-100 text-slate-900 border border-slate-200"
                            }`}
                          >
                            {item.stockQuantity} Units
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
