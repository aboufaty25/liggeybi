const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const pkgs = await prisma.package.findMany();
  console.log(pkgs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
