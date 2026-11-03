import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { entries, list, page, scalar } from './helpers.mjs';

// The publication boards (plan Task 11), in both languages: papers (2016 on by year, then the 연구실 이전 section
// with the earlier papers), patents in the main site's patent list form, and presentations by year and conference.
// Expected values are derived here from the content files, not through src/lib.

const LAB_START = 2016;
const HANGUL = /[가-힣]/;

const members = entries('members');
const professorIds = new Set(members.filter((m) => scalar(m.fm, 'role') === 'professor').map((m) => m.id));

const yearOf = (e) => Number(scalar(e.fm, 'year'));
const orderOf = (e) => {
  const v = scalar(e.fm, 'order');
  return v === undefined ? undefined : Number(v);
};
/** Ascending `order`, entries without one last. */
function byOrder(a, b) {
  const x = orderOf(a);
  const y = orderOf(b);
  if (x === y) return 0;
  if (x === undefined) return 1;
  if (y === undefined) return -1;
  return x - y;
}
/** Newest year first, then the sheet order. */
const sheetSorted = (items) => [...items].sort((a, b) => yearOf(b) - yearOf(a) || byOrder(a, b));
/** Distinct values in order of first appearance. */
const distinct = (values) => [...new Set(values)];

const papers = sheetSorted(entries('papers'));
const labPapers = papers.filter((p) => yearOf(p) >= LAB_START);
const preLabPapers = papers.filter((p) => yearOf(p) < LAB_START);
const presentations = sheetSorted(entries('presentations'));
// The main site's patent order: newest year first, a larger `order` first within a year.
const patents = [...entries('patents')].sort((a, b) => yearOf(b) - yearOf(a) || orderOf(b) - orderOf(a));

const text = ($el) => $el.text().replace(/\s+/g, ' ').trim();
/** A frontmatter string as the page shows it: YAML double-quote escapes (`\n`, `\"`) decoded, white space collapsed. */
const value = (e, key) => {
  const raw = scalar(e.fm, key);
  return raw === undefined ? undefined : JSON.parse(`"${raw}"`).replace(/\s+/g, ' ').trim();
};
const titleOf = (e) => value(e, 'title');
/** Member slugs a record's byline should link: its `members` without professors (they have no person page). */
const linkable = (e) => list(e.fm, 'members').filter((slug) => !professorIds.has(slug));

// At import: 217 papers (163 from 2016 on and 54 before, with scripts/import/corrections.json), 379 presentations,
// 7 patents. The checks below count from the files, so adding a record never breaks them; this one only guards against
// an emptied or truncated folder.
test('the content holds at least the imported records, the papers split at the lab start', () => {
  assert.ok(papers.length >= 217, `${papers.length} papers`);
  assert.equal(labPapers.length + preLabPapers.length, papers.length);
  assert.ok(preLabPapers.length > 0);
  assert.ok(presentations.length >= 379, `${presentations.length} presentations`);
  assert.ok(patents.length >= 7, `${patents.length} patents`);
});

for (const [lang, dir] of [
  ['ko', ''],
  ['en', 'en'],
]) {
  const path = (board) => join(dir, 'publication', board);

  /** Every year-index link on a page points at an element on the same page. */
  function assertIndexResolves($) {
    const hrefs = $('nav.pub-index a')
      .map((_, a) => $(a).attr('href'))
      .get();
    assert.ok(hrefs.length > 0, 'year index present');
    const missing = hrefs.filter((href) => !href.startsWith('#') || $(`[id="${href.slice(1)}"]`).length !== 1);
    assert.deepEqual(missing, []);
    return hrefs;
  }

  test(`${lang}: papers board holds all ${papers.length} papers, ${labPapers.length} from ${LAB_START} on`, () => {
    const $ = page(path('papers'));
    assert.equal($('.pub-item').length, papers.length);
    const labYears = distinct(labPapers.map(yearOf));
    const outside = $('section.pub-year').filter((_, el) => $(el).closest('#pre-lab').length === 0);
    assert.deepEqual(
      outside.map((_, el) => $(el).attr('id')).get(),
      labYears.map((y) => `y${y}`),
    );
    assert.equal(outside.length, 11);
    outside.each((_, el) => {
      const y = Number($(el).attr('id').slice(1));
      assert.equal(text($(el).children('h2').first()), String(y));
      assert.equal($(el).find('.pub-item').length, labPapers.filter((p) => yearOf(p) === y).length);
    });
  });

  test(`${lang}: the 연구실 이전 section follows with the ${preLabPapers.length} earlier papers by year`, () => {
    const $ = page(path('papers'));
    const pre = $('section#pre-lab');
    assert.equal(pre.length, 1);
    // The earliest paper's year to the year before the lab, with the count beside the title.
    const range = `${Math.min(...preLabPapers.map(yearOf))}–${LAB_START - 1}`;
    const heading = pre.children('h2').first();
    assert.equal(
      text(heading.clone().children('small').remove().end()),
      lang === 'en' ? `Before the lab (${range})` : `연구실 이전 (${range})`,
    );
    assert.equal(text(heading.find('small')), lang === 'en' ? `${preLabPapers.length}` : `${preLabPapers.length}편`);
    assert.equal(pre.find('.pub-item').length, preLabPapers.length);
    // After every lab-era year in document order.
    assert.equal($('section.pub-year, section#pre-lab').last().closest('#pre-lab').length, 1);
    assert.deepEqual(
      pre
        .find('section.pub-year')
        .map((_, el) => $(el).attr('id'))
        .get(),
      distinct(preLabPapers.map(yearOf)).map((y) => `y${y}`),
    );
  });

  test(`${lang}: the papers note gives the board total and the home figure`, () => {
    const $ = page(path('papers'));
    const note = text($('.pub-note').first());
    assert.ok(note.includes(String(papers.length)), note);
    assert.ok(note.includes(String(labPapers.length)), note);
  });

  test(`${lang}: papers year index links #y2026 … #y2016 and #pre-lab, all on the page`, () => {
    const $ = page(path('papers'));
    const hrefs = assertIndexResolves($);
    assert.deepEqual(hrefs, [...distinct(labPapers.map(yearOf)).map((y) => `#y${y}`), '#pre-lab']);
  });

  test(`${lang}: paper rows come in sheet order with their titles, members linked to person pages`, () => {
    const $ = page(path('papers'));
    const rows = $('.pub-item');
    const wrong = [];
    papers.forEach((p, i) => {
      const row = rows.eq(i);
      if (text(row.find('.yr-title')) !== titleOf(p)) wrong.push(`${p.id}: title ${text(row.find('.yr-title'))}`);
      const linked = row
        .find('a[href*="/people/"]')
        .map((_, a) => $(a).attr('data-member'))
        .get();
      const want = linkable(p);
      if (JSON.stringify([...new Set(linked)].sort()) !== JSON.stringify([...want].sort()))
        wrong.push(`${p.id}: links ${linked.join(',')} want ${want.join(',')}`);
    });
    assert.deepEqual(wrong, []);
    // Spot-check: three papers with members link each member's page from the author line.
    const withMembers = papers.filter((p) => linkable(p).length > 0);
    assert.ok(withMembers.length >= 3);
    for (const p of [withMembers[0], withMembers[Math.floor(withMembers.length / 2)], withMembers.at(-1)]) {
      const row = rows.eq(papers.indexOf(p));
      for (const slug of linkable(p)) {
        const href = row.find(`.yr-sub a[data-member="${slug}"]`).attr('href');
        assert.ok(href?.endsWith(`${dir ? '/en' : ''}/people/${slug}/`), `${p.id}: ${slug} → ${href}`);
      }
    }
  });

  test(`${lang}: patents in the main site's form, newest year first and a larger order first`, () => {
    const $ = page(path('patents'));
    const rows = $('.pub-item');
    assert.equal(rows.length, patents.length);
    assertIndexResolves($);
    patents.forEach((p, i) => {
      const row = rows.eq(i);
      assert.equal(text(row.find('.yr-title')), titleOf(p), p.id);
      assert.equal(row.closest('section.pub-year').attr('id'), `y${yearOf(p)}`);
      const link = scalar(p.fm, 'link');
      const a = row.find('.yr-title a');
      if (link) {
        assert.equal(a.attr('href'), link);
        assert.equal(a.attr('target'), '_blank');
        assert.equal(a.attr('rel'), 'noopener');
      } else {
        assert.equal(a.length, 0, p.id);
      }
      // One element per venue line (등록국가, 등록번호, 등록일).
      const lines = JSON.parse(`"${scalar(p.fm, 'venue')}"`).split('\n').filter((l) => l.trim() !== '');
      assert.deepEqual(
        row
          .find('.pub-venue > span')
          .map((_, el) => text($(el)))
          .get(),
        lines.map((l) => l.replace(/\s+/g, ' ').trim()),
      );
    });
  });

  test(`${lang}: presentations by year, then by conference with a count, ${presentations.length} rows`, () => {
    const $ = page(path('presentations'));
    assert.equal($('.pub-item').length, presentations.length);
    const hrefs = assertIndexResolves($);
    const years = distinct(presentations.map(yearOf));
    assert.deepEqual(hrefs, years.map((y) => `#y${y}`));
    for (const y of years) {
      const section = $(`section.pub-year#y${y}`);
      const ofYear = presentations.filter((p) => yearOf(p) === y);
      const confs = distinct(ofYear.map((p) => scalar(p.fm, 'conference')));
      const h3 = section.find('h3');
      assert.deepEqual(
        h3.map((_, el) => text($(el).clone().children('small').remove().end())).get(),
        confs,
        `${y} conferences`,
      );
      h3.each((i, el) => {
        const n = ofYear.filter((p) => scalar(p.fm, 'conference') === confs[i]).length;
        assert.equal($(el).parent().find('.pub-item').length, n);
        assert.ok(text($(el).find('small')).includes(String(n)));
      });
    }
    assert.ok($('section#y2025 h3').length >= 2);
  });

  test(`${lang}: presentation rows show the title, the full author list and the type chip`, () => {
    const $ = page(path('presentations'));
    const rows = $('.pub-item');
    const wrong = [];
    // Rows in document order are year by year, conference by conference in first-seen order.
    const ordered = distinct(presentations.map(yearOf)).flatMap((y) => {
      const ofYear = presentations.filter((p) => yearOf(p) === y);
      return distinct(ofYear.map((p) => scalar(p.fm, 'conference'))).flatMap((c) =>
        ofYear.filter((p) => scalar(p.fm, 'conference') === c),
      );
    });
    ordered.forEach((p, i) => {
      const row = rows.eq(i);
      if (text(row.find('.yr-title')) !== titleOf(p)) wrong.push(`${p.id}: title`);
      // Without an author list the row shows the first author.
      const authors = value(p, 'authors') || value(p, 'first_author') || '';
      if (text(row.find('.pub-authors')) !== authors) wrong.push(`${p.id}: authors`);
      if (text(row.find('.yr-type')) !== scalar(p.fm, 'type')) wrong.push(`${p.id}: type`);
      // A link only for a member of this record.
      const linked = row
        .find('a[href*="/people/"]')
        .map((_, a) => $(a).attr('data-member'))
        .get();
      const stray = linked.filter((slug) => !linkable(p).includes(slug));
      if (stray.length > 0) wrong.push(`${p.id}: stray links ${stray.join(',')}`);
    });
    assert.deepEqual(wrong, []);
    assert.ok($('.pub-item a[href*="/people/"]').length > 0, 'member names link to person pages');
  });

  test(`${lang}: Korean text is marked lang="ko" only on the English pages`, () => {
    const $ = page(path('presentations'));
    const korean = $('.pub-item .yr-title').filter((_, el) => HANGUL.test($(el).text()));
    assert.ok(korean.length > 0);
    korean.each((_, el) => assert.equal($(el).attr('lang'), lang === 'en' ? 'ko' : undefined));
  });
}
