const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pkgs = await prisma.cvPackage.findMany();
  
  // Find CV Gold and update it
  const gold = pkgs.find(p => p.nom === 'CV Gold');
  if (gold) {
    await prisma.cvPackage.update({
      where: { id: gold.id },
      data: { 
        type: 'DEPOT',
        options: 'Tout du pack Premium,Recommandation IA aux recruteurs,Badge Top Candidat',
        description: 'L\'arsenal ultime pour être embauché rapidement.'
      }
    });
    console.log("Updated CV Gold to DEPOT");
  }

}
main().catch(console.error).finally(() => prisma.$disconnect());
