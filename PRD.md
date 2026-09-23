# Product Requirements Document (PRD)

## 1. Executive Summary & Brand Positioning
The product is a multi-tenant, cloud-based retail and repair Point of Sale (POS) SaaS developed under the **EcoDigiTech** brand ecosystem. It is engineered specifically for consumer electronics stores, mobile phone retailers, refurbishment centers, and device repair laboratories.

The operational strategy enforces a 100% automated, self-serve commercial lifecycle. To preserve zero-friction adoption, there are no manual sales pipelines, negotiation cycles, or bespoke onboarding processes. The platform secures customer acquisition and viral loops by mandating a non-removable **"Powered by EcoDigiTech"** link across all merchant touchpoints (thermal receipts, WhatsApp invoice PDFs, and web screens).

---

## 2. Target Personas & Operating Boundaries

| Persona | Role Identifier | Device & Operating Environment | Core Objectives |
| :--- | :--- | :--- | :--- |
| **Merchant Owner** | `MERCHANT_OWNER` | Desktop, tablet, or smartphone; shop back-office or remote. | Manage store service modules, oversee staff credentials, audit net profit margins, renew SaaS subscriptions. |
| **Counter Cashier / Tech** | `CASHIER` | High-throughput billing counter with USB/wireless barcode scanner gun or keyboard. | Complete transactions in < 5 seconds, intake repair tickets, log used phone purchases, issue thermal prints. |
| **Super Admin** | `SUPER_ADMIN` | Founder terminal & isolated administration console. | Configure third-party API credentials, audit multi-tenant subscriptions, trigger system-level account locks. |
| **End Consumer** | Retail Shopper / Walk-in | Counter checkout, repair drop-off, or phone seller. | Scan dynamic UPI QR to pay, verify line-item IMEI warranty records, receive WhatsApp digital receipts. |

---

## 3. Scope of Work

### In-Scope (Sprint Baseline)
* **Dedicated Subdomain Isolation:** Operating the platform under `pos.ecodigitech.com` (Merchant counter & store admin) and `admin.ecodigitech.com` (Super Admin), leaving the primary corporate domain (`ecodigitech.com`) untouched.
* **Hybrid Billing Ingestion:** Sub-50ms HID barcode scanner listening, 15-digit manual IMEI entry, and fuzzy typeahead accessory search.
* **Dynamic Indian GST Engine:** Real-time calculation of MRP-inclusive tax backward split, forward exclusive tax, CGST/SGST 50-50 allocation, IGST cross-state handling, and Section 15(5) Margin Scheme computation.
* **Modular Business Modes:** Dynamic toggles allowing merchants to activate/deactivate new phones, refurbished phones, customer buy-in intake, repair jobs, and accessories.
* **Hardware Integrations:** Zero-driver browser thermal printing (58mm/80mm) via CSS print sheets; on-screen dynamic UPI payment QR matching NPCI specifications.
* **Subscription Lifecycle & Lockout Engine:** 30-day cardless trial, 6-month and 1-year Razorpay prepaid checkouts, 3-day grace period, and hard write-lockouts on invoice generation leaving historical data in read-only mode.
* **Security & Credential Recovery:** Multi-tenant database query scoping (`tenant_id`), Super Admin 2FA (Google Authenticator TOTP) with server-CLI-only recovery, and owner-governed cashier credential management.

### Out-of-Scope (Deferred to Future Milestones)
* Removal or white-labeling of the "Powered by EcoDigiTech" footer.
* Multi-branch inventory transfers and inter-store balance netting.
* Live external GSTIN API validation (offline mathematical checksum and regex parsing will be utilized initially).
* Payroll, staff attendance, and HRMS tracking modules.

---

## 4. Detailed Feature Specifications

### 4.1. Domain & Routing Topology
* **Requirement 4.1.1:** Edge middleware (`middleware.ts`) must intercept request headers and perform internal rewrites:
  * `admin.ecodigitech.com` rewrites to `app/(admin)/*`
  * `pos.ecodigitech.com` rewrites to `app/(pos)/*` (or `app/(marketing)/*` for unauthenticated visitors)
* **Requirement 4.1.2:** Browser cookies, authentication headers, and session tokens must maintain strict subdomain boundaries.

### 4.2. Counter POS & Hardware Subsystems
* **Requirement 4.2.1 (Scanner Gun Hook):** The billing view must mount a continuous window keystroke listener capturing character bursts arriving under 50ms intervals, dispatching items directly to the cart upon an `Enter` sequence.
* **Requirement 4.2.2 (Smart Search Bar):** The `/` shortcut key must instantly focus the search input. The input must accept:
  * 15-digit IMEI sequences.
  * Barcode digits (EAN/UPC).
  * Product name strings, returning a debounced list indicating title, price, and current stock.
* **Requirement 4.2.3 (Dynamic UPI QR Generation):** At checkout, the POS must generate an on-screen QR code encoding the NPCI UPI payload:
  `upi://pay?pa={store_upi_vpa}&pn={merchant_business_name}&am={grand_total}&tr={invoice_number}&cu=INR`
* **Requirement 4.2.4 (Thermal Printing Standards):** Print templates must adhere to pure CSS `@media print` rules formatted for 58mm or 80mm roll dimensions, embedding the persistent viral footer:
  `Powered by EcoDigiTech | Get your store POS at pos.ecodigitech.com`

### 4.3. Business Modules & Dynamic Tax Rules
* **Requirement 4.3.1 (Brand New Devices):** Captures mandatory `imei_1` and optional `imei_2`. Serial numbers freeze onto the `InvoiceItem` record upon completion. Standard forward-charge GST applies.
* **Requirement 4.3.2 (Refurbished Margin Scheme):** Computes tax exclusively on gross margin: $\max(0, \text{Selling Price} - \text{Purchase Price})$. Invoices output gross selling price without exposing the acquisition cost or margin breakdown to the consumer.
* **Requirement 4.3.3 (Customer Device Intake):** Issues a non-GST acquisition agreement recording seller name, phone, Aadhaar/ID photo URL, dual IMEIs, and a non-tamperable legal declaration of clean ownership.
* **Requirement 4.3.4 (Repair Lab):** Issues an intake Job Sheet (problem description, lock pattern/PIN, estimated cost, advance paid), converting into a service bill with SAC 9987 upon device handover.
* **Requirement 4.3.5 (Accessories):** Standard quantity-driven stock reduction.

### 4.4. Subscription, Lockout & Viral Distribution
* **Requirement 4.4.1 (Trial Provisioning):** Newly created tenants receive `status = 'TRIAL'` with `valid_till = now() + 30 days`.
* **Requirement 4.4.2 (Grace & Lockout Execution):**
  * `now() <= valid_till`: Unrestricted read/write operations.
  * `valid_till < now() <= (valid_till + 3 days)`: Operational access maintained with a persistent grace warning banner.
  * `now() > (valid_till + 3 days)`: Server aborts `POST /api/invoices/create` with HTTP 403 (`SUBSCRIPTION_LOCKED`). POS view displays the modal redirecting to the renewal checkout. Read queries remain accessible.
* **Requirement 4.4.3 (Viral Growth Engine):** All customer-facing outputs (counter screens, thermal slips, WhatsApp PDFs) must permanently display:
  `Powered by EcoDigiTech | pos.ecodigitech.com`

---

## 5. Security & Authentication Requirements

* **Requirement 5.1 (Multi-Tenant Isolation):** All operational database tables (`Invoice`, `Product`, `Customer`, `Store`, `UsedPhoneIntake`, `RepairTicket`) must contain a mandatory `tenant_id` foreign key. Direct queries must filter on `tenant_id`.
* **Requirement 5.2 (Super Admin Isolation):**
  * Super Admin portal (`admin.ecodigitech.com`) requires Master Email, Password verification, and Google Authenticator TOTP verification.
  * The Super Admin portal exposes no public `/forgot-password` or `/reset-2fa` endpoints.
  * Emergency credential/TOTP resets are performed strictly via the server maintenance script: `scripts/reset-superadmin.ts`.
* **Requirement 5.3 (Cashier vs. Merchant Recovery):**
  * `MERCHANT_OWNER` can reset forgotten credentials via OTP sent to their verified mobile/email.
  * `CASHIER` accounts cannot self-reset credentials from the login screen. Password updates are performed exclusively by the `MERCHANT_OWNER` from the store staff dashboard.
* **Requirement 5.4 (Credential Vault):** All external API secrets (Razorpay keys, WhatsApp tokens) stored in the database must be encrypted using AES-256-GCM.