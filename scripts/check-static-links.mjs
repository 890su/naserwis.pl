import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const children = await Promise.all(entries.map(async (entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith(".html") ? [file] : [];
  }));
  return children.flat();
}

const files = await htmlFiles("public");
const missing = new Set();
for (const file of files) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
    const asset = match[1].split("?")[0];
    if (!asset.startsWith("/") || asset.startsWith("//") || asset.startsWith("/api/") || asset === "/") continue;
    if (/\.(?:css|js|xml|txt|png|jpe?g|webp|svg|ico)$/i.test(asset) && !existsSync(join("public", asset))) missing.add(asset);
  }
}
if (missing.size) throw new Error(`Missing static references:\n${[...missing].join("\n")}`);
console.log(`Verified ${files.length} HTML pages: no missing local asset references.`);
