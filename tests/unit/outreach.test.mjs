import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const parseCsv = (text) => text.trim().split(/\r?\n/).map((line) => {
  const values = [];
  line.replace(/"((?:[^"]|"")*)"(?:,|$)/g, (_match, value) => values.push(value.replaceAll('""', '"')));
  return values;
});

test('non-Polish outreach pack contains only localized NaSerwis links', async () => {
  const pack = JSON.parse(await readFile(new URL('../../marketing/non-pl-pack.json', import.meta.url), 'utf8'));
  assert.equal(pack.campaign, 'non_pl_quick_2026_09');
  assert.equal(pack.links.length, 48);
  assert.equal(pack.posts.length, 27);
  assert.deepEqual([...new Set(pack.links.map((entry) => entry.language))].sort(), ['en', 'ru', 'uk']);

  for (const entry of pack.links) {
    const url = new URL(entry.url);
    assert.equal(url.hostname, 'naserwis.pl');
    assert.match(url.pathname, /^\/(en|ru|uk)\//);
    assert.equal(url.searchParams.get('utm_campaign'), pack.campaign);
    assert.equal(url.searchParams.get('utm_content'), `${entry.language}_${entry.destination}`);
  }
});

test('Google Ads import pack targets only the existing empty EN/UK shells', async () => {
  const files = [
    '../../ads/non-pl-core-ad-groups.csv',
    '../../ads/non-pl-core-keywords.csv',
    '../../ads/non-pl-core-responsive-search-ads.csv',
  ];
  for (const file of files) {
    const rows = parseCsv(await readFile(new URL(file, import.meta.url), 'utf8'));
    assert.ok(rows.length > 1, file);
    const campaignIndex = rows[0].indexOf('Campaign');
    assert.notEqual(campaignIndex, -1, file);
    assert.deepEqual([...new Set(rows.slice(1).map((row) => row[campaignIndex]))].sort(), ['SRCH-EN-A-CORE', 'SRCH-UK-A-CORE'], file);
  }

  const keywordRows = parseCsv(await readFile(new URL('../../ads/non-pl-core-keywords.csv', import.meta.url), 'utf8'));
  const keywordIndex = keywordRows[0].indexOf('Keyword');
  const importedKeywords = new Set(keywordRows.slice(1).map((row) => row[keywordIndex]));
  for (const rejectedKeyword of ['laptop repair warsaw', 'computer repair warsaw', 'slow computer repair']) {
    assert.equal(importedKeywords.has(rejectedKeyword), false, rejectedKeyword);
  }

  for (const language of ['en', 'uk']) {
    const lines = (await readFile(new URL(`../../ads/non-pl-core-negative-list-${language}.txt`, import.meta.url), 'utf8'))
      .trim()
      .split(/\r?\n/);
    assert.equal(lines.length, 14, language);
    assert.ok(lines.every((line) => line.startsWith('"') && line.endsWith('"')), language);
  }
});

test('outreach copy avoids unverifiable service promises', async () => {
  const pack = JSON.parse(await readFile(new URL('../../marketing/non-pl-pack.json', import.meta.url), 'utf8'));
  const forbidden = /24\s*\/\s*7|same[ -]?day|guarantee|гарант|гарантовано|сегодня|сьогодні/i;
  for (const entry of pack.posts) assert.doesNotMatch(entry.copy, forbidden, `${entry.language}/${entry.topic}/${entry.channel}`);
});
