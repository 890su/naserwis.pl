import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { businessCopy } from './business-copy.mjs';
import { businessPath } from './business-links.mjs';

const sitemap = await readFile('public/sitemap.xml', 'utf8');
let pages = 0;
for (const [locale, c] of Object.entries(businessCopy)) {
  for (const [slug, service] of [['', c.hub], ...Object.entries(c.services)]) {
    const path = businessPath(locale, slug);
    const html = await readFile(`public${path}index.html`, 'utf8');
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    assert.equal((html.match(/id="final-form"/g) || []).length, 1, path);
    assert.equal((html.match(/id="quick-form"/g) || []).length, 1, path);
    assert.ok(html.includes(`data-business-service="${slug || 'hub'}"`), path);
    assert.ok(html.includes(`href="https://naserwis.pl${path}"`), path);
    for (const property of ['og:url', 'twitter:url']) assert.ok(html.includes(`property="${property}" content="https://naserwis.pl${path}"`), `${path}: ${property}`);
    assert.equal((sitemap.match(new RegExp(`<loc>https://naserwis.pl${path}</loc>`, 'g')) || []).length, 1, path);
    assert.ok(!html.includes('itbiz.pl'), `${path}: external handoff returned`);
    for (const [lang] of Object.entries(businessCopy)) {
      const other = businessPath(lang, slug);
      await access(`public${other}index.html`);
      assert.ok(html.includes(`hreflang="${lang}" href="https://naserwis.pl${other}"`), path);
      const languageSwitch = [...html.matchAll(/<a\b[^>]*data-lang="([^"]+)"[^>]*>/g)].find(match => match[1] === lang)?.[0];
      assert.ok(languageSwitch?.includes(`href="${other}"`), `${path}: language switch ${lang}`);
    }
    for (const example of service.examples) assert.ok(html.includes(example), `${path}: ${example}`);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${path}: duplicate DOM ids`);
    const data = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    const entity = data.find(item => item['@type'] === (slug ? 'Service' : 'CollectionPage'));
    assert.equal(entity.url, `https://naserwis.pl${path}`, path);
    assert.equal(entity.name, service.h1, path);
    const rates = [...html.matchAll(/<div class="price-item"><span>([^<]+)<\/span><strong>[^<]*?(\d+) (?:zł|PLN)<\/strong><\/div>/g)].map(match => match[2]);
    assert.deepEqual(rates, ['200', '250', '150'], path);
    assert.ok(!html.includes('<section class="reviews"'), `${path}: business page became long`);
    for (const match of html.matchAll(/<a\b[^>]*href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
      const target = match[1];
      if (target.startsWith('//') || /\.[a-z]+$/.test(target)) continue;
      await access(`public${target.replace(/\/$/, '')}/index.html`);
    }
    pages++;
  }
  const home = await readFile(`public/${locale === 'pl' ? '' : `${locale}/`}index.html`, 'utf8');
  for (const slug of Object.keys(c.services)) assert.ok(home.includes(`href="${businessPath(locale, slug)}"`), locale);
}
console.log(`Business pages checked: ${pages} routes, local navigation, unique IDs, page-specific examples, reciprocal languages, schema and prices.`);
