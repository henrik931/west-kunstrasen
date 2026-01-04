import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAllParcels, getParcelById, type ParcelType } from "@/lib/parcels";

export const runtime = "nodejs";

function initCounts(): Record<ParcelType, number> {
  return {
    goal: 0,
    penalty: 0,
    kickoff: 0,
    field: 0,
  };
}

export async function GET() {
  try {
    const total = initCounts();
    for (const parcel of generateAllParcels()) {
      total[parcel.type] += 1;
    }

    const sold = initCounts();
    const reserved = initCounts();

    const now = new Date();

const items = await prisma.reservationItem.findMany({
  where: {
    active: true,
    reservation: {
      OR: [
        { status: "PAID" },
        { status: "PENDING", expiresAt: { gt: now } },
      ],
    },
  },
  select: {
    parcelId: true,
    reservation: { select: { status: true } },
  },
});

    for (const item of items) {
      const parcel = getParcelById(item.parcelId);
      if (!parcel) continue;
      if (item.reservation.status === "PAID") {
        sold[parcel.type] += 1;
      } else if (item.reservation.status === "PENDING") {
        reserved[parcel.type] += 1;
      }
    }

    const available = initCounts();
    for (const type of Object.keys(total) as ParcelType[]) {
      available[type] = Math.max(0, total[type] - sold[type] - reserved[type]);
    }

    return NextResponse.json(
      { available },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Failed to fetch parcel summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch parcel summary" },
      { status: 500 }
    );
  }
}
