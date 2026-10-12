import { readdir, readFile, writeFile } from 'node:fs/promises';

const labels = {
  pl: ['Strona główna', 'Ceny', 'Poradnik', 'Kontakt'],
  ru: ['Главная', 'Цены', 'Статьи', 'Контакты'],
  uk: ['Головна', 'Ціни', 'Порадник', 'Контакти'],
  en: ['Home', 'Prices', 'Guides', 'Contact'],
};

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
    const currentGuide = /<body[^>]*class="[^"]*guide-page/.test(html) ? ' aria-current="page"' : '';
    html = html.replace(/<header id="header"[\s\S]*?<\/header>/, header => {
      const services = header.match(/<div class="lang-dropdown services-dropdown">[\s\S]*?<\/div>\s*<\/div>/)?.[0];
      const phone = header.match(/<a\b[^>]*class="phone"[\s\S]*?<\/a>/)?.[0];
      const language = header.match(/<div class="lang-dropdown" role="group"[\s\S]*?<\/div>\s*<\/div>/)?.[0];
      if (!services || !phone || !language) throw new Error(`Incomplete header: ${file}`);
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
    await writeFile(file, html);
  }
}

await update('public');
console.log('Shared headers: centered Home / Services / Prices / Guides / Contact; phone and language on the right.');
