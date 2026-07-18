import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const formation = await prisma.formation.findFirst();
  console.log("Found formation:", formation?.id, formation?.slug, formation?.titre);
}
main().catch(console.error).finally(() => prisma.$disconnect());
