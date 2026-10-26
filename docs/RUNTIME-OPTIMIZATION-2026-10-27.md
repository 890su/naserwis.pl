# Runtime payload refinement — 27 October 2026

The owner requested the remaining audit fixes and publication after the visual
release `d78508b`. This update reduces the initial JavaScript payload while
preserving the published interface, forms, consent and conversion contracts.

- Build localized UI dictionaries for the document language, retaining the
  Polish fallback. Language-picker destinations and browser-language suggestion
  dictionaries retain all four languages.
- Keep only the current service's search-intent variants. Pages without an
  applicable service omit the unused intent copy.
- Business pages omit review carousel, rating and editor handlers because they
  have no review section.
- Keep the carousel and Google action immediately ready on pages with reviews.
  Load the private-review editor from a fingerprinted first-party script as the
  visitor approaches the review section or interacts with it. The first pending
  Escape/Cancel works, failed loads can retry, and text entered during loading
  is handled when the editor becomes ready.
- Form delivery, consent/Google initialization order, event IDs and attribution
  remain in the initial runtime. No API endpoint or advertising setting changes.

`scripts/localize-runtime.mjs` uses Acorn 8.19.0 at build time only. The runtime
is derived from the existing source, so generators retain one source of truth.
`scripts/review-modal-runtime.mjs` extracts the existing editor handler and
preserves its measurement callback. Deferred assets are listed in the manifest.

## Evidence

- `npm run technical:generate`, `npm run check`, `npm test`.
- Browser checks: runtime-loading, measurement, language-layout,
  mobile-navigation and technical-seo suites; all four UI languages.
- Local raw/gzip/Brotli byte comparison with `d78508b`, deferred-resource
  existence and page-specific omission checks:
  `reports/runtime-seo-20261027/javascript.json`.
- Production smoke and Lighthouse 13.4.1 mobile lab evidence are recorded in
  the same local report directory after publication.

Compression values are computed sizes, not a claim about negotiated transfer
encoding. The skill's strict 15 KB uncompressed generation budget is not met by
this existing application; the size reduction is reported explicitly instead
of describing compressed bytes as uncompressed JavaScript. Field INP and Google
rich-result eligibility are not inferred from Lighthouse or JSON-LD syntax.
