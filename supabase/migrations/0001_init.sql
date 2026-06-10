-- ============================================================
-- Agefine Cosmetics — Initial schema
-- Run via: supabase db push  OR  paste into Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ---- categories ----
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- ---- products ----
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  price_kes   integer not null,
  category_id uuid references categories(id) on delete set null,
  image_urls  text[] not null default '{}',
  stock       integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---- orders ----
create table if not exists orders (
  id              uuid primary key default gen_random_uuid(),
  customer_name   text not null,
  phone           text not null,
  delivery_method text not null,
  address         text,
  notes           text,
  items           jsonb not null default '[]',
  -- items format: [{product_id, name, price_kes, qty}]
  total_kes       integer not null,
  status          text not null default 'pending_payment',
  -- status: pending_payment | paid | fulfilled | cancelled
  created_at      timestamptz not null default now()
);

-- ---- bookings ----
create table if not exists bookings (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  phone          text not null,
  service        text not null,
  preferred_date date,
  message        text,
  status         text not null default 'new',
  -- status: new | contacted | confirmed | completed | cancelled
  created_at     timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table categories enable row level security;
alter table products    enable row level security;
alter table orders      enable row level security;
alter table bookings    enable row level security;

-- Categories: public read
create policy "public_read_categories"
  on categories for select
  using (true);

-- Products: public read of active products only
create policy "public_read_active_products"
  on products for select
  using (active = true);

-- Orders: public insert (checkout); admin full access
create policy "public_insert_orders"
  on orders for insert
  with check (true);

create policy "admin_all_orders"
  on orders for all
  using (auth.role() = 'authenticated');

-- Bookings: public insert (booking form); admin full access
create policy "public_insert_bookings"
  on bookings for insert
  with check (true);

create policy "admin_all_bookings"
  on bookings for all
  using (auth.role() = 'authenticated');

-- Admin full access to categories & products
create policy "admin_all_categories"
  on categories for all
  using (auth.role() = 'authenticated');

create policy "admin_all_products"
  on products for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- Storage bucket: product-images
-- (public read, authenticated write)
-- Run this in the Supabase dashboard Storage section OR via CLI
-- ============================================================

-- insert into storage.buckets (id, name, public)
-- values ('product-images', 'product-images', true)
-- on conflict (id) do nothing;

-- Storage policies (uncomment and run if using SQL):
-- create policy "public_read_product_images"
--   on storage.objects for select
--   using (bucket_id = 'product-images');
--
-- create policy "auth_write_product_images"
--   on storage.objects for insert
--   with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
--
-- create policy "auth_delete_product_images"
--   on storage.objects for delete
--   using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
-- Seed data (sample categories — remove before production)
-- ============================================================

insert into categories (name, slug) values
  ('Serums',      'serums'),
  ('Moisturisers','moisturisers'),
  ('Cleansers',   'cleansers'),
  ('Masks',       'masks'),
  ('Sunscreen',   'sunscreen')
on conflict (slug) do nothing;
