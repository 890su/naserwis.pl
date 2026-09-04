// Local static QA only. It never reads deployment secrets or sends real leads.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('public');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.xml': 'application/xml' };
createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname.startsWith('/api/')) { response.writeHead(503, { 'Content-Type': 'application/json' }); response.end('{"success":false,"message":"Local QA: no delivery"}'); return; }
  const path = resolve(root, '.' + decodeURIComponent(pathname), extname(pathname) ? '' : 'index.html');
  if (!path.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
  try { response.writeHead(200, { 'Content-Type': types[extname(path)] || 'text/plain', 'Cache-Control': 'no-store' }); response.end(await readFile(path)); }
  catch { response.writeHead(404); response.end(); }
}).listen(8846, '127.0.0.1', () => console.log('QA server: http://127.0.0.1:8846'));
