# ITBIZ notification relay

The owner requested that ITBIZ enquiries reach the same Telegram bot and chat as
NaSerwis. `POST /api/itbiz-notification` forwards an authenticated, explicitly
labelled ITBIZ message through the existing `TELEGRAM_BOT_TOKEN` and
`TELEGRAM_CHAT_ID` bindings. Neither credential is returned to ITBIZ.

The private `ITBIZ_NOTIFICATION_TOKEN` binding must match ITBIZ's
`TELEGRAM_RELAY_TOKEN`. No token belongs in Git, browser assets, logs or URLs.
The endpoint accepts only bounded ITBIZ messages with UUID references, requires
the bearer credential, disables caching/indexing and acknowledges only Telegram
API acceptance. Ordinary NaSerwis contact handling and pages are unchanged.

ITBIZ retains the lead in its own database and owns the retry queue. The relay
does not query, export or forward past NaSerwis requests. Tests mock Telegram;
a clearly labelled live ITBIZ test is performed only during the authorised
connection release.
