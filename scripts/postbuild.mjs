#!/usr/bin/env node
/**
 * Post-processes the prerendered output in dist/ for GitHub Pages:
 *  - 404/index.html -> 404.html (GitHub Pages serves it for unknown URLs)
 *  - hero preload: point it at the AVIF files the <picture> actually uses, with type="image/avif"
 *  - removes index.csr.html (every route is prerendered)
 * No sitemap: the preview is kept out of search engines until the owner takes it live.
 */
import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist/site/browser');

await rename(path.join(dist, '404/index.html'), path.join(dist, '404.html'));
await rm(path.join(dist, '404'), { recursive: true });

let rewritten = 0;
for (const entry of await readdir(dist)) {
  if (!entry.endsWith('.html')) continue;
  const file = path.join(dist, entry);
  const html = await readFile(file, 'utf8');
  const next = html.replace(/<link\b[^>]*\bas="image"[^>]*\brel="preload"[^>]*>/g, (tag) => {
    if (!tag.includes('href="images/')) return tag;
    rewritten++;
    return tag.replace(/\.webp\b/g, '.avif').replace('<link ', '<link type="image/avif" ');
  });
  if (next !== html) await writeFile(file, next);
}

await rm(path.join(dist, 'index.csr.html'), { force: true });
console.log(`postbuild: 404.html, ${rewritten} AVIF preload(s)`);
