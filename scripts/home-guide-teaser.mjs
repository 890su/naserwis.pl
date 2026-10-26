// A compact reading entry point on the homepage, using the existing articles.
const copy = {
  pl: { intro: 'Wi-Fi, okablowanie i kamery w praktyce.', all: 'Wszystkie artykuły', links: [['wifi', 'Wi-Fi', 'Jak poprawić zasięg Wi-Fi'], ['lan', 'LAN', 'Jak zaplanować kable i gniazda'], ['cctv', 'Kamery', 'Jak sprawdzać monitoring']] },
  ru: { intro: 'Практические советы по Wi-Fi, сети и камерам.', all: 'Все статьи', links: [['wifi', 'Wi-Fi', 'Как улучшить покрытие Wi-Fi'], ['lan', 'LAN', 'Как спланировать кабели и розетки'], ['cctv', 'Камеры', 'Как проверять видеонаблюдение']] },
  uk: { intro: 'Практичні поради щодо Wi-Fi, мережі й камер.', all: 'Усі статті', links: [['wifi', 'Wi-Fi', 'Як поліпшити покриття Wi-Fi'], ['lan', 'LAN', 'Як спланувати кабелі й розетки'], ['cctv', 'Камери', 'Як перевіряти відеоспостереження']] },
  en: { intro: 'Practical advice on Wi-Fi, cabling and cameras.', all: 'All articles', links: [['wifi', 'Wi-Fi', 'Improve your Wi-Fi coverage'], ['lan', 'LAN', 'Plan network cables and sockets'], ['cctv', 'CCTV', 'Check and maintain your cameras']] }
};
const arrow = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
export function homeGuideTeaser(locale, title, route, types = ['wifi', 'lan', 'cctv']) {
  const c = copy[locale];
  return `<section class="guides-teaser home-guides" aria-labelledby="home-guides-title"><div class="container home-guides-layout"><div class="home-guides-copy"><h2 id="home-guides-title">${title}</h2><p>${c.intro}</p><a class="home-guides-all" href="${route()}">${c.all}${arrow}</a></div><ul class="home-guides-list">${c.links.filter(([type]) => types.includes(type)).map(([type, topic, label]) => `<li><a href="${route(type)}"><span class="home-guide-topic">${topic}</span><span class="home-guide-title">${label}</span>${arrow}</a></li>`).join('')}</ul></div></section>`;
}
