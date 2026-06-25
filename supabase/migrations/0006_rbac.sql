-- ============================================================
-- RBAC: super-admin vs management (employee) roles.
--   * is_super_admin(): role in ('admin','super_admin')
--   * is_admin():       any staff — adds 'manager'
--   * DELETE on content tables + storage is super-admin only;
--     SELECT/INSERT/UPDATE allowed for any staff.
-- 'admin' is kept as a synonym for super_admin so the existing
-- admin user keeps full access without a data migration.
-- ============================================================

-- Super-admins only.
create or replace function public.is_super_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'),
    false
  );
$$;

-- Any staff member (super-admin or manager).
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin', 'manager'),
    false
  );
$$;

-- ------------------------------------------------------------
-- Content tables: split the old FOR ALL policy so that DELETE
-- is super-admin only while staff keep read/write/update.
-- ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['products', 'categories', 'services', 'orders', 'bookings', 'applications']
  loop
    execute format('drop policy if exists "admin_all_%1$s" on %1$s', t);
    execute format($f$
      create policy "staff_read_%1$s"   on %1$s for select using (public.is_admin());
    $f$, t);
    execute format($f$
      create policy "staff_insert_%1$s" on %1$s for insert with check (public.is_admin());
    $f$, t);
    execute format($f$
      create policy "staff_update_%1$s" on %1$s for update using (public.is_admin()) with check (public.is_admin());
    $f$, t);
    execute format($f$
      create policy "super_delete_%1$s" on %1$s for delete using (public.is_super_admin());
    $f$, t);
  end loop;
end $$;

-- ------------------------------------------------------------
-- Storage objects: staff may upload/update images; only
-- super-admins may delete them.
-- ------------------------------------------------------------
do $$
declare b text;
begin
  foreach b in array array['product-images', 'service-images']
  loop
    execute format('drop policy if exists "admin_write_%1$s"  on storage.objects', replace(b, '-', '_'));
    execute format('drop policy if exists "admin_update_%1$s" on storage.objects', replace(b, '-', '_'));
    execute format('drop policy if exists "admin_delete_%1$s" on storage.objects', replace(b, '-', '_'));
  end loop;
end $$;

-- product-images
create policy "staff_write_product_images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "staff_update_product_images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());
create policy "super_delete_product_images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_super_admin());

-- service-images
create policy "staff_write_service_images"
  on storage.objects for insert
  with check (bucket_id = 'service-images' and public.is_admin());
create policy "staff_update_service_images"
  on storage.objects for update
  using (bucket_id = 'service-images' and public.is_admin());
create policy "super_delete_service_images"
  on storage.objects for delete
  using (bucket_id = 'service-images' and public.is_super_admin());
