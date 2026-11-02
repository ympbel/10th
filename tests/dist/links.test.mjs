import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { load } from 'cheerio';
import { BASE, DIST, allHtmlFiles } from './helpers.mjs';

const isFile = (path) => existsSync(path) && statSync(path).isFile();

const resolved = new Map();
/** Whether a site path without the base (`/x/`, `/x`, `/images/a.png`, with any `?query` or `#fragment`) is served
 * from a file in `dist/`: `/x/` → `dist/x/index.html`, `/x` → `dist/x` or `dist/x/index.html`. Percent-encoding is
 * decoded and the path is NFC-normalized, the form Korean path segments are written to disk in. */
function resolves(url) {
  if (!resolved.has(url)) {
    let path = null;
    try {
      path = decodeURIComponent(url.replace(/[?#].*$/, '')).normalize('NFC');
    } catch {
      // Malformed percent-encoding: counted as a miss.
    }
    const file = path === null ? null : join(DIST, path);
    resolved.set(
      url,
      file !== null && (path.endsWith('/') ? isFile(join(file, 'index.html')) : isFile(file) || isFile(join(file, 'index.html'))),
    );
  }
  return resolved.get(url);
}

/** The site-root `a[href]` and `img[src]` URLs (starting with `/` but not `//`) in `html` that are broken: not under
 * `${BASE}/`, or not served from `dist/` once the base is removed (`dist/` is built without a base folder). A link
 * without the base is a miss even when its path exists in `dist/`: deployed, it points outside this site. */
function misses(html) {
  const $ = load(html);
  const found = [];
  $('a[href], img[src]').each((_, el) => {
    const url = $(el).attr(el.tagName === 'a' ? 'href' : 'src');
    if (!url.startsWith('/') || url.startsWith('//')) return;
    if (!url.startsWith(`${BASE}/`) || !resolves(url.slice(BASE.length))) found.push(url);
  });
  return found;
}

test(`every site-root a[href] and img[src] starts with ${BASE}/ and resolves to a file in dist/`, () => {
  const all = allHtmlFiles().flatMap((file) =>
    misses(readFileSync(file, 'utf8')).map((url) => `${relative(DIST, file)}: ${url}`),
  );
  assert.deepEqual(all, []);
});

test(`a site-root link without ${BASE} is a miss, even when its path exists in dist/`, () => {
  const html = [
    '<a href="/en/">base-less page that exists</a>',
    '<a href="/about/">base-less page</a>',
    '<img src="/images/site/logo.png" alt="base-less file that exists">',
    `<a href="${BASE}/en/">page</a>`,
    `<img src="${BASE}/images/site/logo.png" alt="file">`,
    `<a href="${BASE}/missing/">missing page</a>`,
    '<a href="//cdn.example.com/a.js">protocol-relative</a>',
    '<a href="https://example.com/">absolute</a>',
    '<a href="#top">fragment</a>',
  ].join('');
  assert.deepEqual(misses(html), ['/en/', '/about/', '/images/site/logo.png', `${BASE}/missing/`]);
});
