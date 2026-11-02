import contextlib
import html
import io
import os
import tempfile
import unittest

import mpbel
import run
from tests.test_members import alumni_rows, status_rows
from tests.test_records import PAPER_HEADER, paper_row, project_rows

INVENTED_EXPECTED = {'members': 3, 'professors': 1, 'papers': 2}


class MismatchesTest(unittest.TestCase):
    def test_equal_counts_pass(self):
        self.assertEqual(run.mismatches({'members': 3, 'professors': 1}, INVENTED_EXPECTED), [])

    def test_each_differing_row_listed(self):
        self.assertEqual(run.mismatches({'members': 4, 'professors': 1, 'papers': 0}, INVENTED_EXPECTED),
                         [('members', 4, 3), ('papers', 0, 2)])

    def test_rows_not_counted_are_not_checked(self):
        self.assertEqual(run.mismatches({'papers': 2}, INVENTED_EXPECTED), [])

    def test_every_collection_has_an_expected_count(self):
        self.assertEqual(set(run.EXPECTED), set(run.COLLECTIONS) | {'professors'})


class RowsTest(unittest.TestCase):
    def test_members_split_into_people_and_professors(self):
        people = [{'role': 'student', '_file': 'a'}, {'role': 'former', '_file': 'b'}]
        professor = {'role': 'professor', '_file': 'p'}
        self.assertEqual(run.rows('members', people[:1] + [professor] + people[1:]),
                         [('members', people), ('professors', [professor])])

    def test_other_collections_are_one_row(self):
        records = [{'_file': 'x'}]
        self.assertEqual(run.rows('papers', records), [('papers', records)])


class WriteRecordsTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.out = os.path.join(self.dir.name, 'papers')
        self.records = [{'year': 2020, 'title': 'A', '_file': 'a'}, {'year': 2021, 'title': 'B', '_file': 'b'}]

    def tearDown(self):
        self.dir.cleanup()

    def read(self, name):
        with open(os.path.join(self.out, name), encoding='utf-8') as f:
            return f.read()

    def test_written_then_kept_then_forced(self):
        self.assertEqual(run.write_records(self.out, self.records, force=False), (2, 0))
        self.assertEqual(self.read('a.md'), '---\nyear: 2020\ntitle: "A"\n---\n')
        edited = [{'year': 2020, 'title': 'A edited', '_file': 'a'}]
        self.assertEqual(run.write_records(self.out, edited, force=False), (0, 1))
        self.assertEqual(self.read('a.md'), '---\nyear: 2020\ntitle: "A"\n---\n')
        self.assertEqual(run.write_records(self.out, edited, force=True), (1, 0))
        self.assertIn('A edited', self.read('a.md'))


PATHS = ['--data', 'd', '--mpbel', 'm', '--out', 'o']


class ParseArgsTest(unittest.TestCase):
    def test_only_keeps_collection_order(self):
        args = run.parse_args(PATHS + ['--only', 'papers, members'])
        self.assertEqual(args.only, ['members', 'papers'])

    def test_all_collections_by_default(self):
        self.assertEqual(run.parse_args(PATHS).only, list(run.COLLECTIONS))

    def test_unknown_collection_rejected(self):
        with contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit):
            run.parse_args(PATHS + ['--only', 'papers,paper'])


PATENT = '---\nyear: 2012\ntitle: 테스트 장치\nauthors: 홍길동\nvenue: |-\n  등록국가: 대한민국\n---\n'
SEMINAR = "---\ntitle: '[Seminar] Test'\ndate: '2021-04-05'\npresenter: Gildong Hong\nevent_date: '2021-04-02'\n---\n"


class MainTest(unittest.TestCase):
    """End to end on invented MPBEL files: --only patents,seminars needs no sheets."""

    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        d = self.dir.name
        self.mpbel, self.out, self.report = os.path.join(d, 'mpbel'), os.path.join(d, 'out'), os.path.join(d, 'r.md')
        for folder, name, text in (('patents', '2012-1-test.md', PATENT), ('seminars', '2021-04-05-1.md', SEMINAR)):
            os.makedirs(os.path.join(self.mpbel, folder, 'ko'))
            with open(os.path.join(self.mpbel, folder, 'ko', name), 'w', encoding='utf-8') as f:
                f.write(text)

    def tearDown(self):
        self.dir.cleanup()

    def main(self, *extra):
        stdout = io.StringIO()
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stdout):
            code = run.main(['--data', os.path.join(self.dir.name, 'no-data'), '--mpbel', self.mpbel,
                             '--out', self.out, '--report', self.report, '--only', 'patents,seminars', *extra])
        return code, stdout.getvalue()

    def test_writes_files_report_and_table(self):
        code, printed = self.main()
        self.assertEqual(code, 0)
        self.assertTrue(os.path.exists(os.path.join(self.out, 'patents', '2012-1-test.md')))
        with open(os.path.join(self.out, 'seminars', '2021-04-05-1.md'), encoding='utf-8') as f:
            self.assertIn('source_url: "https://ympbel.github.io/notice/seminar/2021-04-05-1/"', f.read())
        with open(self.report, encoding='utf-8') as f:
            text = f.read()
        self.assertTrue(text.startswith('# 변환 보고서\n\n| 항목 |'))
        self.assertIn('| patents | 1 | 7 | 1 | 0 | 다름 |', text)
        self.assertLess(text.index('| seminars |'), text.index('## 건수'))
        self.assertIn('| seminars | 1 | 431 | 1 | 0 | 다름 |', printed)

    def test_check_fails_on_a_count_mismatch(self):
        code, printed = self.main('--check')
        self.assertEqual(code, 1)
        self.assertIn('patents 1 (기대값 7)', printed)

    def test_second_run_keeps_existing_files(self):
        self.main()
        code, printed = self.main()
        self.assertIn('| patents | 1 | 7 | 0 | 1 | 다름 |', printed)



def write_sheet(path, rows):
    """rows as a minimal sheet export that sheets.read_sheet reads back."""
    body = ''.join('<tr>' + ''.join(f'<td>{html.escape(c)}</td>' for c in row) + '</tr>' for row in rows)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'<table><tbody>{body}</tbody></table>')


# An existing member file (invented person) with a spelling added by hand after the first run.
HAND_EDITED_MEMBER = ('---\nrole: "student"\nname: "김하늘"\nname_en: "Haneul Kim"\naliases:\n  - "Haneul Kim"\n'
                      '  - "H. N. Kim"\nprogram: "석사"\ndegree:\n  start: "2021-03-01"\n---\n')
PROFESSOR = '---\nrole: "professor"\nname: "한가람"\nname_en: "Garam Han"\naliases:\n  - "Garam Han"\norder: 1\n---\n'


class LinkFromContentTest(unittest.TestCase):
    """Members come from the existing member files when --only leaves members out, and hand-added aliases survive a
    rebuild of members from the sheets."""

    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        d = self.dir.name
        self.data, self.out = os.path.join(d, 'data'), os.path.join(d, 'out')
        os.makedirs(self.data)
        os.makedirs(os.path.join(self.out, 'members'))
        self.write(os.path.join(self.out, 'members', 'haneul-kim.md'), HAND_EDITED_MEMBER)
        self.write(os.path.join(self.out, 'members', 'garam-han.md'), PROFESSOR)

    def tearDown(self):
        self.dir.cleanup()

    @staticmethod
    def write(path, text):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)

    def main(self, *args):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return run.main(['--data', self.data, '--mpbel', os.path.join(self.dir.name, 'mpbel'), '--out', self.out,
                             '--report', os.path.join(self.dir.name, 'r.md'), *args])

    def read(self, *path):
        with open(os.path.join(self.out, *path), encoding='utf-8') as f:
            return mpbel.parse_frontmatter(f.read())

    def test_only_papers_links_through_an_alias_in_the_member_file(self):
        # No 현황 or Alumni sheet in data/: the members must come from out/members/.
        write_sheet(os.path.join(self.data, run.SHEETS['papers']), [
            PAPER_HEADER,
            paper_row('2021', 'H. N. Kim', '', 'Garam Han', '', 'Alias linked phantom study', 'Journal of Tests'),
        ])
        write_sheet(os.path.join(self.data, run.SHEETS['projects']), project_rows())
        self.assertEqual(self.main('--only', 'papers'), 0)
        paper = self.read('papers', '2021-h-n-kim-alias-linked-phantom.md')
        self.assertEqual(paper['members'], ['haneul-kim'])
        self.assertEqual(self.read('members', 'haneul-kim.md')['aliases'], ['Haneul Kim', 'H. N. Kim'])

    def test_rebuilding_members_with_force_keeps_hand_added_aliases(self):
        write_sheet(os.path.join(self.data, run.SHEETS['status']), status_rows())
        write_sheet(os.path.join(self.data, run.SHEETS['alumni']), alumni_rows())
        self.main('--force', '--only', 'members')
        member = self.read('members', 'haneul-kim.md')
        self.assertEqual(member['aliases'], ['Haneul Kim', 'H. N. Kim'])
        self.assertEqual(member['joined'], '2021-03-01')  # rewritten from the sheet
        self.assertEqual(self.read('members', 'bada-lee.md')['aliases'], ['Bada Lee'])

    def test_without_member_files_linking_needs_members(self):
        for name in os.listdir(os.path.join(self.out, 'members')):
            os.remove(os.path.join(self.out, 'members', name))
        write_sheet(os.path.join(self.data, run.SHEETS['awards']), [['', '연도', '수상자', '학회', '구분', '발표명']])
        with self.assertRaises(SystemExit) as caught:
            self.main('--only', 'awards')
        self.assertIn('members', str(caught.exception.code))


if __name__ == '__main__':
    unittest.main()
