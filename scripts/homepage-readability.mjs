// Legacy accordion input is accepted once; new pages render a concise visible flow.
import {copy} from './home-service-copy.mjs';
import {restoreCompactHome, simplifyCompactHome} from './compact-home.mjs';
const section = (html, name, block) => block(html, 'section', new RegExp(`<section\\b[^>]*class="[^"]*\\b${name}\\b[^"]*"`));

export function restoreHomepage(html, block) {
  if (html.includes('data-concise-home="20261027"')) return restoreCompactHome(html, block);
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


export const simplifyHomepage = simplifyCompactHome;
