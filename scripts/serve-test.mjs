// Local static QA only. It never reads deployment secrets or sends real leads.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { onRequestGet as weather } from '../functions/api/weather.js';
import { onRequestGet as network } from '../functions/api/network.js';
const performanceMode = process.env.QA_PERFORMANCE === '1';
let cachedWeather;
let weatherExpires = 0;
const root = resolve('public');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.xml': 'application/xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (performanceMode && request.method === 'GET' && ['/api/weather', '/api/network'].includes(pathname)) {
    let result;
    if (pathname === '/api/weather') {
      if (!cachedWeather || Date.now() > weatherExpires) { cachedWeather = await weather(); weatherExpires = Date.now() + (cachedWeather.ok ? 300_000 : 10_000); }
      result = cachedWeather.clone();
    } else result = network({ request: new Request('http://localhost' + pathname) });
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(Buffer.from(await result.arrayBuffer())); return;
  }
  if (pathname.startsWith('/api/')) { response.writeHead(503, { 'Content-Type': 'application/json' }); response.end('{"success":false,"message":"Local QA: no delivery"}'); return; }
  const path = resolve(root, '.' + decodeURIComponent(pathname), extname(pathname) ? '' : 'index.html');
  if (!path.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
  try {
    let body = await readFile(path);
    const headers = { 'Content-Type': types[extname(path)] || 'text/plain', 'Cache-Control': performanceMode && pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-store' };
    if (performanceMode) {
      Object.assign(headers, { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
      if (/\.(?:html|css|js|xml|json)$/.test(path)) {
        const encoding = request.headers['accept-encoding'] || '';
        if (encoding.includes('br')) { body = brotliCompressSync(body); headers['Content-Encoding'] = 'br'; }
        else if (encoding.includes('gzip')) { body = gzipSync(body); headers['Content-Encoding'] = 'gzip'; }
        headers.Vary = 'Accept-Encoding';
      }
    }
    response.writeHead(200, headers);
    response.end(body);
  }
  catch { response.writeHead(404); response.end(); }
}).listen(Number(process.env.PORT || 8846), '127.0.0.1', () => console.log(`QA server: http://127.0.0.1:${process.env.PORT || 8846}`));
