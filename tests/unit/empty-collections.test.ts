import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesGlob } from 'node:path';
import { CONTENT_GLOB, isTemplate } from '../../src/lib/content-glob.ts';

// Every collection loads its folder through CONTENT_GLOB (src/content.config.ts), which leaves the templates out. A
// board whose folder holds only `_template.md` (워크샵, 사진, Comments at first) then gets no entries and shows its
// empty state, and the build does not fail (Review Focus 4).

/** Whether CONTENT_GLOB loads `path` (relative to a collection folder): it matches a positive pattern and no `!`
 * pattern, the way the glob loader reads the list. */
function loads(path: string): boolean {
  const positive = CONTENT_GLOB.filter((p) => !p.startsWith('!'));
  const negative = CONTENT_GLOB.filter((p) => p.startsWith('!')).map((p) => p.slice(1));
  return positive.some((p) => matchesGlob(path, p)) && !negative.some((p) => matchesGlob(path, p));
}

test('isTemplate() is true for a file whose name starts with `_`', () => {
  assert.equal(isTemplate('_template.md'), true);
  assert.equal(isTemplate('ko/_draft.md'), true);
  assert.equal(isTemplate('2024-01-x.md'), false);
  assert.equal(isTemplate('ko/home.md'), false);
  // Only the file name counts, not a folder name.
  assert.equal(isTemplate('_drafts/2024-01-x.md'), false);
});

test('the content glob leaves out `_`-prefixed files, at the top and in sub-folders', () => {
  assert.equal(loads('_template.md'), false);
  assert.equal(loads('ko/_template.md'), false);
  assert.equal(loads('2024-01-x.md'), true);
  assert.equal(loads('ko/home.md'), true);
  assert.equal(loads('notes.txt'), false);
});

test('the content glob and isTemplate() agree on every markdown file', () => {
  for (const path of ['_template.md', 'a/_b.md', '_drafts/x.md', '2024-01-x.md', 'ko/home.md', 'gildong-hong.md', 'x_y.md']) {
    assert.equal(loads(path), !isTemplate(path), path);
  }
});

test('a folder holding only its template yields no entries', () => {
  assert.deepEqual(['_template.md'].filter(loads), []);
  assert.deepEqual(['_template.md', '2026-02-20-winter-workshop.md'].filter(loads), ['2026-02-20-winter-workshop.md']);
});
