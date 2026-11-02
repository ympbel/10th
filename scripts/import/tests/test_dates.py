import unittest

import dates


class ParseDateTest(unittest.TestCase):
    def test_month_day_year(self):
        self.assertEqual(dates.parse_date('11/1/2019'), '2019-11-01')
        self.assertEqual(dates.parse_date('09/02/2021'), '2021-09-02')
        self.assertEqual(dates.parse_date('01/02/2024'), '2024-01-02')

    def test_year_month(self):
        self.assertEqual(dates.parse_date('2021.08'), '2021-08')
        self.assertEqual(dates.parse_date('2026.2'), '2026-02')

    def test_iso_and_slash_year_first(self):
        self.assertEqual(dates.parse_date('2022-03-01'), '2022-03-01')
        self.assertEqual(dates.parse_date('2023/4/5'), '2023-04-05')

    def test_unparseable_is_none(self):
        self.assertIsNone(dates.parse_date('3/1'))
        self.assertIsNone(dates.parse_date('#VALUE!'))
        self.assertIsNone(dates.parse_date(''))
        self.assertIsNone(dates.parse_date('   '))
        self.assertIsNone(dates.parse_date('13/1/2020'))

    def test_surrounding_space_ignored(self):
        self.assertEqual(dates.parse_date(' 9/1/2020 '), '2020-09-01')


class YearOfTest(unittest.TestCase):
    def test_year_of(self):
        self.assertEqual(dates.year_of('9/1/2020'), 2020)
        self.assertEqual(dates.year_of('2021.08'), 2021)
        self.assertIsNone(dates.year_of('#VALUE!'))


if __name__ == '__main__':
    unittest.main()
