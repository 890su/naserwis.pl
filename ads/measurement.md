# Measurement and consent contract

## Consent Mode v2

Before Google tags load, the site sends denied defaults for
`analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization`.
Visitors can accept, reject or customise optional categories and can reopen the
panel from the footer. Chatwoot loads only after support/chat consent.

## Events emitted by the website

- `generate_lead` and `naserwis_lead_submit` — only after a successful lead API
  response; the Google Ads event includes a unique lead ID, but no form PII is
  added to `dataLayer`.
- `naserwis_contact_click`, plus `phone_click`, `whatsapp_click` and
  `telegram_click` — contact-link clicks with non-PII channel and placement.
- `chatwoot_open` — after the SDK opens the chat widget, not when a visitor merely
  requests chat consent. Consent rejection and SDK timeout never count as opens.
- `naserwis_review_submit` — only after a successful review API response.

## Google Ads conversion setup

The website sends the following Google Ads conversions directly:

| Website event | Google Ads action | Bidding role |
| --- | --- | --- |
| successful form response | `Lead — formularz wysłany` | primary |
| telephone click | `Klik — telefon` | observation |
| WhatsApp click | `Klik — WhatsApp` | observation |
| Telegram click | `Klik — Telegram` | observation |
| Chatwoot open | `Otwarcie — czat` | observation |

The `Kontakt` goal is not an account-default or campaign-specific goal, so its
four actions do not influence bidding. Do not add it to campaign goals until
lead quality has been reviewed. Confirm one event per successful submission and
zero events for failed submissions before relying on automated bidding.

Recommended later offline stages keyed through a privacy-reviewed lead ID:

1. qualified lead;
2. appointment booked;
3. paid job, with actual value and currency PLN.

Do not upload names, message text, phone numbers or email addresses as event
parameters. Enhanced conversions require a separate legal and technical review.

## CRO v1 diagnostics (2026-09-04)

The following events require analytics consent and are not new Ads conversions:

| Event | Meaning |
| --- | --- |
| `naserwis_cta_view` | Each CTA becomes visible once per page load |
| `naserwis_cta_click` | In-page link to the contact form |
| `naserwis_contact_open` | Visitor expands channel choices |
| `naserwis_form_start` | First edit in that form, after consent |
| `naserwis_form_validation_error` | Local validation blocks submission |
| `naserwis_form_error` | Server rejection or transport failure |
| `naserwis_form_success` | Successful API response with a lead ID |
| `naserwis_chat_error` | Requested chat cannot load/open |

Parameters are allowlisted: `placement`, `action`, `form_id`, `field`, `reason`,
plus language/service/path, `release=cro-v1`, and a viewport-based device label.
No field values, names, telephone numbers, message text or raw query strings.
New `sticky` and `form` placements also identify existing contact-link events.
Existing event names, conversion labels and Consent Mode transport semantics are
preserved; the website does not edit account bidding goals or campaign status.

The subsequent `20260904-round2` visual revision restores the circular contact
widget and removes the mobile strip. New sticky impressions/clicks are therefore
no longer emitted; retain that value when interpreting earlier release data.

No retroactive diagnostic events are replayed after consent. Consent selection
therefore affects the observed funnel; report its coverage, not just aggregate
conversion rate. For GA4 breakdowns, register the required custom dimensions in
a separately authorized analytics task. Do not mark micro-events as primary
Ads conversions. Compare qualified leads, not chat/button opens.

## URL tracking

Use a campaign-level final URL suffix such as:

`utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_id={campaignid}&utm_adgroup={adgroupid}&utm_term={keyword}&utm_content={creative}&matchtype={matchtype}&device={device}&network={network}&lang={_lang}`

Define `{_lang}` as a campaign custom parameter. The browser stores the
campaign parameters and click identifiers in session storage only after
marketing consent, and includes them in a successfully submitted lead for
source reconciliation. Verify redirects and analytics attribution after every
tracking-template change.
