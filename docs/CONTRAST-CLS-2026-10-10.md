# Contrast and first-visit layout correction — 2026-10-10

On a fresh visit with a supported browser language different from the page,
the language suggestion was inserted into normal document flow under a fixed
header. The header covered its white text, and insertion changed the hero's
collapsed margin, moving the page. A production observation with English and
4× CPU throttling recorded a 0.12559 layout shift at 390px and 0.09219 at 1280px.
The bright `Serwis` wordmark also had insufficient contrast on the light header.

Changes:

- Use #087860 for the header wordmark text; computed contrast on white is
  5.43:1. The approved raster brand assets retain their original colours.
- Place the language suggestion below the header, outside document flow.
  Keep its question, language link and dismiss button visible; fit its mobile
  layout above article breadcrumbs and the first heading. It remains below
  navigation menus and modal dialogs in the stacking order.
- Render the existing translated form privacy notice in HTML. Runtime JS
  detects it and does not add a duplicate. This removes form growth and the
  resulting movement of the vertically centred desktop heading when JS is late.
- Preserve previously published content-addressed resources for cached HTML.

Verification evidence lives in ignored `reports/contrast-cls-2026-10-10/`:
`before.json`, `after.json`, browser test logs, Nu results, responsive captures
at 320/768/1280/1920, and the subsequent publication/Lighthouse record.
The layout tests delay the runtime until after the first heading is painted,
then verify stable geometry, exposed text, contrast and dismissal. They cover
English, Russian and Ukrainian browser locales on the homepage and article.

Commands: `npm run technical:generate`, `npm run check`, `npm run test:e2e`;
`python reports/contrast-cls-2026-10-10/validate_static.py` validates HTML and
resources. Production uses the existing main/Git/Cloudflare Pages release path.
Before release, project guards and all 97 browser tests passed; Nu validated
all 41 pages with zero errors and no missing referenced assets.
Lab CLS observations do not establish field Core Web Vitals or WCAG conformance.

The [CLS reference](https://web.dev/articles/cls) explains how asynchronous DOM
insertion can move already visible content and why field and lab values differ.
