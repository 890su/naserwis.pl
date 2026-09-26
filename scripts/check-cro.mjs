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
const reviewedPageHashes = {
  // 2026-09-26: reviewed price-only schema changes: first-hour visit 250 PLN
  // and localized from/to project estimates. Other SEO fields are unchanged.
  // 2026-09-08: metadata aligned with Cloudflare Pages' trailing-slash URLs.
  'public/montaz-sieci/index.html': '26a8a423ed2264895a2d5a633dd781b1c678df6ee4a665db8a15872f95a91e2e',
  'public/naprawa-wifi/index.html': 'dd8f57e51ed702b35b786728114c01ed3c41cfcc6f9781cfb6ddeb2ca275516f',
  'public/naprawa-sieci/index.html': '05fad22614ed8310af874cf1b6c1d57c725cb585d53a6fa0a35169a12f26adb1',
  'public/ru/montaz-sieci/index.html': '33dd2164df3c5a6014a31adde22b89f59ef2970c5c0f12bff3564f398870e0d5',
  'public/ru/naprawa-wifi/index.html': '49d69adc9bd659335a2c92deb76877ed41a6eb64e87a9949f0eec6195aeedb9b',
  'public/ru/naprawa-sieci/index.html': '8ddd2dd06eb11a28671dde37e405aa4291898136e0f0fa38a175cc5de2f94ee2',
  'public/uk/montaz-sieci/index.html': 'e925e2424a8a33dc3ae1340819bc7515e989366f8a8299585f7428a375239892',
  'public/uk/naprawa-wifi/index.html': 'c2650f97fadf0726b463a4fa2374cdec7883cf7b2b7bdeb9c30340595da53d34',
  'public/uk/naprawa-sieci/index.html': '00d10fa5ffcd186ed0dc2117defbbbd4b75c2c35daa2c61cf50a10a358fa4e5c',
  'public/en/montaz-sieci/index.html': 'b5778f84d77b4a61df7ff05999dfe4a825c8489f967842cc125b2b1d09397324',
  'public/en/naprawa-wifi/index.html': 'f474e447907e79f56a516cff5e9a0829dfa016ac88bccea0cf04b6393e3e3014',
  'public/en/naprawa-sieci/index.html': '936810897ddca1fc7752fe911552f309497ca14f7c8a33e83ec6f646d33e7763'
};
const reviewedProtectedFileHashes = {};
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
      assert.ok(html.includes('/script.js?v=20260916-intent1'), `${file}: intent script cache version`);
      assert.ok(html.includes('/custom.css?v=20260916-intent1'), `${file}: intent styles cache version`);
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
  console.log('CRO guards passed: existing SEO/Ads unchanged, 20 enhanced landings and 4 reviewed tool routes.');
}
