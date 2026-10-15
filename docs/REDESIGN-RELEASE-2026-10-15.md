# Approved redesign release — 2026-10-15

The owner explicitly authorized transferring the reviewed HTML preview to the
main site, committing, pushing and publishing through the existing integration.
Repository: `890su/naserwis.pl`, branch `main`, Cloudflare Pages `naserwis-pl`.
No new hosting project, DNS, credentials, contact delivery or Ads configuration.

## Final behavior

- Four homepages use the approved light technical-equipment hero, fault/setup
  groups and a quick contact/pricing rail.
- Twelve service pages use the approved dark topic/description header with a
  large phone action; the original service form sits in the contact rail.
- All 41 HTML pages use the shared visual system. Titles/H1/meta/canonical,
  hreflang, JSON-LD, sitemap, redirects, prices and factual service copy are retained.
- Original Google reviews remain; localized reviews are also available on service
  pages. Ratings 1–3 open the original internal feedback form; 4–5 target Google.
  Districts, four languages, contact launcher/motion and consent remain intact.
- The current content is reapplied after normal generators; service form IDs and
  the `.hero-cta-wrapper .btn` intent hook survive regeneration.

## Build and verification

`npm run technical:generate`, `npm run seo:generate`, `npm run check`, `npm test`
and `node scripts/check-redesign-release.mjs` passed. The release guard compares
41 pages and protected JS/API/robots/redirects/sitemap with `c1be176`.
The independent transfer review additionally compared 44 original form blocks,
checked unique IDs, one stylesheet per page and all referenced assets.

All 101 browser scenarios passed in aggregate: 79 in the initial run, 19 after
correcting first-paint/navigation readiness in the test fixtures, and the final
three guide cases after awaiting the target document's load. Fixture changes do
not relax navigation, contrast, CLS, form or review assertions. Tests intercept
successful lead/review requests; no real enquiry or review was submitted.

Original protected JavaScript and API sources are unchanged. Font declarations
are now exempted from the older system-font rewrite, and the design joins the
existing minified, content-addressed stylesheet. Manrope 400/700 use losslessly
converted WOFF2 files (30,368 / 30,724 bytes); no Google Fonts request occurs at
runtime. Desktop AVIF is 22,693 bytes; mobile AVIF is 9,068 bytes.

Local Lighthouse 13.4.1, mobile defaults, Brotli/gzip QA server, one run per
template: homepage Performance 95, Accessibility 97, Best Practices 100, SEO 100,
LCP 1.745 s, CLS 0, TBT 200 ms; Wi-Fi Performance 98, Accessibility 96,
Best Practices 100, SEO 100, LCP 1.687 s, CLS 0, TBT 50 ms. These are local lab
samples, not field metrics or production/WCAG certification. No conversion or
organic-traffic uplift is claimed. Raw reports and captures remain ignored in
`reports/redesign-release-2026-10-15/`.

## Publication and rollback

Publication requires the Cloudflare Pages check to succeed for the pushed SHA,
then `npm run smoke:production` and direct checks of the new binary assets/live
layout. Deployment identity and final smoke evidence are recorded after push.

Previous live revision: `c1be1767f9dd3d9a84bd7e755e6996f705f77b00`.
Previous successful Pages deployment:
`1872b984-87c2-4b64-b016-2441bcc93116`. Roll back through the previous Pages
deployment or a reviewed Git revert; never reset/force-push. The separate
`redesign-preview-2026-10-15` directory remains available locally.
