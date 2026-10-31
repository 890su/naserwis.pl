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
  // 2026-10-31 owner-approved logo: only the LocalBusiness image URL changes to the versioned brand plate; all other SEO fields verified against HEAD.
  // 2026-10-27 owner-requested concise copy: only Service descriptions and matching visible FAQ changed; metadata/H1/URLs compared with prior release.
  // 2026-10-26 local business pages: existing Service metadata retained; only the audience FAQ answer now accepts organisations locally.
  // 2026-10-26: restored conditional nearby short job from 200 PLN and standard visit from 250 PLN; only the billing FAQ answer changed.
  // 2026-10-24: owner-approved network/internet fault and CCTV share summaries; aligned LocalBusiness descriptions.
  // 2026-10-16 owner-approved shorter homepage H1 in all four languages ("... / Montaż lub naprawa z dojazdem").
  "public/index.html": "e58a5fd007308adaac6d4fc0d20b8776c0561ea76dd2b16f4cd990ef68871836",
  "public/naprawa-wifi/index.html": "9af1b877763b203c2b60b95b0b8b4b8be986b8a229afa7b7608215ed83d0d59c",
  "public/naprawa-sieci/index.html": "d9ec6c61c60960f07da0897b8ec0a0dfb0831f449668e971a78229f04ba6e999",
  "public/montaz-sieci/index.html": "bc029de07f93bec84f784ccbd8fed76ba92aba452f895081ef1537ee40fd7a2a",
  "public/ru/index.html": "507e1d303507767d9d5bb921f1ad9d5d415fdbad73c15bf1b83be8064ea04cdc",
  "public/ru/naprawa-wifi/index.html": "7b68a788915be005711a738c4a65dcff7f1c6e377686b5729d5a19109cec32d4",
  "public/ru/naprawa-sieci/index.html": "3abfc4682caa3a450647b3523e81b507b3c0a9d0c0a414abf4e9e4ef53f978c7",
  "public/ru/montaz-sieci/index.html": "9e534bd69e20e8a77b15d0b888273b3ceb275e3c9fe09d0e9bb1b6f0cba37d10",
  "public/uk/index.html": "712626feb08032ff6cdd3547e3218220eb7549f356fba506d574f94b7dd728f2",
  "public/uk/naprawa-wifi/index.html": "b2266a59b1e33aeeb8bd24a6a2f0588b12bb417593130ed27d4159d597b27b6e",
  "public/uk/naprawa-sieci/index.html": "b4c1834fec35b0568ed8464439749fcc6dd4419597e5cfb29dcc97e1f0008eea",
  "public/uk/montaz-sieci/index.html": "1b20c900824472e298665c2a6c8cd64bdbc1c69a78efc50b220686dfc15a8431",
  "public/en/index.html": "344b75a05ae823d810885c7a43ef5f47f6dfa17b4f761c2981a7118b6ee7eae4",
  "public/en/naprawa-wifi/index.html": "503c9f92d55d8d1b185f0697b9069f45d6e3b33e5d4e48d5bf808a32e171b0ed",
  "public/en/naprawa-sieci/index.html": "ba33de85629444e8872cbc5389cd7b9643027929323aa14291ed0f5779526a45",
  "public/en/montaz-sieci/index.html": "78a63eb3a4e7f50b98324d5481b0aca5d35b365381441f7c16dd9ff000c88127"
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
