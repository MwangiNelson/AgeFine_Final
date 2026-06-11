# Accessibility (target: WCAG 2.1 AA)

## Implemented
- Semantic landmarks: header, main, nav, footer; sections labelled (aria-label / aria-labelledby).
- Skip-to-content link.
- Valid heading order (h1 hero → h2 sections → h3 items), verified by automated axe test.
- Accessible names on icon buttons (e.g. "Add {product} to bag"); decorative SVGs `aria-hidden`.
- Visible focus styles (`:focus-visible`).
- `prefers-reduced-motion` disables scroll-reveal and transitions.
- Color contrast: small gold text uses `--gold-text` (#7E6130, 5.4:1 on ivory — passes AA);
  `--gold` retained for borders and large/decorative use only.
- Automated axe checks on the home page and components in the test suite.

## Added in the responsive redesign + M4
- Responsive nav: top nav on `md+`, a focus-trapped mobile drawer (Escape to close, focus restored
  to the trigger, `aria-modal`, body scroll lock). `aria-current="page"` on the active link.
- Tap targets: nav items, cart steppers, and add-to-bag buttons are now ≥44px (`.btn` enforces
  `min-height:44px`; icon buttons use `w-11 h-11`).
- Forms (`FormField.tsx`): every input has a `<label htmlFor>`, errors are wired via
  `aria-describedby` + `aria-invalid` and announced with `role="alert"`; on submit, focus moves to
  the first invalid field. Required fields marked. Submit buttons disable while pending.
- Automated axe tests now also cover the cart page, the checkout form, and the booking form.

## M6 final audit
- Customer-facing tap targets are ≥44px: nav, cart qty steppers + remove, add-to-bag, form
  controls (`.btn` enforces `min-height:44px`; icon buttons use `w-11 h-11`).
- Automated axe coverage now spans home, shop grid, cart, checkout, booking forms (services +
  contact variants), the footer (with social links), and the admin login — all clean.
- SEO/structured-data additions are non-visual and don't affect the a11y tree.

## Open items (manual, before launch)
- Manual keyboard + screen-reader walkthrough on a real device across all pages (incl. the mobile
  drawer focus trap and the checkout confirmation flow).
- Re-confirm AA contrast if the client swaps in a final brand palette (tokens live in
  `app/globals.css`; small gold text already uses `--gold-text` for AA).
- axe on admin CRUD pages requires an authenticated session, so it's a manual check (the pure
  logic + login are covered by automated tests).
