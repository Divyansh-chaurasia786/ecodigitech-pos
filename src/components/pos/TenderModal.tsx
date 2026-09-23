"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  BookOpen,
  Check,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface TenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  customer?: any;
  onConfirmTender: (paymentData: {
    paymentMode: string;
    paidAmount: number;
    paymentRef?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) => void;
}

export default function TenderModal({
  isOpen,
  onClose,
  grandTotal,
  customer,
  onConfirmTender,
}: TenderModalProps) {
  const [paymentMode, setPaymentMode] = useState<string>("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCashReceived(grandTotal.toString());
      setPaidAmount(grandTotal.toString());
      setPaymentRef("");
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, grandTotal]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cashVal = parseFloat(cashReceived) || 0;
  const changeToReturn = Math.max(0, cashVal - grandTotal);
  const paidVal = parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - paidVal);

  const handleSubmit = () => {
    onConfirmTender({
      paymentMode,
      paidAmount: paymentMode === "CASH" ? cashVal : paidVal,
      paymentRef: paymentRef.trim() || undefined,
    });
  };

  const paymentModes = [
    { id: "CASH", label: "Cash", icon: Banknote },
    { id: "UPI", label: "UPI QR", icon: QrCode },
    { id: "CARD", label: "Card / POS", icon: CreditCard },
    { id: "UDHAAR", label: "Udhaar / Credit", icon: BookOpen },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Tender Checkout
            </span>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-1.5 font-mono">
              ₹{grandTotal.toLocaleString("en-IN")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 border-b border-slate-200">
          {paymentModes.map((m) => {
            const Icon = m.icon;
            const isSelected = paymentMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setPaymentMode(m.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mode Specific Controls */}
        <div className="p-5 space-y-4">
          {paymentMode === "CASH" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cash Received from Customer (₹)
                </label>
                <input
                  ref={inputRef}
                  type="number"
                  step="any"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-fuchsia-600 rounded-xl p-3 text-2xl font-mono font-bold text-slate-900 text-center focus:outline-none focus:bg-white transition-all"
                />
              </div>

              {changeToReturn > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-emerald-900 uppercase">
                    Change to Return:
                  </span>
                  <span className="text-xl font-black font-mono text-emerald-700">
                    ₹ {changeToReturn.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentMode === "UPI" && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center">
                <QrCode className="w-10 h-10 text-fuchsia-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  Scan Dynamic NPCI QR Code on counter screen for ₹{grandTotal.toLocaleString("en-IN")}.
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  UPI UTR / Reference No. (Optional)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. 42659018274"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-fuchsia-600"
                />
              </div>
            </div>
          )}

          {paymentMode === "CARD" && (
            <div className="space-y-3">
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <CreditCard className="w-8 h-8 text-fuchsia-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Swipe or Tap customer card on POS terminal for ₹{grandTotal.toLocaleString("en-IN")}.
                </p>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Card Approval Code (Optional)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. TXN-984321"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-fuchsia-600"
                />
              </div>
            </div>
          )}

          {paymentMode === "UDHAAR" && (
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount Paid Now (Cash / Online) (₹)
                </label>
                <input
                  ref={inputRef}
                  type="number"
                  step="any"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-fuchsia-600"
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-600 font-medium">Remaining Khata Balance Due:</span>
                <span className="text-base font-black font-mono text-red-600">
                  ₹ {dueAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel [Esc]
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold text-xs transition-all shadow-md shadow-fuchsia-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Print Bill [Enter]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
