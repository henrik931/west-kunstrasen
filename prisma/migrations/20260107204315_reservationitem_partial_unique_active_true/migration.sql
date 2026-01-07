DROP INDEX IF EXISTS "ReservationItem_parcelId_active_key";
DROP INDEX IF EXISTS "ReservationItem_parcelId_active_unique";

CREATE UNIQUE INDEX "ReservationItem_parcelId_active_true_key"
ON "ReservationItem" ("parcelId")
WHERE "active" = true;
