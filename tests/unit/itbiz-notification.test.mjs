import { test, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import {
  onRequestPost,
  onRequest,
} from "../../functions/api/itbiz-notification.js";
const id = "11111111-2222-4333-8444-555555555555";
const env = {
  ITBIZ_NOTIFICATION_TOKEN: "test-relay-key",
  TELEGRAM_BOT_TOKEN: "test-bot-key",
  TELEGRAM_CHAT_ID: "test-destination",
};
const request = (
  body = { requestId: id, text: "ITBIZ.PL | Nowe zapytanie B2B\nTest only" },
  token = "test-relay-key",
) =>
  new Request("https://naserwis.pl/api/itbiz-notification", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
afterEach(() => mock.restoreAll());
test("requires relay authentication and a configured destination", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw Error("Must not send");
  });
  assert.equal(
    (await onRequestPost({ request: request(undefined, "wrong"), env })).status,
    403,
  );
  assert.equal(
    (await onRequestPost({ request: request(), env: {} })).status,
    503,
  );
  assert.equal(fetchMock.mock.calls.length, 0);
  assert.equal(onRequest().status, 405);
});
test("rejects unrelated or oversized payloads before Telegram", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => {
    throw Error("Must not send");
  });
  for (const body of [
    { requestId: id, text: "Other source" },
    { requestId: "wrong", text: "ITBIZ.PL | Nowe zapytanie B2B\nTest" },
    {
      requestId: id,
      text: "ITBIZ.PL | Nowe zapytanie B2B\n" + "a".repeat(4000),
    },
  ]) {
    assert.equal(
      (await onRequestPost({ request: request(body), env })).status,
      400,
    );
  }
  assert.equal(fetchMock.mock.calls.length, 0);
});
test("uses the existing Telegram destination and acknowledges its accepted response", async () => {
  let sent;
  mock.method(globalThis, "fetch", async (url, options) => {
    sent = JSON.parse(options.body);
    return Response.json({ ok: true });
  });
  const response = await onRequestPost({ request: request(), env });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { accepted: true, requestId: id });
  assert.equal(sent.chat_id, env.TELEGRAM_CHAT_ID);
  assert.equal(sent.text.startsWith("ITBIZ.PL"), true);
  assert.equal(sent.disable_web_page_preview, true);
  assert.equal("parse_mode" in sent, false);
});
test("does not acknowledge provider errors or an unavailable connection", async () => {
  for (const failure of ["provider", "network"]) {
    mock.method(globalThis, "fetch", async () => {
      if (failure === "network") throw Error("Unavailable");
      return Response.json({ ok: false }, { status: 429 });
    });
    assert.equal(
      (await onRequestPost({ request: request(), env })).status,
      502,
    );
    mock.restoreAll();
  }
});
