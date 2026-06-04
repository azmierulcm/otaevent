import { demoCustomerEvents } from "@/lib/customer/demo-data";
import type { BidStatus } from "@/lib/supabase/types";

export type VendorProfile = {
  id: string;
  user_id: string;
  business_name: string;
  tagline: string | null;
  bio: string | null;
  base_location: string | null;
  service_categories: string[];
  cover_image_path: string | null;
  gallery_image_paths: string[];
  price_floor: number | null;
  is_verified: boolean;
};

export type VendorBid = {
  id: string;
  event_id: string;
  event_name: string;
  amount: number;
  message: string | null;
  status: BidStatus;
  created_at: string;
};

export const demoVendorProfile: VendorProfile = {
  id: "vendor-profile-demo",
  user_id: "vendor-demo-user",
  business_name: "Editorial Floral Studio",
  tagline: "Soft garden florals for intimate celebrations.",
  bio: "We design floral moments for private dinners, engagements, and small weddings with a calm editorial eye.",
  base_location: "Subang Jaya",
  service_categories: ["Florals", "Decor", "Planning"],
  cover_image_path:
    "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=1200&q=82",
  gallery_image_paths: [
    "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=82",
    "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=800&q=82",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=800&q=82",
  ],
  price_floor: 900,
  is_verified: true,
};

export const demoOpenJobs = demoCustomerEvents.map((event) => ({
  ...event,
  bid_count: event.id === "evt-garden-dinner" ? 2 : 4,
  distance: event.location === "Kuala Lumpur" ? "18 km" : "295 km",
}));

export const demoVendorBids: VendorBid[] = [
  {
    id: "vendor-bid-floral",
    event_id: "evt-garden-dinner",
    event_name: "Garden engagement dinner",
    amount: 2200,
    message: "Loose garden arrangements, candles, and a small ceremony arch.",
    status: "pending",
    created_at: "2026-06-04T18:42:00.000Z",
  },
  {
    id: "vendor-bid-brunch",
    event_id: "evt-birthday-brunch",
    event_name: "Private birthday brunch",
    amount: 980,
    message: "Petite table florals and dessert table styling.",
    status: "accepted",
    created_at: "2026-06-03T10:12:00.000Z",
  },
];
