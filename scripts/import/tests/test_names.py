import unittest

import names


class NormTest(unittest.TestCase):
    def test_norm(self):
        self.assertEqual(names.norm('Byong-Su Choi.'), 'byongsuchoi')
        self.assertEqual(names.norm('Mina PARK,'), 'minapark')

    def test_norm_ko(self):
        self.assertEqual(names.norm_ko('신 비'), '신비')


class SplitAuthorsTest(unittest.TestCase):
    def test_brief_example(self):
        self.assertEqual(
            names.split_authors('Soyoung Jeon. Sangmin lee, Ho Jae Kim and D. Kim'),
            ['Soyoung Jeon', 'Sangmin lee', 'Ho Jae Kim', 'D. Kim'])

    def test_trailing_punctuation_and_semicolon(self):
        self.assertEqual(names.split_authors('Mina Park,'), ['Mina Park'])
        self.assertEqual(names.split_authors('Jun-Ho Lee.'), ['Jun-Ho Lee'])
        self.assertEqual(names.split_authors('Alex Han; Bora Yoon'), ['Alex Han', 'Bora Yoon'])

    def test_initials_stay_together(self):
        self.assertEqual(names.split_authors('A. B. Cho, Dana Woo'), ['A. B. Cho', 'Dana Woo'])


class NearTest(unittest.TestCase):
    def test_small_spelling_difference(self):
        self.assertTrue(names.near('Byong Su Choi', 'Byoung Su Choi'))

    def test_token_order(self):
        self.assertTrue(names.near('Choi Byong Su', 'Byong Su Choi'))

    def test_different_people(self):
        self.assertFalse(names.near('Min Seo Choi', 'Dong Hyeok Choi'))

    def test_no_latin_letters_is_never_near(self):
        self.assertFalse(names.near('신비', '김철'))


if __name__ == '__main__':
    unittest.main()
