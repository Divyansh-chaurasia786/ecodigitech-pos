'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Keyboard } from 'lucide-react';

export default function ShortcutBar() {
  const pathname = usePathname();
  if (pathname === '/' || pathname === '/login' || pathname === '/scan') return null;
  const shortcuts = [
    { key: 'F2', label: 'Tender / Pay Bill', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    { key: 'F4', label: 'Select Customer', color: 'bg-blue-50 text-blue-800 border-blue-300' },
    { key: 'F8', label: 'Quick Add Customer', color: 'bg-orange-50 text-orange-800 border-orange-300' },
    { key: 'F9 / Alt+S', label: 'Pair Phone Scanner', color: 'bg-purple-50 text-purple-800 border-purple-300' },
    { key: 'Enter', label: 'Confirm Action', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { key: 'Esc', label: 'Close / Clear Cart', color: 'bg-rose-50 text-rose-800 border-rose-300' },
  ];

  return (
    <aside aria-label="Keyboard Shortcuts" className="bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 text-xs text-slate-600 flex items-center justify-between gap-3 overflow-x-auto select-none shadow-xs">
      <div className="flex items-center gap-1.5 text-slate-700 font-bold shrink-0">
        <Keyboard className="w-4 h-4 text-orange-600" />
        <span className="text-[11px] uppercase tracking-wider text-slate-900 font-extrabold">Store Shortcuts:</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {shortcuts.map((sc, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <kbd className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border shadow-xs ${sc.color}`}>
              {sc.key}
            </kbd>
            <span className="text-[11px] text-slate-700 font-medium whitespace-nowrap">{sc.label}</span>
          </div>
        ))}
      </div>

      <div className="hidden xl:block text-[11px] text-slate-500 shrink-0 font-medium">
        <span className="font-bold text-slate-800">EcoDigiTech Retail POS</span> • Fast Keyboard Billing
      </div>
    </aside>
  );
}
