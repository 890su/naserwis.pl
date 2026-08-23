# Measurement and consent contract

## Consent Mode v2

Before Google tags load, the site sends denied defaults for
`analytics_storage`, `ad_storage`, `ad_user_data` and `ad_personalization`.
Visitors can accept, reject or customise optional categories and can reopen the
panel from the footer. Chatwoot loads only after support/chat consent.

## Events already emitted by the website

- `generate_lead` and `naserwis_lead_submit` — only after a successful lead API
  response; no form PII is added to `dataLayer`.
- `naserwis_contact_click` — telephone, WhatsApp and Telegram click, with a
  non-PII channel value. Treat as secondary until qualified.
- `naserwis_review_submit` — only after a successful review API response.

## Google Ads conversion setup

Create/import `generate_lead` as the initial primary conversion only after Tag
Assistant confirms one event per successful submission and zero events for a
failed submission. Keep contact clicks as secondary/observation conversions.

Recommended later offline stages keyed through a privacy-reviewed lead ID:

1. qualified lead;
2. appointment booked;
3. paid job, with actual value and currency PLN.

Do not upload names, message text, phone numbers or email addresses as event
parameters. Enhanced conversions require a separate legal and technical review.

## URL tracking

Use a campaign-level final URL suffix such as:

`utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&lang={_lang}&zone={_zone}`

Define `{_lang}` and `{_zone}` as campaign custom parameters. Verify redirects
and analytics attribution before launch.
