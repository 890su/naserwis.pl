import { access, readFile } from "node:fs/promises";

const pages = [
  "public/index.html",
  "public/montaz-sieci/index.html",
  "public/naprawa-wifi/index.html",
  "public/naprawa-sieci/index.html",
  "public/ru/index.html",
  "public/uk/index.html",
  "public/en/index.html",
  "public/script.js",
  "functions/api/contact.js"
];

for (const file of pages) await access(file);
const javascript = await readFile("public/script.js", "utf8");
if (javascript.includes("/send-email.php")) {
  throw new Error("The static client still calls the legacy PHP endpoint.");
}
console.log("Static Pages files and form endpoint are ready.");
