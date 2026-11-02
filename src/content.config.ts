import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { memberSchema } from './content/schemas.ts';

// Files whose basename starts with `_` (templates) are excluded from every collection.
const markdownIn = (name: string) =>
  glob({ pattern: ['**/*.md', '!**/_*.md'], base: `./src/content/${name}` });

export const collections = {
  members: defineCollection({ loader: markdownIn('members'), schema: memberSchema }),
};
