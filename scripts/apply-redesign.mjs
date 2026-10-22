// Reapply the approved design to current content after any site generator.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { assetManifest, expandAssetBundles } from './site-assets.mjs';
import { restoreHomepage, simplifyHomepage } from './homepage-readability.mjs';
import { businessLinks } from './business-links.mjs';
const output = resolve('public');
function block(html, tag, match) {
  const start = html.search(match); if (start < 0) throw Error('Missing block '+match);
  const tokens = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi'); tokens.lastIndex = start;
  let depth = 0, token;
  while ((token = tokens.exec(html))) {
    depth += token[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(start, tokens.lastIndex);
  }
  throw Error('Unclosed '+tag);
}
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({ phone:'<path d="M21 16.5v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.7 19.7 0 0 1 1.1 3.8 2 2 0 0 1 3.1 1.6h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L7 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>', chat:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 10h8M8 14h5"/>', wrench:'<path d="M14.7 6.3a5 5 0 0 0-6.3 6.3L2 19a2.1 2.1 0 0 0 3 3l6.4-6.4a5 5 0 0 0 6.3-6.3l-3 3-3-3 3-3Z"/>', setup:'<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M7 10V3M17 10V3M8 15h.01M12 15h.01M16 15h.01M8 23h8"/>', arrow:'<path d="m9 5 7 7-7 7"/>', wifi:'<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><path d="M12 20h.01"/>', router:'<rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6.01 18H6"/><path d="M10.01 18H10"/><path d="M15 10v4"/><path d="M17.84 7.17a4 4 0 0 0-5.66 0"/><path d="M20.66 4.34a8 8 0 0 0-11.31 0"/>', network:'<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>', port:'<path d="m15 20 3-3h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2l3 3z"/><path d="M6 8v1"/><path d="M10 8v1"/><path d="M14 8v1"/><path d="M18 8v1"/>', test:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>', laptop:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>' })[name]}</svg>`;
// Brand glyphs copied from the existing contact launcher (filled, recognisable marks).
const brandPaths = {
 phone:'M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z',
 whatsapp:'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z',
 telegram:'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z'
};
const brand = name => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${brandPaths[name]}"/></svg>`;
// Catalogue order from apply-home-service-seo: Wi-Fi, router/AP/Mesh, LAN install, RJ45 repair, testing, devices.
const serviceIcons = ['wifi','router','network','port','test','laptop'];
const serviceChoices = ['wifi-coverage','router-setup','lan-install','lan-repair','network-test','device-setup'];
const stripServiceDecor = link => link.replace(/<span class="preview-svc-icon">[\s\S]*?<\/svg><\/span>/,'').replace(/<span(?: class="preview-svc-go")? aria-hidden="true">[\s\S]*?<\/span>/,'');
// Channel row under every enquiry form: phone, WhatsApp and the existing Telegram bot.
function channels(html) {
  return html.replace(/<p class="contact-alternatives">([\s\S]*?)<\/p>/g, (row, body) => {
    const call = body.match(/<a href="tel:[^"]+">([\s\S]*?)<\/a>/)?.[1].replace(/<svg[\s\S]*?<\/svg>/g,'').trim();
    const wa = body.match(/<a href="(https:\/\/wa\.me\/[^"]+)"/)?.[1];
    if (!call || !wa) return row;
    return `<p class="contact-alternatives"><a href="tel:+48453327678">${brand('phone')}${call}</a><a href="${wa}" target="_blank" rel="noopener">${brand('whatsapp')}WhatsApp</a><a href="https://t.me/naserwis_bot" target="_blank" rel="noopener">${brand('telegram')}Telegram</a></p>`;
  });
}
const words = {
 pl: ['Zadzwoń do technika','Opisz problem','Coś nie działa?','Chcę skonfigurować lub zamontować','Szybki kontakt','Orientacyjne ceny','Dojazd + pierwsza godzina','Kolejna godzina','Zadzwoń, ustalimy szczegóły','Router i laptop — ilustracja domowej sieci','Tester przewodu sieciowego podłączony do obu końców kabla; dioda pary 3–6 nie świeci, co wskazuje uszkodzoną parę','Fot.','Płacisz za uzgodniony zakres','Kwotę potwierdzamy przed pracą.'],
 ru: ['Позвонить мастеру','Описать проблему','Что-то не работает?','Нужно настроить или установить','Быстрая связь','Ориентировочные цены','Выезд + первый час','Следующий час','Позвоните — обсудим детали','Роутер и ноутбук — иллюстрация домашней сети','Тестер сетевого кабеля подключён к обоим концам кабеля; индикатор пары 3–6 не горит — повреждённая пара','Фото:','Вы платите за согласованный объём','Сумму подтверждаем до начала работ.'],
 uk: ['Зателефонувати майстру','Описати проблему','Щось не працює?','Потрібно налаштувати або встановити','Швидкий зв’язок','Орієнтовні ціни','Виїзд + перша година','Наступна година','Зателефонуйте — обговоримо деталі','Роутер і ноутбук — ілюстрація домашньої мережі','Тестер мережевого кабелю підключений до обох кінців кабелю; індикатор пари 3–6 не світиться — пошкоджена пара','Фото:','Ви платите за погоджений обсяг','Суму підтверджуємо до початку робіт.'],
 en: ['Call a technician','Describe the problem','Something not working?','Need setup or installation?','Quick contact','Indicative prices','Visit + first hour','Additional hour','Call to discuss the details','Router and laptop — home network illustration','Network cable tester connected to both ends of a cable; the 3–6 pair LED is off, indicating a damaged pair','Photo:','You pay for the agreed scope','We confirm the amount before work starts.']
};
const heroCall = w => `<a href="tel:+48453327678" class="preview-hero-call"><span class="preview-call-icon">${icon('phone')}</span><span><strong>+48 453 327 678</strong><small>${w[0]}</small></span></a>`;
const taskPhotos = {
 pl: ['Podłączanie kabla Ethernet do gniazda RJ45 — ilustracja','Router z czerwoną kontrolką Internetu i telefon z napisem „Brak internetu” — ilustracja','Wyłącz kontrolkę','Włącz kontrolkę','Zasilanie kontrolki'],
 ru: ['Подключение сетевого кабеля к розетке RJ45 — иллюстрация','Роутер с красным индикатором интернета и телефон с надписью «Нет интернета» — иллюстрация','Выключить индикатор','Включить индикатор','Питание индикатора'],
 uk: ['Підключення мережевого кабелю до розетки RJ45 — ілюстрація','Роутер із червоним індикатором інтернету й телефон із написом «Немає інтернету» — ілюстрація','Вимкнути індикатор','Увімкнути індикатор','Живлення індикатора'],
 en: ['Connecting an Ethernet cable to an RJ45 wall socket — illustration','Router with a red Internet indicator and a phone saying “No internet” — illustration','Turn indicator off','Turn indicator on','Indicator power']
};
const taskImage = (name, alt, primary = false) => {
 const path = '/assets/redesign/'+name+'-20261018-';
 const sizes = '(max-width: 760px) calc(100vw - 36px), (max-width: 1100px) 44vw, 30vw';
 return `<picture><source type="image/avif" srcset="${path}640.avif 640w, ${path}800.avif 800w, ${path}1200.avif 1200w" sizes="${sizes}"><img src="${path}1200.webp" srcset="${path}640.webp 640w, ${path}800.webp 800w, ${path}1200.webp 1200w" sizes="${sizes}" width="1200" height="675" decoding="async" ${primary ? 'fetchpriority="high"' : 'loading="lazy"'} alt="${alt}"></picture>`;
};
async function walk(dir) { const list=[]; for (const item of await readdir(dir,{withFileTypes:true})) { const p=join(dir,item.name); if(item.isDirectory()) list.push(...await walk(p)); else if(item.name.endsWith('.html')) list.push(p); } return list; }
export async function applyRedesign() {
let transformed=0;
const manifest = await assetManifest();
const pages = new Map(await Promise.all((await walk(output)).map(async file => [file, restoreHomepage(expandAssetBundles(await readFile(file,'utf8'),manifest), block)])));
for (const [file, currentHtml] of pages) {
  let html = currentHtml;
  const path = relative(output,file);
  const lang = html.match(/<html[^>]*lang="([^"]+)"/)?.[1] || 'pl';
  const w = words[lang] || words.pl;
  const prefix = lang === 'pl' ? '' : `${lang}/`;
  const isHome = path.replaceAll('\\','/') === `${prefix}index.html`;
  const footerMatch = /<footer\b/;
  if (footerMatch.test(html)) {
    const footer = block(html, 'footer', footerMatch);
    let compactFooter = footer;
    for (const match of footer.matchAll(/<div class="footer-section"[^>]*>/g)) {
      const column = block(footer.slice(match.index), 'div', /^<div/);
      if (/\bhreflang=/.test(column)) compactFooter = compactFooter.replace(column, '');
    }
    html = html.replace(footer, compactFooter.replace(/^[\t ]+$/gm, ''));
  }
  // A separate source keeps this image-only behavior out of contact/measurement code.
  html=html.replace(/\s*<script\b[^>]*src="\/home-photo\.js[^"]*"[^>]*><\/script>/g,'');
  if (isHome) html=html.replace('</body>','<script defer src="/home-photo.js"></script>\n</body>');
  const isService = /(?:^|[\\/])(?:naprawa-wifi|naprawa-sieci|montaz-sieci)[\\/]index\.html$/.test(path);
  html=html.replace(/\s*<link\b[^>]*href="\/redesign\.css[^\"]*"[^>]*>/g,'');
  html=html.replace('</head>', '<link rel="stylesheet" href="/redesign.css?v=20261015">\n</head>');
  for (const weight of [400,700]) {
    const font=`/assets/redesign/manrope-${weight}.woff2`;
    if (!html.includes(`href="${font}"`)) html=html.replace('</head>',`<link rel="preload" href="${font}" as="font" type="font/woff2" crossorigin>\n</head>`);
  }
  html=html.replace(/<body\b([^>]*)>/, (_,attributes) => `<body${attributes.replace(/ data-redesign="[^"]*"/g,'')} data-redesign="${isHome?'home':isService?'service':'shared'}">`);
  html=html.replace(/(&#128222;\s*)(<span id="phone-number">)/, icon('phone')+' $2');
  if (isHome || isService) {
    const home = pages.get(join(output,prefix,'index.html'));
    const heroForm = block(home,'aside',/<aside class="hero-form"/).replace(/<h2>[\s\S]*?<\/h2>/,`<h2>${w[4]}</h2>`);
    const rates = [...home.matchAll(/<div class="price-value"[^>]*>([^<]+)<\/div>/g)].map(m=>m[1]).filter(s=>/\d/.test(s));
    if (rates.length!==3) throw Error('Published localized rates not found: '+lang);
    const shortPrices = `<div class="preview-prices"><h3>${w[5]}</h3><div><span>${w[6]}</span><strong>${rates[0]}</strong></div><div><span>${w[7]}</span><strong>${rates[1]}</strong></div><a href="${isHome?'#services':`/${prefix}#services`}">${lang==='pl'?'Warunki rozliczenia':lang==='ru'?'Условия оплаты':lang==='uk'?'Умови оплати':'Pricing conditions'} ${icon('arrow')}</a></div>`;
    if (isHome) {
      for (const [tag, match] of [['section',/<section class="preview-overview"/],['section',/<section class="preview-conditions"/]])
        if (match.test(html)) html=html.replace(block(html,tag,match),'');
      const oldHero = block(html,'section',/<section class="hero(?: hero-service-style)?"/);
      // Reuse the service introduction: copy and enquiry link left, phone right.
      // Keep the inherited service-area microdata without adding another visible row.
      const location = oldHero.match(/<p class="hero-location"[^>]*>([\s\S]*?)<\/p>/)?.[1]?.replace(/🎯\s*/, '').trim();
      const area = location ? `<meta itemprop="areaServed" content="${location.replaceAll('"','&quot;')}">` : oldHero.match(/<meta itemprop="areaServed"[^>]*>/)?.[0] || '';
      let text = block(oldHero,'div',/<div class="hero-text"/);
      if (text.includes('<div class="hero-cta-wrapper"')) text = text.replace(block(text,'div',/<div class="hero-cta-wrapper"/),'');
      text = text.replace("class=\"hero-subtitle\"","class=\"hero-subtitle hero-large-subtitle\"").replace(/<p class="hero-location"[\s\S]*?<\/p>/,'').replace(/<\/div>\s*$/, `<div class="hero-cta-wrapper"><a href="#contact" class="btn btn-primary btn-large" data-contact-modal>${w[1]}</a></div></div>`);
      const newHero = oldHero.replace(/class="hero(?: hero-service-style)?"/, 'class="hero hero-service-style"').replace(block(oldHero,'div',/<div class="hero-content"/), `<div class="hero-content">${text}${heroCall(w)}${area}</div>`);
      html=html.replace(oldHero,newHero);
      let serviceIndex=0;
      const identifyService = (link, index) => link.replace(/ data-service-choice="[^"]*"/g,'').replace('class="home-service-link"',`class="home-service-link" data-service-choice="${serviceChoices[index]}"`);
      html=html.replace(/<a class="home-service-link"[\s\S]*?<\/a>/g, link => {
        const index = serviceIndex++;
        return identifyService(stripServiceDecor(link), index).replace(/(<a class="home-service-link"[^>]*>)/,`$1<span class="preview-svc-icon">${icon(serviceIcons[index])}</span>`).replace(/<\/a>$/,`<span class="preview-svc-go" aria-hidden="true">${icon('arrow')}</span></a>`);
      });
      const links=[...home.matchAll(/<a class="home-service-link"[\s\S]*?<\/a>/g)].map((x,index)=>identifyService(x[0],index));
      const figures={
        fault:`<figure class="preview-task-photo" data-fault-photo>${taskImage('no-internet-'+lang,taskPhotos[lang][1],true)}<picture><source type="image/avif" srcset="/assets/redesign/no-internet-led-off-20261018-640.avif 640w, /assets/redesign/no-internet-led-off-20261018-800.avif 800w, /assets/redesign/no-internet-led-off-20261018-1200.avif 1200w" sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1100px) 44vw, 30vw"><img class="preview-led-off" src="/assets/redesign/no-internet-led-off-20261018-1200.webp" srcset="/assets/redesign/no-internet-led-off-20261018-640.webp 640w, /assets/redesign/no-internet-led-off-20261018-800.webp 800w, /assets/redesign/no-internet-led-off-20261018-1200.webp 1200w" sizes="(max-width: 760px) calc(100vw - 36px), (max-width: 1100px) 44vw, 30vw" width="1200" height="675" alt="" aria-hidden="true" loading="lazy" fetchpriority="low" decoding="async"></picture><button type="button" class="preview-photo-motion" data-photo-motion data-pause="${taskPhotos[lang][2]}" data-play="${taskPhotos[lang][3]}" aria-label="${taskPhotos[lang][4]}" aria-pressed="true" title="${taskPhotos[lang][2]}" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/></svg></button></figure>`,
        setup:`<figure class="preview-task-photo">${taskImage('rj45-installation',taskPhotos[lang][0])}</figure>`
      };
      const business = businessLinks[lang] || businessLinks.pl;
      const businessLink = `<a class="preview-task-link preview-business-link" href="${business.url}" target="_blank" rel="noopener"><span class="preview-task-ico">${icon('network')}</span><div><h3>${business.label}</h3><small>ITBIZ.PL</small></div>${icon('arrow')}</a>`;
      const task = (title,indices,type) => `<article class="preview-task preview-task-${type}">${figures[type]}<div class="preview-task-heading"><h2>${title}</h2></div><div class="preview-task-links">${indices.map(i=>stripServiceDecor(links[i]).replace('home-service-link','preview-task-link').replace(/<p>[\s\S]*?<\/p>/,'').replace(/(<a class="preview-task-link"[^>]*>)/,`$1<span class="preview-task-ico">${icon(serviceIcons[i])}</span>`).replace(/<\/a>$/,icon('arrow')+'</a>')).join('')}${type==='setup'?businessLink:''}</div></article>`;
      const overview=`<section class="preview-overview"><div class="container preview-overview-grid"><div class="preview-task-pair">${task(w[2],[0,3,4],'fault')}${task(w[3],[1,2,5],'setup')}</div><aside id="preview-contact" class="preview-contact-rail">${heroForm}</aside></div></section>`;
      // Rates and their labels are copied from the published localized price table.
      const rows=[...home.matchAll(/<div class="price-row" role="row"><div class="price-service" role="cell">([^<]+)<\/div><div class="price-value" role="cell">([^<]+)<\/div><\/div>/g)];
      if (rows.length!==3) throw Error('Published localized price rows not found: '+lang);
      const conditions=`<section class="preview-conditions" aria-label="${w[5]}"><div class="container preview-conditions-grid"><p class="preview-conditions-lead"><strong>${w[12]}</strong><span>${w[13]}</span></p>${rows.map(r=>`<p class="preview-rate"><strong>${r[2]}</strong><span>${r[1]}</span></p>`).join('')}<a class="preview-conditions-link" href="#services">${shortPrices.match(/<a href="[^"]*">([^<]+)/)[1].trim()} ${icon('arrow')}</a></div></section>`;
      html=html.replace(newHero,newHero+overview+conditions);
      // Keep the existing content intact while bringing the visit process after the task chooser.
      const process=block(html,'section',/<section class="how-we-work"/);
      html=html.replace(process,'').replace(conditions,conditions+process);
      html=simplifyHomepage(html,lang,block);
    } else {
      const oldHero=block(html,'section',/<section class="hero hero-centered(?: hero-service-style)?"/);
      const call=heroCall(w);
      const text=block(oldHero,'div',/<div class="hero-text"/);
      const newHero=oldHero.replace(/class="hero hero-centered(?: hero-service-style)?"/, 'class="hero hero-centered hero-service-style"').replace(block(oldHero,'div',/<div class="hero-content"/),`<div class="hero-content">${text}${call}</div>`);
      html=html.replace(oldHero,newHero);
      const sidebar=block(html,'div',/<div class="service-sidebar home-billing"/);
      // Move the original service form, retaining IDs, validation and intent hooks.
      const serviceForm=block(html,'form',/<form id="final-form"/);
      const finalSection=block(html,'section',/<section class="final-cta"/);
      const finalActions=`<div class="preview-actions preview-final-actions"><a class="btn btn-primary" href="tel:+48453327678">${icon('phone')}${w[0]}</a><a class="btn preview-outline" href="#contact" data-contact-modal>${icon('chat')}${w[1]}</a></div>`;
      if (finalSection.includes('<div class="final-form"')) html=html.replace(finalSection,finalSection.replace(block(finalSection,'div',/<div class="final-form"/),finalActions));
      else if (finalSection.includes('<div class="preview-actions preview-final-actions"')) html=html.replace(finalSection,finalSection.replace(block(finalSection,'div',/<div class="preview-actions preview-final-actions"/),finalActions));
      const serviceQuickForm=heroForm.replace(block(heroForm,'form',/<form id="hero-form"/),serviceForm);
      const previousRail=html.includes('<aside class="preview-service-rail"')?block(html,'aside',/<aside class="preview-service-rail"/):sidebar;
      html=html.replace(previousRail,`<aside class="preview-service-rail">${serviceQuickForm}${sidebar}</aside>`);
      const reviews=block(home,'section',/<section class="reviews"/);
      const reviewModal=block(home,'div',/<div id="review-modal"/);
      if (html.includes('<section class="reviews"')) html=html.replace(block(html,'section',/<section class="reviews"/),'');
      if (html.includes('<div id="review-modal"')) html=html.replace(block(html,'div',/<div id="review-modal"/),'');
      html=html.replace('<section class="final-cta"',reviews+reviewModal+'\n<section class="final-cta"');
    }
    transformed++;
  }
  html=channels(html);
  await writeFile(file,html.replace(/\n[ \t]*\n(?:[ \t]*\n)+/g,'\n\n'));
}
console.log(`Approved redesign applied: ${transformed} commercial layouts; shared visual skin on all HTML.`);
}

// Content generators replace service-content. Temporarily return its form to
// the lower CTA so the existing generator can replace the section safely.
export async function restoreRedesignForms() {
  for (const file of await walk(output)) {
    let html=await readFile(file,'utf8');
    if (!html.includes('<aside class="preview-service-rail"')) continue;
    const rail=block(html,'aside',/<aside class="preview-service-rail"/);
    if (!rail.includes('<form id="final-form"')) continue;
    const form=block(rail,'form',/<form id="final-form"/);
    const actions=block(html,'div',/<div class="preview-actions preview-final-actions"/);
    html=html.replace(rail,rail.replace(form,'')).replace(actions,`<div class="final-form">${form}</div>`);
    await writeFile(file,html);
  }
}

export function restoreHomepageReadability(html) {
  return restoreHomepage(html, block);
}

if (process.argv[1]?.endsWith('apply-redesign.mjs')) await applyRedesign();
