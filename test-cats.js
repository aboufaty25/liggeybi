import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.offre.count({ where: { categorie: 'candidature-spontanee', statut: 'approuve' } });
  console.log("Total candidature-spontanee:", count);
  const jobs = await prisma.offre.findMany({ where: { categorie: 'candidature-spontanee', statut: 'approuve' }, select: { isPremium: true } });
  console.log(jobs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
