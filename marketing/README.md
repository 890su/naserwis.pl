# NaSerwis non-Polish quick acquisition pack

Scope: NaSerwis.pl only, Russian, Ukrainian and English. Polish and ITBIZ are
excluded. This pack does not enable Google Ads campaigns.

## How this complements the approved campaigns

The owner reports that manually created NaSerwis Google Ads campaigns passed
review. The repository drafts remain paused to avoid overwriting or duplicating
that live structure, which is not available in the currently signed-in browser
session. This pack adds owned/local profiles, permitted community posts and real
referral partners, all pointing directly to the matching localized page.

## 72-hour sequence

1. Publish one language-matched post per day on the real NaSerwis Google
   Business Profile. Use the matching `google_business_profile` URL from
   `non-pl-posts.csv`.
2. Publish the same service topic in relevant Warsaw RU/UK/EN Facebook or
   Telegram communities only where commercial posts are allowed. Use the
   channel-specific URL; do not mass-post or claim guaranteed response times.
3. Send the `local_partner` links to existing, real referral contacts such as
   property managers, relocation assistants and small-office administrators.
   Ask them to share only with people who requested IT help.
4. Reply in the visitor's language and direct them to the short modal form or
   phone number. Do not request personal details publicly in a group thread.
5. After 72 hours, compare qualified enquiries by `utm_source`, language and
   destination. Continue the service/language combinations producing real
   enquiries; replace weak copy one variable at a time.

## Files

- `non-pl-links.csv` — 48 tracked RU/UK/EN URLs across four landing-page intents
  and four distribution sources.
- `non-pl-posts.csv` — 27 localized post variants for Google Business Profile,
  Facebook and Telegram.
- `non-pl-pack.json` — machine-readable source used by regression tests.

Regenerate with `npm run outreach:build`. UTM attribution is stored and sent
with a successful lead only under the site's existing consent rules. The form,
conversion labels, SEO metadata, routes and Polish pages are unchanged.
