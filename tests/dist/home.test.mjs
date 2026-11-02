import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, page } from './helpers.mjs';

// The home page DOM contract (plan Task 8), in both languages. Expected numbers are counted here from the content
// files themselves, not through the site's helpers, so a counting bug in src/lib shows up as a mismatch.

const CONTENT = fileURLToPath(new URL('../../src/content/', import.meta.url));
const YEARS = Array.from({ length: 11 }, (_, i) => 2016 + i);

/** The frontmatter text of every entry in a collection (templates `_*.md` excluded). */
function frontmatters(collection) {
  const dir = join(CONTENT, collection);
  return readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith('.md') && !basename(f).startsWith('_'))
    .map((f) => readFileSync(join(dir, f), 'utf8').split(/^---$/m)[1]);
}

/** A top-level scalar from frontmatter text, unquoted (`role: "student"` → `student`). */
function scalar(fm, key) {
  const m = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm);
  return m ? m[1].trim().replace(/^"(.*)"$/, '$1') : undefined;
}

/** Whether the frontmatter has `degree:` with an indented `date:` under it. */
function hasDegreeDate(fm) {
  const m = /^degree:\s*\n((?:[ \t]+.*(?:\n|$))*)/m.exec(fm);
  return Boolean(m && /^[ \t]+date:/m.test(m[1]));
}

const members = frontmatters('members');
const roles = members.map((fm) => scalar(fm, 'role'));
const papers = frontmatters('papers');
const count = (collection) => frontmatters(collection).length;

/** The six figures, in order: members without professors, degrees taken, papers from 2016 on, presentations,
 * awards, projects. */
const FIGURES = [
  roles.filter((r) => r !== 'professor').length,
  members.filter(hasDegreeDate).length,
  papers.filter((fm) => Number(scalar(fm, 'year')) >= 2016).length,
  count('presentations'),
  count('awards'),
  count('projects'),
];

/** The board link counts in menu order. */
const BOARDS = [
  roles.filter((r) => r === 'student').length,
  roles.filter((r) => r === 'alumni' || r === 'former').length,
  papers.length,
  count('patents'),
  count('presentations'),
  count('awards'),
  count('projects'),
  count('seminars'),
  count('workshops'),
  count('photos'),
  count('comments'),
];

/** `slogan` of pages/<lang>/home.md. */
const slogan = (lang) => scalar(readFileSync(join(CONTENT, 'pages', lang, 'home.md'), 'utf8'), 'slogan');

const text = ($el) => $el.text().replace(/\s+/g, ' ').trim();

test('the counts the home page is checked against are the ones the spec gives', () => {
  assert.deepEqual(FIGURES, [61, 13, 162, 379, 41, 15]);
  assert.equal(BOARDS[2], 217);
});

for (const [lang, path, prefix] of [
  ['ko', '', ''],
  ['en', 'en', '/en'],
]) {
  const $ = page(path);

  test(`${lang}: the hero h1 is the slogan from home.md and the band image is visual.jpg under the base`, () => {
    assert.equal($('h1').length, 1);
    assert.equal(text($('.hero h1')), slogan(lang));
    const img = $('.hero img[src$="visual.jpg"]');
    assert.equal(img.length, 1);
    assert.equal(img.attr('src'), `${BASE}/images/site/visual.jpg`);
    assert.equal(img.attr('alt'), '');
  });

  test(`${lang}: six figures with numeric data-count matching the content files`, () => {
    const cells = $('.figures a[data-count]');
    assert.equal(cells.length, 6);
    const values = cells.map((_, a) => $(a).attr('data-count')).get();
    for (const v of values) assert.match(v, /^\d+$/);
    assert.deepEqual(values.map(Number), FIGURES);
    cells.each((_, a) => {
      assert.equal($(a).find('b').text(), $(a).attr('data-count'));
      assert.ok($(a).attr('href').startsWith(`${BASE}${prefix}/`), $(a).attr('href'));
    });
  });

  test(`${lang}: eleven timeline columns 2016 → 2026, each linking to its year page`, () => {
    const cols = $('.timeline a[data-year]');
    assert.deepEqual(cols.map((_, a) => Number($(a).attr('data-year'))).get(), YEARS);
    cols.each((_, a) => {
      const y = $(a).attr('data-year');
      assert.equal($(a).attr('href'), `${BASE}${prefix}/years/${y}/`);
      assert.equal($(a).find('.tl-bars i').length, 3, y);
      for (const bar of $(a).find('.tl-bars i').get()) {
        const v = Number(/--bar:(\d+)/.exec($(bar).attr('style'))?.[1]);
        assert.ok(v >= 2 && v <= 134, `${y}: bar ${v}`);
      }
    });
    assert.deepEqual($('.timeline a.on').map((_, a) => $(a).attr('data-year')).get(), ['2026']);
  });

  test(`${lang}: the 2024 column shows four who joined and +8`, () => {
    const col = $('.timeline a[data-year="2024"]');
    assert.equal(col.find('.tl-name').length, 4);
    assert.equal(text(col.find('.tl-more')), '+8');
  });

  test(`${lang}: eleven year panels, only 2026 visible, each with links to its year page`, () => {
    const panels = $('.year-panel[data-year]');
    assert.deepEqual(panels.map((_, p) => Number($(p).attr('data-year'))).get(), YEARS);
    const visible = panels.filter((_, p) => $(p).attr('hidden') === undefined);
    assert.deepEqual(visible.map((_, p) => $(p).attr('data-year')).get(), ['2026']);
    panels.each((_, p) => {
      const y = $(p).attr('data-year');
      const more = $(p).find('a.more[href*="/years/"]');
      assert.equal(more.length, 3, y);
      more.each((_, a) => assert.equal($(a).attr('href'), `${BASE}${prefix}/years/${y}/`));
    });
  });

  test(`${lang}: the 2026 panel lists at most five papers, and an empty column says so`, () => {
    const items = $('.year-panel[data-year="2026"] .yp-papers li');
    assert.ok(items.length > 0 && items.length <= 5, `${items.length} papers`);
    assert.equal(text($('.year-panel[data-year="2016"] .yp-awards .empty')), lang === 'en' ? 'No records' : '기록 없음');
  });

  test(`${lang}: eleven board links with the menu hrefs and each board's count`, () => {
    const links = $('.board-links a');
    assert.equal(links.length, 11);
    assert.deepEqual(
      links.map((_, a) => $(a).attr('href')).get(),
      $('#nav .sub a').map((_, a) => $(a).attr('href')).get(),
    );
    links.each((i, a) => {
      assert.ok($(a).attr('href').startsWith(`${BASE}${prefix}/`), $(a).attr('href'));
      assert.equal(text($(a)), `${text($('#nav .sub a').eq(i))} ${BOARDS[i]}`);
    });
  });

  test(`${lang}: no src outside the base`, () => {
    assert.deepEqual($('[src^="/images/"]').map((_, el) => $(el).attr('src')).get(), []);
    assert.deepEqual(
      $('[src^="/"]')
        .filter((_, el) => !$(el).attr('src').startsWith(`${BASE}/`))
        .map((_, el) => $(el).attr('src'))
        .get(),
      [],
    );
  });
}
