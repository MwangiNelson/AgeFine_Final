# Architecture

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + CSS variables for brand tokens (`app/globals.css`)
- Supabase: Postgres + Auth (admin) + Storage (images)
- Fonts: Cormorant Garamond (display) + Jost (sans) via `next/font/google`

## Structure
```
app/            routes (App Router)
  layout.tsx    root layout, fonts, metadata
  page.tsx      home (branding) page
  globals.css   brand tokens + base + a11y (focus, reduced-motion)
components/      Header, BottomNav, ProductRailCard, ProcedureItem
lib/             supabaseClient.ts
supabase/migrations/  SQL schema (run in Supabase)
test/            Vitest + Testing Library + jest-axe
docs/            this documentation
```

## Brand tokens
Defined once in `app/globals.css` `:root` (ivory, plum, gold, blush, rose...) and the
two font CSS variables. All components reference `var(--token)` so re-skinning to the
client's final palette is a single-file change.

## Data model
See `supabase/migrations/0001_init.sql` — categories, products, orders, bookings with RLS.
Public can read active products/categories and insert orders/bookings; admin writes require auth.

## Payments
Manual M-Pesa Buy Goods: checkout creates an order (`pending_payment`) and shows the Till
number + WhatsApp link. Admin confirms payment manually. Till/WhatsApp come from env.
