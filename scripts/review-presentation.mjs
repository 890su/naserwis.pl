const star = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z"/></svg>';
const outOf = { pl: 'z 5', ru: 'из 5', uk: 'з 5', en: 'out of 5' };
const intro = { pl: 'Wybrane opinie z Google.', ru: 'Несколько отзывов из Google.', uk: 'Кілька відгуків із Google.', en: 'Selected reviews from Google.' };

export function reviewPresentation(html, locale) {
  return html.replace(/<p class="reviews-intro">[\s\S]*?<\/p>/g, `<p class="reviews-intro">${intro[locale]}</p>`)
    .replace(/\s*<p class="reviews-note">[\s\S]*?<\/p>/g, '')
    .replace(/<div class="review-stars"[^>]*>[\s\S]*?<\/div>/g, markup => {
    const rating = Number(markup.match(/aria-label="([1-5]) /)?.[1])
      || (markup.match(/&#11088;|⭐|<svg\b/g) || []).length;
    if (rating < 1 || rating > 5) throw Error('Missing review rating');
    return `<div class="review-stars" role="img" aria-label="${rating} ${outOf[locale]}">${star.repeat(rating)}</div>`;
  }).replace(/<span class="google-icon">[\s\S]*?<\/span>/g, `<span class="google-icon">${star}</span>`);
}
