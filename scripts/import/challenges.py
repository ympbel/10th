"""Build challenge participation records from the Challenge sheet. Dates stay as written ('March 17, 2021')."""
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
    picked, empty = sheets.pick_columns(rows, COLUMNS, COLUMNS['host'], COLUMNS['title'])
    records, taken = [], set()
    for n, v in picked:
        year = report.year_or_skip(SHEET, n, v['year'])
        if year is None:
            continue
        host = writer.slugify(v['host'], 'challenge')
        file = writer.unique_slug(f'{year}-{host}-{len(records) + 1}', taken)
        report.blanks(f'challenges/{file}', v, REQUIRED, COLUMNS)
        record = {key: v[key] for key in COLUMNS if v[key]}
        record['year'] = year
        record['_file'] = file
        records.append(record)
    report.empty_rows(SHEET, empty)
    report.add(rp.COUNTS, f'챌린지 {len(records)}건')
    return records
