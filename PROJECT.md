# EcoDigiTech Billing Software - Project Tracker

## Project Overview
* **Brand Name:** EcoDigiTech
* **Product:** Multi-tenant Cloud Retail & Repair POS SaaS
* **Subdomains:** `pos.ecodigitech.com`, `admin.ecodigitech.com`, `ecodigitech.com`
* **Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL

---

## Execution Log - 2026-09-20

### Sprint 1 Execution
* **Task 1.1:** Scaffolded Next.js 15 App Router project structure with TypeScript, ESLint, and Tailwind CSS.
* **Task 1.2:** Initialized Prisma, populated `prisma/schema.prisma` with complete database schema, and generated initial Prisma client.
* **Task 1.3:** Configured `src/middleware.ts` with Vercel Platforms subdomain rewriting (`pos.ecodigitech.com`, `admin.ecodigitech.com`).
* **Task 1.4:** Created base directory structures for route groups `src/app/(marketing)`, `src/app/(pos)`, and `src/app/(admin)`.

### Sprint 2 Execution
* **Task 2.1:** Created `src/lib/encryption.ts` using AES-256-GCM cipher for secure API secret encryption/decryption.
* **Task 2.2:** Implemented `src/lib/subscriptionGuard.ts` server-side lockout engine (3-day grace period, HTTP 403 `SUBSCRIPTION_LOCKED` write-lockout).
* **Task 2.3:** Created `scripts/reset-superadmin.ts` offline CLI recovery script (bcrypt password hashing, TOTP secret wipe).
* **Task 2.4:** Built Super Admin 2FA TOTP authentication system on `admin.ecodigitech.com` (`src/app/(admin)/admin/login/page.tsx` + API endpoints).
* **Task 2.5:** Built Multi-tenant merchant authentication system on `pos.ecodigitech.com` (`src/app/(pos)/pos/login/page.tsx` & `forgot-password/page.tsx` + API endpoints) enforcing `MERCHANT_OWNER` OTP resets, cashier restriction, and session cookie isolation (`admin_session` vs `pos_session`).

### Sprint 3 Execution
* **Task 3.1:** Built complete POS Counter Billing Terminal interface at `src/app/(pos)/pos/billing/page.tsx`.
* **Task 3.2:** Created global HID Hardware Barcode Scanner listener hook (`src/lib/hardware/barcodeScanner.ts`) capturing sub-50ms keydown bursts and dispatching to cart on `Enter`.
* **Task 3.3:** Built Smart Hybrid Search Bar component (`src/components/pos/SmartSearchBar.tsx`) featuring `/` hotkey focus, HID input, 15-digit IMEI, fuzzy search dropdown, and keyboard arrow navigation.
* **Task 3.4:** Created Dynamic Counter UPI QR Modal (`src/components/pos/DynamicUpiQrModal.tsx`) rendering NPCI string `upi://pay?pa=...` with live QR code (`qrcode.react`).
* **Task 3.5:** Implemented Driverless Browser Thermal Printing component (`src/components/hardware/ThermalReceipt.tsx`) supporting 58mm/80mm roll `@media print` layout and mandatory viral branding string `"Powered by EcoDigiTech | pos.ecodigitech.com"`.

### Sprint 4 Execution
* **Task 4.1:** Created Merchant Admin Settings panel (`src/app/(pos)/pos/settings/modules/page.tsx` & `src/app/api/pos/settings/modules/route.ts`) with module toggles and default GST inputs.
* **Task 4.2:** Created Refurbished Phone Margin Scheme Invoice Engine (`src/lib/tax/marginScheme.ts`) calculating Section 15(5) tax on positive margin ($\max(0, \text{Selling Price} - \text{Purchase Price})$) while concealing acquisition cost from customer receipts.
* **Task 4.3:** Created Customer Used Phone Intake Workflow (`src/app/(pos)/pos/intake/page.tsx` & `src/app/api/pos/intake/route.ts`) generating non-GST Purchase Vouchers with legal seller indemnification declarations.
* **Task 4.4:** Created Mobile Repair Lab Ticketing System (`src/app/(pos)/pos/repairs/page.tsx` & `src/app/api/pos/repairs/route.ts`) managing Job Sheets (`REP-1001`), pattern/PIN capture, status lifecycle (`RECEIVED` -> `DELIVERED`), and SAC 9987 service billing.
* **Task 4.5:** Created Customer Khata / Udhaar Ledger Engine (`src/app/(pos)/pos/customers/[id]/page.tsx`) & Atomic Invoice Creation (`src/app/api/invoices/create/route.ts`) executing inside `prisma.$transaction` for ACID-compliant stock deduction, credit limit checks, and item snapshot freezing.

### Sprint 5 Execution & Layout Refactor
* **Task 5.1:** Created Public Marketing & Pricing Landing Page (`src/app/(marketing)/page.tsx`) with 30-day cardless trial, 6-Month, 1-Year prepaid plans, and self-serve store registration modal.
* **Task 5.2:** Created Razorpay Subscription Checkout API (`src/app/api/subscriptions/checkout/route.ts`) decrypting API keys via `src/lib/encryption.ts` to issue Razorpay Orders.
* **Task 5.3:** Created Razorpay Webhook Handler (`src/app/api/subscriptions/webhook/route.ts`) with HMAC-SHA256 signature verification, extending `valid_till` by 180 or 365 days.
* **Task 5.4:** Created Hard Lockout Overlay Modal (`src/components/pos/SubscriptionLockoutModal.tsx`) blocking write actions when grace window lapses and providing a one-click renewal checkout trigger.
* **Layout Refactor:** Refactored `src/app/(pos)/pos/billing/page.tsx` into dedicated subcomponents (`PosHeader.tsx`, `PosFooter.tsx`, `SmartSearchBar.tsx`) featuring 65/35 dual-pane workstation split, merchant store header (without platform branding), staff profile menu, keyboard hotkey triggers (`/`, `Ctrl+K`, `F2`, `F8`, `F9`, `F10`, `Enter`), and footer viral branding.

### Secondary POS Screens UI/UX Upgrade & Unification
* **Used Phone Intake View (`src/app/(pos)/pos/intake/page.tsx`):** Upgraded UI wrapped with `PosHeader` & `PosFooter`, grid intake layout (Customer ID, photo URL preview, device model, mandatory 15-digit IMEI regex validation, condition rating, payout amount & settlement mode selector, legal seller non-tamperable declaration), and A4/A5 non-GST Purchase Agreement Voucher via `@media print`.
* **Mobile Repair Lab Dashboard (`src/app/(pos)/pos/repairs/page.tsx`):** Upgraded UI wrapped with `PosHeader` & `PosFooter`, top bar with "+ New Repair Ticket" modal & status filter tabs (`ALL`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `DELIVERED`), reported issues checklist, interactive 3x3 pattern lock drawer & PIN recorder, ticket kanban cards with turnaround timers, and SAC 9987 (18% GST) delivery invoice modal.
### End-to-End Simulation & Verification Phase
* **Subdomain Header Audit:** `pos.localhost:3000` / `pos.ecodigitech.com` -> rewrites to `(pos)`; `admin.localhost:3000` / `admin.ecodigitech.com` -> rewrites to `(admin)`; `ecodigitech.com` -> apex marketing fallback (`next()`).
* **POS Terminal & Hardware Integration:** Hardware Barcode Scanner burst `<50ms` capture verified (`8901234567890`); Keyboard Hotkeys (`/`, `F2`, `F8`, `F9`, `F10`) verified; NPCI UPI QR string generation verified (`upi://pay?pa=ecodigitech@upi&pn=...&am=25000.00&tr=INV-2026-0042&cu=INR`).
* **Margin Scheme Math & Snapshot Integrity:** Section 15(5) Refurbished Margin Tax verified (Selling ₹25,000, Purchase ₹20,000 -> Taxable ₹5,000, Tax ₹762.71 split CGST/SGST ₹381.36); Thermal receipt privacy verified (conceals acquisition cost & margin); `InvoiceItem` snapshot freezing verified.
* **Subscription Guard & Lockout:** Verified write lockout (`HTTP 403 SUBSCRIPTION_LOCKED`) when `valid_till` is past 3-day grace period; verified `GRACE` status warning within grace window; verified non-dismissible `SubscriptionLockoutModal` rendering.
* **Verification Suite Results:** Executed automated integration test suite (`scratch/run-verification-tests.ts`). **31 / 31 assertions passed (100%)**.

---

### Sprint 6 Execution (Production Deployment & Containerization)
* **Task 6.1:** Configured `output: "standalone"` mode in `next.config.ts` for optimized Docker image sizes.
* **Task 6.2:** Created multi-stage production `Dockerfile` (Node.js 20 Alpine, Prisma Client, static asset compilation, non-root user execution).
* **Task 6.3:** Created `.dockerignore` excluding local `.next`, `node_modules`, and temporary build artifacts.
* **Task 6.4:** Created `docker-compose.yml` orchestrating PostgreSQL 16 Alpine (`db`) and Next.js standalone web app (`web`) with container health checks.
* **Task 6.5:** Created comprehensive deployment guide `DEPLOYMENT.md` detailing Docker Compose setup, automated Prisma schema pushes, Nginx reverse proxy configuration, and Certbot wildcard SSL termination for `ecodigitech.com` and `*.ecodigitech.com`.

---

## Current Status
* **Active Milestone:** Containerized Standalone Docker & Production Deployment Setup Complete
* **Status:** 100% Type-Safe (`npx tsc --noEmit` clean). Standalone build verified (`npx next build` success). 31/31 E2E assertions passed. EcoDigiTech Cloud Retail & Repair POS SaaS Platform Dockerized, Containerized & Production Ready.

---

## File Registry (Created / Modified)
* [`RULES.md`](file:///d:/Projects/Billing%20Software/RULES.md)
* [`ARCHITECTURE.md`](file:///d:/Projects/Billing%20Software/ARCHITECTURE.md)
* [`TASKS.md`](file:///d:/Projects/Billing%20Software/TASKS.md)
* [`PROJECT.md`](file:///d:/Projects/Billing%20Software/PROJECT.md)
* [`next.config.ts`](file:///d:/Projects/Billing%20Software/next.config.ts)
* [`Dockerfile`](file:///d:/Projects/Billing%20Software/Dockerfile)
* [`.dockerignore`](file:///d:/Projects/Billing%20Software/.dockerignore)
* [`docker-compose.yml`](file:///d:/Projects/Billing%20Software/docker-compose.yml)
* [`DEPLOYMENT.md`](file:///d:/Projects/Billing%20Software/DEPLOYMENT.md)
* [`src/components/pos/PosHeader.tsx`](file:///d:/Projects/Billing%20Software/src/components/pos/PosHeader.tsx)
* [`src/components/pos/PosFooter.tsx`](file:///d:/Projects/Billing%20Software/src/components/pos/PosFooter.tsx)
* [`src/app/(pos)/pos/billing/page.tsx`](file:///d:/Projects/Billing%20Software/src/app/(pos)/pos/billing/page.tsx)
* [`src/app/(pos)/pos/intake/page.tsx`](file:///d:/Projects/Billing%20Software/src/app/(pos)/pos/intake/page.tsx)
* [`src/app/(pos)/pos/repairs/page.tsx`](file:///d:/Projects/Billing%20Software/src/app/(pos)/pos/repairs/page.tsx)
* [`src/app/(pos)/pos/customers/[id]/page.tsx`](file:///d:/Projects/Billing%20Software/src/app/(pos)/pos/customers/[id]/page.tsx)
* [`src/app/api/pos/customers/[id]/route.ts`](file:///d:/Projects/Billing%20Software/src/app/api/pos/customers/[id]/route.ts)
