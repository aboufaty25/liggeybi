const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const profiles = await prisma.profile.findMany({
    where: { cvUrl: { not: null } },
    take: 5
  });
  console.log(profiles.map(p => p.cvUrl));
}
run();
