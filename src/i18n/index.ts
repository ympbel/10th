import type { Locale } from '../lib/locale.ts';
import { ko } from './ko.ts';
import { en } from './en.ts';

export type Strings = typeof ko;

const STRINGS: Record<Locale, Strings> = { ko, en };

/** The UI strings of a language. */
export function t(locale: Locale): Strings {
  return STRINGS[locale];
}

/** A string from this folder with its `{name}` placeholders filled in: `fill('논문 {n}편', { n: 25 })` → `논문 25편`.
 * A placeholder without a value stays as written. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
