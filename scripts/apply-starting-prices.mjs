// Display published monetary amounts as starting prices in their page locale.
// Numeric microdata stays numeric; quoted/individual prices stay unchanged.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { copy as homeCopy } from './home-service-copy.mjs';

const prefixes = { pl: 'od', ru: 'от', uk: 'від', en: 'from' };
const copy = {
  pl: { fiber: 'Naprawa kabla światłowodowego', heading: 'Ceny orientacyjne', visit: 'Dojazd na terenie Warszawy + pierwsza godzina pracy', nextHour: 'Każda kolejna godzina pracy', smallVisit: 'Wyjazd serwisowy (krótkie zlecenie w pobliżu)', smallCondition: 'Stawka od 200 zł dotyczy krótkiego zlecenia z bliskim dojazdem, po skutecznym wykonaniu zadania.', note: 'Ceny „od” nie stanowią oferty; zależą od warunków realizacji. Kwotę potwierdzamy przed pracą. VAT nie doliczamy.' },
  ru: { fiber: 'Ремонт оптоволоконного кабеля', heading: 'Ориентировочные цены', visit: 'Выезд по Варшаве + первый час работы', nextHour: 'Каждый следующий час работы', smallVisit: 'Выезд специалиста (короткая задача поблизости)', smallCondition: 'Цена от 200 zł действует для короткой задачи с близким выездом при её успешном выполнении.', note: 'Цены «от» не являются офертой; зависят от условий работы. Сумму согласуем до начала. VAT не начисляем.' },
  uk: { fiber: 'Ремонт оптоволоконного кабелю', heading: 'Орієнтовні ціни', visit: 'Виїзд у межах Варшави + перша година роботи', nextHour: 'Кожна наступна година роботи', smallVisit: 'Виїзд спеціаліста (коротке завдання поблизу)', smallCondition: 'Ціна від 200 zł діє для короткого завдання з близьким виїздом за умови його успішного виконання.', note: 'Ціни «від» не є офертою; залежать від умов роботи. Суму погоджуємо до початку. VAT не нараховуємо.' },
  en: { fiber: 'Fibre optic cable repair', heading: 'Indicative prices', visit: 'Travel within Warsaw + first hour of work', nextHour: 'Each additional hour of work', smallVisit: 'Service visit (short job nearby)', smallCondition: 'The 200 PLN starting rate applies to a short job nearby when the task is successfully completed.', note: 'Starting prices are not an offer; they depend on job conditions. We confirm the amount before work starts. No VAT is charged.' },
};
async function pages(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await pages(path));
    else if (entry.name === 'index.html') files.push(path);
  }
  return files;
}

let changed = 0;
for (const file of await pages('public')) {
  const original = await readFile(file, 'utf8');
  // These commercial pages have a single scope/billing source. Do not restore
  // old per-service fees or strip the explanation of alternative billing.
  if (original.includes('/home-services.css?')) continue;
  const locale = original.match(/<html[^>]*lang="([^"]+)"/)?.[1]?.split('-')[0];
  const prefix = prefixes[locale];
  if (!prefix) continue;
  const text = copy[locale];
  const note = `<p class="price-disclaimer" style="margin:16px 0;font-size:0.9rem;line-height:1.5;color:#595959;">${text.note}</p>`;
  const tableNote = `<p class="price-disclaimer" style="margin:16px 0;font-size:0.9rem;line-height:1.5;color:#595959;">${homeCopy[locale].shortNote} ${text.note}</p>`;
  let html = original.replace(
    /(<(?:div|strong)[^>]*class="(?:price-value|package-price|segment-price)"[^>]*>)(\s*)(\d)/g,
    (_match, tag, space, digit) => `${tag}${space}${prefix} ${digit}`,
  );
  html = html.replace(
    /(<div class="price-item"><span>[\s\S]*?<\/span><strong>)(\s*)(\d)/g,
    (_match, tag, space, digit) => `${tag}${space}${prefix} ${digit}`,
  );
  // Preserve both ends of existing project estimates; express the range as
  // "from X to Y", consistently in visible FAQ and its JSON-LD answer.
  const range = locale === 'en' ? 'from 3,000 to 6,000 PLN' :
    `${prefix} 3000 ${locale === 'pl' ? 'do' : 'до'} 6000 zł`;
  html = html.replace(/(?:3,000–6,000 PLN|3000–6000 zł)/g, range);
  // A visit includes the first hour. Update only visit amounts, not the
  // separate installation, configuration or diagnostics line items.
  html = html.replace(/(<div class="price-row"[^>]*><div class="price-service"[^>]*>(?:Wyjazd serwisowy|Выезд специалиста|Виїзд спеціаліста|On-site visit)[^<]*<\/div><div class="price-value"[^>]*>[^<]*?)150/g, '$1200');
  html = html.replace(/(<div class="price-item"><span>(?:Wyjazd serwisowy|Выезд сервисного|Виїзд сервісного|On-site visit)[^<]*<\/span><strong>[^<]*?)150/g, '$1200');
  // Keep the on-site minimum and the additional hourly rate visible together.
  const currency = locale === 'en' ? 'PLN' : 'zł';
  const homeVisit = `<div class="price-row" role="row"><div class="price-service" role="cell">${text.visit}</div><div class="price-value" role="cell">${prefix} 200 ${currency}</div></div>`;
  const homeNext = `<div class="price-row" role="row"><div class="price-service" role="cell">${text.nextHour}</div><div class="price-value" role="cell">${prefix} 150 ${currency}</div></div>`;
  html = html.replace(/<div class="price-row" role="row"><div class="price-service" role="cell">(?:Wyjazd serwisowy \(pierwsza godzina\)|Выезд специалиста \(первый час\)|Виїзд спеціаліста \(перша година\)|On-site visit \(first hour\)|Dojazd na terenie Warszawy \+ pierwsza godzina pracy|Выезд по Варшаве \+ первый час работы|Виїзд Варшавою \+ перша година роботи|Виїзд у межах Варшави \+ перша година роботи|Travel within Warsaw \+ first hour of work)<\/div><div class="price-value" role="cell">[^<]*<\/div><\/div>/, homeVisit);
  if (html.includes('class="price-table"') && !html.includes(homeNext)) {
    html = html.replace(homeVisit, `${homeVisit}\n                    ${homeNext}`);
  }
  const sidebarVisit = `<div class="price-item"><span>${text.visit}</span><strong>${prefix} 200 ${currency}</strong></div>`;
  const sidebarNext = `<div class="price-item"><span>${text.nextHour}</span><strong>${prefix} 150 ${currency}</strong></div>`;
  html = html.replace(/<div class="price-item"><span>(?:Wyjazd serwisowy|Выезд сервисного|Виїзд сервісного|Виїзд Варшавою|On-site visit)[^<]*<\/span><strong>[^<]*<\/strong><\/div>/, sidebarVisit);
  if (html.includes('class="service-sidebar"') && !html.includes(sidebarVisit)) {
    html = html.replace(/(<p class="price-header">[^<]*<\/p>)/, `$1\n                ${sidebarVisit}`);
  }
  if (html.includes(sidebarVisit) && !html.includes(sidebarNext)) {
    html = html.replace(sidebarVisit, `${sidebarVisit}\n                ${sidebarNext}`);
  }
  const isRepair = /[\\/]naprawa-sieci[\\/]index\.html$/.test(file);
  if (isRepair) {
    html = html.replace(/(class="segment-price">[^<]*?)150/g, '$1200');
    html = html.replace(/("name": "(?:Wyjazd serwisowy|Выезд сервисного|Виїзд сервісного|On-site visit)[^"]*"\s*\},\s*"priceSpecification": \{\s*"@type": "PriceSpecification",\s*"price": ")150"/g, '$1200"');
    if (!html.includes(`<span>${text.fiber}</span>`)) {
      html = html.replace(/(<div class="price-item"><span>[\s\S]*?<\/span><strong>[^<]*200[^<]*<\/strong><\/div>)/,
        `$1\n                <div class="price-item"><span>${text.fiber}</span><strong>${prefix} 280 ${locale === 'en' ? 'PLN' : 'zł'}</strong></div>`);
    }
  }
  if (/[\\/]naprawa-wifi[\\/]index\.html$/.test(file)) {
    // These diagnosis cards and FAQ describe an on-site visit, so their
    // starting amount must agree with the first-hour visit minimum.
    html = html.replace(/(<div class="segment-price">(?:od|от|від|from) )150(?= (?:zł|PLN)(?:<| \|))/g, '$1200');
    html = html.replace(/(<div class="price-item"><span>(?:Diagnoza problemów z siecią|Диагностика проблем с сетью|Діагностика проблем з мережею|Network problem diagnosis)<\/span><strong>(?:od|от|від|from) )150/g, '$1200');
    html = html.replace(/("name": "(?:Diagnoza problemów z siecią|Диагностика проблем с сетью|Діагностика проблем з мережею|Network problem diagnosis)"\s*\},\s*"priceSpecification": \{\s*"@type": "PriceSpecification",\s*"price": ")150("[\s\S]*?"minPrice": ")150/g, '$1200$2200');
    html = html.replace(/(Diagnoza problemów z WiFi zaczyna się od |Диагностика проблем с WiFi начинается от |Діагностика проблем з WiFi починається від |WiFi diagnostics starts from )150/g, '$1200');
  }
  html = html.replace(/(class="segment-price">[^<]*?)150(?= (?:zł|PLN) \/ (?:wizyta|выезд|виїзд|visit))/g, '$1200');
  // Keep displayed monthly prices and their Offer microdata in sync.
  for (const [plan, amount] of [['Basic', 600], ['Standard', 1200]]) {
    const packagePrice = new RegExp(`(<h3 class="package-name" itemprop="name">${plan}<\\/h3>\\s*<div class="package-price" itemprop="price" content=")\\d+(">(?:od|от|від|from) )\\d+`);
    html = html.replace(packagePrice, (_match, before, after) => `${before}${amount}${after}${amount}`);
  }
  if (locale === 'ru') {
    html = html.replace(/(<h3 class="package-name" itemprop="name">Pro<\/h3>\s*<div class="package-price">)От 1000 zł\/мес/, '$1Индивидуально');
  }
  html = html.replace(/<p class="price-header">[^<]*<\/p>/g, `<p class="price-header">${text.heading}</p>`);
  html = html.replace(/(<p class="services-intro">)([^<]*?)(<\/p>)/g,
    (_match, open, intro, close) => `${open}${intro.split('. ')[0].replace(/\.+$/, '')}.${close}`);
  // Remove only the note itself before inserting it at stable section anchors.
  html = html.replace(/^[ \t]*<p class="price-disclaimer"[^>]*>[^<]*<\/p>\r?\n/gm, '');
  if (html.includes('class="price-table"')) {
    const smallVisitRow = `<div class="price-row" role="row"><div class="price-service" role="cell">${text.smallVisit}</div><div class="price-value" role="cell">${prefix} 200 ${currency}</div></div>`;
    if (!html.includes(smallVisitRow)) {
      html = html.replace(/(<div class="price-value" role="columnheader"><\/div>\s*<\/div>\r?\n)/,
        `$1                    ${smallVisitRow}\n`);
    }
    // Keep the homepage price list focused on the three visit rates. Detailed
    // unit prices remain on the relevant service pages.
    const tableStart = html.indexOf('<div class="price-table"');
    const tableEnd = html.indexOf('<div class="full-price-link">', tableStart);
    const tableBlock = html.slice(tableStart, tableEnd);
    const visitRows = [homeVisit, homeNext, smallVisitRow];
    const focusedTable = tableBlock.replace(/^[ \t]*<div class="price-row" role="row">[^\r\n]*\r?\n/gm,
      row => visitRows.some(visitRow => row.includes(visitRow)) ? row : '');
    html = html.slice(0, tableStart) + focusedTable + html.slice(tableEnd);
    html = html.replace(/( *)(<div class="full-price-link">)/, `$1${tableNote}\n$1$2`);
    html = html.replace(/(<section class="packages"[\s\S]*?<\/article>\s*<\/div>\r?\n)( *)(<\/div>\s*<\/section>)/, `$1$2${note}\n$2$3`);
  }
  if (html.includes('class="service-sidebar"')) {
    html = html.replace(/(<div class="price-item"><span>[^<]*<\/span><strong>[^<]*<\/strong><\/div>\r?\n)( *)(<a href="#contact" class="btn btn-primary btn-block">)/, `$1$2${note}\n$2$3`);
  }
  if (html === original) continue;
  await writeFile(file, html);
  changed++;
}
console.log(`Starting-price prefixes synchronized: ${changed} pages updated.`);
