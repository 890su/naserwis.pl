// Targeted technical fixes; content, prices, canonical URLs and hreflang stay in source HTML.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { transform } from 'esbuild';
import sharp from 'sharp';
import { assetManifest, expandAssetBundles } from './site-assets.mjs';
import './apply-header-navigation.mjs';

const previousManifest = await assetManifest();
const manifest = {};
const output = 'public/assets';
await mkdir(output, { recursive: true });
const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 16);
const systemFont = 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
const skipText = { pl: 'Przejdź do treści', ru: 'Перейти к содержимому', uk: 'Перейти до вмісту', en: 'Skip to content' };
// Render the existing runtime notice before first paint, so forms do not grow after JS loads.
const privacyNotice = {
  pl: 'Dane służą do odpowiedzi na zapytanie. Administrator: Ihar Shestsiuk.',
  ru: 'Данные нужны для ответа на запрос. Администратор: Ihar Shestsiuk.',
  uk: 'Дані потрібні для відповіді на запит. Адміністратор: Ihar Shestsiuk.',
  en: 'We use the data to answer your enquiry. Controller: Ihar Shestsiuk.'
};
const privacyLabel = { pl: 'Prywatność', ru: 'Конфиденциальность', uk: 'Конфіденційність', en: 'Privacy' };

// Rasterize the existing two-colour NaSerwis wordmark; no new brand symbol.
const wordmark = (width, height, fontSize) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fff"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="${fontSize}" font-weight="700" fill="#0a2540">Na<tspan fill="#00d4aa">Serwis</tspan></text></svg>`;
await sharp(Buffer.from(wordmark(1200, 630, 154))).png().toFile(`${output}/naserwis-social.png`);
await sharp(Buffer.from(wordmark(256, 256, 46))).png().toFile('public/favicon.png');
// A true ICO fallback also removes automatic /favicon.ico 404 requests.
const iconPng = await sharp(Buffer.from(wordmark(256, 256, 46))).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(iconPng.length, 14); ico.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([ico, iconPng]));

const overrides = `
/* Technical accessibility fixes; keep the established brand palette. */
.site-skip-link{position:fixed;left:16px;top:8px;z-index:20000;padding:12px 18px;background:#fff;color:#0a2540;border:2px solid #0a2540;border-radius:6px;transform:translateY(-150%)}
.site-skip-link:focus{transform:translateY(0)}
.footer-section h3{font-size:18px;margin-bottom:15px}
#services .price-value[role="cell"]{color:#087860}
#hero-form .form-privacy-notice,#final-form .form-privacy-notice,#quick-form .form-privacy-notice{color:#516572}
#consent-dialog .consent-policy-links a{display:inline-flex;align-items:center;min-height:24px;padding-block:6px}
#consent-dialog:not(.consent-overlay-settings) .consent-summary>p:first-child{color:#425b6c}
.nw-section-heading>p{color:#087a65}
.nw-explain .nw-kicker{color:#087860}
.nw-forecast-card time,.nw-forecast-card span{color:#536674}
`;
const sourceCache = new Map();
async function source(url) {
  const path = 'public' + url.split('?')[0];
  if (!sourceCache.has(path)) sourceCache.set(path, await readFile(path, 'utf8'));
  return sourceCache.get(path);
}
async function bundle(tags, type) {
  if (!tags.length) return '';
  const sources = tags.map(tag => tag.match(/(?:href|src)="([^"]+)"/)[1]);
  let code = (await Promise.all(sources.map(source))).join(type === 'js' ? '\n;\n' : '\n');
  if (type === 'css') {
    code = code.replace(/font-family\s*:[^;}]+/gi, `font-family:${systemFont}`)
      .replace(/(['"])(?:IBM Plex Sans|Poppins|Roboto)\1\s*,\s*sans-serif/g, systemFont)
      .replace(/#718096/gi, '#566575').replace(/#888\b/gi, '#666');
    code += overrides;
  }
  const compiled = await transform(code, { loader: type, minify: true, charset: 'utf8', target: ['chrome109', 'firefox115', 'safari16'], legalComments: 'none' });
  const url = `/assets/site-${digest(compiled.code)}.${type}`;
  await writeFile('public' + url, compiled.code);
  manifest[url] = { type, sources, tags };
  return type === 'css' ? `<link rel="stylesheet" href="${url}">` : `<script defer src="${url}"></script>`;
}

async function processDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) { if (entry.name !== 'assets') await processDirectory(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    let html = expandAssetBundles(await readFile(file, 'utf8'), previousManifest);
    html = html.replace(/\s*<link\b[^>]*href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g, '');
    html = html.replace(/\s*<script\b[^>]*src="https:\/\/www\.googletagmanager\.com\/gtag\/js[^>]*><\/script>/g, '');
    html = html.replace(/\s*<script>\s*gtag\('js',[\s\S]*?<\/script>/g, '');
    html = html.replace(/<!-- Consent Mode v2 must be initialised before Google tags\. -->/g, '<!-- Optional Google tags are loaded by consent.js after permission. -->');
    html = html.replace(/(<div class="(?:fab-container|legal-document-nav)")\s+(aria-label=)/g, '$1 role="group" $2');
    html = html.replace(/(<footer\b[\s\S]*?<\/footer>)/g, block => block.replace(/<h4\b/g, '<h3').replace(/<\/h4>/g, '</h3>'));
    html = html.replace(/<a([^>]*?) href="mailto:([^"<>]+)" itemprop="email"([^>]*)>/g, '<meta itemprop="email" content="$2"><a$1 href="mailto:$2"$3>');
    const locale = html.match(/<html[^>]*lang="([a-z]+)/)?.[1] || 'pl';
    html = html.replace(/(<form\b[^>]*>)([\s\S]*?)(<\/form>)/g, (form, start, body, end) => {
      if (!body.includes('name="phone"') || body.includes('class="form-privacy-notice"')) return form;
      const prefix = locale === 'pl' ? '' : '/' + locale;
      const notice = `<p class="form-privacy-notice">${privacyNotice[locale]} <a href="${prefix}/privacy">${privacyLabel[locale]}</a>.</p>`;
      const alert = body.match(/<[^>]+\brole="alert"[^>]*>/)?.[0];
      return start + (alert ? body.replace(alert, notice + alert) : body + notice) + end;
    });
    html = html.replace(/<main\b[^>]*id="(?:main-content|legal-main)"[^>]*>/g, tag => tag.includes('tabindex=') ? tag : tag.replace('>', ' tabindex="-1">'));
    if (!/href="#(?:main-content|legal-main)"/.test(html)) {
      if (html.includes('id="main-content"')) html = html.replace(/(<body\b[^>]*>)/, `$1\n<a class="site-skip-link" href="#main-content">${skipText[locale] || skipText.pl}</a>`);
    }
    const identity = file === 'public/index.html' || /^public\/(?:ru|uk|en)\/index\.html$/.test(file);
    html = html.replace(/(<script[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/g, (tag, start, json, end) => {
      const data = JSON.parse(json);
      function visit(item) {
        if (!item || typeof item !== 'object') return;
        if (item['@type'] === 'LocalBusiness') {
          delete item.inLanguage;
          item.image = 'https://naserwis.pl/assets/naserwis-social.png';
        }
        for (const value of Object.values(item)) if (Array.isArray(value)) value.forEach(visit); else visit(value);
      }
      visit(data);
      return start + '\n' + JSON.stringify(data, null, 2).replaceAll('<', '\\u003c') + '\n' + end;
    });
    if (identity && !html.includes('"@type": "WebSite"')) {
      const data = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': 'https://naserwis.pl/#website', url: 'https://naserwis.pl/', name: 'NaSerwis.pl', alternateName: 'NaSerwis', inLanguage: ['pl', 'ru', 'uk', 'en'] };
      html = html.replace('</head>', `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>\n</head>`);
    }
    if (!html.includes('rel="icon"')) html = html.replace('</head>', '<link rel="icon" type="image/png" sizes="256x256" href="/favicon.png">\n</head>');
    if (!html.includes('property="og:image"')) html = html.replace('</head>', '<meta property="og:image" content="https://naserwis.pl/assets/naserwis-social.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="NaSerwis">\n<meta name="twitter:image" content="https://naserwis.pl/assets/naserwis-social.png">\n<meta name="twitter:image:alt" content="NaSerwis">\n</head>');
    const styles = [...html.matchAll(/<link\b(?=[^>]*rel="stylesheet")(?=[^>]*href="\/)[^>]*>/g)].map(match => match[0]);
    const scripts = [...html.matchAll(/<script\b[^>]*src="\/(?!\/)[^"]+"[^>]*><\/script>/g)].map(match => match[0]);
    for (const tag of styles.concat(scripts)) html = html.replace(tag, '');
    // Stable dependency order regardless of whether the original template placed JS in head or body.
    const priority = ['/site-config.js', '/consent.js', '/script.js', '/contact-ui.js'];
    scripts.sort((a, b) => {
      const rank = tag => { const i = priority.findIndex(url => tag.includes(`"${url}`)); return i < 0 ? priority.length : i; };
      return rank(a) - rank(b);
    });
    const stylesheet = await bundle(styles, 'css');
    const javascript = await bundle(scripts, 'js');
    if (stylesheet) html = html.replace('</head>', stylesheet + '\n</head>');
    if (javascript) html = html.replace('</body>', javascript + '\n</body>');
    html = html.replace(/(<head>)([\s\S]*?)(<\/head>)/, (_, start, head, end) => start + head.replace(/^[ \t]+$/gm, '').replace(/\n[ \t]*\n(?:[ \t]*\n)+/g, '\n\n') + end);
    html = html.replace(/(?:\n[ \t]*)+(?=<script defer src="\/assets\/site-)/g, '\n');
    html = html.replace(/(?:\n[ \t]*)+(?=<\/body>)/g, '\n');
    await writeFile(file, html);
  }
}
await processDirectory('public');
await writeFile(`${output}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');

// Use recorded content commits, not this script's run time, for the stale commercial dates.
let sitemap = await readFile('public/sitemap.xml', 'utf8');
sitemap = sitemap.replace(/<url>([\s\S]*?)<\/url>/g, (tag, body) => {
  const url = body.match(/<loc>https:\/\/naserwis\.pl\/([^<]*)<\/loc>/)?.[1];
  if (url === undefined || !/^(?:(?:ru|uk|en)\/)?(?:(?:naprawa-wifi|naprawa-sieci|montaz-sieci)\/)?$/.test(url)) return tag;
  const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', `public/${url}index.html`], { encoding: 'utf8' }).trim();
  return date ? tag.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${date}</lastmod>`) : tag.replace(/\s*<lastmod>[^<]*<\/lastmod>/, '');
});
await writeFile('public/sitemap.xml', sitemap);
console.log('Technical SEO prepared: system fonts, one CSS and deferred JS bundle per page, consent-gated tags, accessible markup, schema, social assets and verified sitemap dates.');
