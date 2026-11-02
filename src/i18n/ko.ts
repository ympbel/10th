/** Korean UI strings. `en.ts` has the same shape (`typeof ko`). */
export const ko = {
  siteTitle: 'MPBEL 10주년 아카이브',
  logoAlt: 'MPBEL 연세 의학물리 및 의공학 연구실',
  /** The sub-brand beside the logo and on the sub page visual band; the same in both languages. */
  archiveLabel: '10th Anniversary Archive',
  skipToContent: '본문 바로가기',
  mainNav: '주 메뉴',
  menuToggle: '메뉴',
  language: '언어 선택',
  breadcrumb: '현재 위치',
  home: '홈',
  more: '더보기',
  preparing: '준비 중',
  /** Board titles, keyed by menu item key; also the menu item labels (src/lib/menu.ts). */
  boards: {
    students: '학생 현황',
    alumni: '졸업 현황',
    papers: '논문',
    patents: '특허',
    presentations: '발표',
    awards: '수상',
    projects: '과제',
    seminars: '세미나',
    workshops: '워크샵',
    photos: '사진',
    comments: 'Comments',
  },
  /** Table column headers. */
  table: {
    name: '이름',
    nameEn: '영문 이름',
    program: '과정',
    department: '학과',
    joined: '합류',
    degree: '학위',
    affiliation: '현 소속',
    conference: '학회',
    category: '구분',
    presentationTitle: '발표명',
    agency: '부처',
    grantProgram: '사업',
    period: '기간',
    participation: '참여율',
    budget: '연구비',
  },
  /** A board with no records yet. */
  empty: '아직 기록이 없습니다. 추가하는 법은 README를 참고하세요.',
  /** An empty part of a page that has other records. */
  noRecords: '기록 없음',
  /** Home timeline series and legend. */
  timeline: {
    papers: '논문',
    presentations: '학회 발표',
    awards: '수상',
    joined: '합류',
    degrees: '학위 취득',
    barNote: '막대 높이는 항목별 상대값',
    /** Heading beside the year range. */
    title: '열한 해',
    lead: '연도를 누르면 그 해의 논문, 학위, 수상이 아래에 펼쳐집니다.',
    /** The two number lines under each year's bars: `논문 n · 발표 n` / `수상 n · 과제 n`. */
    short: { papers: '논문', presentations: '발표', awards: '수상', projects: '과제' },
  },
  /** Home page, apart from the copy in pages/ko/home.md. */
  home: {
    /** The word beside `intro_title`. */
    introWord: 'Introduction',
    /** The six figures in the intro band. */
    figures: {
      members: '구성원',
      degrees: '학위 취득',
      papers: '논문(2016년 이후)',
      presentations: '학회 발표',
      awards: '수상',
      projects: '연구과제',
    },
    /** Year panel column headings and their counts; `{n}` is the count, `{year}` the panel's year. */
    papersCount: '논문 {n}편',
    degreesTitle: '학위 취득',
    degreesCount: '{n}명',
    awardsTitle: '수상',
    awardsCount: '{n}건',
    /** The link at the foot of each year panel column, and the full names screen readers hear for it. */
    viewAll: '모두 보기',
    viewAllPapers: '{year}년 논문 모두 보기',
    viewAllDegrees: '{year}년 학위 취득 모두 보기',
    viewAllAwards: '{year}년 수상 모두 보기',
    /** The board link grid. */
    boardLinks: '게시판 바로가기',
  },
  footer: {
    name: 'Yonsei Medical Physics and Biomedical Engineering Lab.',
    address: '03722 서울특별시 서대문구 연세로 50 연세대학교',
    tel: 'TEL. +82-2-2228-8118 / FAX. +82-2-2227-7823',
    archive: 'MPBEL 10th Anniversary Archive',
    mainSite: '메인 사이트로',
    mainSiteHref: 'https://ympbel.github.io/',
    /** `COPYRIGHT @2026 MPBEL ALL RIGHT RESERVED.`, split so `MPBEL` can carry its color. */
    copyright: 'COPYRIGHT @2026',
    copyrightName: 'MPBEL',
    copyrightTail: 'ALL RIGHT RESERVED.',
  },
};
