import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function generateSlug(title: string): string {
    return encodeURIComponent((title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
}

async function main() {
  const offres = await prisma.offre.findMany({ where: { slug: null } });
  for (const o of offres) {
    let baseSlug = generateSlug(o.titre);
    let potentialSlug = baseSlug;
    let index = 1;
    let exists = await prisma.offre.findUnique({ where: { slug: potentialSlug } });
    while (exists) {
        potentialSlug = `${baseSlug}-${index}`;
        index++;
        exists = await prisma.offre.findUnique({ where: { slug: potentialSlug } });
    }
    await prisma.offre.update({ where: { id: o.id }, data: { slug: potentialSlug } });
    console.log(`Updated ${o.id} -> ${potentialSlug}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
