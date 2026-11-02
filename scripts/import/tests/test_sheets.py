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


class FindHeaderTest(unittest.TestCase):
    ROWS = [['Title row', ''], ['', 'Year', 'Title'], ['1', '2020', 'A']]

    def test_first_row_with_every_label(self):
        self.assertEqual(sheets.find_header(self.ROWS, 'Year', 'Title'), 1)

    def test_missing_label_raises_value_error(self):
        with self.assertRaisesRegex(ValueError, 'Journal'):
            sheets.find_header(self.ROWS, 'Year', 'Journal')


class CellTest(unittest.TestCase):
    def test_stripped_text_and_empty_past_the_end(self):
        self.assertEqual(sheets.cell([' a ', 'b'], 0), 'a')
        self.assertEqual(sheets.cell([' a ', 'b'], 5), '')


class PickRowsTest(unittest.TestCase):
    def test_picked_cells_with_sheet_row_numbers_and_empty_count(self):
        rows = [['', 'Year', 'Secret', 'Title'],
                ['1', '2020', 'x', ' A '],
                ['2', '', 'only a secret', ''],
                [],
                ['3', '2021']]
        picked, empty = sheets.pick_rows(rows, 0, {'year': 1, 'title': 3})
        self.assertEqual(picked, [(2, {'year': '2020', 'title': 'A'}), (5, {'year': '2021', 'title': ''})])
        self.assertEqual(empty, 2)


class PickColumnsTest(unittest.TestCase):
    ROWS = [['Title row', '', '', ''],
            ['', 'Year', 'Secret', 'Title - with a hint'],
            ['1', '2020', 'x', 'A'],
            ['2', '', 'only a secret', '']]

    def test_header_located_by_anchors_and_columns_by_text(self):
        picked, empty = sheets.pick_columns(self.ROWS, {'year': 'Year'}, 'Year', 'Secret')
        self.assertEqual((picked, empty), ([(3, {'year': '2020'})], 1))

    def test_extra_columns_from_the_header_row(self):
        def extra(header):
            return {'title': next(i for i, c in enumerate(header) if c.startswith('Title'))}
        picked, _ = sheets.pick_columns(self.ROWS, {'year': 'Year'}, 'Year', extra=extra)
        self.assertEqual(picked, [(3, {'year': '2020', 'title': 'A'})])

    def test_missing_column_raises_key_error(self):
        with self.assertRaises(KeyError):
            sheets.pick_columns(self.ROWS, {'journal': 'Journal'}, 'Year')


if __name__ == '__main__':
    unittest.main()
