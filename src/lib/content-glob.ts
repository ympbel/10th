/** The files every content collection loads, relative to its folder (`glob()` in src/content.config.ts): all
 * markdown files, at any depth, except templates. A folder that holds only its `_template.md` gives an empty
 * collection, and the board shows its empty state. */
export const CONTENT_GLOB: string[] = ['**/*.md', '!**/_*.md'];

/** Whether a file in a content folder is a template, which no collection loads: its name (the last path segment, not
 * a folder name) starts with `_`. The rule CONTENT_GLOB's `!` pattern writes as a glob. */
export function isTemplate(path: string): boolean {
  return (path.split('/').at(-1) ?? '').startsWith('_');
}
