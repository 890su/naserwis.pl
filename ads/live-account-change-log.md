# Google Ads live account change log

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
