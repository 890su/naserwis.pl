# NaSerwis.pl on Cloudflare Pages

Production source: `public/` (72 routed pages plus the 404 page, PL/RU/UK/EN),
with Pages Functions for contact delivery, weather and connection diagnostics. The ignored legacy PHP files
are a local migration archive, not the deployment source.

Current product definition: [PRODUCT.md](PRODUCT.md). Cross-brand strategy:
[`../PROMOTION-CONTRACT.md`](../PROMOTION-CONTRACT.md). Measurement contract:
[ads/measurement.md](ads/measurement.md). Deployment and QA record:
[RELEASE.md](RELEASE.md). Superseded plans are under `docs/archive/`.

Local business services live under `/dla-firm/` (also `/ru/`, `/uk/`, `/en/`).
Edit `scripts/business-copy.mjs`, then run `npm run business:generate`. The build
reuses existing service forms and adds page-specific examples, local menus,
canonical/hreflang, structured data and sitemap entries. Implementation record:
[docs/BUSINESS-SERVICES-2026-10-26.md](docs/BUSINESS-SERVICES-2026-10-26.md).

## Cloudflare Pages configuration

Existing project: **naserwis-pl** in account
`5354e054d53157bf5b02ce5119d08948`. GitHub repository `890su/naserwis.pl`
is already connected. Pushes to `main` trigger the **Cloudflare Pages** check.
Do not create a new Worker/Pages project or change DNS during normal releases.
Both apex and www DNS records point to `naserwis-pl.pages.dev`.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run check` |
| Build output directory | `public` |

Cloudflare discovers Pages Functions automatically. `POST /api/contact` receives contact forms. `GET /api/weather` proxies and caches the Warsaw forecast from MET Norway; `GET /api/network` reflects the current connection without storage; and `GET /api/network-probe` serves the explicit lightweight latency/download test with a 256 KiB cap.

## Required production secrets

In **Settings → Variables and Secrets**, add encrypted production secrets. Do not put these values in GitHub or in `public/site-config.js`.

| Secret | Purpose |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` | Existing Telegram notification channel |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` | Optional email notification channel via Resend |
| `TURNSTILE_SECRET_KEY` | Enables server-side Turnstile verification |
| `TURNSTILE_HOSTNAMES` | Comma-separated allowed hostnames |

To enable Turnstile, create a widget for `naserwis.pl` and `www.naserwis.pl`, place its **public site key** in `public/site-config.js`, and set its private key as `TURNSTILE_SECRET_KEY`. The public key is safe to commit; the secret is not.

The committed Turnstile site key is currently empty. This release does not change
anti-spam configuration or delivery credentials. Verify the production secret/
public-key pairing separately before enabling it; a secret without a widget key
would reject real enquiries. Local tests mock provider responses and never send
customer or test leads to Telegram/Resend.

## Development and release

Use Node 22+ and the committed lockfile. Chrome is the default test browser;
set `PLAYWRIGHT_CHANNEL` to another installed supported channel if needed.

```powershell
npm ci
npm run intent:generate
npm run ads:intent:check
npm run cro:generate
npm run tools:generate
npm run check
npm test
npm run test:e2e
```

`intent:generate` synchronizes the symptom selector, LAN repair process and LAN
installation deliverables across the 12 localized service pages. The runtime
accepts only five reviewed `intent` values, keeps clean canonical URLs and
passes the selected non-PII topic into contact forms and measurement.
`ads:intent:generate` builds the paused Google Ads migration package for the
five intent groups in each active language campaign. `ads:intent:check` checks
row counts, phrase/exact matching, URL allowlisting and Google RSA text limits
without changing the live Ads account.
`cro:generate` maintains localized additive markup on the committed HTML;
`public/contact-ui.js` and `public/contact-ui.css` implement the contact UI.
The owner's preferred original round launcher/channel buttons are retained.
Revision `20260916-intent1` keeps the initial grey consent notice as a compact
bottom-centred card instead of a viewport-wide bar. Its two-part copy/action row
and three explicit buttons remain; detailed privacy settings still open as a
modal. The contact launcher remains above the notice and runs one short
rock/pulse every three seconds after 2.5 idle seconds. It resumes after the
contact menu closes. A fifth enquiry
choice, every existing `#contact` CTA and the two-action mobile dock open the same
short modal form; the original page forms remain. Successful modal submissions
reuse the existing primary lead conversion, while channel conversions stay
secondary. Reduced motion remains static and SEO routes/content are unchanged.
`compliance:generate` regenerates legal pages, intent content and CRO markup.
Run generators only for intentional source updates, inspect their diff and rerun
checks. The immutable pre-CRO SEO/Ads fixture works in shallow CI checkouts.

`tools:generate` rebuilds the four localized “weather outside / weather online”
pages and their internal navigation. The public IP is intentionally shown only
inside the diagnostic page, never embedded into the menu, homepage HTML, URL or
analytics. Network API responses use `no-store`; the browser starts the 256 KiB
probe only after an explicit click. Forecast data is attributed to MET Norway
under CC BY 4.0 and is fetched server-side so the visitor does not contact the
provider directly.

The static QA server (`node scripts/serve-test.mjs`, localhost:8846) deliberately
does not deliver forms. Browser traces and visual captures are in ignored
`outputs/`. Do not commit them or secrets.

`export:live` is a legacy migration importer, disabled by default because it
overwrites source files and predates current tracking/CRO changes. Its explicit
`--allow-legacy-overwrite` option is only for separately reviewed migration work.
It is never a build or deployment step.

After a reviewed commit/push, require a successful Cloudflare Pages check for
that SHA, then verify `https://naserwis.pl` and the deployed asset content. Roll
back with the previous successful Pages deployment or a reviewed Git revert,
never with destructive reset/force-push. No DNS changes are needed.

Canonical directory URLs end with `/`, matching Cloudflare Pages' automatic
permanent redirects. Keep HTML canonical/hreflang metadata, Open Graph URLs,
internal links and `public/sitemap.xml` aligned with those served URLs. Keep
`public/404.html`: Pages uses it to return a real HTTP 404 for unknown paths
instead of serving the homepage as a soft 404.

`npm run smoke:production` verifies the deployed page/asset content and rejected
API requests without submitting leads. For browser regression against production,
set `PLAYWRIGHT_BASE_URL=https://naserwis.pl`; valid form delivery stays mocked
and third-party measurement/chat requests are blocked in those tests.

The NaSerwis-only RU/UK/EN quick-acquisition pack lives in `marketing/` and is
regenerated with `npm run outreach:build`. It contains localized tracked links
and ready-to-publish copy for owned profiles, permitted communities and referral
partners. Polish and ITBIZ are excluded. The owner-reported approved Google Ads
campaigns must be optimized in place using `ads/non-pl-existing-campaign-optimization.md`;
the paused repository drafts must not be imported as duplicates.

The 2026-10-09 home-service implementation remains in the source, but its
home-only brand boundary is superseded. Current positioning and query ownership
are defined in [PRODUCT.md](PRODUCT.md) and the workspace promotion contract.
The old implementation note is preserved under `docs/archive/`. Use
`npm run seo:generate` after editing `scripts/home-service-copy.mjs` and inspect
the generated copy for the current two-segment model.

The home-network guide section contains two articles, each with plain and technical
reading levels on a single canonical URL in PL/RU/UK/EN. Edit
`scripts/guide-copy-*.mjs` and run `npm run guides:generate`; SEO/CRO/compliance
generation preserves the section. See `docs/GUIDES-READING-LEVELS-2026-10-10.md`.
Compliance/CRO/price/intent generation preserves this source; the immutable
pre-CRO fixture stays unchanged and reviewed SEO hashes remain explicit.

Technical SEO and performance preparation (2026-10-10): use the documented
`npm run ...:generate` commands, which restore bundle references before a
generator reads shared chrome, then apply `scripts/apply-technical-seo.mjs`.
After editing original `public/*.css` or `public/*.js`, run
`npm run technical:generate`. Commit the generated HTML, assets and manifest
together. Content-addressed bundles are immutable; original CSS/JS remains
editable source. Do not call legacy generator scripts directly on bundled HTML.

The technical pass uses system fonts, one complete blocking stylesheet and one
deferred minified JS bundle per page. Google tags use Basic Consent Mode:
fresh/necessary-only visits load no Google loader; GA4 and Ads are configured
only for their granted categories. Existing destination IDs and conversion
labels remain in source. This intentionally stops denied-consent Google pings;
it changes measurement coverage for visitors who do not grant consent.

The Chat button starts Chatwoot on demand even before a cookie choice or after
Necessary only. This page-scoped request never changes saved preferences or
Google consent and does not auto-load chat on the next page. The separate Chat
privacy option permits automatic loading. Closing chat or a failed load restores
the initial notice when no cookie choice has been made. Chat failures offer the
existing phone/messenger fallback, and a failed SDK load can be retried.

`public/_headers` stages CSP in report-only mode (browser console reports;
no collection endpoint) and HSTS for one day, without subdomain/preload opt-in.
Hosting header behavior must be checked after deployment. No public premises
address has been invented from the correspondence address in the legal notice.
The existing LocalBusiness area, phone, coordinates and hours remain intact.

The HTML candidate was approved and locally validated on 2026-10-10.
Project checks, 12 unit tests and 79 browser tests passed; Nu reports zero errors
on 41 pages. Lighthouse 13.4.1 medians and remaining limitations are recorded in
[docs/TECHNICAL-SEO-2026-10-10.md](docs/TECHNICAL-SEO-2026-10-10.md).
For publication, verify the Cloudflare Pages check and deployed resources, then
re-test Cloudflare behavior and Google Rich Results. The uncompressed 15 KB JS budget and full WCAG
conformance are not claimed.

The first-visit language banner and contrast correction is documented in
[docs/CONTRAST-CLS-2026-10-10.md](docs/CONTRAST-CLS-2026-10-10.md).

## Approved redesign — 2026-10-15

The light homepage and compact dark service header are maintained by
`scripts/apply-redesign.mjs`; the shared design source is `public/redesign.css`.
`technical:generate` reapplies this layout and compiles one stylesheet per page,
preserving its self-hosted Manrope font-face declarations. The two WOFF2 fonts
total 61 KB; the responsive hero image uses AVIF/WebP with reserved dimensions.
Fonts and images make no external requests. DESIGN.md records the actual system.

The regular content generators temporarily return the service form to its
original content boundary before regenerating sections, then reapply the design.
Existing form IDs, intent hooks, reviews and star routing, contact launcher,
prices, four languages and service districts remain part of the source contract.
Run `npm run technical:generate` after editing the design; use the documented
content-generation commands for content updates. Commit HTML, the new referenced
bundles and `public/assets/manifest.json` together; retain older immutable bundles.

Release evidence and rollback are recorded in
[docs/REDESIGN-RELEASE-2026-10-15.md](docs/REDESIGN-RELEASE-2026-10-15.md).
`node scripts/check-redesign-release.mjs` compares SEO and protected behavior
against the pre-redesign revision `c1be176`; it is a release check requiring that
revision locally, not a shallow-CI build dependency.
