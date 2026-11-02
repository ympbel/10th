"""Build member records from the 현황 (status) and Alumni sheets.

Only the columns in the allowlists below are ever read. Everything else in those sheets (contact details,
birth dates, administrative columns) never enters a record.
"""
from itertools import zip_longest

import dates
import names
import sheets
import writer

PROGRAM_HEADER = '석사 / 박사 / 통합(석사) / 통합 (박사)'

# Allowlist for the 현황 sheet: record key -> header text.
STATUS_COLUMNS = {
    'name': '이름',
    'name_en': '영문 이름',
    'orcid': 'ORCID',
    'joined': '연구실 첫 출근',
    'degree_start': '학위 시작',
    'department': '학과',
    'major': '전공',
    'program': PROGRAM_HEADER,
}

# Allowlist for the Alumni sheet; 'Alumni' heads its number column.
ALUMNI_NUMBER = 'Alumni'
ALUMNI_COLUMNS = {
    'name': '이름',
    'name_en': '영문 이름',
    'start': '학위 시작일',
    'date': '학위 취득일',
    'type': '학위 종류',
    'department': '학과',
    'affiliation': '현 직장',
    'position': '직급',
}

# The professor block of the 현황 sheet has its own header row: this label over the name column, beside '영문 이름'.
PROFESSOR_HEADER = '교수님'

# Cell values that mean "nothing here": a dash and the spreadsheet error codes.
_EMPTY = {'-', '#VALUE!', '#REF!', '#N/A', '#NAME?', '#DIV/0!', '#NUM!', '#NULL!', '#ERROR!'}


def _cell(row, i):
    """Stripped cell text; '' past the end of a short row or for a value in _EMPTY."""
    value = row[i].strip() if i < len(row) else ''
    return '' if value in _EMPTY else value


def _is_empty(row):
    return not any(c.strip() for c in row)


def _find_header(rows, *labels):
    """Index of the first row that contains every label."""
    for i, row in enumerate(rows):
        cells = {c.strip() for c in row}
        if all(label in cells for label in labels):
            return i
    raise ValueError(f'no header row with {", ".join(labels)}')


def _check_width(row, width, i):
    """A data row wider than its header means an unexpanded rowspan shifted the cells."""
    if len(row) > width:
        raise ValueError(f'row {i + 1} has {len(row)} cells but the header has {width}')


def _pick(row, index):
    return {key: _cell(row, i) for key, i in index.items()}


def _read_status(rows):
    """(students, formers, professors) from the 현황 sheet.

    The main header row is the first one with '이름' and '영문 이름'; the row above it labels the right-hand
    block, used where the main header cell is empty. Below the header, blocks are separated by empty rows:
    the first block of numbered rows is the current students, the second the former members. Rows whose
    number cell is not a number (group names, stray computed cells) are not members. From the row labelled
    PROFESSOR_HEADER on, every row with a name is a professor, read through that row's own header.
    """
    h = _find_header(rows, '이름', '영문 이름')
    above = rows[h - 1] if h > 0 else []
    header = [main.strip() or label.strip() for main, label in zip_longest(rows[h], above, fillvalue='')]
    index = {key: sheets.header_index(header, label) for key, label in STATUS_COLUMNS.items()}
    number = index['name'] - 1  # the number column has no header; it sits left of '이름'
    if number < 0:
        raise ValueError("no number column left of '이름' in the status sheet")
    blocks, block, professor_cols, professors = [], None, None, []
    for i in range(h + 1, len(rows)):
        row = rows[i]
        _check_width(row, len(header), i)
        if _is_empty(row):
            block = None
        elif professor_cols is not None:
            name = _cell(row, professor_cols[0]).removesuffix(PROFESSOR_HEADER).strip()  # '김진성 교수님' -> '김진성'
            if name:
                professors.append({'name': name, 'name_en': _cell(row, professor_cols[1])})
        elif PROFESSOR_HEADER in (c.strip() for c in row):
            professor_cols = (sheets.header_index(row, PROFESSOR_HEADER), sheets.header_index(row, '영문 이름'))
        elif _cell(row, number).isdigit():
            if block is None:
                block = []
                blocks.append(block)
            block.append(_pick(row, index))
    if len(blocks) != 2:
        raise ValueError(f'expected 2 numbered blocks (students, former members) in the status sheet, '
                         f'found {len(blocks)}')
    return blocks[0], blocks[1], professors


def _read_alumni(rows):
    """Alumni rows keyed by Korean name without spaces. The header row has '이름' and '학위 취득일'."""
    h = _find_header(rows, '이름', '학위 취득일')
    header = [c.strip() for c in rows[h]]
    index = {key: sheets.header_index(header, label) for key, label in ALUMNI_COLUMNS.items()}
    number = sheets.header_index(header, ALUMNI_NUMBER)
    alumni = {}
    for i in range(h + 1, len(rows)):
        row = rows[i]
        _check_width(row, len(header), i)
        if not _cell(row, number).isdigit():
            continue
        record = _pick(row, index)
        key = names.norm_ko(record['name'])
        if key in alumni:
            raise ValueError(f'row {i + 1} of the Alumni sheet repeats a name of an earlier row')
        alumni[key] = record
    return alumni


def _degree(status, alumni):
    degree = {
        'start': dates.parse_date(alumni.get('start')) or dates.parse_date(status.get('degree_start')),
        'date': dates.parse_date(alumni.get('date')),
        'type': alumni.get('type'),
    }
    return {k: v for k, v in degree.items() if v}


def _member(role, status, alumni):
    """One record from a 현황 row and/or its Alumni row (either may be {}). The Alumni sheet supplies degree,
    affiliation, position and department; the 현황 sheet the rest. Each falls back to the other when empty."""
    name_en = status.get('name_en') or alumni.get('name_en', '')
    optional = {
        'orcid': status.get('orcid'),
        'program': status.get('program'),
        'department': alumni.get('department') or status.get('department'),
        'major': status.get('major'),
        'joined': dates.parse_date(status.get('joined')) or dates.parse_date(alumni.get('start')),
        'degree': _degree(status, alumni),
        'affiliation': alumni.get('affiliation'),
        'position': alumni.get('position'),
    }
    record = {
        'role': role,
        'name': status.get('name') or alumni['name'],
        'name_en': name_en,
        'aliases': [name_en] if name_en else [],
    }
    record.update((k, v) for k, v in optional.items() if v)
    return record


def build_members(status_rows, alumni_rows):
    """Member records (dicts keyed by schema field, plus '_file') from the two sheets' rows.

    Current students stay 'student' (with a degree when they are in the Alumni sheet); former members are
    'alumni' when the Alumni sheet has the same Korean name, else 'former'. Alumni found nowhere in the 현황
    sheet follow as 'alumni'; professors come last with their 1-based 'order'. '_file' is the slug of the
    English name ('member-<n>' for the n-th record when there is none), made unique with -2, -3, ...
    """
    students, formers, professors = _read_status(status_rows)
    alumni = _read_alumni(alumni_rows)
    matched = set()

    def alumni_of(status):
        key = names.norm_ko(status['name'])
        if key in alumni:
            matched.add(key)
        return alumni.get(key, {})

    records = [_member('student', s, alumni_of(s)) for s in students]
    for s in formers:
        a = alumni_of(s)
        records.append(_member('alumni' if a else 'former', s, a))
    records += [_member('alumni', {}, a) for key, a in alumni.items() if key not in matched]
    for order, p in enumerate(professors, 1):
        name_en = p['name_en']
        records.append({'role': 'professor', 'name': p['name'], 'name_en': name_en,
                        'aliases': [name_en] if name_en else [], 'order': order})
    taken = set()
    for n, record in enumerate(records, 1):
        record['_file'] = writer.unique_slug(writer.slugify(record['name_en'], f'member-{n}'), taken)
    return records
