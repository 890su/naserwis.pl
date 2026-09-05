# NaSerwis.pl — conversion improvement plan

Approved scope: NaSerwis.pl only. ITBIZ.PL has a separate deferred plan.
Baseline: production commit `19c7187`; historical analytics are January–February
2026, not evidence of current conversion performance.

## Current revision — modal enquiry paths and mobile contact dock

Owner update, 2026-09-05 (`20260905-modal6`): change the attention cycle to one
short rock/pulse every three seconds after the existing 2.5-second idle delay.
Closing the contact menu restarts the idle timer and resumes animation.

Add a fifth localized `Wyślij zapytanie` option to the circular menu. It opens an
accessible short modal form without changing scroll position. All existing
`#contact` CTAs open the same modal when JavaScript works and retain their anchor
fallback; the hero/final forms remain in page source and layout. On mobile, show
a fixed two-action dock for phone and modal enquiry, with the circular launcher
raised above it. Hide the dock during consent and modal/navigation overlays.

The modal reuses the same validation, bot protection, Pages Function, attribution
and successful-lead measurement. Only successful submissions emit the existing
primary Ads lead action; mobile phone and existing channel clicks retain their
secondary observation conversions. No SEO content, URLs or schemas change.

## Previous revision — persistent idle contact motion

Owner update, 2026-09-04 (`20260904-idle5`): focusing or typing in a form field
must not hide the circular contact launcher. Scroll activity immediately stops
its motion; after 2.5 seconds without scrolling it starts a continuous one-second
rock/scale and double-ring pulse cycle. Hover, contact-menu/modal/chat state,
background tabs and `prefers-reduced-motion` still pause or disable motion. The
six-second invitation remains independently dismissible and consent-aware.

## Previous revision — clearer consent row and stronger contact cue

Owner update, 2026-09-04 (`20260904-consent4`): remove the two rejected hero
links from all four localized homepages while preserving the service-page and
form conversion paths. The initial cookie notice remains non-modal, but is now a
clearly separated grey 50/50 row: explanation on the left and three distinctly
styled choices in one row on the right, including narrow mobile layouts.

Keep the circular contact launcher visible above that initial row. Opening
explicit cookie settings still creates a modal and suppresses the launcher.
Increase the centered rock/scale movement and the two background pulse rings;
each burst remains bounded to 4.2 seconds and starts at most once per 16 seconds.
The invitation still waits for a consent choice and reduced-motion users get no
animation. URLs, SEO metadata/schema, forms and existing Ads conversions remain
unchanged.

## Previous revision — balloons beside the original circles

Owner clarification, 2026-09-04 (`20260904-balloons3`): retain the round icons,
add a left invitation after six seconds of availability, and add left channel
descriptions on hover/focus (all visible immediately on mobile/coarse pointers).
Invitation copy: "Have a question? Message us", localized PL/RU/UK/EN; no online
presence claim. Rock/scale around the circle center with two stronger pulse rings
in 4.8-second bursts, separated by 24 seconds. Stop motion on hover/focus and when
reduced motion is enabled. Invitation X or opening the menu disables further
invitation/attention for the tab session. Consent/modals/keyboard/chat/background
tabs pause the invitation. No automatic channel opening or Ads changes.

## Previous revision — original circular contacts restored

Owner preference, 2026-09-04: restore the original round launcher and four
separate round channel buttons. Remove the labelled pill, white contact card,
automatic hint/attention sequence and mobile contact strip. The launcher remains
available while scrolling, except during consent, navigation/review modals,
keyboard input or open chat. Keep form/consent/measurement improvements, keyboard
controls and chat failure handling. Asset version: `20260904-round2`.

This preference supersedes the contact-widget design below; the initial release
is retained as history. Do not reintroduce the card/strip via generators.

## Initial release scope (historical)

- [x] Non-modal compact initial consent banner; explicit modal settings retained.
- [x] Labelled contact launcher, one short attention sequence, reduced-motion support.
- [x] Labelled contact choices and mobile contact bar after the hero, suppressed
  near forms/footer, keyboard, consent UI, navigation and chat.
- [x] Contact alternatives and clear next step alongside existing forms.
- [x] Consent-aware diagnostic funnel events; existing Ads action IDs and
  primary/secondary semantics preserved. No campaign/account changes.
- [x] Inline form validation aligned with the existing server (2/5/3 minimum
  characters for name/phone/message), persistent success, safe retry.
- [x] Remove the unverified one-hour callback promise from API responses.
- [x] Static/SEO regression, endpoint tests, four-locale browser and visual QA.
- [x] Commit/push, publish exact source to existing Cloudflare Pages project,
  production smoke tests and rollback record.

## Design decision

Keep Poppins headings and IBM Plex Sans body/interface text. Keep existing navy
`#0a2540`, white `#ffffff`, mist `#f4f8fa`, mint `#00c9a7` and contact amber
`#ffc53d`. One signature: a labelled amber contact pill with a single sheen and
two gentle halo pulses, then static. No fake presence, countdown, new price,
review, response-time guarantee or new service.

## Guardrails

Preserve all 16 landing URLs, title/H1/description, canonical/hreflang, sitemap,
redirects, existing service content, phone/messenger targets and Ads conversion
labels. Chat requires support consent; new diagnostic analytics require analytics
consent. PII and raw query strings never enter event parameters. Marketing
attribution storage remains consent-gated. No consumer/B2B funnel mixing.

## Deferred until evidence is available

- Current GA4/GSC and Ads exports (28/90 days), consent-segmented funnel baseline.
- Verified review permissions, B2B/consumer relevance, case photos, availability,
  operating hours and price inputs before publishing additional claims.
- A/B experiment after traffic permits a powered comparison. First establish a
  stable instrumentation baseline; do not claim uplift from this combined release.
- Qualified/booked/paid offline stages need operational ownership and privacy review.
- Ads bidding roles and campaigns are read-only/out of scope for this release.

Success metric: qualified leads per session and cost per qualified lead, not FAB
opens. Review diagnostics after the first full week; judge commercial outcomes
only with enough leads, segmented by page/language/device/source.

## Sources

- [Google landing page guidance](https://support.google.com/google-ads/answer/6238826?hl=en)
- [Google interstitial guidance](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials)
- [W3C motion guidance](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)
- [Google Ads consumer support restriction](https://support.google.com/adspolicy/answer/13527027?hl=en)

## Deployment preflight

Requested Cloudflare account: `5354e054d53157bf5b02ce5119d08948`.
The supplied account token verifies, but Pages API access returns HTTP 403/code
10000. Do not change DNS or create another project/account to work around this.
Existing GitHub integration verified: baseline commit `19c7187` has a successful
Cloudflare Pages check pointing to this account/project. Use that integration;
direct token permission troubleshooting is not required to publish this release.
Credentials are never committed or stored in project files.

Published implementation: `f2a3505a3d537c94bc328820bf7f56f750fb3b6a`, successful
Pages deployment `db1332af-e4f6-4d0e-bdd3-13bb4a5da43b`. All 24 browser scenarios
also passed against production. See [RELEASE.md](RELEASE.md) for the smoke-test
scope and operational follow-ups; no commercial uplift is asserted.
