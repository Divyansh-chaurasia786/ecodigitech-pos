# Engineering Rules & Architectural Constraints

## 1. System Architecture & Tech Stack
* **Framework:** Next.js 15 App Router with React 19 / 18, TypeScript, and Tailwind CSS.
* **Database & ORM:** PostgreSQL / SQLite managed through Prisma ORM.
* **Routing Topology:** Subdomain-based edge rewrites via `src/middleware.ts`:
  * `admin.ecodigitech.com` -> `src/app/(admin)`
  * `pos.ecodigitech.com` -> `src/app/(pos)` (or `src/app/(marketing)` if unauthenticated)
  * `ecodigitech.com` (apex) -> `src/app/(marketing)`

## 2. Security & Multi-Tenancy Rules
* **Mandatory Query Scoping (`tenant_id`):** Every operational database query targeting `Invoice`, `Product`, `Customer`, `Tenant`/`Store`, `UsedPhoneIntake`, or `RepairTicket` MUST include `tenant_id` in the `where` payload. Cross-tenant leakage is a critical violation.
* **Super Admin Governance:** Super Admin portal requires Master Email + Password + Google Authenticator TOTP. No public `/forgot-password` endpoints exist for Super Admin; account resets must be run via `scripts/reset-superadmin.ts`.
* **Cashier Governance:** `CASHIER` accounts cannot self-reset credentials. Account password updates must be initiated by `MERCHANT_OWNER` from the store management console.
* **API Secret Encryption:** All third-party secrets (Razorpay keys, WhatsApp tokens) stored in the database MUST be encrypted using AES-256-GCM.

## 3. POS Subsystem Constraints
* **Barcode Gun Buffer:** Keydown listener must capture input bursts occurring within < 50ms intervals. An `Enter` sequence immediately adds the item to cart.
* **Keyboard Shortcuts:** The `/` key must immediately focus the smart search input.
* **Thermal Printing Standard:** Thermal receipt templates must rely exclusively on pure CSS `@media print` formatted for 58mm and 80mm roll dimensions.
* **Non-Removable Viral Footer:** All customer receipts (thermal, digital, WhatsApp PDF) MUST retain the branding string:  
  `Powered by EcoDigiTech | pos.ecodigitech.com`

## 4. GST Engine Math Rules
* **Inclusive MRP Tax Breakdown:**  
  $$\text{Taxable Amount} = \frac{\text{MRP}}{1 + \frac{\text{GST Rate}}{100}}$$  
  $$\text{Tax Amount} = \text{MRP} - \text{Taxable Amount}$$
* **CGST / SGST Allocation:** CGST = 50% of Tax Amount, SGST = 50% of Tax Amount for intra-state billing. IGST = 100% of Tax Amount for inter-state billing.
* **Refurbished Margin Scheme (Section 15(5)):**  
  $$\text{Taxable Margin} = \max(0, \text{Selling Price} - \text{Purchase Price})$$  
  Tax is calculated only on the positive margin. Customer invoices report gross selling price without revealing acquisition cost.

## 5. Subscription & Lockout Rules
* **Trial Period:** 30-day cardless trial upon tenant creation.
* **Grace Period:** 3-day grace period post-expiry with prominent warning banner in POS UI.
* **Hard Lockout:** If `now() > valid_till + 3 days`, invoice creation (`POST /api/invoices/create`) MUST return HTTP 403 `SUBSCRIPTION_LOCKED`. Read access remains active.
