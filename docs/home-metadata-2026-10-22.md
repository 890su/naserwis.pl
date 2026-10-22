# Homepage metadata and redundant trust strip — 22 October 2026

The owner approved removing home/domestic qualifiers from the homepage title and description, and removing the generic four-item Experience / Jobs / Contact / Clear pricing section. Both changes apply to PL/RU/UK/EN. Search metadata, Open Graph and Twitter previews share the same revised localized copy; LocalBusiness descriptions are synchronized wherever the shared business identity appears.

All 41 HTML pages were compared with commit `8f16f81`: only the approved title/description replacements, matching LocalBusiness descriptions and four removed trust sections changed (ignoring whitespace between tags). Existing visible homepage copy, service-page titles/descriptions, prices, forms, URLs, review routing, schema facts and other content remain intact. The immutable original fixture is unchanged; 16 explicitly reviewed page hashes in `check-cro.mjs` reflect only these approved SEO changes.

The source generator removes the obsolete strip and no longer carries its unused localized labels. The service catalogue now follows the visit process directly. Static checks cover all 41 pages; browser checks cover metadata, responsive layout and section order at 390/1440px across all four locales, plus mobile contact flows on all four homepages. Screenshots are in `outputs/home-metadata-390.png` and `outputs/home-metadata-1440.png`.

The owner authorized publication on 22 October 2026. Deployment and production verification are recorded separately in `outputs/home-metadata-publication.json`.
