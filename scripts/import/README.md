# 변환 스크립트 (`scripts/import/`)

구글 시트 HTML 내보내기(`data/`)와 MPBEL 사이트의 특허·세미나 마크다운을 `src/content/`의 마크다운 파일(항목 하나 = 파일 하나)로 옮깁니다. 한 번 돌린 뒤에는 만들어진 파일을 직접 고칩니다. Python 3 표준 라이브러리만 씁니다.

## 실행

저장소 폴더에서:

```sh
python3 scripts/import/run.py --data data --mpbel ../Website_20261028/src/content --out src/content --check
```

| 옵션 | 뜻 |
|---|---|
| `--data` | 시트 내보내기 폴더. 읽는 파일 이름은 `run.py`의 `SHEETS`에 있습니다. |
| `--mpbel` | MPBEL 사이트의 `src/content` 폴더. `patents/ko/`, `seminars/ko/`를 읽습니다. |
| `--out` | 쓸 곳(`src/content`). 항목마다 `<out>/<컬렉션>/<파일 이름>.md`를 씁니다. |
| `--force` | 이미 있는 파일도 덮어씁니다. 주지 않으면 있는 파일은 그대로 두고 표의 "그대로 둠"에 셉니다. |
| `--only members,papers` | 이 컬렉션만 쓰고, 세고, 대조합니다. 연결에 필요한 과제는 쓰지 않아도 시트에서 읽습니다. `members`가 빠지면 구성원은 시트가 아니라 이미 있는 `src/content/members/*.md` 파일에서 읽습니다(아래 "다시 돌릴 때"). 이름: `members`, `papers`, `presentations`, `awards`, `challenges`, `projects`, `patents`, `seminars`. |
| `--check` | 건수가 기대값과 다르면 종료 코드 1로 끝납니다. |
| `--report` | 보고서를 쓸 곳. 기본은 `scripts/import/report.md`. |

끝나면 건수 표(건수, 기대값, 새로 씀, 그대로 둠, 대조)를 출력하고 `report.md` 맨 위에도 적습니다. 기대값은 `run.py`의 `EXPECTED` 표 한 곳에만 있습니다.

## 무엇이 어디로 가나

| 컬렉션 | 원본 | 파일 이름 |
|---|---|---|
| `members` | `MPBEL - 현황.html`, `Alumni.html` | 영문 이름(`gildong-hong`). 영문 이름이 없으면 `member-<번호>` |
| `papers` | `MPBEL 논문.html` | `<연도>-<1저자>-<제목 앞 세 단어>` |
| `presentations` | `학회 초록.html` | 논문과 같은 규칙 |
| `awards` | `수상 현황.html` | `<연도>-award-<시트 순번>` |
| `challenges` | `Challenge.html` | `<연도>-<주최>-<시트 순번>` |
| `projects` | `과제정보.html` | `project-<시트 순번>` |
| `patents` | MPBEL `patents/ko/*.md` | MPBEL 파일 이름 그대로 |
| `seminars` | MPBEL `seminars/ko/*.md` | MPBEL 파일 이름 그대로. 본문 대신 `source_url`(메인 사이트의 그 글 주소)을 적습니다. |

같은 이름이 겹치면 `-2`, `-3`을 붙입니다. 저자와 구성원, 논문과 과제의 연결은 이때 정해져 파일에 적힙니다(`members`, `projects`, `member`).

- 저자 표기는 구성원의 영문 이름과 `aliases`(한글 표기는 한글 이름)에 정확히 맞을 때만 연결합니다. 가까운 표기는 `report.md`의 "별칭 후보"에만 적습니다. 교수는 개인 페이지가 없어 연결하지 않습니다.
- 학회 이름과 발표 형태는 `conferences.json`으로 표기를 통일합니다. 표에 없는 표기는 그대로 두고 "새 표기"에 적습니다.
- 논문의 과제 이름은 과제명이나 닉네임이 정확히 같을 때, 또는 `projects.json`(`{"줄임말": "project-03"}`)에 적힌 줄임말일 때만 연결합니다. 나머지는 "과제 미해결 값"에 적습니다.

## `report.md`

사용자가 확인할 것을 모은 보고서입니다. 건수 표 아래에 다음 구역이 있습니다: 건수, 별칭 후보, 미연결 저자, 과제 미해결 값, 날짜 누락, 건너뛴 행(행 번호와 이유, 빈 행 수), 새 표기, 확인할 값(비어 있는 필수 값, 서로 다른 저자 열, 숫자가 아닌 값, 중복일 수 있는 발표 행). 행 번호, 열 이름, 저자 표기, 제목, 파일 이름만 적고 개인정보 열의 값은 적지 않습니다.

## 개인정보

- 시트마다 가져올 열의 허용 목록이 코드에 있고(`COLUMNS`, `STATUS_COLUMNS`, `ALUMNI_COLUMNS`), 목록에 없는 열의 값은 항목에도 보고서에도 들어가지 않습니다. 연락처, 생년월일, MBTI, 학번, 과학기술인등록번호, 과제 실무담당자 같은 열은 들어올 길이 없습니다.
- `data/`는 `.gitignore`에 있습니다. 원본 시트 내보내기는 저장소 밖에 보관합니다.
- `tests/dist/privacy.test.mjs`가 `src/content/`의 파일과 빌드된 페이지에 그런 값이 없는지 검사합니다.

## 다시 돌릴 때

- `--force` 없이 돌리면 새 파일만 생기고 있는 파일은 바뀌지 않습니다.
- `--force`로 다시 쓰면 그 컬렉션의 파일이 시트 값으로 돌아갑니다. 손으로 고친 내용은 사라지므로, 고친 파일이 있는 컬렉션은 `--only`에서 빼거나 다시 쓴 뒤 고친 내용을 옮깁니다. 예외는 구성원의 `aliases`입니다. 구성원을 시트에서 다시 만들 때 같은 이름의 원래 파일에 있던 표기를 모두 이어 받습니다.
- **저자 연결만 다시 하기.** 구성원 파일의 `aliases`에 표기를 더하거나 `projects.json`을 채운 뒤에는 구성원을 빼고 돌립니다. 구성원은 지금 있는 파일(손으로 더한 `aliases` 포함)에서 읽고, 논문·발표·수상의 연결 필드(`members`, `projects`, `member`)가 새로 정해집니다. 이 세 컬렉션의 파일은 시트 값으로 다시 쓰이므로, 손으로 고친 파일이 있으면 그 컬렉션은 빼고 그 파일은 직접 고칩니다.

  ```sh
  python3 scripts/import/run.py --data data --mpbel ../Website_20261028/src/content --out src/content --force --only papers,presentations,awards --check
  ```
- `report.md`는 돌릴 때마다 새로 씁니다. `--only`로 돌리면 그 컬렉션과 연결에 쓴 컬렉션의 내용만 담깁니다.

## 파일

| 파일 | 하는 일 |
|---|---|
| `run.py` | 실행기. 입력을 읽고 아래 모듈을 불러 파일을 쓰고 건수를 셉니다. |
| `sheets.py` | 시트 HTML을 행 목록으로 읽고 허용된 열만 고릅니다. |
| `members.py`, `papers.py`, `presentations.py`, `awards.py`, `challenges.py`, `projects.py` | 시트별 항목 만들기 |
| `mpbel.py` | MPBEL 마크다운의 frontmatter를 읽어 특허와 세미나 항목을 만듭니다. 이 사이트의 구성원 파일도 같은 방법으로 읽습니다. |
| `link.py`, `names.py` | 저자 표기를 구성원과 연결 |
| `dates.py` | 날짜 표기 통일(`YYYY-MM-DD`, `YYYY-MM`) |
| `writer.py` | 파일 이름 slug와 마크다운 쓰기 |
| `report.py` | `report.md` |
| `conferences.json`, `projects.json` | 학회 표기 통일표, 과제 줄임말 대응표 |

## 테스트

```sh
python3 -m unittest discover -s scripts/import/tests -t scripts/import
```

`data/`와 MPBEL 폴더가 없어도 돕니다(임시 폴더에 만든 가짜 입력을 씁니다).
