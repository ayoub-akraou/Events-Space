export type Location = {
  id: string;
  name: string;
  addressLine?: string | null;
  city?: string | null;
  country?: string | null;
};

export type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
  capacityMax: number;
  locationId: string;
  location?: Location;
  remainingCapacity?: number;
};

export type ReservationItem = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "REFUSED" | "CANCELED";
  requestedAt: string;
  confirmedAt?: string | null;
  refusedAt?: string | null;
  canceledAt?: string | null;
  eventId: string;
  userId: string;
  event?: EventItem;
};
