# Architecture

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + CSS variables for brand tokens (`app/globals.css`)
- Supabase: Postgres + Auth (admin) + Storage (images)
- Fonts: Cormorant Garamond (display) + Jost (sans) via `next/font/google`

## Structure
```
app/            routes (App Router)
  layout.tsx    root layout, fonts, metadata, CartProvider
  page.tsx      home (server component; fetches bestsellers)
  globals.css   brand tokens + @theme bridge + design-system classes + a11y
  shop/         catalogue + [slug] product detail
  cart/         shopping bag
  checkout/     order form + confirmation (M4)
  services/     treatments + booking form (M4)
  contact/      enquiry form (M4)
  about/        brand story
  admin/        protected dashboard (M5): login, overview, products, orders, bookings
                + per-area actions.ts (Server Actions) + signout route
components/      SiteShell, SiteHeader, BottomNav, SiteFooter, Reveal,
                ProductGridCard, ShopGrid, ProcedureItem, AddToCartButton,
                FormField, BookingFormCard
  admin/         AdminShell, AdminNav, ProductRow, ProductForm, OrderCard, BookingCard
lib/             supabaseClient.ts, cart.ts, cart-context.tsx, checkout.ts, admin.ts, database.types.ts
  supabase/      client.ts (browser), server.ts (RSC/actions), middleware.ts (session+guard),
                 admin-guard.ts (requireAdmin / isAdminUser)
proxy.ts         Next 16 middleware (matcher /admin/:path*) — refreshes session + guards admin
scripts/         create-admin.mjs (one-off admin user creation via service-role key)
supabase/migrations/  SQL schema (run in Supabase): 0001 init, 0002 admin-role RLS
test/            Vitest + Testing Library + jest-axe (helpers/ for shared render utils)
docs/            this documentation
```

## Admin auth & authorization (M5)
Cookie-based Supabase Auth via `@supabase/ssr`. `proxy.ts` runs on `/admin/:path*`, refreshes the
session, and redirects non-admins to `/admin/login`. Every admin server page also calls
`requireAdmin()` (defense in depth), and the database enforces it a third time: the `admin_all_*`
RLS policies and the storage write policies all gate on `public.is_admin()`, which reads
`app_metadata.role = 'admin'` from the JWT. Admin = `role: 'admin'`, set on the user via the Auth
Admin API (`scripts/create-admin.mjs`); there is no public sign-up. Mutations are Server Actions
(`app/admin/**/actions.ts`) so writes happen server-side under the admin's session.

## Responsive design system
Mobile-first, but a real desktop layout (not a stretched phone). One shell, `SiteShell`, wraps
every page: skip link, announcement bar, `SiteHeader`, `<main>`, `SiteFooter`, `BottomNav`.
`SiteHeader` shows a horizontal top nav on `md+` and a hamburger + focus-trapped drawer on mobile;
`BottomNav` is `md:hidden`. Pages constrain content to `max-width: var(--container)` and step up
from 1–2 columns on mobile to 2–4 columns on desktop.

## Brand tokens
Defined once in `app/globals.css` `:root` (ivory, plum, gold, blush, rose…) plus the two font CSS
variables. They're bridged into Tailwind utilities via `@theme inline` (so `bg-plum`, `text-rose`,
`font-serif` work with responsive/state prefixes), and reused by design-system component classes in
the same file: `.btn(.btn-primary|gold|outline)`, `.field-label|input|select|textarea|error`,
`.surface-card`, `.eyebrow`, `.section-title`. Re-skinning to the client's final palette stays a
single-file change.

## Checkout / forms logic
`lib/checkout.ts` is pure and fully unit-tested: `validateCheckout`/`validateBooking` (mirroring the
live RLS WITH CHECK), `buildOrderPayload` (derives the total from the cart, never the client),
`buildWhatsAppLink`, and `buildBookingPayload`. UI components call these; the browser Supabase client
(anon key) performs the public inserts allowed by RLS.

## Data model
See `supabase/migrations/0001_init.sql` — categories, products, orders, bookings with RLS.
Public can read active products/categories and insert orders/bookings; admin writes require auth.

## Payments
Manual M-Pesa Buy Goods: checkout creates an order (`pending_payment`) and shows the Till
number + WhatsApp link. Admin confirms payment manually. Till/WhatsApp come from env.
