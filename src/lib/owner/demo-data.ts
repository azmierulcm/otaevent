import { demoBids, demoCustomerEvents } from "@/lib/customer/demo-data";
import type { AppRole, ArticleStatus } from "@/lib/supabase/types";
import { demoVendorProfile } from "@/lib/vendor/demo-data";

export type OwnerUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
};

export type OwnerArticle = {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  body_md: string;
  hero_image_path: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
};

export type OwnerAdBlock = {
  id: string;
  title: string;
  placement: string;
  image_path: string | null;
  destination_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export const demoOwnerUsers: OwnerUser[] = [
  {
    id: "owner-demo",
    email: "owner@otaevent.test",
    full_name: "Platform Owner",
    role: "owner",
    created_at: "2026-06-04T09:00:00.000Z",
  },
  {
    id: "customer-demo",
    email: "planner@otaevent.test",
    full_name: "Aina Planner",
    role: "customer",
    created_at: "2026-06-04T10:30:00.000Z",
  },
  {
    id: "vendor-demo",
    email: "florals@otaevent.test",
    full_name: "Editorial Floral Studio",
    role: "vendor",
    created_at: "2026-06-04T11:10:00.000Z",
  },
];

export const demoArticles: OwnerArticle[] = [
  {
    id: "article-intimate-events",
    author_id: "owner-demo",
    title: "How intimate celebrations are becoming the new luxury",
    slug: "intimate-celebrations-new-luxury",
    excerpt: "A guide to planning smaller gatherings with sharper vendor matching and stronger guest experience.",
    body_md:
      "Smaller events are not simpler by default. They ask for clearer taste, better service matching, and tools that keep guests close to the plan.",
    hero_image_path:
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1400&q=82",
    status: "published",
    published_at: "2026-06-04T12:00:00.000Z",
    created_at: "2026-06-04T09:45:00.000Z",
  },
  {
    id: "article-vendor-shortlist",
    author_id: "owner-demo",
    title: "The vendor shortlist that keeps event budgets honest",
    slug: "vendor-shortlist-budget-guide",
    excerpt: "What customers should compare before accepting a bid.",
    body_md:
      "A good shortlist compares scope, setup windows, cancellation terms, and evidence from real portfolios.",
    hero_image_path:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=82",
    status: "draft",
    published_at: null,
    created_at: "2026-06-03T13:15:00.000Z",
  },
];

export const demoAdBlocks: OwnerAdBlock[] = [
  {
    id: "ad-venue-collection",
    title: "Featured venue collections",
    placement: "home_grid",
    image_path:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=82",
    destination_url: "https://example.com/venues",
    is_active: true,
    starts_at: "2026-06-04T00:00:00.000Z",
    ends_at: null,
    created_at: "2026-06-04T08:00:00.000Z",
  },
  {
    id: "ad-registry-partners",
    title: "Registry gift partners",
    placement: "registry_sidebar",
    image_path:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1000&q=82",
    destination_url: "https://example.com/registry",
    is_active: true,
    starts_at: "2026-06-04T00:00:00.000Z",
    ends_at: null,
    created_at: "2026-06-04T08:30:00.000Z",
  },
];

export const demoAdminTables = {
  users: demoOwnerUsers,
  vendors: [demoVendorProfile],
  events: demoCustomerEvents,
  bids: demoBids,
};
