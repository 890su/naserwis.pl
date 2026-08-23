import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "ads");

const zones = {
  CORE: {
    campaignPart: "A-CORE",
    label: "core",
    enabledAtLaunch: true,
    locations: [
      ["Ursynow", "9061062", "district", "0%"],
      ["Natolin", "9214859", "neighbourhood", "0%"],
      ["Wilanow", "9061075", "district", "0%"],
      ["Mokotow", "9061060", "district", "0%"],
      ["Sadyba", "", "radius/postal-codes", "0%"],
    ],
  },
  FAR: {
    campaignPart: "B-WARSAW-FAR",
    label: "warsaw_far",
    enabledAtLaunch: true,
    locations: [
      ["Srodmiescie", "9061066", "district", "-20%"],
      ["Ochota", "9061069", "district", "-20%"],
      ["Wola", "9061063", "district", "-20%"],
      ["Ursus", "9061072", "district", "-20%"],
      ["Praga-Polnoc", "9061071", "district", "-30%"],
      ["Praga-Poludnie", "9061061", "district", "-30%"],
      ["Wawer", "9061070", "district", "-30%"],
    ],
  },
  OUTSIDE: {
    campaignPart: "C-OUTSIDE",
    label: "outside",
    enabledAtLaunch: false,
    locations: [
      ["Piaseczno", "1011410", "city", "-40%"],
      ["Konstancin-Jeziorna", "1011401", "city", "-40%"],
      ["Grodzisk Mazowiecki", "1031036", "city", "-50%"],
    ],
  },
};

const languages = {
  PL: {
    googleLanguage: "Polish",
    coreDailyBudget: 30,
    desiredCoreStatus: "Paused",
    defaultMaxCpc: 4,
    prefix: "",
    keywords: {
      "WIFI-REPAIR": ["naprawa wifi", "naprawa wifi warszawa", "konfiguracja routera", "konfiguracja routera warszawa", "montaż mesh", "montaż mesh warszawa", "słaby zasięg wifi", "wifi nie działa"],
      "LAN-INSTALL": ["montaż sieci lan", "montaż sieci lan warszawa", "okablowanie strukturalne", "okablowanie strukturalne warszawa", "montaż gniazda rj45", "zarabianie kabli rj45", "instalacja sieci komputerowej", "montaż szafy rack"],
      "LAN-CCTV-REPAIR": ["naprawa sieci lan", "naprawa sieci lan warszawa", "serwis sieci komputerowych", "diagnostyka sieci lan", "naprawa okablowania", "naprawa monitoringu", "serwis monitoringu cctv", "naprawa gniazda rj45"],
      "PC-LAPTOP-REPAIR": ["naprawa laptopów warszawa", "naprawa komputerów warszawa", "serwis laptopów warszawa", "serwis komputerowy warszawa", "pogotowie komputerowe warszawa", "wolny komputer naprawa", "czyszczenie laptopa warszawa", "naprawa komputerów ursynów"],
      "IT-GENERAL": ["serwis it warszawa", "serwis informatyczny warszawa", "informatyk z dojazdem warszawa", "pomoc komputerowa warszawa", "obsługa informatyczna warszawa", "informatyk warszawa dojazd", "administracja it warszawa"],
    },
    ads: {
      "WIFI-REPAIR": {
        headlines: ["Naprawa Wi-Fi Warszawa", "Konfiguracja Routera", "Lepszy Zasięg Wi-Fi", "Montaż Systemów Mesh", "Serwis Z Dojazdem", "Diagnoza Sieci Wi-Fi", "Pomoc Dla Domu I Firmy", "Umów Termin Telefonicznie"],
        descriptions: ["Diagnozujemy problemy z Wi-Fi, routerem i zasięgiem. Dojazd po uzgodnieniu.", "Konfiguracja routera i Mesh w domu lub firmie. Jasne warunki przed wizytą.", "Słaby zasięg albo zrywanie połączenia? Sprawdzimy sieć i zaproponujemy rozwiązanie.", "Obsługa po polsku, ukraińsku, rosyjsku i angielsku. Zadzwoń lub wyślij formularz."],
      },
      "LAN-INSTALL": {
        headlines: ["Montaż Sieci LAN Warszawa", "Okablowanie Strukturalne", "Montaż Gniazd RJ45", "Instalacja Szafy RACK", "Sieć LAN Dla Firmy", "Wycena Po Konsultacji", "Serwis Z Dojazdem", "Umów Oględziny Instalacji"],
        descriptions: ["Projektujemy i montujemy sieci LAN, gniazda RJ45 oraz szafy RACK w Warszawie.", "Wstępna konsultacja telefoniczna. Koszt wizyty uzgadniamy przed przyjazdem.", "Instalacje dla mieszkań, biur i lokali. Zakres i materiały potwierdzamy przed pracą.", "Termin ustalamy indywidualnie. Zadzwoń albo prześlij krótki opis instalacji."],
      },
      "LAN-CCTV-REPAIR": {
        headlines: ["Naprawa Sieci LAN", "Serwis Okablowania", "Diagnostyka Sieci Firmowej", "Naprawa Gniazd RJ45", "Serwis Monitoringu CCTV", "Dojazd Na Terenie Warszawy", "Jasne Warunki Wizyty", "Zgłoś Awarię Sieci"],
        descriptions: ["Lokalizujemy usterki LAN, okablowania i gniazd RJ45. Zakres ustalamy przed pracą.", "Pomagamy przy awariach sieci i monitoringu CCTV w domu, biurze lub lokalu.", "Dojazd i termin po uzgodnieniu. Bez obietnic naprawy przed wykonaniem diagnozy.", "Opisz problem w formularzu albo zadzwoń. Odpowiemy i ustalimy następny krok."],
      },
      "PC-LAPTOP-REPAIR": {
        headlines: ["Naprawa Komputerów Warszawa", "Serwis Laptopów", "Komputer Działa Wolno?", "Diagnostyka Komputera", "Serwis Z Dojazdem", "Pomoc Dla Domu I Firmy", "Warunki Przed Naprawą", "Umów Termin Telefonicznie"],
        descriptions: ["Diagnozujemy komputery i laptopy. Zakres oraz koszt potwierdzamy przed naprawą.", "Wolny komputer lub awaria sprzętu? Umów diagnostykę i wizytę w Warszawie.", "Dojazd i termin po uzgodnieniu. Części i dodatkowe prace wymagają akceptacji.", "Zadzwoń albo opisz problem w formularzu. Ustalimy właściwy następny krok."],
      },
      "IT-GENERAL": {
        headlines: ["Serwis IT Warszawa", "Informatyk Z Dojazdem", "Pomoc IT Dla Domu I Firmy", "Wsparcie Sieci I Komputerów", "Obsługa W 4 Językach", "Termin Po Uzgodnieniu", "Przejrzyste Warunki Usługi", "Skontaktuj Się Z Serwisem"],
        descriptions: ["Pomoc IT z dojazdem w Warszawie: sieci, Wi-Fi i konfiguracja sprzętu.", "Obsługa po polsku, ukraińsku, rosyjsku i angielsku. Termin po uzgodnieniu.", "Najpierw poznajemy problem, potem potwierdzamy zakres i warunki wizyty.", "Zadzwoń, napisz na komunikatorze lub wyślij formularz kontaktowy."],
      },
    },
  },
  RU: {
    googleLanguage: "Russian",
    coreDailyBudget: 10,
    desiredCoreStatus: "Enabled",
    defaultMaxCpc: 3,
    prefix: "/ru",
    keywords: {
      "WIFI-REPAIR": ["ремонт wifi", "ремонт wifi варшава", "настройка роутера", "настройка роутера варшава", "установка mesh", "слабый сигнал wifi", "не работает wifi"],
      "LAN-INSTALL": ["монтаж сети lan", "монтаж сети lan варшава", "структурированная кабельная система", "монтаж розетки rj45", "обжим кабеля rj45", "монтаж компьютерной сети", "монтаж шкафа rack"],
      "LAN-CCTV-REPAIR": ["ремонт сети lan", "ремонт сети lan варшава", "обслуживание компьютерных сетей", "диагностика сети lan", "ремонт кабельной сети", "ремонт видеонаблюдения", "ремонт розетки rj45"],
      "PC-LAPTOP-REPAIR": ["ремонт ноутбуков варшава", "ремонт компьютеров варшава", "компьютерный сервис варшава", "мастер по компьютерам варшава", "медленно работает компьютер", "диагностика ноутбука", "чистка ноутбука варшава"],
      "IT-GENERAL": ["it сервис варшава", "компьютерный мастер варшава", "ит специалист с выездом", "компьютерная помощь варшава", "обслуживание компьютеров варшава", "системный администратор варшава"],
    },
    ads: {
      "WIFI-REPAIR": { headlines: ["Ремонт Wi-Fi В Варшаве", "Настройка Роутера", "Усилим Покрытие Wi-Fi", "Установка Систем Mesh", "Мастер С Выездом", "Диагностика Сети Wi-Fi", "Для Дома И Офиса", "Запишитесь По Телефону"], descriptions: ["Диагностика Wi-Fi, роутера и покрытия. Выезд и время согласуем заранее.", "Настроим роутер или Mesh дома и в офисе. Условия подтвердим до визита.", "Wi-Fi пропадает или плохо ловит? Проверим сеть и предложим решение.", "Помощь на русском, украинском, польском и английском языках."] },
      "LAN-INSTALL": { headlines: ["Монтаж Сети LAN Варшава", "Монтаж Кабельной Сети", "Установка Розеток RJ45", "Монтаж Шкафа RACK", "Сеть LAN Для Офиса", "Расчёт После Консультации", "Мастер С Выездом", "Закажите Осмотр Объекта"], descriptions: ["Монтаж сетей LAN, розеток RJ45 и шкафов RACK в Варшаве.", "Предварительная консультация по телефону. Выезд согласуем заранее.", "Сети для квартир, офисов и помещений. Объём и материалы подтвердим до работ.", "Позвоните или отправьте описание объекта — предложим следующий шаг."] },
      "LAN-CCTV-REPAIR": { headlines: ["Ремонт Сети LAN", "Ремонт Кабельной Сети", "Диагностика Сети Офиса", "Ремонт Розеток RJ45", "Сервис Видеонаблюдения", "Выезд По Варшаве", "Условия До Визита", "Сообщите Об Аварии"], descriptions: ["Находим неисправности LAN, кабелей и розеток RJ45. Согласуем объём работ.", "Помогаем при сбоях сети и видеонаблюдения дома, в офисе или помещении.", "Выезд и время согласуем заранее. Результат определим после диагностики.", "Опишите проблему в форме или позвоните — согласуем следующий шаг."] },
      "PC-LAPTOP-REPAIR": { headlines: ["Ремонт Компьютеров Варшава", "Сервис Ноутбуков", "Компьютер Медленно Работает?", "Диагностика Компьютера", "Мастер С Выездом", "Для Дома И Офиса", "Условия До Ремонта", "Запишитесь По Телефону"], descriptions: ["Диагностика компьютеров и ноутбуков. Объём и цену подтвердим до ремонта.", "Компьютер работает медленно или сломался? Закажите диагностику в Варшаве.", "Выезд и время согласуем заранее. Запчасти и допработы — только после согласия.", "Позвоните или опишите проблему в форме — согласуем следующий шаг."] },
      "IT-GENERAL": { headlines: ["IT Сервис В Варшаве", "IT Мастер С Выездом", "Помощь Для Дома И Офиса", "Сети Wi-Fi И Компьютеры", "Поддержка На 4 Языках", "Время По Согласованию", "Понятные Условия Работы", "Свяжитесь С Сервисом"], descriptions: ["IT-помощь с выездом в Варшаве: сети, Wi-Fi и настройка оборудования.", "Обслуживание на русском, украинском, польском и английском языках.", "Сначала уточним задачу, затем подтвердим объём и условия визита.", "Позвоните, напишите в мессенджер или отправьте контактную форму."] },
    },
  },
  UK: {
    googleLanguage: "Ukrainian",
    coreDailyBudget: 10,
    desiredCoreStatus: "Enabled",
    defaultMaxCpc: 3,
    prefix: "/uk",
    keywords: {
      "WIFI-REPAIR": ["ремонт wifi", "ремонт wifi варшава", "налаштування роутера", "налаштування роутера варшава", "встановлення mesh", "слабкий сигнал wifi", "не працює wifi"],
      "LAN-INSTALL": ["монтаж мережі lan", "монтаж мережі lan варшава", "структурована кабельна система", "монтаж розетки rj45", "обтиск кабелю rj45", "монтаж комп'ютерної мережі", "монтаж шафи rack"],
      "LAN-CCTV-REPAIR": ["ремонт мережі lan", "ремонт мережі lan варшава", "обслуговування комп'ютерних мереж", "діагностика мережі lan", "ремонт кабельної мережі", "ремонт відеоспостереження", "ремонт розетки rj45"],
      "PC-LAPTOP-REPAIR": ["ремонт ноутбуків варшава", "ремонт комп'ютерів варшава", "комп'ютерний сервіс варшава", "майстер з ремонту комп'ютерів", "повільно працює комп'ютер", "діагностика ноутбука", "чищення ноутбука варшава"],
      "IT-GENERAL": ["it сервіс варшава", "комп'ютерний майстер варшава", "it спеціаліст з виїздом", "комп'ютерна допомога варшава", "обслуговування комп'ютерів варшава", "системний адміністратор варшава"],
    },
    ads: {
      "WIFI-REPAIR": { headlines: ["Ремонт Wi-Fi У Варшаві", "Налаштування Роутера", "Покращимо Покриття Wi-Fi", "Встановлення Систем Mesh", "Майстер З Виїздом", "Діагностика Мережі Wi-Fi", "Для Дому Та Офісу", "Запишіться Телефоном"], descriptions: ["Діагностика Wi-Fi, роутера й покриття. Виїзд і час погодимо заздалегідь.", "Налаштуємо роутер або Mesh удома чи в офісі. Умови підтвердимо до візиту.", "Wi-Fi зникає або погано працює? Перевіримо мережу та запропонуємо рішення.", "Допомога українською, польською, російською та англійською мовами."] },
      "LAN-INSTALL": { headlines: ["Монтаж Мережі LAN Варшава", "Монтаж Кабельної Мережі", "Встановлення Розеток RJ45", "Монтаж Шафи RACK", "Мережа LAN Для Офісу", "Оцінка Після Консультації", "Майстер З Виїздом", "Замовте Огляд Об'єкта"], descriptions: ["Монтаж мереж LAN, розеток RJ45 і шаф RACK у Варшаві.", "Попередня консультація телефоном. Вартість виїзду погодимо заздалегідь.", "Мережі для квартир, офісів і приміщень. Обсяг і матеріали погодимо до робіт.", "Зателефонуйте або надішліть опис об'єкта — запропонуємо наступний крок."] },
      "LAN-CCTV-REPAIR": { headlines: ["Ремонт Мережі LAN", "Ремонт Кабельної Мережі", "Діагностика Мережі Офісу", "Ремонт Розеток RJ45", "Сервіс Відеоспостереження", "Виїзд По Варшаві", "Умови До Візиту", "Повідомте Про Аварію"], descriptions: ["Знаходимо несправності LAN, кабелів і розеток RJ45. Погоджуємо обсяг робіт.", "Допомагаємо зі збоями мережі та відеоспостереження вдома чи в офісі.", "Виїзд і час погодимо заздалегідь. Результат визначимо після діагностики.", "Опишіть проблему у формі або зателефонуйте — погодимо наступний крок."] },
      "PC-LAPTOP-REPAIR": { headlines: ["Ремонт Комп'ютерів Варшава", "Сервіс Ноутбуків", "Комп'ютер Працює Повільно?", "Діагностика Комп'ютера", "Майстер З Виїздом", "Для Дому Та Офісу", "Умови До Ремонту", "Запишіться Телефоном"], descriptions: ["Діагностика комп'ютерів і ноутбуків. Обсяг та ціну підтвердимо до ремонту.", "Комп'ютер працює повільно або зламався? Замовте діагностику у Варшаві.", "Виїзд і час погодимо. Запчастини й додаткові роботи — тільки після згоди.", "Зателефонуйте або опишіть проблему у формі — погодимо наступний крок."] },
      "IT-GENERAL": { headlines: ["IT Сервіс У Варшаві", "IT Майстер З Виїздом", "Допомога Для Дому Й Офісу", "Мережі Wi-Fi Та Комп'ютери", "Підтримка 4 Мовами", "Час За Домовленістю", "Зрозумілі Умови Роботи", "Зв'яжіться Із Сервісом"], descriptions: ["IT-допомога з виїздом у Варшаві: мережі, Wi-Fi й налаштування обладнання.", "Обслуговування українською, польською, російською та англійською.", "Спочатку уточнимо задачу, потім підтвердимо обсяг та умови візиту.", "Зателефонуйте, напишіть у месенджер або надішліть контактну форму."] },
    },
  },
  EN: {
    googleLanguage: "English",
    coreDailyBudget: 10,
    desiredCoreStatus: "Enabled",
    defaultMaxCpc: 3,
    prefix: "/en",
    keywords: {
      "WIFI-REPAIR": ["wifi repair", "wifi repair warsaw", "router setup", "router setup warsaw", "mesh wifi installation", "weak wifi signal", "wifi not working"],
      "LAN-INSTALL": ["lan installation", "lan installation warsaw", "structured cabling warsaw", "rj45 socket installation", "rj45 cable termination", "computer network installation", "rack cabinet installation"],
      "LAN-CCTV-REPAIR": ["lan repair", "lan repair warsaw", "computer network service", "lan diagnostics", "network cabling repair", "cctv repair warsaw", "rj45 socket repair"],
      "PC-LAPTOP-REPAIR": ["laptop repair warsaw", "computer repair warsaw", "computer service warsaw", "computer technician warsaw", "slow computer repair", "laptop diagnostics", "laptop cleaning warsaw"],
      "IT-GENERAL": ["it service warsaw", "it support warsaw", "home it support warsaw", "on site it support warsaw", "computer help warsaw", "network technician warsaw"],
    },
    ads: {
      "WIFI-REPAIR": { headlines: ["Wi-Fi Repair In Warsaw", "Router Setup Service", "Improve Your Wi-Fi Coverage", "Mesh Wi-Fi Installation", "On-Site Technician", "Wi-Fi Network Diagnostics", "For Homes And Offices", "Book By Phone Or Form"], descriptions: ["We diagnose Wi-Fi, router and coverage issues. Visit and timing agreed in advance.", "Router and Mesh setup for homes or offices. Clear terms before the visit.", "Weak or unstable Wi-Fi? We will inspect the network and propose a solution.", "Support in English, Polish, Ukrainian and Russian. Call or send the form."] },
      "LAN-INSTALL": { headlines: ["LAN Installation Warsaw", "Structured Network Cabling", "RJ45 Socket Installation", "RACK Cabinet Installation", "Office LAN Installation", "Quote After Consultation", "On-Site Technician", "Book A Site Inspection"], descriptions: ["LAN networks, RJ45 sockets and RACK cabinets installed across Warsaw.", "Initial phone consultation. Any call-out fee is agreed before arrival.", "Networks for homes, offices and premises. Scope and materials agreed first.", "Call or send a short site description and we will propose the next step."] },
      "LAN-CCTV-REPAIR": { headlines: ["LAN Network Repair", "Network Cabling Service", "Office Network Diagnostics", "RJ45 Socket Repair", "CCTV System Service", "On-Site Across Warsaw", "Clear Terms Before Visit", "Report A Network Fault"], descriptions: ["We locate LAN, cabling and RJ45 faults. The work scope is agreed first.", "Help with network and CCTV faults at homes, offices and commercial premises.", "Visit and timing agreed in advance. Results depend on on-site diagnostics.", "Describe the fault in the form or call us to agree the next step."] },
      "PC-LAPTOP-REPAIR": { headlines: ["Computer Repair Warsaw", "Laptop Repair Service", "Is Your Computer Slow?", "Computer Diagnostics", "On-Site Technician", "For Homes And Offices", "Terms Agreed Before Repair", "Book By Phone Or Form"], descriptions: ["Computer and laptop diagnostics. Scope and price are confirmed before repair.", "Slow computer or hardware fault? Arrange diagnostics and a Warsaw visit.", "Visit and timing agreed first. Parts and extra work require your approval.", "Call or describe the problem in the form and we will agree the next step."] },
      "IT-GENERAL": { headlines: ["IT Service In Warsaw", "On-Site IT Technician", "IT Help For Home And Office", "Networks Wi-Fi And Computers", "Support In 4 Languages", "Appointment By Agreement", "Clear Service Terms", "Contact Our IT Service"], descriptions: ["On-site IT help in Warsaw for networks, Wi-Fi and equipment setup.", "Support in English, Polish, Ukrainian and Russian. Timing agreed in advance.", "We first clarify the issue, then confirm the scope and visit terms.", "Call, message us or send the contact form to arrange the next step."] },
    },
  },
};

const urls = {
  "WIFI-REPAIR": "/naprawa-wifi/",
  "LAN-INSTALL": "/montaz-sieci/",
  "LAN-CCTV-REPAIR": "/naprawa-sieci/",
  "PC-LAPTOP-REPAIR": "/",
  "IT-GENERAL": "/",
};

const csv = (rows) => rows.map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n") + "\r\n";
const campaignName = (lang, zone) => `SRCH-${lang}-${zone.campaignPart}`;

const finalUrlSuffix = "utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_adgroup={adgroupid}&utm_content={creative}&utm_term={keyword}&lang={_lang}&zone={_zone}";
const campaigns = [["Campaign", "Status", "Campaign type", "Networks", "Language", "Daily budget PLN", "Bid strategy", "Default max CPC PLN", "Geo zone", "Custom parameter {_lang}", "Custom parameter {_zone}", "Final URL suffix", "Launch", "Desired status after QA"]];
const geos = [["Campaign", "Location", "Google criterion ID", "Target type", "Presence setting", "Initial bid adjustment", "Action required"]];
const keywords = [["Campaign", "Ad group", "Keyword", "Match type", "Status", "Final URL", "Language", "Zone"]];
const ads = [["Campaign", "Ad group", "Status", "Final URL", "Path 1", "Path 2", ...Array.from({length: 8}, (_, i) => `Headline ${i + 1}`), ...Array.from({length: 4}, (_, i) => `Description ${i + 1}`)]];

for (const [langCode, lang] of Object.entries(languages)) {
  for (const zone of Object.values(zones)) {
    const campaign = campaignName(langCode, zone);
    const funded = zone.label === "core";
    campaigns.push([campaign, "Paused", "Search", "Google Search only; partners off; display off", lang.googleLanguage, funded ? lang.coreDailyBudget : "NOT FUNDED", "Manual CPC initially; evaluate Smart Bidding after qualified conversion data", lang.defaultMaxCpc, zone.label, langCode.toLowerCase(), zone.label, finalUrlSuffix, funded ? "Eligible after QA" : "Keep paused", funded ? lang.desiredCoreStatus : "Paused"]);
    for (const [location, id, type, adjustment] of zone.locations) {
      geos.push([campaign, location, id, type, "People in or regularly in this location", adjustment, id ? "" : "Resolve as 3 km radius or confirmed postal codes in Google Ads"]);
    }
    for (const [adGroup, words] of Object.entries(lang.keywords)) {
      const finalUrl = `https://naserwis.pl${lang.prefix}${urls[adGroup]}`.replace(/(?<!:)\/\//g, "/");
      for (const word of words) {
        keywords.push([campaign, adGroup, word, "Phrase", "Paused", finalUrl, langCode, zone.label]);
        keywords.push([campaign, adGroup, word, "Exact", "Paused", finalUrl, langCode, zone.label]);
      }
      const asset = lang.ads[adGroup];
      const [path1, path2] = ({"WIFI-REPAIR":["wifi","serwis"],"LAN-INSTALL":["lan","montaz"],"LAN-CCTV-REPAIR":["lan","naprawa"],"PC-LAPTOP-REPAIR":["komputer","serwis"],"IT-GENERAL":["it","warszawa"]})[adGroup];
      ads.push([campaign, adGroup, "Paused", finalUrl, path1, path2, ...asset.headlines, ...asset.descriptions]);
    }
  }
}

const negativeByLanguage = {
  PL: ["praca", "oferty pracy", "kurs", "szkolenie", "wynagrodzenie", "za darmo", "darmowy", "poradnik", "jak zrobić", "sterownik", "download", "części", "naprawa telefonu", "naprawa ekranu", "wymiana baterii"],
  RU: ["работа", "вакансии", "курс", "обучение", "зарплата", "бесплатно", "своими руками", "инструкция", "скачать", "драйвер", "запчасти", "ремонт телефона", "ремонт экрана", "замена батареи"],
  UK: ["робота", "вакансії", "курс", "навчання", "зарплата", "безкоштовно", "своїми руками", "інструкція", "завантажити", "драйвер", "запчастини", "ремонт телефону", "ремонт екрана", "заміна батареї"],
  EN: ["jobs", "vacancy", "course", "training", "salary", "free", "diy", "tutorial", "download", "driver", "parts", "phone repair", "screen repair", "battery replacement"],
};
const negatives = [["Negative list", "Language", "Keyword", "Match type", "Review note"]];
for (const [lang, words] of Object.entries(negativeByLanguage)) for (const word of words) negatives.push([`NEG-${lang}-SERVICE`, lang, word, "Phrase", "Remove before import if this service is actually offered"]);

const lengths = [];
for (const [langCode, lang] of Object.entries(languages)) for (const [adGroup, asset] of Object.entries(lang.ads)) {
  asset.headlines.forEach((value, index) => { if ([...value].length > 30) lengths.push(`${langCode}/${adGroup} headline ${index + 1}: ${[...value].length}`); });
  asset.descriptions.forEach((value, index) => { if ([...value].length > 90) lengths.push(`${langCode}/${adGroup} description ${index + 1}: ${[...value].length}`); });
}
if (lengths.length) throw new Error(`Google Ads asset limits exceeded:\n${lengths.join("\n")}`);

const keywordOwners = new Map();
const duplicateKeywords = [];
for (const row of keywords.slice(1)) {
  const [campaign, adGroup, keyword, matchType] = row;
  const key = `${campaign}\u0000${keyword.toLocaleLowerCase()}\u0000${matchType}`;
  if (keywordOwners.has(key) && keywordOwners.get(key) !== adGroup) duplicateKeywords.push(`${campaign}: ${keyword} (${keywordOwners.get(key)} / ${adGroup})`);
  keywordOwners.set(key, adGroup);
}
if (duplicateKeywords.length) throw new Error(`Cross-ad-group keyword duplicates:\n${duplicateKeywords.join("\n")}`);

await mkdir(out, { recursive: true });
await writeFile(path.join(out, "campaigns.csv"), csv(campaigns), "utf8");
await writeFile(path.join(out, "launch-campaigns.csv"), csv([campaigns[0], ...campaigns.slice(1).filter((row) => row[8] === "core")]), "utf8");
await writeFile(path.join(out, "geo-targets.csv"), csv(geos), "utf8");
await writeFile(path.join(out, "keywords.csv"), csv(keywords), "utf8");
await writeFile(path.join(out, "responsive-search-ads.csv"), csv(ads), "utf8");
await writeFile(path.join(out, "negative-keywords.csv"), csv(negatives), "utf8");

const fundedDailyBudget = campaigns.slice(1).reduce((total, row) => total + (Number(row[5]) || 0), 0);
const activeDailyBudget = campaigns.slice(1).filter((row) => row[13] === "Enabled").reduce((total, row) => total + (Number(row[5]) || 0), 0);
if (fundedDailyBudget !== 60) throw new Error(`Configured core budgets must equal 60 PLN; got ${fundedDailyBudget}.`);
if (activeDailyBudget !== 30) throw new Error(`Desired active daily budget must equal 30 PLN; got ${activeDailyBudget}.`);
console.log(`Generated ${campaigns.length - 1} campaigns, ${keywords.length - 1} keyword rows, ${ads.length - 1} RSAs and ${geos.length - 1} geo targets. Configured core budgets: ${fundedDailyBudget} PLN/day; desired active budget: ${activeDailyBudget} PLN/day.`);
