"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  ShieldAlert,
  UserCheck,
  FileCheck,
  CheckCircle2,
  Printer,
  DollarSign,
  AlertCircle,
  FileText,
  Clock,
  Check,
  Shield,
  X,
  Eye,
  Building2,
  Search,
  Filter,
} from "lucide-react";

const DEFAULT_INTAKE_TERMS = [
  "Seller confirms sole legal ownership of device & IMEI. Device is free from liens, bank EMIs, or law enforcement tracking.",
  "Ownership is irrevocably transferred to store upon receipt of agreed payment amount.",
  "If device is reported stolen, fake, or involved in fraud, seller assumes full criminal responsibility and financial penalty.",
  "Seller certifies that all personal data, cloud accounts (iCloud / Google / Mi account), and security locks have been wiped.",
  "Transactions once signed and settled cannot be revoked or returned."
];

interface IntakeVoucherDocumentProps {
  printFormat: "A4" | "THERMAL";
  storeProfile: {
    businessName: string;
    storeSubName: string;
    storeAddress: string;
    storePhone: string;
    gstin: string;
    logoUrl?: string;
  };
  successData: {
    intake: {
      id: string;
      deviceName: string;
      imei1: string;
      imei2?: string;
      purchasePrice: number;
      createdAt?: string;
    };
    customer: {
      name: string;
      phone: string;
    };
  };
  formData: {
    aadhaarNumber?: string;
    conditionRating?: string;
    isBrandWarranty?: "NO" | "YES";
    warrantyDurationValue?: string;
    warrantyDurationUnit?: "MONTHS" | "YEARS";
  };
  intakeTerms: string[];
  voucherId: string;
  voucherDate: string;
  voucherTime: string;
}

function IntakeVoucherDocument({
  printFormat,
  storeProfile,
  successData,
  formData,
  intakeTerms,
  voucherId,
  voucherDate,
  voucherTime,
}: IntakeVoucherDocumentProps) {
  if (printFormat === "THERMAL") {
    return (
      <div className="font-mono text-[11px] leading-tight space-y-2.5 p-3 text-black bg-white border border-black w-full box-border">
        <div className="text-center border-b border-black pb-2">
          {Boolean(storeProfile.logoUrl?.trim()) && (
            <img
              src={storeProfile.logoUrl}
              alt="Store Logo"
              className="h-10 w-auto object-contain mx-auto mb-1 shrink-0"
              style={{ maxHeight: "40px", width: "auto" }}
            />
          )}
          <p className="font-extrabold text-sm uppercase">{storeProfile.businessName}</p>
          <p className="text-[9px] font-bold">{storeProfile.storeSubName}</p>
          <p className="text-[9px]">Ph: {storeProfile.storePhone}</p>
          <p className="text-[9px] font-bold mt-1 uppercase">USED PHONE LEGAL VOUCHER</p>
        </div>

        <div className="border-b border-black pb-1.5 space-y-0.5 text-[10px]">
          <p>Voucher #: <strong>{voucherId}</strong></p>
          <p>Date: {voucherDate} ({voucherTime})</p>
          <p>Seller: <strong>{successData.customer.name}</strong></p>
          <p>Phone: +91 {successData.customer.phone}</p>
          {formData.aadhaarNumber && <p>Aadhaar: XXXX-XXXX-{formData.aadhaarNumber.slice(-4)}</p>}
        </div>

        <div className="border-b border-black pb-1.5 space-y-0.5 text-[10px]">
          <p>Model: <strong>{successData.intake.deviceName}</strong></p>
          <p>IMEI 1: <strong>{successData.intake.imei1}</strong></p>
          {successData.intake.imei2 && <p>IMEI 2: {successData.intake.imei2}</p>}
          <p>Condition: {formData.conditionRating || "Fair / Used"}</p>
          <p>
            Warranty:{" "}
            <strong>
              {formData.isBrandWarranty === "YES"
                ? `${formData.warrantyDurationValue || "1"} ${(formData.warrantyDurationUnit || "Month").toLowerCase()} remaining`
                : "Expired / Out of Warranty"}
            </strong>
          </p>
          <p className="text-xs pt-1 font-bold">
            Paid to Seller: ₹{Number(successData.intake.purchasePrice).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="text-[9.5px] leading-tight border-b border-black pb-2 space-y-1">
          <p className="font-bold uppercase">LEGAL DECLARATION &amp; STORE POLICY:</p>
          <p className="text-justify font-sans leading-normal">
            I, <strong className="font-bold">{successData.customer.name}</strong>, declare sole legal ownership of IMEI <strong className="font-bold">{successData.intake.imei1}</strong>. Device free of liens/stolen claims. Ownership transferred to <strong>{storeProfile.businessName}</strong> upon payment.
          </p>
          <ol className="list-decimal list-inside text-[8.5px] space-y-0.5 pt-1">
            {intakeTerms.map((t, idx) => (
              <li key={idx} className="break-words">{t}</li>
            ))}
          </ol>
        </div>

        <div className="pt-6 flex justify-between text-[9px] font-bold">
          <div>Seller Sign: __________</div>
          <div>Executive: __________</div>
        </div>

        <div className="pt-2 border-t border-black text-[8.5px] font-sans flex items-center justify-center space-x-1.5">
          <img
            src="/brand/logo.png"
            alt="EcoDigiTech Logo"
            className="h-4 w-auto object-contain shrink-0"
            style={{ height: "16px", width: "auto" }}
          />
          <span>Powered by EcoDigiTech • www.ecodigitech.com</span>
        </div>
      </div>
    );
  }

  /* A4 FORMAL LEGAL AGREEMENT VOUCHER SLIP (Full A4 Page Layout) */
  return (
    <div className="w-full min-h-[275mm] h-full bg-white border-2 border-black font-sans text-xs text-black p-6 space-y-4 box-border flex flex-col justify-between">
      <div className="space-y-4 w-full box-border">
        {/* Top Header with Logo (If provided) & Admin Store Details */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3 w-full box-border">
          <div className="flex items-center space-x-3 min-w-0">
            {Boolean(storeProfile.logoUrl?.trim()) && (
              <img
                src={storeProfile.logoUrl}
                alt="Store Logo"
                className="h-14 w-auto object-contain max-w-[150px] shrink-0"
                style={{ maxHeight: "56px", width: "auto" }}
              />
            )}
            <div className="min-w-0">
              <h1 className="font-black text-xl tracking-tight uppercase leading-none text-black truncate">
                {storeProfile.businessName}
              </h1>
              <p className="text-xs font-bold text-black mt-0.5 truncate">{storeProfile.storeSubName}</p>
              <p className="text-[10px] text-black leading-tight mt-0.5 truncate">
                {storeProfile.storeAddress}
              </p>
              <p className="text-[10px] font-sans text-black mt-0.5 truncate">
                Ph: <strong className="font-bold">{storeProfile.storePhone}</strong> | GSTIN: <strong className="font-bold">{storeProfile.gstin}</strong>
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 ml-4">
            <div className="inline-block bg-black text-white px-3 py-1 font-black text-xs uppercase tracking-wider rounded">
              USED DEVICE VOUCHER
            </div>
            <p className="text-[11px] font-sans font-extrabold mt-1 text-black">Voucher #: {voucherId}</p>
            <p className="text-[10px] font-sans text-black">Date: {voucherDate} ({voucherTime})</p>
          </div>
        </div>

        {/* Document Sub-Header Banner */}
        <div className="bg-slate-100 border border-black p-2 text-center w-full box-border">
          <h2 className="font-extrabold text-xs uppercase tracking-wide text-black">
            USED DEVICE PURCHASE AGREEMENT &amp; LEGAL INDEMNIFICATION VOUCHER
          </h2>
          <p className="text-[9.5px] text-black">
            Non-GST Used Phone Acquisition Legal Voucher • Official Customer Copy
          </p>
        </div>

        {/* Grid 1: Seller Personal Details */}
        <div className="border border-black rounded p-3 space-y-1.5 bg-slate-50/50 w-full box-border">
          <h3 className="font-black text-[11px] uppercase border-b border-black pb-1 mb-1.5 text-black">
            1. Seller Identification &amp; Personal Verification:
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div>
              <p>Seller Full Name: <strong className="font-extrabold text-sm text-black">{successData.customer.name}</strong></p>
              <p>Contact Phone: <strong className="font-extrabold text-black">+91 {successData.customer.phone}</strong></p>
            </div>
            <div>
              <p>
                Aadhaar Card No:{" "}
                <strong className="font-extrabold text-black">
                  {formData.aadhaarNumber
                    ? `XXXX-XXXX-${formData.aadhaarNumber.slice(-4)}`
                    : "Verified Identity"}
                </strong>
              </p>
              <p>Acquisition Type: <strong>Over-the-Counter Buy-In</strong></p>
            </div>
          </div>
        </div>

        {/* Grid 2: Device Hardware Specifications & Warranty Table */}
        <div className="border border-black rounded overflow-hidden w-full box-border">
          <div className="bg-black text-white px-3 py-1 font-black text-[10px] uppercase">
            2. Acquired Hardware Specifications &amp; Warranty Rating
          </div>
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-100 text-black font-bold uppercase text-[10px] border-b border-black">
                <th className="p-2 border-r border-black w-[25%]">Device Title / Model</th>
                <th className="p-2 border-r border-black w-[25%]">Primary IMEI 1</th>
                <th className="p-2 border-r border-black w-[15%]">Condition</th>
                <th className="p-2 border-r border-black w-[20%]">Brand Warranty</th>
                <th className="p-2 text-right w-[15%]">Agreed Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black font-sans text-xs">
              <tr>
                <td className="p-2.5 font-bold break-words">{successData.intake.deviceName}</td>
                <td className="p-2.5 font-extrabold break-all text-black">{successData.intake.imei1}</td>
                <td className="p-2.5 break-words">{formData.conditionRating || "Fair / Used"}</td>
                <td className="p-2.5 break-words">
                  {formData.isBrandWarranty === "YES"
                    ? `Active (${formData.warrantyDurationValue || "1"} ${
                        (formData.warrantyDurationUnit || "Month").toLowerCase()
                      } remaining)`
                    : "Expired / Out of Warranty"}
                </td>
                <td className="p-2.5 text-right font-black text-sm text-black">
                  ₹{Number(successData.intake.purchasePrice).toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Grid 3: Comprehensive Legal Ownership Indemnification Declaration */}
        <div className="border border-black p-3 rounded bg-slate-50 space-y-1.5 text-[10.5px] leading-relaxed w-full box-border">
          <p className="font-black uppercase tracking-wider underline text-black">
            3. SELLER LEGAL OWNERSHIP &amp; INDEMNIFICATION DECLARATION:
          </p>
          <p className="text-justify font-sans text-black leading-relaxed break-words">
            I, <strong className="font-extrabold text-black">{successData.customer.name}</strong> (Mobile: <strong className="font-extrabold text-black">+91 {successData.customer.phone}</strong>), solemnly declare under penalty of perjury that I am the sole, absolute, and lawful owner of the used mobile device described above (Primary IMEI: <strong className="font-extrabold text-black">{successData.intake.imei1}</strong>). I affirm that this device is free from all financial liens, carrier blacklists, encumbrances, or criminal investigations, and is not stolen property. I hereby transfer all title &amp; ownership rights to <strong className="font-extrabold text-black">{storeProfile.businessName}</strong> upon receipt of payment (<strong className="font-extrabold text-black">₹{Number(successData.intake.purchasePrice).toLocaleString("en-IN")}</strong>).
          </p>
        </div>

        {/* Grid 4: Official Admin-Managed Store Terms & Conditions */}
        <div className="border border-black p-3 rounded bg-slate-50 space-y-1.5 text-[10px] w-full box-border">
          <div className="border-b border-black pb-1 mb-1">
            <p className="font-black uppercase tracking-wider text-black">
              4. STORE LEGAL TERMS &amp; PURCHASE POLICY:
            </p>
          </div>
          <ol className="list-decimal list-inside space-y-1 font-sans text-black leading-normal">
            {intakeTerms.map((term, idx) => (
              <li key={idx} className="text-black break-words">
                <span>{term}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Bottom Signatures & Footer Branding */}
      <div className="space-y-4 pt-4 w-full box-border">
        {/* Signatures & Seals */}
        <div className="pt-6 flex justify-between items-end text-xs font-bold w-full box-border">
          <div className="text-center border-t-2 border-black w-52 pt-1.5">
            <p className="uppercase text-black">Seller Signature / Thumb</p>
            <p className="text-[9px] font-normal text-slate-600">({successData.customer.name})</p>
          </div>
          <div className="text-center border-t-2 border-black w-52 pt-1.5">
            <p className="uppercase text-black">Store Executive Signature</p>
            <p className="text-[9px] font-normal text-slate-600">({storeProfile.businessName})</p>
          </div>
        </div>

        {/* Footer Advertisement & EcoDigiTech Logo Branding */}
        <div className="pt-3 border-t border-slate-300 flex items-center justify-center space-x-2 text-[9.5px] text-slate-700 font-mono w-full box-border">
          <img
            src="/brand/logo.png"
            alt="EcoDigiTech Logo"
            className="h-5 w-auto object-contain shrink-0"
            style={{ height: "20px", width: "auto" }}
          />
          <span>Powered &amp; Managed by EcoDigiTech | Multi-Store Mobile POS &amp; ERP Automation • www.ecodigitech.com</span>
        </div>
      </div>
    </div>
  );
}

export default function UsedPhoneIntakePage() {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    aadhaarNumber: "",
    sellerAadhaarUrl: "",
    brand: "Apple",
    deviceName: "",
    imei1: "",
    imei2: "",
    conditionRating: "Good (Minor Scuffs)",
    conditionNotes: "",
    isBrandWarranty: "NO" as "NO" | "YES",
    warrantyDurationValue: "",
    warrantyDurationUnit: "MONTHS" as "MONTHS" | "YEARS",
    purchasePrice: "",
    sellingPrice: "",
    paymentMode: "CASH",
    legalAgreementAccepted: false,
  });

  const [activeTab, setActiveTab] = useState<"NEW_INTAKE" | "PURCHASED_REGISTRY">("NEW_INTAKE");
  const [purchasedList, setPurchasedList] = useState<any[]>([]);
  const [loadingRegistry, setLoadingRegistry] = useState(false);
  const [registrySearch, setRegistrySearch] = useState("");
  const [registryStatusFilter, setRegistryStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState<"A4" | "THERMAL">("A4");

  // Dynamic Store Terms & Conditions (Configured by Admin in Store Settings)
  const [intakeTerms, setIntakeTerms] = useState<string[]>(DEFAULT_INTAKE_TERMS);

  // Dynamic Store Profile Settings (Configured by Admin)
  const [storeProfile, setStoreProfile] = useState({
    businessName: "EcoFone Mobile Store",
    storeSubName: "Main Branch",
    storeAddress: "123 Market Street, Commercial Hub",
    storePhone: "+91 98765 43210",
    gstin: "07AAAAA0000A1Z5",
    logoUrl: "",
  });

  const fetchRegistry = async () => {
    setLoadingRegistry(true);
    try {
      const res = await fetch("/api/pos/intake");
      const data = await res.json();
      let dbIntakes = data?.data || [];

      const local = localStorage.getItem("pos_intake_history");
      let localIntakes: any[] = [];
      if (local) {
        try {
          localIntakes = JSON.parse(local);
        } catch (e) {}
      }

      const combinedMap = new Map();
      dbIntakes.forEach((item: any) => combinedMap.set(item.id, item));
      localIntakes.forEach((item: any) => {
        if (!combinedMap.has(item.id)) combinedMap.set(item.id, item);
      });

      setPurchasedList(Array.from(combinedMap.values()));
    } catch (err) {
      console.error("Failed loading intake registry history:", err);
    } finally {
      setLoadingRegistry(false);
    }
  };

  // Inject dynamic @page print CSS tag for A4 vs 80mm
  useEffect(() => {
    if (typeof document === "undefined") return;
    let styleEl = document.getElementById("dynamic-intake-print-page-size");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-intake-print-page-size";
      document.head.appendChild(styleEl);
    }
    if (printFormat === "THERMAL") {
      styleEl.innerHTML = `@media print { @page { size: 80mm auto !important; margin: 0 !important; } }`;
    } else {
      styleEl.innerHTML = `@media print { @page { size: A4 portrait !important; margin: 0 !important; } }`;
    }
  }, [printFormat]);

  useEffect(() => {
    fetchRegistry();

    function loadLocalSettings() {
      try {
        const saved = localStorage.getItem("company_store_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          setStoreProfile((prev) => ({
            ...prev,
            ...parsed,
          }));
        }

        const savedTerms = localStorage.getItem("company_intake_terms");
        if (savedTerms) {
          setIntakeTerms(JSON.parse(savedTerms));
        }
      } catch (err) {
        console.error("Failed loading store profile settings", err);
      }
    }

    loadLocalSettings();
    window.addEventListener("store_settings_updated", loadLocalSettings);
    window.addEventListener("storage", loadLocalSettings);

    // Sync from Admin API
    fetch("/api/pos/settings/modules")
      .then((res) => res.json())
      .then((data) => {
        if (data?.modules) {
          setStoreProfile((prev) => ({
            businessName: data.modules.businessName || prev.businessName,
            storeSubName: data.modules.storeSubName || prev.storeSubName,
            storeAddress: data.modules.storeAddress || prev.storeAddress,
            storePhone: data.modules.storePhone || prev.storePhone,
            gstin: data.modules.gstin || prev.gstin,
            logoUrl: data.modules.logoUrl || prev.logoUrl,
          }));
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("store_settings_updated", loadLocalSettings);
      window.removeEventListener("storage", loadLocalSettings);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleanPhone = formData.customerPhone.replace(/\D/g, "").slice(0, 10);
    if (cleanPhone.length !== 10) {
      setError("Seller mobile phone number must be exactly 10 digits.");
      return;
    }

    if (formData.imei1.length !== 15 || !/^\d{15}$/.test(formData.imei1)) {
      setError("IMEI 1 must be an exact 15-digit numeric sequence.");
      return;
    }

    if (formData.isBrandWarranty === "YES" && !formData.warrantyDurationValue) {
      setError("Please enter remaining brand warranty duration value (numbers only).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pos/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Intake submission failed.");
      }

      setSuccessData(data.data);
      setIsPrintModalOpen(true);

      if (data?.data?.intake) {
        const newRecord = {
          id: data.data.intake.id,
          deviceName: data.data.intake.deviceName,
          imei1: data.data.intake.imei1,
          imei2: data.data.intake.imei2,
          purchasePrice: data.data.intake.purchasePrice,
          createdAt: data.data.intake.createdAt || new Date().toISOString(),
          status: data.data.intake.status || "PENDING_ADMIN_APPROVAL",
          customer: data.data.customer,
          conditionNotes: `Condition: ${formData.conditionRating} | Brand Warranty: ${
            formData.isBrandWarranty === "YES"
              ? `${formData.warrantyDurationValue} ${formData.warrantyDurationUnit}`
              : "No"
          }`,
          aadhaarNumber: formData.aadhaarNumber,
          warrantyDurationValue: formData.warrantyDurationValue,
          warrantyDurationUnit: formData.warrantyDurationUnit,
          isBrandWarranty: formData.isBrandWarranty,
          conditionRating: formData.conditionRating,
        };

        try {
          const localHistory = JSON.parse(localStorage.getItem("pos_intake_history") || "[]");
          localStorage.setItem("pos_intake_history", JSON.stringify([newRecord, ...localHistory]));
        } catch (e) {}

        setPurchasedList((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission error.");
    } finally {
      setLoading(false);
    }
  }

  function handleTriggerPrint() {
    window.print();
  }

  function handleViewPastIntakeVoucher(item: any) {
    const isBrandWarrantyVal =
      item.isBrandWarranty ||
      (item.conditionNotes?.includes("Brand Warranty: Yes") || item.conditionNotes?.includes("remaining")
        ? "YES"
        : "NO");

    let warrantyValue = item.warrantyDurationValue || "";
    let warrantyUnit = item.warrantyDurationUnit || "MONTHS";
    if (!warrantyValue && item.conditionNotes) {
      const match = item.conditionNotes.match(/(\d+)\s+(MONTHS|YEARS|Month|Year)/i);
      if (match) {
        warrantyValue = match[1];
        warrantyUnit = match[2].toUpperCase().startsWith("Y") ? "YEARS" : "MONTHS";
      }
    }

    let condRating = item.conditionRating || "Fair / Used";
    if (item.conditionNotes && item.conditionNotes.includes("Condition:")) {
      condRating = item.conditionNotes.split("|")[0].replace("Condition:", "").trim();
    }

    setFormData({
      customerName: item.customer?.name || item.customerName || "",
      customerPhone: item.customer?.phone || item.customerPhone || "",
      aadhaarNumber: item.customer?.aadhaarNumber || item.aadhaarNumber || "",
      sellerAadhaarUrl: item.sellerAadhaarUrl || "",
      brand: "Apple",
      deviceName: item.deviceName || "",
      imei1: item.imei1 || "",
      imei2: item.imei2 || "",
      conditionRating: condRating,
      conditionNotes: item.conditionNotes || "",
      isBrandWarranty: isBrandWarrantyVal as "YES" | "NO",
      warrantyDurationValue: warrantyValue,
      warrantyDurationUnit: warrantyUnit as "MONTHS" | "YEARS",
      purchasePrice: String(item.purchasePrice || 0),
      sellingPrice: "",
      paymentMode: "CASH",
      legalAgreementAccepted: true,
    });

    setSuccessData({
      intake: {
        id: item.id,
        deviceName: item.deviceName,
        imei1: item.imei1,
        imei2: item.imei2,
        purchasePrice: item.purchasePrice,
        createdAt: item.createdAt,
      },
      customer: {
        name: item.customer?.name || item.customerName || "Customer",
        phone: item.customer?.phone || item.customerPhone || "",
      },
    });

    setIsPrintModalOpen(true);
  }

  const filteredRegistry = purchasedList.filter((item: any) => {
    const sName = item.customer?.name || item.customerName || "";
    const sPhone = item.customer?.phone || item.customerPhone || "";
    const vId = item.id ? `INT-${item.id.slice(0, 8).toUpperCase()}` : "";
    const query = registrySearch.toLowerCase().trim();

    const matchesSearch =
      !query ||
      item.deviceName?.toLowerCase().includes(query) ||
      item.imei1?.toLowerCase().includes(query) ||
      item.imei2?.toLowerCase().includes(query) ||
      sName.toLowerCase().includes(query) ||
      sPhone.includes(query) ||
      vId.toLowerCase().includes(query);

    if (registryStatusFilter === "APPROVED") {
      return matchesSearch && item.status === "APPROVED";
    }
    if (registryStatusFilter === "PENDING") {
      return matchesSearch && item.status !== "APPROVED";
    }
    return matchesSearch;
  });



  const voucherId = successData?.intake?.id
    ? `INT-${successData.intake.id.slice(0, 8).toUpperCase()}`
    : "INT-2026-001";
  const voucherDate = successData?.intake?.createdAt
    ? new Date(successData.intake.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");
  const voucherTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col font-sans text-slate-900 overflow-y-auto space-y-4 pb-6 select-none pr-1">
      {/* ========================================================================= */}
      {/* 1. PRINTABLE CLIENT LEGAL VOUCHER (Targeted explicitly by globals.css @media print) */}
      {/* ========================================================================= */}
      {successData && (
        <div
          id="printable-receipt-container"
          className={`${
            printFormat === "A4" ? "legal-intake-voucher" : "thermal-receipt"
          } hidden print:block text-black bg-white select-none`}
        >
          <IntakeVoucherDocument
            printFormat={printFormat}
            storeProfile={storeProfile}
            successData={successData}
            formData={formData}
            intakeTerms={intakeTerms}
            voucherId={voucherId}
            voucherDate={voucherDate}
            voucherTime={voucherTime}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCREEN UI CONTAINER (Hidden during print with print:hidden) */}
      {/* ========================================================================= */}
      <div className="print:hidden space-y-4">
        {/* Header Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white shadow-xs">
                <Smartphone className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">Used Phone Buy-In Intake Workflow</h1>
                <p className="text-xs text-slate-500 font-medium">
                  Record device purchase vouchers &amp; submit for Admin verification before inventory listing
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {successData && (
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-200 text-fuchsia-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <Printer className="w-4 h-4 text-fuchsia-700" />
                <span>Print / View Formal Legal Slip</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher: Record New Intake vs Purchased Mobiles Registry */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-2 sm:p-2.5 shadow-2xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab("NEW_INTAKE")}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "NEW_INTAKE"
                  ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>📥 Record New Buy-In Intake</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("PURCHASED_REGISTRY");
                fetchRegistry();
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === "PURCHASED_REGISTRY"
                  ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>📋 Purchased Mobiles Registry ({purchasedList.length})</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 hidden md:inline">
            {activeTab === "NEW_INTAKE" ? "Record customer phone buy-in voucher" : "View purchased phones & reprint legal receipts"}
          </span>
        </div>

        {/* Success Banner (Admin Verification Pending Notice on Screen Only) */}
        {activeTab === "NEW_INTAKE" && successData && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs shrink-0">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-amber-600 shrink-0 animate-pulse" />
              <div>
                <h3 className="font-extrabold text-sm">Device Intake Recorded &amp; Sent to Admin Approval Queue!</h3>
                <p className="text-xs text-amber-800 font-medium">
                  Voucher <strong className="font-mono">{voucherId}</strong> generated. Stock will be listed in active inventory after Admin verifies device IMEI &amp; approves details.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-md shadow-fuchsia-500/20 shrink-0 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>🖨️ Print Formal Legal Slip</span>
            </button>
          </div>
        )}

        {/* TAB 1: RECORD NEW INTAKE FORM */}
        {activeTab === "NEW_INTAKE" && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (Span 8): Seller & Device Information */}
            <div className="lg:col-span-8 space-y-4">
              {/* Seller Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2.5">
                  <UserCheck className="w-4 h-4 text-fuchsia-600 shrink-0" />
                  <span>Seller Personal Verification Details</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Seller Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Seller Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit Mobile Phone"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Seller Aadhaar Card Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="12-digit Aadhaar Number (e.g. 1234 5678 9012)"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Device Hardware Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2.5">
                  <Smartphone className="w-4 h-4 text-fuchsia-600 shrink-0" />
                  <span>Used Device Hardware Specifications</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Device Model Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. iPhone 14 Pro 128GB Space Black"
                      value={formData.deviceName}
                      onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Device Physical Condition</label>
                    <select
                      value={formData.conditionRating}
                      onChange={(e) => setFormData({ ...formData, conditionRating: e.target.value })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none cursor-pointer"
                    >
                      <option value="Like New (Mint Condition)">Like New (Mint Condition)</option>
                      <option value="Good (Minor Scuffs)">Good (Minor Scuffs)</option>
                      <option value="Fair (Visible Dents/Scratches)">Fair (Visible Dents/Scratches)</option>
                      <option value="Repaired Display/Battery">Repaired Display/Battery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Primary IMEI 1 (15 Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      placeholder="354890123456789"
                      value={formData.imei1}
                      onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Secondary IMEI 2 (Optional)</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="15-digit IMEI 2"
                      value={formData.imei2}
                      onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Brand Warranty Section */}
                  <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200/80 space-y-3 sm:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Is Phone in Brand Warranty? *</span>
                      </label>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="isBrandWarranty"
                            value="NO"
                            checked={formData.isBrandWarranty === "NO"}
                            onChange={() =>
                              setFormData({ ...formData, isBrandWarranty: "NO", warrantyDurationValue: "" })
                            }
                            className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <span>No (Expired / Out of Warranty)</span>
                        </label>

                        <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="isBrandWarranty"
                            value="YES"
                            checked={formData.isBrandWarranty === "YES"}
                            onChange={() => setFormData({ ...formData, isBrandWarranty: "YES" })}
                            className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <span>Yes (Active Brand Warranty)</span>
                        </label>
                      </div>
                    </div>

                    {formData.isBrandWarranty === "YES" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-purple-200/60 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-[11px] font-extrabold text-purple-950 mb-1">
                            Remaining Warranty Duration (Numbers Only) *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            placeholder="e.g. 6"
                            value={formData.warrantyDurationValue}
                            onChange={(e) => {
                              const onlyNums = e.target.value.replace(/\D/g, "");
                              setFormData({ ...formData, warrantyDurationValue: onlyNums });
                            }}
                            className="w-full h-9 bg-white border border-purple-300 rounded-xl px-3 text-xs font-mono font-bold text-slate-900 focus:border-purple-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-purple-950 mb-1">
                            Duration Unit *
                          </label>
                          <select
                            value={formData.warrantyDurationUnit}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                warrantyDurationUnit: e.target.value as "MONTHS" | "YEARS",
                              })
                            }
                            className="w-full h-9 bg-white border border-purple-300 rounded-xl px-3 text-xs font-bold text-slate-900 focus:border-purple-600 focus:outline-none cursor-pointer"
                          >
                            <option value="MONTHS">Months</option>
                            <option value="YEARS">Years</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Span 4): Financials & Legal Declaration */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-2.5">
                  <DollarSign className="w-4 h-4 text-fuchsia-600 shrink-0" />
                  <span>Acquisition Pricing &amp; Legal</span>
                </h2>

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                    {error}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Agreed Acquisition Price (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="Price paid to seller"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-900 font-mono font-bold text-sm focus:border-fuchsia-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expected Refurbished Sale MRP (₹)</label>
                    <input
                      type="number"
                      placeholder="Target selling price"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 font-mono font-medium focus:border-fuchsia-600 focus:outline-none"
                    />
                  </div>

                  {/* Admin Approval Queue Notice (Screen Only) */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                    <span className="font-bold block mb-0.5">ℹ️ Admin Approval Requirement:</span>
                    Submitting this form records the device purchase voucher and sends it to the Admin Verification queue. Active inventory listing occurs after Admin approval.
                  </div>

                  {/* Legal Checkbox */}
                  <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={formData.legalAgreementAccepted}
                        onChange={(e) => setFormData({ ...formData, legalAgreementAccepted: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 shrink-0 cursor-pointer"
                      />
                      <span className="text-xs text-purple-950 font-semibold leading-snug">
                        Seller confirms legal ownership &amp; indemnifies store against stolen device claims.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-fuchsia-500/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center space-x-2 mt-2"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{loading ? "Processing Intake..." : "Complete Intake & Submit for Approval"}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: PURCHASED MOBILES REGISTRY & RECEIPTS HISTORY */}
        {activeTab === "PURCHASED_REGISTRY" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>📋 Acquired Used Devices Registry &amp; Vouchers</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  View all acquired used mobile phones, seller details, IMEI serials, and reprint formal legal slip vouchers
                </p>
              </div>

              <button
                type="button"
                onClick={fetchRegistry}
                className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1 shrink-0 self-start sm:self-auto"
              >
                <span>🔄 Refresh Registry</span>
              </button>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={registrySearch}
                  onChange={(e) => setRegistrySearch(e.target.value)}
                  placeholder="Search IMEI, Seller, Mobile, Model, Voucher..."
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setRegistryStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                    registryStatusFilter === "ALL"
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({purchasedList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRegistryStatusFilter("PENDING")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                    registryStatusFilter === "PENDING"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  ⏳ Pending Admin Check ({purchasedList.filter((i) => i.status !== "APPROVED").length})
                </button>
                <button
                  type="button"
                  onClick={() => setRegistryStatusFilter("APPROVED")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                    registryStatusFilter === "APPROVED"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  ✅ Verified in Inventory ({purchasedList.filter((i) => i.status === "APPROVED").length})
                </button>
              </div>
            </div>

            {/* Registry List / Table */}
            {loadingRegistry ? (
              <div className="py-12 text-center text-xs text-slate-400 font-bold">
                Loading acquired devices registry...
              </div>
            ) : filteredRegistry.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium space-y-2">
                <Smartphone className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-600">No used phone intake records found.</p>
                <p className="text-[11px] text-slate-400">Record a new buy-in intake to populate this store registry.</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                        <th className="p-3">Voucher # &amp; Date</th>
                        <th className="p-3">Seller Details</th>
                        <th className="p-3">Device Title &amp; Primary IMEI</th>
                        <th className="p-3">Agreed Price</th>
                        <th className="p-3">Admin Verification</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans text-xs">
                      {filteredRegistry.map((item: any) => {
                        const vId = item.id ? `INT-${item.id.slice(0, 8).toUpperCase()}` : "INT-2026-001";
                        const vDate = item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "23 Sep 2026";
                        const sName = item.customer?.name || item.customerName || "Customer";
                        const sPhone = item.customer?.phone || item.customerPhone || "";
                        const isApproved = item.status === "APPROVED";

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono">
                              <p className="font-bold text-slate-900">{vId}</p>
                              <p className="text-[10px] text-slate-500">{vDate}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{sName}</p>
                              <p className="text-[11px] text-slate-500 font-mono">+91 {sPhone}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{item.deviceName}</p>
                              <p className="text-[11px] text-slate-600 font-mono font-bold">IMEI: {item.imei1}</p>
                            </td>
                            <td className="p-3 font-black text-slate-900 text-sm">
                              ₹{Number(item.purchasePrice || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="p-3">
                              {isApproved ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Verified in Inventory</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                  <span>Pending Admin Check</span>
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleViewPastIntakeVoucher(item)}
                                className="bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-200 text-fuchsia-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1 active:scale-95"
                              >
                                <Printer className="w-3.5 h-3.5 text-fuchsia-700" />
                                <span>🖨️ View / Print Slip</span>
                              </button>
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
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. PRINT & PREVIEW FORMAL LEGAL SLIP MODAL */}
      {/* ========================================================================= */}
      {isPrintModalOpen && successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 print:hidden">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-fuchsia-400" />
                <h3 className="font-extrabold text-sm tracking-tight">Print Formal Legal Purchase Agreement Voucher</h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Options Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-700">Printer Format:</span>
                <button
                  onClick={() => setPrintFormat("A4")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    printFormat === "A4"
                      ? "bg-fuchsia-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  📄 A4 Formal Legal Slip
                </button>
                <button
                  onClick={() => setPrintFormat("THERMAL")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    printFormat === "THERMAL"
                      ? "bg-fuchsia-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  🧾 80mm Thermal Receipt Slip
                </button>

              </div>

              <button
                onClick={handleTriggerPrint}
                className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold px-5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>🖨️ Print Voucher Now</span>
              </button>
            </div>

            {/* Modal On-Screen Document Preview */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100/70 flex justify-center">
              <div
                className={`bg-white shadow-md text-black box-border ${
                  printFormat === "A4" ? "w-full max-w-[190mm]" : "w-full max-w-[80mm]"
                }`}
              >
                <IntakeVoucherDocument
                  printFormat={printFormat}
                  storeProfile={storeProfile}
                  successData={successData}
                  formData={formData}
                  intakeTerms={intakeTerms}
                  voucherId={voucherId}
                  voucherDate={voucherDate}
                  voucherTime={voucherTime}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
