"""Build award records from the 수상 현황 sheet. Recipients (Korean names) are matched to members' name.

Every row with a year is an award, numbered or not; the number column is not read.
"""
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
    """Award records (schema keys plus '_file' = '<year>-award-<nn>'); nn and 'order' are the record's 1-based
    position in the sheet."""
    picked, empty = sheets.pick_columns(rows, COLUMNS, COLUMNS['year'], COLUMNS['recipient'])
    records, taken = [], set()
    for n, v in picked:
        year = report.year_or_skip(SHEET, n, v['year'])
        if year is None:
            continue
        file = writer.unique_slug(f'{year}-award-{len(records) + 1:02d}', taken)
        report.blanks(f'awards/{file}', v, REQUIRED, COLUMNS)
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
        record['order'] = len(records) + 1
        record['_file'] = file
        records.append(record)
    report.empty_rows(SHEET, empty)
    report.add(rp.COUNTS, f'수상 {len(records)}건')
    return records
