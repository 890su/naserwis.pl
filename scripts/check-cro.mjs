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
  // 2026-10-26: owner changed visit + first hour to 200 PLN; only the billing FAQ answer changed.
  // 2026-10-24: owner-approved network/internet fault and CCTV share summaries; aligned LocalBusiness descriptions.
  // 2026-10-16 owner-approved shorter homepage H1 in all four languages ("... / Montaż lub naprawa z dojazdem").
  "public/index.html": "49200a1f57759ec3fb0fb5b3e724860181398f34644c3cecb9f44254663030a6",
  "public/naprawa-wifi/index.html": "e164dc2230a93b589bd9a488f2d288afefe0ea1440a4c58b30387ec9339a09e8",
  "public/naprawa-sieci/index.html": "3aa7e88bbe79c0405a22f6316eab873f6c812e6140308fab722ca6b939fb6c3a",
  "public/montaz-sieci/index.html": "9878c7b5d54043242b967aa722898cd2261d2b2581d5587bf709221a31643dcb",
  "public/ru/index.html": "c22ded0339f8afa8dc5ad9512ef6ee8dacc6e32970323ffd3099ad50380ca8ed",
  "public/ru/naprawa-wifi/index.html": "81c84fe7cfe6a9993d2e6a7f5f619be9cc8c18bcab56324990f830344ec38045",
  "public/ru/naprawa-sieci/index.html": "06f0dcb68cf5b5a9e4ee77170efa999a937cfd0b32b86a7a81e590fb1f6fd41e",
  "public/ru/montaz-sieci/index.html": "756c4c37b152ffe9bc07e8073289052952250318d69d1cbe4561ad005c6b7322",
  "public/uk/index.html": "e5a45f12e15b3535e1ce679e30e2a17fc8e1f90a05e718162bb5230ef89d340a",
  "public/uk/naprawa-wifi/index.html": "5dcdfa5931efc9593f4687757b983e96b5a4b9904d3c4c0b1a95b8aa63be4b56",
  "public/uk/naprawa-sieci/index.html": "f16e5a4fc9108a518832d7be3940c371177df7e8cbc29a69f817f833d77d0448",
  "public/uk/montaz-sieci/index.html": "c25b4381fc5400eaea316b6331b32ced7fb33f1b77a62d6b5adbdaa298cbbc38",
  "public/en/index.html": "804fb2c0c0de5e272bbb97e160fcb51d7ffdd28649f174fffa70f5eb00dc368c",
  "public/en/naprawa-wifi/index.html": "3db8a4c8690cdd9ddf71ea01b7dc1e9435e6d922905a4bc256bbab32f6ae52f0",
  "public/en/naprawa-sieci/index.html": "11377a76d375a3bfe189859753d7a6e9d76b2ed17299a10bf709adf2b339e354",
  "public/en/montaz-sieci/index.html": "4fb6b7d0c0289a1501c6b5674bf4c5e89692dc3c8b41069050d1e1960fe3c7de"
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
        assert.equal((html.match(/class="service-proof"/g) || []).length, 1, `${file}: repair process`);
      } else {
        assert.equal((html.match(/class="delivery-panel"/g) || []).length, 1, `${file}: installation deliverables`);
      }
    }
    if (/^public(?:\/(?:ru|uk|en))?\/index\.html$/.test(file)) {
      assert.ok(!html.includes('<div class="cta-buttons">'), `${file}: rejected homepage hero buttons returned`);
    }
  }
  assert.equal(landingCount, 24);
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
  console.log('CRO guards passed: reviewed home-service SEO, preserved Ads configuration, 24 contact landings including CCTV and 4 tool routes.');
}
