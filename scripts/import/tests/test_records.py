import json
import os
import tempfile
import unittest

import awards
import challenges
import papers
import presentations
import projects
import report

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_json(name):
    with open(os.path.join(HERE, name), encoding='utf-8') as f:
        return json.load(f)


def person(slug, name, name_en, role='student'):
    """A member dict shaped like members.build_members output (invented people)."""
    return {'role': role, 'name': name, 'name_en': name_en, 'aliases': [name_en] if name_en else [], '_file': slug}


MEMBERS = [
    dict(person('byong-su-choi', '최하람', 'Byong Su Choi'), aliases=['Byong Su Choi', 'Byoung Su Choi']),
    person('sang-kyun-yoo', '유다온', 'Sang Kyun Yoo'),
    person('soyoung-jeon', '전소리', 'Soyoung Jeon'),
    person('sangmin-lee', '이온유', 'Sangmin Lee'),
    person('member-5', '신비', ''),
    person('garam-han', '한가람', 'Garam Han', role='professor'),
]

# Hand-made project records, shaped like projects.build_projects output.
PROJECTS = [
    {'title': 'A과제', 'nickname': 'Alpha', '_file': 'project-01'},
    {'title': '중견연구 테스트', 'nickname': 'Mid', '_file': 'project-02'},
    {'title': 'B과제', 'nickname': 'Dup', '_file': 'project-03'},
    {'title': 'C과제', 'nickname': 'Dup', '_file': 'project-04'},
]

# Columns that must never be read carry these values; none may reach a record or the report.
SENTINELS = ['NAS-SENTINEL', 'PFKIM-SENTINEL', '77.77', '88.88', 'CONTENT-SENTINEL', 'MANAGER-SENTINEL',
             'QUOTA-SENTINEL']


def dump(records, rep):
    return json.dumps(records, ensure_ascii=False) + json.dumps(rep.sections, ensure_ascii=False)


# ---- 논문 -------------------------------------------------------------------------------------------------

PAPER_HEADER = ['나스 위치', '', 'Year', '1st author', '공동 1저자', '교신저자', '교신저자 2', 'Pf. Kim 교신 여부',
                'Title', 'Journal Name', 'IF', 'IF - 교신', 'IF-공동교신', '논문 사사 번호',
                '과제 이름 - "연구실 과제정보" 참고', '']
PW = len(PAPER_HEADER)
PAPER_FIELDS = {'year', 'title', 'first_author', 'co_first', 'corresponding', 'journal', 'impact_factor',
                'acknowledgement', 'projects', 'members', 'link', 'order', '_file'}


def paper_row(year='', first='', co_first='', corr='', corr2='', title='', journal='', impact='', ack='',
              project=''):
    return ['NAS-SENTINEL', '', year, first, co_first, corr, corr2, 'PFKIM-SENTINEL', title, journal, impact,
            '77.77', '88.88', ack, project, '']


def paper_rows():
    totals = [''] * PW
    totals[10], totals[11], totals[12] = '512.3', '301.2', '99.9'
    return [
        PAPER_HEADER,  # sheet row 1
        paper_row('2021', 'Byong Su Choi, Sang Kyun Yoo', '', 'Garam Han', 'Soyoung Jeon',
                  'Deep learning dose prediction for phantoms', 'Journal of Tests', '3.5', 'NRF-0001',
                  'A과제, 중견'),
        [''] * PW,
        paper_row('2019', 'Nobody Known', 'Sangmin lee; Byoung Su Choi', 'Garam Han', '', 'Phantom study',
                  'Test Letters', '-'),
        paper_row(title='A title row without a year', journal='Some Journal'),  # row 5
        paper_row('2021', 'Byong Su Choi', '', 'Garam Han', '', 'Deep learning dose maps again',
                  'Journal of Tests', '2'),
        totals,  # row 7: IF sums only
    ]


class PapersTest(unittest.TestCase):
    def setUp(self):
        self.report = report.Report()
        self.records = papers.build_papers(paper_rows(), MEMBERS, PROJECTS, {}, self.report)

    def test_rows_with_year_and_title_only(self):
        self.assertEqual(len(self.records), 3)

    def test_first_paper(self):
        self.assertEqual(self.records[0], {
            'year': 2021, 'title': 'Deep learning dose prediction for phantoms',
            'first_author': 'Byong Su Choi, Sang Kyun Yoo', 'co_first': [],
            'corresponding': ['Garam Han', 'Soyoung Jeon'], 'journal': 'Journal of Tests', 'impact_factor': 3.5,
            'acknowledgement': 'NRF-0001', 'projects': ['project-01'],
            'members': ['byong-su-choi', 'sang-kyun-yoo', 'soyoung-jeon'], 'order': 1,
            '_file': '2021-byong-su-choi-deep-learning-dose',
        })

    def test_impact_factor_is_a_float_and_dash_is_absent(self):
        self.assertIsInstance(self.records[0]['impact_factor'], float)
        self.assertIsInstance(self.records[2]['impact_factor'], float)
        self.assertEqual(self.records[2]['impact_factor'], 2.0)
        self.assertNotIn('impact_factor', self.records[1])

    def test_co_first_authors_listed_and_linked(self):
        r = self.records[1]
        self.assertEqual(r['co_first'], ['Sangmin lee', 'Byoung Su Choi'])
        self.assertEqual(r['members'], ['sangmin-lee', 'byong-su-choi'])
        self.assertEqual(r['projects'], [])
        self.assertNotIn('acknowledgement', r)

    def test_only_allowed_columns_reach_records_and_report(self):
        text = dump(self.records, self.report)
        for sentinel in SENTINELS:
            self.assertNotIn(sentinel, text)
        for r in self.records:
            self.assertLessEqual(set(r), PAPER_FIELDS)

    def test_sheet_order_kept(self):
        self.assertEqual([r['order'] for r in self.records], [1, 2, 3])

    def test_file_names_unique(self):
        self.assertEqual([r['_file'] for r in self.records], [
            '2021-byong-su-choi-deep-learning-dose', '2019-nobody-known-phantom-study',
            '2021-byong-su-choi-deep-learning-dose-2'])

    def test_row_without_year_and_totals_rows_skipped_and_reported(self):
        skipped = self.report.lines(report.SKIPPED)
        self.assertIn('MPBEL 논문 5행: 연도 없음', skipped)
        self.assertIn('MPBEL 논문 7행: 제목 없음', skipped)
        self.assertIn('MPBEL 논문: 빈 행 1개', skipped)
        self.assertNotIn('A title row without a year', dump(self.records, self.report))

    def test_unresolved_project_and_unmatched_authors_reported(self):
        self.assertEqual(self.report.lines(report.UNRESOLVED_PROJECTS),
                         ['중견 (papers/2021-byong-su-choi-deep-learning-dose)'])
        self.assertEqual(self.report.lines(report.UNMATCHED), ['Nobody Known'])  # the professor is not listed
        self.assertEqual(self.report.lines(report.COUNTS), ['논문 3건'])

    def test_project_map_resolves_abbreviation(self):
        rep = report.Report()
        records = papers.build_papers(paper_rows(), MEMBERS, PROJECTS, {'중견': 'project-02'}, rep)
        self.assertEqual(records[0]['projects'], ['project-01', 'project-02'])
        self.assertEqual(rep.lines(report.UNRESOLVED_PROJECTS), [])

    def test_near_spelling_reported_as_candidate(self):
        rows = paper_rows()
        rows[1][3] = 'Sang Kyon Yo'
        rep = report.Report()
        records = papers.build_papers(rows, MEMBERS, PROJECTS, {}, rep)
        self.assertEqual(records[0]['members'], ['soyoung-jeon'])
        self.assertIn('Sang Kyon Yo → sang-kyun-yoo', rep.lines(report.NEAR))
        self.assertEqual(records[0]['_file'], '2021-sang-kyon-yo-deep-learning-dose')

    def test_empty_first_author_falls_back_to_anon_and_is_reported(self):
        rows = paper_rows()
        rows[3][3] = ''
        rows[3][9] = ''
        rep = report.Report()
        records = papers.build_papers(rows, MEMBERS, PROJECTS, {}, rep)
        self.assertEqual(records[1]['_file'], '2019-anon-phantom-study')
        self.assertNotIn('first_author', records[1])
        self.assertIn('papers/2019-anon-phantom-study: 1st author 비어 있음', rep.lines(report.CHECK))
        self.assertIn('papers/2019-anon-phantom-study: Journal Name 비어 있음', rep.lines(report.CHECK))


# ---- 과제 연결 ----------------------------------------------------------------------------------------------

class ResolveProjectRefsTest(unittest.TestCase):
    def test_title_matches_and_abbreviation_needs_the_map(self):
        self.assertEqual(projects.resolve_project_refs('A과제, 중견', PROJECTS, {}), (['project-01'], ['중견']))

    def test_abbreviation_in_the_map(self):
        self.assertEqual(projects.resolve_project_refs('A과제, 중견', PROJECTS, {'중견': 'project-02'}),
                         (['project-01', 'project-02'], []))

    def test_slash_and_nickname(self):
        self.assertEqual(projects.resolve_project_refs('Mid / A과제', PROJECTS, {}), (['project-02', 'project-01'], []))

    def test_nickname_of_two_projects_is_not_guessed(self):
        self.assertEqual(projects.resolve_project_refs('Dup', PROJECTS, {}), ([], ['Dup']))

    def test_numbers_and_unknown_names_unresolved(self):
        self.assertEqual(projects.resolve_project_refs('12345, 없는 과제', PROJECTS, {}), ([], ['12345', '없는 과제']))

    def test_map_to_unknown_slug_unresolved(self):
        self.assertEqual(projects.resolve_project_refs('중견', PROJECTS, {'중견': 'project-99'}), ([], ['중견']))

    def test_empty_pieces_ignored_and_duplicates_collapsed(self):
        self.assertEqual(projects.resolve_project_refs(' A과제,, Alpha / ', PROJECTS, {}), (['project-01'], []))
        self.assertEqual(projects.resolve_project_refs('', PROJECTS, {}), ([], []))


class MapFilesTest(unittest.TestCase):
    def test_projects_map_starts_empty(self):
        self.assertEqual(load_json('projects.json'), {})

    def test_conference_spellings_unified(self):
        data = load_json('conferences.json')
        for raw in ['KSMP (Fall)', 'KSMP Fall']:
            self.assertEqual(data['conferences'][raw], 'KSMP Fall')
        for raw in ['KSMP(Spring)', 'KSMP (spring)', 'KSMP (Spring)', 'KSMP Spring']:
            self.assertEqual(data['conferences'][raw], 'KSMP Spring')
        self.assertEqual(data['types']['e-Poster'], 'ePoster')
        self.assertEqual(data['types']['ePoster'], 'ePoster')

    def test_possible_typo_pair_left_out_so_it_is_reported(self):
        conferences = load_json('conferences.json')['conferences']
        self.assertNotIn('FPRT', conferences)
        self.assertNotIn('FRPT', conferences)

    def test_canonical_names_map_to_themselves(self):
        data = load_json('conferences.json')
        for table in data.values():
            for canonical in table.values():
                self.assertEqual(table.get(canonical, canonical), canonical)


# ---- 학회 발표 ---------------------------------------------------------------------------------------------

PRES_HEADER = ['', 'Year', '', '1st author', '전체저자', '교신저자', '교신저자 2', 'title', 'Conference Name',
               '발표형태', '사사', '세션', '발표 시간']
PRES_FIELDS = {'year', 'title', 'authors', 'first_author', 'corresponding', 'conference', 'conference_raw', 'type',
               'session', 'acknowledgement', 'members', 'order', '_file'}


def pres_rows():
    return [
        PRES_HEADER,
        ['7', '2023', 'Soyoung Jeon. Sangmin lee, Garam Han', 'Soyoung Jeon', '', 'Garam Han', '',
         'Phantom dosimetry with films', 'KSMP (Fall)', 'e-Poster', 'NRF-1', 'Session 3', '10:30'],
        [''] * len(PRES_HEADER),
        ['6', '2023', '', 'Sang Kyun Yoo', 'Sang Kyun Yoo, Garam Han', 'Garam Han', 'Byoung Su Choi',
         'Adaptive planning test', 'KOSRO', 'Oral', '', '', ''],
        ['5', '2022', 'Sang Kyun Yoo, Soyoung Jeon', 'Sang Kyun Yoo', 'Sang Kyun Yoo, Soyoung Jeon, Garam Han',
         'Garam Han', '', 'Conflicting author columns', 'Brand New Meeting', 'Poster', '', '', ''],
        ['4', '2022', '', 'Sang Kyun Yoo', '', 'Garam Han', '', 'Another talk', 'Brand New Meeting', 'Poster Talk',
         '', '', ''],
        ['3', '', '', 'Sang Kyun Yoo', '', '', '', 'A talk without a year', 'KOSRO', 'Oral', '', '', ''],  # row 7
        ['', '2022'] + [''] * 11,  # row 8: a year and nothing else
    ]


class PresentationsTest(unittest.TestCase):
    def setUp(self):
        self.report = report.Report()
        self.records = presentations.build_presentations(pres_rows(), MEMBERS, load_json('conferences.json'),
                                                         self.report)

    def test_count(self):
        self.assertEqual(len(self.records), 4)
        self.assertEqual(self.report.lines(report.COUNTS), ['학회 발표 4건'])

    def test_conference_unified_and_raw_kept(self):
        self.assertEqual(self.records[0], {
            'year': 2023, 'title': 'Phantom dosimetry with films', 'authors': 'Soyoung Jeon. Sangmin lee, Garam Han',
            'first_author': 'Soyoung Jeon', 'corresponding': ['Garam Han'], 'conference': 'KSMP Fall',
            'conference_raw': 'KSMP (Fall)', 'type': 'ePoster', 'session': 'Session 3', 'acknowledgement': 'NRF-1',
            'members': ['soyoung-jeon', 'sangmin-lee'], 'order': 1, '_file': '2023-soyoung-jeon-phantom-dosimetry-with',
        })

    def test_unchanged_conference_has_no_raw(self):
        r = self.records[1]
        self.assertEqual((r['conference'], r['type']), ('KOSRO', 'Oral'))
        self.assertNotIn('conference_raw', r)

    def test_full_authors_from_the_headed_column(self):
        r = self.records[1]
        self.assertEqual(r['authors'], 'Sang Kyun Yoo, Garam Han')
        self.assertEqual(r['corresponding'], ['Garam Han', 'Byoung Su Choi'])
        self.assertEqual(r['members'], ['sang-kyun-yoo', 'byong-su-choi'])

    def test_differing_author_columns_use_the_headed_one_and_report(self):
        r = self.records[2]
        self.assertEqual(r['authors'], 'Sang Kyun Yoo, Soyoung Jeon, Garam Han')
        self.assertIn(f'presentations/{r["_file"]}: 전체저자와 머리글 없는 저자 열이 다름 (전체저자 사용)',
                      self.report.lines(report.CHECK))

    def test_no_full_authors_still_links_first_author(self):
        r = self.records[3]
        self.assertNotIn('authors', r)
        self.assertEqual(r['members'], ['sang-kyun-yoo'])
        self.assertIn(f'presentations/{r["_file"]}: 전체저자 비어 있음', self.report.lines(report.CHECK))

    def test_unknown_spellings_pass_through_and_are_reported_once(self):
        self.assertEqual(self.records[2]['conference'], 'Brand New Meeting')
        self.assertEqual(self.records[3]['conference'], 'Brand New Meeting')
        self.assertNotIn('conference_raw', self.records[2])
        self.assertEqual(self.records[3]['type'], 'Poster Talk')
        self.assertEqual(self.report.lines(report.NEW_SPELLINGS),
                         ['학회 이름: Brand New Meeting', '발표형태: Poster Talk'])

    def test_rows_without_year_or_title_skipped_and_reported(self):
        skipped = self.report.lines(report.SKIPPED)
        self.assertIn('학회 초록 7행: 연도 없음', skipped)
        self.assertIn('학회 초록 8행: 제목 없음', skipped)
        self.assertIn('학회 초록: 빈 행 1개', skipped)

    def test_sheet_order_kept(self):
        self.assertEqual([r['order'] for r in self.records], [1, 2, 3, 4])

    def test_korean_byline_links_by_korean_name(self):
        rows = [PRES_HEADER,
                ['1', '2024', '신 비, 홍나그네, Soyoung Jeon', '신 비', '', '한가람', '', '한글 초록 제목', 'KSMP', 'Oral',
                 '', '', '']]
        rep = report.Report()
        r = presentations.build_presentations(rows, MEMBERS, load_json('conferences.json'), rep)[0]
        self.assertEqual(r['members'], ['member-5', 'soyoung-jeon'])
        self.assertEqual(rep.lines(report.UNMATCHED), ['홍나그네'])

    def test_same_title_twice_at_one_conference_reported(self):
        rows = pres_rows()[:2] + [
            ['8', '2023', 'Sang Kyun Yoo', 'Sang Kyun Yoo', '', '', '', 'phantom dosimetry with films', 'KSMP Fall',
             'Poster', '', '', ''],
            ['9', '2023', 'Sang Kyun Yoo', 'Sang Kyun Yoo', '', '', '', 'Phantom dosimetry with films', 'AAPM',
             'Poster', '', '', '']]
        rep = report.Report()
        records = presentations.build_presentations(rows, MEMBERS, load_json('conferences.json'), rep)
        self.assertEqual(len(records), 3)
        self.assertEqual(rep.lines(report.CHECK), [
            '학회 초록: 2023 "Phantom dosimetry with films" (KSMP Fall) 2건 — 중복 행인지 확인: '
            'presentations/2023-soyoung-jeon-phantom-dosimetry-with, presentations/2023-sang-kyun-yoo-phantom-dosimetry-with'])
        self.assertEqual(self.report.lines(report.CHECK)[-1:],
                         [f'presentations/{self.records[3]["_file"]}: 전체저자 비어 있음'])

    def test_author_column_left_of_first_author_must_be_header_less(self):
        rows = pres_rows()
        rows[0] = PRES_HEADER[:2] + ['Authors?'] + PRES_HEADER[3:]
        with self.assertRaisesRegex(ValueError, 'header-less'):
            presentations.build_presentations(rows, MEMBERS, load_json('conferences.json'), report.Report())

    def test_blank_conference_reported_and_import_completes(self):
        rows = pres_rows()[:2] + [
            ['8', '2023', 'Sang Kyun Yoo', 'Sang Kyun Yoo', '', '', '', 'A talk at an unnamed meeting', '', 'Oral',
             '', '', ''],
            ['9', '2023', 'Sang Kyun Yoo', 'Sang Kyun Yoo', '', '', '', 'A talk at an unnamed meeting', '', 'Oral',
             '', '', '']]
        rep = report.Report()
        records = presentations.build_presentations(rows, MEMBERS, load_json('conferences.json'), rep)
        self.assertEqual(len(records), 3)
        self.assertNotIn('conference', records[1])
        self.assertIn(f'presentations/{records[1]["_file"]}: Conference Name 비어 있음', rep.lines(report.CHECK))
        self.assertIn(f'presentations/{records[2]["_file"]}: Conference Name 비어 있음', rep.lines(report.CHECK))
        # Without a conference there is no "same conference" to compare: no repeat line.
        self.assertFalse([line for line in rep.lines(report.CHECK) if '중복 행인지 확인' in line])

    def test_only_schema_fields(self):
        for r in self.records:
            self.assertLessEqual(set(r), PRES_FIELDS)
        self.assertNotIn('10:30', json.dumps(self.records))


# ---- 수상 -------------------------------------------------------------------------------------------------

AWARD_HEADER = ['', '연도', '수상자', '학회', '구분', '발표명']


def award_rows():
    return [
        AWARD_HEADER,
        ['3', '2022', '신 비', 'KOSRO', '구연상', 'Award winning talk'],
        ['2', '2021', '나그네', 'KSMP', '포스터상', ''],
        ['', '2024', '신비', 'AAPM', 'Young Investigator Award', 'Late addition'],  # no number, has a year
        ['', '', '', '', '', ''],
        ['', '', '수상 목록 메모', '', '', ''],  # row 6
    ]


class AwardsTest(unittest.TestCase):
    def setUp(self):
        self.report = report.Report()
        self.records = awards.build_awards(award_rows(), MEMBERS, self.report)

    def test_korean_name_with_a_space_links(self):
        self.assertEqual(self.records[0], {
            'year': 2022, 'recipient': '신 비', 'member': 'member-5', 'conference': 'KOSRO', 'category': '구연상',
            'title': 'Award winning talk', 'order': 1, '_file': '2022-award-01',
        })

    def test_unmatched_recipient_kept_and_reported(self):
        self.assertEqual(self.records[1], {
            'year': 2021, 'recipient': '나그네', 'conference': 'KSMP', 'category': '포스터상',
            'order': 2, '_file': '2021-award-02',
        })
        self.assertIn('나그네', self.report.lines(report.UNMATCHED))

    def test_unnumbered_row_with_a_year_included(self):
        self.assertEqual(len(self.records), 3)
        self.assertEqual((self.records[2]['year'], self.records[2]['member'], self.records[2]['_file'],
                          self.records[2]['order']), (2024, 'member-5', '2024-award-03', 3))

    def test_row_without_year_skipped_and_reported(self):
        self.assertIn('수상 현황 6행: 연도 없음', self.report.lines(report.SKIPPED))
        self.assertEqual(self.report.lines(report.COUNTS), ['수상 3건'])


# ---- 챌린지 ------------------------------------------------------------------------------------------------

CHALLENGE_HEADER = ['Year', 'Host', 'Running title', 'Objective', 'Release date of training dataset',
                    'Final submission', 'Link']


def challenge_rows():
    return [
        CHALLENGE_HEADER,
        ['2021', 'AAPM', 'Sparse test CT', 'Recover a phantom.', 'March 17, 2021', 'May 31, 2021',
         'https://example.org/a'],
        ['2021', 'MICCAI', 'Seg test', 'Segment organs.', 'April 1, 2021', 'July 1, 2021', ''],
        [''] * 7,
        ['2021', 'AAPM', 'Second test', 'Another objective.', '', '', 'https://example.org/b'],
        ['2020', 'Grand Test Host', 'Old test', 'Objective.', '', '', ''],
    ]


class ChallengesTest(unittest.TestCase):
    def setUp(self):
        self.report = report.Report()
        self.records = challenges.build_challenges(challenge_rows(), self.report)

    def test_four_rows(self):
        self.assertEqual([r['_file'] for r in self.records],
                         ['2021-aapm-1', '2021-miccai-2', '2021-aapm-3', '2020-grand-test-host-4'])
        self.assertEqual(self.report.lines(report.COUNTS), ['챌린지 4건'])

    def test_fields_and_raw_dates(self):
        self.assertEqual(self.records[0], {
            'year': 2021, 'host': 'AAPM', 'title': 'Sparse test CT', 'objective': 'Recover a phantom.',
            'dataset_release': 'March 17, 2021', 'submission': 'May 31, 2021', 'link': 'https://example.org/a',
            '_file': '2021-aapm-1',
        })
        self.assertNotIn('link', self.records[1])


# ---- 과제 -------------------------------------------------------------------------------------------------

PROJECT_HEADER = ['', '연구과제명', '연구내용', '닉네임', '실무담당자', '부처명', '사업명', '연구수행기관', '참여유형',
                  '3책5공여부', '참여시작일', '참여종료일', '참여개월수', '참여율', '당해년도연구비(천원)', '총연구비(천원)',
                  '사사정보(영문)', '사사정보(한글)']
PJW = len(PROJECT_HEADER)
PROJECT_FIELDS = {'title', 'title_en', 'nickname', 'agency', 'program', 'institution', 'role', 'start', 'end',
                  'months', 'participation_rate', 'budget_year_krw_thousand', 'budget_total_krw_thousand',
                  'acknowledgement_en', 'acknowledgement_ko', '_file'}


def project_row(no, title, nick, agency, program, inst, role, start, end, months, rate, year_budget, total_budget,
                ack_en='', ack_ko=''):
    return [no, title, 'CONTENT-SENTINEL', nick, 'MANAGER-SENTINEL', agency, program, inst, role, 'QUOTA-SENTINEL',
            start, end, months, rate, year_budget, total_budget, ack_en, ack_ko]


def project_rows():
    note = [''] * PJW
    note[1] = '인력양성과제는 테스트 안내문입니다'
    money = [''] * PJW
    money[15] = '$100,000,000.00'
    return [
        ['과제 정보 (테스트용)'] + [''] * (PJW - 1),  # title row above the header
        PROJECT_HEADER,
        project_row('1', 'A과제', 'Alpha', '테스트부', '테스트사업', '테스트대학교', '연구책임자', '2022-03-01',
                    '2026-02-28', '48', '20%', '160,000', '640,000', 'Supported by TEST-1.', '테스트 지원'),
        project_row('2', '중견연구 테스트', '', '시험부', '시험사업', '테스트대학교', '참여연구원', '2020-07-01', '',
                    '32', '10%?', '', '210000'),
        [''] * PJW,
        note,  # row 6
        PROJECT_HEADER,  # row 7: repeated header
        money,  # row 8
    ]


class ProjectsTest(unittest.TestCase):
    def setUp(self):
        self.report = report.Report()
        self.records = projects.build_projects(project_rows(), self.report)

    def test_first_project(self):
        self.assertEqual(self.records[0], {
            'title': 'A과제', 'nickname': 'Alpha', 'agency': '테스트부', 'program': '테스트사업',
            'institution': '테스트대학교', 'role': '연구책임자', 'start': '2022-03-01', 'end': '2026-02-28',
            'months': 48, 'participation_rate': '20%', 'budget_year_krw_thousand': 160000,
            'budget_total_krw_thousand': 640000, 'acknowledgement_en': 'Supported by TEST-1.',
            'acknowledgement_ko': '테스트 지원', '_file': 'project-01',
        })

    def test_missing_end_date_reported(self):
        r = self.records[1]
        self.assertEqual((r['_file'], r['participation_rate'], r['budget_total_krw_thousand']),
                         ('project-02', '10%?', 210000))
        self.assertNotIn('end', r)
        self.assertNotIn('nickname', r)
        self.assertNotIn('budget_year_krw_thousand', r)
        self.assertEqual(self.report.lines(report.MISSING_DATES), ['projects/project-02: 참여종료일'])

    def test_note_and_repeated_header_rows_skipped(self):
        self.assertEqual(len(self.records), 2)
        skipped = self.report.lines(report.SKIPPED)
        for n in (6, 7, 8):
            self.assertIn(f'과제정보 {n}행: 시작일 없음', skipped)
        self.assertEqual(self.report.lines(report.COUNTS), ['과제 2건'])

    def test_private_columns_never_read(self):
        text = dump(self.records, self.report)
        for sentinel in SENTINELS:
            self.assertNotIn(sentinel, text)
        self.assertNotIn('안내문', text)
        for r in self.records:
            self.assertLessEqual(set(r), PROJECT_FIELDS)


# ---- 보고서 -----------------------------------------------------------------------------------------------

class ReportTest(unittest.TestCase):
    def write(self, rep):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, 'report.md')
            rep.write(path)
            with open(path, encoding='utf-8') as f:
                return f.read()

    def test_sections_in_fixed_order(self):
        rep = report.Report()
        rep.add(report.SKIPPED, 'x 3행: 연도 없음')
        rep.add(report.COUNTS, '논문 1건')
        text = self.write(rep)
        headings = [line[3:] for line in text.splitlines() if line.startswith('## ')]
        self.assertEqual(headings[:7], ['건수', '보정', '별칭 후보', '미연결 저자', '과제 미해결 값', '날짜 누락', '건너뛴 행'])
        self.assertEqual(headings, list(report.SECTIONS))
        self.assertLess(text.index('- 논문 1건'), text.index('- x 3행: 연도 없음'))

    def test_repeated_line_written_once(self):
        rep = report.Report()
        rep.add(report.UNMATCHED, 'Nobody Known')
        rep.add(report.UNMATCHED, 'Nobody Known')
        self.assertEqual(rep.lines(report.UNMATCHED), ['Nobody Known'])
        self.assertEqual(self.write(rep).count('Nobody Known'), 1)

    def test_empty_section_says_none(self):
        text = self.write(report.Report())
        self.assertIn('## 별칭 후보\n\n없음\n', text)

    def test_skip_and_empty_rows(self):
        rep = report.Report()
        rep.skip('시트', 3, '제목 없음')
        rep.empty_rows('시트', 0)
        rep.empty_rows('시트', 2)
        self.assertEqual(rep.lines(report.SKIPPED), ['시트 3행: 제목 없음', '시트: 빈 행 2개'])

    def test_year_or_skip(self):
        rep = report.Report()
        self.assertEqual(rep.year_or_skip('시트', 2, '2021'), 2021)
        self.assertIsNone(rep.year_or_skip('시트', 4, ''))
        self.assertIsNone(rep.year_or_skip('시트', 5, '2021?'))
        self.assertEqual(rep.lines(report.SKIPPED), ['시트 4행: 연도 없음', '시트 5행: 연도 없음'])

    def test_blanks(self):
        rep = report.Report()
        rep.blanks('papers/x', {'a': 'filled', 'b': ''}, ('a', 'b', 'c'), {'a': 'A열', 'b': 'B열', 'c': 'C열'})
        self.assertEqual(rep.lines(report.CHECK), ['papers/x: B열 비어 있음', 'papers/x: C열 비어 있음'])

    def test_head_lines_between_title_and_sections(self):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, 'report.md')
            report.Report().write(path, head=['| a | b |', '|---|---|'])
            with open(path, encoding='utf-8') as f:
                text = f.read()
        self.assertTrue(text.startswith('# 변환 보고서\n\n| a | b |\n|---|---|\n\n## 건수\n'))

    def test_unknown_section_rejected(self):
        with self.assertRaises(ValueError):
            report.Report().add('건너 뛴 행', 'typo')


if __name__ == '__main__':
    unittest.main()
