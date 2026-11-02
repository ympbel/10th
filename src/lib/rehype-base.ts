/** The parts of a hast node this plugin reads. */
interface HastNode {
  type: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const URL_PROPERTIES = ['href', 'src'];

/** Rehype plugin that puts the deployment `base` in front of every site-root `href` and `src` in a markdown body
 * (`/people/students/` becomes `<base>/people/students/`), so authors write paths as if the site were served from
 * `/`. Protocol-relative (`//host/...`), absolute, relative and fragment URLs are left alone.
 *
 * `base` is an option rather than read from `import.meta.env`: Astro imports `astro.config.mjs`, and every plugin it
 * registers, with plain Node, where `import.meta.env` does not exist. */
export function rehypeBase({ base }: { base: string }) {
  const prefix = base.replace(/\/$/, '');
  function visit(node: HastNode): void {
    if (node.type === 'element' && node.properties) {
      for (const name of URL_PROPERTIES) {
        const value = node.properties[name];
        if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
          node.properties[name] = prefix + value;
        }
      }
    }
    node.children?.forEach(visit);
  }
  return (tree: HastNode): void => visit(tree);
}
