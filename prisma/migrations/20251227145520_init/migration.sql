-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Parcel" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "buyerAddress" TEXT,
    "buyerCity" TEXT,
    "buyerZip" TEXT,
    "totalCents" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationItem" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "parcelId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReservationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReservationItem_reservationId_idx" ON "ReservationItem"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationItem_parcelId_idx" ON "ReservationItem"("parcelId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationItem_parcelId_active_key" ON "ReservationItem"("parcelId", "active");

-- AddForeignKey
ALTER TABLE "ReservationItem" ADD CONSTRAINT "ReservationItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
