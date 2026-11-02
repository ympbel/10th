import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BASE, DIST, entries, exists, list, nested, page, scalar } from './helpers.mjs';

// The people boards and person pages (plan Task 10), in both languages: 학생 현황 (faculty, then student cards),
// 졸업 현황 (degree holders table, then former members), and one page per non-professor member. Expected values are
// derived here from the content files, not through src/lib.

const YEARS = Array.from({ length: 11 }, (_, i) => 2016 + i);

const members = entries('members');
const role = (m) => scalar(m.fm, 'role');
const joinedOf = (m) => scalar(m.fm, 'joined');
const degreeDateOf = (m) => nested(m.fm, 'degree', 'date');
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** A sorted copy by a date field: `sign` 1 = oldest first, -1 = newest first; a missing date last, ties by id. */
function byDate(items, dateOf, sign) {
  return [...items].sort((a, b) => {
    const x = dateOf(a);
    const y = dateOf(b);
    if (x !== y) {
      if (x === undefined) return 1;
      if (y === undefined) return -1;
      return x < y ? -sign : sign;
    }
    return byId(a, b);
  });
}

const professors = members
  .filter((m) => role(m) === 'professor')
  .sort((a, b) => Number(scalar(a.fm, 'order')) - Number(scalar(b.fm, 'order')));
const students = byDate(
  members.filter((m) => role(m) === 'student'),
  joinedOf,
  1,
);
const graduates = byDate(members.filter(degreeDateOf), degreeDateOf, -1);
const formers = byDate(
  members.filter((m) => role(m) === 'former'),
  joinedOf,
  -1,
);
const persons = members.filter((m) => role(m) !== 'professor');
const personIds = new Set(persons.map((m) => m.id));

const papers = entries('papers');
const presentations = entries('presentations');
const awards = entries('awards');

/** A member's records as the card and the person page count them: papers from 2016 on that list the member,
 * presentations that list the member, awards whose `member` is the member. */
function countsOf(id) {
  return {
    papers: papers.filter((p) => Number(scalar(p.fm, 'year')) >= 2016 && list(p.fm, 'members').includes(id)).length,
    presentations: presentations.filter((p) => list(p.fm, 'members').includes(id)).length,
    awards: awards.filter((a) => scalar(a.fm, 'member') === id).length,
  };
}

/** `YYYY-MM[-DD]` → `YYYY.MM`. */
const month = (date) => date.slice(0, 7).replace('-', '.');
const text = ($el) => $el.text().replace(/\s+/g, ' ').trim();

// No literal counts: adding a member file (README 5.1) must not fail the suite. The sets above are derived from
// src/content/members; the tests check the built pages against them.
test('the content holds members for every board, each a professor or a person with a page', () => {
  assert.ok(professors.length > 0, 'professors');
  assert.ok(students.length > 0, 'students');
  assert.ok(graduates.length > 0, 'graduates');
  assert.ok(formers.length > 0, 'formers');
  assert.equal(professors.length + persons.length, members.length);
});

test('one person page per non-professor member in each language, none for professors, no others', () => {
  const missing = persons.flatMap((m) => [`people/${m.id}`, `en/people/${m.id}`]).filter((p) => !exists(p));
  assert.deepEqual(missing, []);
  const extra = professors.flatMap((m) => [`people/${m.id}`, `en/people/${m.id}`]).filter((p) => exists(p));
  assert.deepEqual(extra, []);
  const boards = new Set(['students', 'alumni']);
  for (const dir of ['people', join('en', 'people')]) {
    const built = readdirSync(join(DIST, dir), { withFileTypes: true })
      .filter((d) => d.isDirectory() && !boards.has(d.name))
      .map((d) => d.name)
      .sort();
    assert.deepEqual(built, [...personIds].sort(), dir);
  }
});

for (const [lang, prefix] of [
  ['ko', ''],
  ['en', '/en'],
]) {
  const dir = prefix.slice(1);
  const at = (...parts) => join(dir, ...parts);
  const href = (id) => `${BASE}${prefix}/people/${id}/`;
  const L = lang === 'en'
    ? {
        joinedUnknown: 'Joined: unknown',
        counts: (c) => `Papers ${c.papers} · Presentations ${c.presentations} · Awards ${c.awards}`,
        noRecords: 'No records',
        note: 'Papers are listed only where this person is first, co-first or corresponding author.',
        roles: { student: 'Student', alumni: 'Alumni', former: 'Former member' },
        boards: { students: 'Students', alumni: 'Alumni' },
      }
    : {
        joinedUnknown: '합류 연도 미상',
        counts: (c) => `논문 ${c.papers} · 발표 ${c.presentations} · 수상 ${c.awards}`,
        noRecords: '기록 없음',
        note: '논문은 1저자·공동 1저자·교신저자인 것만 모았습니다.',
        roles: { student: '재학', alumni: '졸업', former: '거쳐 간 구성원' },
        boards: { students: '학생 현황', alumni: '졸업 현황' },
      };
  /** The name a page shows first: the English name on English pages when there is one, else the Korean name. */
  const shownName = (m) => (lang === 'en' && scalar(m.fm, 'name_en')) || scalar(m.fm, 'name');

  test(`${lang}: students page lists the faculty in order, the advisor linking to the main site`, () => {
    const $ = page(at('people', 'students'));
    const items = $('.professors li');
    assert.equal(items.length, professors.length);
    items.each((i, li) => assert.ok(text($(li)).includes(scalar(professors[i].fm, 'name')), `row ${i + 1}`));
    const link = items.first().find('a[href*="ympbel.github.io/member/professor"]');
    assert.equal(link.length, 1);
    assert.equal(link.attr('target'), '_blank');
    assert.match(link.attr('rel'), /noopener/);
    assert.equal($('.professors a[href*="/people/"]').length, 0, 'professors have no person pages');
  });

  test(`${lang}: students page has one card per student, earliest join first, each linking to the person page`, () => {
    const $ = page(at('people', 'students'));
    const cards = $('.member-card');
    assert.equal(cards.length, students.length);
    assert.deepEqual(
      cards.map((_, c) => $(c).attr('data-member')).get(),
      students.map((m) => m.id),
    );
    cards.each((_, c) => {
      const id = $(c).attr('data-member');
      assert.equal($(c).find(`a[href="${href(id)}"]`).length >= 1, true, id);
    });
  });

  test(`${lang}: cards show the join month or that it is unknown, and the record counts`, () => {
    const $ = page(at('people', 'students'));
    const unknown = students.filter((m) => !joinedOf(m));
    assert.ok(unknown.length > 0, 'the content has a student without a join date');
    for (const m of students) {
      const card = text($(`.member-card[data-member="${m.id}"]`));
      const joined = joinedOf(m);
      if (joined) {
        assert.ok(card.includes(month(joined)), `${m.id}: ${card}`);
        assert.ok(!card.includes(L.joinedUnknown), m.id);
      } else {
        assert.ok(card.includes(L.joinedUnknown), `${m.id}: ${card}`);
      }
      assert.ok(card.includes(L.counts(countsOf(m.id))), `${m.id}: ${card}`);
    }
  });

  test(`${lang}: an ORCID link appears exactly on the cards of members with an ORCID`, () => {
    const $ = page(at('people', 'students'));
    for (const m of students) {
      const orcid = scalar(m.fm, 'orcid');
      const links = $(`.member-card[data-member="${m.id}"] a[href^="https://orcid.org/"]`);
      assert.equal(links.length, orcid ? 1 : 0, m.id);
      if (orcid) assert.equal(links.attr('href'), `https://orcid.org/${orcid}`, m.id);
    }
    assert.ok($('a[href^="https://orcid.org/"]').length > 0);
  });

  test(`${lang}: alumni page has the degree holders table, newest degree first`, () => {
    const $ = page(at('people', 'alumni'));
    const rows = $('.alumni-table tbody tr');
    assert.equal(rows.length, graduates.length);
    assert.deepEqual(
      rows.map((_, tr) => $(tr).attr('data-member')).get(),
      graduates.map((m) => m.id),
    );
    rows.each((i, tr) => {
      const m = graduates[i];
      assert.equal($(tr).find(`a[href="${href(m.id)}"]`).length, 1, m.id);
      assert.ok(text($(tr)).includes(month(degreeDateOf(m))), m.id);
    });
  });

  test(`${lang}: alumni page lists the former members, latest join first`, () => {
    const $ = page(at('people', 'alumni'));
    const items = $('.former-list li');
    assert.equal(items.length, formers.length);
    assert.deepEqual(
      items.map((_, li) => $(li).attr('data-member')).get(),
      formers.map((m) => m.id),
    );
    items.each((i, li) => {
      const m = formers[i];
      assert.equal($(li).find(`a[href="${href(m.id)}"]`).length, 1, m.id);
      if (joinedOf(m)) assert.ok(text($(li)).includes(month(joinedOf(m))), m.id);
    });
  });

  test(`${lang}: person pages show the member, their records and the papers note`, () => {
    for (const m of persons) {
      const $ = page(at('people', m.id));
      const r = role(m);
      assert.equal(text($('h1.cnt_title')), shownName(m), m.id);
      const board = r === 'student' ? 'students' : 'alumni';
      assert.equal(text($('.snb .vNav li.active a')), L.boards[board], m.id);
      assert.deepEqual($('.loca li').map((_, li) => text($(li))).get(), ['', 'PEOPLE', shownName(m)], m.id);
      const head = $('.person-head');
      assert.equal(head.length, 1, m.id);
      assert.ok(text(head).includes(L.roles[r]), `${m.id}: ${text(head)}`);
      const orcid = scalar(m.fm, 'orcid');
      assert.equal(head.find('a[href^="https://orcid.org/"]').length, orcid ? 1 : 0, m.id);
      if (degreeDateOf(m)) assert.ok(text(head).includes(month(degreeDateOf(m))), m.id);

      const c = countsOf(m.id);
      for (const part of ['papers', 'presentations', 'awards']) {
        const section = $(`section[data-part="${part}"]`);
        assert.equal(section.length, 1, `${m.id} ${part}`);
        assert.ok(text(section.children('h2')).includes(String(c[part])), `${m.id} ${part}`);
        assert.equal(section.find('.yr-item').length, c[part], `${m.id} ${part}`);
        const empty = section.find('.empty');
        if (c[part] === 0) assert.equal(text(empty), L.noRecords, `${m.id} ${part}`);
        else assert.equal(empty.length, 0, `${m.id} ${part}`);
      }
      assert.equal(text($('.person-note')), L.note, m.id);
    }
  });

  test(`${lang}: on a person page each paper's author line links the member's own page`, () => {
    const m = persons.find((x) => countsOf(x.id).papers > 0);
    const $ = page(at('people', m.id));
    const rows = $('section[data-part="papers"] .yr-item');
    assert.equal(rows.length, countsOf(m.id).papers);
    rows.each((_, row) => {
      const links = $(row).find('.yr-sub a[href*="/people/"]');
      assert.ok(links.length >= 1, m.id);
      assert.ok(links.is(`[href="${href(m.id)}"]`), m.id);
    });
  });

  test(`${lang}: names on the year pages link to the person pages`, () => {
    for (const y of YEARS) {
      const $ = page(at('years', String(y)));
      $('[data-member]').each((_, el) => {
        const id = $(el).attr('data-member');
        assert.equal(el.tagName, 'a', `${y} ${id}`);
        // A name link, a member's name in a paper's author line, or a name chip under a photo.
        assert.ok($(el).hasClass('name') || $(el).closest('.yr-sub, .member-chips').length === 1, `${y} ${id}`);
        assert.equal($(el).attr('href'), href(id), `${y} ${id}`);
        assert.ok(personIds.has(id), `${y} ${id}`);
      });
    }
    const $ = page(at('years', '2024'));
    assert.ok($('a.name[data-member]').length > 0);
  });
}

test('en: a Korean department stays in Korean on the English students page, marked lang="ko"', () => {
  const $ = page(join('en', 'people', 'students'));
  const withDept = students.filter((m) => scalar(m.fm, 'department') && !scalar(m.fm, 'department_en'));
  assert.ok(withDept.length > 0);
  for (const m of withDept) {
    const dept = scalar(m.fm, 'department');
    const marked = $(`.member-card[data-member="${m.id}"] [lang="ko"]`).filter((_, el) => text($(el)) === dept);
    assert.ok(marked.length >= 1, `${m.id}: ${dept}`);
  }
});
