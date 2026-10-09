import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const routes = ['', 'naprawa-wifi/', 'naprawa-sieci/', 'montaz-sieci/'];
const sitemap = await readFile('public/sitemap.xml', 'utf8');
const forbidden = /\bSLA\b|\bRACK\b|dojazd 2h|w ciągu 2 godzin|zewnętrzny dział IT|dla małych firm|для малых фирм|для малих фірм|small businesses/i;
for (const locale of ['pl', 'ru', 'uk', 'en']) {
  const prefix = locale === 'pl' ? '' : `${locale}/`;
  for (const route of routes) {
    const file = `public/${prefix}${route}index.html`;
    const html = await readFile(file, 'utf8');
    const canonical = `https://naserwis.pl/${prefix}${route}`;
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), file);
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), file);
    for (const language of ['pl', 'ru', 'uk', 'en', 'x-default']) {
      const translatedPrefix = ['pl', 'x-default'].includes(language) ? '' : `${language}/`;
      assert.ok(html.includes(`<link rel="alternate" hreflang="${language}" href="https://naserwis.pl/${translatedPrefix}${route}">`), file);
    }
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file);
    assert.ok(!forbidden.test(html), `${file}: prohibited B2B sale or response promise`);
    assert.ok(!html.includes('class="segment-price"'), `${file}: per-service fee returned`);
    assert.ok(!html.includes('class="package-name"'), `${file}: business subscriptions returned`);
    for (const className of ['billing-rule', 'billing-condition', 'billing-project', 'price-disclaimer']) {
      assert.equal(html.split(`class="${className}"`).length - 1, 1, `${file}: ${className}`);
    }
    const priceValues = [...html.matchAll(/<(?:strong|div)[^>]*(?:class="price-value"[^>]*)?>((?:od|от|від|from) \d+ (?:zł|PLN))<\/(?:strong|div)>/g)].map(m => m[1].match(/\d+/)[0]);
    assert.deepEqual(priceValues, ['250', '150', '200'], `${file}: only three alternative visit/hour rates`);
    for (const match of html.matchAll(/<a\b[^>]*href="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
      const path = match[1];
      if (path.startsWith('//') || /\.[a-z]+$/.test(path)) continue;
      await access(`public${path.replace(/\/$/, '')}/index.html`);
    }
    if (!route) {
      const catalog = html.match(/<div class="home-services-grid">([\s\S]*?)<\/div>\s*<p class="home-secondary-scope">/)?.[1];
      assert.ok(catalog, file);
      assert.equal((catalog.match(/class="home-service-link"/g) || []).length, 6, file);
      assert.ok(!/(?:\d+\s+(?:zł|PLN)\b|price-value)/.test(catalog), `${file}: scope must not look like extra charges`);
      continue;
    }
    const faq = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(s => s['@type'] === 'FAQPage');
    const visible = [...html.matchAll(/<summary class="faq-question">([\s\S]*?)<\/summary><p class="faq-answer">([\s\S]*?)<\/p>/g)].map(m => [decode(m[1]), decode(m[2])]);
    assert.deepEqual(faq.mainEntity.map(q => [q.name, q.acceptedAnswer.text]), visible, `${file}: visible FAQ must equal schema`);
    const service = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1])).find(s => s['@type'] === 'Service');
    assert.ok(!/priceSpecification|"price"/.test(JSON.stringify(service)), `${file}: schema must not imply a separate per-service charge`);
  }
}
const redirects = await readFile('public/_redirects', 'utf8');
for (const line of redirects.trim().split(/\r?\n/)) {
  const [from, to, status] = line.split(/\s+/);
  assert.equal(status, '301');
  assert.ok(to.endsWith('/'), `${from}: redirect directly to canonical URL`);
}
console.log('Home SEO checked: 16 commercial locales, billing, FAQ/schema, scope, links, hreflang and legacy redirects.');
