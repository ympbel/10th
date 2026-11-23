// Home timeline → year panel. A plain click on a timeline column shows that year's panel instead of opening the year
// page, marks the column, and records the year in the hash (`#y2024`) so the view can be shared; on load the hash
// picks the panel. Without this script every column is an ordinary link to its year page.
import { resolveYear } from '../lib/year-panel-core.ts';
import { YEARS } from '../lib/years.ts';

const links = [...document.querySelectorAll<HTMLAnchorElement>('.timeline a[data-year]')];
const panels = [...document.querySelectorAll<HTMLElement>('.year-panel[data-year]')];

/** Show the panel of `year`, hide the others, and mark its column as the current one. */
function select(year: number): void {
  for (const panel of panels) panel.hidden = Number(panel.dataset.year) !== year;
  for (const link of links) {
    const on = Number(link.dataset.year) === year;
    link.classList.toggle('on', on);
    if (on) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
}

for (const link of links) {
  link.addEventListener('click', (event) => {
    // A modified or non-primary click (new tab, new window) keeps the link: it opens the year page.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const year = Number(link.dataset.year);
    select(year);
    history.replaceState(null, '', `#y${year}`);
  });
}

if (links.length > 0) select(resolveYear(location.hash, YEARS, YEARS[YEARS.length - 1]));

// Keep an independent annual scale for each research metric.
const timeline = document.getElementById('history');
const seriesButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-chart-series]')];
for (const button of seriesButtons) {
  button.addEventListener('click', () => {
    if (!timeline) return;
    timeline.dataset.series = button.dataset.chartSeries;
    for (const other of seriesButtons) other.setAttribute('aria-pressed', String(other === button));
    const ticks = (button.dataset.ticks ?? '').split(',');
    const scale = timeline.querySelector('.chart-scale');
    timeline.style.setProperty('--chart-intervals', String(ticks.length - 1));
    scale?.replaceChildren(...ticks.map((tick, i) => {
      const label = document.createElement('span');
      label.textContent = tick;
      label.style.top = String(i / (ticks.length - 1) * 100) + '%';
      return label;
    }));
  });
}
