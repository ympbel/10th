import os
import unittest

import sheets

FIXTURE = os.path.join(os.path.dirname(__file__), 'fixtures', 'mini.html')


class ReadSheetTest(unittest.TestCase):
    def setUp(self):
        self.rows = sheets.read_sheet(FIXTURE)

    def test_rows_without_row_header(self):
        self.assertEqual(self.rows, [
            ['1', 'a', 'b', 'c'],
            ['2', 'p', 'x & y', ''],
            ['3', 'long note', '', 'e\nf'],
        ])

    def test_colspan_pads_one_empty_cell(self):
        self.assertEqual(self.rows[1][2:], ['x & y', ''])

    def test_softmerge_inner_text(self):
        self.assertEqual(self.rows[2][1], 'long note')


class HeaderIndexTest(unittest.TestCase):
    def test_exact_match_after_strip(self):
        self.assertEqual(sheets.header_index([' Name ', 'Year'], 'Year'), 1)
        self.assertEqual(sheets.header_index([' Name ', 'Year'], 'Name'), 0)

    def test_missing_raises_key_error(self):
        with self.assertRaises(KeyError):
            sheets.header_index(['Name', 'Year'], 'Title')


if __name__ == '__main__':
    unittest.main()
