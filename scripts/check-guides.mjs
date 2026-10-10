import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assetManifest, pageAssets } from './site-assets.mjs';
const manifest = await assetManifest();
const sitemap = await readFile('public/sitemap.xml', 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.equal(new Set(locs).size, locs.length, 'Duplicate sitemap URLs');
for (const locale of ['pl', 'ru', 'uk', 'en']) {
  const prefix = locale === 'pl' ? '/' : `/${locale}/`;
  for (const slug of ['', 'jak-wzmocnic-sygnal-wifi-w-domu/', 'siec-lan-w-domu-przed-remontem/']) {
    const path = `${prefix}poradnik/${slug}`;
    const html = await readFile(`public${path}index.html`, 'utf8');
    for (const asset of ['styles.css', 'custom.css', 'script.js']) assert.ok(pageAssets(html, manifest).includes(`/${asset}?v=20261010-guide3`), `Shared asset ${asset}: ${path}`);
    assert.ok(html.includes('id="header"') && html.includes('id="mobile-menu-toggle"') && html.includes('class="footer-content"'), `Shared chrome: ${path}`);
    assert.ok(!/guide-header|guide-brand|guide-footer/.test(html), `No separate guide chrome: ${path}`);
    assert.ok(/<\/div>\s*<a class="guides-nav-link"/.test(html), `Top-level guide navigation: ${path}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    assert.ok(html.includes(`rel="canonical" href="https://naserwis.pl${path}"`), path);
    assert.ok(locs.includes('https://naserwis.pl' + path), path);
    assert.ok(!locs.some(url => url.includes('#') || url.includes('?')), 'No reading-level URLs in sitemap');
    for (const language of ['pl', 'ru', 'uk', 'en', 'x-default']) assert.ok(html.includes(`hreflang="${language}"`), path);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate IDs ${path}`);
    for (const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(m[1]), `Missing anchor ${m[1]} in ${path}`);
    for (const m of html.matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const data = JSON.parse(m[1]);
      if (slug) assert.equal(data['@graph'].filter(item => item['@type'] === 'Article').length, 1);
    }
    for (const match of html.matchAll(/href="([^"]+)"/g)) assert.ok(!/allegro|affiliate|utm_source|referral/i.test(match[1]), `Deferred affiliate link ${path}`);
    if (slug) {
      assert.ok(html.includes('id="simple"') && html.includes('id="technical"'), path);
      assert.ok(!html.includes('id="technical" hidden'), 'No-JS content stays readable');
    }
  }
}
console.log('Guides: canonical/hreflang, one Article entity, sitemap, anchors, complete HTML and ordinary external links verified.');
