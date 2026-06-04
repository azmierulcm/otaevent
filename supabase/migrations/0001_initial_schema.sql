create extension if not exists "pgcrypto";

create type public.app_role as enum ('customer', 'vendor', 'owner');
create type public.event_status as enum ('draft', 'open', 'matched', 'completed', 'cancelled');
create type public.event_visibility as enum ('private', 'shared', 'public');
create type public.bid_status as enum ('pending', 'accepted', 'declined', 'withdrawn');
create type public.rsvp_status as enum ('yes', 'no', 'maybe');
create type public.availability_status as enum ('available', 'tentative', 'booked', 'blocked');
create type public.article_status as enum ('draft', 'published', 'archived');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role public.app_role not null default 'customer',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  business_name text not null,
  tagline text,
  bio text,
  base_location text,
  service_categories text[] not null default '{}',
  cover_image_path text,
  gallery_image_paths text[] not null default '{}',
  price_floor numeric(12, 2) check (price_floor is null or price_floor >= 0),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  budget numeric(12, 2) not null check (budget >= 0),
  services text[] not null default '{}',
  event_date date not null,
  details text,
  capacity integer not null check (capacity > 0 and capacity < 100),
  location text,
  status public.event_status not null default 'open',
  visibility public.event_visibility not null default 'private',
  share_slug text unique default encode(gen_random_bytes(8), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bids (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  vendor_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  message text,
  status public.bid_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, vendor_id)
);

create table public.bid_messages (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid not null references public.bids(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.registry (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events(id) on delete cascade,
  title text not null default 'Event registry',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.registry_items (
  id uuid primary key default gen_random_uuid(),
  registry_id uuid not null references public.registry(id) on delete cascade,
  title text not null,
  description text,
  image_path text,
  target_quantity integer not null default 1 check (target_quantity > 0),
  claimed_quantity integer not null default 0 check (claimed_quantity >= 0),
  claimed_by_name text,
  claimed_by_email text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (claimed_quantity <= target_quantity)
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_name text not null,
  guest_email text not null,
  status public.rsvp_status not null default 'yes',
  party_size integer not null default 1 check (party_size > 0 and party_size < 20),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, guest_email)
);

create table public.vendor_availability (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.users(id) on delete cascade,
  available_on date not null,
  starts_at time,
  ends_at time,
  status public.availability_status not null default 'available',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, available_on, starts_at, ends_at),
  check (starts_at is null or ends_at is null or starts_at < ends_at)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  body_md text not null,
  hero_image_path text,
  status public.article_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ad_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  placement text not null,
  image_path text,
  destination_url text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_customer_id_idx on public.events(customer_id);
create index events_status_date_idx on public.events(status, event_date);
create index bids_event_id_idx on public.bids(event_id);
create index bids_vendor_id_idx on public.bids(vendor_id);
create index bid_messages_bid_id_created_at_idx on public.bid_messages(bid_id, created_at);
create index registry_event_id_idx on public.registry(event_id);
create index registry_items_registry_id_idx on public.registry_items(registry_id);
create index rsvps_event_id_idx on public.rsvps(event_id);
create index vendor_availability_vendor_date_idx on public.vendor_availability(vendor_id, available_on);
create index articles_status_published_at_idx on public.articles(status, published_at desc);
create index ad_blocks_active_placement_idx on public.ad_blocks(is_active, placement);

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_vendor_profiles_updated_at
before update on public.vendor_profiles
for each row execute function public.set_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create trigger set_bids_updated_at
before update on public.bids
for each row execute function public.set_updated_at();

create trigger set_registry_updated_at
before update on public.registry
for each row execute function public.set_updated_at();

create trigger set_registry_items_updated_at
before update on public.registry_items
for each row execute function public.set_updated_at();

create trigger set_rsvps_updated_at
before update on public.rsvps
for each row execute function public.set_updated_at();

create trigger set_vendor_availability_updated_at
before update on public.vendor_availability
for each row execute function public.set_updated_at();

create trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

create trigger set_ad_blocks_updated_at
before update on public.ad_blocks
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'customer')
  );
  return new;
exception
  when invalid_text_representation then
    insert into public.users (id, email, full_name, avatar_url, role)
    values (
      new.id,
      coalesce(new.email, ''),
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'avatar_url',
      'customer'
    );
    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'owner', false)
$$;

create or replace function public.is_vendor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = 'vendor', false)
$$;

create or replace function public.owns_event(event_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events
    where id = event_uuid and customer_id = auth.uid()
  )
$$;

create or replace function public.can_access_bid(bid_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bids b
    join public.events e on e.id = b.event_id
    where b.id = bid_uuid
      and (b.vendor_id = auth.uid() or e.customer_id = auth.uid() or public.is_owner())
  )
$$;

create or replace function public.is_event_shareable(event_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events
    where id = event_uuid and visibility in ('shared', 'public')
  )
$$;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_owner() then
    raise exception 'Only platform owners can change roles.';
  end if;

  return new;
end;
$$;

create trigger prevent_users_role_escalation
before update on public.users
for each row execute function public.prevent_role_escalation();

alter table public.users enable row level security;
alter table public.vendor_profiles enable row level security;
alter table public.events enable row level security;
alter table public.bids enable row level security;
alter table public.bid_messages enable row level security;
alter table public.registry enable row level security;
alter table public.registry_items enable row level security;
alter table public.rsvps enable row level security;
alter table public.vendor_availability enable row level security;
alter table public.articles enable row level security;
alter table public.ad_blocks enable row level security;

create policy "Users can read their own profile"
on public.users for select
to authenticated
using (id = auth.uid() or public.is_owner());

create policy "Users can update their own profile"
on public.users for update
to authenticated
using (id = auth.uid() or public.is_owner())
with check (id = auth.uid() or public.is_owner());

create policy "Vendor profiles are public"
on public.vendor_profiles for select
to anon, authenticated
using (true);

create policy "Vendors can create their business profile"
on public.vendor_profiles for insert
to authenticated
with check ((user_id = auth.uid() and public.is_vendor()) or public.is_owner());

create policy "Vendors can update their business profile"
on public.vendor_profiles for update
to authenticated
using ((user_id = auth.uid() and public.is_vendor()) or public.is_owner())
with check ((user_id = auth.uid() and public.is_vendor()) or public.is_owner());

create policy "Customers and owners can create events"
on public.events for insert
to authenticated
with check (
  (customer_id = auth.uid() and public.current_app_role() in ('customer', 'owner'))
  and capacity > 0
  and capacity < 100
);

create policy "Event access follows role and visibility"
on public.events for select
to anon, authenticated
using (
  visibility in ('shared', 'public')
  or customer_id = auth.uid()
  or public.is_owner()
  or (auth.role() = 'authenticated' and public.is_vendor() and status = 'open')
);

create policy "Customers can manage their events"
on public.events for update
to authenticated
using (customer_id = auth.uid() or public.is_owner())
with check (customer_id = auth.uid() or public.is_owner());

create policy "Customers can delete their events"
on public.events for delete
to authenticated
using (customer_id = auth.uid() or public.is_owner());

create policy "Bid participants can read bids"
on public.bids for select
to authenticated
using (
  vendor_id = auth.uid()
  or public.owns_event(event_id)
  or public.is_owner()
);

create policy "Vendors can bid on open events"
on public.bids for insert
to authenticated
with check (
  vendor_id = auth.uid()
  and public.is_vendor()
  and exists (
    select 1 from public.events e
    where e.id = event_id and e.status = 'open'
  )
);

create policy "Bid participants can update bids"
on public.bids for update
to authenticated
using (
  vendor_id = auth.uid()
  or public.owns_event(event_id)
  or public.is_owner()
)
with check (
  vendor_id = auth.uid()
  or public.owns_event(event_id)
  or public.is_owner()
);

create policy "Bid participants can read messages"
on public.bid_messages for select
to authenticated
using (public.can_access_bid(bid_id));

create policy "Bid participants can send messages"
on public.bid_messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and public.can_access_bid(bid_id)
);

create policy "Registries follow event visibility"
on public.registry for select
to anon, authenticated
using (public.is_event_shareable(event_id) or public.owns_event(event_id) or public.is_owner());

create policy "Event owners can create registries"
on public.registry for insert
to authenticated
with check (public.owns_event(event_id) or public.is_owner());

create policy "Event owners can update registries"
on public.registry for update
to authenticated
using (public.owns_event(event_id) or public.is_owner())
with check (public.owns_event(event_id) or public.is_owner());

create policy "Registry items follow registry event visibility"
on public.registry_items for select
to anon, authenticated
using (
  exists (
    select 1 from public.registry r
    where r.id = registry_id
      and (public.is_event_shareable(r.event_id) or public.owns_event(r.event_id) or public.is_owner())
  )
);

create policy "Event owners can create registry items"
on public.registry_items for insert
to authenticated
with check (
  exists (
    select 1 from public.registry r
    where r.id = registry_id
      and (public.owns_event(r.event_id) or public.is_owner())
  )
);

create policy "Event owners and guests can update registry items"
on public.registry_items for update
to anon, authenticated
using (
  exists (
    select 1 from public.registry r
    where r.id = registry_id
      and (
        public.owns_event(r.event_id)
        or public.is_owner()
        or public.is_event_shareable(r.event_id)
      )
  )
)
with check (
  exists (
    select 1 from public.registry r
    where r.id = registry_id
      and (
        public.owns_event(r.event_id)
        or public.is_owner()
        or public.is_event_shareable(r.event_id)
      )
  )
);

create policy "Guests can RSVP to shared events"
on public.rsvps for insert
to anon, authenticated
with check (public.is_event_shareable(event_id));

create policy "Event owners can read RSVPs"
on public.rsvps for select
to authenticated
using (public.owns_event(event_id) or public.is_owner());

create policy "Event owners can manage RSVPs"
on public.rsvps for update
to authenticated
using (public.owns_event(event_id) or public.is_owner())
with check (public.owns_event(event_id) or public.is_owner());

create policy "Vendor availability is public"
on public.vendor_availability for select
to anon, authenticated
using (true);

create policy "Vendors manage their availability"
on public.vendor_availability for all
to authenticated
using ((vendor_id = auth.uid() and public.is_vendor()) or public.is_owner())
with check ((vendor_id = auth.uid() and public.is_vendor()) or public.is_owner());

create policy "Published articles are public"
on public.articles for select
to anon, authenticated
using (status = 'published' or public.is_owner());

create policy "Owners manage articles"
on public.articles for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

create policy "Active ad blocks are public"
on public.ad_blocks for select
to anon, authenticated
using (
  is_active
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "Owners manage ad blocks"
on public.ad_blocks for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('event-images', 'event-images', true),
  ('portfolio', 'portfolio', true),
  ('article-images', 'article-images', true),
  ('registry-items', 'registry-items', true)
on conflict (id) do nothing;

create policy "Public image buckets are readable"
on storage.objects for select
to anon, authenticated
using (bucket_id in ('avatars', 'event-images', 'portfolio', 'article-images', 'registry-items'));

create policy "Authenticated users can upload public images"
on storage.objects for insert
to authenticated
with check (bucket_id in ('avatars', 'event-images', 'portfolio', 'article-images', 'registry-items'));

create policy "Users can update their own uploaded images"
on storage.objects for update
to authenticated
using (owner = auth.uid())
with check (owner = auth.uid());

create policy "Users can delete their own uploaded images"
on storage.objects for delete
to authenticated
using (owner = auth.uid() or public.is_owner());

alter publication supabase_realtime add table public.bids;
alter publication supabase_realtime add table public.bid_messages;
alter publication supabase_realtime add table public.vendor_availability;
