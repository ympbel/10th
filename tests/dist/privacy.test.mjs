import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DIST, allHtmlFiles } from './helpers.mjs';

// The sheets in data/ hold contact details, birth dates and administrative columns that must never be published.
// The converter reads allowlisted columns only; these checks catch a leak in the content files (the public
// repository) and in the built pages.

const CONTENT = fileURLToPath(new URL('../../src/content/', import.meta.url));

// A mobile number with or without hyphens. The digit lookarounds keep it from matching inside longer numbers: grant
// and patent numbers in the imported content (`NRF-2010-0011771`, `10-2019-0123661`) contain `010-0011771` and
// `019-0123661`.
const PHONE = /(?<!\d)01[016789]-?\d{3,4}-?\d{4}(?!\d)/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;

// Headers of excluded sheet columns. `과학기술인` covers `과학기술인등록번호`. Bare `등록번호` is also the label of a
// patent's public registration number in patents/*.md `venue` (`등록번호: 10-1842943`), so it is allowed there only.
const COLUMN_WORDS = ['전화', 'Email', 'MBTI', '학번', '등록번호', '실무담당자', '생년월일', '과학기술인'];
const PATENT_WORDS = COLUMN_WORDS.filter((w) => w !== '등록번호');

// In the built pages a six-digit birth date (`/(?<!\d)\d{6}(?!\d)/`) cannot be told apart from legitimate numbers the
// boards show: 31 values in the imported content match it (patent `PCT/KR2009/006655`, grant numbers such as
// `A080756` in paper acknowledgements, budgets such as `640000`). So the pages are checked for the excluded columns'
// names instead, which only a leaked column would bring. `등록번호` is left out: the patents board shows it as a label.
// The footer's phone label is `TEL.`, so `전화` does not occur on a page unless a column leaks.
const PAGE_WORDS = ['전화', 'Email', 'MBTI', '생년월일', '학번', '실무담당자', '과학기술인'];

/** Content markdown files (relative to src/content/), templates (`_*.md`) excluded: a template may name an excluded
 * column to say it has no slot. */
function contentFiles() {
  return readdirSync(CONTENT, { recursive: true })
    .filter((f) => f.endsWith('.md') && !basename(f).startsWith('_'))
    .sort();
}

/** What in `text` looks like personal data: each word found, then `phone` / `email` when the pattern matches. */
function findings(text, words) {
  const found = words.filter((w) => text.includes(w));
  if (PHONE.test(text)) found.push('phone');
  if (EMAIL.test(text)) found.push('email');
  return found;
}

test('content files hold no excluded column names, phone numbers or e-mail addresses', () => {
  const files = contentFiles();
  assert.ok(files.length > 0, 'no content files found');
  const leaks = files.flatMap((file) => {
    const words = file.startsWith('patents/') ? PATENT_WORDS : COLUMN_WORDS;
    return findings(readFileSync(join(CONTENT, file), 'utf8'), words).map((what) => `${file}: ${what}`);
  });
  assert.deepEqual(leaks, []);
});

test('built pages hold no phone numbers, e-mail addresses or excluded column names', () => {
  const leaks = allHtmlFiles().flatMap((file) =>
    findings(readFileSync(file, 'utf8'), PAGE_WORDS).map((what) => `${relative(DIST, file)}: ${what}`),
  );
  assert.deepEqual(leaks, []);
});

test('the phone pattern catches mobile numbers but not grant or patent numbers', () => {
  for (const phone of ['010-1234-5678', '01012345678', '011-123-4567', 'tel:010-1234-5678']) {
    assert.ok(PHONE.test(phone), phone);
  }
  for (const number of ['NRF-2010-0011771', 'NFR-20100017477', '10-2019-0123661', 'cn=KOR1020110095970']) {
    assert.ok(!PHONE.test(number), number);
  }
});
