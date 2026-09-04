// Safe production verification: only GETs and an invalid POST, never a lead.
import { readFile, readdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin = 'https://naserwis.pl';
async function pages(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) result.push(...await pages(path));
    else if (entry.name === 'index.html') result.push(path);
  }
  return result;
}
const normalized = text => text.replace(/\r\n/g, '\n');
function seo(html) {
  return [...normalized(html).matchAll(/<title>[\s\S]*?<\/title>|<meta[^>]*name="description"[^>]*>|<link[^>]*(?:rel="canonical"|hreflang="[^"]+")[^>]*>|<h1\b[^>]*>[\s\S]*?<\/h1>|<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g)].map(m => m[0]);
}
async function get(path) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, path);
  assert.equal(new URL(response.url).origin, origin, 'Unexpected redirect away from production');
  return response.text();
}
const files = await pages('public');
for (let index = 0; index < files.length; index += 4) {
  await Promise.all(files.slice(index, index + 4).map(async file => {
    const local = await readFile(file, 'utf8');
    const route = file.replace(/^public/, '').replace(/index.html$/, '');
    const live = await get(route);
    assert.deepEqual(seo(live), seo(local), `Production SEO mismatch: ${route}`);
    assert.ok(live.includes('/contact-ui.css?v=20260904-round2'), route);
    if (local.includes('class="fab-container"')) {
      assert.ok(!live.includes('class="contact-toggle-label"'), route);
      assert.ok(!live.includes('class="contact-bar"'), route);
      assert.ok(live.includes('/contact-ui.js?v=20260904-round2'), route);
    }
  }));
}
for (const asset of ['contact-ui.js', 'contact-ui.css', 'consent.js', 'script.js', 'styles.css', 'custom.css', 'site-config.js', 'robots.txt', 'sitemap.xml']) {
  const live = normalized(await get('/' + asset));
  const local = normalized(await readFile('public/' + asset, 'utf8'));
  if (asset === 'robots.txt' && live !== local) {
    // The existing zone prepends its Managed robots content to an exported
    // source that already contains that same block. Do not mutate zone policy.
    assert.ok(live.endsWith(local), 'Production robots source was altered');
    const marker = local.indexOf('# robots.txt for NaSerwis.pl');
    assert.ok(marker > 0, 'Missing known robots source boundary');
    assert.equal(live.slice(0, -local.length).trim(), local.slice(0, marker).trim(), 'Unexpected Cloudflare robots prefix');
  } else assert.equal(live, local, `Production asset mismatch: ${asset}`);
}
assert.equal((await fetch(origin + '/api/contact', { signal: AbortSignal.timeout(20000) })).status, 405);
const invalid = await fetch(origin + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: '{}', signal: AbortSignal.timeout(20000) });
assert.equal(invalid.status, 400); assert.equal((await invalid.json()).success, false);
console.log('Production smoke passed: 24 page SEO/UI checks, 8 exact assets + unchanged robots with verified managed prefix, API 405/400. No leads submitted.');
