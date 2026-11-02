"""Normalize the date spellings found in the sheets to ISO strings."""
import datetime
import re

_MDY = re.compile(r'(\d{1,2})/(\d{1,2})/(\d{4})')
_YMD = re.compile(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})')
_YM = re.compile(r'(\d{4})\.(\d{1,2})')


def _day(y, m, d):
    try:
        return datetime.date(int(y), int(m), int(d)).isoformat()
    except ValueError:
        return None


def parse_date(s):
    """'M/D/YYYY', 'YYYY-MM-DD', 'YYYY/MM/DD' -> 'YYYY-MM-DD'; 'YYYY.M' -> 'YYYY-MM'.

    Anything else (no year, empty, '#VALUE!', impossible date) -> None.
    """
    s = (s or '').strip()
    m = _MDY.fullmatch(s)
    if m:
        return _day(m[3], m[1], m[2])
    m = _YMD.fullmatch(s)
    if m:
        return _day(m[1], m[2], m[3])
    m = _YM.fullmatch(s)
    if m and 1 <= int(m[2]) <= 12:
        return f'{m[1]}-{int(m[2]):02d}'
    return None


def year_of(s):
    """Year of a parseable date string, else None."""
    d = parse_date(s)
    return int(d[:4]) if d else None


def parse_year(s):
    """'2021' -> 2021; anything but four digits (after stripping) -> None."""
    s = (s or '').strip()
    return int(s) if re.fullmatch(r'\d{4}', s) else None
