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
  provider with localStorage). Header badge reflects global cart.
- **Responsive redesign** — the site was mobile-only (inline styles, bottom tab bar on every
  screen). Now fully responsive via a Tailwind v4 design system. Brand tokens are bridged into
  Tailwind utilities in `app/globals.css` (`@theme inline` → `bg-plum`, `text-rose`, `font-serif`).
  Reusable component classes there too: `.btn`/`.btn-primary|gold|outline`, `.field-*`, `.surface-card`,
  `.eyebrow`, `.section-title`. Shared chrome in `components/SiteShell.tsx` (skip link, announcement
  bar, header, `<main>`, footer, bottom nav). `SiteHeader` = top nav on `md+`, hamburger + focus-trapped
  drawer on mobile; `BottomNav` is `md:hidden`. All pages use a `max-w` container so desktop no longer
  looks like a stretched phone. `components/Reveal.tsx` lets server components use scroll-reveal.
- **M4 Checkout + forms** — `/cart` (qty steppers, remove, totals, sticky summary on desktop),
  `/checkout` (form → inserts `orders` as `pending_payment` → confirmation with M-Pesa Till +
  WhatsApp deep link, clears cart), `/services` (treatments + booking form), `/contact` (enquiry
  form), `/about`. Logic in `lib/checkout.ts` (pure: validators, `buildOrderPayload`,
  `buildWhatsAppLink`, `buildBookingPayload`) — validation mirrors the live RLS WITH CHECK clauses
  exactly (verified against the DB). Accessible forms via `components/FormField.tsx`.
- **M5 Admin** — `/admin` area behind Supabase Auth (cookie sessions via `@supabase/ssr`).
  Login at `/admin/login`; `proxy.ts` (Next 16 middleware) + `requireAdmin()` guard every admin
  route. Access requires `app_metadata.role = 'admin'` (not just any authenticated user) — enforced
  in the proxy, in server pages, AND in tightened RLS (`public.is_admin()`, migration `0002`).
  Pages: Overview (counts), Products CRUD (create/edit via Server Actions, image upload to
  `product-images`, active toggle, delete), Orders (status machine
  pending_payment→paid→fulfilled/cancelled), Bookings inbox (new→contacted→confirmed→completed/
  cancelled). Status machines + product validation are pure in `lib/admin.ts`.
- **M6 SEO + visibility + final a11y** — central config `lib/site.ts` (SITE_URL + all business
  details, single source of truth). Root layout sets `metadataBase`, title template,
  OpenGraph/Twitter defaults + robots. Per-route metadata + canonicals on all pages; product pages
  add OG + canonical from the product. `app/sitemap.ts` (static + dynamic product slugs),
  `app/robots.ts` (disallows /admin), `app/opengraph-image.tsx` (branded 1200×630 PNG, static),
  `app/manifest.ts`. Structured data in `components/JsonLd.tsx`: site-wide `BeautySalon`
  (LocalBusiness), `Product` + `BreadcrumbList` on product pages. Footer now has social icons +
  real contact/WhatsApp wired from `lib/site.ts`. Customer-facing tap targets bumped to ≥44px.
  **72 tests pass** (incl. axe on footer, admin login, booking forms). typecheck, lint, and
  `next build` all green; sitemap/robots/og-image/JSON-LD verified rendering live.

- **M7 Real business content + experience upgrade** — replaced all placeholder content
  with the client's real business data, captured from their live Instagram
  (@agefine_beauty, via the picnob mirror — see `scripts/scrape-instagram.mjs` →
  `scripts/ig-posts.json`, 180 posts).
  - **Real identity in `lib/site.ts`**: Agefine Beauty Lab & Clinic · "Where Science
    Speaks, Aesthetics Listens" · Imaara Mall, 2nd Floor, Mombasa Road, Nairobi ·
    clinic 0746 285 020 / bookings + WhatsApp 0716 290 865 · real IG/FB URLs ·
    maps helpers (`mapsSearchUrl/mapsDirectionsUrl/mapsEmbedUrl` resolve by place name).
  - **Real service catalogue** (11 services, `scripts/seed-services.mjs`): chemical peels,
    microneedling/microchanneling, LED therapy, HydraFacial, signature facials,
    mesotherapy & skin boosters, IV nutrition, injectables/PRP, tightening & contouring,
    bridal package, consultation — each with the client's own treatment photography
    (curated from their posts, re-hosted in the `service-images` bucket; originals
    committed under `scripts/ig-images/`). Prices left null ("priced on consultation")
    for the client to fill in via admin.
  - **Landing hero carousel** (`components/HeroCarousel.tsx`): featured procedures
    full-bleed; auto-advance, swipe, dots/arrows, reduced-motion + SR-friendly.
    Featured flag toggled per-service in admin.
  - **Service detail pages** `/services/[slug]`: hero, benefits checklist, gallery
    ("In the treatment room"), Service JSON-LD, booking form pre-selected.
  - **Calendar booking**: `lib/booking.ts` (pure, tested) + `components/BookingCalendar.tsx`
    — Mon–Sat, 60-day window, hourly slots from opening hours; saved to
    `bookings.preferred_date/preferred_time`, shown in the admin booking cards.
  - **Find-us**: `components/FindUs.tsx` (address, hours, phones, keyless Google-Maps
    embed + directions deep link) on home + contact.
  - **Careers page** `/careers`: training track (TVET-approved Agefine Aesthetics
    Training) + join-the-team track; `applications` table (RLS-checked public insert),
    `lib/careers.ts` validation, admin inbox at `/admin/applications` with status
    machine new→reviewed→contacted→closed.
  - **Admin services CRUD** `/admin/services`: hero + gallery uploads to
    `service-images`, category/tagline/benefits editor, featured (carousel) and
    active toggles; service validation pure in `lib/admin.ts`.
  - Migrations `0004` (services content fields, bookings.preferred_time + tightened
    insert policy, applications, service-images bucket, services admin policy parity)
    and `0005` (revoke API EXECUTE on `rls_auto_enable`). **111 tests pass**;
    typecheck/lint/build green; all routes smoke-tested 200.

## Supabase
- Project `AgeFine_Final`, project_id `skhjxnbxamafqknfgqcc`, region eu-west-2.
- URL `https://skhjxnbxamafqknfgqcc.supabase.co`.
- Tables: `categories`, `products`, `orders`, `bookings`, `services`, `applications`
  (+ RLS). Storage buckets `product-images`, `service-images`.
- Types: `lib/database.types.ts` — regenerate via Supabase MCP `generate_typescript_types`
  after any schema change, and run `get_advisors(security)` after DDL.
- Clients: `lib/supabaseClient.ts` (anon, public reads on the storefront). Admin/auth use
  `@supabase/ssr`: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server
  components/actions, cookie session), `lib/supabase/middleware.ts` (session refresh + guard).
- Env: see `.env.example`. Public reads need `NEXT_PUBLIC_SUPABASE_URL` +
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Checkout needs `NEXT_PUBLIC_TILL_NUMBER`,
  `NEXT_PUBLIC_WHATSAPP`. `SUPABASE_SERVICE_ROLE_KEY` is server-only — used solely by
  `scripts/create-admin.mjs` to create/promote the admin user; it is NOT referenced by app code.

## Admin access
- Login: `/admin/login`. Account: `
` (temporary password set on creation —
  change it after first login). The user has `app_metadata.role = 'admin'`.
- To create/reset an admin: `node scripts/create-admin.mjs <email> <password>` (reads the
  service-role key from `.env`; sets the admin role and confirms the email).
- Access control is layered: `proxy.ts` (matcher `/admin/:path*`) + `requireAdmin()` in each
  server page + RLS `public.is_admin()` (JWT `app_metadata.role = 'admin'`). All fail closed.
- Sign-up is effectively closed (no public sign-up UI; only the script creates users).



## Remaining milestones
### M4 — Checkout + booking/contact forms ✅ DONE
Implemented as described below. `lib/checkout.ts` holds all the pure logic; validation mirrors
the live RLS WITH CHECK exactly (orders: customer_name 1–200, phone 5–20, total_kes>=0, items is a
JSON array, delivery_method in delivery|pickup · bookings: name/service 1–200, phone 5–20). The
checkout never trusts a client total — it derives `total_kes` from the cart. Confirmation shows the
M-Pesa Till + a `wa.me` deep link and clears the cart. The contact form reuses the booking insert
with a fixed service of "General enquiry".

### M5 — Admin dashboard (`/admin`) ✅ DONE
Built per the spec below, with access tightened to require the `admin` role (not just any
authenticated user). Status machines and product validation live in `lib/admin.ts` (pure, tested);
mutations are Next Server Actions in `app/admin/**/actions.ts`, each calling `requireAdmin()` first.
Image uploads go to the `product-images` bucket; the public URL is stored in `image_urls`.
Order/booking status changes use optimistic concurrency (only update if status is unchanged).
Original spec, for reference:
- Products CRUD with image upload to `product-images` (store public URL in `image_urls`).
  Orders list + status transitions (pending_payment→paid→fulfilled/cancelled). Bookings inbox.
- Admin writes allowed by RLS `admin_all_*` (auth.role()='authenticated').
- Tests: auth guard, CRUD logic, status-transition logic.

### M6 — Services, SEO/visibility, final AA audit, docs ✅ DONE
Services/About/Contact shipped in M4; M6 added the SEO/visibility layer and the final a11y pass
(see "Done so far"). Per-route metadata + canonicals, `sitemap.ts`/`robots.ts`, OG image, manifest,
and JSON-LD (BeautySalon + Product + Breadcrumb) are all live and verified.

**⚠ Remaining placeholders before launch** (most are now real — M7):
- ~~address / phones / social~~ ✅ real (Imaara Mall 2nd Floor; 0746 285 020 / 0716 290 865;
  live IG + FB). Still to confirm with the client: `SITE.email` (hello@ is assumed),
  `SITE.geo` exact pin (currently approximate — directions links resolve by name so
  customers are unaffected), `SITE.openingHours` (Mon–Sat 9–6 assumed), and TikTok.
- Service **prices** are null ("priced on consultation") — client fills them in at
  `/admin/services`.
- Set `NEXT_PUBLIC_SITE_URL` to the real domain, and `NEXT_PUBLIC_WHATSAPP` /
  `NEXT_PUBLIC_TILL_NUMBER` for checkout (WhatsApp default now 254716290865 in code).
- **Google Business Profile**: create/claim it separately (not a code task); once live, add its URL
  to `SITE.social` so it appears in the LocalBusiness `sameAs`.
- Supabase Auth: enable leaked-password protection (dashboard setting; advisor WARN).
- Still recommended pre-launch: a manual keyboard + screen-reader walkthrough on a real device, and
  real product photography for the **shop** (services now use the client's own photos).

## Design fidelity
Reference prototype `agefine-design/home-mobile.html` for the mobile language: serif headlines,
gold accents on ivory, generous whitespace, restrained motion, mobile bottom tab bar. This is now
extended to a proper responsive desktop experience (top nav, constrained `max-w` container,
multi-column grids, hover states) — keeping the same luxury palette/typography, just no longer
"a phone app on a big screen". Colours stay as CSS variables in `:root` (and are bridged into
Tailwind via `@theme inline`) so the client's final brand hex is still a single-file change.

## Gotchas
- Next 16: `params`/`searchParams` are Promises — `await` them in server components.
- `next/font/google` fetches at build (works on Vercel; fails on offline/restricted networks).
- Cart uses localStorage (client only) — already guarded with try/catch.
- This repo was developed in a native copy because the original dev folder was a FUSE mount
  that blocks deletes/renames (git + `next build` fail there). On a normal machine, ignore this.

## Verification gates (every milestone)
`npm run typecheck` (0 errors) · `npm test` (all pass incl. axe) · `npm run lint` (0 errors) ·
build succeeds on Vercel.
