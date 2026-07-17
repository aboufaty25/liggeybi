import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Gueye@1992', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@liggeybi.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Administrateur',
    },
    create: {
      email: 'admin@liggeybi.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Administrateur',
      profile: {
        create: {
          nom: 'Gueye',
          prenom: 'Admin',
        }
      }
    },
  });
  
  console.log('Admin account created/updated:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
