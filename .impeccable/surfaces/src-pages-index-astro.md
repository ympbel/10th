---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/en/index.astro"]
---

# Surface brief: 홈 (`src/pages/index.astro`, `src/pages/en/index.astro`)

- Scope: 홈 전체(첫 화면 포함). Visitor mode: **Read**.
- Audience and job: 교수님·구성원이 외부 사람(예비 지원자, 협력 연구자, 평가자)에게 연구실을 소개하려고 보낸 링크를 받은 사람이, 몇 분 안에 연구실의 10년(사람·성과·꾸준함)을 이해하고 게시판으로 들어간다.
- Proof and content: 빌드 때 컬렉션에서 센 실제 숫자(학생·연구원 61, 학위 취득 13, 논문 162, 발표 379, 수상 41, 과제 15), 2016–2026 연도별 집계와 이름, 선택한 해의 논문·학위·수상 목록.
- Constraints: DESIGN.md(MPBEL 디자인 시스템) 안에서만. 1200px 고정 그리드, `base: /10th`, 한·영 두 언어판, 슬로건·소개문은 임시 문구(사용자 확정 전).
- Unresolved: 소개문 확정, 비주얼 띠 사진 교체 여부.

## Direction contract

THESIS: 메인 사이트 홈의 뼈대(비주얼 띠 → 소개 띠) 위에 열한 해의 연표를 얹은 아카이브 홈. 홈이 "최신 글 네 줄"이 아니라 "10년 전체"를 한 화면 아래에서 보여 준다. 거부하는 기본값: 큰 숫자 타일 네 장과 카드 격자로 이루어진 통계 대시보드, 그리고 10년의 신호가 없는 메인 사이트 홈의 복제.

OWN-WORLD: MPBEL 디자인 시스템 그대로. Midnight Field 바탕의 비주얼 띠와 Yonsei Navy 숫자, Cobalt 하나로 선택·hover, Cerulean은 큰 글자(연도)에만, Signal Mint는 진한 블루 위 30×2px 선 하나. Lato + Nanum Gothic, 굵기 400/700. 모서리 0px, 1px Hairline 격자, Panel Gray 패널, Mist 숫자 칸. 글자를 지워도 "흰 바탕 위 회색 면과 1px 선, 어두운 네이비 띠 하나, 작은 정사각 불릿"으로 MPBEL임을 알아볼 수 있어야 한다.

STORY: 방문자는 첫 화면에서 연구실 이름과 2016–2026, 그리고 숫자 여섯 개로 규모를 읽는다. 한 번 스크롤하면 열한 칸에 쌓인 막대와 이름에서 "해마다 꾸준히 나온다"를 읽고, 연도를 눌러 그 해를 들여다본 뒤, 바로가기 격자에서 게시판으로 들어간다. 믿게 되는 것: 이 연구실은 10년 동안 사람을 길러 내고 성과를 꾸준히 냈다.

FIRST VIEWPORT (1440×900): 상단 바 100px(왼쪽 로고 + "10th Anniversary Archive" 라벨, 오른쪽 대메뉴 6개와 KR/EN). 570px 비주얼 띠: 왼쪽 x=50, y=165에 실제 텍스트 슬로건(민트 선 → 42px 제목 두 줄 → Cerulean 24px "2016 – 2026" (kicker 없음, 2026-11-03 수정)), 오른쪽에 `visual.jpg` 의료영상. 그 아래 소개 띠의 위 230px: 왼쪽 600px에 숫자 여섯 칸(3열, Mist 바탕, 34px Yonsei Navy 숫자), 오른쪽 550px에 "MPBEL Introduction"과 Cerulean 소제목, 18px 소개 단락. 주 행동은 스크롤(연표)과 상단 메뉴. (2026-11-03 수정: 570px 띠와 356px 소개 띠를 지키면 연표 상단 선은 첫 화면 아래(y≈1130)에 있다. 첫 화면은 비주얼 띠와 소개 띠의 위 230px까지이며, 연표는 한 번 스크롤해야 보인다.)

FORM: 사용자 조합. 후보 목록 7개 중 두 번째 딜 "한 식구"(순위 7)의 뼈대 + 세 번째 딜 "열한 개의 해"(순위 1)의 연표. 서명 상호작용: 연표 칸 선택 → 연도 패널 교체(JS, 해시 갱신) 또는 연도 페이지 이동(JS 없음). 모션은 패널 교체 한 번, 전환 없음 또는 0.2s 이하. seed:76b74d3a63b02364

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
