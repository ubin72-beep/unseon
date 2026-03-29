/* =========================================================
   운세ON — js/career.js
   직업운 · 직무적성 · 취업운 · 이직운 · 승진운 전용 엔진

   [포함 기능]
   1. 오행별 직업 DB (300+ 직종, 세부 분류)
   2. 사주 오행 → 적성 유형 분석 (5가지 직업 성향)
   3. 직무 역량 강점·약점 분석
   4. 취업·이직·승진 시기 계산 (월별 길흉)
   5. 면접 길일 계산
   6. 2026년 직업군별 채용 트렌드
   7. 사용자 입력 파싱 (희망 직종, 현재 직장, 경력 등)
   8. Gemini 프롬프트 텍스트 변환
   ========================================================= */

/* =====================================================
   1. 오행별 직업·직종 DB
   ===================================================== */
const OHENG_CAREER_DB = {

  '木': {
    element: '목(木)', emoji: '🌳',
    aptitude: '교육·창조·기획형',
    personality: '창의적이고 진취적. 성장시키고 가르치는 데 탁월. 새로운 아이디어 창출 능력 뛰어남.',
    strength:   '기획력, 창의성, 교육 능력, 추진력, 성장 마인드, 비전 제시',
    weakness:   '마무리 취약, 세밀한 반복 작업 힘듦, 중간 포기 경향, 꼼꼼함 부족',
    workStyle:  '자율적 환경·프로젝트형 업무·리더십 역할이 최적. 단순 반복 업무에서 에너지 고갈',
    categories: {
      '교육·연구':    ['교사·교수', '학원 강사', '교육 컨텐츠 개발', '연구원', '도서관 사서', '독서교육 전문가'],
      '기획·컨설팅':  ['프로젝트 기획자', '경영 컨설턴트', '스타트업 창업가', '사업 개발팀', 'UX 기획자', '전략 기획팀'],
      '출판·미디어':  ['작가·저술가', '편집자', '기자·언론인', '출판 기획', '콘텐츠 크리에이터', '유튜버·팟캐스터'],
      '환경·자연':    ['환경 연구원', '조경사', '농업 전문가', '자연치유사', '허브·식물 전문가'],
      '의료·건강':    ['한의사', '영양사·식이요법사', '자연치유 전문가', '요가·명상 강사'],
    },
    bestJob: ['교사·강사', '기획자', '작가·크리에이터', '컨설턴트', '창업가'],
    avoidJob: ['단순 생산직', '금융 투기업', '정밀 기계 작업직'],
    salaryType: '프리랜서·프로젝트 수당형이 급여형보다 유리. 성과급 체계에서 탁월',
    growthPath: '전문가 → 시니어 컨설턴트 → 독립 창업 or 임원. 독립 후 더 빛남',
  },

  '火': {
    element: '화(火)', emoji: '🔥',
    aptitude: '표현·소통·서비스형',
    personality: '열정적이고 카리스마 있음. 사람을 끌어당기는 매력. 표현력·소통력이 뛰어나 대면 서비스에 강점.',
    strength:   '표현력, 소통 능력, 열정, 인지도 구축력, 빠른 적응력, 고객 응대',
    weakness:   '지속력 부족, 감정 기복, 세밀함 부족, 충동적 결정, 장기 계획 부족',
    workStyle:  '사람과 만나는 대면 업무·창의적 표현 업무 최적. 혼자 하는 정적 업무에서 에너지 저하',
    categories: {
      '마케팅·홍보':  ['광고 기획자', 'SNS 마케터', 'PR 전문가', '브랜드 매니저', '유튜버·인플루언서'],
      '서비스·영업':  ['영업직', '고객서비스', '호텔·관광 서비스', '이벤트 플래너', '웨딩 플래너'],
      '뷰티·패션':    ['미용사·헤어디자이너', '메이크업 아티스트', '패션 디자이너', '스타일리스트', '피부관리사'],
      '예술·연예':    ['배우·모델', '가수·뮤지션', '방송인', '사진작가', '공연 기획자', '게임 캐릭터 디자이너'],
      '요식·외식':    ['셰프·요리사', '카페 바리스타', '푸드 스타일리스트', '외식업 창업'],
      '교육·강연':    ['스피치 강사', '강연자', '기업 교육 트레이너', '동기부여 코치'],
    },
    bestJob: ['마케터', '영업 전문가', '뷰티 아티스트', '방송인·크리에이터', '서비스 창업가'],
    avoidJob: ['정밀 기계직', '장기 연구직', '냉정한 판단 요구 금융직'],
    salaryType: '인센티브·성과급 구조에서 최고 성과. 기본급만 있는 환경은 동기 저하',
    growthPath: '현장 담당 → 팀장 → 사업부장. 또는 독립 브랜드 창업으로 성공',
  },

  '土': {
    element: '토(土)', emoji: '🌍',
    aptitude: '안정·신뢰·중재형',
    personality: '믿음직하고 성실함. 꾸준한 노력으로 안정적 성과. 중재·조율 능력 탁월. 조직 내 신뢰도 높음.',
    strength:   '신뢰도, 성실성, 중재 능력, 장기 지속력, 안정성, 책임감',
    weakness:   '변화 대응 느림, 혁신 부족, 보수적 성향, 기회 포착 늦음',
    workStyle:  '안정적 조직문화·규칙적 업무 환경 최적. 잦은 이직·변화 많은 환경에서 스트레스',
    categories: {
      '금융·보험':    ['은행원', '보험 설계사', '세무사', '회계사', '재무 분석가', '신용분석가'],
      '부동산·건설':  ['부동산 중개사', '건설 감리', '인테리어 디자이너', '건축사', '시설 관리'],
      '행정·공무':    ['공무원', '행정직', '사회복지사', '복지관 운영', '지방자치단체 업무'],
      '의료·복지':    ['간호사', '물리치료사', '작업치료사', '요양보호사', '사회복지 상담사'],
      '유통·물류':    ['물류 관리', '구매 담당', '유통 MD', '재고 관리', '공급망 관리'],
    },
    bestJob: ['공무원·행정직', '은행·금융직', '사회복지사', '부동산 전문가', '회계사'],
    avoidJob: ['급변하는 스타트업', '리스크 높은 투기성 사업', '감성 중심 예술 분야'],
    salaryType: '고정급·연봉제 선호. 안정적 복지 혜택이 있는 대기업·공공기관 최적',
    growthPath: '실무 담당 → 과장 → 부장 → 임원. 꾸준한 직급 상승. 이직보다 한 조직 장기 근속',
  },

  '金': {
    element: '금(金)', emoji: '⚡',
    aptitude: '전문·기술·분석형',
    personality: '결단력이 강하고 원칙주의. 정밀하고 섬세한 작업에 강함. 기술·전문성으로 차별화 능력 탁월.',
    strength:   '결단력, 정밀함, 기술력, 의리·원칙 준수, 전문성, 분석력',
    weakness:   '융통성 부족, 타협 어려움, 냉정함이 인간관계에 영향, 감성 소통 약함',
    workStyle:  '전문성 요구 업무·독립적 작업 환경 최적. 모호한 업무 지시나 팀워크 강요 환경에서 불만',
    categories: {
      'IT·기술':      ['소프트웨어 개발자', '데이터 사이언티스트', 'AI 엔지니어', '사이버 보안 전문가', 'DevOps 엔지니어'],
      '법률·행정':    ['변호사', '검사·판사', '법무사', '노무사', '특허 전문가', '행정사'],
      '의료·의약':    ['의사(외과·치과)', '약사', '의료기기 전문가', '임상시험 연구원'],
      '정밀·기계':    ['기계 엔지니어', '정밀 부품 설계', '품질 관리 전문가', '금속 가공 기술자'],
      '금융·투자':    ['투자 분석가', 'PB(프라이빗뱅커)', '펀드매니저', '리스크 매니저'],
    },
    bestJob: ['IT 개발자·엔지니어', '변호사·법조인', '의사·약사', '투자 분석가', '정밀 기술직'],
    avoidJob: ['감성 서비스직', '예술·창작 분야', '불확실성 높은 스타트업 초기'],
    salaryType: '전문직 프리미엄 연봉 or 고정급 + 성과급 혼합. 전문성 인정받는 구조에서 최대 역량 발휘',
    growthPath: '주니어 전문직 → 시니어 전문가 → 독립 개업 or 파트너. 전문성 심화가 핵심',
  },

  '水': {
    element: '수(水)', emoji: '💧',
    aptitude: '유연·네트워크·정보형',
    personality: '지혜롭고 유연함. 다양한 분야에 적응력 강함. 정보·네트워크·아이디어 연결 능력 탁월.',
    strength:   '적응력, 지혜, 정보 수집 능력, 유연성, 탐구심, 네트워킹',
    weakness:   '결단력 부족, 방향성 잃기 쉬움, 집중력 산만, 우유부단',
    workStyle:  '다양한 경험·유동적 업무 최적. 하나의 루틴에 고정된 환경에서 능력 저하',
    categories: {
      '연구·분석':    ['데이터 분석가', '리서치 전문가', '시장 조사원', '정책 연구원', '통계 전문가'],
      '미디어·통신':  ['기자·PD', '번역가·통역가', 'SNS 전문가', '방송 작가', '앱 개발자'],
      '여행·무역':    ['무역 전문가', '해외 영업', '여행 기획자', '관광 가이드', '항공 관련'],
      '상담·코칭':    ['심리상담사', '커리어 코치', '라이프 코치', '멘탈 트레이너'],
      '전문직·프리':  ['프리랜서', '컨설턴트', '독립 연구원', '번역·통역가', '유튜버·크리에이터'],
    },
    bestJob: ['데이터 분석가', '기자·방송인', '무역·해외영업', '심리상담사', '프리랜서 전문직'],
    avoidJob: ['단순 반복 생산직', '장기 자본 고정 사업', '지나치게 경직된 조직'],
    salaryType: '프리랜서·계약직·복수 수입원 구조에서 최대 능력 발휘. 단일 월급보다 다채널 수입',
    growthPath: '다양한 경험 쌓기 → 전문 분야 선택 → 독립 전문가 or 플랫폼 창업. 넓은 경험이 강점',
  },
};

/* =====================================================
   2. 직업 성향 유형 (MBTI 스타일)
   ===================================================== */
const CAREER_TYPE_DETAIL = {
  '교육·창조·기획형': {
    emoji: '🌱',
    desc: '새로운 것을 만들고 사람을 성장시키는 데서 보람을 느끼는 유형',
    strengths: ['창의적 문제 해결', '비전 제시', '사람 키우기', '기획·설계'],
    workEnv: '자율성 보장, 창의적 분위기, 프로젝트 중심',
    boss: '자율을 주는 리더십 선호. 마이크로 관리에 극심한 스트레스',
    burnout: '반복 업무, 창의성 무시, 성장 없는 환경에서 번아웃 빠름',
  },
  '표현·소통·서비스형': {
    emoji: '🔥',
    desc: '사람과 교류하고 표현하는 데서 에너지를 얻는 유형',
    strengths: ['인간 관계 구축', '프레젠테이션', '고객 응대', '팀 분위기 UP'],
    workEnv: '팀 협업, 대면 활동, 다양한 사람과의 교류',
    boss: '인정·칭찬해주는 리더십 선호. 무시당하면 급격히 동기 저하',
    burnout: '혼자 하는 단순 업무, 인정받지 못할 때 번아웃',
  },
  '안정·신뢰·중재형': {
    emoji: '🌍',
    desc: '꾸준함과 신뢰로 조직의 기반을 만드는 유형',
    strengths: ['책임감', '장기 안정적 성과', '갈등 중재', '실행력'],
    workEnv: '명확한 역할 분담, 안정적 조직문화, 규칙적 업무',
    boss: '공정하고 명확한 지시를 주는 리더십 선호. 불확실한 지시에 스트레스',
    burnout: '잦은 조직 변경, 명확하지 않은 역할, 신뢰 깨질 때 번아웃',
  },
  '전문·기술·분석형': {
    emoji: '⚡',
    desc: '전문성과 기술로 문제를 정밀하게 해결하는 유형',
    strengths: ['깊은 전문성', '정밀한 분석', '원칙 준수', '고품질 결과물'],
    workEnv: '전문성 인정, 독립적 작업 공간, 명확한 목표와 기준',
    boss: '전문성 존중해주는 리더십 선호. 무능한 상사 밑에서 극심한 불만',
    burnout: '전문성 무시, 잦은 방향 변경, 비합리적 결정 강요 시 번아웃',
  },
  '유연·네트워크·정보형': {
    emoji: '💧',
    desc: '정보를 연결하고 다양한 분야를 넘나드는 유형',
    strengths: ['정보 수집·분석', '빠른 적응', '네트워킹', '다분야 융합'],
    workEnv: '다양한 프로젝트, 유연한 근무 형태, 새로운 도전 허용',
    boss: '자율과 방향만 주는 리더십 선호. 너무 세밀한 관리에 답답함',
    burnout: '단조로운 반복, 성장 없는 환경, 인간관계 고립 시 번아웃',
  },
};

/* =====================================================
   3. 오행별 관인(官印) 분석 — 직장운 핵심
   ===================================================== */
// 용신(用神)이 일간(日干)에 官·印을 생해주면 직장운 강화
const CAREER_FORTUNE_2026 = {
  '甲木': { trend: '승진·인정 기회', desc: '2026 병오년 火 기운이 木을 生함. 창의적 역량 발휘 최적. 상반기 기회 집중' },
  '乙木': { trend: '인간관계 확장', desc: '火 기운 生木. 소통·협업 프로젝트에서 두각. 5~7월 주요 기회' },
  '丙火': { trend: '명성·리더십 상승', desc: '병오년 丙=比劫 과다 주의. 경쟁 심화. 협업보다 독립 방향 유리' },
  '丁火': { trend: '내실 다지기', desc: '음화(陰火). 번오년 양화 에너지로 실력이 빛남. 조용한 승진 가능' },
  '戊土': { trend: '안정 유지', desc: '土는 火에 生됨. 상사 신임 두터워짐. 10~11월 조직 내 인정' },
  '己土': { trend: '세밀한 성과', desc: '음토. 보조·조율 역할에서 인정. 하반기 승진 발령 가능' },
  '庚金': { trend: '결단과 변화', desc: '火剋金. 2026년 어려운 해. 이직 신중. 전문성 강화 집중 시기' },
  '辛金': { trend: '유지 및 준비', desc: '음금. 火剋金 영향. 현 직장 유지하며 역량 개발. 2027년 도약 준비' },
  '壬水': { trend: '지혜 발휘', desc: '火剋水 경향. 신중한 행보 필요. 감정 관리·보고 체계 정비 집중' },
  '癸水': { trend: '은인 등장', desc: '음수. 주변 귀인의 도움 가능성. 5~6월 뜻밖의 추천·기회 주목' },
};

/* =====================================================
   4. 취업·이직·승진 시기 월별 분석 (2026년)
   ===================================================== */
const CAREER_MONTH_2026 = {
  1:  { grade: '보통', hire: '대기업 공채 준비 시즌. 서류 정비·포트폴리오 완성 집중' },
  2:  { grade: '길(吉)', hire: '상반기 채용 본격 시작. 이력서 제출·면접 참여 활발. 木 기운으로 새 출발 기운' },
  3:  { grade: '대길(大吉)', hire: '봄 신입 공채 피크. 면접 기운 최고. IT·스타트업·대기업 모두 채용 활발' },
  4:  { grade: '대길(大吉)', hire: '상반기 채용 마무리. 이직·전직 성공률 높음. 협상력도 강해짐' },
  5:  { grade: '길(吉)', hire: '상반기 후발 채용. 인턴·계약직 기회 많음. 화(火) 에너지로 적극 어필 효과' },
  6:  { grade: '보통', hire: '채용 소강기. 자격증 공부·역량 개발 집중 시기' },
  7:  { grade: '보통', hire: '하반기 준비 시즌. 자기소개서·포트폴리오 재정비' },
  8:  { grade: '길(吉)', hire: '하반기 채용 시작. 대기업·공기업 하반기 공채 시작. 金 기운 결단력 UP' },
  9:  { grade: '대길(大吉)', hire: '하반기 채용 피크. 연중 두 번째 최고 취업·이직 시기. 전략적 지원 필요' },
  10: { grade: '대길(大吉)', hire: '하반기 공채 마무리. 연봉 협상 기운 강함. 이직 최적기' },
  11: { grade: '길(吉)', hire: '연말 채용 마무리. 내년 상반기 준비 병행 시작' },
  12: { grade: '주의', hire: '연말 결산·인사 시즌. 재직자 평가 기간. 큰 이직보다 현 직장 성과 마무리' },
};

/* =====================================================
   5. 면접 길일 (요일·숫자)
   ===================================================== */
const INTERVIEW_LUCKY = {
  weekday: {
    '월요일': { grade: '대길', desc: '한 주 시작 에너지. 면접관도 집중도 높음. 첫인상 강렬히 남길 기회' },
    '화요일': { grade: '길', desc: '화(火) 에너지. 적극적 표현력 UP. 열정 어필에 최적' },
    '수요일': { grade: '길', desc: '균형의 날. 안정적 면접. 조리 있는 답변에 유리' },
    '목요일': { grade: '대길', desc: '목(木) 기운. 성장 에너지. 미래 비전 제시 인터뷰에 최적' },
    '금요일': { grade: '보통', desc: '면접관 주의 분산 가능. 오전 시간대 선택 추천' },
  },
  luckyDates: [3, 5, 6, 8, 11, 13, 15, 16, 17, 21, 23, 24, 25],
  avoidDates: [4, 9, 14, 19, 20, 22, 28],
  luckyTime: ['오전 10시~12시', '오후 2시~4시'],
  avoidTime: ['오전 8시 이전', '오후 5시 이후'],
};

/* =====================================================
   6. 자격증·시험 길일
   ===================================================== */
const EXAM_TIMING_2026 = {
  bestMonths: [
    { month: '3월', desc: '봄 기운. 집중력 최고. 상반기 자격증 시험 응시 강력 추천' },
    { month: '4월', desc: '성장 기운. 꾸준한 학습이 결실. 필기·실기 연달아 도전 적합' },
    { month: '9월', desc: '가을 집중력. 하반기 자격증 최적 달. 금(金) 기운으로 결단·완성' },
    { month: '10월', desc: '수확의 달. 그동안 준비한 것이 결실 맺는 시기' },
  ],
  avoid: [
    { month: '7~8월', desc: '火 기운 과다. 집중력 저하. 시험보다 집중 공부 시기로 활용' },
    { month: '12월', desc: '연말 분산. 시험보다 내년 대비 계획 수립 집중' },
  ],
  luckySubjects: {
    '木': ['국어·언어 관련', '교육 자격증', '사회복지사', '환경 관련 자격'],
    '火': ['마케팅·광고', '요리 관련 자격', '미용 자격증', '스포츠·체육 관련'],
    '土': ['공인중개사', '세무사·회계사', '사회복지사', '행정직 자격증'],
    '金': ['IT 자격증(정보처리기사)', '법무사·변호사', '의료 관련 자격', '기계 기술사'],
    '水': ['번역·통역 자격', '데이터 분석사', '심리상담사', '정보·통신 자격'],
  },
};

/* =====================================================
   7. 사용자 입력 파싱 (직업운 전용)
   ===================================================== */
function parseCareerInput(text) {
  const result = {
    found: false,
    birthYear: null, birthMonth: null, birthDay: null, birthHour: null,
    isLunar: false,
    gender: null,
    // 직업 관련
    currentJob: null,          // 현재 직장/직종
    desiredJob: null,          // 희망 직종
    experience: null,          // 경력 연수
    industry: null,            // 업종
    companySize: null,         // 회사 규모 (대기업/중소/스타트업/공공기관)
    position: null,            // 직급/포지션
    // 상황
    situation: null,           // 'employ'(취업) | 'change'(이직) | 'promotion'(승진) | 'aptitude'(적성)
    targetMonth: null,         // 목표 시기 (월)
    currentSalary: null,       // 현재 연봉 (만원)
    desiredSalary: null,       // 희망 연봉 (만원)
    skills: [],                // 보유 기술
    concerns: [],              // 고민 사항
    certifications: [],        // 보유 자격증
  };

  // 생년월일
  const yearM  = text.match(/(\d{4})년/);
  const monM   = text.match(/(\d{1,2})월/);
  const dayM   = text.match(/(\d{1,2})일/);
  const hourM  = text.match(/(\d{1,2})시/);
  if (yearM)  result.birthYear  = parseInt(yearM[1]);
  if (monM)   result.birthMonth = parseInt(monM[1]);
  if (dayM)   result.birthDay   = parseInt(dayM[1]);
  if (hourM)  result.birthHour  = parseInt(hourM[1]);
  if (/음력/.test(text)) result.isLunar = true;

  // 성별
  if (/남자|남성|남편|오빠|형/i.test(text))  result.gender = 'male';
  if (/여자|여성|아내|언니|누나/i.test(text)) result.gender = 'female';

  // 상황 감지
  if (/취업|구직|취준|신입/.test(text))       result.situation = 'employ';
  else if (/이직|전직|이동/.test(text))        result.situation = 'change';
  else if (/승진|진급|팀장|임원/.test(text))   result.situation = 'promotion';
  else if (/적성|어떤 일|맞는 직업|직무/.test(text)) result.situation = 'aptitude';
  else if (/시험|자격증|합격|공무원 시험|수능|어학/.test(text)) result.situation = 'exam';
  else if (/프리랜서|독립|1인 사업|퇴사 후|개인 사업자/.test(text)) result.situation = 'freelance';

  // 현재 직종 파싱
  const jobKeywords = ['개발자', '디자이너', '교사', '강사', '간호사', '의사', '변호사',
    '회계사', '세무사', '마케터', '영업직', '기획자', '관리자', '공무원', '연구원',
    '작가', '기자', 'PD', '상담사', '트레이너', '요리사', '미용사'];
  for (const k of jobKeywords) {
    if (text.includes(k)) { result.currentJob = k; break; }
  }

  // 희망 직종 파싱 (현재 직종과 다른 키워드)
  const desiredKeywords = ['되고 싶', '하고 싶', '희망 직종', '관심 직종', '전향'];
  for (const kw of desiredKeywords) {
    if (text.includes(kw)) {
      for (const k of jobKeywords) {
        if (text.includes(k) && k !== result.currentJob) {
          result.desiredJob = k;
          break;
        }
      }
      break;
    }
  }

  // 경력 연수
  const expM = text.match(/(\d+)\s*년\s*(?:차|경력|근무)/);
  if (expM) result.experience = parseInt(expM[1]);

  // 회사 규모
  if (/대기업|삼성|현대|LG|SK|롯데/.test(text))  result.companySize = '대기업';
  else if (/중소|중견/.test(text))                 result.companySize = '중소·중견기업';
  else if (/스타트업|창업회사/.test(text))          result.companySize = '스타트업';
  else if (/공공|공기업|공무원|국가/.test(text))    result.companySize = '공공기관·공무원';

  // 직급
  const positions = ['신입', '주임', '대리', '과장', '차장', '부장', '임원', '팀장', '부팀장', '이사', 'CEO'];
  for (const p of positions) {
    if (text.includes(p)) { result.position = p; break; }
  }

  // 업종 (간단)
  const industryMap = [
    ['IT', 'IT·소프트웨어'], ['개발', 'IT·개발'], ['금융', '금융·은행'],
    ['교육', '교육·학원'], ['의료', '의료·병원'], ['제조', '제조업'],
    ['유통', '유통·물류'], ['미디어', '미디어·방송'], ['건설', '건설·부동산'],
    ['마케팅', '마케팅·광고'], ['컨설팅', '컨설팅·전문직'],
  ];
  for (const [kw, val] of industryMap) {
    if (text.includes(kw)) { result.industry = val; break; }
  }

  // 연봉
  const currSalM = text.match(/현재\s*(?:연봉|급여)[^\d]*(\d+)\s*(?:만원|만)/);
  const desSalM  = text.match(/(?:희망|목표)\s*(?:연봉|급여)[^\d]*(\d+)\s*(?:만원|만)/);
  if (currSalM) result.currentSalary = parseInt(currSalM[1]);
  if (desSalM)  result.desiredSalary = parseInt(desSalM[1]);

  // 기술 스택 (IT 중심)
  const techKeywords = ['Java', 'Python', 'JavaScript', 'React', 'Vue', 'Node', 'AWS',
    'AI', 'ML', '데이터', 'SQL', 'Spring', 'iOS', 'Android', 'Flutter'];
  techKeywords.forEach(k => { if (text.includes(k)) result.skills.push(k); });

  // 고민 사항
  if (/번아웃|지쳤|힘들/.test(text))           result.concerns.push('번아웃·탈진');
  if (/연봉|급여|돈/.test(text))               result.concerns.push('연봉 협상');
  if (/상사|팀장|인간관계|갈등/.test(text))    result.concerns.push('직장 내 인간관계');
  if (/야근|워라밸|워크라이프/.test(text))      result.concerns.push('워라밸');
  if (/미래|불안|걱정/.test(text))             result.concerns.push('직업적 불확실성');

  // 자격증
  const certKeywords = ['정보처리기사', '공인중개사', '세무사', '회계사', '변호사', '의사면허',
    '교원자격증', 'TOEIC', 'OPIC', 'PMP', 'SQLD'];
  certKeywords.forEach(k => { if (text.includes(k)) result.certifications.push(k); });

  if (result.birthYear || result.situation || result.currentJob || result.desiredJob) {
    result.found = true;
  }

  return result;
}

/* =====================================================
   8. 사주 오행 → 직업 적성 분석
   ===================================================== */
function analyzeCareerAptitude(saju) {
  if (!saju || saju.error) return null;

  let dominantOheng = saju.yongshin ||
    (saju.oheng ? Object.entries(saju.oheng).sort((a,b)=>b[1]-a[1])[0]?.[0] : '土');

  const db = OHENG_CAREER_DB[dominantOheng];
  const typeDetail = CAREER_TYPE_DETAIL[db.aptitude];

  // 2순위 오행 (생해주는 오행)
  const SANGSAENG = { '木':'水', '火':'木', '土':'火', '金':'土', '水':'金' };
  const secondOheng = SANGSAENG[dominantOheng];
  const secondDB = secondOheng ? OHENG_CAREER_DB[secondOheng] : null;

  return {
    dominantOheng,
    aptitude: db.aptitude,
    personality: db.personality,
    strength: db.strength,
    weakness: db.weakness,
    workStyle: db.workStyle,
    bestJob: db.bestJob,
    avoidJob: db.avoidJob,
    salaryType: db.salaryType,
    growthPath: db.growthPath,
    typeDetail,
    secondOheng,
    secondBestJob: secondDB?.bestJob || [],
    categories: db.categories,
  };
}

/* =====================================================
   9. 취업·이직·승진 시기 계산
   ===================================================== */
function getCareerTiming(dominant, situation) {
  // 오행별 유리한 달
  const OHENG_GOOD_MONTHS = {
    '木': [2, 3, 4],       // 봄 - 木 기운 활성
    '火': [3, 4, 5, 9],    // 봄~여름 초, 가을
    '土': [3, 4, 9, 10],   // 봄, 가을
    '金': [8, 9, 10],      // 가을 - 金 기운 활성
    '水': [9, 10, 11, 2],  // 가을~겨울, 봄 초
  };

  const goodMonths = OHENG_GOOD_MONTHS[dominant] || [3, 4, 9];
  const monthDetails = goodMonths.map(m => ({
    month: m + '월',
    ...CAREER_MONTH_2026[m],
  }));

  return {
    goodMonths: monthDetails,
    bestMonths: goodMonths.slice(0, 2).map(m => m + '월'),
    interviewLucky: INTERVIEW_LUCKY,
    examTiming: situation === 'employ' ? EXAM_TIMING_2026 : null,
  };
}

/* =====================================================
   10. Gemini 프롬프트 텍스트 변환
   ===================================================== */
function careerToPromptText(input, saju, category) {
  if (!input || !input.found) return '';

  let text = '\n\n【직업·커리어 사전 분석 데이터 (이 데이터를 기반으로 상담할 것)】\n';

  // 기본 정보
  if (input.birthYear)  text += '📅 생년: ' + input.birthYear + '년\n';
  if (input.gender)     text += '⚥  성별: ' + (input.gender === 'male' ? '남성' : '여성') + '\n';
  if (input.currentJob) text += '💼 현재 직종: ' + input.currentJob + '\n';
  if (input.experience) text += '📆 경력: ' + input.experience + '년\n';
  if (input.industry)   text += '🏢 업종: ' + input.industry + '\n';
  if (input.companySize)text += '🏭 회사 규모: ' + input.companySize + '\n';
  if (input.position)   text += '🎖️ 직급: ' + input.position + '\n';
  if (input.situation)  {
    const situMap = { employ:'취업 준비 중', change:'이직 검토 중', promotion:'승진 준비', aptitude:'직무 적성 탐색' };
    text += '🔍 현재 상황: ' + (situMap[input.situation] || input.situation) + '\n';
  }
  if (input.currentSalary) text += '💰 현재 연봉: ' + input.currentSalary.toLocaleString() + '만원\n';
  if (input.desiredSalary) text += '🎯 희망 연봉: ' + input.desiredSalary.toLocaleString() + '만원\n';
  if (input.skills.length > 0)         text += '🛠️ 보유 기술: ' + input.skills.join(', ') + '\n';
  if (input.certifications.length > 0) text += '📜 자격증: ' + input.certifications.join(', ') + '\n';
  if (input.concerns.length > 0)       text += '😟 고민: ' + input.concerns.join(', ') + '\n';

  // 사주 오행 기반 직업 적성 분석
  const aptitude = analyzeCareerAptitude(saju);
  if (aptitude) {
    text += '\n🔮 사주 오행 기반 직업 적성 분석:\n';
    text += '   지배/용신 오행: ' + aptitude.dominantOheng + '\n';
    text += '   직업 유형: ' + aptitude.aptitude + ' ' + aptitude.typeDetail?.emoji + '\n';
    text += '   성격 특성: ' + aptitude.personality + '\n';
    text += '   직업 강점: ' + aptitude.strength + '\n';
    text += '   직업 약점: ' + aptitude.weakness + '\n';
    text += '   최적 업무환경: ' + aptitude.workStyle + '\n\n';

    text += '📊 추천 직종 Top 5:\n';
    aptitude.bestJob.slice(0, 5).forEach((job, i) => {
      text += '   ' + (i+1) + '. ' + job + '\n';
    });

    if (aptitude.secondBestJob.length > 0) {
      text += '\n📌 2순위 적합 직종 (' + aptitude.secondOheng + ' 오행):\n';
      aptitude.secondBestJob.slice(0, 3).forEach(job => {
        text += '   - ' + job + '\n';
      });
    }

    text += '\n📋 세부 직종 카테고리:\n';
    Object.entries(aptitude.categories).slice(0, 3).forEach(([cat, list]) => {
      text += '   [' + cat + '] ' + list.slice(0, 4).join(', ') + '\n';
    });

    text += '\n⚠️ 피해야 할 직종: ' + aptitude.avoidJob.join(', ') + '\n';
    text += '💰 급여 유형: ' + aptitude.salaryType + '\n';
    text += '📈 성장 경로: ' + aptitude.growthPath + '\n';

    // 번아웃 패턴
    if (aptitude.typeDetail) {
      text += '\n🔥 번아웃 주의 상황: ' + aptitude.typeDetail.burnout + '\n';
      text += '👔 이상적 상사 스타일: ' + aptitude.typeDetail.boss + '\n';
    }
  }

  // 2026년 직업운 시기 분석
  const dominant = aptitude?.dominantOheng || '土';
  const timing = getCareerTiming(dominant, input.situation);

  text += '\n📅 2026년 직업운 유리한 달:\n';
  timing.goodMonths.forEach(m => {
    text += '   ' + m.month + ': ' + m.grade + ' — ' + m.hire + '\n';
  });

  // 면접·이직 길일
  if (input.situation === 'employ' || input.situation === 'change') {
    text += '\n🎯 면접 길일 정보:\n';
    text += '   추천 요일: 월요일(대길), 목요일(대길), 화·수요일(길)\n';
    text += '   길일 날짜: ' + INTERVIEW_LUCKY.luckyDates.join('일, ') + '일\n';
    text += '   피해야 할 날: ' + INTERVIEW_LUCKY.avoidDates.join('일, ') + '일\n';
    text += '   추천 시간대: ' + INTERVIEW_LUCKY.luckyTime.join(', ') + '\n';
  }

  // 승진 분석
  if (input.situation === 'promotion') {
    text += '\n⬆️ 승진 전략 포인트:\n';
    text += '   최적 월: ' + timing.bestMonths.join(', ') + '\n';
    if (saju && saju.dayGan) {
      const fortune = CAREER_FORTUNE_2026[saju.dayGan];
      if (fortune) {
        text += '   일간(' + saju.dayGan + ') 2026 직업운: ' + fortune.trend + '\n';
        text += '   ' + fortune.desc + '\n';
      }
    }
  }

  // AI 지침 (시험운·프리랜서운은 내부에서 별도 섹션 추가 후 AI 지침 포함)
  const _skipAIGuide = (category === '시험운합격운' || category === '프리랜서운');
  if (!_skipAIGuide) text += '\n【AI 상담 지침】\n';

  if (category === '직무적성') {
    text += '1. 사주 오행 기반 직업 유형을 가장 먼저 명확히 제시하세요.\n';
    text += '2. 추천 직종을 1~5위로 순위를 매기고 각각의 이유를 오행과 연결하여 설명하세요.\n';
    text += '3. 이 사람의 직업 강점과 약점을 구체적으로 분석하세요.\n';
    text += '4. 번아웃 패턴과 최적 업무 환경을 실용적으로 조언하세요.\n';
    text += '5. 현재 직종이 있다면 사주와 얼마나 맞는지 분석하세요.\n';
    text += '6. 직업 성장 경로와 커리어 로드맵을 구체적으로 제시하세요.\n';
  } else if (category === '취업운') {
    text += '1. 2026년 취업하기 가장 좋은 달 Top 3을 명확히 제시하세요.\n';
    text += '2. 사주 기반 적합 직종과 추천 업종을 구체적으로 안내하세요.\n';
    text += '3. 면접 길일과 피해야 할 날짜를 실용적으로 안내하세요.\n';
    text += '4. 서류·면접 준비 시기 전략도 사주 기운과 연결하여 제안하세요.\n';
    text += '5. 취업 성공을 높이는 구체적인 행동 조언을 포함하세요.\n';
  } else if (category === '이직운') {
    text += '1. 이직 최적 시기를 2026년 월별로 명확히 제시하세요.\n';
    text += '2. 현재 직종에서 이직 시 사주상 유리한 업종·포지션을 분석하세요.\n';
    text += '3. 이직 면접 길일과 계약 서명 추천 날짜를 안내하세요.\n';
    text += '4. 연봉 협상 전략도 사주 기운을 활용하여 조언하세요.\n';
    text += '5. 이직 후 적응 기간과 성과 발휘 시기 예측도 포함하세요.\n';
  } else if (category === '승진운') {
    text += '1. 2026년 승진 가능성과 최적 시기를 사주 기반으로 분석하세요.\n';
    text += '2. 상사·동료와의 관계 전략을 사주 유형에 맞게 제안하세요.\n';
    text += '3. 승진을 위한 구체적 업무 전략과 어필 포인트를 제시하세요.\n';
    text += '4. 승진 발령 가능성 높은 달과 그 이유를 명확히 설명하세요.\n';
    text += '5. 승진 실패 시 대안 경로도 함께 안내하세요.\n';
  } else if (category === '시험운합격운') {
    // 시험·자격증 정보 추가 (AI 지침 포함)
    text += '\n【시험·자격증 데이터】\n';
    text += '📚 2026년 시험 최적 달: 3월(봄 집중력 최고), 4월(성장 기운), 9월(하반기 최적), 10월(수확의 달)\n';
    text += '⚠️  시험 주의 달: 7~8월(火 기운 과다, 집중력 저하), 12월(연말 분산)\n';
    if (aptitude) {
      const OHENG_EXAM_MAP = {
        '木': ['국어·교육 자격증', '환경기사', '사회복지사', 'OPIC', '논술 시험'],
        '火': ['방송·미디어 자격증', '예술 관련', '미용사', '스포츠지도사', '마케팅 자격'],
        '土': ['부동산 공인중개사', '사회복지사', '세무사', '행정사', '국가직 공무원'],
        '金': ['IT 자격증', '정보처리기사', '법무사', '의료 관련', '회계사·세무사'],
        '水': ['TOEIC·어학', '데이터분석사', '금융 자격', '컨설팅 자격', '번역·통역'],
      };
      text += '\n🎯 이 사주 오행(' + aptitude.dominantOheng + ')에 맞는 추천 시험 분야: ';
      const examRecs = OHENG_EXAM_MAP[aptitude.dominantOheng] || [];
      text += examRecs.slice(0,4).join(', ') + '\n';
    }
    text += '\n【AI 상담 지침】\n';
    text += '1. 사주 인성(印星)·관성(官星) 흐름으로 합격운을 분석하세요.\n';
    text += '2. 2026년 월별 합격 가능성을 명확히 제시하세요.\n';
    text += '3. 응시할 시험 유형(수능·공무원·자격증·어학)에 맞는 맞춤 조언을 하세요.\n';
    text += '4. 시험장에서의 행운 아이템(색상·숫자·방향)을 안내하세요.\n';
    text += '5. 불합격 시 재도전 최적 시기도 반드시 포함하세요.\n';
  } else if (category === '프리랜서운') {
    // 프리랜서 관련 사주 데이터 추가 (AI 지침 포함)
    text += '\n【프리랜서 독립운 데이터】\n';
    if (aptitude) {
      const freelanceFit = {
        '水': '최상 ✅ (유연성+정보 활용 탁월)',
        '木': '상 ✅ (창의성+기획 강점)',
        '火': '상 ✅ (표현력+소통, 콘텐츠·마케팅 적합)',
        '金': '중상 (전문성 기반 독립 가능)',
        '土': '중 (안정성 중시, 파트타임 후 단계적 전환 추천)',
      };
      text += '💼 오행 기반 프리랜서 적합도: ' + (freelanceFit[aptitude.dominantOheng] || '중') + '\n';
      const careerCats = aptitude.categories || {};
      const topCatKey = Object.keys(careerCats)[0];
      if (topCatKey) text += '🔑 주력 프리랜서 분야: ' + (careerCats[topCatKey] || []).slice(0,4).join(', ') + '\n';
    }
    text += '📅 독립 최적 시기 (2026년): 3~4월(봄 새 출발), 9~10월(하반기 결단)\n';
    text += '⚠️  주의 시기: 7~8월(수입 불안정 가능), 12월(신규 계약 지연)\n';
    text += '\n【AI 상담 지침】\n';
    text += '1. 사주 편재(偏財)·식신(食神)·상관(傷官) 발달 여부로 프리랜서 적합성을 분석하세요.\n';
    text += '2. 독립 최적 시기와 준비 기간(최소 3~6개월)을 구체적으로 제시하세요.\n';
    text += '3. IT·디자인·콘텐츠·강의·컨설팅 등 분야별 적합도를 오행과 연결하세요.\n';
    text += '4. 수입 안정화 시기(3개월/6개월/1년)별 예상 흐름을 안내하세요.\n';
    text += '5. 클라이언트 유치 방향과 계약·세금 관련 실용 조언도 포함하세요.\n';
  } else {
    // 직업상담 기본
    text += '1. 사주 오행 기반 직업 적성 분석을 먼저 제시하세요.\n';
    text += '2. 현재 상황(취업/이직/승진)에 맞는 맞춤 조언을 제공하세요.\n';
    text += '3. 2026년 직업운 흐름과 중요 시기를 안내하세요.\n';
    text += '4. 실용적이고 구체적인 행동 계획을 제안하세요.\n';
    text += '5. 장기 커리어 방향과 성장 경로도 포함하세요.\n';
  }

  return text;
}

/* =====================================================
   11. 전역 노출
   ===================================================== */
window.parseCareerInput       = parseCareerInput;
window.analyzeCareerAptitude  = analyzeCareerAptitude;
window.getCareerTiming        = getCareerTiming;
window.careerToPromptText     = careerToPromptText;
window.OHENG_CAREER_DB        = OHENG_CAREER_DB;
window.CAREER_TYPE_DETAIL     = CAREER_TYPE_DETAIL;
window.CAREER_MONTH_2026      = CAREER_MONTH_2026;
window.INTERVIEW_LUCKY        = INTERVIEW_LUCKY;
window.EXAM_TIMING_2026       = EXAM_TIMING_2026;
window.CAREER_FORTUNE_2026    = CAREER_FORTUNE_2026;
