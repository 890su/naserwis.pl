import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");

const campaigns = {
  pl: {
    name: "Search PL Naprawa sieci Warszawa",
    prefix: "",
    maxCpc: "",
  },
  ru: {
    name: "Search RU Сети Варшава",
    prefix: "/ru",
    maxCpc: "",
  },
  uk: {
    name: "SRCH-UK-A-CORE",
    prefix: "/uk",
    maxCpc: "3.00",
  },
  en: {
    name: "SRCH-EN-A-CORE",
    prefix: "/en",
    maxCpc: "3.00",
  },
};

const routes = {
  "weak-wifi": "/naprawa-wifi/",
  "no-internet": "/naprawa-wifi/",
  "router-setup": "/naprawa-wifi/",
  "lan-repair": "/naprawa-sieci/",
  "lan-install": "/montaz-sieci/",
};

const definitions = {
  pl: {
    commonHeadlines: [
      "Serwis Sieci W Warszawie",
      "Dla Domu I Biura",
      "Umów Termin Telefonicznie",
      "Opisz Problem Online",
      "Warszawa I Okolice",
    ],
    intents: {
      "weak-wifi": {
        group: "INTENT-WIFI-COVERAGE",
        paths: ["wifi", "zasieg"],
        keywords: [
          "słaby zasięg wifi",
          "słaby sygnał wifi",
          "poprawa zasięgu wifi",
          "wifi nie działa w całym domu",
          "mesh wifi warszawa",
          "wzmacnianie zasięgu wifi",
        ],
        headlines: [
          "Słaby Zasięg Wi-Fi?",
          "Poprawimy Pokrycie Wi-Fi",
          "Koniec Martwych Stref Wi-Fi",
          "Pomiar I Ustawienie Wi-Fi",
          "Konfiguracja Mesh Wi-Fi",
        ],
        descriptions: [
          "Sprawdzimy zasięg, zakłócenia i ustawienie punktów dostępu. Uzgodnimy termin.",
          "Pomagamy poprawić Wi-Fi w domu i biurze. Mesh lub access point po diagnozie.",
          "Opisz martwe strefy w formularzu. Oddzwonimy i ustalimy kolejny krok.",
          "Obsługa po polsku, rosyjsku, ukraińsku i angielsku w Warszawie.",
        ],
      },
      "no-internet": {
        group: "INTENT-WIFI-NO-INTERNET",
        paths: ["wifi", "naprawa"],
        keywords: [
          "wifi nie działa",
          "brak internetu wifi",
          "problem z wifi warszawa",
          "naprawa wifi warszawa",
          "awaria wifi warszawa",
          "wifi połączone bez internetu",
        ],
        headlines: [
          "Wi-Fi Bez Internetu?",
          "Internet Nie Działa?",
          "Naprawa Wi-Fi Warszawa",
          "Diagnoza Routera I Sieci",
          "Przywrócimy Połączenie",
        ],
        descriptions: [
          "Wi-Fi jest, ale internet nie działa? Sprawdzimy router, kabel, DNS i sieć lokalną.",
          "Odróżnimy awarię operatora od problemu w domu lub biurze.",
          "Opisz objawy lub zadzwoń. Termin i zakres uzgodnimy przed wizytą.",
          "Pomoc sieciowa w Warszawie dla mieszkań i małych firm.",
        ],
      },
      "router-setup": {
        group: "INTENT-ROUTER-SETUP",
        paths: ["router", "konfiguracja"],
        keywords: [
          "konfiguracja routera",
          "konfiguracja routera warszawa",
          "ustawienie routera",
          "instalacja routera",
          "konfiguracja mesh",
          "konfiguracja sieci wifi",
        ],
        headlines: [
          "Konfiguracja Routera",
          "Router I Mesh Warszawa",
          "Bezpieczna Sieć Wi-Fi",
          "Sieć Gościnna I Mesh",
          "Ustawienie Routera Wi-Fi",
        ],
        descriptions: [
          "Skonfigurujemy router, Mesh, sieć gościnną i bezpieczne ustawienia Wi-Fi.",
          "Pomagamy dobrać ustawienie urządzeń do mieszkania, domu lub biura.",
          "Zakres i termin potwierdzimy przed wizytą. Opisz sprzęt w formularzu.",
          "Konfiguracja routerów i punktów dostępu w Warszawie i okolicach.",
        ],
      },
      "lan-repair": {
        group: "INTENT-LAN-REPAIR",
        paths: ["lan", "naprawa"],
        keywords: [
          "serwis sieci komputerowych",
          "naprawa sieci komputerowej",
          "naprawa kabla internetowego",
          "naprawa gniazda rj45",
          "awaria sieci lan",
          "naprawa lan warszawa",
        ],
        headlines: [
          "Naprawa Sieci LAN",
          "Awaria Kabla Lub RJ45?",
          "Serwis Sieci Komputerowej",
          "Diagnostyka Okablowania",
          "Naprawa Gniazd RJ45",
        ],
        descriptions: [
          "Diagnozujemy kabel, gniazdo RJ45, patch panel i port switcha.",
          "Znajdziemy źródło przerw w sieci LAN i przedstawimy możliwe naprawy.",
          "Opisz awarię lub zadzwoń. Zakres prac ustalimy przed wizytą.",
          "Serwis sieci komputerowych dla domu i firmy w Warszawie.",
        ],
      },
      "lan-install": {
        group: "INTENT-LAN-INSTALL",
        paths: ["lan", "montaz"],
        keywords: [
          "montaż sieci lan",
          "instalacja sieci lan",
          "okablowanie strukturalne warszawa",
          "montaż gniazd rj45",
          "projekt sieci komputerowej",
          "sieć lan dla biura",
        ],
        headlines: [
          "Montaż Sieci LAN Warszawa",
          "Okablowanie Strukturalne",
          "Montaż Gniazd RJ45",
          "Sieć LAN Dla Biura",
          "Projekt I Pomiary Sieci",
        ],
        descriptions: [
          "Projektujemy i montujemy sieci LAN, gniazda RJ45, patch panele i szafy RACK.",
          "Ustalamy trasę kabli, kategorię, oznaczenia i zakres pomiarów.",
          "Sieć dla domu lub biura. Wycena po poznaniu obiektu i zakresu.",
          "Wyślij opis lokalu lub zadzwoń, aby ustalić kolejny krok.",
        ],
      },
    },
  },
  ru: {
    commonHeadlines: [
      "Сетевой Сервис В Варшаве",
      "Для Дома И Офиса",
      "Запишитесь По Телефону",
      "Опишите Проблему Онлайн",
      "Варшава И Окрестности",
    ],
    intents: {
      "weak-wifi": {
        group: "INTENT-WIFI-COVERAGE",
        paths: ["wifi", "signal"],
        keywords: [
          "слабый сигнал wifi",
          "плохой wifi дома",
          "усилить сигнал wifi",
          "wifi плохо ловит",
          "настройка mesh wifi",
          "усиление wifi варшава",
        ],
        headlines: [
          "Слабый Сигнал Wi-Fi?",
          "Улучшим Покрытие Wi-Fi",
          "Уберём Мёртвые Зоны Wi-Fi",
          "Замер И Настройка Wi-Fi",
          "Настройка Mesh Wi-Fi",
        ],
        descriptions: [
          "Проверим покрытие, помехи и размещение точек доступа. Согласуем время визита.",
          "Поможем улучшить Wi-Fi дома или в офисе. Mesh или точка доступа после диагностики.",
          "Опишите мёртвые зоны в форме. Перезвоним и предложим следующий шаг.",
          "Обслуживание на русском, польском, украинском и английском в Варшаве.",
        ],
      },
      "no-internet": {
        group: "INTENT-WIFI-NO-INTERNET",
        paths: ["wifi", "remont"],
        keywords: [
          "не работает wifi",
          "нет интернета wifi",
          "wifi подключен без интернета",
          "ремонт wifi варшава",
          "ремонт интернета варшава",
          "пропадает интернет wifi",
        ],
        headlines: [
          "Wi-Fi Без Интернета?",
          "Интернет Не Работает?",
          "Ремонт Wi-Fi В Варшаве",
          "Диагностика Роутера И Сети",
          "Восстановим Подключение",
        ],
        descriptions: [
          "Wi-Fi подключён, но интернета нет? Проверим роутер, кабель, DNS и локальную сеть.",
          "Отделим сбой провайдера от проблемы дома или в офисе.",
          "Опишите симптомы или позвоните. Согласуем время и объём до визита.",
          "Помощь с сетью для квартир и небольших компаний в Варшаве.",
        ],
      },
      "router-setup": {
        group: "INTENT-ROUTER-SETUP",
        paths: ["router", "setup"],
        keywords: [
          "настройка роутера",
          "настройка роутера варшава",
          "установка роутера",
          "настройка mesh",
          "подключить роутер",
          "мастер по настройке роутера",
        ],
        headlines: [
          "Настройка Роутера",
          "Роутер И Mesh В Варшаве",
          "Безопасная Сеть Wi-Fi",
          "Гостевая Сеть И Mesh",
          "Настроим Роутер Wi-Fi",
        ],
        descriptions: [
          "Настроим роутер, Mesh, гостевую сеть и безопасные параметры Wi-Fi.",
          "Подберём размещение оборудования для квартиры, дома или офиса.",
          "Согласуем объём и время до визита. Укажите модель оборудования в форме.",
          "Настройка роутеров и точек доступа в Варшаве и окрестностях.",
        ],
      },
      "lan-repair": {
        group: "INTENT-LAN-REPAIR",
        paths: ["lan", "remont"],
        keywords: [
          "ремонт компьютерной сети",
          "ремонт локальной сети",
          "ремонт интернет кабеля",
          "ремонт кабеля rj45",
          "ремонт розетки rj45",
          "сетевой мастер варшава",
        ],
        headlines: [
          "Ремонт Сети LAN",
          "Проблема С Кабелем RJ45?",
          "Сервис Компьютерной Сети",
          "Диагностика Кабельной Сети",
          "Ремонт Розеток RJ45",
        ],
        descriptions: [
          "Проверим кабель, розетку RJ45, патч-панель и порт коммутатора.",
          "Найдём источник обрывов LAN и предложим варианты ремонта.",
          "Опишите неисправность или позвоните. Согласуем объём работ до визита.",
          "Сервис компьютерных сетей для дома и бизнеса в Варшаве.",
        ],
      },
      "lan-install": {
        group: "INTENT-LAN-INSTALL",
        paths: ["lan", "montazh"],
        keywords: [
          "монтаж локальной сети",
          "монтаж сети lan",
          "прокладка интернет кабеля",
          "монтаж розеток rj45",
          "компьютерная сеть для офиса",
          "монтаж сети варшава",
        ],
        headlines: [
          "Монтаж Сети LAN В Варшаве",
          "Структурированная Сеть LAN",
          "Монтаж Розеток RJ45",
          "Сеть LAN Для Офиса",
          "Проект И Измерения Сети",
        ],
        descriptions: [
          "Проектируем и монтируем LAN, розетки RJ45, патч-панели и шкафы RACK.",
          "Согласуем трассы, категорию кабеля, маркировку и объём измерений.",
          "Сеть для дома или офиса. Оценка после знакомства с объектом и задачей.",
          "Отправьте описание помещения или позвоните, чтобы обсудить следующий шаг.",
        ],
      },
    },
  },
  uk: {
    commonHeadlines: [
      "Сервіс Мереж У Варшаві",
      "Для Дому Та Офісу",
      "Запишіться Телефоном",
      "Опишіть Проблему Онлайн",
      "Варшава Та Околиці",
    ],
    intents: {
      "weak-wifi": {
        group: "INTENT-WIFI-COVERAGE",
        paths: ["wifi", "signal"],
        keywords: [
          "слабкий сигнал wifi",
          "поганий wifi вдома",
          "посилити сигнал wifi",
          "wifi погано ловить",
          "налаштування mesh wifi",
          "покращити покриття wifi",
        ],
        headlines: [
          "Слабкий Сигнал Wi-Fi?",
          "Покращимо Покриття Wi-Fi",
          "Приберемо Мертві Зони Wi-Fi",
          "Вимір І Налаштування Wi-Fi",
          "Налаштування Mesh Wi-Fi",
        ],
        descriptions: [
          "Перевіримо покриття, перешкоди й розташування точок доступу. Узгодимо візит.",
          "Допоможемо покращити Wi-Fi вдома чи в офісі. Mesh або точка після діагностики.",
          "Опишіть мертві зони у формі. Передзвонимо й запропонуємо наступний крок.",
          "Обслуговування українською, польською, російською та англійською.",
        ],
      },
      "no-internet": {
        group: "INTENT-WIFI-NO-INTERNET",
        paths: ["wifi", "remont"],
        keywords: [
          "не працює wifi",
          "немає інтернету wifi",
          "wifi підключено без інтернету",
          "ремонт wifi варшава",
          "ремонт інтернету варшава",
          "зникає інтернет wifi",
        ],
        headlines: [
          "Wi-Fi Без Інтернету?",
          "Інтернет Не Працює?",
          "Ремонт Wi-Fi У Варшаві",
          "Діагностика Роутера Й Мережі",
          "Відновимо Підключення",
        ],
        descriptions: [
          "Wi-Fi підключено, але інтернету немає? Перевіримо роутер, кабель, DNS і мережу.",
          "Відокремимо збій провайдера від проблеми вдома чи в офісі.",
          "Опишіть симптоми або зателефонуйте. Узгодимо час і обсяг до візиту.",
          "Допомога з мережею для квартир і невеликих компаній у Варшаві.",
        ],
      },
      "router-setup": {
        group: "INTENT-ROUTER-SETUP",
        paths: ["router", "setup"],
        keywords: [
          "налаштування роутера",
          "налаштування роутера варшава",
          "встановлення роутера",
          "налаштування mesh",
          "підключити роутер",
          "майстер з налаштування роутера",
        ],
        headlines: [
          "Налаштування Роутера",
          "Роутер І Mesh У Варшаві",
          "Безпечна Мережа Wi-Fi",
          "Гостьова Мережа І Mesh",
          "Налаштуємо Роутер Wi-Fi",
        ],
        descriptions: [
          "Налаштуємо роутер, Mesh, гостьову мережу й безпечні параметри Wi-Fi.",
          "Підберемо розташування обладнання для квартири, будинку чи офісу.",
          "Узгодимо обсяг і час до візиту. Вкажіть модель обладнання у формі.",
          "Налаштування роутерів і точок доступу у Варшаві та околицях.",
        ],
      },
      "lan-repair": {
        group: "INTENT-LAN-REPAIR",
        paths: ["lan", "remont"],
        keywords: [
          "ремонт комп'ютерної мережі",
          "ремонт локальної мережі",
          "ремонт інтернет кабелю",
          "ремонт кабелю rj45",
          "ремонт розетки rj45",
          "мережевий майстер варшава",
        ],
        headlines: [
          "Ремонт Мережі LAN",
          "Проблема З Кабелем RJ45?",
          "Сервіс Комп'ютерної Мережі",
          "Діагностика Кабельної Мережі",
          "Ремонт Розеток RJ45",
        ],
        descriptions: [
          "Перевіримо кабель, розетку RJ45, патч-панель і порт комутатора.",
          "Знайдемо джерело обривів LAN і запропонуємо варіанти ремонту.",
          "Опишіть несправність або зателефонуйте. Узгодимо обсяг до візиту.",
          "Сервіс комп'ютерних мереж для дому й бізнесу у Варшаві.",
        ],
      },
      "lan-install": {
        group: "INTENT-LAN-INSTALL",
        paths: ["lan", "montazh"],
        keywords: [
          "монтаж локальної мережі",
          "монтаж мережі lan",
          "прокладання інтернет кабелю",
          "монтаж розеток rj45",
          "комп'ютерна мережа для офісу",
          "монтаж мережі варшава",
        ],
        headlines: [
          "Монтаж Мережі LAN Варшава",
          "Структурована Кабельна Мережа",
          "Монтаж Розеток RJ45",
          "Мережа LAN Для Офісу",
          "Проєкт І Вимірювання Мережі",
        ],
        descriptions: [
          "Проєктуємо й монтуємо LAN, розетки RJ45, патч-панелі та шафи RACK.",
          "Узгодимо траси, категорію кабелю, маркування й обсяг вимірювань.",
          "Мережа для дому чи офісу. Оцінка після знайомства з об'єктом і завданням.",
          "Надішліть опис приміщення або зателефонуйте, щоб обговорити наступний крок.",
        ],
      },
    },
  },
  en: {
    commonHeadlines: [
      "Network Service In Warsaw",
      "For Homes And Offices",
      "Book By Phone",
      "Describe The Problem Online",
      "Warsaw And Nearby Areas",
    ],
    intents: {
      "weak-wifi": {
        group: "INTENT-WIFI-COVERAGE",
        paths: ["wifi", "coverage"],
        keywords: [
          "weak wifi signal",
          "poor wifi coverage",
          "improve wifi coverage",
          "wifi dead zones",
          "mesh wifi setup",
          "wifi coverage service warsaw",
        ],
        headlines: [
          "Weak Wi-Fi Signal?",
          "Improve Wi-Fi Coverage",
          "Remove Wi-Fi Dead Zones",
          "Wi-Fi Survey And Setup",
          "Mesh Wi-Fi Configuration",
        ],
        descriptions: [
          "We check coverage, interference and access point placement. Book a Warsaw visit.",
          "Improve Wi-Fi at home or work. We recommend Mesh or access points after diagnosis.",
          "Describe the dead zones in the form. We will call back with the next step.",
          "Service in English, Polish, Russian and Ukrainian across Warsaw.",
        ],
      },
      "no-internet": {
        group: "INTENT-WIFI-NO-INTERNET",
        paths: ["wifi", "repair"],
        keywords: [
          "wifi not working",
          "no internet wifi",
          "connected no internet",
          "wifi repair warsaw",
          "wifi technician warsaw",
          "intermittent wifi repair",
        ],
        headlines: [
          "Wi-Fi Without Internet?",
          "Internet Not Working?",
          "Wi-Fi Repair In Warsaw",
          "Router And Network Check",
          "Restore Your Connection",
        ],
        descriptions: [
          "Wi-Fi connects but internet fails? We check the router, cable, DNS and local network.",
          "We separate provider outages from faults inside your home or office.",
          "Describe the symptoms or call. We agree the visit and scope in advance.",
          "Network help for Warsaw homes and small businesses.",
        ],
      },
      "router-setup": {
        group: "INTENT-ROUTER-SETUP",
        paths: ["router", "setup"],
        keywords: [
          "router setup",
          "router setup warsaw",
          "router installation",
          "mesh setup",
          "configure wifi router",
          "router technician warsaw",
        ],
        headlines: [
          "Router Setup In Warsaw",
          "Router And Mesh Setup",
          "Secure Wi-Fi Network",
          "Guest Network And Mesh",
          "Configure Your Wi-Fi Router",
        ],
        descriptions: [
          "We configure routers, Mesh, guest networks and secure Wi-Fi settings.",
          "We help place equipment for an apartment, house or office.",
          "We confirm the scope and visit first. Add the device model to your request.",
          "Router and access point setup in Warsaw and nearby areas.",
        ],
      },
      "lan-repair": {
        group: "INTENT-LAN-REPAIR",
        paths: ["lan", "repair"],
        keywords: [
          "network repair warsaw",
          "lan network repair",
          "internet cable repair",
          "rj45 socket repair",
          "office network repair",
          "network technician warsaw",
        ],
        headlines: [
          "LAN Network Repair",
          "Cable Or RJ45 Problem?",
          "Computer Network Service",
          "Network Cabling Diagnosis",
          "RJ45 Socket Repair",
        ],
        descriptions: [
          "We test the cable, RJ45 socket, patch panel and switch port.",
          "We find the cause of LAN dropouts and explain the available repair options.",
          "Describe the fault or call. We agree the work scope before the visit.",
          "Computer network service for Warsaw homes and businesses.",
        ],
      },
      "lan-install": {
        group: "INTENT-LAN-INSTALL",
        paths: ["lan", "install"],
        keywords: [
          "lan installation",
          "lan installation warsaw",
          "network cabling warsaw",
          "rj45 outlet installation",
          "office network installation",
          "structured cabling warsaw",
        ],
        headlines: [
          "LAN Installation Warsaw",
          "Structured Network Cabling",
          "RJ45 Outlet Installation",
          "Office LAN Network",
          "Network Design And Testing",
        ],
        descriptions: [
          "We design and install LAN, RJ45 outlets, patch panels and RACK cabinets.",
          "We agree cable routes, category, labelling and the measurement scope.",
          "Networks for homes and offices. We quote after reviewing the site and scope.",
          "Send the site details or call us to agree the next step.",
        ],
      },
    },
  },
};

const csvFiles = {
  groups: path.join(rootDir, "ads", "intent-ad-groups-2026-09-17.csv"),
  keywords: path.join(rootDir, "ads", "intent-keywords-2026-09-17.csv"),
  ads: path.join(rootDir, "ads", "intent-responsive-search-ads-2026-09-17.csv"),
};

const charCount = (value) => Array.from(value).length;
const quoteCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;
const toCsv = (headers, rows) =>
  `${headers.map(quoteCsv).join(",")}\r\n${rows
    .map((row) => headers.map((header) => quoteCsv(row[header] ?? "")).join(","))
    .join("\r\n")}\r\n`;

const groupRows = [];
const keywordRows = [];
const adRows = [];

for (const [locale, campaign] of Object.entries(campaigns)) {
  const localeDefinition = definitions[locale];
  assert(localeDefinition, `Missing definition for ${locale}`);

  for (const [intent, intentDefinition] of Object.entries(localeDefinition.intents)) {
    assert(routes[intent], `Missing route for ${intent}`);
    assert.equal(intentDefinition.keywords.length, 6, `${locale}/${intent} needs six keywords`);
    assert.equal(intentDefinition.headlines.length, 5, `${locale}/${intent} needs five intent headlines`);
    assert.equal(intentDefinition.descriptions.length, 4, `${locale}/${intent} needs four descriptions`);

    const finalUrl = `https://naserwis.pl${campaign.prefix}${routes[intent]}?intent=${intent}`;
    const headlines = [...intentDefinition.headlines, ...localeDefinition.commonHeadlines];
    assert.equal(new Set(headlines).size, headlines.length, `${locale}/${intent} has duplicate headlines`);
    assert(headlines.length >= 8, `${locale}/${intent} needs at least eight headlines`);
    headlines.forEach((headline) =>
      assert(charCount(headline) <= 30, `${locale}/${intent} headline over 30: ${headline}`),
    );
    intentDefinition.descriptions.forEach((description) =>
      assert(charCount(description) <= 90, `${locale}/${intent} description over 90: ${description}`),
    );
    intentDefinition.paths.forEach((pathPart) =>
      assert(charCount(pathPart) <= 15, `${locale}/${intent} path over 15: ${pathPart}`),
    );

    groupRows.push({
      Campaign: campaign.name,
      "Ad group": intentDefinition.group,
      Status: "Paused",
      "Max CPC": campaign.maxCpc,
    });

    for (const keyword of intentDefinition.keywords) {
      for (const matchType of ["Phrase", "Exact"]) {
        keywordRows.push({
          Campaign: campaign.name,
          "Ad group": intentDefinition.group,
          Keyword: keyword,
          "Match type": matchType,
          Status: "Enabled",
          "Final URL": finalUrl,
        });
      }
    }

    const adRow = {
      Campaign: campaign.name,
      "Ad group": intentDefinition.group,
      Status: "Enabled",
      "Ad type": "Responsive search ad",
      "Final URL": finalUrl,
      "Path 1": intentDefinition.paths[0],
      "Path 2": intentDefinition.paths[1],
    };
    headlines.forEach((headline, index) => {
      adRow[`Headline ${index + 1}`] = headline;
    });
    intentDefinition.descriptions.forEach((description, index) => {
      adRow[`Description ${index + 1}`] = description;
    });
    adRows.push(adRow);
  }
}

assert.equal(groupRows.length, 20, "Expected 20 ad groups");
assert.equal(keywordRows.length, 240, "Expected 240 phrase/exact keywords");
assert.equal(adRows.length, 20, "Expected 20 responsive search ads");
assert(keywordRows.every((row) => row["Match type"] !== "Broad"), "Broad match is not allowed");
assert(
  keywordRows.every((row) => /[?&]intent=(weak-wifi|no-internet|router-setup|lan-repair|lan-install)$/.test(row["Final URL"])),
  "Every keyword URL must end with an allowlisted intent",
);

const duplicateKeywordKeys = keywordRows
  .map((row) => `${row.Campaign}\u0000${row["Ad group"]}\u0000${row["Match type"]}\u0000${row.Keyword.toLowerCase()}`)
  .filter((key, index, keys) => keys.indexOf(key) !== index);
assert.deepEqual(duplicateKeywordKeys, [], "Duplicate keyword rows found");

const groupHeaders = ["Campaign", "Ad group", "Status", "Max CPC"];
const keywordHeaders = ["Campaign", "Ad group", "Keyword", "Match type", "Status", "Final URL"];
const adHeaders = [
  "Campaign",
  "Ad group",
  "Status",
  "Ad type",
  "Final URL",
  "Path 1",
  "Path 2",
  ...Array.from({ length: 10 }, (_, index) => `Headline ${index + 1}`),
  ...Array.from({ length: 4 }, (_, index) => `Description ${index + 1}`),
];

const expected = {
  [csvFiles.groups]: toCsv(groupHeaders, groupRows),
  [csvFiles.keywords]: toCsv(keywordHeaders, keywordRows),
  [csvFiles.ads]: toCsv(adHeaders, adRows),
};

if (checkOnly) {
  for (const [filePath, content] of Object.entries(expected)) {
    assert.equal(await readFile(filePath, "utf8"), content, `${path.basename(filePath)} is stale`);
  }
  console.log("Intent Ads pack is current: 20 paused groups, 240 phrase/exact keywords, 20 RSAs.");
} else {
  await Promise.all(Object.entries(expected).map(([filePath, content]) => writeFile(filePath, content, "utf8")));
  console.log("Generated Intent Ads pack: 20 paused groups, 240 phrase/exact keywords, 20 RSAs.");
}
