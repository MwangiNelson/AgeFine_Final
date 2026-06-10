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

## Open items (final pass before launch — M6)
- Verify tap target sizes (>=44px) on mobile nav and add buttons.
- Manual keyboard + screen-reader walkthrough across all pages.
- Re-run axe on shop, checkout, and admin pages as they are built.
