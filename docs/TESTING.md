# Testing

## Tooling
- Vitest (jsdom) + @testing-library/react
- jest-axe for automated accessibility assertions
- `tsc --noEmit` for type safety

## Commands
```
npm run typecheck   # tsc, no emit
npm test            # vitest run (CI mode)
npm run test:watch  # vitest watch
npm run build       # next production build
```

## Per-milestone gates
Each milestone ships with tests that must pass before it is marked done:
- M1: home component renders, add-to-cart callback fires, axe finds 0 violations.
- M2: home page axe-clean, keyboard nav, AA contrast.
- M3: cart add/remove/total logic, product rendering.
- M4: order-creation + WhatsApp-link generation, form validation.
- M5: admin auth guard, product CRUD, order status transitions.
- M6: site-wide axe audit, sitemap/metadata present.

## Note on local build
`next build` fetches Google Fonts at build time. In restricted/offline networks that step
fails; it succeeds normally on Vercel or any machine with internet. Typecheck + tests do not
require network.
