import { url } from './url.ts';

/** The site's two languages. Korean pages sit at the site root, English pages under `/en/`. */
export type Locale = 'ko' | 'en';

/** The deployment base without its trailing slash, taken from `url()` so it has one source. */
const BASE = url('/').slice(0, -1);

/** A site-root path (`/years/2026/`) in `locale`: English paths get the `/en` prefix, Korean paths stay as they are.
 * The result is still a site-root path; pass it to `url()` for an href. */
export function localePath(path: string, locale: Locale): string {
  return locale === 'en' ? '/en' + path : path;
}

/** A page path split into its language and its site-root path without the base and `/en`:
 * `<base>/en/people/students/` → `{ locale: 'en', path: '/people/students/' }`. A path without the base is read as a
 * site-root path. */
export function splitPath(pathname: string): { locale: Locale; path: string } {
  const path = pathname === BASE || pathname.startsWith(BASE + '/') ? pathname.slice(BASE.length) || '/' : pathname;
  if (path === '/en' || path.startsWith('/en/')) return { locale: 'en', path: path.slice(3) || '/' };
  return { locale: 'ko', path };
}

/** The href of the same page in the other language, for the KR/EN toggle: `<base>/people/students/` ↔
 * `<base>/en/people/students/`. `pathname` is the page's URL path (`Astro.url.pathname`). */
export function otherLocaleHref(pathname: string): string {
  const { locale, path } = splitPath(pathname);
  return url(localePath(path, locale === 'ko' ? 'en' : 'ko'));
}

/** Hangul syllables and jamo. */
const HANGUL = /[ᄀ-ᇿ㄰-㆏가-힣]/;

/** `'ko'` for Korean text on an English page (a value with no English version, shown as written), so screen readers
 * read it in Korean; `undefined` otherwise. Pass the result to an element's `lang`. */
export function langOf(text: string | undefined, locale: Locale): 'ko' | undefined {
  return locale === 'en' && text && HANGUL.test(text) ? 'ko' : undefined;
}
