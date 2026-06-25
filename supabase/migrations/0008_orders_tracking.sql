-- ============================================================
-- Orders overhaul: payment tracking + status audit trail.
--   * orders.paid_at            — when the order first settled.
--   * order_status_history      — every status change (who/when/why).
--   * order_payments            — ElementPay (and manual) payment records.
-- Reverts/refunds are gated in the app layer (super-admin); the
-- ElementPay webhook writes via the service-role client (bypasses RLS).
-- ============================================================

alter table orders
  add column if not exists paid_at timestamptz;

-- ---- status audit trail ----
create table if not exists order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  from_status text,
  to_status   text not null,
  note        text,
  actor_type  text not null default 'staff',  -- staff | system
  actor_email text,
  created_at  timestamptz not null default now()
);

create index if not exists order_status_history_order_id_idx
  on order_status_history (order_id, created_at);

alter table order_status_history enable row level security;

drop policy if exists "staff_read_order_status_history"   on order_status_history;
drop policy if exists "staff_insert_order_status_history"  on order_status_history;
create policy "staff_read_order_status_history"
  on order_status_history for select using (public.is_admin());
create policy "staff_insert_order_status_history"
  on order_status_history for insert with check (public.is_admin());

-- ---- payments ----
create table if not exists order_payments (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  provider       text not null default 'elementpay',
  provider_ref   text,                       -- ElementPay order id
  tx_hash        text,
  status         text not null default 'pending', -- pending|submitted|settled|failed|refunded
  amount_kes     integer not null,
  amount_crypto  numeric,
  token          text,
  currency       text not null default 'KES',
  wallet_address text,
  mpesa_code     text,                       -- manual confirmation: M-Pesa ref (optional)
  mpesa_message  text,                       -- manual confirmation: pasted M-Pesa SMS (optional)
  raw            jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists order_payments_order_id_idx on order_payments (order_id, created_at);
create index if not exists order_payments_tx_hash_idx   on order_payments (tx_hash);

alter table order_payments enable row level security;

drop policy if exists "staff_read_order_payments"   on order_payments;
drop policy if exists "staff_insert_order_payments"  on order_payments;
drop policy if exists "staff_update_order_payments"  on order_payments;
drop policy if exists "super_delete_order_payments"  on order_payments;
create policy "staff_read_order_payments"
  on order_payments for select using (public.is_admin());
create policy "staff_insert_order_payments"
  on order_payments for insert with check (public.is_admin());
create policy "staff_update_order_payments"
  on order_payments for update using (public.is_admin()) with check (public.is_admin());
create policy "super_delete_order_payments"
  on order_payments for delete using (public.is_super_admin());
