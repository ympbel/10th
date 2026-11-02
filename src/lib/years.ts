import type { Entry } from './content.ts';

/** The year the lab started. Earlier papers are listed on the papers board but left out of the lab's counts. */
export const LAB_START = 2016;

/** The eleven years the archive covers, oldest first: 2016 to the tenth year, 2026. */
export const YEARS: number[] = Array.from({ length: 2026 - LAB_START + 1 }, (_, i) => LAB_START + i);

/** Whether a record's year falls in the lab's time (2016 on). */
export function isLabEra(year: number): boolean {
  return year >= LAB_START;
}

/** The member fields the counts read. A member without `joined` belongs to no year. */
export type MemberLike = Entry<{ role: string; joined?: string; degree?: { date?: string } }>;
/** A paper, presentation or award: counted by its `year`. */
export type YearLike = Entry<{ year: number }>;
/** A research project: running in every year from its `start` year to its `end` year. */
export type ProjectLike = Entry<{ start: string; end: string }>;

/** The collections the counts come from, as `getCollection()` returns them. */
export interface LabData<M extends MemberLike = MemberLike, P extends ProjectLike = ProjectLike> {
  members: M[];
  papers: YearLike[];
  presentations: YearLike[];
  awards: YearLike[];
  projects: P[];
}

/** One year of the lab: how many papers, presentations and awards, who joined, who took a degree, and which projects
 * were running. Members and projects keep the order given. */
export interface YearStats<M, P> {
  papers: number;
  presentations: number;
  awards: number;
  joined: M[];
  degrees: M[];
  projectsRunning: P[];
}

/** The year of a `YYYY-MM` or `YYYY-MM-DD` date. */
function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

/** Whether a date that may be missing falls in year `y`. A missing date falls in no year. */
function isIn(date: string | undefined, y: number): boolean {
  return date !== undefined && yearOf(date) === y;
}

/** The figures for year `y` on the timeline, the year panel and the year page. */
export function yearStats<M extends MemberLike, P extends ProjectLike>(
  y: number,
  data: LabData<M, P>,
): YearStats<M, P> {
  const countIn = (items: YearLike[]) => items.filter((item) => item.data.year === y).length;
  return {
    papers: countIn(data.papers),
    presentations: countIn(data.presentations),
    awards: countIn(data.awards),
    joined: data.members.filter((m) => isIn(m.data.joined, y)),
    degrees: data.members.filter((m) => isIn(m.data.degree?.date, y)),
    projectsRunning: data.projects.filter((p) => yearOf(p.data.start) <= y && y <= yearOf(p.data.end)),
  };
}

/** The lab-wide counts on the home page. `members` leaves out professors, `degrees` counts members with a degree
 * date, and `papers` counts only papers from 2016 on; the rest count every entry. */
export function labCounts(data: LabData): {
  members: number;
  degrees: number;
  papers: number;
  presentations: number;
  awards: number;
  projects: number;
} {
  return {
    members: data.members.filter((m) => m.data.role !== 'professor').length,
    degrees: data.members.filter((m) => m.data.degree?.date).length,
    papers: data.papers.filter((p) => isLabEra(p.data.year)).length,
    presentations: data.presentations.length,
    awards: data.awards.length,
    projects: data.projects.length,
  };
}

/** The height of a stub bar for a year with nothing in it. */
const EMPTY_BAR = 2;

/** Bar heights in px for one timeline series: 0 draws a 2px stub, the series' largest value draws `max`, and every
 * other value is in proportion to it, rounded to a whole px. */
export function barHeights(values: number[], max = 134): number[] {
  const top = Math.max(0, ...values);
  return values.map((v) => (v === 0 ? EMPTY_BAR : Math.round((v / top) * max)));
}
