# CRO v1 release — 2026-09-04

## Latest revision: left balloons and attention around the circles

Owner clarification: `20260904-balloons3` keeps the original circles and adds a
delayed left invitation, centered rocking/scaling and two expanding pulse rings.
Each movement burst ends within 4.8 seconds, repeats after 24 seconds, and stops
on interaction. Dismissal/opening the menu persists for the current tab session.
Reduced motion keeps the invitation static. No online/SLA claim is introduced.

Four localized channel balloons show on desktop hover/keyboard focus and all show
on mobile/touch when the menu opens. No new card/strip and no changed lead/API,
SEO or Ads contract. Updated regression suite covers 27 browser scenarios,
including delayed invitation, repeat/dismissal, reduced motion, hoverable channel
descriptions, touch behavior and 320px viewport bounds. Production is verified
with the same smoke script and existing Cloudflare Pages Git deployment check.

## Previous revision: original circular contacts

At the owner's request, asset revision `20260904-round2` restores the original
round button and vertical coloured round channel icons from `styles.css`.
The labelled pill/card, timed hint, sheen and mobile strip are removed.
Form enhancements, compact consent, SEO and Ads configuration are retained.
The chat fallback appears only on failure, not as the normal contact menu.

Regression coverage now asserts 48px mobile / 56px desktop circles and absence
of the discarded UI on all 16 landings, while retaining form/conversion tests.
Publish through the existing Pages Git integration; require its successful check
and `npm run smoke:production`. The historical release record follows below.

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

Implementation commit: `f2a3505a3d537c94bc328820bf7f56f750fb3b6a`, pushed to
`origin/main`. Cloudflare Pages check completed successfully in the requested
account/project: deployment `db1332af-e4f6-4d0e-bdd3-13bb4a5da43b`.

Production verification on `https://naserwis.pl` passed:

- all 24 page SEO/UI checks;
- eight exact source asset comparisons (including UI JS/CSS and site config);
- original robots source plus the verified additional Cloudflare Managed robots
  prefix; no robots or zone policy changes were made;
- API rejects GET with 405 and an empty JSON POST with 400, without delivery;
- all 24 browser scenarios repeated against the production domain (44.1s),
  with valid submission/provider/analytics requests isolated as described above.

The documentation/QA follow-up changes no `public/` or `functions/` source; its
Git-triggered deployment serves the same verified implementation.

The supplied account token verifies but currently returns 403 for Pages/Workers.
The existing Git integration successfully published the site instead. No tokens
were written into source or documentation. Rotate the token shared in chat.

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
