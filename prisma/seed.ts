import { prisma } from "../lib/prisma";
import { generateAllParcels } from "../lib/parcels";

async function main() {
  const parcels = generateAllParcels();

  for (const parcel of parcels) {
    const priceCents = Math.round(parcel.price * 100);
    await prisma.parcel.upsert({
      where: { id: parcel.id },
      update: {
        type: parcel.type,
        priceCents,
      },
      create: {
        id: parcel.id,
        type: parcel.type,
        priceCents,
      },
    });
  }

  console.log(`Seeded ${parcels.length} parcels.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
