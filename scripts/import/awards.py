"""Build award records from the 수상 현황 sheet. Recipients (Korean names) are matched to members' name.

Every row with a year is an award, numbered or not; the number column is not read.
"""
import dates
import link
import report as rp
import sheets
import writer

SHEET = '수상 현황'

# Allowlist: record key -> header text.
COLUMNS = {
    'year': '연도',
    'recipient': '수상자',
    'conference': '학회',
    'category': '구분',
    'title': '발표명',
}
REQUIRED = ('recipient', 'conference', 'category')


def build_awards(rows, members, report):
    """Award records (schema keys plus '_file' = '<year>-award-<nn>', nn the 1-based order in the sheet)."""
    h = sheets.find_header(rows, COLUMNS['year'], COLUMNS['recipient'])
    index = {key: sheets.header_index(rows[h], label) for key, label in COLUMNS.items()}
    picked, empty = sheets.pick_rows(rows, h, index)
    records, taken = [], set()
    for n, v in picked:
        year = dates.parse_year(v['year'])
        if year is None:
            report.add(rp.SKIPPED, f'{SHEET} {n}행: 연도 없음')
            continue
        file = writer.unique_slug(f'{year}-award-{len(records) + 1:02d}', taken)
        for key in REQUIRED:
            if not v[key]:
                report.add(rp.CHECK, f'awards/{file}: {COLUMNS[key]} 비어 있음')
        member = link.match_ko(v['recipient'], members)
        if not member and v['recipient']:
            report.add(rp.UNMATCHED, v['recipient'])
        record = {
            'year': year,
            'recipient': v['recipient'],
            'member': member,
            'conference': v['conference'],
            'category': v['category'],
            'title': v['title'],
        }
        record = {k: x for k, x in record.items() if x is not None and x != ''}
        record['_file'] = file
        records.append(record)
    if empty:
        report.add(rp.SKIPPED, f'{SHEET}: 빈 행 {empty}개')
    report.add(rp.COUNTS, f'수상 {len(records)}건')
    return records
