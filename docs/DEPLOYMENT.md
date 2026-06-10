# Deployment (Vercel)

## Recommended: GitHub → Vercel Git integration
Best path for this app — Vercel auto-builds on every push to the `AgeFine_Final` repo.

1. Vercel dashboard → Add New → Project → import `MwangiNelson/AgeFine_Final`.
2. Framework preset: Next.js (auto-detected). Root directory: repo root.
3. Add the environment variables below (Settings → Environment Variables), for
   Production + Preview.
4. Deploy. Every subsequent `git push` to `main` auto-deploys; PRs get preview URLs.

> Note: there is already an older Vercel project named `agefine` (May 2025). Either
> reuse it (point it at the new repo) or create a fresh `agefine-final` project — your call.

## Environment variables (set in Vercel)
| Key | Value | Notes |
|-----|-------|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://skhjxnbxamafqknfgqcc.supabase.co | public |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (anon key from Supabase → Settings → API) | public |
| SUPABASE_PUBLISHABLE_KEY | sb_publishable_… | public |
| NEXT_PUBLIC_TILL_NUMBER | (M-Pesa Buy Goods till — placeholder until client provides) | public |
| NEXT_PUBLIC_WHATSAPP | 2547XXXXXXXX (international, no +) | public |
| SUPABASE_SERVICE_ROLE_KEY | (server secret — add for M5 admin) | server only, never NEXT_PUBLIC |

## Build notes
- `next/font/google` fetches fonts at build — works fine on Vercel.
- Current routes that read data (`/shop`, `/shop/[slug]`) use `export const dynamic = "force-dynamic"`,
  so they fetch live from Supabase at request time. Without the Supabase env vars they render
  empty (graceful) rather than crashing.

## What's deployable now
Storefront preview: home, shop catalogue, product detail, cart. Checkout (M4), admin (M5),
services/SEO (M6) are not built yet.

## Monitoring
Once connected, deployments and build logs can be inspected via the Vercel connector
(list_deployments, get_deployment_build_logs) to debug any failed build.
