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
  // 2026-10-22: owner-approved homepage titles/descriptions and matching LocalBusiness descriptions.
  // 2026-10-16 owner-approved shorter homepage H1 in all four languages ("... / Montaż lub naprawa z dojazdem").
  "public/index.html": "2dbdac6319f7e3cce2aaf8a2785f94af627ad35592b19613571426077331d375",
  "public/naprawa-wifi/index.html": "e164bd28ffbfbb7641859f25434e604578ef690b11255f64012656f1c370e9f9",
  "public/naprawa-sieci/index.html": "64b3da36a5e717c2aea0b3b205786a712555f7f98391b44408b3e01a6ccd4960",
  "public/montaz-sieci/index.html": "d9ea5eeed46f5bedd8759c4cc7ca693bcd14def95c99ff4f6df3f4875aba51f7",
  "public/ru/index.html": "4d41ff400e3aaffe506c12bef325285c9ba9623044953ff2a7fe4887ed934edb",
  "public/ru/naprawa-wifi/index.html": "db31e4f9f299cb0766eee9749d6ec3de667dc6888fa71d659eaa36d437b30cf0",
  "public/ru/naprawa-sieci/index.html": "c83b202d25033cd2a43c3189fe5414a528d17080de9a5bc247adcde58e9292ec",
  "public/ru/montaz-sieci/index.html": "32e7a2391fd2b5ca0fb5711d444e26eccc8838c3d0043df599f2b5fff61dd3bf",
  "public/uk/index.html": "90dfa5b44ff19b81a05384709dbd8abfe96082a7650c9aae00d903a875220a3f",
  "public/uk/naprawa-wifi/index.html": "c72ae6cdbff26321f15e880c0163201cf951e7b54439292a4bcc9cee5382a7b0",
  "public/uk/naprawa-sieci/index.html": "0d07e527a1f3a8e0fe84b69aa8991ed9d6f204179d7f38d202151a332cb3db70",
  "public/uk/montaz-sieci/index.html": "599215918bc7609860b06602a37b6f74a533d1bf4aa51cb7ba9f5044cd5f07dc",
  "public/en/index.html": "a6bf3a557dba6b3dd16c9ed834e14b465351d5b9ff95e74f6b0e26a36dee593f",
  "public/en/naprawa-wifi/index.html": "a587fed9d0e55df4cdf90a7779b637199bb80183d75171a405f58ce5de384cd6",
  "public/en/naprawa-sieci/index.html": "a7869fabf1a0e2837c2023faf77d56675ca64fd960612c875263d50b857fd914",
  "public/en/montaz-sieci/index.html": "8b0453df8963a2ee71e3c500cdc4625df0659f3f8bc3210bd4d44b0142f9c948"
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
  assert.equal(landingCount, 20);
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
  console.log('CRO guards passed: reviewed home-service SEO, preserved Ads configuration, 20 landings and 4 tool routes.');
}
