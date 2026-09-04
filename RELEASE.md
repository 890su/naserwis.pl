# CRO v1 release — 2026-09-04

Target: existing Cloudflare Pages `naserwis-pl`, account
`5354e054d53157bf5b02ce5119d08948`, domain `naserwis.pl`, Git `main`.
This is Pages static hosting plus a Pages Function, not a new standalone Worker.

## Change set

Labelled contact pill, short dismissible hint, bounded motion, explicit channel
menu, contextual mobile bar, form next-step/alternative contacts, local field
errors, persistent confirmation, and compact non-modal initial consent banner.
All four locales are included. Explicit consent settings remain modal and
keyboard accessible. Chat consent, SDK loading/failure and reduced motion are
handled. No advertising account mutations or ITBIZ deployment.

## Verification

- Static/link checks: 24 HTML pages; no missing local resources.
- Immutable baseline `19c718796d749613deed8bd634745359883372e7` matches title,
  description, H1, canonical/hreflang, structured data, sitemap, robots,
  redirects and site configuration/Ads labels.
- Four Node test groups cover input/origin validation, failed delivery,
  Turnstile and accepted multilingual delivery with mocked providers.
- 24 Chrome browser scenarios cover all 16 landing pages, 360/390/768/1440px,
  menu/focus/consent/storage/motion, form failure and retry, attribution,
  existing conversion labels, chat grant/rejection/timeout and suppression.
- Screenshots reviewed: mobile consent/contact/menu/bar/form and desktop menu.
- CRO generator rerun verified idempotent. No new third-party runtime package;
  Playwright and Wrangler are pinned development tools only.

Browser/provider tests use mocks: they do not prove actual Telegram/email inbox
delivery or Google Ads ingestion. No fake leads were sent to production.
The Turnstile public key remains empty as before; production configuration is
an operational follow-up, not silently changed in this CRO release.

## Publication record

Pending commit/push and successful Cloudflare check; fill in exact deployment
and production smoke results after release. The supplied account token verifies
but currently returns 403 for Pages/Workers; Git integration is already linked
and verified. No tokens were written into source or documentation.

## Rollback and follow-up

Previous successful production: commit `19c7187`, Pages deployment
`0dcc75b5-4d1d-43c8-bd3b-f55b6524fbdd`. If needed, choose that deployment in
Pages rollback, or revert the CRO implementation commit and push the revert.
Keep data/credentials and DNS unchanged. A rollback restores the previous UI
and measurement behavior, including its known limitations.

No uplift is claimed. Obtain fresh 28/90-day GA4/GSC and qualified-lead records;
review the first full week's consent-segmented funnel and run a controlled
experiment only when traffic supports it. Do not alter Ads bidding based on
button clicks alone. See [CRO_PLAN.md](CRO_PLAN.md) for evidence-gated next steps.
