const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

export function onRequestGet({ request }) {
  const cf = request.cf ?? {};
  const ip = request.headers.get('CF-Connecting-IP') ?? null;
  return Response.json(
    {
      ip,
      ipVersion: ip ? (ip.includes(':') ? 'IPv6' : 'IPv4') : null,
      provider: cf.asOrganization ?? null,
      asn: cf.asn ?? null,
      city: cf.city ?? null,
      region: cf.region ?? null,
      country: cf.country ?? null,
      edge: cf.colo ?? null,
      tls: cf.tlsVersion ?? null,
    },
    { headers },
  );
}
