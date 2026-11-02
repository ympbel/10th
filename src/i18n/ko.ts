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
    /** The second name column: the English name on Korean pages, the Korean name on English pages. */
    otherName: '영문 이름',
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
    degreePeriod: '학위 기간',
    participation: '참여율',
    budget: '연구비',
    recipient: '수상자',
    host: '주최',
    title: '제목',
    objective: '목적',
    link: '링크',
    date: '날짜',
    presenter: '발표자',
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
  /** Year pages (/years/<yyyy>/). */
  yearPage: {
    /** Accessible name of the year tab rail. */
    tabs: '연도',
    /** The summary line under the heading, one item per part; `{n}` is the count. */
    summary: {
      joined: '합류 {n}명',
      degrees: '학위 {n}명',
      papers: '논문 {n}편',
      presentations: '발표 {n}건',
      awards: '수상 {n}건',
      projects: '과제 {n}건',
    },
    /** Part headings, in page order. */
    parts: {
      joined: '합류',
      degrees: '학위 취득',
      papers: '논문',
      presentations: '학회 발표',
      awards: '수상',
      projects: '진행 중 과제',
      seminars: '세미나',
      photos: '사진',
    },
    /** The count beside a conference heading. */
    conferenceCount: '{n}건',
    /** Before the corresponding authors in a paper's author line. */
    corresponding: '교신',
    impactFactor: 'IF {n}',
    seminarsCount: '세미나 {n}건',
    seminarsLink: '세미나 게시판에서 보기',
  },
  /** The publication boards (논문, 특허, 발표). */
  publication: {
    /** Accessible name of the row of year links above a board. */
    index: '연도 바로가기',
    /** The note at the top of the papers board: `{total}` papers on the board, `{lab}` of them from `{start}` on. */
    papersNote: '이 게시판에는 논문 {total}편이 모두 있고, 홈의 논문 수 {lab}편은 연구실이 시작된 {start}년 이후만 센 것입니다.',
    /** The section after the lab's years, with the earlier papers (`{from}`–`{to}`), and its cell in the year links. */
    preLab: '연구실 이전 ({from}–{to})',
    preLabTab: '{from}–{to}',
    /** The count beside a heading: papers in the 연구실 이전 section, presentations under a conference. */
    papersCount: '{n}편',
    presentationsCount: '{n}건',
  },
  /** The awards board (수상): the challenge entries in their own section below the years, `{years}` their year or
   * range, and the cell for that section in the year links. */
  awards: {
    challenges: '챌린지 참가 ({years})',
    challengesTab: '챌린지',
  },
  /** The projects board (과제). Budgets are in thousands of won as the sheet gives them; `{n}` is the amount with
   * thousands separators. */
  projects: {
    terms: {
      agency: '부처·사업',
      institution: '수행기관',
      role: '역할',
      participation: '참여율',
      budget: '연구비',
    },
    months: '{n}개월',
    budgetYear: '당해년도 {n}천원',
    budgetTotal: '총 {n}천원',
    acknowledgement: '사사 문구',
    relatedPapers: '관련 논문 {n}편',
  },
  /** The seminars board (세미나): the note on where the posts are, with `{board}` linking the main site's board. */
  seminars: {
    note: '세미나 본문은 {board}에 있습니다.',
    board: 'MPBEL 사이트 세미나 게시판',
    boardHref: 'https://ympbel.github.io/notice/seminar/',
  },
  /** The workshops board (워크샵): the accessible name of a workshop's member list. */
  workshops: {
    members: '참여 구성원',
  },
  /** The photo board (사진): kind labels (photoSchema.kind), the tab rows, the titles of the year and kind pages, the
   * alt text of a photo without a caption, and the accessible name of a photo's member list. */
  photos: {
    kinds: {
      'lab-meeting': '랩미팅',
      conference: '학회',
      retreat: 'MT',
      graduation: '졸업식',
      equipment: '장비',
      other: '기타',
    },
    all: '전체',
    byYear: '연도별 사진',
    byKind: '종류별 사진',
    yearTitle: '사진 {year}',
    kindTitle: '사진 · {kind}',
    alt: '{year}년 {kind}',
    people: '사진 속 구성원',
  },
  /** The comments board: the section at its foot on how to leave a comment (the way is not decided yet). */
  comments: {
    howToLeave: '남기는 법',
    undecided: '댓글을 남기는 방법은 아직 정해지지 않았습니다.',
  },
  /** The boards that start empty (워크샵, 사진, Comments): the format of one record, shown under `empty` until a board
   * has records. `fields` describes each template key in the template's order; `body` is the markdown after the
   * frontmatter. `{kinds}` is filled with the photo kinds and their labels. */
  entryFormat: {
    title: '항목 형식',
    note: '항목 하나가 마크다운 파일 하나입니다. 다음 템플릿을 같은 폴더에 새 이름으로 복사해 값을 바꿉니다.',
    body: '본문',
    fields: {
      workshops: {
        title: '워크샵 이름(필수)',
        title_en: '영문 이름(없으면 영문 페이지에도 한글 이름)',
        date: '날짜(필수): YYYY-MM-DD, 월만 알면 YYYY-MM, 여러 날이면 첫날',
        place: '장소',
        members: '참여한 구성원의 파일 이름(src/content/members/ 안 .md 앞부분) 목록, 이름마다 개인 페이지 링크',
        body: '워크샵 내용(마크다운)',
      },
      photos: {
        image: '사진 경로(필수): 사진 파일은 public/images/photos/<연도>/에 두고, 경로는 /images/photos/<연도>/<파일 이름>',
        year: '연도(필수): 따옴표 없는 정수',
        kind: '종류(필수): {kinds} 중 하나',
        people: '사진에 나온 구성원의 파일 이름 목록, 이름마다 개인 페이지 링크',
        caption: '사진 설명',
        date: '찍은 날짜: YYYY-MM-DD 또는 YYYY-MM',
      },
      comments: {
        name: '글쓴이 이름(필수): 화면에 나오는 그대로',
        date: '글을 남긴 날짜(필수): YYYY-MM-DD',
        body: '남긴 글(마크다운)',
      },
    },
  },
  /** The people boards (학생 현황, 졸업 현황) and the person pages. */
  people: {
    /** Section headings of the boards; `{n}` is the count beside a heading. */
    faculty: '교수진',
    students: '학생',
    degreeHolders: '학위 취득자',
    formers: '거쳐 간 구성원',
    count: '{n}명',
    /** Terms of the member card and the person page header. */
    terms: {
      program: '과정',
      department: '학과·전공',
      joined: '합류',
      degree: '학위',
      affiliation: '현 소속',
      orcid: 'ORCID',
      records: '기록',
    },
    /** A member whose join date has no year (Review Focus 1). */
    joinedUnknown: '합류 연도 미상',
    /** The former members list: the join month. */
    joinedOn: '합류 {date}',
    /** The record counts on a card: `논문 n · 발표 n · 수상 n`. */
    recordCounts: { papers: '논문 {n}', presentations: '발표 {n}', awards: '수상 {n}' },
    roles: { student: '재학', alumni: '졸업', former: '거쳐 간 구성원' },
    /** Person pages: the count beside each part heading (the headings are yearPage.parts), and the note on which
     * papers are collected. */
    partCounts: { papers: '{n}편', presentations: '{n}건', awards: '{n}건' },
    papersNote: '논문은 1저자·공동 1저자·교신저자인 것만 모았습니다.',
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
