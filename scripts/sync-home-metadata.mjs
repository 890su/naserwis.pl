// Synchronize approved search/share copy without rebuilding layouts or runtime.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { copy } from './home-service-copy.mjs';
const esc = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const routes = { home: '', wifi: 'naprawa-wifi/', repair: 'naprawa-sieci/', install: 'montaz-sieci/' };
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = await readFile(file, 'utf8');
    const lang = html.match(/<html[^>]*lang="([a-z]+)/)?.[1] || 'pl';
    const home = copy[lang]?.home;
    if (!home) continue;
    const prefix = lang === 'pl' ? '' : `${lang}/`;
    const type = Object.keys(routes).find(key => file === `public/${prefix}${routes[key]}index.html`);
    const page = type && copy[lang][type];
    if (page) {
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`)
        .replace(/<meta\s+(name|property)="(title|og:title|twitter:title)"\s+content="[^"]*">/g, (_, attr, key) => `<meta ${attr}="${key}" content="${esc(page.title)}">`)
        .replace(/<meta\s+(name|property)="(description|og:description|twitter:description)"\s+content="[^"]*">/g, (_, attr, key) => `<meta ${attr}="${key}" content="${esc(page.description)}">`);
      if (type !== 'home') {
        html = html.replace(/(<h1\b[^>]*>)[\s\S]*?(<\/h1>)/, `$1${esc(page.h1)}<br><span class="accent-text">${esc(page.accent)}</span>$2`);
      } else {
        const routerLabel = copy[lang].services[1][1];
        html = html.replace(/<a\b[^>]*data-service-choice="router-setup"[^>]*>[\s\S]*?<\/a>/g,
          link => link.replace(/(<h3>)[\s\S]*?(<\/h3>)/, `$1${esc(routerLabel)}$2`));
      }
    }
    html = html.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (all, start, json, end) => {
      const data = JSON.parse(json);
      const description = data['@type'] === 'LocalBusiness' ? home.description : data['@type'] === 'Service' && page ? page.description : null;
      if (!description || data.description === description) return all;
      data.description = description;
      return start + '\n' + JSON.stringify(data, null, 2).replaceAll('<', '\\u003c') + '\n' + end;
    });
    await writeFile(file, html);
  }
}
await walk('public');
