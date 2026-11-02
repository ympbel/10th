import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BASE, entries, exists, page, scalar } from './helpers.mjs';

// Every page the site promises (spec 5.1), in both languages: the home page, the eleven year pages and the /years/
// redirect, the eleven boards, a page per non-professor member, and the single 404 page. Person slugs come from the
// content files, so adding a member adds a page to check.

const LANGS = ['', 'en/'];
const YEARS = Array.from({ length: 11 }, (_, i) => 2016 + i);
const BOARDS = [
  'people/students',
  'people/alumni',
  'publication/papers',
  'publication/patents',
  'publication/presentations',
  'awards',
  'projects',
  'activity/seminars',
  'activity/workshops',
  'archive/photos',
  'archive/comments',
];
const PEOPLE = entries('members')
  .filter((m) => scalar(m.fm, 'role') !== 'professor')
  .map((m) => m.id);

/** The site paths (without the base) in `paths` that the build did not produce. */
const missing = (paths) => paths.filter((path) => !exists(path));

test('the home page in both languages', () => {
  assert.deepEqual(missing(LANGS), []);
});

test('eleven year pages and the /years/ redirect in both languages (24 pages)', () => {
  const paths = LANGS.flatMap((lang) => [...YEARS.map((y) => `${lang}years/${y}`), `${lang}years`]);
  assert.equal(paths.length, 24);
  assert.deepEqual(missing(paths), []);
});

test('the eleven boards in both languages', () => {
  const paths = LANGS.flatMap((lang) => BOARDS.map((board) => `${lang}${board}`));
  assert.equal(paths.length, 22);
  assert.deepEqual(missing(paths), []);
});

test('a person page per non-professor member in both languages (61 each)', () => {
  assert.equal(PEOPLE.length, 61);
  assert.deepEqual(missing(LANGS.flatMap((lang) => PEOPLE.map((slug) => `${lang}people/${slug}`))), []);
});

test('404.html exists and links to the home page under the base in its main content', () => {
  assert.ok(exists('404.html'), '404.html');
  const $ = page('404.html');
  assert.equal($(`#main a[href="${BASE}/"]`).length, 1);
});
