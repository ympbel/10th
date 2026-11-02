import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';
import { basePlugin } from '../../src/lib/base-plugin.ts';

/** `markdown` rendered by Astro's markdown processor with `basePlugin({ base })` added, as in astro.config.mjs. */
async function render(markdown: string, base = '/base'): Promise<string> {
  const renderer = await createSatteriMarkdownProcessor({ hastPlugins: [basePlugin({ base })] });
  return (await renderer.render(markdown)).code;
}

test('basePlugin() puts the base in front of a site-root link and image', async () => {
  const html = await render('[students](/people/students/) ![logo](/images/site/logo.png)');
  assert.match(html, /<a href="\/base\/people\/students\/">students<\/a>/);
  assert.match(html, /<img src="\/base\/images\/site\/logo.png" alt="logo">/);
});

test('basePlugin() accepts a base with a trailing slash', async () => {
  assert.match(await render('[home](/)', '/base/'), /<a href="\/base\/">home<\/a>/);
});

test('basePlugin() leaves protocol-relative, absolute, relative and fragment URLs alone', async () => {
  const html = await render(
    '[cdn](//cdn.example.com/a.js) [site](https://example.com/a/) [rel](a/) [top](#top) ![remote](https://example.com/a.png)',
  );
  assert.match(html, /href="\/\/cdn.example.com\/a.js"/);
  assert.match(html, /href="https:\/\/example.com\/a\/"/);
  assert.match(html, /href="a\/"/);
  assert.match(html, /href="#top"/);
  assert.doesNotMatch(html, /\/base/);
});
