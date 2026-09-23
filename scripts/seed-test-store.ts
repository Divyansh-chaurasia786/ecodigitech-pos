import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "store@ecodigitech.com";
  const phone = "9876543210";
  const password = "Store123!Password";
  const businessName = "EcoDigiTech Demo Store";
  const ownerName = "Demo Store Owner";

  console.log("=========================================");
  console.log(" EcoDigiTech Store POS Credentials Setup");
  console.log("=========================================");

  const hashedPassword = await bcrypt.hash(password, 10);
  const validTill = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 Year

  // Check or create Tenant
  let tenant = await prisma.tenant.findUnique({
    where: { email },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        businessName,
        ownerName,
        email,
        phone,
        status: "ACTIVE",
        validTill,
        moduleNewPhones: true,
        moduleRefurbished: true,
        moduleBuyIn: true,
        moduleRepairs: true,
        moduleAccessories: true,
      },
    });
    console.log(`✅ Created Tenant: ${businessName}`);
  }

  // Check or create User
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash: hashedPassword,
        tenantId: tenant.id,
        role: "MERCHANT_OWNER",
      },
    });
    console.log(`✅ Updated Store User '${email}' with password '${password}'`);
  } else {
    await prisma.user.create({
      data: {
        tenantId: tenant.id,
        role: "MERCHANT_OWNER",
        name: ownerName,
        email,
        phone,
        passwordHash: hashedPassword,
      },
    });
    console.log(`✅ Created Store User '${email}' with password '${password}'`);
  }

  console.log("=========================================");
  console.log("Credentials Summary:");
  console.log(`Email / Username : ${email}`);
  console.log(`Phone            : ${phone}`);
  console.log(`Password         : ${password}`);
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error("❌ Error setting up test store:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
