import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = new URL('../public/', import.meta.url);
const routes = {
  pl: '/pogoda-internet-warszawa/',
  ru: '/ru/pogoda-internet-varshava/',
  uk: '/uk/pohoda-internet-varshava/',
  en: '/en/weather-internet-warsaw/',
};

const copy = {
  pl: {
    source: 'index.html', lang: 'pl-PL', locale: 'pl_PL',
    title: 'Pogoda w Warszawie i test internetu: IP, ping, dostawca | NaSerwis.pl',
    description: 'Aktualna pogoda i prognoza dla Warszawy oraz bezpieczny test internetu: publiczny adres IP, dostawca, opóźnienie, jitter i orientacyjna prędkość.',
    kicker: 'Pogoda na zewnątrz · pogoda w internecie',
    h1: 'Sprawdź pogodę w Warszawie i stan swojego internetu',
    lead: 'Dwa szybkie odczyty w jednym miejscu: prognoza na najbliższe godziny oraz prywatna diagnostyka połączenia. Wyniki są tylko dla Ciebie — nie zapisujemy adresu IP ani pomiarów.',
    outside: 'Na zewnątrz', now: 'Teraz w Warszawie', feels: 'Odczuwalna', humidity: 'Wilgotność', wind: 'Wiatr', pressure: 'Ciśnienie', rain: 'Opady',
    online: 'W sieci', connection: 'Twoje połączenie', ip: 'Publiczny adres IP', provider: 'Dostawca / sieć', location: 'Przybliżona lokalizacja', edge: 'Punkt sieci',
    test: 'Uruchom lekki test', testing: 'Trwa pomiar…', latency: 'Opóźnienie HTTP', jitter: 'Jitter', speed: 'Pobieranie', fullTests: 'Pełny test łącza', call: 'Zadzwoń',
    testNote: 'Test pobiera około 256 KB. Wynik jest orientacyjny i mierzy drogę do najbliższego węzła Cloudflare, nie pełny test łącza operatora.',
    forecast: 'Prognoza dla Warszawy na 24 godziny', dataBy: 'Dane pogodowe: MET Norway, licencja CC BY 4.0.',
    why: 'Co mówi ten pomiar?', whyText: 'Pogoda może wpływać na łącza radiowe, urządzenia na zewnątrz i zasilanie, ale wolny internet częściej wynika z Wi‑Fi, przeciążenia sieci lub problemu operatora. Dlatego pokazujemy warunki i stan połączenia obok siebie — bez udawania, że jeden wynik wyjaśnia drugi.',
    list: ['Wysokie opóźnienie: rozmowy i zdalny pulpit mogą reagować z opóźnieniem.', 'Wysoki jitter: głos i obraz mogą się zacinać mimo dobrej prędkości.', 'Niska prędkość tylko na Wi‑Fi: sprawdź wynik bliżej routera lub po kablu.'],
    stepsTitle: 'Zanim zgłosisz awarię', steps: ['Powtórz test bez aktywnego pobierania i kopii w chmurze.', 'Porównaj Wi‑Fi z połączeniem kablowym, jeśli to możliwe.', 'Zrestartuj router tylko raz i zanotuj godzinę problemu.'],
    ctaTitle: 'Internet nadal działa niestabilnie?', ctaText: 'Opisz objawy, lokalizację i wynik testu. Sprawdzimy, czy problem leży w Wi‑Fi, okablowaniu, sprzęcie czy po stronie operatora.', cta: 'Wyślij zapytanie',
    faqTitle: 'Najczęstsze pytania', faq: [['Czy strona zapisuje mój adres IP?', 'Nie. Adres jest odczytywany przez infrastrukturę obsługującą żądanie i wyświetlany wyłącznie w Twojej przeglądarce. Odpowiedź API nie jest buforowana.'], ['Czy to pełny speed test?', 'Nie. Celowo używamy lekkiego pomiaru do szybkiej diagnozy. Dokładny test łącza wymaga większego transferu i najlepiej wykonać go po kablu.'], ['Skąd pochodzi prognoza?', 'Z interfejsu Locationforecast MET Norway. Dane są pobierane przez nasz serwer i odświeżane w pamięci podręcznej.']],
    unavailable: 'Dane chwilowo niedostępne', unknown: 'Brak danych', dateLocale: 'pl-PL', unitWind: 'm/s'
  },
  ru: {
    source: 'ru/index.html', lang: 'ru-RU', locale: 'ru_RU',
    title: 'Погода в Варшаве и тест интернета: IP, пинг, провайдер | NaSerwis.pl',
    description: 'Погода и прогноз для Варшавы плюс безопасная проверка интернета: публичный IP, провайдер, задержка, джиттер и примерная скорость.',
    kicker: 'Погода на улице · погода в интернете', h1: 'Проверьте погоду в Варшаве и состояние интернета',
    lead: 'Два полезных показателя в одном месте: прогноз на ближайшие часы и приватная диагностика соединения. Результаты видите только вы — мы не сохраняем IP и измерения.',
    outside: 'На улице', now: 'Сейчас в Варшаве', feels: 'Ощущается', humidity: 'Влажность', wind: 'Ветер', pressure: 'Давление', rain: 'Осадки', online: 'В сети', connection: 'Ваше соединение', ip: 'Публичный IP-адрес', provider: 'Провайдер / сеть', location: 'Примерное местоположение', edge: 'Сетевой узел',
    test: 'Запустить лёгкий тест', testing: 'Идёт измерение…', latency: 'HTTP-задержка', jitter: 'Джиттер', speed: 'Загрузка', fullTests: 'Полный тест соединения', call: 'Позвонить',
    testNote: 'Тест загружает около 256 КБ. Результат ориентировочный: измеряется путь до ближайшего узла Cloudflare, а не вся линия оператора.',
    forecast: 'Прогноз для Варшавы на 24 часа', dataBy: 'Данные о погоде: MET Norway, лицензия CC BY 4.0.',
    why: 'Что показывает измерение?', whyText: 'Погода может влиять на радиоканалы, наружное оборудование и питание, но медленный интернет чаще связан с Wi‑Fi, нагрузкой сети или оператором. Поэтому мы показываем условия и соединение рядом, не подменяя причину совпадением.',
    list: ['Высокая задержка: звонки и удалённый рабочий стол отвечают медленнее.', 'Высокий джиттер: голос и видео могут прерываться даже при хорошей скорости.', 'Низкая скорость только по Wi‑Fi: повторите тест рядом с роутером или по кабелю.'],
    stepsTitle: 'До обращения в поддержку', steps: ['Повторите тест без загрузок и облачной синхронизации.', 'Сравните Wi‑Fi с кабельным подключением, если возможно.', 'Перезапустите роутер один раз и запишите время проблемы.'],
    ctaTitle: 'Интернет всё ещё нестабилен?', ctaText: 'Опишите симптомы, адрес и результат. Проверим Wi‑Fi, кабель, оборудование и сторону оператора.', cta: 'Отправить запрос',
    faqTitle: 'Частые вопросы', faq: [['Сайт сохраняет мой IP?', 'Нет. Адрес возвращается только вашему браузеру в ответе без кэширования и не добавляется в аналитику.'], ['Это полный speed test?', 'Нет. Это лёгкая быстрая диагностика. Точный тест требует большего трафика и лучше проводится по кабелю.'], ['Откуда прогноз?', 'Из Locationforecast MET Norway. Наш сервер получает и кэширует обезличенные погодные данные.']],
    unavailable: 'Данные временно недоступны', unknown: 'Нет данных', dateLocale: 'ru-RU', unitWind: 'м/с'
  },
  uk: {
    source: 'uk/index.html', lang: 'uk-UA', locale: 'uk_UA',
    title: 'Погода у Варшаві та тест інтернету: IP, пінг, провайдер | NaSerwis.pl',
    description: 'Погода і прогноз для Варшави та безпечна перевірка інтернету: публічний IP, провайдер, затримка, джиттер і приблизна швидкість.',
    kicker: 'Погода надворі · погода в інтернеті', h1: 'Перевірте погоду у Варшаві та стан інтернету',
    lead: 'Два корисні показники в одному місці: прогноз на найближчі години та приватна діагностика з’єднання. Результати бачите лише ви — ми не зберігаємо IP і вимірювання.',
    outside: 'Надворі', now: 'Зараз у Варшаві', feels: 'Відчувається', humidity: 'Вологість', wind: 'Вітер', pressure: 'Тиск', rain: 'Опади', online: 'У мережі', connection: 'Ваше з’єднання', ip: 'Публічна IP-адреса', provider: 'Провайдер / мережа', location: 'Приблизне розташування', edge: 'Мережевий вузол',
    test: 'Запустити легкий тест', testing: 'Триває вимірювання…', latency: 'HTTP-затримка', jitter: 'Джиттер', speed: 'Завантаження', fullTests: 'Повний тест з’єднання', call: 'Зателефонувати',
    testNote: 'Тест завантажує близько 256 КБ. Результат орієнтовний: вимірюється шлях до найближчого вузла Cloudflare, а не вся лінія оператора.',
    forecast: 'Прогноз для Варшави на 24 години', dataBy: 'Дані про погоду: MET Norway, ліцензія CC BY 4.0.',
    why: 'Що показує вимірювання?', whyText: 'Погода може впливати на радіоканали, зовнішнє обладнання та живлення, але повільний інтернет частіше пов’язаний із Wi‑Fi, навантаженням мережі або оператором. Тому ми показуємо умови та з’єднання поруч, не видаючи збіг за причину.',
    list: ['Висока затримка: дзвінки та віддалений робочий стіл реагують повільніше.', 'Високий джиттер: голос і відео можуть перериватися навіть за доброї швидкості.', 'Низька швидкість лише через Wi‑Fi: повторіть тест біля роутера або кабелем.'],
    stepsTitle: 'Перед зверненням у підтримку', steps: ['Повторіть тест без завантажень і хмарної синхронізації.', 'Порівняйте Wi‑Fi з кабельним підключенням, якщо можливо.', 'Перезапустіть роутер один раз і запишіть час проблеми.'],
    ctaTitle: 'Інтернет усе ще нестабільний?', ctaText: 'Опишіть симптоми, адресу та результат. Перевіримо Wi‑Fi, кабель, обладнання і сторону оператора.', cta: 'Надіслати запит',
    faqTitle: 'Поширені запитання', faq: [['Сайт зберігає мою IP-адресу?', 'Ні. Адреса повертається лише вашому браузеру у відповіді без кешування і не додається до аналітики.'], ['Це повний speed test?', 'Ні. Це легка швидка діагностика. Точний тест потребує більше трафіку і краще працює через кабель.'], ['Звідки прогноз?', 'Із Locationforecast MET Norway. Наш сервер отримує та кешує знеособлені погодні дані.']],
    unavailable: 'Дані тимчасово недоступні', unknown: 'Немає даних', dateLocale: 'uk-UA', unitWind: 'м/с'
  },
  en: {
    source: 'en/index.html', lang: 'en-GB', locale: 'en_GB',
    title: 'Warsaw weather and internet test: IP, latency, provider | NaSerwis.pl',
    description: 'Current Warsaw weather and forecast plus a privacy-minded internet check: public IP, provider, latency, jitter and indicative download speed.',
    kicker: 'Weather outside · weather online', h1: 'Check the weather in Warsaw and your internet connection',
    lead: 'Two useful readings in one place: the next hours outdoors and a private connection diagnostic. Only you see the result — we do not store your IP address or measurements.',
    outside: 'Outside', now: 'Now in Warsaw', feels: 'Feels like', humidity: 'Humidity', wind: 'Wind', pressure: 'Pressure', rain: 'Rain', online: 'Online', connection: 'Your connection', ip: 'Public IP address', provider: 'Provider / network', location: 'Approximate location', edge: 'Network edge',
    test: 'Run a light test', testing: 'Measuring…', latency: 'HTTP latency', jitter: 'Jitter', speed: 'Download', fullTests: 'Full connection test', call: 'Call us',
    testNote: 'The test downloads about 256 KB. It is indicative and measures the path to the nearest Cloudflare edge, not your provider’s entire connection.',
    forecast: '24-hour forecast for Warsaw', dataBy: 'Weather data: MET Norway, licensed under CC BY 4.0.',
    why: 'What does this measurement mean?', whyText: 'Weather can affect radio links, outdoor equipment and power, but slow internet is more often caused by Wi‑Fi, congestion or the provider. We show conditions and connectivity side by side without implying that one automatically explains the other.',
    list: ['High latency: calls and remote desktops may respond slowly.', 'High jitter: voice and video may break up despite good speed.', 'Low speed on Wi‑Fi only: retry near the router or over Ethernet.'],
    stepsTitle: 'Before reporting a fault', steps: ['Retry without downloads or cloud synchronisation running.', 'Compare Wi‑Fi with Ethernet if possible.', 'Restart the router once and note when the problem occurred.'],
    ctaTitle: 'Is the connection still unstable?', ctaText: 'Tell us the symptoms, location and test result. We can check Wi‑Fi, cabling, equipment and the provider side.', cta: 'Send an enquiry',
    faqTitle: 'Common questions', faq: [['Does this page store my IP address?', 'No. The address is returned only to your browser in a non-cacheable response and is not added to analytics.'], ['Is this a full speed test?', 'No. It is deliberately lightweight. An accurate line test uses more traffic and is best run over Ethernet.'], ['Where does the forecast come from?', 'Locationforecast by MET Norway. Our server fetches and caches the non-personal weather data.']],
    unavailable: 'Data is temporarily unavailable', unknown: 'No data', dateLocale: 'en-GB', unitWind: 'm/s'
  },
};

const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function main(c) {
  const faq = c.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  const faqSchema = c.faq.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } }));
  const settings = escapeHtml(JSON.stringify({ unavailable: c.unavailable, unknown: c.unknown, dateLocale: c.dateLocale, unitWind: c.unitWind, testing: c.testing, test: c.test }));
  return `<main id="main-content" class="weather-network-page" data-network-weather data-settings="${settings}">
  <section class="nw-hero"><div class="container"><p class="nw-kicker">${c.kicker}</p><h1>${c.h1}</h1><p class="nw-lead">${c.lead}</p>
    <div class="nw-dashboard">
      <article class="nw-panel nw-weather-panel" aria-labelledby="weather-title"><div class="nw-panel-head"><div><span>${c.outside}</span><h2 id="weather-title">${c.now}</h2></div><div class="nw-sky-orbit" aria-hidden="true"><span></span></div></div><div class="nw-temperature"><strong data-weather-temperature>—</strong><span>°C</span><div class="nw-temperature-context"><small data-weather-symbol>…</small><p><span>${c.feels}</span><strong data-weather-feels>—</strong></p></div></div><dl class="nw-metrics"><div><dt>${c.humidity}</dt><dd data-weather-humidity>—</dd></div><div><dt>${c.wind}</dt><dd data-weather-wind>—</dd></div><div><dt>${c.pressure}</dt><dd data-weather-pressure>—</dd></div><div><dt>${c.rain}</dt><dd data-weather-rain>—</dd></div></dl><p class="nw-status" data-weather-status role="status" aria-live="polite"></p></article>
      <article class="nw-panel nw-network-panel" aria-labelledby="network-title"><div class="nw-panel-head"><div><span>${c.online}</span><h2 id="network-title">${c.connection}</h2></div><div class="nw-signal" aria-hidden="true"><i></i><i></i><i></i></div></div><dl class="nw-network-data"><div><dt>${c.ip}</dt><dd data-network-ip>—</dd></div><div><dt>${c.provider}</dt><dd data-network-provider>—</dd></div><div><dt>${c.location}</dt><dd data-network-location>—</dd></div><div><dt>${c.edge}</dt><dd data-network-edge>—</dd></div></dl><p class="nw-status" data-network-status role="status" aria-live="polite"></p><button class="btn btn-primary nw-test-button" type="button" data-network-test>${c.test}</button><p class="nw-test-note">${c.testNote}</p><div class="nw-test-results" data-test-results hidden><div><span>${c.latency}</span><strong data-test-latency>—</strong></div><div><span>${c.jitter}</span><strong data-test-jitter>—</strong></div><div><span>${c.speed}</span><strong data-test-speed>—</strong></div></div><nav class="nw-full-tests" aria-label="${c.fullTests}"><span>${c.fullTests}</span><a href="https://www.speedtest.net/" target="_blank" rel="noopener noreferrer">Speedtest by Ookla ↗</a><a href="https://speed.cloudflare.com/" target="_blank" rel="noopener noreferrer">Cloudflare Speed Test ↗</a></nav></article>
    </div></div></section>
  <section class="nw-forecast-section"><div class="container"><div class="nw-section-heading"><p>24 H</p><h2>${c.forecast}</h2></div><div class="nw-forecast" data-weather-forecast aria-live="polite"></div><p class="nw-attribution"><a href="https://api.met.no/" rel="external">${c.dataBy}</a></p></div></section>
  <section class="nw-explain"><div class="container nw-explain-grid"><article><p class="nw-kicker">DIAG</p><h2>${c.why}</h2><p>${c.whyText}</p><ul>${c.list.map((item) => `<li>${item}</li>`).join('')}</ul></article><aside><h3>${c.stepsTitle}</h3><ol>${c.steps.map((item) => `<li>${item}</li>`).join('')}</ol></aside></div></section>
  <section class="nw-faq"><div class="container"><h2>${c.faqTitle}</h2><div class="nw-faq-list">${faq}</div></div></section>
  <section class="nw-cta"><div class="container"><div><h2>${c.ctaTitle}</h2><p>${c.ctaText}</p></div><div class="nw-cta-actions"><button type="button" class="btn btn-primary" data-contact-modal>${c.cta}</button><a class="btn nw-call-button" href="tel:+48453327678">${c.call}: +48 453 327 678</a></div></div></section>
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqSchema })}</script>
</main>`;
}

function replaceMeta(html, c, route) {
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${c.title}</title>`);
  html = html.replace(/<meta name="title" content="[^"]*">/, `<meta name="title" content="${escapeHtml(c.title)}">`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(c.description)}">`);
  html = html.replace(/<meta name="keywords"[^>]*>\s*/, '');
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="https://naserwis.pl${route}">`);
  html = html.replace(/\s*<link rel="alternate" hreflang="(?:pl|ru|uk|en|x-default)"[^>]*>/g, '');
  const alternates = Object.entries(routes).map(([lang, path]) => `    <link rel="alternate" hreflang="${lang}" href="https://naserwis.pl${path}">`).join('\n');
  html = html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${alternates}\n    <link rel="alternate" hreflang="x-default" href="https://naserwis.pl${routes.pl}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="https://naserwis.pl${route}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(c.title)}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(c.description)}">`);
  html = html.replace(/<meta property="twitter:url" content="[^"]*">/, `<meta property="twitter:url" content="https://naserwis.pl${route}">`);
  html = html.replace(/<meta property="twitter:title" content="[^"]*">/, `<meta property="twitter:title" content="${escapeHtml(c.title)}">`);
  html = html.replace(/<meta property="twitter:description" content="[^"]*">/, `<meta property="twitter:description" content="${escapeHtml(c.description)}">`);
  html = html.replace('</head>', '    <link rel="stylesheet" href="/weather-network.css?v=20260907-2">\n</head>');
  return html;
}

for (const [locale, c] of Object.entries(copy)) {
  let html = await readFile(new URL(c.source, root), 'utf8');
  html = replaceMeta(html, c, routes[locale]);
  html = html.replace(/<main id="main-content">[\s\S]*?<\/main>/, main(c));
  for (const [target, route] of Object.entries(routes)) {
    html = html.replace(new RegExp(`href="[^"]*" data-lang="${target}"`, 'g'), `href="${route}" data-lang="${target}"`);
    html = html.replace(new RegExp(`href="[^"]*" class="mobile-lang-btn([^\"]*)" hreflang="${target}"`, 'g'), `href="${route}" class="mobile-lang-btn$1" hreflang="${target}"`);
  }
  html = html.replace('</body>', '    <script src="/weather-network.js?v=20260907-2" defer></script>\n</body>');
  const output = join(new URL('.', root).pathname.slice(1), routes[locale], 'index.html');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
  console.log(`Generated ${routes[locale]}`);
}
