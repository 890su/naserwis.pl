# NaSerwis RU/UK/EN existing-campaign optimization

Status: implemented for the paused EN/UK core campaign shells on 2026-09-05.
Scope is NaSerwis.pl only; Polish and ITBIZ are excluded. The existing active
Russian campaign was deliberately left unchanged to avoid duplicate traffic.

The live result, accepted row counts, policy exclusions and launch gates are in
`live-account-change-log.md`. Do not create parallel campaigns or activate the
new EN/UK campaigns without a separate budget decision.

## Fastest safe sequence

1. Export only active/approved NaSerwis campaigns, ad groups, ads, keywords,
   negative keywords, locations, languages, budgets, bidding strategies and
   campaign conversion goals.
2. Keep only RU, UK and EN in this optimization pass. Map every ad to the same
   language landing page: `/ru/`, `/uk/` or `/en/` and their three service URLs.
3. Verify location mode is presence — people in or regularly in the serviced
   Warsaw area. Review the user-location report before adding districts.
4. Separate each language by service intent: Wi-Fi, LAN installation, network or
   CCTV repair, computer help and general IT. Start new coverage with phrase and
   exact keywords; use search-term evidence before broadening.
5. Apply the matching RU/UK/EN negative list from `negative-keywords.csv`. Add
   irrelevant live search terms daily for the first seven days.
6. Keep successful form submission as the sole primary website conversion.
   Phone, WhatsApp, Telegram and chat remain observation actions until their
   qualified-lead rate is known. Do not optimize bidding to button clicks.
7. Use the campaign-level URL suffix from `measurement.md`, with a correct
   `{_lang}` custom parameter. Verify one successful lead event and no PII in
   measurement before increasing budget.
8. Reallocate budget by qualified enquiries, not CTR. Do not set a language
   split before current spend, search terms and lead quality are exported.

## First 72 hours after changes

- Twice daily: review disapprovals, limited statuses, search terms, user
  locations, spend and real enquiries.
- Pause irrelevant terms immediately; do not react to a single low CTR if the
  query is commercially relevant.
- Record language, service, qualified/unqualified result and source for every
  enquiry. Increase only the combinations producing serviceable Warsaw leads.
- Keep an unchanged copy of the pre-change export for rollback.

Every edited entity can be reviewed again by Google even when the original
campaign was approved. This plan does not reinterpret approval as a guarantee.
