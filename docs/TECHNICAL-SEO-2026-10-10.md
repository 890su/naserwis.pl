# Technical SEO fixes — 2026-10-10

Status: user approved HTML and publication; local validation completed. Publication uses the existing Git integration on main. The deployment SHA and production verification are recorded in reports/seo-2026-10-10/publication.json.
Skill: seo-landing, fix-existing mode, specification 1.11.

Prepared across 41 static pages:

- Remove Google Fonts; use the system font stack in compiled CSS.
- Consolidate local styles into one complete, render-blocking, minified CSS file
  per template. Consolidate JavaScript into one deferred minified file, keeping
  dependency order: config, consent, shared runtime, contact/guide/weather UI.
- Content-addressed assets use the existing immutable `/assets/*` cache policy.
  Original source files and a manifest remain available for maintenance.
- Load Google only when analytics or marketing is granted; configure GA4 and
  Ads only for granted categories. Preserve destination IDs and conversion labels.
  Google receives no denied-consent pings on fresh/necessary-only visits.
- Exclude hidden honeypot/inert/negative-tabindex controls from modal focus trap;
  remove aria-modal from the nonmodal consent region.
- Give labelled generic groups a group role; replace footer h4 with h3; add
  translated skip links where missing; darken muted and weather text colours.
- Preserve footer email as machine-readable meta independent of Cloudflare
  mailto rewriting; remove unsupported LocalBusiness inLanguage; add an image
  and WebSite markup to the localized home pages.
- Generate real PNG/ICO favicon and 1200×630 social preview from the existing
  text wordmark. Asset provenance is recorded in public/assets/ASSETS.md.
- Derive stale commercial sitemap dates from significant existing content commits.
- Stage CSP Report-Only without a remote reporting endpoint; HSTS starts at
  one day, without includeSubDomains or preload.
- Wire the final technical pass into documented generation commands and adapt
  asset guards to manifest-backed bundles. Keep the original pre-CRO fixture.
- Prepare regression tests for optional requests, consent categories and the
  contact-dialog focus loop; adapt the first-frame CSS interception test.

Existing copy, billing, destination/conversion IDs, canonical/hreflang, forms,
chat, guide reading levels and diagnostics are retained. No deployment or push.
## Measured local candidate

Lighthouse 13.4.1, 3 runs per template; mobile 412×823, DPR 1.75, simulated RTT 150 ms / CPU ×4. Local QA server with Brotli/gzip. Lab evidence only.

| Template | Performance | Accessibility | Best practices | SEO | LCP, s | CLS | TBT, ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| home | 100 | 97 | 100 | 100 | 1.381 | 0.00689 | 9 |
| wifi | 100 | 96 | 100 | 100 | 1.407 | 0.00689 | 5 |
| guide | 97 | 97 | 100 | 100 | 1.597 | 0.00000 | 100 |
| weather | 97 | 96 | 100 | 100 | 1.808 | 0.00372 | 0 |

LCP is H1 text. npm run check passed; 12 unit and 79 browser tests passed; the 7 technical tests also passed after the final focus fix. Nu: 41 pages, zero errors. No missing assets or invalid JSON-LD; 32 sitemap URLs match canonical. Representative homepage/article schema.org Code input: zero errors/warnings. Responsive screenshots inspected at 320/768/1280/1920 with no horizontal overflow. Generation is idempotent.

Commands, artifacts and caveats: reports/seo-2026-10-10/REPORT.md (ignored local evidence folder). Raw final Lighthouse: reports/seo-2026-10-10/lighthouse-release/.

## Remaining limitations

- Existing initial JS exceeds the strict uncompressed 15 KB skill budget; compressed network size is separate. Full 100/100 compliance is not claimed.
- Inline SVG, complete blocking CSS and the approved compact first-load consent notice are retained for the existing site. Optional Google/chat remain consent-gated external dependencies. Basic Consent Mode intentionally reduces denied-consent measurement coverage.
- Chrome keyboard tests pass, but manual Codex IAB floating-modal Escape leaves BODY focus. This cross-browser finding is unresolved. Real browser zoom 200% and exhaustive control-state/screen-reader review remain unverified; no WCAG certification.
- Logo teal is retained under the conditional logo contrast exception. No public customer premises address was invented from legal correspondence details.
- Cloudflare email rewriting, headers/cache/compression, Google Rich Results and production Lighthouse require checks after publication. Local scores above do not describe the deployed host. No FAQ rich-result benefit is promised.

Build: npm run technical:generate. QA preview: PORT=8856 node scripts/serve-test.mjs. Performance QA: PORT=8866 QA_PERFORMANCE=1 node scripts/serve-test.mjs. Test server never delivers forms; performance mode proxies read-only weather/network routes and does not emulate Cloudflare headers.
