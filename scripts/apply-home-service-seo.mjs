import { readFile, writeFile } from 'node:fs/promises';
import { copy } from './home-service-copy.mjs';

const routes = { home: '', wifi: 'naprawa-wifi/', repair: 'naprawa-sieci/', install: 'montaz-sieci/' };
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const schema = value => `<script type="application/ld+json">\n${JSON.stringify(value, null, 2)}\n    </script>`;
// Public existing Google profile checked on 2026-10-09. Visits remain by agreement.
const hours = [
  { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:00', closes: '20:00' },
  { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '18:00' },
  { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '09:00', closes: '16:00' },
];

// Sections contain nested intent sections. Stop at the matching closing tag,
// rather than a lazy regex that would leave stale cards or billing behind.
function replaceSection(html, className, replacement) {
  const start = html.search(new RegExp(`<section\\b[^>]*class="[^\"]*\\b${className}\\b[^\"]*"`));
  if (start < 0) throw new Error(`Missing section: ${className}`);
  const tags = /<\/?section\b[^>]*>/g;
  tags.lastIndex = start;
  let depth = 0;
  for (let tag; (tag = tags.exec(html));) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + replacement + html.slice(tags.lastIndex);
  }
  throw new Error(`Unclosed section: ${className}`);
}
function billing(c, sidebar = false) {
  const rows = [[c.visit, 250], [c.next, 150], [c.short, 200]];
  const prices = sidebar ? rows.map(([label, amount]) => `<div class="price-item"><span>${escape(label)}</span><strong>${c.prefix} ${amount} ${c.currency}</strong></div>`).join('\n') :
    `<div class="price-table" role="table" aria-label="${escape(c.billing)}"><div class="price-row header" role="row"><div class="price-service" role="columnheader">${c.rateLabel}</div><div class="price-value" role="columnheader">${c.amountLabel}</div></div>\n${rows.map(([label, amount]) => `<div class="price-row" role="row"><div class="price-service" role="cell">${escape(label)}</div><div class="price-value" role="cell">${c.prefix} ${amount} ${c.currency}</div></div>`).join('\n')}\n</div>`;
  return `${prices}\n<p class="billing-rule"><strong>${escape(c.noDouble)}</strong></p>\n<p class="billing-condition">${escape(c.shortNote)}</p>\n<p class="billing-project">${escape(c.project)}</p>\n<p class="price-disclaimer">${escape(c.disclaimer)}</p>`;
}
function handoff(c, locale, section = false) {
  const prefix = locale === 'pl' ? '' : `${locale}/`;
  const content = `<h${section ? '2' : '3'} id="business-handoff-title">${c.businessTitle}</h${section ? '2' : '3'}><p>${c.business}</p><a href="https://itbiz.pl/${prefix}uslugi/">${c.businessLink} <span aria-hidden="true">→</span></a>`;
  return section ? `<section class="packages business-handoff" aria-labelledby="business-handoff-title"><div class="container">${content}</div></section>` : `<aside class="business-handoff">${content}</aside>`;
}
function catalog(c, prefix) {
  return `<section class="comprehensive-support home-service-catalog" id="available-services" aria-labelledby="available-services-title"><div class="container">
<span class="home-scope">${c.scope}</span><h2 id="available-services-title" class="section-title">${c.catalog}</h2><p class="home-section-intro">${c.catalogIntro}</p>
<div class="home-services-grid">${c.services.map(([type, title, text]) => `<a class="home-service-link" href="/${prefix}${routes[type]}"><div><h3>${title}</h3><p>${text}</p></div><span aria-hidden="true">↗</span></a>`).join('\n')}</div>
<p class="home-secondary-scope">${c.secondary}</p></div></section>`;
}
function serviceContent(c, type, locale, prefix) {
  const s = c[type];
  return `<section class="service-content home-service-content"><div class="container"><div class="service-row"><div class="service-main">
<span class="home-scope">${c.scope}</span><h2>${s.heading}</h2><p>${s.explanation}</p>
<h3>${c.catalog}</h3><p class="home-section-intro">${c.catalogIntro}</p>
<ul class="service-features">${s.features.map(([title, text]) => `<li class="service-feature-item"><span class="service-feature-icon" aria-hidden="true">✓</span><div><strong>${title}</strong><br>${text}</div></li>`).join('\n')}</ul>
<div class="segment-cards">${s.scenarios.map(([title, text]) => `<div class="segment-card segment-dom"><h3>${title}</h3><p>${text}</p></div>`).join('\n')}</div>
<div class="info-box"><h3>${c.related}</h3><div class="info-box-links">${Object.keys(routes).filter(key => key !== 'home' && key !== type).map(key => `<a class="info-link" href="/${prefix}${routes[key]}">${c[key].h1} <span aria-hidden="true">→</span></a>`).join('\n')}</div><a class="home-catalog-back" href="/${prefix}#available-services">${c.catalog} <span aria-hidden="true">→</span></a></div>
<div class="home-prepare"><h3>${c.prepareTitle}</h3><p>${c.prepare}</p></div>${handoff(c, locale)}
</div><div class="service-sidebar home-billing"><h3>${c.billing}</h3><p class="price-header">${c.rateLabel}</p>${billing(c, true)}<a href="#contact" class="btn btn-primary btn-block">${c.request}</a></div></div></div></section>`;
}

let changed = 0;
for (const [locale, c] of Object.entries(copy)) {
  const prefix = locale === 'pl' ? '' : `${locale}/`;
  for (const [type, route] of Object.entries(routes)) {
    const file = `public/${prefix}${route}index.html`;
    const original = await readFile(file, 'utf8');
    const s = c[type];
    let html = original.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(s.title)}</title>`);
    html = html.replace(/<meta\s+(name|property)="(title|og:title|twitter:title)"\s+content="[^"]*">/g, (_m, attribute, name) => `<meta ${attribute}="${name}" content="${escape(s.title)}">`);
    html = html.replace(/<meta\s+(name|property)="(description|og:description|twitter:description)"\s+content="[^"]*">/g, (_m, attribute, name) => `<meta ${attribute}="${name}" content="${escape(s.description)}">`);
    // Google ignores meta keywords. Remove obsolete B2B keyword lists.
    html = html.replace(/^\s*<meta name="keywords"[^>]*>\r?\n/gm, '\n');
    html = html.replace(/<h1\b([^>]*)>[\s\S]*?<\/h1>/, `<h1$1>${s.h1}<br><span class="accent-text">${s.accent}</span></h1>`);
    html = html.replace(/<p class="hero-(?:large-)?subtitle"([^>]*)>[\s\S]*?<\/p>/, (_m, attrs) => `<p class="${type === 'home' ? 'hero-subtitle' : 'hero-large-subtitle'}"${attrs}>${s.intro}</p>`);
    html = html.replace(/(<div class="hero-cta-wrapper">\s*<a[^>]*>)[\s\S]*?(<\/a>)/, `$1${c.request}$2`);
    if (type === 'home') {
      let index = 0;
      html = html.replace(/(<span class="trust-label">)[\s\S]*?(<\/span>)/g, (_m, before, after) => `${before}${c.trust[index++]}${after}`);
      html = replaceSection(html, 'comprehensive-support', catalog(c, prefix));
      html = replaceSection(html, 'problems', `<section class="problems" aria-labelledby="problems-title"><div class="container"><h2 id="problems-title" class="section-title">${c.problemsTitle}</h2><div class="problems-grid">${c.problems.map(([key, title, text]) => `<article class="problem-card"><h3>${title}</h3><p>${text}</p><a href="/${prefix}${routes[key]}">${c[key].h1} <span aria-hidden="true">→</span></a></article>`).join('\n')}</div></div></section>`);
      html = replaceSection(html, 'services', `<section class="services home-billing" id="services" aria-labelledby="services-title"><div class="container"><h2 id="services-title" class="section-title">${c.billing}</h2>${billing(c)}<a class="home-catalog-back" href="#available-services">${c.catalog} <span aria-hidden="true">↑</span></a></div></section>`);
      html = replaceSection(html, 'packages', handoff(c, locale, true));
      // Relative dates in the static review excerpts became inaccurate. Keep
      // the genuine review text and source link, without inventing exact dates.
      html = html.replace(/<time\b[^>]*class="review-date"[^>]*>[\s\S]*?<\/time>/g, '');
    } else {
      html = replaceSection(html, 'service-content', serviceContent(c, type, locale, prefix));
      const questions = [...s.questions, [c.priceQuestion, `${c.noDouble} ${c.project} ${c.shortNote}`], [c.businessQuestion, c.business]];
      html = replaceSection(html, 'faq-section', `<section class="faq-section"><div class="container"><h2 class="faq-title">${c.faq}</h2><div class="faq-container">${questions.map(([q, a]) => `<details class="faq-item"><summary class="faq-question">${escape(q)}</summary><p class="faq-answer">${escape(a)}</p></details>`).join('\n')}</div></div></section>`);
    }
    html = html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, (block, json) => {
      const data = JSON.parse(json);
      if (data['@type'] === 'LocalBusiness') {
        delete data.priceRange; // Old arbitrary range contradicted agreed visit/project billing.
        data.name = 'NaSerwis.pl';
        data.description = c.home.description;
        data.openingHoursSpecification = hours;
        return schema(data);
      }
      if (data['@type'] === 'Service') {
        return schema({ '@context': 'https://schema.org', '@type': 'Service', name: s.h1, description: s.description, url: `https://naserwis.pl/${prefix}${route}`, inLanguage: locale, provider: { '@type': 'LocalBusiness', '@id': 'https://naserwis.pl', name: 'NaSerwis.pl' }, areaServed: data.areaServed,
          hasOfferCatalog: { '@type': 'OfferCatalog', name: c.catalog, itemListElement: s.features.map(([name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description } })) } });
      }
      if (data['@type'] === 'FAQPage') {
        const questions = [...s.questions, [c.priceQuestion, `${c.noDouble} ${c.project} ${c.shortNote}`], [c.businessQuestion, c.business]];
        return schema({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: questions.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) });
      }
      return block;
    });
    // Both navigation modes go directly to each established canonical URL.
    html = html.replace(/(window\.location\.href='\/(?:ru\/|uk\/|en\/)?(?:montaz-sieci|naprawa-sieci|naprawa-wifi))'/g, "$1/'");
    if (!html.includes('/home-services.css?')) html = html.replace('</head>', '    <link rel="stylesheet" href="/home-services.css?v=20261009-home1">\n</head>');
    html = html.replace(/[ \t]+$/gm, '');
    if (html !== original) { await writeFile(file, html); changed++; }
  }
}
// The existing tools also carry the same business identity and opening hours.
for (const [locale, route] of Object.entries({ pl: 'pogoda-internet-warszawa/', ru: 'ru/pogoda-internet-varshava/', uk: 'uk/pohoda-internet-varshava/', en: 'en/weather-internet-warsaw/' })) {
  const file = `public/${route}index.html`;
  let html = await readFile(file, 'utf8');
  html = html.replace(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g, (block, json) => {
    const data = JSON.parse(json);
    if (data['@type'] !== 'LocalBusiness') return block;
    delete data.priceRange;
    data.name = 'NaSerwis.pl';
    data.description = copy[locale].home.description;
    data.openingHoursSpecification = hours;
    return schema(data);
  });
  await writeFile(file, html);
}
// Keep the existing selectors, form intents and installation/repair proof blocks.
await import('./apply-intent-landings.mjs');
console.log(`Home scope, billing and SEO synchronized: ${changed} pages updated.`);
