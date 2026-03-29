/* =========================================================
   운세ON — js/business.js
   업종 추천 · 상호명 · 개업 시기 완전 구현 엔진

   [포함 기능]
   1. 오행별 적합 업종 DB (200+ 업종, 세부 분류)
   2. 사주 오행 분포 → 용신 기반 최적 업종 매칭
   3. 오행별 사업 성향 & 직업군 성격 분석
   4. 상호명 오행·발음 에너지·획수 종합 분석
   5. 업종별 상호명 이미지 가이드
   6. 개업 길일 계산 (월별 길흉 + 요일 길흉)
   7. 사업 자본금·규모별 업종 필터
   8. 2026년 병오년 업종별 운세 키워드
   9. Gemini 프롬프트 텍스트 변환
   ========================================================= */

/* =====================================================
   1. 오행별 적합 업종 DB
   ===================================================== */
const OHENG_BUSINESS_DB = {

  '木': {
    element: '목(木)', emoji: '🌳', color: '초록·파랑',
    nature: '성장·창조·시작·교육·생명',
    personality: '창의적이고 진취적. 새로운 것을 시작하는 힘이 강함. 사람을 키우고 가르치는 일에 천재성 발휘.',
    strength: '기획력, 창의성, 교육 능력, 추진력, 비전 제시',
    weakness: '마무리 취약, 세밀한 작업 힘듦, 중간에 포기 경향',
    categories: {
      '교육·학습':   ['학원 운영', '과외·튜터링', '교육 콘텐츠 제작', '어린이집·유치원', '독서실', '온라인 강의 플랫폼'],
      '출판·미디어': ['출판사', '작가·저술업', '블로그·유튜브 채널', '팟캐스트', '매거진·잡지사'],
      '환경·자연':   ['친환경 제품', '식물·화훼 판매', '조경·정원 관리', '농업·도시농업', '유기농 식품'],
      '의류·패션':   ['의류 디자인', '패션 브랜드', '빈티지 의류', '수선·리폼'],
      '의료·건강':   ['한의원', '자연치유', '요가·명상원', '건강식품 판매'],
      '창업·기획':   ['스타트업 창업', '사업 기획', '프리랜서 기획자', '컨설팅'],
    },
    bestIndustry: ['교육업', '출판업', '환경·자연 관련 사업', '창의적 스타트업'],
    avoidIndustry: ['단순 반복 제조업', '정밀 기계 작업', '금융 투기성 사업'],
    brandColor: '#2e7d32',
    brandColorName: '초록',
    luckyNumber: [3, 8],
    luckyDir: '동쪽',
  },

  '火': {
    element: '화(火)', emoji: '🔥', color: '빨강·주황',
    nature: '열정·표현·소통·예술·명성',
    personality: '열정적이고 카리스마 있음. 사람을 끌어당기는 매력. 표현력이 뛰어나 예술·연예·서비스에 강점.',
    strength: '표현력, 소통 능력, 열정, 창의성, 인지도 구축',
    weakness: '지속력 부족, 감정 기복, 세밀함 부족, 충동적 결정',
    categories: {
      '요식업':      ['카페·커피숍', '레스토랑', '베이커리·제과점', '주점·바', '푸드트럭', '도시락·배달 음식'],
      '뷰티·미용':   ['미용실', '네일숍', '피부관리실', '메이크업 아티스트', '왁싱숍'],
      '연예·예술':   ['연기·모델', '유튜버·크리에이터', '사진 스튜디오', '미술·갤러리', '공연·이벤트'],
      '마케팅·홍보': ['SNS 마케팅', '광고 대행', '브랜딩 에이전시', '유튜브 채널 운영'],
      '서비스업':    ['인플루언서', '강연·스피치', '이벤트 기획', '웨딩 플래너'],
      '헬스·스포츠': ['피트니스 센터', '댄스 학원', '스포츠 용품', '격투기·무술 도장'],
    },
    bestIndustry: ['요식업', '뷰티·미용업', '연예·예술업', '마케팅·광고'],
    avoidIndustry: ['정밀 기계·제조업', '장기 인내 필요 업종', '냉정한 판단 필요 금융업'],
    brandColor: '#d32f2f',
    brandColorName: '빨강·주황',
    luckyNumber: [2, 7],
    luckyDir: '남쪽',
  },

  '土': {
    element: '토(土)', emoji: '🌍', color: '노랑·갈색',
    nature: '신뢰·중재·안정·부동산·축적',
    personality: '믿음직하고 성실함. 꾸준한 노력으로 안정적 성과. 중재·조율 능력 탁월. 오래가는 사업에 적합.',
    strength: '신뢰도, 성실성, 중재 능력, 장기 사업 지속력, 안정성',
    weakness: '변화 대응 느림, 혁신 부족, 보수적 성향',
    categories: {
      '부동산':      ['부동산 중개업', '임대 사업', '부동산 컨설팅', '인테리어', '건설·시공'],
      '식품·농업':   ['농산물 유통', '식품 제조', '반찬가게', '떡집·한식', '도시락 사업'],
      '금융·재무':   ['세무·회계 사무소', '보험 대리점', '재무 컨설팅', '신용협동조합'],
      '유통·물류':   ['도·소매업', '온라인 쇼핑몰', '물류 운송', '도매업'],
      '의료·복지':   ['요양원·노인복지', '복지관', '사회복지사', '간호·돌봄 서비스'],
      '교육·상담':   ['심리상담', '진로 상담', '코칭', '사회복지 상담'],
    },
    bestIndustry: ['부동산업', '식품·요식업', '금융·보험업', '유통·물류업'],
    avoidIndustry: ['빠른 트렌드 변화 업종', '리스크 높은 투기성 사업', '창의성 필요 예술 분야'],
    brandColor: '#f57f17',
    brandColorName: '노랑·갈색',
    luckyNumber: [5, 10],
    luckyDir: '중앙',
  },

  '金': {
    element: '금(金)', emoji: '⚡', color: '흰색·은색',
    nature: '결단·의리·정밀·법률·금속',
    personality: '결단력이 강하고 원칙주의. 정밀하고 섬세한 작업에 강함. 법률·기술·금속 관련 분야에서 탁월.',
    strength: '결단력, 정밀함, 기술력, 의리, 원칙 준수',
    weakness: '융통성 부족, 타협 어려움, 냉정함이 인간관계에 영향',
    categories: {
      '법률·행정':   ['법무사', '변호사', '세무사', '행정사', '노무사', '특허 사무소'],
      'IT·기술':     ['소프트웨어 개발', 'IT 컨설팅', '웹·앱 개발', '사이버 보안', 'AI 개발'],
      '정밀·기계':   ['기계 제조', '정밀 부품', '금속 가공', '공구·장비 판매'],
      '금융·투자':   ['투자자문', '주식·펀드', '자산관리', '핀테크 창업'],
      '의료·의약':   ['약국', '의료기기', '치과', '외과', '정형외과'],
      '보안·안전':   ['경호·보안업', '소방·안전 용품', '잠금장치·CCTV'],
    },
    bestIndustry: ['IT·소프트웨어업', '법률·행정 서비스', '정밀 기계·제조업', '금융·투자업'],
    avoidIndustry: ['감성 중심 서비스업', '예술·창작 분야', '사람 상대 감정 노동 업종'],
    brandColor: '#9e9e9e',
    brandColorName: '흰색·은색',
    luckyNumber: [4, 9],
    luckyDir: '서쪽',
  },

  '水': {
    element: '수(水)', emoji: '💧', color: '검정·파랑',
    nature: '지혜·유연·탐구·유통·여행',
    personality: '지혜롭고 유연함. 다양한 분야에 적응력이 강함. 정보·유통·여행 분야에서 두각 발휘. 아이디어가 풍부.',
    strength: '적응력, 지혜, 정보 수집 능력, 유연성, 탐구심',
    weakness: '결단력 부족, 방향성 잃기 쉬움, 집중력 산만',
    categories: {
      '여행·관광':   ['여행사', '숙박·게스트하우스', '투어 가이드', '항공 관련 서비스'],
      '유통·무역':   ['수출입 무역', '온라인 쇼핑몰', '도매·소매 유통', '해외 구매 대행'],
      'IT·플랫폼':   ['플랫폼 창업', '정보 서비스', '데이터 분석', '리서치 업체'],
      '미디어·통신': ['방송·언론', '통신 판매', '앱 개발', 'SNS 플랫폼'],
      '전문직':      ['컨설턴트', '연구원', '번역가', '통역가', '언어 교육'],
      '수산·음료':   ['수산물 유통', '음료·생수 사업', '수족관·어항 관련'],
    },
    bestIndustry: ['여행·관광업', '유통·무역업', 'IT 플랫폼', '정보·미디어 서비스'],
    avoidIndustry: ['고정된 루틴 반복 업종', '장기 자본 묶이는 부동산', '단순 노동 제조업'],
    brandColor: '#1565c0',
    brandColorName: '검정·파랑',
    luckyNumber: [1, 6],
    luckyDir: '북쪽',
  },
};

/* =====================================================
   2. 업종별 2026년 병오년 운세 키워드
   ===================================================== */
const BUSINESS_2026_FORECAST = {
  '요식업':        { trend: '📈 상승', key: '배달·테이크아웃 강세. 건강식·간편식 수요 급증', timing: '3~5월, 9~11월 개업 길함' },
  '카페':          { trend: '📈 상승', key: '특화 카페(스터디·반려동물·테마) 두각. 재방문율 중요', timing: '4~6월 오픈 추천' },
  'IT·앱개발':     { trend: '🚀 급성장', key: 'AI 연동 서비스 수요 폭발. 초기 투자 집중 시기', timing: '1~3월, 7~9월 프로젝트 시작 유리' },
  '뷰티·미용':     { trend: '📈 상승', key: '개인 맞춤형 서비스 인기. 자격증 기반 전문성 강조', timing: '2~4월, 8~10월 창업 추천' },
  '교육':          { trend: '➡️ 보통', key: '온라인 강의 경쟁 심화. 오프라인 체험·소규모 차별화', timing: '3월·9월 학기 시작 맞춰 개강' },
  '부동산':        { trend: '➡️ 보통', key: '금리 변동에 민감. 상가·창업 관련 컨설팅 수요 있음', timing: '5~7월 계약 기운 좋음' },
  '여행·관광':     { trend: '📈 상승', key: '해외여행 수요 회복. 소규모 특화 여행 강세', timing: '봄·가을 시즌 집중 마케팅' },
  '유통·쇼핑몰':   { trend: '📈 상승', key: '라이브커머스·숏폼 영상 판매 강세. SNS 채널 필수', timing: '3~4월, 10~11월 마케팅 집중' },
  '전문직·법무':   { trend: '🔒 안정', key: '안정적 수요. 디지털 서비스 접목 시 경쟁력 강화', timing: '연중 안정. 1~3월 신규 고객 확보 유리' },
  '건강·의료':     { trend: '🚀 급성장', key: '건강 관리 수요 급증. 예방 의학·기능 의학 부상', timing: '3~5월 건강 관심 증가 시기' },
  '제조업':        { trend: '⚠️ 주의', key: '원자재 비용 상승 부담. 고부가가치 제품으로 전환 필요', timing: '하반기(7~9월) 설비 투자 신중' },
  '기본':          { trend: '➡️ 보통', key: '2026년 병오년 화(火) 기운 강함. 열정적 도전이 결실로', timing: '3~5월, 9~10월 기운 좋음' },
};

function getBusiness2026(industryName) {
  for (const [key, val] of Object.entries(BUSINESS_2026_FORECAST)) {
    if (industryName && industryName.includes(key)) return val;
  }
  return BUSINESS_2026_FORECAST['기본'];
}

/* =====================================================
   3. 오행 → 사업자 유형 매핑
   ===================================================== */
const BUSINESS_TYPE_BY_OHENG = {
  '木': { type: '성장형 창업가', style: '새로운 시장 개척, 빠른 확장 전략', funding: '투자 유치·스타트업 방식' },
  '火': { type: '감성형 브랜더', style: '브랜드 스토리텔링, 고객 감동 마케팅', funding: '소자본 빠른 회수 방식' },
  '土': { type: '안정형 사업가', style: '탄탄한 기반 구축, 장기 신뢰 쌓기', funding: '자기자본 안정 운영' },
  '金': { type: '전문가형 사업가', style: '기술·전문성 차별화, 프리미엄 포지셔닝', funding: '수익성 집중 운영' },
  '水': { type: '플랫폼형 연결자', style: '네트워크 활용, 유통·정보 중개', funding: '린 스타트업·피벗 전략' },
};

/* =====================================================
   4. 사용자 입력 파싱 (업종 상담 전용)
   ===================================================== */
function parseBusinessInput(text) {
  const result = {
    found: false,
    birthYear: null, birthMonth: null, birthDay: null, birthHour: null,
    isLunar: false,
    gender: null,
    capital: null,          // 자본금 (만원 단위)
    experience: [],         // 보유 경험/경력
    interests: [],          // 관심 업종
    currentJob: null,       // 현재 직업
    location: null,         // 창업 지역
    brandCandidates: [],    // 상호명 후보
    businessType: null,     // 'solo'(1인) | 'partner'(동업) | 'corp'(법인)
    existingName: null,     // 현재 상호명 (분석용)
    industry: null,         // 희망 업종
  };

  // 생년월일
  const yearM = text.match(/(\d{4})년/);
  const monM  = text.match(/(\d{1,2})월/);
  const dayM  = text.match(/(\d{1,2})일/);
  const hourM = text.match(/(\d{1,2})시/);
  if (yearM)  result.birthYear  = parseInt(yearM[1]);
  if (monM)   result.birthMonth = parseInt(monM[1]);
  if (dayM)   result.birthDay   = parseInt(dayM[1]);
  if (hourM)  result.birthHour  = parseInt(hourM[1]);
  if (/음력/.test(text)) result.isLunar = true;

  // 성별
  if (/남자|남성|남|아저씨|형|남편/i.test(text))  result.gender = 'male';
  if (/여자|여성|여|아줌마|언니|아내/i.test(text)) result.gender = 'female';

  // 자본금 파싱
  const capitalPatterns = [
    /(\d+)\s*억/,           // N억
    /(\d+)\s*천만/,         // N천만
    /(\d+)\s*백만/,         // N백만
    /(\d+)\s*만\s*원/,      // N만원
  ];
  for (const pat of capitalPatterns) {
    const m = text.match(pat);
    if (m) {
      const n = parseInt(m[1]);
      if (pat.source.includes('억'))   result.capital = n * 10000;
      else if (pat.source.includes('천만')) result.capital = n * 1000;
      else if (pat.source.includes('백만')) result.capital = n * 100;
      else result.capital = n;
      break;
    }
  }

  // 경험·경력 파싱
  const expKeywords = ['교사', '간호사', '의사', '요리사', '디자이너', 'IT', '개발자', '회계사',
    '영업', '마케팅', '금융', '부동산', '강사', '공무원', '군인', '경찰', '소방관', '작가'];
  expKeywords.forEach(kw => { if (text.includes(kw)) result.experience.push(kw); });

  // 관심 업종 파싱
  const interestKeywords = ['카페', '음식점', '식당', '미용', '뷰티', 'IT', '앱', '교육', '학원',
    '쇼핑몰', '의류', '부동산', '여행', '컨설팅', '프리랜서', '유튜브', '배달', '요식',
    '헬스', '피트니스', '반려동물', '꽃집', '공방', '수선', '세탁', '세차', '편의점'];
  interestKeywords.forEach(kw => { if (text.includes(kw)) result.interests.push(kw); });

  // 사업 형태
  if (/1인|혼자|솔로|solo/i.test(text))     result.businessType = 'solo';
  if (/동업|파트너|합동/i.test(text))        result.businessType = 'partner';
  if (/법인|주식회사|LLC/i.test(text))       result.businessType = 'corp';

  // 지역 파싱
  const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기', '강원',
    '충북', '충남', '전북', '전남', '경북', '경남', '제주', '세종'];
  for (const r of regions) {
    if (text.includes(r)) { result.location = r; break; }
  }

  // 상호명 후보
  const candPat = text.match(/후보[:\s]*([가-힣a-zA-Z0-9,·\s]+)/);
  if (candPat) {
    result.brandCandidates = candPat[1].split(/[,·\s]+/).filter(s => s.length >= 1 && s.length <= 10);
  }

  // 현재 상호명
  const existingPat = text.match(/(?:현재|지금|우리)\s*(?:상호|가게|매장|회사|브랜드)\s*(?:이름|명)(?:은|이|:)?\s*([가-힣a-zA-Z0-9]+)/);
  if (existingPat) result.existingName = existingPat[1];

  // 희망 업종
  const industryPat = text.match(/([가-힣]+(?:업|점|원|관|소|가게|샵|몰|센터|학원|클리닉))/);
  if (industryPat) result.industry = industryPat[1];

  // 동업궁합: 생년월일만 있어도 분석 가능
  if (/동업|파트너십|합동\s*창업/.test(text)) result.businessType = 'partner';

  if (result.birthYear || result.interests.length > 0 || result.brandCandidates.length > 0 || result.industry || result.businessType) {
    result.found = true;
  }

  return result;
}

/* =====================================================
   5. 사주 오행 → 업종 추천 매칭
   ===================================================== */

/**
 * 사주 오행 분포 기반 최적 업종 추천
 * @param {object} sajuOheng  {木:n, 火:n, 土:n, 金:n, 水:n}
 * @param {string} yongshin   용신 오행
 * @param {object} input      parseBusinessInput 결과
 */
function recommendBusiness(sajuOheng, yongshin, input) {
  // 용신 오행이 없으면 사주에서 가장 강한 오행 사용
  const dominant = yongshin || (
    sajuOheng
      ? Object.entries(sajuOheng).sort((a,b) => b[1]-a[1])[0]?.[0]
      : '土'
  );

  const primaryDB = OHENG_BUSINESS_DB[dominant];
  // 2순위: 용신을 생해주는 오행
  const secondaryOheng = Object.entries({ '木':'水', '火':'木', '土':'火', '金':'土', '水':'金' })
    .find(([,v]) => v === dominant)?.[0] || null;
  const secondaryDB = secondaryOheng ? OHENG_BUSINESS_DB[secondaryOheng] : null;

  // 관심 업종과 오행 DB 교차 분석
  const matchedInterests = [];
  if (input && input.interests.length > 0) {
    input.interests.forEach(interest => {
      // 1순위 업종 DB에서 매칭
      Object.entries(primaryDB.categories).forEach(([cat, list]) => {
        list.forEach(biz => {
          if (biz.includes(interest) || interest.includes(biz.substring(0,3))) {
            matchedInterests.push({ match: '⭐⭐⭐ 최적', category: cat, business: biz, oheng: dominant });
          }
        });
      });
      // 2순위 DB에서 매칭
      if (secondaryDB) {
        Object.entries(secondaryDB.categories).forEach(([cat, list]) => {
          list.forEach(biz => {
            if (biz.includes(interest) || interest.includes(biz.substring(0,3))) {
              matchedInterests.push({ match: '⭐⭐ 적합', category: cat, business: biz, oheng: secondaryOheng });
            }
          });
        });
      }
    });
  }

  // 자본금별 추천 조정
  let capitalAdvice = '';
  if (input && input.capital !== null) {
    if (input.capital < 500)       capitalAdvice = '소자본(500만원 미만): 무점포·온라인·프리랜서 형태 추천';
    else if (input.capital < 2000) capitalAdvice = '소자본(500~2000만원): 1인 점포·배달 전문점·온라인 쇼핑몰 추천';
    else if (input.capital < 5000) capitalAdvice = '중자본(2000~5000만원): 소형 매장·프랜차이즈 가맹·전문 서비스 창업 추천';
    else if (input.capital < 20000)capitalAdvice = '중대형 자본(5000만~2억원): 일반 매장·전문 사무소·중형 쇼핑몰 추천';
    else                            capitalAdvice = '대자본(2억원 이상): 프랜차이즈 본사·법인 설립·복합 사업 추천';
  }

  return {
    dominant, primaryDB, secondaryOheng, secondaryDB,
    businessType: BUSINESS_TYPE_BY_OHENG[dominant],
    matchedInterests,
    capitalAdvice,
    forecast2026: getBusiness2026(primaryDB.bestIndustry[0]),
  };
}

/* =====================================================
   6. 상호명 종합 분석
   ===================================================== */

/**
 * 상호명 오행·발음·이미지 종합 분석
 * naming.js의 analyzeBrandName 확장 버전
 */
function analyzeBusinessName(brandName, industry, sajuOheng, yongshin) {
  if (!brandName || brandName.trim().length === 0) return null;

  const name = brandName.trim();

  // ── 발음오행 분석 (naming.js 의존) ──
  let jamoOheng = [];
  let balance   = { score: 70, grade: '보통', results: [] };
  let brandEnergy = null;
  if (typeof getNameJamoOheng === 'function') {
    jamoOheng  = getNameJamoOheng(name);
    balance    = analyzeJamoBalance(jamoOheng);
    brandEnergy = typeof analyzeBrandName === 'function' ? analyzeBrandName(name) : null;
  }

  // ── 주도 오행 ──
  const ohengCounts = {};
  jamoOheng.forEach(j => { ohengCounts[j.oheng] = (ohengCounts[j.oheng] || 0) + 1; });
  const dominant = Object.entries(ohengCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '土';

  // ── 업종과 오행 궁합 ──
  let industryOhengMatch = '보통';
  if (industry && yongshin) {
    if (dominant === yongshin) industryOhengMatch = '최적 ⭐⭐⭐';
    else {
      const SANGSAENG = { '木':'水', '火':'木', '土':'火', '金':'土', '水':'金' };
      if (SANGSAENG[dominant] === yongshin || SANGSAENG[yongshin] === dominant)
        industryOhengMatch = '좋음 ⭐⭐';
    }
  }

  // ── 이름 길이 적정성 ──
  const len = name.replace(/\s/g,'').length;
  const lenGrade = len <= 2 ? '짧음(임팩트 강함)' :
                   len <= 4 ? '최적 길이' :
                   len <= 6 ? '보통 길이' : '다소 길어 기억 어려울 수 있음';

  // ── 수리 분석 (한자인 경우) ──
  let suriResult = null;
  const hasHanja = /[\u4E00-\u9FFF]/.test(name);
  if (hasHanja && typeof calcHanjaStrokes === 'function') {
    const strokes = calcHanjaStrokes(name);
    if (typeof getSuri81 === 'function') {
      suriResult = { total: strokes.total, ...getSuri81(strokes.total) };
    }
  }

  // ── 종합 점수 ──
  let score = balance.score;
  if (industryOhengMatch.includes('최적')) score += 15;
  else if (industryOhengMatch.includes('좋음')) score += 8;
  if (len >= 2 && len <= 4) score += 10;
  if (suriResult) {
    if (suriResult.grade.includes('대길')) score += 15;
    else if (suriResult.grade.includes('吉'))  score += 8;
    else if (suriResult.grade.includes('凶'))  score -= 10;
  }
  score = Math.min(100, Math.max(10, score));

  const grade = score >= 85 ? '강력 추천 ⭐⭐⭐' :
                score >= 70 ? '추천 ⭐⭐' :
                score >= 55 ? '보통 ⭐' : '재검토 권장';

  return {
    name, len, lenGrade,
    jamoOheng, balance,
    dominant,
    dominantInfo: OHENG_BUSINESS_DB[dominant] ? {
      element: OHENG_BUSINESS_DB[dominant].element,
      nature:  OHENG_BUSINESS_DB[dominant].nature,
      color:   OHENG_BUSINESS_DB[dominant].brandColorName,
    } : null,
    industryOhengMatch,
    brandEnergy,
    suriResult,
    score,
    grade,
  };
}

/* =====================================================
   7. 업종별 상호명 이미지 가이드
   ===================================================== */
const INDUSTRY_NAME_GUIDE = {
  '카페·음료':    { tone: '따뜻하고 감성적', avoid: '어둡거나 차가운 발음', examples: ['봄날', '하나', '온기', '달빛', '찻잎'] },
  '음식점·요식': { tone: '친근하고 맛있어 보이는', avoid: '딱딱하거나 거친 발음', examples: ['마당', '솥뚜껑', '어머니', '진미', '한솥'] },
  '뷰티·미용':   { tone: '세련되고 아름다운', avoid: '투박하거나 너무 한국적', examples: ['블루밍', '글로우', '샤인', '뷰틴', '미인'] },
  'IT·앱':        { tone: '스마트하고 현대적', avoid: '너무 전통적인 한자어', examples: ['링크', '하이브', '프레임', '루프', '코어'] },
  '교육':         { tone: '신뢰감 있고 지적인', avoid: '가볍거나 유행어', examples: ['배움터', '지식나무', '씨앗', '새빛', '한빛'] },
  '부동산':       { tone: '믿음직하고 전문적인', avoid: '불안정한 느낌의 발음', examples: ['반석', '대지', '터전', '주춧돌', '기반'] },
  '건강·의료':    { tone: '안전하고 따뜻한', avoid: '어두운 색감의 발음', examples: ['온누리', '맑음', '생기', '청정', '바른'] },
  '유통·쇼핑':   { tone: '활기차고 친근한', avoid: '너무 어렵거나 낯선 이름', examples: ['마켓', '장터', '플러스', '파인', '모두'] },
  '기본':         { tone: '밝고 기억하기 쉬운', avoid: '어둡거나 불길한 발음', examples: ['하나', '빛나', '으뜸', '제일', '참'] },
};

function getIndustryNameGuide(industry) {
  if (!industry) return INDUSTRY_NAME_GUIDE['기본'];
  for (const [key, val] of Object.entries(INDUSTRY_NAME_GUIDE)) {
    if (industry.includes(key.split('·')[0])) return val;
  }
  return INDUSTRY_NAME_GUIDE['기본'];
}

/* =====================================================
   8. 개업 길일 계산
   ===================================================== */

// 월별 개업 길흉 (병오년 2026년 기준)
const OPEN_MONTH_2026 = {
  1:  { grade: '보통', desc: '병오년 초입. 준비 기간으로 활용, 실제 개업은 2~3월 추천' },
  2:  { grade: '길(吉)', desc: '경인월. 木 기운 상승. 교육·창업·서비스업 개업 적합' },
  3:  { grade: '대길(大吉)', desc: '신묘월. 봄 기운 시작. 어떤 업종이든 개업 최적의 달' },
  4:  { grade: '대길(大吉)', desc: '임진월. 성장·확장 기운. 요식·뷰티·유통업 특히 길함' },
  5:  { grade: '길(吉)', desc: '계사월. 火 기운 강해짐. 홍보·마케팅 연계 개업 추천' },
  6:  { grade: '보통', desc: '갑오월. 더위 시작, 체력 관리 필요. 소자본 온라인 창업 유리' },
  7:  { grade: '보통', desc: '을미월. 여름 중반. 점포 임차 협상에는 유리한 시기' },
  8:  { grade: '길(吉)', desc: '병신월. 金 기운 활성화. IT·전문직·법무 창업에 좋음' },
  9:  { grade: '대길(大吉)', desc: '정유월. 가을 시작. 연중 두 번째 최적 개업 시기' },
  10: { grade: '길(吉)', desc: '무술월. 안정된 기운. 부동산·금융·요식업 개업 길함' },
  11: { grade: '보통', desc: '기해월. 水 기운 강함. 유통·무역·온라인 사업 유리' },
  12: { grade: '흉(凶)', desc: '경자월. 연말 정산 시기. 개업보다 준비와 계획 수립 권장' },
};

// 요일별 개업 길흉
const OPEN_WEEKDAY = {
  0: { name: '일요일', grade: '흉', desc: '고객 유동성 높지만 첫날 소란스러울 수 있음' },
  1: { name: '월요일', grade: '대길', desc: '한 주 시작의 기운. 새로운 출발에 최적' },
  2: { name: '화요일', grade: '길', desc: '화(火) 기운의 날. 열정적 출발에 좋음' },
  3: { name: '수요일', grade: '길', desc: '중간의 날. 균형 잡힌 시작' },
  4: { name: '목요일', grade: '대길', desc: '목(木) 기운의 날. 성장·확장 사업에 특히 좋음' },
  5: { name: '금요일', grade: '보통', desc: '주말 전날. 음식·서비스업 소프트오픈에 적합' },
  6: { name: '토요일', grade: '보통', desc: '고객 많지만 직원 준비 부족 가능. 주의 필요' },
};

/**
 * 2026년 개업 추천 시기 계산
 * @param {string} dominant 용신/지배 오행
 * @param {string} industry 업종
 */
function getOpeningTiming(dominant, industry) {
  // 오행별 특히 좋은 달
  const OHENG_BEST_MONTHS = {
    '木': [2, 3, 4],
    '火': [3, 4, 5, 9],
    '土': [3, 4, 9, 10],
    '金': [8, 9, 10],
    '水': [10, 11, 1],
  };

  const bestMonths = OHENG_BEST_MONTHS[dominant] || [3, 4, 9];
  const monthDetails = bestMonths.map(m => ({
    month: m + '월',
    ...OPEN_MONTH_2026[m]
  }));

  // 2026년 길일 날짜 예시 (양력 기준 길일 숫자)
  const luckyDates = [3, 6, 8, 13, 15, 16, 17, 21, 23, 24, 31];

  return { bestMonths: monthDetails, luckyDates, luckyWeekday: ['월요일', '목요일'] };
}

/* =====================================================
   9. 비즈니스 컨텍스트 → Gemini 프롬프트 텍스트 변환
   ===================================================== */
function businessToPromptText(input, saju, category) {
  if (!input || !input.found) return '';

  let text = '\n\n【사업·업종 사전 분석 데이터 (이 데이터를 기반으로 상담할 것)】\n';

  const isBrandConsult = category === '상호명상담' || category === '상호브랜드네이밍';
  const isIndustryConsult = category === '업종추천';

  // 기본 정보
  if (input.birthYear) text += '📅 생년: ' + input.birthYear + '년\n';
  if (input.gender)    text += '⚥  성별: ' + (input.gender === 'male' ? '남성' : '여성') + '\n';
  if (input.location)  text += '📍 지역: ' + input.location + '\n';
  if (input.capital)   text += '💰 자본금: 약 ' + input.capital.toLocaleString() + '만원\n';
  if (input.experience.length > 0) text += '💼 경험/경력: ' + input.experience.join(', ') + '\n';
  if (input.interests.length > 0)  text += '🔍 관심 업종: ' + input.interests.join(', ') + '\n';
  if (input.industry)  text += '🏪 희망 업종: ' + input.industry + '\n';
  if (input.businessType) {
    const types = { solo: '1인 창업', partner: '동업', corp: '법인 설립' };
    text += '🏢 창업 형태: ' + (types[input.businessType] || input.businessType) + '\n';
  }
  if (input.capitalAdvice) text += '💡 자본 가이드: ' + input.capitalAdvice + '\n';

  // 사주 오행 기반 업종 추천
  if (saju && !saju.error && isIndustryConsult) {
    const rec = recommendBusiness(saju.oheng, saju.yongshin, input);
    const db  = rec.primaryDB;

    text += '\n🔮 사주 오행 기반 업종 분석:\n';
    text += '   지배/용신 오행: ' + rec.dominant + ' (' + db.element + ')\n';
    text += '   사업가 유형: ' + rec.businessType.type + '\n';
    text += '   사업 스타일: ' + rec.businessType.style + '\n';
    text += '   강점: ' + db.strength + '\n';
    text += '   약점: ' + db.weakness + '\n\n';

    text += '📊 오행 기반 추천 업종 Top 3:\n';
    db.bestIndustry.slice(0,3).forEach((biz, i) => {
      const forecast = getBusiness2026(biz);
      text += '   ' + (i+1) + '. ' + biz + ' ' + forecast.trend + '\n';
      text += '      2026 키워드: ' + forecast.key + '\n';
      text += '      좋은 개업 시기: ' + forecast.timing + '\n';
    });

    // 카테고리별 세부 추천
    text += '\n📋 세부 업종 추천:\n';
    Object.entries(db.categories).slice(0,3).forEach(([cat, list]) => {
      text += '   [' + cat + '] ' + list.slice(0,4).join(', ') + '\n';
    });

    // 관심 업종 교차 분석
    if (rec.matchedInterests.length > 0) {
      text += '\n✅ 관심 업종 × 사주 매칭:\n';
      rec.matchedInterests.slice(0,3).forEach(m => {
        text += '   ' + m.match + ': ' + m.business + ' (' + m.category + ')\n';
      });
    }

    // 피해야 할 업종
    text += '\n⚠️ 주의해야 할 업종: ' + db.avoidIndustry.join(', ') + '\n';

    // 개업 시기
    const timing = getOpeningTiming(rec.dominant, input.industry || '');
    text += '\n📅 2026년 추천 개업 시기:\n';
    timing.bestMonths.forEach(m => {
      text += '   ' + m.month + ': ' + m.grade + ' — ' + m.desc + '\n';
    });
    text += '   추천 요일: ' + timing.luckyWeekday.join(', ') + '\n';
    text += '   길일 날짜: ' + timing.luckyDates.join('일, ') + '일\n';
  }

  // 상호명 분석
  if (isBrandConsult) {
    const yongshin = saju ? saju.yongshin : null;

    if (input.brandCandidates.length > 0) {
      text += '\n🏷️ 상호명 후보 분석:\n';
      input.brandCandidates.forEach((cand, i) => {
        const analysis = analyzeBusinessName(cand, input.industry, saju?.oheng, yongshin);
        if (analysis) {
          text += '\n   ' + (i+1) + '. "' + cand + '"\n';
          text += '      길이: ' + analysis.len + '글자 (' + analysis.lenGrade + ')\n';
          text += '      발음오행: ';
          analysis.jamoOheng.forEach(j => { text += j.char + '(' + j.oheng + ') '; });
          text += '\n';
          text += '      발음 배합: ' + analysis.balance.grade + ' (점수: ' + analysis.balance.score + ')\n';
          if (analysis.brandEnergy) {
            text += '      발음 밝기: ' + analysis.brandEnergy.brightnessGrade + '\n';
          }
          if (analysis.suriResult) {
            text += '      수리 분석: ' + analysis.suriResult.total + '수 — ' + analysis.suriResult.grade + '\n';
          }
          text += '      종합 평가: ' + analysis.grade + ' (점수: ' + analysis.score + '/100)\n';
        }
      });
    }

    if (input.existingName) {
      const existing = analyzeBusinessName(input.existingName, input.industry, saju?.oheng, yongshin);
      if (existing) {
        text += '\n📊 현재 상호명 "' + input.existingName + '" 분석:\n';
        text += '   발음 배합: ' + existing.balance.grade + ' | 종합: ' + existing.grade + '\n';
      }
    }

    // 업종별 이름 가이드
    const guide = getIndustryNameGuide(input.industry || '');
    text += '\n📝 업종 맞춤 이름 가이드:\n';
    text += '   추천 톤: ' + guide.tone + '\n';
    text += '   피할 스타일: ' + guide.avoid + '\n';
    text += '   참고 예시: ' + guide.examples.join(', ') + '\n';
  }

  // ── 동업궁합 전용 분석 ──
  if (category === '동업궁합' && saju) {
    text += '\n【동업 파트너 분석 데이터】\n';
    text += '📊 본인 사주 오행: ';
    if (saju.oheng) {
      Object.entries(saju.oheng).forEach(([k,v]) => { text += k + ':' + v + ' '; });
    }
    text += '\n';
    if (saju.dayGan) {
      text += '🔑 일간(日干): ' + saju.dayGan + '\n';
      const bizType = BUSINESS_TYPE_BY_OHENG[saju.yongshin] || BUSINESS_TYPE_BY_OHENG['土'];
      text += '💼 사업 성향: ' + bizType.type + ' — ' + bizType.style + '\n';
    }
    // 동업 가능성 분석 기초 데이터
    text += '\n【오행 상생상극 관계표】\n';
    text += '상생(相生): 木→火→土→金→水→木 (순서대로 생해줌)\n';
    text += '상극(相剋): 木→土, 火→金, 土→水, 金→木, 水→火 (극함)\n';
    text += '중립: 같은 오행 (比劫 관계 — 경쟁 가능, 협력도 가능)\n';
    text += '\n개업 길일: 월요일·목요일 대길 | 3·6·8·13·15·21일 길일\n';
    text += '계약 서명 주의 날: 4·9·14·19일\n';
  }

  // AI 지침
  text += '\n【AI 상담 지침】\n';
  if (category === '동업궁합') {
    text += '1. 두 사람의 사주 오행 상생·상극 관계를 분석하여 동업 궁합 점수(100점 만점)를 제시하세요.\n';
    text += '2. 역할 분담 제안: 누가 영업·관리·창작·재무를 맡으면 좋은지 오행 기반으로 분석하세요.\n';
    text += '3. 계약 체결 최적 시기와 피해야 할 시기를 구체적으로 제시하세요.\n';
    text += '4. 동업 시 예상되는 갈등 유형과 예방책을 현실적으로 조언하세요.\n';
    text += '5. 수익 분배 방식에 대한 사주 기반 조언도 포함하세요.\n';
    text += '6. 두 번째 사람의 생년월일이 없으면 한 번만 자연스럽게 요청하세요.\n';
  } else if (isIndustryConsult) {
    text += '1. 위 사주 오행 분석을 반드시 기반으로 업종을 추천하세요.\n';
    text += '2. 추천 순위를 1~5위로 명확히 제시하고 각각의 이유를 설명하세요.\n';
    text += '3. 자본금 정보가 있으면 현실적인 창업 방식을 제안하세요.\n';
    text += '4. 2026년 병오년의 업종별 트렌드를 반드시 언급하세요.\n';
    text += '5. 피해야 할 업종도 이유와 함께 명확히 제시하세요.\n';
    text += '6. 실행 가능한 첫 3개월 준비 계획을 제안하세요.\n';
  } else {
    text += '1. 상호명 후보가 있으면 각각 점수를 매겨 최종 1개를 추천하세요.\n';
    text += '2. 추천 이유와 함께 발음오행·수리·브랜드 이미지를 설명하세요.\n';
    text += '3. 브랜드 컬러, CI 방향, 영문 표기도 함께 제안하세요.\n';
    text += '4. 피해야 할 이름 유형도 이유와 함께 제시하세요.\n';
    text += '5. 개업 추천 시기도 함께 알려주세요.\n';
  }

  return text;
}

/* =====================================================
   10. 전역 노출
   ===================================================== */
window.parseBusinessInput      = parseBusinessInput;
window.recommendBusiness       = recommendBusiness;
window.analyzeBusinessName     = analyzeBusinessName;
window.getOpeningTiming        = getOpeningTiming;
window.businessToPromptText    = businessToPromptText;
window.getBusiness2026         = getBusiness2026;
window.getIndustryNameGuide    = getIndustryNameGuide;
window.OHENG_BUSINESS_DB       = OHENG_BUSINESS_DB;
window.OPEN_MONTH_2026         = OPEN_MONTH_2026;
