import { photoSchema } from '../content/schemas.ts';
import type { Entry } from './content.ts';

/** The photo kinds, in the schema's order: the order of the kind tabs on the photo board. */
export const PHOTO_KINDS = photoSchema.shape.kind.options;
export type PhotoKind = (typeof PHOTO_KINDS)[number];

/** The photo fields the board sorts and groups by. */
type PhotoLike = Entry<{ year: number; kind: PhotoKind; date?: string }>;

/** The years that have photos, newest first: the photo board's year tabs and year pages (none without photos). */
export function photoYears(photos: PhotoLike[]): number[] {
  return [...new Set(photos.map((p) => p.data.year))].sort((a, b) => b - a);
}

/** The kinds that have photos, in PHOTO_KINDS order: the kind tabs and kind pages (none without photos). */
export function photoKinds(photos: PhotoLike[]): PhotoKind[] {
  const present = new Set(photos.map((p) => p.data.kind));
  return PHOTO_KINDS.filter((kind) => present.has(kind));
}

/** A sorted copy, newest first: by year, then by date (within a year, photos without a date after the dated ones),
 * then by file name. */
export function sortPhotos<T extends PhotoLike>(photos: T[]): T[] {
  return [...photos].sort((a, b) => {
    if (a.data.year !== b.data.year) return b.data.year - a.data.year;
    const x = a.data.date;
    const y = b.data.date;
    if (x !== y) {
      if (x === undefined) return 1;
      if (y === undefined) return -1;
      return y.localeCompare(x);
    }
    return a.id.localeCompare(b.id);
  });
}
