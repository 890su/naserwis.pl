import { readFile } from 'node:fs/promises';

export async function assetManifest() {
  try { return JSON.parse(await readFile('public/assets/manifest.json', 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
}

export function pageAssets(html, manifest) {
  return [...html.matchAll(/<(?:link|script)\b[^>]*(?:href|src)="([^"]+)"[^>]*>/g)]
    .flatMap(match => manifest[match[1]]?.sources || [match[1]]);
}

export function expandAssetBundles(html, manifest) {
  return html.replace(/<link\b[^>]*href="([^"]+)"[^>]*>|<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g,
    (tag, href, src) => manifest[href || src]?.tags.join('\n') || tag);
}
