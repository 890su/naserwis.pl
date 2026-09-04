// Idempotent enhancement of the committed static source, not a production export.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const version = '20260904-cro1';
const copy = {
  pl: { write: 'Napisz do nas', call: 'Zadzwoń', close: 'Zamknij', channels: 'Wybierz sposób kontaktu', hint: 'Masz pytanie? Opisz problem.', form: 'Formularz kontaktowy', chat: 'Czat na stronie', next: 'Opisz problem i lokalizację. Oddzwonimy, aby uzgodnić zakres i możliwy termin.', help: 'Wystarczy krótki opis objawów i miejscowość — szczegóły ustalimy podczas rozmowy.', submit: 'Poproś o kontakt', more: 'Masz pytanie o zakres lub cenę?', request: 'Opisz zadanie' },
  ru: { write: 'Напишите нам', call: 'Позвонить', close: 'Закрыть', channels: 'Выберите способ связи', hint: 'Есть вопрос? Опишите проблему.', form: 'Форма заявки', chat: 'Чат на сайте', next: 'Опишите проблему и местоположение. Перезвоним, чтобы согласовать объём работы и возможное время визита.', help: 'Достаточно кратко описать симптомы и указать город — детали обсудим при звонке.', submit: 'Попросить связаться', more: 'Есть вопрос об объёме работы или цене?', request: 'Описать задачу' },
  uk: { write: 'Напишіть нам', call: 'Зателефонувати', close: 'Закрити', channels: 'Виберіть спосіб зв’язку', hint: 'Є питання? Опишіть проблему.', form: 'Форма заявки', chat: 'Чат на сайті', next: 'Опишіть проблему й місце розташування. Передзвонимо, щоб узгодити обсяг роботи та можливий час візиту.', help: 'Достатньо коротко описати симптоми й указати місто — деталі обговоримо під час дзвінка.', submit: 'Попросити зв’язатися', more: 'Є питання про обсяг роботи чи ціну?', request: 'Описати завдання' },
  en: { write: 'Message us', call: 'Call', close: 'Close', channels: 'Choose how to contact us', hint: 'Have a question? Describe the issue.', form: 'Contact form', chat: 'Website chat', next: 'Describe the issue and location. We will call to agree the scope and a possible visit time.', help: 'A short description of the symptoms and your town is enough — we can discuss the details by phone.', submit: 'Request a callback', more: 'A question about the scope or price?', request: 'Describe the job' }
};

async function pages(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const file = join(root, entry.name);
    if (entry.isDirectory()) result.push(...await pages(file));
    else if (entry.name === 'index.html') result.push(file);
  }
  return result;
}

for (const file of await pages('public')) {
  let html = await readFile(file, 'utf8');
  const language = html.match(/<html[^>]*lang="([^"]+)"/)?.[1]?.split('-')[0] || 'pl';
  const t = copy[language];
  if (!t) throw new Error(`Unsupported language: ${file}`);
  // Consent styles apply to legal pages too. Asset versioning is centralized here.
  html = html.replace(/^[\t ]*<link rel="stylesheet" href="\/contact-ui\.css[^"\n]*">\r?\n?/gm, '');
  html = html.replace('</head>', `    <link rel="stylesheet" href="/contact-ui.css?v=${version}">\n</head>`);
  for (const asset of ['script.js', 'consent.js', 'styles.css', 'custom.css']) {
    html = html.replace(new RegExp('/' + asset.replace('.', '\\.') + '(?:\\?v=[^"\\s]+)?', 'g'), `/${asset}?v=${version}`);
  }
  if (html.includes('class="fab-container"')) {
    html = html.replace(/^[\t ]*<script src="\/contact-ui\.js[^"\n]*"><\/script>\r?\n?/gm, '');
    html = html.replace('</body>', `    <script src="/contact-ui.js?v=${version}"></script>\n</body>`);
    html = html.replace(/class="fab-menu"(?: id="contact-menu")?/, 'class="fab-menu" id="contact-menu"');
    html = html.replace(/(<button[^>]*class="fab fab-toggle"[^>]*)(>)/, (all, attrs) =>
      `${attrs.replace(/ aria-controls="[^"]*"/, '').replace(/ aria-label="[^"]*"/, ` aria-label="${t.write}"`).replace(/ data-close-label="[^"]*"/, '')} aria-controls="contact-menu" data-close-label="${t.close}">`);
    if (!html.includes('class="contact-toggle-label"')) {
      html = html.replace(/(<button[^>]*class="fab fab-toggle"[^>]*>)/, `$1<span class="contact-toggle-label">${t.write}</span>`);
      html = html.replace(/(<div class="fab-menu"[^>]*>)/, `$1<p class="contact-menu-title">${t.channels}</p>`);
      for (const [type, label] of Object.entries({ phone: t.call, whatsapp: 'WhatsApp', telegram: 'Telegram', chat: t.chat })) {
        html = html.replace(new RegExp(`(<(?:a|button)[^>]*class="fab fab-${type}"[^>]*>)`), `$1<span class="contact-choice-label">${label}</span>`);
      }
      html = html.replace(/(\s*<\/div>\s*)(<button[^>]*class="fab fab-toggle")/, `\n<a class="contact-form-link" href="#contact">${t.form} →</a>\n<p class="contact-status" role="status" aria-live="polite"></p>$1$2`);
      html = html.replace(/(<div class="fab-container"[^>]*>)/, `$1<div class="contact-hint" hidden><span>${t.hint}</span><button type="button" aria-label="${t.close}">×</button></div>`);
    }
    if (!html.includes('class="contact-bar"')) {
      html = html.replace('<!-- Floating Action Buttons for Quick Contact -->', `<nav class="contact-bar" aria-label="${t.channels}" hidden><a href="tel:+48453327678">${t.call}</a><button type="button" data-contact-open aria-controls="contact-menu" aria-expanded="false">${t.write}</button></nav>\n    <!-- Floating Action Buttons for Quick Contact -->`);
    }
    // Keep the API contract and all existing form IDs/SEO content. Helpers are additive.
    html = html.replace(/(<form id="(hero-form|final-form)"[^>]*>)([\s\S]*?)(<\/form>)/g, (all, start, id, body, end) => {
      body = body.replace(/(<input[^>]*name="name")([^>]*>)/, (m, prefix, suffix) => `${prefix}${suffix.replace(/ (?:minlength|maxlength|autocomplete)="[^"]*"/g, '').replace('>', ' minlength="2" maxlength="120" autocomplete="name">')}`);
      body = body.replace(/(<input[^>]*name="phone")([^>]*>)/, (m, prefix, suffix) => `${prefix}${suffix.replace(/ (?:minlength|maxlength|autocomplete|inputmode)="[^"]*"/g, '').replace('>', ' minlength="5" maxlength="60" autocomplete="tel" inputmode="tel">')}`);
      body = body.replace(/(<textarea[^>]*name="message")([^>]*>)/, (m, prefix, suffix) => `${prefix}${suffix.replace(/ (?:minlength|maxlength|aria-describedby)="[^"]*"/g, '').replace('>', ` minlength="3" maxlength="4000" aria-describedby="${id}-help">`)}`);
      if (!body.includes('class="contact-next-step"')) body = `<p class="contact-next-step">${t.next}</p>\n${body}`;
      if (!body.includes(`id="${id}-help"`)) body = body.replace('</textarea>', `</textarea><small id="${id}-help" class="contact-field-help">${t.help}</small>`);
      body = body.replace(/(<button[^>]*type="submit"[^>]*>)[\s\S]*?(<\/button>)/, `$1${t.submit}$2`);
      if (!body.includes('class="contact-alternatives"')) body += `<p class="contact-alternatives"><a href="tel:+48453327678">${t.call}</a><span aria-hidden="true"> · </span><a href="https://wa.me/48453327678" target="_blank" rel="noopener">WhatsApp</a></p>`;
      return start + body + end;
    });
    if (!html.includes('class="contact-checkpoint"')) {
      html = html.replace(/(<section[^>]*class="[^"]*faq[^>]*>)/i, `<aside class="contact-checkpoint"><p>${t.more}</p><a class="btn btn-primary" href="#contact">${t.request}</a></aside>\n$1`);
    }
  }
  await writeFile(file, html);
}
console.log('CRO markup synchronized across 16 landing and 8 legal pages.');
