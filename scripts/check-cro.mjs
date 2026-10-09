// Immutable pre-CRO SEO/Ads fixture, usable in shallow Cloudflare checkouts.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
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
// 2026-10-09: home-only scope, revised metadata/H1, matching FAQ/schema.
// Canonicals and reciprocal hreflang are preserved; original fixture is immutable.
const reviewedPageHashes = {
  "public/index.html": "7e28a44935d91b0d6ee85ed7fe4f67eecad40d95ef4a22df06bc47acd82ec562",
  "public/naprawa-wifi/index.html": "484550efda9672e918be14be40aa26e78a5c330920b6d34789102d6e70134b6d",
  "public/naprawa-sieci/index.html": "86bff41e757f95b6329f37cbe7e4ee59bca0e213ff52e0243c1ff2eec1bce11d",
  "public/montaz-sieci/index.html": "3da2b36af913671d60cf635e86cf49b2abfd194afb5122bfc10f3e5fac9d1226",
  "public/ru/index.html": "edf1fae8c2e0a124f7bc540c9dc58abbaaa4efed26a1479fb71a013221afa8dd",
  "public/ru/naprawa-wifi/index.html": "dbf44021d01bcfa51191580c0c867f5b23a48f3bcffe0b3050aa1e073d7181f5",
  "public/ru/naprawa-sieci/index.html": "8c80f86195a6bd533a7f641f76c47e86c13dac0c41e318e33aa13d3dd52af8e9",
  "public/ru/montaz-sieci/index.html": "6d8d7151a77a71fa59a9360788941788600afbf17ee8f95e5e73b6c03e14deda",
  "public/uk/index.html": "3fb9b274699dce39491382a702d08c728424935d9a89a7062a1d4ef8cb04c858",
  "public/uk/naprawa-wifi/index.html": "9055c65b67c3743b668fcb0cd6dfc8ed35e5eaf103eb8e6419bc7e350bc19786",
  "public/uk/naprawa-sieci/index.html": "01904af35a537e1a8f54d7203fed19e3ca5e0a62a98f99087924ec0a867aaa1f",
  "public/uk/montaz-sieci/index.html": "fe6b2b6a3ef4d14aa5b5703e9b1445cdebc6b94cbadaad0995e57932177e85d5",
  "public/en/index.html": "f67ff55a447654f59885e29f7138052caf2abc30b277f2ad67cfacc4acb0e7f5",
  "public/en/naprawa-wifi/index.html": "459257950cc0b0246e2b5603c3c1fad824b2a30dd413e126b1c47ebfd9ceb1a5",
  "public/en/naprawa-sieci/index.html": "81c4f7fb6e96e6fe24941b6abd5d26ac5a52420be904209eb0ed9c02430bae9e",
  "public/en/montaz-sieci/index.html": "18b683d8f926536ad72f6307d1cf04a2d7436db1f31e292261e077a6f5e90916"
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
    assert.equal((html.match(/href="\/contact-ui.css/g) || []).length, 1, file);
    if (!html.includes('class="fab-container"')) continue;
    landingCount++;
    for (const value of ['id="contact-menu"', 'class="contact-fallback"', 'class="contact-invitation"', 'src="/contact-ui.js']) {
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
      assert.ok(html.includes('/script.js?v=20261009-home1'), `${file}: intent script cache version`);
      assert.ok(html.includes('/custom.css?v=20261009-home1'), `${file}: intent styles cache version`);
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
