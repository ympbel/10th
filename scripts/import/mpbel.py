"""Read the MPBEL site's patent and seminar markdown (its src/content/patents/ko and seminars/ko).

Only frontmatter is read. Bodies, images and the pinned/category/legacy_* keys are not carried over: a seminar
links back to its post on the main site instead (source_url). Files whose name starts with '_' are templates.
The same reader (read_entries) also reads this site's own member files, which run.py links against.
"""
import json
import re
from pathlib import Path

import report as rp

SEMINAR_URL = 'https://ympbel.github.io/notice/seminar/{}/'

_KEY = re.compile(r'([A-Za-z_][\w-]*):(?:[ \t]+(.*))?$')
_COMMENT = re.compile(r'\s+#.*$')  # in a plain scalar, '#' after whitespace starts a comment
_DOUBLE_QUOTED = re.compile(r'"(?:[^"\\]|\\.)*"')


def _quoted_rest(text):
    """(value, rest) for text starting with a single- or double-quoted scalar."""
    if text[0] == '"':
        m = _DOUBLE_QUOTED.match(text)
        if not m:
            raise ValueError(f'unclosed double quote: {text}')
        return json.loads(m.group(0)), text[m.end():]
    parts, i = [], 1
    while True:
        j = text.find("'", i)
        if j < 0:
            raise ValueError(f'unclosed single quote: {text}')
        parts.append(text[i:j])
        if text[j + 1:j + 2] != "'":
            return ''.join(parts), text[j + 1:]
        parts.append("'")  # '' inside single quotes is one quote
        i = j + 2


def _scalar(text):
    """A one-line YAML scalar as a string: quotes removed ('' -> ' in single quotes, JSON-style escapes in double
    quotes), a trailing ' # comment' dropped. '[]' is an empty list."""
    text = text.strip()
    if not text or text.startswith('#'):
        return ''
    if text == '[]':
        return []
    if text[0] in '[{':
        raise ValueError(f'flow collections other than [] are not supported: {text}')
    if text[0] not in '\'"':
        return _COMMENT.sub('', text).strip()
    value, rest = _quoted_rest(text)
    rest = rest.strip()
    if rest and not rest.startswith('#'):
        raise ValueError(f'text after a quoted value: {text}')
    return value


def _block(indicator, lines):
    """A '|-' block scalar: the lines with their common indentation removed, joined with newlines, trailing
    newlines dropped."""
    if _COMMENT.sub('', indicator).strip() != '|-':
        raise ValueError(f'only |- block scalars are supported, not {indicator}')
    filled = [line for line in lines if line.strip()]
    indent = len(filled[0]) - len(filled[0].lstrip()) if filled else 0
    return '\n'.join(line[indent:] if line.strip() else '' for line in lines).rstrip('\n')


def _list(lines):
    """Block sequence items ('- item', at the indentation of the first item) as scalars. Deeper lines (the rest
    of a mapping item such as legacy_files' '  url: ...') are not read, so such an item is its first line."""
    filled = [line for line in lines if line.strip()]
    indent = len(filled[0]) - len(filled[0].lstrip())
    items = []
    for line in filled:
        if len(line) - len(line.lstrip()) > indent:
            continue
        item = line.strip()
        if not item.startswith('-'):
            raise ValueError(f'expected a list item: {line!r}')
        items.append(_scalar(item[1:]))
    return items


def _dedent(lines):
    filled = [line for line in lines if line.strip()]
    indent = len(filled[0]) - len(filled[0].lstrip())
    return [line[indent:] for line in lines]


def parse_frontmatter(text):
    """The frontmatter between the first two '---' lines as {key: value}, for the YAML the MPBEL files and
    writer.write_md use.

    Values are strings ('2009', 'false'), lists of strings for block sequences and '[]', joined text for '|-'
    block scalars, and dicts for keys followed by indented 'key: value' lines. Anything else (a missing or unclosed
    frontmatter, an unclosed quote, a scalar continued on indented lines, flow collections) is a ValueError rather
    than a guess.
    """
    lines = text.split('\n')
    if lines[0].rstrip() != '---':
        raise ValueError('no frontmatter')
    end = next((i for i in range(1, len(lines)) if lines[i].rstrip() == '---'), None)
    if end is None:
        raise ValueError('frontmatter is not closed')
    return _mapping(lines[1:end])


def _mapping(lines):
    """{key: value} for 'key: value' lines at column 0, each followed by the indented lines that belong to it."""
    data, i = {}, 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line.strip() or line.startswith('#'):
            continue
        m = _KEY.match(line)
        if not m:
            raise ValueError(f'unexpected frontmatter line: {line!r}')
        key, value = m.group(1), (m.group(2) or '').strip()
        nested = []
        while i < len(lines) and (not lines[i].strip() or lines[i][0] in ' \t-'):
            nested.append(lines[i])
            i += 1
        if value.startswith('|'):
            data[key] = _block(value, nested)
        elif not any(line.strip() for line in nested):
            data[key] = _scalar(value)
        elif value and not value.startswith('#'):
            raise ValueError(f'{key}: a value continued on indented lines is not supported')
        elif next(line for line in nested if line.strip()).lstrip().startswith('-'):
            data[key] = _list(nested)
        else:
            data[key] = _mapping(_dedent(nested))
    return data


def read_entries(directory):
    """(file name without .md, frontmatter) for each *.md in directory not starting with '_', by file name."""
    for path in sorted(Path(directory).glob('*.md')):
        if path.name.startswith('_'):
            continue
        try:
            yield path.stem, parse_frontmatter(path.read_text(encoding='utf-8'))
        except ValueError as e:
            raise ValueError(f'{path}: {e}') from None


def _required(fm, key, where):
    if not fm.get(key):
        raise ValueError(f'{where}: no {key}')
    return fm[key]


def _integer(fm, key, where, required=False):
    value = fm.get(key)
    if value in (None, ''):
        if required:
            raise ValueError(f'{where}: no {key}')
        return None
    if not re.fullmatch(r'\d+', value):
        raise ValueError(f'{where}: {key} is not an integer ({value})')
    return int(value)


def _compact(record):
    return {k: v for k, v in record.items() if v not in (None, '')}


def read_patents(directory, report=None):
    """Patent records (schema keys plus '_file' = the MPBEL file name) from the MPBEL patents/ko folder.

    year, title, authors, venue ('|-' block: one string with newlines) and link are copied, and order, the
    main site's within-year order, when the file has it. A missing link or authors is left out.
    """
    records = []
    for file, fm in read_entries(directory):
        where = f'patents/{file}'
        record = _compact({
            'year': _integer(fm, 'year', where, required=True),
            'title': _required(fm, 'title', where),
            'authors': fm.get('authors'),
            'venue': fm.get('venue'),
            'link': fm.get('link'),
            'order': _integer(fm, 'order', where),
        })
        record['_file'] = file
        records.append(record)
    if report is not None:
        report.add(rp.COUNTS, f'특허 {len(records)}건')
    return records


def read_seminars(directory, report=None):
    """Seminar records (schema keys plus '_file' = the MPBEL file name) from the MPBEL seminars/ko folder.

    title (verbatim), date and the optional presenter and event_date ('YYYY-MM-DD' strings as written) are
    copied; source_url is the post's address on the main site, SEMINAR_URL with the file name. A seminar without
    a presenter or event_date is noted in report.
    """
    records = []
    for file, fm in read_entries(directory):
        where = f'seminars/{file}'
        record = _compact({
            'title': _required(fm, 'title', where),
            'date': _required(fm, 'date', where),
            'presenter': fm.get('presenter'),
            'event_date': fm.get('event_date'),
            'source_url': SEMINAR_URL.format(file),
        })
        if report is not None and 'presenter' not in record:
            report.add(rp.CHECK, f'{where}: presenter 비어 있음')
        if report is not None and 'event_date' not in record:
            report.add(rp.MISSING_DATES, f'{where}: event_date')
        record['_file'] = file
        records.append(record)
    if report is not None:
        report.add(rp.COUNTS, f'세미나 {len(records)}건')
    return records
