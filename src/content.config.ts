import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  awardSchema,
  challengeSchema,
  memberSchema,
  paperSchema,
  presentationSchema,
  projectSchema,
} from './content/schemas.ts';

// Files whose basename starts with `_` (templates) are excluded from every collection.
const markdownIn = (name: string) =>
  glob({ pattern: ['**/*.md', '!**/_*.md'], base: `./src/content/${name}` });

export const collections = {
  members: defineCollection({ loader: markdownIn('members'), schema: memberSchema }),
  papers: defineCollection({ loader: markdownIn('papers'), schema: paperSchema }),
  presentations: defineCollection({ loader: markdownIn('presentations'), schema: presentationSchema }),
  awards: defineCollection({ loader: markdownIn('awards'), schema: awardSchema }),
  challenges: defineCollection({ loader: markdownIn('challenges'), schema: challengeSchema }),
  projects: defineCollection({ loader: markdownIn('projects'), schema: projectSchema }),
};
