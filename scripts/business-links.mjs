// ITBIZ uses translated service slugs; do not derive them from the Polish URL.
export const businessLinks = {
  pl: { label: 'Dla firm i biur', url: 'https://itbiz.pl/uslugi/' },
  ru: { label: 'Для компаний и офисов', url: 'https://itbiz.pl/ru/uslugi/' },
  uk: { label: 'Для компаній та офісів', url: 'https://itbiz.pl/uk/poslugy/' },
  en: { label: 'For companies and offices', url: 'https://itbiz.pl/en/services/' }
};

// Titles and URLs come from ITBIZ's live, localized services index.
export const businessServices = {
  pl: [
    ['Awaria sieci i internetu', 'awaria-sieci-w-firmie'],
    ['Naprawa gniazda LAN', 'naprawa-gniazda-lan-w-biurze'],
    ['Okablowanie LAN', 'sieci-lan-dla-firm'],
    ['Planowa diagnostyka sieci', 'diagnostyka-i-naprawa-sieci-firmowej'],
    ['Stała obsługa IT', 'obsluga-it-dla-firm']
  ],
  ru: [
    ['Авария сети и интернета', 'avariya-seti-v-kompanii'],
    ['Ремонт розетки LAN', 'remont-lan-rozetki-v-ofise'],
    ['Прокладка сети LAN', 'lan-seti-dlya-kompaniy'],
    ['Плановая диагностика сети', 'diagnostika-korporativnoy-seti'],
    ['Постоянное IT-обслуживание', 'it-obsluzhivanie-dlya-kompaniy']
  ],
  uk: [
    ['Аварія мережі та інтернету', 'avariya-merezhi-v-kompaniyi'],
    ['Ремонт розетки LAN', 'remont-lan-rozetky-v-ofisi'],
    ['Прокладання мережі LAN', 'lan-merezhi-dlya-biznesu'],
    ['Планова діагностика мережі', 'diagnostyka-korporatyvnoyi-merezhi'],
    ['Постійне IT-обслуговування', 'it-obslugovuvannya-dlya-biznesu']
  ],
  en: [
    ['Network and internet outage', 'business-network-emergency'],
    ['LAN outlet repair', 'office-lan-outlet-repair'],
    ['LAN cabling', 'business-lan-networks'],
    ['Planned network diagnostics', 'business-network-diagnostics'],
    ['Ongoing IT support', 'managed-it-for-business']
  ]
};
