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
