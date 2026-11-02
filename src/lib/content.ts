/** The part of an Astro content entry these helpers read: its `id` (the file name without `.md`, which is also a
 * member's URL slug) and its frontmatter `data`. Entries from `getCollection()` can be passed as they are. */
export type Entry<D> = { id: string; data: D };

/** A record listed by year in sheet order: papers, presentations, awards. */
type Ordered = Entry<{ year: number; order?: number }>;

/** Ascending `order`; an entry without one goes after every entry that has one. */
function byOrder(a: Ordered, b: Ordered): number {
  const x = a.data.order;
  const y = b.data.order;
  if (x === y) return 0;
  if (x === undefined) return 1;
  if (y === undefined) return -1;
  return x - y;
}

/** A sorted copy: newest year first, and within a year ascending `order` (the source sheet's row order) with
 * entries that have no `order` last. */
export function sortByYearDesc<T extends Ordered>(items: T[]): T[] {
  return [...items].sort((a, b) => b.data.year - a.data.year || byOrder(a, b));
}

/** Entries grouped by `data[key]` (`groupBy(presentations, 'conference')`). Groups come in the order their first
 * entry appears, and each group keeps the order given. */
export function groupBy<T extends Entry<object>, K extends keyof T['data']>(
  items: T[],
  key: K,
): Map<T['data'][K], T[]> {
  const groups = new Map<T['data'][K], T[]>();
  for (const item of items) {
    const data: T['data'] = item.data;
    const value = data[key];
    const group = groups.get(value);
    if (group) group.push(item);
    else groups.set(value, [item]);
  }
  return groups;
}

/** Entries grouped by year, newest year first; each group in ascending `order`, entries without `order` last. */
export function groupByYear<T extends Ordered>(items: T[]): Map<number, T[]> {
  return groupBy(sortByYearDesc(items), 'year');
}

/** A sorted copy of `members` by `joined` date: `'asc'` puts the earliest join first, `'desc'` the latest. Members
 * without `joined` (the join date had no year) come last in either order. Ties go by `id`. */
export function sortMembersByJoined<T extends Entry<{ joined?: string }>>(members: T[], order: 'asc' | 'desc'): T[] {
  const sign = order === 'asc' ? 1 : -1;
  return [...members].sort((a, b) => {
    const x = a.data.joined;
    const y = b.data.joined;
    if (x !== y) {
      if (x === undefined) return 1;
      if (y === undefined) return -1;
      return x < y ? -sign : sign;
    }
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}
