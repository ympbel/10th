import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveYear } from '../../src/lib/year-panel-core.ts';
import { YEARS } from '../../src/lib/years.ts';

test('resolveYear reads a #y<year> hash naming one of the years', () => {
  assert.equal(resolveYear('#y2024', YEARS, 2026), 2024);
  assert.equal(resolveYear('#y2016', YEARS, 2026), 2016);
});

test('resolveYear falls back for a year outside the list', () => {
  assert.equal(resolveYear('#y1999', YEARS, 2026), 2026);
  assert.equal(resolveYear('#y2027', YEARS, 2026), 2026);
});

test('resolveYear falls back for any other hash shape', () => {
  assert.equal(resolveYear('#2024', YEARS, 2026), 2026);
  assert.equal(resolveYear('', YEARS, 2026), 2026);
  assert.equal(resolveYear('#y', YEARS, 2026), 2026);
  assert.equal(resolveYear('#y2024x', YEARS, 2026), 2026);
  assert.equal(resolveYear('#y02024', YEARS, 2026), 2026);
  assert.equal(resolveYear('y2024', YEARS, 2026), 2026);
});
