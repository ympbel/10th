"""Build project records from the 과제정보 sheet and resolve the project names written in the paper sheet.

Only the columns in COLUMNS are read. 실무담당자 and 3책5공여부 (private / internal) and 연구내용 (internal
notes) are never read, not even to decide whether a row is empty.
"""
import re

import dates
import report as rp
import sheets
import writer

SHEET = '과제정보'

# Allowlist: record key -> header text.
COLUMNS = {
    'title': '연구과제명',
    'nickname': '닉네임',
    'agency': '부처명',
    'program': '사업명',
    'institution': '연구수행기관',
    'role': '참여유형',
    'start': '참여시작일',
    'end': '참여종료일',
    'months': '참여개월수',
    'participation_rate': '참여율',
    'budget_year_krw_thousand': '당해년도연구비(천원)',
    'budget_total_krw_thousand': '총연구비(천원)',
    'acknowledgement_en': '사사정보(영문)',
    'acknowledgement_ko': '사사정보(한글)',
}
REQUIRED = ('title', 'agency', 'program', 'institution', 'role')
INTEGERS = ('months', 'budget_year_krw_thousand', 'budget_total_krw_thousand')

_INTEGER = re.compile(r'\d{1,3}(,\d{3})+|\d+')  # '160,000' or '210000'
_REF_SEPARATOR = re.compile(r'[,/]')


def _integer(value, where, label, report):
    if not value:
        return None
    if _INTEGER.fullmatch(value):
        return int(value.replace(',', ''))
    report.add(rp.CHECK, f'{where}: {label} 숫자가 아님 ({value})')
    return None


def _record(values, start, file, report):
    where = f'projects/{file}'
    report.blanks(where, values, REQUIRED, COLUMNS)
    end = dates.parse_date(values['end'])
    if not end:
        report.add(rp.MISSING_DATES, f'{where}: {COLUMNS["end"]}')
    record = {key: values[key] for key in COLUMNS}
    record.update(start=start, end=end)
    record.update((key, _integer(values[key], where, COLUMNS[key], report)) for key in INTEGERS)
    record = {k: v for k, v in record.items() if v not in (None, '')}
    record['_file'] = file
    return record


def build_projects(rows, report):
    """Project records (schema keys plus '_file' = 'project-<nn>' in sheet order).

    The header row is the first one with '연구과제명' and '참여시작일'. A row is a project only when its
    참여시작일 is a date; other non-empty rows (notes, repeated headers) are skipped and reported by row number.
    """
    picked, empty = sheets.pick_columns(rows, COLUMNS, COLUMNS['title'], COLUMNS['start'])
    records, taken = [], set()
    for n, values in picked:
        start = dates.parse_date(values['start'])
        if not start:
            report.skip(SHEET, n, '시작일 없음')
            continue
        file = writer.unique_slug(f'project-{len(records) + 1:02d}', taken)
        records.append(_record(values, start, file, report))
    report.empty_rows(SHEET, empty)
    report.add(rp.COUNTS, f'과제 {len(records)}건')
    return records


def _unique(projects, key, value):
    found = {p['_file'] for p in projects if p.get(key) == value}
    return found.pop() if len(found) == 1 else None


def resolve_project_refs(cell, projects, mapping):
    """(slugs, unresolved) for a paper's 과제 이름 cell.

    The cell is split on ',' and '/'. Each piece resolves, in order, to the one project whose title equals it,
    the one project whose nickname equals it, or the slug mapping[piece] (projects.json) when that slug is a
    known project. A value naming two projects is never guessed. Pieces that resolve to nothing (numbers,
    abbreviations not in the map, unknown titles) are unresolved; empty pieces are ignored. Both lists are
    de-duplicated in order.
    """
    known = {p['_file'] for p in projects}
    slugs, unresolved = [], []
    for piece in (p.strip() for p in _REF_SEPARATOR.split(cell or '')):
        if not piece:
            continue
        slug = _unique(projects, 'title', piece) or _unique(projects, 'nickname', piece)
        if not slug and mapping.get(piece) in known:
            slug = mapping[piece]
        target = slugs if slug else unresolved
        value = slug or piece
        if value not in target:
            target.append(value)
    return slugs, unresolved
