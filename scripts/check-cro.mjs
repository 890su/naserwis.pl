// Immutable pre-CRO SEO/Ads fixture, usable in shallow Cloudflare checkouts.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { assetManifest, pageAssets } from './site-assets.mjs';
const manifest = await assetManifest();
const baselineRevision = '19c718796d749613deed8bd634745359883372e7';
const fixture = new URL('../tests/fixtures/seo-before-cro.json', import.meta.url);
const hash = value => createHash('sha256').update(value).digest('hex');
async function pages(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await pages(path));
    else if (entry.name === 'index.html') result.push(path);
  }
  return result.sort();
}
function seo(html) {
  html = html.replace(/\r\n/g, '\n');
  return {
    title: html.match(/<title>[\s\S]*?<\/title>/)?.[0],
    description: html.match(/<meta[^>]*name="description"[^>]*>/)?.[0],
    canonical: html.match(/<link[^>]*rel="canonical"[^>]*>/)?.[0],
    hreflang: [...html.matchAll(/<link[^>]*hreflang="[^"]+"[^>]*>/g)].map(m => m[0]),
    h1: [...html.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/g)].map(m => m[0]),
    schema: [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g)].map(m => m[0])
  };
}
const files = await pages('public');
const protectedFiles = ['public/robots.txt', 'public/_redirects', 'public/site-config.js'];
// 2026-10-10 technical SEO candidate: LocalBusiness image, remove unsupported inLanguage, WebSite on four home pages.
// Existing title/description/H1, canonical/hreflang, FAQ and Service facts are retained.
// Canonicals and reciprocal hreflang are preserved; original fixture is immutable.
const reviewedPageHashes = {
  // 2026-11-05 Seobility fixes: shorter homepage descriptions and matching LocalBusiness summaries.
  // Verified unchanged titles, H1, canonical/hreflang, non-description schema facts and all other visible content.
  // 2026-11-02 owner-approved GSC copy: title/share summaries, service descriptions, hero accents and router link.
  // All remaining page content, schema facts, URLs, forms, prices, reviews, assets and tracking verified against 93cba68.
  // 2026-10-31 owner-approved logo: only the LocalBusiness image URL changes to the versioned brand plate; all other SEO fields verified against HEAD.
  // 2026-10-27 owner-requested concise copy: only Service descriptions and matching visible FAQ changed; metadata/H1/URLs compared with prior release.
  // 2026-10-26 local business pages: existing Service metadata retained; only the audience FAQ answer now accepts organisations locally.
  // 2026-10-26: restored conditional nearby short job from 200 PLN and standard visit from 250 PLN; only the billing FAQ answer changed.
  // 2026-10-24: owner-approved network/internet fault and CCTV share summaries; aligned LocalBusiness descriptions.
  // 2026-10-16 owner-approved shorter homepage H1 in all four languages ("... / Montaż lub naprawa z dojazdem").
  "public/index.html": "013083451fa5f989fad194014a7ba5e1e2112eeb532c4ab0989cae24ea2d2078",
  "public/naprawa-wifi/index.html": "73f9cf1079cf63057e39ec8684c900eb5687c2b22b537a9dec52d519a95f8fc5",
  "public/naprawa-sieci/index.html": "a05fc77b96964fbdc76e896586ff5153bd6dde720bad37141c89ac58b69c47bc",
  "public/montaz-sieci/index.html": "28c97b54b3748c9f4742afbd64ecc878ca42a659497f592254c93331a9f3605c",
  "public/ru/index.html": "d8251c7f5046d841657283d6abec32195d1d3708c2c3d5862c86a78e56be51c4",
  "public/ru/naprawa-wifi/index.html": "7584636c9d162172e4a2e0ffc8721220c88c1d18259229a761efe1c7c7c5634b",
  "public/ru/naprawa-sieci/index.html": "6d385b18762f13610b138b0289d1498dee59561b98015ac5eac618572b1e5944",
  "public/ru/montaz-sieci/index.html": "b597d377b9f44311ea76ce034e044f3d856ebbf8375fe5e655dda9b5ddab1469",
  "public/uk/index.html": "336a830c264f4929301def7434f82fe27d14069c99237734fff6e4cbe74b7d07",
  "public/uk/naprawa-wifi/index.html": "d6b6c5de3836a1bfcd9e8a623c337ceb786b4667adb8dabfb3ca2357dc28ec8d",
  "public/uk/naprawa-sieci/index.html": "fedf213e1afffde37c14ab2c0bc73df834ac486d913fd1015b5d376e24568a7d",
  "public/uk/montaz-sieci/index.html": "1a288c14b6f8ba97ddb1e621a99f3514b74ac2f6bedf823f763bcf089ebc4093",
  "public/en/index.html": "7da2b017f1d049f4cd90c643840ff78b14d73407d77c917ae129a54c282a2836",
  "public/en/naprawa-wifi/index.html": "c9f16c763854b960630dfd2a0f7d29ed65d319577ab593fa79c8c73baea9db8d",
  "public/en/naprawa-sieci/index.html": "65314cb94fc05f49aee010213f3119b696b8726a0a6f228becbe249a99d34fa1",
  "public/en/montaz-sieci/index.html": "a75a529a48e29250e23d1552f00042a4f4aa10f1432fcd24543388f76d418182"
};
// Legacy PHP routes now redirect directly to their established canonical URLs.
const reviewedProtectedFileHashes = {
  "public/_redirects": "ceeadef331a2b44237d1254c0ed9e5bd068d8be5004f8773e8883afe66f97058"
};
const record = process.argv.includes('--record-original');
const original = file => execFileSync('git', ['show', `${baselineRevision}:${file}`], { encoding: 'utf8' });
const expected = JSON.parse(await readFile(fixture, 'utf8'));
const snapshot = { baselineRevision, pages: {}, protectedFiles: {} };
for (const file of files.filter(file => record || expected.pages[file])) snapshot.pages[file] = hash(JSON.stringify(seo(record ? original(file) : await readFile(file, 'utf8'))));
for (const file of protectedFiles) snapshot.protectedFiles[file] = hash((record ? original(file) : await readFile(file, 'utf8')).replace(/\r\n/g, '\n'));
if (record) {
  await writeFile(fixture, JSON.stringify(snapshot, null, 2) + '\n');
  console.log('Recorded original immutable SEO/Ads fixture from ' + baselineRevision);
} else {
  const expectedStable = { ...expected, protectedFiles: Object.fromEntries(Object.entries(expected.protectedFiles).filter(([file]) => protectedFiles.includes(file))) };
  expectedStable.pages = { ...expectedStable.pages, ...reviewedPageHashes };
  for (const [file, reviewedHash] of Object.entries(reviewedProtectedFileHashes)) expectedStable.protectedFiles[file] = reviewedHash;
  assert.deepEqual(snapshot, expectedStable, 'Existing SEO or Ads configuration changed; review explicitly before updating baseline.');
  let landingCount = 0;
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const assets = pageAssets(html, manifest);
    assert.equal(assets.filter(asset => asset.startsWith('/contact-ui.css')).length, 1, file);
    if (!html.includes('class="fab-container"')) continue;
    landingCount++;
    assert.equal(assets.filter(asset => asset.startsWith('/contact-ui.js')).length, 1, file);
    for (const value of ['id="contact-menu"', 'class="contact-fallback"', 'class="contact-invitation"']) {
      assert.equal(html.split(value).length - 1, 1, `${file}: ${value}`);
    }
    assert.equal((html.match(/class="contact-(?:choice-label|toggle-label|bar|hint)"/g) || []).length, 0, file);
    assert.equal((html.match(/class="fab fab-(?:phone|whatsapp|telegram|chat|form)"/g) || []).length, 5, file);
    assert.equal((html.match(/class="contact-tip"/g) || []).length, 5, file);
    assert.equal((html.match(/id="quick-form"/g) || []).length, 1, file);
    assert.equal((html.match(/class="mobile-contact-dock"/g) || []).length, 1, file);
    assert.equal((html.match(/id="quick-contact-modal"/g) || []).length, 1, file);
    assert.equal((html.match(/class="contact-next-step"/g) || []).length, (html.match(/<form id="(?:hero-form|final-form)"/g) || []).length, file);
    if (/^public(?:\/(?:ru|uk|en))?\/(?:naprawa-wifi|naprawa-sieci|montaz-sieci)\/index\.html$/.test(file)) {
      assert.equal((html.match(/INTENT LANDING CONTENT START/g) || []).length, 1, `${file}: intent content marker`);
      assert.ok(assets.includes('/script.js?v=20261010-guide3'), `${file}: shared script cache version`);
      assert.ok(assets.includes('/custom.css?v=20261010-guide3'), `${file}: shared styles cache version`);
      if (file.includes('/naprawa-wifi/')) {
        assert.equal((html.match(/data-intent-select=/g) || []).length, 3, `${file}: three Wi-Fi intents`);
        assert.equal((html.match(/data-intent-select="[^"]+" data-contact-modal/g) || []).length, 3, `${file}: intent options open the enquiry modal`);
        assert.equal((html.match(/class="intent-cluster"/g) || []).length, 1, `${file}: symptom selector`);
      } else if (file.includes('/naprawa-sieci/')) {
        assert.equal((html.match(/class="service-proof"/g) || []).length, 0, `${file}: no repeated repair process`);
      } else {
        assert.equal((html.match(/class="delivery-panel"/g) || []).length, 0, `${file}: no repeated installation deliverables`);
      }
    }
    if (/^public(?:\/(?:ru|uk|en))?\/index\.html$/.test(file)) {
      assert.ok(!html.includes('<div class="cta-buttons">'), `${file}: rejected homepage hero buttons returned`);
    }
  }
  assert.equal(landingCount, 48);
  const sitemap = await readFile('public/sitemap.xml', 'utf8');
  for (const route of ['/pogoda-internet-warszawa/', '/ru/pogoda-internet-varshava/', '/uk/pohoda-internet-varshava/', '/en/weather-internet-warsaw/']) assert.ok(sitemap.includes(route), `sitemap: ${route}`);
  for (const file of Object.keys(reviewedPageHashes)) {
    const route = '/' + file.replace(/^public\//, '').replace(/index\.html$/, '');
    const html = await readFile(file, 'utf8');
    assert.ok(html.includes(`<link rel="canonical" href="https://naserwis.pl${route}">`), `${file}: canonical must match the served URL`);
    assert.ok(sitemap.includes(`<loc>https://naserwis.pl${route}</loc>`), `${file}: sitemap must match the served URL`);
  }
  const notFound = await readFile('public/404.html', 'utf8');
  assert.ok(notFound.includes('<meta name="robots" content="noindex, follow">'), '404 page must remain noindex, follow');
  assert.ok(notFound.includes('href="/"'), '404 page must link back to the homepage');
  console.log('CRO guards passed: reviewed audience FAQ, preserved Ads configuration, 48 contact landings including 24 local business pages and 4 tool routes.');
}
