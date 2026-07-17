const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({
    where: { cvUrl: { not: null } },
    take: 5
  });
  console.log(users.map(u => u.cvUrl));
}
run();
