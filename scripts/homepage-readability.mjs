// Keep detailed service/billing copy in the initial HTML, behind native disclosures.
// Only the homepage's presentation changes; metadata and service pages stay intact.
import { copy } from './home-service-copy.mjs';
import { businessLinks, businessServices } from './business-links.mjs';
import { homeHumanCopy } from './home-human-copy.mjs';
const labels = {
  pl: { prices: 'Orientacyjne ceny', priceNote: 'Kwotę potwierdzamy przed pracą.', terms: 'Warunki rozliczenia', private: 'Dla klientów prywatnych', business: 'Dla firm i organizacji', newTab: 'Usługi dla firm prowadzi ITBIZ.PL. Linki otwierają się w nowej karcie.', contact: 'Skontaktuj się z technikiem' },
  ru: { prices: 'Ориентировочные цены', priceNote: 'Стоимость согласуем до начала работ.', terms: 'Условия оплаты', private: 'Для частных клиентов', business: 'Для организаций', newTab: 'Компании обслуживает ITBIZ.PL. Ссылки откроются в новой вкладке.', contact: 'Свяжитесь с мастером' },
  uk: { prices: 'Орієнтовні ціни', priceNote: 'Вартість погоджуємо до початку робіт.', terms: 'Умови оплати', private: 'Для приватних клієнтів', business: 'Для організацій', newTab: 'Компанії обслуговує ITBIZ.PL. Посилання відкриються в новій вкладці.', contact: 'Зв’яжіться з майстром' },
  en: { prices: 'Indicative prices', priceNote: 'We agree the cost before work starts.', terms: 'Pricing conditions', private: 'For private customers', business: 'For businesses and organisations', newTab: 'ITBIZ.PL handles business services. Links open in a new tab.', contact: 'Contact a technician' }
};
const chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const external = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>';
const section = (html, name, block) => block(html, 'section', new RegExp(`<section\\b[^>]*class="[^"]*\\b${name}\\b[^"]*"`));

export function restoreHomepage(html, block) {
  if (html.includes('<section class="home-more"')) {
    const group = section(html, 'home-more', block);
    const c = copy[html.match(/<html[^>]*lang="([^"]+)"/)?.[1] || 'pl'];
    const original = ['home-service-catalog', 'problems', 'business-handoff', 'why-us'].map(name => {
      let content = section(group, name, block);
      if (name === 'home-service-catalog' && !content.includes('id="available-services-title"')) {
        content = content.replace('<div class="container">', `<div class="container"><h2 id="available-services-title" class="section-title">${c.catalog}</h2>`);
      }
      if (name === 'business-handoff' && content.includes('class="home-business-note"')) {
        content = content.replace(block(content, 'ul', /<ul class="home-business-links"/), '')
          .replace(/<p class="home-business-note">[\s\S]*?<\/p>/, `<h2 id="business-handoff-title">${c.businessTitle}</h2><p>${c.business}</p>`)
          .replace('<section class="packages business-handoff"', '<section class="packages business-handoff" aria-labelledby="business-handoff-title"');
      }
      return content;
    }).join('\n');
    html = html.replace(group, original);
  }
  if (html.includes('<section class="home-pricing preview-conditions"')) {
    const group = section(html, 'home-pricing', block);
    let billing = section(group, 'home-billing', block);
    // Reconstruct generator input from the single visible set of rates. The
    // published homepage contains only conditions inside the disclosure.
    if (!billing.includes('class="price-table"')) {
      const c = copy[html.match(/<html[^>]*lang="([^"]+)"/)?.[1] || 'pl'];
      const rows = [...group.matchAll(/<p class="preview-rate"><strong>([^<]+)<\/strong><span>([^<]+)<\/span><\/p>/g)];
      if (![2, 3].includes(rows.length)) throw Error('Cannot restore the homepage rates');
      const table = `<h2 id="services-title" class="section-title">${c.billing}</h2><div class="price-table" role="table" aria-label="${c.billing}"><div class="price-row header" role="row"><div class="price-service" role="columnheader">${c.rateLabel}</div><div class="price-value" role="columnheader">${c.amountLabel}</div></div>${rows.map(r => `<div class="price-row" role="row"><div class="price-service" role="cell">${r[2]}</div><div class="price-value" role="cell">${r[1]}</div></div>`).join('')}</div>`;
      billing = billing.replace('<div class="container">', '<div class="container">' + table);
      billing = billing.replace('<section class="services home-billing"', '<section class="services home-billing" aria-labelledby="services-title"');
    }
    if (!billing.includes('id="services"')) billing = billing.replace('<section class="services home-billing"', '<section class="services home-billing" id="services"');
    html = html.replace(group, billing);
  }
  return html;
}

export function simplifyHomepage(html, locale, block) {
  const t = labels[locale] || labels.pl;
  const c = copy[locale] || copy.pl;
  const editorial = homeHumanCopy[locale] || homeHumanCopy.pl;
  const billing = section(html, 'home-billing', block);
  const conditions = section(html, 'preview-conditions', block);
  const rates = [...conditions.matchAll(/<p class="preview-rate">[\s\S]*?<\/p>/g)].map(m => m[0]);
  if (rates.length !== 3) throw Error('Homepage needs the short-job, standard visit and additional-hour rates');
  const compactBilling = billing.replace(/\s+id="services"/, '').replace(/\s+aria-labelledby="services-title"/, '')
    .replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, '')
    .replace(block(billing, 'div', /<div class="price-table"/), '');
  const pricing = `<section class="home-pricing preview-conditions" id="services"><div class="container"><div class="home-section-header"><h2 class="home-section-heading">${t.prices}</h2><p>${t.priceNote}</p></div><div class="home-pricing-rates">${rates.join('')}</div><details class="home-disclosure home-pricing-details"><summary class="preview-conditions-link" data-pricing-toggle><span>${t.terms}</span>${chevron}</summary><div class="home-disclosure-body">${compactBilling}</div></details></div></section>`;
  html = html.replace(billing, '').replace(conditions, pricing);

  const catalogue = section(html, 'home-service-catalog', block);
  const compactCatalogue = catalogue.replace(/<h2\b[^>]*id="available-services-title"[^>]*>[\s\S]*?<\/h2>/, '')
    .replace(/(<p class="home-section-intro">)[\s\S]*?(<\/p>)/, `$1${editorial.intro}$2`);
  const problems = section(html, 'problems', block);
  const about = section(html, 'why-us', block);
  let benefitTitle = 0, benefitText = 0;
  const editedAbout = about.replace(/(<h3\b[^>]*>)[\s\S]*?(<\/h3>)/g, (_m, open, close) => open + editorial.benefits[benefitTitle++][0] + close)
    .replace(/(<p\b[^>]*>)[\s\S]*?(<\/p>)/g, (_m, open, close) => open + editorial.benefits[benefitText++][1] + close);
  if (benefitTitle !== 4 || benefitText !== 4) throw Error('Expected four homepage benefits');
  const process = section(html, 'how-we-work', block);
  let stepIndex = 0;
  const editedProcess = process.replace(/(<p\b[^>]*>)[\s\S]*?(<\/p>)/g, (_m, open, close) => open + editorial.steps[stepIndex++] + close);
  if (stepIndex !== 3) throw Error('Expected three visit steps');
  html = html.replace(process, editedProcess);
  const business = section(html, 'business-handoff', block);
  const businessList = `<ul class="home-business-links">${businessServices[locale].map(([title, slug]) => `<li><a href="${businessLinks[locale].url}${slug}/" target="_blank" rel="noopener"><span>${title}</span>${external}</a></li>`).join('')}</ul>`;
  // Keep the existing audience handoff in the generator model, with one clear
  // introduction and service destinations in its rendered disclosure.
  const compactBusiness = business.replace(/\s+aria-labelledby="business-handoff-title"/, '')
    .replace(/<h2\b[^>]*>[\s\S]*?<\/h2>/, '')
    .replace(/<p>[\s\S]*?<\/p>/, `<p class="home-business-note">${t.newTab}</p>${businessList}`);
  const more = `<section class="home-more" aria-labelledby="available-services-title"><div class="container"><h2 id="available-services-title" class="home-section-heading">${c.catalog}</h2><details class="home-disclosure home-services-details"><summary><span>${t.private}</span>${chevron}</summary><div class="home-disclosure-body">${compactCatalogue}${problems}${editedAbout}</div></details><details class="home-disclosure home-business-details"><summary><span>${t.business}</span>${chevron}</summary><div class="home-disclosure-body">${compactBusiness}</div></details></div></section>`;
  html = html.replace(catalogue, '<!-- HOME DETAILS -->').replace(problems, '').replace(about, '').replace(business, '').replace('<!-- HOME DETAILS -->', more);

  const contact = section(html, 'final-cta', block);
  const form = block(contact, 'div', /<div class="final-form"/);
  const intro = form.match(/<p class="contact-next-step">([\s\S]*?)<\/p>/)?.[1] || '';
  const updatedContact = contact.replace(block(contact, 'div', /<div class="container(?: home-contact-grid)?"/), `<div class="container home-contact-grid"><div class="home-contact-copy"><h2 id="contact-title">${t.contact}</h2><p>${intro}</p><a class="home-contact-phone" href="tel:+48453327678">+48 453 327 678</a></div>${form}</div>`);
  return html.replace(contact, updatedContact);
}
