// Reapply the approved design to current content after any site generator.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { assetManifest, expandAssetBundles } from './site-assets.mjs';
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
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({ phone:'<path d="M21 16.5v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.3 19.3 0 0 1-6-6A19.7 19.7 0 0 1 1.1 3.8 2 2 0 0 1 3.1 1.6h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L7 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>', chat:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 10h8M8 14h5"/>', wrench:'<path d="M14.7 6.3a5 5 0 0 0-6.3 6.3L2 19a2.1 2.1 0 0 0 3 3l6.4-6.4a5 5 0 0 0 6.3-6.3l-3 3-3-3 3-3Z"/>', setup:'<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M7 10V3M17 10V3M8 15h.01M12 15h.01M16 15h.01M8 23h8"/>', arrow:'<path d="m9 5 7 7-7 7"/>' })[name]}</svg>`;
const words = {
 pl: ['Zadzwoń do technika','Opisz problem','Coś nie działa?','Chcę skonfigurować lub zamontować','Szybki kontakt','Orientacyjne ceny','Dojazd + pierwsza godzina','Kolejna godzina','Zadzwoń, ustalimy szczegóły','Router i laptop — ilustracja domowej sieci'],
 ru: ['Позвонить мастеру','Описать проблему','Что-то не работает?','Нужно настроить или установить','Быстрая связь','Ориентировочные цены','Выезд + первый час','Следующий час','Позвоните — обсудим детали','Роутер и ноутбук — иллюстрация домашней сети'],
 uk: ['Зателефонувати майстру','Описати проблему','Щось не працює?','Потрібно налаштувати або встановити','Швидкий зв’язок','Орієнтовні ціни','Виїзд + перша година','Наступна година','Зателефонуйте — обговоримо деталі','Роутер і ноутбук — ілюстрація домашньої мережі'],
 en: ['Call a technician','Describe the problem','Something not working?','Need setup or installation?','Quick contact','Indicative prices','Visit + first hour','Additional hour','Call to discuss the details','Router and laptop — home network illustration']
};
async function walk(dir) { const list=[]; for (const item of await readdir(dir,{withFileTypes:true})) { const p=join(dir,item.name); if(item.isDirectory()) list.push(...await walk(p)); else if(item.name.endsWith('.html')) list.push(p); } return list; }
export async function applyRedesign() {
let transformed=0;
const manifest = await assetManifest();
const pages = new Map(await Promise.all((await walk(output)).map(async file => [file, expandAssetBundles(await readFile(file,'utf8'),manifest)])));
for (const [file, currentHtml] of pages) {
  let html = currentHtml;
  const path = relative(output,file);
  const lang = html.match(/<html[^>]*lang="([^"]+)"/)?.[1] || 'pl';
  const w = words[lang] || words.pl;
  const prefix = lang === 'pl' ? '' : `${lang}/`;
  const isHome = path.replaceAll('\\','/') === `${prefix}index.html`;
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
      if (html.includes('class="preview-overview"')) html=html.replace(block(html,'section',/<section class="preview-overview"/),'');
      const oldHero = block(html,'section',/<section class="hero"/);
      let newHero = oldHero;
      if (newHero.includes('<aside class="hero-form"')) newHero=newHero.replace(block(newHero,'aside',/<aside class="hero-form"/),'');
      if (newHero.includes('<picture class="preview-hero-photo"')) newHero=newHero.replace(block(newHero,'picture',/<picture class="preview-hero-photo"/),'');
      if (newHero.includes('<div class="preview-actions"')) newHero=newHero.replace(block(newHero,'div',/<div class="preview-actions"/),'');
      newHero=newHero.replace(/(<p class="hero-location"[^>]*>)🎯\s*/, '$1');
      const textBlock=block(newHero,'div',/<div class="hero-text"/);
      const actions=`<div class="preview-actions"><a class="btn btn-primary" href="tel:+48453327678">${icon('phone')}${w[0]}</a><a class="btn preview-outline" href="#preview-contact">${icon('chat')}${w[1]}</a></div>`;
      newHero=newHero.replace(textBlock,textBlock.replace(/<p class="hero-location"[\s\S]*?<\/p>/,m=>actions+m));
      const picture=`<picture class="preview-hero-photo"><source type="image/avif" srcset="/assets/redesign/home-network-720.avif 720w, /assets/redesign/home-network-1440.avif 1440w" sizes="(max-width: 760px) 100vw, 52vw"><img src="/assets/redesign/home-network-1440.webp" srcset="/assets/redesign/home-network-720.webp 720w, /assets/redesign/home-network-1440.webp 1440w" sizes="(max-width: 760px) 100vw, 52vw" width="1440" height="793" fetchpriority="high" alt="${w[9]}"></picture>`;
      newHero=newHero.replace('</section>',picture+'</section>');
      html=html.replace(oldHero,newHero);
      const links=[...home.matchAll(/<a class="home-service-link"[\s\S]*?<\/a>/g)].map(x=>x[0]);
      const task = (title,indices,type) => `<article class="preview-task preview-task-${type}"><div class="preview-task-heading"><span class="preview-task-icon">${icon(type==='fault'?'wrench':'setup')}</span><h2>${title}</h2></div><div class="preview-task-links">${indices.map(i=>links[i].replace('home-service-link','preview-task-link').replace(/<p>[\s\S]*?<\/p>/,'').replace(/<span aria-hidden="true">[\s\S]*?<\/span>/,icon('arrow'))).join('')}</div></article>`;
      const overview=`<section class="preview-overview"><div class="container preview-overview-grid"><div class="preview-task-pair">${task(w[2],[0,3,4],'fault')}${task(w[3],[1,2,5],'setup')}</div><aside id="preview-contact" class="preview-contact-rail">${heroForm}${shortPrices}</aside></div></section>`;
      html=html.replace(newHero,newHero+overview);
      // Keep the existing content intact while bringing the visit process after the task chooser.
      const process=block(html,'section',/<section class="how-we-work"/);
      html=html.replace(process,'').replace(overview,overview+process);
    } else {
      const oldHero=block(html,'section',/<section class="hero hero-centered"/);
      const call=`<a href="tel:+48453327678" class="preview-hero-call"><span class="preview-call-icon">${icon('phone')}</span><span><strong>+48 453 327 678</strong><small>${w[0]}</small></span></a>`;
      const text=block(oldHero,'div',/<div class="hero-text"/);
      const newHero=oldHero.replace(block(oldHero,'div',/<div class="hero-content"/),`<div class="hero-content">${text}${call}</div>`);
      html=html.replace(oldHero,newHero);
      const sidebar=block(html,'div',/<div class="service-sidebar home-billing"/);
      // Move the original service form, retaining IDs, validation and intent hooks.
      const serviceForm=block(html,'form',/<form id="final-form"/);
      const finalSection=block(html,'section',/<section class="final-cta"/);
      const finalActions=`<div class="preview-actions preview-final-actions"><a class="btn btn-primary" href="tel:+48453327678">${icon('phone')}${w[0]}</a><a class="btn preview-outline" href="#final-form">${icon('chat')}${w[1]}</a></div>`;
      if (finalSection.includes('<div class="final-form"')) html=html.replace(finalSection,finalSection.replace(block(finalSection,'div',/<div class="final-form"/),finalActions));
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

if (process.argv[1]?.endsWith('apply-redesign.mjs')) await applyRedesign();
