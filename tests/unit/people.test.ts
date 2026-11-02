import { test } from 'node:test';
import assert from 'node:assert/strict';
import { displayName, field, itemsOf, otherName, personPath } from '../../src/lib/people.ts';
import { langOf } from '../../src/lib/locale.ts';
import { yearMonth } from '../../src/lib/content.ts';

test('itemsOf() collects the papers, presentations and awards that name the member', () => {
  const data = {
    papers: [
      { id: 'paper-both', data: { members: ['gildong-hong', 'cheolsu-kim'] } },
      { id: 'paper-other', data: { members: ['cheolsu-kim'] } },
      { id: 'paper-solo', data: { members: ['gildong-hong'] } },
      { id: 'paper-none', data: { members: [] } },
    ],
    presentations: [
      { id: 'talk-mine', data: { members: ['gildong-hong'] } },
      { id: 'talk-other', data: { members: ['cheolsu-kim'] } },
    ],
    awards: [
      { id: 'award-mine', data: { member: 'gildong-hong' } },
      { id: 'award-unlinked', data: {} },
      { id: 'award-other', data: { member: 'cheolsu-kim' } },
    ],
  };
  const items = itemsOf('gildong-hong', data);
  assert.deepEqual(
    items.papers.map((p) => p.id),
    ['paper-both', 'paper-solo'],
  );
  assert.deepEqual(
    items.presentations.map((p) => p.id),
    ['talk-mine'],
  );
  assert.deepEqual(
    items.awards.map((a) => a.id),
    ['award-mine'],
  );
});

test('field() shows the Korean value when there is no English one', () => {
  assert.equal(field({ department: '의학과' }, 'department', 'en'), '의학과');
  assert.equal(field({ department: '의학과', department_en: '' }, 'department', 'en'), '의학과');
});

test('field() shows the English value in English and the Korean value in Korean', () => {
  const entry = { department: '의학과', department_en: 'Medicine' };
  assert.equal(field(entry, 'department', 'en'), 'Medicine');
  assert.equal(field(entry, 'department', 'ko'), '의학과');
});

test('displayName() gives the Korean name in Korean and the English name, when set, in English', () => {
  assert.equal(displayName({ name: '홍길동', name_en: 'Gildong Hong' }, 'ko'), '홍길동');
  assert.equal(displayName({ name: '홍길동', name_en: 'Gildong Hong' }, 'en'), 'Gildong Hong');
  assert.equal(displayName({ name: '홍길동', name_en: '' }, 'en'), '홍길동');
});

test('otherName() gives the name a page shows second: English on Korean pages, Korean on English pages', () => {
  assert.equal(otherName({ name: '홍길동', name_en: 'Gildong Hong' }, 'ko'), 'Gildong Hong');
  assert.equal(otherName({ name: '홍길동', name_en: 'Gildong Hong' }, 'en'), '홍길동');
  // Without an English name the Korean name is already shown first, so there is no second name.
  assert.equal(otherName({ name: '홍길동', name_en: '' }, 'ko'), '');
  assert.equal(otherName({ name: '홍길동', name_en: '' }, 'en'), '');
});

test('personPath() is the site-root path of a person page', () => {
  assert.equal(personPath('gildong-hong'), '/people/gildong-hong/');
});

test('langOf() marks Korean text on English pages only', () => {
  assert.equal(langOf('의학과', 'en'), 'ko');
  assert.equal(langOf('Medicine', 'en'), undefined);
  assert.equal(langOf('의학과', 'ko'), undefined);
  assert.equal(langOf(undefined, 'en'), undefined);
  assert.equal(langOf('', 'en'), undefined);
});

test('yearMonth() shows a date as YYYY.MM', () => {
  assert.equal(yearMonth('2024-03-01'), '2024.03');
  assert.equal(yearMonth('2026-08'), '2026.08');
});
