---
# 사진 템플릿. 사진 한 장이 파일 하나입니다. 사진 게시판에 연도 탭과 종류 탭으로 나뉘어 나옵니다.
# 사진 파일은 public/images/photos/<연도>/ 폴더에 넣고(예: public/images/photos/2026/lab-meeting-01.jpg),
# 이 파일을 복사해 사진 파일과 같은 이름으로 저장합니다(예: 2026-lab-meeting-01.md). 겹치지만 않으면 됩니다.
# `_`로 시작하는 파일(이 템플릿)은 사이트에 나오지 않습니다.
# 문자열 값은 큰따옴표로 감쌉니다. 연도는 따옴표 없이 씁니다. 날짜는 "YYYY-MM-DD", 월만 알면 "YYYY-MM"으로 씁니다.
# [필수]가 아닌 항목은 값이 없으면 그 줄을 지웁니다. 아래에 없는 항목을 넣으면 빌드가 실패합니다.

# [필수] 사진 경로. public 폴더 안의 경로를 /로 시작해 씁니다(public은 빼고 씁니다).
# 사이트가 배포된 하위 경로는 사이트가 앞에 붙이므로, 여기에는 /images/부터 씁니다.
image: "/images/photos/2026/lab-meeting-01.jpg"

# [필수] 연도(정수). 연도 탭과 연도 페이지에 쓰입니다.
year: 2026

# [필수] 종류. 다음 중 하나:
#   lab-meeting 랩미팅 / conference 학회 / retreat MT / graduation 졸업식 / equipment 장비 / other 기타
kind: "lab-meeting"

# 사진에 나온 구성원의 파일 이름(src/content/members/ 안 .md 앞부분) 목록. 사진 아래 이름 칩(개인 페이지 링크)이 됩니다.
# 없으면 줄을 지우거나 people: [] 로 둡니다.
people:
  - "gildong-hong"

# 사진 설명.
caption: "2026년 3월 랩미팅"

# 찍은 날짜.
date: "2026-03-05"
---
