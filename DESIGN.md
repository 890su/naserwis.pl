---
name: NaSerwis
description: Variant B "Pomoc według zadania" (16 October 2026) applied over the technical-service implementation of 15 October 2026.
colors:
  action-blue: "#1d5bd0"
  action-hover: "#174bb0"
  ink: "#18212c"
  body: "#485462"
  secondary-text: "#5d6875"
  paper: "#fff"
  quiet-surface: "#f3f5f7"
  line: "#dde2e8"
  task-panel-line: "#c4ccd5"
  contact-surface: "#18212c"
  contact-field-fill: "#dfe5ec"
  contact-field-focus: "#e7ecf2"
  contact-muted: "#c9d2dc"
  contact-link: "#bad2ff"
  field-line: "#c4ccd5"
  outline-hover: "#e8effc"
  intent-active: "#e8effc"
  dark-support: "#c9d2dc"
  dark-divider: "#3a4757"
  district-line: "#3a4757"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(34px, 3.4vw, 50px)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-.035em"
  service-display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(29px, 2.7vw, 40px)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-.025em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-.025em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "27px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-.025em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  button:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  field-label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
rounded:
  district: "999px"
  field: "6px"
  button: "6px"
  price-inset: "8px"
  content-card: "8px"
  rail-task: "8px"
  circle: "50%"
spacing:
  action-gap: "12px"
  task-gap: "20px"
  rail-gap: "22px"
  nav-gap: "28px"
  service-gap: "40px"
  desktop-section: "56px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "{colors.action-hover}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.action-blue}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "12px 22px"
  button-outline-hover:
    backgroundColor: "{colors.outline-hover}"
  enquiry-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "9px 12px"
  task-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.rail-task}"
    padding: "0 22px"
  setup-task-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.rail-task}"
    padding: "0 22px"
  contact-rail:
    backgroundColor: "{colors.contact-surface}"
    rounded: "{rounded.rail-task}"
    padding: "20px"
  district-tag:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.district}"
---

# Design System: NaSerwis

## Progressive enquiry — 24 October 2026

The final homepage contact section (PL: “Skontaktuj się z technikiem”) always uses one column, including wide desktop layouts: introduction, phone and form stack within a centered 640px content width. The container adds 24px side gutters (20px on phones). Keep the form flush with this column rather than adding a second inset. Center phone/WhatsApp/Telegram rows in both homepage in-page forms, including wrapped rows.

**Approved graphite variant.** All in-page enquiry panels use the hero's graphite #18212c background, white headings/labels, #c9d2dc supporting text and #bad2ff links. Input surfaces are softened to #dfe5ec (#e7ecf2 on focus), with dark #18212c input text. Native request-type radios use the dark control scheme; urgency rings use lighter red/amber/green accents against graphite. The compact modal keeps its light presentation. From 1200px, the top panel remains a separate right-column card with 24px padding and 8px corners. Below 1200px, the enquiry section continues the hero's background without a white seam or nested card; its form is centered at a maximum content width of 640px inside a 688px container including side padding. The phone stays above it, and the pricing sidebar remains separate in the light content section. This supersedes the older light contact-surface descriptions below.

The button-opened contact modal is an explicit exception: preserve its original “Send an enquiry” heading and dialog treatment, with a single screen containing problem description and telephone. Name and address are optional behind the native disclosure. Do not show examples, request type, urgency or progressive steps in this modal. Apply this compact version to every page that contains the shared modal, including utility pages. Keep focus trapping, error recovery, delivery and conversion tracking.

In-page homepage and service-page enquiry panels use the single heading “What happened?” in the active locale. The textarea retains an accessible name without repeating a visible label. Examples scroll vertically, with centered text and soft edge fades. Selecting one immediately reveals step two while its description types into the field. Manual editing cancels the typing; an early submit completes the selected description before sending it. The second part contains optional broken/setup and urgency choices, a required phone/email/Telegram contact, and a native disclosure for optional name and address. Type choices share a row when they fit. Use native radio choices rather than bordered button cards; urgency uses red/amber/green radio outlines and matching selected centers and the localized labels Urgent / In the near future / No rush. Preserve existing form IDs, privacy notices, delivery confirmation and successful-lead conversion semantics.

The examples pause on hover, focus, touch/manual scrolling, when offscreen or when the document is hidden. Supply Pause/Resume and All examples controls. The owner explicitly requested that example scrolling and selected-text typing continue even with reduced motion (24 October refinement). Duplicate visual examples are always outside the accessibility tree and tab order.

Below 1200px, move the same top enquiry panel into its own section immediately after the complete hero (title, description, actions and phone), before the service/task content. Restore its original right column from 1200px. The hero phone must stay above the form in stacked layouts. Never clone the form: values, IDs and handlers must survive resizing. Keep the service price sidebar in the content section. Use the existing Manrope typography, blue action color, 6px fields and 8px panel radius. Field boundaries retain the established accessible #758497 treatment.


## Variant B — "Pomoc według zadania" (16 October 2026)

Mobile navigation refinement (18 October 2026): below 1200px, the header shows PL / RU / UA / EN as quiet text links in place of the top call button. Links have no border or filled background; the active language uses bold blue text and a 2px underline. Preserve each page's localized destination and guide reading-level behavior. The burger menu has no language block. Services uses a native, initially closed details/summary disclosure, with the same 17px bold type as the other main sections and a stroke chevron. Keep the three service links inside it; contact actions stay below the navigation, with vertical scrolling available on short screens.

The owner chose variant B from the two research-based mocks (`outputs/redesign-2026-10-15/v4-variants/b-zadanie.html`) and asked to rework the published design into it without changing content or SEO. Where this section and older paragraphs below disagree, this section wins.

- **Homepage first screen (22 October 2026).** Reuse the service introduction via `hero-service-style`: graphite background, white H1, muted light description, an underlined describe-problem link opening the existing enquiry modal, and a phone action with the blue icon, large number and localized call label. Retain the homepage's H1, description and service-area microdata. Keep the fixed first-visit language suggestion clear of the heading without layout shifts.
- **Task panels.** "Coś nie działa?" and "Chcę skonfigurować lub zamontować" are white panels with a 1px `#c4ccd5` border and an equipment photo on top (16:9), then heading and divider-separated links copied from the localized service catalogue. Heading icons were removed on 22 October; icons remain in each service list row. The quick-contact form sits in a slightly darker third `#e8edf2` column with white fields. Other content below the introduction stays unchanged.
- **Conditions strip.** Directly below: "you pay for the agreed scope" plus the three published rates with their exact localized labels from the price table, and a link to the full pricing conditions. The rates are read from the page, never typed.
- **Palette and shape.** Graphite ink `#18212c`, body `#485462`, one action blue `#1d5bd0` (hover `#174bb0`), neutral surface `#f3f5f7`, lines `#dde2e8`. Buttons 6px, panels and cards 8px. No mint/wash task tints, no decorative accent bars above section titles, no button lift on hover.
- **Rhythm.** Steps use outlined ink numerals; trust tiles, reviews and why-us items are flat with a 2px ink top rule. Final call and footer are graphite; district tags are outlined pills on the dark footer.
- **Service and utility pages** keep the dark title/description header with the large phone and the relocated form rail; only the palette and radii above changed.
- **Imagery (owner-approved replacement, 18 Oct).** Fault panel: generated router with a red Internet indicator and a phone displaying the localized offline message (PL/RU/UK/EN). Setup panel: generated hand connecting an Ethernet cable to a double RJ45 wall socket, shared across languages. Responsive AVIF/WebP derivatives use the `20261018` version under `public/assets/redesign/`; prompts and reference provenance are in `home-tasks-20261018.json`. Only the indicator blinks, using a clipped generated off-state frame. A 44px Power button in the bottom-left corner switches the indicator on (blinking) or off (dark) and remembers the choice across reloads. The icon has localized accessible labels and pressed state. Offscreen/hidden pages pause the animation; the owner explicitly requested blinking even with reduced motion for this LED only; an unavailable overlay leaves the original static red image. The images are illustrative, not documentary service photos. Earlier tester assets and their attribution records are retained as history.
- **Owner refinements (16 Oct, second round).** Homepage H1 in all four languages: "Wi-Fi i sieci w Warszawie / Montaż lub naprawa z dojazdem", "Wi-Fi и сети в Варшаве / Монтаж или ремонт с выездом", "Wi-Fi та мережі у Варшаві / Монтаж або ремонт з виїздом", "Wi-Fi and networks in Warsaw / Installation or repair on site" ("or" chosen by the owner for clarity; source `scripts/home-service-copy.mjs`; reviewed hashes in `check-cro.mjs`, approved exceptions in `check-redesign-release.mjs`; titles and descriptions unchanged). The second line wraps as its own balanced block. Footer uses four columns from 1100px (two on tablets, one on phones). Reviews sit in two columns from 960px — carousel left, Google button and the rating widget right — by CSS grid only, so review markup and routing are untouched. The burger menu is generated by `scripts/apply-header-navigation.mjs` from the desktop header: same items and order (Home, Services with the three service links, Prices, Guides, Contact), same active state, language chips and a primary call button with the shared phone icon. "Opisz problem" buttons outside forms use `href="#contact"` plus `data-contact-modal`, so `contact-ui.js` opens the existing pop-up form instead of scrolling; the pop-up uses the shared palette and hides its uppercase kicker.
- **Icons (third round).** One stroke icon family marks services: Wi-Fi, router/AP/Mesh, LAN installation, RJ45 repair, connection testing and home devices, in 44px (catalogue), 34px (task panels) and 32px (burger menu) soft-blue squares. Contact channels use the brand glyphs already shipped in the floating launcher (phone, WhatsApp, Telegram, form): every enquiry form ends with a phone · WhatsApp · Telegram row, and the burger menu has a Contact block with the call button plus WhatsApp, Telegram and the pop-up form, labels copied from the page's localized launcher. Site chat stays in the launcher because only its own button can open it.
- **Preserved.** Titles, H1 (except the approved homepage H1s), meta, canonical/hreflang, JSON-LD, prices, factual copy, reviews markup and the star flow (1–3 internal feedback form, 4–5 Google), form IDs, consent, launcher and the 88px mobile hero offset that keeps the floating language banner off the H1.

## Navigation and utility page refinement

Homepage readability refinement (22 October 2026): keep the existing dark introduction and task/photo/form panels, then show one pricing summary, the visit process, two concise detail rows, original reviews, a compact contact section and guides. Native `<details>` retain the billing conditions, service catalogue, problem scenarios, about and business-handoff text in the initial HTML on desktop and mobile. Homepage section padding uses 40px on desktop and 28px on mobile; body-section headings use 28px / 25px. The bottom contact area uses a copy/form grid on desktop, retains `hero-form`, `final-form`, review behavior and all validation/consent hooks. Preserve H1, search/social metadata, canonical/hreflang and JSON-LD exactly. `scripts/homepage-readability.mjs` renders and restores the presentation so content generators remain repeatable.

Homepage copy refinement (22 October 2026): homepage title and search/social descriptions omit "home/domestic" in all four locales; keep the existing visible heading, introduction and service-specific scope text. The generic four-item trust strip (Experience / Jobs / Contact / Clear pricing) is removed, so the visit process is followed directly by the service catalogue. LocalBusiness descriptions mirror the revised localized homepage descriptions; canonical/hreflang and service-page titles/descriptions remain intact.

Privacy notice refinement (22 October 2026): use Manrope, graphite text, a quiet `#f3f5f7` surface, 8px panel corners and 6px buttons. The initial notice has exactly two vertically stacked choices: blue "Accept all" first and white "Necessary only" second, with the same source and keyboard order. Remove the initial settings button; preserve privacy/cookie links and the footer's category settings dialog. On mobile, copy appears above two full-width buttons; on desktop, copy and the stacked actions sit alongside each other. Consent storage, defaults and category behavior remain unchanged.

The desktop menu uses a single 28px gap with no extra item margins. Weather and internet diagnostics are discovered through the four localized Poradnik indexes; their existing canonical URLs remain unchanged and Poradnik is active on those pages.

Weather uses the shared navy title surface, Manrope typography, cobalt actions and light data panels with 14px radii. Measurements use dividers rather than nested decorative tiles. Data, API hooks, attribution, privacy copy and diagnostic controls retain their existing contracts. Diagnostic results remain hidden until the visitor runs the test.

Framed content needs internal space: trust tiles use 22px (18px mobile), service scenario cards 24px (20px mobile), and selectable intent rows 20px (16px horizontal on mobile). Flat editorial rows can retain zero horizontal padding where they have no surrounding frame or colored interaction surface.

## Overview

The implemented direction is a clear local technical service with direct contact and two entries: a fault or planned setup. White surfaces, dark blue headings, cobalt actions, fine dividers and restrained task surfaces carry that direction. These descriptions record the existing implementation; they do not introduce an additional creative approval.

This document describes `public/redesign.css`, layered over the retained site CSS and DOM. The owner selected the second displayed composition for the light homepage and the fourth for the dark service title and phone. The implementation provides 16 commercial compositions across PL, RU, UK and EN, with the shared skin applied to all 41 HTML pages. After reviewing the separate local preview, the owner explicitly authorized committing, pushing and publishing the approved implementation in `site_naserwis.pl` through the existing GitHub `main` / Cloudflare Pages integration. The local preview remains separate. This document records authorization, not completed deployment or production performance certification; existing component-review receipt and formal build-state records are not changed by it.

`scripts/apply-redesign.mjs` reapplies the design to current HTML. `scripts/apply-technical-seo.mjs` integrates that step and retains `@font-face` while bundling one stylesheet. Before content generation, `scripts/generate-site.mjs` restores the service `final-form` so it survives regeneration. `scripts/check-redesign-release.mjs` guards all 41 pages against pre-redesign commit `c1be176` and checks that protected contact/review/consent JavaScript and API files remain unchanged.

**Key Characteristics:**

- Direct telephone and enquiry actions.
- Shared dark homepage/service introduction above light content and task panels.
- Flat sections, thin dividers and selectively rounded task/contact surfaces.
- Local font files and technically illustrative equipment imagery.

## Colors

The frontmatter records reusable colors found in the new CSS. The CSS remains the implementation source; aliases such as `--accent` and `--rd-blue` share the same action color rather than defining separate brand accents.

### Primary

- **Action blue:** primary actions, contact details, link feedback, selected navigation and keyboard outlines. Primary button hover uses the deeper action shade.
- **Dark blue ink:** headings, important prices and the service/final-call backgrounds.

### Neutral

- **Paper:** principal page and form surfaces.
- **Body and secondary text:** supporting copy, labels and footer copy.
- **Quiet surface and line:** section separation, review invitations, tables and rails.
- **Task wash and task mint:** the fault and planned-setup task groups. Mint is a local task distinction, not a second global action color.
- **Field line:** the compact enquiry input border.
- **Dark support and dark divider:** readable service-banner supporting text and separation around the phone action.
- **District surface:** retained service-area tags.
- **Outline hover and intent active:** state surfaces already implemented for outlined actions and intent selections.

**The Action Rule.** Keep cobalt associated with actionable contact, navigation and selection feedback; retain dark ink for the reading hierarchy.

## Typography

Manrope is used for display, body, navigation and forms, with Arial and sans-serif fallbacks. Two static files are self-hosted: `public/assets/redesign/manrope-400.woff2` (400; 30,368 bytes) and `public/assets/redesign/manrope-700.woff2` (700; 30,724 bytes), converted from the same source static fonts used in the preview. The current `@font-face` declarations map those files to requested ranges 400–600 and 700–800; the CSS requests weights through 800. This is the actual file/range arrangement, not evidence of additional individual font files or a variable font.

The desktop homepage display, service display, section headline, task title and base body roles are recorded above. Homepage supporting copy uses (18px) with (1.6) line height; service supporting copy uses (17px) with (1.65) line height and a (74ch) maximum. General home section introductions use (70ch). Navigation uses (15px) and requested weight (600). Prices use tabular numerals where the price-value selector applies.

At the (1199px) breakpoint the homepage heading is (38px). At (760px) it becomes (34px), service titles (30px), section titles (29px), homepage supporting copy (16px), and enquiry inputs (16px). Heading text balances where supported. Do not replace the inherited commercial H1 text to fit a particular line break.

## Layout

The common container has a (1440px) maximum and horizontal padding of (40px), reduced to (26px) at (1199px), then (20px) at (760px). The header is sticky, white and divided from the page by a thin line. At widths from (1200px), its grid is `1fr auto 1fr`, centering navigation independently of logo and utility widths. Header minimum height is (76px), becoming (66px) at (760px). Existing mobile menu, contact dock and language behavior remain part of the inherited interface.

The desktop homepage hero is a (51% / 49%) text/photo split with a (420px) minimum content height. The overview below contains two equal task groups and a (340px) contact/prices rail, separated by (22px). The rail reduces to (300px) at (1199px); at (900px), the overview becomes one column and the contact rail internally splits `1.2fr 1fr`. The final mobile rules give the hero text (88px) top padding, then a full-width (230px) photo below it.

Service pages use a dark introduction with `minmax(0,1fr) 355px` title/phone columns and a (42px) gap. Below, the content grid is `minmax(0,1fr) 340px` with a (40px) gap. At (1199px) the content rail becomes (300px), then (280px) at (900px). The service introduction already stacks at (900px); the service content and homepage task pair stack at (760px). The phone separator changes from a left border to a top border in the stacked introduction.

Regular content sections use vertical (56px) padding, becoming (36px) on mobile. Process steps use three columns on desktop and one at (760px). Trust signals keep two mobile columns. Contact forms retain a two-column field grid with message, notices, alerts and submit action spanning both columns; the rail itself stacks at (760px).

## Elevation & Depth

The replacement skin removes shadows from the header, buttons, task-related content, review cards, forms and service sidebar. Depth comes from white versus quiet/tinted surfaces, thin borders and the dark introduction. This statement applies to the new layer; inherited controls such as the circular contact launcher keep their existing styling and behavior unless explicitly overridden.

**The Flat Surface Rule.** Use tonal grouping and dividers for these implemented surfaces. Do not reintroduce lifted card shadows into their replacement styles.

Motion is restrained: buttons transition background color and transform over (.2s ease); the primary hover lifts by (-1px). Global focus-visible uses a (3px) cobalt outline with (4px) offset. The reduced-motion media rule removes animations and transitions and makes scrolling immediate throughout the redesigned body. Preserve the existing circular launcher motion contract and its reduced-motion handling.

## Shapes

Task groups and contact rails use the largest recurring corner radius. Review cards, intent clusters, price tables and the lower form use the content-card radius; inset prices use the price-inset radius. Buttons and inputs have smaller dedicated radii. District tags are subtly rounded. Icons for task categories, telephone and steps sit inside circles.

Long-form service items, benefits, FAQ rows, intent options and information boxes are flat rows with divider edges rather than individually rounded cards. Do not treat every section as a card.

## Components

### Buttons and links

Primary and outlined actions share an inline-flex layout, centered label/icon alignment, (12px) gap, (48px) minimum height and the padding recorded above. Primary uses cobalt/white and a thin cobalt border; outline uses white/cobalt. Mobile hero actions use (13px) text and (11px 13px) padding while retaining the minimum height. Rail submit actions fill the available width and use a (44px) minimum height. The service introduction's retained enquiry link is a transparent, underlined action with (36px) minimum height; it is not another filled button.

### Task groups and content rows

The homepage task pair distinguishes a fault from planned setup with wash and mint surfaces. Each group contains a heading/icon and divider-separated links with a right arrow. Link hover colors and underlines the heading. These are working links copied from the original localized service catalogue, including enquiry intent hooks, rather than decorative rows.

Intent options use a transparent divided row and a soft blue active/hover fill. Preserve `data-intent-select`, `data-contact-modal`, `aria-pressed` and the inherited event contract. Visual wrappers must not intercept or replace selection behavior.

### Enquiry fields and contact rails

Fields use white fill, a single thin field-line border, dedicated field radius, inherited font and (9px 12px) padding. Inputs have a (40px) minimum height, rising to (44px) on mobile; the textarea starts at (70px) and resizes vertically. Labels and privacy/next-step copy remain visible, while the rail hides the existing separate field-help element. Global keyboard focus outlines remain in force. Error announcements, required attributes, field names and validation come from the retained forms; no replacement error or disabled style is introduced by this CSS.

The build moves the existing service `final-form` into the relevant rail and retains its IDs, message/phone fields, validation, live alert and intent hooks. Homepage `hero-form` remains the quick-contact contract. Preserve unique IDs, original endpoint and consent/measurement behavior. The separate local QA server deliberately responds to contact submissions with “Local QA: no delivery”; the main site's existing delivery contract is retained.

### Navigation and contact

Navigation is text-led, with dark labels and cobalt active indicators/underlines. Language utilities and mobile controls retain their original interactions. The service phone is a large, direct `tel:` link with a circular cobalt icon and short localized call label. It separates from title copy with a line and stacks according to the layout rules.

### Reviews, prices and service districts

Reviews use bordered white cards; pricing uses calm table/inset surfaces and dark tabular values. Retain the factual review text, published rates and conditions. Preserve the existing star flow: 1–3 opens the internal feedback form; 4–5 goes to Google. District tags and the full inherited district list remain in the footer.

### Assets and provenance

The homepage photo is an AI-generated illustration of a router and laptop, not a documentary service visit. Its independent source plate is `assets/plates/hero-photo.png`; the exact generation prompt is `.impeccable/hero-photo-v2.prompt.txt`. The composition reference and a hardware-geometry reference informed generation; `.impeccable/references/archer-c64-front.jpg` records the device reference. The selected scene shows four antennas, an unplugged router and indicators off, with no claimed test result.

Shipping derivatives are `public/assets/redesign/home-network-{720,1440}.{avif,webp}`. Every derivative has an adjacent `.json` prompt/timestamp provenance sidecar. The picture element supplies AVIF with WebP fallback, intrinsic dimensions and localized illustrative alt text. Font origins are recorded in `public/assets/redesign/font-origin.json` from Google Fonts CSS and fonts.gstatic.com; the main site loads the locally converted WOFF2 files with no external runtime font requests. Keep provenance with derived assets.

## Do's and Don'ts

### Do:

- Do extend the actual CSS palette and geometry recorded here when working on the main site.
- Do preserve four-language routes, factual content, SEO metadata, canonical/hreflang, H1, structured data, prices, reviews and districts.
- Do preserve form IDs, field names, intent data attributes, contact launcher, consent and measurement contracts while moving visual wrappers.
- Do keep keyboard focus visible and honor reduced motion.
- Do describe the equipment photo as illustrative and retain all four shipping provenance sidecars.

### Don't:

- Don't infer new services, hardware-repair promises, guarantees, ratings or case-study evidence from the visual treatment.
- Don't treat the separate local preview's mock delivery behavior as the main site's delivery contract.
- Don't equate these documentation files with a component-review receipt, completed build gate, final review verdict, completed deployment or production PageSpeed certification.
- Don't replace retained acquisition behavior with visually similar inert controls.

Owner follow-up (22 October 2026): the homepage pricing disclosure contains conditions only; the three published rates appear once above it. Omit its redundant table, heading and top divider. Use neutral LAN/device names and homepage introductions in PL/RU/UK/EN. Add a matching “for companies and offices” list entry in the setup panel linking to the localized ITBIZ services page, with ITBIZ.PL as a quiet destination caption. The footer now has three desktop columns and no language column on any page; preserve header language links and head hreflang alternates.

Navigation/footer refinement (24 October 2026): use the short “Dla domu” / “Dla biznesu” labels in both header dropdowns and mobile disclosures, with equivalent RU/UK/EN wording. The business dropdown reuses the five existing localized ITBIZ menu links, an ITBIZ.PL caption and the existing external-link stroke icon. The footer now has four desktop columns: contact, service area, home services and business services; two below 1100px and one below 601px. Retain all 14 districts as compact wrapping text with 13px type, no tag outlines, and the existing #c9d2dc support color. ITBIZ captions reuse #9aa6b4 at 12px. Keep business links opening in a new tab with rel=noopener.

Enquiry interaction refinement (24 October 2026): keep full-width example rows
and their hover/keyboard treatment. Only the inline text spans receive pointer
events within the native scroller; the outer examples region preserves full-row
mouse highlighting and selection while letting side-space gestures reach page
scrolling. No Pause link; retain All examples and existing automatic movement
until manual scrolling takes over. Below 1200px center the service-form contact
channels. At 760px and below hide the service hero phone and show the same phone
block beneath the form, matching the homepage. Keep the form before this block
when moving it between desktop and mobile slots.

Audience refinements (22 October 2026): show the catalogue heading once above exactly two disclosures, for private customers and organisations. Keep the detailed NaSerwis catalogue/scenarios/about copy inside the private disclosure; remove the repeated catalogue heading. The business disclosure explains the ITBIZ destination/new-tab behavior and shows five localized direct service links with external-link stroke icons. Every ITBIZ handoff uses target=_blank and rel=noopener. Keep one pricing-disclosure label and no internal billing heading/table. Separate the white process and reviews with a pale blue-gray (#e8eef5) full-width services/audience section; prices and guides use the existing gray wash. Preserve the dark intro/contact and white task chooser.

Approved audit fixes (22 October 2026): normal form-field boundaries use #758497, retaining existing focus/error colors. Keep consent and contact runtime styles intact when pruning homepage CSS. The first task photo has high fetch priority; the second and optional LED frame load lazily, with an 800px candidate and AVIF frame variants. A small inline width fallback keeps content usable when external CSS fails. Publication is authorized; validation is recorded in docs/homepage-release-2026-10-22.md.
