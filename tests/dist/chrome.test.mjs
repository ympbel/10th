import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { load } from 'cheerio';
import { BASE, DIST, allHtmlFiles, page } from './helpers.mjs';

const SECTIONS = ['PEOPLE', 'PUBLICATION', 'AWARD', 'PROJECT', 'ACTIVITY', 'ARCHIVE'];

/** The URL path a built file is served at: `dist/people/students/index.html` → `/10th/people/students/`,
 * `dist/404.html` → `/10th/404.html`. */
function servedPath(file) {
  const rel = relative(DIST, file).split(sep).join('/');
  return `${BASE}/${rel.endsWith('index.html') ? rel.slice(0, -'index.html'.length) : rel}`;
}

/** Whether a served path is an English page. */
const isEnglish = (path) => path === `${BASE}/en/` || path.startsWith(`${BASE}/en/`);

/** `path` with `/en` inserted after the base: the English counterpart of a Korean page path. */
const englishOf = (path) => `${BASE}/en${path.slice(BASE.length)}`;

const pages = allHtmlFiles().map((file) => ({ file, path: servedPath(file), $: load(readFileSync(file, 'utf8')) }));

test('every page has the top bar: logo with alt, the six menu sections and the KR/EN toggle', () => {
  assert.ok(pages.length > 0);
  for (const { path, $ } of pages) {
    const bar = $('.topmenu');
    assert.equal(bar.length, 1, path);
    const logo = bar.find('.logo img[alt]');
    assert.equal(logo.length, 1, path);
    assert.ok(logo.attr('alt').trim() !== '', path);
    assert.equal(logo.attr('src'), `${BASE}/images/site/logo.png`, path);
    assert.deepEqual(
      bar.find('#nav > li > a').map((_, a) => $(a).text().trim()).get(),
      SECTIONS,
      path,
    );
    assert.deepEqual(
      bar.find('.langbut a').map((_, a) => $(a).text().trim()).get(),
      ['KR', 'EN'],
      path,
    );
  }
});

test('the KR/EN toggle links the same page in both languages and marks the current one', () => {
  for (const { path, $ } of pages) {
    const [kr, en] = $('.topmenu .langbut a').map((_, a) => $(a).attr('href')).get();
    assert.ok(!isEnglish(kr), `${path}: KR → ${kr}`);
    assert.equal(en, englishOf(kr), path);
    assert.equal(isEnglish(path) ? en : kr, path, `${path}: the current language links to this page`);
    assert.equal($('.topmenu .langbut li.active a').text().trim(), isEnglish(path) ? 'EN' : 'KR', path);
  }
});

test('html lang is en under /en/ and ko elsewhere; menu links stay in the page language', () => {
  for (const { path, $ } of pages) {
    const english = isEnglish(path);
    assert.equal($('html').attr('lang'), english ? 'en' : 'ko', path);
    const hrefs = $('#nav a').map((_, a) => $(a).attr('href')).get();
    assert.equal(hrefs.length, 6 + 11, path);
    for (const href of hrefs) assert.equal(isEnglish(href), english, `${path}: ${href}`);
  }
});

test('every page has the footer with the archive line and the main site link', () => {
  for (const { path, $ } of pages) {
    const footer = $('#footer');
    assert.equal(footer.length, 1, path);
    assert.ok(footer.text().includes('10th Anniversary Archive'), path);
    assert.equal(footer.find('a[href="https://ympbel.github.io/"]').length, 1, path);
  }
});

test('background images set from components are under the base and exist in dist/', () => {
  const misses = [];
  for (const { path, $ } of pages) {
    $('[style*="url("]').each((_, el) => {
      for (const [, url] of $(el).attr('style').matchAll(/url\(([^)]+)\)/g)) {
        const clean = url.replace(/^['"]|['"]$/g, '');
        if (!clean.startsWith(`${BASE}/`) || !existsSync(join(DIST, clean.slice(BASE.length)))) {
          misses.push(`${path}: ${clean}`);
        }
      }
    });
  }
  assert.deepEqual(misses, []);
});

test('sub page frame: visual band label, side navigation with the current board, heading and breadcrumb', () => {
  for (const [path, lang, title] of [
    ['people/students', 'ko', '학생 현황'],
    ['en/people/students', 'en', 'Students'],
  ]) {
    const $ = page(path);
    const href = `${BASE}/${path}/`;
    assert.equal($('.sub_visual .sub_visual-label').text().trim(), '10th Anniversary Archive', path);
    assert.match($('.sub_visual').attr('style'), /sub_visual\.jpg/, path);
    assert.equal($('.snb .tit').text().trim(), 'PEOPLE', path);
    assert.equal($('.snb .vNav li').length, 2, path);
    const active = $('.snb .vNav li.active a');
    assert.equal(active.text().trim(), title, path);
    assert.equal(active.attr('href'), href, path);
    assert.equal(active.attr('aria-current'), 'page', path);
    assert.equal($('.contentBox h1.cnt_title').text().trim(), title, path);
    assert.deepEqual(
      $('.loca li').map((_, li) => $(li).text().trim()).get(),
      ['', 'PEOPLE', title],
      path,
    );
    assert.equal($('.loca li a').attr('href'), lang === 'en' ? `${BASE}/en/` : `${BASE}/`, path);
    assert.equal($('.loca img').attr('src'), `${BASE}/images/site/home.png`, path);
    assert.equal($('.contents').text().trim(), lang === 'en' ? 'Coming soon' : '준비 중', path);
  }
});
