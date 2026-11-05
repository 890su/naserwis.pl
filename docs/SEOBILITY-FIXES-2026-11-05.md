# Seobility follow-up — 2026-11-05

Owner requested implementation of the reviewed SEO findings.

- Add a Pages middleware redirect from the exact www.naserwis.pl host to HTTPS
  naserwis.pl, preserving path and query. GET/HEAD use 301; other methods use 308
  to preserve a submitted request. Preview hosts and canonical-host APIs pass
  through. Existing PHP migration routes are preserved and combined with the
  host change when applicable.
- Keep CSS, JS, versioned assets and favicons outside Functions invocation routes.
  HTML/document requests now invoke the existing Pages application middleware;
  no new Cloudflare project, DNS record, account rule or paid plan is required.
- Remove obsolete language-name meta tags while retaining HTML lang/hreflang.
- Shorten homepage descriptions in PL/RU/UK/EN and synchronize share metadata
  and existing LocalBusiness summaries through the shared generator.
- Render review authors as paragraphs with the existing review-author class;
  retain all 13 reviews, text, stars, links and slider behavior in each locale.
- Keep the intentionally empty alt on decorative brand/animation images.

Validation: all 73 HTML files compared with 62e05ff; changes limited to reviewed
metadata, review-author tags and whitespace. Titles, H1, canonical/hreflang,
schema facts apart from the reviewed business summaries, visible copy, prices,
forms and measurement configuration preserved. Static/link/SEO/CRO/guide guards,
25 unit tests and 49 browser scenarios passed. Wrangler local runtime confirmed
the host redirect, preserved query and static security headers. Desktop/mobile
review screenshots inspected. Production smoke includes www redirects.

Rollback: revert the implementation commit or select the previous successful
Pages deployment. Neither delivery secrets nor existing operational data change.
