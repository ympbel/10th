import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAB_START, YEARS, barHeights, isLabEra, labCounts, yearStats } from '../../src/lib/years.ts';

// Fake records in the shape of Astro entries (`id` + `data`); only the fields the helpers read.
const data = {
  members: [
    { id: 'prof-a', data: { role: 'professor' } },
    { id: 'joined-2021', data: { role: 'student', joined: '2021-03' } },
    { id: 'joined-2022-a', data: { role: 'student', joined: '2022-03-02' } },
    { id: 'joined-2022-b', data: { role: 'alumni', joined: '2022-09', degree: { date: '2024-08' } } },
    { id: 'degree-2022', data: { role: 'alumni', joined: '2020-03', degree: { start: '2020-03', date: '2022-08' } } },
    { id: 'degree-pending', data: { role: 'former', joined: '2019-01', degree: { start: '2019-03' } } },
    { id: 'no-joined', data: { role: 'student' } },
  ],
  papers: [
    { id: 'p-2015', data: { year: 2015 } },
    { id: 'p-2021', data: { year: 2021 } },
    { id: 'p-2022-a', data: { year: 2022 } },
    { id: 'p-2022-b', data: { year: 2022 } },
  ],
  presentations: [
    { id: 't-2022-a', data: { year: 2022 } },
    { id: 't-2022-b', data: { year: 2022 } },
    { id: 't-2022-c', data: { year: 2022 } },
    { id: 't-2023', data: { year: 2023 } },
  ],
  awards: [
    { id: 'a-2016', data: { year: 2016 } },
    { id: 'a-2022', data: { year: 2022 } },
  ],
  projects: [
    { id: 'ends-2022', data: { start: '2020-03-01', end: '2022-02-28' } },
    { id: 'starts-2022', data: { start: '2022-09-01', end: '2025-08-31' } },
    { id: 'starts-2023', data: { start: '2023-01-01', end: '2024-12-31' } },
    { id: 'ends-2021', data: { start: '2018-04-01', end: '2021-12-31' } },
  ],
};

const ids = (entries: { id: string }[]) => entries.map((e) => e.id);

test('YEARS runs from the lab start, 2016, to 2026', () => {
  assert.equal(LAB_START, 2016);
  assert.deepEqual(YEARS, [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
  assert.equal(isLabEra(2015), false);
  assert.equal(isLabEra(2016), true);
});

test('yearStats() counts and collects one year', () => {
  const stats = yearStats(2022, data);
  assert.equal(stats.papers, 2);
  assert.equal(stats.presentations, 3);
  assert.equal(stats.awards, 1);
  assert.deepEqual(ids(stats.joined), ['joined-2022-a', 'joined-2022-b']);
  assert.deepEqual(ids(stats.degrees), ['degree-2022']);
  assert.deepEqual(ids(stats.projectsRunning), ['ends-2022', 'starts-2022']);
});

// Review Focus 1: a member whose join date had no year has no `joined`; no year claims them.
test('yearStats() puts a member without joined in no year', () => {
  for (const y of YEARS) {
    assert.ok(!ids(yearStats(y, data).joined).includes('no-joined'), `no-joined listed as joined in ${y}`);
  }
});

test('barHeights() draws 0 as 2px, the maximum as 134px and the rest in proportion', () => {
  assert.deepEqual(barHeights([0, 25, 67]), [2, 50, 134]);
  assert.deepEqual(barHeights([0, 0, 0]), [2, 2, 2]);
});

test('labCounts() counts non-professors, degrees and papers from 2016 on', () => {
  assert.deepEqual(labCounts(data), {
    members: 6,
    degrees: 2,
    papers: 3,
    presentations: 4,
    awards: 2,
    projects: 4,
  });
});
