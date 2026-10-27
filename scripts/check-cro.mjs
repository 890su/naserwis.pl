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
  // 2026-10-27 owner-requested concise copy: only Service descriptions and matching visible FAQ changed; metadata/H1/URLs compared with prior release.
  // 2026-10-26 local business pages: existing Service metadata retained; only the audience FAQ answer now accepts organisations locally.
  // 2026-10-26: restored conditional nearby short job from 200 PLN and standard visit from 250 PLN; only the billing FAQ answer changed.
  // 2026-10-24: owner-approved network/internet fault and CCTV share summaries; aligned LocalBusiness descriptions.
  // 2026-10-16 owner-approved shorter homepage H1 in all four languages ("... / Montaż lub naprawa z dojazdem").
  "public/index.html": "49200a1f57759ec3fb0fb5b3e724860181398f34644c3cecb9f44254663030a6",
  "public/naprawa-wifi/index.html": "4eded4ff9ac5570c1b8a203b6231db49e3857dc9bc95295fa68397bcaac16a75",
  "public/naprawa-sieci/index.html": "065471186dfb580711a1225ea115e8d57d82ad533e4486e27e9f41e42a68a7bd",
  "public/montaz-sieci/index.html": "cb88b80bceef5928740367eef2d5e196e6545ff05095ce6053d7cbd05b68eb42",
  "public/ru/index.html": "c22ded0339f8afa8dc5ad9512ef6ee8dacc6e32970323ffd3099ad50380ca8ed",
  "public/ru/naprawa-wifi/index.html": "9af2d4e67e4f7cf46924a33aad430c71bfe2e1814010a92e077a81b31b5f613c",
  "public/ru/naprawa-sieci/index.html": "d8212e9e277fa8becb11a6d69acfcaa1693b9288789bb80f248e363b68589626",
  "public/ru/montaz-sieci/index.html": "ac71345ed695749ef537d66a9a20dccf83130d735339f33f29a5233627c23cb8",
  "public/uk/index.html": "e5a45f12e15b3535e1ce679e30e2a17fc8e1f90a05e718162bb5230ef89d340a",
  "public/uk/naprawa-wifi/index.html": "0c642eb341556b0937a61b339a66f127d7772468dd9bc78618cc9d04b57766bb",
  "public/uk/naprawa-sieci/index.html": "d99748503041848bebde9800d5091e1a3d3c8040cd499555c910b95634c8b032",
  "public/uk/montaz-sieci/index.html": "dd8410467173d44c9404f63ecc6f2b141e2ae75fe37788bdcf76145239bdf757",
  "public/en/index.html": "804fb2c0c0de5e272bbb97e160fcb51d7ffdd28649f174fffa70f5eb00dc368c",
  "public/en/naprawa-wifi/index.html": "ffb98d5c1ca590dd4c9596a1c94d9e493a7fe0855f894e2f24c3b41b3a50d8ef",
  "public/en/naprawa-sieci/index.html": "9758c21db518e4618686489475e0d00669ce32730debc32220333938725b2845",
  "public/en/montaz-sieci/index.html": "d904625437e4cc4c8ac75c2f39a7645fcc3a5e8a053e17179f1b1674074178a8"
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
