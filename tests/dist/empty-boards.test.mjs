import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, DIST, entries, exists, page, scalar } from './helpers.mjs';

// The boards that start empty (plan Task 13), in both languages: 워크샵, 사진 and Comments. A board lists its records
// when its folder has any, and otherwise shows the empty state: the i18n sentence, then the record format (every key
// of the folder's template, and the template's path). The photo board makes a page per year and per kind that has
// photos, and none otherwise; the comments board always ends with the how-to-leave section. Expected values come
// from the content files. Today the three folders hold only their templates, so these tests check the empty boards:
// that build is the proof for Review Focus 4 (collections with only a template build, and the boards say so).

const CONTENT = fileURLToPath(new URL('../../src/content/', import.meta.url));
const LANGS = [
  ['ko', ''],
  ['en', 'en/'],
];
const EMPTY = {
  ko: '아직 기록이 없습니다. 추가하는 법은 README를 참고하세요.',
  en: 'No records yet. See the README for how to add one.',
};
const UNDECIDED = {
  ko: '댓글을 남기는 방법은 아직 정해지지 않았습니다.',
  en: 'How to leave a comment has not been decided yet.',
};
const BOARDS = [
  { collection: 'workshops', path: 'activity/workshops', item: 'article.workshop' },
  { collection: 'photos', path: 'archive/photos', item: '.photo-grid figure' },
  { collection: 'comments', path: 'archive/comments', item: 'article.comment' },
];

const text = ($el) => $el.text().replace(/\s+/g, ' ').trim();
/** The frontmatter keys a template sets, in order (comment lines and list items skipped). */
const templateKeys = (collection) => {
  const fm = readFileSync(join(CONTENT, collection, '_template.md'), 'utf8').split(/^---$/m)[1];
  return [...fm.matchAll(/^([a-z_]+):/gm)].map((m) => m[1]);
};
/** The sub-folders of a built folder (the pages under a board). */
const subfolders = (path) => {
  const dir = join(DIST, path);
  return existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
};

const photos = entries('photos');
const photoYears = [...new Set(photos.map((p) => scalar(p.fm, 'year')))];
const photoKinds = [...new Set(photos.map((p) => scalar(p.fm, 'kind')))];

for (const [lang, prefix] of LANGS) {
  for (const { collection, path, item } of BOARDS) {
    const n = entries(collection).length;

    test(`${lang} ${collection}: ${n === 0 ? 'the empty state with the record format' : `${n} records, no empty state`}`, () => {
      assert.ok(exists(prefix + path), `${prefix + path}/index.html`);
      const $ = page(prefix + path);
      const empty = $('.contents .empty-state');
      if (n > 0) {
        assert.equal(empty.length, 0);
        assert.equal($(`.contents ${item}`).length, n);
        return;
      }
      assert.equal(empty.length, 1);
      assert.equal($(`.contents ${item}`).length, 0);
      assert.equal(text(empty.find('.empty-lead')), EMPTY[lang]);
      assert.ok(
        empty.find('code').filter((_, el) => $(el).text() === `src/content/${collection}/_template.md`).length === 1,
        'the template path',
      );
      const keys = empty.find('dl dt code').map((_, el) => $(el).text()).get();
      assert.deepEqual(keys, templateKeys(collection));
      assert.equal(empty.find('dl dd').length, empty.find('dl dt').length);
      empty.find('dl dd').each((_, el) => assert.notEqual(text($(el)), ''));
    });
  }

  test(`${lang} photos: a page per year and per kind that has photos (${photoYears.length} years, ${photoKinds.length} kinds)`, () => {
    assert.ok(exists(`${prefix}archive/photos`));
    assert.deepEqual(
      subfolders(`${prefix}archive/photos`).sort(),
      [...photoYears, ...(photoKinds.length > 0 ? ['k'] : [])].sort(),
    );
    assert.deepEqual(subfolders(`${prefix}archive/photos/k`).sort(), [...photoKinds].sort());
    for (const year of photoYears) {
      const $ = page(`${prefix}archive/photos/${year}`);
      assert.equal($('.photo-grid figure').length, photos.filter((p) => scalar(p.fm, 'year') === year).length, year);
      assert.equal($(`.photo-tabs a[aria-current="page"]`).attr('href'), `${BASE}/${prefix}archive/photos/${year}/`);
    }
    for (const kind of photoKinds) {
      const $ = page(`${prefix}archive/photos/k/${kind}`);
      assert.equal($('.photo-grid figure').length, photos.filter((p) => scalar(p.fm, 'kind') === kind).length, kind);
      assert.equal($(`.photo-tabs a[aria-current="page"]`).attr('href'), `${BASE}/${prefix}archive/photos/k/${kind}/`);
    }
  });

  test(`${lang} comments: the how-to-leave section ends the board and says the way is not decided`, () => {
    const $ = page(`${prefix}archive/comments`);
    const section = $('.contents section#how-to-leave');
    assert.equal(section.length, 1);
    assert.ok($('.contents').children().last().is(section), 'last in the content');
    assert.notEqual(text(section.children('h2')), '');
    assert.equal(text(section.children('p')), UNDECIDED[lang]);
  });
}

test('the board templates write site-root paths, without the base', () => {
  for (const { collection } of BOARDS) {
    const template = readFileSync(join(CONTENT, collection, '_template.md'), 'utf8');
    assert.ok(!template.includes(BASE), `${collection}/_template.md mentions ${BASE}`);
  }
});
