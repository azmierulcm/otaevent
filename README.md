# Otaevent

Mobile-first classified event CMS for planners, vendors, and platform owners.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS with Shadcn-style UI foundations
- Supabase Auth, Postgres, Storage, and Realtime
- Lucide React icons

## Phase 1

Phase 1 sets up the database and auth foundation:

- Supabase schema and RLS in `supabase/migrations/0001_initial_schema.sql`
- Role-backed `users` table for customer, vendor, and owner access
- Core tables for events, bids, bid messages, registry, RSVP, vendor availability, articles, and ad blocks
- Public storage buckets for avatars, event images, portfolios, articles, and registry items
- Browser, server, and proxy Supabase clients in `src/lib/supabase`
- Shadcn-style `Button` and `Dialog` primitives in `src/components/ui`

## Phase 2

Phase 2 adds the public Airbnb-style interface:

- Tailwind design tokens for brand color, surfaces, borders, and soft shadows
- Sticky desktop navigation with a pill-shaped action/search menu
- Sticky mobile bottom tab bar
- Image-led public hero with search controls
- Responsive discovery grid using `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Role cards for planners, vendors, and platform owners
- Native ad inventory section for owner-managed placements

## Phase 3

Phase 3 adds the customer module:

- Customer dashboard at `/dashboard/customer`
- Multi-step event creation dialog with basics, service selection, and details
- Server actions for event creation, RSVP submission, and registry claiming
- Demo-mode fallback when Supabase credentials are not configured
- Public RSVP and registry page at `/events/[slug]`
- Vendor bid stream and guest tooling surfaces for the customer workflow

## Phase 4

Phase 4 adds the vendor module:

- Vendor dashboard at `/dashboard/vendor`
- Business profile editor for name, bio, pricing, location, services, and cover image
- Portfolio gallery uploader targeting the Supabase `portfolio` storage bucket
- Demo-mode upload fallback when Supabase credentials are not configured
- Job directory of open customer event requests
- Bidding dialog and server action for creating or updating vendor bids
- Active bid list for pending and accepted proposals

## Phase 5

Phase 5 adds the platform owner module:

- Owner dashboard at `/dashboard/owner`
- Editorial CMS article editor with status, slug, hero image, excerpt, and rich body fields
- Editorial stream using typography-ready article previews
- Native ad block editor for marketplace, registry, and article placements
- Admin management tables for users, vendors, events, and bids
- User role management action for customer, vendor, and owner roles
- Demo-mode fallback for owner workflows when Supabase credentials are not configured

## Local Setup

Create local environment values:

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project settings.

Install dependencies and run:

```bash
npm install
npm run dev
```

For a stable production preview:

```bash
npm run build
npm run start
```

## Supabase

Apply the initial migration through the Supabase SQL editor or the Supabase CLI:

```bash
supabase db push
```

The app shell will render without Supabase credentials, and session refresh turns on automatically once the env values are present.
