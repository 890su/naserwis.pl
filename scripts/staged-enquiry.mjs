// Shared, idempotent form markup for the four commercial locales.
const copy = {
  pl: {
    problem: 'Co się stało?', placeholder: 'Opisz problem lub wybierz podobną sytuację poniżej…', examples: 'Wybierz podobną sytuację', pause: 'Pauza', resume: 'Wznów', all: 'Wszystkie przykłady', less: 'Zwiń',
    type: 'Czego potrzebujesz?', broken: 'Działało i przestało', setup: 'Potrzebuję konfiguracji lub montażu', urgency: 'Jak pilna jest sprawa?', urgent: 'Pilne', today: 'W najbliższym czasie', normal: 'Nie spieszy się',
    contact: 'Kontakt do Ciebie', contactHint: 'Telefon, e-mail lub @Telegram', extras: 'Dodaj imię i adres', optional: 'nieobowiązkowe', name: 'Imię', address: 'Adres lub miejscowość', submit: 'Poproś o kontakt', next: 'Podaj kontakt — ustalimy szczegóły i możliwy termin.', noJs: 'Aby wysłać formularz, włącz JavaScript lub zadzwoń.',
    examplesByService: [
      ['Wi-Fi zrywa połączenie', 'Internet nie działa po zmianie routera', 'Wi-Fi nie dociera do drugiego pokoju', 'Gniazdo sieciowe nie działa', 'Chcę skonfigurować router lub Mesh', 'Potrzebuję okablowania w mieszkaniu', 'Kamera nie pokazuje obrazu w telefonie', 'Chcę podłączyć nowe urządzenie'],
      ['Wi-Fi zrywa połączenie', 'Wi-Fi nie dociera do drugiego pokoju', 'Internet działa wolno wieczorem', 'Telefon działa, a laptop nie ma internetu', 'Po zmianie routera nie ma internetu', 'Chcę skonfigurować router lub Mesh'],
      ['Gniazdo sieciowe nie działa', 'Po kablu nie ma internetu', 'Połączenie działa tylko przy poruszaniu kablem', 'Prędkość po kablu spadła do 100 Mb/s', 'Trzeba wymienić wtyk RJ45', 'Chcę sprawdzić istniejące okablowanie'],
      ['Potrzebuję okablowania przed remontem', 'Chcę gniazda RJ45 w kilku pokojach', 'Potrzebuję przewodu do punktu Wi-Fi', 'Chcę uporządkować przewody w domu', 'Potrzebuję kabla do kamery', 'Chcę podłączyć urządzenia w nowym mieszkaniu'],
      ['Kamera nie pokazuje obrazu', 'Nie widzę kamer w telefonie', 'Rejestrator nie zapisuje nagrań', 'Obraz z kamery zanika w nocy', 'Chcę zamontować nowe kamery', 'Chcę rozbudować istniejący monitoring', 'Potrzebuję konfiguracji powiadomień', 'Kamera nie działa po zmianie routera']
    ]
  },
  ru: {
    problem: 'Что случилось?', placeholder: 'Опишите проблему или выберите похожую ситуацию ниже…', examples: 'Выберите похожую ситуацию', pause: 'Пауза', resume: 'Продолжить', all: 'Все примеры', less: 'Свернуть',
    type: 'Что нужно сделать?', broken: 'Работало, но перестало', setup: 'Нужно настроить', urgency: 'Насколько срочно?', urgent: 'Срочно', today: 'В ближайшее время', normal: 'Сроки не горящие',
    contact: 'Контакт для связи', contactHint: 'Телефон, e-mail или @Telegram', extras: 'Добавить имя и адрес', optional: 'необязательно', name: 'Имя', address: 'Адрес или населённый пункт', submit: 'Отправить заявку', next: 'Оставьте контакт — обсудим детали и возможное время.', noJs: 'Для отправки формы включите JavaScript или позвоните.',
    examplesByService: [
      ['Wi-Fi постоянно отключается', 'После замены роутера нет интернета', 'Wi-Fi не ловит в другой комнате', 'Не работает сетевая розетка', 'Нужно настроить роутер или Mesh', 'Нужно проложить кабель в квартире', 'Не вижу камеры в телефоне', 'Нужно подключить новое устройство'],
      ['Wi-Fi постоянно отключается', 'Wi-Fi не ловит в другой комнате', 'По вечерам медленно работает интернет', 'На телефоне интернет есть, на ноутбуке нет', 'После замены роутера нет интернета', 'Нужно настроить роутер или Mesh'],
      ['Не работает сетевая розетка', 'Нет интернета по кабелю', 'Связь появляется, если пошевелить кабель', 'Скорость по кабелю упала до 100 Мбит/с', 'Нужно заменить разъём RJ45', 'Нужно проверить существующие кабели'],
      ['Нужно проложить кабели перед ремонтом', 'Нужны розетки RJ45 в нескольких комнатах', 'Нужен кабель для точки Wi-Fi', 'Нужно привести в порядок домашние кабели', 'Нужно проложить кабель к камере', 'Нужно подключить устройства в новой квартире'],
      ['Нет изображения с камеры', 'Не вижу камеры в телефоне', 'Регистратор не записывает видео', 'Изображение с камеры пропадает ночью', 'Нужно установить новые камеры', 'Хочу расширить видеонаблюдение', 'Нужно настроить уведомления', 'После замены роутера камера не работает']
    ]
  },
  uk: {
    problem: 'Що сталося?', placeholder: 'Опишіть проблему або виберіть схожу ситуацію нижче…', examples: 'Виберіть схожу ситуацію', pause: 'Пауза', resume: 'Продовжити', all: 'Усі приклади', less: 'Згорнути',
    type: 'Що потрібно зробити?', broken: 'Працювало й перестало', setup: 'Потрібно налаштувати', urgency: 'Наскільки терміново?', urgent: 'Терміново', today: 'Найближчим часом', normal: 'Терміни не горять',
    contact: 'Контакт для зв’язку', contactHint: 'Телефон, e-mail або @Telegram', extras: 'Додати ім’я та адресу', optional: 'необов’язково', name: 'Ім’я', address: 'Адреса або населений пункт', submit: 'Надіслати заявку', next: 'Залиште контакт — обговоримо деталі та можливий час.', noJs: 'Щоб надіслати форму, увімкніть JavaScript або зателефонуйте.',
    examplesByService: [
      ['Wi-Fi постійно відключається', 'Після заміни роутера немає інтернету', 'Wi-Fi не ловить в іншій кімнаті', 'Не працює мережева розетка', 'Потрібно налаштувати роутер або Mesh', 'Потрібно прокласти кабель у квартирі', 'Не бачу камери в телефоні', 'Потрібно підключити новий пристрій'],
      ['Wi-Fi постійно відключається', 'Wi-Fi не ловить в іншій кімнаті', 'Увечері інтернет працює повільно', 'На телефоні інтернет є, на ноутбуці немає', 'Після заміни роутера немає інтернету', 'Потрібно налаштувати роутер або Mesh'],
      ['Не працює мережева розетка', 'Немає інтернету через кабель', 'Зв’язок з’являється, якщо поворушити кабель', 'Швидкість через кабель впала до 100 Мбіт/с', 'Потрібно замінити роз’єм RJ45', 'Потрібно перевірити наявні кабелі'],
      ['Потрібно прокласти кабелі перед ремонтом', 'Потрібні розетки RJ45 у кількох кімнатах', 'Потрібен кабель для точки Wi-Fi', 'Потрібно впорядкувати домашні кабелі', 'Потрібно прокласти кабель до камери', 'Потрібно підключити пристрої в новій квартирі'],
      ['Немає зображення з камери', 'Не бачу камери в телефоні', 'Реєстратор не записує відео', 'Зображення з камери зникає вночі', 'Потрібно встановити нові камери', 'Хочу розширити відеоспостереження', 'Потрібно налаштувати сповіщення', 'Після заміни роутера камера не працює']
    ]
  },
  en: {
    problem: 'What happened?', placeholder: 'Describe the problem or choose a similar situation below…', examples: 'Choose a similar situation', pause: 'Pause', resume: 'Resume', all: 'All examples', less: 'Show less',
    type: 'What do you need?', broken: 'It worked, then stopped', setup: 'Setup or installation', urgency: 'How urgent is it?', urgent: 'Urgent', today: 'In the near future', normal: 'No rush',
    contact: 'How can we reach you?', contactHint: 'Phone, email or @Telegram', extras: 'Add your name and address', optional: 'optional', name: 'Name', address: 'Address or town', submit: 'Request a callback', next: 'Leave a contact — we’ll discuss the details and a possible time.', noJs: 'Enable JavaScript to send the form, or call us.',
    examplesByService: [
      ['Wi-Fi keeps disconnecting', 'No internet after replacing the router', 'Wi-Fi does not reach another room', 'An Ethernet socket is not working', 'I need router or Mesh setup', 'I need cabling in my flat', 'I cannot see my cameras on my phone', 'I need to connect a new device'],
      ['Wi-Fi keeps disconnecting', 'Wi-Fi does not reach another room', 'Internet is slow in the evening', 'My phone is online but my laptop is not', 'No internet after replacing the router', 'I need router or Mesh setup'],
      ['An Ethernet socket is not working', 'No internet over the cable', 'The connection works only when I move the cable', 'Wired speed dropped to 100 Mbps', 'An RJ45 plug needs replacing', 'I need existing cabling tested'],
      ['I need cabling before renovation', 'I need RJ45 sockets in several rooms', 'I need a cable for a Wi-Fi access point', 'I need the cables in my home organised', 'I need a cable for a camera', 'I need devices connected in a new flat'],
      ['A camera has no picture', 'I cannot see my cameras on my phone', 'The recorder is not recording', 'The camera picture disappears at night', 'I need new cameras installed', 'I want to expand my CCTV system', 'I need notifications configured', 'A camera stopped working after replacing the router']
    ]
  }
};
const esc = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export const enquiryHeading = lang => (copy[lang] || copy.pl).problem;

export function stagedEnquiries(html, lang, path) {
  const t = copy[lang] || copy.pl;
  const service = ['naprawa-wifi', 'naprawa-sieci', 'montaz-sieci', 'serwis-monitoringu'].findIndex(route => path.includes(route)) + 1;
  html = html.replace(/<form id="(hero-form|final-form)"([^>]*)>([\s\S]*?)<\/form>/g, (_, id, attrs, original) => {
    const prefix = id.replace('-form', '');
    const notice = original.match(/<p class="form-privacy-notice">[\s\S]*?<\/p>/)?.[0] || '';
    const alternatives = original.match(/<p class="contact-alternatives">[\s\S]*?<\/p>/)?.[0] || '';
    const choice = (name, value, label) => `<label class="enquiry-choice"><input type="radio" name="${name}" value="${value}"><span>${esc(label)}</span></label>`;
    return `<form id="${id}"${attrs.replace(/ data-staged-form(?:="[^"]*")?/g, '')} data-staged-form>
      <div class="form-group enquiry-problem"><textarea id="${prefix}-message" name="message" aria-label="${t.problem}" required minlength="3" maxlength="4000" rows="3" placeholder="${t.placeholder}" aria-describedby="${id}-help"></textarea><small id="${id}-help" class="contact-field-help">${t.examples}</small></div>
      <div class="enquiry-examples"><div class="enquiry-example-heading"><span>${t.examples}</span><div class="enquiry-example-controls"><button type="button" data-examples-pause data-pause="${t.pause}" data-resume="${t.resume}" aria-pressed="false">${t.pause}</button><button type="button" data-examples-all data-all="${t.all}" data-less="${t.less}" aria-expanded="false" aria-controls="${id}-examples">${t.all}</button></div></div><div class="enquiry-example-list" id="${id}-examples">${t.examplesByService[service].map(text => `<button type="button" data-enquiry-example>${esc(text)}</button>`).join('')}</div></div>
      <div class="enquiry-details" id="${id}-details" hidden>
        <p class="${id === 'quick-form' ? 'enquiry-next-step' : 'contact-next-step'}">${t.next}</p>
        <fieldset class="enquiry-choices"><legend>${t.type}</legend>${choice('requestType', 'broken', t.broken)}${choice('requestType', 'setup', t.setup)}</fieldset>
        <fieldset class="enquiry-choices enquiry-urgency"><legend>${t.urgency}</legend>${choice('urgency', 'urgent', t.urgent)}${choice('urgency', 'soon', t.today)}${choice('urgency', 'flexible', t.normal)}</fieldset>
        <div class="form-group"><label for="${prefix}-phone">${t.contact}</label><input type="text" id="${prefix}-phone" name="phone" required minlength="5" maxlength="120" autocomplete="off" placeholder="${t.contactHint}" aria-describedby="${id}-contact-help"><small id="${id}-contact-help" class="enquiry-hint">${t.contactHint}</small></div>
        <details class="enquiry-extras"><summary>${t.extras} <span>(${t.optional})</span></summary><div class="form-group"><label for="${prefix}-name">${t.name}</label><input type="text" id="${prefix}-name" name="name" maxlength="120" autocomplete="name"></div><div class="form-group"><label for="${prefix}-address">${t.address}</label><input type="text" id="${prefix}-address" name="address" maxlength="300" autocomplete="street-address"></div></details>
        <button type="submit" class="btn btn-primary form-submit">${t.submit}</button>${notice}
      </div>
      <div id="${id}-message" role="alert" aria-live="polite"></div>${alternatives}
      <noscript><p>${t.noJs} <a href="tel:+48453327678">+48 453 327 678</a></p></noscript>
    </form>`;
  });
  html = html.replace(/(<(?:aside|div) class="(?:hero-form|final-form)")(?: data-enquiry-panel)?/g, '$1 data-enquiry-panel');
  html = html.replace(/\s*<script[^>]*src="\/enquiry.js[^"]*"[^>]*><\/script>/g, '');
  return html.replace('</body>', '<script defer src="/enquiry.js"></script>\n</body>');
}

// The button-opened dialog stays a short, single-screen form on every page.
export function compactQuickEnquiry(html, lang) {
  const t = copy[lang] || copy.pl;
  const [title, description, phone] = {
    pl: ['Wyślij zapytanie', 'Opis problemu', 'Telefon'],
    ru: ['Отправить запрос', 'Описание проблемы', 'Телефон'],
    uk: ['Надіслати запит', 'Опис проблеми', 'Телефон'],
    en: ['Send an enquiry', 'Problem description', 'Phone']
  }[lang] || ['Wyślij zapytanie', 'Opis problemu', 'Telefon'];
  html = html.replace(/<form id="quick-form"[^>]*>([\s\S]*?)<\/form>/g, (_, original) => {
    const notice = original.match(/<p class="form-privacy-notice">[\s\S]*?<\/p>/)?.[0] || '';
    return `<form id="quick-form" aria-label="${title}" data-compact-form>
      <div class="form-group"><label for="quick-message">${description}</label><textarea id="quick-message" name="message" required minlength="3" maxlength="4000" rows="3"></textarea></div>
      <div class="form-group"><label for="quick-phone">${phone}</label><input type="tel" id="quick-phone" name="phone" required minlength="5" maxlength="60" autocomplete="tel" inputmode="tel"></div>
      <details class="enquiry-extras"><summary>${t.extras} <span>(${t.optional})</span></summary><div class="form-group"><label for="quick-name">${t.name}</label><input type="text" id="quick-name" name="name" maxlength="120" autocomplete="name"></div><div class="form-group"><label for="quick-address">${t.address}</label><input type="text" id="quick-address" name="address" maxlength="300" autocomplete="street-address"></div></details>
      <button type="submit" class="btn btn-primary form-submit">${t.submit}</button>${notice}<div id="quick-form-message" role="alert" aria-live="polite"></div>
    </form>`;
  });
  return html.replace(/(<h2 id="quick-contact-title">)[\s\S]*?<\/h2>/, `$1${title}</h2>`);
}
