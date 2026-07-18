import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const config = await prisma.siteConfig.findUnique({ where: { key: 'site_logo' } });
  console.log("Logo:", config?.value);
}
main().catch(console.error).finally(() => prisma.$disconnect());
