# Intent Ads import plan — 2026-09-17

Scope: the four active NaSerwis.pl Search campaigns only. The package has been
uploaded and applied; all new groups remain paused.

## Live-account audit before the import

- `Search PL Naprawa sieci Warszawa` is active at 25 PLN/day. Its existing
  `Naprawa sieci` group produced the only conversion visible in the current
  seven-day ad-group view, so it must not be switched off during the first
  migration step.
- `Search RU Сети Варшава` is active at 25 PLN/day. It still contains 25
  enabled broad-match keywords across `Ремонт WiFi Интернет` and
  `Ремонт Сети`. The two broad Wi-Fi terms with current clicks are
  `слабый сигнал wifi` and `ремонт WiFi`; neither has a recorded conversion.
- `SRCH-EN-A-CORE` and `SRCH-UK-A-CORE` are active at 10 PLN/day with Manual
  CPC. Their existing network groups remain in place until the staged entities
  have passed policy review.
- This audit did not change budgets, bids, locations, languages, schedules,
  goals, conversion actions, ads or keywords.

## Generated bulk-upload files

- `intent-ad-groups-2026-09-17.csv`: 20 groups, five per campaign. Every group
  is created paused. EN/UK retain the existing 3 PLN default max CPC; PL/RU do
  not override the campaign bidding setup. Every staging name starts with
  `INTENT-`, so existing EN/UK `LAN-INSTALL` groups cannot be updated by
  accident.
- `intent-keywords-2026-09-17.csv`: 240 enabled keywords inside the paused
  groups. Every phrase has one phrase-match and one exact-match row. There are
  no broad-match rows.
- `intent-responsive-search-ads-2026-09-17.csv`: 20 enabled RSAs inside the
  paused groups, with ten localized headlines and four descriptions each.
  Headline, description and display-path limits are checked by the generator.

Each final URL uses one reviewed query value directly, for example
`https://naserwis.pl/ru/naprawa-wifi/?intent=weak-wifi`. This avoids inserting
raw search text, keeps the canonical URL clean and preserves Google auto-tagging.

Regenerate and verify the package with:

```powershell
npm run ads:intent:generate
npm run ads:intent:check
```

## Preview and cutover gates

1. **Completed 2026-09-17:** uploaded the group, keyword and RSA files in that
   order. Google accepted 20 groups, 240 keywords and 20 ads. The importer
   initially created the groups as active despite the source status, so all 20
   `INTENT-` groups were selected and paused immediately; the live table then
   confirmed `Wstrzymana` for the filtered 20-row set.
2. Wait for Google policy review and inspect the live destinations. Do not
   change budgets, geo targeting, language targeting, schedules, bidding or
   conversion goals as part of this import.
3. Migrate campaign by campaign:
   - PL: first enable `INTENT-WIFI-COVERAGE`, `INTENT-ROUTER-SETUP` and
     `INTENT-LAN-INSTALL`. Keep
     the converting `Naprawa sieci` group and the existing `Naprawa WiFi`
     group as controls. Leave the new `INTENT-WIFI-NO-INTERNET` and
     `INTENT-LAN-REPAIR`
     paused until search-term overlap is reviewed.
   - RU: after the five new groups are eligible, pause the two old broad-match
     groups and enable the five intent groups in the same change window.
   - EN/UK: when the new groups are eligible, pause the overlapping
     `WIFI-REPAIR`, `LAN-INSTALL` and `LAN-CCTV-REPAIR` groups as the new intent
     groups are enabled. Keep unrelated groups separate; pause PC/general IT
     themes if they still lack a dedicated matching NaSerwis landing page.
4. Review search terms twice weekly. Compare qualified enquiries and booked
   work by language and intent; do not judge the migration from CTR alone.

The launch actions above change public ad delivery. They require a separate
live-account confirmation immediately before the Google Ads apply/enable step.

## Google Ads import result

On 2026-09-17 Google Ads accepted and applied the corrected ad-group file as
20 changes with 0 errors. The first, older preview exposed two existing EN/UK
`LAN-INSTALL` name collisions; adding the `INTENT-` prefix removed them. That
obsolete 18-row preview was not applied.

The first keyword upload applied 234 of 240 rows. Google returned a generic
error for both phrase and exact variants of `internet nie działa`,
`naprawa internetu warszawa` and `internet repair warsaw`. A separate six-row
retry produced the same 0 accepted / 6 rejected result. The three phrases were
therefore replaced with the more specific service terms
`problem z wifi warszawa`, `awaria wifi warszawa` and
`wifi technician warsaw`. Google accepted all six phrase/exact replacement
rows with 0 errors, bringing the applied and repeatable package to 240
keywords. No rejected row was applied.

The RSA upload applied 20 of 20 rows with 0 errors. Campaign budgets, bids,
locations, languages, schedules, goals, conversion actions and existing ad
groups were not changed. No new group is delivering until a separate staged
cutover is confirmed and executed.
