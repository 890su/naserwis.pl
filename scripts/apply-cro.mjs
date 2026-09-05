// Idempotent enhancement of the committed static source, not a production export.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const version = '20260905-consent7';
const copy = {
  pl: { write: 'Napisz do nas', call: 'Zadzwoń', close: 'Zamknij', channels: 'Wybierz sposób kontaktu', hint: 'Masz pytanie? Opisz problem.', form: 'Formularz kontaktowy', chat: 'Czat na stronie', next: 'Opisz problem i lokalizację. Oddzwonimy, aby uzgodnić zakres i możliwy termin.', help: 'Wystarczy krótki opis objawów i miejscowość — szczegóły ustalimy podczas rozmowy.', submit: 'Poproś o kontakt', more: 'Masz pytanie o zakres lub cenę?', request: 'Opisz zadanie', modalTitle: 'Wyślij zapytanie', modalIntro: 'Krótko opisz problem. Oddzwonimy, aby ustalić szczegóły i możliwy termin.', name: 'Imię', phone: 'Telefon', message: 'Co możemy naprawić?', mobileRequest: 'Wyślij zapytanie' },
  ru: { write: 'Напишите нам', call: 'Позвонить', close: 'Закрыть', channels: 'Выберите способ связи', hint: 'Есть вопрос? Опишите проблему.', form: 'Форма заявки', chat: 'Чат на сайте', next: 'Опишите проблему и местоположение. Перезвоним, чтобы согласовать объём работы и возможное время визита.', help: 'Достаточно кратко описать симптомы и указать город — детали обсудим при звонке.', submit: 'Попросить связаться', more: 'Есть вопрос об объёме работы или цене?', request: 'Описать задачу', modalTitle: 'Отправить запрос', modalIntro: 'Кратко опишите проблему. Перезвоним, чтобы уточнить детали и возможное время визита.', name: 'Имя', phone: 'Телефон', message: 'Что нужно исправить?', mobileRequest: 'Отправить запрос' },
  uk: { write: 'Напишіть нам', call: 'Зателефонувати', close: 'Закрити', channels: 'Виберіть спосіб зв’язку', hint: 'Є питання? Опишіть проблему.', form: 'Форма заявки', chat: 'Чат на сайті', next: 'Опишіть проблему й місце розташування. Передзвонимо, щоб узгодити обсяг роботи та можливий час візиту.', help: 'Достатньо коротко описати симптоми й указати місто — деталі обговоримо під час дзвінка.', submit: 'Попросити зв’язатися', more: 'Є питання про обсяг роботи чи ціну?', request: 'Описати завдання', modalTitle: 'Надіслати запит', modalIntro: 'Коротко опишіть проблему. Передзвонимо, щоб уточнити деталі й можливий час візиту.', name: 'Ім’я', phone: 'Телефон', message: 'Що потрібно виправити?', mobileRequest: 'Надіслати запит' },
  en: { write: 'Message us', call: 'Call', close: 'Close', channels: 'Choose how to contact us', hint: 'Have a question? Describe the issue.', form: 'Contact form', chat: 'Website chat', next: 'Describe the issue and location. We will call to agree the scope and a possible visit time.', help: 'A short description of the symptoms and your town is enough — we can discuss the details by phone.', submit: 'Request a callback', more: 'A question about the scope or price?', request: 'Describe the job', modalTitle: 'Send an enquiry', modalIntro: 'Briefly describe the issue. We will call to discuss the details and a possible visit time.', name: 'Name', phone: 'Phone', message: 'What can we fix?', mobileRequest: 'Send enquiry' }
};

const contactCopy = {
  pl: { question: 'Masz pytanie?', dismiss: 'Ukryj podpowiedź i animację', phone: ['Zadzwoń', 'Porozmawiajmy o problemie'], whatsapp: ['Napisz na WhatsApp', 'Wyślij opis lub zdjęcie'], telegram: ['Bot na Telegramie', 'Opisz zadanie w bocie'], chat: ['Czat na stronie', 'Napisz bez opuszczania strony'], form: ['Wyślij zapytanie', 'Otwórz krótki formularz'] },
  ru: { question: 'Есть вопрос?', dismiss: 'Скрыть подсказку и анимацию', phone: ['Позвонить', 'Обсудим задачу по телефону'], whatsapp: ['Написать в WhatsApp', 'Отправьте описание или фото'], telegram: ['Бот в Telegram', 'Опишите задачу в боте'], chat: ['Чат на сайте', 'Напишите прямо на странице'], form: ['Отправить запрос', 'Открыть короткую форму'] },
  uk: { question: 'Є питання?', dismiss: 'Приховати підказку й анімацію', phone: ['Зателефонувати', 'Обговоримо завдання телефоном'], whatsapp: ['Написати у WhatsApp', 'Надішліть опис або фото'], telegram: ['Бот у Telegram', 'Опишіть завдання в боті'], chat: ['Чат на сайті', 'Напишіть прямо на сторінці'], form: ['Надіслати запит', 'Відкрити коротку форму'] },
  en: { question: 'Have a question?', dismiss: 'Hide invitation and animation', phone: ['Call us', 'Discuss the issue by phone'], whatsapp: ['Message on WhatsApp', 'Send a description or photo'], telegram: ['Telegram bot', 'Describe the job in our bot'], chat: ['Website chat', 'Message us on this page'], form: ['Send an enquiry', 'Open the short form'] }
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
    // Owner requested the original icon-only circles, not the CRO contact card.
    html = html.replace(/<span class="contact-(?:toggle|choice)-label">[\s\S]*?<\/span>/g, '')
      .replace(/<p class="contact-menu-title">[\s\S]*?<\/p>/g, '')
      .replace(/<div class="contact-hint"[^>]*>[\s\S]*?<\/div>/g, '')
      .replace(/<nav class="contact-bar"[^>]*>[\s\S]*?<\/nav>\r?\n[\t ]*/g, '');
    if (!html.includes('class="contact-fallback"')) {
      html = html.replace(/\n?<a class="contact-form-link"[^>]*>[\s\S]*?<\/a>/g, '')
        .replace(/\n?<p class="contact-status"[^>]*>[\s\S]*?<\/p>/g, '');
      html = html.replace(/(<div class="fab-container"[^>]*>)/, `$1<div class="contact-fallback" hidden><p class="contact-status" role="status" aria-live="polite"></p><a class="contact-form-link" href="#contact">${t.form} →</a></div>`);
    }
    const contact = contactCopy[language];
    html = html.replace(/<div class="contact-invitation"[^>]*>[\s\S]*?<\/div>/g, '');
    html = html.replace(/(<div class="fab-container"[^>]*>)/, `$1<div class="contact-invitation" hidden><button type="button" data-contact-invite><strong>${contact.question}</strong><span>${t.write} →</span></button><button type="button" data-contact-dismiss aria-label="${contact.dismiss}" title="${contact.dismiss}">×</button></div>`);
    html = html.replace(/<span class="contact-tip"[^>]*>[\s\S]*?<\/span><\/span>/g, '');
    for (const channel of ['phone', 'whatsapp', 'telegram', 'chat']) {
      html = html.replace(new RegExp(`(<(?:a|button)[^>]*class="fab fab-${channel}"[^>]*)(>)`), (_all, attrs) =>
        `${attrs.replace(/ title="[^"]*"/, '').replace(/ aria-describedby="[^"]*"/, '')} aria-describedby="contact-tip-${channel}"><span class="contact-tip" id="contact-tip-${channel}" role="tooltip"><strong>${contact[channel][0]}</strong><span>${contact[channel][1]}</span></span>`);
    }
    html = html.replace(/\s*<button type="button" class="fab fab-form"[\s\S]*?<\/button>/g, '');
    const formButton = `
            <button type="button" class="fab fab-form" data-contact-modal aria-label="${contact.form[0]}" aria-describedby="contact-tip-form"><span class="contact-tip" id="contact-tip-form" role="tooltip"><strong>${contact.form[0]}</strong><span>${contact.form[1]}</span></span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4v2h12V7H6Zm0 4v2h12v-2H6Zm0 4v2h7v-2H6Z"/></svg>
            </button>`;
    html = html.replace(/(\s*<\/div>\s*<button type="button" class="fab fab-toggle")/, `${formButton}$1`);
    html = html.replace(/\s*<!-- QUICK CONTACT UI START -->[\s\S]*?<!-- QUICK CONTACT UI END -->\s*/g, '\n');
    const quickUi = `    <!-- QUICK CONTACT UI START -->
    <nav class="mobile-contact-dock" aria-label="${t.channels}">
        <a href="tel:+48453327678" class="mobile-contact-call"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.3.54 3.5.54a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.18 2.4.54 3.5a1 1 0 0 1-.24 1l-2.2 2.3Z"/></svg><span>${t.call}</span></a>
        <button type="button" data-contact-modal class="mobile-contact-request"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4v2h12V7H6Zm0 4v2h12v-2H6Zm0 4v2h7v-2H6Z"/></svg><span>${t.mobileRequest}</span></button>
    </nav>
    <div class="quick-contact-modal" id="quick-contact-modal" hidden>
        <div class="quick-contact-backdrop" data-quick-contact-close></div>
        <section class="quick-contact-dialog" role="dialog" aria-modal="true" aria-labelledby="quick-contact-title">
            <button type="button" class="quick-contact-close" data-quick-contact-close aria-label="${t.close}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
            <div class="quick-contact-heading"><span>${t.form}</span><h2 id="quick-contact-title">${t.modalTitle}</h2><p>${t.modalIntro}</p></div>
            <form id="quick-form" aria-label="${t.modalTitle}">
                <div class="quick-contact-fields">
                    <div class="form-group"><label for="quick-name">${t.name}</label><input type="text" id="quick-name" name="name" required aria-required="true" minlength="2" maxlength="120" autocomplete="name"></div>
                    <div class="form-group"><label for="quick-phone">${t.phone}</label><input type="tel" id="quick-phone" name="phone" required aria-required="true" minlength="5" maxlength="60" autocomplete="tel" inputmode="tel"></div>
                    <div class="form-group quick-contact-message"><label for="quick-message">${t.message}</label><textarea id="quick-message" name="message" required aria-required="true" minlength="3" maxlength="4000" aria-describedby="quick-form-help"></textarea><small id="quick-form-help" class="contact-field-help">${t.help}</small></div>
                </div>
                <button type="submit" class="btn btn-primary form-submit">${t.submit}</button>
                <div id="quick-form-message" role="alert" aria-live="polite"></div>
            </form>
        </section>
    </div>
    <!-- QUICK CONTACT UI END -->`;
    html = html.replace(/([\t ]*<!-- Floating Action Buttons for Quick Contact -->)/, `${quickUi}\n\n$1`);
    // Remove only the two owner-rejected homepage hero links. Other content and
    // service-specific conversion links remain unchanged.
    html = html.replace(/\s*<div class="cta-buttons">\s*<a href="#contact"[^>]*>[\s\S]*?<\/a>\s*<a href="#services"[^>]*>[\s\S]*?<\/a>\s*<\/div>/, '');
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
