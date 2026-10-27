# Concise homepage and service content

The owner requested less filler, a natural reading sequence, visible essential
information and lower reading effort. The pass uses copy-editing, CRO and
Impeccable's distill guidance, preserving the site's established visual system.

## Reading sequence

| Visitor question | Where it is answered |
| --- | --- |
| Can you help with my problem? | Specific hero copy and task links for Wi-Fi, RJ45/LAN and CCTV |
| Do you serve my location and customer type? | One homepage audience/area/language note; local business links remain optional |
| What will the visit cost? | Three ordered rates and visible conditions |
| Why is the first rate lower? | Nearby, short, agreed and successfully completed job condition directly below the rates |
| Could the price increase? | Agreed billing method, equipment, materials, extra work and partial-hour conditions |
| Can I trust the service? | Existing attributed Google reviews, with original text and ratings preserved |
| What do I do next? | Existing contextual form, phone and compact request dialog |

The homepage drops the repeated catalogue, symptoms grid and benefit blocks.
The three informational disclosures are removed, rather than expanded into a
long wall of text. #available-services and #services still resolve. The upper
form, optional form extras, price order, light closing contact, review controls
and canonical URLs remain.

Wi-Fi, LAN repair and installation pages retain one short scope list, useful
limitations, preparation and two questions with visible answers. Duplicate
process/deliverable panels and household scenario cards are removed. The three
Wi-Fi intent actions and paid-intent URL behavior remain. CCTV has six short
visible symptom rows, installation scope, compatibility/exclusions, recording
preservation advice, preparation and two questions. Existing business pages
were already concise; their shared billing and review wording stays consistent.

The internal editorial review checked clarity, scanning effort, price/fulfilment
objections and preservation of search intent. No new response times, guarantees,
clients or performance/conversion claims were introduced.

## Implementation and evidence

- Shared copy is in `scripts/home-service-copy.mjs` and `scripts/cctv-copy.mjs`.
- `scripts/compact-home.mjs` builds the visible homepage and reconstructs the
  input model only in the generator; removed copy is not shipped as hidden HTML.
- Repeated full and technical generation accepted the new structure.
- Stable title/description/H1/canonical/hreflang fields for the twelve general
  service pages were compared with the prior release. Only the Service offer
  descriptions and matching FAQ schema changed; review evidence is in
  `outputs/concise-content-20261027/seo-review.json`. The original SEO fixture is
  unchanged; reviewed hashes in the guard reflect the intentional schema edits.
- Content counts are in `reports/concise-content-20261027/copy-counts.json`.
  They count the initial main HTML including old collapsed copy, excluding
  forms and reviews, not visible reading time. Polish homepage copy falls from
  501 to 212 words; the Russian version from 498 to 207. General service pages
  lose roughly 45–49% and CCTV about one third by this definition.
- Final commands/results and publication evidence are recorded in the local
  report directory. No ranking or conversion uplift is inferred from editing.
