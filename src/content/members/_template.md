---
# 구성원 템플릿. 구성원 한 명(교수 포함)이 파일 하나입니다.
# 이 파일을 복사해 영문 이름으로 저장합니다(예: gildong-hong.md). 파일 이름(.md 앞부분)이 개인 페이지 주소가 됩니다: /people/gildong-hong/
# `_`로 시작하는 파일(이 템플릿)은 사이트에 나오지 않습니다.
# 문자열 값은 큰따옴표로 감쌉니다. 날짜는 "YYYY-MM-DD", 월만 알면 "YYYY-MM"으로 씁니다.
# [필수]가 아닌 항목은 값이 없으면 그 줄을 지웁니다. 아래에 없는 항목을 넣으면 빌드가 실패합니다.
# 연락처나 생일처럼 공개하지 않기로 한 정보는 넣을 칸이 없습니다.

# [필수] 구분. 다음 중 하나:
#   professor 교수 / student 현 학생 / alumni 학위를 받은 졸업생 / former 학위 없이 거쳐 간 구성원(수료·인턴·단기 등)
# 학생이 학위를 받으면 이 값을 "alumni"로 바꾸고 아래 degree를 채우면 됩니다.
role: "student"

# [필수] 한글 이름.
name: "홍길동"

# 영문 이름. 영문 페이지에서 이 이름을 씁니다. 없으면 줄을 지웁니다(영문 페이지에도 한글 이름이 나옵니다).
name_en: "Gildong Hong"

# 논문·발표 저자란에 적힌 이 사람의 영문 표기 목록. 변환 스크립트가 저자를 구성원과 연결할 때 씁니다.
# 표기가 여러 가지면 모두 적습니다. 대소문자, 띄어쓰기, 마침표, 하이픈만 다른 표기는 같은 것으로 봅니다.
# 없으면 줄을 지우거나 aliases: [] 로 둡니다.
aliases:
  - "Gildong Hong"
  - "Gil Dong Hong"

# ORCID iD(0000-0000-0000-0000 형식, 마지막 자리는 X일 수 있음). 있으면 카드와 개인 페이지에 ORCID 링크가 나옵니다.
orcid: "0000-0000-0000-0000"

# 과정. 예: "석사", "박사", "통합", "통합 (석사)", "통합 (박사)".
program: "석사"

# 학과(한글)와 영문 학과. department_en이 없으면 영문 페이지에도 한글 학과가 나옵니다.
department: "융합의학과"
department_en: "Department of Integrative Medicine"

# 전공.
major: "의학물리"

# 합류일(연구실 첫 출근일). 모르면 줄을 지웁니다. 연표의 합류 칸에 세지 않고 "합류 연도 미상"으로 다룹니다.
joined: "2024-03-01"

# 연구실을 떠난 날. 현 구성원은 줄을 지웁니다.
left: "2026-02"

# 학위. 아는 항목만 남기고, 하나도 없으면 degree 줄과 아래 네 줄을 모두 지웁니다.
#   start   학위 과정 시작일
#   date    학위 취득일. 이 값이 있어야 학위 취득자로 셉니다(연도 페이지, 홈 숫자).
#   type    학위 종류(예: "공학석사", "이학박사", "의학박사")
#   type_en 영문 학위 종류. 없으면 영문 페이지에도 한글이 나옵니다.
degree:
  start: "2024-03"
  date: "2026-02"
  type: "공학석사"
  type_en: "M.S. in Engineering"

# ---- 졸업생(alumni)이 주로 쓰는 항목 ----
# 현 직장과 직급(한글)과 영문. *_en이 없으면 영문 페이지에도 한글이 나옵니다.
affiliation: "OO대학교병원 방사선종양학과"
affiliation_en: "Department of Radiation Oncology, OO University Hospital"
position: "의학물리사"
position_en: "Medical Physicist"

# ---- 교수(professor)만 쓰는 항목 ----
# 교수는 role, name, name_en, aliases와 아래 두 항목만 씁니다(개인 페이지는 없습니다).
# order: 학생 현황 맨 위 교수진 구역에서의 순서(1부터, 정수, 따옴표 없이).
order: 1
# link: 지도교수의 메인 사이트 교수 페이지 주소.
link: "https://ympbel.github.io/member/professor/"
---
