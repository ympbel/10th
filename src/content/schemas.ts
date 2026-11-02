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
