# Homepage alignment and closing contact section

Owner request: make homepage text alignment coherent, especially on desktop,
and replace the second full enquiry form with a light closing section and two
actions.

- Use a common 1280px outer grid for the homepage header, hero, tasks, prices,
  service disclosures, reviews, closing contact, guide and footer. Preserve the
  centered review heading and left-aligned review prose.
- Align paired task headings at their inner left edge. Share their image,
  heading and link tracks using CSS subgrid above 760px so different title
  lengths do not offset the first service rows.
- Match the size and row spacing of general and business footer service links.
- Replace the lower form in PL/RU/UK/EN with a #f3f5f7 section: a localized
  question, one sentence, a telephone link and a request action opening the
  existing compact contact dialog. Keep #contact and the upper progressive form.
- Keep this in the shared homepage generator; a second generation successfully
  accepted the already-converted section without recreating the duplicate form.

Validation: `npm run check` passed for 73 HTML pages. All 20
`tests/browser/home-readability.spec.mjs` scenarios passed across four locales
at 320/390/768/1440px. The 16 `mobile contact and SEO` scenarios in
`tests/browser/cro.spec.mjs` passed. These verify modal opening/closing, preserved
contacts, no duplicate lower form and no horizontal overflow. No real leads sent.

Browser inspection checked the shared grid at 1920px (all seven primary
containers 1280px, same x coordinate), and desktop/mobile rendered views. Local
screenshots and the publication receipt live in
`outputs/home-alignment-20261027/`. These checks do not imply new Lighthouse or
field performance measurements.
