# Enquiry scrolling and mobile service contacts — 24 October 2026

Implemented at the owner's request. The owner subsequently authorized publication
on 24 October 2026 through the existing GitHub main / Cloudflare Pages integration.

- Example text spans receive native pointer events inside the list. Empty side
  space hits the surrounding examples region, allowing native page scrolling.
  No synthetic wheel forwarding, touch cancellation or document-scroll replacement
  is used. The outer region retains full-width row hover and click selection;
  keyboard focus/activation remains on the original buttons.
- Removed the Pause control from every generated progressive form. Existing
  automatic movement, All examples, animated selection and manual scrolling remain.
- Centered service-form contact channels below 1200px.
- At 760px and below, the service hero phone appears beneath the form, matching
  the homepage. Medium/desktop screens retain the phone in the hero. Responsive
  placement prepends the form into its slot, preserving this order after resizing.
- Applied to the homepage and all four services in PL/RU/UK/EN.

Validation:

- `npm run check` passed across 49 HTML pages and local assets.
- Browser run covered 70 scenarios: 68 passed initially. Two test assumptions
  needed adjustment: waiting for touch inertia to settle between gestures, and
  clicking actual text rather than assuming a wrapped row's center receives
  pointer events. The affected scenarios passed on targeted reruns (two touch
  cases and the Russian desktop LAN-install enquiry).
- Five mouse-wheel scenarios verified list scrolling over text and page scrolling
  at both edges, plus full-width hover and side-space selection.
- Native Chromium touch emulation verified the same gesture routing on home and
  CCTV pages. This is browser emulation, not physical-device testing.
- Existing enquiry scenarios exercised all four languages and commercial routes,
  field reveal, keyboard selection, manual editing, resize persistence, validation,
  local mocked error/retry/success, and the separate compact popup.
- Screenshots of desktop, medium and mobile service forms and full-width home
  highlighting were reviewed. Impeccable's detector reported advisory findings
  only; no non-advisory findings.

Relevant sources: `public/enquiry.js`, `scripts/staged-enquiry.mjs`,
`scripts/apply-redesign.mjs`, `public/redesign.css`.
