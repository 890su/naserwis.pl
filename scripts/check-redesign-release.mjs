// Read-only comparison against the reviewed pre-redesign Git revision.
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const base=process.argv[2] || 'c1be1767f9dd3d9a84bd7e755e6996f705f77b00';
if (!/^[a-f0-9]{7,40}$/.test(base)) throw Error('A concrete baseline commit is required');
const previous=file=>execFileSync('git',['show',`${base}:${file}`],{encoding:'utf8',maxBuffer:10*1024*1024}).replace(/\r\n/g,'\n');
const current=async file=>(await readFile(file,'utf8')).replace(/\r\n/g,'\n');
const seo=html=>({
 title:html.match(/<title>[\s\S]*?<\/title>/)?.[0],
 metadata:[...html.matchAll(/<meta\b[^>]*(?:name|property)="(?:description|robots|geo\.[^"]*|og:[^"]*|twitter:[^"]*)"[^>]*>/g)].map(m=>m[0]),
 canonical:html.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0],
 languages:[...html.matchAll(/<link\b[^>]*hreflang="[^"]+"[^>]*>/g)].map(m=>m[0]),
 h1:[...html.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/g)].map(m=>m[0]),
 schema:[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]))
});
async function pages(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;if(e.isDirectory())result.push(...await pages(p));else if(e.name.endsWith('.html'))result.push(p);}return result;}
const normalizeMarkup=html=>html.replace(/>\s+</g,'><').trim();
// Owner-approved copy changes after the baseline (16 Oct 2026: shorter homepage H1 in all four languages).
const approved={
 'public/index.html':[['Wi-Fi i sieci domowe w Warszawie<br><span class="accent-text">Pomoc z dojazdem do domu</span>','Wi-Fi i sieci w Warszawie<br><span class="accent-text">Montaż lub naprawa z dojazdem</span>']],
 'public/ru/index.html':[['Wi-Fi и домашние сети в Варшаве<br><span class="accent-text">Помощь с выездом на дом</span>','Wi-Fi и сети в Варшаве<br><span class="accent-text">Монтаж или ремонт с выездом</span>']],
 'public/uk/index.html':[['Wi-Fi та домашні мережі у Варшаві<br><span class="accent-text">Допомога з виїздом додому</span>','Wi-Fi та мережі у Варшаві<br><span class="accent-text">Монтаж або ремонт з виїздом</span>']],
 'public/en/index.html':[['Wi-Fi and home networks in Warsaw<br><span class="accent-text">Help at your home</span>','Wi-Fi and networks in Warsaw<br><span class="accent-text">Installation or repair on site</span>']]
};
let count=0;
for(const file of await pages('public')){
 let before=previous(file);const after=await current(file);
 for(const [from,to] of approved[file]||[]) { assert.ok(before.includes(from),'Approved change baseline missing: '+file); before=before.replace(from,to); }
 assert.deepEqual(seo(after),seo(before),'SEO changed: '+file);
 for(const match of before.matchAll(/<form\b[^>]*\bid="([^"]+)"/g)) assert.ok(after.includes(`id="${match[1]}"`),'Missing form: '+file+' '+match[1]);
 for(const match of before.matchAll(/<span class="district-tag">([\s\S]*?)<\/span>/g)) assert.ok(after.includes(match[0]),'Missing district: '+file+' '+match[1]);
 const review=before.match(/<section\b[^>]*class="[^"]*\breviews\b[^"]*"[^>]*>[\s\S]*?<\/section>/)?.[0];
 if(review) assert.ok(normalizeMarkup(after).includes(normalizeMarkup(review)),'Original reviews changed: '+file);
 count++;
}
for(const file of ['public/robots.txt','public/_redirects','public/sitemap.xml','public/site-config.js','public/script.js','public/contact-ui.js','public/consent.js','functions/api/contact.js','functions/api/weather.js','functions/api/network.js','functions/api/network-probe.js']) assert.equal(await current(file),previous(file),'Protected behavior/config changed: '+file);
console.log(`Redesign release guard: ${count} pages retain SEO/H1/schema/forms/reviews/districts; protected runtime, API, robots, redirects and sitemap match ${base.slice(0,7)}.`);
