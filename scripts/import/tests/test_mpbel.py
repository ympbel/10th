import os
import tempfile
import unittest

import mpbel
import report

# Invented files in the shape of the MPBEL site's patents/ko and seminars/ko markdown (PyYAML-style frontmatter).
PATENT_TEMPLATE = """---
year: YYYY  # 등록(출원) 연도
title: 발명의 명칭  # 특허 제목
venue: |-  # 특허 정보
  등록국가: 대한민국
link: https://...  # (선택)
---

템플릿 본문.
"""

PATENT_WITH_LINK = """---
year: 2012
title: 테스트 장치 및 방법(Test apparatus and method)
authors: 홍길동,김철수
venue: |-
  등록국가: 대한민국
  등록번호: 10-0000000-0000 (특허등록)
  등록일: 2012.12.21
link: https://example.org/patent/1
pinned: false
order: 5
legacy_files: []
legacy_url: http://example.org/bbs/board.php?wr_id=5
legacy_id: 5
---


"""

PATENT_WITHOUT_LINK = """---
year: 2019
title: 시험 영역의 예측 방법
authors: 홍길동, 이영희
venue: |-
  등록국가: 대한민국
  등록일: 2019-10-07
pinned: false
order: 7
legacy_files: []
legacy_id: 7
---
"""

SEMINAR_TEMPLATE = """---
title: 세미나 제목  # 세미나 제목. 필수
date: 'YYYY-MM-DD'  # 글 날짜
presenter: 발표자 이름  # (선택)
---
"""

SEMINAR_QUOTED = """---
title: '[Trend Seminar] Test Hospital''s No. 1: a tour'
date: '2021-04-05'
category: '2021'
pinned: false
presenter: Gildong Hong, Cheolsu Kim
event_date: '2021-04-02'
legacy_images:
- /data/editor/2104/a.jpg
- /data/editor/2104/b.jpg
legacy_files:
- name: slides.pdf
  url: /bbs/download.php?wr_id=12&no=0
legacy_url: http://example.org/bbs/board.php?wr_id=12
legacy_id: 12
---

**-Presenter : Gildong Hong**
presenter: not frontmatter
"""

SEMINAR_BARE = """---
title: 2025/12/29 [Research Seminar] Group sparse test optimization
date: '2025-12-31'
pinned: false
legacy_images: []
legacy_files: []
legacy_id: 471
---

본문
"""


def write_files(directory, files):
    for name, text in files.items():
        with open(os.path.join(directory, name), 'w', encoding='utf-8') as f:
            f.write(text)


class ParseFrontmatterTest(unittest.TestCase):
    def test_scalars(self):
        fm = mpbel.parse_frontmatter(
            "---\n"
            "a: plain value\n"
            "b: 'it''s [quoted]: yes'\n"
            "c: \"double \\\"q\\\" \\\\ end\"\n"
            "d: plain  # trailing comment\n"
            "e: 'quoted'  # trailing comment\n"
            "f:  spaced  \n"
            "g: '2021-04-05'\n"
            "h: 7\n"
            "---\n"
            "body: not a key\n")
        self.assertEqual(fm, {
            'a': 'plain value',
            'b': "it's [quoted]: yes",
            'c': 'double "q" \\ end',
            'd': 'plain',
            'e': 'quoted',
            'f': 'spaced',
            'g': '2021-04-05',
            'h': '7',
        })

    def test_block_scalar_lines_joined_without_trailing_newline(self):
        fm = mpbel.parse_frontmatter("---\nvenue: |-\n  line one\n  line: two\n\n    indented\nnext: x\n---\n")
        self.assertEqual(fm['venue'], 'line one\nline: two\n\n  indented')
        self.assertEqual(fm['next'], 'x')

    def test_nested_mapping(self):
        # The shape writer.write_md gives a member file's degree.
        fm = mpbel.parse_frontmatter('---\nrole: "alumni"\ndegree:\n  start: "2020-03"\n  type: "공학석사"\n'
                                     'aliases:\n  - "Gildong Hong"\n---\n')
        self.assertEqual(fm, {'role': 'alumni', 'degree': {'start': '2020-03', 'type': '공학석사'},
                              'aliases': ['Gildong Hong']})

    def test_lists(self):
        fm = mpbel.parse_frontmatter(
            "---\n"
            "empty: []\n"
            "images:\n"
            "- /a.jpg\n"
            "- '/b c.jpg'\n"
            "indented:\n"
            "  - one\n"
            "files:\n"
            "- name: x.pdf\n"
            "  url: /x.pdf\n"
            "after: kept\n"
            "---\n")
        self.assertEqual(fm['empty'], [])
        self.assertEqual(fm['images'], ['/a.jpg', '/b c.jpg'])
        self.assertEqual(fm['indented'], ['one'])
        self.assertEqual(fm['after'], 'kept')

    def test_comment_after_a_list_key(self):
        fm = mpbel.parse_frontmatter("---\nimages:  # optional\n- /a.jpg\n---\n")
        self.assertEqual(fm['images'], ['/a.jpg'])

    def test_missing_frontmatter_is_an_error(self):
        with self.assertRaises(ValueError):
            mpbel.parse_frontmatter('no frontmatter\n')
        with self.assertRaises(ValueError):
            mpbel.parse_frontmatter('---\ntitle: never closed\n')

    def test_scalar_continued_on_indented_lines_is_an_error(self):
        # PyYAML wraps long values this way; reading only the first line would cut a title short.
        with self.assertRaises(ValueError):
            mpbel.parse_frontmatter("---\ntitle: 'a long title\n  continued here'\n---\n")

    def test_unclosed_quote_is_an_error(self):
        with self.assertRaises(ValueError):
            mpbel.parse_frontmatter("---\ntitle: 'never closed\n---\n")


class ReadPatentsTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        write_files(self.dir.name, {
            '_template.md': PATENT_TEMPLATE,
            '2019-7-entry.md': PATENT_WITHOUT_LINK,
            '2012-5-test-apparatus.md': PATENT_WITH_LINK,
            'notes.txt': 'not markdown',
        })
        self.report = report.Report()
        self.records = mpbel.read_patents(self.dir.name, self.report)

    def tearDown(self):
        self.dir.cleanup()

    def test_template_excluded_and_sorted_by_file_name(self):
        self.assertEqual([r['_file'] for r in self.records], ['2012-5-test-apparatus', '2019-7-entry'])

    def test_record_fields(self):
        self.assertEqual(self.records[0], {
            'year': 2012,
            'title': '테스트 장치 및 방법(Test apparatus and method)',
            'authors': '홍길동,김철수',
            'venue': '등록국가: 대한민국\n등록번호: 10-0000000-0000 (특허등록)\n등록일: 2012.12.21',
            'link': 'https://example.org/patent/1',
            'order': 5,
            '_file': '2012-5-test-apparatus',
        })

    def test_missing_link_left_out(self):
        self.assertNotIn('link', self.records[1])
        self.assertEqual(self.records[1]['venue'], '등록국가: 대한민국\n등록일: 2019-10-07')

    def test_count_reported(self):
        self.assertEqual(self.report.lines(report.COUNTS), ['특허 2건'])

    def test_report_is_optional(self):
        self.assertEqual(mpbel.read_patents(self.dir.name), self.records)


class ReadSeminarsTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        write_files(self.dir.name, {
            '_template.md': SEMINAR_TEMPLATE,
            '2025-12-31-471.md': SEMINAR_BARE,
            '2021-04-05-12.md': SEMINAR_QUOTED,
        })
        self.report = report.Report()
        self.records = mpbel.read_seminars(self.dir.name, self.report)

    def tearDown(self):
        self.dir.cleanup()

    def test_template_excluded_and_sorted_by_file_name(self):
        self.assertEqual([r['_file'] for r in self.records], ['2021-04-05-12', '2025-12-31-471'])

    def test_record_fields(self):
        self.assertEqual(self.records[0], {
            'title': "[Trend Seminar] Test Hospital's No. 1: a tour",
            'date': '2021-04-05',
            'presenter': 'Gildong Hong, Cheolsu Kim',
            'event_date': '2021-04-02',
            'source_url': 'https://ympbel.github.io/notice/seminar/2021-04-05-12/',
            '_file': '2021-04-05-12',
        })

    def test_bare_title_and_missing_optional_fields(self):
        self.assertEqual(self.records[1], {
            'title': '2025/12/29 [Research Seminar] Group sparse test optimization',
            'date': '2025-12-31',
            'source_url': 'https://ympbel.github.io/notice/seminar/2025-12-31-471/',
            '_file': '2025-12-31-471',
        })

    def test_missing_optional_fields_reported(self):
        self.assertEqual(self.report.lines(report.COUNTS), ['세미나 2건'])
        self.assertEqual(self.report.lines(report.MISSING_DATES), ['seminars/2025-12-31-471: event_date'])
        self.assertEqual(self.report.lines(report.CHECK), ['seminars/2025-12-31-471: presenter 비어 있음'])


if __name__ == '__main__':
    unittest.main()
