-- ============================================================
-- Agefine Cosmetics — services (in-clinic procedures)
-- Bookings keep referencing services by name (text), so this
-- table is content-only: the public site reads it to render
-- the services page and booking-form options.
-- ============================================================

create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  duration_min integer not null default 30,
  price_kes    integer,
  image_url    text,
  sort_order   integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table services enable row level security;

create policy "public_read_active_services"
  on services for select
  using (active = true);

create policy "admin_all_services"
  on services for all
  using (auth.role() = 'authenticated');
