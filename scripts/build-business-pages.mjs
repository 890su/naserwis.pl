import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { businessCopy } from './business-copy.mjs';
import { businessPath } from './business-links.mjs';

const esc = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const schema = value => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<', '\\u003c')}</script>`;
function block(html, tag, match) {
  const start = html.search(match);
  if (start < 0) throw Error(`Missing business template block ${match}`);
  const tokens = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
  tokens.lastIndex = start;
  let depth = 0;
  for (let token; (token = tokens.exec(html));) {
    depth += token[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(start, tokens.lastIndex);
  }
  throw Error(`Unclosed ${tag}`);
}
const languages = Object.keys(businessCopy);
for (const [locale, c] of Object.entries(businessCopy)) {
  const prefix = locale === 'pl' ? '' : `${locale}/`;
  const template = await readFile(`public/${prefix}naprawa-sieci/index.html`, 'utf8');
  if (!block(template, 'section', /<section class="final-cta"/).includes('<form id="final-form"')) throw Error('Business pages require restored source forms; run generate-site.mjs.');
  let sidebar = block(template, 'div', /<div class="service-sidebar home-billing"/);
  const terms = ['billing-rule', 'billing-project', 'price-disclaimer'].map(className => sidebar.match(new RegExp(`<p class="${className}">[\\s\\S]*?</p>`))?.[0] || '');
  for (const term of terms) sidebar = sidebar.replace(term, '');
  sidebar = sidebar.replace(/<p class="price-header">[\s\S]*?<\/p>/, '').replace(/<h3>[\s\S]*?<\/h3>/, `<h3>${c.prices}</h3>`);
  sidebar = sidebar.replace(/(<a href="#contact" class="btn)/, `<details class="business-price-terms"><summary>${{pl:'Pełne warunki rozliczenia',ru:'Полные условия оплаты',uk:'Повні умови оплати',en:'Full pricing conditions'}[locale]}</summary>${terms.join('')}</details>$1`);
  for (const [slug, service] of [['', c.hub], ...Object.entries(c.services)]) {
    const path = businessPath(locale, slug);
    const url = `https://naserwis.pl${path}`;
    let html = template;
    html = html.replace(/<body\b[^>]*>/, `<body class="business-page" data-business-service="${slug || 'hub'}">`);
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(service.title)}</title>`);
    html = html.replace(/<meta\s+(name|property)="(title|og:title|twitter:title)"\s+content="[^"]*">/g, (_, attr, name) => `<meta ${attr}="${name}" content="${esc(service.title)}">`);
    html = html.replace(/<meta\s+(name|property)="(description|og:description|twitter:description)"\s+content="[^"]*">/g, (_, attr, name) => `<meta ${attr}="${name}" content="${esc(service.intro)}">`);
    html = html.replace(/<link\b[^>]*rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}">`);
    html = html.replace(/<link\b[^>]*rel="alternate"[^>]*hreflang="([^"]+)"[^>]*>/g, (_, lang) => `<link rel="alternate" hreflang="${lang}" href="https://naserwis.pl${businessPath(lang === 'x-default' ? 'pl' : lang, slug)}">`);
    html = html.replace(/(<meta[^>]*property="(?:og:url|twitter:url)"[^>]*content=")[^"]+/g, `$1${url}`);
    // Only language switches change route; related service links keep their targets.
    html = html.replace(/<a\b[^>]*(?:data-lang|hreflang)="([a-z]{2})"[^>]*>/g, (tag, lang) => tag.replace(/href="[^"]+"/, `href="${businessPath(lang, slug)}"`));
    html = html.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/, `<h1$1>${esc(service.h1)}<br><span class="accent-text">${esc(service.accent)}</span></h1>`);
    html = html.replace(/<p class="hero-large-subtitle"[^>]*>[\s\S]*?<\/p>/, `<p class="hero-large-subtitle">${esc(service.intro)}</p>`);
    html = html.replace(/(<div class="hero-cta-wrapper">\s*<a)(?![^>]*data-contact-modal)/, '$1 data-contact-modal');
    const related = `<nav class="business-related" aria-label="${esc(c.related)}"><h2>${esc(slug ? c.related : c.hub.nav)}</h2><ul>${Object.entries(c.services).filter(([key]) => key !== slug).map(([key, page]) => `<li><a href="${businessPath(locale, key)}">${esc(page.nav)} <span aria-hidden="true">→</span></a></li>`).join('')}</ul></nav>`;
    const crumbs = `<nav class="business-breadcrumbs" aria-label="${{pl:'Ścieżka strony',ru:'Путь к странице',uk:'Шлях до сторінки',en:'Breadcrumbs'}[locale]}"><a href="/${prefix}">${c.home}</a><span aria-hidden="true">/</span>${slug ? `<a href="${businessPath(locale)}">${esc(c.hub.h1)}</a><span aria-hidden="true">/</span>` : ''}<span aria-current="page">${esc(service.nav)}</span></nav>`;
    const serviceBody = slug ? `<section><h2>${esc(c.scope)}</h2><ul class="business-work">${service.work.map(text => `<li>${esc(text)}</li>`).join('')}</ul></section><section><h2>${esc(c.result)}</h2><p>${esc(service.outcome)}</p><p class="business-limit">${esc(service.limit)}</p></section>` : related;
    html = html.replace(block(html, 'section', /<section class="service-content /), `<section class="service-content home-service-content business-content"><div class="container">${crumbs}<div class="service-row"><div class="service-main">${serviceBody}<section><h2>${esc(c.prepare)}</h2><p>${esc(service.prepare)}</p><a href="#contact" data-contact-modal>${esc(c.request)}</a></section>${slug ? related : ''}</div>${sidebar}</div></div></section>`);
    for (const name of ['service-proof', 'faq-section', 'guides-teaser', 'reviews']) {
      const match = new RegExp(`<section class="${name}(?:[" ])`);
      if (match.test(html)) html = html.replace(block(html, 'section', match), '');
    }
    if (html.includes('<div id="review-modal"')) html = html.replace(block(html, 'div', /<div id="review-modal"/), '');
    if (html.includes('<aside class="contact-checkpoint"')) html = html.replace(block(html, 'aside', /<aside class="contact-checkpoint"/), '');
    html = html.replace(/<h2 id="contact-title">[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/, `<h2 id="contact-title">${esc(c.request)}</h2><p>${esc(service.prepare)}</p>`);
    html = html.replace(/(<form id="final-form"[^>]*>)\s*<p class="contact-next-step">[\s\S]*?<\/p>/, `$1<p class="contact-next-step">${esc(service.prepare)}</p>`);
    html = html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, (source, json) => ['Service','FAQPage','BreadcrumbList'].includes(JSON.parse(json)['@type']) ? '' : source);
    const data = { '@context':'https://schema.org', '@type':slug ? 'Service' : 'CollectionPage', name:service.h1, description:service.intro, url, inLanguage:locale };
    if (slug) Object.assign(data, { serviceType:service.nav, provider:{'@type':'LocalBusiness','@id':'https://naserwis.pl',name:'NaSerwis.pl'}, areaServed:{'@type':'City',name:'Warszawa'}, audience:{'@type':'BusinessAudience',audienceType:'Companies and organisations'} });
    const breadcrumb = { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem',position:1,name:'NaSerwis',item:`https://naserwis.pl/${prefix}` }, ...(slug ? [{ '@type':'ListItem',position:2,name:c.hub.h1,item:`https://naserwis.pl${businessPath(locale)}` }] : []), { '@type':'ListItem',position:slug ? 3 : 2,name:service.nav,item:url }] };
    html = html.replace('</head>', `${schema(data)}\n${schema(breadcrumb)}\n<link rel="stylesheet" href="/business.css?v=20261026">\n</head>`);
    await mkdir(`public${path}`, { recursive:true });
    await writeFile(`public${path}index.html`, html);
  }
}
const sitemapFile = 'public/sitemap.xml';
let sitemap = await readFile(sitemapFile, 'utf8');
sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/naserwis\.pl\/(?:ru\/|uk\/|en\/)?dla-firm\/[\s\S]*?<\/url>/g, '');
const entries = ['', ...Object.keys(businessCopy.pl.services)].flatMap(slug => languages.map(locale => `  <url>\n    <loc>https://naserwis.pl${businessPath(locale, slug)}</loc>\n${languages.map(lang => `    <xhtml:link rel="alternate" hreflang="${lang}" href="https://naserwis.pl${businessPath(lang, slug)}"/>`).join('\n')}\n    <xhtml:link rel="alternate" hreflang="x-default" href="https://naserwis.pl${businessPath('pl', slug)}"/>\n    <lastmod>2026-10-26</lastmod>\n  </url>`)).join('\n');
await writeFile(sitemapFile, sitemap.replace('</urlset>', `${entries}\n</urlset>`));
console.log('Local business services: 5 concise pages and hub × 4 locales, shared forms, schema and sitemap.');
