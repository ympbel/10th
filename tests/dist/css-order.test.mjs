import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { load } from 'cheerio';
import { BASE, DIST, allHtmlFiles, isRedirect } from './helpers.mjs';

// The global bundle is the one with the design tokens (tokens.css) and the top bar rules (base.css). Every page
// imports styles/global.css as its first import so this bundle is linked before any page CSS.
const TOKEN_MARKER = '--c-yonsei-navy:';
const BASE_MARKER = '.topmenu';
const RESPONSIVE_MARKER = '@media (max-width:1024px)';

const cssCache = new Map();
/** Text of a built stylesheet (`/10th/_astro/x.css` → `dist/_astro/x.css`), read once. */
function css(href) {
  if (!cssCache.has(href)) cssCache.set(href, readFileSync(join(DIST, href.slice(BASE.length)), 'utf8'));
  return cssCache.get(href);
}

test('every page links the global bundle (tokens, base, responsive) before any other site CSS', () => {
  const wrong = [];
  for (const file of allHtmlFiles()) {
    const $ = load(readFileSync(file, 'utf8'));
    if (isRedirect($)) continue; // Astro's redirect pages link no stylesheets.
    // Site stylesheets in document order: bundled links and any inlined <style>. Google Fonts links are not ours.
    const sheets = $('link[rel=stylesheet], style')
      .filter((_, el) => el.tagName === 'style' || $(el).attr('href').startsWith(`${BASE}/_astro/`))
      .map((_, el) => (el.tagName === 'style' ? '<style>' : $(el).attr('href')))
      .get();
    const first = sheets[0];
    const ok = first !== undefined && first !== '<style>' && css(first).includes(TOKEN_MARKER) && css(first).includes(BASE_MARKER);
    if (!ok) wrong.push(`${relative(DIST, file)}: ${sheets.join(' ') || '(none)'}`);
  }
  assert.deepEqual(wrong, []);
});

test('the global bundle holds tokens, then base, then the responsive layer', () => {
  const $ = load(readFileSync(join(DIST, 'index.html'), 'utf8'));
  const text = css($(`link[rel=stylesheet][href^="${BASE}/_astro/"]`).first().attr('href'));
  const at = [TOKEN_MARKER, BASE_MARKER, RESPONSIVE_MARKER].map((m) => text.indexOf(m));
  assert.ok(at.every((i) => i !== -1), `markers at ${at.join(', ')}`);
  assert.deepEqual([...at].sort((a, b) => a - b), at);
});
