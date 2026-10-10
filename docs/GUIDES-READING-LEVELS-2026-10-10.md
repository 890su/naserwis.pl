# Home guides with two reading levels

Implemented on 10 October 2026 for NaSerwis private home infrastructure only.

Two topics, each translated into PL/RU/UK/EN:

- `poradnik/jak-wzmocnic-sygnal-wifi-w-domu/`: cable to stationary clients and
  access points/Mesh, testing Powerline, wireless placement and obstacle ratings.
- `poradnik/siec-lan-w-domu-przed-remontem/`: home LAN planning, two independent
  runs, category/shield selection, accessible cable routes, termination and testing.

Each article has a complete plain-language explanation and a complete technical
explanation. Shared diagrams and reference tables keep factual recommendations
consistent. Plain language is the default.

## URL and SEO decision

There is one document, title, H1, canonical and Article entity per topic/locale.
Reading levels use `#simple` and `#technical` fragment links. They do not create
separate pages or query URLs. Sitemap contains only the twelve canonical guide
URLs: four indexes plus eight articles. Existing twenty entries are preserved.

Both texts are in server-delivered HTML. JavaScript enhances ordinary anchor
links into keyboard-accessible tabs; without it, both versions remain visible.
Direct technical-section fragments work after reload, browser Back restores the
level, and language switching preserves the technical level. Printed pages show
both versions. No bot-specific rendering or user-agent detection is used.

Information intent belongs to the guides. Existing commercial pages continue to
own ordering/visit intent and their URLs, forms, attribution and prices remain.
Contextual links connect each guide to its relevant service; home/service navigation
and teasers make the guide index discoverable. No business services or invented cases.

## Sources and qualifications

Technical references are ordinary links to TP-Link, Cisco, NETGEAR, Fluke and
Belden. Powerline is an option to test, not a latency guarantee. Obstacle ratings
are explicitly qualitative, not measured dB or speed losses. 2.5GBASE-T can use
sound Cat5e with capable ports; continuity is not bandwidth certification.
Conduit examples use internal diameter and illustrative fill, not universal rules.

Equipment links point to manufacturer catalogues/documentation, not transient
marketplace offers. At the owner's request, affiliate links, Allegro Share and
automatic offer replacement are deferred until a company is opened. There are no
affiliate IDs, promotional prices or product review/rating schema in this release.

## Maintenance

Guides load the same `styles.css`, `custom.css`, fonts and `script.js` as the
commercial pages. `scripts/site-chrome.mjs` reuses each localized homepage's
header, mobile menu and footer. `guides.css` is scoped to article layout and
reading controls; it does not override the shared chrome or brand variables.
Poradnik is a top-level link immediately after Usługi, with a separate mobile
menu block, across all home, service, tool and guide pages. Language links in
the shared menus preserve the article and selected reading level.

All shared stylesheets load before the initial render. The former inline
critical CSS and `media="print"`/`onload` base-CSS loading caused visible
unstyled menus while `styles.css` was pending and have been removed. The
navigation synchronizer preserves this rule during regeneration; browser
coverage holds the stylesheet response to verify that no incomplete frame
is painted on desktop or mobile.

Edit `scripts/guide-copy-{pl,ru,uk,en}.mjs`, then run `npm run guides:generate`.
`scripts/build-guides.mjs` renders pages, navigation/teasers and sitemap. Generation
is repeatable; compliance/CRO/price/SEO pipelines finish by regenerating guides.
The root legacy migration sitemap is not the deployment source.

Run `npm run check`, `npm test`, and `npm run test:e2e`. Browser checks cover both
reading levels, keyboard navigation, technical deep links, reload/Back, language
links, no-JavaScript reading, service routing, shared header styles, desktop and
mobile menus, and 320px layout. Screenshots are in
ignored `outputs/guides-2026-10-10/`. Tests block measurement and mock valid leads.

Publishing follows the existing main → Cloudflare Pages process, with a successful
check for the exact commit and production smoke verification before reporting live.
