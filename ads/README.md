# Google Ads build pack

> **Current operating constraint (updated 2026-09-05):** the owner reports that
> manually created NaSerwis campaigns passed Google review. Do not import these
> repository drafts over that live structure or create duplicate campaigns.
> Approval of existing entities does not guarantee approval after edits; review
> statuses again after every material ad, keyword or destination change.

For the owner-approved NaSerwis-only RU/UK/EN acquisition work, use
`non-pl-existing-campaign-optimization.md` for the existing approved campaigns
and the complementary owned/community/referral pack in `../marketing/`. Both
exclude Polish and ITBIZ and do not change these paused Search drafts.

All campaigns and entities in this folder are deliberately **paused**. Do not
import or enable them until advertiser verification, consent/conversion QA,
legal identity and budget approval are complete.

## Files

- `campaigns.csv` — 12 separately controlled Search campaigns: four languages
  times core Warsaw, farther Warsaw and outside Warsaw.
- `launch-campaigns.csv` — the four configured core campaigns. Import them
  paused; after QA, keep PL paused and enable RU, UK and EN.
- `geo-targets.csv` — district/city targets and proposed starting location bid
  adjustments. Official Google geo criterion IDs are included where available.
- `keywords.csv` — phrase and exact keywords mapped only to existing landing
  pages.
- `responsive-search-ads.csv` — one paused RSA asset set per campaign/ad group;
  text is validated against the 30/90 character limits.
- `search-ru-sitelinks.csv` — six campaign-level Russian sitelinks prepared for
  the existing live `Search RU Сети Варшава` campaign. They point only to RU
  service pages, prices, the contact form and reviews on NaSerwis.pl. The
  weather/network SEO utility is intentionally excluded from paid traffic.
- `negative-keywords.csv` — language-specific exclusions to review before use.
- `non-pl-core-ad-groups.csv`, `non-pl-core-keywords.csv` and
  `non-pl-core-responsive-search-ads.csv` — bulk-upload content used for the
  existing `SRCH-EN-A-CORE` and `SRCH-UK-A-CORE` shells.
- `non-pl-core-negative-list-en.txt` and
  `non-pl-core-negative-list-uk.txt` — phrase-match lines for the shared
  `NEG-EN-SERVICE` and `NEG-UK-SERVICE` lists. The Google Ads web importer did
  not accept a campaign-negative CSV, so these are pasted into shared lists in
  the UI and applied to one matching campaign each.
- `live-account-change-log.md` — verified live-account changes and remaining
  launch gates. RU is excluded from this import because the account already has
  an active manually created Russian campaign.
- `measurement.md` — conversion, consent and UTM implementation contract.

Regenerate the CSV and negative-list source files with `npm run ads:build`.

## Import notes

The CSVs are a reviewed build source, not a one-click live launch. In Google Ads
Editor, import campaign settings first, add approved daily budgets and max CPCs, then geo
targets, keywords and ads. Keep every imported entity paused through final QA.

Location targeting must use **Presence: people in or regularly in the targeted
location**, not presence or interest. Sadyba is not available as a standalone
Google geo criterion in the current target table; resolve it as a confirmed
postal-code set or an approximately 3 km radius in the UI. Do not guess the
radius centre from a technician's private address.

Start with the proposed modifiers only after confirming the real dispatch point
and travel costs. The separate `B-WARSAW-FAR` and `C-OUTSIDE` campaigns allow a
whole distance band to be paused without affecting the core.

The draft uses Manual CPC so district-level bid adjustments remain directly
controllable. Google Smart Bidding strategies do not support manual location bid
adjustments; if the account later moves to conversion/value bidding, retain the
separate zone campaigns for hard budget and pause controls and let Google use
location as an auction-time signal.

References: [Google Ads bid adjustments](https://support.google.com/google-ads/answer/2732132)
and [Manual CPC bidding](https://support.google.com/google-ads/answer/2390250).

## Initial operating rules

1. Search only; Search Partners and Display expansion off.
2. Phrase and exact match only for launch.
3. One language per campaign, with its matching landing page and ad copy.
4. Computer/laptop repair stays in `PC-LAPTOP-REPAIR` so its higher-volume
   demand can be measured separately from Wi-Fi and LAN work.
5. Outside-Warsaw campaigns remain paused until core economics are proven.
6. Search-term review daily for seven days, then at least twice weekly.
7. Optimise to qualified/booked/paid work after offline stages are available,
   not to raw form starts or button clicks.

## Approved campaign budgets

Core Warsaw only:

- PL: 30 PLN/day, default max CPC 4 PLN, paused;
- RU: 10 PLN/day, default max CPC 3 PLN, enabled after QA;
- UK: 10 PLN/day, default max CPC 3 PLN, enabled after QA;
- EN: 10 PLN/day, default max CPC 3 PLN, enabled after QA.

The desired active total is 30 PLN/day, approximately 912 PLN per 30.4-day
billing month. If PL is later enabled without pausing the other languages, the
configured total becomes 60 PLN/day. Google may spend up to twice an individual
campaign's average daily budget on a high-traffic day while applying the monthly
charging limit. Far-Warsaw and outside-Warsaw templates are not funded.
