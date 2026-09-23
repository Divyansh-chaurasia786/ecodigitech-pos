"use client";

import React, { useState, useEffect } from "react";
import { A4GstInvoice } from "@/components/hardware/A4GstInvoice";
import { ThermalReceipt } from "@/components/hardware/ThermalReceipt";
import { getPlaceOfSupplyFromAddress } from "@/utils/gstUtils";
import {
  ShieldCheck,
  Search,
  Plus,
  Wrench,
  Clock,
  User,
  Smartphone,
  CheckCircle2,
  Printer,
  X,
  CreditCard,
  QrCode,
  Banknote,
  BookOpen,
  Filter,
  Shield,
  FileText,
  AlertCircle,
  Sparkles,
  Settings,
  Trash2,
  Check,
  Info,
  DollarSign,
  PackageCheck,
  BadgeCheck,
  Eye,
  Edit3,
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface RepairTicket {
  id: string;
  ticketType?: "WARRANTY_CLAIM" | "PAID_REPAIR";
  deviceName: string;
  imeiOrSerial?: string;
  warrantyStatus?: "IN_WARRANTY" | "OUT_OF_WARRANTY" | "EXTENDED_WARRANTY";
  problemDescription: string;
  accessoriesReceived?: string;
  pinPattern: string | null;
  estimatedCost: number;
  advancePaid: number;
  serviceCharge?: number;
  warrantyPolicy?: string;
  status: "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "DELIVERED";
  sacCode: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
}

// Initial Default Presets
const DEFAULT_ISSUES = [
  "Screen / Display Glass",
  "Battery Replacement",
  "Charging Port / Mic",
  "Ear Speaker / Loudspeaker",
  "Liquid / Water Damage",
  "Software / OS Flashing",
  "Camera Lens / Sensor",
  "Back Glass / Body",
  "Motherboard / IC Repair",
];

const DEFAULT_ACCESSORIES = [
  "SIM Card Tray",
  "Back Cover Case",
  "Charger & Cable",
  "Memory SD Card",
  "Original Retail Box",
];

function getDisplayTicketId(id: string) {
  if (!id) return "REP-1001";
  const upper = id.toUpperCase();
  if (upper.startsWith("REP-")) return upper;
  return `REP-${upper.slice(0, 8)}`;
}

export default function MobileRepairLabDashboard() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "RECEIVED" | "IN_PROGRESS" | "COMPLETED" | "DELIVERED">("ALL");
  const [printMode, setPrintMode] = useState<"A4_GST" | "THERMAL_80MM">("A4_GST");

  // Dynamic Saved Presets State (Loaded from localStorage)
  const [issuePresets, setIssuePresets] = useState<string[]>(DEFAULT_ISSUES);
  const [accessoryPresets, setAccessoryPresets] = useState<string[]>(DEFAULT_ACCESSORIES);
  const [newIssueInput, setNewIssueInput] = useState("");
  const [newAccessoryInput, setNewAccessoryInput] = useState("");

  // Admin Policy & Receipt Terms (Loaded from localStorage)
  const [repairTermsSettings, setRepairTermsSettings] = useState({
    defaultWarrantyPolicy: "30_DAYS" as "30_DAYS" | "60_DAYS" | "NO_WARRANTY" | "CUSTOM",
    customWarrantyText: "30-Day Store Warranty on Replaced Hardware Parts",
    thankYouMessage: "Thank you for choosing EcoDigiTech Mobile Repair Lab!",
    deskCheckNote: "Please test and verify all device functions at the counter desk before pickup.",
  });

  // Modal Controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Active Ticket Contexts
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [ticketToView, setTicketToView] = useState<RepairTicket | null>(null);
  const [ticketToDeliver, setTicketToDeliver] = useState<RepairTicket | null>(null);

  // Form State for Ticket Creation & Editing
  const [formData, setFormData] = useState({
    ticketType: "PAID_REPAIR" as "WARRANTY_CLAIM" | "PAID_REPAIR",
    customerName: "",
    customerPhone: "",
    deviceName: "",
    imeiOrSerial: "",
    warrantyStatus: "OUT_OF_WARRANTY" as "IN_WARRANTY" | "OUT_OF_WARRANTY" | "EXTENDED_WARRANTY",
    problemDescription: "",
    selectedIssues: [] as string[],
    selectedAccessories: [] as string[],
    pinPattern: "",
    hasInWarrantyServiceCharge: false,
    inWarrantyServiceCharge: "150",
    partsCost: "",
    estimatedCost: "",
    advancePaid: "",
    warrantyPolicy: "30_DAYS" as "30_DAYS" | "60_DAYS" | "NO_WARRANTY" | "CUSTOM",
    customPolicyText: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [error, setError] = useState("");

  const [storeProfile, setStoreProfile] = useState({
    businessName: "EcoDigiTech Mobile Lab",
    storeSubName: "Warranty Claims & Hardware Repair",
    storeAddress: "123 Market Street, Commercial Hub",
    storePhone: "+91 98765 43210",
    gstin: "07AAAAA0000A1Z5",
    logoUrl: "",
  });

  // Load Saved Presets, Terms & View Mode from localStorage
  useEffect(() => {
    try {
      const savedIssues = localStorage.getItem("company_custom_issues");
      if (savedIssues) setIssuePresets(JSON.parse(savedIssues));

      const savedAccessories = localStorage.getItem("company_custom_accessories");
      if (savedAccessories) setAccessoryPresets(JSON.parse(savedAccessories));

      const savedTerms = localStorage.getItem("company_repair_terms");
      if (savedTerms) setRepairTermsSettings(JSON.parse(savedTerms));

      const savedSettings = localStorage.getItem("company_store_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setStoreProfile((prev) => ({ ...prev, ...parsed }));
        if (parsed.defaultPrintMode) {
          setPrintMode(parsed.defaultPrintMode);
        }
      }
    } catch (err) {
      console.error("Failed loading local preset settings", err);
    }

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
  }, []);

  function saveTicketStatusOverrideToStorage(ticketId: string, status: RepairTicket["status"]) {
    try {
      const savedStr = localStorage.getItem("company_ticket_status_overrides");
      const overrides: Record<string, RepairTicket["status"]> = savedStr ? JSON.parse(savedStr) : {};
      overrides[ticketId] = status;
      localStorage.setItem("company_ticket_status_overrides", JSON.stringify(overrides));
    } catch (e) {
      console.error("Failed saving ticket status override to storage", e);
    }
  }

  function saveLocalRepairTicketToStorage(ticket: RepairTicket) {
    try {
      const savedStr = localStorage.getItem("company_local_repair_tickets");
      const list: RepairTicket[] = savedStr ? JSON.parse(savedStr) : [];
      const index = list.findIndex((t) => t.id === ticket.id);
      if (index >= 0) {
        list[index] = ticket;
      } else {
        list.unshift(ticket);
      }
      localStorage.setItem("company_local_repair_tickets", JSON.stringify(list));
    } catch (e) {
      console.error("Failed saving local repair ticket", e);
    }
  }

  async function loadTickets() {
    setLoading(true);
    try {
      let apiTickets: RepairTicket[] = [];
      try {
        const res = await fetch("/api/pos/repairs");
        const data = await res.json();
        if (res.ok && data.tickets) {
          apiTickets = data.tickets;
        }
      } catch (e) {
        console.error("API fetch error", e);
      }

      let localTickets: RepairTicket[] = [];
      try {
        const savedLocal = localStorage.getItem("company_local_repair_tickets");
        if (savedLocal) localTickets = JSON.parse(savedLocal);
      } catch (e) {}

      // Combine API and local tickets
      const ticketMap = new Map<string, RepairTicket>();
      apiTickets.forEach((t) => ticketMap.set(t.id, t));
      localTickets.forEach((t) => ticketMap.set(t.id, t));

      const combined = Array.from(ticketMap.values());

      let savedOverrides: Record<string, RepairTicket["status"]> = {};
      try {
        const savedStr = localStorage.getItem("company_ticket_status_overrides");
        if (savedStr) savedOverrides = JSON.parse(savedStr);
      } catch (e) {}

      const mergedTickets = combined.map((t) => {
        if (savedOverrides[t.id]) {
          return { ...t, status: savedOverrides[t.id] };
        }
        return t;
      });

      setTickets(mergedTickets);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  // Save Presets Helpers
  function saveIssuePresetsToStorage(updated: string[]) {
    setIssuePresets(updated);
    try {
      localStorage.setItem("company_custom_issues", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  function saveAccessoryPresetsToStorage(updated: string[]) {
    setAccessoryPresets(updated);
    try {
      localStorage.setItem("company_custom_accessories", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  function saveRepairTermsSettingsToStorage(updated: typeof repairTermsSettings) {
    setRepairTermsSettings(updated);
    try {
      localStorage.setItem("company_repair_terms", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  // Direct Print Ticket Helper
  function handleDirectPrintTicket(ticket: RepairTicket) {
    let modeToUse: "A4_GST" | "THERMAL_80MM" = printMode;
    try {
      const savedSettings = localStorage.getItem("company_store_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.defaultPrintMode) {
          modeToUse = parsed.defaultPrintMode;
          setPrintMode(parsed.defaultPrintMode);
        }
      }
    } catch (e) {}

    if (typeof document !== "undefined") {
      let styleEl = document.getElementById("dynamic-print-page-size");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "dynamic-print-page-size";
        document.head.appendChild(styleEl);
      }
      if (modeToUse === "THERMAL_80MM") {
        styleEl.innerHTML = `@media print { @page { size: 80mm auto !important; margin: 0 !important; } }`;
        document.body.classList.add("print-mode-80mm");
        document.body.classList.remove("print-mode-a4");
      } else {
        styleEl.innerHTML = `@media print { @page { size: A4 portrait !important; margin: 0 !important; } }`;
        document.body.classList.add("print-mode-a4");
        document.body.classList.remove("print-mode-80mm");
      }
    }

    setTicketToView(ticket);
    setTimeout(() => {
      window.print();
    }, 150);
  }

  // Quick Status Handler with Cache Persistence
  async function handleQuickStatusChange(ticketId: string, newStatus: RepairTicket["status"]) {
    // 1. Save to local cache override immediately
    saveTicketStatusOverrideToStorage(ticketId, newStatus);

    // 2. Update React state immediately
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    // 3. Sync to API backend
    try {
      await fetch(`/api/pos/repairs/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to sync status to server", err);
    }
  }

  // Add Custom Issue Tag
  function handleAddCustomIssue() {
    const trimmed = newIssueInput.trim();
    if (!trimmed) return;

    if (!issuePresets.includes(trimmed)) {
      const updated = [...issuePresets, trimmed];
      saveIssuePresetsToStorage(updated);
    }

    if (!formData.selectedIssues.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        selectedIssues: [...prev.selectedIssues, trimmed],
      }));
    }

    setNewIssueInput("");
  }

  // Remove Custom Issue Tag
  function handleRemoveIssuePreset(issueToRemove: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = issuePresets.filter((i) => i !== issueToRemove);
    saveIssuePresetsToStorage(updated);
    setFormData((prev) => ({
      ...prev,
      selectedIssues: prev.selectedIssues.filter((i) => i !== issueToRemove),
    }));
  }

  // Add Custom Accessory Tag
  function handleAddCustomAccessory() {
    const trimmed = newAccessoryInput.trim();
    if (!trimmed) return;

    if (!accessoryPresets.includes(trimmed)) {
      const updated = [...accessoryPresets, trimmed];
      saveAccessoryPresetsToStorage(updated);
    }

    if (!formData.selectedAccessories.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        selectedAccessories: [...prev.selectedAccessories, trimmed],
      }));
    }

    setNewAccessoryInput("");
  }

  // Remove Custom Accessory Tag
  function handleRemoveAccessoryPreset(accToRemove: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = accessoryPresets.filter((a) => a !== accToRemove);
    saveAccessoryPresetsToStorage(updated);
    setFormData((prev) => ({
      ...prev,
      selectedAccessories: prev.selectedAccessories.filter((a) => a !== accToRemove),
    }));
  }

  function toggleIssue(issue: string) {
    setFormData((prev) => {
      const exists = prev.selectedIssues.includes(issue);
      const updated = exists
        ? prev.selectedIssues.filter((i) => i !== issue)
        : [...prev.selectedIssues, issue];
      return { ...prev, selectedIssues: updated };
    });
  }

  function toggleAccessory(acc: string) {
    setFormData((prev) => {
      const exists = prev.selectedAccessories.includes(acc);
      const updated = exists
        ? prev.selectedAccessories.filter((a) => a !== acc)
        : [...prev.selectedAccessories, acc];
      return { ...prev, selectedAccessories: updated };
    });
  }

  // Calculate final estimated total
  const calculatedTotalCost = React.useMemo(() => {
    if (formData.ticketType === "WARRANTY_CLAIM") {
      return formData.hasInWarrantyServiceCharge
        ? Number(formData.inWarrantyServiceCharge) || 0
        : 0;
    } else {
      return Number(formData.estimatedCost) || 0;
    }
  }, [
    formData.ticketType,
    formData.hasInWarrantyServiceCharge,
    formData.inWarrantyServiceCharge,
    formData.estimatedCost,
  ]);

  function openEditModal(ticket: RepairTicket) {
    setEditingTicketId(ticket.id);
    const isWarranty = ticket.problemDescription.includes("WARRANTY");

    setFormData({
      ticketType: isWarranty ? "WARRANTY_CLAIM" : "PAID_REPAIR",
      customerName: ticket.customer.name,
      customerPhone: ticket.customer.phone,
      deviceName: ticket.deviceName.replace(/\s\(IMEI:.*\)/, ""),
      imeiOrSerial: ticket.imeiOrSerial || "",
      warrantyStatus: isWarranty ? "IN_WARRANTY" : "OUT_OF_WARRANTY",
      problemDescription: ticket.problemDescription,
      selectedIssues: [],
      selectedAccessories: [],
      pinPattern: ticket.pinPattern || "",
      hasInWarrantyServiceCharge: ticket.estimatedCost > 0 && isWarranty,
      inWarrantyServiceCharge: String(ticket.estimatedCost || "150"),
      partsCost: "",
      estimatedCost: String(ticket.estimatedCost),
      advancePaid: String(ticket.advancePaid),
      warrantyPolicy: "30_DAYS",
      customPolicyText: "",
    });

    setIsViewModalOpen(false);
    setIsModalOpen(true);
  }

  async function handleCreateOrUpdateTicket(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleanPhone = formData.customerPhone.replace(/\D/g, "").slice(0, 10);
    if (cleanPhone.length !== 10) {
      setError("Customer mobile phone number must be exactly 10 digits.");
      return;
    }

    setSubmitting(true);

    // Build structured policy text
    let resolvedPolicy = "";
    if (formData.ticketType === "WARRANTY_CLAIM") {
      resolvedPolicy = "IN_STORE_WARRANTY_COVERED";
    } else if (formData.warrantyPolicy === "30_DAYS") {
      resolvedPolicy = "30-Day Store Warranty on Replaced Hardware Parts";
    } else if (formData.warrantyPolicy === "60_DAYS") {
      resolvedPolicy = "60-Day Store Warranty on Replaced Hardware Parts";
    } else if (formData.warrantyPolicy === "NO_WARRANTY") {
      resolvedPolicy = "No Warranty / Tested & Verified on Counter Desk";
    } else {
      resolvedPolicy = formData.customPolicyText.trim() || repairTermsSettings.customWarrantyText;
    }

    const issuesSummary = [
      formData.ticketType === "WARRANTY_CLAIM" ? "[🛡️ IN-STORE WARRANTY CLAIM]" : "[🛠️ PAID REPAIR LAB]",
      ...formData.selectedIssues,
      formData.problemDescription.trim(),
    ]
      .filter(Boolean)
      .join(" | ");

    if (!issuesSummary) {
      setError("Please select or describe reported defects.");
      setSubmitting(false);
      return;
    }

    const serviceChargeAmt =
      formData.ticketType === "WARRANTY_CLAIM" && formData.hasInWarrantyServiceCharge
        ? Number(formData.inWarrantyServiceCharge) || 0
        : 0;

    try {
      let createdOrUpdated: RepairTicket;
      if (editingTicketId) {
        const existing = tickets.find((t) => t.id === editingTicketId);
        createdOrUpdated = {
          id: editingTicketId,
          deviceName: `${formData.deviceName}${formData.imeiOrSerial ? ` (IMEI: ${formData.imeiOrSerial})` : ""}`,
          problemDescription: `${issuesSummary}${
            formData.selectedAccessories.length > 0 ? ` | Acc: ${formData.selectedAccessories.join(", ")}` : ""
          }`,
          pinPattern: formData.pinPattern || null,
          estimatedCost: calculatedTotalCost,
          advancePaid: Number(formData.advancePaid) || 0,
          status: existing?.status || "RECEIVED",
          sacCode: "9987",
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customer: {
            id: existing?.customer?.id || `cust-${Date.now()}`,
            name: formData.customerName,
            phone: cleanPhone,
          },
        };

        try {
          await fetch(`/api/pos/repairs/${editingTicketId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceName: createdOrUpdated.deviceName,
              problemDescription: createdOrUpdated.problemDescription,
              pinPattern: createdOrUpdated.pinPattern,
              estimatedCost: createdOrUpdated.estimatedCost,
              advancePaid: createdOrUpdated.advancePaid,
            }),
          });
        } catch (e) {}
      } else {
        // Create new ticket
        const res = await fetch("/api/pos/repairs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: formData.customerName,
            customerPhone: cleanPhone,
            deviceName: `${formData.deviceName}${formData.imeiOrSerial ? ` (IMEI: ${formData.imeiOrSerial})` : ""}`,
            problemDescription: `${issuesSummary}${
              formData.selectedAccessories.length > 0 ? ` | Acc: ${formData.selectedAccessories.join(", ")}` : ""
            }`,
            pinPattern: formData.pinPattern || null,
            estimatedCost: calculatedTotalCost,
            advancePaid: Number(formData.advancePaid) || 0,
            warrantyPolicy: resolvedPolicy,
            hasInWarrantyServiceCharge: formData.ticketType === "WARRANTY_CLAIM" ? formData.hasInWarrantyServiceCharge : false,
            inWarrantyServiceCharge: serviceChargeAmt,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          createdOrUpdated = data.ticket;
        } else {
          createdOrUpdated = {
            id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
            deviceName: `${formData.deviceName}${formData.imeiOrSerial ? ` (IMEI: ${formData.imeiOrSerial})` : ""}`,
            problemDescription: `${issuesSummary}${
              formData.selectedAccessories.length > 0 ? ` | Acc: ${formData.selectedAccessories.join(", ")}` : ""
            }`,
            pinPattern: formData.pinPattern || null,
            estimatedCost: calculatedTotalCost,
            advancePaid: Number(formData.advancePaid) || 0,
            status: "RECEIVED",
            sacCode: "9987",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            customer: {
              id: `cust-${Date.now()}`,
              name: formData.customerName,
              phone: cleanPhone,
            },
          };
        }
      }

      saveLocalRepairTicketToStorage(createdOrUpdated);
      setIsModalOpen(false);
      setEditingTicketId(null);
      loadTickets();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Complete Delivery & Print Bill (NO PREVIEW MODAL SHOWN)
  async function handleFinalDeliveryAndPrintBill() {
    if (!ticketToDeliver) return;
    setDelivering(true);

    const deliveredTicket: RepairTicket = {
      ...ticketToDeliver,
      status: "DELIVERED",
    };

    // 1. Save status override & local ticket
    saveTicketStatusOverrideToStorage(deliveredTicket.id, "DELIVERED");
    saveLocalRepairTicketToStorage(deliveredTicket);

    // 2. Record repair bill into Customer Khata & Transaction Ledger
    if (deliveredTicket.customer) {
      const custPhone = deliveredTicket.customer.phone.replace(/\D/g, "");
      const totalCost = deliveredTicket.estimatedCost || 0;
      const adv = deliveredTicket.advancePaid || 0;
      const due = Math.max(0, totalCost - adv);
      const isUdhaarRepair = due > 0;

      const savedCustomersStr = localStorage.getItem("company_customers_db");
      if (savedCustomersStr) {
        try {
          const savedList: any[] = JSON.parse(savedCustomersStr);
          let targetCustId = deliveredTicket.customer.id;
          let newBal = 0;

          const updatedList = savedList.map((c: any) => {
            if (c.phone.replace(/\D/g, "") === custPhone || c.id === targetCustId) {
              targetCustId = c.id;
              const prevBal = typeof c.currentBalance === "number" ? c.currentBalance : 0;
              const prevSpend = typeof c.totalLifetimeSpend === "number" ? c.totalLifetimeSpend : 0;
              newBal = isUdhaarRepair ? prevBal + due : prevBal;
              return {
                ...c,
                currentBalance: newBal,
                totalLifetimeSpend: prevSpend + totalCost,
                lastActive: new Date().toISOString().split("T")[0],
              };
            }
            return c;
          });

          localStorage.setItem("company_customers_db", JSON.stringify(updatedList));

          // Append to transaction ledger
          const ledgerKey = `company_customer_ledger_${targetCustId}`;
          const savedLedgerStr = localStorage.getItem(ledgerKey);
          const savedLedger = savedLedgerStr ? JSON.parse(savedLedgerStr) : [];

          const repairTx = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            invoiceNumber: getDisplayTicketId(deliveredTicket.id),
            type: isUdhaarRepair ? "UDHAAR_SALE" : "REGULAR_SALE",
            description: `Mobile Repair: ${deliveredTicket.deviceName} (${deliveredTicket.problemDescription})`,
            totalAmount: totalCost,
            paidAmount: adv,
            balanceAdded: due,
            paymentMode: isUdhaarRepair ? "UDHAAR" : "CASH",
            balanceAfter: newBal,
          };

          localStorage.setItem(ledgerKey, JSON.stringify([repairTx, ...savedLedger]));
        } catch (e) {
          console.error("Failed recording repair transaction to Khata", e);
        }
      }
    }

    // 2. Update React state immediately
    setTickets((prev) =>
      prev.map((t) => (t.id === deliveredTicket.id ? deliveredTicket : t))
    );

    // 3. Set ticketToView so printable receipt container is populated
    setTicketToView(deliveredTicket);

    // 4. Close delivery modal immediately
    setIsDeliveryModalOpen(false);
    setTicketToDeliver(null);
    setIsViewModalOpen(false);
    setDelivering(false);

    // 5. Trigger browser native print directly
    setTimeout(() => {
      window.print();
    }, 150);

    // 6. Sync PATCH to API in background without blocking print
    try {
      await fetch(`/api/pos/repairs/${deliveredTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DELIVERED" }),
      });
    } catch (err) {
      console.warn("Background delivery status sync warning", err);
    }
  }

  // Compute Stats
  const stats = React.useMemo(() => {
    const total = tickets.length;
    const warrantyClaims = tickets.filter((t) => t.problemDescription.includes("WARRANTY")).length;
    const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS" || t.status === "RECEIVED").length;
    const completed = tickets.filter((t) => t.status === "COMPLETED").length;
    const delivered = tickets.filter((t) => t.status === "DELIVERED").length;
    const totalEstRevenue = tickets.reduce((sum, t) => sum + t.estimatedCost, 0);
    return { total, warrantyClaims, inProgress, completed, delivered, totalEstRevenue };
  }, [tickets]);

  const tabCounts = React.useMemo(() => {
    return {
      ALL: tickets.length,
      RECEIVED: tickets.filter((t) => t.status === "RECEIVED").length,
      IN_PROGRESS: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      COMPLETED: tickets.filter((t) => t.status === "COMPLETED").length,
      DELIVERED: tickets.filter((t) => t.status === "DELIVERED").length,
    };
  }, [tickets]);

  const filteredTickets = React.useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesTab = activeTab === "ALL" || ticket.status === activeTab;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        ticket.id.toLowerCase().includes(q) ||
        ticket.deviceName.toLowerCase().includes(q) ||
        ticket.customer.name.toLowerCase().includes(q) ||
        ticket.customer.phone.toLowerCase().includes(q) ||
        (ticket.imeiOrSerial && ticket.imeiOrSerial.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [tickets, activeTab, searchQuery]);

  return (
    <div className="p-3 sm:p-5 pb-28 space-y-4 max-w-[1600px] mx-auto flex flex-col min-h-full bg-slate-50/50">
      {/* 1. Sleek Ultra-Compact Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white shadow-xs">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              Warranty Claims &amp; Repairs
            </h1>
            <span className="text-xs bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 px-2.5 py-0.5 rounded-lg font-mono font-extrabold">
              {stats.total} Active
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
            title="Configure Admin Warranty Terms & Receipts"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setEditingTicketId(null);
              setFormData({
                ticketType: "PAID_REPAIR",
                customerName: "",
                customerPhone: "",
                deviceName: "",
                imeiOrSerial: "",
                warrantyStatus: "OUT_OF_WARRANTY",
                problemDescription: "",
                selectedIssues: [],
                selectedAccessories: [],
                pinPattern: "",
                hasInWarrantyServiceCharge: false,
                inWarrantyServiceCharge: "150",
                partsCost: "",
                estimatedCost: "",
                advancePaid: "",
                warrantyPolicy: "30_DAYS",
                customPolicyText: "",
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Sheet</span>
          </button>
        </div>
      </div>

      {/* 2. Premium Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3 shrink-0">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Jobs</div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-0.5">{stats.total}</div>
          </div>
          <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
            <Wrench className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Warranty</div>
            <div className="text-lg sm:text-xl font-black text-emerald-700 font-mono mt-0.5">{stats.warrantyClaims}</div>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Shield className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-blue-600 uppercase tracking-wider">In Progress</div>
            <div className="text-lg sm:text-xl font-black text-blue-700 font-mono mt-0.5">{stats.inProgress}</div>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-purple-600 uppercase tracking-wider">Ready Pickup</div>
            <div className="text-lg sm:text-xl font-black text-purple-700 font-mono mt-0.5">{stats.completed}</div>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
            <PackageCheck className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="text-[10px] sm:text-[11px] font-bold text-fuchsia-600 uppercase tracking-wider">Est Revenue</div>
            <div className="text-lg sm:text-xl font-black text-fuchsia-800 font-mono mt-0.5">₹{stats.totalEstRevenue.toLocaleString("en-IN")}</div>
          </div>
          <div className="p-2 bg-fuchsia-50 text-fuchsia-700 rounded-xl">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80 flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search ticket #, device, IMEI, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-10 rounded-xl text-xs font-medium border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-fuchsia-600 focus:outline-none transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
                /
              </kbd>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none justify-between sm:justify-end">
            {/* Filter Tabs with count badges */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              {(["ALL", "RECEIVED", "IN_PROGRESS", "COMPLETED", "DELIVERED"] as const).map((tab) => {
                const count = tabCounts[tab];
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                      active
                        ? "bg-fuchsia-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <span>{tab.replace("_", " ")}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Table / Card Display */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 text-xs font-bold shadow-2xs">
          <Wrench className="w-8 h-8 text-slate-300 animate-bounce mx-auto mb-2" />
          <span>Loading warranty &amp; repair lab tickets...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 text-xs font-bold shadow-2xs">
          No repair tickets found matching search filters.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-900 text-slate-200 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-800 select-none">
                  <th className="py-3 px-4 w-28">Ticket #</th>
                  <th className="py-3 px-4 w-44">Customer</th>
                  <th className="py-3 px-4 w-52">Device &amp; PIN</th>
                  <th className="py-3 px-4">Reported Issue / Defect</th>
                  <th className="py-3 px-4 w-32">Category</th>
                  <th className="py-3 px-4 w-40">Status</th>
                  <th className="py-3 px-4 w-32 text-right">Cost / Advance</th>
                  <th className="py-3 px-4 w-56 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => {
                  const isWarranty = ticket.problemDescription.includes("WARRANTY");
                  const displayId = getDisplayTicketId(ticket.id);

                  // Extract clean defect string without brackets
                  const cleanDefect = ticket.problemDescription
                    .replace(/\[.*?\]\s*\|?\s*/g, "")
                    .replace(/\|?\s*Acc:.*$/g, "")
                    .trim();

                  return (
                    <tr key={ticket.id} className="hover:bg-fuchsia-50/30 transition-colors group">
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-xs text-fuchsia-700 bg-fuchsia-50 px-2.5 py-1 rounded-xl border border-fuchsia-200/80 shadow-2xs">
                          {displayId}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-xs whitespace-nowrap">{ticket.customer.name}</div>
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{ticket.customer.phone}</span>
                        </div>
                      </td>

                      {/* Device & PIN */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900 text-xs">{ticket.deviceName}</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {ticket.imeiOrSerial && (
                            <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md font-semibold">
                              SN: {ticket.imeiOrSerial}
                            </span>
                          )}
                          {ticket.pinPattern && (
                            <span className="text-[10px] font-mono text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded-md font-bold">
                              PIN: {ticket.pinPattern}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reported Defect Tags */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-700 font-semibold text-xs line-clamp-2 leading-relaxed">
                          {cleanDefect || ticket.problemDescription}
                        </p>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isWarranty ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-xl inline-flex items-center gap-1 shadow-2xs">
                            <Shield className="w-3 h-3 text-emerald-600" />
                            <span>WARRANTY</span>
                          </span>
                        ) : (
                          <span className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black px-2.5 py-1 rounded-xl inline-flex items-center gap-1 shadow-2xs">
                            <Wrench className="w-3 h-3 text-purple-600" />
                            <span>PAID LAB</span>
                          </span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleQuickStatusChange(ticket.id, e.target.value as any)}
                          className={`text-xs font-black px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all shadow-xs ${
                            ticket.status === "RECEIVED"
                              ? "bg-amber-500 text-white border-amber-600"
                              : ticket.status === "IN_PROGRESS"
                              ? "bg-blue-600 text-white border-blue-700"
                              : ticket.status === "COMPLETED"
                              ? "bg-purple-600 text-white border-purple-700"
                              : "bg-emerald-600 text-white border-emerald-700"
                          }`}
                        >
                          <option value="RECEIVED" className="bg-white text-slate-900">RECEIVED</option>
                          <option value="IN_PROGRESS" className="bg-white text-slate-900">IN PROGRESS</option>
                          <option value="COMPLETED" className="bg-white text-slate-900">COMPLETED</option>
                          <option value="DELIVERED" className="bg-white text-slate-900">DELIVERED</option>
                        </select>
                      </td>

                      {/* Cost / Advance */}
                      <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 text-xs">
                          {ticket.estimatedCost === 0 ? "₹0 (Free)" : `₹${ticket.estimatedCost}`}
                        </div>
                        <div className="text-[10px] text-slate-500">Adv: -₹{ticket.advancePaid}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setTicketToView(ticket);
                              setIsViewModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 font-extrabold transition-all flex items-center space-x-1 text-xs cursor-pointer active:scale-95"
                            title="View Details & Edit"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => handleDirectPrintTicket(ticket)}
                            className="px-3 py-1.5 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 rounded-xl border border-fuchsia-200 font-extrabold transition-all flex items-center space-x-1 text-xs cursor-pointer active:scale-95"
                            title="Directly Print Job Sheet / Receipt"
                          >
                            <Printer className="w-3.5 h-3.5 text-fuchsia-700" />
                            <span>Print</span>
                          </button>

                          {ticket.status !== "DELIVERED" && (
                            <button
                              onClick={() => {
                                setTicketToDeliver(ticket);
                                setIsDeliveryModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Deliver</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT WARRANTY & REPAIR JOB SHEET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header Banner with Theme Gradient */}
            <div className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    <span>{editingTicketId ? "Edit Mobile Job Sheet Details" : "Create Mobile Job Sheet"}</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wider">
                      SAC 9987
                    </span>
                  </h3>
                  <p className="text-xs text-fuchsia-100 font-medium">
                    {editingTicketId ? "Update repair instructions, defect notes or price" : "Log in-store warranty claims, hardware repairs & defect tags"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTicketId(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Scrollable Content */}
            <form onSubmit={handleCreateOrUpdateTicket} className="p-5 sm:p-6 space-y-5 text-xs overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* SECTION 1: Service Category Selector */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                  1. Select Ticket Category *
                </label>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        ticketType: "WARRANTY_CLAIM",
                        warrantyStatus: "IN_WARRANTY",
                      })
                    }
                    className={`py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                      formData.ticketType === "WARRANTY_CLAIM"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-600 shadow-md shadow-emerald-500/20 font-black"
                        : "bg-white text-slate-700 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>🛡️ In-Store Warranty Claim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, ticketType: "PAID_REPAIR", warrantyStatus: "OUT_OF_WARRANTY" })}
                    className={`py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                      formData.ticketType === "PAID_REPAIR"
                        ? "bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 text-white border-fuchsia-600 shadow-md shadow-fuchsia-500/20 font-black"
                        : "bg-white text-slate-700 border-transparent hover:bg-slate-100"
                    }`}
                  >
                    <Wrench className="w-4 h-4" />
                    <span>🛠️ Paid Hardware Repair</span>
                  </button>
                </div>
              </div>

              {/* In-Warranty Service Charge Option */}
              {formData.ticketType === "WARRANTY_CLAIM" && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer font-extrabold text-emerald-950 text-xs">
                      <input
                        type="checkbox"
                        checked={formData.hasInWarrantyServiceCharge}
                        onChange={(e) =>
                          setFormData({ ...formData, hasInWarrantyServiceCharge: e.target.checked })
                        }
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span>Apply Optional Service Charge for Warranty Claim</span>
                    </label>
                  </div>
                  {formData.hasInWarrantyServiceCharge && (
                    <div className="pt-1 flex items-center gap-2">
                      <span className="font-bold text-slate-700">Service Fee (₹):</span>
                      <input
                        type="number"
                        value={formData.inWarrantyServiceCharge}
                        onChange={(e) => setFormData({ ...formData, inWarrantyServiceCharge: e.target.value })}
                        className="w-32 bg-white border border-emerald-300 rounded-xl px-3 py-1.5 font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-fuchsia-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Mobile Phone (10 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-fuchsia-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* SECTION 3: Device Model & IMEI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Device Name / Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 Pro 128GB Sierra Blue"
                    value={formData.deviceName}
                    onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-fuchsia-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">IMEI / Serial Number</label>
                  <input
                    type="text"
                    placeholder="IMEI 15 digits or Serial"
                    value={formData.imeiOrSerial}
                    onChange={(e) => setFormData({ ...formData, imeiOrSerial: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:border-fuchsia-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* SECTION 4: Defect & Issue Options */}
              <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                    4. Reported Issues / Defect Tags
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Click to select | ✕ removes tag</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {issuePresets.map((issue) => {
                    const sel = formData.selectedIssues.includes(issue);
                    return (
                      <div
                        key={issue}
                        onClick={() => toggleIssue(issue)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                          sel
                            ? "bg-fuchsia-600 text-white border-fuchsia-700 shadow-xs font-black"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-fuchsia-50 hover:border-fuchsia-200 hover:text-fuchsia-900"
                        }`}
                      >
                        <span>+ {issue}</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveIssuePreset(issue, e)}
                          title="Remove from saved presets"
                          className="hover:bg-black/20 rounded-full p-0.5 text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Issue Input Group */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="+ Type custom defect (e.g. Face ID Failure, Camera Glass)"
                    value={newIssueInput}
                    onChange={(e) => setNewIssueInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomIssue();
                      }
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-fuchsia-600 focus:ring-2 focus:ring-fuchsia-600/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomIssue}
                    className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    + Add Issue
                  </button>
                </div>
              </div>

              {/* SECTION 5: Accessories Handed Over */}
              <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                    5. Accessories Handed Over
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Click to select | ✕ removes tag</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {accessoryPresets.map((acc) => {
                    const sel = formData.selectedAccessories.includes(acc);
                    return (
                      <div
                        key={acc}
                        onClick={() => toggleAccessory(acc)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                          sel
                            ? "bg-purple-600 text-white border-purple-700 shadow-xs font-black"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-900"
                        }`}
                      >
                        <span>+ {acc}</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAccessoryPreset(acc, e)}
                          title="Remove from saved presets"
                          className="hover:bg-black/20 rounded-full p-0.5 text-slate-400 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Accessory Input Group */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="+ Type custom accessory (e.g. Stylus Pen, Screen Guard)"
                    value={newAccessoryInput}
                    onChange={(e) => setNewAccessoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomAccessory();
                      }
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAccessory}
                    className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    + Add Accessory
                  </button>
                </div>
              </div>

              {/* SECTION 6: Technician Notes & Lock PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Technician Notes</label>
                  <input
                    type="text"
                    placeholder="Special repair notes or instructions"
                    value={formData.problemDescription}
                    onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:border-fuchsia-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Device Screen Lock PIN / Pattern</label>
                  <input
                    type="text"
                    placeholder="PIN code (e.g. 1234 or Pattern 1-2-5-8)"
                    value={formData.pinPattern}
                    onChange={(e) => setFormData({ ...formData, pinPattern: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-medium focus:border-fuchsia-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* SECTION 7: Replaced Parts Warranty Policy & Financials */}
              {formData.ticketType === "PAID_REPAIR" && (
                <div className="space-y-2.5 p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
                  <label className="font-extrabold text-slate-900 block text-xs uppercase tracking-wider">
                    Replaced Parts Warranty Terms (Select Policy):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, warrantyPolicy: "30_DAYS" })}
                      className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                        formData.warrantyPolicy === "30_DAYS"
                          ? "bg-fuchsia-50 border-fuchsia-300 text-fuchsia-900 shadow-2xs font-extrabold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      30-Day Warranty
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, warrantyPolicy: "60_DAYS" })}
                      className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                        formData.warrantyPolicy === "60_DAYS"
                          ? "bg-fuchsia-50 border-fuchsia-300 text-fuchsia-900 shadow-2xs font-extrabold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      60-Day Warranty
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, warrantyPolicy: "NO_WARRANTY" })}
                      className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                        formData.warrantyPolicy === "NO_WARRANTY"
                          ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-extrabold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      No Warranty (Desk Check)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, warrantyPolicy: "CUSTOM" })}
                      className={`p-2.5 rounded-xl border font-bold text-center cursor-pointer transition-all ${
                        formData.warrantyPolicy === "CUSTOM"
                          ? "bg-purple-50 border-purple-300 text-purple-900 shadow-2xs font-extrabold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      Custom Terms
                    </button>
                  </div>

                  {formData.warrantyPolicy === "CUSTOM" && (
                    <input
                      type="text"
                      placeholder="Specify custom warranty (e.g. 90-Day Warranty on Original Screen)"
                      value={formData.customPolicyText}
                      onChange={(e) => setFormData({ ...formData, customPolicyText: e.target.value })}
                      className="w-full bg-white border border-purple-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  )}
                </div>
              )}

              {/* Financial Estimates Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">
                    {formData.ticketType === "WARRANTY_CLAIM" ? "Total Charge (₹)" : "Estimated Total Fee (₹) *"}
                  </label>
                  <input
                    type="number"
                    disabled={formData.ticketType === "WARRANTY_CLAIM"}
                    placeholder="Total Fee ₹"
                    value={calculatedTotalCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-extrabold text-sm focus:border-fuchsia-600 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Advance Amount Paid (₹)</label>
                  <input
                    type="number"
                    placeholder="Advance ₹"
                    value={formData.advancePaid}
                    onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-extrabold text-sm focus:border-fuchsia-600 outline-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTicketId(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black shadow-lg shadow-fuchsia-500/25 transition-all cursor-pointer active:scale-95 flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? "Processing..." : editingTicketId ? "Save Changes" : "Create Job Sheet"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN RECEIPT & WARRANTY POLICY SETTINGS MODAL */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-fuchsia-600" />
                Configure Admin Repair Warranty Terms &amp; Receipt Footer
              </h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Default Hardware Repair Warranty Term:</label>
                <select
                  value={repairTermsSettings.defaultWarrantyPolicy}
                  onChange={(e) =>
                    setRepairTermsSettings({
                      ...repairTermsSettings,
                      defaultWarrantyPolicy: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                >
                  <option value="30_DAYS">30-Day Store Warranty on Replaced Hardware Parts</option>
                  <option value="60_DAYS">60-Day Store Warranty on Replaced Hardware Parts</option>
                  <option value="NO_WARRANTY">No Warranty / Test &amp; Verify on Counter Desk</option>
                  <option value="CUSTOM">Custom Warranty Policy Statement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Warranty Policy Statement:</label>
                <input
                  type="text"
                  value={repairTermsSettings.customWarrantyText}
                  onChange={(e) =>
                    setRepairTermsSettings({ ...repairTermsSettings, customWarrantyText: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Custom Thank You Message on Receipts:</label>
                <input
                  type="text"
                  value={repairTermsSettings.thankYouMessage}
                  onChange={(e) =>
                    setRepairTermsSettings({ ...repairTermsSettings, thankYouMessage: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Desk Verification / Counter Disclaimer:</label>
                <textarea
                  rows={2}
                  value={repairTermsSettings.deskCheckNote}
                  onChange={(e) =>
                    setRepairTermsSettings({ ...repairTermsSettings, deskCheckNote: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveRepairTermsSettingsToStorage(repairTermsSettings);
                    setIsSettingsModalOpen(false);
                  }}
                  className="px-5 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer"
                >
                  Save Admin Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVER DEVICE & GENERATE BILL MODAL */}
      {isDeliveryModalOpen && ticketToDeliver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Deliver Device &amp; Generate Bill</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsDeliveryModalOpen(false);
                  setTicketToDeliver(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Device & Customer Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-700">
              <div>
                Device: <strong className="text-slate-900 font-extrabold">{ticketToDeliver.deviceName}</strong>
              </div>
              <div>
                Customer: <strong className="text-slate-900 font-extrabold">{ticketToDeliver.customer.name} ({ticketToDeliver.customer.phone})</strong>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-700 font-medium">
                <span>Total Repair Fee:</span>
                <span className="font-mono font-bold">₹{ticketToDeliver.estimatedCost}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Advance Amount Paid:</span>
                <span className="font-mono font-bold">-₹{ticketToDeliver.advancePaid}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200/80 flex justify-between text-emerald-900 font-black text-sm">
                <span>Net Amount Collected:</span>
                <span className="font-mono font-extrabold text-emerald-700">
                  ₹{ticketToDeliver.estimatedCost - ticketToDeliver.advancePaid}
                </span>
              </div>
            </div>

            {/* Complete Delivery & Directly Print Bill Button */}
            <button
              type="button"
              disabled={delivering}
              onClick={handleFinalDeliveryAndPrintBill}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98 text-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{delivering ? "Processing Delivery..." : "Complete Delivery & Print Final Bill"}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW TICKET & ON-SCREEN PREVIEW MODAL */}
      {isViewModalOpen && ticketToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Header with Actions */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-fuchsia-600 text-white shadow-xs">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    <span>{getDisplayTicketId(ticketToView.id)}</span>
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ticketToView.status === "RECEIVED"
                          ? "bg-amber-500 text-white"
                          : ticketToView.status === "IN_PROGRESS"
                          ? "bg-blue-500 text-white"
                          : ticketToView.status === "COMPLETED"
                          ? "bg-purple-500 text-white"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {ticketToView.status.replace("_", " ")}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Created on {new Date(ticketToView.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* EDIT BUTTON INSIDE VIEW MODAL */}
                <button
                  type="button"
                  onClick={() => openEditModal(ticketToView)}
                  className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Ticket</span>
                </button>

                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Visual Receipt Preview Inside Modal */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3 font-mono select-text shadow-2xs">
                {/* Store Header */}
                <div className="text-center border-b border-slate-200 pb-2 space-y-0.5">
                  {Boolean(storeProfile.logoUrl?.trim()) && (
                    <img
                      src={storeProfile.logoUrl}
                      alt="Company Logo"
                      className="h-10 w-auto object-contain mx-auto mb-1 shrink-0"
                    />
                  )}
                  <h2 className="font-black text-sm uppercase text-slate-900 tracking-tight">{storeProfile.businessName}</h2>
                  <p className="text-[10px] text-slate-600 font-semibold">{storeProfile.storeSubName}</p>
                  <p className="text-[9px] text-slate-400">Ph: {storeProfile.storePhone} | GSTIN: {storeProfile.gstin}</p>
                </div>

                {/* Ticket Details */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between font-bold">
                    <span>Job Sheet #:</span>
                    <span className="text-fuchsia-800">{getDisplayTicketId(ticketToView.id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(ticketToView.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-bold text-slate-900">{ticketToView.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{ticketToView.customer.phone}</span>
                  </div>
                </div>

                {/* Device & Defect Breakdown */}
                <div className="border-t border-b border-slate-200 py-2 space-y-1 text-[11px]">
                  <div>
                    Device Model: <strong className="text-slate-900">{ticketToView.deviceName}</strong>
                  </div>
                  {ticketToView.imeiOrSerial && (
                    <div>
                      IMEI / Serial #: <strong className="text-purple-700">{ticketToView.imeiOrSerial}</strong>
                    </div>
                  )}
                  <div>
                    Reported Defects: <span className="text-slate-700 font-semibold">{ticketToView.problemDescription}</span>
                  </div>
                  {ticketToView.accessoriesReceived && (
                    <div>
                      Accessories Received: <span className="text-purple-800 font-bold">{ticketToView.accessoriesReceived}</span>
                    </div>
                  )}
                  {ticketToView.pinPattern && (
                    <div>
                      Lock Code/Pattern: <strong className="text-purple-900 bg-purple-100 px-1 rounded">{ticketToView.pinPattern}</strong>
                    </div>
                  )}
                </div>

                {/* Financial Breakdown */}
                <div className="space-y-1 text-right text-[11px] border-b border-slate-200 pb-2">
                  <div className="flex justify-between">
                    <span>Service Type:</span>
                    <span className="font-extrabold text-emerald-700">
                      {ticketToView.problemDescription.includes("WARRANTY")
                        ? "🛡️ IN-STORE WARRANTY CLAIM"
                        : "🛠️ PAID LAB REPAIR"}
                    </span>
                  </div>

                  {ticketToView.serviceCharge && ticketToView.serviceCharge > 0 ? (
                    <div className="flex justify-between text-slate-700">
                      <span>In-Warranty Service Fee:</span>
                      <span>₹{ticketToView.serviceCharge}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between font-bold text-slate-900 pt-1">
                    <span>Total Repair Fee:</span>
                    <span>₹{ticketToView.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Advance Amount Paid:</span>
                    <span>-₹{ticketToView.advancePaid}</span>
                  </div>
                  <div className="flex justify-between font-black text-fuchsia-800 text-xs pt-1 border-t border-slate-200">
                    <span>Net Balance Payable:</span>
                    <span>₹{ticketToView.estimatedCost - ticketToView.advancePaid}</span>
                  </div>
                </div>

                {/* Terms Notice */}
                <div className="text-center space-y-1.5 pt-1">
                  <div className="p-2 bg-slate-100 rounded-xl text-[9.5px] text-slate-700 font-sans leading-tight border border-slate-200">
                    {ticketToView.problemDescription.includes("WARRANTY") ? (
                      <p className="font-bold text-emerald-800">
                        🛡️ <strong>In-Store Warranty Claim:</strong> Free hardware service covered under store warranty terms. Verification subject to internal lab inspection.
                      </p>
                    ) : (
                      <p className="font-bold text-purple-900">
                        📜 <strong>Warranty Policy:</strong> {ticketToView.warrantyPolicy || repairTermsSettings.customWarrantyText}
                      </p>
                    )}
                    <p className="mt-1 text-slate-500">{repairTermsSettings.deskCheckNote}</p>
                  </div>

                  <p className="text-[10px] text-slate-700 font-bold">{repairTermsSettings.thankYouMessage}</p>
                  <div className="pt-1 flex items-center justify-center space-x-1.5 text-[8.5px] text-slate-500 font-mono">
                    <img
                      src="/brand/logo.png"
                      alt="EcoDigiTech Logo"
                      className="h-3.5 w-auto object-contain shrink-0"
                    />
                    <span>Powered &amp; Managed by EcoDigiTech • www.ecodigitech.com</span>
                  </div>
                </div>
              </div>

              {/* View Modal Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => openEditModal(ticketToView)}
                  className="px-4 py-2 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 text-fuchsia-700" />
                  <span>Edit Details</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-700 text-white font-black rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>🖨️ Print Job Sheet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN UNIFIED PRINTABLE RECEIPT CONTAINER FOR WINDOW.PRINT() */}
      {ticketToView && (
        <A4GstInvoice
          invoiceNumber={getDisplayTicketId(ticketToView.id)}
          dateTime={new Date(ticketToView.createdAt).toLocaleDateString("en-IN")}
          storeName={storeProfile.businessName}
          storeSubName={storeProfile.storeSubName}
          storeAddress={storeProfile.storeAddress}
          storePhone={storeProfile.storePhone}
          storeGstin={storeProfile.gstin}
          placeOfSupply={getPlaceOfSupplyFromAddress(storeProfile.storeAddress)}
          logoUrl={storeProfile.logoUrl}

          customer={ticketToView.customer}
          items={[
            {
              id: ticketToView.id,
              category: "REPAIR_PART",
              title: `${ticketToView.deviceName} (${ticketToView.problemDescription.replace(/\[.*?\]\s*\|?\s*/g, "").replace(/\|?\s*Acc:.*$/g, "").trim()})`,
              barcode: ticketToView.id,
              imei1: ticketToView.imeiOrSerial || undefined,
              purchasePrice: 0,
              unitPrice: ticketToView.estimatedCost,
              totalAmount: ticketToView.estimatedCost,
              quantity: 1,
              hsnSacCode: ticketToView.sacCode || "9987",
              gstRate: 18.0,
              taxableAmount: ticketToView.estimatedCost - (ticketToView.estimatedCost * 18) / 118,
              taxAmount: (ticketToView.estimatedCost * 18) / 118,
            },
          ]}
          summary={{
            subtotal: ticketToView.estimatedCost,
            discount: 0,
            taxableAmount: ticketToView.estimatedCost - (ticketToView.estimatedCost * 18) / 118,
            taxAmount: (ticketToView.estimatedCost * 18) / 118,
            cgst: (ticketToView.estimatedCost * 9) / 118,
            sgst: (ticketToView.estimatedCost * 9) / 118,
            igst: 0,
            grandTotal: ticketToView.estimatedCost,
            tenderMode: "CASH",
            amountPaid: ticketToView.estimatedCost,
            changeDue: 0,
          }}
          isThermal80mm={printMode === "THERMAL_80MM"}
        />
      )}
    </div>
  );
}
