import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const snapshot = JSON.parse(await readFile(new URL('./google-reviews-2026-10-24.json', import.meta.url), 'utf8'));
const oldAuthors = ['Leszek Grzechnik', 'winky', 'Marcin', 'Amal Shavketov'];
const strings = {
  pl: ['Ocena bez komentarza', 'fragment', 'z 5'],
  ru: ['Оценка без текста', 'фрагмент', 'из 5'],
  uk: ['Оцінка без тексту', 'фрагмент', 'з 5'],
  en: ['Rating without a comment', 'excerpt', 'out of 5']
};
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const checkURL = value => {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'share.google');
  return escape(url.href);
};
assert.equal(new Set(snapshot.reviews.map(r => r.id)).size, snapshot.reviews.length);
assert.equal(new Set(snapshot.reviews.map(r => r.author)).size, snapshot.reviews.length);
function card(review, locale) {
  assert.ok(Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5);
  assert.ok(!oldAuthors.includes(review.author));
  const [noText, excerpt, outOf] = strings[locale];
  const content = review.text
    ? `<p class="review-text" lang="${review.language}">${escape(review.text)}</p>`
    : `<p class="review-rating-only">${noText}</p>`;
  return `<article class="review-card" data-google-review="${escape(review.id)}">
    <div class="review-header"><div class="review-avatar" aria-hidden="true">${escape([...review.author][0].toUpperCase())}</div><div class="review-info"><h3 class="review-author">${escape(review.author)}</h3><div class="review-stars" role="img" aria-label="${review.rating} ${outOf}">${'&#11088;'.repeat(review.rating)}</div></div></div>
    ${content}
    <p class="review-source"><a href="${checkURL(review.source || snapshot.listing)}" target="_blank" rel="noopener noreferrer">Google</a>${review.excerpt ? ` · ${excerpt}` : ''}</p>
  </article>`;
}

// Preserve the already-published cards and translations; use their original
// published language when a locale did not previously include that author.
const homes = new Map(), originals = new Map();
for (const locale of Object.keys(strings)) {
  const file = `public/${locale === 'pl' ? '' : locale + '/'}index.html`;
  const html = await readFile(file, 'utf8');
  const cards = new Map([...html.matchAll(/<article class="review-card"[^>]*>[\s\S]*?<\/article>/g)]
    .map(m => [m[0].match(/class="review-author">([^<]+)</)?.[1], m[0]])
    .filter(([author]) => oldAuthors.includes(author)));
  for (const [author, markup] of cards) if (!originals.has(author)) originals.set(author, markup);
  homes.set(locale, { file, html, cards });
}
for (const author of oldAuthors) assert.ok(originals.has(author), `Missing original review: ${author}`);
assert.equal(snapshot.reviews.length + oldAuthors.length, snapshot.googleReviewCount);
for (const [locale, { file, html, cards }] of homes) {
  const markup = [...snapshot.reviews.map(r => card(r, locale)), ...oldAuthors.map(author => cards.get(author) || originals.get(author))].join('\n');
  let replacements = 0;
  const updated = html.replace(/(<div class="reviews-track">)[\s\S]*?(<\/div>\s*<button class="slider-btn next")/g, (_, start, end) => { replacements++; return `${start}\n${markup}\n${end}`; });
  assert.equal(replacements, 1, `Exactly one review track required: ${file}`);
  await writeFile(file, updated);
}
console.log(`Google reviews: ${snapshot.reviews.length} newly imported entries plus ${oldAuthors.length} preserved authors in each homepage locale; original text, honest excerpts and rating-only labels.`);
