const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pkgs = await prisma.cvPackage.findMany();
  
  // Find CV Premium and update it to 990
  const premium = pkgs.find(p => p.nom === 'CV Premium');
  if (premium) {
    await prisma.cvPackage.update({
      where: { id: premium.id },
      data: { prix: 990, type: 'DEPOT' }
    });
    console.log("Updated CV Premium to 990");
  }

  // Find CV Pro (the one I created) and delete it
  const pro = pkgs.find(p => p.nom === 'CV Pro');
  if (pro) {
    await prisma.cvPackage.delete({
      where: { id: pro.id }
    });
    console.log("Deleted CV Pro");
  }

}
main().catch(console.error).finally(() => prisma.$disconnect());
