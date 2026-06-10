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

## Open items (final pass before launch — M6)
- Manual keyboard + screen-reader walkthrough across all pages (incl. the mobile drawer + checkout
  confirmation flow).
- Re-run axe on admin pages as they are built.
- Confirm AA contrast on any new gold-on-ivory text introduced by the client's final palette.
