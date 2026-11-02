# MPBEL 10주년 아카이브 (`10th`)

연세 의학물리 및 의공학 연구실(MPBEL)의 10년(2016–2026)을 연도와 사람으로 엮은 기록 사이트의 소스입니다. 이 문서는 사이트를 운영하는 사람을 위한 안내서입니다. 항목 추가, 구성원 관리, 사람 연결, 영문 값, 배포, 도메인 전환을 다룹니다.

- 주소: https://ympbel.github.io/10th/ (메인 사이트가 `mpbel.yonsei.ac.kr`로 옮겨 가면 https://mpbel.yonsei.ac.kr/10th/ , 11장)
- 저장소: https://github.com/ympbel/10th (브랜치 `main`)
- 메인 사이트: https://ympbel.github.io/ (별도 저장소. 이 사이트는 메인 사이트를 보완할 뿐 대체하지 않습니다)
- 사이트의 목적, 독자, 공개 범위: [`PRODUCT.md`](PRODUCT.md). 시각 규칙: [`DESIGN.md`](DESIGN.md). 설계: [`docs/superpowers/specs/2026-11-02-mpbel-10th-design.md`](docs/superpowers/specs/2026-11-02-mpbel-10th-design.md)
- 변환 스크립트: [`scripts/import/README.md`](scripts/import/README.md)

## 1. 사이트 개요와 폴더 구조

[Astro](https://astro.build/) 정적 사이트입니다. 연구실 운영 구글 시트 7장과 메인 사이트의 특허·세미나를 **한 번** 변환해 `src/content/`의 마크다운 파일로 옮겼고, 그 뒤로는 파일을 직접 고칩니다. 시트와 동기화하는 장치는 없습니다. 항목 하나(논문 한 편, 구성원 한 명)가 파일 하나입니다. 한국어 페이지는 `/10th/` 아래, 영어 페이지는 `/10th/en/` 아래에 같은 구조로 만들어집니다. `main`에 push하면 GitHub Actions가 테스트하고 빌드해 GitHub Pages에 올립니다.

```
.
├── .github/workflows/deploy.yml   main에 push하면 테스트·빌드하고, 모두 통과하면 GitHub Pages에 배포
├── astro.config.mjs               사이트 주소(site)와 하위 경로(base: '/10th')
├── package.json                   npm 명령 (dev, build, test)
├── PRODUCT.md  DESIGN.md          사이트의 목적·공개 범위, 디자인 규칙
├── docs/                          설계(specs/), 구현 계획(plans/), build-guide.md
├── data/                          (git에 올리지 않음) 구글 시트 내보내기 원본. 9장
├── public/images/site/            로고, 비주얼 띠 사진, 아이콘 (메인 사이트에서 복사)
├── public/images/photos/<연도>/   사진 게시판의 사진 (첫 사진을 넣을 때 만드는 폴더)
├── reference/mpbel/               메인 사이트에서 복사한 참고용 설정. 빌드에 쓰이지 않음
├── scripts/import/                시트 변환 스크립트(Python), 학회 표기 통일표, 과제 대응표, report.md
├── src/
│   ├── content/                   ★ 사이트 내용. 대부분의 수정은 여기서 합니다 (3·4·5장)
│   │   ├── <컬렉션>/_template.md  컬렉션마다 템플릿 하나 (복사해서 씀)
│   │   ├── pages/ko/home.md, pages/en/home.md   홈 슬로건과 소개문 (8장)
│   │   └── schemas.ts             frontmatter 규칙 (필드 이름과 형식)
│   ├── content.config.ts          컬렉션 정의 (`_`로 시작하는 파일은 제외)
│   ├── i18n/ko.ts, en.ts          화면 문구 (메뉴, 제목, 표 머리글, 안내문)
│   ├── lib/                       url.ts(경로에 base 붙이기), 집계·정렬·사람 조회, 메뉴
│   ├── components/  layouts/      화면 조각과 공통 틀
│   ├── pages/                     주소별 페이지 (pages/en/은 영어판)
│   └── styles/                    tokens.css(디자인 토큰), global.css, 페이지별 CSS
└── tests/
    ├── unit/                      규칙 단위 테스트
    └── dist/                      빌드 결과(dist/) 검사
```

주소(`/10th` 뒤)와 내용:

| 주소 | 내용 |
|---|---|
| `/` | 홈. 숫자 여섯 칸, 열한 해 연표, 연도 패널, 게시판 건수는 컬렉션에서 자동으로 셉니다. 슬로건과 소개문만 `src/content/pages/ko/home.md` (8장) |
| `/years/2016/` … `/years/2026/` | 연도 페이지. 모든 컬렉션에서 그 해의 항목을 모읍니다. `/years/`는 2026으로 넘어갑니다 |
| `/people/students/`, `/people/alumni/` | `members/` (`role`에 따라 나뉨, 5장) |
| `/people/<파일 이름>/` | 개인 페이지. `members/<파일 이름>.md`와 그 파일 이름이 적힌 항목들 (6장) |
| `/publication/papers/`, `/publication/patents/`, `/publication/presentations/` | `papers/`, `patents/`, `presentations/` |
| `/awards/` | `awards/`, 아래 "챌린지 참가" 구역은 `challenges/` |
| `/projects/` | `projects/`. "관련 논문"은 논문 파일의 `projects` |
| `/activity/seminars/`, `/activity/workshops/` | `seminars/`, `workshops/` |
| `/archive/photos/`, `/archive/comments/` | `photos/`, `comments/` |
| `/404.html` | 없는 주소에 나오는 페이지 (한국어·영어 함께) |

영어 페이지는 같은 주소 앞에 `/en`을 붙인 곳입니다(`/en/people/students/`). 연도 페이지와 홈 연표는 2016–2026 열한 해로 고정되어 있습니다(`src/lib/years.ts`). 게시판에는 그 밖의 연도도 나옵니다.

## 2. 로컬 실행

Node.js 24 이상을 씁니다(`.nvmrc`, GitHub Actions도 24). 저장소 폴더에서:

```bash
npm install     # 처음 한 번, 또는 package.json이 바뀌었을 때
npm run dev     # http://localhost:4321/10th/ 에서 미리보기. 파일을 고치면 바로 반영됩니다
npm test        # 단위 테스트 → 빌드(dist/) → 빌드 결과 검사
```

- 사이트는 하위 경로에 있으므로 `http://localhost:4321/`이 아니라 `http://localhost:4321/10th/`을 엽니다. 앞의 주소는 404입니다.
- `npx astro sync`: frontmatter만 1초 안에 검사합니다. 파일을 고친 뒤 오타를 빨리 찾을 때 씁니다.
- `npm run build && npm run preview`: 배포될 결과(`dist/`)를 그대로 `http://localhost:4321/10th/`에 띄웁니다.
- `npm test`는 모든 테스트가 `fail 0`이어야 통과입니다. 실패하면 맨 아래 `failing tests:` 부분에 파일과 이유가 나옵니다.
- **무시해도 되는 경고.** 빌드와 `astro sync`는 `[WARN] [glob-loader] No files found matching "**/*.md,!**/_*.md" in directory "src/content/workshops"` 같은 줄을 세 번(workshops, photos, comments) 출력합니다. 처음 받은 저장소에서는 `[WARN] [content] The collection "workshops" does not exist or is empty.` 같은 경고도 나올 수 있습니다. 세 폴더에 템플릿만 있어서 생기는 경고이며, 사이트는 빈 게시판 안내를 보여 줍니다. 그 폴더에 첫 파일이 생기면 사라집니다.

## 3. 내용 파일의 공통 규칙

| 폴더 (`src/content/…`) | 게시판 | 새 파일 이름 (템플릿에 적힌 규칙) |
|---|---|---|
| `members/` | 학생 현황, 졸업 현황, 개인 페이지 | 영문 이름 `gildong-hong.md` (개인 페이지 주소가 됨) |
| `papers/` | 논문 | `2026-gildong-hong-deep-learning-based.md` (연도-1저자-제목 앞 세 단어) |
| `presentations/` | 발표 | 논문과 같은 규칙 |
| `awards/` | 수상 | `2026-award-42.md` |
| `challenges/` | 수상 아래 챌린지 참가 | `2026-aapm-5.md` |
| `projects/` | 과제 | `project-16.md` |
| `patents/` | 특허 | `2026-test-apparatus.md` |
| `seminars/` | 세미나 | 메인 사이트 세미나 글과 같은 이름 `2026-03-02-480.md` |
| `workshops/` | 워크샵 | `2026-02-20-winter-workshop.md` |
| `photos/` | 사진 | 사진 파일과 같은 이름 `2026-lab-meeting-01.md` |
| `comments/` | Comments | `2026-11-02-gildong-hong.md` |
| `pages/ko/`, `pages/en/` | 홈 문구 | `home.md` 하나씩 (새로 만들지 않음) |

파일 이름은 영문 소문자, 숫자, `-`만 씁니다. 구성원 파일을 빼면 파일 이름은 주소에 쓰이지 않으므로 겹치지만 않으면 됩니다.

- **템플릿.** 폴더마다 있는 `_template.md`에 필드마다 설명이 있습니다. `_`로 시작하는 파일은 사이트에 나오지 않습니다. 템플릿의 `#` 주석 줄은 지워도 되고 남겨도 됩니다.
- **규칙에 없는 필드는 빌드를 멈춥니다.** 스키마(`src/content/schemas.ts`)가 엄격해서 필드 이름 오타도 실패합니다. 오류에는 컬렉션, 파일 이름, 필드가 나옵니다(`****`는 Astro의 표시 방식이며 무시합니다):
  ```
  [InvalidContentEntryDataError] papers → 2026-gildong-hong-deep-learning-based data does not match collection schema.
    ****: Unrecognized key: "jounral"
  ```
- **값 쓰는 법.** 글자는 큰따옴표로 감쌉니다(`title: "..."`, 안의 `"`는 `\"`). 연도와 숫자는 따옴표 없이 씁니다(`year: 2026`, `impact_factor: 3.2`). 날짜는 `"YYYY-MM-DD"`, 월만 알면 `"YYYY-MM"`입니다. 값이 없는 선택 필드는 줄을 지웁니다. `[필수]` 필드는 지우면 빌드가 실패합니다.
- **목록은 한 줄에 하나씩** `- "값"`으로 씁니다. 빈 목록은 `[]`입니다. `[a, b]`처럼 한 줄에 쓰는 목록은 구성원 파일에서 변환 스크립트가 읽지 못하므로(6장) 어디서나 줄마다 쓰는 형식으로 통일합니다.
  ```yaml
  members:
    - "gildong-hong"
    - "cheolsu-kim"
  ```
- **사람은 구성원 파일 이름으로 가리킵니다.** `src/content/members/gildong-hong.md`의 사람은 `"gildong-hong"`입니다. 논문·발표·워크샵은 `members`, 수상은 `member`(한 명), 사진은 `people`에 적습니다. 적힌 사람의 개인 페이지에 그 항목이 나오고, 이름이 개인 페이지 링크가 됩니다. 교수는 개인 페이지가 없으므로 적지 않습니다.
- **본문(워크샵, comments).** 두 번째 `---` 아래에 마크다운으로 씁니다. 사이트 안 링크는 `[학생 현황](/people/students/)`처럼 `/`로 시작해 쓰면 `/10th`가 자동으로 붙습니다. HTML 태그(`<a href="/people/students/">`)로 쓰면 붙지 않아 링크가 깨지고 `npm test`가 실패합니다. 마크다운 링크나 `https://`로 시작하는 주소를 씁니다.

**순서는 모두 같습니다.**

1. 그 폴더의 `_template.md`를 복사합니다.
   ```bash
   cp src/content/papers/_template.md src/content/papers/2026-gildong-hong-deep-learning-based.md
   ```
2. 값을 채우고 쓰지 않는 줄을 지웁니다.
3. `npx astro sync`로 형식을 확인하고, `npm run dev`로 화면을 봅니다.
4. `npm test` 후 commit, push 합니다(10장).

## 4. 항목 추가하는 법

필드 설명은 각 `_template.md`에 있습니다. 아래는 필드마다 화면 어디에 쓰이는지와 놓치기 쉬운 점입니다.

### 4.1 논문 (`papers/`)

1. `_template.md`를 `<연도>-<1저자 영문 이름>-<제목 앞 세 단어>.md`로 복사합니다.
2. 필수: `year`, `title`. 저자는 `first_author`(문자열 그대로), `co_first`, `corresponding`(목록), 그리고 `journal`, `impact_factor`, `link`를 채웁니다.
3. `members`에 1저자·공동 1저자·교신저자 중 구성원의 파일 이름을 적습니다. 새로 쓴 논문은 변환 스크립트가 연결하지 않으므로 직접 적어야 개인 페이지에 나옵니다.
4. `projects`에는 이 논문이 성과로 들어간 과제의 파일 이름(`project-03`)을 확실할 때만 적습니다. 과제 게시판의 "관련 논문"이 됩니다.
5. `order`는 같은 해 안의 순서입니다(작은 수가 위). 줄을 지우면 그 해 목록의 맨 끝에 놓입니다.

`year`가 2016보다 작으면 논문 게시판 아래 "연구실 이전 (2002–2015)" 구역에 나오고 홈의 논문 숫자에는 세지 않습니다. 홈 숫자, 연표, 연도 페이지, 개인 페이지의 집계는 빌드 때 저절로 바뀝니다.

### 4.2 학회 발표 (`presentations/`)

1. 논문과 같은 이름 규칙으로 `_template.md`를 복사합니다.
2. 필수: `year`, `title`, `conference`, `type`. `authors`는 전체 저자 문자열, `first_author`, `corresponding`.
3. `conference`는 기존 표기와 똑같이 씁니다(`"KSMP Spring"`, `"KSMP Fall"`, `"AAPM"`). 발표 게시판과 연도 페이지가 연도 안에서 이 값으로 묶습니다. 지금 쓰는 표기는 `scripts/import/conferences.json`의 오른쪽 값들입니다. `conference_raw`는 지웁니다(변환 때 원래 표기를 남기는 칸).
4. `type`은 `"Oral"`, `"Poster"`, `"ePoster"` 등이며 형태 칩으로 나옵니다.
5. `members`에 저자 중 구성원의 파일 이름을 적습니다. `order`는 논문과 같습니다.

### 4.3 수상 (`awards/`)과 챌린지 참가 (`challenges/`)

1. 수상: `_template.md`를 `<연도>-award-<번호>.md`로 복사합니다. 번호는 겹치지 않는 아무 숫자입니다.
2. 필수: `year`, `recipient`(한글 이름 그대로), `conference`, `category`(`"구연상"`, `"포스터상"` 등).
3. `member`에 수상자의 구성원 파일 이름을 적으면 수상자 이름이 개인 페이지 링크가 되고 그 사람의 수상 수에 들어갑니다.
4. `category_en`을 채우면 영어 페이지에 영문 구분이 나옵니다(7장). `title`은 수상한 발표 제목입니다.

챌린지 참가는 `challenges/_template.md`를 복사해 `year`, `host`, `title`, `objective`(표에는 한 줄), `link`를 채웁니다. 수상 게시판 맨 아래 구역에 나옵니다.

### 4.4 과제 (`projects/`)

1. `_template.md`를 `project-<번호>.md`로 복사합니다. 지금 `project-01`부터 `project-15`까지 있습니다.
2. 필수: `title`, `agency`(부처), `program`(사업), `institution`(수행기관), `role`(참여유형), `start`, `end`.
3. 연구비(`budget_year_krw_thousand`, `budget_total_krw_thousand`)는 천원 단위 숫자를 쉼표 없이 씁니다(160,000천원 → `160000`). 화면에도 천원 단위 그대로 나옵니다.
4. `title_en`을 채우면 영어 페이지에 영문 과제명이 나옵니다.

실무담당자, 3책5공 여부, 연구내용은 공개하지 않으므로 넣을 칸이 없습니다. 파일 이름은 논문의 `projects`가 가리키는 이름이라, 바꾸면 그 논문들도 고쳐야 합니다.

### 4.5 특허 (`patents/`)

1. `_template.md`를 `<연도>-<짧은 영문 제목>.md`로 복사합니다.
2. 필수: `year`, `title`. `authors`는 발명자 문자열, `link`는 특허 정보 주소.
3. `venue`는 `venue: |-` 다음 줄부터 두 칸 들여 한 줄씩 씁니다(`등록국가: 대한민국`, `등록번호: …`, `등록일: …`). 화면에도 줄마다 나옵니다. 이 칸만 따옴표 없이 씁니다.
4. `order`는 같은 해 안의 순서이며, 특허는 메인 사이트처럼 **큰 수가 위**입니다.

### 4.6 세미나 (`seminars/`)

세미나 본문과 사진은 메인 사이트 세미나 게시판에 있고, 이 사이트는 제목에서 그 글로 링크만 합니다. 메인 사이트에 새 세미나 글이 올라오면:

1. `_template.md`를 메인 사이트의 그 세미나 파일과 같은 이름으로 복사합니다(예: `2026-03-02-480.md`).
2. `title`(메인 사이트 글 제목 그대로), `date`(메인 사이트 게시일), `presenter`, `event_date`(세미나를 한 날, 모르면 줄을 지움)를 채웁니다.
3. `source_url`에 메인 사이트의 그 글 주소를 씁니다: `https://ympbel.github.io/notice/seminar/2026-03-02-480/` (끝이 파일 이름과 같음).

본문은 쓰지 않습니다. 써도 화면에 나오지 않습니다.

### 4.7 워크샵 (`workshops/`)

1. `_template.md`를 `<날짜>-<짧은 영문 이름>.md`로 복사합니다.
2. 필수: `title`, `date`(여러 날이면 첫날). `title_en`, `place`, `members`(참여 구성원)는 선택입니다.
3. 두 번째 `---` 아래에 워크샵 내용을 마크다운으로 씁니다(3장의 링크 규칙).

첫 워크샵 파일이 생기면 빈 게시판 안내 대신 날짜가 최근인 것부터 목록이 나옵니다.

### 4.8 사진 (`photos/`)

1. 사진 파일을 `public/images/photos/<연도>/`에 넣습니다(폴더가 없으면 만듭니다). 파일 이름은 영문 소문자, 숫자, `-`만 씁니다. 큰 사진은 줄여서 넣습니다.
   ```bash
   mkdir -p public/images/photos/2026
   cp ~/Downloads/lab-meeting-01.jpg public/images/photos/2026/
   cp src/content/photos/_template.md src/content/photos/2026-lab-meeting-01.md
   ```
2. `image`에 사진 경로를 `public` 없이, `/10th` 없이 씁니다: `image: "/images/photos/2026/lab-meeting-01.jpg"`. 사이트가 하위 경로를 붙입니다.
3. 필수: `year`, `kind`(`lab-meeting`, `conference`, `retreat`, `graduation`, `equipment`, `other` 중 하나). `people`(사진 속 구성원), `caption`, `date`는 선택입니다.

연도 탭(`/archive/photos/2026/`)과 종류 탭(`/archive/photos/k/lab-meeting/`) 페이지는 사진이 있는 연도·종류에만 저절로 생깁니다. 연도 페이지의 "사진" 구역에도 나옵니다. 경로가 틀리면 `npm test`의 링크 검사가 실패합니다.

### 4.9 Comments (`comments/`)

글을 받는 방식(폼, 댓글 위젯 등)은 아직 정하지 않았습니다(12장). 지금은 운영자가 받은 글을 파일로 옮겨 적습니다.

1. `_template.md`를 `<날짜>-<짧은 영문 이름>.md`로 복사합니다.
2. `name`(화면에 나오는 그대로, 예: `"홍길동 (2020년 석사 졸업)"`)과 `date`를 채웁니다.
3. 두 번째 `---` 아래에 남긴 글을 마크다운으로 옮깁니다. 연락처 같은 개인정보는 본문에도 쓰지 않습니다.

방식이 정해지면 Comments 페이지 아래 "남기는 법"(`src/i18n/ko.ts`, `en.ts`의 `comments` 문구)과 이 절을 고칩니다.

## 5. 구성원 (`members/`)

구성원 한 명(교수 포함)이 파일 하나이고, **파일 이름이 개인 페이지 주소**입니다(`gildong-hong.md` → `/people/gildong-hong/`). `role`이 어느 게시판에 나올지를 정합니다.

| `role` | 뜻 | 나오는 곳 |
|---|---|---|
| `student` | 현 학생 | 학생 현황 (합류일 순 카드), 개인 페이지 |
| `alumni` | 학위를 받은 졸업생 | 졸업 현황 위 "학위 취득자" 표, 개인 페이지 |
| `former` | 학위 없이 거쳐 간 구성원(수료·인턴·단기 등) | 졸업 현황 아래 "거쳐 간 구성원", 개인 페이지 |
| `professor` | 교수 | 학생 현황 맨 위 교수진 구역 (개인 페이지 없음) |

학위 취득자로 세는 기준은 `role`이 아니라 `degree.date`(학위 취득일)입니다. 홈의 "학위 취득" 숫자, 연도 페이지의 학위 구역, 졸업 현황 표가 이 값을 씁니다.

### 5.1 새 학생

1. `_template.md`를 영문 이름으로 복사합니다. `Gildong Hong` → `gildong-hong.md`. 이 이름은 나중에 바꾸기 번거로우니(5.5) 처음에 정합니다.
   ```bash
   cp src/content/members/_template.md src/content/members/gildong-hong.md
   ```
2. `role: "student"`, `name`, `name_en`, `program`, `department`, `major`, `joined`(연구실 첫 출근일), `degree`의 `start`, 있으면 `orcid`를 채웁니다. 졸업생용(`affiliation`, `position`)과 교수용(`order`, `link`) 줄, `left`, `degree`의 `date`·`type`·`type_en`은 지웁니다.
3. `aliases`에 논문·발표 저자란에 적힐 영문 표기를 모두 적습니다(6장).
4. 그 학생의 논문·발표·수상 파일의 `members`(`member`)에 파일 이름을 적습니다.

`joined`를 모르면 줄을 지웁니다. 카드에는 "합류 연도 미상"으로 나오고 연표의 합류 칸에는 세지 않습니다.

### 5.2 졸업 처리 (학생 → 졸업생)

파일을 옮기거나 이름을 바꾸지 않습니다. 같은 파일에서:

1. `role: "student"`를 `role: "alumni"`로 바꿉니다.
2. `degree`에 `date`(학위 취득일)와 `type`(`"공학석사"` 등), 있으면 `type_en`을 채웁니다.
3. `left`(떠난 날), `affiliation`(현 직장), `position`(직급)과 그 `_en`을 채웁니다.

주소는 그대로이고, 학생 현황에서 빠져 졸업 현황 표에 들어갑니다. 학위를 받고 연구실에 남아 있는 사람은 `role: "student"`로 두고 `degree.date`만 채웁니다(학생 현황과 졸업 현황 표에 함께 나옵니다).

### 5.3 학위 없이 떠난 구성원

`role: "former"`로 바꾸고 `left`를 채웁니다. 졸업 현황 아래 "거쳐 간 구성원"에 나옵니다.

### 5.4 교수

`role: "professor"`, `name`, `name_en`, `aliases`, `order`(교수진 구역 순서, 1부터)만 씁니다. `link`는 지도교수의 메인 사이트 교수 페이지 주소입니다. 교수는 개인 페이지가 없고 항목 파일의 `members`에도 적지 않습니다.

### 5.5 영문 이름이 없는 두 사람과 파일 이름 바꾸기

시트에 영문 이름이 없던 거쳐 간 구성원 두 명은 파일 이름이 `member-24.md`, `member-25.md`이고 주소도 `/people/member-24/`, `/people/member-25/`입니다. (교수 다섯 명도 `member-65`~`member-69`이지만 개인 페이지가 없어 주소와는 상관없습니다.)

- `name_en`을 채우면 영어 페이지에 영문 이름이 나옵니다. **주소는 바뀌지 않습니다.**
- 주소를 바꾸려면 파일 이름을 바꾸고, 그 이름을 적은 모든 항목을 함께 고칩니다.
  ```bash
  git mv src/content/members/member-24.md src/content/members/gildong-hong.md
  grep -rln '"member-24"' src/content    # 이 파일들의 member-24를 gildong-hong으로 바꿈
  ```
  이후 구성원을 시트에서 다시 만들면(`--only members` 또는 `--only` 없이 `--force`) `member-24.md`가 다시 생깁니다. 그렇게 돌리지 않습니다(6장).

## 6. 사람 연결: 별칭(`aliases`)과 과제 대응표

**연결은 변환 때 한 번 정해 항목 파일에 적었습니다.** 빌드는 이름을 추측하지 않고 파일에 적힌 `members`(`member`, `people`)만 씁니다. 그래서 틀린 연결은 그 파일을 고치면 바로 고쳐집니다.

- 변환 스크립트는 논문의 1저자·공동 1저자·교신저자와 발표의 전체 저자를 구성원의 `name_en`과 `aliases`에 대조해, 정확히 맞을 때만 연결했습니다. 대소문자, 띄어쓰기, 마침표, 하이픈만 다른 표기는 같은 것으로 봅니다. 수상자는 한글 이름(`name`)과 대조했습니다.
- 가깝지만 다른 표기(`Yondo Yun` ↔ `Yongdo Yun`)는 연결하지 않고 `scripts/import/report.md`의 "별칭 후보"에 적었습니다. 후보 중에는 다른 사람도 있으니 확인한 것만 씁니다.
- 논문 시트의 "과제 이름" 값은 과제명·닉네임이 정확히 같을 때만 연결했고, 줄임말(`중견`, `스위스` 등)과 목록에 없는 과제명은 report.md의 "과제 미해결 값"에 적었습니다.

### 6.1 항목 하나만 고칠 때

그 항목 파일의 `members`에 구성원 파일 이름을 더하거나 뺍니다. 논문과 과제는 `projects`를 고칩니다. 가장 간단하고, 새로 쓴 항목은 이 방법뿐입니다.

### 6.2 별칭을 더하거나 과제 대응표를 채우고 다시 연결할 때

시트에서 온 논문·발표·수상 전체를 다시 연결합니다. **`data/`의 시트 내보내기가 이 컴퓨터에 있어야 합니다**(9장). `--mpbel`(메인 사이트 소스 폴더)은 이 명령에서는 읽지 않지만 옵션은 적어야 합니다.

1. 별칭: 구성원 파일의 `aliases`에 표기를 한 줄씩 더합니다.
   ```yaml
   aliases:
     - "Yongdo Yun"
     - "Yondo Yun"
   ```
2. 과제 대응표: `scripts/import/projects.json`에 `"시트에 적힌 값": "과제 파일 이름"`을 적습니다. 한 값은 과제 하나만 가리킵니다. 확실하지 않으면 적지 않습니다(틀린 연결은 "이 논문이 이 과제의 성과"라는 잘못된 주장이 됩니다).
   ```json
   {
     "중견": "project-03"
   }
   ```
3. 연결을 다시 씁니다. 구성원은 시트가 아니라 지금 있는 `src/content/members/*.md`(손으로 더한 `aliases` 포함)에서 읽습니다.
   ```bash
   python3 scripts/import/run.py --data data --mpbel ../Website_20261028/src/content --out src/content --force --only papers,presentations,awards --check
   ```
   건수 표(papers 217, presentations 379, awards 41, 모두 "맞음")가 나오고 종료 코드 0이면 됩니다. `report.md`도 새로 쓰입니다.
4. `git diff`로 바뀐 줄이 `members`·`projects`·`member`뿐인지 확인하고 `npm test` 후 commit 합니다.

**주의.**

- 이 명령은 시트에서 온 논문·발표·수상 파일 **전체를 시트 값으로 다시 씁니다.** 그 파일들에 손으로 고친 내용(제목 오타 수정, `link` 추가, 손으로 고친 `members`)이 있으면 사라집니다. 4번의 `git diff`에서 그런 줄이 보이면 되살립니다(`git checkout -p`).
- 시트에 없는 항목(운영자가 새로 쓴 파일)은 건드리지 않습니다. 그 파일들의 연결은 6.1처럼 직접 고칩니다. `--force`는 파일을 지우지도 않습니다.
- 구성원 파일은 위 형식대로 써야 읽힙니다. 목록은 줄마다 `- "값"`(빈 목록 `[]`만 한 줄), 여러 줄 글은 `|-`만 됩니다. `[a, b]`나 `>`를 쓰면 스크립트가 그 파일 이름과 함께 오류를 내고 멈춥니다.
- **구성원을 다시 만들지 않습니다.** `--only`에 `members`를 넣거나 `--only` 없이 `--force`로 돌리면 구성원 파일을 시트에서 다시 만듭니다. 이때 `aliases`만 이어 받고 나머지 손으로 고친 내용(지도교수의 `link`, 졸업 처리, `name_en` 등)은 모두 시트 값으로 돌아갑니다.
- `--force` 없이 돌리면 있는 파일은 그대로 두고 건수만 셉니다(표의 "그대로 둠"). 이때도 `report.md`는 새로 쓰입니다.

자세한 옵션은 [`scripts/import/README.md`](scripts/import/README.md)에 있습니다.

## 7. 영어 페이지

- 메뉴, 게시판 제목, 표 머리글, 안내문 같은 화면 문구는 `src/i18n/ko.ts`와 `en.ts`에 있습니다. 두 파일은 같은 모양이어야 합니다(`en.ts`의 타입이 `ko.ts`를 따릅니다).
- 데이터는 영어 페이지에서 `*_en` 필드가 있으면 그 값을, 없으면 한글 값을 그대로 보여 줍니다. 한글이 그대로 나오는 곳에는 `lang="ko"`가 저절로 붙습니다. 영문을 더하려면 같은 파일에 `_en` 필드를 채웁니다.

| 파일 | 한글 필드 → 영문 필드 |
|---|---|
| `members/` | `name` → `name_en`, `department` → `department_en`, `affiliation` → `affiliation_en`, `position` → `position_en`, `degree.type` → `degree.type_en` |
| `projects/` | `title` → `title_en` |
| `awards/` | `category` → `category_en` |
| `workshops/` | `title` → `title_en` |

- 과정(`program`)과 전공(`major`)은 영문 필드가 없어 영어 페이지에도 적힌 그대로 나옵니다.
- 논문·발표 제목, 학술지, 학회 이름은 두 언어에서 같습니다.
- 영어 홈의 슬로건과 소개문은 `src/content/pages/en/home.md`입니다(8장).

## 8. 홈 문구 확정

홈의 슬로건과 소개문은 **임시 문구**입니다. 설계 때 넣어 둔 것이고 연구실이 확정한 문구가 아닙니다.

- 한국어: `src/content/pages/ko/home.md`, 영어: `src/content/pages/en/home.md`
- `slogan`: 비주얼 띠의 큰 제목, `slogan_years`: 그 아래 연도 줄, `intro_title`: 소개 띠의 제목, `intro_heading`: 소개 띠의 소제목, 두 번째 `---` 아래 본문: 소개 단락

확정되면 값과 본문을 고치고 파일 맨 위의 "임시 문구" 주석 줄을 지웁니다. 숫자 여섯 칸과 연표는 내용 파일에서 저절로 세므로 고칠 것이 없습니다.

## 9. 원본 데이터(`data/`)와 개인정보

- `data/`는 연구실 운영 구글 시트 7장의 HTML 내보내기입니다. **전화번호, 이메일, 생년월일 같은 개인정보 열이 들어 있습니다.** `.gitignore`에 있어 commit되지 않지만, 저장소 밖(연구실 공유 드라이브 등)에 보관하고 `git add -f`로 올리지 않습니다. 저장소는 공개입니다.
- 변환은 한 번 했고 시트와 동기화하지 않습니다. 시트를 고쳐도 사이트는 바뀌지 않습니다. 이후 내용은 파일을 직접 고칩니다. `data/`가 다시 필요한 때는 6.2의 재연결뿐입니다.
- 공개 범위(`PRODUCT.md`): 전화번호, 이메일, 생년월일·나이, MBTI, 학번, 과학기술인등록번호, 과제 실무담당자, 행정 열(Jin's 과제 담당, 5공 유무, 수료여부), 과제 연구내용은 넣지 않습니다. 템플릿에 그런 칸이 없고, 넣으면 빌드가 실패합니다. 논문 IF, 과제 연구비·참여율, 졸업생의 현 직장·직급, ORCID는 공개합니다.
- `tests/dist/privacy.test.mjs`가 내용 파일과 빌드된 페이지에서 전화번호·이메일 패턴과 비공개 열 이름을 찾으면 실패합니다. 본문(워크샵, comments)에도 연락처를 쓰지 않습니다.

## 10. 테스트와 배포

### 테스트

`npm test`가 차례로 돌리는 것:

- `tests/unit/` (`npm run test:unit`): 경로에 `base` 붙이기(`url()`, 마크다운 플러그인), 템플릿 제외 규칙과 빈 컬렉션, 메뉴와 언어 경로, 정렬·집계·연도별 숫자, 사람 조회, 사진 탭, 홈 연도 패널.
- 빌드 (`npm run build`): frontmatter 오류가 여기서 걸립니다.
- `tests/dist/` (`npm run test:dist`): 모든 사이트 안 링크·이미지가 `/10th/`로 시작하고 실제 파일로 이어지는지, 상단 바·푸터·KR/EN 토글, CSS 순서, 개인정보 검사, 홈 숫자와 내용 파일 건수의 일치, 연도 페이지, 사람·출판·게시판·빈 게시판의 내용, 약속한 페이지가 모두 있는지(`pages.test.mjs`).

변환 스크립트는 따로 테스트합니다: `python3 -m unittest discover -s scripts/import/tests -t scripts/import`.

### 배포

```bash
npm test
git add -A
git commit -m "content: 2026 논문 추가"
git push origin main
```

push하면 GitHub Actions의 "Deploy to GitHub Pages" 워크플로가 `npm ci` → 단위 테스트 → 빌드 → 빌드 결과 검사를 하고, 모두 통과하면 GitHub Pages에 올립니다. **테스트가 하나라도 실패하면 배포하지 않으며**, 사이트는 이전 상태 그대로입니다. 진행 상황은 저장소의 Actions 탭 또는:

```bash
gh run list --workflow deploy.yml --limit 3
gh run view <번호> --log-failed     # 실패한 단계의 로그
```

실패 로그의 내용은 로컬 `npm test`와 같습니다. 파일을 고쳐 다시 push하면 됩니다. 올린 변경을 되돌리려면 `git revert <커밋>` 후 push합니다.

### 처음 한 번: 원격 저장소와 Pages

저장소를 처음 만들 때만 합니다. 무료 조직 플랜이라 push하는 순간 저장소와 사이트가 공개되므로, 그 전에 `scripts/import/report.md`(별칭 후보, 과제 미해결 값)와 화면을 연구실이 확인합니다(설계 5.10).

```bash
gh repo create ympbel/10th --public --description "MPBEL 10th Anniversary Archive"
git remote add origin https://github.com/ympbel/10th.git
gh api -X POST repos/ympbel/10th/pages -f build_type=workflow
gh api repos/ympbel/10th/pages --jq .build_type    # workflow 가 나와야 함
git push -u origin main
```

빈 저장소라서 `POST`가 거부되면 push한 뒤 다시 실행하고, 실패한 첫 배포는 `gh run rerun`으로 다시 돌립니다. 저장소 이름 `10th`는 메인 사이트의 최상위 경로(`en`, `introduction`, `member`, `notice`, `publication` 등)와 겹치지 않아야 해서 정한 이름입니다(`docs/build-guide.md` 3장).

## 11. 도메인 전환

메인 사이트가 `mpbel.yonsei.ac.kr`로 옮겨 가면 조직의 커스텀 도메인이 이 프로젝트 사이트에도 적용되어, 이 사이트는 **https://mpbel.yonsei.ac.kr/10th/** 가 됩니다. DNS와 GitHub 도메인 설정은 메인 사이트 쪽에서 합니다. 이 저장소에서는:

1. `astro.config.mjs`의 `site`만 바꿉니다.
   ```js
   site: 'https://mpbel.yonsei.ac.kr',
   ```
2. `base: '/10th'`는 그대로 둡니다. 경로는 바뀌지 않습니다.
3. `public/CNAME`은 만들지 않고, 이 저장소의 Pages 설정에도 도메인을 넣지 않습니다. 이 사이트에 따로 도메인을 걸면 `mpbel.yonsei.ac.kr/10th/` 아래에서 빠지고 `base`도 달라집니다.
4. `npm test` 후 commit, push 합니다.

세미나의 `source_url`(`https://ympbel.github.io/notice/seminar/…`)은 GitHub가 새 도메인으로 넘겨 주므로 고치지 않아도 열립니다.

## 12. 아직 정하지 않은 것

설계 문서 8장과 `PRODUCT.md`의 "미정 사항"에서 옮겼습니다. 정해지면 이 절과 해당 파일을 고칩니다.

- **Comments를 받는 방식** (Google Form 후 운영자 게시, giscus 등). 정해지면 Comments 페이지의 "남기는 법"과 4.9절이 바뀝니다.
- **워크샵·사진 자료.** 받으면 4.7·4.8절대로 넣습니다. 형식은 이미 있습니다.
- **영문 데이터 필드(`*_en`) 채우기.** 비어 있어도 사이트는 돕니다(7장).
- **슬로건·소개문 확정** (8장).
- **과제 대응표 채우기.** report.md의 "과제 미해결 값"을 `scripts/import/projects.json`에 적고 다시 연결합니다(6.2).
