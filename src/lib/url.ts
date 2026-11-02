/** The deployment base without its trailing slash. Astro sets `BASE_URL` from `base` in `astro.config.mjs`; under
 * `node --test` there is no `import.meta.env`, so the unit tests get the base the site is deployed under. */
const BASE = (import.meta.env?.BASE_URL ?? '/10th/').replace(/\/$/, '');

/** A site-root path (`/people/students/`, `/images/site/logo.png`) under the deployment base. Every internal link and
 * image path in components and pages goes through this, because Astro adds `base` only to the asset paths it
 * generates itself. */
export function url(path: string): string {
  return BASE + path;
}
