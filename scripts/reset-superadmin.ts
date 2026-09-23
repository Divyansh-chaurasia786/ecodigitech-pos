import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || "admin@ecodigitech.com";
  const rawPassword = args[1] || "Admin123!Password";

  console.log("=========================================");
  console.log(" EcoDigiTech Super Admin Reset Script");
  console.log("=========================================");
  console.log(`Target Email: ${email}`);

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Check if Super Admin user exists
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash: hashedPassword,
        totpSecret: null, // Wipe broken TOTP secret to allow re-enrollment
        role: "SUPER_ADMIN",
      },
    });
    console.log(`✅ Successfully updated Super Admin '${email}'. Password reset and TOTP secret wiped.`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name: "Super Admin",
        passwordHash: hashedPassword,
        totpSecret: null,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`✅ Successfully created Super Admin '${email}'. TOTP enrollment will be required on next login.`);
  }

  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error("❌ Error running reset-superadmin script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
