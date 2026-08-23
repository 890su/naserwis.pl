# NaSerwis.pl on Cloudflare Pages

This repository is a static export of the existing multilingual website, with a Cloudflare Pages Function for form submissions. It preserves the 16 public pages and their extensionless URLs.

## Cloudflare Pages configuration

Connect this GitHub repository in **Workers & Pages → Create application → Pages → Connect to Git**.

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
| `TURNSTILE_SECRET_KEY` | Required anti-spam verification |
| `TURNSTILE_HOSTNAMES` | Comma-separated allowed hostnames |

To enable Turnstile, create a widget for `naserwis.pl` and `www.naserwis.pl`, place its **public site key** in `public/site-config.js`, and set its private key as `TURNSTILE_SECRET_KEY`. The public key is safe to commit; the secret is not.

Before changing DNS, use the generated `*.pages.dev` URL to submit all three forms (the two contact forms and the review modal), checking delivery in Telegram and/or email. Then add the custom domain in Pages and update the DNS records following the Cloudflare dashboard instructions.

## Refreshing the static snapshot

The original application uses PHP. Cloudflare Pages does not run PHP, so the HTML in `public/` is a static export of the live pages. To intentionally refresh it from the live site, run:

```powershell
npm run export:live
```

Review and commit the resulting changes before deployment.
