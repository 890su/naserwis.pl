import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { onRequest } from '../../functions/_middleware.js';

const run = (url, method = 'GET', next = () => { throw new Error('Unexpected pass-through'); }) =>
  onRequest({ request: new Request(url, { method }), next });

test('www pages preserve locale, nested path and encoded attribution in one permanent redirect', () => {
  for (const path of ['/', '/ru/naprawa-wifi/', '/uk/poradnik/siec-lan-w-domu-przed-remontem/']) {
    const query = '?utm_source=google&gclid=a%2Bb%2Fc&intent=wifi_coverage';
    for (const method of ['GET', 'HEAD']) {
      const response = run('https://www.naserwis.pl' + path + query, method);
      assert.equal(response.status, 301);
      assert.equal(response.headers.get('location'), 'https://naserwis.pl' + path + query);
    }
  }
  assert.equal(run('http://www.naserwis.pl/ru/').headers.get('location'), 'https://naserwis.pl/ru/');
});

test('canonical host, previews and API requests pass through without a redirect loop', () => {
  const sentinel = new Response('downstream', { status: 202 });
  for (const url of ['https://naserwis.pl/', 'https://naserwis.pl/api/contact', 'https://preview.naserwis-pl.pages.dev/en/', 'http://localhost:8846/']) {
    assert.equal(run(url, 'POST', () => sentinel), sentinel);
  }
  const response = run('https://www.naserwis.pl/api/contact', 'POST');
  assert.equal(response.status, 308); // Preserve a submitted method and body.
  assert.equal(response.headers.get('location'), 'https://naserwis.pl/api/contact');
});

test('every published PHP redirect remains available with query parameters and without host chains', async () => {
  const rules = (await readFile(new URL('../../public/_redirects', import.meta.url), 'utf8')).trim().split(/\r?\n/);
  for (const line of rules) {
    const [from, to, code] = line.split(/\s+/);
    for (const host of ['naserwis.pl', 'www.naserwis.pl']) {
      const response = run(`https://${host}${from}?utm_source=legacy`);
      assert.equal(response.status, Number(code));
      assert.equal(response.headers.get('location'), `https://naserwis.pl${to}?utm_source=legacy`);
    }
  }
});
