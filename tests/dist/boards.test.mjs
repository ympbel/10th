import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { entries, list, page, scalar } from './helpers.mjs';

// The award, project and seminar boards (plan Task 12), in both languages: awards by year in tables with the
// challenge entries in their own section below, projects newest first with their acknowledgements and related papers,
// and seminars by year linking to the posts on the main site. Expected values are derived here from the content
// files, not through src/lib.

const HANGUL = /[가-힣]/;
const SEMINAR_PREFIX = 'https://ympbel.github.io/notice/seminar/';

const text = ($el) => $el.text().replace(/\s+/g, ' ').trim();
/** A frontmatter string as the page shows it: YAML double-quote escapes decoded, white space collapsed. */
const value = (e, key) => {
  const raw = scalar(e.fm, key);
  return raw === undefined ? undefined : JSON.parse(`"${raw}"`).replace(/\s+/g, ' ').trim();
};
const number = (e, key) => {
  const raw = scalar(e.fm, key);
  return raw === undefined ? undefined : Number(raw);
};
/** Distinct values in order of first appearance. */
const distinct = (values) => [...new Set(values)];
/** `YYYY-MM[-DD]` → `YYYY.MM`. */
const month = (date) => date.slice(0, 7).replace('-', '.');
/** Thousands separators: 640000 → `640,000`. */
const grouped = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const members = new Map(entries('members').map((m) => [m.id, m]));
const nameIn = (m, lang) => (lang === 'en' && value(m, 'name_en')) || value(m, 'name');

// Awards: newest year first, then the sheet order (`order` ascending, entries without one last).
const yearOf = (e) => number(e, 'year');
const orderOf = (e) => number(e, 'order') ?? Infinity;
const awards = [...entries('awards')].sort((a, b) => yearOf(b) - yearOf(a) || orderOf(a) - orderOf(b));
const awardYears = distinct(awards.map(yearOf));

// Challenges: newest year first, then the number at the end of the file name (the sheet order).
const seq = (e) => Number(/-(\d+)$/.exec(e.id)?.[1] ?? Infinity);
const challenges = [...entries('challenges')].sort((a, b) => yearOf(b) - yearOf(a) || seq(a) - seq(b));
const challengeYears = distinct(challenges.map(yearOf)).sort((a, b) => a - b);
const challengeRange =
  challengeYears.length === 1 ? `${challengeYears[0]}` : `${challengeYears[0]}–${challengeYears.at(-1)}`;

// Projects: latest start first, ties by file name.
const projects = [...entries('projects')].sort(
  (a, b) => value(b, 'start').localeCompare(value(a, 'start')) || a.id.localeCompare(b.id),
);
const papers = entries('papers');
/** The papers whose `projects` lists this project. */
const papersOf = (id) => papers.filter((p) => list(p.fm, 'projects').includes(id));

// Seminars: grouped by the post date's year (as the year pages count them), newest first; within a year by the date
// the row shows (the seminar day when the post gives it, else the post date), newest first.
const shown = (e) => value(e, 'event_date') ?? value(e, 'date');
const postNo = (e) => Number(/-(\d+)$/.exec(e.id)?.[1] ?? 0);
const seminars = [...entries('seminars')].sort(
  (a, b) =>
    value(b, 'date').slice(0, 4) - value(a, 'date').slice(0, 4) ||
    shown(b).localeCompare(shown(a)) ||
    value(b, 'date').localeCompare(value(a, 'date')) ||
    postNo(b) - postNo(a),
);
const seminarYearOf = (e) => Number(value(e, 'date').slice(0, 4));
const seminarYears = distinct(seminars.map(seminarYearOf));

// At import: 41 awards, 4 challenges, 15 projects, 431 seminars. The checks below count from the files, so adding a
// record never breaks them; this one only guards against an emptied or truncated folder.
test('the content holds at least the imported records', () => {
  assert.ok(awards.length >= 41, `${awards.length} awards`);
  assert.ok(challenges.length >= 4, `${challenges.length} challenges`);
  assert.ok(projects.length >= 15, `${projects.length} projects`);
  assert.ok(seminars.length >= 431, `${seminars.length} seminars`);
  assert.ok(projects.some((p) => papersOf(p.id).length > 0), 'a project with related papers');
  assert.ok(projects.some((p) => papersOf(p.id).length === 0), 'a project without related papers');
});

for (const [lang, dir] of [
  ['ko', ''],
  ['en', 'en'],
]) {
  const prefix = dir ? '/en' : '';
  const en = lang === 'en';

  /** Every year-index link on a page points at one element on the same page; returns the hrefs. */
  function indexHrefs($) {
    const hrefs = $('nav.pub-index a')
      .map((_, a) => $(a).attr('href'))
      .get();
    assert.ok(hrefs.length > 0, 'year index present');
    const missing = hrefs.filter((href) => !href.startsWith('#') || $(`[id="${href.slice(1)}"]`).length !== 1);
    assert.deepEqual(missing, []);
    return hrefs;
  }

  // ---------- Awards ----------

  test(`${lang}: awards board has ${awards.length} award rows in year tables, newest year first`, () => {
    const $ = page(join(dir, 'awards'));
    const rows = $('tbody tr').filter((_, el) => $(el).closest('#challenges').length === 0);
    assert.equal(rows.length, awards.length);
    const sections = $('section.pub-year');
    assert.deepEqual(
      sections.map((_, el) => $(el).attr('id')).get(),
      awardYears.map((y) => `y${y}`),
    );
    sections.each((_, el) => {
      const y = Number($(el).attr('id').slice(1));
      assert.equal(text($(el).children('h2').first()), String(y));
      assert.equal($(el).find('tbody tr').length, awards.filter((a) => yearOf(a) === y).length, `${y}`);
    });
    assert.deepEqual(indexHrefs($), [...awardYears.map((y) => `#y${y}`), '#challenges']);
  });

  test(`${lang}: award rows show recipient, conference, category and title, members linked`, () => {
    const $ = page(join(dir, 'awards'));
    const head = $('section.pub-year').first().find('thead th');
    assert.deepEqual(
      head.map((_, th) => text($(th))).get(),
      en ? ['Recipient', 'Conference', 'Category', 'Presentation'] : ['수상자', '학회', '구분', '발표명'],
    );
    const rows = $('section.pub-year tbody tr');
    const wrong = [];
    awards.forEach((a, i) => {
      const cells = rows.eq(i).children('td');
      const slug = scalar(a.fm, 'member');
      const m = slug && members.get(slug);
      const name = m ? nameIn(m, lang) : value(a, 'recipient');
      const category = (en && value(a, 'category_en')) || value(a, 'category');
      const got = cells.map((_, td) => text($(td))).get();
      const want = [name, value(a, 'conference'), category, value(a, 'title') ?? ''];
      if (JSON.stringify(got) !== JSON.stringify(want)) wrong.push(`${a.id}: ${got.join(' | ')}`);
      const link = cells.eq(0).find('a[data-member]');
      const linkable = m && scalar(m.fm, 'role') !== 'professor';
      if (linkable) {
        if (link.attr('data-member') !== slug || !link.attr('href')?.endsWith(`${prefix}/people/${slug}/`))
          wrong.push(`${a.id}: link ${link.attr('href')}`);
      } else if (link.length > 0) wrong.push(`${a.id}: unexpected link`);
    });
    assert.deepEqual(wrong, []);
    assert.ok($('section.pub-year tbody a[data-member]').length > 0);
  });

  test(`${lang}: the challenges section follows the years with ${challenges.length} rows`, () => {
    const $ = page(join(dir, 'awards'));
    const section = $('section#challenges');
    assert.equal(section.length, 1);
    // After every year section in document order.
    assert.equal($('section.pub-year, section#challenges').last().attr('id'), 'challenges');
    assert.equal(
      text(section.children('h2').first()),
      en ? `Challenge participation (${challengeRange})` : `챌린지 참가 (${challengeRange})`,
    );
    assert.deepEqual(
      section.find('thead th').map((_, th) => text($(th))).get(),
      en ? ['Host', 'Title', 'Objective', 'Link'] : ['주최', '제목', '목적', '링크'],
    );
    const rows = section.find('tbody tr');
    assert.equal(rows.length, challenges.length);
    challenges.forEach((c, i) => {
      const cells = rows.eq(i).children('th, td');
      assert.equal(text(cells.eq(0)), value(c, 'host'), c.id);
      assert.equal(text(cells.eq(1)), value(c, 'title'), c.id);
      assert.equal(text(cells.eq(2)), value(c, 'objective'), c.id);
      const a = cells.eq(3).find('a');
      const link = value(c, 'link');
      if (link) {
        assert.equal(a.attr('href'), link, c.id);
        assert.equal(a.attr('target'), '_blank');
        assert.equal(a.attr('rel'), 'noopener');
        assert.equal(text(a), en ? 'Link' : '링크');
      } else {
        assert.equal(a.length, 0, c.id);
      }
    });
  });

  test(`${lang}: Korean award text is marked lang="ko" only on the English page`, () => {
    const $ = page(join(dir, 'awards'));
    const korean = $('section.pub-year tbody td').filter((_, el) => HANGUL.test(text($(el))) && $(el).children().length === 0);
    assert.ok(korean.length > 0);
    korean.each((_, el) => assert.equal($(el).attr('lang'), en ? 'ko' : undefined, text($(el))));
    const names = $('section.pub-year tbody a[data-member]').filter((_, el) => HANGUL.test(text($(el))));
    names.each((_, el) => assert.equal($(el).attr('lang'), en ? 'ko' : undefined, text($(el))));
  });

  // ---------- Projects ----------

  test(`${lang}: projects board lists all ${projects.length} projects, latest start first`, () => {
    const $ = page(join(dir, 'projects'));
    const items = $('.project');
    assert.equal(items.length, projects.length);
    assert.deepEqual(
      items.map((_, el) => $(el).attr('id')).get(),
      projects.map((p) => p.id),
    );
  });

  test(`${lang}: each project shows its title, agency and program, institution, role, period, rate and budget`, () => {
    const $ = page(join(dir, 'projects'));
    const wrong = [];
    const check = (id, what, got, want) => {
      if (got !== want) wrong.push(`${id} ${what}: ${got} ≠ ${want}`);
    };
    for (const p of projects) {
      const item = $(`.project[id="${p.id}"]`);
      check(p.id, 'title', text(item.find('.project-title')), (en && value(p, 'title_en')) || value(p, 'title'));
      check(p.id, 'agency', text(item.find('.project-agency dd')), `${value(p, 'agency')} · ${value(p, 'program')}`);
      check(p.id, 'institution', text(item.find('.project-institution dd')), value(p, 'institution'));
      check(p.id, 'role', text(item.find('.project-role dd')), value(p, 'role'));
      const months = number(p, 'months');
      const period = `${month(value(p, 'start'))} – ${month(value(p, 'end'))}`;
      const length = months === undefined ? '' : en ? ` (${months} months)` : ` (${months}개월)`;
      check(p.id, 'period', text(item.find('.project-period')), period + length);
      const rate = value(p, 'participation_rate');
      check(p.id, 'rate', item.find('.project-rate dd').length ? text(item.find('.project-rate dd')) : undefined, rate);
      const year = number(p, 'budget_year_krw_thousand');
      const total = number(p, 'budget_total_krw_thousand');
      const budget = [
        year !== undefined && (en ? `Annual ${grouped(year)} thousand KRW` : `당해년도 ${grouped(year)}천원`),
        total !== undefined && (en ? `Total ${grouped(total)} thousand KRW` : `총 ${grouped(total)}천원`),
      ]
        .filter(Boolean)
        .join(' · ');
      const dd = item.find('.project-budget dd');
      check(p.id, 'budget', dd.length ? text(dd) : '', budget);
      if (budget) assert.ok(text(dd).includes(en ? 'thousand KRW' : '천원'), p.id);
    }
    assert.deepEqual(wrong, []);
    assert.ok($('.project-budget dd').text().includes(en ? 'thousand KRW' : '천원'));
  });

  test(`${lang}: acknowledgements fold away in a details element, Korean first`, () => {
    const $ = page(join(dir, 'projects'));
    for (const p of projects) {
      const details = $(`.project[id="${p.id}"] details.project-ack`);
      const texts = [value(p, 'acknowledgement_ko'), value(p, 'acknowledgement_en')].filter(Boolean);
      if (texts.length === 0) {
        assert.equal(details.length, 0, p.id);
        continue;
      }
      assert.equal(details.length, 1, p.id);
      assert.equal(text(details.children('summary')), en ? 'Acknowledgement' : '사사 문구');
      assert.deepEqual(
        details.find('p').map((_, el) => text($(el))).get(),
        texts,
        p.id,
      );
    }
  });

  test(`${lang}: a project with linked papers lists them under "related papers", the others have none`, () => {
    const $ = page(join(dir, 'projects'));
    for (const p of projects) {
      const linked = papersOf(p.id);
      const details = $(`.project[id="${p.id}"] details.related-papers`);
      if (linked.length === 0) {
        assert.equal(details.length, 0, p.id);
        continue;
      }
      assert.equal(details.length, 1, p.id);
      assert.equal(text(details.children('summary')), en ? `Related papers ${linked.length}` : `관련 논문 ${linked.length}편`);
      const titles = details
        .find('.yr-item .yr-title')
        .map((_, el) => text($(el)))
        .get();
      assert.deepEqual([...titles].sort(), linked.map((x) => value(x, 'title')).sort(), p.id);
    }
    // Member names in the related papers' author lines link to their person pages.
    const links = $('details.related-papers .yr-sub a[data-member]');
    assert.ok(links.length > 0);
    links.each((_, a) => assert.ok($(a).attr('href').endsWith(`${prefix}/people/${$(a).attr('data-member')}/`)));
  });

  test(`${lang}: Korean project text is marked lang="ko" only on the English page`, () => {
    const $ = page(join(dir, 'projects'));
    const korean = $('.project-title, .project dd').filter((_, el) => HANGUL.test(text($(el))));
    assert.ok(korean.length > 0);
    korean.each((_, el) => {
      const marked = $(el).attr('lang') ?? $(el).find('[lang]').first().attr('lang');
      assert.equal(marked, en ? 'ko' : undefined, text($(el)));
    });
  });

  // ---------- Seminars ----------

  test(`${lang}: seminars board has ${seminars.length} rows in year tables, newest year first`, () => {
    const $ = page(join(dir, 'activity', 'seminars'));
    assert.equal($('tbody tr').length, seminars.length);
    const sections = $('section.pub-year');
    assert.deepEqual(
      sections.map((_, el) => $(el).attr('id')).get(),
      seminarYears.map((y) => `y${y}`),
    );
    sections.each((_, el) => {
      const y = Number($(el).attr('id').slice(1));
      assert.equal(text($(el).children('h2').first()), String(y));
      assert.equal($(el).find('tbody tr').length, seminars.filter((s) => seminarYearOf(s) === y).length, `${y}`);
    });
    assert.deepEqual(indexHrefs($), seminarYears.map((y) => `#y${y}`));
  });

  test(`${lang}: seminar rows show the date, the title linking to the main site's post, and the presenter`, () => {
    const $ = page(join(dir, 'activity', 'seminars'));
    assert.deepEqual(
      $('section.pub-year').first().find('thead th').map((_, th) => text($(th))).get(),
      en ? ['Date', 'Title', 'Presenter'] : ['날짜', '제목', '발표자'],
    );
    const rows = $('tbody tr');
    const wrong = [];
    seminars.forEach((s, i) => {
      const cells = rows.eq(i).children('th, td');
      const got = cells.map((_, td) => text($(td))).get();
      const want = [shown(s).replaceAll('-', '.'), value(s, 'title'), value(s, 'presenter') ?? ''];
      if (JSON.stringify(got) !== JSON.stringify(want)) wrong.push(`${s.id}: ${got.join(' | ')}`);
      const a = cells.eq(1).find('a');
      if (a.attr('href') !== value(s, 'source_url')) wrong.push(`${s.id}: href ${a.attr('href')}`);
    });
    assert.deepEqual(wrong, []);
    const links = $('tbody a');
    assert.equal(links.length, seminars.length);
    links.each((_, a) => {
      assert.ok($(a).attr('href').startsWith(SEMINAR_PREFIX), $(a).attr('href'));
      assert.equal($(a).attr('target'), '_blank');
      assert.equal($(a).attr('rel'), 'noopener');
    });
  });

  test(`${lang}: the seminars board says where the posts live`, () => {
    const $ = page(join(dir, 'activity', 'seminars'));
    assert.equal(
      text($('.pub-note').first()),
      en ? "Seminar posts live on the MPBEL site's seminar board." : '세미나 본문은 MPBEL 사이트 세미나 게시판에 있습니다.',
    );
  });

  test(`${lang}: Korean seminar text is marked lang="ko" only on the English page`, () => {
    const $ = page(join(dir, 'activity', 'seminars'));
    const korean = $('tbody td').filter((_, el) => HANGUL.test(text($(el))));
    assert.ok(korean.length > 0);
    korean.each((_, el) => {
      const marked = $(el).attr('lang') ?? $(el).find('[lang]').first().attr('lang');
      assert.equal(marked, en ? 'ko' : undefined, text($(el)));
    });
  });
}
