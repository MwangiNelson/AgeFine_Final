# Agefine Cosmetics — Agent Handoff

Resume context for the coding agent continuing this build. Stay faithful to the
approved design; mobile-first; WCAG 2.1 AA; every milestone ships with passing tests.

## Done so far
- **M1 Foundation** — Next.js 16 (App Router, TS) + Tailwind v4. Brand tokens in
  `app/globals.css`. Fonts: Cormorant Garamond + Jost via `next/font/google`. Test stack:
  Vitest + Testing Library + jest-axe. Scripts: `dev`, `build`, `typecheck`, `test`, `lint`.
  Docs in `docs/`.
- **M2 Home** — accessible (landmarks, skip link, valid heading order, `:focus-visible`,
  reduced-motion, AA contrast via `--gold-text` #7E6130 for small text).
- **M3 Shop** — Supabase schema live + seeded; `/shop` catalogue with category filter,
  `/shop/[slug]` product detail, cart (`lib/cart.ts` pure logic + `lib/cart-context.tsx`
  provider with localStorage). Header badge reflects global cart. 14 tests pass.

## Supabase
- Project `AgeFine_Final`, project_id `skhjxnbxamafqknfgqcc`, region eu-west-2.
- URL `https://skhjxnbxamafqknfgqcc.supabase.co`.
- Tables: `categories`, `products`, `orders`, `bookings` (+ RLS). Storage bucket `product-images`.
- Types: `lib/database.types.ts` — regenerate via Supabase MCP `generate_typescript_types`
  after any schema change, and run `get_advisors(security)` after DDL.
- Client: `lib/supabaseClient.ts` (anon, public reads). For admin (M5) add a server client
  with cookies + Supabase Auth.
- Env: see `.env.example`. Public reads need `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Checkout needs `NEXT_PUBLIC_TILL_NUMBER`,
  `NEXT_PUBLIC_WHATSAPP`. Admin needs `SUPABASE_SERVICE_ROLE_KEY` (server only).

## Remaining milestones
### M4 — Checkout (manual M-Pesa) + booking/contact forms
- `/cart`: list items, qty +/-, remove, total (use `useCart`).
- `/checkout`: form fields `customer_name`, `phone`, `delivery_method` ('delivery'|'pickup'),
  `address?`, `notes?`. Insert into `orders` with `status='pending_payment'`,
  `items` jsonb `[{product_id,name,price_kes,qty}]`, `total_kes`. Then confirmation screen:
  "Pay KES {total} to Buy Goods Till {NEXT_PUBLIC_TILL_NUMBER}" + WhatsApp deep link
  `https://wa.me/{NEXT_PUBLIC_WHATSAPP}?text=...orderId+summary...`. Clear cart on success.
  IMPORTANT — RLS `public_insert_orders` requires: customer_name 1–200, phone 5–20,
  total_kes>=0, items is a JSON array, delivery_method in ('delivery','pickup'). Match exactly.
- Booking form + contact form insert into `bookings` (name, phone, service, preferred_date?,
  message?). RLS requires name 1–200, phone 5–20, service 1–200.
- Tests: pure order-payload builder + WhatsApp-link generator (unit), form validation, axe.

### M5 — Admin dashboard (`/admin`)
- Supabase Auth (email/password); protect `/admin` (middleware or server check). Create the
  admin user in the Supabase Auth dashboard.
- Products CRUD with image upload to `product-images` (store public URL in `image_urls`).
  Orders list + status transitions (pending_payment→paid→fulfilled/cancelled). Bookings inbox.
- Admin writes allowed by RLS `admin_all_*` (auth.role()='authenticated').
- Tests: auth guard, CRUD logic, status-transition logic.

### M6 — Services, SEO/visibility, final AA audit, docs
- Services/procedures, About, Contact pages.
- Per-route metadata + openGraph, `sitemap.ts`, `robots.ts`, JSON-LD (Product + LocalBusiness).
- Google Business Profile + social links.
- Full-site axe audit; tap targets >=44px; manual keyboard + screen-reader pass. Update docs.

## Design fidelity
Reference prototype `agefine-design/home-mobile.html`. Serif headlines, gold accents on ivory,
generous whitespace, restrained motion, mobile bottom tab bar. Keep colours as CSS variables —
client's final brand hex may replace them.

## Gotchas
- Next 16: `params`/`searchParams` are Promises — `await` them in server components.
- `next/font/google` fetches at build (works on Vercel; fails on offline/restricted networks).
- Cart uses localStorage (client only) — already guarded with try/catch.
- This repo was developed in a native copy because the original dev folder was a FUSE mount
  that blocks deletes/renames (git + `next build` fail there). On a normal machine, ignore this.

## Verification gates (every milestone)
`npm run typecheck` (0 errors) · `npm test` (all pass incl. axe) · `npm run lint` (0 errors) ·
build succeeds on Vercel.
