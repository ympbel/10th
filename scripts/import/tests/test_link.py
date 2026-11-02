import unittest

import link
import names


def person(slug, name, name_en, aliases=None, role='student'):
    """A member dict shaped like members.build_members output (invented people)."""
    if aliases is None:
        aliases = [name_en] if name_en else []
    return {'role': role, 'name': name, 'name_en': name_en, 'aliases': aliases, '_file': slug}


MEMBERS = [
    person('byong-su-choi', '최하람', 'Byong Su Choi', ['Byong Su Choi', 'Byoung Su Choi']),
    person('sang-kyun-yoo', '유다온', 'Sang Kyun Yoo'),
    person('soyoung-jeon', '전소리', 'Soyoung Jeon'),
    person('sangmin-lee', '이온유', 'Sangmin Lee'),
    person('member-5', '신비', ''),
    person('garam-han', '한가람', 'Garam Han', role='professor'),
]


class MatchEnTest(unittest.TestCase):
    def test_alias_matches(self):
        self.assertEqual(link.match_en('Byoung Su Choi', MEMBERS), 'byong-su-choi')

    def test_case_spaces_periods_hyphens_ignored(self):
        self.assertEqual(link.match_en('byong-su  CHOI.', MEMBERS), 'byong-su-choi')

    def test_unknown_is_none(self):
        self.assertIsNone(link.match_en('Nobody Here', MEMBERS))

    def test_professor_is_never_matched(self):
        self.assertIsNone(link.match_en('Garam Han', MEMBERS))

    def test_name_without_latin_letters_never_matches_an_empty_english_name(self):
        self.assertIsNone(link.match_en('신비', MEMBERS))
        self.assertIsNone(link.match_en('', MEMBERS))

    def test_spelling_shared_by_two_members_is_not_guessed(self):
        twins = MEMBERS + [person('sang-kyun-yoo-2', '유다솜', 'Sang Kyun Yoo')]
        self.assertIsNone(link.match_en('Sang Kyun Yoo', twins))


class MatchKoTest(unittest.TestCase):
    def test_space_inside_korean_name(self):
        self.assertEqual(link.match_ko('신 비', MEMBERS), 'member-5')

    def test_unknown_is_none(self):
        self.assertIsNone(link.match_ko('없는이', MEMBERS))

    def test_professor_is_never_matched(self):
        self.assertIsNone(link.match_ko('한가람', MEMBERS))


class CandidatesTest(unittest.TestCase):
    def test_near_spelling(self):
        self.assertEqual(link.candidates('Byongsu Choe', MEMBERS), ['byong-su-choi'])

    def test_professors_are_not_candidates(self):
        self.assertEqual(link.candidates('Garam Hann', MEMBERS), [])


class LinkAuthorsTest(unittest.TestCase):
    def test_two_people_in_one_first_author_cell(self):
        # Review Focus 3: a 1st-author cell holding two names links both.
        self.assertEqual(link.link_authors(['Byong Su Choi, Sang Kyun Yoo'], MEMBERS),
                         (['byong-su-choi', 'sang-kyun-yoo'], [], []))

    def test_period_separator_splits_and_both_link(self):
        # Review Focus 2.
        self.assertEqual(link.link_authors(['Soyoung Jeon. Sangmin lee'], MEMBERS),
                         (['soyoung-jeon', 'sangmin-lee'], [], []))

    def test_slugs_deduplicated_in_order(self):
        slugs, _, _ = link.link_authors(['Sang Kyun Yoo', 'Byoung Su Choi, Sang Kyun Yoo', 'Byong Su Choi'], MEMBERS)
        self.assertEqual(slugs, ['sang-kyun-yoo', 'byong-su-choi'])

    def test_edit_distance_two_is_reported_not_linked(self):
        self.assertTrue(names.near('Sang Kyon Yo', 'Sang Kyun Yoo'))
        self.assertNotEqual(names.norm('Sang Kyon Yo'), names.norm('Sang Kyun Yoo'))
        slugs, unmatched, near = link.link_authors(['Sang Kyon Yo, Soyoung Jeon'], MEMBERS)
        self.assertEqual(slugs, ['soyoung-jeon'])
        self.assertEqual(unmatched, ['Sang Kyon Yo'])
        self.assertEqual(near, [('Sang Kyon Yo', ['sang-kyun-yoo'])])

    def test_unmatched_without_candidates(self):
        self.assertEqual(link.link_authors(['Totally Different'], MEMBERS), ([], ['Totally Different'], []))

    def test_professor_spelling_neither_linked_nor_reported(self):
        # A professor has no person page: the spelling is known, so it is not "unmatched", and it must not be
        # offered as an alias candidate for a student with a near name.
        people = MEMBERS + [person('garam-hahn', '한가온', 'Garam Hahn')]
        self.assertTrue(names.near('Garam Han', 'Garam Hahn'))
        self.assertEqual(link.link_authors(['Garam Han, Soyoung Jeon'], people), (['soyoung-jeon'], [], []))

    def test_korean_byline_matches_korean_name(self):
        self.assertEqual(link.link_authors(['신 비, Soyoung Jeon, 홍나그네'], MEMBERS),
                         (['member-5', 'soyoung-jeon'], ['홍나그네'], []))

    def test_professor_korean_name_neither_linked_nor_reported(self):
        self.assertEqual(link.link_authors(['한가람, 신비'], MEMBERS), (['member-5'], [], []))

    def test_empty_strings(self):
        self.assertEqual(link.link_authors(['', '  '], MEMBERS), ([], [], []))


if __name__ == '__main__':
    unittest.main()
