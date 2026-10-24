import { readdir, readFile, writeFile } from 'node:fs/promises';
import { cctvCopy, cctvRoute } from './cctv-copy.mjs';
import { menuAudienceLabels, businessLinks, businessMenuServices } from './business-links.mjs';

const labels = {
  pl: ['Ceny', 'Poradnik', 'Kontakt'],
  ru: ['Цены', 'Статьи', 'Контакты'],
  uk: ['Ціни', 'Порадник', 'Контакти'],
  en: ['Prices', 'Guides', 'Contact'],
};
const escapeAttribute = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const externalIcon = '<svg class="mobile-external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>';

// Same stroke icons as the homepage service catalogue.
const servicePaths = {
  'serwis-monitoringu': '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-4v12l-6-4"/>',
  'montaz-sieci': '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
  'naprawa-wifi': '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><path d="M12 20h.01"/>',
  'naprawa-sieci': '<path d="m15 20 3-3h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2l3 3z"/><path d="M6 8v1"/><path d="M10 8v1"/><path d="M14 8v1"/><path d="M18 8v1"/>'
};
const serviceIcon = href => {
  const path = servicePaths[href.split('/').filter(Boolean).pop()];
  return path ? `<span class="mobile-nav-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg></span>` : '';
};

function balancedDiv(html, opening) {
  const start = html.indexOf(opening);
  if (start < 0) return null;
  const tokens = /<\/?div\b[^>]*>/gi;
  tokens.lastIndex = start;
  let depth = 0, token;
  while ((token = tokens.exec(html))) {
    depth += token[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(start, tokens.lastIndex);
  }
  throw new Error('Unclosed ' + opening);
}

async function update(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) { await update(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = await readFile(file, 'utf8');
    if (!html.includes('id="header"') || !html.includes('services-dropdown')) continue;
    const locale = html.match(/<html[^>]*lang="([a-z]{2})/)?.[1] || 'pl';
    const [prices, guides, contact] = labels[locale];
    const [privateServices, organisationServices] = menuAudienceLabels[locale];
    const prefix = locale === 'pl' ? '/' : `/${locale}/`;
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    const isHome = canonical === `https://naserwis.pl${prefix}`;
    const currentGuide = /<body[^>]*class="[^"]*guide-page/.test(html) || /\/(?:pogoda-internet-warszawa|pogoda-internet-varshava|pohoda-internet-varshava|weather-internet-warsaw)\/$/.test(canonical || '') ? ' aria-current="page"' : '';
    const isService = ['montaz-sieci/', 'naprawa-wifi/', 'naprawa-sieci/', cctvRoute].some(route => canonical === `https://naserwis.pl${prefix}${route}`);
    html = html.replace(/<header id="header"[\s\S]*?<\/header>/, header => {
      const oldBrand = balancedDiv(header, '<div class="site-brand">');
      const oldLogo = header.match(/<a\b[^>]*class="logo"[^>]*>[\s\S]*?<\/a>/)?.[0];
      if (!oldLogo) throw new Error(`Missing wordmark: ${file}`);
      const logo = oldLogo.replace(/<a\b[^>]*>/, tag => {
        tag = tag.replace(/ aria-(?:current|describedby)="[^"]*"/g, '');
        return isHome ? tag.replace('>', ' aria-current="page">') : tag;
      });
      header = header.replace(oldBrand || oldLogo, logo);
      let services = header.match(/<div class="lang-dropdown services-dropdown">[\s\S]*?<\/div>\s*<\/div>/)?.[0];
      const phone = header.match(/<a\b[^>]*class="phone"[\s\S]*?<\/a>/)?.[0];
      const language = header.match(/<div class="lang-dropdown" role="group"[\s\S]*?<\/div>\s*<\/div>/)?.[0];
      if (!services || !phone || !language) throw new Error(`Incomplete header: ${file}`);
      services = services.replace(/(<span class="lang-name services-label">)[^<]+/, `$1${privateServices}`);
      services = services.replace(/<button class="lang-option"[^>]*onclick="window\.location\.href='[^']*naprawa-sieci\/'"[\s\S]*?<\/button>/, button => button.replace(/(<span class="lang-name">)[^<]+/, `$1${cctvCopy[locale].lanNav}`));
      if (!services.includes(cctvRoute)) services = services.replace(/(<\/div>\s*<\/div>)$/, `<button class="lang-option" role="menuitem" onclick="window.location.href='${prefix}${cctvRoute}'"><span class="lang-name">${cctvCopy[locale].nav}</span></button>\n$1`);
      services = services.replace(/<button class="lang-current services-btn"[^>]*>/, tag => {
        tag = tag.replace(/ aria-current="[^"]*"/g, '');
        return isService ? tag.replace('>', ' aria-current="page">') : tag;
      });
      const business = `<div class="lang-dropdown business-dropdown">
                    <button class="lang-current services-btn" aria-haspopup="true" aria-expanded="false" aria-controls="business-menu">
                        <span class="lang-name services-label">${organisationServices}</span>
                        <span class="lang-arrow">&#9660;</span>
                    </button>
                    <div id="business-menu" class="lang-menu services-menu business-menu" role="menu" aria-hidden="true">
                        <p class="business-menu-label">ITBIZ.PL</p>
                        ${businessMenuServices[locale].map(([name, slug]) => `<a class="lang-option" role="menuitem" href="${businessLinks[locale].url}${slug}/" target="_blank" rel="noopener"><span class="lang-name">${name}</span>${externalIcon}</a>`).join('\n                        ')}
                    </div>
                </div>`;
      const navigation = `<div class="nav-center desktop-nav">
                ${services}
                ${business}
                <a class="header-nav-link" href="${prefix}#services">${prices}</a>
                <a class="guides-nav-link" href="${prefix}poradnik/"${currentGuide}>${guides}</a>
                <a class="header-nav-link" href="${prefix}#contact">${contact}</a>
            </div>
            <div class="nav-right desktop-nav">
                ${phone}
                ${language}
            </div>

            `;
      return header.replace(/<div class="(?:nav-center|nav-right) desktop-nav">[\s\S]*?(?=<!-- Mobile Actions -->)/, navigation);
    });
    // Keep languages in the mobile header and progressively disclose services.
    if (html.includes('id="mobile-menu-overlay"')) {
      const header = html.match(/<header id="header"[\s\S]*?<\/header>/)[0];
      const overlay = balancedDiv(html, '<div class="mobile-menu-overlay" id="mobile-menu-overlay">');
      const servicesLabel = header.match(/<span class="lang-name services-label">([^<]+)<\/span>/)?.[1];
      const serviceLinks = [...header.matchAll(/onclick="window\.location\.href='([^']+)'"[\s\S]*?<span class="lang-name">([^<]+)<\/span>/g)];
      const languages = balancedDiv(header, '<div class="mobile-lang-options"') || balancedDiv(overlay, '<div class="mobile-lang-options"');
      const languageLabel = { pl: 'Język', ru: 'Язык', uk: 'Мова', en: 'Language' }[locale];
      const phoneIcon = header.match(/<a\b[^>]*class="phone"[\s\S]*?(<svg[\s\S]*?<\/svg>)/)?.[1];
      const navLabel = header.match(/<nav\b[^>]*aria-label="([^"]+)"/)?.[1];
      if (!servicesLabel || serviceLinks.length !== 4 || !languages || !languageLabel || !phoneIcon) throw new Error(`Incomplete mobile menu: ${file}`);
      const headerLanguages = languages
        .replace(/<div class="mobile-lang-options"[^>]*>/, `<div class="mobile-lang-options" role="group" aria-label="${languageLabel}">`)
        .replace(/<a\b[^>]*>/g, tag => {
          tag = tag.replace(/ aria-current="[^"]*"/g, '');
          return /class="[^"]*\bactive\b/.test(tag) ? tag.replace('>', ' aria-current="page">') : tag;
        });
      const updatedHeader = header.replace(/(<div class="mobile-actions">)\s*(?:<a\b[^>]*class="btn-mobile-call"[\s\S]*?<\/a>|<div class="mobile-lang-options"[\s\S]*?<\/div>)/, `$1\n                ${headerLanguages}`);
      html = html.replace(header, updatedHeader);
      const current = href => canonical === `https://naserwis.pl${href}` ? ' aria-current="page"' : '';
      // Contact channels reuse the page's localized launcher: same links, labels and brand icons.
      const fabMenu = html.match(/<div class="fab-menu" id="contact-menu">[\s\S]*?<\/div>/)?.[0] || '';
      const channel = key => {
        const item = fabMenu.match(new RegExp(`<(a|button)\\b[^>]*class="fab fab-${key}"[^>]*>[\\s\\S]*?<\\/\\1>`))?.[0];
        if (!item) return '';
        const href = item.match(/href="([^"]+)"/)?.[1];
        const title = item.match(/<strong>([^<]+)<\/strong>/)?.[1];
        const svg = item.match(/<svg[\s\S]*?<\/svg>/)?.[0].replace(/\s+/g, ' ').replace(/\s+aria-hidden="[^"]*"/g, '').replace(/<svg\b/, '<svg aria-hidden="true"');
        if (!title || !svg) return '';
        const inner = `<span class="mobile-channel-icon mobile-channel-${key}">${svg}</span>`;
        const name = `aria-label="${escapeAttribute(title)}" title="${escapeAttribute(title)}"`;
        return href ? `<a class="mobile-nav-link mobile-channel" href="${href}" target="_blank" rel="noopener" ${name}>${inner}</a>`
          : `<button type="button" class="mobile-nav-link mobile-channel" data-contact-modal ${name}>${inner}</button>`;
      };
      const channelRows = ['whatsapp', 'telegram', 'form'].map(channel).join('\n            ');
      const menu = `<div class="mobile-menu-overlay" id="mobile-menu-overlay">
        <nav class="mobile-nav" aria-label="${navLabel}">
            <details class="mobile-nav-group mobile-private-services">
                <summary class="mobile-services-toggle"><span>${privateServices}</span>${chevron}</summary>
                <div class="mobile-service-links">
                ${serviceLinks.map(([, href, name]) => `<a class="mobile-nav-link mobile-nav-sub" href="${href}"${current(href)}>${serviceIcon(href)}${name.trim()}</a>`).join('\n                ')}
                </div>
            </details>
            <details class="mobile-nav-group mobile-business-services">
                <summary class="mobile-services-toggle"><span>${organisationServices}</span>${chevron}</summary>
                <div class="mobile-service-links mobile-business-links">
                    <p class="mobile-business-label">ITBIZ.PL</p>
                    ${businessMenuServices[locale].map(([name, slug]) => `<a class="mobile-nav-link mobile-nav-sub" href="${businessLinks[locale].url}${slug}/" target="_blank" rel="noopener"><span>${name}</span>${externalIcon}</a>`).join('\n                    ')}
                </div>
            </details>
            <a class="mobile-nav-link" href="${prefix}#services">${prices}</a>
            <a class="mobile-nav-link guides-nav-link" href="${prefix}poradnik/"${currentGuide}>${guides}</a>
            <a class="mobile-nav-link" href="${prefix}#contact">${contact}</a>
            <div class="mobile-nav-channels">
                ${channelRows}
            </div>
        </nav>
        <div class="mobile-nav-block mobile-nav-call">
            <a href="tel:+48453327678" class="btn btn-primary mobile-call-btn">${phoneIcon}<span>+48 453 327 678</span></a>
        </div>
    </div>`;
      html = html.replace(overlay, menu);
    }
    await writeFile(file, html);
  }
}

await update('public');
console.log('Shared headers: compact home/business menus on desktop and mobile; mobile header languages preserved.');
