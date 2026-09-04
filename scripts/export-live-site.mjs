import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// This importer predates the committed Pages/CRO source. Never overwrite the
// current site merely to deploy it. It is retained for explicit migration work.
if (!process.argv.includes('--allow-legacy-overwrite')) {
  throw new Error('Legacy importer disabled by default. Edit public/ directly; see README. Explicit migration only: --allow-legacy-overwrite.');
}

const site = "https://naserwis.pl";
const routes = [
  "/", "/montaz-sieci", "/naprawa-wifi", "/naprawa-sieci",
  "/ru/", "/ru/montaz-sieci", "/ru/naprawa-wifi", "/ru/naprawa-sieci",
  "/uk/", "/uk/montaz-sieci", "/uk/naprawa-wifi", "/uk/naprawa-sieci",
  "/en/", "/en/montaz-sieci", "/en/naprawa-wifi", "/en/naprawa-sieci"
];
const staticFiles = [
  "/styles.css", "/custom.css", "/script.js", "/robots.txt", "/sitemap.xml",
  "/og-image.jpg", "/logo.png", "/favicon-32x32.png", "/favicon-16x16.png", "/apple-touch-icon.png"
];

function outputPath(route) {
  if (route === "/") return join("public", "index.html");
  return join("public", route.replace(/^\//, ""), "index.html");
}

function makeStatic(html) {
  const decodeCfEmail = (encoded) => {
    const key = Number.parseInt(encoded.slice(0, 2), 16);
    let email = "";
    for (let index = 2; index < encoded.length; index += 2) {
      email += String.fromCharCode(Number.parseInt(encoded.slice(index, index + 2), 16) ^ key);
    }
    return email;
  };
  // A session-bound PHP CSRF token cannot be used in a static build. The Pages
  // Function validates Turnstile instead; see functions/api/contact.js.
  return html
    .replace("<head>", "<head>\n    <script src=\"/site-config.js\"></script>")
    // The source host injects Cloudflare Email Obfuscation at the edge. Decode
    // it in the export so Pages does not depend on that zone-level feature.
    .replace(/\/cdn-cgi\/l\/email-protection#([0-9a-f]+)/gi, (_, encoded) => `mailto:${decodeCfEmail(encoded)}`)
    .replace(/<span class=["']__cf_email__["'] data-cfemail=["']([0-9a-f]+)["']>.*?<\/span>/gi, (_, encoded) => decodeCfEmail(encoded))
    .replace(/\s*<script data-cfasync=["']false["'] src=["']\/cdn-cgi\/scripts\/[^"']+email-decode\.min\.js["']><\/script>/gi, "")
    .replace(/\s*<input\b[^>]*\bname=["']csrf_token["'][^>]*>/gi, "")
    // These five images are referenced by the PHP templates but do not exist
    // on the current host. Avoid shipping new 404s until branded assets exist.
    .replace(/\s*<meta property=["'](?:og|twitter):image["'][^>]*>/gi, "")
    .replace(/\s*<link rel=["'](?:icon|apple-touch-icon)["'][^>]*>/gi, "")
    .replace(/\s*"image": "https:\/\/naserwis\.pl\/logo\.png",?/gi, "")
    .replace(/[\t ]+(?=\r?\n)/g, "");
}

function makePagesClient(script) {
  const protection = `
    // Cloudflare Pages has no PHP sessions. This replaces the legacy CSRF
    // field with a honeypot and an optional, server-validated Turnstile token.
    function initBotProtection(form) {
        if (form.dataset.botProtectionReady) return;
        form.dataset.botProtectionReady = 'true';
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
        form.appendChild(honeypot);

        const siteKey = window.NASERWIS_CONFIG?.turnstileSiteKey;
        if (!siteKey || !window.turnstile) return;
        const container = document.createElement('div');
        container.className = 'turnstile-container';
        const submit = form.querySelector('button[type="submit"]');
        form.insertBefore(container, submit);
        const widgetId = window.turnstile.render(container, { sitekey: siteKey, action: 'contact' });
        form.dataset.turnstileWidget = String(widgetId);
    }

    function initAllBotProtection() {
        const forms = document.querySelectorAll('form');
        const siteKey = window.NASERWIS_CONFIG?.turnstileSiteKey;
        if (!siteKey) {
            forms.forEach(initBotProtection);
            return;
        }
        if (window.turnstile) {
            forms.forEach(initBotProtection);
            return;
        }
        if (document.querySelector('script[data-turnstile-loader]')) return;
        const loader = document.createElement('script');
        loader.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        loader.async = true;
        loader.defer = true;
        loader.dataset.turnstileLoader = 'true';
        loader.onload = () => forms.forEach(initBotProtection);
        document.head.appendChild(loader);
    }
`;
  let result = script
    .replaceAll("const emailHandlerPath = '/send-email.php';", "const emailHandlerPath = '/api/contact';")
    .replace("csrf_token: formData.get('csrf_token'),", "website: formData.get('website'),\n                turnstileToken: formData.get('cf-turnstile-response'),")
    .replace("formType: 'review',\n                    rating:", "formType: 'review',\n                    website: formData.get('website'),\n                    turnstileToken: formData.get('cf-turnstile-response'),\n                    rating:")
    .replace("    function initAll() {", protection + "\n    function initAll() {")
    .replace("        initFabToggle();", "        initFabToggle();\n        initAllBotProtection();");
  if (result === script || result.includes("/send-email.php")) throw new Error("Could not patch the client form endpoint.");
  return result;
}

async function download(path, binary = false) {
  const response = await fetch(new URL(path, site));
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return binary ? Buffer.from(await response.arrayBuffer()) : await response.text();
}

async function save(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, data);
}

for (const route of routes) {
  await save(outputPath(route), makeStatic(await download(route)));
  console.log(`Exported ${route}`);
}

for (const file of staticFiles) {
  const binary = /\.(?:jpg|png|webp|ico|woff2?)$/i.test(file);
  try {
    await save(join("public", file), await download(file, binary));
    console.log(`Downloaded ${file}`);
  } catch (error) {
    // The legacy site references a few optional social/icon images which are
    // not present on the source host. Do not fail a complete Pages export for
    // an already-missing optional asset.
    console.warn(`Skipped ${error.message}`);
  }
}

await writeFile("public/script.js", makePagesClient(await readFile("public/script.js", "utf8")));
