# Privacy notice styling — 22 October 2026

The initial notice uses the site's Manrope typography, graphite text, light-grey surface, 8px panel radius and 6px controls. Its two choices are stacked in both visual and keyboard order: blue Accept all, then white Necessary only. The initial Customise button and its unused handler are removed. Privacy/cookie links and footer category settings remain available.

Accept all still grants analytics, marketing and chat; Necessary only denies all three. Stored choices, Google Consent Mode defaults, category saving, modal focus behavior, and Chatwoot gating retain their existing behavior. The contact launcher automatically stays above the resized notice through its existing ResizeObserver.

Static checks pass for all 41 HTML pages. Five consent/chat browser scenarios pass. Twelve checks across PL/RU/UK/EN and 320, 390 and 1440px verify the two stacked choices, persistence after reload, both acceptance paths and footer settings. Desktop/mobile screenshots were reviewed in Chrome/Chromium. The owner authorized publication of the complete update on 22 October 2026; deployment verification is recorded in `outputs/home-privacy-publication.json`.
