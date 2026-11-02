# 새 사이트 구축 가이드

MPBEL 사이트를 만든 경험을 새 사이트 작업에 쓸 수 있게 정리한 문서입니다. 작성일은 2026-11-02입니다.

## 1. 확인된 환경 (2026-11-02 기준)

| 항목 | 값 |
|---|---|
| GitHub 로그인 | `yongdoyun` (`gh` 사용 가능, 권한 범위 `repo`, `workflow`, `read:org`, `gist`) |
| 조직 `ympbel`에서의 역할 | `admin`. 저장소를 직접 만들 수 있습니다. |
| 조직 플랜 | `free`. Pages를 쓰려면 저장소가 공개여야 합니다. |
| 조직의 기존 저장소 | `ympbel.github.io` 하나 (Pages `build_type`은 `workflow`) |
| MPBEL 사이트 커스텀 도메인 | 아직 없음. `mpbel.yonsei.ac.kr` 전환은 대기 중입니다. |
| 로컬 Node | v26.13.0 (CI는 Node 24) |

## 2. MPBEL 사이트를 만든 방법

그누보드5 사이트를 Astro 정적 사이트로 옮겼습니다. 2026-10-28에 1차를 완료했고 554쪽입니다. 테스트는 단위 21개, 빌드 결과 58개, 크롤러 92개입니다.

| 항목 | 선택 |
|---|---|
| 프레임워크 | Astro 7.4.2 |
| 콘텐츠 | `src/content/` 아래 마크다운. 항목 하나가 파일 하나입니다. |
| 콘텐츠 규칙 | `src/content/schemas.ts`의 엄격한 스키마. 필드 이름 오타는 빌드 실패로 이어집니다. |
| 테스트 | `node --test` 단위 테스트 + cheerio로 `dist/` 검사 |
| 배포 | `main` push → GitHub Actions: 단위 테스트 → 빌드 → 빌드 결과 검사 → 모두 통과하면 Pages 배포 |

디렉토리 구조:

```
.github/workflows/deploy.yml
astro.config.mjs
public/images/              그대로 복사되는 파일
src/content/                사이트 내용
src/content.config.ts       컬렉션 정의
src/lib/                    정렬, 메뉴 같은 규칙
src/components/  layouts/   화면 조각과 공통 틀
src/pages/                  주소별 페이지
src/styles/
tests/unit/                 규칙 단위 테스트
tests/dist/                 빌드 결과 검사
```

## 3. 시작 순서

1. **브레인스토밍과 설계.** 설계 문서를 `docs/superpowers/specs/YYYY-MM-DD-<주제>-design.md`에 쓰고, 승인 후 `superpowers:writing-plans`로 계획을 세웁니다.
2. **저장소 이름 결정.** 영문 소문자와 `-`만 씁니다. 아래 이름은 MPBEL 사이트의 최상위 경로와 겹치므로 쓰지 않습니다.
   - `en`, `introduction`, `lecture`, `member`, `notice`, `publication`, `research`, `images`, `_astro`
   - 목록은 작성일 기준입니다. MPBEL에 새 최상위 경로가 생겼을 수 있으니 `ls ../Website_20261028/src/pages ../Website_20261028/public`으로 다시 확인합니다.
3. **로컬 프로젝트 준비.** 이 폴더에서 `git init -b main`을 실행하고, `reference/mpbel/`을 참고해 설정 파일을 만듭니다. 복사한 뒤 다음을 바꿉니다.
   - `package.json`의 `name`
   - `astro.config.mjs`의 `site`와 `base` (4장), MPBEL 전용인 `i18n` 설정
   - `nvmrc.example` → `.nvmrc`, `gitignore.example` → `.gitignore`, `deploy.yml` → `.github/workflows/deploy.yml`
4. **원격 저장소와 Pages 설정.** 첫 push 전에 Pages를 `workflow`로 맞춥니다.
   ```bash
   gh repo create ympbel/<저장소이름> --public
   git remote add origin https://github.com/ympbel/<저장소이름>.git
   gh api -X POST repos/ympbel/<저장소이름>/pages -f build_type=workflow
   gh api repos/ympbel/<저장소이름>/pages --jq .build_type    # workflow 가 나와야 함
   ```
   빈 저장소라서 `POST`가 거부되면 먼저 push한 뒤 다시 실행합니다. 이 경우 첫 배포 실행은 실패할 수 있으니, 설정 후 `gh run rerun`으로 다시 돌립니다.
5. **첫 배포 확인.**
   ```bash
   git push -u origin main
   gh run watch $(gh run list --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status
   curl -I https://ympbel.github.io/<저장소이름>/    # HTTP/2 200
   ```

## 4. `base` 주의사항 (MPBEL에서 겪지 않은 문제)

MPBEL은 주소 맨 앞에서 서비스되어 `base`가 없습니다. 새 사이트는 `/<저장소이름>/` 아래에서 서비스되므로 아래 내용이 새로 필요합니다. 이 절의 코드는 예시이며 실제로 돌려 본 적은 없습니다.

```js
// astro.config.mjs
export default defineConfig({
  site: 'https://ympbel.github.io',
  base: '/<저장소이름>',
});
```

- **직접 쓴 경로에는 `base`가 붙지 않습니다.** Astro는 자신이 만드는 자산 경로에만 `base`를 붙입니다. MPBEL은 `/member/researchers/`처럼 `/`로 시작하는 경로를 곳곳에 직접 썼습니다(`src/lib/menu.ts`, 컴포넌트, 마크다운 본문). 그대로 복사하면 링크와 이미지가 `ympbel.github.io/member/...`로 나가 MPBEL 사이트를 가리키거나 404가 납니다.
- **컴포넌트와 메뉴:** 경로를 한곳의 함수로 감쌉니다.
  ```ts
  // src/lib/url.ts
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
  export const url = (path: string) => BASE + path;
  ```
- **마크다운 본문:** 함수를 쓸 수 없습니다. rehype 플러그인으로 `/`로 시작하는 `src`와 `href`에 `base`를 붙이는 방법을 먼저 검토합니다. 글을 쓰는 사람이 `base`를 신경 쓰지 않아도 되기 때문입니다.
- **링크 테스트를 그대로 쓰면 오류를 놓칩니다.** `dist/`는 `base` 폴더 없이 맨 위에 만들어집니다. 그래서 `reference/mpbel/tests-dist/links.test.mjs`를 그대로 쓰면 `base`가 빠진 잘못된 링크 `/about/`는 통과하고, 올바른 링크 `/<저장소이름>/about/`는 실패합니다. 다음과 같이 고칩니다.
  1. `/`로 시작하는 링크는 반드시 `/<저장소이름>/`로 시작해야 한다고 검사합니다.
  2. 그 앞부분을 뗀 경로로 `dist/`에서 파일을 찾습니다.
- **미리보기 주소:** `npm run dev`와 `npm run preview`는 `http://localhost:4321/<저장소이름>/`에서 열립니다.
- **도메인 전환의 영향:** GitHub 문서에 따르면 조직 사이트에 설정한 커스텀 도메인은 같은 계정의 프로젝트 사이트에도 적용됩니다. MPBEL이 `mpbel.yonsei.ac.kr`로 전환되면 새 사이트 주소는 `mpbel.yonsei.ac.kr/<저장소이름>/`이 됩니다. 전환 때 `site`를 `https://mpbel.yonsei.ac.kr`로 바꿉니다. `base`는 그대로 둡니다. 프로젝트 사이트에 자체 커스텀 도메인을 따로 설정하면 이 영향을 받지 않고, 그때는 `base`를 지웁니다.

## 5. 그대로 가져올 교훈

**배포**
- 테스트가 실패하면 배포되지 않게 합니다. `deploy.yml`이 그렇게 구성되어 있습니다.
- MPBEL에서는 Pages를 `workflow`로 바꾸기 전에 push해서 Jekyll 빌드가 첫 배포를 덮어쓴 적이 있습니다. 그래서 첫 push 전에 설정합니다.
- 도메인이 준비되기 전에 `public/CNAME`을 넣지 않습니다. 주소가 아직 연결되지 않은 도메인으로 넘어갑니다.

**Node와 테스트**
- 테스트 경로는 `node --test "tests/unit/**/*.test.ts"`처럼 따옴표로 감싼 glob으로 씁니다. Node 26에서 `node --test <폴더>`는 실패합니다.
- 링크 검사는 퍼센트 인코딩을 풀고 NFC로 정규화합니다. 한글 경로 때문입니다.

**콘텐츠**
- 항목 하나를 파일 하나로 둡니다. 두 사람이 같은 날 글을 올려도 충돌하지 않습니다.
- 스키마는 `.strict()`로 둡니다. 오타를 조용히 넘기지 않습니다.
- `_`로 시작하는 파일은 템플릿으로 쓰고 컬렉션에서 제외합니다.
- YAML은 따옴표 없는 날짜를 Date로, 연도를 숫자로 읽습니다. 스키마에서 문자열로 되돌립니다(`schemas.ts`의 `isoDate`, `category`).
- 마크다운 안의 HTML 블록에는 빈 줄이나 줄 앞 공백을 넣지 않습니다. 빈 줄에서 HTML 블록이 끝나고, 4칸 들여쓴 줄은 코드가 됩니다.

**CSS**
- `vite.build.cssTarget`을 설정합니다. 없으면 `@media (max-width: …)`가 `(width<=…)`로 출력되어, iOS 16.4와 Chrome 104 이전 브라우저에서 반응형 규칙이 통째로 무시됩니다.
- 페이지마다 다른 CSS를 불러온다면 공통 CSS를 레이아웃이 아니라 각 페이지 파일의 첫 번째 import로 둡니다. 레이아웃에서 불러오면 페이지 CSS보다 뒤로 밀립니다. MPBEL은 `tests/dist/css-order.test.mjs`로 이 순서를 검사합니다.

## 6. 작업 방식

- 순서: 브레인스토밍 → 설계 문서(빌더 검토 포함) → 사용자 승인 → 계획 → `superpowers:subagent-driven-development`
- 모델: 설계·계획·조율·리뷰는 Fable, 구현은 Opus, 범위가 좁은 재검토는 Sonnet
- 커밋은 구현 서브에이전트가 작업 단위로 하고, push는 메인 세션이 합니다.
- 진행 기록과 리뷰 자료는 `.superpowers/`에 둡니다. git에는 올리지 않습니다.

## 7. 참고 위치

**이 폴더 `reference/mpbel/` (복사본)**

| 파일 | 내용 |
|---|---|
| `deploy.yml` | 배포 워크플로 |
| `astro.config.mjs`, `package.json`, `tsconfig.json` | 프로젝트 설정 |
| `nvmrc.example`, `gitignore.example` | `.nvmrc`, `.gitignore` 원본 |
| `content.config.ts`, `schemas.ts` | 콘텐츠 컬렉션과 스키마 예시 |
| `tests-dist/helpers.mjs`, `tests-dist/links.test.mjs` | 빌드 결과 검사 예시 |
| `global-constraints.md` | MPBEL 구현 때 쓴 공통 제약 예시 |

**`../Website_20261028/` (원본, 읽기 전용)**

| 경로 | 내용 |
|---|---|
| `README.md` | 운영 안내서. 사용자용 README의 본보기입니다. |
| `docs/superpowers/specs/2026-10-28-mpbel-astro-site-design.md` | 설계 문서 본보기 |
| `docs/superpowers/plans/2026-10-28-mpbel-astro-site.md` | 구현 계획 본보기 |
| `.superpowers/archive/2026-10-28-mpbel-astro-site/` | 세션 기록. `SESSION-NOTES-2026-10-28.md`, `progress.md` |
| `src/components/`, `src/layouts/`, `tests/dist/` | 실제 구현 |
| `scripts/crawl/` | 옛 사이트 크롤러 (기존 사이트를 옮길 때만 필요) |
