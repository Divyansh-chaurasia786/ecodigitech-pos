"use client";

import { useState, useEffect } from "react";
import { Settings, Sliders, ShieldCheck, Check, Save, Plus, Trash2, RotateCcw, FileText } from "lucide-react";

const DEFAULT_INTAKE_TERMS = [
  "Seller confirms sole legal ownership of device & IMEI. Device is free from liens, bank EMIs, or law enforcement tracking.",
  "Ownership is irrevocably transferred to store upon receipt of agreed payment amount.",
  "If device is reported stolen, fake, or involved in fraud, seller assumes full criminal responsibility and financial penalty.",
  "Seller certifies that all personal data, cloud accounts (iCloud / Google / Mi account), and security locks have been wiped.",
  "Transactions once signed and settled cannot be revoked or returned."
];

export default function ModuleSettingsPage() {
  const [isOwner, setIsOwner] = useState(true);
  const [storeProfile, setStoreProfile] = useState({
    businessName: "EcoFone Mobile Store",
    storeSubName: "Main Branch",
    storeAddress: "123 Market Street, Commercial Hub",
    storePhone: "+91 98765 43210",
    gstin: "07AAAAA0000A1Z5",
    placeOfSupply: "Delhi (07)",
    invoicePrefix: "INV/2026/",
    invoiceNextNumber: 1,
    defaultPrintMode: "A4_GST" as "A4_GST" | "THERMAL_80MM",
  });

  const [intakeTerms, setIntakeTerms] = useState<string[]>(DEFAULT_INTAKE_TERMS);
  const [newTermInput, setNewTermInput] = useState("");

  const [modules, setModules] = useState({
    moduleNewPhones: true,
    moduleRefurbished: true,
    moduleBuyIn: true,
    moduleRepairs: true,
    moduleAccessories: true,
  });

  const [gstDefaults, setGstDefaults] = useState({
    newPhonesGst: "18.0",
    repairsSac: "9987",
    repairsGst: "18.0",
    accessoriesGst: "18.0",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        let localData = null;
        try {
          const saved = localStorage.getItem("company_store_settings");
          if (saved) localData = JSON.parse(saved);

          const savedTerms = localStorage.getItem("company_intake_terms");
          if (savedTerms) setIntakeTerms(JSON.parse(savedTerms));
        } catch (e) {
          console.error(e);
        }

        const res = await fetch("/api/pos/settings/modules");
        const data = await res.json();
        if (res.ok && data.modules) {
          if (typeof data.isOwner === "boolean") {
            setIsOwner(data.isOwner);
          }

          setStoreProfile({
            businessName: localData?.businessName || data.modules.businessName || "EcoFone Mobile Store",
            storeSubName: localData?.storeSubName || data.modules.storeSubName || "Main Branch",
            storeAddress: localData?.storeAddress || data.modules.storeAddress || "123 Market Street, Commercial Hub",
            storePhone: localData?.storePhone || data.modules.storePhone || "+91 98765 43210",
            gstin: localData?.gstin || data.modules.gstin || "07AAAAA0000A1Z5",
            placeOfSupply: localData?.placeOfSupply || data.modules.placeOfSupply || "Delhi (07)",
            invoicePrefix: localData?.invoicePrefix || data.modules.invoicePrefix || "INV/2026/",
            invoiceNextNumber: Number(localData?.invoiceNextNumber ?? data.modules.invoiceNextNumber ?? 1),
            defaultPrintMode: localData?.defaultPrintMode || data.modules.defaultPrintMode || "A4_GST",
          });
          setModules({
            moduleNewPhones: data.modules.moduleNewPhones ?? true,
            moduleRefurbished: data.modules.moduleRefurbished ?? true,
            moduleBuyIn: data.modules.moduleBuyIn ?? true,
            moduleRepairs: data.modules.moduleRepairs ?? true,
            moduleAccessories: data.modules.moduleAccessories ?? true,
          });
        } else if (localData) {
          setStoreProfile((prev) => ({ ...prev, ...localData }));
        }
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  function handleAddTerm() {
    if (!newTermInput.trim()) return;
    setIntakeTerms((prev) => [...prev, newTermInput.trim()]);
    setNewTermInput("");
  }

  function handleRemoveTerm(index: number) {
    setIntakeTerms((prev) => prev.filter((_, i) => i !== index));
  }

  function handleResetTerms() {
    setIntakeTerms(DEFAULT_INTAKE_TERMS);
  }

  function handleUpdateTerm(index: number, val: string) {
    setIntakeTerms((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      ...storeProfile,
      ...modules,
    };

    try {
      // 1. Save to localStorage immediately and trigger cross-component update
      localStorage.setItem("company_store_settings", JSON.stringify(storeProfile));
      localStorage.setItem("company_intake_terms", JSON.stringify(intakeTerms));
      window.dispatchEvent(new Event("store_settings_updated"));

      // 2. Persist to API
      const res = await fetch("/api/pos/settings/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update store settings.");
      }

      setMessage(data.message || "✅ Workstation settings saved successfully!");
      setTimeout(() => setMessage(""), 4000);
    } catch (err: unknown) {
      setMessage("✅ Workstation print layout saved locally!");
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: keyof typeof modules) {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col font-sans text-slate-900 overflow-y-auto space-y-4 px-4 sm:px-6 lg:px-8 py-4 pb-8 sm:pb-10 select-none">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white shadow-xs shrink-0">
            <Sliders className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Store Profile, Print Layout &amp; Workstation Settings</h1>
            <p className="text-xs text-slate-500 font-medium">
              Configure store details, default print layout (A4 / 80mm Roll), auto-generated invoice numbering, and module toggles (Accessible by any counter operator)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Settings Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-6 max-w-4xl mx-auto w-full">
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 font-bold">Loading store configurations...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Workstation Default Print Layout Settings */}
            <div className="space-y-4">
              <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                <span>🖨️ Default Workstation Print Layout</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setStoreProfile((p) => ({ ...p, defaultPrintMode: "A4_GST" }))}
                  className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                    storeProfile.defaultPrintMode === "A4_GST"
                      ? "bg-fuchsia-50/80 border-2 border-fuchsia-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-fuchsia-600 flex items-center justify-center shrink-0 mt-0.5">
                    {storeProfile.defaultPrintMode === "A4_GST" && (
                      <div className="w-2.5 h-2.5 bg-fuchsia-600 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">📄 Full Page A4 Tax Invoice</p>
                    <p className="text-[11px] text-slate-500 font-medium">Standard Indian GST Tax Invoice format for desktop/A4 printers</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStoreProfile((p) => ({ ...p, defaultPrintMode: "THERMAL_80MM" }))}
                  className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                    storeProfile.defaultPrintMode === "THERMAL_80MM"
                      ? "bg-fuchsia-50/80 border-2 border-fuchsia-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-fuchsia-600 flex items-center justify-center shrink-0 mt-0.5">
                    {storeProfile.defaultPrintMode === "THERMAL_80MM" && (
                      <div className="w-2.5 h-2.5 bg-fuchsia-600 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">🧾 80mm POS Thermal Slip (Roll)</p>
                    <p className="text-[11px] text-slate-500 font-medium">Compact receipt format for 80mm thermal roll printers</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Store Profile & Branding Settings (Strictly Read-Only Cards - No Input Box or Edit Cursor) */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>🏢 Company Branding &amp; Store Details</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 select-none">
                  <span>🔒 Official Store Record (Read-Only)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs select-none">
                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Company / Legal Business Name</span>
                  <p className="font-extrabold text-sm text-slate-900 cursor-default">{storeProfile.businessName}</p>
                </div>

                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Branch / Store Sub-Name</span>
                  <p className="font-bold text-xs text-slate-800 cursor-default">{storeProfile.storeSubName}</p>
                </div>

                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Store Address</span>
                  <p className="font-semibold text-xs text-slate-800 cursor-default">{storeProfile.storeAddress}</p>
                </div>

                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Store Contact Phone / Mobile</span>
                  <p className="font-bold text-xs font-mono text-slate-900 cursor-default">{storeProfile.storePhone}</p>
                </div>

                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Store GSTIN / UIN</span>
                  <p className="font-bold text-xs font-mono text-slate-900 uppercase cursor-default">{storeProfile.gstin}</p>
                </div>

                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Place of Supply (State &amp; Code)</span>
                  <p className="font-semibold text-xs text-slate-800 cursor-default">{storeProfile.placeOfSupply}</p>
                </div>
              </div>
            </div>

            {/* Auto-Generated Invoice Number Sequence (Strictly Read-Only Cards) */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>🔢 Auto-Generated Invoice Sequence &amp; Prefix</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 select-none">
                  <span>⚡ System Managed Sequence</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs select-none">
                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Invoice Prefix</span>
                  <p className="font-bold text-xs font-mono text-slate-900 cursor-default">{storeProfile.invoicePrefix}</p>
                </div>

                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Next Serial Counter Number</span>
                  <p className="font-black text-xs font-mono text-fuchsia-800 cursor-default">{storeProfile.invoiceNextNumber}</p>
                </div>
              </div>

              {/* Sample Generated Invoice Preview */}
              <div className="p-3 bg-fuchsia-50 border border-fuchsia-200 rounded-xl flex items-center justify-between text-xs font-mono text-fuchsia-950 select-none">
                <span className="font-sans font-bold text-slate-700">Next Auto-Generated Invoice Number Preview:</span>
                <span className="font-black text-sm bg-white border border-fuchsia-300 px-3 py-1 rounded-lg text-fuchsia-800 shadow-2xs">
                  {storeProfile.invoicePrefix}{String(storeProfile.invoiceNextNumber).padStart(4, "0")}
                </span>
              </div>
            </div>

            {/* Operational Workstation Modules (Strictly Read-Only Status Display) */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>⚡ Active Workstation Modules</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1 select-none">
                  <span>🔒 System Provisioned Modules</span>
                </span>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 select-none">
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">📱 Brand New Devices Module</p>
                    <p className="text-xs text-slate-500 font-medium">IMEI 1 &amp; 2 serial tracking with forward-charge GST</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${modules.moduleNewPhones ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {modules.moduleNewPhones ? "● Active" : "Disabled"}
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">🔄 Refurbished Devices Margin Scheme</p>
                    <p className="text-xs text-slate-500 font-medium">Section 15(5) margin tax calculation on (Selling Price - Purchase Price)</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${modules.moduleRefurbished ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {modules.moduleRefurbished ? "● Active" : "Disabled"}
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">📥 Customer Used Phone Buy-In Intake</p>
                    <p className="text-xs text-slate-500 font-medium">Intake agreement generator with Aadhaar photo ID and legal ownership voucher</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${modules.moduleBuyIn ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {modules.moduleBuyIn ? "● Active" : "Disabled"}
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">🛠️ Mobile Repair Lab Module</p>
                    <p className="text-xs text-slate-500 font-medium">Job Sheet issuance (REP-1001), pattern/PIN capture, and SAC 9987 service billing</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${modules.moduleRepairs ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {modules.moduleRepairs ? "● Active" : "Disabled"}
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">🔌 Accessories &amp; Spare Parts</p>
                    <p className="text-xs text-slate-500 font-medium">Barcode-driven quick stock reduction and counter tiles</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${modules.moduleAccessories ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {modules.moduleAccessories ? "● Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* Manage Used Phone Intake Legal Slip Terms & Conditions */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-fuchsia-700" />
                    <span>📜 Used Phone Intake Legal Slip Terms &amp; Conditions</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Admin can create, edit, or customize the legal agreement clauses printed on A4 &amp; 80mm thermal vouchers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetTerms}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default Terms</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {intakeTerms.map((term, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                    <span className="font-bold text-slate-500 w-5 text-center shrink-0">{index + 1}.</span>
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => handleUpdateTerm(index, e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(index)}
                      className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove term"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add New Term Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newTermInput}
                    onChange={(e) => setNewTermInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTerm();
                      }
                    }}
                    placeholder="Enter new custom legal clause or condition..."
                    className="flex-1 bg-white border border-dashed border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-fuchsia-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTerm}
                    className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Clause</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Default GST & HSN/SAC Rates (Strictly Read-Only Display) */}
            <div className="border-t border-slate-100 pt-5 space-y-3 select-none">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>GST Rates &amp; HSN/SAC Defaults</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                  <span>🔒 Standard Tax Rates (Read-Only)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">New Phone GST Rate</span>
                  <p className="font-bold text-xs font-mono text-slate-900">{gstDefaults.newPhonesGst}% GST (Forward Charge)</p>
                </div>
                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Repair Service SAC &amp; GST</span>
                  <p className="font-bold text-xs font-mono text-slate-900">SAC {gstDefaults.repairsSac} @ {gstDefaults.repairsGst}% GST</p>
                </div>
                <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Accessories GST Rate</span>
                  <p className="font-bold text-xs font-mono text-slate-900">{gstDefaults.accessoriesGst}% GST</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-fuchsia-500/20 transition-all cursor-pointer active:scale-95 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Updating Store Settings..." : "Save Store & Invoice Configurations"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
