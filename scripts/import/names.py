"""Normalize and compare author names."""
import re

# Separators: ',' ';' ' and ', and a period plus whitespace after a word of
# two or more characters ('Jeon. Sangmin' splits, the initial in 'D. Kim' does not).
_SEPARATOR = re.compile(r'[,;]|\s+and\s+|(?<=\w\w)\.\s+')


def norm(s):
    """Lowercase and keep only ASCII letters: 'Byong-Su Choi.' -> 'byongsuchoi'."""
    return re.sub(r'[^a-z]', '', s.lower())


def norm_ko(s):
    """Remove whitespace from a Korean name: '신 비' -> '신비'."""
    return re.sub(r'\s+', '', s)


def split_authors(s):
    """Split an author list into names, dropping trailing ',' '.' and empty pieces."""
    pieces = (p.strip().rstrip('.,').strip() for p in _SEPARATOR.split(s))
    return [p for p in pieces if p]


def _distance(a, b):
    """Levenshtein edit distance."""
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def _tokens(s):
    return sorted(t for t in (norm(w) for w in s.split()) if t)


def near(a, b):
    """True when two names match after norm(): equal, same tokens in another
    order, or within edit distance 2. Names with no Latin letters never match."""
    na, nb = norm(a), norm(b)
    if not na or not nb:
        return False
    return na == nb or _tokens(a) == _tokens(b) or _distance(na, nb) <= 2
