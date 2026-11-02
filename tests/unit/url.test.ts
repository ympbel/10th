import { test } from 'node:test';
import assert from 'node:assert/strict';
import { url } from '../../src/lib/url.ts';

// Under `node --test` there is no `import.meta.env`, so `url()` uses its default base, the `/10th` the site is
// deployed under.
test('url() puts the site root under the base', () => {
  assert.equal(url('/'), '/10th/');
});

test('url() prefixes page and file paths with the base', () => {
  assert.equal(url('/people/students/'), '/10th/people/students/');
  assert.equal(url('/images/site/logo.png'), '/10th/images/site/logo.png');
});
