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
    const position = parseInt(parts[2], 10);
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
    const row = parseInt(parts[1], 10);
    const col = parseInt(parts[2], 10);
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
