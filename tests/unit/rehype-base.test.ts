import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rehypeBase } from '../../src/lib/rehype-base.ts';

const element = (tagName: string, properties: Record<string, unknown>, children: object[] = []) => ({
  type: 'element',
  tagName,
  properties,
  children,
});

test('rehypeBase() puts the base in front of site-root href and src at any depth', () => {
  const link = element('a', { href: '/people/students/' });
  const image = element('img', { src: '/images/site/logo.png' });
  const tree = { type: 'root', children: [element('p', {}, [link, element('span', {}, [image])])] };
  rehypeBase({ base: '/base' })(tree);
  assert.equal(link.properties.href, '/base/people/students/');
  assert.equal(image.properties.src, '/base/images/site/logo.png');
});

test('rehypeBase() accepts a base with a trailing slash', () => {
  const link = element('a', { href: '/' });
  rehypeBase({ base: '/base/' })({ type: 'root', children: [link] });
  assert.equal(link.properties.href, '/base/');
});

test('rehypeBase() leaves protocol-relative, absolute, relative and fragment URLs alone', () => {
  const urls = ['//cdn.example.com/a.png', 'https://example.com/', './a.png', 'a/', '#top', 'mailto:a@example.com'];
  const links = urls.map((href) => element('a', { href }));
  rehypeBase({ base: '/base' })({ type: 'root', children: links });
  assert.deepEqual(
    links.map((link) => link.properties.href),
    urls,
  );
});
