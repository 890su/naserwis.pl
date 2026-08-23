import { access, readFile } from "node:fs/promises";

const pages = [
  "public/index.html",
  "public/montaz-sieci/index.html",
  "public/naprawa-wifi/index.html",
  "public/naprawa-sieci/index.html",
  "public/ru/index.html",
  "public/uk/index.html",
  "public/en/index.html",
  "public/privacy/index.html",
  "public/cookies/index.html",
  "public/ru/privacy/index.html",
  "public/ru/cookies/index.html",
  "public/uk/privacy/index.html",
  "public/uk/cookies/index.html",
  "public/en/privacy/index.html",
  "public/en/cookies/index.html",
  "public/consent.js",
  "public/legal.css",
  "public/script.js",
  "functions/api/contact.js"
];

for (const file of pages) await access(file);
const javascript = await readFile("public/script.js", "utf8");
if (javascript.includes("/send-email.php")) {
  throw new Error("The static client still calls the legacy PHP endpoint.");
}
for (const eventName of ["naserwis_lead_submit", "generate_lead", "naserwis_contact_click"]) {
  if (!javascript.includes(eventName)) throw new Error(`Missing measurement event: ${eventName}`);
}

const consent = await readFile("public/consent.js", "utf8");
for (const consentType of ["analytics_storage", "ad_storage", "ad_user_data", "ad_personalization"]) {
  if (!consent.includes(`${consentType}: 'denied'`)) {
    throw new Error(`Consent default is not denied for ${consentType}.`);
  }
}
for (const interfaceHook of ["consent-close", "consent-customise", "consent-reject", "consent-save"]) {
  if (!consent.includes(interfaceHook)) throw new Error(`Missing consent interface hook: ${interfaceHook}.`);
}

for (const language of ["", "ru/", "uk/", "en/"]) {
  for (const type of ["privacy", "cookies"]) {
    const file = `public/${language}${type}/index.html`;
    const html = await readFile(file, "utf8");
    for (const hook of ["legal.css", "legal-language", "legal-settings-button", "data-consent-settings"]) {
      if (!html.includes(hook)) throw new Error(`Missing legal interface hook ${hook} in ${file}.`);
    }
  }
}

const languages = ["", "ru/", "uk/", "en/"];
const services = ["", "montaz-sieci/", "naprawa-wifi/", "naprawa-sieci/"];
for (const language of languages) {
  for (const service of services) {
    const file = `public/${language}${service}index.html`;
    const html = await readFile(file, "utf8");
    const consentPosition = html.indexOf('/consent.js');
    const googlePosition = html.indexOf('googletagmanager.com/gtag/js');
    if (consentPosition < 0 || googlePosition < 0 || consentPosition > googlePosition) {
      throw new Error(`Consent must load before Google tags in ${file}.`);
    }
    if (html.includes('googletagmanager.com/ns.html') || html.includes('googletagmanager.com/gtm.js') || html.includes('packs/js/sdk.js')) {
      throw new Error(`A third-party loader bypasses consent in ${file}.`);
    }
    if (!html.includes('<meta name="robots" content="index, follow">')) {
      throw new Error(`SEO landing page is not explicitly indexable: ${file}.`);
    }
    if (!html.includes('<link rel="canonical" href="https://naserwis.pl/')) {
      throw new Error(`SEO landing page is missing its canonical URL: ${file}.`);
    }
  }
}
console.log("Static Pages files and form endpoint are ready.");
