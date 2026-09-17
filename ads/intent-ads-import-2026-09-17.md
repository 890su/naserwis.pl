# Intent Ads import plan — 2026-09-17

Scope: the four active NaSerwis.pl Search campaigns only. This package is
prepared for Google Ads bulk upload but has not been uploaded or applied.

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
  not override the campaign bidding setup.
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

1. Upload the group, keyword and RSA files in that order. The preview must show
   20 groups, 240 keywords and 20 ads with no rejected rows. Apply only while
   every new group remains paused.
2. Wait for Google policy review and inspect the live destinations. Do not
   change budgets, geo targeting, language targeting, schedules, bidding or
   conversion goals as part of this import.
3. Migrate campaign by campaign:
   - PL: first enable `WIFI-COVERAGE`, `ROUTER-SETUP` and `LAN-INSTALL`. Keep
     the converting `Naprawa sieci` group and the existing `Naprawa WiFi`
     group as controls. Leave the new `WIFI-NO-INTERNET` and `LAN-REPAIR`
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
