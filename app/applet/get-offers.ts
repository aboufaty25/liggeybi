import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const jobs = await prisma.offre.findMany({ take: 5, orderBy: { updatedAt: 'desc' }, select: { id: true, titre: true, createdAt: true, updatedAt: true } });
  console.log(JSON.stringify(jobs, null, 2));
}
main().catch(console.error).finally(()=>prisma.$disconnect());
