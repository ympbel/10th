"""Build challenge participation records from the Challenge sheet. Dates stay as written ('March 17, 2021')."""
import dates
import report as rp
import sheets
import writer

SHEET = 'Challenge'

# Allowlist: record key -> header text.
COLUMNS = {
    'year': 'Year',
    'host': 'Host',
    'title': 'Running title',
    'objective': 'Objective',
    'dataset_release': 'Release date of training dataset',
    'submission': 'Final submission',
    'link': 'Link',
}
REQUIRED = ('host', 'title', 'objective')


def build_challenges(rows, report):
    """Challenge records (schema keys plus '_file' = '<year>-<host slug>-<n>', n the 1-based order in the sheet)."""
    h = sheets.find_header(rows, COLUMNS['host'], COLUMNS['title'])
    index = {key: sheets.header_index(rows[h], label) for key, label in COLUMNS.items()}
    picked, empty = sheets.pick_rows(rows, h, index)
    records, taken = [], set()
    for n, v in picked:
        year = dates.parse_year(v['year'])
        if year is None:
            report.add(rp.SKIPPED, f'{SHEET} {n}행: 연도 없음')
            continue
        host = writer.slugify(v['host'], 'challenge')
        file = writer.unique_slug(f'{year}-{host}-{len(records) + 1}', taken)
        for key in REQUIRED:
            if not v[key]:
                report.add(rp.CHECK, f'challenges/{file}: {COLUMNS[key]} 비어 있음')
        record = {key: v[key] for key in COLUMNS if v[key]}
        record['year'] = year
        record['_file'] = file
        records.append(record)
    if empty:
        report.add(rp.SKIPPED, f'{SHEET}: 빈 행 {empty}개')
    report.add(rp.COUNTS, f'챌린지 {len(records)}건')
    return records
