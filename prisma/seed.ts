import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear DB
  await prisma.report.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.taskCompletion.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleared successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
