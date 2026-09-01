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
- `chatwoot_open` — a click that opens the chat widget.
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

## URL tracking

Use a campaign-level final URL suffix such as:

`utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_id={campaignid}&utm_adgroup={adgroupid}&utm_term={keyword}&utm_content={creative}&matchtype={matchtype}&device={device}&network={network}&lang={_lang}`

Define `{_lang}` as a campaign custom parameter. The browser stores the
campaign parameters and click identifiers in session storage only after
marketing consent, and includes them in a successfully submitted lead for
source reconciliation. Verify redirects and analytics attribution after every
tracking-template change.
