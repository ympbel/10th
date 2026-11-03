"""Convert the sheet exports in data/ and the MPBEL site's patents and seminars into content files.

    python3 scripts/import/run.py --data data --mpbel ../Website_20261028/src/content --out src/content \\
        [--force] [--only members,papers,...] [--check] [--corrections scripts/import/corrections.json]

Each record becomes <out>/<collection>/<file>.md. A file that already exists is kept unless --force is given:
after the first run the files are edited by hand. --only limits the collections that are written, counted and
checked; the collections they link to are still read. Without members in --only, authors are linked against the
existing <out>/members/*.md files, so aliases added there by hand are used; when members are rebuilt from the
sheets, each keeps the aliases its existing file has. A typo in a sheet is fixed in corrections.json, not in the
sheet: its values replace the record's fields and the file is named from the corrected record, so a corrected year
renames the file. The count table is printed and put at the top of report.md; with --check the exit code is 1 when a
count differs from EXPECTED.
"""
import argparse
import json
import sys
from pathlib import Path

import awards
import challenges
import members
import mpbel
import papers
import presentations
import projects
import report as rp
import sheets
import writer

HERE = Path(__file__).resolve().parent

# The one table of expected counts. 'members' is everyone but the professors, who are counted on their own row.
EXPECTED = {
    'members': 61,
    'professors': 8,
    'papers': 217,
    'presentations': 379,
    'awards': 41,
    'challenges': 4,
    'projects': 15,
    'patents': 7,
    'seminars': 431,
}

COLLECTIONS = ('members', 'papers', 'presentations', 'awards', 'challenges', 'projects', 'patents', 'seminars')

# File names in --data.
SHEETS = {
    'status': 'MPBEL - 현황.html',
    'alumni': 'Alumni.html',
    'papers': 'MPBEL 논문.html',
    'presentations': '학회 초록.html',
    'awards': '수상 현황.html',
    'challenges': 'Challenge.html',
    'projects': '과제정보.html',
}


def _load_json(name):
    with open(HERE / name, encoding='utf-8') as f:
        return json.load(f)


def _paper_like(record):
    return papers.file_base(record['year'], record.get('first_author', ''), record['title'])


# The collections corrections.json may correct: each one's file-name rule, the one its builder names records by.
FILE_NAMES = {
    'papers': _paper_like,
    'presentations': _paper_like,
    'awards': lambda record: awards.file_base(record['year'], record['order']),
}


def load_corrections(path):
    """corrections.json as {collection: {uncorrected file name: {field: value}}}.

    The file is one JSON object keyed by '<collection>/<file name the sheet gives>', each value an object of field
    values. A collection without a file-name rule in FILE_NAMES, a key without '/', an empty or non-object value and
    a field starting with '_' are ValueErrors naming the key.
    """
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError(f'{path}: expected a JSON object keyed by "<collection>/<file>"')
    corrections = {}
    for key, fields in data.items():
        collection, _, file = key.partition('/')
        if collection not in FILE_NAMES or not file:
            raise ValueError(f'{path}: "{key}": the key must be "<collection>/<file>" with the collection one of '
                             f'{", ".join(FILE_NAMES)}')
        if not isinstance(fields, dict) or not fields:
            raise ValueError(f'{path}: "{key}": the value must be an object of field values, e.g. {{"year": 2020}}')
        hidden = [name for name in fields if name.startswith('_')]
        if hidden:
            raise ValueError(f'{path}: "{key}": cannot set {", ".join(hidden)}')
        corrections.setdefault(collection, {})[file] = fields
    return corrections


def apply_corrections(collection, records, corrections, report):
    """Apply corrections[collection] (load_corrections) to records in place and rename each corrected record.

    A correction is found by the record's uncorrected '_file'; its fields replace the record's, then '_file' is
    derived again by the collection's rule in FILE_NAMES (a '-2' suffix when another record has that name). Each
    correction is noted under 보정 as '<old> → <new>: <field> <value>, ...'. A file name that no record has is a
    ValueError, so a typo in corrections.json stops the run. Returns [(old file, new file)] in record order.
    """
    wanted = corrections.get(collection, {})
    files = {r['_file'] for r in records}
    unknown = sorted(f for f in wanted if f not in files)
    if unknown:
        raise ValueError(f'corrections.json: no {collection} record has the file name '
                         f'{", ".join(f"{collection}/{f}" for f in unknown)}; the key is the file name the sheet '
                         f'gives, before the correction')
    taken = files - set(wanted)
    renamed = []
    for record in records:
        old = record['_file']
        if old not in wanted:
            continue
        record.update(wanted[old])
        record['_file'] = writer.unique_slug(FILE_NAMES[collection](record), taken)
        values = ', '.join(f'{name} {json.dumps(v, ensure_ascii=False)}' for name, v in wanted[old].items())
        report.add(rp.CORRECTIONS, f'{collection}/{old} → {collection}/{record["_file"]}: {values}')
        renamed.append((old, record['_file']))
    return renamed


class Sources:
    """Builds a collection's records on first use, once, so --only reads only the inputs it needs.

    Members are rebuilt from the sheets only when rebuild_members is set; otherwise they are read from the member
    files in out. corrections (load_corrections) are applied to each collection as it is built.
    """

    def __init__(self, data, mpbel_content, out, report, rebuild_members, corrections=None):
        self.data, self.mpbel, self.out = Path(data), Path(mpbel_content), Path(out)
        self.report, self.rebuild_members, self._built = report, rebuild_members, {}
        self.corrections = corrections or {}

    def get(self, collection):
        if collection not in self._built:
            records = getattr(self, f'_{collection}')()
            for old, new in apply_corrections(collection, records, self.corrections, self.report):
                if old != new and (self.out / collection / f'{old}.md').exists():
                    self.report.add(rp.CHECK, f'{collection}/{old}.md: 보정 전 이름의 파일이 남아 있음. 보정한 '
                                              f'항목은 {collection}/{new}.md이므로 지울 것 (--force는 지우지 않음)')
            self._built[collection] = records
        return self._built[collection]

    def _sheet(self, key):
        return sheets.read_sheet(self.data / SHEETS[key])

    def _members(self):
        directory = self.out / 'members'
        existing = members.from_files(mpbel.read_entries(directory))
        if self.rebuild_members:
            records = members.build_members(self._sheet('status'), self._sheet('alumni'))
            members.keep_aliases(records, existing)
            source = ''
        elif existing:
            records, source = existing, f' ({directory}에서 읽음)'
        else:
            raise SystemExit(f'{directory} has no member files to link against: run with members in --only first')
        (_, people), (_, professors) = rows('members', records)
        self.report.add(rp.COUNTS, f'구성원 {len(people)}명, 교수 {len(professors)}명{source}')
        return records

    def _projects(self):
        return projects.build_projects(self._sheet('projects'), self.report)

    def _papers(self):
        return papers.build_papers(self._sheet('papers'), self.get('members'), self.get('projects'),
                                   _load_json('projects.json'), self.report)

    def _presentations(self):
        return presentations.build_presentations(self._sheet('presentations'), self.get('members'),
                                                 _load_json('conferences.json'), self.report)

    def _awards(self):
        return awards.build_awards(self._sheet('awards'), self.get('members'), self.report)

    def _challenges(self):
        return challenges.build_challenges(self._sheet('challenges'), self.report)

    def _patents(self):
        return mpbel.read_patents(self.mpbel / 'patents' / 'ko', self.report)

    def _seminars(self):
        return mpbel.read_seminars(self.mpbel / 'seminars' / 'ko', self.report)


def rows(collection, records):
    """(row name, records) pairs for the count table; members are split into 'members' and 'professors'."""
    if collection != 'members':
        return [(collection, records)]
    return [('members', [r for r in records if r['role'] != 'professor']),
            ('professors', [r for r in records if r['role'] == 'professor'])]


def write_records(directory, records, force):
    """Write each record to <directory>/<_file>.md. Returns (written, kept): kept files existed and were left alone."""
    written = sum(writer.write_md(Path(directory) / f'{r["_file"]}.md', r, force=force) for r in records)
    return written, len(records) - written


def mismatches(counts, expected=EXPECTED):
    """(row, count, expected count) for each row in counts whose count differs from expected."""
    return [(row, n, expected[row]) for row, n in counts.items() if n != expected[row]]


def table(counted):
    """The count table as Markdown lines, for (row, count, written, kept) tuples."""
    lines = ['| 항목 | 건수 | 기대값 | 새로 씀 | 그대로 둠 | 대조 |', '|---|---:|---:|---:|---:|---|']
    for row, n, written, kept in counted:
        verdict = '맞음' if n == EXPECTED[row] else '다름'
        lines.append(f'| {row} | {n} | {EXPECTED[row]} | {written} | {kept} | {verdict} |')
    return lines


def _collections(value):
    """'papers, members' -> ['members', 'papers'] (in COLLECTIONS order); an unknown name is an error."""
    names = [n.strip() for n in value.split(',') if n.strip()]
    unknown = [n for n in names if n not in COLLECTIONS]
    if unknown or not names:
        raise argparse.ArgumentTypeError(
            f'unknown collection {", ".join(unknown) or "(none)"}; choose from {", ".join(COLLECTIONS)}')
    return [c for c in COLLECTIONS if c in names]


def parse_args(argv):
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--data', required=True, help='folder with the Google Sheets HTML exports')
    parser.add_argument('--mpbel', required=True, help="the MPBEL site's src/content (patents/ko, seminars/ko)")
    parser.add_argument('--out', required=True, help='content folder to write into (src/content)')
    parser.add_argument('--report', default=str(HERE / 'report.md'), help='where to write the report')
    parser.add_argument('--corrections', default=str(HERE / 'corrections.json'),
                        help='field corrections keyed by "<collection>/<file>" (default: corrections.json here)')
    parser.add_argument('--force', action='store_true', help='overwrite existing files')
    parser.add_argument('--only', type=_collections, default=list(COLLECTIONS),
                        help=f'comma-separated collections to write ({",".join(COLLECTIONS)})')
    parser.add_argument('--check', action='store_true', help='exit with 1 when a count differs from EXPECTED')
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    report = rp.Report()
    sources = Sources(args.data, args.mpbel, args.out, report, rebuild_members='members' in args.only,
                      corrections=load_corrections(args.corrections))
    # Build every collection before writing any, so an error (such as a typo in corrections.json) leaves out as it was.
    built = {collection: sources.get(collection) for collection in args.only}
    counted = []
    for collection in args.only:
        for row, records in rows(collection, built[collection]):
            counted.append((row, len(records), *write_records(Path(args.out) / collection, records, args.force)))
    lines = table(counted)
    report.write(args.report, head=lines)
    print('\n'.join(lines))
    print(f'\n보고서: {args.report}')
    wrong = mismatches({row: n for row, n, _, _ in counted})
    for row, n, want in wrong:
        print(f'기대값과 다름: {row} {n} (기대값 {want})', file=sys.stderr)
    return 1 if args.check and wrong else 0


if __name__ == '__main__':
    sys.exit(main())
