import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const reqPath = "/formations/epreuves-corrig-es-fastef-2021-fran-ais-anglais-concours-d-entr-e-bac-guide-complet-de-pr-paration";
    const offreMatch = reqPath.match(/^\/offre\/([^\/]+)/);
    const formationMatch = !offreMatch && reqPath.match(/^\/formations\/([^\/]+)/);
    console.log("formationMatch", formationMatch);
    
    if (formationMatch) {
      const slug = formationMatch[1];
      const item = await prisma.formation.findFirst({ where: { OR: [{ id: slug }, { slug: slug }] } });
      console.log("item", item?.id, item?.titre);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
