export type ReservationStatus = "pending" | "paid" | "expired" | "cancelled";

export interface ReservationDTO {
  id: string;
  parcels: string[];
  buyerName: string;
  buyerEmail: string;
  buyerAddress?: string | null;
  buyerCity?: string | null;
  buyerZip?: string | null;
  totalAmount: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string;
  paidAt?: string | null;
}
