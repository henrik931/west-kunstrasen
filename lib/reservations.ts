import "server-only";

import { Prisma, ReservationStatus as PrismaReservationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ParcelStatus } from "@/lib/parcels";
import type { ReservationDTO, ReservationStatus } from "@/lib/types";

const STATUS_MAP: Record<PrismaReservationStatus, ReservationStatus> = {
  PENDING: "pending",
  PAID: "paid",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

function toReservationDTO(reservation: {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerAddress: string | null;
  buyerCity: string | null;
  buyerZip: string | null;
  totalCents: number;
  status: PrismaReservationStatus;
  createdAt: Date;
  expiresAt: Date;
  paidAt: Date | null;
  items: { parcelId: string }[];
}): ReservationDTO {
  return {
    id: reservation.id,
    parcels: reservation.items.map((item) => item.parcelId),
    buyerName: reservation.buyerName,
    buyerEmail: reservation.buyerEmail,
    buyerAddress: reservation.buyerAddress,
    buyerCity: reservation.buyerCity,
    buyerZip: reservation.buyerZip,
    totalAmount: reservation.totalCents / 100,
    status: STATUS_MAP[reservation.status],
    createdAt: reservation.createdAt.toISOString(),
    expiresAt: reservation.expiresAt.toISOString(),
    paidAt: reservation.paidAt?.toISOString() ?? null,
  };
}

export interface CreateReservationInput {
  id: string;
  parcels: string[];
  buyerName: string;
  buyerEmail: string;
  buyerAddress?: string;
  buyerCity?: string;
  buyerZip?: string;
  totalAmount: number;
}

export async function getSoldAndReservedParcels(): Promise<{
  sold: string[];
  reserved: string[];
}> {
  await expireReservations();

  const [soldItems, reservedItems] = await Promise.all([
    prisma.reservationItem.findMany({
      where: {
        active: true,
        reservation: { status: "PAID" },
      },
      select: { parcelId: true },
    }),
    prisma.reservationItem.findMany({
      where: {
        active: true,
        reservation: { status: "PENDING" },
      },
      select: { parcelId: true },
    }),
  ]);

  return {
    sold: soldItems.map((item) => item.parcelId),
    reserved: reservedItems.map((item) => item.parcelId),
  };
}

export async function getParcelStatuses(): Promise<Map<string, ParcelStatus>> {
  const { sold, reserved } = await getSoldAndReservedParcels();
  const statuses = new Map<string, ParcelStatus>();

  for (const parcelId of sold) {
    statuses.set(parcelId, "sold");
  }

  for (const parcelId of reserved) {
    if (!statuses.has(parcelId)) {
      statuses.set(parcelId, "reserved");
    }
  }

  return statuses;
}

export async function areParcelsAvailable(parcelIds: string[]): Promise<boolean> {
  if (parcelIds.length === 0) return true;

  const count = await prisma.reservationItem.count({
    where: {
      parcelId: { in: parcelIds },
      active: true,
    },
  });

  return count === 0;
}

export async function createReservation(
  input: CreateReservationInput
): Promise<ReservationDTO> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const created = await tx.reservation.create({
        data: {
          id: input.id,
          buyerName: input.buyerName,
          buyerEmail: input.buyerEmail,
          buyerAddress: input.buyerAddress ?? null,
          buyerCity: input.buyerCity ?? null,
          buyerZip: input.buyerZip ?? null,
          totalCents: Math.round(input.totalAmount * 100),
          expiresAt,
        },
      });

      await tx.reservationItem.createMany({
        data: input.parcels.map((parcelId) => ({
          reservationId: input.id,
          parcelId,
          active: true,
        })),
      });

      return created;
    });

    return toReservationDTO({
      ...reservation,
      items: input.parcels.map((parcelId) => ({ parcelId })),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("PARCEL_NOT_AVAILABLE");
    }

    throw error;
  }
}

export async function getReservation(id: string): Promise<ReservationDTO | null> {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { items: { select: { parcelId: true } } },
  });

  if (!reservation) return null;

  return toReservationDTO(reservation);
}

export async function getAllReservations(): Promise<ReservationDTO[]> {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { select: { parcelId: true } } },
  });

  return reservations.map((reservation) => toReservationDTO(reservation));
}

export async function confirmReservation(id: string): Promise<boolean> {
  const result = await prisma.reservation.updateMany({
    where: { id, status: "PENDING" },
    data: { status: "PAID", paidAt: new Date() },
  });

  return result.count > 0;
}

export async function cancelReservation(id: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.reservation.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });

    if (result.count === 0) return false;

    await tx.reservationItem.updateMany({
      where: { reservationId: id, active: true },
      data: { active: false },
    });

    return true;
  });
}

export async function expireReservations(): Promise<number> {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const expiring = await tx.reservation.findMany({
      where: { status: "PENDING", expiresAt: { lt: now } },
      select: { id: true },
    });

    if (expiring.length === 0) return 0;

    const ids = expiring.map((reservation) => reservation.id);

    await tx.reservation.updateMany({
      where: { id: { in: ids } },
      data: { status: "EXPIRED" },
    });

    await tx.reservationItem.updateMany({
      where: { reservationId: { in: ids } },
      data: { active: false },
    });

    return ids.length;
  });
}
