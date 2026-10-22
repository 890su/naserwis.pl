// All documented generators restore source references before regenerating chrome.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { assetManifest, expandAssetBundles } from './site-assets.mjs';
import { restoreRedesignForms, restoreHomepageReadability } from './apply-redesign.mjs';
await restoreRedesignForms();
const manifest = await assetManifest();
async function restore(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await restore(path);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(path, 'utf8');
      await writeFile(path, restoreHomepageReadability(expandAssetBundles(html, manifest)));
    }
  }
}
await restore('public');
for (const script of process.argv.slice(2)) {
  if (!/^[a-z-]+\.mjs$/.test(script)) throw new Error('Invalid generator name');
  const result = spawnSync(process.execPath, [`scripts/${script}`], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
await import('./apply-technical-seo.mjs');
