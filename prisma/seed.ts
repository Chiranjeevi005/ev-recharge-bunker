import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminEmail = "admin@ebunker.com";
  const adminPassword = "admin123";
  
  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });
  
  if (!existingAdmin) {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create the admin user
    const admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        hashedPassword,
        role: "admin"
      }
    });
    
    console.log("Default admin user created:");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminPassword} (change this in production!)`);
  } else {
    console.log("Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });