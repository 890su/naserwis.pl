# Compact audience navigation — 24 October 2026

Implemented at the owner's request. The owner subsequently authorized publication
on 24 October 2026 through the existing GitHub main / Cloudflare Pages integration.

- Desktop and burger navigation use Dla domu / Dla biznesu, Для дома / Для бизнеса,
  Для дому / Для бізнесу and For home / For business.
- Desktop adds a business dropdown using the same five localized ITBIZ services as
  the burger menu. External service links open in a new tab with `rel=noopener`.
- Footer has contact, service area, home and business columns. All 14 districts
  remain, presented as compact wrapping text. Business links reuse the shared menu
  data, with ITBIZ.PL shown above them. Tablet and phone layouts stack the columns.
- Shared labels and service destinations live in `scripts/business-links.mjs`.
  Header and footer generation preserve these changes on subsequent builds.

Validation:

- `npm run check`: passed, including all 49 HTML pages and local asset links.
- Existing mobile navigation browser suite: 8/8 passed, PL/RU/UK/EN at 320 and
  390px, including disclosures, keyboard interaction, service navigation and
  language switching.
- Desktop checks passed in all four locales at 1200 and 1440px: no overlap of
  logo/navigation/utilities, five visible business destinations, arrow-key
  movement between menu links and Escape dismissal.
- Desktop/mobile screenshots inspected. Final captures are in
  `outputs/navigation-{pl,ru,uk,en}-{desktop,footer,mobile,mobile-footer}.png`.
- Compared all 49 HTML files with HEAD: title, description/social metadata,
  canonical/hreflang, H1, structured data and complete district lists unchanged.
  Each shared footer contains exactly one business column after rebuilding twice.
- Impeccable detector ran once; its advisory findings concern the existing
  stylesheet/design-document palette and type scale. New footer colors and sizes
  reuse existing values and are recorded in DESIGN.md.

The pre-existing changes in `scripts/serve-test.mjs` were retained.
