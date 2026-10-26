import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { cctvCopy, cctvRoute } from './cctv-copy.mjs';
import { copy } from './home-service-copy.mjs';
import { cctvGuideSlug } from './guide-copy-cctv.mjs';
import { homeGuideTeaser } from './home-guide-teaser.mjs';

const esc = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const jsonld = data => `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
const arrow = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
function block(html, tag, match) {
  const start = html.search(match);
  if (start < 0) throw Error(`Missing template block: ${match}`);
  const tokens = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi'); tokens.lastIndex = start;
  let depth = 0;
  for (let token; (token = tokens.exec(html));) {
    depth += token[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(start, tokens.lastIndex);
  }
  throw Error(`Unclosed ${tag}`);
}

for (const [locale, c] of Object.entries(cctvCopy)) {
  const prefix = locale === 'pl' ? '' : `${locale}/`;
  const base = copy[locale];
  const url = `https://naserwis.pl/${prefix}${cctvRoute}`;
  // Reuse the existing translated service chrome, rate terms and real enquiry
  // form. generate-site restores source assets and the form before this step.
  let html = await readFile(`public/${prefix}naprawa-sieci/index.html`, 'utf8');
  const sidebar = block(html, 'div', /<div class="service-sidebar home-billing"/)
    .replace('class="service-sidebar home-billing"', 'class="service-sidebar home-billing" id="cctv-prices"');
  if (!block(html, 'section', /<section class="final-cta"/).includes('<form id="final-form"')) {
    throw Error('Run via scripts/generate-site.mjs so the source contact form is restored first.');
  }
  html = html.replace(/<body\b([^>]*)>/, (_, attrs) => `<body${attrs.replace(/\sclass="([^"]*)"/, '')} class="cctv-page">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(c.title)}</title>`);
  html = html.replace(/<meta\s+(name|property)="(title|og:title|twitter:title)"\s+content="[^"]*">/g, (_, a, n) => `<meta ${a}="${n}" content="${esc(c.title)}">`);
  html = html.replace(/<meta\s+(name|property)="(description|og:description|twitter:description)"\s+content="[^"]*">/g, (_, a, n) => `<meta ${a}="${n}" content="${esc(c.description)}">`);
  html = html.replace(/https:\/\/naserwis\.pl\/((?:(?:ru|uk|en)\/)?)naprawa-sieci\//g, `https://naserwis.pl/$1${cctvRoute}`);
  html = html.replace(/<a\b[^>]*hreflang="[^"]*"[^>]*>/g, tag => tag.replace('naprawa-sieci/', cctvRoute));
  html = html.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/, `<h1$1>${esc(c.h1)}<br><span class="accent-text">${esc(c.accent)}</span></h1>`);
  html = html.replace(/<p class="hero-large-subtitle"[^>]*>[\s\S]*?<\/p>/, `<p class="hero-large-subtitle">${esc(c.intro)}</p>`);
  html = html.replace(/<section class="hero hero-centered(?: hero-service-style)?"[^>]*>/, '<section class="hero hero-centered hero-service-style" id="cctv-hero">');
  // The adjacent service's LAN repair proof does not describe CCTV work.
  if (html.includes('<section class="service-proof"')) html = html.replace(block(html, 'section', /<section class="service-proof"/), '');
  const oldContent = block(html, 'section', /<section class="service-content /);
  const related = [['naprawa-sieci/', base.repair.h1], ['naprawa-wifi/', base.wifi.h1], ['montaz-sieci/', base.install.h1]];
  const content = `<section class="service-content home-service-content"><div class="container"><div class="service-row"><div class="service-main">
<section class="cctv-repair" id="cctv-repair" aria-labelledby="cctv-repair-title"><h2 id="cctv-repair-title">${esc(c.repairTitle)}</h2><p>${esc(c.repairIntro)}</p>
<div class="cctv-symptoms">${c.faults.map(([title, text]) => `<details class="cctv-symptom"><summary><h3>${esc(title)}</h3>${arrow}</summary><p>${esc(text)}</p></details>`).join('\n')}</div>
<p class="cctv-preserve">${esc(c.preserve)}</p></section>
<section class="cctv-install" id="cctv-install" aria-labelledby="cctv-install-title"><h2 id="cctv-install-title">${esc(c.installTitle)}</h2><p>${esc(c.installIntro)}</p>
<ol class="cctv-install-steps">${c.steps.map(([title, text]) => `<li><h3>${esc(title)}</h3><p>${esc(text)}</p></li>`).join('\n')}</ol><h3 class="cctv-systems-title">${esc(c.systemsTitle)}</h3><ul class="cctv-system-types">${c.systems.map(([title, text]) => `<li><strong>${esc(title)}.</strong> ${esc(text)}</li>`).join('\n')}</ul><p class="cctv-scope">${esc(c.scope)}</p></section>
<section class="cctv-prepare" aria-labelledby="cctv-prepare-title"><h2 id="cctv-prepare-title">${esc(c.prepareTitle)}</h2><p>${esc(c.prepare)}</p><a href="#contact" data-contact-modal>${esc(base.request)}</a></section>
<aside class="business-handoff cctv-business"><h2>${esc(c.businessTitle)}</h2><p>${esc(c.business)}</p><a href="${c.businessUrl}">${esc(c.businessLink)} <span aria-hidden="true">→</span></a></aside>
<div class="info-box cctv-related"><h2>${esc(c.relatedTitle)}</h2><div class="info-box-links">${related.map(([path, label]) => `<a class="info-link" href="/${prefix}${path}">${esc(label)} <span aria-hidden="true">→</span></a>`).join('\n')}</div></div>
</div>${sidebar}</div></div></section>`;
  html = html.replace(oldContent, content);
  const faq = `<section class="faq-section"><div class="container"><h2 class="faq-title">${esc(c.faqTitle)}</h2><div class="faq-container">${c.questions.map(([q, a]) => `<details class="faq-item"><summary class="faq-question">${esc(q)}</summary><p class="faq-answer">${esc(a)}</p></details>`).join('\n')}</div></div></section>`;
  html = html.replace(block(html, 'section', /<section class="faq-section"/), faq);
  html = html.replace(/<h2 id="contact-title">[\s\S]*?<\/h2>\s*<p>[\s\S]*?<\/p>/, `<h2 id="contact-title">${esc(c.contactTitle)}</h2><p>${esc(c.contactText)}</p>`);
  html = html.replace(/(<form id="final-form"[^>]*>)\s*<p class="contact-next-step">[\s\S]*?<\/p>/, `$1<p class="contact-next-step">${esc(c.contactText)}</p>`);
  const oldTeaser = block(html, 'section', /<section class="guides-teaser(?: home-guides)?"/);
  const guideTitle = oldTeaser.match(/<h2\b[^>]*>([^<]+)<\/h2>/)?.[1];
  html = html.replace(oldTeaser, homeGuideTeaser(locale, guideTitle, type => `/${prefix}poradnik/${type ? cctvGuideSlug + '/' : ''}`, ['cctv']));
  html = html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, (source, json) => {
    const data = JSON.parse(json);
    return ['Service', 'FAQPage'].includes(data['@type']) ? '' : source;
  });
  const service = { '@context': 'https://schema.org', '@type': 'Service', name: `${c.h1}: ${c.accent}`, description: c.description, url, serviceType: ['CCTV repair', 'CCTV configuration', 'Camera installation'], provider: { '@id': 'https://naserwis.pl', '@type': 'LocalBusiness', name: 'NaSerwis.pl' }, areaServed: { '@type': 'City', name: 'Warszawa' } };
  const schemaFaq = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: locale, mainEntity: c.questions.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) };
  html = html.replace('</head>', `${jsonld(service)}\n${jsonld(schemaFaq)}\n<link rel="stylesheet" href="/cctv.css?v=20261024">\n</head>`);
  await mkdir(`public/${prefix}${cctvRoute}`, { recursive: true });
  await writeFile(`public/${prefix}${cctvRoute}index.html`, html);

  // Discoverable from the homepage catalogue and neighbouring service pages;
  // source generators may replace these blocks, so add them idempotently here.
  for (const route of ['', 'naprawa-sieci/', 'naprawa-wifi/', 'montaz-sieci/']) {
    const path = `public/${prefix}${route}index.html`;
    let page = await readFile(path, 'utf8');
    page = page.replace(/\s*<a\b[^>]*data-cctv-link[^>]*>[\s\S]*?<\/a>/g, '');
    const link = `<a class="${route ? 'info-link' : 'cctv-catalog-link'}" data-cctv-link href="/${prefix}${cctvRoute}">${esc(c.nav)}: ${esc(c.accent)} <span aria-hidden="true">→</span></a>`;
    page = route ? page.replace(/(<div class="info-box-links">)/, `$1\n${link}`)
      : page.replace(/(<p class="home-secondary-scope">[\s\S]*?)(<\/p>)/, `$1 ${link}$2`);
    await writeFile(path, page);
  }
}

// One canonical page per language covers repair, setup and installation.
const sitemapPath = 'public/sitemap.xml';
let sitemap = await readFile(sitemapPath, 'utf8');
sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/naserwis\.pl\/(?:ru\/|uk\/|en\/)?serwis-monitoringu\/<\/loc>[\s\S]*?<\/url>/g, '');
const languages = ['pl', 'ru', 'uk', 'en'];
const pageUrl = locale => `https://naserwis.pl/${locale === 'pl' ? '' : `${locale}/`}${cctvRoute}`;
const entries = languages.map(locale => `  <url>\n    <loc>${pageUrl(locale)}</loc>\n${languages.map(lang => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${pageUrl(lang)}"/>`).join('\n')}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('pl')}"/>\n    <lastmod>2026-10-24</lastmod>\n  </url>`).join('\n');
sitemap = sitemap.replace('</urlset>', `${entries}\n</urlset>`);
await writeFile(sitemapPath, sitemap);
console.log('Combined CCTV service: four locales, related links and sitemap generated.');
