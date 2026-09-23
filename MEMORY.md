# EcoDigiTech POS SaaS - System Memory & Architecture Summary

## System Architecture
* **Brand Name:** EcoDigiTech
* **Product:** Multi-tenant Cloud Retail & Repair POS SaaS
* **Framework:** Next.js 15 App Router (TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL)
* **Domain Topology & Subdomain Rewrites (`src/middleware.ts`):**
  - `admin.ecodigitech.com` -> `src/app/(admin)/admin` (Super Admin Console)
  - `pos.ecodigitech.com` -> `src/app/(pos)/pos` (Merchant Store POS & Dashboard)
  - `ecodigitech.com` (Apex) -> `src/app/(marketing)` (Public Landing Page)

## Core Security & Multi-Tenancy Rules
- **Mandatory Query Scoping:** All database operations on `Invoice`, `Product`, `Customer`, `Tenant`, `UsedPhoneIntake`, and `RepairTicket` strictly include `tenantId`.
- **Super Admin Governance:** Super Admin portal uses Master Email + Password + Google Authenticator TOTP. No public `/forgot-password` endpoints exist; account resets are performed strictly offline via CLI: `scripts/reset-superadmin.ts`.
- **Cashier Governance:** `CASHIER` accounts cannot self-reset credentials from the login screen (returns HTTP 403 `CASHIER_RESTRICTED`). Resetting cashier credentials must be done by the `MERCHANT_OWNER`.
- **Secret Encryption:** External secrets (Razorpay API keys, WhatsApp tokens) are encrypted using AES-256-GCM via `src/lib/encryption.ts`.
- **Subscription Lifecycle & Lockout Engine:**
  - `now <= validTill`: `ACTIVE` / `TRIAL` (30-day cardless trial).
  - `validTill < now <= validTill + 3 days`: `GRACE` (writes allowed with warning banner).
  - `now > validTill + 3 days`: `LOCKED`. Server aborts invoice creation with HTTP 403 `SUBSCRIPTION_LOCKED` (`src/lib/subscriptionGuard.ts`). Read queries remain accessible. Non-dismissible backdrop-blur lockout modal displayed (`src/components/pos/SubscriptionLockoutModal.tsx`).
- **Viral Brand Footer:** All customer receipts (thermal, digital, WhatsApp PDF) permanently display:  
  `Powered by EcoDigiTech | pos.ecodigitech.com`
