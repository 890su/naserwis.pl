# NaSerwis.pl — Google Ads Search implementation plan

Status date: 2026-08-23

Approved core budgets: PL 30 PLN/day and paused; RU, UK and EN 10 PLN/day each,
to be enabled after production QA. Desired active total: 30 PLN/day. Far and
outside zones remain paused and unfunded.

## Scope

Search campaigns for the existing PL, RU, UK and EN landing pages only:

- general on-site IT service;
- computer and laptop diagnostics/repair offered on the main page;
- Wi-Fi/router/Mesh diagnostics and repair;
- LAN/structured cabling/RJ45/RACK installation;
- LAN, cabling and CCTV repair.

## Campaign structure

Prepare three geographic templates for each language (12 campaigns total):

- `SRCH-{LANG}-A-CORE`: Ursynow, Natolin, Wilanow, Mokotow and Sadyba;
- `SRCH-{LANG}-B-WARSAW-FAR`: Srodmiescie, Ochota, Wola, Ursus,
  Praga-Polnoc, Praga-Poludnie and Wawer;
- `SRCH-{LANG}-C-OUTSIDE`: Piaseczno, Konstancin-Jeziorna and Grodzisk
  Mazowiecki, paused by default.

Each campaign contains five ad groups: `WIFI-REPAIR`, `LAN-INSTALL`,
`LAN-CCTV-REPAIR`, `PC-LAPTOP-REPAIR` and `IT-GENERAL`. Budgets are not shared between languages.
Location setting: presence only. Search only; Display and Search Partners off at
launch. Start with phrase and exact match. Use Manual CPC for the initial
district-level bid-control phase; if the account later moves to Smart Bidding,
keep geographic zones in separate campaigns because manual location modifiers
are not supported by conversion/value Smart Bidding.

## Implementation checklist

- [x] Audit all 16 landing pages and the live site.
- [x] Verify supported languages and Google geo-target availability.
- [x] Open and inspect the Google Ads account.
- [x] Complete Google advertiser verification.
- [x] Enable Chrome file uploads for the Google Ads bulk-upload workflow.
- [x] Confirm controller legal name, legal/postal address, NIP/REGON if
  applicable, and the privacy contact address.
- [x] Add PL/RU/UK/EN privacy and cookie pages.
- [x] Add a multilingual consent banner and persistent consent settings.
- [x] Redesign the multilingual consent centre and all eight legal pages with
  accessible close controls, balanced accept/reject/customise actions,
  responsive layouts and language navigation; production deployment pending.
- [x] Default Google consent signals to denied before loading measurement tags.
- [x] Add Article 13 notices under all lead forms.
- [x] Add separate review/publication consent handling.
- [x] Remove the currently non-functional review file upload.
- [x] Send a dedicated conversion event only after a successful API response.
- [x] Track call, WhatsApp and Telegram clicks as secondary actions.
- [x] Remove the currently empty GTM container and prevent Chatwoot from bypassing consent.
- [x] Reconcile free-estimate/service-visit wording and RJ45 pricing.
- [x] Verify all 16 landing pages, legal links and consent prerequisites.
- [x] Deploy the compliance update to Cloudflare Pages and verify all eight
  privacy/cookie URLs on `naserwis.pl`.
- [ ] Browser-test a successful and failed production form submission.
- [ ] Configure the production Turnstile site/secret keys and verify spam
  rejection before paid traffic.
- [ ] Confirm whether a phone/form exchange only requests a quote or can conclude
  a paid contract remotely; if contracts can be concluded remotely or during a
  home visit, add consumer information, complaint rules, withdrawal form and an
  explicit early-service request/acknowledgement on a durable medium.
- [ ] Obtain current 28/90-day GA4 and GSC exports.
- [x] Run Keyword Planner historical-volume research by language for Warsaw.
- [ ] Run spend/click forecasts after the initial budget is approved.
- [x] Build campaigns, ads, assets, negative lists and URL tracking while paused.
- [x] Create four core Search campaigns and 20 ad groups in Google Ads; all
  campaigns remain paused.
- [ ] Resolve the Google Ads third-party consumer technical support policy:
  current consumer/home repair, connectivity and IT-support offers are not
  eligible. A compliant launch requires services and landing pages that are
  exclusively B2B, or a different eligible offer.
- [ ] Import keywords and responsive search ads only after the policy-safe offer
  and destinations are approved. The first preview was not applied.
- [ ] QA conversion and consent signals with Tag Assistant.
- [ ] Launch core campaigns and review search terms daily for the first week.

## Live implementation status

Cloudflare deployment `67ce31f0` was published on 2026-08-23. Google Ads bulk
upload successfully created campaigns `SRCH-{PL,RU,UK,EN}-A-CORE` and their 20
ad groups, with all four campaigns paused. Keyword and ad imports are blocked by
Google's third-party consumer technical support policy and were intentionally
not applied. No campaign is active and no advertising spend has started.

## Required business inputs

- [x] Business form: Polish `działalność nierejestrowana` operated by a natural
  person; NaSerwis.pl is the service/brand name, not a separate legal entity.
- [x] Data controller: Ihar Shestsiuk; correspondence address: ul. F.
  Płaskowickiej 46 m. 12, 02-778 Warszawa.
- NIP only if one is actually assigned/required (for example due to VAT, cash
  register or applicable KSeF use); REGON is not assumed.
- Actual dispatch point and maximum acceptable travel time.
- Service/call hours and same-day/24-hour response capability.
- Average paid order value, gross margin and lead-to-paid-job rate.
- [x] Campaign budgets: PL 30 PLN/day paused; RU/UK/EN 10 PLN/day each enabled
  after QA (active total approximately 912 PLN per 30.4-day billing month).
- Confirmation whether reviews, names and uploaded media may be published.

## Success measurement

Primary conversions: successful lead form, qualified tracked call, confirmed
chat lead and imported qualified/booked/paid-job stages. Secondary actions:
phone, WhatsApp and Telegram clicks. Optimisation is based on qualified and paid
jobs by language, service and geographic zone, not on form starts or CTR alone.
