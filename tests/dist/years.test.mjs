import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE, DIST, entries, exists, nested, page, scalar } from './helpers.mjs';

// The year pages (plan Task 9): /years/2016/ … /years/2026/ in both languages, the year tab rail, the summary line
// and the seven parts. Expected numbers are counted here from the content files, not through src/lib.

const YEARS = Array.from({ length: 11 }, (_, i) => 2016 + i);
const LATEST = YEARS[YEARS.length - 1];
const PARTS = ['joined', 'degrees', 'papers', 'presentations', 'awards', 'projects', 'seminars'];

const members = entries('members');
const memberIds = new Set(members.map((m) => m.id));
const yearOf = (date) => (date ? Number(date.slice(0, 4)) : undefined);
const inYear = (collection, y) => entries(collection).filter((e) => Number(scalar(e.fm, 'year')) === y);

/** What year `y` holds, from the content files: member slugs for joined and degrees, records for the rest. */
function expected(y) {
  return {
    joined: members.filter((m) => yearOf(scalar(m.fm, 'joined')) === y).map((m) => m.id),
    degrees: members.filter((m) => yearOf(nested(m.fm, 'degree', 'date')) === y).map((m) => m.id),
    papers: inYear('papers', y),
    presentations: inYear('presentations', y),
    awards: inYear('awards', y),
    projects: entries('projects').filter(
      (p) => yearOf(scalar(p.fm, 'start')) <= y && y <= yearOf(scalar(p.fm, 'end')),
    ),
    seminars: entries('seminars').filter((s) => yearOf(scalar(s.fm, 'date')) === y),
    photos: inYear('photos', y),
  };
}

/** The summary line of year `y` in a language, built from the expected counts. */
function summary(lang, e) {
  const n = {
    joined: e.joined.length,
    degrees: e.degrees.length,
    papers: e.papers.length,
    presentations: e.presentations.length,
    awards: e.awards.length,
    projects: e.projects.length,
  };
  return lang === 'en'
    ? `Joined ${n.joined} · Degrees ${n.degrees} · Papers ${n.papers} · Presentations ${n.presentations} · ` +
        `Awards ${n.awards} · Projects ${n.projects}`
    : `합류 ${n.joined}명 · 학위 ${n.degrees}명 · 논문 ${n.papers}편 · 발표 ${n.presentations}건 · ` +
        `수상 ${n.awards}건 · 과제 ${n.projects}건`;
}

const text = ($el) => $el.text().replace(/\s+/g, ' ').trim();

test('22 year pages: /years/2016/ … /years/2026/ and the same under /en/', () => {
  const missing = YEARS.flatMap((y) => [`years/${y}`, `en/years/${y}`]).filter((path) => !exists(path));
  assert.deepEqual(missing, []);
});

for (const [lang, prefix] of [
  ['ko', ''],
  ['en', '/en'],
]) {
  const dir = prefix.slice(1);
  const path = (y) => join(dir, 'years', String(y));
  const noRecords = lang === 'en' ? 'No records' : '기록 없음';

  test(`${lang}: /years/ redirects to the latest year`, () => {
    const html = readFileSync(join(DIST, dir, 'years', 'index.html'), 'utf8');
    const target = `${BASE}${prefix}/years/${LATEST}/`;
    assert.ok(html.includes(target), html);
    const $ = page(join(dir, 'years'));
    assert.match($('meta[http-equiv="refresh"]').attr('content'), new RegExp(`;url=${target}$`));
  });

  test(`${lang}: every year page has the year tab rail with 11 years and the current one marked`, () => {
    for (const y of YEARS) {
      const $ = page(path(y));
      const tabs = $('.side .year-tabs a');
      assert.deepEqual(
        tabs.map((_, a) => $(a).attr('href')).get(),
        YEARS.map((t) => `${BASE}${prefix}/years/${t}/`),
        `${y}`,
      );
      assert.deepEqual(tabs.map((_, a) => text($(a))).get(), YEARS.map(String), `${y}`);
      const on = $('.year-tabs a.on');
      assert.deepEqual(on.map((_, a) => text($(a))).get(), [String(y)], `${y}`);
      assert.equal(on.attr('aria-current'), 'page', `${y}`);
    }
  });

  test(`${lang}: the heading and the breadcrumb are the year`, () => {
    for (const y of YEARS) {
      const $ = page(path(y));
      assert.equal(text($('h1.cnt_title')), String(y));
      assert.deepEqual($('.loca li').map((_, li) => text($(li))).get(), ['', String(y)], `${y}`);
      assert.equal($('.loca li').last().attr('aria-current'), 'page', `${y}`);
    }
    assert.ok(text(page(path(2022))('.loca')).includes('2022'));
  });

  test(`${lang}: the summary line counts what the content files hold for each year`, () => {
    for (const y of YEARS) {
      const $ = page(path(y));
      assert.equal($('.year-summary').length, 1, `${y}`);
      assert.equal(text($('.year-summary')), summary(lang, expected(y)), `${y}`);
    }
  });

  test(`${lang}: seven parts in order, each with a heading; an empty part says so and stays`, () => {
    for (const y of YEARS) {
      const $ = page(path(y));
      const e = expected(y);
      const parts = $('section[data-part]');
      assert.deepEqual(
        parts.map((_, s) => $(s).attr('data-part')).get(),
        e.photos.length > 0 ? [...PARTS, 'photos'] : PARTS,
        `${y}`,
      );
      parts.each((_, s) => {
        const h2 = $(s).children('h2');
        assert.equal(h2.length, 1, `${y} ${$(s).attr('data-part')}`);
        assert.notEqual(text(h2), '', `${y} ${$(s).attr('data-part')}`);
      });
      for (const part of PARTS) {
        const empty = $(`section[data-part="${part}"] .empty`);
        if (e[part].length === 0) assert.equal(text(empty), noRecords, `${y} ${part}`);
        else assert.equal(empty.length, 0, `${y} ${part}`);
      }
    }
    assert.equal(text(page(path(2016))('section[data-part="presentations"] .empty')), noRecords);
  });

  test(`${lang}: 2022 lists its people, papers, presentations, awards and projects`, () => {
    const $ = page(path(2022));
    const e = expected(2022);
    const slugs = (part) =>
      $(`section[data-part="${part}"] .name[data-member]`).map((_, el) => $(el).attr('data-member')).get();
    assert.equal(slugs('degrees').length, 4);
    assert.deepEqual(new Set(slugs('degrees')), new Set(e.degrees));
    assert.deepEqual(new Set(slugs('joined')), new Set(e.joined));
    assert.equal(slugs('joined').length, e.joined.length);
    for (const part of ['papers', 'presentations', 'awards', 'projects']) {
      assert.equal($(`section[data-part="${part}"] .yr-item`).length, e[part].length, part);
    }
    assert.ok(text($('section[data-part="seminars"]')).includes(String(e.seminars.length)));
    assert.equal(
      $('section[data-part="seminars"] a').attr('href'),
      `${BASE}${prefix}/activity/seminars/`,
    );
  });

  test(`${lang}: 2025 presentations are grouped under one h3 per conference`, () => {
    const $ = page(path(2025));
    const conferences = new Set(expected(2025).presentations.map((p) => scalar(p.fm, 'conference')));
    const h3 = $('section[data-part="presentations"] h3');
    assert.ok(h3.length >= 2, `${h3.length} conferences`);
    assert.equal(h3.length, conferences.size);
  });

  test(`${lang}: every data-member on a year page names a member file`, () => {
    for (const y of YEARS) {
      const $ = page(path(y));
      const unknown = $('[data-member]')
        .map((_, el) => $(el).attr('data-member'))
        .get()
        .filter((slug) => !memberIds.has(slug));
      assert.deepEqual(unknown, [], `${y}`);
    }
  });
}
