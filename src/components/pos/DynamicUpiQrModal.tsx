"use client";

import { QRCodeSVG } from "qrcode.react";
import { QrCode, CheckCircle2, ShieldCheck, X, Sparkles } from "lucide-react";

interface DynamicUpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  grandTotal: number;
  invoiceNumber: string;
  merchantName?: string;
  upiVpa?: string;
}

export function DynamicUpiQrModal({
  isOpen,
  onClose,
  onConfirmPayment,
  grandTotal,
  invoiceNumber,
  merchantName = "EcoDigiTech Mobile Hub",
  upiVpa = "ecodigitech@upi",
}: DynamicUpiQrModalProps) {
  if (!isOpen) return null;

  const encodedMerchantName = encodeURIComponent(merchantName);
  const upiPayload = `upi://pay?pa=${upiVpa}&pn=${encodedMerchantName}&am=${grandTotal.toFixed(2)}&tr=${invoiceNumber}&cu=INR`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-md p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Liquid Ambient Light Spheres */}
      <div className="relative w-full max-w-sm sm:max-w-md flex items-center justify-center">
        <div className="absolute -top-12 -left-10 w-52 h-52 bg-fuchsia-500/35 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -right-10 w-52 h-52 bg-cyan-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        {/* Liquid Water-Glass Transparent Card - Responsive scaling with ZERO visible scrollbar */}
        <div className="relative w-full bg-white/[0.14] backdrop-blur-3xl border border-white/35 ring-1 ring-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),_inset_0_1px_2px_rgba(255,255,255,0.7),_inset_0_-1px_1px_rgba(255,255,255,0.15)] rounded-[28px] sm:rounded-[36px] p-4 sm:p-5 md:p-6 text-center space-y-3.5 sm:space-y-4 md:space-y-5 select-none overflow-y-auto max-h-[94vh] scrollbar-none text-white">
          {/* Top Specular Edge Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
          
          {/* Subtle Sheen Gradient overlay */}
          <div className="absolute -inset-full top-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

          {/* Header - iOS Liquid Header */}
          <div className="relative flex items-center justify-between border-b border-white/15 pb-2.5 sm:pb-3.5">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-xl border border-white/40 shadow-inner text-white">
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-200" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-white text-xs sm:text-sm md:text-base leading-tight flex items-center gap-1.5 tracking-tight drop-shadow">
                  <span>Instant UPI QR</span>
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-300 animate-spin-slow" />
                </h3>
                <p className="text-[10px] sm:text-[11px] text-white/80 font-medium leading-tight drop-shadow-xs">
                  Scan with GPay, PhonePe, Paytm, BHIM
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/75 hover:text-white font-bold p-1 sm:p-1.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 transition-all cursor-pointer active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Amount & Reference Details - Floating Liquid Text */}
          <div className="relative space-y-0.5 sm:space-y-1 py-0.5">
            <p className="text-[9px] sm:text-[10px] text-white/75 font-bold uppercase tracking-widest drop-shadow-xs">
              Total Amount Payable
            </p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-100 to-white drop-shadow-[0_2px_10px_rgba(236,72,153,0.3)] font-mono">
              ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] sm:text-xs font-mono text-white/80 drop-shadow-xs">
              Ref: <strong className="text-white font-bold tracking-wide">{invoiceNumber}</strong>
            </p>
          </div>

          {/* Crisp Scannable Floating QR Card Tile - Dynamically Sized */}
          <div className="relative flex flex-col items-center justify-center space-y-2.5 sm:space-y-3">
            <div className="p-2.5 sm:p-3 md:p-3.5 bg-white/95 backdrop-blur-3xl rounded-2xl sm:rounded-3xl border border-white/80 shadow-[0_15px_35px_rgba(0,0,0,0.25),_inset_0_1px_2px_rgba(255,255,255,0.9)]">
              <QRCodeSVG
                value={upiPayload}
                size={180}
                level="H"
                includeMargin={false}
                className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-lg sm:rounded-xl"
              />
            </div>

            {/* Liquid Glass Pill VPA */}
            <div className="inline-flex items-center space-x-1.5 bg-white/15 hover:bg-white/20 backdrop-blur-2xl border border-white/35 text-white px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-semibold shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-all">
              <ShieldCheck className="w-3.5 h-3.5 text-fuchsia-300 shrink-0" />
              <span>VPA: {upiVpa}</span>
            </div>
          </div>

          {/* Liquid Action Buttons */}
          <div className="relative space-y-2 sm:space-y-2.5 pt-0.5 sm:pt-1">
            <button
              onClick={onConfirmPayment}
              className="w-full bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90 hover:from-fuchsia-500 hover:to-purple-500 text-white font-black py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm border border-white/30 shadow-[0_8px_25px_rgba(217,70,239,0.35)] backdrop-blur-xl transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Payment Received &amp; Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-2xl text-white/90 hover:text-white font-bold border border-white/25 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              Cancel / Change Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
