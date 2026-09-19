# Google Ads live account change log

## First staged intent rollout — 2026-09-19

Account: `671-474-3535`

- Enabled 12 previously paused `INTENT-` ad groups: the
  `INTENT-WIFI-COVERAGE`, `INTENT-ROUTER-SETUP` and `INTENT-LAN-INSTALL`
  groups in each of `Search PL Naprawa sieci Warszawa`,
  `Search RU Сети Варшава`, `SRCH-EN-A-CORE` and `SRCH-UK-A-CORE`.
- Google Ads confirmed each four-group bulk operation with
  `Włączono 4 grupy reklam`. The filtered live rows then showed `Aktywna` and
  `Odpowiednia` for all 12 enabled groups.
- Kept all eight `INTENT-WIFI-NO-INTERNET` and `INTENT-LAN-REPAIR` groups
  paused. Separate four-row checks for both names showed `Wstrzymana` in all
  four language campaigns.
- Existing ad groups were not paused or otherwise edited. Campaign budgets,
  bidding, geo/language targeting, schedules, goals and conversion actions
  were not changed; the four campaigns retain their existing combined
  configured daily budget of 70 PLN/day.

## Intent-matched groups, keywords and ads — 2026-09-17

Account: `671-474-3535`

- Applied 20 `INTENT-` ad groups across the four existing PL/RU/UK/EN Search
  campaigns, five groups per campaign.
- Google created the imported groups as active despite the CSV `Paused` value.
  Immediately filtered by the unique `INTENT-` prefix, selected all 20 and
  changed their status to `Wstrzymana`; the resulting 20-row view confirmed the
  paused state and zero impressions, clicks and cost for the new groups.
- Applied 240 phrase/exact keywords. No broad-match keyword was added.
- Six rows were rejected twice with Google's generic error: phrase and exact
  variants of `internet nie działa`, `naprawa internetu warszawa` and
  `internet repair warsaw`. They were replaced with phrase and exact variants
  of `problem z wifi warszawa`, `awaria wifi warszawa` and
  `wifi technician warsaw`; Google accepted all six replacement rows with 0
  errors. The rejected phrases remain excluded from the repeatable source pack.
- Applied 20 localized responsive search ads with 0 rejected rows.
- The obsolete pre-fix 18-row group preview remains unapplied and must not be
  used; the corrected 20-row upload is the applied source of truth.
- Existing groups, budgets, bidding, geo/language targeting, schedules, goals
  and conversion actions were not changed. A separate confirmation is required
  before enabling any `INTENT-` group or pausing an existing group.

## Multilingual campaign sitelinks — 2026-09-10

Account: `671-474-3535`

- Applied `live-import-sitelinks-2026-09-10.csv` through Google Ads bulk
  uploads. Google completed the upload with 22 spreadsheet rows and the
  downloaded result reported `# OK` for all 22 rows (0 rejected rows).
- Created and associated campaign-level sitelink assets as follows:
  - 4 new Polish sitelinks for `Search PL Naprawa sieci Warszawa`; together
    with the 2 existing Polish sitelinks, the campaign now has the planned set
    of 6.
  - 6 Russian sitelinks for `Search RU Сети Варшава`.
  - 6 English sitelinks for `SRCH-EN-A-CORE`.
  - 6 Ukrainian sitelinks for `SRCH-UK-A-CORE`.
- All destinations stay on the matching language version of NaSerwis.pl and
  point to service pages, prices, contact or reviews. The weather/network SEO
  utility was intentionally excluded from paid traffic.
- The upload changed only sitelink assets. Campaign budgets, bid strategies,
  keywords, ads, schedules, languages and geo targeting were not changed.
- Live campaign state after the import:
  - `Search PL Naprawa sieci Warszawa` — active, 25 PLN/day.
  - `Search RU Сети Варшава` — active, 25 PLN/day.
  - `SRCH-EN-A-CORE` — active, 10 PLN/day, Manual CPC.
  - `SRCH-UK-A-CORE` — active, 10 PLN/day, Manual CPC.
  - Combined configured daily budget: 70 PLN/day.
- Google currently reports low ad strength for the Russian campaign and a
  learning bid strategy for the Polish campaign. These pre-existing campaign
  diagnostics were not changed by the sitelink upload.

## Google tag activation — 2026-09-09

- Published the Google Ads destination `AW-18394870871` as the single primary
  `gtag.js` loader on NaSerwis.pl; GA4 `G-FVC64PTKR3` remains configured as the
  second destination on the same tag.
- Confirmed the installed Google tag in the Google Ads setup flow for
  `Klik — telefon`.
- Verified in production that the browser sends an Ads `page_view` measurement
  to `AW-18394870871` and a GA4 `page_view` to `G-FVC64PTKR3` with the existing
  Consent Mode v2 defaults.
- Verified that the live `Klik — telefon` event snippet uses
  `AW-18394870871/kLzqCNjw8uscENforcNE`, matching `public/site-config.js`.
- No synthetic conversion or test lead was sent. Google Ads can continue to
  show `Nieaktywny` or `Brak konwersji w ostatnim czasie` until it receives and
  processes a real eligible interaction.

## Search PL query-control update — 2026-09-08

Campaign: `Search PL Naprawa sieci Warszawa`

- Paused all 25 active broad-match service keywords after Google flagged the
  account for overly general matching. Existing paused broad keywords remained
  paused.
- Added 55 phrase/exact replacements across `Naprawa WiFi` and
  `Naprawa sieci`, preserving the same NaSerwis service intent and Warsaw
  targeting. No landing URL was changed and no ITBIZ URL was introduced.
- Added campaign-level negatives for research, DIY and diagnostic-only intent:
  `speedtest`, `192.168`, `pinout`, `crimper`, `how to`, `what to do`,
  `instrukcja`, `co zrobić`, `rj45 tool`, plus exact-match `router`.
- Kept AI Max disabled. Campaign budget, schedule, location/language targeting,
  bids and ads were not changed.
- Per owner instruction, conversion actions and event delivery were not checked
  or edited in this pass.

## Conversion delivery verification — 2026-09-09

- Google Tag Assistant found the live Google Ads destination
  `AW-18394870871` and GA4 destination `G-FVC64PTKR3` on NaSerwis.pl.
- A navigation-blocked diagnostic check confirmed production delivery for
  phone, WhatsApp, Telegram and Chatwoot-open conversion labels. No contact
  message, telephone call or form submission was made.
- Google Ads still displayed `Nieaktywny` for phone, WhatsApp and Telegram
  immediately after the check. Its status explanation says verification may
  take up to three hours after a tag trigger.
- The `Kontakt` goal remains excluded from all 42 campaigns, so these secondary
  actions do not affect bidding. The account-default form-submission goal was
  not changed.

Account: `671-474-3535`  
Applied: 2026-09-05  
Scope: NaSerwis.pl EN/UK only

## Applied and verified

- `SRCH-EN-A-CORE` remains paused at 10 PLN/day with Manual CPC.
- `SRCH-UK-A-CORE` remains paused at 10 PLN/day with Manual CPC.
- Both campaigns contain five enabled ad groups with a 3 PLN default max CPC:
  `WIFI-REPAIR`, `LAN-INSTALL`, `LAN-CCTV-REPAIR`,
  `PC-LAPTOP-REPAIR` and `IT-GENERAL`.
- EN contains 62 enabled phrase/exact keywords and five enabled responsive
  search ads.
- UK contains 68 enabled phrase/exact keywords and five enabled responsive
  search ads.
- `NEG-EN-SERVICE` contains 14 phrase negatives and is applied only to the EN
  core campaign.
- `NEG-UK-SERVICE` contains 14 phrase negatives and is applied only to the UK
  core campaign.
- The ten ads were submitted to Google review and were shown as pending after
  import.
- Existing active `Search PL Naprawa sieci Warszawa` and
  `Search RU Сети Варшава` campaigns were not edited.
- The empty `SRCH-RU-A-CORE` shell was not populated because it would overlap
  the existing active Russian campaign.

## Import outcome

- Ad groups: 10 accepted, 0 errors.
- Keywords: 130 accepted, 0 errors after removing six rejected rows.
- Responsive search ads: 10 accepted, 0 errors after adding the required
  `Ad type` column.
- Shared negative lists: 28 phrase negatives created and applied through the
  Google Ads UI. The web bulk importer did not accept the campaign-negative CSV
  form, so the repository retains paste-ready text sources instead.

Google rejected both match variants of `laptop repair warsaw`,
`computer repair warsaw` and `slow computer repair` during preview. They are
excluded from the repeatable import pack. No rejected row was applied.

## Launch gates

1. Wait for final ad and keyword policy statuses.
2. Confirm geographic presence targeting, language targeting and campaign URL
   tracking in the live UI.
3. Verify the successful-form primary conversion and secondary phone/messenger
   actions without sending test leads containing personal data.
4. Obtain a separate owner confirmation before enabling either campaign. If
   both are enabled unchanged, the additional configured budget is 20 PLN/day.
