const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allPkgs = await prisma.cvPackage.findMany();
  console.log("All packages:", allPkgs.map(p => ({ id: p.id, nom: p.nom, prix: p.prix })));

  const pkgs990 = await prisma.cvPackage.findMany({ where: { prix: 990 } });
  
  if (pkgs990.length > 1) {
    // Delete the one we created. I think it was named 'CV Pro' and had id cmrzbqqt30000s6sls4ahzvar or similar.
    // Let's sort by createdAt descending and delete the newest one.
    pkgs990.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const toDelete = pkgs990[0];
    console.log("Deleting duplicate:", toDelete);
    await prisma.cvPackage.delete({ where: { id: toDelete.id } });
  } else if (pkgs990.length === 1) {
    console.log("Only one 990 package found:", pkgs990[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
