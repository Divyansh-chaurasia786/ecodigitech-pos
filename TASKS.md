# Master Task Breakdown

## Sprint 1: Project Scaffolding, Core Infrastructure & Routing
- [x] **Task 1.1:** Scaffold Next.js 15 App Router project structure with TypeScript, ESLint, and Tailwind CSS.
- [x] **Task 1.2:** Initialize Prisma, populate `prisma/schema.prisma` with the complete database schema provided in ARCHITECTURE.md, and generate the initial Prisma client.
- [x] **Task 1.3:** Configure `src/middleware.ts` to implement subdomain routing for `pos.ecodigitech.com` and `admin.ecodigitech.com` following the pattern mapped from `vercel/platforms`.
- [x] **Task 1.4:** Create the base directory structure for the route groups: `src/app/(marketing)`, `src/app/(pos)`, and `src/app/(admin)`.

## Sprint 2: Core Encryption, Subscription Guard & Security Auth Subsystems
- [x] **Task 2.1:** Create `src/lib/encryption.ts` using AES-256-GCM to securely encrypt and decrypt external system keys (Razorpay secrets, API keys) stored in database.
- [x] **Task 2.2:** Implement `src/lib/subscriptionGuard.ts`. Create a reusable server-side validation function that takes `tenant_id`, checks `valid_till` and grace period (3 days), and throws/returns 403 status code with 'SUBSCRIPTION_LOCKED' if grace window lapsed. Allow read queries, lock writes.
- [x] **Task 2.3:** Implement offline CLI recovery script `scripts/reset-superadmin.ts` using bcrypt to upsert master credentials and wipe broken TOTP secrets directly from terminal.
- [x] **Task 2.4:** Build Super Admin authentication flow on `admin.ecodigitech.com` (`src/app/(admin)/admin/login/page.tsx` and matching API routes) requiring master email, password, and Google Authenticator (TOTP via `otplib`) verification. Strictly no public forgot-password routes.
- [x] **Task 2.5:** Build Multi-tenant merchant authentication system on `pos.ecodigitech.com` (`src/app/(pos)/pos/login/page.tsx` and matching API routes). Enforce role-based access control (MERCHANT_OWNER self-serve OTP reset, CASHIER self-reset restricted, cookie isolation between admin & pos).

## Sprint 3: Core POS Engine, Scanner Listener & Hardware Integration
- [x] **Task 3.1:** Build the POS Counter Billing Interface layout at `src/app/(pos)/pos/billing/page.tsx` featuring active cart, tender breakdown, quick accessory tiles, and customer lookup.
- [x] **Task 3.2:** Implement the Hardware Barcode Scanner global keystroke hook at `src/lib/hardware/barcodeScanner.ts` (< 50ms burst capture, automatic dispatch on Enter).
- [x] **Task 3.3:** Implement the Smart Hybrid Search Component at `src/components/pos/SmartSearchBar.tsx` ('/' hotkey focus, 15-digit IMEI, HID barcode, fuzzy search, keyboard navigation).
- [x] **Task 3.4:** Implement the Dynamic Counter UPI QR Modal at `src/components/pos/DynamicUpiQrModal.tsx` (NPCI payload `upi://pay?pa=...`, live QR code, payment confirmation).
- [x] **Task 3.5:** Implement Driverless Browser Thermal Printing at `src/components/hardware/ThermalReceipt.tsx` (58mm/80mm roll `@media print` CSS with mandatory viral branding footer `"Powered by EcoDigiTech | pos.ecodigitech.com"`).

## Sprint 4: Business Modules, Dynamic Tax Engine, Intake & Khata Ledger
- [x] **Task 4.1:** Build Merchant Admin Settings panel at `src/app/(pos)/pos/settings/modules/page.tsx` and API route (`src/app/api/pos/settings/modules/route.ts`) with module toggles and default GST inputs.
- [x] **Task 4.2:** Implement Refurbished Phone Margin Scheme Invoice Engine at `src/lib/tax/marginScheme.ts` calculating Section 15(5) margin tax while concealing acquisition cost from customer receipts.
- [x] **Task 4.3:** Implement Used Phone Intake Workflow at `src/app/(pos)/pos/intake/page.tsx` and API route (`src/app/api/pos/intake/route.ts`) generating non-GST Purchase Vouchers with legal seller indemnification declarations.
- [x] **Task 4.4:** Implement Mobile Repair Lab Ticketing System at `src/app/(pos)/pos/repairs/page.tsx` and matching API routes managing Job Sheets (`REP-1001`), pattern/PIN capture, and SAC 9987 service billing.
- [x] **Task 4.5:** Implement Customer Khata / Udhaar Ledger Engine at `src/app/(pos)/pos/customers/[id]/page.tsx` and atomic invoice creation backend (`src/app/api/invoices/create/route.ts`) executed inside `prisma.$transaction` for ACID-compliant stock deduction, credit limit checks, and item snapshot freezing.

## Sprint 5: Marketing Landing Page, Subscriptions & Lockout Overlay Modal
- [x] **Task 5.1:** Build Public Marketing & Pricing Landing Page at `src/app/(marketing)/page.tsx` with self-serve 30-day cardless trial, 6-Month, 1-Year prepaid plans, and registration modal.
- [x] **Task 5.2:** Integrate Razorpay Prepaid Checkout API at `src/app/api/subscriptions/checkout/route.ts` decrypting keys via `src/lib/encryption.ts` to create Razorpay Orders.
- [x] **Task 5.3:** Build Razorpay Webhook Handler at `src/app/api/subscriptions/webhook/route.ts` with HMAC-SHA256 signature verification, extending `valid_till` by 180 or 365 days.
- [x] **Task 5.4:** Implement Hard Lockout Overlay Modal at `src/components/pos/SubscriptionLockoutModal.tsx` blocking write actions when grace window lapses and providing a one-click renewal checkout trigger.

## Sprint 6: Standalone Docker Containerization & VPS Deployment
- [x] **Task 6.1:** Configure Next.js `output: "standalone"` mode in `next.config.ts`.
- [x] **Task 6.2:** Create multi-stage production `Dockerfile` for Node.js 20 Alpine & Prisma Client.
- [x] **Task 6.3:** Create `.dockerignore` to optimize container build context.
- [x] **Task 6.4:** Create `docker-compose.yml` orchestrating Next.js app container & PostgreSQL database.
- [x] **Task 6.5:** Write comprehensive production deployment guide `DEPLOYMENT.md` covering Docker Compose, Nginx wildcard reverse proxy, and SSL.

