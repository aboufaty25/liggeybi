import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const formation = await prisma.formation.create({
    data: {
      titre: "Test Delete",
      slug: "test-delete-123",
      description: "Desc"
    }
  });
  console.log("Created: " + formation.id);
  
  const user = await prisma.user.findFirst();
  if (!user) return;
  
  await prisma.userFormation.create({
    data: {
      userId: user.id,
      formationId: formation.id,
      progression: 50
    }
  });

  try {
    await prisma.formation.delete({ where: { id: formation.id } });
    console.log("Deleted");
  } catch(e) {
    console.error("Error formatting:", (e as Error).message);
  }
}
main();
