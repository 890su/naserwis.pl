---
name: NaSerwis
description: Implemented technical-service design approved for the main site's publication on 15 October 2026.
colors:
  action-blue: "#005ff5"
  action-hover: "#004ac2"
  ink: "#0b1931"
  body: "#42516a"
  secondary-text: "#56647b"
  paper: "#fff"
  quiet-surface: "#f5f8fc"
  line: "#dfe6ef"
  task-wash: "#f3f8ff"
  task-mint: "#f0faf7"
  field-line: "#c9d5e4"
  outline-hover: "#edf4ff"
  intent-active: "#e9f1ff"
  dark-support: "#d8e3f4"
  dark-divider: "#4b5b72"
  district-surface: "#e7eef7"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(34px, 3.15vw, 47px)"
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
  district: "5px"
  field: "6px"
  button: "8px"
  price-inset: "10px"
  content-card: "12px"
  rail-task: "14px"
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
    backgroundColor: "{colors.task-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.rail-task}"
    padding: "28px 24px"
  setup-task-card:
    backgroundColor: "{colors.task-mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.rail-task}"
    padding: "28px 24px"
  contact-rail:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.rail-task}"
    padding: "20px"
  district-tag:
    backgroundColor: "{colors.district-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.district}"
---

# Design System: NaSerwis

## Overview

The implemented direction is a clear local technical service with direct contact and two entries: a fault or planned setup. White surfaces, dark blue headings, cobalt actions, fine dividers and restrained task surfaces carry that direction. These descriptions record the existing implementation; they do not introduce an additional creative approval.

This document describes `public/redesign.css`, layered over the retained site CSS and DOM. The owner selected the second displayed composition for the light homepage and the fourth for the dark service title and phone. The implementation provides 16 commercial compositions across PL, RU, UK and EN, with the shared skin applied to all 41 HTML pages. After reviewing the separate local preview, the owner explicitly authorized committing, pushing and publishing the approved implementation in `site_naserwis.pl` through the existing GitHub `main` / Cloudflare Pages integration. The local preview remains separate. This document records authorization, not completed deployment or production performance certification; existing component-review receipt and formal build-state records are not changed by it.

`scripts/apply-redesign.mjs` reapplies the design to current HTML. `scripts/apply-technical-seo.mjs` integrates that step and retains `@font-face` while bundling one stylesheet. Before content generation, `scripts/generate-site.mjs` restores the service `final-form` so it survives regeneration. `scripts/check-redesign-release.mjs` guards all 41 pages against pre-redesign commit `c1be176` and checks that protected contact/review/consent JavaScript and API files remain unchanged.

**Key Characteristics:**

- Direct telephone and enquiry actions.
- Light homepage and compact dark service introduction.
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
