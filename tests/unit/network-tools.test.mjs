import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet as network } from '../../functions/api/network.js';
import { onRequestGet as probe } from '../../functions/api/network-probe.js';
import { onRequestGet as weather } from '../../functions/api/weather.js';

test('network diagnostic reflects edge data without cacheable storage', async () => {
  const request = new Request('https://naserwis.pl/api/network', {
    headers: { 'CF-Connecting-IP': '2001:db8::1' },
  });
  Object.defineProperty(request, 'cf', { value: { asn: 64500, asOrganization: 'Example ISP', city: 'Warsaw', country: 'PL', colo: 'WAW', tlsVersion: 'TLSv1.3' } });
  const response = network({ request });
  const data = await response.json();
  assert.equal(response.headers.get('Cache-Control'), 'no-store, max-age=0');
  assert.equal(data.ipVersion, 'IPv6');
  assert.equal(data.provider, 'Example ISP');
  assert.equal(data.edge, 'WAW');
});

test('network probe caps payload and disables caching', async () => {
  const response = probe({ request: new Request('https://naserwis.pl/api/network-probe?bytes=9999999') });
  assert.equal((await response.arrayBuffer()).byteLength, 262_144);
  assert.match(response.headers.get('Cache-Control'), /no-store/);
});

test('weather endpoint publishes a compact cached forecast with attribution', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (_url, init) => {
    assert.match(init.headers['User-Agent'], /NaSerwis\.pl/);
    return Response.json({ properties: { meta: { updated_at: '2026-09-06T12:00:00Z' }, timeseries: Array.from({ length: 25 }, (_, index) => ({ time: `2026-09-06T${String(index).padStart(2, '0')}:00:00Z`, data: { instant: { details: { air_temperature: 20, relative_humidity: 50, wind_speed: 2, air_pressure_at_sea_level: 1012 } }, next_1_hours: { details: { precipitation_amount: 0 }, summary: { symbol_code: 'clearsky_day' } } } })) } });
  };
  const response = await weather();
  const data = await response.json();
  assert.equal(data.forecast.length, 7);
  assert.equal(data.attribution.name, 'MET Norway');
  assert.match(response.headers.get('Cache-Control'), /s-maxage=900/);
});
