const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const users = await prisma.user.findMany({
    where: { role: 'CANDIDAT' },
    select: { profile: true }
  });
  console.log(users.map(u => u.profile?.cvUrl).filter(Boolean));
}
check();
