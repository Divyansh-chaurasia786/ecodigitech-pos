"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useBarcodeScanner } from "@/lib/hardware/barcodeScanner";
import { SmartSearchBar } from "@/components/pos/SmartSearchBar";
import { DynamicUpiQrModal } from "@/components/pos/DynamicUpiQrModal";
import { UniversalBillSearchModal } from "@/components/pos/UniversalBillSearchModal";
import { ThermalReceipt } from "@/components/hardware/ThermalReceipt";
import { A4GstInvoice } from "@/components/hardware/A4GstInvoice";
import { CartItem, CustomerInfo, InvoiceSummary, ProductItem, TenderMode } from "@/types/pos";
import { getPlaceOfSupplyFromAddress } from "@/utils/gstUtils";
import {
  ShoppingCart,
  User,
  Plus,
  Minus,
  CreditCard,
  QrCode,
  Banknote,
  BookOpen,
  Printer,
  Zap,
  Search,
  Phone,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

// Initial Demo Store Inventory
const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "P-101",
    category: "BRAND_NEW",
    title: "iPhone 15 Pro Max (256GB - Natural Titanium)",
    barcode: "8901234567890",
    imei1: "354890123456789",
    imei2: "354890123456790",
    serialNumber: "DX3H9012345",
    purchasePrice: 125000,
    sellingPrice: 144900,
    stockQuantity: 4,
    hsnSacCode: "8517",
    gstRate: 18.0,
  },
  {
    id: "P-102",
    category: "REFURBISHED",
    title: "Samsung Galaxy S22 Ultra (Refurbished - Like New)",
    barcode: "8909876543210",
    imei1: "359876543210987",
    serialNumber: "R53N9098765",
    purchasePrice: 38000,
    sellingPrice: 46999,
    stockQuantity: 2,
    hsnSacCode: "8517",
    gstRate: 18.0,
  },
  {
    id: "P-103",
    category: "ACCESSORY",
    title: "Anker 65W GaN Fast Wall Charger",
    barcode: "8901122334455",
    purchasePrice: 1800,
    sellingPrice: 2999,
    stockQuantity: 15,
    hsnSacCode: "8504",
    gstRate: 18.0,
  },
  {
    id: "P-104",
    category: "ACCESSORY",
    title: "Tempered Glass Guard",
    barcode: "8904444555666",
    purchasePrice: 40,
    sellingPrice: 299,
    stockQuantity: 50,
    hsnSacCode: "7007",
    gstRate: 18.0,
  },
  {
    id: "p5",
    category: "ACCESSORY",
    title: "Matte Back Cover Case",
    barcode: "8907777888999",
    purchasePrice: 60,
    sellingPrice: 349,
    stockQuantity: 40,
    hsnSacCode: "3926",
    gstRate: 18.0,
  },
  {
    id: "p6",
    category: "REPAIR_PART",
    title: "iPhone 13 OLED Display Panel",
    barcode: "8900000111222",
    purchasePrice: 4500,
    sellingPrice: 7500,
    stockQuantity: 3,
    hsnSacCode: "9987",
    gstRate: 18.0,
  },
  {
    id: "p7",
    category: "ACCESSORY",
    title: "TWS Earbuds Pro",
    barcode: "8905555666777",
    purchasePrice: 600,
    sellingPrice: 1499,
    stockQuantity: 15,
    hsnSacCode: "8518",
    gstRate: 18.0,
  },
  {
    id: "p8",
    category: "ACCESSORY",
    title: "USB-C Braided Cable",
    barcode: "8908888999000",
    purchasePrice: 150,
    sellingPrice: 499,
    stockQuantity: 30,
    hsnSacCode: "8544",
    gstRate: 18.0,
  },
  {
    id: "p9",
    category: "ACCESSORY",
    title: "MagSafe Car Mount",
    barcode: "8902222333444",
    purchasePrice: 300,
    sellingPrice: 799,
    stockQuantity: 12,
    hsnSacCode: "3926",
    gstRate: 18.0,
  },
];

const QUICK_TILES: ProductItem[] = [
  INITIAL_PRODUCTS[2], // 25W Charger
  INITIAL_PRODUCTS[3], // Tempered Glass
  INITIAL_PRODUCTS[4], // Back Cover
  INITIAL_PRODUCTS[6], // TWS Earbuds
  INITIAL_PRODUCTS[7], // USB-C Cable
  INITIAL_PRODUCTS[8], // MagSafe Mount
];

const INITIAL_COMPANY_CUSTOMERS: CustomerInfo[] = [
  {
    id: "cust-1",
    name: "Ramesh Sharma",
    phone: "9876543210",
    aadhaarNo: "9876-5432-1098",
    panNo: "ABCDE1234F",
    gstin: "07AAAAA0000A1Z5",
    address: "Connaught Place, New Delhi",
  },
  {
    id: "cust-2",
    name: "Anita Gupta",
    phone: "9812345678",
    aadhaarNo: "8765-4321-0987",
    panNo: "BCDEF2345G",
    address: "Sector 18, Noida",
  },
  {
    id: "cust-3",
    name: "Vikram Malhotra",
    phone: "9899887766",
    aadhaarNo: "7654-3210-9876",
    panNo: "CDEFG3456H",
    address: "Cyber City, Gurugram",
  },
];

export default function POSBillingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [tenderMode, setTenderMode] = useState<TenderMode | null>(null);
  const [cardAuthRef, setCardAuthRef] = useState<string>("");
  const [printMode, setPrintMode] = useState<"THERMAL_80MM" | "A4_GST">("A4_GST");
  
  // Company Customer Database & Lookup Modal State
  const [customerDb, setCustomerDb] = useState<CustomerInfo[]>(INITIAL_COMPANY_CUSTOMERS);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [shippedToCustomer, setShippedToCustomer] = useState<CustomerInfo | null>(null);
  const [useDifferentShipping, setUseDifferentShipping] = useState<boolean>(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalStep, setCustomerModalStep] = useState<"LOOKUP" | "REGISTER">("LOOKUP");
  const [searchPhoneInput, setSearchPhoneInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customer Form Inputs
  const [custPhoneInput, setCustPhoneInput] = useState("");
  const [custNameInput, setCustNameInput] = useState("");
  const [custAadhaarInput, setCustAadhaarInput] = useState("");
  const [custPanInput, setCustPanInput] = useState("");
  const [custAddressInput, setCustAddressInput] = useState("");
  const [custGstinInput, setCustGstinInput] = useState("");

  // Shipping Form Inputs
  const [shipNameInput, setShipNameInput] = useState("");
  const [shipAddressInput, setShipAddressInput] = useState("");
  const [shipGstinInput, setShipGstinInput] = useState("");

  // Load customer database from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("company_customers_db");
      if (saved) {
        setCustomerDb(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed loading customer database", err);
    }
  }, []);

  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const openCustomerModal = useCallback((forceStep?: "LOOKUP" | "REGISTER", customerToEdit?: CustomerInfo | null) => {
    const targetCust = customerToEdit !== undefined ? customerToEdit : (forceStep === "REGISTER" ? null : customer);

    if (targetCust) {
      setEditingCustomerId(targetCust.id || targetCust.phone);
      setCustNameInput(targetCust.name || "");
      setCustPhoneInput(targetCust.phone || "");
      setCustAadhaarInput(targetCust.aadhaarNo || "");
      setCustPanInput(targetCust.panNo || "");
      setCustAddressInput(targetCust.address || "");
      setCustGstinInput(targetCust.gstin || "");
      setCustomerModalStep("REGISTER");
    } else {
      setEditingCustomerId(null);
      setSearchPhoneInput("");
      setCustNameInput("");
      setCustPhoneInput("");
      setCustAadhaarInput("");
      setCustPanInput("");
      setCustAddressInput("");
      setCustGstinInput("");
      if (forceStep) {
        setCustomerModalStep(forceStep);
      } else {
        setCustomerModalStep("LOOKUP");
      }
    }
    setIsCustomerModalOpen(true);
  }, [customer]);

  // Store Profile & Auto-Generated Invoice Sequence State
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
    logoUrl: "",
  });

  // Payment Modal, Bill Search & Thermal Receipt state
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isBillSearchOpen, setIsBillSearchOpen] = useState(false);
  const [dateTime, setDateTime] = useState<string>("");

  // Load Admin Store Profile, Print Format & Invoice Counter Settings
  useEffect(() => {
    function loadLocalSettings() {
      try {
        const saved = localStorage.getItem("company_store_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          setStoreProfile((prev) => ({ ...prev, ...parsed }));
          if (parsed.defaultPrintMode) {
            setPrintMode(parsed.defaultPrintMode);
          }
        }
      } catch (err) {
        console.error("Failed loading local store settings", err);
      }
    }

    loadLocalSettings();
    window.addEventListener("store_settings_updated", loadLocalSettings);
    window.addEventListener("storage", loadLocalSettings);

    async function loadApiSettings() {
      try {
        const res = await fetch("/api/pos/settings/modules");
        const data = await res.json();
        if (res.ok && data.modules) {
          const saved = localStorage.getItem("company_store_settings");
          const local = saved ? JSON.parse(saved) : null;
          const profile = {
            businessName: local?.businessName || data.modules.businessName || "EcoFone Mobile Store",
            storeSubName: local?.storeSubName || data.modules.storeSubName || "Main Branch",
            storeAddress: local?.storeAddress || data.modules.storeAddress || "123 Market Street, Commercial Hub",
            storePhone: local?.storePhone || data.modules.storePhone || "+91 98765 43210",
            gstin: local?.gstin || data.modules.gstin || "07AAAAA0000A1Z5",
            placeOfSupply: local?.placeOfSupply || data.modules.placeOfSupply || "Delhi (07)",
            invoicePrefix: local?.invoicePrefix || data.modules.invoicePrefix || "INV/2026/",
            invoiceNextNumber: Number(local?.invoiceNextNumber ?? data.modules.invoiceNextNumber ?? 1),
            defaultPrintMode: local?.defaultPrintMode || data.modules.defaultPrintMode || "A4_GST",
            logoUrl: local?.logoUrl || data.modules.logoUrl || "",
          };
          setStoreProfile(profile);
          if (profile.defaultPrintMode) {
            setPrintMode(profile.defaultPrintMode);
          }
        }
      } catch (err) {
        console.error("Failed fetching store profile API", err);
      }
    }
    loadApiSettings();

    return () => {
      window.removeEventListener("store_settings_updated", loadLocalSettings);
      window.removeEventListener("storage", loadLocalSettings);
    };
  }, []);

  useEffect(() => {
    setDateTime(new Date().toLocaleString("en-IN"));
    const interval = setInterval(() => {
      setDateTime(new Date().toLocaleString("en-IN"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Auto-Generated Invoice Number (e.g. EcoFo/17/2026-0042)
  const invoiceNumber = `${storeProfile.invoicePrefix}${String(storeProfile.invoiceNextNumber).padStart(4, "0")}`;

  function incrementInvoiceCounter() {
    const nextNum = storeProfile.invoiceNextNumber + 1;
    const updated = { ...storeProfile, invoiceNextNumber: nextNum };
    setStoreProfile(updated);
    try {
      localStorage.setItem("company_store_settings", JSON.stringify(updated));
      fetch("/api/pos/settings/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(console.error);
    } catch (err) {
      console.error("Failed persisting updated invoice counter", err);
    }
  }

  const discountInputRef = useRef<HTMLInputElement>(null);

  // Add item to active cart
  function addToCart(product: ProductItem) {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.productId === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + 1;
        const totalAmount = newQty * product.sellingPrice;
        const taxableAmount = totalAmount / (1 + product.gstRate / 100);
        const taxAmount = totalAmount - taxableAmount;

        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          taxableAmount,
          taxAmount,
          totalAmount,
        };
        return updated;
      }

      const totalAmount = product.sellingPrice;
      const taxableAmount = totalAmount / (1 + product.gstRate / 100);
      const taxAmount = totalAmount - taxableAmount;

      return [
        ...prevCart,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          productId: product.id,
          category: product.category,
          title: product.title,
          barcode: product.barcode || undefined,
          imei1: product.imei1 || undefined,
          serialNumber: product.serialNumber || undefined,
          unitPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          quantity: 1,
          gstRate: product.gstRate,
          taxableAmount,
          taxAmount,
          totalAmount,
        },
      ];
    });
  }

  // Update item quantity
  function updateQuantity(id: string, newQty: number) {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const totalAmount = newQty * item.unitPrice;
          const taxableAmount = totalAmount / (1 + item.gstRate / 100);
          const taxAmount = totalAmount - taxableAmount;
          return {
            ...item,
            quantity: newQty,
            taxableAmount,
            taxAmount,
            totalAmount,
          };
        }
        return item;
      })
    );
  }

  // Remove item from cart
  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  // Global Barcode Hardware Scanner Handler
  useBarcodeScanner({
    onScan: (scannedString) => {
      const match = INITIAL_PRODUCTS.find(
        (p) =>
          p.barcode === scannedString ||
          p.imei1 === scannedString ||
          p.imei2 === scannedString
      );
      if (match) {
        addToCart(match);
      } else {
        alert(`Scanned barcode/IMEI '${scannedString}' not found in inventory.`);
      }
    },
  });

  // Calculate totals and GST split
  const totalAmountSum = cart.reduce((acc, item) => acc + item.totalAmount, 0);
  const taxableAmountSum = cart.reduce((acc, item) => acc + item.taxableAmount, 0);
  const totalTaxSum = cart.reduce((acc, item) => acc + item.taxAmount, 0);

  const cgst = totalTaxSum / 2;
  const sgst = totalTaxSum / 2;
  const grandTotal = Math.max(0, totalAmountSum - discount);

  const summary: InvoiceSummary = {
    subtotal: totalAmountSum,
    taxableAmount: taxableAmountSum,
    taxAmount: totalTaxSum,
    cgst,
    sgst,
    igst: 0,
    discount,
    grandTotal,
    tenderMode: tenderMode || "CASH",
    amountPaid: grandTotal,
    changeDue: 0,
  };

  // Keyboard Shortcuts (Ctrl+K, F2, F8, F9, F10)
  useEffect(() => {
    function handleGlobalHotkeys(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsBillSearchOpen((prev) => !prev);
      } else if (e.key === "F2") {
        e.preventDefault();
        discountInputRef.current?.focus();
      } else if (e.key === "F8") {
        e.preventDefault();
        setTenderMode("CASH");
      } else if (e.key === "F9") {
        e.preventDefault();
        setTenderMode("UPI");
        if (cart.length > 0) {
          if (!customer) {
            openCustomerModal("LOOKUP");
            setToastMessage("⚠️ Customer details required before processing UPI payment.");
            setTimeout(() => setToastMessage(null), 4000);
          } else {
            setIsUpiModalOpen(true);
          }
        }
      } else if (e.key === "F10") {
        e.preventDefault();
        setTenderMode("UDHAAR");
        if (!customer) {
          openCustomerModal("LOOKUP");
          setToastMessage("⚠️ Customer details mandatory for Udhaar (Credit) payments.");
          setTimeout(() => setToastMessage(null), 4000);
        }
      }
    }
    window.addEventListener("keydown", handleGlobalHotkeys);
    return () => window.removeEventListener("keydown", handleGlobalHotkeys);
  }, [cart.length, customer, openCustomerModal]);

  function handleLookupCustomer(mobileNum: string) {
    const cleanPhone = mobileNum.replace(/\D/g, "").slice(0, 10);
    if (cleanPhone.length !== 10) {
      setToastMessage("⚠️ Mobile number must be exactly 10 digits.");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    const match = customerDb.find((c) => c.phone.replace(/\D/g, "") === cleanPhone);

    if (match) {
      setCustomer(match);
      setToastMessage(`✨ Customer ${match.name} (${match.phone}) auto-attached!`);
      setIsCustomerModalOpen(false);
      setTimeout(() => setToastMessage(null), 3500);
    } else {
      setCustPhoneInput(cleanPhone);
      setCustNameInput("");
      setCustAadhaarInput("");
      setCustPanInput("");
      setCustAddressInput("");
      setCustGstinInput("");
      setCustomerModalStep("REGISTER");
    }
  }

  function handleRegisterAndAttachCustomer(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = custPhoneInput.replace(/\D/g, "").slice(0, 10);
    if (cleanPhone.length !== 10) {
      setToastMessage("⚠️ Mobile number must be exactly 10 digits.");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (!custNameInput.trim()) return;

    // Use existing customer ID if editing, otherwise assign a new customer ID
    const custId = editingCustomerId || (customer?.phone.replace(/\D/g, "") === cleanPhone ? customer.id : null) || `cust-${Date.now()}`;

    const updatedCust: CustomerInfo = {
      id: custId,
      name: custNameInput.trim(),
      phone: cleanPhone,
      aadhaarNo: custAadhaarInput.trim() || undefined,
      panNo: custPanInput.trim() || undefined,
      address: custAddressInput.trim() || undefined,
      gstin: custGstinInput.trim() || undefined,
    };

    // Replace the edited customer in database if it exists, otherwise prepend
    const isExistingInDb = customerDb.some(
      (c) => (c.id && c.id === custId) || c.phone.replace(/\D/g, "") === cleanPhone
    );

    let updatedDb: CustomerInfo[];
    if (isExistingInDb) {
      updatedDb = customerDb.map((c) => {
        if ((c.id && c.id === custId) || c.phone.replace(/\D/g, "") === cleanPhone) {
          return updatedCust;
        }
        return c;
      });
    } else {
      updatedDb = [updatedCust, ...customerDb];
    }

    setCustomerDb(updatedDb);
    try {
      localStorage.setItem("company_customers_db", JSON.stringify(updatedDb));
    } catch (err) {
      console.error("Failed saving customer", err);
    }

    setCustomer(updatedCust);

    if (useDifferentShipping && shipNameInput.trim()) {
      setShippedToCustomer({
        name: shipNameInput.trim(),
        phone: cleanPhone,
        address: shipAddressInput.trim() || updatedCust.address,
        gstin: shipGstinInput.trim().toUpperCase() || undefined,
      });
    } else {
      setShippedToCustomer(null);
    }

    setToastMessage(
      editingCustomerId
        ? `✅ Updated ${updatedCust.name}'s details successfully!`
        : `🎉 Saved customer ${updatedCust.name} to company database & attached to invoice!`
    );
    setIsCustomerModalOpen(false);
    setEditingCustomerId(null);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function handleCheckout(overrideMode?: "THERMAL_80MM" | "A4_GST") {
    if (cart.length === 0) {
      alert("Cart is empty. Please add items to checkout.");
      return;
    }

    if (!customer) {
      openCustomerModal("LOOKUP");
      setToastMessage("⚠️ Customer details required! Please attach or register a customer before taking payment.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    let activeMode: "A4_GST" | "THERMAL_80MM" = printMode;
    if (overrideMode) {
      activeMode = overrideMode;
      setPrintMode(overrideMode);
    } else {
      try {
        const saved = localStorage.getItem("company_store_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.defaultPrintMode) {
            activeMode = parsed.defaultPrintMode;
            setPrintMode(parsed.defaultPrintMode);
          }
        }
      } catch (e) {}
    }

    if (tenderMode === "UPI") {
      setIsUpiModalOpen(true);
    } else {
      triggerPrint(activeMode);
    }
  }

  function triggerPrint(modeToUse?: "A4_GST" | "THERMAL_80MM") {
    const activeMode = modeToUse || printMode;
    if (typeof document !== "undefined") {
      let styleEl = document.getElementById("dynamic-print-page-size");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "dynamic-print-page-size";
        document.head.appendChild(styleEl);
      }
      if (activeMode === "THERMAL_80MM") {
        styleEl.innerHTML = `@media print { @page { size: 80mm auto !important; margin: 0 !important; } }`;
        document.body.classList.add("print-mode-80mm");
        document.body.classList.remove("print-mode-a4");
      } else {
        styleEl.innerHTML = `@media print { @page { size: A4 portrait !important; margin: 0 !important; } }`;
        document.body.classList.add("print-mode-a4");
        document.body.classList.remove("print-mode-80mm");
      }
    }

    // Record invoice into Customer Khata & Transaction Ledger
    if (customer) {
      const grandTotal = summary.grandTotal;
      const isUdhaar = tenderMode === "UDHAAR";
      const targetCustId = customer.id || "cust-1";

      let newBalance = 0;
      const savedCustomersStr = localStorage.getItem("company_customers_db");
      let savedList: any[] = savedCustomersStr ? JSON.parse(savedCustomersStr) : customerDb;

      const updatedList = savedList.map((c: any) => {
        if (c.id === targetCustId || c.phone.replace(/\D/g, "") === customer.phone.replace(/\D/g, "")) {
          const prevBal = typeof c.currentBalance === "number" ? c.currentBalance : 0;
          const prevSpend = typeof c.totalLifetimeSpend === "number" ? c.totalLifetimeSpend : 0;
          newBalance = isUdhaar ? prevBal + grandTotal : prevBal;
          return {
            ...c,
            currentBalance: newBalance,
            totalLifetimeSpend: prevSpend + grandTotal,
            lastActive: new Date().toISOString().split("T")[0],
          };
        }
        return c;
      });

      const exists = updatedList.some(
        (c: any) => c.id === targetCustId || c.phone.replace(/\D/g, "") === customer.phone.replace(/\D/g, "")
      );

      if (!exists) {
        newBalance = isUdhaar ? grandTotal : 0;
        updatedList.unshift({
          ...customer,
          id: targetCustId,
          currentBalance: newBalance,
          totalLifetimeSpend: grandTotal,
          lastActive: new Date().toISOString().split("T")[0],
        });
      }

      setCustomerDb(updatedList);
      localStorage.setItem("company_customers_db", JSON.stringify(updatedList));

      // Append transaction record to customer ledger
      const itemsDescription = cart.map((item) => `${item.title} (x${item.quantity})`).join(", ");
      const newTx = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        invoiceNumber: invoiceNumber,
        type: isUdhaar ? "UDHAAR_SALE" : "REGULAR_SALE",
        description: itemsDescription || `Invoice ${invoiceNumber}`,
        totalAmount: grandTotal,
        paidAmount: isUdhaar ? 0 : grandTotal,
        balanceAdded: isUdhaar ? grandTotal : 0,
        paymentMode: tenderMode || "CASH",
        balanceAfter: newBalance,
      };

      const ledgerKey = `company_customer_ledger_${targetCustId}`;
      const savedLedgerStr = localStorage.getItem(ledgerKey);
      const savedLedger = savedLedgerStr ? JSON.parse(savedLedgerStr) : [];
      localStorage.setItem(ledgerKey, JSON.stringify([newTx, ...savedLedger]));

      setToastMessage(
        isUdhaar
          ? `✅ Khata Updated! Added ₹${grandTotal.toLocaleString("en-IN")} to ${customer.name}'s Udhaar dues balance.`
          : `✅ Invoice ${invoiceNumber} logged in ${customer.name}'s purchase ledger.`
      );
      setTimeout(() => setToastMessage(null), 4000);
    }

    incrementInvoiceCounter();
    setTimeout(() => {
      window.print();
    }, 300);
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col font-sans select-none space-y-3 text-slate-900 overflow-hidden">
      <h1 className="sr-only">POS Billing Workstation</h1>
      {/* Printable Invoice View (Unified Tax Invoice Design - A4 or Scaled 80mm Roll) */}
      {!isBillSearchOpen && (
        <div id="printable-receipt-container" className="printable-active-target hidden print:block">
          <A4GstInvoice
            invoiceNumber={invoiceNumber}
            dateTime={dateTime}
            storeName={storeProfile.businessName}
            storeSubName={storeProfile.storeSubName}
            storeAddress={storeProfile.storeAddress}
            storePhone={storeProfile.storePhone}
            storeGstin={storeProfile.gstin}
            placeOfSupply={getPlaceOfSupplyFromAddress(storeProfile.storeAddress, storeProfile.placeOfSupply)}
            customer={customer}
            shippedToCustomer={shippedToCustomer}
            items={cart}
            summary={summary}
            isThermal80mm={printMode === "THERMAL_80MM"}
            logoUrl={storeProfile.logoUrl}
          />
        </div>
      )}

      {/* Main Workstation Dual-Pane Split - Perfectly Balanced Viewport Layout */}
      <div className="print:hidden flex-1 min-h-0 min-w-0 grid grid-cols-12 gap-2.5 sm:gap-3.5 lg:overflow-hidden overflow-y-auto h-full">
        {/* LEFT PANE: Search & Cart Items (Col Span 8) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col space-y-2.5 h-full overflow-hidden min-h-0 min-w-0">
          {/* Search Bar Container with Find Bill Button */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs shrink-0 max-w-2xl w-full flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <SmartSearchBar onSelectItem={addToCart} products={INITIAL_PRODUCTS} />
            </div>
            <button
              type="button"
              onClick={() => setIsBillSearchOpen(true)}
              className="flex items-center gap-1.5 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200 px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 h-10"
              title="Search Bills by Bill #, Customer Name, Mobile #, or IMEI (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-fuchsia-700" />
              <span className="font-bold">Find Bill</span>
              <kbd className="hidden sm:inline-block text-[9px] bg-white text-fuchsia-800 border border-fuchsia-200 px-1.5 py-0.5 rounded font-mono font-bold">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Left Pane: Active Counter Cart Card (Fills entire vertical space) */}
          <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-2xl p-3 flex flex-col justify-between shadow-2xs overflow-hidden">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-fuchsia-50 border border-fuchsia-200 flex items-center justify-center text-fuchsia-700 shrink-0">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <h2 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">Active Counter Cart</h2>
                <span className="text-[10px] bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 font-black px-2 py-0.5 rounded-full shrink-0">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-colors shrink-0"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List Table */}
            <div className="flex-1 min-h-0 overflow-y-auto my-2 pr-1 space-y-1.5">
              {cart.length === 0 ? (
                <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-slate-400 space-y-2 py-6">
                  <div className="w-10 h-10 rounded-2xl bg-fuchsia-50 border border-fuchsia-100 flex items-center justify-center text-fuchsia-600 shadow-2xs">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div className="text-center space-y-1 max-w-xs">
                    <p className="text-xs font-bold text-slate-700">Cart is empty</p>
                    <p className="text-xs text-slate-400">
                      Scan barcode gun, enter 15-digit IMEI, or press <kbd className="px-1.5 py-0.5 bg-slate-100 text-fuchsia-800 rounded font-mono text-xs border border-slate-200">/</kbd> to search inventory
                    </p>
                  </div>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl flex items-center justify-between hover:border-fuchsia-300 transition-all shadow-2xs gap-2"
                  >
                    <div className="space-y-0.5 max-w-[50%] min-w-0">
                      <div className="flex items-center space-x-2 min-w-0">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                            item.category === "BRAND_NEW"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : item.category === "REFURBISHED"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200"
                          }`}
                        >
                          {item.category === "REFURBISHED" ? "SEC 15(5)" : item.category === "BRAND_NEW" ? "NEW" : "ACC"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500 truncate">
                        {item.imei1 && <span className="text-purple-700 font-bold truncate">IMEI: {item.imei1}</span>}
                        <span>GST: {item.gstRate}%</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      {/* Quantity Adjuster */}
                      <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded font-bold text-xs cursor-pointer transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Number(e.target.value) || 1)}
                          className="w-8 text-center bg-transparent font-mono font-black text-xs text-slate-900 focus:outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded font-bold text-xs cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right min-w-[75px]">
                        <span className="font-mono font-black text-fuchsia-800 text-xs block">
                          ₹{item.totalAmount.toLocaleString("en-IN")}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Customer, Bill Summary, Tender Checkout & Quick Add Accessories */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full overflow-y-auto min-h-0 min-w-0 bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3 justify-start">
          {/* Section 1: Attached Customer Card (Default Blank with + Add Customer Option) */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 shrink-0">
            {customer ? (
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0 pr-2">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block leading-none">
                    Attached Customer
                  </span>
                  <p className="font-extrabold text-xs text-slate-900 truncate">{customer.name}</p>
                  <p className="text-[10px] font-mono text-slate-500 leading-none">Ph: {customer.phone}</p>
                  {(customer.aadhaarNo || customer.panNo || customer.address || customer.gstin) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {customer.aadhaarNo && (
                        <span className="text-[9px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-medium">
                          Aadhaar: {customer.aadhaarNo}
                        </span>
                      )}
                      {customer.panNo && (
                        <span className="text-[9px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
                          PAN: {customer.panNo}
                        </span>
                      )}
                      {customer.gstin && (
                        <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                          GST: {customer.gstin}
                        </span>
                      )}
                      {customer.address && (
                        <span className="text-[9px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded truncate max-w-[200px]" title={customer.address}>
                          {customer.address}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => openCustomerModal(undefined, customer)}
                    className="text-fuchsia-700 hover:text-fuchsia-900 font-extrabold cursor-pointer border border-fuchsia-200 px-2 py-1 rounded-xl bg-fuchsia-50 text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openCustomerModal("LOOKUP")}
                    className="text-purple-700 hover:text-purple-900 font-extrabold cursor-pointer border border-purple-200 px-2 py-1 rounded-xl bg-purple-50 text-xs transition-colors"
                  >
                    Switch
                  </button>
                  <button
                    onClick={() => setCustomer(null)}
                    className="text-slate-400 hover:text-rose-600 font-bold px-1 text-xs cursor-pointer"
                    title="Remove Customer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-2 rounded-xl bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-100 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block leading-tight">No Customer Attached</span>
                    <span className="text-xs text-slate-500 block leading-tight">Walk-in Retail Customer</span>
                  </div>
                </div>

                <button
                  onClick={() => openCustomerModal("LOOKUP")}
                  className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1 shadow-md shadow-fuchsia-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Customer</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Bill Breakdown & Taxes Card (Expands to fill height on big screens cleanly) */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 space-y-3 shrink-0 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  Bill Breakdown &amp; Taxes
                </h3>
                <span className="text-fuchsia-700 font-mono font-bold text-xs">{invoiceNumber}</span>
              </div>

              {/* Breakdown Tax Lines Container */}
              <div className="space-y-2 text-xs font-mono text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Subtotal (Excl. Tax):</span>
                  <span className="font-bold text-slate-900">₹{summary.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="font-sans">CGST @ 9%:</span>
                  <span>₹{summary.cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="font-sans">SGST @ 9%:</span>
                  <span>₹{summary.sgst.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="flex items-center space-x-1 font-sans font-bold text-slate-700 text-xs shrink-0">
                    <span>Discount (₹):</span>
                    <kbd className="text-[9px] bg-white text-fuchsia-800 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-mono">
                      F2
                    </kbd>
                  </span>
                  <div className="flex-1 border-b border-dashed border-slate-300 mx-2"></div>
                  <input
                    ref={discountInputRef}
                    type="number"
                    min="0"
                    value={discount || ""}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-24 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-right font-mono text-xs font-bold text-fuchsia-800 focus:border-fuchsia-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Highlighted Grand Total Banner */}
            <div className="border border-fuchsia-300 bg-gradient-to-r from-fuchsia-100/70 via-pink-50 to-purple-50 p-3 rounded-2xl flex items-center justify-between shadow-2xs mt-2">
              <span className="text-xs font-black text-fuchsia-950 uppercase tracking-wider">Grand Total</span>
              <span className="text-2xl font-black font-mono text-fuchsia-700">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Section 3: Select Tender Mode & Complete Checkout */}
          <div className="space-y-2.5 shrink-0 pt-1">
            <span className="text-xs font-bold text-slate-600 block">
              Select tender mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTenderMode("CASH")}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  tenderMode === "CASH"
                    ? "bg-fuchsia-50 text-fuchsia-900 border-2 border-fuchsia-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <Banknote className="w-4 h-4 shrink-0" />
                  <span>Cash</span>
                </span>
                <kbd className="text-[9px] font-mono opacity-80">F8</kbd>
              </button>

              <button
                onClick={() => {
                  setTenderMode("UPI");
                  if (cart.length > 0) {
                    if (!customer) {
                      openCustomerModal("LOOKUP");
                      setToastMessage("⚠️ Customer details required before processing UPI payment.");
                      setTimeout(() => setToastMessage(null), 4000);
                    } else {
                      setIsUpiModalOpen(true);
                    }
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  tenderMode === "UPI"
                    ? "bg-fuchsia-50 text-fuchsia-900 border-2 border-fuchsia-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span>UPI QR</span>
                </span>
                <kbd className="text-[9px] font-mono opacity-80">F9</kbd>
              </button>

              <button
                onClick={() => setTenderMode("CARD")}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  tenderMode === "CARD"
                    ? "bg-fuchsia-50 text-fuchsia-900 border-2 border-fuchsia-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>Card</span>
                </span>
                <span className="text-[9px] font-mono opacity-80">POS</span>
              </button>

              <button
                onClick={() => {
                  setTenderMode("UDHAAR");
                  if (!customer) {
                    openCustomerModal("LOOKUP");
                    setToastMessage("⚠️ Customer details mandatory for Udhaar (Credit) payments.");
                    setTimeout(() => setToastMessage(null), 4000);
                  }
                }}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-between cursor-pointer ${
                  tenderMode === "UDHAAR"
                    ? "bg-fuchsia-50 text-fuchsia-900 border-2 border-fuchsia-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>Credit</span>
                </span>
                <kbd className="text-[9px] font-mono opacity-80">F10</kbd>
              </button>
            </div>

            {/* Card Tender Details Helper */}
            {tenderMode === "CARD" && (
              <div className="bg-purple-50/90 border border-purple-200 p-2.5 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 text-[11px] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                    EDC Card Swiper / Terminal
                  </span>
                  <span className="text-[9px] font-mono bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold">READY</span>
                </div>
                <input
                  type="text"
                  value={cardAuthRef}
                  onChange={(e) => setCardAuthRef(e.target.value)}
                  placeholder="Card Approval / RRN # (Optional)"
                  className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-mono text-purple-950 focus:border-purple-600 focus:outline-none"
                />
              </div>
            )}

            {/* Print Format Selector (80mm POS Thermal Slip vs Full A4 GST Tax Invoice) */}
            <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200 p-1 rounded-xl text-[11px] font-bold text-slate-700">
              <span className="pl-2 text-[10px] text-slate-500 font-extrabold uppercase tracking-wide">Print Layout:</span>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => setPrintMode("THERMAL_80MM")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] transition-all cursor-pointer ${
                    printMode === "THERMAL_80MM"
                      ? "bg-fuchsia-600 text-white font-extrabold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
                  }`}
                >
                  80mm Roll
                </button>
                <button
                  type="button"
                  onClick={() => setPrintMode("A4_GST")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] transition-all cursor-pointer ${
                    printMode === "A4_GST"
                      ? "bg-fuchsia-600 text-white font-extrabold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
                  }`}
                >
                  A4 Tax Invoice
                </button>
              </div>
            </div>

            <button
              onClick={() => handleCheckout()}
              disabled={cart.length === 0}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-fuchsia-500/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Checkout &amp; Print {printMode === "A4_GST" ? "A4 Invoice" : "Receipt"}</span>
              <kbd className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${cart.length === 0 ? "bg-slate-300 text-slate-500" : "bg-purple-900 text-white"}`}>
                Enter
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Smart 2-Step Customer Modal (Mobile Lookup First -> Register if Not Found) */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
                  {customerModalStep === "LOOKUP" ? <Phone className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {customerModalStep === "LOOKUP" ? "Attach Customer" : "Customer Details"}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {customerModalStep === "LOOKUP"
                      ? "Search database by mobile number"
                      : "Save customer details for billing & warranty"}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">
                ✕
              </button>
            </div>

            {/* STEP 1: CLEAN PROFESSIONAL MOBILE LOOKUP */}
            {customerModalStep === "LOOKUP" && (
              <div className="space-y-4 text-xs">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLookupCustomer(searchPhoneInput);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        autoFocus
                        maxLength={10}
                        value={searchPhoneInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setSearchPhoneInput(val);
                          if (val.length === 10) {
                            handleLookupCustomer(val);
                          }
                        }}
                        placeholder="Enter 10-Digit Mobile Number"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-fuchsia-600 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Pre-suggested matching customers */}
                  {searchPhoneInput.length >= 3 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Store Matches:</span>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {customerDb
                          .filter((c) => c.phone.includes(searchPhoneInput) || c.name.toLowerCase().includes(searchPhoneInput.toLowerCase()))
                          .map((c) => (
                            <button
                              key={c.id || c.phone}
                              type="button"
                              onClick={() => {
                                setCustomer(c);
                                setToastMessage(`Customer ${c.name} attached`);
                                setIsCustomerModalOpen(false);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="w-full text-left p-2.5 bg-slate-50 hover:bg-fuchsia-50 border border-slate-200 hover:border-fuchsia-200 rounded-xl flex items-center justify-between transition-colors group cursor-pointer"
                            >
                              <div>
                                <p className="font-extrabold text-xs text-slate-900 group-hover:text-fuchsia-950">{c.name}</p>
                                <p className="text-[10px] font-mono text-slate-500">Ph: {c.phone}</p>
                              </div>
                              <span className="text-[10px] font-bold text-fuchsia-700 bg-white group-hover:bg-fuchsia-600 group-hover:text-white px-2 py-1 rounded-lg border border-fuchsia-200 transition-colors">
                                Select
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:opacity-95 text-white font-extrabold px-5 py-2 rounded-xl text-xs shadow-xs cursor-pointer active:scale-95 transition-all flex items-center space-x-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: FULL DETAILS REGISTRATION */}
            {customerModalStep === "REGISTER" && (
              <form onSubmit={handleRegisterAndAttachCustomer} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Customer Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={custNameInput}
                      onChange={(e) => setCustNameInput(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mobile Phone <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={custPhoneInput}
                      onChange={(e) => setCustPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit Mobile"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Aadhaar Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={custAadhaarInput}
                      onChange={(e) => setCustAadhaarInput(e.target.value)}
                      placeholder="12-digit Aadhaar"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      PAN Card <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={custPanInput}
                      onChange={(e) => setCustPanInput(e.target.value.toUpperCase())}
                      placeholder="10-char PAN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      GSTIN <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={custGstinInput}
                      onChange={(e) => setCustGstinInput(e.target.value.toUpperCase())}
                      placeholder="15-digit GSTIN"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City / Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={custAddressInput}
                      onChange={(e) => setCustAddressInput(e.target.value)}
                      placeholder="Customer Address"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Optional Separate Shipping Address Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center space-x-2 text-[11px] font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useDifferentShipping}
                      onChange={(e) => setUseDifferentShipping(e.target.checked)}
                      className="rounded text-fuchsia-600 focus:ring-fuchsia-500"
                    />
                    <span>Specify Different Shipping Address (Shipped To)</span>
                  </label>

                  {useDifferentShipping && (
                    <div className="mt-2.5 p-3 bg-fuchsia-50/50 border border-fuchsia-200 rounded-xl space-y-2">
                      <p className="text-[10px] font-bold text-fuchsia-900 uppercase tracking-wider">Shipped To Details</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Shipping Recipient Name</label>
                          <input
                            type="text"
                            value={shipNameInput}
                            onChange={(e) => setShipNameInput(e.target.value)}
                            placeholder={custNameInput || "Recipient Name"}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Shipping GSTIN</label>
                          <input
                            type="text"
                            value={shipGstinInput}
                            onChange={(e) => setShipGstinInput(e.target.value.toUpperCase())}
                            placeholder="Optional GSTIN"
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none font-mono uppercase"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Shipping Address</label>
                        <input
                          type="text"
                          value={shipAddressInput}
                          onChange={(e) => setShipAddressInput(e.target.value)}
                          placeholder={custAddressInput || "Shipping Address / City"}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:border-fuchsia-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCustomerModalStep("LOOKUP")}
                    className="text-xs text-fuchsia-700 hover:text-fuchsia-900 font-bold cursor-pointer"
                  >
                    ← Back
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomerModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-extrabold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:opacity-95 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-xs cursor-pointer active:scale-95 transition-all flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Customer</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Toast Notification for Customer Auto-Attach */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white border border-fuchsia-500/50 shadow-2xl px-4 py-3 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-7 h-7 rounded-xl bg-fuchsia-600/30 text-fuchsia-400 border border-fuchsia-500/30 flex items-center justify-center font-black text-xs">
            ✓
          </div>
          <p className="text-xs font-bold text-white">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Dynamic NPCI UPI QR Modal */}
      <DynamicUpiQrModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        onConfirmPayment={() => {
          setIsUpiModalOpen(false);
          triggerPrint();
        }}
        grandTotal={grandTotal}
        invoiceNumber={invoiceNumber}
        merchantName="Apex Mobile Hub"
        upiVpa="ecodigitech@upi"
      />

      {/* Universal Mobile Bill & Invoice Search Modal */}
      <UniversalBillSearchModal
        isOpen={isBillSearchOpen}
        onClose={() => setIsBillSearchOpen(false)}
      />
    </div>
  );
}
