import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MENU, sectionOf } from '../../src/lib/menu.ts';
import { localePath, otherLocaleHref } from '../../src/lib/locale.ts';
import { t } from '../../src/i18n/index.ts';

test('MENU has the six sections and eleven boards in menu order', () => {
  assert.deepEqual(
    MENU.map((s) => s.key),
    ['people', 'publication', 'award', 'project', 'activity', 'archive'],
  );
  assert.deepEqual(
    MENU.map((s) => s.label),
    ['PEOPLE', 'PUBLICATION', 'AWARD', 'PROJECT', 'ACTIVITY', 'ARCHIVE'],
  );
  assert.deepEqual(
    MENU.flatMap((s) => s.items.map((i) => i.key)),
    ['students', 'alumni', 'papers', 'patents', 'presentations', 'awards', 'projects', 'seminars', 'workshops', 'photos', 'comments'],
  );
});

test('every menu href is a site-root path that starts and ends with /', () => {
  for (const item of MENU.flatMap((s) => s.items)) {
    assert.match(item.href, /^\/.+\/$/, item.key);
    assert.ok(!item.href.startsWith('//'), item.key);
  }
  assert.equal(MENU.find((s) => s.key === 'award')?.items[0].href, '/awards/');
  assert.equal(MENU.find((s) => s.key === 'archive')?.items[1].href, '/archive/comments/');
});

test('menu items carry a Korean and an English label', () => {
  const people = MENU[0].items;
  assert.deepEqual(people[0].label, { ko: '학생 현황', en: 'Students' });
  assert.deepEqual(people[1].label, { ko: '졸업 현황', en: 'Alumni' });
  for (const item of MENU.flatMap((s) => s.items)) {
    assert.ok(item.label.ko && item.label.en, item.key);
  }
});

test('sectionOf() finds the section of a page path, with or without the base and /en', () => {
  assert.equal(sectionOf('/publication/papers/')?.key, 'publication');
  assert.equal(sectionOf('/awards/')?.key, 'award');
  assert.equal(sectionOf('/10th/en/projects/')?.key, 'project');
  assert.equal(sectionOf('/people/some-member/')?.key, 'people');
  assert.equal(sectionOf('/years/2026/'), undefined);
  assert.equal(sectionOf('/'), undefined);
});

test('localePath() prefixes /en for English only', () => {
  assert.equal(localePath('/years/2026/', 'en'), '/en/years/2026/');
  assert.equal(localePath('/years/2026/', 'ko'), '/years/2026/');
  assert.equal(localePath('/', 'en'), '/en/');
});

test('otherLocaleHref() points to the same page in the other language', () => {
  assert.equal(otherLocaleHref('/10th/people/students/'), '/10th/en/people/students/');
  assert.equal(otherLocaleHref('/10th/en/people/students/'), '/10th/people/students/');
  assert.equal(otherLocaleHref('/10th/'), '/10th/en/');
  assert.equal(otherLocaleHref('/10th/en/'), '/10th/');
  assert.equal(otherLocaleHref('/10th/en'), '/10th/');
});

/** The key paths of a nested object of strings, e.g. `footer.name`. */
function keyPaths(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? keyPaths(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

test('the Korean and English strings have the same keys, none empty', () => {
  assert.deepEqual(keyPaths(t('en')), keyPaths(t('ko')));
  for (const locale of ['ko', 'en'] as const) {
    const strings = t(locale) as unknown as Record<string, unknown>;
    for (const path of keyPaths(strings)) {
      const value = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], strings);
      assert.ok(typeof value === 'string' && value.trim() !== '', `${locale}: ${path}`);
    }
  }
});

test('the empty-state and no-records strings read as specified', () => {
  assert.equal(t('ko').empty, '아직 기록이 없습니다. 추가하는 법은 README를 참고하세요.');
  assert.equal(t('en').empty, 'No records yet. See the README for how to add one.');
  assert.equal(t('ko').noRecords, '기록 없음');
  assert.equal(t('en').noRecords, 'No records');
});

test('menu item labels are the board titles of each language', () => {
  for (const item of MENU.flatMap((s) => s.items)) {
    assert.equal(item.label.ko, t('ko').boards[item.key], item.key);
    assert.equal(item.label.en, t('en').boards[item.key], item.key);
  }
});
