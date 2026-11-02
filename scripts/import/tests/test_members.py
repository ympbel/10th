import json
import os
import tempfile
import unittest

import members
import writer

PROGRAM = '석사 / 박사 / 통합(석사) / 통합 (박사)'

# 현황 sheet layout (invented people). The main header row is found by content; the row above it carries the
# labels of the right-hand block. Columns that must never be read are filled with recognisable fake values.
STATUS_LABELS = ['', '', '', '', '', '', '', 'https://orcid.org/', '', '', '', '최종학위', '전공', '학번',
                 '학위과정', '수료여부']
STATUS_HEADER = ['', '이름', '영문 이름', 'MBTI', '생년월일', '전화번호', 'Email', 'ORCID', '연구실 첫 출근',
                 '학위 시작', '학과', '', '', '', PROGRAM, '']
WIDTH = len(STATUS_HEADER)


def status_row(no, name, name_en, orcid, joined, start, dept, major, program):
    """One 현황 data row; the columns that must never be read get fake values."""
    return [no, name, name_en, 'INTJ', '990101', '010-1234-5678', 'fake@example.com', orcid, joined, start, dept,
            '학사', major, '2021000000', program, '수료']


EMPTY = [''] * WIDTH


def status_rows(professors=None):
    stray = [''] * WIDTH
    stray[9] = '3.4'  # a computed cell with no number: not a member
    rows = [
        ['메모', 'https://www.kri.go.kr'] + [''] * (WIDTH - 2),
        STATUS_LABELS,
        STATUS_HEADER,
        status_row('1', '김하늘', 'Haneul Kim', '0000-0001-2345-6789', '3/1/2021', '3/1/2021', '융합의학과',
                   '의공학', '석사'),
        status_row('2', '이바다', 'Bada Lee', '', '9/1/2020', '9/1/2020', '의학과', '물리학', '통합 (박사)'),
        EMPTY,
        EMPTY,
        stray,
        status_row('1', '박구름', 'Gureum Park', '', '', '', '융합의학과', '원자력공학', '석사'),
        status_row('2', '최별빛', 'Byeolbit Choi', '', '3/1', '', '-', '-', ''),
        EMPTY,
        ['', '그룹'] + [''] * (WIDTH - 2),
        ['', '연구실', '', '', '', '', 'group@example.com'] + [''] * (WIDTH - 7),
        ['', 'Team pf. Test', '', '', '', '', 'team@example.com'] + [''] * (WIDTH - 7),
        EMPTY,
        ['', '교수님', '영문 이름', '', '생년월일', '전화번호', 'Email'] + [''] * (WIDTH - 7),
    ]
    for prof in professors or [['', '한가람 교수님', 'Garam Han', '', '700101', '010-9999-0000', 'prof@example.com']]:
        rows.append(prof + [''] * (WIDTH - len(prof)) if prof else EMPTY)
    return rows


ALUMNI_HEADER = ['Alumni', '이름', '영문 이름', '생년월일', '11/2/2026', '전화번호', 'Email', '학위 시작일',
                 '학위 취득일', '학위 종류', '학과', '현 직장', '직급']


def alumni_rows():
    return [
        ['Last Updated 2026.11.01'],
        ALUMNI_HEADER,
        ['1', '박구름', 'Gureum Park', '980202', '28', '010-2222-3333', 'cloud@example.com', '2020.03', '2022.08',
         '공학석사', '의학과', '테스트병원', '의학물리사'],
        # A 2026 graduate still in the student list: degree type and department not filled in yet,
        # and the row is shorter than the header.
        ['2', '이 바다', 'Bada Lee', '970303', '29', '010-4444-5555', 'sea@example.com', '9/1/2020', '2026.08'],
    ]


def by_name(result):
    return {m['name']: m for m in result}


class BuildMembersTest(unittest.TestCase):
    def setUp(self):
        self.result = members.build_members(status_rows(), alumni_rows())
        self.people = by_name(self.result)

    def test_sections_split_by_empty_rows(self):
        roles = [m['role'] for m in self.result]
        self.assertEqual([m['name'] for m in self.result], ['김하늘', '이바다', '박구름', '최별빛', '한가람'])
        self.assertEqual(roles.count('student'), 2)
        self.assertEqual(roles.count('alumni') + roles.count('former'), 2)
        self.assertEqual(roles.count('professor'), 1)

    def test_former_member_merged_with_alumni(self):
        m = self.people['박구름']
        self.assertEqual(m['role'], 'alumni')
        self.assertEqual(m['degree'], {'start': '2020-03', 'date': '2022-08', 'type': '공학석사'})
        self.assertEqual(m['degree']['date'], '2022-08')
        self.assertEqual(m['department'], '의학과')  # the Alumni sheet wins
        self.assertEqual(m['major'], '원자력공학')  # the 현황 sheet
        self.assertEqual(m['program'], '석사')
        self.assertEqual(m['affiliation'], '테스트병원')
        self.assertEqual(m['position'], '의학물리사')

    def test_joined_falls_back_to_alumni_degree_start(self):
        self.assertEqual(self.people['박구름']['joined'], '2020-03')

    def test_student_who_is_alumni_stays_student_with_degree(self):
        m = self.people['이바다']
        self.assertEqual(m['role'], 'student')
        self.assertEqual(m['degree'], {'start': '2020-09-01', 'date': '2026-08'})
        self.assertEqual(m['department'], '의학과')  # empty in the Alumni sheet, so the 현황 sheet
        self.assertEqual(m['joined'], '2020-09-01')

    def test_joined_without_year_is_absent(self):
        m = self.people['최별빛']
        self.assertEqual(m['role'], 'former')
        self.assertNotIn('joined', m)
        self.assertNotIn('degree', m)

    def test_dash_is_empty(self):
        m = self.people['최별빛']
        self.assertNotIn('department', m)
        self.assertNotIn('major', m)

    def test_student_fields(self):
        m = self.people['김하늘']
        self.assertEqual(m, {
            'role': 'student', 'name': '김하늘', 'name_en': 'Haneul Kim', 'aliases': ['Haneul Kim'],
            'orcid': '0000-0001-2345-6789', 'program': '석사', 'department': '융합의학과', 'major': '의공학',
            'joined': '2021-03-01', 'degree': {'start': '2021-03-01'}, '_file': 'haneul-kim',
        })

    def test_professor(self):
        self.assertEqual(self.people['한가람'], {
            'role': 'professor', 'name': '한가람', 'name_en': 'Garam Han', 'aliases': ['Garam Han'], 'order': 1,
            '_file': 'garam-han',
        })

    def test_order_only_on_professors(self):
        for m in self.result:
            self.assertEqual('order' in m, m['role'] == 'professor', m['name'])

    def test_no_private_column_reaches_any_dict(self):
        text = json.dumps(self.result, ensure_ascii=False)
        for forbidden in ['전화번호', 'Email', '생년월일', 'MBTI', '학번', '수료', '최종학위', '학사',
                          '010-', '@example.com', '990101', '980202', '700101', 'INTJ', '2021000000']:
            self.assertNotIn(forbidden, text)

    def test_only_schema_fields(self):
        allowed = {'role', 'name', 'name_en', 'aliases', 'orcid', 'program', 'department', 'department_en',
                   'major', 'joined', 'left', 'degree', 'affiliation', 'affiliation_en', 'position', 'position_en',
                   'order', 'link', '_file'}
        for m in self.result:
            self.assertLessEqual(set(m), allowed, m['name'])
            self.assertLessEqual(set(m.get('degree', {})), {'start', 'date', 'type', 'type_en'})

    def test_files_are_unique_slugs(self):
        self.assertEqual([m['_file'] for m in self.result],
                         ['haneul-kim', 'bada-lee', 'gureum-park', 'byeolbit-choi', 'garam-han'])


class ProfessorBlockTest(unittest.TestCase):
    def test_professors_after_an_empty_row_keep_order(self):
        rows = status_rows([['', '한가람 교수님', 'Garam Han'], [], ['', '서누리 교수님', '']])
        result = members.build_members(rows, alumni_rows())
        profs = [m for m in result if m['role'] == 'professor']
        self.assertEqual([(m['name'], m['order']) for m in profs], [('한가람', 1), ('서누리', 2)])
        self.assertEqual(profs[1]['name_en'], '')
        self.assertEqual(profs[1]['aliases'], [])
        self.assertEqual(profs[1]['_file'], f'member-{len(result)}')


class EdgeCaseTest(unittest.TestCase):
    def test_row_wider_than_header_names_the_row(self):
        rows = status_rows()
        rows[4] = rows[4] + ['spill']
        with self.assertRaisesRegex(ValueError, r'\brow 5\b'):
            members.build_members(rows, alumni_rows())

    def test_short_rows_are_padded(self):
        rows = status_rows()
        rows[3] = rows[3][:3]  # 김하늘 with only number, name and English name
        m = by_name(members.build_members(rows, alumni_rows()))['김하늘']
        self.assertEqual(m, {'role': 'student', 'name': '김하늘', 'name_en': 'Haneul Kim',
                             'aliases': ['Haneul Kim'], '_file': 'haneul-kim'})

    def test_sheet_error_values_are_empty(self):
        rows = status_rows()
        rows[3][10] = '#VALUE!'
        self.assertNotIn('department', by_name(members.build_members(rows, alumni_rows()))['김하늘'])

    def test_missing_english_name_uses_fallback_slug(self):
        rows = status_rows()
        rows[9][2] = ''  # 최별빛
        m = by_name(members.build_members(rows, alumni_rows()))['최별빛']
        self.assertEqual((m['name_en'], m['aliases'], m['_file']), ('', [], 'member-4'))

    def test_same_english_name_gets_a_suffix(self):
        rows = status_rows()
        rows[9][2] = 'Haneul Kim'
        files = [m['_file'] for m in members.build_members(rows, alumni_rows())]
        self.assertEqual(files[0], 'haneul-kim')
        self.assertEqual(files[3], 'haneul-kim-2')

    def test_alumni_missing_from_status_sheet_is_still_a_member(self):
        rows = alumni_rows() + [['3', '정새봄', 'Saebom Jung', '', '', '', '', '2019.03', '2021.08', '이학박사',
                                 '의학과', '테스트대학교', '조교수']]
        m = by_name(members.build_members(status_rows(), rows))['정새봄']
        self.assertEqual(m['role'], 'alumni')
        self.assertEqual(m['joined'], '2019-03')
        self.assertEqual(m['degree'], {'start': '2019-03', 'date': '2021-08', 'type': '이학박사'})

    def test_duplicate_alumni_name_is_an_error(self):
        rows = alumni_rows() + [alumni_rows()[2][:1] + ['박 구름'] + alumni_rows()[2][2:]]
        with self.assertRaisesRegex(ValueError, r'\brow 5\b'):
            members.build_members(status_rows(), rows)

    def test_empty_row_inside_the_student_list_is_an_error(self):
        rows = status_rows()
        rows.insert(4, EMPTY)  # would otherwise turn the second student into a former member
        with self.assertRaisesRegex(ValueError, 'found 3'):
            members.build_members(rows, alumni_rows())

    def test_header_row_is_required(self):
        with self.assertRaises(ValueError):
            members.build_members(status_rows()[3:], alumni_rows())


class SlugTest(unittest.TestCase):
    def test_slugify(self):
        self.assertEqual(writer.slugify('Ye-In Park', 'x'), 'ye-in-park')
        self.assertEqual(writer.slugify('', 'member-7'), 'member-7')
        self.assertEqual(writer.slugify("  Jin Sung  Kim, Jr. ", 'x'), 'jin-sung-kim-jr')
        self.assertEqual(writer.slugify('José Núñez', 'x'), 'jose-nunez')
        self.assertEqual(writer.slugify('홍길동', 'member-3'), 'member-3')
        self.assertEqual(writer.slugify(None, 'member-3'), 'member-3')

    def test_unique_slug(self):
        taken = set()
        self.assertEqual(writer.unique_slug('a', taken), 'a')
        self.assertEqual(writer.unique_slug('a', taken), 'a-2')
        self.assertEqual(writer.unique_slug('a', taken), 'a-3')
        self.assertEqual(taken, {'a', 'a-2', 'a-3'})


class WriteMdTest(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.path = os.path.join(self.dir.name, 'sub', 'x.md')

    def tearDown(self):
        self.dir.cleanup()

    def read(self):
        with open(self.path, encoding='utf-8') as f:
            return f.read()

    def test_frontmatter_format(self):
        written = writer.write_md(self.path, {
            'role': 'alumni',
            'name': '이 "따옴표" \\ 끝',
            'note': 'a\nb',
            'aliases': ['Gil-Dong Hong', 'G. D. Hong'],
            'members': [],
            'empty': '',
            'none': None,
            '_file': 'x',
            'degree': {'start': '2020-03', 'type': None},
            'nothing': {'type': ''},
            'order': 2,
            'impact_factor': 3.25,
            'pinned': False,
        }, body='본문\n')
        self.assertTrue(written)
        self.assertEqual(self.read(), (
            '---\n'
            'role: "alumni"\n'
            'name: "이 \\"따옴표\\" \\\\ 끝"\n'
            'note: "a\\nb"\n'
            'aliases:\n'
            '  - "Gil-Dong Hong"\n'
            '  - "G. D. Hong"\n'
            'members: []\n'
            'degree:\n'
            '  start: "2020-03"\n'
            'order: 2\n'
            'impact_factor: 3.25\n'
            'pinned: false\n'
            '---\n'
            '\n'
            '본문\n'
        ))

    def test_no_body(self):
        writer.write_md(self.path, {'name': 'a'})
        self.assertEqual(self.read(), '---\nname: "a"\n---\n')

    def test_existing_file_is_kept_without_force(self):
        writer.write_md(self.path, {'name': 'first'})
        self.assertFalse(writer.write_md(self.path, {'name': 'second'}))
        self.assertEqual(self.read(), '---\nname: "first"\n---\n')
        self.assertTrue(writer.write_md(self.path, {'name': 'second'}, force=True))
        self.assertEqual(self.read(), '---\nname: "second"\n---\n')

    def test_unsupported_value_is_an_error(self):
        with self.assertRaises(TypeError):
            writer.write_md(self.path, {'people': [{'name': 'a'}]})
        self.assertFalse(os.path.exists(self.path))


if __name__ == '__main__':
    unittest.main()
