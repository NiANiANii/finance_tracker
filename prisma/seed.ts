import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Makanan" },
      { name: "Transportasi" },
      { name: "Hiburan" },
      { name: "Belanja" },
      { name: "Lainnya" },
    ],
  });
  console.log("Categories seeded!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

