import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  awardSchema,
  challengeSchema,
  commentSchema,
  memberSchema,
  pageSchema,
  paperSchema,
  patentSchema,
  photoSchema,
  presentationSchema,
  projectSchema,
  seminarSchema,
  workshopSchema,
} from './content/schemas.ts';
import { CONTENT_GLOB } from './lib/content-glob.ts';

// Every collection loads its folder's markdown files except templates (`_template.md`), so a folder holding only its
// template gives an empty collection.
const markdownIn = (name: string) => glob({ pattern: CONTENT_GLOB, base: `./src/content/${name}` });

export const collections = {
  // ko/home.md and en/home.md: ids `ko/home`, `en/home`.
  pages: defineCollection({ loader: markdownIn('pages'), schema: pageSchema }),
  members: defineCollection({ loader: markdownIn('members'), schema: memberSchema }),
  papers: defineCollection({ loader: markdownIn('papers'), schema: paperSchema }),
  patents: defineCollection({ loader: markdownIn('patents'), schema: patentSchema }),
  presentations: defineCollection({ loader: markdownIn('presentations'), schema: presentationSchema }),
  awards: defineCollection({ loader: markdownIn('awards'), schema: awardSchema }),
  challenges: defineCollection({ loader: markdownIn('challenges'), schema: challengeSchema }),
  projects: defineCollection({ loader: markdownIn('projects'), schema: projectSchema }),
  seminars: defineCollection({ loader: markdownIn('seminars'), schema: seminarSchema }),
  workshops: defineCollection({ loader: markdownIn('workshops'), schema: workshopSchema }),
  photos: defineCollection({ loader: markdownIn('photos'), schema: photoSchema }),
  comments: defineCollection({ loader: markdownIn('comments'), schema: commentSchema }),
};
