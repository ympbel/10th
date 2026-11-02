import { z } from 'astro/zod';

// Every schema is strict: a misspelt or unknown frontmatter key fails the build instead of being silently dropped.

/**
 * `YYYY-MM-DD`, or `YYYY-MM` when only the month is known. An unquoted full date in YAML (`joined: 2024-03-01`)
 * arrives as a Date and is read back as that day.
 */
const date = z.preprocess(
  (v) => (v instanceof Date && !Number.isNaN(v.getTime()) ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/),
);

/** One person, one file; the file name is the collection id and the person's URL slug. */
export const memberSchema = z
  .object({
    role: z.enum(['professor', 'student', 'alumni', 'former']),
    name: z.string().min(1),
    // Some people have no English name in the sheets; the converter then leaves the key out.
    name_en: z.string().default(''),
    aliases: z.array(z.string()).default([]),
    orcid: z
      .string()
      .regex(/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/)
      .optional(),
    program: z.string().optional(),
    department: z.string().optional(),
    department_en: z.string().optional(),
    major: z.string().optional(),
    joined: date.optional(),
    left: date.optional(),
    degree: z
      .object({
        start: date.optional(),
        date: date.optional(),
        type: z.string().optional(),
        type_en: z.string().optional(),
      })
      .strict()
      .optional(),
    affiliation: z.string().optional(),
    affiliation_en: z.string().optional(),
    position: z.string().optional(),
    position_en: z.string().optional(),
    order: z.number().int().optional(),
    link: z.string().optional(),
  })
  .strict();

/** A four-digit year, written as a bare integer (`year: 2021`). */
const year = z.number().int().min(1900).max(2100);

/** Slugs of other entries: file names without `.md` (members/ for `members`, projects/ for `projects`). */
const slugs = z.array(z.string().min(1)).default([]);

/** One journal paper. `members` and `projects` are filled by the converter and can be corrected by hand. */
export const paperSchema = z
  .object({
    year,
    title: z.string().min(1),
    // The sheet string as written; it may hold two names. One sheet row has none, so it may be left out.
    first_author: z.string().default(''),
    co_first: z.array(z.string()).default([]),
    corresponding: z.array(z.string()).default([]),
    // One sheet row has no journal, so it may be left out.
    journal: z.string().default(''),
    impact_factor: z.number().nonnegative().optional(),
    acknowledgement: z.string().optional(),
    projects: slugs,
    members: slugs,
    link: z.string().optional(),
    // 1-based position in the source sheet, written by the converter; boards sort within a year by it.
    order: z.number().int().optional(),
  })
  .strict();

/** One conference presentation. `conference` and `type` are unified through scripts/import/conferences.json. */
export const presentationSchema = z
  .object({
    year,
    title: z.string().min(1),
    // Full author list as written. A few sheet rows have none, so it may be left out.
    authors: z.string().default(''),
    first_author: z.string().default(''),
    corresponding: z.array(z.string()).default([]),
    conference: z.string().min(1),
    // The sheet's spelling, kept only when unification changed it.
    conference_raw: z.string().optional(),
    type: z.string().min(1),
    session: z.string().optional(),
    acknowledgement: z.string().optional(),
    members: slugs,
    // 1-based position in the source sheet, written by the converter; boards sort within a year by it.
    order: z.number().int().optional(),
  })
  .strict();

/** One award. `member` is the recipient's member slug when the Korean name matched. */
export const awardSchema = z
  .object({
    year,
    recipient: z.string().min(1),
    member: z.string().min(1).optional(),
    conference: z.string().min(1),
    category: z.string().min(1),
    category_en: z.string().optional(),
    title: z.string().optional(),
    // 1-based position in the source sheet, written by the converter; boards sort within a year by it.
    order: z.number().int().optional(),
  })
  .strict();

/** One challenge entry. The dates stay as written in the sheet (`March 17, 2021`). */
export const challengeSchema = z
  .object({
    year,
    host: z.string().min(1),
    title: z.string().min(1),
    objective: z.string().min(1),
    dataset_release: z.string().optional(),
    submission: z.string().optional(),
    link: z.string().optional(),
  })
  .strict();

/** One research project. Budgets are in thousands of won, exactly as in the sheet. */
export const projectSchema = z
  .object({
    title: z.string().min(1),
    title_en: z.string().optional(),
    nickname: z.string().optional(),
    agency: z.string().min(1),
    program: z.string().min(1),
    institution: z.string().min(1),
    role: z.string().min(1),
    start: date,
    end: date,
    months: z.number().int().nonnegative().optional(),
    // As written, e.g. `20%`.
    participation_rate: z.string().optional(),
    budget_year_krw_thousand: z.number().nonnegative().optional(),
    budget_total_krw_thousand: z.number().nonnegative().optional(),
    acknowledgement_en: z.string().optional(),
    acknowledgement_ko: z.string().optional(),
  })
  .strict();
