import { execFileSync } from 'node:child_process';
export const referenceCommit = '3abf07e1b830e3920a44f7e50a4fd4a963b56546';
const cache = new Map();
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.glb': 'model/gltf-binary',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};
export function referenceAsset(pathname) {
  const path =
    pathname === '/'
      ? 'public/thewatch.html'
      : 'public' + decodeURIComponent(pathname);
  if (!/^public\/[a-zA-Z0-9_./@-]+$/.test(path) || path.includes('..'))
    throw new Error('Invalid reference path');
  if (!cache.has(path))
    cache.set(
      path,
      execFileSync('git', ['show', `${referenceCommit}:${path}`], {
        maxBuffer: 100 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    );
  return {
    body: cache.get(path),
    contentType:
      types[path.slice(path.lastIndexOf('.'))] || 'application/octet-stream',
  };
}
