import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'marketing');
const campaign = 'non_pl_quick_2026_09';

const locales = {
  ru: {
    prefix: '/ru',
    posts: {
      wifi: 'Пропадает Wi-Fi или не хватает покрытия в квартире или небольшом офисе? Диагностируем сеть, настраиваем роутеры и Mesh в Варшаве. Опишите проблему — согласуем следующий шаг.',
      network: 'Нужно установить или отремонтировать LAN, розетку RJ45 или кабельную сеть в Варшаве? Пришлите краткое описание задачи — объём и условия согласуем до работ.',
      general: 'Нужна IT-помощь с выездом в Варшаве? Помогаем с сетями, Wi-Fi, компьютерами и настройкой оборудования дома и в небольших офисах. Консультация на русском языке.',
    },
  },
  uk: {
    prefix: '/uk',
    posts: {
      wifi: 'Зникає Wi-Fi або не вистачає покриття у квартирі чи невеликому офісі? Діагностуємо мережу, налаштовуємо роутери та Mesh у Варшаві. Опишіть проблему — погодимо наступний крок.',
      network: 'Потрібно встановити або відремонтувати LAN, розетку RJ45 чи кабельну мережу у Варшаві? Надішліть короткий опис — обсяг і умови погодимо до робіт.',
      general: 'Потрібна IT-допомога з виїздом у Варшаві? Допомагаємо з мережами, Wi-Fi, комп’ютерами та налаштуванням обладнання вдома й у невеликих офісах. Консультація українською.',
    },
  },
  en: {
    prefix: '/en',
    posts: {
      wifi: 'Unstable Wi-Fi or poor coverage at home or in a small office? We diagnose networks and configure routers and Mesh systems in Warsaw. Describe the issue and we will agree the next step.',
      network: 'Need LAN, RJ45 or network cabling installed or repaired in Warsaw? Send a short description of the job. We agree the scope and terms before work starts.',
      general: 'Need on-site IT help in Warsaw? We support networks, Wi-Fi, computers and equipment setup for homes and small offices, with service available in English.',
    },
  },
};

const destinations = {
  general: '/',
  wifi: '/naprawa-wifi/',
  lan: '/montaz-sieci/',
  network: '/naprawa-sieci/',
};

const channels = {
  google_business_profile: 'organic',
  facebook: 'social',
  telegram: 'community',
  local_partner: 'referral',
};

const csv = (rows) => `${rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')}\r\n`;
const linkRows = [['Language', 'Destination', 'Channel', 'Tracked URL']];
const postRows = [['Language', 'Topic', 'Channel', 'Post copy', 'Tracked URL']];
const links = [];
const posts = [];

for (const [language, locale] of Object.entries(locales)) {
  for (const [destination, route] of Object.entries(destinations)) {
    for (const [source, medium] of Object.entries(channels)) {
      const url = new URL(`${locale.prefix}${route}`.replaceAll('//', '/'), 'https://naserwis.pl');
      url.searchParams.set('utm_source', source);
      url.searchParams.set('utm_medium', medium);
      url.searchParams.set('utm_campaign', campaign);
      url.searchParams.set('utm_content', `${language}_${destination}`);
      const entry = { language, destination, channel: source, url: url.href };
      links.push(entry);
      linkRows.push([language, destination, source, url.href]);
    }
  }

  for (const [topic, copy] of Object.entries(locale.posts)) {
    for (const channel of ['google_business_profile', 'facebook', 'telegram']) {
      const destination = topic === 'general' ? 'general' : topic;
      const link = links.find((entry) => entry.language === language && entry.destination === destination && entry.channel === channel);
      const entry = { language, topic, channel, copy, url: link.url };
      posts.push(entry);
      postRows.push([language, topic, channel, copy, link.url]);
    }
  }
}

const forbidden = /24\s*\/\s*7|same[ -]?day|guarantee|гарант|гарантовано|сегодня|сьогодні/i;
if (links.length !== 48) throw new Error(`Expected 48 tracked links, got ${links.length}`);
if (posts.length !== 27) throw new Error(`Expected 27 post variants, got ${posts.length}`);
for (const entry of links) {
  const url = new URL(entry.url);
  if (url.hostname !== 'naserwis.pl') throw new Error(`Unexpected host: ${entry.url}`);
  if (!/^\/(ru|uk|en)\//.test(url.pathname)) throw new Error(`Polish or unlocalized route: ${entry.url}`);
  if (url.searchParams.get('utm_campaign') !== campaign) throw new Error(`Missing campaign tag: ${entry.url}`);
}
for (const entry of posts) if (forbidden.test(entry.copy)) throw new Error(`Unverified promise in ${entry.language}/${entry.topic}`);

await mkdir(out, { recursive: true });
await writeFile(path.join(out, 'non-pl-links.csv'), csv(linkRows), 'utf8');
await writeFile(path.join(out, 'non-pl-posts.csv'), csv(postRows), 'utf8');
await writeFile(path.join(out, 'non-pl-pack.json'), `${JSON.stringify({ campaign, links, posts }, null, 2)}\n`, 'utf8');
console.log(`Generated ${links.length} NaSerwis RU/UK/EN links and ${posts.length} ready-to-publish post variants.`);
