import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest, onRequestPost } from '../../functions/api/contact.js';

const valid = { name: 'QA', phone: '12345', message: 'Test', lang: 'pl', formType: 'final-form' };
const request = (payload, origin = 'https://naserwis.pl') => new Request('https://naserwis.pl/api/contact', {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
});
const call = (payload, env = {}, origin) => onRequestPost({ request: request(payload, origin), env });

test('rejects invalid data and cross-origin requests without delivery', async () => {
  for (const payload of [{}, { ...valid, name: 'A' }, { ...valid, phone: '1234' }, { ...valid, message: 'ab' }, { ...valid, website: 'spam' }]) {
    const response = await call(payload); assert.equal(response.status, 400);
    assert.equal((await response.json()).success, false);
  }
  assert.equal((await call(valid, {}, 'https://other.example')).status, 403);
  assert.equal(onRequest().status, 405);
  const response = await onRequestPost({ request: new Request('https://naserwis.pl/api/contact', { method: 'POST', body: '{' }), env: {} });
  assert.equal(response.status, 400);
});

test('does not acknowledge a lead without a working delivery channel', async () => {
  assert.equal((await call(valid)).status, 502);
});

test('Turnstile enforces token, action and host when configured', async t => {
  const env = { TURNSTILE_SECRET_KEY: 'test-only', TURNSTILE_HOSTNAMES: 'naserwis.pl' };
  assert.equal((await call(valid, env)).status, 403);
  for (const result of [{ success: false }, { success: true, action: 'other', hostname: 'naserwis.pl' }, { success: true, action: 'contact', hostname: 'other.example' }]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json(result));
    assert.equal((await call({ ...valid, turnstileToken: 'test-only' }, env)).status, 403);
    t.mock.restoreAll();
  }
});

test('success requires provider acceptance, keeps lead id, locale and allowed attribution', async t => {
  const sent = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => { sent.push(JSON.parse(options.body)); return Response.json({ ok: true }); });
  for (const lang of ['pl', 'ru', 'uk', 'en']) {
    const formType = lang === 'en' ? 'quick-form' : valid.formType;
    const response = await call({ ...valid, formType, lang, attribution: { gclid: 'qa-click', secret: 'must-not-forward' } }, { TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-only' });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.success, true); assert.match(result.leadId, /^[0-9a-f-]{36}$/);
    assert.ok(sent.at(-1).text.includes(result.leadId));
    assert.ok(sent.at(-1).text.includes('gclid: qa-click'));
    assert.ok(sent.at(-1).text.includes(`Form: ${formType}`));
    assert.ok(!sent.at(-1).text.includes('must-not-forward'));
  }
  t.mock.restoreAll();
  t.mock.method(globalThis, 'fetch', async () => new Response('unavailable', { status: 503 }));
  assert.equal((await call(valid, { TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-only' })).status, 502);
});
