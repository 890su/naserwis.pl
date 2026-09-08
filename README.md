# NaSerwis.pl on Cloudflare Pages

Production source: `public/` (20 landing/tool pages and 8 legal pages, PL/RU/UK/EN),
with Pages Functions for contact delivery, weather and connection diagnostics. The ignored legacy PHP files
are a local migration archive, not the deployment source.

Release plan: [CRO_PLAN.md](CRO_PLAN.md). Measurement contract:
[ads/measurement.md](ads/measurement.md). Deployment and QA record:
[RELEASE.md](RELEASE.md).

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
npm run cro:generate
npm run tools:generate
npm run check
npm test
npm run test:e2e
```

`cro:generate` maintains localized additive markup on the committed HTML;
`public/contact-ui.js` and `public/contact-ui.css` implement the contact UI.
The owner's preferred original round launcher/channel buttons are retained.
Revision `20260905-consent7` keeps the initial grey consent notice as a compact
bottom-centred card instead of a viewport-wide bar. Its two-part copy/action row
and three explicit buttons remain; detailed privacy settings still open as a
modal. The contact launcher remains above the notice and runs one short
rock/pulse every three seconds after 2.5 idle seconds. It resumes after the
contact menu closes. A fifth enquiry
choice, every existing `#contact` CTA and the two-action mobile dock open the same
short modal form; the original page forms remain. Successful modal submissions
reuse the existing primary lead conversion, while channel conversions stay
secondary. Reduced motion remains static and SEO routes/content are unchanged.
`compliance:generate` regenerates legal pages and reapplies CRO markup.
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

Canonical service URLs do not end with `/`. `public/_redirects` permanently
redirects their slash variants (and legacy `.php` routes) to the canonical URL.
Keep `public/404.html`: Cloudflare Pages uses it to return a real HTTP 404 for
unknown paths instead of serving the homepage as a soft 404.

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
