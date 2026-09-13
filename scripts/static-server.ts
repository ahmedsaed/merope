/**
 * Minimal static server for the exported site.
 *
 * Exists so the screenshot harness and the e2e suite both exercise the real
 * `out/` directory, resolved the way a static host resolves it, rather than a
 * dev server that behaves differently from production.
 */
import { createServer, type Server } from 'node:http';
import { createReadStream, existsSync, readdirSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

export const OUT_DIR = join(process.cwd(), 'out');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

/** Mirrors how a static host resolves a clean URL: /x -> x.html -> x/index.html */
function resolveFile(urlPath: string): string | null {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const candidates = [
    join(OUT_DIR, clean),
    join(OUT_DIR, `${clean}.html`),
    join(OUT_DIR, clean, 'index.html'),
  ];
  for (const candidate of candidates) {
    // Guard against traversal out of the export directory.
    if (!candidate.startsWith(OUT_DIR)) continue;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export function startStaticServer(port = 0): Promise<{ server: Server; origin: string }> {
  if (!existsSync(OUT_DIR)) {
    throw new Error('No `out/` directory. Run `pnpm build` first.');
  }

  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const file = resolveFile(req.url ?? '/');
      if (!file) {
        const notFound = join(OUT_DIR, '404.html');
        res.writeHead(404, { 'content-type': MIME['.html'] });
        if (existsSync(notFound)) {
          createReadStream(notFound).pipe(res);
          return;
        }
        res.end('404');
        return;
      }
      res.writeHead(200, {
        'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      });
      createReadStream(file).pipe(res);
    });

    server.listen(port, '127.0.0.1', () => {
      const address = server.address();
      const resolved = typeof address === 'object' && address ? address.port : port;
      resolve({ server, origin: `http://127.0.0.1:${resolved}` });
    });
  });
}

/**
 * Locate a usable Chromium.
 *
 * Sandboxes and CI images often ship a Chromium whose build number does not
 * match the one @playwright/test pins, and downloading a second copy is slow
 * and sometimes blocked outright. Prefer what is already on the machine, and
 * fall back to Playwright's own resolution.
 */
export function findChromium(): string | undefined {
  const explicit = process.env.MEROPE_CHROMIUM;
  if (explicit && existsSync(explicit)) return explicit;

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!root || !existsSync(root)) return undefined;

  const candidates = readdirSync(root)
    .filter((entry) => entry.startsWith('chromium-'))
    .sort()
    .reverse()
    .map((entry) => join(root, entry, 'chrome-linux', 'chrome'));

  return candidates.find((candidate) => existsSync(candidate));
}
