const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 60;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_ATTRIBUTION_LENGTH = 300;
const ALLOWED_LANGUAGES = new Set(["pl", "ru", "uk", "en"]);
const ALLOWED_FORM_TYPES = new Set(["hero-form", "final-form", "review"]);

const messages = {
  pl: { success: "Dziękujemy! Wiadomość została wysłana. Oddzwonimy w ciągu godziny.", invalid: "Proszę poprawnie wypełnić formularz.", spam: "Nie udało się zweryfikować formularza. Spróbuj ponownie." },
  ru: { success: "Спасибо! Сообщение отправлено. Мы перезвоним в течение часа.", invalid: "Пожалуйста, корректно заполните форму.", spam: "Не удалось проверить форму. Попробуйте ещё раз." },
  uk: { success: "Дякуємо! Повідомлення надіслано. Ми передзвонимо протягом години.", invalid: "Будь ласка, коректно заповніть форму.", spam: "Не вдалося перевірити форму. Спробуйте ще раз." },
  en: { success: "Thank you! Your message has been sent. We will call you within an hour.", invalid: "Please complete the form correctly.", spam: "We could not verify the form. Please try again." }
};

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function clean(value, maximum) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maximum);
}

function cleanAttribution(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowed = [
    "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_adgroup",
    "utm_term", "utm_content", "matchtype", "device", "network", "lang",
    "gclid", "wbraid", "gbraid", "landing_page", "captured_at", "language", "service"
  ];
  return Object.fromEntries(allowed
    .map((key) => [key, clean(value[key], MAX_ATTRIBUTION_LENGTH)])
    .filter(([, item]) => item));
}

function attributionText(attribution) {
  const entries = Object.entries(attribution || {});
  if (entries.length === 0) return "";
  return `\n\n📊 Attribution\n${entries.map(([key, value]) => `${key}: ${value}`).join("\n")}`;
}

function telegramText({ leadId, name, phone, message, formType, rating, lang, attribution }) {
  const title = formType === "review" ? "📝 New private review" : "📩 New contact request";
  const review = formType === "review" ? `\n⭐ Rating: ${rating}/5` : "";
  return `${title}${review}\n\n🆔 ${leadId}\n👤 ${name}\n📞 ${phone}\n💬 ${message}\n📋 Form: ${formType}\n🌐 Language: ${lang}\n🕐 ${new Date().toISOString()}${attributionText(attribution)}`;
}

async function validateTurnstile(token, request, env) {
  // It is enabled in production by setting TURNSTILE_SECRET_KEY as a Pages
  // secret. This makes the migration usable before the widget is configured,
  // while the documentation marks Turnstile as required before go-live.
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (typeof token !== "string" || token.length === 0) return false;

  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET_KEY);
  body.append("response", token);
  body.append("remoteip", request.headers.get("CF-Connecting-IP") || "");
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  if (!response.ok) return false;
  const result = await response.json();
  if (!result.success || result.action !== "contact") return false;

  const allowedHosts = (env.TURNSTILE_HOSTNAMES || "")
    .split(",").map((host) => host.trim()).filter(Boolean);
  return allowedHosts.length === 0 || allowedHosts.includes(result.hostname);
}

async function sendTelegram(data, env) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: telegramText(data), disable_web_page_preview: true })
  });
  return response.ok;
}

async function sendEmail(data, env) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.EMAIL_TO) return false;
  const subject = data.formType === "review" ? `Private review: ${data.rating}/5` : "New request from NaSerwis.pl";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [env.EMAIL_TO], subject, text: telegramText(data) })
  });
  return response.ok;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return reply({ success: false, message: "Forbidden" }, 403);

  let payload;
  try { payload = await request.json(); } catch { return reply({ success: false, message: messages.pl.invalid }, 400); }

  const lang = ALLOWED_LANGUAGES.has(payload.lang) ? payload.lang : "pl";
  const text = messages[lang];
  const data = {
    leadId: crypto.randomUUID(),
    name: clean(payload.name, MAX_NAME_LENGTH),
    phone: clean(payload.phone, MAX_PHONE_LENGTH),
    message: clean(payload.message, MAX_MESSAGE_LENGTH),
    formType: ALLOWED_FORM_TYPES.has(payload.formType) ? payload.formType : "hero-form",
    rating: Math.min(5, Math.max(1, Number.parseInt(payload.rating, 10) || 1)),
    attribution: cleanAttribution(payload.attribution),
    lang
  };

  if (payload.website || data.name.length < 2 || data.phone.length < 5 || data.message.length < 3) {
    return reply({ success: false, message: text.invalid }, 400);
  }

  if (!(await validateTurnstile(payload.turnstileToken, request, env))) {
    return reply({ success: false, message: text.spam }, 403);
  }

  const delivered = await Promise.all([sendTelegram(data, env), sendEmail(data, env)]);
  if (!delivered.some(Boolean)) {
    console.error("Contact delivery failed: configure Telegram and/or Resend secrets.");
    return reply({ success: false, message: "Wystąpił błąd podczas wysyłania wiadomości. Proszę zadzwonić: +48 453 327 678" }, 502);
  }

  return reply({ success: true, message: text.success, leadId: data.leadId });
}

export function onRequest() {
  return reply({ success: false, message: "Method not allowed" }, 405);
}
