---
# 논문 템플릿. 논문 한 편이 파일 하나입니다.
# 이 파일을 복사해 "<연도>-<1저자 영문 이름>-<제목 앞 세 단어>.md" 형식으로 저장합니다(예: 2026-gildong-hong-deep-learning-based.md).
# 파일 이름은 다른 논문과 겹치지만 않으면 되고, 사이트 주소에는 쓰이지 않습니다.
# `_`로 시작하는 파일(이 템플릿)은 사이트에 나오지 않습니다.
# 문자열 값은 큰따옴표로 감쌉니다. 숫자(연도, IF)는 따옴표 없이 씁니다.
# [필수]가 아닌 항목은 값이 없으면 그 줄을 지웁니다. 아래에 없는 항목을 넣으면 빌드가 실패합니다.

# [필수] 출판 연도(정수). 2016년 이전 논문은 논문 게시판 아래 "연구실 이전" 구역에 나오고 홈 숫자에는 세지 않습니다.
year: 2026

# [필수] 논문 제목.
title: "Deep learning-based dose prediction for a test phantom"

# 1저자. 시트에 적힌 그대로의 문자열입니다. 두 명이면 쉼표로 이어 씁니다.
first_author: "Gildong Hong"

# 공동 1저자 목록. 없으면 줄을 지우거나 co_first: [] 로 둡니다.
co_first:
  - "Cheolsu Kim"

# 교신저자 목록(시트의 교신저자, 교신저자 2 순서). 없으면 줄을 지우거나 corresponding: [] 로 둡니다.
corresponding:
  - "Younghee Lee"

# 학술지 이름.
journal: "Journal of Test Physics"

# Impact factor(숫자, 따옴표 없이). 모르면 줄을 지웁니다.
impact_factor: 3.2

# 논문 사사 번호.
acknowledgement: "NRF-0000R0A0A0000000"

# 이 논문이 성과로 들어간 과제의 파일 이름(src/content/projects/ 안 .md 앞부분) 목록. 과제 게시판의 "관련 논문"에 쓰입니다.
# 변환 스크립트는 과제명이 정확히 같은 값과 scripts/import/projects.json에 적힌 줄임말만 연결합니다.
# 틀린 연결은 "이 논문이 이 과제의 성과"라는 잘못된 주장이 되므로, 확실하지 않으면 비워 둡니다(projects: []).
projects:
  - "project-01"

# 이 논문과 연결할 구성원의 파일 이름(src/content/members/ 안 .md 앞부분) 목록.
# 1저자·공동 1저자·교신저자 중 구성원인 사람입니다. 여기 적힌 구성원의 개인 페이지에 이 논문이 나옵니다.
# 변환 스크립트가 저자 표기를 구성원의 영문 이름과 aliases에 대조해 채웁니다. 교수는 개인 페이지가 없어 넣지 않습니다.
members:
  - "gildong-hong"

# 논문 주소(DOI 링크 등).
link: "https://doi.org/10.0000/example"

# 시트 순서 (자동). 원본 시트에서 몇 번째 항목이었는지(1부터, 정수, 따옴표 없이). 게시판은 같은 해 안에서 이 순서로 놓습니다.
# 변환 스크립트가 채웁니다. 새로 쓸 때는 같은 해 항목들 사이에서 놓일 자리에 맞는 숫자를 씁니다.
order: 218
---
