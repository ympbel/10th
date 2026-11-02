"""Collect conversion notes for the user and write them as report.md.

Lines name sheets, row numbers, file slugs, column names, author bylines and conference names. They never
quote cells from columns the converters do not read.
"""
from pathlib import Path

COUNTS = '건수'
NEAR = '별칭 후보'  # author spelling → candidate member slugs (never linked automatically)
UNMATCHED = '미연결 저자'  # spellings linked to no member
UNRESOLVED_PROJECTS = '과제 미해결 값'  # pieces of a paper's project cell that name no project
MISSING_DATES = '날짜 누락'  # <collection>/<file>: <column>
SKIPPED = '건너뛴 행'  # <sheet> <n>행: <reason>, and empty-row counts
NEW_SPELLINGS = '새 표기'  # conference names and presentation types not in conferences.json
CHECK = '확인할 값'  # empty required values, conflicting columns, unreadable numbers

SECTIONS = (COUNTS, NEAR, UNMATCHED, UNRESOLVED_PROJECTS, MISSING_DATES, SKIPPED, NEW_SPELLINGS, CHECK)


class Report:
    def __init__(self):
        self.sections = {name: [] for name in SECTIONS}

    def add(self, section, line):
        """Add line to section once; a repeated line is ignored. An unknown section is a ValueError."""
        if section not in self.sections:
            raise ValueError(f'unknown report section: {section}')
        if line not in self.sections[section]:
            self.sections[section].append(line)

    def lines(self, section):
        return list(self.sections[section])

    def write(self, path):
        """Write the report as Markdown, one '##' heading per section in SECTIONS order."""
        out = ['# 변환 보고서', '']
        for name in SECTIONS:
            out += [f'## {name}', '']
            out += [f'- {line}' for line in self.sections[name]] or ['없음']
            out.append('')
        Path(path).write_text('\n'.join(out), encoding='utf-8')
