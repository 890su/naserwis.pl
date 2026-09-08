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
const reviewedProtectedFileHashes = {
  // 2026-09-08: reviewed canonical trailing-slash redirects; see RELEASE.md.
  'public/_redirects': '5767ef2a0a4277af272c541776b6cbf86be10d7b28a7432359f5570073b4d580'
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
  const notFound = await readFile('public/404.html', 'utf8');
  assert.ok(notFound.includes('<meta name="robots" content="noindex, follow">'), '404 page must remain noindex, follow');
  assert.ok(notFound.includes('href="/"'), '404 page must link back to the homepage');
  console.log('CRO guards passed: existing SEO/Ads unchanged, 20 enhanced landings and 4 reviewed tool routes.');
}
