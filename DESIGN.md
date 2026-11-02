---
name: MPBEL
description: 연세 의학물리 및 의공학 연구실(Yonsei Medical Physics and Biomedical Engineering Lab) 홈페이지의 디자인 시스템
colors:
  yonsei-navy: "#0a347f"
  midnight-field: "#001429"
  deep-navy: "#033163"
  cobalt: "#1563b4"
  cerulean: "#34a1d4"
  signal-mint: "#59ffce"
  harbor-steel: "#195275"
  harbor-steel-hover: "#7895a7"
  petrol: "#046d8b"
  mustard: "#ecbe13"
  sea-green: "#2fb8ac"
  paper: "#ffffff"
  ink: "#000000"
  graphite: "#333333"
  slate: "#666666"
  ash: "#999999"
  hairline: "#dddddd"
  hairline-soft: "#e7e7e7"
  panel-gray: "#e1e1e1"
  band-gray: "#ebebeb"
  mist: "#f5f5f5"
  ledger: "#f8f8f8"
  notice-tint: "#e6f8ff"
  footer-charcoal: "#363636"
  footer-ash: "#9f9f9f"
  footer-dim: "#6e6e6e"
typography:
  display:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.6
  headline:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "1px"
  title-lg:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1
  title:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.6
  subtitle:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
  nav:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "18px"
    fontWeight: 700
  eyebrow:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.6
  body-lead:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.8
  body:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 2
  body-sm:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Lato, 'Nanum Gothic', sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
rounded:
  none: "0px"
  sm: "3px"
spacing:
  2xs: "5px"
  xs: "10px"
  sm: "15px"
  md: "20px"
  lg: "30px"
  xl: "50px"
  2xl: "70px"
  gutter-mobile: "16px"
components:
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.nav}"
    height: "90px"
    padding: "0 20px"
  nav-link-hover:
    textColor: "{colors.cobalt}"
  nav-dropdown-item:
    backgroundColor: "{colors.harbor-steel}"
    textColor: "{colors.paper}"
    padding: "15px 5px"
    width: "205px"
  nav-dropdown-item-hover:
    backgroundColor: "{colors.harbor-steel-hover}"
  lang-toggle:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.yonsei-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    width: "44px"
    height: "30px"
  lang-toggle-active:
    backgroundColor: "{colors.yonsei-navy}"
    textColor: "{colors.paper}"
  snb-title:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.paper}"
    typography: "{typography.title-lg}"
    width: "240px"
    height: "149px"
    padding: "75px 0 0 30px"
  snb-list:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.graphite}"
    padding: "27px 0"
    width: "240px"
  snb-item-active:
    textColor: "{colors.cobalt}"
  research-tile-01:
    backgroundColor: "{colors.midnight-field}"
    textColor: "{colors.paper}"
    typography: "{typography.headline}"
    width: "300px"
    height: "400px"
    padding: "30px"
  research-tile-02:
    backgroundColor: "{colors.deep-navy}"
    textColor: "{colors.paper}"
    typography: "{typography.headline}"
    width: "300px"
    height: "400px"
    padding: "30px"
  research-tile-03:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.paper}"
    typography: "{typography.headline}"
    width: "300px"
    height: "400px"
    padding: "30px"
  research-tile-04:
    backgroundColor: "{colors.cerulean}"
    textColor: "{colors.paper}"
    typography: "{typography.headline}"
    width: "300px"
    height: "400px"
    padding: "30px"
  latest-panel:
    backgroundColor: "{colors.panel-gray}"
    textColor: "{colors.ink}"
    height: "283px"
    padding: "25px 30px"
  link-cell:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.graphite}"
    height: "70px"
    padding: "10px 0 0 30px"
  link-cell-hover:
    backgroundColor: "{colors.mist}"
  pub-shortcut-paper:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.paper}"
    height: "70px"
  pub-shortcut-presentation:
    backgroundColor: "{colors.mustard}"
    textColor: "{colors.paper}"
    height: "70px"
  pub-shortcut-patent:
    backgroundColor: "{colors.sea-green}"
    textColor: "{colors.paper}"
    height: "70px"
  button-link:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 8px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "7px 15px"
  category-tab:
    textColor: "{colors.slate}"
    padding: "0 15px"
  category-tab-active:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.paper}"
  year-tab:
    backgroundColor: "{colors.ledger}"
    textColor: "{colors.slate}"
    rounded: "{rounded.none}"
    width: "90px"
    padding: "12px 0 11px"
  table-head:
    backgroundColor: "{colors.ledger}"
    textColor: "{colors.graphite}"
    padding: "12px 0"
  notice-row:
    backgroundColor: "{colors.notice-tint}"
  pagination-page:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.slate}"
    rounded: "{rounded.sm}"
    height: "30px"
    width: "30px"
  pagination-current:
    backgroundColor: "{colors.yonsei-navy}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    height: "30px"
  footer:
    backgroundColor: "{colors.footer-charcoal}"
    textColor: "{colors.paper}"
    padding: "30px 0"
---

# Design System: MPBEL

## Overview

**Creative North Star: "The Blue Spectrum"**

MPBEL 사이트는 거의 검정에 가까운 네이비에서 맑은 하늘색까지 이어지는 하나의 블루 스펙트럼 위에 서 있습니다. 홈의 연구 분야 타일 네 개(Midnight Field → Deep Navy → Cobalt → Cerulean)는 OKLCH 밝기가 약 19% → 32% → 50% → 67%로 고르게 오르는 사다리이고, 로고의 Yonsei Navy가 그 위에 기관의 서명을 얹습니다. 이 시스템에서 색은 장식이 아니라 소속과 현재 위치를 알려 주는 신호입니다.

분위기는 임상적이고 학술적입니다. 흰 바탕, 연한 회색 면, 1px 선이 논문·뉴스·구성원 목록을 정돈하고, 차가운 청백색 의료영상(엑스레이 두부, 방사선치료 장비, CT 재구성 도식)이 첨단성을 맡습니다. 컴포넌트는 절제되어 있습니다. 기본은 회색 패널과 얇은 선이고, 진한 블루 면은 연구 분야 타일과 사이드 내비게이션 머리처럼 정해진 몇 곳에만 나옵니다. 정보 밀도는 높은 편이며(본문 13–15px), 장식은 Signal Mint 밑줄 하나 정도로 아낍니다.

이 사이트는 옛 그누보드5 사이트(© 2018)를 Astro 정적 사이트로 옮긴 데스크톱 우선 시스템입니다. 1200px 고정 폭 레이아웃이 1024px 이하에서 좌우 16px 여백의 유동 레이아웃으로 바뀝니다. 디자인 값은 CSS 변수 없이 `src/styles/legacy/`와 `src/styles/responsive.css`에 리터럴로 흩어져 있고, 이 문서의 토큰은 그 값들을 대표값 하나씩으로 정리한 것입니다. 코드에 남은 다른 값들은 Do's and Don'ts에 "새 화면에 퍼뜨리지 않을 값"으로 적었습니다.

**Key Characteristics:**
- 어두운 쪽에서 밝은 쪽으로 이어지는 4단 블루 스펙트럼과 Yonsei Navy가 정체성의 중심
- 흰 바탕 + 회색 면 + 1px 선의 평면 구조, 모서리는 각짐(0px)
- Lato(라틴)와 Nanum Gothic(한글) 두 서체, 굵기는 사실상 400과 700 두 단계
- 차가운 청백색 의료영상 사진이 히어로와 연구 타일을 채움
- 진한 블루 위의 짧은 Signal Mint 선이 유일한 장식 악센트
- 1200px 고정 그리드, 서브 페이지는 240px 사이드 내비 + 900px 본문

## Colors

차가운 블루 스펙트럼 하나와 무채색 회색 계열로 이루어진 팔레트이며, 블루가 아닌 색은 출판물 바로가기 타일 세 개에만 나옵니다.

### Primary
- **Yonsei Navy** (#0a347f): 로고, KR/EN 언어 토글의 선과 채움, 최신글 패널 제목의 짧은 밑줄, 교수 페이지 소제목, 페이지네이션의 현재 쪽. 기관을 대표하는 색이며 흰 글자와의 대비는 11.6:1입니다. (파비콘 SVG는 연세 공식 블루 #003876을 씁니다.)
- **Midnight Field** (#001429): 스펙트럼의 가장 어두운 끝. 연구 분야 타일 01(Advanced CT Reconstruction)의 바탕.
- **Deep Navy** (#033163): 연구 분야 타일 02(Medical Artificial Intelligence)의 바탕.
- **Cobalt** (#1563b4): 상호작용 색. 상단 메뉴 hover, 사이드 내비의 현재 항목 글자와 사각 불릿, 선택된 분류 탭, 연구 분야 타일 03(Radiation Therapy)의 바탕, 사이드 내비 머리 이미지의 기본 톤. 흰 글자 대비 6.0:1.
- **Cerulean** (#34a1d4): 스펙트럼의 가장 밝은 끝. 연구 분야 타일 04(Particle Therapy)의 바탕, 홈 소개 문구 "연세 의학물리 및 의공학 연구실"(24px), Welcome 페이지 헤드라인의 강조어, 푸터의 "MPBEL". 흰 바탕 대비가 2.9:1이라 큰 글자나 면에만 씁니다.

### Secondary
- **Signal Mint** (#59ffce): 진한 블루 위에만 놓이는 짧은 선. 연구 타일 라벨("RESEARCH 01")의 1px 밑줄, 사이드 내비 머리의 30×2px 막대. Midnight Field 위 대비 14.7:1.
- **Harbor Steel** (#195275): 상단 메뉴 드롭다운의 바탕(흰 글자 대비 8.4:1).
- **Harbor Steel Hover** (#7895a7): 드롭다운 항목 hover 바탕.

### Tertiary
- **Petrol** (#046d8b), **Mustard** (#ecbe13), **Sea Green** (#2fb8ac): 홈 오른쪽 아래 Publication 바로가기 타일 세 개(Paper / Presentation / Patent) 전용. 스펙트럼 바깥의 색은 이 세 개뿐입니다. 흰 글자 대비는 각각 5.9 / 1.8 / 2.5:1입니다.

### Neutral
- **Paper** (#ffffff): 모든 페이지의 기본 바탕.
- **Ink** (#000000): 링크와 상단 메뉴, 홈 본문, 최신글 목록 글자. 레거시 기본값 `a{color:#000}`에서 옵니다.
- **Graphite** (#333333): 페이지 제목, 사이드 내비 항목, 출판물 제목, LINK 버튼 바탕, 사이드 내비 아래 1px 선과 출판물 연도 제목 아래 3px 선.
- **Slate** (#666666): 긴 본문(Welcome 페이지)과 분류 탭 글자. 흰 바탕 대비 5.7:1.
- **Ash** (#999999): 경로 표시(breadcrumb), 출판물 번호 같은 보조 정보. 흰 바탕 대비 2.9:1.
- **Hairline** (#dddddd): 구성원 카드 구분선, 본문 점선 구분, 출판물 연도 탭 테두리.
- **Hairline Soft** (#e7e7e7): 게시판 표의 가로선.
- **Panel Gray** (#e1e1e1): 홈 News/Seminar 패널 바탕, 바로가기 링크 칸 테두리.
- **Band Gray** (#ebebeb): 홈 연구 분야 타일 뒤로 깔리는 270px 회색 띠.
- **Mist** (#f5f5f5): 사이드 내비 목록 바탕, 링크 칸 hover, 페이지네이션 칩.
- **Ledger** (#f8f8f8): 표 머리, 출판물 연도 탭, 분류 탭 띠 바탕.
- **Notice Tint** (#e6f8ff): 게시판 공지 행 바탕(아래선 #c3dfe8).
- **Footer Charcoal** (#363636), **Footer Ash** (#9f9f9f), **Footer Dim** (#6e6e6e): 푸터 바탕, 주소, 저작권 문구.

### Named Rules
**The Spectrum Order Rule.** 블루 네 색을 한 세트로 쓸 때는 항상 어두운 쪽에서 밝은 쪽 순서(Midnight Field → Deep Navy → Cobalt → Cerulean)로 놓습니다. 홈 연구 타일 01→04가 이 순서이고, 순서 자체가 시스템의 서명입니다.

**The One Interactive Blue Rule.** hover, 현재 위치, 선택 상태는 Cobalt 하나로 표시합니다. 레거시 코드에는 같은 역할의 블루가 여러 개 남아 있지만 새 화면은 Cobalt만 씁니다.

**The Mint Hairline Rule.** Signal Mint는 글자나 면에 쓰지 않습니다. 진한 블루 위의 1–2px 짧은 선으로만 나옵니다.

## Typography

**Display Font:** Lato (with sans-serif)
**Body Font:** Lato + Nanum Gothic (한글은 Nanum Gothic으로 대체 렌더링)
**Label/Mono Font:** 별도 없음

**Character:** 둥근 획의 휴머니스트 산세리프 Lato와 단정한 Nanum Gothic의 조합으로, 의료기관 홈페이지다운 차분하고 중립적인 목소리를 냅니다. 개성은 서체가 아니라 크기 대비와 굵기 대비에서 나옵니다.

모든 요소에 `* { font-family: 'Lato', 'Nanum Gothic', sans-serif; line-height: 1.6 }`가 걸려 있어 `.topmenu`의 'Noto Sans'나 서브 비주얼의 'Roboto Slab' 같은 선언은 실제로 적용되지 않습니다. Google Fonts에서 Lato는 300/400/700, Nanum Gothic은 400/700/800만 불러오므로 레거시 CSS의 `font-weight: 600`은 화면에서 700으로 그려집니다. 그래서 위 토큰의 굵기는 렌더링 기준인 700으로 적었습니다.

### Hierarchy
- **Display** (400, 36px, 1.6): Welcome 페이지의 "Thank you for visiting the MPBEL website." 한 곳. 강조어만 Cerulean.
- **Headline** (700, 28px, 1.4, letter-spacing 1px): 연구 분야 타일 제목, 홈 소개 블록의 "MPBEL".
- **Title Large** (700, 24px, 1): 홈 News/Seminar 패널 제목(letter-spacing 1px), 사이드 내비 머리(800, 대문자), 출판물 연도 제목(letter-spacing -1px), 게시글 제목.
- **Title** (700, 22px, 1.6): 서브 페이지 제목(`h2.cnt_title`, Graphite), 연구 페이지 소제목, 홈 "Publication" 제목.
- **Subtitle** (700, 20px, 1.4): 구성원 이름, 교수 페이지 소제목(Yonsei Navy).
- **Nav** (700, 18px): 상단 메뉴. 대문자 영문(INTRODUCTION, MEMBER…).
- **Eyebrow** (700, 18px): 연구 타일의 "RESEARCH 01" 라벨. Signal Mint 1px 밑줄과 짝.
- **Body Lead** (400, 18px, 1.8): 홈 소개 단락.
- **Body** (400, 15px, 2.0): 연구 페이지 본문. Welcome 페이지는 16px / 26px / Slate. 900px 본문 폭 전체를 쓰므로 한 줄이 길게 흐릅니다.
- **Body Small** (400, 13px, 1.6): 구성원 정보(dt는 700), 출판물 저자·학술지, 경로 표시.
- **Label** (700, 12px): KR/EN 언어 토글. 출판물 LINK 버튼은 11px 대문자.

### Named Rules
**The Two-Family Rule.** 글자는 Lato와 Nanum Gothic 두 가족으로만 짭니다. 영문이 앞에서 받고 한글이 뒤에서 받는 순서도 유지합니다.

**The Loaded-Weights Rule.** 불러온 굵기만 씁니다. 새 코드에서는 400과 700 두 단계로 쓰고, 600을 쓰지 않습니다(어차피 700으로 그려집니다).

## Layout

데스크톱 기준 1200px 고정 폭 컨테이너를 가운데 정렬하고, 그 안을 float로 나눕니다.

- **상단 바:** 높이 100px. 로고(142×50) 왼쪽, 메뉴와 언어 토글 오른쪽. 메뉴 항목은 90px 높이, 좌우 20px 패딩.
- **홈:** 570px 전폭 히어로(`visual.jpg`, 슬로건 이미지가 왼쪽 50px·위 165px) → 356px 소개 띠(왼쪽 600px 이미지 콜라주 + 오른쪽 550px 글) → 연구 분야 띠(270px Band Gray 위로 300×400 타일 네 개가 -200px 겹쳐 올라옴) → 게시판 영역(580px + 40px 간격 + 580px 두 칸) → 푸터.
- **서브 페이지:** 250px 전폭 비주얼 띠 → 1200px 안에 240px 사이드 내비(왼쪽) + 60px 간격 + 900px 본문(오른쪽). 본문 제목은 위 70px 여백, 경로 표시는 같은 높이 오른쪽 끝. 본문은 제목 아래 50px부터 시작하고 아래 50px 여백.
- **간격 리듬:** 5 / 10 / 15 / 20 / 30 / 50 / 70px. 패널과 타일 안쪽은 30px, 섹션 사이는 50px, 서브 페이지 제목 위는 70px.
- **반응형(1024px 이하):** 고정 폭과 min-width가 풀리고 좌우 16px 여백이 생깁니다. 상단 메뉴는 40×40 햄버거 버튼(Yonsei Navy 1px 테두리)이 여는 서랍이 되고, 하위 메뉴는 펼친 상태로 보입니다. 사이드 내비는 본문 위의 가로 탭 줄이 됩니다. 연구 타일은 세로로 쌓이며 사진이 항상 위로 갑니다. 구성원 목록은 한 줄 두 명입니다.
- **반응형(600px 이하):** 홈 바로가기 링크와 출판물 타일이 한 줄에 하나가 되고, 구성원 목록도 한 줄 한 명입니다. 게시판 표의 글쓴이 열은 숨깁니다.

### Named Rules
**The 240 + 900 Rule.** 서브 페이지는 1200px 안에서 240px 사이드 내비와 900px 본문으로 나눕니다. 새 서브 페이지도 이 틀에 들어갑니다.

## Elevation & Depth

현재 렌더링되는 화면에는 그림자가 없습니다. 층은 세 가지로 나뉩니다. 첫째, 색 면의 명도 차이(흰 바탕 위 Panel Gray 패널, Mist 사이드 내비)입니다. 둘째, 1px 선(Hairline, Graphite)입니다. 셋째, 겹침입니다. 홈의 연구 타일 줄이 Band Gray 띠 위로 200px 올라타며 생기는 겹침이 이 사이트에서 가장 뚜렷한 깊이 표현입니다. 사진 속 의료영상의 빛과 투명감이 나머지 깊이를 맡습니다. 레거시 CSS에 남은 그림자(입력창 focus의 `0 0 5px #9ed4ff` 등)는 정적 사이트로 옮기면서 화면에서 쓰이지 않습니다. 이것은 현재 상태를 기록한 것이며, 새 화면에서 그림자를 금지하는 규칙은 아닙니다.

## Shapes

모든 면, 버튼, 탭, 타일, 사진의 모서리는 각져 있습니다(0px). 구성원 사진은 202×150 고정 상자에 `object-fit: cover`로 잘리고, 교수 사진은 폭 250px입니다. 작은 사각형이 반복되는 모티프입니다. 사이드 내비의 5×5px 불릿, 구성원 정보의 4×4px 회색 사각, 연구 페이지 소제목 앞의 11px 블루 사각, 목록 앞의 3px 틸 사각이 모두 정사각형입니다. 둥근 모서리는 페이지네이션 칩(3px)에만 레거시로 남아 있습니다. Welcome 페이지의 육각형 이미지 콜라주는 이미지 자체의 형태이며 CSS 도형이 아닙니다.

### Named Rules
**The Square Corner Rule.** 새 컴포넌트의 모서리는 0px입니다. 불릿이 필요하면 원이 아니라 작은 정사각형을 씁니다.

## Components

컴포넌트는 절제되고 조용합니다. 연한 회색 면과 얇은 선이 기본이고, 블루는 현재 위치와 연구 분야를 가리킬 때만 면으로 올라옵니다.

### Buttons
- **Shape:** 각진 모서리 (0px).
- **LINK 버튼 (출판물):** Graphite 바탕, 흰 글자, 11px 700 대문자, 패딩 4px 8px. hover 시 #444.
- **목록 버튼 (게시글 보기):** 흰 바탕, 1px #e0e0e0 테두리, 검정 글자, 패딩 7px 15px.
- **언어 토글:** 44×30px, 1px Yonsei Navy 테두리, 12px 700 Yonsei Navy 글자. 현재 언어와 hover는 Yonsei Navy 채움 + 흰 글자. 0.6s 전환이 걸린 유일한 요소입니다.

### Chips
- **분류 탭 (구성원):** 16px Slate 글자, 좌우 15px 패딩, 항목 사이 1px 세로선. 선택된 탭은 채움 + 흰 굵은 글자. 대표값은 Cobalt이며, 현재 코드는 #0099dc입니다.
- **분류 탭 (뉴스·세미나):** Ledger 띠(패딩 7px) 안의 글자 탭. 선택은 검정 굵은 글자, hover는 블루 글자.
- **연도 탭 (출판물):** 90px 폭 칸의 격자, 1px Hairline 테두리, Ledger 바탕, 13px Slate 글자.

### Cards / Containers
- **최신글 패널 (홈 News / Seminar):** Panel Gray 바탕, 높이 283px, 0px 모서리, 그림자 없음. 제목 24px 700 아래 Yonsei Navy 짧은 밑줄과 90% 폭 기본 `<hr>` 선. 글 네 개를 16px 700 한 줄 말줄임으로, 날짜(MM-DD)는 오른쪽. 오른쪽 위에 사각 테두리 "+" 더보기 아이콘.
- **바로가기 링크 칸:** 2×2 격자, 칸마다 70px 높이와 1px Panel Gray 테두리, 16px Graphite 글자, 오른쪽에 꺾쇠 아이콘. hover 시 Mist 바탕.
- **구성원 카드:** 위아래 1px Hairline으로 나뉜 가로 행. 왼쪽 202×150 사진, 오른쪽 25px 띄워 이름(20px 700)과 정의 목록(13px, dt 700 + 4px 회색 사각 불릿, dd #262626).
- **출판물 목록:** 연도 제목(24px 700) 아래 3px Graphite 선, 이어서 Hairline으로 나뉜 행. 왼쪽 번호(Ash), 오른쪽 굵은 논문 제목 + 저자·학술지·권호·날짜 줄 + 오른쪽 아래 LINK 버튼.

### Inputs / Fields
정적 사이트라 입력 필드가 렌더링되는 곳이 없습니다.

### Navigation
- **상단 메뉴:** 18px 700 검정 대문자 영문. hover는 Cobalt 글자. 마우스를 올리면 205px 폭 드롭다운이 열리며, Harbor Steel 바탕에 14px 흰 글자, 항목 패딩 15px 5px, hover 시 Harbor Steel Hover 바탕. 1024px 이하에서는 햄버거 서랍으로 바뀝니다.
- **사이드 내비 (SNB):** 240px 폭. 머리는 149px 높이의 블루 그라데이션 이미지(`bgSnbTit.jpg`, Cobalt 계열)에 24px 800 흰 대문자 섹션 이름과 그 위 30×2px Signal Mint 막대. 목록은 Mist 바탕, 위아래 27px 패딩, 15.5px Graphite 항목, 왼쪽 5×5px 사각 불릿, 아래 1px Graphite 선. 현재 항목은 글자와 불릿이 Cobalt.
- **경로 표시:** 본문 제목 오른쪽, 13px Ash. 집 아이콘 → 섹션 → 현재 페이지가 꺾쇠 아이콘으로 이어집니다.
- **페이지네이션:** 30px 높이 칩, 1px #bbbcc3 테두리, 3px 모서리. 현재 쪽은 채움 + 흰 굵은 글자. 대표값은 Yonsei Navy이며, 현재 코드는 #4c4f6f입니다.

### Research Tile (signature)
홈 연구 분야 줄을 이루는 300×400px 타일 네 개입니다. 타일마다 스펙트럼의 한 색을 바탕으로 깔고, 위아래 절반(200px)에 사진을, 나머지 절반에 글을 둡니다. 사진과 글의 위치는 타일마다 번갈아 바뀝니다(01·03은 글이 위, 02·04는 사진이 위). 글 영역은 30px 패딩, Eyebrow 라벨과 Signal Mint 1px 밑줄, 그 아래 15px 띄워 Headline 제목 두 줄. 타일 전체가 하나의 링크입니다. 사진이 타일의 반을 차지하므로 연구 분야를 보여 주는 대표 이미지가 필요합니다.

### Visual Bands (signature)
홈 히어로(570px)와 서브 페이지 비주얼(250px)은 같은 청백색 의료영상 사진(엑스레이 두부와 치료 장비)을 다른 높이로 자른 것입니다. 위에 얹힌 슬로건("MPBEL 의학물리 및 의공학 연구실" + 틸 띠 위의 영문 연구실 이름)은 글자가 들어간 PNG 이미지이며, alt가 비어 있습니다. 서브 페이지 비주얼은 모든 서브 페이지에서 같고 페이지마다 바뀌지 않습니다.

### Footer
Footer Charcoal 바탕, 가운데 정렬, 위아래 30px 패딩. 연구실 영문 이름(16px 흰색), 주소와 전화(14px Footer Ash), 저작권(14px Footer Dim, "MPBEL"만 Cerulean).

## Do's and Don'ts

### Do:
- **Do** 블루 네 색을 세트로 쓸 때 Midnight Field (#001429) → Deep Navy (#033163) → Cobalt (#1563b4) → Cerulean (#34a1d4) 순서를 지킵니다.
- **Do** hover, 현재 위치, 선택 상태를 Cobalt (#1563b4) 하나로 표시합니다.
- **Do** Signal Mint (#59ffce)는 진한 블루 위의 1–2px 짧은 선으로만 씁니다.
- **Do** 서브 페이지는 1200px 안에 240px 사이드 내비 + 900px 본문 틀을 따르고, 1024px 이하에서는 좌우 16px 여백으로 풀어 줍니다.
- **Do** 굵기는 400과 700만 씁니다(불러온 굵기 기준).
- **Do** 새 화면의 한국어 단락에는 연구 페이지처럼 `word-break: keep-all`을 씁니다. 레거시 기본값 `p { word-break: break-all }`은 데스크톱에서 "물리학 / 의", "CT/MR/PE / T"처럼 단어 중간을 끊습니다.
- **Do** 새 화면의 제목과 문구는 이미지가 아니라 실제 텍스트로 넣습니다. 기존 슬로건 이미지는 글자가 그림 안에 있어 화면 낭독기가 읽지 못합니다.
- **Do** Cerulean (#34a1d4)과 Ash (#999999)는 큰 글자나 면, 보조 정보에만 씁니다. 흰 바탕 대비가 각각 2.9:1이라 본문 크기 글자에는 부족합니다.

### Don't:
- **Don't** 레거시 코드에 남은 다른 블루를 새 화면에 쓰지 않습니다: #1e8ad3, #3378c1(메뉴 hover), #0099dc(구성원 탭), #3497d9(게시판 분류 글자), #1061b2(분류 탭 hover), #253dbe(최신글 밑줄), #4567b5(이전·다음 글), #4158d1(공지 아이콘), #05367b(교수 소제목), #4c4f6f(페이지네이션). 각각 Cobalt 또는 Yonsei Navy로 대신합니다.
- **Don't** 최신글 hover의 빨간색 #a22121처럼 블루 스펙트럼과 무관한 상태 색을 만들지 않습니다.
- **Don't** Petrol·Mustard·Sea Green을 출판물 바로가기 밖으로 가져가지 않습니다. 흰 글자를 Mustard (#ecbe13, 1.8:1)나 Sea Green (#2fb8ac, 2.5:1) 위에 새로 올리지도 않습니다.
- **Don't** Signal Mint를 글자색이나 넓은 면으로 쓰지 않습니다.
- **Don't** 둥근 모서리 카드나 원형 불릿을 들이지 않습니다. 모서리는 0px, 불릿은 작은 정사각형입니다.
- **Don't** Lato와 Nanum Gothic 외의 서체를 본문이나 UI에 섞지 않습니다.
