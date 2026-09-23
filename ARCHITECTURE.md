# Architecture & Database Specification

## 1. Domain Topology & Request Flow

```
                                [ Incoming Request ]
                                         │
                                         ▼
                                `src/middleware.ts`
                                         │
               ┌─────────────────────────┼─────────────────────────┐
               ▼                         ▼                         ▼
      admin.ecodigitech.com       pos.ecodigitech.com         ecodigitech.com (Apex)
               │                         │                         │
               ▼                         ▼                         ▼
      `src/app/(admin)`          `src/app/(pos)`           `src/app/(marketing)`
    (Super Admin Console)     (Store POS & Dashboard)        (Public Landing Page)
```

---

## 2. Complete Prisma Database Schema Definition

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  MERCHANT_OWNER
  CASHIER
}

enum TenantStatus {
  TRIAL
  ACTIVE
  GRACE
  LOCKED
}

enum PaymentMode {
  UPI
  CASH
  CARD
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
}

enum RepairStatus {
  RECEIVED
  IN_PROGRESS
  COMPLETED
  DELIVERED
}

enum ProductCategory {
  BRAND_NEW
  REFURBISHED
  ACCESSORY
  REPAIR_PART
}

model Tenant {
  id                 String             @id @default(uuid())
  businessName       String
  ownerName          String
  phone              String             @unique
  email              String             @unique
  gstin              String?
  address            String?
  upiVpa             String?
  status             TenantStatus       @default(TRIAL)
  validTill          DateTime
  
  // Feature Toggles
  moduleNewPhones    Boolean            @default(true)
  moduleRefurbished  Boolean            @default(true)
  moduleBuyIn        Boolean            @default(true)
  moduleRepairs      Boolean            @default(true)
  moduleAccessories  Boolean            @default(true)

  // Encrypted API Secrets
  razorpayKeyId      String?
  razorpaySecretEnc  String?
  whatsappTokenEnc   String?

  users              User[]
  products           Product[]
  customers          Customer[]
  invoices           Invoice[]
  invoiceItems       InvoiceItem[]
  usedPhoneIntakes   UsedPhoneIntake[]
  repairTickets      RepairTicket[]
  subscriptions      SubscriptionLog[]

  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@map("tenants")
}

model User {
  id           String      @id @default(uuid())
  tenantId     String?
  tenant       Tenant?     @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  role         Role        @default(CASHIER)
  name         String
  email        String      @unique
  phone        String?
  passwordHash String
  totpSecret   String?     // Super admin TOTP secret

  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@map("users")
}

model Customer {
  id               String            @id @default(uuid())
  tenantId         String
  tenant           Tenant            @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  name             String
  phone            String
  email            String?
  aadhaarNumber    String?
  idPhotoUrl       String?
  address          String?

  invoices         Invoice[]
  usedPhoneIntakes UsedPhoneIntake[]
  repairTickets    RepairTicket[]

  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  @@index([tenantId, phone])
  @@map("customers")
}

model Product {
  id             String          @id @default(uuid())
  tenantId       String
  tenant         Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  category       ProductCategory
  title          String
  barcode        String?
  imei1          String?
  imei2          String?
  serialNumber   String?
  purchasePrice  Float           @default(0)
  sellingPrice   Float           // MRP inclusive of tax
  stockQuantity  Int             @default(1)
  hsnSacCode     String          @default("8517")
  gstRate        Float           @default(18.0)

  invoiceItems   InvoiceItem[]

  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([tenantId, barcode])
  @@index([tenantId, imei1])
  @@map("products")
}

model Invoice {
  id             String        @id @default(uuid())
  tenantId       String
  tenant         Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  invoiceNumber  String        @unique
  customerId     String?
  customer       Customer?     @relation(fields: [customerId], references: [id], onDelete: SetNull)
  totalAmount    Float
  taxAmount      Float
  marginTaxAmount Float        @default(0)
  paymentMode    PaymentMode   @default(UPI)
  paymentStatus  PaymentStatus @default(COMPLETED)
  viralFooter    String        @default("Powered by EcoDigiTech | pos.ecodigitech.com")

  items          InvoiceItem[]

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([tenantId, invoiceNumber])
  @@map("invoices")
}

model InvoiceItem {
  id            String    @id @default(uuid())
  tenantId      String
  tenant        Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  invoiceId     String
  invoice       Invoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  productId     String?
  product       Product?  @relation(fields: [productId], references: [id], onDelete: SetNull)
  itemType      ProductCategory
  title         String
  imei1         String?
  imei2         String?
  unitPrice     Float
  purchasePrice Float     @default(0)
  quantity      Int       @default(1)
  gstRate       Float     @default(18.0)
  taxAmount     Float
  totalAmount   Float

  createdAt     DateTime  @default(now())

  @@index([tenantId, invoiceId])
  @@map("invoice_items")
}

model UsedPhoneIntake {
  id                    String   @id @default(uuid())
  tenantId              String
  tenant                Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customerId            String
  customer              Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  deviceName            String
  imei1                 String
  imei2                 String?
  conditionNotes        String?
  purchasePrice         Float
  sellerAadhaarUrl      String?
  legalAgreementAccepted Boolean  @default(true)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([tenantId, imei1])
  @@map("used_phone_intakes")
}

model RepairTicket {
  id                 String       @id @default(uuid())
  tenantId           String
  tenant             Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customerId         String
  customer           Customer     @relation(fields: [customerId], references: [id], onDelete: Cascade)
  deviceName         String
  problemDescription String
  pinPattern         String?
  estimatedCost      Float
  advancePaid        Float        @default(0)
  status             RepairStatus @default(RECEIVED)
  sacCode            String       @default("9987")

  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  @@index([tenantId, status])
  @@map("repair_tickets")
}

model SubscriptionLog {
  id               String   @id @default(uuid())
  tenantId         String
  tenant           Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  planType         String   // "6_MONTH" or "1_YEAR"
  razorpayOrderId  String
  razorpayPaymentId String?
  amount           Float
  validFrom        DateTime
  validTo          DateTime

  createdAt        DateTime @default(now())

  @@index([tenantId])
  @@map("subscription_logs")
}
```
