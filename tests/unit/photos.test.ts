import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHOTO_KINDS, photoKinds, photoYears, sortPhotos } from '../../src/lib/photos.ts';

// The photo board's tabs and filter pages come from the values the photos hold: a year or kind without photos gets
// no tab and no page, and with no photos at all there are none (Review Focus 4).

type Kind = (typeof PHOTO_KINDS)[number];
const photo = (id: string, year: number, kind: Kind, date?: string) => ({ id, data: { year, kind, date } });

test('PHOTO_KINDS lists the six kinds in the schema order', () => {
  assert.deepEqual([...PHOTO_KINDS], ['lab-meeting', 'conference', 'retreat', 'graduation', 'equipment', 'other']);
});

test('photoYears() gives each year that has photos once, newest first', () => {
  const photos = [photo('a', 2022, 'other'), photo('b', 2025, 'retreat'), photo('c', 2022, 'conference')];
  assert.deepEqual(photoYears(photos), [2025, 2022]);
  assert.deepEqual(photoYears([]), []);
});

test('photoKinds() gives each kind that has photos once, in the schema order', () => {
  const photos = [photo('a', 2022, 'other'), photo('b', 2025, 'conference'), photo('c', 2024, 'other')];
  assert.deepEqual(photoKinds(photos), ['conference', 'other']);
  assert.deepEqual(photoKinds([]), []);
});

test('sortPhotos() puts the newest first: by year, then date (undated last in its year), then file name', () => {
  const photos = [
    photo('2024-b', 2024, 'other'),
    photo('2024-a', 2024, 'other'),
    photo('2025-x', 2025, 'other', '2025-01-10'),
    photo('2024-dated-old', 2024, 'other', '2024-02'),
    photo('2024-dated-new', 2024, 'other', '2024-11-03'),
  ];
  assert.deepEqual(
    sortPhotos(photos).map((p) => p.id),
    ['2025-x', '2024-dated-new', '2024-dated-old', '2024-a', '2024-b'],
  );
  assert.equal(photos[0].id, '2024-b', 'the input is left as it was');
});
