# Search copy alignment — 2 November 2026

The owner approved the proposed Search Console follow-up. Four homepage titles
now state repair and installation, and the existing router/Mesh task link names
the service and Warsaw explicitly. General Wi-Fi and LAN installation titles,
descriptions and hero subtitles no longer describe the whole service as
home-only. LAN repair descriptions receive the same audience correction. All
four locales remain aligned with the site's existing service scope.

This is a copy update on the existing URLs. No new service page, redirect,
canonical, hreflang, price, form, review, runtime, asset or tracking change is
included. Existing home-specific examples and guides remain valid.

`scripts/home-service-copy.mjs` remains the source. `npm run seo:metadata` applies
only metadata, service hero text, the existing homepage router-link label and
matching Service schema descriptions. The normal technical generator also runs
this synchronization. Repeating the focused command produces no further diff.
Sitemap dates were advanced only for the 16 pages actually changed.

Before updating the reviewed SEO hashes, every affected page was compared with
revision `93cba68`: all bytes outside the approved text changes and JSON
formatting were unchanged. The immutable original SEO fixture is retained.

Validation: all six existing static/link/SEO/business/CRO/guide checks and all
22 unit tests passed. Browser verification covered all four home, Wi-Fi and LAN
installation locales at 390px: the new labels and headings wrap without
horizontal overflow. Desktop layout was visually inspected as well. No lead
was submitted.

After publication, compare an equivalent Search Console window after Google
has recrawled the pages. Compare the same query/page/device groups and account
for position changes and low sample sizes; a title change does not guarantee a
CTR increase. Private account baselines stay in local ignored evidence.

Rollback: revert this focused release commit; do not reset the unrelated local
working copy or restore an older whole-site deployment over later changes.
