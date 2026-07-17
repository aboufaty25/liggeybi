import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const offers = await prisma.offre.findMany({
    orderBy: { createdAt: 'desc' },
    take: 7
  });
  console.log(offers.map(o => ({ id: o.id, title: o.titre, img: o.imageUrl })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
