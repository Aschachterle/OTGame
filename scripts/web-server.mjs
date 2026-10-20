import { createReadStream, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const frontendRoot = resolve(projectRoot, 'frontend');
const spriteRoot = resolve(projectRoot, 'Sprite');
const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp']
]);

function resolveRequestPath(requestPath) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    return null;
  }
  const isSprite = decodedPath === '/Sprite' || decodedPath.startsWith('/Sprite/');
  const root = isSprite ? spriteRoot : frontendRoot;
  const relativePath = isSprite ? decodedPath.slice('/Sprite'.length) : decodedPath;
  const filePath = resolve(root, `.${relativePath || '/'}`);
  return filePath === root || filePath.startsWith(`${root}${sep}`) ? filePath : null;
}

const server = createServer((request, response) => {
  const requestPath = new URL(request.url || '/', 'http://localhost').pathname;

  if (request.method === 'POST' && requestPath === '/api/dev/save-sprite-masks') {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const jsFile = resolve(frontendRoot, 'src', 'custom-sprite-masks.js');
        const jsonFile = resolve(frontendRoot, 'src', 'custom-sprite-masks.json');
        const jsContent = `// Automatically saved custom frame masks from the Trail Scene Editor\nexport const CUSTOM_SPRITE_MASKS = ${JSON.stringify(parsed, null, 2)};\n`;
        const jsonContent = JSON.stringify(parsed, null, 2);
        writeFileSync(jsFile, jsContent, 'utf-8');
        writeFileSync(jsonFile, jsonContent, 'utf-8');
        response.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        response.end(JSON.stringify({ ok: true, count: Object.keys(parsed).length }));
      } catch (err) {
        response.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        response.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
      }
    });
    return;
  }

  if (request.method === 'POST' && requestPath === '/api/dev/save-sprite-overrides') {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const jsFile = resolve(frontendRoot, 'src', 'custom-sprite-overrides.js');
        const jsonFile = resolve(frontendRoot, 'src', 'custom-sprite-overrides.json');
        const jsContent = `// Automatically saved custom clothing and sprite overrides from the Trail Scene Editor\nexport const CUSTOM_SPRITE_OVERRIDES_DATA = ${JSON.stringify(parsed, null, 2)};\n`;
        const jsonContent = JSON.stringify(parsed, null, 2);
        writeFileSync(jsFile, jsContent, 'utf-8');
        writeFileSync(jsonFile, jsonContent, 'utf-8');
        response.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        response.end(JSON.stringify({ ok: true, count: Object.keys(parsed).length }));
      } catch (err) {
        response.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        response.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
      }
    });
    return;
  }

  if (request.method === 'POST' && requestPath === '/api/dev/save-custom-clothing') {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const jsFile = resolve(frontendRoot, 'src', 'custom-clothing.js');
        const jsonFile = resolve(frontendRoot, 'src', 'custom-clothing.json');
        const jsContent = `// Automatically saved custom clothing items and name overrides\nexport const CUSTOM_CLOTHING_DATA = ${JSON.stringify(parsed, null, 2)};\n`;
        const jsonContent = JSON.stringify(parsed, null, 2);
        writeFileSync(jsFile, jsContent, 'utf-8');
        writeFileSync(jsonFile, jsonContent, 'utf-8');
        response.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        response.end(JSON.stringify({ ok: true, count: Object.keys(parsed.items || {}).length }));
      } catch (err) {
        response.writeHead(500, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        response.end(JSON.stringify({ ok: false, error: String(err?.message || err) }));
      }
    });
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD, POST' }).end();
    return;
  }
  const filePath = resolveRequestPath(requestPath === '/' ? '/index.html' : requestPath);
  if (!filePath) {
    response.writeHead(400).end('Bad request');
    return;
  }
  let fileStat;
  try {
    fileStat = statSync(filePath);
    if (!fileStat.isFile()) throw new Error('Not a file');
  } catch {
    response.writeHead(404).end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Length': fileStat.size,
    'Content-Type': mimeTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  if (request.method === 'HEAD') response.end();
  else createReadStream(filePath).pipe(response);
});

const port = Number(process.env.PORT || 4173);
server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend preview listening on http://localhost:${port}`);
});
