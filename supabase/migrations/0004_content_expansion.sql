-- ============================================================
-- Agefine — content expansion
--   1. services: category/tagline/benefits/gallery/featured for
--      the redesigned landing carousel + service detail pages.
--   2. bookings: preferred_time for the in-app calendar booking.
--   3. applications: careers + training applications inbox.
--   4. storage bucket `service-images` (public read, admin write).
--   5. tighten admin_all_services to is_admin() (parity with 0002).
-- ============================================================

-- ---- 1. services content fields ----
alter table services
  add column if not exists category     text not null default 'Treatments',
  add column if not exists tagline      text,
  add column if not exists benefits     text[] not null default '{}',
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists featured     boolean not null default false;

-- ---- 2. bookings calendar slot ----
alter table bookings
  add column if not exists preferred_time text;

-- Re-create the public insert policy to also bound the new column.
drop policy if exists "public_insert_bookings" on bookings;
create policy "public_insert_bookings"
  on bookings for insert
  with check (
    char_length(name) between 1 and 200
    and char_length(phone) between 5 and 20
    and char_length(service) between 1 and 200
    and (preferred_time is null or char_length(preferred_time) <= 20)
  );

-- ---- 3. applications (careers + training) ----
create table if not exists applications (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  email       text,
  interest    text not null default 'position',
  -- interest: position | training
  message     text,
  status      text not null default 'new',
  -- status: new | reviewed | contacted | closed
  created_at  timestamptz not null default now()
);

alter table applications enable row level security;

create policy "public_insert_applications"
  on applications for insert
  with check (
    char_length(name) between 1 and 200
    and char_length(phone) between 5 and 20
    and interest in ('position', 'training')
    and status = 'new'
    and (email is null or char_length(email) <= 200)
    and (message is null or char_length(message) <= 2000)
  );

create policy "admin_all_applications"
  on applications for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- 4. storage bucket: service-images ----
insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', true)
on conflict (id) do nothing;

drop policy if exists "admin_write_service_images"  on storage.objects;
drop policy if exists "admin_update_service_images" on storage.objects;
drop policy if exists "admin_delete_service_images" on storage.objects;

create policy "admin_write_service_images"
  on storage.objects for insert
  with check (bucket_id = 'service-images' and public.is_admin());

create policy "admin_update_service_images"
  on storage.objects for update
  using (bucket_id = 'service-images' and public.is_admin());

create policy "admin_delete_service_images"
  on storage.objects for delete
  using (bucket_id = 'service-images' and public.is_admin());

-- ---- 5. services admin policy parity with 0002 ----
drop policy if exists "admin_all_services" on services;
create policy "admin_all_services"
  on services for all
  using (public.is_admin())
  with check (public.is_admin());
