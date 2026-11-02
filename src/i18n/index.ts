import type { Locale } from '../lib/locale.ts';
import { ko } from './ko.ts';
import { en } from './en.ts';

export type Strings = typeof ko;

const STRINGS: Record<Locale, Strings> = { ko, en };

/** The UI strings of a language. */
export function t(locale: Locale): Strings {
  return STRINGS[locale];
}
