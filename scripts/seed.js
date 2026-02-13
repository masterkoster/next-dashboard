require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();

  const user = await prisma.user.upsert({
    where: { email: "dkoster@oakland.edu" },
    update: { credits: 500 },
    create: {
      email: "dkoster@oakland.edu",
      name: "dkoster@oakland.edu",
      credits: 500,
      purchasedModules: "[]",
    },
  });

  console.log("Seeded user:", user.email, "credits:", user.credits);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
