"""Collect conversion notes for the user and write them as report.md.

Lines name sheets, row numbers, file slugs, column names, author bylines and conference names. They never
quote cells from columns the converters do not read.
"""
from pathlib import Path

import dates

COUNTS = '건수'
CORRECTIONS = '보정'  # <collection>/<file> → <collection>/<file>: the fields corrections.json set
NEAR = '별칭 후보'  # author spelling → candidate member slugs (never linked automatically)
UNMATCHED = '미연결 저자'  # spellings linked to no member
UNRESOLVED_PROJECTS = '과제 미해결 값'  # pieces of a paper's project cell that name no project
MISSING_DATES = '날짜 누락'  # <collection>/<file>: <column>
SKIPPED = '건너뛴 행'  # <sheet> <n>행: <reason>, and empty-row counts
NEW_SPELLINGS = '새 표기'  # conference names and presentation types not in conferences.json
CHECK = '확인할 값'  # empty required values, conflicting columns, unreadable numbers

SECTIONS = (COUNTS, CORRECTIONS, NEAR, UNMATCHED, UNRESOLVED_PROJECTS, MISSING_DATES, SKIPPED, NEW_SPELLINGS, CHECK)


class Report:
    def __init__(self):
        self.sections = {name: [] for name in SECTIONS}

    def add(self, section, line):
        """Add line to section once; a repeated line is ignored. An unknown section is a ValueError."""
        if section not in self.sections:
            raise ValueError(f'unknown report section: {section}')
        if line not in self.sections[section]:
            self.sections[section].append(line)

    def skip(self, sheet, n, reason):
        """Note sheet row n as skipped."""
        self.add(SKIPPED, f'{sheet} {n}행: {reason}')

    def year_or_skip(self, sheet, n, value):
        """value as a four-digit year; None after noting row n as skipped ('연도 없음')."""
        year = dates.parse_year(value)
        if year is None:
            self.skip(sheet, n, '연도 없음')
        return year

    def empty_rows(self, sheet, count):
        """Note how many empty rows a sheet had (nothing when there were none)."""
        if count:
            self.add(SKIPPED, f'{sheet}: 빈 행 {count}개')

    def blanks(self, where, values, keys, columns):
        """Note each key in keys whose value is empty as '<where>: <column header> 비어 있음'."""
        for key in keys:
            if not values.get(key):
                self.add(CHECK, f'{where}: {columns[key]} 비어 있음')

    def lines(self, section):
        return list(self.sections[section])

    def write(self, path, head=()):
        """Write the report as Markdown: the title, the Markdown lines in head (run.py's count table), then one
        '##' heading per section in SECTIONS order."""
        out = ['# 변환 보고서', '']
        if head:
            out += list(head) + ['']
        for name in SECTIONS:
            out += [f'## {name}', '']
            out += [f'- {line}' for line in self.sections[name]] or ['없음']
            out.append('')
        Path(path).write_text('\n'.join(out), encoding='utf-8')
