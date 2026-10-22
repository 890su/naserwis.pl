# Homepage release: readability, audience routing and audit fixes

Owner approval: 22 October 2026, apply the reviewed fixes and publish. Includes the preceding homepage readability and human-ai work in all four locales.

The homepage uses concise task choices, one visible set of three published rates and native pricing conditions, then a visible service heading with private/business disclosures. Business links use verified localized ITBIZ service destinations and open a new tab. The footer language column is removed, header language navigation stays. Main sections alternate white, gray, pale blue-gray and dark surfaces. Redundant/generic copy and unsupported price/response comparisons are removed; factual reviews, rates, billing/privacy language, conversion routing and all protected search metadata remain intact.

Audit fixes:
- Deduplicate the mobile enquiry icon's aria-hidden in its source generator. Nu/W3C: zero HTML errors on PL/RU/UK/EN.
- Give fields #758497 boundaries, preserving blue focus and red invalid states.
- Homepage-only CSS pruning reads all four homepages plus runtime JS and preserves dynamic attributes, keyframes/fonts/variables and the full consent/contact stylesheet. CSS is 101693 bytes versus 137877 at audit (26.2% smaller). Other page bundles keep their original CSS sources. The manifest still expands source tags for repeatable generation.
- New 800px AVIF/WebP derivatives bridge the 640–1200 gap. The first task illustration has high fetch priority, the second loads lazily, and the LED layer has AVIF sources, low priority and lazy loading. Original artwork and the LED interaction are retained. Rebuild derivatives with npm run images:generate.
- Skip redundant inline animation writes on pages already styled by the redesign; coalesce contact-layout updates around consent initialization with requestAnimationFrame. Form/measurement handlers still initialize immediately.
- Inline fallback constrains image, SVG and field widths when external CSS fails. All four homes remain within a 320px viewport in that failure mode.

Validation:
- npm run check: 41 HTML pages, asset/link checks, commercial SEO/schema guards, guides and Ads preservation.
- npm test: 12 cases passed, with mocked providers and no actual deliveries.
- Browser suite: 179 distinct scenarios, 178 initially passed and one consent-suppression failure was corrected and passed on focused rerun. The correction preserves more runtime CSS. A fresh browser audit then passed keyboard/focus/modal/privacy/content integrity checks in all four locales and normal/expanded/no-JS layouts at 320/768/1280/1920px. No real lead was sent.
- Content/asset regeneration is repeatable. New source and compiled assets are staged explicitly; unrelated research, mockups and font-source files stay outside this release.
- Lighthouse 13.4.1: artifacts and exact measured per-run values belong in outputs/publication-20261022. Production medians are measured after deploy; old local no-compression scores are not presented as comparable production benchmarks. They are lab measurements, not field INP/CWV or a WCAG certificate.

The only newly added build package is pinned PurgeCSS 7.0.2, with its selector parser overridden to patched 7.1.7; the source and runtime states are verified by the tests above. Sharp receives a patch update to 0.35.5 for the new derivatives. Existing Wrangler/Miniflare development-tool advisories remain outside this targeted runtime/UI change; they are not shipped in the static browser assets.

No unverified street address is invented for the existing LocalBusiness entity. Its current LocalBusiness/WebSite JSON-LD remains unchanged. Existing consent-gated third-party behavior and staged CSP policy remain intact.

Publication: commit/push main through the existing GitHub → Cloudflare Pages integration; verify matching deployment check, production smoke tests and live localized content. Deployment IDs, final commit and post-deploy results are recorded in ignored outputs/publication-20261022 artifacts and the task's final response.
