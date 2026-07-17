import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  console.log("Starting migration of job expiration dates...");
  
  const jobs = await prisma.offre.findMany({
    where: {
      dateExpiration: null
    }
  });

  console.log(`Found ${jobs.length} jobs without dateExpiration.`);
  let updatedCount = 0;

  for (const job of jobs) {
    const postedDate = new Date(job.createdAt);
    const expirationDate = new Date(postedDate);
    expirationDate.setDate(postedDate.getDate() + 20);

    await prisma.offre.update({
      where: { id: job.id },
      data: {
        dateExpiration: expirationDate
      }
    });
    updatedCount++;
  }

  console.log(`Successfully updated ${updatedCount} jobs with a default expiration date (+20 days).`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
