# MPBEL 10주년 아카이브(`10th`) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MPBEL 연구실 10년(2016–2026)의 사람·논문·특허·발표·수상·과제·세미나를 연도와 사람 축으로 엮어 보여 주는 Astro 정적 사이트를 만들어 `https://ympbel.github.io/10th/`에 배포한다.

**Architecture:** 구글 시트 HTML 내보내기(`data/`)와 MPBEL 사이트 콘텐츠를 Python 스크립트가 **한 번** 마크다운 파일(항목 하나 = 파일 하나)로 변환하고, 사람↔항목 연결(`members`, `projects`)을 그때 확정해 파일에 적는다. Astro content collections(엄격 스키마)가 그 파일을 읽어 홈·연도 11쪽·게시판 11개·개인 페이지를 한·영 두 판으로 빌드한다. 라우트 파일은 얇은 껍데기이고 화면은 `locale`을 받는 컴포넌트가 그린다. `base: '/10th'`이므로 모든 내부 경로는 `url()` 헬퍼를 거친다.

**Tech Stack:** Astro 7.x(`reference/mpbel/package.json`과 같은 버전대), TypeScript, 일반 CSS(DESIGN.md 토큰을 CSS 변수로), `node --test` + cheerio(빌드 결과 검사), Python 3 표준 라이브러리(변환 스크립트, `unittest`), GitHub Actions → GitHub Pages. 화면 확인은 이 머신의 Chrome 헤드리스.

**Spec:** `docs/superpowers/specs/2026-11-02-mpbel-10th-design.md` (함께: `PRODUCT.md`, `DESIGN.md`, `docs/build-guide.md`, 홈 디자인 계약 `.impeccable/surfaces/src-pages-index-astro.md`)

## Global Constraints

- 저장소는 **이 폴더**(`Website_20261102`)다. `git init -b main`은 Task 1에서, 원격 저장소 생성과 첫 push는 **Task 17의 사용자 확인 뒤**에만 한다. 그 전에는 `git remote`를 만들지 않는다.
- `astro.config.mjs`: `site: 'https://ympbel.github.io'`, `base: '/10th'`, `i18n: { defaultLocale: 'ko', locales: ['ko','en'], routing: { prefixDefaultLocale: false } }`, `vite.build.cssTarget: ['chrome87','edge88','firefox78','safari14','ios14']`. `public/CNAME`은 만들지 않는다.
- 소스 어디에도 `/10th/`를 직접 쓰지 않는다. 내부 링크·이미지 경로는 `url('/people/students/')`처럼 `src/lib/url.ts`를 거친다. 마크다운 본문의 `/`로 시작하는 경로는 rehype 플러그인이 붙인다.
- 항목 하나 = 파일 하나. `_`로 시작하는 파일은 템플릿이며 컬렉션에서 제외(`glob({ pattern: ['**/*.md', '!**/_*.md'] })`). 모든 스키마는 `.strict()`. 날짜는 문자열 `YYYY-MM-DD` 또는 `YYYY-MM`, 연도는 정수.
- **개인정보 금지**: 전화번호, 이메일, 생년월일·나이, MBTI, 학번, 과학기술인등록번호, 과제 실무담당자, "Jin's 과제 담당", 5공 유무, 수료여부, 과제 연구내용. 변환 스크립트는 시트마다 **읽을 열의 허용 목록**만 읽는다. `data/`는 `.gitignore`에 있다. `report.md`에도 개인정보 값을 쓰지 않는다(행 번호와 열 이름만).
- 디자인은 `DESIGN.md`만 따른다. 색은 `src/styles/tokens.css`의 변수로만 쓴다. 모서리 0px, 불릿은 정사각형, 상호작용 색은 Cobalt `#1563b4` 하나, Signal Mint `#59ffce`는 진한 블루 위 1–2px 선으로만, 글꼴 Lato + Nanum Gothic 굵기 400/700, 한국어 단락 `word-break: keep-all`, 제목·슬로건은 이미지가 아니라 텍스트.
- 레이아웃: 1200px 고정 그리드, 상단 바 100px, 서브 페이지 240px 사이드 영역 + 60px 간격 + 900px 본문, 1024px 이하 유동(좌우 16px), 600px 이하 1열.
- 숫자 기대값(변환 스크립트 `--check`와 빌드 결과 검사가 공유): 구성원 61(학생 23 + 졸업생 13 + 거쳐 간 26, 박예인은 학생이면서 학위 보유) + 교수 8, 논문 217(2016년 이후 162), 발표 379, 수상 41, 챌린지 5, 과제 15, 특허 7, 세미나 431.
- 테스트 명령은 glob을 따옴표로 감싼다: `node --test "tests/unit/**/*.test.ts"`, `node --test "tests/dist/**/*.test.mjs"`. `npm test` = 단위 → 빌드 → 빌드 결과 검사. 모든 페이지 파일은 `src/styles/global.css`를 첫 import로 둔다.
- 커밋 메시지는 영어 conventional commit(`feat:`, `test:`, `chore:`)이고, 끝에 다음 두 줄을 붙인다:
  `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01BY4vK7KJJyQLWWSt73BdrS`
- `../Website_20261028`과 `data/`의 파일은 읽기만 한다.

## Review Focus

1. 합류일에 연도가 없는 구성원(시트 값 `3/1`): `joined`가 비어도 변환이 멈추지 않고, 카드와 연표가 그 사람을 "합류 연도 미상"으로 다룬다 → Task 2(`parse_date`), Task 3, Task 10.
2. 저자 문자열의 구분자가 섞인 경우(`Soyoung Jeon. Sangmin lee, Ho Jae Kim`): 마침표·쉼표·세미콜론·`and`로 나누고 마침표 뒤 이름도 찾는다 → Task 2(`split_authors`), Task 4.
3. 1저자 칸에 두 명(`Byong Su Choi, Sang Kyun Yoo`): 두 사람 모두 `members`에 연결된다 → Task 4.
4. 템플릿만 있는 빈 컬렉션(workshops, photos, comments): 빌드가 실패하지 않고 빈 상태 안내가 나온다 → Task 13.
5. 홈 주소의 해시가 없는 연도(`#y1999`)거나 형식이 다를 때: 최신 연도 패널로 돌아간다 → Task 8(`resolveYear`).

---

### Task 1: 프로젝트 뼈대, `base` 헬퍼, 빌드 결과 검사 틀

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `.gitignore`, `.github/workflows/deploy.yml`, `src/lib/url.ts`, `src/lib/rehype-base.ts`, `src/pages/index.astro`(임시), `src/pages/en/index.astro`(임시), `src/styles/global.css`(빈 import 껍데기), `tests/unit/url.test.ts`, `tests/dist/helpers.mjs`, `tests/dist/links.test.mjs`
- Reference: `reference/mpbel/*`(복사해 고친다), `docs/build-guide.md` 3·4장

**Interfaces:**
- Produces: `url(path: string): string` — `path`는 `/`로 시작하는 사이트 루트 경로, 반환은 `import.meta.env.BASE_URL`(끝 `/` 제거)을 앞에 붙인 값. `url('/')`는 `/10th/`. `tests/dist/helpers.mjs`: `BASE = '/10th'`, `page(path)`, `exists(path)`, `allHtmlFiles()` — `path`는 `base` 없는 사이트 경로(`'people/students'`).
- Produces: `rehypeBase()` — 마크다운 본문의 `href`/`src`가 `/`로 시작하고 `//`가 아니면 `BASE_URL`을 붙이는 rehype 플러그인. `astro.config.mjs`의 `markdown.rehypePlugins`에 등록.

- [ ] **Step 1: `git init -b main`.** `.gitignore`는 `reference/mpbel/gitignore.example`에 `data/`, `.impeccable/review/`, `.superpowers/`, `scripts/import/__pycache__/`를 더한 것. `git status`에 `data/`가 나오지 않는지 확인.
- [ ] **Step 2: `package.json`**(`name: "mpbel-10th"`, scripts는 reference와 같음), `tsconfig.json`, `.nvmrc`(`nvmrc.example` 복사), `deploy.yml` 복사. `npm install`.
- [ ] **Step 3: 실패하는 단위 테스트** `tests/unit/url.test.ts`: `url('/')` → `'/10th/'`, `url('/people/students/')` → `'/10th/people/students/'`, `url('/images/site/logo.png')` → `'/10th/images/site/logo.png'`. `import.meta.env.BASE_URL`이 없는 테스트 환경을 위해 `url.ts`는 `import.meta.env?.BASE_URL ?? '/10th/'`를 읽고 테스트는 그 기본값에 기댄다.
- [ ] **Step 4: 실행해 실패 확인.** Run: `node --test "tests/unit/**/*.test.ts"` Expected: FAIL (모듈 없음).
- [ ] **Step 5: `src/lib/url.ts`, `src/lib/rehype-base.ts`, `astro.config.mjs` 작성.** Global Constraints의 설정값 그대로. rehype 플러그인은 `unist-util-visit` 없이 직접 트리를 순회한다(의존성 추가 금지).
- [ ] **Step 6: 임시 홈 두 개**(`src/pages/index.astro`, `src/pages/en/index.astro`)에 `<a href={url('/')}>`와 `<img src={url('/images/site/logo.png')}>` 하나씩. `public/images/site/logo.png`는 `../Website_20261028/public/images/site/logo.png`를 복사.
- [ ] **Step 7: 빌드 결과 검사** `tests/dist/helpers.mjs`(reference 복사 + `BASE`), `tests/dist/links.test.mjs`(reference를 고친다): 모든 `a[href]`·`img[src]` 중 `/`로 시작하는 것은 **반드시 `/10th/`로 시작**해야 하고(`/10th` 없는 사이트 루트 링크는 실패 목록에 넣는다), `/10th`를 뗀 경로가 `dist/`에 있어야 한다. 퍼센트 디코딩과 NFC 정규화는 reference 그대로. `mpbel.yonsei.ac.kr` 검사는 뺀다.
- [ ] **Step 8: 실행.** Run: `npm test` Expected: 단위 PASS, 빌드 성공, dist PASS. `dist/index.html`과 `dist/en/index.html`이 있고 그 안의 href가 `/10th/`로 시작.
- [ ] **Step 9: Commit** `chore: scaffold astro project with /10th base and dist link test`

### Task 2: 변환 스크립트 기반 모듈(시트 읽기, 날짜, 이름)

**Files:**
- Create: `scripts/import/sheets.py`, `scripts/import/dates.py`, `scripts/import/names.py`, `scripts/import/tests/test_sheets.py`, `scripts/import/tests/test_dates.py`, `scripts/import/tests/test_names.py`, `scripts/import/tests/fixtures/mini.html`(직접 만든 3×4 표. 실제 데이터 복사 금지)
- Test command: `python3 -m unittest discover -s scripts/import/tests -t scripts/import`

**Interfaces:**
- Produces: `sheets.read_sheet(path) -> list[list[str]]` — 첫 `<table>`의 `<tbody>` 행마다 셀 텍스트 목록(행 머리 `<th>` 제외, `colspan`만큼 빈 칸 채움, `softmerge-inner` 안 텍스트 사용, HTML 엔티티 해제, 앞뒤 공백 제거). `sheets.header_index(row, name) -> int`(없으면 `KeyError`).
- Produces: `dates.parse_date(s) -> str | None` — `M/D/YYYY`, `MM/DD/YYYY`, `YYYY.MM`, `YYYY.M`, `YYYY-MM-DD`, `YYYY/MM/DD` → `YYYY-MM-DD` 또는 `YYYY-MM`; 연도 없는 값(`3/1`), 빈 값, `#VALUE!` → `None`. `dates.year_of(s) -> int | None`.
- Produces: `names.norm(s) -> str` — 소문자, 영문자만 남김(공백·마침표·하이픈·쉼표 제거). `names.split_authors(s) -> list[str]` — `,` `;` ` and ` 그리고 `이름 뒤 마침표+공백`(`Jeon. Sangmin`)으로 나누고 빈 조각 제거. `names.norm_ko(s) -> str` — 공백 제거(`신 비` → `신비`). `names.near(a, b) -> bool` — 정규화 후 같거나, 토큰 순서만 다르거나, 편집 거리 ≤ 2.

- [ ] **Step 1: 실패하는 테스트 셋.** `test_sheets`: fixture 표에서 `read_sheet` 결과가 `[['1','a','b','c'], ...]` 형태이고 `colspan="2"` 셀 뒤에 빈 문자열이 하나 들어가며 `softmerge-inner` 텍스트가 읽힌다. `test_dates`: `parse_date('11/1/2019')=='2019-11-01'`, `'09/02/2021'→'2021-09-02'`, `'2021.08'→'2021-08'`, `'2026.2'→'2026-02'`, `'3/1'→None`, `'#VALUE!'→None`, `year_of('9/1/2020')==2020`. `test_names`: `norm('Byong-Su Choi.')=='byongsuchoi'`, `split_authors('Soyoung Jeon. Sangmin lee, Ho Jae Kim and D. Kim')==['Soyoung Jeon','Sangmin lee','Ho Jae Kim','D. Kim']`, `norm_ko('신 비')=='신비'`, `near('Byong Su Choi','Byoung Su Choi')` True, `near('Choi Byong Su','Byong Su Choi')` True, `near('Min Seo Choi','Dong Hyeok Choi')` False.
- [ ] **Step 2: 실행해 실패 확인.** Expected: ImportError.
- [ ] **Step 3: 세 모듈 구현.** `sheets.py`는 `html.parser.HTMLParser` 기반. 외부 패키지 금지.
- [ ] **Step 4: 실행해 통과 확인.**
- [ ] **Step 5: Commit** `feat(import): sheet reader, date and name normalization`

### Task 3: 구성원 변환과 `members` 스키마

**Files:**
- Create: `scripts/import/members.py`, `scripts/import/writer.py`, `scripts/import/tests/test_members.py`, `src/content/schemas.ts`(memberSchema), `src/content.config.ts`(members만), `src/content/members/_template.md`
- Reference: 스펙 4장(현황 시트 구역 구조), 5.2 members 필드, 6장 7번

**Interfaces:**
- Consumes: Task 2 모듈.
- Produces: `members.build_members(status_rows, alumni_rows) -> list[dict]` — 현황 시트의 구역(현 학생 / 거쳐 간 / 그룹 / 교수)을 **빈 행으로** 나누고 번호 열이 숫자인 행만 구성원으로 읽는다. 허용 열: 이름, 영문 이름, ORCID, 연구실 첫 출근, 학위 시작, 학과, 전공, 학위과정(`석사 / 박사 / 통합(석사) / 통합 (박사)` 머리글 열). Alumni 허용 열: 이름, 영문 이름, 학위 시작일, 학위 취득일, 학위 종류, 학과, 현 직장, 직급. 거쳐 간 구성원 중 Alumni와 한글 이름이 같으면 한 사람으로 합쳐 `role: alumni`, 나머지는 `former`; 현 학생이면서 Alumni인 사람은 `student` + `degree`. 교수 구역 8명은 `role: professor`(`name`, `name_en`, `order`). `joined`가 비면 Alumni 학위 시작일을 쓴다. 반환 dict 키 = 스키마 필드.
- Produces: `writer.slugify(name_en, fallback) -> str`(ASCII 소문자·하이픈만; 영문 이름이 비면 `fallback`), `writer.write_md(path, frontmatter: dict, body='', force=False) -> bool`(있으면 쓰지 않고 False, YAML은 문자열을 따옴표로 감싼다), `writer.unique_slug(base, taken: set) -> str`(충돌 시 `-2`, `-3`).
- Produces: `memberSchema` 필드: `role` enum(professor|student|alumni|former), `name`, `name_en`, `aliases: string[]`(기본 `[]`), `orcid?`, `program?`, `department?`, `department_en?`, `major?`, `joined?`, `left?`, `degree?: { start?, date?, type?, type_en? }`, `affiliation?`, `affiliation_en?`, `position?`, `position_en?`, `order?`, `link?`. 컬렉션 id = 파일명 slug.

- [ ] **Step 1: 실패하는 테스트.** fixture 행 목록을 코드 안에서 만든다(가짜 이름). 검사: (a) 빈 행으로 구역이 나뉘어 학생 2명·거쳐 간 2명·교수 1명이 나온다, (b) 거쳐 간 사람과 Alumni의 같은 이름이 한 dict로 합쳐지고 `role=='alumni'`, `degree.date=='2022-08'`, (c) 학생이면서 Alumni인 사람은 `role=='student'`이고 `degree`가 있다, (d) 첫 출근 `3/1`인 사람은 `joined`가 없다(**Review Focus 1**), (e) 허용되지 않은 열 이름(`전화번호`)이 결과 dict 어디에도 없다, (f) `slugify('Ye-In Park','x')=='ye-in-park'`, `slugify('', 'member-7')=='member-7'`, (g) `write_md`가 기존 파일을 `force=False`면 덮어쓰지 않는다.
- [ ] **Step 2: 실행해 실패 확인.**
- [ ] **Step 3: 구현.** 그룹 구역(`그룹`, `연구실`, `Team pf. …`)은 건너뛴다. `aliases` 초기값은 `[name_en]`(영문 이름이 비면 `[]`).
- [ ] **Step 4: 실행해 통과 확인.**
- [ ] **Step 5: `src/content/schemas.ts`에 `memberSchema`, `src/content.config.ts`에 `members` 컬렉션, `_template.md`(모든 필드를 주석으로 설명).** `npx astro sync`가 통과한다(아직 항목 없음).
- [ ] **Step 6: Commit** `feat(import): members from status and alumni sheets; member schema`

### Task 4: 논문·발표·수상·챌린지·과제 변환과 사람·과제 연결

**Files:**
- Create: `scripts/import/papers.py`, `scripts/import/presentations.py`, `scripts/import/awards.py`, `scripts/import/challenges.py`, `scripts/import/projects.py`, `scripts/import/link.py`, `scripts/import/conferences.json`, `scripts/import/projects.json`, `scripts/import/report.py`, `scripts/import/tests/test_link.py`, `scripts/import/tests/test_records.py`
- Modify: `src/content/schemas.ts`, `src/content.config.ts`(papers, presentations, awards, challenges, projects)
- Reference: 스펙 4장 표, 5.2, 5.6, 5.7, 6장 10·17·18번

**Interfaces:**
- Consumes: Task 2·3.
- Produces: `link.match_en(author: str, members) -> str | None`(정규화 일치: `name_en` 또는 `aliases`), `link.match_ko(name, members) -> str | None`, `link.candidates(author, members) -> list[str]`(`names.near`로 가까운 slug들; 보고용), `link.link_authors(strings: list[str], members) -> (slugs: list[str], unmatched: list[str], near: list[tuple[str, list[str]]])`.
- Produces: `projects.resolve_project_refs(cell: str, projects, mapping: dict) -> (slugs, unresolved)` — 셀을 `,` `/`로 나눠 각 조각을 (1) 연구과제명 정확 일치, (2) 닉네임 정확 일치, (3) `projects.json`의 `"줄임말": "slug"` 항목으로 푼다. 셋 다 아니면 `unresolved`. `projects.json` 초기값은 `{}`(사용자가 채운다).
- Produces: `conferences.json`: `{"KSMP (Fall)": "KSMP Fall", "KSMP Fall": "KSMP Fall", "KSMP(Spring)": "KSMP Spring", "KSMP (spring)": "KSMP Spring", "KSMP (Spring)": "KSMP Spring", "KSMP Spring": "KSMP Spring", "e-Poster": "ePoster"}` 등 표기 통일. 발표형태도 같은 파일의 `types` 키로 통일.
- Produces: 스키마 — `paperSchema`(`year`, `title`, `first_author`, `co_first: string[]`, `corresponding: string[]`, `journal`, `impact_factor?: number`, `acknowledgement?`, `projects: string[]`, `members: string[]`, `link?`), `presentationSchema`(`year`, `title`, `authors`, `first_author`, `corresponding: string[]`, `conference`, `conference_raw?`, `type`, `session?`, `acknowledgement?`, `members: string[]`), `awardSchema`(`year`, `recipient`, `member?`, `conference`, `category`, `category_en?`, `title?`), `challengeSchema`(`year`, `host`, `title`, `objective`, `dataset_release?`, `submission?`, `link?`), `projectSchema`(`title`, `title_en?`, `nickname?`, `agency`, `program`, `institution`, `role`, `start`, `end`, `months?: number`, `participation_rate?`(문자열 그대로, 예 `20%`), `budget_year_krw_thousand?: number`, `budget_total_krw_thousand?: number`, `acknowledgement_en?`, `acknowledgement_ko?`).
- Produces: `report.Report` — `add(section, line)`, `write(path)`; 섹션: 건수, 별칭 후보(저자 표기 → 후보 slug), 미연결 저자(표기만), 과제 미해결 값, 날짜 누락(파일 slug + 열 이름), 건너뛴 행(행 번호).
- 파일명 규칙: papers `<year>-<slugify(first_author 첫 사람)>-<제목 앞 3단어 slug>.md`, presentations 같은 규칙, awards `<year>-<slugify(member or recipient)>-<n>.md`, challenges `2021-<host slug>-<n>.md`, projects `<start year>-<slugify(nickname or title 앞 3단어)>.md`. 충돌은 `unique_slug`.

- [ ] **Step 1: 실패하는 테스트.** `test_link`: 가짜 구성원 2명(`aliases` 포함)으로 (a) `match_en('Byoung Su Choi')`가 alias로 맞는다, (b) `link_authors(['Byong Su Choi, Sang Kyun Yoo'])`가 두 slug를 돌려준다(**Review Focus 3**; 호출 전 `split_authors`), (c) `'Soyoung Jeon. Sangmin lee'` 분리 후 둘 다 대조된다(**Review Focus 2**), (d) 편집 거리 2인 표기는 `unmatched`에 있고 `near`에 후보가 있다, (e) `match_ko('신 비')`가 `신비`인 구성원에 맞는다. `test_records`: (a) 허용 열만 읽어 `impact_factor`가 float이고 `Pf. Kim 교신 여부`는 어디에도 없다, (b) `resolve_project_refs('A과제, 중견', ...)`에서 `A과제`는 연구과제명 일치로 풀리고 `중견`은 mapping이 비면 `unresolved`, mapping에 있으면 풀린다, (c) 과제 시트의 안내문 행과 반복 머리글 행이 건너뛰어진다(시작일에 연도가 없으면 과제가 아님), (d) 학회명 `KSMP (Fall)`이 `KSMP Fall`로 바뀌고 `conference_raw`가 남는다, (e) 수상 행은 번호가 없어도 연도가 있으면 포함된다, (f) 논문 시트의 연도 없는 제목 행과 IF 합계 행은 건너뛰고 보고된다.
- [ ] **Step 2: 실행해 실패 확인.**
- [ ] **Step 3: 구현.** 발표 전체 저자는 "전체저자" 머리글 열과 머리글 없는 C열(인덱스 3) 중 비어 있지 않은 쪽, 둘 다 있고 다르면 보고(6장 18번).
- [ ] **Step 4: 실행해 통과 확인.**
- [ ] **Step 5: 스키마 다섯 개와 컬렉션 등록. `npx astro sync` 통과.**
- [ ] **Step 6: Commit** `feat(import): papers, presentations, awards, challenges, projects with member and project linking`

### Task 5: MPBEL 가져오기, 빈 게시판 스키마, 실행기, 실제 변환

**Files:**
- Create: `scripts/import/mpbel.py`, `scripts/import/run.py`, `scripts/import/README.md`, `scripts/import/tests/test_mpbel.py`, `src/content/{patents,seminars,workshops,photos,comments}/_template.md`, `src/content/pages/ko/home.md`, `src/content/pages/en/home.md`, `tests/dist/privacy.test.mjs`
- Modify: `src/content/schemas.ts`, `src/content.config.ts`(patents, seminars, workshops, photos, comments, pages)

**Interfaces:**
- Produces: `mpbel.read_patents(dir) -> list[dict]`(frontmatter `year,title,authors,venue,link`만; `_`파일 제외), `mpbel.read_seminars(dir) -> list[dict]`(`title,date,presenter?,event_date?` + `source_url = 'https://ympbel.github.io/notice/seminar/<파일명 without .md>/'`). frontmatter 파서는 표준 라이브러리로 쓴다(값은 문자열, `|-` 블록은 줄 이어 붙임).
- Produces: CLI `python3 scripts/import/run.py --data data --mpbel ../Website_20261028/src/content --out src/content [--force] [--only members,papers,...] [--check]`. 끝에 건수 표를 출력하고 `report.md`를 쓴다. `--check`는 Global Constraints의 기대값과 다르면 종료 코드 1.
- Produces: 스키마 `patentSchema`(= MPBEL publicationSchema 필드), `seminarSchema`(`title`, `date`, `presenter?`, `event_date?`, `source_url`), `workshopSchema`(`title`, `title_en?`, `date`, `place?`, `members: string[]`), `photoSchema`(`image`, `year`, `kind` enum(lab-meeting|conference|retreat|graduation|equipment|other), `people: string[]`, `caption?`, `date?`), `commentSchema`(`name`, `date`), `pageSchema`(`slogan`, `slogan_years`, `intro_title`, `intro_heading`; 본문 = 소개 단락). `home.md` 두 언어의 임시 문구는 스펙 5.3 인용문 그대로, 파일 맨 위 주석에 "임시 문구, 사용자 확정 전".

- [ ] **Step 1: 실패하는 테스트** `test_mpbel`: 임시 폴더에 가짜 `.md` 2개(`_template.md` 포함) → 템플릿이 제외되고 `source_url`이 규칙대로 만들어지며 `|-` venue가 한 문자열로 읽힌다.
- [ ] **Step 2: 실행해 실패 확인.** → **Step 3: 구현.** → **Step 4: 통과 확인.**
- [ ] **Step 5: 스키마·컬렉션·템플릿·`home.md` 작성. `npx astro sync` 통과.**
- [ ] **Step 6: 실제 변환 실행.** Run: `python3 scripts/import/run.py --data data --mpbel ../Website_20261028/src/content --out src/content --check` Expected: 건수 표가 기대값과 같고 종료 코드 0, `scripts/import/report.md` 생성. 다르면 스크립트를 고친다(데이터를 손으로 고치지 않는다).
- [ ] **Step 7: 빌드 결과 개인정보 검사** `tests/dist/privacy.test.mjs`: `dist/` 모든 HTML에서 `/01[016789]-?\d{3,4}-?\d{4}/`, `/[\w.+-]+@[\w-]+\.[\w.]+/`, `/MBTI/`, `/\b\d{6}\b(?=[^\d])/`(생년월일 6자리; 연도 범위 합산 표 등 오탐이 있으면 숫자 패턴은 `data/`에 있던 열 이름 `생년월일`·`학번`·`등록번호` 문자열 검사로 대체하고 이유를 주석에 적는다)가 한 건도 없다. 또 `src/content/` 전체에서 `전화`, `Email`, `MBTI`, `학번`, `등록번호`, `실무담당자` 문자열이 없다(파일 검사, 빌드 전에도 돈다).
- [ ] **Step 8: `npm test` 통과 확인**(임시 홈만 있어도 content 스키마 검증은 빌드에서 돈다).
- [ ] **Step 9: Commit** `feat(content): import sheets and MPBEL patents/seminars into content collections` (생성된 `src/content/**` 포함, `data/`는 포함되지 않음을 `git status`로 확인)

### Task 6: 집계·정렬·조회 헬퍼

**Files:**
- Create: `src/lib/content.ts`, `src/lib/people.ts`, `src/lib/years.ts`, `tests/unit/years.test.ts`, `tests/unit/people.test.ts`, `tests/unit/content.test.ts`

**Interfaces:**
- Produces(`years.ts`): `YEARS = [2016..2026]`, `LAB_START = 2016`, `isLabEra(year) = year >= 2016`. `yearStats(y, data) -> { papers: number, presentations: number, awards: number, joined: Member[], degrees: Member[], projectsRunning: Project[] }` — `data`는 `{ members, papers, presentations, awards, projects }` 배열(`astro:content` 엔트리의 `data`+`id`만 받는 순수 함수). 합류는 `joined`의 연도, 학위는 `degree.date`의 연도, 과제는 `start`연도 ≤ y ≤ `end`연도. `barHeights(values: number[], max = 134) -> number[]`(0은 2px, 최댓값 134px, 반올림). `labCounts(data) -> { members, degrees, papers, presentations, awards, projects }`(members는 role≠professor, papers는 `isLabEra`).
- Produces(`people.ts`): `itemsOf(slug, data) -> { papers, presentations, awards }`(각 `members`/`member`에 slug 포함), `displayName(member, locale) -> string`(ko: `name`, en: `name_en || name`), `field(entry, key, locale)`(`key_en`이 있으면 en에서 그것, 없으면 `key`).
- Produces(`content.ts`): `sortByYearDesc`, `groupByYear(items) -> Map<number, T[]>`(내림차순 키), `groupBy(items, key)`, `sortMembersByJoined(members, order: 'asc' | 'desc')`(`joined` 기준, 없는 사람은 어느 순서든 끝), `PAGE` 상수 없음(페이지네이션 없음).

- [ ] **Step 1: 실패하는 테스트.** `years.test`: 가짜 데이터로 `yearStats(2022)`의 각 수, 합류일 없는 구성원은 어느 해에도 없다(**Review Focus 1**), `barHeights([0, 25, 67])` → `[2, 50, 134]`, `labCounts`의 papers가 2015년 논문을 빼고 센다. `people.test`: `itemsOf`가 `members`에 든 논문만 모은다, `field({department:'의학과'}, 'department', 'en')==='의학과'`(영문 없으면 한글), `field({...,department_en:'Medicine'},…,'en')==='Medicine'`. `content.test`: `groupByYear` 키가 내림차순, `sortMembersByJoined(…, 'asc')`는 오래된 합류가 먼저이고 `joined` 없는 사람이 마지막, `'desc'`도 없는 사람이 마지막.
- [ ] **Step 2: 실패 확인.** → **Step 3: 구현.** → **Step 4: 통과 확인.**
- [ ] **Step 5: Commit** `feat(lib): year stats, people lookup, sorting helpers`

### Task 7: 공통 틀 — 상단 바, 푸터, 서브 레이아웃, 토큰, i18n

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/responsive.css`, `src/layouts/BaseLayout.astro`, `src/layouts/SubLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/Snb.astro`, `src/components/Breadcrumb.astro`, `src/lib/menu.ts`, `src/lib/locale.ts`, `src/i18n/ko.ts`, `src/i18n/en.ts`, `src/i18n/index.ts`, `tests/unit/menu.test.ts`, `tests/dist/chrome.test.mjs`, `tests/dist/css-order.test.mjs`
- Modify: `src/styles/global.css`(tokens → base → responsive 순 import), `src/pages/index.astro`, `src/pages/en/index.astro`(BaseLayout 사용)
- Copy: `../Website_20261028/public/images/site/main/visual.jpg`, `sub/sub_visual.jpg`, `sub/bgSnbTit.jpg`, `sub/home.png` → `public/images/site/`

**Interfaces:**
- Produces: `Locale = 'ko' | 'en'`; `localePath(path, locale)` → en이면 `/en` 접두(`url()` 전 단계); `otherLocaleHref(pathname)` — 현재 경로의 다른 언어판 주소(KR/EN 토글용, `/10th/en/people/students/` ↔ `/10th/people/students/`).
- Produces: `MENU: MenuSection[]` 6개(PEOPLE: students, alumni / PUBLICATION: papers, patents, presentations / AWARD: awards / PROJECT: projects / ACTIVITY: seminars, workshops / ARCHIVE: photos, comments), 각 항목 `{ key, href(사이트 루트 경로), label: { ko, en } }`; `sectionOf(pathname)`.
- Produces: `t(locale)` 문자열 묶음 — 메뉴 라벨, 게시판 제목, 표 머리글(이름, 영문 이름, 과정, 학과, 합류, 학위, 현 소속, 학회, 구분, 발표명, 부처, 사업, 기간, 참여율, 연구비), 빈 상태 문구(`"아직 기록이 없습니다. 추가하는 법은 README를 참고하세요."` / 영문), `기록 없음`, 연표 라벨(논문·학회 발표·수상·합류·학위 취득·막대 높이는 항목별 상대값), 푸터(이름·주소·전화는 MPBEL `i18n` 값 그대로, 저작권 연도 2026, `10th Anniversary Archive`), "메인 사이트로".
- Produces: `BaseLayout` props `{ title, locale, bodyClass? }`(폰트 링크, `<html lang>`, Header/Footer), `SubLayout` props `{ title, sectionKey, currentHref, locale, side?: 'menu' | 'years', currentYear? }`(250px 비주얼 띠에 텍스트 "10th Anniversary Archive", 240px 사이드: 메뉴 또는 연도 탭 줄, 900px 본문, 경로 표시). `Header`는 로고 이미지 + 라벨 "10th Anniversary Archive" + 6 메뉴 + KR/EN(현재 언어 채움).
- CSS: `tokens.css`에 DESIGN.md의 색·간격을 `--c-yonsei-navy` … `--s-xl` 변수로. `base.css`는 상단 바·드롭다운·푸터·사이드 메뉴·경로 표시·공통 표·연도 탭·버튼을 DESIGN.md 컴포넌트 값으로 새로 쓴다(MPBEL CSS를 통째로 복사하지 않고 필요한 선택자만 가져온다). **CSS 파일 안에는 이미지 경로를 쓰지 않는다**(`base`를 모른다). 배경 이미지는 컴포넌트에서 `style={`background-image:url(${url('/images/site/bgSnbTit.jpg')})`}`로, 그 밖은 `<img src={url(...)}>`로 넣는다. `responsive.css`는 DESIGN.md의 1024·600 규칙.

- [ ] **Step 1: 실패하는 단위 테스트** `menu.test`: 섹션 6개·항목 11개, 모든 href가 `/`로 시작하고 `/`로 끝남, `sectionOf('/publication/papers/').key==='publication'`, `otherLocaleHref('/10th/people/students/')==='/10th/en/people/students/'`와 역방향, `localePath('/years/2026/','en')==='/en/years/2026/'`.
- [ ] **Step 2: 실패 확인.** → **Step 3: `menu.ts`, `locale.ts`, i18n 구현.** → **Step 4: 통과 확인.**
- [ ] **Step 5: 토큰·CSS·레이아웃·컴포넌트 작성.** 임시 홈 두 개를 `BaseLayout`으로 감싸고 `SubLayout`을 쓰는 임시 페이지 하나(`src/pages/people/students.astro`, 본문 "준비 중")를 둔다.
- [ ] **Step 6: 빌드 결과 검사** `chrome.test`: 모든 HTML에 `.topmenu`(또는 정한 클래스) 안에 메뉴 링크 6개·`img[alt]` 로고·KR/EN 두 링크가 있고, KR/EN의 href가 서로의 언어판을 가리키며, `html[lang]`이 경로에 따라 `ko`/`en`이고, `#footer` 텍스트에 `10th Anniversary Archive`가 있다. `css-order.test`: 각 페이지의 첫 `<link rel="stylesheet">`가 global 번들(토큰 포함)이다(MPBEL 테스트 참고).
- [ ] **Step 7: `npm test` 통과. Chrome 헤드리스로 1440·390 캡처를 `.impeccable/review/chrome-1440.png`, `chrome-390.png`에 만들고 열어 본다**(메뉴 줄 겹침, 토글 위치, 햄버거).
- [ ] **Step 8: Commit** `feat(ui): layouts, header, footer, side nav, tokens and i18n`

### Task 8: 홈

**Files:**
- Create: `src/components/home/Hero.astro`, `Figures.astro`, `Intro.astro`, `Timeline.astro`, `YearPanel.astro`, `BoardLinks.astro`, `src/components/HomePage.astro`, `src/lib/year-panel-core.ts`, `src/scripts/year-panel.ts`, `src/styles/home.css`, `tests/unit/year-panel.test.ts`, `tests/dist/home.test.mjs`
- Modify: `src/pages/index.astro`, `src/pages/en/index.astro`(`<HomePage locale=… />`만)
- Reference: 스펙 5.3 1~7번, `.impeccable/surfaces/src-pages-index-astro.md`(FIRST VIEWPORT), `.impeccable/mocks/decision/sibling.html`·`spine.html`

**Interfaces:**
- Consumes: Task 6 `labCounts`, `yearStats`, `barHeights`, `YEARS`; Task 7 레이아웃·i18n.
- Produces: `resolveYear(hash: string, years: number[], fallback: number) -> number` — `'#y2024'` → 2024, 목록에 없거나 형식이 다르면 `fallback`(**Review Focus 5**). `year-panel.ts`: 연표 링크 `a[data-year]` 클릭 → `preventDefault`, `.year-panel[hidden]` 토글, `history.replaceState`로 `#y<년>`; 로드 때 `resolveYear(location.hash, …)`. JS 없으면 링크가 연도 페이지로 간다.
- DOM 계약(빌드 결과 검사가 본다): 숫자 칸 `.figures a[data-count]` 6개(`data-count`가 숫자), 연표 `.timeline a[data-year]` 11개(2016→2026 순), 패널 `.year-panel[data-year]` 11개 중 `hidden` 없는 것 하나(2026), 바로가기 `.board-links a` 11개(각각 메뉴 href, 글자는 `게시판 이름 n`으로 건수 포함: `논문 217`, `사진 0`), 패널마다 `a.more[href*="/years/"]`(연도 페이지로), 히어로 `h1` 텍스트가 `home.md`의 `slogan`, 히어로 `img[src$="visual.jpg"]`.

- [ ] **Step 1: 실패하는 단위 테스트** `year-panel.test`: `resolveYear('#y2024', YEARS, 2026)===2024`, `'#y1999'`→2026, `'#2024'`→2026, `''`→2026.
- [ ] **Step 2: 실패 확인.** → **Step 3: `year-panel-core.ts` 구현.** → **Step 4: 통과 확인.**
- [ ] **Step 5: 컴포넌트와 `home.css` 작성.** 치수는 디자인 계약 FIRST VIEWPORT와 스펙 5.3을 따른다: 비주얼 띠 570px, 슬로건 x=50/y=165, 제목 42px, 숫자 칸 600px 3열(Mist, Hairline 격자, 34px Yonsei Navy), 소개 550px, 연표 11칸(막대 폭 14px, 최대 134px, 색 Cobalt/Cerulean/Yonsei Navy), 합류 이름 최대 4명 + `+n`, 학위 칩 Yonsei Navy, 패널 Panel Gray 3열(논문 최대 5편), 바로가기 4열 70px 칸. 모바일: 연표는 한 해가 한 행(연도 왼쪽, 가로 막대, 이름 오른쪽), 숫자 칸 3열→2열, 바로가기 2열→1열.
- [ ] **Step 6: 빌드 결과 검사** `home.test.mjs`(ko·en 둘 다): 위 DOM 계약 전부 + `data-count` 값이 `src/content` 파일 수로 센 값과 같음(members role≠professor 61, degree.date 있는 사람 13, papers year≥2016 162, presentations 379, awards 41, projects 15 — 파일을 직접 세어 비교) + 연표 2024 칸의 합류 이름이 4개와 `+8` + 패널 2026의 논문이 5편 이하 + 페이지 어디에도 `/images/` 로 시작하는 `src`가 없음(모두 `/10th/images/`).
- [ ] **Step 7: `npm test` 통과. 1440·390 캡처 `.impeccable/review/home-1440.png`, `home-390.png`를 만들어 열고, 첫 화면이 계약과 맞는지(슬로건 위치, 숫자 칸, 연표 상단 선이 900px 안에 걸치는지) 본다. 어긋나면 고치고 한 번 더 캡처.**
- [ ] **Step 8: Commit** `feat(home): hero, figures, eleven-year timeline, year panels, board links`

### Task 9: 연도 페이지

**Files:**
- Create: `src/components/YearTabs.astro`, `src/components/YearPage.astro`, `src/pages/years/[year].astro`, `src/pages/years/index.astro`(최신 연도로 `<meta http-equiv="refresh">`가 아니라 Astro `redirect`), `src/pages/en/years/[year].astro`, `src/pages/en/years/index.astro`, `tests/dist/years.test.mjs`
- Modify: `src/layouts/SubLayout.astro`(`side: 'years'`가 `YearTabs`를 그림)

**Interfaces:**
- Consumes: `yearStats`, `groupBy`(발표를 `conference`로), `itemsOf` 아님. `getStaticPaths`는 `YEARS`.
- DOM 계약: `.year-tabs a` 11개(현재 해 `.on`), 요약 줄 `.year-summary`, 구역 7개(`section[data-part]`: joined, degrees, papers, presentations, awards, projects, seminars) 각각 제목 포함, 빈 구역은 `.empty` 텍스트 `기록 없음`/`No records`, 발표 구역은 `h3`가 학회명.

- [ ] **Step 1: 실패하는 빌드 결과 검사** `years.test.mjs`: `years/2016/`~`years/2026/`·`en/years/…` 22쪽 존재, `years/index.html`이 2026으로 리다이렉트, 2016 페이지의 `data-part="presentations"`가 `.empty`, 2022 페이지 `data-part="degrees"`에 이름 4개, 2025 페이지 발표 구역의 `h3` 수 ≥ 2, 경로 표시에 `2022`.
- [ ] **Step 2: 빌드해 실패 확인.** → **Step 3: 구현.** → **Step 4: `npm test` 통과.**
- [ ] **Step 5: Commit** `feat(years): per-year pages with year tab rail`

### Task 10: 사람 — 학생 현황, 졸업 현황, 개인 페이지

**Files:**
- Create: `src/components/people/ProfessorRow.astro`, `MemberCard.astro`, `AlumniTable.astro`, `FormerList.astro`, `StudentsPage.astro`, `AlumniPage.astro`, `PersonPage.astro`, `src/pages/people/students.astro`, `alumni.astro`, `[slug].astro`, 같은 셋을 `src/pages/en/people/`, `src/styles/people.css`, `tests/dist/people.test.mjs`
- Modify: `src/pages/people/students.astro`(Task 7 임시 → 실제)

**Interfaces:**
- Consumes: `sortMembersByJoined`, `itemsOf`, `displayName`, `field`.
- 규칙: 학생 현황 = 교수진 구역(`role==='professor'`를 `order`순, 첫 사람에 `link`) + `role==='student'` 카드(합류 오래된 순, `sortMembersByJoined(…, 'asc')`). 카드 필드: 이름(개인 페이지 링크)·영문 이름, 과정, 학과·전공, 합류 `YYYY.MM`(없으면 `합류 연도 미상`/`Joined: unknown`, **Review Focus 1**), ORCID 아이콘 링크(`https://orcid.org/<id>`, 값 있을 때만), `논문 n · 발표 n · 수상 n`. 졸업 현황 = `role==='alumni'` 표(취득일 내림차순) + `role==='former'` 목록(합류 내림차순). 개인 페이지 = `role!=='professor'` 전원(`getStaticPaths`), 머리에 이름·역할·과정·학과·합류·학위·현 소속(졸업생)·ORCID, 아래 논문(1저자 굵게)·발표·수상 목록, 안내 한 줄 "논문은 1저자·공동 1저자·교신저자인 것만 모았습니다".
- DOM 계약: `.professors li` 8개(첫 li에 `a[href*="ympbel.github.io/member/professor"]`), `.member-card` 23개, `.alumni-table tbody tr` 13개, `.former-list li` 26개, 개인 페이지 61쪽(ko), `a[href^="https://orcid.org/"]`는 `orcid` 있는 카드에만.

- [ ] **Step 1: 실패하는 빌드 결과 검사** `people.test.mjs`: 위 DOM 계약 + 영문 학생 페이지에서 학과가 한글 그대로이고 그 요소에 `lang="ko"` + 합류일 없는 구성원 카드에 `합류 연도 미상` 텍스트(해당 slug는 `src/content/members`에서 `joined`가 없는 파일로 찾는다).
- [ ] **Step 2: 빌드해 실패 확인.** → **Step 3: 구현.** → **Step 4: `npm test` 통과.**
- [ ] **Step 5: 1440·390 캡처(학생 현황, 개인 페이지 하나) 확인.** → **Step 6: Commit** `feat(people): students with professors, alumni in two groups, person pages`

### Task 11: 출판 — 논문, 특허, 발표

**Files:**
- Create: `src/components/pub/YearIndex.astro`(연도 링크 줄), `PaperList.astro`, `PatentList.astro`, `PresentationList.astro`, `PapersPage.astro`, `PatentsPage.astro`, `PresentationsPage.astro`, 라우트 `src/pages/publication/{papers,patents,presentations}.astro` + `en/`, `src/styles/pub.css`, `tests/dist/publication.test.mjs`

**Interfaces:**
- Consumes: `groupByYear`, `isLabEra`, `groupBy(…, 'conference')`, `displayName`.
- 규칙: 논문은 연도 제목(24px 700 + Graphite 3px 선) 아래 번호·굵은 제목·저자 줄(`first_author` 굵게, `co_first` 괄호, `교신: …`; `members`에 있는 사람은 개인 페이지 링크)·학술지·`IF n`; 2016 이후 끝난 뒤 `section#pre-lab` "연구실 이전 (2002–2015)"에 55편; 상단 안내문 한 줄에 게시판 전체 217편과 홈 집계 162편이 다른 이유. 발표는 연도 → 학회(`h3`) → 항목(제목, 전체 저자, 형태 칩). 특허는 MPBEL 형식.
- DOM 계약: papers `.pub-year` 2016–2026 11개 + `#pre-lab` 안 `.pub-item` 55개, 전체 `.pub-item` 217; presentations `.pub-item` 379, 2025 연도 아래 `h3` ≥ 2; patents `.pub-item` 7; 저자 줄에서 구성원 링크는 `a[href*="/people/"]`.

- [ ] **Step 1: 실패하는 빌드 결과 검사** `publication.test.mjs`: 위 계약 + 영문 논문 페이지도 217편.
- [ ] **Step 2: 실패 확인.** → **Step 3: 구현.** → **Step 4: `npm test` 통과.** → **Step 5: 캡처 확인(논문 1440).** → **Step 6: Commit** `feat(publication): papers with pre-lab section, patents, presentations grouped by conference`

### Task 12: 수상(+챌린지), 과제(+관련 논문), 세미나

**Files:**
- Create: `src/components/AwardsPage.astro`, `ProjectsPage.astro`, `SeminarsPage.astro`, 라우트 `src/pages/awards.astro`, `projects.astro`, `activity/seminars.astro` + `en/`, `src/styles/boards.css`, `tests/dist/boards.test.mjs`

**Interfaces:**
- 규칙: 수상 = 연도별 표(수상자(링크), 학회, 구분, 발표명) + `section#challenges` 표 5행(주최, 제목, 목적, 링크). 과제 = `start` 내림차순 목록, 항목에 과제명(`field(…,'title',locale)`), 부처·사업, 기관, 역할, 기간 `YYYY.MM – YYYY.MM (n개월)`, 참여율, 연구비 `n천원`(천 단위 구분 쉼표), 사사 `<details>`, `projects`에 이 slug가 든 논문이 있으면 `<details>` "관련 논문 n편". 세미나 = 연도 탭 + 연도별 표(날짜, 제목(`source_url`로 `target="_blank" rel="noopener"`), 발표자) + 안내문 "세미나 본문은 MPBEL 사이트 세미나 게시판에 있습니다."
- DOM 계약: awards `tbody tr` 41 + `#challenges tbody tr` 5; projects `.project` 15, 연구비 텍스트에 `천원`; seminars `tbody tr` 431, 모든 제목 링크가 `https://ympbel.github.io/notice/seminar/`로 시작.

- [ ] **Step 1: 실패하는 빌드 결과 검사** `boards.test.mjs`: 위 계약 + 과제 중 `projects.json` 연결이 하나라도 있으면 "관련 논문" `<details>`가 그 과제에 있고, 연결이 없는 과제에는 없다.
- [ ] **Step 2: 실패 확인.** → **Step 3: 구현.** → **Step 4: `npm test` 통과.** → **Step 5: Commit** `feat(boards): awards with challenges, projects with related papers, seminars linking to main site`

### Task 13: 빈 게시판 — 워크샵, 사진, comments

**Files:**
- Create: `src/components/EmptyState.astro`, `WorkshopsPage.astro`, `PhotosPage.astro`, `CommentsPage.astro`, 라우트 `src/pages/activity/workshops.astro`, `archive/photos/index.astro`, `archive/photos/[year].astro`, `archive/photos/k/[kind].astro`, `archive/comments.astro` + `en/`, `tests/dist/empty-boards.test.mjs`, `tests/unit/empty-collections.test.ts`

**Interfaces:**
- 규칙: 컬렉션이 비면 `EmptyState`(i18n 빈 상태 문구 + 항목 형식 설명 + README 링크). 사진은 항목이 있을 때만 연도 탭·종류 탭·4열 격자(`photoSchema.kind` 라벨은 i18n), `[year].astro`·`[kind].astro`의 `getStaticPaths`는 실제 값만 만들고 비면 **경로 0개**(빌드 실패 아님, **Review Focus 4**). comments는 날짜 내림차순 글 + 하단 `section#how-to-leave`(내용은 "방식 미정" 한 줄).
- DOM 계약: 세 게시판 모두 `.empty-state` 존재(현재 콘텐츠 없음), `archive/photos/index.html` 존재, 연도·종류 하위 페이지는 없음.

- [ ] **Step 1: 실패하는 테스트.** `empty-collections.test.ts`: 템플릿만 있는 폴더를 `glob` 패턴으로 걸렀을 때 0개(패턴 함수를 `content.config.ts`에서 분리해 테스트). `empty-boards.test.mjs`: 위 DOM 계약.
- [ ] **Step 2: 실패 확인.** → **Step 3: 구현.** → **Step 4: `npm test` 통과.** → **Step 5: Commit** `feat(boards): workshops, photos, comments with empty states and templates`

### Task 14: 404, README, 운영 문서, CLAUDE.md 갱신

**Files:**
- Create: `src/pages/404.astro`, `README.md`
- Modify: `CLAUDE.md`(저장소 상태를 "구현됨"으로; 작업 규칙 유지), `scripts/import/README.md`(이미 있으면 보강), `tests/dist/pages.test.mjs`(전체 페이지 목록 존재 검사: 홈 2, 연도 22, 게시판 11×2, 개인 61×2, 404)

**Interfaces:**
- README(한글) 구성: 사이트 개요와 주소, 로컬 실행, **항목 추가하는 법**(논문·발표·수상·과제·구성원·졸업 전환·워크샵·사진·comments 각각 템플릿 복사 → 필드 → 커밋), **별칭(`aliases`) 추가와 과제 대응표(`projects.json`) 채우는 법과 `--force --only members,projects` 재실행**, 영문 필드(`*_en`) 채우기, 임시 문구(`home.md`) 확정, `data/`는 저장소 밖 보관, 도메인 전환 때 `site`만 변경, 테스트와 배포.

- [ ] **Step 1: 실패하는 검사** `pages.test.mjs` 작성 → 빌드 → 404 없음으로 실패 확인.
- [ ] **Step 2: 404 페이지(BaseLayout, 홈 링크), README, CLAUDE.md 작성.** → **Step 3: `npm test` 통과.**
- [ ] **Step 4: Commit** `docs: README operations guide, 404 page, project CLAUDE.md`

### Task 15: 디자인 검출기와 마무리 리뷰 (impeccable)

**Files:**
- Create: `.impeccable/review/desktop.png`, `.impeccable/review/mobile.png`(홈 1440·390 전체 페이지), 보조 캡처 `students-1440.png`, `papers-1440.png`, `year-1440.png`, `home-390.png`
- Modify: 리뷰가 지적한 소스

- [ ] **Step 1: 검출기.** Run: `"/Users/yongdo/.claude/plugins/cache/impeccable/impeccable/4.8.0/skills/impeccable/scripts/impeccable" detect --json src/` → 기계적인 지적(그라데이션 자리표시, 둥근 모서리, 토큰 밖 색)을 고친다. 결과 JSON은 `.impeccable/review/detect.json`에 둔다.
- [ ] **Step 2: 캡처.** `npm run build && npm run preview`를 띄우고 Chrome 헤드리스로 `http://localhost:4321/10th/`(1440 전체 페이지, 390 전체 페이지)와 학생 현황·논문·2022 연도 페이지(1440)를 `.impeccable/review/`에 캡처. 캡처마다 열어 빈 영역·잘림이 없는지 확인.
- [ ] **Step 3: 마무리 리뷰.** 메인 세션이 `impeccable-finish-reviewer` 서브에이전트를 새로 띄운다. 입력: 원래 요청과 확정 답변(PRODUCT.md), 홈 디자인 계약 `.impeccable/surfaces/src-pages-index-astro.md`, 캡처 경로, `detect.json`, `DESIGN.md`, craft-floor 참조 경로(`.../skills/impeccable/reference/craft-floor.md`), "code-led, 승인 comp 없음, 결정 스케치 `.impeccable/mocks/decision/sibling.html`·`spine.html`이 critique reference". 판정이 `fix`면 지적을 한 번에 고치고 같은 뷰포트를 다시 캡처해 verdict pass를 받는다. `ship`이면 끝. `rebuild`면 사용자에게 알린다.
- [ ] **Step 4: `npm test` 통과 후 Commit** `style: apply finish review fixes`

### Task 16: 변환 결과 보고서 정리 (사용자 확인 자료)

**Files:**
- Modify: `scripts/import/report.md`(재생성), `scripts/import/projects.json`, `src/content/members/*.md`(`aliases` 추가는 사용자 답변 뒤)

- [ ] **Step 1: `report.md`를 다시 만들고**(`--check`), 사용자가 읽을 요약을 맨 위에 쓴다: 컬렉션별 건수와 기대값 대조, 별칭 후보 표(저자 표기 → 후보 구성원), 미연결 저자 수, 과제 미해결 값 목록(`중견`, `스위스` 등과 각 값이 붙은 논문 수), 날짜 누락 목록(slug + 열), 건너뛴 행.
- [ ] **Step 2: 메인 세션이 사용자에게 `report.md` 요약과 `.impeccable/review/` 캡처를 보여 주고 답을 받는다**(별칭 확정, 과제 대응표, 공개 승인). **이 단계는 사용자 답 없이는 넘어가지 않는다.**
- [ ] **Step 3: 답을 반영.** `projects.json`과 해당 구성원의 `aliases`를 채우고 `python3 scripts/import/run.py … --force --only members,papers,presentations,awards --check` 로 연결 필드를 다시 쓴다(수동 편집한 다른 필드가 있다면 그 파일은 `--only`에서 빼고 손으로 고친다). `npm test` 통과.
- [ ] **Step 4: Commit** `content: aliases and project mapping confirmed by the lab`

### Task 17: 원격 저장소, Pages, 첫 배포

**Files:** 없음(설정 작업). Reference: `docs/build-guide.md` 3·5장

- [ ] **Step 1(사용자 확인 뒤에만):** `gh repo create ympbel/10th --public --description "MPBEL 10th Anniversary Archive"`, `git remote add origin https://github.com/ympbel/10th.git`.
- [ ] **Step 2:** `gh api -X POST repos/ympbel/10th/pages -f build_type=workflow`; 빈 저장소라 거부되면 Step 3 뒤 다시 실행하고 `gh run rerun`. `gh api repos/ympbel/10th/pages --jq .build_type` → `workflow`.
- [ ] **Step 3:** `git push -u origin main`; `gh run watch $(gh run list --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status`.
- [ ] **Step 4:** `curl -I https://ympbel.github.io/10th/` → `HTTP/2 200`; `curl -s https://ympbel.github.io/10th/ | grep -c '/10th/'` > 0; 브라우저에서 홈·학생 현황·연도 페이지·영문 홈을 연다. `https://ympbel.github.io/`(메인 사이트)가 그대로인지도 연다.
- [ ] **Step 5:** README의 주소와 배포 상태 확인 문장을 점검하고 필요하면 Commit·push `docs: confirm live URL`.
