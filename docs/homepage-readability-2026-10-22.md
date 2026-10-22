# Homepage readability — 22 October 2026

The owner reported excessive text and inconsistent spacing, and asked for a clearer, shorter page with limited SEO risk. The main layout changes cover the four localized homepages; the established brand, service content and top task/photo panels are retained. Shared footer language columns are removed sitewide, and translated ITBIZ handoff URLs are corrected.

## Findings and resulting flow

The six services appeared twice, prices appeared twice, and billing, general promises and audience information occupied separate large sections. The page now follows: introduction → choose a task/contact form → indicative prices → visit process → optional details → original reviews → contact form → guides.

Three native disclosures contain the original detailed material: pricing conditions; private-customer services, scenarios and service information; business services on ITBIZ. Their text is already in the initial HTML, identical across desktop/mobile, with no click-dependent fetching. The repeated rate table and its heading have been removed from the pricing disclosure; billing conditions, VAT note, links and business separation remain available. All three price alternatives remain visible before opening details. The main contact section has one introduction and a compact form; real review excerpts and 1–3 private / 4–5 Google routing are preserved.

The lower page uses a consistent 40px desktop / 28px mobile vertical padding, a common heading hierarchy and a desktop copy/form grid. A native pricing summary preserves the existing consent-gated pricing event. Existing smooth scrolling opens ancestor disclosures before measuring a linked section, preserving catalogue fragment links.

## Measured result and validation

Polish homepage, necessary-only consent, Chrome/Chromium, 390px viewport: visible main-content words **792 → 412** (48% fewer); full-page height **10,299 → 6,001px** (42% shorter). These are measurements of the default collapsed view, not a claim that half the HTML copy was deleted. Detailed service and billing conditions remain behind disclosures; only the repeated rate table is removed.

- `npm run check` passes across 41 HTML pages.
- Search/social metadata, H1, canonical/hreflang and JSON-LD are unchanged; original billing/scope paragraphs are preserved.
- 38 browser scenarios pass: 320/390/768/1440px in PL/RU/UK/EN, keyboard/pointer disclosures, fragment links, mobile contact paths, service destinations, measurement and review routing.
- Eight visual/metadata checks cover desktop/mobile in all locales. One inspection round and one confirmation round were used. Physical mobile hardware and Safari were not available.
- Full content regeneration is stable for all four homepages and a representative service page.
- The manual design scan reported advisory findings only.

Source: `scripts/homepage-readability.mjs`, integrated into `apply-redesign.mjs` and `generate-site.mjs`; homepage styles are scoped in `public/redesign.css`. `public/script.js` adds native pricing-disclosure measurement and reveals fragment targets' ancestor details.

Impeccable's distill workflow guided consolidation and progressive disclosure. Human-ai's cleanup/proofreading principles guided short action labels and removal of a repeated contact introduction; detailed factual service copy was retained rather than broadly paraphrased. No new claims, reviews, prices or SEO keywords were invented.

Google states that it has no preferred word count and permits accordions for equivalent mobile content: [people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing). This reduces unnecessary content loss; unchanged rankings cannot be guaranteed without post-publication search data.

## Owner follow-up

Removed the repeated rate table and redundant heading from the pricing disclosure, including the now-unnecessary rule and gap. Kept one set of three rates visible above it and all four billing paragraphs below it. Generator restoration reconstructs its intermediate input from those visible rates, keeping subsequent builds repeatable without publishing hidden duplicates.

Homepage introductions and the LAN/device catalogue labels and descriptions use neutral network terminology in all four locales. A matching list entry in the setup panel directs companies and offices to ITBIZ. The detailed service pages retain their established audience and metadata. The existing detailed business handoff now also uses the correct translated URLs: PL /uslugi/, RU /ru/uslugi/, UK /uk/poslugy/, EN /en/services/. All four destinations returned HTTP 200 with matching localized service titles on 22 October 2026.

Removed footer language columns on all 41 pages and adjusted the footer to three desktop columns. Header language navigation and head hreflang alternates remain intact. The 38 browser cases passed (two were rerun after an overlapping generator temporarily served intermediate HTML); static checks and repeat generation passed. Desktop/mobile visuals were inspected, including Russian business routing and expanded pricing conditions.

## Audience structure and section surfaces

The service area has a visible heading (the original catalogue heading) and exactly two native disclosures: private customers and organisations. The catalogue no longer repeats that heading inside its disclosure. Private service links, factual scope, problem scenarios and original why-us material remain in the private-customer body. The business body names ITBIZ and explains the new-tab behavior, then links to five actual service pages: outages, LAN outlet repair, LAN cabling, diagnostics and ongoing IT support. All 20 localized destinations returned HTTP 200. All business links, including the top task entry and detailed service-page handoffs, use target=_blank and rel=noopener. Billing has one disclosure label with no internal heading or duplicate table.

Homepage surfaces alternate dark intro → white task chooser → light gray prices → white process → pale blue-gray audience/services → white reviews → dark contact → light gray guides. This groups each section visibly without changing the existing palette or spacing scale. All 38 browser scenarios, static checks, exact metadata/schema comparisons and repeat generation passed. Desktop and mobile closed/private/business states were inspected in a batched visual round.

Google's [external-link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable#external-links) supports relevant, contextual external links. The anchors use actual localized service names and ordinary href values; there is no unrequested nofollow, keyword stuffing or promise about ranking changes.

The owner subsequently approved applying the audit fixes and publishing this work. See docs/homepage-release-2026-10-22.md for the release scope and verification.
