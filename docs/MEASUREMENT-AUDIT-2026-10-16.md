# Measurement after the redesign — 2026-10-16

Baseline: published variant B, Git revision `ad07e0e`. Scope: NaSerwis.pl,
PL/RU/UK/EN. Existing successful-form primary conversion and four secondary
contact actions retain their IDs/labels and consent requirements.

## Findings and changes

- Existing lead/contact tracking survived the redesign. Five browser regression
  scenarios also passed against `https://naserwis.pl` before these changes:
  form rejection/retry/success, intent/lead context, mobile phone/modal,
  single phone/WhatsApp/Telegram labels, and unavailable chat without a false open.
- Six task choices in the new homepage panels previously had no dedicated
  measurement. Added `naserwis_service_select`, including stable identifiers
  shared with the original six catalogue cards. Service navigation in the
  desktop menu, mobile menu and ordinary links also reports the target service.
- Added `naserwis_pricing_click` for links to localized pricing conditions.
- Localized header/mobile links to the contact section also emit the existing
  form CTA click diagnostic while preserving their normal navigation. Opening
  an in-page form is not misreported as choosing another service.
- New hero/final phone buttons already fired the existing secondary phone
  action through delegated tracking. Added their impressions and accurate
  placement, also covering the mobile menu and contact rails.
- Form start/error/success diagnostics now describe the actual rail where the
  original form sits. Form IDs, submission API and primary action are unchanged.
- Follow-up explicitly covers the popup (`quick-form`): every visible direct
  opener on the homepage/Wi-Fi page, intent buttons, floating widget, mobile
  dock and mobile menu is exercised in PL/RU/UK/EN at desktop/mobile widths.
  Merely opening it never emits a lead conversion. Its rejection/retry/success
  path was already included in all 20 commercial/tool pages above.
- Additional phone/WhatsApp/Telegram links under forms are clicked through the
  real UI, confirming `contact_placement=form`. Footer email links now emit
  `email_click` and `naserwis_contact_click` with `contact_method=email`, without
  transmitting the address or adding an Ads conversion. Chat's existing
  success/consent/rejection/timeout tests remain in the follow-up run.
- The technical bundle generator normalizes CRLF before whitespace cleanup,
  preventing repeated Windows builds from accumulating empty lines.
- The owner-requested English homepage coverage correction is included:
  `We cover: Warsaw and surrounding areas`. The redesign generator preserves
  this source paragraph during rebuilds.

See [measurement.md](../ads/measurement.md) for the complete event/parameter
contract. New diagnostics require analytics consent; existing Ads actions
require marketing consent. No new bidding conversions were introduced.

## Verification

`tests/browser/measurement.spec.mjs` inventories 344 phone/messenger links on 32
commercial/tool/guide pages and exercises all 40 lead forms. Both an API failure
and a successful response are simulated per form. It checks one primary
conversion with a lead ID, one secondary conversion per contact click,
placements, all six choices, mobile menu actions, the four analytics/marketing
consent combinations, absence of form PII and raw queries, and a successful
stubbed chat SDK opening.

Additional cases check an incomplete API response, duplicate submissions while
a request is pending, no replay of clicks after consent, and once-only visible
phone impressions. Existing tests cover invalid fields, denied consent, chat
failure, review star routing, navigation, languages, layout and SEO.

All external requests and real API delivery are blocked in the new measurement
suite. Successful API results and Chatwoot are simulated; these checks do not
prove real notification delivery, Google ingestion or Ads account goal settings.
No real lead, review, call, message or Google conversion hit was sent by this audit.

Checks: `npm run check`, `git diff --check` and all 12 unit tests passed.
All 102 existing browser scenarios and the original 45 measurement scenarios
passed across the full run and focused final reruns. Four follow-up cases add
popup launchers and visible alternative-contact clicks in all four languages.
All four follow-up cases passed (desktop/mobile home and Wi-Fi flows); the
updated consent matrix, popup lead submission and chat cases also passed.
The preceding 11 final checks covered task/pricing/contact clicks, category
consent, native desktop-menu navigation and once-only phone impressions. The desktop
menu listener runs during capture, before its inline navigation handler.

The initial full run had 144 passing cases and one new test-fixture failure:
the privacy settings dialog hides the initial accept-all button. The corrected
test enables the analytics switch and saves settings through the actual UI.
The focused runs verify that corrected flow; no single full-suite run after all
follow-up additions is claimed.

Prepared runtime bundles: `site-7d8ab2a43319de43.js` (commercial pages),
`site-56655f18bc5747ce.js` (guides), `site-171da4464fb7936b.js` (tools).
The existing consent-only bundle and all Ads destination labels are unchanged.

## Publication

The owner explicitly approved publication on 2026-10-16. Application revision
`e3fe3eb5400a811a06a60f190de9d4e590d9b3a2` was committed and pushed to `main`
through the existing Git integration. Its **Cloudflare Pages** check completed
successfully for deployment `504fe199-1ec2-48b1-bb22-8d233cc8820a`:
[deployment details](https://dash.cloudflare.com/?to=/5354e054d53157bf5b02ce5119d08948/pages/view/naserwis-pl/504fe199-1ec2-48b1-bb22-8d233cc8820a).

Production verification against `https://naserwis.pl` passed:

- `npm run smoke:production`: page SEO/navigation, exact source and bundled
  assets, permanent redirects, real 404 and rejected API requests (405/400).
- All **49 measurement browser scenarios** passed in one production run:
  344 phone/messenger links, 40 contact forms including every popup, all four
  languages, alternative channels/email, consent categories, duplicate/failed
  submissions, new choices and desktop/mobile placements.
- Three additional existing CRO scenarios passed: mobile dock/modal lead and
  phone actions, chat support-consent acceptance/rejection, and unavailable chat
  without a false opening conversion. Total: **52 production browser checks**.
- An independent GET confirmed the corrected English coverage text and the new
  commercial runtime reference on `/en/`.

API success responses and Chatwoot SDK behavior remained simulated; Google
requests and external contact navigation remained blocked in these browser
checks. No real lead, review, call, message or Google conversion hit was sent.
The evidence is recorded in a documentation-only follow-up commit; it does not
change the verified public files.

Pre-release rollback: revision `ad07e0ee2b87e665e0a5c7584163c541f521d5fe`,
successful Pages deployment `ea47fcb5-39fc-4e91-aab0-d88b4a26ab6b`. Use a reviewed
Git revert or the previous Pages deployment; do not reset/force-push.
No credentials, DNS, campaign goals or budgets need to change.

The old redesign release guard requires byte-identical runtime JavaScript to its
pre-redesign baseline. This task intentionally changes measurement JavaScript;
that historical guard is not an acceptance test for this change and was not
weakened. Current static guards and behavior tests are the acceptance checks.
