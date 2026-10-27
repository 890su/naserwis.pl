// Internal, authenticated relay. It shares the existing operator's Telegram
// destination without exporting its bot credential to the other website.
const reply = (body, status) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });

export async function onRequestPost({ request, env }) {
  if (
    !env.ITBIZ_NOTIFICATION_TOKEN ||
    !env.TELEGRAM_BOT_TOKEN ||
    !env.TELEGRAM_CHAT_ID
  )
    return reply({ accepted: false }, 503);
  if (
    request.headers.get("Authorization") !==
    `Bearer ${env.ITBIZ_NOTIFICATION_TOKEN}`
  )
    return reply({ accepted: false }, 403);

  let payload;
  try {
    const raw = await request.text();
    if (raw.length > 16_000) return reply({ accepted: false }, 413);
    payload = JSON.parse(raw);
  } catch {
    return reply({ accepted: false }, 400);
  }
  if (
    !payload ||
    typeof payload.text !== "string" ||
    !payload.text.startsWith("ITBIZ.PL | Nowe zapytanie B2B\n") ||
    payload.text.length > 4000 ||
    typeof payload.requestId !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      payload.requestId,
    )
  )
    return reply({ accepted: false }, 400);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          text: payload.text,
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(8_000),
      },
    );
    const result = await response.json();
    if (!response.ok || result.ok !== true)
      return reply({ accepted: false }, 502);
    return reply({ accepted: true, requestId: payload.requestId }, 201);
  } catch {
    // Never log the provider URL because it contains the bot credential.
    return reply({ accepted: false }, 502);
  }
}

export function onRequest() {
  return reply({ accepted: false }, 405);
}
