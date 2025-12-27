-- Add donation-related fields
ALTER TABLE "Reservation"
  ADD COLUMN "donorName" TEXT,
  ADD COLUMN "receiptRequested" BOOLEAN NOT NULL DEFAULT false;
