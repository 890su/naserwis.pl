import { copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Approved in the logo-design review on 31 October 2026: S and radio signal.
export const brandDirectory = '/assets/brand/20261031';
export const brandSocialPath = `${brandDirectory}/share.png`;
const logo = `<img class="brand-logo" src="${brandDirectory}/logo-symbol.svg" width="256" height="256" alt="" aria-hidden="true" decoding="async"><span class="brand-wordmark">Na<span>Serwis</span></span>`;
const icons = `<link rel="icon" href="${brandDirectory}/favicon.ico" sizes="any">
<link rel="icon" href="${brandDirectory}/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${brandDirectory}/apple-touch-icon.png">
<link rel="manifest" href="${brandDirectory}/site.webmanifest">`;

export async function applyBranding() {
  const rendered = await sharp(`public${brandDirectory}/logo-horizontal-light.svg`).resize(1040).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#ffffff' } })
    .composite([{ input: rendered, gravity: 'centre' }]).png().toFile(`public${brandSocialPath}`);
  await copyFile(`public${brandDirectory}/favicon.ico`, 'public/favicon.ico');
  await sharp(`public${brandDirectory}/logo-symbol.svg`).resize(256).png().toFile('public/favicon.png');

  async function update(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        if (entry.name !== 'assets') await update(path);
        continue;
      }
      if (!entry.name.endsWith('.html')) continue;
      let html = await readFile(path, 'utf8');
      html = html.replace(/<a\b([^>]*)>[\s\S]*?<\/a>/g, (anchor, attributes) => {
        const classes = attributes.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/) || [];
        return classes.includes('logo') ? `<a${attributes}>${logo}</a>` : anchor;
      });
      html = html.replace(/\s*<link\b[^>]*\brel="(?:icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>/g, '');
      html = html.replace('</head>', `${icons}\n</head>`);
      html = html.replaceAll('https://naserwis.pl/assets/naserwis-social.png', `https://naserwis.pl${brandSocialPath}`);
      await writeFile(path, html);
    }
  }
  await update('public');
}
