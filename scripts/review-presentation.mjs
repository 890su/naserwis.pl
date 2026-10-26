const star = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z"/></svg>';
const outOf = { pl: 'z 5', ru: 'из 5', uk: 'з 5', en: 'out of 5' };

export function reviewPresentation(html, locale) {
  return html.replace(/<div class="review-stars"[^>]*>[\s\S]*?<\/div>/g, markup => {
    const rating = Number(markup.match(/aria-label="([1-5]) /)?.[1])
      || (markup.match(/&#11088;|⭐|<svg\b/g) || []).length;
    if (rating < 1 || rating > 5) throw Error('Missing review rating');
    return `<div class="review-stars" role="img" aria-label="${rating} ${outOf[locale]}">${star.repeat(rating)}</div>`;
  }).replace(/<span class="google-icon">[\s\S]*?<\/span>/g, `<span class="google-icon">${star}</span>`);
}
