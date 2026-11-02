"""Read a Google Sheets HTML export into rows of cell text."""
from html.parser import HTMLParser


class _SheetParser(HTMLParser):
    """Collects <td> text for each <tbody> row of the first <table>.

    Row-number <th> cells are skipped, a colspan=N cell is followed by N-1
    empty strings, and Sheets' "freezebar" cells (UI artifacts for frozen
    rows/columns, never data) are ignored so indices match sheet columns.
    rowspan is not expanded.
    """

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows = []
        self._in_table = False
        self._done = False
        self._in_tbody = False
        self._row = None
        self._cell = None
        self._span = 1

    def handle_starttag(self, tag, attrs):
        if self._done:
            return
        if tag == 'table':
            self._in_table = True
        elif not self._in_table:
            return
        elif tag == 'tbody':
            self._in_tbody = True
        elif tag == 'tr' and self._in_tbody:
            self._row = []
        elif tag == 'td' and self._row is not None:
            attrs = dict(attrs)
            if 'freezebar-cell' in (attrs.get('class') or '').split():
                return
            self._cell = []
            span = (attrs.get('colspan') or '1').strip()
            self._span = int(span) if span.isdigit() and int(span) > 0 else 1
        elif tag == 'br' and self._cell is not None:
            self._cell.append('\n')

    def handle_endtag(self, tag):
        if self._done:
            return
        if tag == 'td' and self._cell is not None:
            self._row.append(''.join(self._cell).strip())
            self._row.extend([''] * (self._span - 1))
            self._cell = None
        elif tag == 'tr' and self._row is not None:
            if self._row:
                self.rows.append(self._row)
            self._row = None
        elif tag == 'tbody':
            self._in_tbody = False
        elif tag == 'table' and self._in_table:
            self._done = True

    def handle_data(self, data):
        if self._cell is not None:
            self._cell.append(data)


def read_sheet(path):
    """Return the first table's <tbody> rows as lists of stripped cell text."""
    with open(path, encoding='utf-8') as f:
        parser = _SheetParser()
        parser.feed(f.read())
        parser.close()
    return parser.rows


def header_index(row, name):
    """Index of the cell equal to name after stripping; KeyError if absent."""
    for i, cell in enumerate(row):
        if cell.strip() == name.strip():
            return i
    raise KeyError(name)


def find_header(rows, *labels):
    """Index of the first row containing every label as a whole cell (after stripping); ValueError if none."""
    for i, row in enumerate(rows):
        cells = {c.strip() for c in row}
        if all(label in cells for label in labels):
            return i
    raise ValueError(f'no header row with {", ".join(labels)}')


def cell(row, i):
    """Stripped text of row[i]; '' past the end of a short row."""
    return row[i].strip() if i < len(row) else ''


def pick_rows(rows, header, index):
    """Rows below rows[header] as (sheet row number, {key: cell text}) for the columns in index (key -> column).

    Only the indexed cells are looked at: a row whose indexed cells are all empty is not returned but counted,
    so columns outside an allowlist are never read, not even to decide emptiness. Returns (picked, empty_count).
    """
    picked, empty = [], 0
    for i in range(header + 1, len(rows)):
        values = {key: cell(rows[i], j) for key, j in index.items()}
        if any(values.values()):
            picked.append((i + 1, values))
        else:
            empty += 1
    return picked, empty


def pick_columns(rows, columns, *anchors, extra=None):
    """pick_rows below the header row for an allowlist of columns.

    The header row is the first row containing every anchor (find_header). columns maps record keys to header
    texts (header_index; KeyError when one is missing). extra, when given, is called with the header row and
    returns more {key: column index} for columns found another way. Returns pick_rows' (picked, empty).
    """
    h = find_header(rows, *anchors)
    index = {key: header_index(rows[h], label) for key, label in columns.items()}
    if extra:
        index.update(extra(rows[h]))
    return pick_rows(rows, h, index)
