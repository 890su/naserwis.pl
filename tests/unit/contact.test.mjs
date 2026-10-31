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
    const response = await call({ ...valid, formType, lang, intent: 'weak-wifi', attribution: { gclid: 'qa-click', intent: 'weak-wifi', secret: 'must-not-forward' } }, { TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-only' });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.success, true); assert.match(result.leadId, /^[0-9a-f-]{36}$/);
    assert.ok(sent.at(-1).text.includes(result.leadId));
    assert.ok(sent.at(-1).text.includes('gclid: qa-click'));
    assert.ok(sent.at(-1).text.includes('Intent: weak-wifi'));
    assert.ok(sent.at(-1).text.includes(`Form: ${formType}`));
    assert.ok(!sent.at(-1).text.includes('must-not-forward'));
  }
  t.mock.restoreAll();
  t.mock.method(globalThis, 'fetch', async () => new Response('unavailable', { status: 503 }));
  assert.equal((await call(valid, { TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-only' })).status, 502);
});

test('intent is allowlisted in both the lead and attribution payload', async t => {
  let delivery;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    delivery = JSON.parse(options.body);
    return Response.json({ ok: true });
  });
  const response = await call({
    ...valid,
    intent: '<img src=x onerror=alert(1)>',
    attribution: { intent: '<script>alert(1)</script>', gclid: 'safe-click' }
  }, { TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-only' });
  assert.equal(response.status, 200);
  assert.ok(delivery.text.includes('gclid: safe-click'));
  assert.ok(!delivery.text.includes('img src'));
  assert.ok(!delivery.text.includes('script'));
});

test('staged enquiries allow an omitted name and deliver sanitized details through both channels', async t => {
  const sent = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    sent.push(JSON.parse(options.body));
    return Response.json({ ok: true });
  });
  const env = { TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-only', RESEND_API_KEY: 'test-only', EMAIL_FROM: 'qa@example.test', EMAIL_TO: 'qa@example.test' };
  for (const name of ['', 'Я']) {
    const response = await call({ ...valid, name, phone: 'qa@example.test', contactFlow: 'staged', requestType: 'setup', urgency: 'soon', address: ' Warszawa\u0000 ' }, env);
    assert.equal(response.status, 200);
    for (const delivery of sent.slice(-2)) {
      assert.match(delivery.text, /Request type: setup/);
      assert.match(delivery.text, /Urgency: soon/);
      assert.match(delivery.text, /Address: Warszawa/);
      assert.ok(!delivery.text.includes('\u0000'));
    }
  }
  assert.equal((await call({ ...valid, name: '', contactFlow: 'staged', formType: 'review' }, env)).status, 400);
  assert.equal((await call({ ...valid, name: '', contactFlow: 'compact', formType: 'quick-form', address: 'Warszawa' }, env)).status, 200);
  assert.match(sent.at(-1).text, /Address: Warszawa/);
  assert.equal((await call({ ...valid, name: '', contactFlow: 'compact', formType: 'review' }, env)).status, 400);
  await call({ ...valid, contactFlow: 'staged', requestType: 'unknown', urgency: 'unknown' }, env);
  assert.ok(!sent.at(-1).text.includes('unknown'));
});

test('verified enquiries enter the shared journal before notification, reviews do not', async t => {
  const calls = [];
  const journal = [];
  t.mock.method(globalThis, 'fetch', async () => {
    calls.push('notification'); return Response.json({ok: true});
  });
  const env = {
    TELEGRAM_BOT_TOKEN: 'test-only', TELEGRAM_CHAT_ID: 'test-only',
    JOURNAL_DB: {prepare(sql) {return {bind(...values) {return {async run() {
      assert.match(sql, /INSERT INTO lead_journal/); calls.push('journal'); journal.push(values);
    }}}}}},
  };
  const response = await call({...valid, attribution: {utm_source: 'chatgpt.com'}}, env);
  assert.equal(response.status, 200);
  assert.deepEqual(calls, ['journal', 'notification']);
  const result = await response.json();
  const payload = JSON.parse(journal[0][3]);
  assert.equal(payload.site_brand, 'NaSerwis');
  assert.equal(payload.request_id, result.leadId);
  assert.equal(payload.attribution.utm_source, 'chatgpt.com');
  await call({...valid, formType: 'review'}, env);
  assert.equal(journal.length, 1);
});

test('a journal storage failure is reported before sending a duplicate notification', async t => {
  let sent = false;
  t.mock.method(globalThis, 'fetch', async () => {sent = true; return Response.json({ok: true});});
  const env = {JOURNAL_DB: {prepare() {throw new Error('Offline');}}};
  const response = await call(valid, env);
  assert.equal(response.status, 503);
  assert.equal(sent, false);
});
