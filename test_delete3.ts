import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const formation = await prisma.formation.create({
    data: {
      titre: "Test Delete 3",
      slug: "test-delete-1234",
      description: "Desc"
    }
  });

  const chap = await prisma.chapitre.create({
    data: {
      formationId: formation.id,
      titre: "Chap 1",
      ordre: 1
    }
  });
  
  const user = await prisma.user.findFirst();
  if (!user) return;
  
  await prisma.userFormation.create({
    data: {
      userId: user.id,
      formationId: formation.id,
      progression: 50
    }
  });

  await prisma.chapterProgress.create({
    data: {
      userId: user.id,
      chapitreId: chap.id,
      isCompleted: true
    }
  });

  try {
    await prisma.formation.delete({ where: { id: formation.id } });
    console.log("Deleted successfully");
  } catch(e) {
    console.error("Error formatting:", (e as Error).message);
  }
}
main();
