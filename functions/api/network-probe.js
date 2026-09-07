const MAX_BYTES = 262_144;

export function onRequestGet({ request }) {
  const url = new URL(request.url);
  const requested = Number.parseInt(url.searchParams.get('bytes') ?? '1', 10);
  const size = Number.isFinite(requested)
    ? Math.max(1, Math.min(requested, MAX_BYTES))
    : 1;
  return new Response('0'.repeat(size), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(size),
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
