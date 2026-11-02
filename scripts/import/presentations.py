"""Build conference presentation records from the 학회 초록 sheet.

The full author list sits mostly in a header-less column immediately left of '1st author' and sometimes in
the '전체저자' column; whichever is filled is used ('전체저자' when both are and they differ, reported).
Conference names and presentation types go through conferences.json. '발표 시간' is not read.
"""
import dates
import link
import names
import report as rp
import sheets
import writer
from papers import file_base

SHEET = '학회 초록'

# Allowlist: record key -> header text.
COLUMNS = {
    'year': 'Year',
    'first_author': '1st author',
    'authors': '전체저자',
    'corresponding': '교신저자',
    'corresponding_2': '교신저자 2',
    'title': 'title',
    'conference': 'Conference Name',
    'type': '발표형태',
    'acknowledgement': '사사',
    'session': '세션',
}
REQUIRED = ('title', 'first_author', 'conference', 'type')


def _unify(table, raw, label, report):
    """table[raw]; a value missing from the table passes through and is reported once."""
    if raw in table:
        return table[raw]
    if raw:
        report.add(rp.NEW_SPELLINGS, f'{label}: {raw}')
    return raw


def _authors(v, where, report):
    headed, unheaded = v['authors'], v['unheaded_authors']
    if headed and unheaded and headed != unheaded:
        report.add(rp.CHECK, f'{where}: 전체저자와 머리글 없는 저자 열이 다름 (전체저자 사용)')
    if not (headed or unheaded):
        report.add(rp.CHECK, f'{where}: 전체저자 비어 있음')
    return headed or unheaded


def _record(year, v, file, order, members, conf_map, report):
    where = f'presentations/{file}'
    for key in REQUIRED:
        if not v[key]:
            report.add(rp.CHECK, f'{where}: {COLUMNS[key]} 비어 있음')
    authors = _authors(v, where, report)
    conference = _unify(conf_map['conferences'], v['conference'], '학회 이름', report)
    record = {
        'year': year,
        'title': v['title'],
        'authors': authors,
        'first_author': v['first_author'],
        'corresponding': names.split_authors(v['corresponding']) + names.split_authors(v['corresponding_2']),
        'conference': conference,
        'conference_raw': v['conference'] if conference != v['conference'] else None,
        'type': _unify(conf_map['types'], v['type'], '발표형태', report),
        'session': v['session'],
        'acknowledgement': v['acknowledgement'],
        'members': link.link_and_report(
            [authors, v['first_author'], v['corresponding'], v['corresponding_2']], members, report),
    }
    record = {k: x for k, x in record.items() if x is not None and x != ''}
    record['order'] = order
    record['_file'] = file
    return record


def _report_repeats(records, report):
    """Report records sharing year, title (ignoring case) and conference: possibly one row entered twice."""
    groups = {}
    for r in records:
        groups.setdefault((r['year'], r['title'].casefold(), r['conference']), []).append(r)
    for (year, _, conference), group in groups.items():
        if len(group) > 1:
            files = ', '.join(f'presentations/{r["_file"]}' for r in group)
            report.add(rp.CHECK, f'{SHEET}: {year} "{group[0]["title"]}" ({conference}) {len(group)}건 — '
                                 f'중복 행인지 확인: {files}')


def build_presentations(rows, members, conf_map, report):
    """Presentation records (schema keys plus '_file') for the rows with a title and a four-digit year.

    conf_map is conferences.json: {'conferences': {raw: canonical}, 'types': {raw: canonical}}. File names
    follow papers.file_base; 'order' is the record's 1-based position in the sheet. Records repeating the
    year, title and conference of another are reported for checking (all are kept).
    """
    h = sheets.find_header(rows, COLUMNS['title'], COLUMNS['conference'])
    index = {key: sheets.header_index(rows[h], label) for key, label in COLUMNS.items()}
    index['unheaded_authors'] = index['first_author'] - 1
    if index['unheaded_authors'] < 0 or sheets.cell(rows[h], index['unheaded_authors']):
        raise ValueError(f"{SHEET}: expected a header-less author column left of '1st author'")
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
        records.append(_record(year, v, file, len(records) + 1, members, conf_map, report))
    _report_repeats(records, report)
    if empty:
        report.add(rp.SKIPPED, f'{SHEET}: 빈 행 {empty}개')
    report.add(rp.COUNTS, f'학회 발표 {len(records)}건')
    return records
