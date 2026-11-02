/** The parts of a Sätteri hast element and visitor context this plugin uses. */
interface Element {
  properties?: Record<string, unknown>;
}
interface VisitorContext {
  setProperty(node: Element, key: string, value: unknown): void;
}

/** Hast plugin for Astro's markdown processor (Sätteri) that puts the deployment `base` in front of every site-root
 * link and image in a markdown body (`/people/students/` becomes `<base>/people/students/`), so authors write paths
 * as if the site were served from `/`. Protocol-relative (`//host/...`), absolute, relative and fragment URLs are left
 * alone. Raw HTML in the markdown stays unparsed text in Sätteri's tree, so its links are not rewritten.
 *
 * `base` is an option rather than read from `import.meta.env`: Astro imports `astro.config.mjs`, and every plugin it
 * registers, with plain Node, where `import.meta.env` does not exist. */
export function basePlugin({ base }: { base: string }) {
  const prefix = base.replace(/\/$/, '');
  return {
    name: 'base',
    element: {
      filter: ['a', 'img'],
      visit(node: Element, ctx: VisitorContext): void {
        for (const name of ['href', 'src']) {
          const value = node.properties?.[name];
          if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
            ctx.setProperty(node, name, prefix + value);
          }
        }
      },
    },
  };
}
