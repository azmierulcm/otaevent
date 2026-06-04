import type { BidStatus, EventStatus, EventVisibility, RSVPStatus } from "@/lib/supabase/types";

export type CustomerEvent = {
  id: string;
  name: string;
  budget: number;
  services: string[];
  event_date: string;
  details: string | null;
  capacity: number;
  location: string | null;
  status: EventStatus;
  visibility: EventVisibility;
  share_slug: string;
  created_at: string;
};

export type CustomerBid = {
  id: string;
  event_id: string;
  vendor_name: string;
  amount: number;
  message: string | null;
  status: BidStatus;
  created_at: string;
};

export type PublicRegistry = {
  id: string;
  event_id: string;
  title: string;
  note: string | null;
};

export type PublicRegistryItem = {
  id: string;
  registry_id: string;
  title: string;
  description: string | null;
  image_path: string | null;
  target_quantity: number;
  claimed_quantity: number;
  claimed_by_name: string | null;
  claimed_by_email: string | null;
  external_url: string | null;
};

export type PublicRSVP = {
  id: string;
  event_id: string;
  guest_name: string;
  guest_email: string;
  status: RSVPStatus;
  party_size: number;
  note: string | null;
};

export const demoCustomerEvents: CustomerEvent[] = [
  {
    id: "evt-garden-dinner",
    name: "Garden engagement dinner",
    budget: 8500,
    services: ["Catering", "Florals", "Photography"],
    event_date: "2026-08-22",
    details: "Warm garden dinner with a long-table setup, soft florals, and documentary photography.",
    capacity: 42,
    location: "Kuala Lumpur",
    status: "open",
    visibility: "shared",
    share_slug: "garden-engagement",
    created_at: "2026-06-04T18:00:00.000Z",
  },
  {
    id: "evt-birthday-brunch",
    name: "Private birthday brunch",
    budget: 5200,
    services: ["Venue", "Dessert", "Decor"],
    event_date: "2026-09-06",
    details: "A calm brunch with a dessert table, acoustic set, and light decor.",
    capacity: 35,
    location: "Penang",
    status: "matched",
    visibility: "shared",
    share_slug: "birthday-brunch",
    created_at: "2026-06-01T09:00:00.000Z",
  },
];

export const demoBids: CustomerBid[] = [
  {
    id: "bid-atelier",
    event_id: "evt-garden-dinner",
    vendor_name: "Modern Dessert Atelier",
    amount: 1350,
    message: "We can style a compact dessert bar with plated petits fours and a signature cake.",
    status: "pending",
    created_at: "2026-06-04T19:20:00.000Z",
  },
  {
    id: "bid-floral",
    event_id: "evt-garden-dinner",
    vendor_name: "Editorial Floral Studio",
    amount: 2200,
    message: "We recommend loose garden arrangements, candles, and a small ceremony arch.",
    status: "pending",
    created_at: "2026-06-04T18:42:00.000Z",
  },
  {
    id: "bid-venue",
    event_id: "evt-birthday-brunch",
    vendor_name: "Linen House Venue",
    amount: 3100,
    message: "Our private dining room is available with morning setup and in-house service staff.",
    status: "accepted",
    created_at: "2026-06-02T12:30:00.000Z",
  },
];

export const demoRegistry: PublicRegistry = {
  id: "reg-garden-dinner",
  event_id: "evt-garden-dinner",
  title: "Garden dinner registry",
  note: "A few thoughtful ways to help us host the evening.",
};

export const demoRegistryItems: PublicRegistryItem[] = [
  {
    id: "reg-item-candles",
    registry_id: "reg-garden-dinner",
    title: "Taper candle set",
    description: "Ivory tapers for the long table.",
    image_path: null,
    target_quantity: 6,
    claimed_quantity: 2,
    claimed_by_name: null,
    claimed_by_email: null,
    external_url: "https://example.com/candles",
  },
  {
    id: "reg-item-dessert",
    registry_id: "reg-garden-dinner",
    title: "Dessert table contribution",
    description: "Help us add a few extra sweets for guests.",
    image_path: null,
    target_quantity: 4,
    claimed_quantity: 1,
    claimed_by_name: null,
    claimed_by_email: null,
    external_url: "https://example.com/dessert",
  },
  {
    id: "reg-item-prints",
    registry_id: "reg-garden-dinner",
    title: "Photo print fund",
    description: "A small contribution toward prints after the event.",
    image_path: null,
    target_quantity: 5,
    claimed_quantity: 0,
    claimed_by_name: null,
    claimed_by_email: null,
    external_url: "https://example.com/prints",
  },
];

export const demoRsvps: PublicRSVP[] = [
  {
    id: "rsvp-aida",
    event_id: "evt-garden-dinner",
    guest_name: "Aida Rahman",
    guest_email: "aida@example.com",
    status: "yes",
    party_size: 2,
    note: "Looking forward to it.",
  },
  {
    id: "rsvp-ben",
    event_id: "evt-garden-dinner",
    guest_name: "Ben Tan",
    guest_email: "ben@example.com",
    status: "maybe",
    party_size: 1,
    note: null,
  },
];

export function getDemoPublicEvent(slug: string) {
  const event =
    demoCustomerEvents.find((item) => item.share_slug === slug) ??
    demoCustomerEvents[0];

  return {
    event,
    registry: demoRegistry,
    registryItems: demoRegistryItems,
    rsvps: demoRsvps,
  };
}
