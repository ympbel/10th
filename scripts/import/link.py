"""Link author bylines and award recipients to member slugs.

Linking is decided once, at conversion time, and written into each record. Only exact matches after
normalization are linked; near spellings are returned as candidates for the report and never linked.
Professors have no person pages, so they are never linked; a byline that exactly matches a professor is
known rather than unmatched and is left out of the report.
"""
import names
import report as rp


def _people(members):
    return [m for m in members if m.get('role') != 'professor']


def _english(member):
    """The member's English spellings: name_en and aliases."""
    return [s for s in [member.get('name_en', '')] + list(member.get('aliases', [])) if s]


def _is_professor(key, members):
    return any(names.norm(s) == key for m in members if m.get('role') == 'professor' for s in _english(m))


def _only(slugs):
    """The single slug in slugs (duplicates collapsed), or None when there is none or more than one."""
    distinct = list(dict.fromkeys(slugs))
    return distinct[0] if len(distinct) == 1 else None


def match_en(author, members):
    """Slug of the one member whose name_en or an alias equals author after names.norm(), else None.

    A spelling shared by two members is not guessed (None). A name without Latin letters never matches.
    """
    key = names.norm(author)
    if not key:
        return None
    return _only(m['_file'] for m in _people(members) if any(names.norm(s) == key for s in _english(m)))


def match_ko(name, members):
    """Slug of the one member whose Korean name equals name ignoring whitespace ('신 비' = '신비'), else None."""
    key = names.norm_ko(name)
    if not key:
        return None
    return _only(m['_file'] for m in _people(members) if names.norm_ko(m.get('name', '')) == key)


def candidates(author, members):
    """Slugs of members with an English spelling near author (names.near). For the report only."""
    found = [m['_file'] for m in _people(members) if any(names.near(author, s) for s in _english(m))]
    return list(dict.fromkeys(found))


def link_authors(strings, members):
    """(slugs, unmatched, near) for author-list strings.

    Each string is split with names.split_authors and every name is matched with match_en. slugs are the
    matched members, de-duplicated in order of first appearance. unmatched lists each unmatched name once;
    near pairs an unmatched name with its candidate slugs when it has any. A professor's exact spelling is in
    neither list (never linked, and never offered as a student's alias).
    """
    slugs, unmatched, near = [], [], []
    for s in strings:
        for author in names.split_authors(s or ''):
            slug = match_en(author, members)
            if slug:
                if slug not in slugs:
                    slugs.append(slug)
            elif author not in unmatched and not _is_professor(names.norm(author), members):
                unmatched.append(author)
                found = candidates(author, members)
                if found:
                    near.append((author, found))
    return slugs, unmatched, near


def link_and_report(strings, members, report):
    """link_authors, with each unmatched name and each near candidate added to report; returns the slugs."""
    slugs, unmatched, near = link_authors(strings, members)
    for author in unmatched:
        report.add(rp.UNMATCHED, author)
    for author, found in near:
        report.add(rp.NEAR, f'{author} → {", ".join(found)}')
    return slugs
