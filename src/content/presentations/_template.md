---
# 학회 발표 템플릿. 발표 한 건이 파일 하나입니다.
# 이 파일을 복사해 "<연도>-<1저자 영문 이름>-<제목 앞 세 단어>.md" 형식으로 저장합니다(예: 2026-gildong-hong-feasibility-of-smartphone-based.md).
# 파일 이름은 다른 발표와 겹치지만 않으면 되고, 사이트 주소에는 쓰이지 않습니다.
# `_`로 시작하는 파일(이 템플릿)은 사이트에 나오지 않습니다.
# 문자열 값은 큰따옴표로 감쌉니다. 연도는 따옴표 없이 씁니다.
# [필수]가 아닌 항목은 값이 없으면 그 줄을 지웁니다. 아래에 없는 항목을 넣으면 빌드가 실패합니다.

# [필수] 발표 연도(정수).
year: 2026

# [필수] 발표 제목.
title: "Feasibility of smartphone-based film dosimetry"

# 전체 저자. 초록에 적힌 그대로의 문자열입니다.
authors: "Gildong Hong, Cheolsu Kim, Younghee Lee"

# 1저자. 적힌 그대로의 문자열입니다.
first_author: "Gildong Hong"

# 교신저자 목록. 없으면 줄을 지우거나 corresponding: [] 로 둡니다.
corresponding:
  - "Younghee Lee"

# [필수] 학회 이름. 발표 게시판은 연도 안에서 이 값으로 묶으므로 같은 학회는 같은 표기로 씁니다
# (예: "KSMP Spring", "KSMP Fall", "AAPM"). 표기 통일표는 scripts/import/conferences.json에 있습니다.
conference: "KSMP Fall"

# 시트에 적혀 있던 원래 학회 표기. 통일하면서 바뀐 경우에만 변환 스크립트가 남깁니다. 새로 쓸 때는 줄을 지웁니다.
conference_raw: "KSMP (Fall)"

# [필수] 발표 형태. "Oral", "Poster", "ePoster" 등. 형태 칩으로 나옵니다.
type: "Poster"

# 세션 이름.
session: "Session 3"

# 사사 문구 또는 과제 번호.
acknowledgement: "NRF-0000R0A0A0000000"

# 이 발표와 연결할 구성원의 파일 이름(src/content/members/ 안 .md 앞부분) 목록. 여기 적힌 구성원의 개인 페이지에 나옵니다.
# 변환 스크립트가 전체 저자를 구성원의 영문 이름과 aliases에 대조해 채웁니다. 교수는 넣지 않습니다.
members:
  - "gildong-hong"

# 시트 순서 (자동). 원본 시트에서 몇 번째 항목이었는지(1부터, 정수, 따옴표 없이). 게시판은 같은 해 안에서 이 순서로 놓습니다.
# 변환 스크립트가 채웁니다. 새로 쓸 때는 같은 해 항목들 사이에서 놓일 자리에 맞는 숫자를 씁니다.
order: 380
---
