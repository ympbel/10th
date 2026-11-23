# 교수진 정보 수정

`faculty.json`은 교수진 전용 소개 정보입니다. 각 키는 `src/content/members/`의 교수 파일 이름과 일치합니다. 학생 및 졸업생 정보와 독립적으로 수정합니다.

- 이름·영문 이름·표시 순서: 해당 `src/content/members/*.md`의 `name`, `name_en`, `order`
- 직책: `position` / `position_en`
- 소속: `affiliation` / `affiliation_en`
- 연구·강의 분야: `research` / `research_en`
- 소개: `bio` / `bio_en`
- 학력: `education` / `education_en` 배열
- 공식 소개 주소: `source`
- 컬러 사진: `src/assets/portraits/<교수 파일 이름>.jpg`

영문 항목이 없으면 원문을 표시합니다. 비어 있는 소개·학력은 화면에서 생략합니다. 현재 정보와 사진은 공식 홈페이지의 기존 공개 자료에서 옮겼습니다. 직책 변경 등은 이 파일에서 갱신할 수 있습니다. 시트 재수입 시에도 이 파일은 수정되지 않습니다.
