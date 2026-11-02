# Website_20261102: MPBEL 10주년 아카이브 (저장소 `10th`)

`ympbel` GitHub 조직의 MPBEL 10주년(2016–2026) 기록 아카이브 사이트입니다. 2026-11-02에 MPBEL 사이트 작업 폴더(`../Website_20261028`)에서 넘어와 설계하고 구현했습니다.

## 지금 상태

- **구현됨.** Astro 7 정적 사이트, 로컬 git 브랜치 `main`. 원격 저장소는 아직 없습니다. 첫 push는 사용자가 변환 보고서와 화면을 확인한 뒤에만 합니다(설계 5.10, 계획 Task 16·17). 그 전에는 `git remote`를 만들지 않습니다.
- 있는 것: 홈, 연도 페이지 11개(+ `/years/` 리다이렉트), 게시판 11개, 개인 페이지 61개, 404. 모두 한국어(`/10th/…`)와 영어(`/10th/en/…`). 내용은 `src/content/`의 마크다운(구성원 61 + 교수 8, 논문 217, 발표 379, 수상 41, 챌린지 4, 과제 15, 특허 7, 세미나 431). 워크샵·사진·comments는 템플릿만 있는 빈 게시판입니다.
- 남은 계획: Task 15(impeccable 마무리 리뷰), 16(변환 보고서를 사용자와 확인하고 별칭·과제 대응표 반영), 17(원격 저장소, Pages, 첫 배포). `docs/superpowers/plans/2026-11-02-mpbel-10th-site.md`.
- 확인 명령:
  - `npm test`: 단위 테스트(`tests/unit/`) → 빌드 → 빌드 결과 검사(`tests/dist/`). `fail 0`이어야 합니다.
  - `python3 -m unittest discover -s scripts/import/tests -t scripts/import`: 변환 스크립트 테스트.
  - `npx astro sync`: frontmatter만 빠르게 검사.
  - 빌드의 `[WARN] [glob-loader] No files found … workshops/photos/comments` 세 줄(처음 받은 저장소에서는 `[content] … is empty` 경고도)은 빈 컬렉션 때문이며 정상입니다.

## 정해진 것 (사용자 결정, 다시 묻지 않기)

- 사이트: MPBEL 10주년 기록 아카이브. 게시판 11개(학생 현황, 졸업 현황, 논문, 특허, 발표, 수상, 과제, 세미나, 워크샵, comments, 사진). 기록 중심이되 외부 공개도 염두. 한·영 토글.
- 호스팅: GitHub Pages, 조직 `ympbel`, 저장소 이름 `10th`, `base: '/10th'`.
- 주소: `https://ympbel.github.io/10th/`. 메인 사이트가 `mpbel.yonsei.ac.kr`로 옮겨 가면 `https://mpbel.yonsei.ac.kr/10th/`가 되며, 그때 `astro.config.mjs`의 `site`만 바꿉니다. `base`는 그대로, `public/CNAME`은 두지 않습니다.
- 기술 스택: Astro + 마크다운(항목 하나 = 파일 하나, 스키마 `.strict()`). 변환 스크립트는 Python 표준 라이브러리.
- 디자인: `DESIGN.md`(MPBEL 디자인 시스템). DESIGN.md는 바꾸지 않습니다.
- 데이터: `data/`의 구글 시트 내보내기를 한 번만 변환했고 이후는 파일 직접 편집. 특허·세미나는 MPBEL 사이트 콘텐츠에서 가져왔습니다. 사람·과제 연결은 변환 때 정해 항목 파일에 적고, 빌드는 추측하지 않습니다.
- 공개 범위: `PRODUCT.md`의 "Capabilities and Constraints".

## 아직 안 정해진 것

- comments 글을 받는 방식(폼, giscus 등).
- 워크샵·사진 자료와 그 시점.
- 영문 데이터 필드(`*_en`) 채우기.
- 홈 슬로건·소개문(`src/content/pages/{ko,en}/home.md`, 지금은 임시 문구).
- 과제 대응표(`scripts/import/projects.json`)와 별칭(`aliases`): `scripts/import/report.md`의 "과제 미해결 값", "별칭 후보"를 사용자가 확인한 뒤 채웁니다.

## 작업 규칙

- 사용자와는 한국어로 대화합니다.
- 설계, 계획, 조율, 리뷰는 Fable(메인 세션)이 맡습니다. 코드를 쓰는 구현 서브에이전트는 `model: "opus"`로 띄웁니다. 범위가 좁은 재검토는 Sonnet을 씁니다.
- `../Website_20261028`은 읽기 전용 참고 자료입니다. 그 폴더의 파일이나 `ympbel/ympbel.github.io` 저장소를 바꾸지 않습니다.
- 이 사이트는 하위 경로(`base: '/10th'`)로 배포됩니다. 소스에 `/10th/`를 직접 쓰지 않습니다. 컴포넌트의 내부 링크·이미지는 `src/lib/url.ts`의 `url()`을 거치고, 마크다운 본문의 `/`로 시작하는 링크는 `src/lib/base-plugin.ts`가 붙입니다. MPBEL 코드를 가져올 때는 `docs/build-guide.md` 4장을 먼저 읽습니다.
- `data/`의 시트에는 개인정보 열이 들어 있습니다. `data/`는 commit하지 않고(`.gitignore`), 변환은 `PRODUCT.md`의 공개 범위대로 열 허용 목록만 읽습니다. `report.md`와 내용 파일에도 개인정보 값을 쓰지 않습니다. `tests/dist/privacy.test.mjs`가 검사합니다.
- `src/pages/`의 모든 페이지 파일은 `src/styles/global.css`를 첫 import로 둡니다. commit 전에 `npm test`.

## 문서

- `README.md`: 운영 안내(한글). 로컬 실행, 항목 추가, 구성원·졸업 처리, 별칭과 재연결, 영문 필드, 배포, 도메인 전환
- `PRODUCT.md`: 사이트의 목적, 독자, 게시판, 공개 범위, 자료 현황, 미정 사항
- `DESIGN.md`: MPBEL 디자인 시스템. 이 사이트가 따르는 시각 규칙
- `docs/superpowers/specs/2026-11-02-mpbel-10th-design.md`: 설계
- `docs/superpowers/plans/2026-11-02-mpbel-10th-site.md`: 구현 계획(Task 1–17)
- `docs/build-guide.md`: MPBEL을 만든 방법, 새 사이트 시작 순서, `base` 주의사항, 교훈
- `scripts/import/README.md`: 변환 스크립트 사용법, 재연결 명령, `report.md`
- `reference/mpbel/`: MPBEL에서 복사한 설정과 테스트 파일. 참고용이며 빌드에 쓰이지 않습니다.
- `data/`: (gitignore) 연구실 운영 구글 시트 7장의 HTML 내보내기. 원천 데이터이며 개인정보가 들어 있습니다.
