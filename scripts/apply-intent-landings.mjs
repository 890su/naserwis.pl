import { readFile, writeFile } from 'node:fs/promises';

const markerStart = '<!-- INTENT LANDING CONTENT START -->';
const markerEnd = '<!-- INTENT LANDING CONTENT END -->';

const copy = {
  pl: {
    wifi: {
      eyebrow: 'Wybierz objaw',
      title: 'Co dokładnie dzieje się z internetem?',
      intro: 'Wskaż najbliższy problem. Dopasujemy diagnozę i od razu przekażemy temat do formularza.',
      options: [
        ['weak-wifi', 'Zasięg', 'Słaby sygnał Wi‑Fi', 'Martwe strefy, wolne pokoje, zakłócenia i zrywające połączenie.'],
        ['no-internet', 'Połączenie', 'Wi‑Fi jest, internetu nie ma', 'Urządzenie łączy się z routerem, ale strony nie działają lub połączenie zanika.'],
        ['router-setup', 'Konfiguracja', 'Router albo Mesh do ustawienia', 'Bezpieczna konfiguracja, punkty dostępowe, sieć gościnna i płynny roaming.'],
      ],
    },
    repair: {
      eyebrow: 'Diagnoza bez zgadywania',
      title: 'Jak przywracamy sprawne połączenie',
      intro: 'Najpierw mierzymy linię i porty, dopiero potem proponujemy naprawę. Po pracy ponownie testujemy połączenie.',
      steps: [
        ['01', 'Pomiar', 'Sprawdzamy kabel, gniazdo, port switcha i parametry połączenia.'],
        ['02', 'Lokalizacja', 'Wskazujemy miejsce przerwy, luźne złącze albo niesprawny element.'],
        ['03', 'Naprawa', 'Wymieniamy złącze, gniazdo, odcinek przewodu lub konfigurację portu.'],
        ['04', 'Test końcowy', 'Potwierdzamy stabilność i uzyskaną prędkość przed zakończeniem pracy.'],
      ],
    },
    install: {
      eyebrow: 'Od projektu do protokołu',
      title: 'Co otrzymujesz po montażu sieci LAN',
      intro: 'Instalacja ma być nie tylko szybka, ale też czytelna i łatwa w późniejszym serwisie.',
      items: [
        ['Projekt trasy', 'Rozmieszczenie punktów, długości i sposób prowadzenia przewodów.'],
        ['Opisane porty', 'Gniazda, patch panel i przewody oznaczone zgodnie ze schematem.'],
        ['Pomiary', 'Test każdego toru po zakończeniu montażu i usunięcie błędów.'],
        ['Dokumentacja', 'Schemat i lista punktów dla firmy lub właściciela domu.'],
      ],
    },
  },
  ru: {
    wifi: {
      eyebrow: 'Выберите симптом', title: 'Что именно происходит с интернетом?', intro: 'Выберите ближайшую проблему. Мы подберём диагностику и передадим тему в форму заявки.',
      options: [
        ['weak-wifi', 'Покрытие', 'Слабый сигнал Wi‑Fi', 'Мёртвые зоны, низкая скорость в комнатах, помехи и обрывы.'],
        ['no-internet', 'Подключение', 'Wi‑Fi есть, интернета нет', 'Устройство подключено к роутеру, но сайты не открываются или связь пропадает.'],
        ['router-setup', 'Настройка', 'Нужно настроить роутер или Mesh', 'Безопасная конфигурация, точки доступа, гостевая сеть и бесшовный роуминг.'],
      ],
    },
    repair: {
      eyebrow: 'Диагностика без догадок', title: 'Как мы восстанавливаем подключение', intro: 'Сначала измеряем линию и порты, затем предлагаем ремонт. После работы снова проверяем соединение.',
      steps: [
        ['01', 'Измерение', 'Проверяем кабель, розетку, порт коммутатора и параметры соединения.'],
        ['02', 'Поиск причины', 'Находим место обрыва, плохой контакт или неисправный элемент.'],
        ['03', 'Ремонт', 'Меняем коннектор, розетку, участок кабеля или конфигурацию порта.'],
        ['04', 'Финальный тест', 'Проверяем стабильность и скорость до завершения работы.'],
      ],
    },
    install: {
      eyebrow: 'От проекта до протокола', title: 'Что вы получаете после монтажа LAN', intro: 'Сеть должна быть не только быстрой, но и понятной для дальнейшего обслуживания.',
      items: [
        ['Проект трасс', 'Расположение точек, длины и способ прокладки кабелей.'],
        ['Маркировка портов', 'Розетки, патч-панель и кабели обозначены по схеме.'],
        ['Измерения', 'Тест каждой линии после монтажа и устранение обнаруженных ошибок.'],
        ['Документация', 'Схема и перечень точек для компании или владельца дома.'],
      ],
    },
  },
  uk: {
    wifi: {
      eyebrow: 'Оберіть симптом', title: 'Що саме відбувається з інтернетом?', intro: 'Оберіть найближчу проблему. Ми підберемо діагностику та передамо тему у форму заявки.',
      options: [
        ['weak-wifi', 'Покриття', 'Слабкий сигнал Wi‑Fi', 'Мертві зони, низька швидкість у кімнатах, перешкоди та обриви.'],
        ['no-internet', 'Підключення', 'Wi‑Fi є, інтернету немає', 'Пристрій підключений до роутера, але сайти не відкриваються або зв’язок зникає.'],
        ['router-setup', 'Налаштування', 'Потрібно налаштувати роутер або Mesh', 'Безпечна конфігурація, точки доступу, гостьова мережа та безшовний роумінг.'],
      ],
    },
    repair: {
      eyebrow: 'Діагностика без здогадок', title: 'Як ми відновлюємо підключення', intro: 'Спочатку вимірюємо лінію та порти, потім пропонуємо ремонт. Після роботи знову перевіряємо з’єднання.',
      steps: [
        ['01', 'Вимірювання', 'Перевіряємо кабель, розетку, порт комутатора та параметри з’єднання.'],
        ['02', 'Пошук причини', 'Знаходимо місце обриву, поганий контакт або несправний елемент.'],
        ['03', 'Ремонт', 'Замінюємо конектор, розетку, ділянку кабелю або конфігурацію порту.'],
        ['04', 'Фінальний тест', 'Перевіряємо стабільність і швидкість до завершення роботи.'],
      ],
    },
    install: {
      eyebrow: 'Від проєкту до протоколу', title: 'Що ви отримуєте після монтажу LAN', intro: 'Мережа має бути не лише швидкою, а й зрозумілою для подальшого обслуговування.',
      items: [
        ['Проєкт трас', 'Розташування точок, довжини та спосіб прокладання кабелів.'],
        ['Маркування портів', 'Розетки, патч-панель і кабелі позначені за схемою.'],
        ['Вимірювання', 'Тест кожної лінії після монтажу та усунення знайдених помилок.'],
        ['Документація', 'Схема та перелік точок для компанії або власника будинку.'],
      ],
    },
  },
  en: {
    wifi: {
      eyebrow: 'Choose the symptom', title: 'What exactly is happening with the connection?', intro: 'Choose the closest problem. We will match the diagnosis and carry the topic into the enquiry form.',
      options: [
        ['weak-wifi', 'Coverage', 'Weak Wi‑Fi signal', 'Dead zones, slow rooms, interference and a connection that keeps dropping.'],
        ['no-internet', 'Connection', 'Wi‑Fi connects, but there is no internet', 'The device reaches the router, but pages do not load or the connection disappears.'],
        ['router-setup', 'Setup', 'Router or Mesh needs configuring', 'Secure setup, access points, guest network and seamless roaming.'],
      ],
    },
    repair: {
      eyebrow: 'Diagnosis without guesswork', title: 'How we restore a working connection', intro: 'We test the line and ports before proposing a repair. We test the connection again when the work is complete.',
      steps: [
        ['01', 'Measure', 'We check the cable, socket, switch port and connection parameters.'],
        ['02', 'Locate', 'We identify the break, loose termination or failed component.'],
        ['03', 'Repair', 'We replace the connector, socket, cable section or port configuration.'],
        ['04', 'Final test', 'We confirm stability and achieved speed before completing the job.'],
      ],
    },
    install: {
      eyebrow: 'From design to test record', title: 'What you receive after a LAN installation', intro: 'The finished network should be fast, clearly labelled and straightforward to maintain.',
      items: [
        ['Route plan', 'Outlet locations, cable lengths and the agreed installation method.'],
        ['Labelled ports', 'Sockets, patch panel and cables marked against the network plan.'],
        ['Measurements', 'Every run tested after installation and faults corrected.'],
        ['Documentation', 'A diagram and outlet list for the business or homeowner.'],
      ],
    },
  },
};

const pages = [];
for (const language of Object.keys(copy)) {
  const prefix = language === 'pl' ? '' : `${language}/`;
  pages.push(
    { file: `public/${prefix}naprawa-wifi/index.html`, language, type: 'wifi' },
    { file: `public/${prefix}naprawa-sieci/index.html`, language, type: 'repair' },
    { file: `public/${prefix}montaz-sieci/index.html`, language, type: 'install' },
  );
}

function wifiBlock(content) {
  const options = content.options.map(([intent, tag, title, description]) => `
                    <button type="button" class="intent-option" data-intent-select="${intent}" data-contact-modal aria-pressed="false">
                        <span class="intent-option-tag">${tag}</span>
                        <strong>${title}</strong>
                        <span>${description}</span>
                    </button>`).join('');
  return `<section class="intent-cluster" aria-labelledby="intent-cluster-title">
                <div class="intent-cluster-heading">
                    <span class="intent-cluster-eyebrow">${content.eyebrow}</span>
                    <h3 id="intent-cluster-title">${content.title}</h3>
                    <p>${content.intro}</p>
                </div>
                <div class="intent-options">${options}
                </div>
            </section>`;
}

function repairBlock(content) {
  const steps = content.steps.map(([number, title, description]) => `
                    <li><span>${number}</span><div><strong>${title}</strong><p>${description}</p></div></li>`).join('');
  return `<section class="service-proof" aria-labelledby="service-proof-title">
                <div class="service-proof-heading">
                    <span>${content.eyebrow}</span>
                    <h3 id="service-proof-title">${content.title}</h3>
                    <p>${content.intro}</p>
                </div>
                <ol class="service-proof-flow">${steps}
                </ol>
            </section>`;
}

function installBlock(content) {
  const items = content.items.map(([title, description]) => `
                    <li><strong>${title}</strong><span>${description}</span></li>`).join('');
  return `<section class="delivery-panel" aria-labelledby="delivery-panel-title">
                <div class="delivery-panel-heading">
                    <span>${content.eyebrow}</span>
                    <h3 id="delivery-panel-title">${content.title}</h3>
                    <p>${content.intro}</p>
                </div>
                <ul class="delivery-grid">${items}
                </ul>
            </section>`;
}

for (const page of pages) {
  let html = await readFile(page.file, 'utf8');
  html = html.replace(new RegExp(`\\s*${markerStart}[\\s\\S]*?${markerEnd}\\s*`, 'g'), '\n\n');
  const content = copy[page.language][page.type];
  const block = page.type === 'wifi' ? wifiBlock(content) : page.type === 'repair' ? repairBlock(content) : installBlock(content);
  const insertion = `\n\n            ${markerStart}\n            ${block}\n            ${markerEnd}\n\n                `;
  if (!html.includes('<div class="segment-cards">')) throw new Error(`Insertion point missing: ${page.file}`);
  html = html.replace('<div class="segment-cards">', `${insertion}<div class="segment-cards">`);
  await writeFile(page.file, html);
}

console.log(`Intent landing content synchronized across ${pages.length} service pages.`);
