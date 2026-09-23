"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Phone,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: any) => void;
}

export default function CustomerAuthModal({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerAuthModalProps) {
  const [step, setStep] = useState<"PHONE" | "OTP" | "REGISTER">("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [existingCustomer, setExistingCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [regForm, setRegForm] = useState({
    name: "",
    aadhaar: "",
    pan: "",
    email: "",
    address: "",
    hasGst: false,
    gstin: "",
  });

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep("PHONE");
      setPhone("");
      setOtp("");
      setErrorMessage("");
      setExistingCustomer(null);
      setTimeout(() => phoneInputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/customers?q=${cleanPhone}`);
      const data = await res.json();

      const matched = data.customers?.find(
        (c: any) => c.phone?.replace(/\D/g, "") === cleanPhone
      );

      if (matched) {
        setExistingCustomer(matched);
        onSelectCustomer(matched);
        onClose();
      } else {
        setStep("REGISTER");
      }
    } catch {
      setStep("REGISTER");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name.trim()) {
      setErrorMessage("Customer name is required.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regForm.name.trim(),
          phone: phone.trim(),
          email: regForm.email.trim() || undefined,
          address: regForm.address.trim() || undefined,
          aadhaarNumber: regForm.aadhaar.trim() || undefined,
          gstin: regForm.hasGst ? regForm.gstin.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.success || data.customer) {
        const newCust = data.customer || {
          name: regForm.name.trim(),
          phone: phone.trim(),
        };
        onSelectCustomer(newCust);
        onClose();
      } else {
        const newCust = { name: regForm.name.trim(), phone: phone.trim() };
        onSelectCustomer(newCust);
        onClose();
      }
    } catch {
      const newCust = { name: regForm.name.trim(), phone: phone.trim() };
      onSelectCustomer(newCust);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Customer Verification & Attach</h3>
              <p className="text-[11px] text-slate-400">Mobile lookup & GST B2B invoice binding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: Mobile Phone Lookup */}
        {step === "PHONE" && (
          <form onSubmit={handlePhoneCheck} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 tracking-wide">
                Customer Mobile Number *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-slate-400">+91</span>
                <input
                  ref={phoneInputRef}
                  type="text"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-slate-50 border border-slate-300 focus:border-fuchsia-600 focus:bg-white rounded-2xl pl-12 pr-4 py-3 font-mono font-bold text-lg text-slate-900 transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phone.length < 10}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-fuchsia-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? "Searching..." : "Lookup & Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 3: New Customer Registration Form */}
        {step === "REGISTER" && (
          <form onSubmit={handleRegisterNewCustomer} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between p-2.5 bg-fuchsia-50 border border-fuchsia-200 rounded-xl text-xs text-fuchsia-900">
              <span className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-fuchsia-600" />
                <span>Mobile: <strong>+91 {phone}</strong></span>
              </span>
              <span className="text-[10px] uppercase font-bold text-fuchsia-700">New Customer</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                Customer Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar Verma"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-fuchsia-600 focus:bg-white rounded-xl p-2.5 text-xs text-slate-900 font-semibold outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                Aadhaar Number (Optional)
              </label>
              <input
                type="text"
                maxLength={12}
                placeholder="XXXX XXXX XXXX"
                value={regForm.aadhaar}
                onChange={(e) => setRegForm({ ...regForm, aadhaar: e.target.value.replace(/\D/g, "") })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-fuchsia-600 focus:bg-white rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 tracking-wider outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                City / Street Address
              </label>
              <input
                type="text"
                placeholder="Connaught Place, New Delhi"
                value={regForm.address}
                onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 focus:border-fuchsia-600 focus:bg-white rounded-xl p-2.5 text-xs text-slate-900 outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-fuchsia-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? "Saving..." : "Save & Attach to Bill"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
