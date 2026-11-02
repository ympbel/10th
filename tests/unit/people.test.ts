import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  awardRecipient,
  bylinePieces,
  displayName,
  field,
  itemsOf,
  namedMember,
  otherName,
  personPath,
} from '../../src/lib/people.ts';
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

const recipients = new Map([
  ['gildong-hong', { data: { role: 'student', name: '홍길동', name_en: 'Gildong Hong' } }],
  ['jin-sung-kim', { data: { role: 'professor', name: '김진성', name_en: 'Jin Sung Kim' } }],
]);

test('awardRecipient() links a member recipient and gives the name in the page language', () => {
  const award = { recipient: '홍길동', member: 'gildong-hong' };
  assert.deepEqual(awardRecipient(award, recipients, 'ko'), { slug: 'gildong-hong', name: '홍길동' });
  assert.deepEqual(awardRecipient(award, recipients, 'en'), { slug: 'gildong-hong', name: 'Gildong Hong' });
});

test('awardRecipient() names a professor in the page language without a link (professors have no person page)', () => {
  const award = { recipient: '김진성', member: 'jin-sung-kim' };
  assert.deepEqual(awardRecipient(award, recipients, 'en'), { slug: undefined, name: 'Jin Sung Kim' });
  assert.deepEqual(awardRecipient(award, recipients, 'ko'), { slug: undefined, name: '김진성' });
});

test('awardRecipient() keeps the sheet string when no member matches', () => {
  assert.deepEqual(awardRecipient({ recipient: '외부 수상자' }, recipients, 'en'), {
    slug: undefined,
    name: '외부 수상자',
  });
  assert.deepEqual(awardRecipient({ recipient: '이름', member: 'no-such-file' }, recipients, 'en'), {
    slug: undefined,
    name: '이름',
  });
});

test('namedMember() gives a workshop or photo member in the page language, linked unless a professor', () => {
  assert.deepEqual(namedMember('gildong-hong', recipients, 'ko'), { slug: 'gildong-hong', name: '홍길동' });
  assert.deepEqual(namedMember('gildong-hong', recipients, 'en'), { slug: 'gildong-hong', name: 'Gildong Hong' });
  assert.deepEqual(namedMember('jin-sung-kim', recipients, 'en'), { slug: undefined, name: 'Jin Sung Kim' });
});

test('namedMember() fails on a slug that names no member file, naming the slug and the record', () => {
  assert.throws(() => namedMember('no-such-file', recipients, 'ko', 'photos/2026-x'), (err: Error) => {
    assert.match(err.message, /photos\/2026-x/);
    assert.match(err.message, /"no-such-file"/);
    assert.match(err.message, /src\/content\/members\//);
    return true;
  });
});

const authors = new Map([
  ['byong-su-choi', { data: { role: 'alumni', name: '최병수', name_en: 'Byong Su Choi', aliases: ['Byoung Su Choi'] } }],
  ['chae-seon-hong', { data: { role: 'student', name: '홍채선', name_en: 'Chaeseon Hong', aliases: [] } }],
  ['hyejin-lee', { data: { role: 'student', name: '이혜진', name_en: 'Hyejin Lee', aliases: [] } }],
  ['yongdo-yun', { data: { role: 'student', name: '윤 용도', name_en: 'Yongdo Yun', aliases: [] } }],
  ['jin-sung-kim', { data: { role: 'professor', name: '김진성', name_en: 'Jin Sung Kim', aliases: [] } }],
  ['twin-a', { data: { role: 'student', name: '김가', name_en: 'Ga Kim', aliases: ['G. Kim'] } }],
  ['twin-b', { data: { role: 'student', name: '김나', name_en: 'Na Kim', aliases: ['G. Kim'] } }],
]);
/** The pieces' text joined back: always the byline as written. */
const joined = (pieces: { text: string }[]) => pieces.map((p) => p.text).join('');

test('bylinePieces() links a name that matches one of the record\'s members, after the importer\'s normalization', () => {
  // Case, hyphens and spaces are ignored, as in scripts/import/names.py norm(); aliases count.
  assert.deepEqual(bylinePieces('Byoung-Su  CHOI', ['byong-su-choi'], authors), [
    { text: 'Byoung-Su  CHOI', slug: 'byong-su-choi' },
  ]);
  assert.deepEqual(bylinePieces('Chae-Seon Hong,', ['chae-seon-hong'], authors), [
    { text: 'Chae-Seon Hong', slug: 'chae-seon-hong' },
    { text: ',' },
  ]);
});

test('bylinePieces() splits a list on commas, semicolons and "and", keeping the separators as written', () => {
  const byline = 'Byong Su Choi, Sang Kyun Yoo and Chaeseon Hong; Jin Sung Kim';
  const pieces = bylinePieces(byline, ['byong-su-choi', 'chae-seon-hong'], authors);
  assert.equal(joined(pieces), byline);
  assert.deepEqual(pieces, [
    { text: 'Byong Su Choi', slug: 'byong-su-choi' },
    { text: ', Sang Kyun Yoo and ' },
    { text: 'Chaeseon Hong', slug: 'chae-seon-hong' },
    { text: '; Jin Sung Kim' },
  ]);
});

test('bylinePieces() matches a Korean byline against the Korean name, ignoring spaces', () => {
  const byline = '이혜진, 이삭, 윤용도, 김진성';
  const pieces = bylinePieces(byline, ['hyejin-lee', 'yongdo-yun', 'jin-sung-kim'], authors);
  assert.equal(joined(pieces), byline);
  assert.deepEqual(
    pieces.filter((p) => p.slug).map((p) => [p.text, p.slug]),
    [
      ['이혜진', 'hyejin-lee'],
      ['윤용도', 'yongdo-yun'],
    ],
  );
});

test('bylinePieces() links only the record\'s own members, never a professor or an ambiguous spelling', () => {
  // Not in this record's members: plain text even though the name matches a member file.
  assert.deepEqual(bylinePieces('Hyejin Lee', [], authors), [{ text: 'Hyejin Lee' }]);
  // Professors have no person page.
  assert.deepEqual(bylinePieces('Jin Sung Kim', ['jin-sung-kim'], authors), [{ text: 'Jin Sung Kim' }]);
  // A spelling two of the record's members share is not guessed.
  assert.deepEqual(bylinePieces('G. Kim', ['twin-a', 'twin-b'], authors), [{ text: 'G. Kim' }]);
  // A slug with no member file is skipped.
  assert.deepEqual(bylinePieces('Ga Kim', ['no-such-file'], authors), [{ text: 'Ga Kim' }]);
});

test('bylinePieces() gives nothing for an empty byline', () => {
  assert.deepEqual(bylinePieces('', ['hyejin-lee'], authors), []);
});
