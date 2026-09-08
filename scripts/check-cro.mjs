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
  // 2026-09-08: metadata aligned with Cloudflare Pages' trailing-slash URLs.
  'public/montaz-sieci/index.html': 'bb1bdad30501d1b59fc0a78711f6be06684067f16ca4fc7b7147229eeaa4662b',
  'public/naprawa-wifi/index.html': 'dd8f57e51ed702b35b786728114c01ed3c41cfcc6f9781cfb6ddeb2ca275516f',
  'public/naprawa-sieci/index.html': '4d05c796ac03ce863505618de370d7728e9aed95dd8aa811defbc3948c4240f6',
  'public/ru/montaz-sieci/index.html': '6e22217ce72a2d981a3a8731d7835ae38e814b2c378314098fb5de6a3f8ec045',
  'public/ru/naprawa-wifi/index.html': '49d69adc9bd659335a2c92deb76877ed41a6eb64e87a9949f0eec6195aeedb9b',
  'public/ru/naprawa-sieci/index.html': 'ec30e42058e6500952975b08afd43d9816ca8905a4894e855146240ef1f07c38',
  'public/uk/montaz-sieci/index.html': '1491e72f6f13a88955939bcddb485016688d618faa539b3273350d571a399274',
  'public/uk/naprawa-wifi/index.html': 'c2650f97fadf0726b463a4fa2374cdec7883cf7b2b7bdeb9c30340595da53d34',
  'public/uk/naprawa-sieci/index.html': '5048655164b650a0646f98e926ee37e0b6908f0619d54c3576a5f4504e5fabbf',
  'public/en/montaz-sieci/index.html': '3665504024e10b0508f7867b666dd9e84359b60a356908099786aede5f3db56c',
  'public/en/naprawa-wifi/index.html': 'f474e447907e79f56a516cff5e9a0829dfa016ac88bccea0cf04b6393e3e3014',
  'public/en/naprawa-sieci/index.html': 'cc71130dece86136486890053799a1b693f046ffb3b5e22b92d5efd2ac71747a'
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
