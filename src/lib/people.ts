import type { Entry } from './content.ts';
import type { Locale } from './locale.ts';

export type { Locale };

/** A paper or presentation: `members` holds the slugs of the lab members among its authors. */
type Authored = Entry<{ members: string[] }>;
/** An award: `member` is the recipient's slug when the name matched a member. */
type Awarded = Entry<{ member?: string }>;

/** The papers, presentations and awards of the member with this slug: papers and presentations whose `members`
 * holds it, and awards whose `member` is it. Each list keeps the order given. */
export function itemsOf<P extends Authored, R extends Authored, A extends Awarded>(
  slug: string,
  data: { papers: P[]; presentations: R[]; awards: A[] },
): { papers: P[]; presentations: R[]; awards: A[] } {
  return {
    papers: data.papers.filter((p) => p.data.members.includes(slug)),
    presentations: data.presentations.filter((p) => p.data.members.includes(slug)),
    awards: data.awards.filter((a) => a.data.member === slug),
  };
}

/** One field of a record's `data` in `locale`. Korean pages get `entry[key]`; English pages get `entry[key + '_en']`
 * when it is set and otherwise the Korean value, so a field nobody translated still shows. */
export function field<T extends object, K extends keyof T & string>(entry: T, key: K, locale: Locale): T[K] {
  const english = locale === 'en' ? (entry as Record<string, unknown>)[`${key}_en`] : undefined;
  return (english || entry[key]) as T[K];
}

/** A member's name in `locale` (`member` is a member entry's `data`): the English name on English pages when there
 * is one, otherwise the Korean name. */
export function displayName(member: { name: string; name_en?: string }, locale: Locale): string {
  return field(member, 'name', locale);
}

/** The name a page shows second, beside `displayName`: the English name on Korean pages and the Korean name on
 * English pages. Empty when the member has no English name, since the Korean name is then already shown first. */
export function otherName(member: { name: string; name_en?: string }, locale: Locale): string {
  if (!member.name_en) return '';
  return locale === 'en' ? member.name : member.name_en;
}

/** The site-root path of a member's person page (`/people/gildong-hong/`); pass it through `localePath` and `url`.
 * Professors have no person page. */
export function personPath(slug: string): string {
  return `/people/${slug}/`;
}
