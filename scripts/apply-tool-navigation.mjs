import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
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
  html = html.replace(/\s*<a href="[^"]+" class="mobile-nav-link tool-nav-link">[\s\S]*?<\/a>/, '');
  html = html.replace(/\s*<!-- NETWORK TOOL TEASER START -->[\s\S]*?<!-- NETWORK TOOL TEASER END -->/g, '');
  // Keep the established tool URLs; discovery now belongs to the guide index.
  if (file === join(publicDir, locale === 'pl' ? 'poradnik/index.html' : `${locale}/poradnik/index.html`)) {
    html = html.replace(/\s*<!-- GUIDE TOOLS START -->[\s\S]*?<!-- GUIDE TOOLS END -->/g, '');
    const section = `\n<!-- GUIDE TOOLS START -->\n<section class="guide-tools" aria-labelledby="guide-tools-title"><span class="guide-topic">${t.group}</span><h2 id="guide-tools-title"><a href="${t.route}">${t.label}</a></h2><p>${t.teaser}</p><a class="btn btn-primary guide-action" href="${t.route}">${t.action} →</a></section>\n<!-- GUIDE TOOLS END -->\n`;
    html = html.replace('</main>', `${section}</main>`);
  }
  if (html.includes(`rel="canonical" href="https://naserwis.pl${t.route}"`)) {
    html = html.replace(/(class="mobile-nav-link guides-nav-link" href="[^"]*")(?: aria-current="page")?/g, '$1 aria-current="page"');
  }
  await writeFile(file, html);
}

console.log('Weather and internet tools moved from Services and homepage teasers to the four guide indexes.');
