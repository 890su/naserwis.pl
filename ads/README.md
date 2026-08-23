# Google Ads build pack

> **Policy blocker (2026-08-23): do not import or enable the keyword and ad
> drafts in this directory.** Google Ads prohibits third-party online and
> offline technical support for consumer technology, including connectivity,
> installations, maintenance, software installation and hardware repair. Only
> the four paused campaign shells and their ad groups were created in Google
> Ads. A future paid-search build must use a genuinely B2B-only offer and
> destinations before new keywords or ads are submitted for review.

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
- `negative-keywords.csv` — language-specific exclusions to review before use.
- `measurement.md` — conversion, consent and UTM implementation contract.

Regenerate the CSVs with `npm run ads:build`.

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
