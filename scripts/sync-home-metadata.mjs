// Keep search/share summaries current without rebuilding visible page content.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { copy } from './home-service-copy.mjs';
const esc = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = await readFile(file, 'utf8');
    const lang = html.match(/<html[^>]*lang="([a-z]+)/)?.[1] || 'pl';
    const home = copy[lang]?.home;
    if (!home) continue;
    if (file === `public/${lang === 'pl' ? '' : lang + '/'}index.html`) {
      html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(home.title)}</title>`)
        .replace(/<meta\s+(name|property)="(title|og:title|twitter:title)"\s+content="[^"]*">/g, (_, attr, key) => `<meta ${attr}="${key}" content="${esc(home.title)}">`)
        .replace(/<meta\s+(name|property)="(description|og:description|twitter:description)"\s+content="[^"]*">/g, (_, attr, key) => `<meta ${attr}="${key}" content="${esc(home.description)}">`);
    }
    html = html.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (all, start, json, end) => {
      const data = JSON.parse(json);
      if (data['@type'] !== 'LocalBusiness' || !data.description) return all;
      data.description = home.description;
      return start + '\n' + JSON.stringify(data, null, 2).replaceAll('<', '\\u003c') + '\n' + end;
    });
    await writeFile(file, html);
  }
}
await walk('public');
