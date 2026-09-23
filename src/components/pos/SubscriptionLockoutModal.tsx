"use client";

import { useState } from "react";

interface SubscriptionLockoutModalProps {
  isLocked: boolean;
  validTill: Date | string;
  message?: string;
  onRenewSuccess?: () => void;
}

export function SubscriptionLockoutModal({
  isLocked,
  validTill,
  message,
  onRenewSuccess,
}: SubscriptionLockoutModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!isLocked) return null;

  const validTillDate = typeof validTill === "string" ? new Date(validTill) : validTill;

  async function handleCheckout(planType: "6_MONTH" | "1_YEAR") {
    setError("");
    setLoadingPlan(planType);

    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize checkout.");
      }

      // Check if Razorpay JS SDK is loaded
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "EcoDigiTech POS Subscription",
          description: `${planType === "1_YEAR" ? "1-Year" : "6-Month"} Prepaid Renewal`,
          order_id: data.orderId,
          handler: function () {
            alert("Payment successful! Your store subscription has been renewed.");
            if (onRenewSuccess) onRenewSuccess();
            window.location.reload();
          },
          theme: {
            color: "#00b894",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        alert(
          `Razorpay Checkout Initialized. Order ID: ${data.orderId}. Please complete payment in standard environment.`
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Checkout error.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-red-800 rounded-2xl shadow-2xl p-8 space-y-6 text-center">
        <div className="space-y-2">
          <span className="text-3xl">🔒</span>
          <span className="text-xs uppercase font-mono font-bold tracking-widest bg-red-950 text-red-400 border border-red-800 px-3 py-1 rounded-full block w-max mx-auto">
            SUBSCRIPTION_LOCKED (HTTP 403)
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Store Write Lockout Active
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {message ||
              `Your 30-day trial and 3-day grace period expired on ${validTillDate.toLocaleDateString()}. Store write access (invoice creation, counter checkout) is locked until subscription renewal.`}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg font-mono">
            {error}
          </div>
        )}

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left space-y-1 text-xs text-slate-400">
          <p className="font-bold text-slate-200">📖 Historical Data Access (Read-Only):</p>
          <p>
            Historical invoices, customer ledgers, and repair job sheets remain completely accessible in read-only mode.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Select Renewal Plan to Unlock Store Instantly:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCheckout("6_MONTH")}
              disabled={loadingPlan !== null}
              className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 rounded-xl text-left transition-all space-y-1"
            >
              <p className="text-xs font-bold text-white">6-Month Plan</p>
              <p className="text-lg font-extrabold text-emerald-400 font-mono">₹4,999</p>
              <p className="text-[10px] text-slate-400">180 Days Unlimited POS</p>
              {loadingPlan === "6_MONTH" && (
                <span className="text-[10px] text-emerald-400 block font-bold">Initializing...</span>
              )}
            </button>

            <button
              onClick={() => handleCheckout("1_YEAR")}
              disabled={loadingPlan !== null}
              className="p-4 bg-emerald-950 hover:bg-emerald-900 border-2 border-emerald-500 rounded-xl text-left transition-all space-y-1 relative"
            >
              <span className="absolute top-2 right-2 text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                Save 25%
              </span>
              <p className="text-xs font-bold text-white">1-Year Plan</p>
              <p className="text-lg font-extrabold text-emerald-400 font-mono">₹8,999</p>
              <p className="text-[10px] text-slate-300">365 Days Unlimited POS</p>
              {loadingPlan === "1_YEAR" && (
                <span className="text-[10px] text-emerald-400 block font-bold">Initializing...</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
