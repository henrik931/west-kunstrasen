export type ReservationStatus = "pending" | "paid" | "expired" | "cancelled";

export interface ReservationDTO {
  id: string;
  parcels: string[];
  buyerName: string;
  buyerEmail: string;
  donorName?: string | null;
  anonymous: boolean;
  receiptRequested: boolean;
  buyerAddress?: string | null;
  buyerCity?: string | null;
  buyerZip?: string | null;
  totalAmount: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string;
  paidAt?: string | null;
}

export interface ReserveRequest {
  parcels: string[];
  buyerName: string;
  buyerEmail: string;
  donorName?: string | null;
  anonymous: boolean;
  receiptRequested: boolean;
  buyerAddress?: string | null;
  buyerCity?: string | null;
  buyerZip?: string | null;
}

export interface ReserveResponse {
  success: true;
  reservationId: string;
  totalAmount: number;
}
