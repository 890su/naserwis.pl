# Visual refinement and SEO validation — 26 October 2026

The owner requested a visual pass across the homepage and service pages, then
explicitly requested publication and the `seo-landing` checks. This is a targeted
update of the existing site, not a replacement landing page.

## Result

- Compact, shared guide links on the homepage and general service pages.
- Removed the redundant homepage visit-process section in all four languages.
- Centered the review heading, introduction, Google action, rating panel and
  carousel controls; review text remains left aligned.
- Review cards use consistent avatars, SVG stars and source links. Their height
  follows the selected review, including long reviews and manual scrolling.
- FAQ headings and questions share one content width. Service example cards
  no longer inherit the former colored outline, shadow and hover movement.
- Consistent form contact alignment, readable text widths and compact local
  service links in the footer.
- Existing prices, review text, enquiry delivery, URLs, metadata, canonical,
  hreflang and promotion boundaries remain protected by the existing checks.

## Reproduction and evidence

Artifacts are local and ignored by Git, under `reports/visual-seo-20261026/`
and `outputs/visual-release-20261026/`.

- `npm run guides:generate` rebuilds the current source and shared templates.
- `npm run check` checks all local HTML/assets, links, service ownership,
  schema/SEO fixtures, prices and forms.
- `npm test` checks the existing lead endpoint with simulated providers;
  it does not send a real customer enquiry.
- `npx --yes vnu-jar@26.10.12 --format json --skip-non-html public/`
  produced `reports/visual-seo-20261026/vnu.json`: zero HTML errors,
  248 informational/warning messages. Nu version: 26.10.12 (973e40b).
- Browser checks cover enquiry interaction, reading links, review navigation,
  reduced motion and restoring modal focus. Responsive captures cover the
  homepage, Wi-Fi and local business service templates at 320/768/1280/1920px.
- Production smoke verifies deployed pages, assets, redirects, robots and
  sitemap, and invalid API requests without sending real leads.
- Lighthouse 13.4.1 production runs use the default mobile/simulated profile,
  three runs per representative template; raw JSON/HTML and the median
  aggregation are stored alongside the exact invocation in the local report.

## Interpretation and retained constraints

This release applies `seo-landing` in fix-existing mode. It preserves the owner's
approved SVG icon system, consent banner, conversion tracking and functioning
forms rather than replacing them with a new minimal landing template. Measure
and disclose the existing script budget instead of claiming the skill's 15 KB
generation budget. Third-party tags remain consent gated.

Lighthouse is lab evidence, not field Core Web Vitals or WCAG certification.
JSON-LD parsing and existing schema checks do not establish Google rich-result
eligibility. No new rich-result or ranking claim is made. A fresh real enquiry
delivery and a complete manual WCAG audit are outside this visual release;
the existing endpoint is retained and its simulated delivery tests are run.

The preceding published revision, `1bf8f59bb75f4c86b9050b79aa973817ad8be97f`,
remains the rollback reference. The exact publication receipt, final results
and deployment identity are recorded locally after deployment.
