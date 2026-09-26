// Display published monetary amounts as starting prices in their page locale.
// Numeric microdata stays numeric; quoted/individual prices stay unchanged.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const prefixes = { pl: 'od', ru: 'от', uk: 'від', en: 'from' };
const copy = {
  pl: { fiber: 'Naprawa kabla światłowodowego', heading: 'Ceny orientacyjne', note: 'Ceny orientacyjne, nie stanowią oferty. Ostateczna cena zależy od warunków i jest uzgadniana przed rozpoczęciem prac.' },
  ru: { fiber: 'Ремонт оптоволоконного кабеля', heading: 'Ориентировочные цены', note: 'Цены ориентировочные и не являются офертой. Итоговая стоимость зависит от условий и согласуется до начала работ.' },
  uk: { fiber: 'Ремонт оптоволоконного кабелю', heading: 'Орієнтовні ціни', note: 'Ціни орієнтовні та не є офертою. Остаточна вартість залежить від умов і погоджується до початку робіт.' },
  en: { fiber: 'Fibre optic cable repair', heading: 'Indicative prices', note: 'Prices are indicative and do not constitute an offer. The final price depends on the conditions and is agreed before work starts.' },
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
  const locale = original.match(/<html[^>]*lang="([^"]+)"/)?.[1]?.split('-')[0];
  const prefix = prefixes[locale];
  if (!prefix) continue;
  const text = copy[locale];
  const note = `<p class="price-disclaimer" style="margin:16px 0;font-size:0.9rem;line-height:1.5;color:#595959;">${text.note}</p>`;
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
  html = html.replace(/(<div class="price-row"[^>]*><div class="price-service"[^>]*>(?:Wyjazd serwisowy|Выезд специалиста|Виїзд спеціаліста|On-site visit)[^<]*<\/div><div class="price-value"[^>]*>[^<]*?)150/g, '$1250');
  html = html.replace(/(<div class="price-item"><span>(?:Wyjazd serwisowy|Выезд сервисного|Виїзд сервісного|On-site visit)[^<]*<\/span><strong>[^<]*?)150/g, '$1250');
  const isRepair = /[\\/]naprawa-sieci[\\/]index\.html$/.test(file);
  if (isRepair) {
    html = html.replace(/(class="segment-price">[^<]*?)150/g, '$1250');
    html = html.replace(/("name": "(?:Wyjazd serwisowy|Выезд сервисного|Виїзд сервісного|On-site visit)[^"]*"\s*\},\s*"priceSpecification": \{\s*"@type": "PriceSpecification",\s*"price": ")150"/g, '$1250"');
    if (!html.includes(`<span>${text.fiber}</span>`)) {
      html = html.replace(/(<div class="price-item"><span>[\s\S]*?<\/span><strong>[^<]*250[^<]*<\/strong><\/div>)/,
        `$1\n                <div class="price-item"><span>${text.fiber}</span><strong>${prefix} 280 ${locale === 'en' ? 'PLN' : 'zł'}</strong></div>`);
    }
  }
  html = html.replace(/(class="segment-price">[^<]*?)150(?= (?:zł|PLN) \/ (?:wizyta|выезд|виїзд|visit))/g, '$1250');
  html = html.replace(/<p class="price-header">[^<]*<\/p>/g, `<p class="price-header">${text.heading}</p>`);
  html = html.replace(/(<p class="services-intro">)([^<]*?)(<\/p>)/g,
    (_match, open, intro, close) => `${open}${intro.split('. ')[0].replace(/\.+$/, '')}.${close}`);
  // Remove only the note itself before inserting it at stable section anchors.
  html = html.replace(/^[ \t]*<p class="price-disclaimer"[^>]*>[^<]*<\/p>\r?\n/gm, '');
  if (html.includes('class="price-table"')) {
    if (!html.includes(`<div class="price-service" role="cell">${text.fiber}</div>`)) {
      html = html.replace(/( *<div class="price-row"[^>]*><div class="price-service"[^>]*>[^<]*RJ45[^\n]*\n)/,
        `$1                    <div class="price-row" role="row"><div class="price-service" role="cell">${text.fiber}</div><div class="price-value" role="cell">${prefix} 280 zł</div></div>\n`);
    }
    html = html.replace(/( *)(<div class="full-price-link">)/, `$1${note}\n$1$2`);
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
