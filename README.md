# Agefine Cosmetics

Website + e-commerce shop + admin dashboard for Agefine Cosmetics (skin & beauty clinic, Nairobi).
Mobile-first, WCAG 2.1 AA target, manual M-Pesa payments.

## Quick start
```
npm install
cp .env.example .env.local   # then fill in values
npm run dev
```

## Scripts
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run typecheck` — TypeScript check
- `npm test` — unit + accessibility tests

## Environment (`.env.local`)
See `.env.example`. Supabase keys, Buy Goods Till number, WhatsApp number.
Create the Supabase project, then run `supabase/migrations/0001_init.sql` in the SQL editor.

## Docs
- `docs/ARCHITECTURE.md`
- `docs/TESTING.md`
- `docs/ACCESSIBILITY.md`

## Milestones
M1 foundation ✓ · M2 home/branding (a11y) · M3 shop · M4 checkout · M5 admin · M6 SEO + audit.
