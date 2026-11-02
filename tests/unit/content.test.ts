import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  groupBy,
  groupByYear,
  sortByYearDesc,
  sortMembersByDegree,
  sortMembersByJoined,
  yearMonth,
} from '../../src/lib/content.ts';

const ids = (entries: { id: string }[]) => entries.map((e) => e.id);

const items = [
  { id: 'y2021-o2', data: { year: 2021, order: 2 } },
  { id: 'y2023-o1', data: { year: 2023, order: 1 } },
  { id: 'y2021-none', data: { year: 2021 } },
  { id: 'y2022-o5', data: { year: 2022, order: 5 } },
  { id: 'y2021-o1', data: { year: 2021, order: 1 } },
];

test('sortByYearDesc() puts the newest year first and keeps sheet order within a year', () => {
  assert.deepEqual(ids(sortByYearDesc(items)), ['y2023-o1', 'y2022-o5', 'y2021-o1', 'y2021-o2', 'y2021-none']);
  assert.equal(items[0].id, 'y2021-o2', 'the input array is left as it was');
});

test('groupByYear() keys run newest first, each group in ascending order with no order last', () => {
  const groups = groupByYear(items);
  assert.deepEqual([...groups.keys()], [2023, 2022, 2021]);
  assert.deepEqual(ids(groups.get(2021) ?? []), ['y2021-o1', 'y2021-o2', 'y2021-none']);
});

test('groupBy() keeps the order in which each key first appears', () => {
  const talks = [
    { id: 't1', data: { conference: 'KSMP' } },
    { id: 't2', data: { conference: 'AAPM' } },
    { id: 't3', data: { conference: 'KSMP' } },
    { id: 't4', data: { conference: 'ASTRO' } },
  ];
  const groups = groupBy(talks, 'conference');
  assert.deepEqual([...groups.keys()], ['KSMP', 'AAPM', 'ASTRO']);
  assert.deepEqual(ids(groups.get('KSMP') ?? []), ['t1', 't3']);
});

const members = [
  { id: 'c-2022', data: { joined: '2022-03' } },
  { id: 'z-unknown', data: {} },
  { id: 'a-2019', data: { joined: '2019-09-01' } },
  { id: 'b-2020', data: { joined: '2020-03' } },
  { id: 'a-unknown', data: {} },
  { id: 'a-2020', data: { joined: '2020-03' } },
];

test("sortMembersByJoined(…, 'asc') puts the oldest join first and members without joined last", () => {
  assert.deepEqual(ids(sortMembersByJoined(members, 'asc')), [
    'a-2019',
    'a-2020',
    'b-2020',
    'c-2022',
    'a-unknown',
    'z-unknown',
  ]);
  assert.equal(members[0].id, 'c-2022', 'the input array is left as it was');
});

test("sortMembersByJoined(…, 'desc') puts the newest join first and still members without joined last", () => {
  assert.deepEqual(ids(sortMembersByJoined(members, 'desc')), [
    'c-2022',
    'a-2020',
    'b-2020',
    'a-2019',
    'a-unknown',
    'z-unknown',
  ]);
});

test("sortMembersByDegree(…, 'desc') puts the latest degree first, members without a degree date last", () => {
  const graduates = [
    { id: 'b-2021', data: { degree: { date: '2021-02' } } },
    { id: 'none', data: {} },
    { id: 'c-2024', data: { degree: { date: '2024-08-20' } } },
    { id: 'a-2021', data: { degree: { date: '2021-02' } } },
    { id: 'start-only', data: { degree: { start: '2023-03' } } },
  ];
  assert.deepEqual(ids(sortMembersByDegree(graduates, 'desc')), ['c-2024', 'a-2021', 'b-2021', 'none', 'start-only']);
  assert.deepEqual(ids(sortMembersByDegree(graduates, 'asc')), ['a-2021', 'b-2021', 'c-2024', 'none', 'start-only']);
});

test('yearMonth() also takes a month-only date', () => {
  assert.equal(yearMonth('2021-02'), '2021.02');
});
