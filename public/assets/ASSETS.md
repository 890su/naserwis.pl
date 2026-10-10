# NaSerwis assets

`naserwis-social.png`, `/favicon.png` and `/favicon.ico` are deterministic
raster renderings of the existing two-colour text wordmark from the site's
original header: `Na` in #0a2540 and `Serwis` in #00d4aa. The page header
uses a darker #087860 text variant for contrast on its light background;
the previously published raster brand assets retain their original colours.
They use system typography,
without stock media, new symbols or factual marketing claims.

Source and build recipe: `scripts/apply-technical-seo.mjs` (sharp 0.35.2).
PNG social dimensions: 1200×630; PNG favicon: 256×256.

`site-*.css` and `site-*.js` are generated from the existing site files with
esbuild 0.28.1. `manifest.json` records source URLs and source tags for
regeneration and checks. The filename contains a SHA-256 content prefix.
