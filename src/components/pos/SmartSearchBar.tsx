"use client";

import { useState, useEffect, useRef } from "react";
import { ProductItem } from "@/types/pos";
import { Search, ScanLine } from "lucide-react";

interface SmartSearchBarProps {
  onSelectItem: (product: ProductItem) => void;
  products: ProductItem[];
}

export function SmartSearchBar({ onSelectItem, products }: SmartSearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement !== inputRef.current &&
        !(document.activeElement?.tagName === "INPUT") &&
        !(document.activeElement?.tagName === "TEXTAREA")
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter products based on search query
  const cleanQuery = query.trim().toLowerCase();
  const filteredProducts = cleanQuery
    ? products.filter((p) => {
        const matchesTitle = p.title.toLowerCase().includes(cleanQuery);
        const matchesBarcode = p.barcode?.toLowerCase().includes(cleanQuery);
        const matchesImei1 = p.imei1?.toLowerCase().includes(cleanQuery);
        const matchesImei2 = p.imei2?.toLowerCase().includes(cleanQuery);
        const matchesSerial = p.serialNumber?.toLowerCase().includes(cleanQuery);
        return matchesTitle || matchesBarcode || matchesImei1 || matchesImei2 || matchesSerial;
      })
    : [];

  useEffect(() => {
    setSelectedIndex(0);
    setIsOpen(filteredProducts.length > 0);
  }, [query, filteredProducts.length]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || filteredProducts.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        const exactMatch = products.find(
          (p) =>
            p.barcode === query.trim() ||
            p.imei1 === query.trim() ||
            p.imei2 === query.trim()
        );
        if (exactMatch) {
          e.preventDefault();
          onSelectItem(exactMatch);
          setQuery("");
          setIsOpen(false);
        }
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredProducts.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredProducts.length) % filteredProducts.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredProducts[selectedIndex];
      if (selected) {
        onSelectItem(selected);
        setQuery("");
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center space-x-1.5 text-slate-400 select-none pointer-events-none z-10">
          <Search className="w-4 h-4 text-fuchsia-600 shrink-0" />
          <ScanLine className="w-4 h-4 text-purple-600 hidden sm:inline shrink-0" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(filteredProducts.length > 0)}
          placeholder="Scan barcode gun, enter 15-digit IMEI, or search items (Press '/' to focus)..."
          className="w-full bg-white border border-slate-300 rounded-2xl pl-10 sm:pl-16 pr-16 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-fuchsia-600 focus:ring-2 focus:ring-fuchsia-500/20 transition-all shadow-xs"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1 text-xs font-bold transition-colors cursor-pointer"
            title="Clear search"
          >
            ✕
          </button>
        ) : (
          <kbd className="absolute right-3.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 rounded-lg shadow-2xs pointer-events-none">
            /
          </kbd>
        )}
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
          {filteredProducts.map((product, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={product.id}
                onClick={() => {
                  onSelectItem(product);
                  setQuery("");
                  setIsOpen(false);
                }}
                className={`px-4 py-3.5 border-b border-slate-100 cursor-pointer transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200"
                    : "hover:bg-slate-50 text-slate-800"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{product.title}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                        product.category === "BRAND_NEW"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : product.category === "REFURBISHED"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : product.category === "REPAIR_PART"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200"
                      }`}
                    >
                      {product.category}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 space-x-3 flex items-center">
                    {product.imei1 && <span>IMEI: <strong className="text-slate-800">{product.imei1}</strong></span>}
                    {product.barcode && <span>BC: <strong className="text-slate-800">{product.barcode}</strong></span>}
                    <span className="text-fuchsia-700 font-semibold">Stock: {product.stockQuantity}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-fuchsia-700 text-base">
                    ₹{product.sellingPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="block text-[10px] text-slate-400">MRP (Incl. GST)</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
