import { load } from 'cheerio';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));
const CONTENT = fileURLToPath(new URL('../../src/content/', import.meta.url));

/** The deployment base (`base` in astro.config.mjs). Built pages link to `${BASE}/people/students/`, but `dist/` is
 * written without a base folder, so that page is `dist/people/students/index.html`. */
export const BASE = '/10th';

/** `dist/<path>` for a file path ending in `.html` (e.g. `404.html`), else `dist/<path>/index.html` (`''` for the
 * root page). `path` is a site path without the base (`'people/students'`). */
function htmlFile(path) {
  return path.endsWith('.html') ? join(DIST, path) : join(DIST, path, 'index.html');
}

/** Cheerio document of the built page at the site path `path` (without the base). */
export function page(path) {
  return load(readFileSync(htmlFile(path), 'utf8'));
}

/** Whether the build produced a page at the site path `path` (without the base). */
export function exists(path) {
  return existsSync(htmlFile(path));
}

/** Absolute paths of every `dist/**\/*.html`, sorted. */
export function allHtmlFiles() {
  return readdirSync(DIST, { recursive: true })
    .filter((f) => f.endsWith('.html'))
    .map((f) => join(DIST, f))
    .sort();
}

/** Whether a built page is one of Astro's redirect pages (`Astro.redirect` in a static build): a bare document whose
 * meta refresh sends the browser on, without the site's chrome or stylesheets. */
export function isRedirect($) {
  return $('meta[http-equiv="refresh"]').length > 0;
}

// Content files, read directly so dist tests can derive expected numbers without going through the site's helpers
// (a counting bug in src/lib then shows up as a mismatch).

/** Every entry of a content collection (templates `_*.md` excluded): `id` is the file name without `.md` (the
 * collection id; a member's slug), `fm` the frontmatter text. */
export function entries(collection) {
  const dir = join(CONTENT, collection);
  return readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith('.md') && !basename(f).startsWith('_'))
    .map((f) => ({ id: f.slice(0, -3), fm: readFileSync(join(dir, f), 'utf8').split(/^---$/m)[1] }));
}

/** The frontmatter text of every entry in a collection (templates `_*.md` excluded). */
export function frontmatters(collection) {
  return entries(collection).map((e) => e.fm);
}

/** A frontmatter value without its double quotes. */
const unquote = (value) => value.trim().replace(/^"(.*)"$/, '$1');

/** A top-level scalar from frontmatter text, unquoted (`role: "student"` → `student`). */
export function scalar(fm, key) {
  const m = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm);
  return m ? unquote(m[1]) : undefined;
}

/** A scalar one level down, unquoted: `nested(fm, 'degree', 'date')` reads `date:` indented under `degree:`. */
export function nested(fm, parent, key) {
  const block = new RegExp(`^${parent}:\\s*\\n((?:[ \\t]+.*(?:\\n|$))*)`, 'm').exec(fm);
  const m = block && new RegExp(`^[ \\t]+${key}:\\s*(.+)$`, 'm').exec(block[1]);
  return m ? unquote(m[1]) : undefined;
}

/** A top-level list from frontmatter text, items unquoted: `members:` followed by `  - "a"` lines → `['a']`. A flow
 * list (`members: []`) or a missing key gives `[]`; the converter writes non-empty lists in block form only. */
export function list(fm, key) {
  const block = new RegExp(`^${key}:[ \\t]*\\n((?:[ \\t]+-.*(?:\\n|$))*)`, 'm').exec(fm);
  if (!block) return [];
  return block[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line) => unquote(line.slice(1)));
}
