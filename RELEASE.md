# Broader homepage link previews — 2026-10-24

- Homepage title, description, Open Graph and Twitter metadata now include
  Wi-Fi/LAN, network and internet fault diagnosis and CCTV service/installation
  in all four locales, without domestic/private-customer limitations.
- Shared LocalBusiness descriptions use the same factual service summary.
  Visible H1/content, service-specific metadata, canonical/hreflang, URLs, prices
  and conversion configuration remain unchanged.
- The normal technical build synchronizes the metadata from the existing copy
  source. Reviewed SEO hashes were updated only after confirming the unchanged
  headings, canonical/hreflang and all non-description schema facts.
- Static/link/SEO/CRO/guide checks passed. The owner requested a read-only live
  seo-landing audit after publication; its measured results are reported separately.

# Progressive enquiries and graphite form layout — 2026-10-24

Follow-up: the final homepage contact section remains a centered single column
at every viewport width (640px maximum content), and both homepage forms center
their contact-channel links. Verified at 320/768/1280/1920px with no overflow;
existing static/SEO/link guards pass. The change affects layout only.

Implementation commit `6351c6d553af2d4fa3cdd0d8aa6d0f9824b3214a` was
published successfully through Cloudflare Pages deployment
`0b78a431-f971-406c-adb6-56839af3c026`. Production smoke passed all 49 page
SEO/content/asset checks, canonical redirects, 404 and safe API 405/400 checks.
All 16 focused production browser scenarios passed across the main run and an
isolated confirmation; a row-alignment assertion now tolerates less than one
pixel of inherited entrance-animation movement (the observed difference was
0.007px). No real leads were submitted. Rollback implementation: `0f94e11`.

- Owner approved publication of the final four-language form changes through the
  existing GitHub main / Cloudflare Pages integration.
- Homepage and service-page forms start with a problem description and scrolling,
  service-specific examples. Typing or selecting an example reveals request type,
  urgency and contact; name/address stay optional. Selection types the example
  into the field, with manual-edit takeover and complete-text early submission.
- In-page panels use graphite with softened light-grey fields. Below 1200px,
  the same form follows the hero phone on a continuous graphite background, with
  its content centered at a maximum 640px. Desktop keeps a separate right rail.
- Button-opened dialogs retain a single screen: description, phone and optional
  name/address. Existing modal keyboard/focus behavior, anti-spam, privacy and
  successful-lead conversion semantics are preserved.
- Removed the three CCTV section-jump links in PL/RU/UK/EN, retaining section IDs
  used by guide links. Routes, SEO entities and pricing remain unchanged.
- Validation: 13 unit tests and all static/SEO/CRO/link/guide guards passed.
  The final graphite layout and compact modal passed 16 focused desktop/mobile
  browser scenarios, with previous comprehensive enquiry and conversion checks
  recorded in docs/PROGRESSIVE-ENQUIRY-2026-10-24.md. Provider delivery is mocked
  during tests; no real lead is sent for verification.
- Rollback uses the prior successful Pages deployment or a reviewed Git revert;
  no DNS, project, secret or campaign configuration change is required.

# Intent-matched service landings — 2026-09-17

- Added localized, indexable symptom guidance to all four Wi-Fi pages and
  concrete diagnostic/delivery content to all LAN repair and installation
  pages. No routes, canonical tags or existing forms were removed.
- Added five allowlisted `intent` variants that can change only reviewed hero,
  CTA and form-context copy. A symptom selection opens the existing enquiry
  modal. Unknown URL values are ignored and cannot be rendered or forwarded
  with a lead.
- Added the selected non-PII intent to lead delivery and consent-aware
  diagnostics. Existing primary form and secondary phone, WhatsApp, Telegram
  and chat conversion labels remain unchanged.
- Added generator/static guards, API sanitization tests and browser coverage for
  all four languages, malicious values, form payloads and conversion labels.
- Fixed the local QA server so a missing static file returns 404 without first
  sending a 200 header.
- Published commit `b6f9916` through the existing Cloudflare Pages Git
  integration and passed production smoke plus six focused browser checks.
- Imported a separate Google Ads bulk package with 20 intent groups, 240
  accepted phrase/exact keywords and 20 localized RSAs. On 2026-09-19, enabled
  the first staged wave of 12 groups: Wi-Fi coverage, router setup and LAN
  installation in each of the PL/RU/EN/UK campaigns. The eight Wi-Fi-no-
  internet and LAN-repair groups remain paused. Existing groups, budgets,
  targeting, schedules and conversions remain unchanged. Six rejected rows
  were replaced with more specific service terms and the replacements were
  accepted with no errors.

# Google Ads tag activation — 2026-09-09

- Switched the single `gtag.js` loader from the GA4 measurement ID to Google
  Ads destination `AW-18394870871`, matching the Ads installation wizard.
- Kept GA4 `G-FVC64PTKR3` as a second destination on the same tag and preserved
  Consent Mode v2 denied defaults before the Google script loads.
- Added a build guard so future generated pages cannot silently revert the Ads
  loader or drop either destination.

# Search indexing cleanup — 2026-09-08

- Aligned service-page canonical, hreflang, social metadata, sitemap entries and
  internal links with Cloudflare Pages' served trailing-slash URLs. Pages keeps
  the no-slash variants consolidated through its automatic permanent redirect.
- Added a branded, `noindex, follow` `404.html`, so unknown paths return a real
  HTTP 404 instead of the homepage with a misleading 200 response.
- Extended production smoke checks to cover canonical redirects and the custom
  404 response. Intentional `noindex` directives on privacy/cookie pages remain
  unchanged.

# 2026-09-07 — weather card refinement

- Moved perceived temperature beside the main reading and enlarged the remaining
  four weather metrics into a 2×2 grid.
- Added enquiry and telephone actions below the diagnostic content.
- Replaced result-copy UI with new-tab links to the official Ookla and Cloudflare
  full connection tests; the lightweight local diagnostic remains available.

# CRO v1 release — 2026-09-05

## Latest revision: compact bottom-centred consent card

Asset revision `20260905-consent7` constrains the initial grey consent notice to
a compact card at the bottom centre on desktop and mobile. Its two-part row,
three visible actions and non-modal behavior remain; detailed settings still use
the accessible modal. The contact launcher remains above the notice. This is a
layout-only change with no consent, analytics, Ads, form, SEO or route changes.

Implementation commit `7c9d0e301f0d5581ada33519ab4bd60d005560da` was pushed to
`origin/main` and published by the existing Cloudflare Pages Git integration as
deployment `b5aa8160-2248-410e-b2f9-9e52eb71fe48` (successful). Production
smoke passed all 24 pages, exact assets and safe API rejection checks. No lead
was submitted during verification.

## Previous revision: modal enquiry paths and mobile contact dock

Asset revision `20260905-modal6` changes the launcher to one short animation
every three seconds after 2.5 idle seconds and restores that behavior after its
contact menu closes. A fifth localized enquiry option opens a keyboard-contained
modal form. All existing `#contact` CTAs use the modal without scrolling while
retaining native anchor fallback; the original page forms remain unchanged.

Mobile pages now have a restrained two-button fixed dock for phone and enquiry,
with the circular launcher positioned above it. The dock yields to consent,
navigation and modal UI. The new form reuses the existing endpoint, validation,
bot protection and attribution. Successful modal submissions use the same single
primary lead conversion; phone and other contact methods retain their existing
secondary conversions. Static/unit checks and 28 browser scenarios cover all
four locales, CTA interception, modal focus, mobile layout and event uniqueness.

Implementation commit `111e3ca058bfc815adef3a3cd1492063fb5a96c7` was pushed to
`origin/main` and published by the existing Cloudflare Pages Git integration as
deployment `71453307-c746-491a-a9c2-1ab05e73535f` (successful). Production
verification passed: 24-page SEO/UI and exact-asset smoke checks plus all 28
browser scenarios against `https://naserwis.pl`. Browser form requests were
intercepted, so no production lead was submitted during QA.

## Previous revision: idle contact motion and form visibility

Asset revision `20260904-idle5` keeps the circular launcher visible while a user
focuses or types in any form field. Scrolling stops the animation immediately;
2.5 seconds after scrolling ends, the launcher resumes a continuous one-second
rock/scale cycle with two pulse rings. It remains static for reduced-motion users
and pauses during hover, its open menu, modal UI, open chat and background tabs.
The invitation timing/dismissal, contact links, forms, SEO and Ads contracts are
unchanged.

Implementation commit `d74af4fe004eb63dc64d15828ad9c81a0c814ce7` was pushed to
`origin/main` and published by the existing Cloudflare Pages Git integration as
deployment `93ef617e-2b68-41af-af54-91b4add19ade` (successful). Production smoke
passed all 24 pages and exact assets; the four focused browser scenarios covering
form focus, idle/scroll motion, reduced motion and consent also passed live. No
production leads were submitted during QA.

## Previous revision: clearer consent row and stronger contact cue

Asset revision `20260904-consent4` removes the two owner-rejected homepage hero
buttons in PL/RU/UK/EN. The initial, non-modal cookie notice now uses a visibly
grey two-half row: copy on the left and three bordered, filled actions in one row
on the right. The circular contact launcher is raised above that notice and stays
usable; it is hidden only when the full consent settings dialog becomes modal.

The launcher uses a stronger centered rock/scale burst and two more visible
background rings. A burst lasts at most 4.2 seconds and restarts no more often
than every 16 seconds; hover/focus and reduced-motion safeguards remain. Static,
link, unit, browser and production smoke verification cover the four locales.
No routes, SEO metadata/schema, form/API behavior or Ads conversion IDs changed.

Implementation commit `9d8bb5bf99a44d96d21b1613b2497c2170d993bf` was pushed to
`origin/main` and published by the existing Cloudflare Pages Git integration as
deployment `ee08d3b5-65e8-4dd7-8ccf-28fc165df226` (successful). Production
verification passed: 24-page SEO/UI and exact-asset smoke checks, safe API
405/400 checks, and all 27 browser scenarios against `https://naserwis.pl`.
No production leads were submitted during QA.

## Previous revision: left balloons and attention around the circles

Owner clarification: `20260904-balloons3` keeps the original circles and adds a
delayed left invitation, centered rocking/scaling and two expanding pulse rings.
Each movement burst ends within 4.8 seconds, repeats after 24 seconds, and stops
on interaction. Dismissal/opening the menu persists for the current tab session.
Reduced motion keeps the invitation static. No online/SLA claim is introduced.

Four localized channel balloons show on desktop hover/keyboard focus and all show
on mobile/touch when the menu opens. No new card/strip and no changed lead/API,
SEO or Ads contract. Updated regression suite covers 27 browser scenarios,
including delayed invitation, repeat/dismissal, reduced motion, hoverable channel
descriptions, touch behavior and 320px viewport bounds. Production is verified
with the same smoke script and existing Cloudflare Pages Git deployment check.

## Previous revision: original circular contacts

At the owner's request, asset revision `20260904-round2` restores the original
round button and vertical coloured round channel icons from `styles.css`.
The labelled pill/card, timed hint, sheen and mobile strip are removed.
Form enhancements, compact consent, SEO and Ads configuration are retained.
The chat fallback appears only on failure, not as the normal contact menu.

Regression coverage now asserts 48px mobile / 56px desktop circles and absence
of the discarded UI on all 16 landings, while retaining form/conversion tests.
Publish through the existing Pages Git integration; require its successful check
and `npm run smoke:production`. The historical release record follows below.

Target: existing Cloudflare Pages `naserwis-pl`, account
`5354e054d53157bf5b02ce5119d08948`, domain `naserwis.pl`, Git `main`.
This is Pages static hosting plus a Pages Function, not a new standalone Worker.

## Change set

Labelled contact pill, short dismissible hint, bounded motion, explicit channel
menu, contextual mobile bar, form next-step/alternative contacts, local field
errors, persistent confirmation, and compact non-modal initial consent banner.
All four locales are included. Explicit consent settings remain modal and
keyboard accessible. Chat consent, SDK loading/failure and reduced motion are
handled. No advertising account mutations or ITBIZ deployment.

## Verification

- Static/link checks: 24 HTML pages; no missing local resources.
- Immutable baseline `19c718796d749613deed8bd634745359883372e7` matches title,
  description, H1, canonical/hreflang, structured data, sitemap, robots,
  redirects and site configuration/Ads labels.
- Four Node test groups cover input/origin validation, failed delivery,
  Turnstile and accepted multilingual delivery with mocked providers.
- 27 Chrome browser scenarios cover all 16 landing pages, 320/360/390/768/1440px,
  menu/focus/consent/storage/motion, form failure and retry, attribution,
  existing conversion labels, chat grant/rejection/timeout and suppression.
- Screenshots reviewed: mobile consent/contact/round/motion/invitation/form and
  desktop contact/channel descriptions.
- CRO generator rerun verified idempotent. No new third-party runtime package;
  Playwright and Wrangler are pinned development tools only.

Browser/provider tests use mocks: they do not prove actual Telegram/email inbox
delivery or Google Ads ingestion. No fake leads were sent to production.
The Turnstile public key remains empty as before; production configuration is
an operational follow-up, not silently changed in this CRO release.

## Publication record

Implementation commit: `f2a3505a3d537c94bc328820bf7f56f750fb3b6a`, pushed to
`origin/main`. Cloudflare Pages check completed successfully in the requested
account/project: deployment `db1332af-e4f6-4d0e-bdd3-13bb4a5da43b`.

Production verification on `https://naserwis.pl` passed:

- all 24 page SEO/UI checks;
- eight exact source asset comparisons (including UI JS/CSS and site config);
- original robots source plus the verified additional Cloudflare Managed robots
  prefix; no robots or zone policy changes were made;
- API rejects GET with 405 and an empty JSON POST with 400, without delivery;
- all 24 browser scenarios repeated against the production domain (44.1s),
  with valid submission/provider/analytics requests isolated as described above.

The documentation/QA follow-up changes no `public/` or `functions/` source; its
Git-triggered deployment serves the same verified implementation.

The supplied account token verifies but currently returns 403 for Pages/Workers.
The existing Git integration successfully published the site instead. No tokens
were written into source or documentation. Rotate the token shared in chat.

## Rollback and follow-up

Previous successful production: commit `19c7187`, Pages deployment
`0dcc75b5-4d1d-43c8-bd3b-f55b6524fbdd`. If needed, choose that deployment in
Pages rollback, or revert the CRO implementation commit and push the revert.
Keep data/credentials and DNS unchanged. A rollback restores the previous UI
and measurement behavior, including its known limitations.

No uplift is claimed. Obtain fresh 28/90-day GA4/GSC and qualified-lead records;
review the first full week's consent-segmented funnel and run a controlled
experiment only when traffic supports it. Do not alter Ads bidding based on
button clicks alone. See [CRO_PLAN.md](CRO_PLAN.md) for evidence-gated next steps.
# 2026-09-06 — weather and connection utility

- Added localized PL/RU/UK/EN pages combining the Warsaw forecast with an
  explicit lightweight connection diagnostic.
- Added server-side MET Norway proxy caching and required CC BY 4.0 attribution.
- Added no-store IP/ASN/edge reflection and a user-triggered probe capped at
  256 KiB; values are not persisted or sent to analytics.
- Added menu and homepage entry points, reciprocal hreflang, sitemap entries,
  privacy disclosures, generation scripts and API tests.
- Preserved all previous SEO/Ads metadata for existing pages and left Ads files
  unchanged.
# 2026-09-26 — единая панель согласия для чата

Опубликован коммит `3926c2a` через существующую Pages/Git интеграцию.
Cloudflare Pages deployment `0ee10552-e5bc-4ffd-83d4-cb649a7a8bc0` завершился
успешно. Кнопка чата показывает компактную общую панель согласия. Закрытие
настроек без выбора ничего не сохраняет и возвращает начальный баннер.
Явный выбор только обязательных и отдельное разрешение чата сохранены.

Статические проверки и 12 unit-тестов прошли. Production smoke подтвердил
точные исходники ресурсов, страницы/SEO, редиректы, 404, API 405/400.
В браузере проверены ранее разрешённый чат на основном домене и сценарий
без сохранённого согласия на URL того же выпуска. Заявки и сообщения не
отправлялись. Детали: `docs/consent-chat-fix-2026-09-26.md`.

# 2026-09-26 — ориентировочные цены

Владелец подтвердил публикацию обновлённого прайса. На всех 16 страницах
PL/RU/UK/EN числовые цены начинаются с `od` / `от` / `від` / `from`.
Выезд с первым часом работы стоит от 250 zł, включая прайс ремонта и карточки
выезда. В основной прайс и прайс ремонта добавлен ремонт оптоволоконного
кабеля от 280 zł. Прочие суммы сохранены.

Рядом с таблицами, абонементами и боковыми прайсами размещено краткое
примечание: цены ориентировочные, не являются офертой; итоговая стоимость
зависит от условий и согласуется до начала работ. Убрана противоречащая
этому формулировка об окончательных суммах в прайсе.

`prices:generate` сохраняет эти изменения при повторной генерации CRO и
compliance. Повторный запуск не меняет страницы. Статические проверки
29 страниц и CRO guards прошли. Просмотрен прайс в Chrome. В SEO guard
явно пересмотрены только восемь хешей с разрешёнными изменениями цен:
выезд в Service schema и текст диапазона оценки в FAQ schema. Остальные
SEO-поля и настройки рекламы сохранены.

# 2026-10-10 — техническое SEO и скорость

Владелец одобрил HTML и публикацию через существующую интеграцию Git/Pages.
На 41 странице применены системные шрифты, один CSS и defer JS bundle,
исправления HTML/Schema.org, контраста и управления фокусом, favicon и social
preview. Google tags загружаются после согласия на соответствующую категорию;
destination IDs и conversion labels сохранены. Подготовлены HSTS на сутки и
CSP Report-Only. Исходники и manifest сохранены; генераторы повторяют правки.

Перед публикацией: project checks, 12 unit и 79 browser tests прошли;
Nu validator — 41 страница, 0 ошибок. Локальные mobile Lighthouse 13.4.1
медианы: Performance 100/100 для home и Wi-Fi, 97/100 для статьи и погоды;
SEO/Best Practices 100/100. Это лабораторные результаты локального кандидата.
Подробности и ограничения: docs/TECHNICAL-SEO-2026-10-10.md.
Deployment SHA и результаты production QA сохраняются в локальном
reports/seo-2026-10-10/publication.json. Рабочий сервер проверяется после
успешного Cloudflare Pages check; проверочные заявки не отправляются.

## 2026-10-10 — first-visit contrast/CLS follow-up

Исправлен сценарий первого визита с English/Russian/Ukrainian browser locale:
языковое уведомление больше не скрывается под шапкой и не сдвигает документ.
Зелёная часть логотипа использует более тёмный текстовый вариант #087860.
Существующие пояснения о персональных данных теперь находятся в HTML форм,
чтобы их поздняя вставка не меняла высоту первого экрана. Предыдущие immutable
ресурсы сохранены для совместимости с кешированными страницами.
Детали: docs/CONTRAST-CLS-2026-10-10.md; измерения и запись публикации:
reports/contrast-cls-2026-10-10/.
