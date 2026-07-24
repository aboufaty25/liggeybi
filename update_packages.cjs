const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.cvPackage.updateMany({
    where: { nom: 'CV Starter' },
    data: { prix: 490, type: 'DEPOT' }
  });
  
  // check if 990 package exists
  const existing990 = await prisma.cvPackage.findFirst({
    where: { prix: 990 }
  });
  
  if (!existing990) {
    await prisma.cvPackage.create({
      data: {
        nom: 'CV Pro',
        description: 'Import complet + Top position dans la CVthèque. Label Profil Vérifié pour multiplier vos chances.',
        prix: 990,
        options: 'Badge Profil Vérifié,Tête de liste,Support prioritaire',
        actif: true,
        dureeJours: 99999,
        type: 'DEPOT'
      }
    });
  } else {
    await prisma.cvPackage.update({
      where: { id: existing990.id },
      data: {
        type: 'DEPOT'
      }
    });
  }

  const pkgs = await prisma.cvPackage.findMany();
  console.log(pkgs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
