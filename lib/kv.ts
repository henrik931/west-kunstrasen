export type ParcelType = "goal" | "penalty" | "kickoff" | "field";

export interface Parcel {
  id: string;
  type: ParcelType;
  price: number;
  row?: number;
  col?: number;
  goalSide?: "left" | "right";
  goalPosition?: number;
}

export type ParcelStatus = "available" | "reserved" | "sold";

export interface Reservation {
  id: string;
  parcels: string[];
  buyerName: string;
  buyerEmail: string;
  buyerAddress: string;
  buyerCity: string;
  buyerZip: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  confirmedAt?: string;
}

// Check if we're using real KV or mock
const USE_MOCK = !process.env.KV_REST_API_URL;

// In-memory mock storage
const mockStorage = {
  soldParcels: new Set<string>([
    // Some demo sold parcels
    "goal-left-0",
    "goal-left-1",
    "field-10-10",
    "field-10-11",
    "field-10-12",
    "field-25-30",
    "field-25-31",
  ]),
  reservedParcels: new Set<string>([
    // Some demo reserved parcels
    "penalty-left",
    "field-5-5",
    "field-5-6",
  ]),
  reservations: new Map<string, Reservation>([
    [
      "RES-DEMO-001",
      {
        id: "RES-DEMO-001",
        parcels: ["goal-left-0", "goal-left-1"],
        buyerName: "Max Mustermann",
        buyerEmail: "max@beispiel.de",
        buyerAddress: "Musterstraße 123",
        buyerCity: "Köln",
        buyerZip: "50825",
        totalAmount: 600,
        status: "confirmed",
        createdAt: "2025-01-15T10:00:00Z",
        confirmedAt: "2025-01-16T14:30:00Z",
      },
    ],
    [
      "RES-DEMO-002",
      {
        id: "RES-DEMO-002",
        parcels: ["penalty-left", "field-5-5", "field-5-6"],
        buyerName: "Erika Musterfrau",
        buyerEmail: "erika@beispiel.de",
        buyerAddress: "Beispielweg 45",
        buyerCity: "Köln",
        buyerZip: "50827",
        totalAmount: 400,
        status: "pending",
        createdAt: "2025-01-20T09:15:00Z",
      },
    ],
  ]),
  reservationsList: ["RES-DEMO-002", "RES-DEMO-001"],
};

// Lazy-loaded KV client
let kvClient: typeof import("@vercel/kv").kv | null = null;
async function getKV() {
  if (!kvClient) {
    const { kv } = await import("@vercel/kv");
    kvClient = kv;
  }
  return kvClient;
}

const KEYS = {
  SOLD_PARCELS: "parcels:sold",
  RESERVED_PARCELS: "parcels:reserved",
  RESERVATION: (id: string) => `reservation:${id}`,
  RESERVATIONS_LIST: "reservations:list",
};

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

export async function getSoldAndReservedParcels(): Promise<{
  sold: string[];
  reserved: string[];
}> {
  if (USE_MOCK) {
    return {
      sold: Array.from(mockStorage.soldParcels),
      reserved: Array.from(mockStorage.reservedParcels),
    };
  }

  const kv = await getKV();
  const [sold, reserved] = await Promise.all([
    kv.smembers(KEYS.SOLD_PARCELS),
    kv.smembers(KEYS.RESERVED_PARCELS),
  ]);

  return {
    sold: (sold || []) as string[],
    reserved: (reserved || []) as string[],
  };
}

export async function areParcelsAvailable(
  parcelIds: string[]
): Promise<boolean> {
  const { sold, reserved } = await getSoldAndReservedParcels();
  const unavailable = new Set([...sold, ...reserved]);

  return parcelIds.every((id) => !unavailable.has(id));
}

export async function createReservation(
  reservation: Reservation
): Promise<void> {
  if (USE_MOCK) {
    mockStorage.reservations.set(reservation.id, reservation);
    reservation.parcels.forEach((p) => mockStorage.reservedParcels.add(p));
    mockStorage.reservationsList.unshift(reservation.id);
    console.log("[MOCK] Created reservation:", reservation.id);
    return;
  }

  const kv = await getKV();
  await Promise.all([
    kv.set(KEYS.RESERVATION(reservation.id), reservation),
    kv.sadd(
      KEYS.RESERVED_PARCELS,
      ...(reservation.parcels as [string, ...string[]])
    ),
    kv.lpush(KEYS.RESERVATIONS_LIST, reservation.id),
  ]);
}

export async function getReservation(id: string): Promise<Reservation | null> {
  if (USE_MOCK) {
    return mockStorage.reservations.get(id) || null;
  }

  const kv = await getKV();
  return kv.get<Reservation>(KEYS.RESERVATION(id));
}

export async function getAllReservations(): Promise<Reservation[]> {
  if (USE_MOCK) {
    return mockStorage.reservationsList
      .map((id) => mockStorage.reservations.get(id))
      .filter((r): r is Reservation => r !== undefined);
  }

  const kv = await getKV();
  const reservationIds = await kv.lrange(KEYS.RESERVATIONS_LIST, 0, -1);

  if (!reservationIds || reservationIds.length === 0) {
    return [];
  }

  const reservations = await Promise.all(
    reservationIds.map((id) => getReservation(id as string))
  );

  return reservations.filter((r): r is Reservation => r !== null);
}

export async function confirmReservation(id: string): Promise<boolean> {
  const reservation = await getReservation(id);

  if (!reservation || reservation.status !== "pending") {
    return false;
  }

  const updatedReservation: Reservation = {
    ...reservation,
    status: "confirmed",
    confirmedAt: new Date().toISOString(),
  };

  if (USE_MOCK) {
    mockStorage.reservations.set(id, updatedReservation);
    reservation.parcels.forEach((p) => {
      mockStorage.reservedParcels.delete(p);
      mockStorage.soldParcels.add(p);
    });
    console.log("[MOCK] Confirmed reservation:", id);
    return true;
  }

  const kv = await getKV();
  await Promise.all([
    kv.set(KEYS.RESERVATION(id), updatedReservation),
    kv.srem(
      KEYS.RESERVED_PARCELS,
      ...(reservation.parcels as [string, ...string[]])
    ),
    kv.sadd(
      KEYS.SOLD_PARCELS,
      ...(reservation.parcels as [string, ...string[]])
    ),
  ]);

  return true;
}

export async function cancelReservation(id: string): Promise<boolean> {
  const reservation = await getReservation(id);

  if (!reservation || reservation.status !== "pending") {
    return false;
  }

  const updatedReservation: Reservation = {
    ...reservation,
    status: "cancelled",
  };

  if (USE_MOCK) {
    mockStorage.reservations.set(id, updatedReservation);
    reservation.parcels.forEach((p) => mockStorage.reservedParcels.delete(p));
    console.log("[MOCK] Cancelled reservation:", id);
    return true;
  }

  const kv = await getKV();
  await Promise.all([
    kv.set(KEYS.RESERVATION(id), updatedReservation),
    kv.srem(
      KEYS.RESERVED_PARCELS,
      ...(reservation.parcels as [string, ...string[]])
    ),
  ]);

  return true;
}

// Field configuration
export const FIELD_CONFIG = {
  GRID_COLS: 60,
  GRID_ROWS: 50,
  GOAL_PARCELS_PER_SIDE: 5,
  PRICES: {
    goal: 300,
    penalty: 300,
    kickoff: 500,
    field: 50,
  },
} as const;

export function generateAllParcels(): Parcel[] {
  const parcels: Parcel[] = [];

  for (let i = 0; i < 5; i++) {
    parcels.push({
      id: `goal-left-${i}`,
      type: "goal",
      price: FIELD_CONFIG.PRICES.goal,
      goalSide: "left",
      goalPosition: i,
    });
  }

  for (let i = 0; i < 5; i++) {
    parcels.push({
      id: `goal-right-${i}`,
      type: "goal",
      price: FIELD_CONFIG.PRICES.goal,
      goalSide: "right",
      goalPosition: i,
    });
  }

  parcels.push({
    id: "penalty-left",
    type: "penalty",
    price: FIELD_CONFIG.PRICES.penalty,
  });
  parcels.push({
    id: "penalty-right",
    type: "penalty",
    price: FIELD_CONFIG.PRICES.penalty,
  });

  parcels.push({
    id: "kickoff",
    type: "kickoff",
    price: FIELD_CONFIG.PRICES.kickoff,
  });

  for (let row = 0; row < FIELD_CONFIG.GRID_ROWS; row++) {
    for (let col = 0; col < FIELD_CONFIG.GRID_COLS; col++) {
      parcels.push({
        id: `field-${row}-${col}`,
        type: "field",
        price: FIELD_CONFIG.PRICES.field,
        row,
        col,
      });
    }
  }

  return parcels;
}

export function getParcelById(id: string): Parcel | undefined {
  if (id.startsWith("goal-")) {
    const parts = id.split("-");
    const side = parts[1] as "left" | "right";
    const position = parseInt(parts[2]);
    return {
      id,
      type: "goal",
      price: FIELD_CONFIG.PRICES.goal,
      goalSide: side,
      goalPosition: position,
    };
  }

  if (id.startsWith("penalty-")) {
    return {
      id,
      type: "penalty",
      price: FIELD_CONFIG.PRICES.penalty,
    };
  }

  if (id === "kickoff") {
    return {
      id,
      type: "kickoff",
      price: FIELD_CONFIG.PRICES.kickoff,
    };
  }

  if (id.startsWith("field-")) {
    const parts = id.split("-");
    const row = parseInt(parts[1]);
    const col = parseInt(parts[2]);
    return {
      id,
      type: "field",
      price: FIELD_CONFIG.PRICES.field,
      row,
      col,
    };
  }

  return undefined;
}

export function calculateTotal(parcelIds: string[]): number {
  return parcelIds.reduce((total, id) => {
    const parcel = getParcelById(id);
    return total + (parcel?.price || 0);
  }, 0);
}
