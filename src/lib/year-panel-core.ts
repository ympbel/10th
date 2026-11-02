/** The year a home page URL hash selects: `#y2024` → 2024 when 2024 is one of `years`. Any other hash (empty,
 * `#2024`, `#y1999`, `#y2024x`) gives `fallback`, so a stale or mistyped link still opens the default year. */
export function resolveYear(hash: string, years: number[], fallback: number): number {
  const match = /^#y(\d{4})$/.exec(hash);
  const year = match ? Number(match[1]) : NaN;
  return years.includes(year) ? year : fallback;
}
