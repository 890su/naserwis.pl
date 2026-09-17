# Search-term to landing-page map — 2026-09-16

Scope: NaSerwis.pl only. This document maps real Google Ads search terms and
Search Console queries to user intent, existing landing pages and the staged
Google Ads structure. Live changes are recorded in
`live-account-change-log.md`.

## Implementation status — 2026-09-17

The site-side prerequisite is implemented and published from the repository:

- the 12 PL/RU/UK/EN service pages contain localized symptom, diagnostic or
  deliverable content without adding routes;
- `weak-wifi`, `no-internet`, `router-setup`, `lan-repair` and `lan-install`
  are the only accepted dynamic intent values;
- reviewed intent copy updates the hero, CTA and visible form topic, and a
  symptom selection opens the existing enquiry modal; unknown
  values cannot become HTML or attribution data;
- the selected intent is sent as a non-PII lead field and analytics dimension;
- canonical URLs, forms and all existing Google Ads conversion labels remain
  unchanged.

The bulk-upload package has been applied to the live account: 20 intent groups,
240 accepted phrase/exact keywords and 20 localized RSAs. All 20 groups are
paused. Google repeatedly rejected both match variants of three broad phrases;
they were replaced with more specific Wi-Fi service terms, and all six
replacement rows were accepted. Campaign negatives and the staged enable/pause
cutover remain pending.

## Evidence used

- Google Ads search-term report for 2026-08-17 through 2026-09-14:
  197 disclosed search terms, 342 impressions, 20 clicks, 94.15 PLN spend and
  0 conversions attributed to the disclosed terms.
- Google Search Console Web export for the last 28 days available in the
  project snapshot: 14 queries, 92 impressions and 0 clicks.
- Current Polish, Russian, Ukrainian and English NaSerwis service pages.

Google Ads does not disclose every search term. The absence of conversions in
this export does not prove that the account had no conversions in the same
period; it means no conversion was assigned to the disclosed rows used here.

## What the data says

| Intent cluster | Ads queries | Impressions | Clicks | Spend | Search Console impressions | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| LAN repair and cable faults | 6 | 13 | 2 | 16.00 PLN | 24 | Keep as a focused service group and strengthen `/naprawa-sieci/` |
| Weak Wi-Fi and coverage | 25 | 43 | 5 | 20.74 PLN | 0 | Create a focused group and a `weak-wifi` hero variant on `/naprawa-wifi/` |
| Wi-Fi not working / no internet | 61 | 103 | 5 | 22.11 PLN | 0 | Separate from coverage; exclude general and instruction-only queries |
| LAN installation and design | 8 | 11 | 1 | 2.98 PLN | 66 | Highest organic opportunity; strengthen `/montaz-sieci/` first |
| Router and Mesh setup | 10 | 18 | 1 | 2.98 PLN | 0 | Test as a narrow ad group on the Wi-Fi landing page |
| Connecting devices | 3 | 5 | 2 | 9.46 PLN | 0 | Treat as mixed/DIY intent; do not create a campaign or thin page |
| Computer repair | 6 | 12 | 0 | 0.00 PLN | 2 | Do not expand until a real service page and service scope exist |
| Provider outage | 6 | 29 | 1 | 8.00 PLN | 0 | Exclude from paid traffic; use only as informational SEO content |
| Speed test | 4 | 9 | 1 | 3.80 PLN | 0 | Exclude from paid traffic; keep on the weather/network utility |
| Equipment and shopping | 27 | 38 | 2 | 8.08 PLN | 0 | Add models, products and components to negatives |

At least 19.88 PLN was spent on clear non-service intent: provider lookup,
speed tests and equipment research. A further 9.46 PLN was spent on the
instructional query `jak połączyć komputer z internetem`. The four main service
clusters account for 61.83 PLN and 13 clicks, but none has enough conversion
evidence to justify separate campaigns or aggressive budget changes.

## Landing-page map

### 1. Wi-Fi page: two primary problems, one secondary service

Keep one indexable page per language:

- PL: `https://naserwis.pl/naprawa-wifi/`
- RU: `https://naserwis.pl/ru/naprawa-wifi/`
- UK: `https://naserwis.pl/uk/naprawa-wifi/`
- EN: `https://naserwis.pl/en/naprawa-wifi/`

Add three substantial sections to the shared page structure:

1. weak signal and incomplete coverage: walls, interference, channel planning,
   access-point placement, Mesh and measurement after the work;
2. connected but no internet: router, DHCP/DNS, device isolation, cable and
   provider-vs-local diagnosis;
3. router/Mesh setup: secure configuration, firmware, access points, guest
   network and handover.

The form must receive the selected intent as a hidden non-PII field and show it
as the preselected issue. Existing phone, form and messenger conversions stay
unchanged.

### 2. LAN repair page

Keep the current `/naprawa-sieci/` URL in each language. Add concrete symptoms
and deliverables for cable and LAN faults: damaged RJ45, wall socket, patch
panel, switch port, intermittent connection, line test, repair options and what
the technician confirms before pricing.

Do not create separate pages for `sieci komputerowe Pruszków` or every nearby
city. Add a useful service-area section and real local case evidence when it is
available. Pages that differ mainly by city name risk becoming doorway pages.

### 3. LAN installation page

Prioritise `/montaz-sieci/`. Search Console already shows 66 impressions around
LAN design, structured cabling, business networks and Warsaw-area installation.
Expand the page with the process and outputs: survey, design, cable category,
routes, sockets, rack/patch panel, measurement protocol, labelling,
documentation and examples for offices and homes.

### 4. Informational traffic

Keep outage checks and speed-test content on the existing weather/network page.
Its job is organic discovery and a soft diagnostic CTA, not paid acquisition.
Queries for provider names, public outages, speed tests, router models, tools
and components should remain excluded from paid service groups.

### 5. Computer repair

The live EN/UK structures contain `PC-LAPTOP-REPAIR`, but the site has no
dedicated service landing page. Choose one of two explicit paths before adding
traffic:

- confirm that NaSerwis offers the service, define scope and create a
  substantive multilingual page; or
- pause/exclude this theme and keep the site focused on network work.

## Dynamic headline design

Use a small allowlist of landing-page variants instead of inserting raw search
text into the page:

| `intent` value | Example Polish hero | Destination |
| --- | --- | --- |
| `weak-wifi` | `Słaby zasięg Wi-Fi? Znajdziemy przyczynę i poprawimy pokrycie` | Wi-Fi page |
| `no-internet` | `Wi-Fi jest, ale internet nie działa? Naprawimy połączenie` | Wi-Fi page |
| `router-setup` | `Konfiguracja routera i Mesh w Warszawie` | Wi-Fi page |
| `lan-repair` | `Awaria sieci LAN lub kabla? Szybka diagnostyka na miejscu` | LAN repair page |
| `lan-install` | `Projekt i montaż sieci LAN dla domu lub firmy` | LAN installation page |

Implementation rules:

- the normal server-rendered H1 remains the default and the clean URL remains
  canonical;
- the page reads only the allowlisted `intent` value and swaps a reviewed H1,
  supporting sentence, CTA label and form topic;
- never render a raw `{keyword}` value or a user search string into HTML;
- keep every variant on the same service and language URL, with no indexable
  duplicate page;
- store `intent`, campaign and ad-group identifiers with analytics events, but
  never send phone numbers, form text or other personal data in the URL.

Google Ads keyword insertion uses a keyword from the advertiser's ad group,
not necessarily the person's search term. It is therefore optional and should
only be tested inside tightly controlled phrase/exact groups with safe fallback
headlines. Static, intent-specific RSA headlines are the safer first version.

For the landing page, use only a reviewed allowlisted value. The staged import
uses that value directly in the final URL, for example `?intent=weak-wifi`, so
it does not depend on account-level suffix configuration. A reviewed custom
parameter such as `{_intent}=weak-wifi` with `intent={_intent}` in the final URL
suffix remains a valid later alternative. Keep Google auto-tagging and test the
combined URL before publishing any account change.

Official references:

- [Google Ads keyword insertion](https://support.google.com/google-ads/answer/2454041?hl=en-GB)
- [Google Ads ValueTrack parameters](https://support.google.com/google-ads/answer/6305348?hl=en)
- [Google Search spam policy: doorway abuse](https://developers.google.com/search/docs/essentials/spam-policies#doorway-abuse)

## Recommended account structure

Keep the current language campaigns. Add or rename ad groups inside them only
after the landing changes are ready:

- `WIFI-COVERAGE` → Wi-Fi page with `intent=weak-wifi`;
- `WIFI-NO-INTERNET` → Wi-Fi page with `intent=no-internet`;
- `ROUTER-SETUP` → Wi-Fi page with `intent=router-setup`;
- `LAN-REPAIR` → LAN repair page;
- `LAN-INSTALL` → LAN installation page.

Create another campaign only when it needs a separate budget, geography,
schedule or bidding strategy. Do not create one campaign per phrase. Keep
phrase and exact match as the controlled baseline; do not use broad match or AI
Max to compensate for missing structure while the disclosed terms still show
no conversions.

## Implementation order

1. Add negatives for provider names, outage-only terms, speed tests, equipment
   models, shopping/components and instruction-only queries. Review the 34
   zero-click terms marked `MANUAL-REVIEW` before deciding.
2. **Completed 2026-09-17:** expand the three existing landing pages in all four languages while keeping
   URLs, canonical tags, forms and conversion events stable.
3. **Completed 2026-09-17:** implement and test the allowlisted `intent` hero switch and hidden form
   topic. Invalid or absent values must show the normal page.
4. **Completed 2026-09-17, paused:** create the five intent-specific ad groups
   inside each existing language campaign with phrase/exact keywords.
5. **Completed 2026-09-17, paused:** add reviewed localized RSA headlines.
   Test keyword insertion only after the static version has clean search-term
   data.
6. Measure qualified enquiries and booked work by language, intent and service.
   CTR is a diagnostic metric, not the optimisation target.
7. Consider a separate router setup or computer repair page only after the
   service has enough qualified demand and genuinely distinct content.

## Acceptance criteria for the next implementation

- the clean URLs and canonical tags do not change;
- every language has the same intent coverage with native copy;
- invalid query parameters cannot become visible page text;
- form submissions and phone/messenger/chat events retain their current Google
  Ads and GA4 delivery;
- forms at the bottom of the pages remain available;
- no public outage, speed-test or equipment query is sent to a paid service ad
  group;
- after launch, search terms are reviewed twice weekly and results are judged
  by qualified lead cost.
