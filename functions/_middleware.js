// Consolidate the public www alias inside the existing Pages application.
// _redirects cannot match a hostname and does not run in front of Functions.
export function onRequest({ request, next }) {
  const url = new URL(request.url);
  const www = url.hostname === 'www.naserwis.pl';
  const legacy = url.pathname.match(/^(\/(?:(?:ru|uk|en)\/)?)(index|montaz-sieci|naprawa-wifi|naprawa-sieci)\.php$/);
  if (!www && !legacy) return next();

  if (www) {
    url.protocol = 'https:';
    url.host = 'naserwis.pl';
  }
  // Keep the existing PHP migrations working when middleware handles the page.
  // Combine host and legacy-path normalization into one redirect.
  if (legacy) url.pathname = legacy[1] + (legacy[2] === 'index' ? '' : legacy[2] + '/');
  const status = ['GET', 'HEAD'].includes(request.method) ? 301 : 308;
  return Response.redirect(url.href, status);
}
