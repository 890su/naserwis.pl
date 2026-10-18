# Homepage illustrations — 18 October 2026

The owner approved replacing the two homepage task images and publication.
The fault card uses a router with a red Internet indicator and a localized
phone message (PL/RU/UK/EN). The setup card uses one shared RJ45 connection
illustration. These are generated illustrations, not documentary service photos.

Responsive AVIF/WebP assets, prompts and provenance are stored under
`public/assets/redesign/*20261018*`. Local full-size originals are preserved in
`outputs/imagegen/no-internet-red-v2-2026-10-18/`; rebuild derivatives with
`node scripts/build-home-task-images.mjs`. The markup generator is updated so
subsequent technical builds preserve these choices.

Only the existing Internet indicator blinks. A generated off-state image is
clipped to that small region; the photograph and text remain still. Localized
pause/resume controls, reduced-motion fallback, hidden/offscreen pause and
overlay-failure fallback are implemented in `public/home-photo.js`. It is
bundled on homepages only. Contact and measurement source files are unchanged.

Local verification:

- `npm run check` and staged `git diff --check` passed.
- All 54 existing measurement/home-service browser scenarios passed.
- Image checks passed at 1365px and 390px in all four languages: loaded localized
  images, toggle, reduced motion, offscreen pause and no horizontal overflow.
- Screenshot comparison confirmed that only the tiny LED region changes.
- A failed overlay leaves a usable static red image and hides animation control.
- Desktop/mobile images were visually inspected. Design detector reported only
  advisory findings in the existing shared stylesheet, no primary failures.

External analytics/contact requests and API delivery were blocked or simulated
in browser verification. No real enquiry or conversion hit was sent.

Publication uses the existing Git integration on `main`. Previous production
revision: `84dda9d836304730045a95662d95d2df49ce7d90`;
Pages deployment: `b5b808dc-c7a4-492c-a90c-c56713ad3c34`.
Production verification evidence is saved in the ignored image output folder.

## Power control refinement

The owner requested a Power symbol without visible text, positioned in the
bottom-left corner. The 44px button has a localized accessible name, pressed
state and action tooltip. Off now extinguishes the LED; on resumes red blinking.
The preference is remembered across reloads. The owner explicitly requested ignoring reduced motion for this small LED.
The Power toggle still extinguishes it, and offscreen/hidden pages still pause it. Images and contact/measurement source
files are unchanged.

Static checks and four existing task/contact-placement measurement scenarios
passed. Focused verification covers all four languages at desktop/mobile widths:
icon, bottom-left placement, dark off state, blinking on state, remembered
preference, keyboard control and blinking under reduced motion. Raster checks confirm red light
only in the on state. Production evidence is kept with the local image outputs.
