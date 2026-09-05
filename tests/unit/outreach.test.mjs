import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

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

test('outreach copy avoids unverifiable service promises', async () => {
  const pack = JSON.parse(await readFile(new URL('../../marketing/non-pl-pack.json', import.meta.url), 'utf8'));
  const forbidden = /24\s*\/\s*7|same[ -]?day|guarantee|гарант|гарантовано|сегодня|сьогодні/i;
  for (const entry of pack.posts) assert.doesNotMatch(entry.copy, forbidden, `${entry.language}/${entry.topic}/${entry.channel}`);
});
