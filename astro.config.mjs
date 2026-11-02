import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { basePlugin } from './src/lib/base-plugin.ts';

// The site is served from this sub-path. Astro adds it only to the asset paths it generates itself: components and
// pages wrap their own paths in `url()` (src/lib/url.ts), and `basePlugin` adds it to links and images in markdown.
const base = '/10th';

export default defineConfig({
  site: 'https://ympbel.github.io',
  base,
  i18n: { defaultLocale: 'ko', locales: ['ko', 'en'], routing: { prefixDefaultLocale: false } },
  markdown: { processor: satteri({ hastPlugins: [basePlugin({ base })] }) },
  // CSS minification targets. Without them Lightning CSS prints `@media (max-width: …)` as range syntax
  // `(width<=…)`, which phone browsers before iOS 16.4 / Chrome 104 ignore, dropping the whole responsive layer.
  vite: { build: { cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14', 'ios14'] } },
});
