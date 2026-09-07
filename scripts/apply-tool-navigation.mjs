import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const publicDir = new URL('../public/', import.meta.url).pathname.slice(1);
const tools = {
  pl: { route: '/pogoda-internet-warszawa/', label: 'Pogoda i test internetu', group: 'Narzędzia', teaser: 'Pogoda w Warszawie + Twój IP i lekki test internetu', action: 'Sprawdź teraz' },
  ru: { route: '/ru/pogoda-internet-varshava/', label: 'Погода и тест интернета', group: 'Инструменты', teaser: 'Погода в Варшаве + ваш IP и лёгкий тест интернета', action: 'Проверить' },
  uk: { route: '/uk/pohoda-internet-varshava/', label: 'Погода і тест інтернету', group: 'Інструменти', teaser: 'Погода у Варшаві + ваша IP-адреса і легкий тест інтернету', action: 'Перевірити' },
  en: { route: '/en/weather-internet-warsaw/', label: 'Weather and internet test', group: 'Tools', teaser: 'Warsaw weather + your IP and a light internet test', action: 'Check now' },
};

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name === 'index.html') files.push(path);
  }
  return files;
}

for (const file of await htmlFiles(publicDir)) {
  let html = await readFile(file, 'utf8');
  if (!html.includes('services-menu') || !html.includes('mobile-menu-overlay')) continue;
  const locale = html.match(/<html lang="([a-z]{2})/)?.[1] ?? 'pl';
  const t = tools[locale] ?? tools.pl;
  html = html.replace(/\s*<a class="lang-option tool-nav-option"[\s\S]*?<\/a>/, '');
  html = html.replace(/(\s*<\/div>\s*<\/div>\s*\n\s*<a href="tel:[^"]+" class="phone")/, `\n                        <a class="lang-option tool-nav-option" role="menuitem" href="${t.route}"><span class="lang-flag" aria-hidden="true">⌁</span><span class="lang-name">${t.label}</span></a>$1`);
  html = html.replace(/\s*<a href="[^"]+" class="mobile-nav-link tool-nav-link">[\s\S]*?<\/a>/, '');
  html = html.replace(/(\s*<\/div>\s*<div class="mobile-nav-block">\s*<span class="mobile-nav-label">)/, `\n            <a href="${t.route}" class="mobile-nav-link tool-nav-link"><span class="mobile-nav-icon" aria-hidden="true">⌁</span>${t.label}</a>$1`);
  await writeFile(file, html);
}

for (const [locale, t] of Object.entries(tools)) {
  const path = join(publicDir, locale === 'pl' ? 'index.html' : `${locale}/index.html`);
  let html = await readFile(path, 'utf8');
  html = html.replace(/\s*<!-- NETWORK TOOL TEASER START -->[\s\S]*?<!-- NETWORK TOOL TEASER END -->/, '');
  const teaser = `\n    <!-- NETWORK TOOL TEASER START -->\n    <section class="network-tool-teaser"><div class="container"><div><span>${t.group}</span><h2>${t.teaser}</h2></div><a class="btn btn-primary" href="${t.route}">${t.action} →</a></div></section>\n    <!-- NETWORK TOOL TEASER END -->`;
  html = html.replace('</main>', `${teaser}\n</main>`);
  await writeFile(path, html);
}

console.log('Tool navigation and homepage teasers updated.');
