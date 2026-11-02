"""Write content files: file-name slugs and markdown with hand-written YAML frontmatter."""
import re
import unicodedata
from pathlib import Path


def slugify(name_en, fallback):
    """'Ye-In Park' -> 'ye-in-park': ASCII lowercase letters, digits and single hyphens.

    Accents are dropped ('José' -> 'jose'). A result without a Latin letter (empty or Korean-only
    input) is replaced by fallback.
    """
    ascii_text = unicodedata.normalize('NFKD', name_en or '').encode('ascii', 'ignore').decode()
    slug = re.sub(r'[^a-z0-9]+', '-', ascii_text.lower()).strip('-')
    return slug if re.search(r'[a-z]', slug) else fallback


def unique_slug(base, taken):
    """base, or base-2, base-3, ... when already in taken. The returned slug is added to taken."""
    slug, n = base, 2
    while slug in taken:
        slug, n = f'{base}-{n}', n + 1
    taken.add(slug)
    return slug


def _quote(s):
    for raw, escaped in (('\\', '\\\\'), ('"', '\\"'), ('\n', '\\n'), ('\r', '\\r'), ('\t', '\\t')):
        s = s.replace(raw, escaped)
    return f'"{s}"'


def _scalar(v):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return _quote(v)
    raise TypeError(f'cannot write a {type(v).__name__} as a YAML scalar')


def _yaml_lines(data, indent=''):
    """YAML lines for a dict. None, '' and keys starting with '_' are left out, and so is a nested dict
    left empty by that. Strings are always double-quoted; lists are block sequences of scalars."""
    lines = []
    for key, value in data.items():
        if key.startswith('_') or value is None or value == '':
            continue
        if isinstance(value, dict):
            inner = _yaml_lines(value, indent + '  ')
            if inner:
                lines += [f'{indent}{key}:'] + inner
        elif isinstance(value, (list, tuple)):
            if value:
                lines += [f'{indent}{key}:'] + [f'{indent}  - {_scalar(item)}' for item in value]
            else:
                lines.append(f'{indent}{key}: []')
        else:
            lines.append(f'{indent}{key}: {_scalar(value)}')
    return lines


def write_md(path, frontmatter, body='', force=False):
    """Write frontmatter (and body) to path. An existing file is left untouched and False is returned
    unless force is True; otherwise parent directories are created and True is returned."""
    path = Path(path)
    if path.exists() and not force:
        return False
    text = '---\n' + ''.join(line + '\n' for line in _yaml_lines(frontmatter)) + '---\n'
    if body:
        text += '\n' + body.rstrip('\n') + '\n'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')
    return True
