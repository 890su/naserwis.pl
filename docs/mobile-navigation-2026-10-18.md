# Mobile navigation refinement — 18 October 2026

- All 32 pages with the shared navigation now show the four existing language links in the mobile header instead of the top phone button. The current language is bold, blue and underlined; links have no border or filled background. Existing localized destinations and guide reading-level behavior are retained.
- Services uses a native, initially closed `details` disclosure. Its summary matches the size and weight of the other main sections, with a chevron that rotates when open. The three existing service links and contact actions remain available.
- Source: `scripts/apply-header-navigation.mjs` and `public/redesign.css`; generated HTML and content-hashed CSS are refreshed through `scripts/apply-technical-seo.mjs`.

Validation: `npm run check` passed for all 41 HTML pages. Sixteen Chromium/Chrome browser scenarios passed across PL/RU/UK/EN, 320×568 and 390×844 viewports, including pointer and keyboard disclosure, short-screen scrolling, service navigation, language switching, guide reading-level preservation and contact/conversion behavior. Desktop and mobile screenshots were reviewed. No physical iPhone/Safari or Android testing was available.

The older `check-redesign-release.mjs` guard fails because the already committed `public/script.js` differs from its pre-redesign baseline `c1be176`. This task does not modify that runtime: the current source matches HEAD. The guard verifies all 41 pages' SEO, headings, structured data, forms, reviews and districts before reaching that existing runtime mismatch.

The owner authorized commit, push and production deployment on 18 October 2026. Publication verification is recorded separately in `outputs/mobile-navigation-publication.json`.
