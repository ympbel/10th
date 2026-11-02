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

/** Who an award shows as its recipient: the member's name in `locale` when `member` names a member file, with the
 * slug for a person page link unless the member is a professor (professors have no person page); otherwise the
 * sheet's `recipient` string as written, unlinked. `members` maps member slugs to member entries. */
export function awardRecipient(
  award: { recipient: string; member?: string },
  members: Map<string, { data: { role: string; name: string; name_en?: string } }>,
  locale: Locale,
): { slug?: string; name: string } {
  const m = award.member ? members.get(award.member) : undefined;
  if (!m) return { slug: undefined, name: award.recipient };
  return { slug: m.data.role === 'professor' ? undefined : award.member, name: displayName(m.data, locale) };
}

/** The member fields a byline is matched against. */
type Named = { data: { role: string; name: string; name_en?: string; aliases?: string[] } };

/** One piece of a byline: a name, with the member slug when it is a member to link, or the text between names. */
export type BylinePiece = { text: string; slug?: string };

// The importer's author rules (scripts/import/names.py, link.py), so a byline links exactly the members the
// importer found in it. A list splits at `,` `;` ` and ` and at `. ` after two word characters (`Dr. Kim`, not
// `G. Kim`); a name is compared lowercased with only ASCII letters kept, or, with no Latin letters, as a Korean name
// without spaces.
const SEPARATOR = /([,;]|\s+and\s+|(?<=[\p{L}\p{N}_]{2})\.\s+)/u;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
const normKo = (s: string) => s.replace(/\s+/g, '');

/** The one slug in `slugs` whose member has this spelling (English name or alias, or the Korean name for a name
 * without Latin letters); none when no member or two members match. Professors are never matched. */
function memberOf(name: string, slugs: string[], members: Map<string, Named>): string | undefined {
  const key = norm(name);
  const keyKo = normKo(name);
  const found = [...new Set(slugs)].filter((slug) => {
    const m = members.get(slug)?.data;
    if (!m || m.role === 'professor') return false;
    if (key) return [m.name_en ?? '', ...(m.aliases ?? [])].some((s) => s !== '' && norm(s) === key);
    return keyKo !== '' && normKo(m.name) === keyKo;
  });
  return found.length === 1 ? found[0] : undefined;
}

/** A byline (`Jaehee Chun`, `이혜진, 이삭, 윤용도`) split into pieces for an author line: each name that is one of the
 * record's members (`slugs`, its `members` field) carries that member's slug for a person page link; everything
 * else is plain text. The pieces' text joined is the byline exactly as written. `members` maps member slugs to
 * member entries. */
export function bylinePieces(byline: string, slugs: string[], members: Map<string, Named>): BylinePiece[] {
  const pieces: BylinePiece[] = [];
  const add = (text: string, slug?: string) => {
    if (text === '') return;
    const last = pieces.at(-1);
    if (!slug && last && !last.slug) last.text += text;
    else pieces.push(slug ? { text, slug } : { text });
  };
  byline.split(SEPARATOR).forEach((part, i) => {
    // Odd parts are the separators the split captured.
    if (i % 2 === 1) return add(part);
    const lead = part.length - part.trimStart().length;
    const name = part.trim().replace(/[.,]+$/, '').trim();
    add(part.slice(0, lead));
    add(name, name ? memberOf(name, slugs, members) : undefined);
    add(part.slice(lead + name.length));
  });
  return pieces;
}
