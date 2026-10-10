import { mkdir, readFile, writeFile } from 'node:fs/promises';
import pl from './guide-copy-pl.mjs';
import ru from './guide-copy-ru.mjs';
import uk from './guide-copy-uk.mjs';
import en from './guide-copy-en.mjs';
import { siteChrome, syncGuideNavigation } from './site-chrome.mjs';
const copies = { pl, ru, uk, en };
const legal = {
  pl: ['Polityka prywatności', 'Polityka cookies', 'Ustawienia prywatności', 'Kable: sprawdź kategorię, materiał żył i przeznaczenie'],
  ru: ['Конфиденциальность', 'Политика cookies', 'Настройки конфиденциальности', 'Кабели: проверьте категорию, материал жил и назначение'],
  uk: ['Конфіденційність', 'Політика cookies', 'Налаштування конфіденційності', 'Кабелі: перевірте категорію, матеріал жил і призначення'],
  en: ['Privacy policy', 'Cookie policy', 'Privacy settings', 'Cables: check category, conductor material and installation requirements'],
};
for (const [locale, c] of Object.entries(copies)) c.lan.equipmentLinks.unshift(['https://www.belden.com/products/cable/ethernet-cable', legal[locale][3]]);
const slugs = { wifi: 'jak-wzmocnic-sygnal-wifi-w-domu', lan: 'siec-lan-w-domu-przed-remontem' };
const root = 'https://naserwis.pl';
const version = '20261010-guide3';
const date = '2026-10-10';
const esc = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const prefix = locale => locale === 'pl' ? '/' : `/${locale}/`;
const route = (locale, type = '') => `${prefix(locale)}poradnik/${type ? slugs[type] + '/' : ''}`;
const alternatives = type => Object.keys(copies).map(locale => `<link rel="alternate" hreflang="${locale}" href="${root}${route(locale, type)}">`).join('\n') + `\n<link rel="alternate" hreflang="x-default" href="${root}${route('pl', type)}">`;
const sources = {
  wifi: [
    ['https://www.tp-link.com/uk/support/faq/1794/', 'TP-Link — Ethernet backhaul'],
    ['https://www.tp-link.com/us/support/faq/409/', 'TP-Link — Powerline'],
    ['https://www.cisco.com/c/en/us/td/docs/wireless/controller/9800/technical-reference/wireless-rf-reference-guide.html', 'Cisco — RF'],
    ['https://kb.netgear.com/000065251/Where-should-I-put-my-NETGEAR-wireless-access-point-for-optimal-WiFi-network-performance', 'NETGEAR — Wi-Fi'],
  ],
  lan: [
    ['https://www.flukenetworks.com/expertise/role/network-engineers', 'Fluke Networks — Ethernet / NBASE-T'],
    ['https://www.flukenetworks.com/blog/cabling-chronicles/wire-map-testing-it-s-not-all-about-color', 'Fluke Networks — wire map / split pair'],
    ['https://www.flukenetworks.com/knowledge-base/application-or-standards-articles-copper/differences-between-wiring-codes-t568a-vs', 'Fluke Networks — T568A / T568B'],
    ['https://www.flukenetworks.com/blog/cabling-chronicles/electromagnetic-interference-mitigation-industrial-ethernet-cabling', 'Fluke Networks — EMI'],
    ['https://de.belden.com/blog/what-it-takes-to-pull-category-cable-for-av-projects', 'Belden — cable installation'],
  ],
};
function links(items) { return `<ul>${items.map(([url, label]) => `<li><a href="${esc(url)}">${esc(label)} ↗</a></li>`).join('')}</ul>`; }
function table(headers, rows) { return `<div class="guide-table-wrap" tabindex="0"><table><thead><tr>${headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
function sections(items, mode, c) {
  return `<section class="reader-panel" id="${mode}" data-panel="${mode}" aria-labelledby="${mode}-title"><h2 id="${mode}-title" class="reader-level">${esc(c[mode === 'simple' ? 'plain' : 'technical'])}</h2><nav class="guide-toc" aria-label="${esc(c.contents)}"><p>${esc(c.contents)}</p><ol>${items.map((s, i) => `<li><a href="#${mode}-${i + 1}">${esc(s.title)}</a></li>`).join('')}</ol></nav>${items.map((s, i) => `<section class="guide-section" id="${mode}-${i + 1}"><h2>${esc(s.title)}</h2>${s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}${s.items.length ? `<ul>${s.items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}</section>`).join('')}</section>`;
}
function shared(c, type) {
  const a = c[type];
  const diagram = type === 'wifi' ? `<section class="guide-section"><h2>${esc(c.diagramTitle)}</h2><div class="network-path"><span>${esc(c.diagram[0])}</span><b aria-hidden="true">→</b><span>${esc(c.diagram[1])}</span><div class="network-branches"><span>→ ${esc(c.diagram[2])}</span><span>→ ${esc(c.diagram[3])}<small>⇢ ${esc(c.diagram[4])}</small></span></div></div></section>` : '';
  const facts = type === 'wifi' ? `<section class="guide-section" id="obstacles"><h2>${esc(c.tableTitle)}</h2><p>${esc(c.tableIntro)}</p>${table(c.tableHeaders, c.obstacles)}</section>` : `<section class="guide-section" id="speeds"><h2>${esc(c.speedsTitle)}</h2>${table(c.speedHeaders, c.speeds)}<p class="guide-caption">${esc(c.speedNote)}</p></section>`;
  return `${diagram}${facts}<section class="guide-section guide-equipment"><h2>${esc(c.equipment)}</h2><p>${esc(c.externalNote)}</p>${links(a.equipmentLinks)}</section><section class="guide-section guide-sources"><h2>${esc(c.sources)}</h2>${links(sources[type])}</section>`;
}
async function page(locale, type = '') {
  const c = copies[locale], a = type ? c[type] : null;
  const title = a?.title || c.indexTitle, description = a?.description || c.indexDescription;
  const url = root + route(locale, type);
  const breadcrumbs = [{ '@type': 'ListItem', position: 1, name: c.home, item: root + prefix(locale) }, { '@type': 'ListItem', position: 2, name: c.label, item: root + route(locale) }];
  if (a) breadcrumbs.push({ '@type': 'ListItem', position: 3, name: a.h1, item: url });
  const schema = { '@context': 'https://schema.org', '@graph': [{ '@type': 'BreadcrumbList', itemListElement: breadcrumbs }, a ? { '@type': 'Article', '@id': url + '#article', mainEntityOfPage: url, url, headline: a.h1, description, inLanguage: locale, datePublished: date, dateModified: date, author: { '@type': 'Organization', name: c.author, url: root }, publisher: { '@type': 'Organization', name: 'NaSerwis', url: root } } : { '@type': 'CollectionPage', url, name: title, description, inLanguage: locale, hasPart: Object.keys(slugs).map(t => ({ '@type': 'Article', headline: c[t].h1, url: root + route(locale, t) })) }] };
  const chrome = await siteChrome(locale, type, route, legal[locale]);
  const content = a ? `<article><div class="guide-reader" data-reader><nav class="reader-switch" aria-label="${esc(c.choose)}"><span>${esc(c.choose)}</span><div><a href="#simple" id="select-simple" data-mode="simple">${esc(c.plain)}</a><a href="#technical" id="select-technical" data-mode="technical">${esc(c.technical)}</a></div><p>${esc(c.switchHelp)}</p></nav>${sections(a.plainSections, 'simple', c)}${sections(a.technicalSections, 'technical', c)}</div>${shared(c, type)}<aside class="guide-service"><h2>${esc(a.cta)}</h2><p>${esc(a.ctaText)}</p><a class="guide-action" href="${prefix(locale)}${a.service}">${esc(a.serviceLabel)} →</a></aside><nav class="guide-next" aria-label="${esc(c.label)}"><a href="${route(locale, type === 'wifi' ? 'lan' : 'wifi')}">${esc(c[type === 'wifi' ? 'lan' : 'wifi'].h1)} →</a></nav></article>` : `<div class="guide-cards">${Object.keys(slugs).map(t => `<article><span class="guide-topic">${t === 'wifi' ? 'Wi-Fi' : 'LAN'}</span><h2><a href="${route(locale, t)}">${esc(c[t].h1)}</a></h2><p>${esc(c[t].lead)}</p><p class="guide-caption">${esc(c.plain)} / ${esc(c.technical)}</p><a class="guide-action" href="${route(locale, t)}">${esc(c.read)} →</a></article>`).join('')}</div>`;
  return `<!DOCTYPE html>
<html lang="${locale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<script src="/site-config.js"></script><script src="/consent.js?v=20261009-home1"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18394870871"></script><script>gtag('js', new Date());gtag('config', 'AW-18394870871');gtag('config', 'G-FVC64PTKR3');</script>
<title>${esc(title)} | NaSerwis</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">${alternatives(type)}
<meta property="og:type" content="${a ? 'article' : 'website'}"><meta property="og:url" content="${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<link rel="stylesheet" href="/styles.css?v=${version}"><link rel="stylesheet" href="/custom.css?v=${version}"><link rel="stylesheet" href="/contact-ui.css?v=20261009-home1"><link rel="stylesheet" href="/guides.css?v=${version}">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=Roboto:wght@400;500&subset=latin,cyrillic&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script><script src="/script.js?v=${version}" defer></script><script src="/guides.js?v=${version}" defer></script></head>
<body class="guide-page"><a class="guide-skip" href="#main-content">${esc(c.read)}</a>${chrome.header}
<main id="main-content" class="guide-shell"><nav class="guide-breadcrumb" aria-label="Breadcrumb"><a href="${prefix(locale)}">${esc(c.home)}</a><span aria-hidden="true">/</span>${a ? `<a href="${route(locale)}">${esc(c.label)}</a>` : `<span>${esc(c.label)}</span>`}</nav>
<div class="guide-heading"><span class="guide-topic">${a ? type === 'wifi' ? 'Wi-Fi' : 'LAN' : esc(c.label)}</span><h1>${esc(a?.h1 || title)}</h1><p class="guide-lead">${esc(a?.lead || c.intro)}</p>${a ? `<p class="guide-caption">${esc(c.author)} · ${esc(c.updated)}: <time datetime="${date}">10.10.2026</time></p>` : ''}</div>${content.replaceAll('class="guide-action"', 'class="btn btn-primary guide-action"')}</main>
${chrome.footer}</body></html>\n`;
}
await syncGuideNavigation(copies, 'public', version);
for (const locale of Object.keys(copies)) {
  for (const type of ['', 'wifi', 'lan']) {
    const dir = 'public' + route(locale, type);
    await mkdir(dir, { recursive: true });
    await writeFile(dir + 'index.html', await page(locale, type));
  }
  // Idempotent integration. Keep existing commercial routes, anchors and forms.
  for (const service of ['', 'naprawa-wifi/', 'naprawa-sieci/', 'montaz-sieci/']) {
    const file = `public${prefix(locale)}${service}index.html`;
    let html = await readFile(file, 'utf8');
    html = html.replace(/\s*<!-- GUIDES TEASER START -->[\s\S]*?<!-- GUIDES TEASER END -->/g, '');
    const c = copies[locale], types = service === 'naprawa-wifi/' ? ['wifi'] : service ? ['lan'] : ['wifi', 'lan'];
    const block = `<section class="guides-teaser"><div class="container"><h2>${esc(c.label)}</h2><p>${esc(c.intro)}</p><ul>${types.map(t => `<li><a href="${route(locale, t)}">${esc(c[t].h1)} →</a></li>`).join('')}</ul><a href="${route(locale)}">${esc(c.label)} →</a></div></section>`;
    html = html.replace('</main>', `\n<!-- GUIDES TEASER START -->\n${block}\n<!-- GUIDES TEASER END -->\n</main>`);
    if (!html.includes('/guides.css?')) html = html.replace('</head>', `<link rel="stylesheet" href="/guides.css?v=${version}">\n</head>`);
    html = html.replace(/\/guides\.css\?v=[^"\s]+/g, `/guides.css?v=${version}`);
    await writeFile(file, html);
  }
}
let sitemap = await readFile('public/sitemap.xml', 'utf8');
sitemap = sitemap.replace(/\s*<!-- GUIDES SITEMAP START -->[\s\S]*?<!-- GUIDES SITEMAP END -->/g, '');
const entries = Object.keys(copies).flatMap(locale => ['', 'wifi', 'lan'].map(type => `<url><loc>${root}${route(locale, type)}</loc><lastmod>${date}</lastmod>${Object.keys(copies).map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${root}${route(l, type)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${root}${route('pl', type)}"/></url>`)).join('\n');
sitemap = sitemap.replace('</urlset>', `\n<!-- GUIDES SITEMAP START -->\n${entries}\n<!-- GUIDES SITEMAP END -->\n</urlset>`);
await writeFile('public/sitemap.xml', sitemap);
console.log('Guides generated: two articles × two reading levels × four locales, four indexes, one canonical URL per article/locale.');
