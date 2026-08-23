import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(projectRoot, 'public');

const safeCopyReplacements = [
    ['Dojazd w Warszawie w 24h', 'Dojazd w Warszawie po uzgodnieniu'],
    ['Dojazd w 24h', 'Dojazd po uzgodnieniu'],
    ['Выезд по Варшаве 24ч', 'Выезд по Варшаве по согласованию'],
    ['Выезд 24ч', 'Выезд по согласованию'],
    ['Виїзд по Варшаві 24г', 'Виїзд у Варшаві за домовленістю'],
    ['Виїзд 24г', 'Виїзд за домовленістю'],
    ['On-site in Warsaw within 24h', 'On-site in Warsaw by arrangement'],
    ['On-site within 24h', 'On-site visit by arrangement'],
    ['Naprawimy Dziś', 'Szybka Pomoc'],
    ['Починим сегодня', 'Быстрая помощь'],
    ['Полагодимо сьогодні', 'Швидка допомога'],
    ["We'll Fix It Today", 'Fast Local Help'],
    ['Działamy na terenie całej Warszawy i okolic - możemy być u Ciebie tego samego dnia', 'Działamy na terenie całej Warszawy i okolic. Termin wizyty ustalamy podczas rozmowy'],
    ['Работаем по всей Варшаве и окрестностям - можем приехать в тот же день', 'Работаем по всей Варшаве и окрестностям. Время визита согласуем во время разговора'],
    ['Обслуговуємо всю Варшаву та околиці — можемо приїхати того ж дня', 'Обслуговуємо всю Варшаву та околиці. Час візиту узгоджуємо під час розмови'],
    ['We cover Ursynów, Wilanów, Natolin and Piaseczno — same-day service available', 'We cover Warsaw and nearby areas. We agree the visit time during the call'],
    ['/ wyzyta', '/ wizyta'],
    ['Офіси та дома', 'Офіси та будинки']
];

const measurementBlock = `    <!-- Consent Mode v2 must be initialised before Google tags. -->
    <script src="/consent.js?v=20260823c"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-FVC64PTKR3"></script>
    <script>
      gtag('js', new Date());
      gtag('config', 'G-FVC64PTKR3');
      gtag('config', 'AW-18394870871');
    </script>
`;

async function existingLandingPages() {
    const pages = [];
    async function walk(directory) {
        for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) await walk(fullPath);
            else if (entry.name === 'index.html') pages.push(fullPath);
        }
    }
    await walk(publicRoot);
    return pages.filter((page) => !/[\\/](privacy|cookies)[\\/]index\.html$/.test(page));
}

async function updateLandingPage(file) {
    let html = await fs.readFile(file, 'utf8');
    html = html.replace(
        /    <!-- Google tag \(Google Analytics \+ Google Ads\) -->[\s\S]*?    \}\)\(window,document,'script','dataLayer','GTM-WWFQZQBL'\);<\/script>\r?\n/,
        measurementBlock
    );
    html = html.replace(
        /\s*<noscript><iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-WWFQZQBL"[\s\S]*?<\/iframe><\/noscript>\s*/,
        '\n'
    );
    html = html.replace(
        /\s*<!-- Google Tag Manager -->\s*<script>\(function\(w,d,s,l,i\)\{[\s\S]*?GTM-WWFQZQBL'\);<\/script>/,
        ''
    );
    html = html.replace(
        /\s*<script>\s*window\.chatwootSettings = \{ hideMessageBubble: true \};[\s\S]*?\}\)\(document,"script"\);\s*<\/script>/,
        ''
    );
    html = html.replace(
        /\s*<div class="form-group">\s*<label class="file-upload-google">[\s\S]*?<div id="photo-preview" class="photo-preview"><\/div>\s*<\/div>/,
        ''
    );
    html = html.replace(/\/script\.js\?v=[^"']+/, '/script.js?v=20260823d');
    html = html.replace(/\/consent\.js\?v=[^"']+/, '/consent.js?v=20260823c');
    html = html.replace(/\/styles\.css(?:\?v=[^"']+)?/g, '/styles.css?v=20260823e');
    html = html.replace(/\/custom\.css(?:\?v=[^"']+)?/g, '/custom.css?v=20260823e');
    for (const [from, to] of safeCopyReplacements) html = html.split(from).join(to);
    await fs.writeFile(file, html);
}

const legal = {
    pl: {
        home: '/', homeLabel: 'Wróć do NaSerwis.pl',
        privacyTitle: 'Polityka prywatności', cookieTitle: 'Polityka cookies',
        manage: 'Ustawienia prywatności', updated: 'Ostatnia aktualizacja: 23 sierpnia 2026 r.',
        privacy: `
            <p class="legal-note">Administratorem danych jest Ihar Shestsiuk, prowadzący działalność nierejestrowaną pod nazwą NaSerwis.pl, adres do korespondencji: ul. F. Płaskowickiej 46 m. 12, 02-778 Warszawa. Kontakt w sprawach prywatności: <a href="mailto:iharshastsiuk@gmail.com">iharshastsiuk@gmail.com</a>, tel. <a href="tel:+48453327678">+48 453 327 678</a>.</p>
            <h2>Jakie dane i dlaczego przetwarzamy</h2>
            <ul><li>Zapytania i wyceny: imię, telefon, treść wiadomości i język — aby odpowiedzieć i podjąć działania przed zawarciem umowy (art. 6 ust. 1 lit. b RODO).</li><li>Realizacja i rozliczenie usługi — wykonanie umowy i obowiązki prawne (art. 6 ust. 1 lit. b i c RODO).</li><li>Bezpieczeństwo, obrona roszczeń i zapobieganie nadużyciom — prawnie uzasadniony interes administratora (art. 6 ust. 1 lit. f RODO).</li><li>Analityka, pomiar reklam, personalizacja reklam i czat — na podstawie zgody, którą można wycofać w ustawieniach prywatności.</li><li>Publikacja opinii — wyłącznie na podstawie odrębnej zgody autora.</li></ul>
            <h2>Odbiorcy i dostawcy</h2><p>Dane mogą być przetwarzane przez dostawców hostingu i ochrony formularzy (Cloudflare), poczty (Resend lub dostawca poczty), powiadomień (Telegram), czatu (Chatwoot) oraz — po wyrażeniu właściwej zgody — Google Analytics i Google Ads. Niektórzy dostawcy mogą przetwarzać dane poza EOG na podstawie odpowiednich mechanizmów prawnych.</p>
            <h2>Okres przechowywania</h2><p>Zapytania przechowujemy przez czas potrzebny do obsługi sprawy, a następnie przez okres niezbędny do obrony roszczeń. Dokumenty związane z wykonaną usługą przechowujemy przez okres wymagany prawem. Dane oparte na zgodzie przetwarzamy do jej wycofania lub do ustania celu.</p>
            <h2>Twoje prawa</h2><p>Możesz żądać dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, przeniesienia danych oraz wnieść sprzeciw. Zgodę można wycofać bez wpływu na zgodność wcześniejszego przetwarzania. Możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.</p>
            <h2>Czy podanie danych jest obowiązkowe</h2><p>Podanie danych w formularzu jest dobrowolne, ale bez numeru telefonu i opisu problemu nie możemy odpowiedzieć na zapytanie. Nie podejmujemy wobec użytkownika decyzji wywołujących skutki prawne wyłącznie w sposób zautomatyzowany.</p>`,
        cookies: `
            <p>Serwis używa pamięci przeglądarki, plików cookies i podobnych technologii. Niezbędne technologie działają, aby zapewnić bezpieczeństwo, obsłużyć formularze i zapamiętać wybór prywatności. Pozostałe uruchamiamy zgodnie z wyborem użytkownika.</p>
            <table><thead><tr><th>Kategoria</th><th>Dostawcy i cel</th><th>Podstawa</th></tr></thead><tbody><tr><td>Niezbędne</td><td>NaSerwis.pl i Cloudflare: bezpieczeństwo, formularze, Turnstile i zapis preferencji.</td><td>Niezbędność działania i bezpieczeństwa serwisu.</td></tr><tr><td>Analityka</td><td>Google Analytics: odsłony, źródła ruchu i skuteczność formularzy.</td><td>Zgoda.</td></tr><tr><td>Reklama</td><td>Google Ads: pomiar kampanii, a po osobnej zgodzie także personalizacja reklam.</td><td>Zgoda.</td></tr><tr><td>Czat</td><td>Chatwoot: uruchomienie rozmowy z obsługą.</td><td>Zgoda.</td></tr></tbody></table>
            <h2>Google Consent Mode</h2><p>Serwis przekazuje Google sygnały dotyczące zgody na analitykę, przechowywanie danych reklamowych, przesyłanie danych reklamowych i personalizację. Brak zgody pozostawia te kategorie w stanie odmowy.</p>
            <h2>Zmiana wyboru</h2><p>W każdej chwili można ponownie otworzyć ustawienia prywatności przyciskiem poniżej. Można też usunąć dane witryny w ustawieniach przeglądarki. Wycofanie zgody nie wpływa na zgodność wcześniejszego przetwarzania.</p>`
    },
    ru: {
        home: '/ru/', homeLabel: 'Вернуться на NaSerwis.pl', privacyTitle: 'Политика конфиденциальности', cookieTitle: 'Политика cookies', manage: 'Настройки конфиденциальности', updated: 'Последнее обновление: 23 августа 2026 г.',
        privacy: `<p class="legal-note">Администратор данных — Ihar Shestsiuk, ведущий незарегистрированную деятельность под названием NaSerwis.pl; адрес для корреспонденции: ul. F. Płaskowickiej 46 m. 12, 02-778 Warszawa. По вопросам конфиденциальности: <a href="mailto:iharshastsiuk@gmail.com">iharshastsiuk@gmail.com</a>, тел. <a href="tel:+48453327678">+48 453 327 678</a>.</p><h2>Какие данные и зачем мы обрабатываем</h2><ul><li>Запросы и оценки: имя, телефон, сообщение и язык — для ответа и действий до заключения договора (ст. 6(1)(b) GDPR/RODO).</li><li>Исполнение и расчёт услуги — договор и юридические обязанности.</li><li>Безопасность, защита требований и предотвращение злоупотреблений — законный интерес администратора.</li><li>Аналитика, реклама и чат — на основании отзываемого согласия.</li><li>Публикация отзывов — только на основании отдельного согласия автора.</li></ul><h2>Получатели</h2><p>Данные могут обрабатывать Cloudflare, Resend/почтовый провайдер, Telegram и Chatwoot, а после соответствующего согласия — Google Analytics и Google Ads. Некоторые поставщики могут обрабатывать данные за пределами ЕЭЗ с применением предусмотренных законом гарантий.</p><h2>Срок хранения</h2><p>Запросы хранятся на время обработки и последующей защиты требований. Документы по выполненным услугам — в сроки, предусмотренные законом. Данные на основании согласия — до его отзыва или прекращения цели.</p><h2>Ваши права</h2><p>Вы можете запросить доступ, исправление, удаление, ограничение, перенос данных или возразить против обработки. Согласие можно отозвать. Также можно подать жалобу председателю польского UODO.</p><h2>Обязательность данных</h2><p>Данные предоставляются добровольно, однако без телефона и описания проблемы мы не сможем ответить. Мы не принимаем в отношении пользователей юридически значимые решения исключительно автоматически.</p>`,
        cookies: `<p>Сайт использует память браузера, cookies и похожие технологии. Необходимые технологии обеспечивают безопасность, формы и сохранение выбора. Остальные категории включаются согласно вашему выбору.</p><table><thead><tr><th>Категория</th><th>Поставщики и цель</th><th>Основание</th></tr></thead><tbody><tr><td>Необходимые</td><td>NaSerwis.pl и Cloudflare: безопасность, формы, Turnstile и настройки.</td><td>Необходимость работы и безопасности.</td></tr><tr><td>Аналитика</td><td>Google Analytics: посещения, источники и эффективность форм.</td><td>Согласие.</td></tr><tr><td>Реклама</td><td>Google Ads: измерение кампаний и персонализация.</td><td>Согласие.</td></tr><tr><td>Чат</td><td>Chatwoot: разговор со службой поддержки.</td><td>Согласие.</td></tr></tbody></table><h2>Google Consent Mode</h2><p>Google получает сигналы выбора для аналитики, рекламного хранения, передачи рекламных данных и персонализации. Без согласия эти категории остаются запрещёнными.</p><h2>Изменение выбора</h2><p>Настройки можно открыть повторно кнопкой ниже или удалить данные сайта в браузере.</p>`
    },
    uk: {
        home: '/uk/', homeLabel: 'Повернутися на NaSerwis.pl', privacyTitle: 'Політика конфіденційності', cookieTitle: 'Політика cookies', manage: 'Налаштування конфіденційності', updated: 'Останнє оновлення: 23 серпня 2026 р.',
        privacy: `<p class="legal-note">Адміністратор даних — Ihar Shestsiuk, який веде незареєстровану діяльність під назвою NaSerwis.pl; адреса для листування: ul. F. Płaskowickiej 46 m. 12, 02-778 Warszawa. Контакт із питань конфіденційності: <a href="mailto:iharshastsiuk@gmail.com">iharshastsiuk@gmail.com</a>, тел. <a href="tel:+48453327678">+48 453 327 678</a>.</p><h2>Які дані й навіщо ми обробляємо</h2><ul><li>Запити й оцінки: ім’я, телефон, повідомлення та мова — для відповіді й дій до укладення договору (ст. 6(1)(b) GDPR/RODO).</li><li>Виконання та розрахунок послуги — договір і юридичні обов’язки.</li><li>Безпека, захист вимог і запобігання зловживанням — законний інтерес адміністратора.</li><li>Аналітика, реклама та чат — на підставі згоди, яку можна відкликати.</li><li>Публікація відгуків — лише за окремою згодою автора.</li></ul><h2>Одержувачі</h2><p>Дані можуть обробляти Cloudflare, Resend/поштовий постачальник, Telegram і Chatwoot, а після відповідної згоди — Google Analytics та Google Ads. Деякі постачальники можуть обробляти дані за межами ЄЕЗ із застосуванням законних гарантій.</p><h2>Строк зберігання</h2><p>Запити зберігаються на час обробки та подальшого захисту вимог. Документи щодо виконаних послуг — у строки, визначені законом. Дані на підставі згоди — до її відкликання або припинення мети.</p><h2>Ваші права</h2><p>Ви можете вимагати доступу, виправлення, видалення, обмеження, перенесення даних або заперечити проти обробки. Згоду можна відкликати. Також можна подати скаргу до польського UODO.</p><h2>Обов’язковість даних</h2><p>Дані надаються добровільно, однак без телефону й опису проблеми ми не зможемо відповісти. Ми не приймаємо щодо користувачів юридично значущих рішень виключно автоматично.</p>`,
        cookies: `<p>Сайт використовує пам’ять браузера, cookies і подібні технології. Необхідні технології забезпечують безпеку, форми та збереження вибору. Інші категорії вмикаються відповідно до вашого вибору.</p><table><thead><tr><th>Категорія</th><th>Постачальники та мета</th><th>Підстава</th></tr></thead><tbody><tr><td>Необхідні</td><td>NaSerwis.pl і Cloudflare: безпека, форми, Turnstile та налаштування.</td><td>Необхідність роботи й безпеки.</td></tr><tr><td>Аналітика</td><td>Google Analytics: відвідування, джерела та ефективність форм.</td><td>Згода.</td></tr><tr><td>Реклама</td><td>Google Ads: вимірювання кампаній і персоналізація.</td><td>Згода.</td></tr><tr><td>Чат</td><td>Chatwoot: розмова зі службою підтримки.</td><td>Згода.</td></tr></tbody></table><h2>Google Consent Mode</h2><p>Google отримує сигнали вибору щодо аналітики, рекламного зберігання, передавання рекламних даних і персоналізації. Без згоди ці категорії залишаються забороненими.</p><h2>Зміна вибору</h2><p>Налаштування можна повторно відкрити кнопкою нижче або видалити дані сайту в браузері.</p>`
    },
    en: {
        home: '/en/', homeLabel: 'Return to NaSerwis.pl', privacyTitle: 'Privacy policy', cookieTitle: 'Cookie policy', manage: 'Privacy settings', updated: 'Last updated: 23 August 2026',
        privacy: `<p class="legal-note">The data controller is Ihar Shestsiuk, conducting unregistered activity under the NaSerwis.pl service name; correspondence address: ul. F. Płaskowickiej 46 m. 12, 02-778 Warsaw, Poland. Privacy contact: <a href="mailto:iharshastsiuk@gmail.com">iharshastsiuk@gmail.com</a>, tel. <a href="tel:+48453327678">+48 453 327 678</a>.</p><h2>Data and purposes</h2><ul><li>Enquiries and estimates: name, phone number, message and language — to respond and take steps before entering into a contract (GDPR Article 6(1)(b)).</li><li>Service delivery and billing — contract performance and legal obligations.</li><li>Security, defence of claims and abuse prevention — the controller's legitimate interests.</li><li>Analytics, advertising and chat — based on consent that can be withdrawn.</li><li>Publication of reviews — only with the author's separate consent.</li></ul><h2>Recipients</h2><p>Data may be processed by Cloudflare, Resend/email providers, Telegram and Chatwoot, and after the appropriate consent by Google Analytics and Google Ads. Some providers may process data outside the EEA under legally recognised safeguards.</p><h2>Retention</h2><p>Enquiries are retained while they are handled and for the period needed to defend claims. Service records are retained as required by law. Consent-based data is processed until consent is withdrawn or the purpose ends.</p><h2>Your rights</h2><p>You may request access, correction, deletion, restriction or portability and object to processing. Consent can be withdrawn without affecting earlier lawful processing. You may complain to the President of the Polish Personal Data Protection Office (UODO).</p><h2>Is the data required?</h2><p>Providing data is voluntary, but without a phone number and issue description we cannot answer the enquiry. We do not make decisions producing legal effects for users solely by automated means.</p>`,
        cookies: `<p>The site uses browser storage, cookies and similar technologies. Essential technologies provide security, form operation and storage of privacy choices. Other categories are enabled according to your choice.</p><table><thead><tr><th>Category</th><th>Providers and purpose</th><th>Basis</th></tr></thead><tbody><tr><td>Necessary</td><td>NaSerwis.pl and Cloudflare: security, forms, Turnstile and preferences.</td><td>Necessary site operation and security.</td></tr><tr><td>Analytics</td><td>Google Analytics: visits, traffic sources and form effectiveness.</td><td>Consent.</td></tr><tr><td>Advertising</td><td>Google Ads: campaign measurement and ad personalisation.</td><td>Consent.</td></tr><tr><td>Chat</td><td>Chatwoot: starting a support conversation.</td><td>Consent.</td></tr></tbody></table><h2>Google Consent Mode</h2><p>The site sends Google consent signals for analytics, advertising storage, advertising user data and personalisation. Without consent these categories remain denied.</p><h2>Changing your choice</h2><p>You can reopen privacy settings with the button below or clear site data in your browser.</p>`
    }
};

const legalUi = {
    pl: {
        skip: 'Przejdź do treści', documents: 'Dokumenty i ustawienia', back: 'Wróć do serwisu'
    },
    ru: {
        skip: 'Перейти к содержанию', documents: 'Документы и настройки', back: 'Вернуться на сайт'
    },
    uk: {
        skip: 'Перейти до змісту', documents: 'Документи та налаштування', back: 'Повернутися на сайт'
    },
    en: {
        skip: 'Skip to content', documents: 'Documents and settings', back: 'Return to the website'
    }
};

function legalLanguageLinks(type, activeLanguage) {
    return Object.keys(legal).map((language) => {
        const prefix = language === 'pl' ? '' : `/${language}`;
        const current = language === activeLanguage ? ' aria-current="page"' : '';
        const label = language === 'uk' ? 'UA' : language.toUpperCase();
        return `<a href="${prefix}/${type}" hreflang="${language}"${current}>${label}</a>`;
    }).join('');
}

function legalPage(language, type) {
    const t = legal[language];
    const ui = legalUi[language];
    const prefix = language === 'pl' ? '' : `/${language}`;
    const title = type === 'privacy' ? t.privacyTitle : t.cookieTitle;
    const body = (type === 'privacy' ? t.privacy : t.cookies)
        .replace('<table>', '<div class="legal-table-wrap"><table>')
        .replace('</table>', '</table></div>');
    return `<!DOCTYPE html>
<html lang="${language}">
<head>
    <script src="/site-config.js"></script>
${measurementBlock}    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, follow">
    <title>${title} | NaSerwis.pl</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/styles.css?v=20260823e">
    <link rel="stylesheet" href="/custom.css?v=20260823e">
</head>
<body class="legal-page">
    <a class="legal-skip-link" href="#legal-main">${ui.skip}</a>
    <header class="legal-header">
        <div class="container legal-header-inner">
            <a class="logo" href="${t.home}" aria-label="NaSerwis.pl">Na<span>Serwis</span></a>
            <nav class="legal-language" aria-label="Language">${legalLanguageLinks(type, language)}</nav>
            <a class="btn btn-primary legal-back" href="${t.home}">← ${ui.back}</a>
        </div>
    </header>
    <main id="legal-main" class="legal-main">
        <div class="container">
        <section class="legal-page-heading" aria-labelledby="legal-title">
            <h1 id="legal-title">${title}</h1>
            <p class="legal-updated">${t.updated}</p>
        </section>
        <div class="legal-document-nav" aria-label="${ui.documents}">
            <a class="btn ${type === 'privacy' ? 'btn-primary' : 'legal-nav-button'}" href="${prefix}/privacy"${type === 'privacy' ? ' aria-current="page"' : ''}>${t.privacyTitle}</a>
            <a class="btn ${type === 'cookies' ? 'btn-primary' : 'legal-nav-button'}" href="${prefix}/cookies"${type === 'cookies' ? ' aria-current="page"' : ''}>${t.cookieTitle}</a>
            <button class="btn legal-nav-button legal-settings-button" type="button" data-consent-settings>${t.manage}</button>
        </div>
        <article class="legal-content">${body}</article>
        </div>
    </main>
    <footer class="legal-footer"><div class="container legal-footer-inner"><p>© 2026 NaSerwis.pl</p><div class="footer-legal-links"><a href="${prefix}/privacy">${t.privacyTitle}</a><a href="${prefix}/cookies">${t.cookieTitle}</a><button type="button" data-consent-settings>${t.manage}</button></div></div></footer>
</body>
</html>
`;
}

for (const page of await existingLandingPages()) await updateLandingPage(page);
for (const language of Object.keys(legal)) {
    const languageRoot = language === 'pl' ? publicRoot : path.join(publicRoot, language);
    for (const type of ['privacy', 'cookies']) {
        const directory = path.join(languageRoot, type);
        await fs.mkdir(directory, { recursive: true });
        await fs.writeFile(path.join(directory, 'index.html'), legalPage(language, type));
    }
}

console.log('Applied consent integration and generated 8 legal pages.');
