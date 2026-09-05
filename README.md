# NaSerwis.pl on Cloudflare Pages

Production source: `public/` (16 landing pages and 8 legal pages, PL/RU/UK/EN),
with `functions/api/contact.js` for form delivery. The ignored legacy PHP files
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

Cloudflare discovers `functions/api/contact.js` automatically. It receives requests from all contact forms and the review modal at `POST /api/contact`.

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
npm run check
npm test
npm run test:e2e
```

`cro:generate` maintains localized additive markup on the committed HTML;
`public/contact-ui.js` and `public/contact-ui.css` implement the contact UI.
The owner's preferred original round launcher/channel buttons are retained.
Revision `20260905-modal6` runs one short rock/pulse every three seconds after
2.5 idle seconds and resumes after the contact menu closes. A fifth enquiry
choice, every existing `#contact` CTA and the two-action mobile dock open the same
short modal form; the original page forms remain. Successful modal submissions
reuse the existing primary lead conversion, while channel conversions stay
secondary. Reduced motion remains static and SEO routes/content are unchanged.
`compliance:generate` regenerates legal pages and reapplies CRO markup.
Run generators only for intentional source updates, inspect their diff and rerun
checks. The immutable pre-CRO SEO/Ads fixture works in shallow CI checkouts.

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

`npm run smoke:production` verifies the deployed page/asset content and rejected
API requests without submitting leads. For browser regression against production,
set `PLAYWRIGHT_BASE_URL=https://naserwis.pl`; valid form delivery stays mocked
and third-party measurement/chat requests are blocked in those tests.
