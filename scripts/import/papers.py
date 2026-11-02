"""Build paper records from the MPBEL 논문 sheet, linking authors to members and the 과제 이름 cell to projects.

Only the columns in COLUMNS (and the 과제 이름 column) are read. 나스 위치, Pf. Kim 교신 여부, IF - 교신 and
IF-공동교신 are internal tallies and are never read.
"""
import re

import dates
import link
import names
import projects as pj
import report as rp
import sheets
import writer

SHEET = 'MPBEL 논문'

# Allowlist: record key -> header text.
COLUMNS = {
    'year': 'Year',
    'first_author': '1st author',
    'co_first': '공동 1저자',
    'corresponding': '교신저자',
    'corresponding_2': '교신저자 2',
    'title': 'Title',
    'journal': 'Journal Name',
    'impact_factor': 'IF',
    'acknowledgement': '논문 사사 번호',
}
# The project column's header carries a long hint after this prefix.
PROJECT_PREFIX = '과제 이름'

_NUMBER = re.compile(r'\d+(\.\d+)?')


def file_base(year, first_author, title):
    """'<year>-<slug of the first person in first_author>-<slug of the first three title words>'.

    'anon' stands in for a first author without Latin letters, 'untitled' for such a title.
    """
    people = names.split_authors(first_author)
    person = writer.slugify(people[0] if people else '', 'anon')
    words = writer.slugify(' '.join(title.split()[:3]), 'untitled')
    return f'{year}-{person}-{words}'


def _prefixed(header, prefix):
    for i, label in enumerate(header):
        if label.strip().startswith(prefix):
            return i
    raise KeyError(prefix)


def _impact_factor(value, where, report):
    if value in ('', '-'):
        return None
    if _NUMBER.fullmatch(value):
        return float(value)
    report.add(rp.CHECK, f'{where}: IF 숫자가 아님 ({value})')
    return None


def _record(year, v, file, order, members, projects, project_map, report):
    where = f'papers/{file}'
    slugs, unresolved = pj.resolve_project_refs(v['projects'], projects, project_map)
    for piece in unresolved:
        report.add(rp.UNRESOLVED_PROJECTS, f'{piece} ({where})')
    for key in ('first_author', 'journal'):
        if not v[key]:
            report.add(rp.CHECK, f'{where}: {COLUMNS[key]} 비어 있음')
    record = {
        'year': year,
        'title': v['title'],
        'first_author': v['first_author'],
        'co_first': names.split_authors(v['co_first']),
        'corresponding': names.split_authors(v['corresponding']) + names.split_authors(v['corresponding_2']),
        'journal': v['journal'],
        'impact_factor': _impact_factor(v['impact_factor'], where, report),
        'acknowledgement': v['acknowledgement'],
        'projects': slugs,
        'members': link.link_and_report(
            [v['first_author'], v['co_first'], v['corresponding'], v['corresponding_2']], members, report),
    }
    record = {k: x for k, x in record.items() if x is not None and x != ''}
    record['order'] = order
    record['_file'] = file
    return record


def build_papers(rows, members, projects, project_map, report):
    """Paper records (schema keys plus '_file') for the rows with a title and a four-digit year. 'order' is the
    record's 1-based position in the sheet, used to sort within a year.

    members are member records (professors are never linked), projects the build_projects records, and
    project_map the projects.json mapping. Rows without a title (the IF totals at the bottom) and rows
    without a year are skipped and reported by row number; empty rows are counted.
    """
    h = sheets.find_header(rows, COLUMNS['title'], COLUMNS['journal'])
    index = {key: sheets.header_index(rows[h], label) for key, label in COLUMNS.items()}
    index['projects'] = _prefixed(rows[h], PROJECT_PREFIX)
    picked, empty = sheets.pick_rows(rows, h, index)
    records, taken = [], set()
    for n, v in picked:
        if not v['title']:
            report.add(rp.SKIPPED, f'{SHEET} {n}행: 제목 없음')
            continue
        year = dates.parse_year(v['year'])
        if year is None:
            report.add(rp.SKIPPED, f'{SHEET} {n}행: 연도 없음')
            continue
        file = writer.unique_slug(file_base(year, v['first_author'], v['title']), taken)
        records.append(_record(year, v, file, len(records) + 1, members, projects, project_map, report))
    if empty:
        report.add(rp.SKIPPED, f'{SHEET}: 빈 행 {empty}개')
    report.add(rp.COUNTS, f'논문 {len(records)}건')
    return records
