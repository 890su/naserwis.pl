import { readdir, readFile, writeFile } from 'node:fs/promises';

export function guideNavigation(html, locale, label) {
  const href = `${locale === 'pl' ? '/' : `/${locale}/`}poradnik/`;
  const current = /<body class="guide-page"/.test(html) ? ' aria-current="page"' : '';
  html = html.replace(/\s*<div class="mobile-nav-block">\s*<a\b[^>]*class="mobile-nav-link guides-nav-link"[^>]*>[\s\S]*?<\/a>\s*<\/div>/g, '');
  html = html.replace(/\s*<a\b[^>]*class="[^"]*\bguides-nav-(?:option|link)\b[^"]*"[^>]*>[\s\S]*?<\/a>/g, '');
  // A peer of Usługi, outside its dropdown.
  html = html.replace(/(<div class="lang-menu services-menu"[^>]*>[\s\S]*?<\/div>\s*<\/div>)/,
    `$1\n                <a class="guides-nav-link" href="${href}"${current}>${label}</a>`);
  html = html.replace(/(<div class="mobile-menu-overlay"[^>]*>[\s\S]*?<\/div>)/,
    `$1\n        <div class="mobile-nav-block"><a class="mobile-nav-link guides-nav-link" href="${href}"${current}>${label}</a></div>`);
  return html;
}

export async function syncGuideNavigation(copies, directory, version) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await syncGuideNavigation(copies, path, version);
    else if (entry.name === 'index.html') {
      const html = await readFile(path, 'utf8');
      if (!html.includes('services-menu')) continue;
      const locale = html.match(/<html lang="([a-z]{2})/)?.[1] || 'pl';
      const updated = guideNavigation(html, locale, copies[locale].label)
        .replace(/\/(custom\.css|script\.js)\?v=[^"\s]+/g, `/$1?v=${version}`);
      await writeFile(path, updated);
    }
  }
}

export async function siteChrome(locale, type, routes, legalLabels) {
  const prefix = locale === 'pl' ? '/' : `/${locale}/`;
  const home = await readFile(`public${prefix}index.html`, 'utf8');
  let header = home.match(/<header id="header"[\s\S]*?(?=<main id="main-content">)/)?.[0];
  let footer = home.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  if (!header || !footer) throw new Error(`Missing shared site chrome for ${locale}`);
  // Preserve the article and reading level when changing language.
  header = header.replace(/href="[^"]*"( data-lang="([a-z]{2})")/g,
    (_, attrs, language) => `href="${routes(language, type)}" data-guide-language${attrs}`);
  header = header.replace(/href="[^"]*"( class="mobile-lang-btn[^"]*" hreflang="([a-z]{2})")/g,
    (_, attrs, language) => `href="${routes(language, type)}" data-guide-language${attrs}`);
  header = header.replace(/(class="guides-nav-link" href="[^"]*")/g, '$1 aria-current="page"');
  header = header.replace(/(class="mobile-nav-link guides-nav-link" href="[^"]*")/g, '$1 aria-current="page"');
  footer = footer.replace(/href="[^"]*" hreflang="([a-z]{2})"/g,
    (_, language) => `href="${routes(language, type)}" data-guide-language hreflang="${language}"`);
  footer = footer.replace(/(<div class="footer-bottom">\s*<p>[\s\S]*?<\/p>)/,
    `$1\n<div class="footer-legal-links"><a href="${prefix}privacy/">${legalLabels[0]}</a><a href="${prefix}cookies/">${legalLabels[1]}</a><button type="button" data-consent-settings>${legalLabels[2]}</button></div>`);
  return { header: header.replace(/[\t ]+$/gm, ''), footer: footer.replace(/[\t ]+$/gm, '') };
}
