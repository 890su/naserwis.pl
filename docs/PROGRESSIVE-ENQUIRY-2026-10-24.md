# Progressive enquiries — 24 October 2026

Approved visual choice: in-page forms now use the hero's graphite background with light text and softened #dfe5ec input surfaces. Desktop retains a separate card on the right; below 1200px, the centered form (maximum 640px content width) shares a continuous background with the hero. The light compact modal is excluded. The generator marks in-page wrappers with `data-enquiry-panel`, and the technical privacy override inherits the panel's supporting-text variable while retaining its previous fallback for light forms. Desktop/tablet/mobile QA captures: `outputs/graphite-enquiry-20261024/`.

Latest owner correction: the shared button-opened modal now uses a compact, single-screen form, with immediately visible description and phone and optional name/address. Examples, request type and urgency remain exclusive to the in-page progressive forms. `compactQuickEnquiry` applies this modal consistently to all pages containing it. It uses the explicit `compact` delivery flow for optional names; review validation remains required. Focus trapping includes the optional-fields disclosure, and successful reset closes it.

Implemented locally for the homepage and all four service routes in PL/RU/UK/EN (20 pages). The in-page and modal forms share a description-first flow based on the existing 890.by `TicketForm.svelte` reference. Examples are localized and specific to each service. Selecting an example fills the description; typing reveals the details without moving focus. The visitor can choose fault/setup and urgency, enter a phone/email/Telegram contact and optionally disclose name/address fields.

On phones up to 760px, the existing top form moves directly after the hero description. Above that breakpoint it returns to the original right column. Values and handlers survive resizing. The service price sidebar stays in the content section. Removed the three CCTV section-jump links in all four locales; section IDs remain available to guide links.

Source: `scripts/staged-enquiry.mjs`, `scripts/apply-redesign.mjs`, `public/enquiry.js`, `public/redesign.css`. The normal `node scripts/generate-site.mjs` pipeline reproduces the changes. `public/script.js` submits the additional fields; `functions/api/contact.js` sanitizes and forwards them through the existing Telegram/Resend channels. Optional names apply to the explicit staged flow, with the existing review validation retained. Privacy notices, honeypot, Turnstile and consent-gated successful-lead conversions remain in place.

Validation:

- `npm test`: 13 passed, including provider-mocked delivery of optional name/address/type/urgency through both existing channels.
- `npm run check`: all static, local-link, SEO, CRO and guide guards passed for the 49-page site.
- Playwright enquiry/CCTV/CRO/measurement/home-readability suites: 159 passed in the combined run; the remaining exhaustive launcher scenario exceeded its original 30-second allowance and passed in 16.5 seconds when run alone. That scenario now has a bounded 90-second allowance for its four page/viewport combinations. All 160 scenarios passed across the combined run and isolated confirmation.
- Confirmed desktop/mobile screenshots in `outputs/enquiry-20261024/`; corrected the legacy two-column form rules to prevent the new blocks shrinking to half the rail width.
- Repeated generation preserved one copy of each form and passed the existing immutable SEO/Ads guards.

No production publication, credentials or real enquiry delivery were used. Local review server: `http://127.0.0.1:8851/`.

## Owner refinement, same day

The panel title is now the single localized “What happened?” heading; the textarea has an accessible name without a duplicate visible label. Examples use centered text, smooth vertical scrolling and edge fades. Per the explicit owner request, this animation and selected-example typing ignore reduced motion, with Pause/Resume and All examples retained. Selecting an example immediately reveals the second step and types the description; manual editing cancels typing, and early submission completes the selected text before validation/delivery.

The stacked layout now applies below 1200px. The same panel sits in a separate section directly after the complete hero, including its phone, before the service/task content. Wide layouts keep the original right column. Request-type options wrap naturally onto a second line when needed. Both request type and urgency use ordinary radio controls; urgency includes red/amber/green dots and the localized equivalents of Urgent / In the near future / No rush. New requests use the `soon` urgency value; the endpoint also accepts legacy `today` requests.

Validation after refinement: 13 unit tests, all static/SEO/CRO/link/guide guards, and all 50 enquiry scenarios passed across the main run and isolated confirmation. One scenario loaded during a local regeneration and was rerun successfully after generation settled. Coverage includes all 20 commercial pages, 390/1440px and the 768/900/1199/1200px boundaries, motion with reduced motion enabled, native radio layouts, manual editing and early submit. Desktop/tablet/mobile screenshots are in `outputs/enquiry-refinement-20261024/`.
