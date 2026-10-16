import { readdir, readFile, writeFile } from 'node:fs/promises';

const labels = {
  pl: ['Strona główna', 'Ceny', 'Poradnik', 'Kontakt'],
  ru: ['Главная', 'Цены', 'Статьи', 'Контакты'],
  uk: ['Головна', 'Ціни', 'Порадник', 'Контакти'],
  en: ['Home', 'Prices', 'Guides', 'Contact'],
};

// Same stroke icons as the homepage service catalogue.
const servicePaths = {
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
    const [home, prices, guides, contact] = labels[locale];
    const prefix = locale === 'pl' ? '/' : `/${locale}/`;
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)?.[1];
    const currentHome = canonical === `https://naserwis.pl${prefix}` ? ' aria-current="page"' : '';
    const currentGuide = /<body[^>]*class="[^"]*guide-page/.test(html) || /\/(?:pogoda-internet-warszawa|pogoda-internet-varshava|pohoda-internet-varshava|weather-internet-warsaw)\/$/.test(canonical || '') ? ' aria-current="page"' : '';
    const isService = ['montaz-sieci/', 'naprawa-wifi/', 'naprawa-sieci/'].some(route => canonical === `https://naserwis.pl${prefix}${route}`);
    html = html.replace(/<header id="header"[\s\S]*?<\/header>/, header => {
      let services = header.match(/<div class="lang-dropdown services-dropdown">[\s\S]*?<\/div>\s*<\/div>/)?.[0];
      const phone = header.match(/<a\b[^>]*class="phone"[\s\S]*?<\/a>/)?.[0];
      const language = header.match(/<div class="lang-dropdown" role="group"[\s\S]*?<\/div>\s*<\/div>/)?.[0];
      if (!services || !phone || !language) throw new Error(`Incomplete header: ${file}`);
      services = services.replace(/<button class="lang-current services-btn"[^>]*>/, tag => {
        tag = tag.replace(/ aria-current="[^"]*"/g, '');
        return isService ? tag.replace('>', ' aria-current="page">') : tag;
      });
      const navigation = `<div class="nav-center desktop-nav">
                <a class="header-nav-link" href="${prefix}"${currentHome}>${home}</a>
                ${services}
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
    // The burger menu mirrors the desktop navigation: same items, order and
    // active state, then language and a call button styled like other actions.
    if (html.includes('id="mobile-menu-overlay"')) {
      const header = html.match(/<header id="header"[\s\S]*?<\/header>/)[0];
      const overlay = balancedDiv(html, '<div class="mobile-menu-overlay" id="mobile-menu-overlay">');
      const servicesLabel = header.match(/<span class="lang-name services-label">([^<]+)<\/span>/)?.[1];
      const serviceLinks = [...header.matchAll(/onclick="window\.location\.href='([^']+)'"[\s\S]*?<span class="lang-name">([^<]+)<\/span>/g)];
      const languages = balancedDiv(overlay, '<div class="mobile-lang-options">');
      const languageLabel = overlay.match(/<span class="mobile-nav-label">([^<]+)<\/span>\s*<div class="mobile-lang-options">/)?.[1];
      const phoneIcon = header.match(/<a\b[^>]*class="phone"[\s\S]*?(<svg[\s\S]*?<\/svg>)/)?.[1];
      const navLabel = header.match(/<nav\b[^>]*aria-label="([^"]+)"/)?.[1];
      if (!servicesLabel || serviceLinks.length !== 3 || !languages || !languageLabel || !phoneIcon) throw new Error(`Incomplete mobile menu: ${file}`);
      const current = href => canonical === `https://naserwis.pl${href}` ? ' aria-current="page"' : '';
      // Contact channels reuse the page's localized launcher: same links, labels and brand icons.
      const fabMenu = html.match(/<div class="fab-menu" id="contact-menu">[\s\S]*?<\/div>/)?.[0] || '';
      const channel = key => {
        const item = fabMenu.match(new RegExp(`<(a|button)\\b[^>]*class="fab fab-${key}"[^>]*>[\\s\\S]*?<\\/\\1>`))?.[0];
        if (!item) return '';
        const href = item.match(/href="([^"]+)"/)?.[1];
        const title = item.match(/<strong>([^<]+)<\/strong>/)?.[1];
        const note = item.match(/<\/strong><span>([^<]+)<\/span>/)?.[1];
        const svg = item.match(/<svg[\s\S]*?<\/svg>/)?.[0].replace(/\s+/g, ' ').replace(/<svg\b/, '<svg aria-hidden="true"');
        if (!title || !svg) return '';
        const inner = `<span class="mobile-channel-icon mobile-channel-${key}">${svg}</span><span class="mobile-channel-text"><strong>${title}</strong>${note ? `<small>${note}</small>` : ''}</span>`;
        return href ? `<a class="mobile-nav-link mobile-channel" href="${href}" target="_blank" rel="noopener">${inner}</a>`
          : `<button type="button" class="mobile-nav-link mobile-channel" data-contact-modal>${inner}</button>`;
      };
      const channelRows = ['whatsapp', 'telegram', 'form'].map(channel).join('\n            ');
      const menu = `<div class="mobile-menu-overlay" id="mobile-menu-overlay">
        <nav class="mobile-nav" aria-label="${navLabel}">
            <a class="mobile-nav-link" href="${prefix}"${currentHome}>${home}</a>
            <div class="mobile-nav-group">
                <span class="mobile-nav-label">${servicesLabel}</span>
                ${serviceLinks.map(([, href, name]) => `<a class="mobile-nav-link mobile-nav-sub" href="${href}"${current(href)}>${serviceIcon(href)}${name.trim()}</a>`).join('\n                ')}
            </div>
            <a class="mobile-nav-link" href="${prefix}#services">${prices}</a>
            <a class="mobile-nav-link guides-nav-link" href="${prefix}poradnik/"${currentGuide}>${guides}</a>
            <a class="mobile-nav-link" href="${prefix}#contact">${contact}</a>
        </nav>
        <div class="mobile-nav-block mobile-nav-call">
            <span class="mobile-nav-label">${contact}</span>
            <a href="tel:+48453327678" class="btn btn-primary mobile-call-btn">${phoneIcon}<span>+48 453 327 678</span></a>
            ${channelRows}
        </div>
        <div class="mobile-nav-block mobile-nav-language">
            <span class="mobile-nav-label">${languageLabel}</span>
            ${languages}
        </div>
    </div>`;
      html = html.replace(overlay, menu);
    }
    await writeFile(file, html);
  }
}

await update('public');
console.log('Shared headers: centered Home / Services / Prices / Guides / Contact; phone and language on the right.');
