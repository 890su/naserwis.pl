# NaSerwis

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Private customers in Warsaw and nearby towns who need help with Wi-Fi, routers, Mesh, domestic LAN cabling or network faults. They may arrive with an urgent symptom or plan wiring before renovation. PL, RU, UK and EN are supported.

## Product Purpose

Help a resident identify the relevant service and contact NaSerwis by phone, messenger, chat or enquiry form to agree scope, cost and a possible visit time.

## Positioning

An on-site computer and technical service for private customers, with current published services focused on household network infrastructure. The first screen must communicate technical diagnosis and hands-on service, not residential interiors, cleaning or home decoration. Work and cost are agreed before starting. Business/office customers are directed to ITBIZ.PL.

## Operating Context

Customers describe symptoms and location, and may share equipment details or photographs through an appropriate contact channel. No network passwords should be requested through these forms. Diagnosis precedes equipment recommendations.

## Capabilities and Constraints

- Existing static HTML/CSS/JS site on the existing Cloudflare Pages Git integration; preserve routes, redirects, canonical/hreflang, structured data and indexability.
- Preserve all four languages, current factual copy, services, prices, form delivery contracts, consent rules and conversion tracking.
- Existing phone, WhatsApp, Telegram, website chat and enquiry form remain functional. Preserve the circular contact launcher and its tested motion behavior.
- Header navigation has centered Home / Services / Prices / Guides / Contact and phone/language utilities on desktop; mobile has a menu and contact actions.
- Guides have two reading levels at one canonical URL, with language-aware navigation.
- Weather and internet diagnostics belong to Guides / Poradnik, retain their established URLs and use the same visual system as service pages.
- The owner has explicitly authorized committing, pushing and publishing the approved redesign through the existing GitHub `main` / Cloudflare Pages integration. Record deployment completion and production performance only when verified.

## Brand Commitments

Keep the NaSerwis name. The owner explicitly requested replacement of the incumbent presentation-like visual appearance. The incumbent palette and layout are evidence, not a binding visual direction.

## Evidence on Hand

Existing service copy, transparent pricing terms and customer review excerpts are in public HTML. They may be preserved, not embellished. There are no supplied original service photographs, staff portraits, certificates or new customer case studies. Do not fabricate ratings, certifications, response-time guarantees, customer counts or documentary photographs.

## Product Principles

- Make the relevant service and next action clear quickly.
- State scope and price conditions honestly.
- Preserve working acquisition, contact and reading flows through the redesign.
- Keep equivalent quality across languages and device widths.

## Confirmed Decisions

On 24 October 2026 the owner requested broader homepage link-preview metadata:
remove domestic/private-customer limitations and include Wi-Fi, LAN, network and
internet faults, plus CCTV diagnosis/configuration/installation. Apply equivalent
titles/descriptions in PL/RU/UK/EN and align the shared business description;
preserve visible H1/content, canonical/hreflang, factual scope and pricing. Publish
the metadata and then perform a read-only seo-landing audit of the live site.

The owner subsequently explicitly requested publication of the final progressive
forms, graphite layout, compact popup and CCTV link cleanup on 24 October 2026.
This authorizes committing and pushing the approved implementation to the existing
GitHub main / Cloudflare Pages integration and verifying the resulting live site.

After reviewing the comparison, the owner selected the graphite form variant on 24 October 2026. Apply it only to in-page homepage/service forms, with slightly shaded input backgrounds. Keep a separate right-side graphite card on large screens; on small/medium screens visually join the form to the hero background and center it with a maximum width, leaving space on both sides. The compact popup remains light and single-screen. This is a local implementation request, without a new production publication instruction.

Later on 24 October 2026 the owner explicitly separated the button-opened contact dialog from the progressive in-page forms. Restore the dialog's original single-screen presentation, keeping only required problem description and phone plus optional name/address behind a disclosure, in all four locales. The two-step forms on the pages remain in place.

On 24 October 2026 the owner requested the 890.by progressive enquiry pattern for the homepage and service pages in all four languages. Start with a problem description and scrolling topic-specific examples; reveal broken/setup, urgency and contact fields on typing or example selection. Name and address are optional, behind a disclosure modeled on 890.by's name/organization control. Remove the three CCTV section-jump links in every locale. A subsequent refinement replaces the panel title with one localized “What happened?” heading, centers scrolling examples and animates selected-text typing even with reduced motion. Below 1200px, put the same form directly after the complete hero including its phone, before the service/task blocks; retain the right column on wider screens. Type options share a line when space allows. Urgency uses wrapping radio choices with colored outlines and matching selected centers: Urgent / In the near future / No rush. This request covers local implementation; it does not request a new production publication.

On 24 October 2026 the owner requested one combined CCTV service page covering fault diagnosis, configuration, repair of the installation, camera installation and expansion. It uses the existing four-language service-page design and agreed visit rates. Device compatibility and the condition of the installation must be checked first; circuit-board repair and damaged-drive data recovery are not advertised. Business-system enquiries link to the existing localized ITBIZ CCTV service page. This request authorizes building the page; a new production publication has not yet been requested.

Later on 24 October the owner expanded this page to include analogue cameras and hybrid analogue/IP systems. Supported video formats, resolutions and channel modes depend on the specific recorder; the page must not imply universal compatibility. The related maintenance guide covers IP, analogue and hybrid systems in PL/RU/UK/EN, using the existing two reading levels, contextual service links and a sample inspection schedule explicitly distinguished from mandatory or manufacturer-specific intervals.

The owner then explicitly requested publication of the combined CCTV service and maintenance guide in all four languages through the existing GitHub main / Cloudflare Pages integration. This authorizes committing, pushing and deployment; completion must be verified against the live pages.

On 15 October 2026 the owner confirmed the audience, purpose and preservation constraints above, and chose to review visual image concepts before implementation.

Later on 15 October the owner rejected the residential/interior direction: NaSerwis must be immediately recognizable as an on-site computer and technical service. Replace the initial visual concepts; do not infer new service capabilities or hardware repair promises from this positioning correction.

The owner then requested research into similar technical-service websites, a written specification grounded in those examples, and exactly two visual variants. Equipment imagery must use actual Internet photographs as image-generation inputs and be checked against them for construction, cabling and plausible instrument states. Research, technical references and acceptance rules are recorded in docs/REDESIGN-TZ-RESEARCH-2026-10-15.md.

The owner subsequently selected the second displayed composition for the light homepage and the fourth for the compact dark service title/phone layout, requested an isolated copy, and directly requested an HTML preview after the component-review handoff. That separate preview remains in redesign-preview-2026-10-15. The approved implementation provides 16 commercial layouts across four languages and a shared skin on 41 HTML pages. Existing H1/SEO, factual content, prices, reviews, the 1–3-star internal / 4–5-star Google flow and service districts remain binding preservation constraints.

After reviewing the preview, the owner explicitly authorized committing, pushing and publishing it in the main site_naserwis.pl repository through the existing GitHub main branch and Cloudflare Pages integration. The main source tree is intentionally being updated under that authorization. The main site's contact delivery, protected JavaScript and API contracts remain unchanged; mock-only contact submissions apply to the separate local QA server.

The design is reapplied during the normal content/technical-SEO build, preserving the relocated service form and self-hosted Manrope WOFF2 declarations. scripts/check-redesign-release.mjs guards the 41 pages against pre-redesign commit c1be176. Publication authorization does not fabricate a component-review receipt or change formal build-state records. Deployment completion and production PageSpeed scores have not been established by these documentation updates.

On 16 October 2026 the owner chose variant B, "Pomoc według zadania", from the two research-based mocks and asked to rework the published design into it. SEO-relevant content and optimisation must not change materially; the change is visual. The review block's routing is binding: ratings 1–3 open the internal feedback form, 4–5 go to Google reviews. Service and utility pages keep the dark header with title, description and the large phone number, adjusted only for visual harmony. The work is on branch `redesign-variant-b`; publication is a separate approval.
