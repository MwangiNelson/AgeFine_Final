-- ============================================================
-- Tighten admin access: require app_metadata.role = 'admin'
-- (not merely any authenticated user). The role is set on the
-- admin user via the Auth Admin API (see scripts/create-admin.mjs)
-- and surfaces in the JWT under app_metadata.
-- ============================================================

-- Stable helper: is the current request made by an admin?
-- search_path is pinned empty (security hygiene), so auth.jwt() is schema-qualified.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ---- products ----
drop policy if exists "admin_all_products" on products;
create policy "admin_all_products"
  on products for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- categories ----
drop policy if exists "admin_all_categories" on categories;
create policy "admin_all_categories"
  on categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- orders ----
drop policy if exists "admin_all_orders" on orders;
create policy "admin_all_orders"
  on orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- bookings ----
drop policy if exists "admin_all_bookings" on bookings;
create policy "admin_all_bookings"
  on bookings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- storage: product-images (admin writes) ----
drop policy if exists "auth_write_product_images"  on storage.objects;
drop policy if exists "auth_update_product_images" on storage.objects;
drop policy if exists "auth_delete_product_images" on storage.objects;
-- The old authenticated-read policy is redundant (bucket is public) and is
-- replaced by admin-only read of the raw objects API.
drop policy if exists "auth_read_product_images"   on storage.objects;

create policy "admin_write_product_images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin_update_product_images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "admin_delete_product_images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- Note: no public SELECT policy on storage.objects. The bucket is public, so
-- images are served via their CDN object URLs; a broad SELECT policy would
-- additionally allow listing every file, which we don't want.
