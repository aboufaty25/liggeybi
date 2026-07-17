import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const formation = await prisma.formation.findFirst();
  if (formation) {
    try {
      await prisma.formation.delete({ where: { id: formation.id } });
      console.log("Deleted");
    } catch(e) {
      console.error(e);
    }
  } else {
    console.log("No formation");
  }
}
main();
