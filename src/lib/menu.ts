import { ko } from '../i18n/ko.ts';
import { en } from '../i18n/en.ts';
import { splitPath } from './locale.ts';

/** A board: one menu item. */
export type ItemKey = keyof typeof ko.boards;
export type SectionKey = 'people' | 'publication' | 'award' | 'project' | 'activity' | 'archive';
/** `href` is a site-root path without the base or `/en`; links pass it through `localePath()` and `url()`. */
export type MenuItem = { key: ItemKey; href: string; label: { ko: string; en: string } };
/** `label` is the uppercase English section name, used in both languages. */
export type MenuSection = { key: SectionKey; label: string; items: MenuItem[] };

/** A menu item whose labels are the board titles in `src/i18n`. */
function item(key: ItemKey, href: string): MenuItem {
  return { key, href, label: { ko: ko.boards[key], en: en.boards[key] } };
}

/** The six top menu sections. The year pages are not in the menu (they are reached from the home timeline). */
export const MENU: MenuSection[] = [
  { key: 'people', label: 'PEOPLE', items: [item('students', '/people/students/'), item('alumni', '/people/alumni/')] },
  {
    key: 'publication',
    label: 'PUBLICATION',
    items: [
      item('papers', '/publication/papers/'),
      item('patents', '/publication/patents/'),
      item('presentations', '/publication/presentations/'),
    ],
  },
  { key: 'award', label: 'AWARD', items: [item('awards', '/awards/')] },
  { key: 'project', label: 'PROJECT', items: [item('projects', '/projects/')] },
  {
    key: 'activity',
    label: 'ACTIVITY',
    items: [item('seminars', '/activity/seminars/'), item('workshops', '/activity/workshops/')],
  },
  {
    key: 'archive',
    label: 'ARCHIVE',
    items: [item('photos', '/archive/photos/'), item('comments', '/archive/comments/')],
  },
];

/** `/people/students/` → `/people/`: the first path segment, which every item of a section shares. */
function firstSegment(href: string): string {
  return href.slice(0, href.indexOf('/', 1) + 1);
}

/** The section a page belongs to, by the first segment of its path (`/people/<slug>/` is in PEOPLE). `pathname` may
 * carry the base and `/en`. Pages outside the menu (home, year pages) have none. */
export function sectionOf(pathname: string): MenuSection | undefined {
  const { path } = splitPath(pathname);
  return MENU.find((s) => s.items.some((i) => path.startsWith(firstSegment(i.href))));
}
