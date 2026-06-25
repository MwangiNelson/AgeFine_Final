-- ============================================================
-- Products board parity with services: drag-to-order and a
-- drag-to-feature zone that drives the homepage "Bestsellers".
--   * sort_order — manual ordering on the shop + admin board.
--   * featured   — shown in the homepage bestsellers grid.
-- ============================================================

alter table products
  add column if not exists sort_order integer not null default 0,
  add column if not exists featured   boolean not null default false;
