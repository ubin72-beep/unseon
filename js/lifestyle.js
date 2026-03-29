/* =========================================================
   운세ON — js/lifestyle.js
   이사운 · 집터운 · 여행운 전용 엔진

   [포함 기능]
   1. 풍수 방위 DB (8방위 × 오행 × 사주 연동)
   2. 2026년 이사 길흉 월별 분석
   3. 이사 길일 계산 (택일법 기반)
   4. 집터 유형별 풍수 분석 (배산임수·사신사·도심 등)
   5. 여행 방위 × 오행 길흉
   6. 2026년 여행 시기별 기운 분석
   7. 사용자 입력 파싱 (이사 날짜, 목적지, 현주소 등)
   8. Gemini 프롬프트 텍스트 변환
   ========================================================= */

/* =====================================================
   1. 풍수 8방위 DB
   ===================================================== */
const PUNGSU_DIR = {
  '동': {
    element: '木', emoji: '🌱', color: '초록·파랑',
    energy: '성장·발전·새로운 시작·자녀운 상승',
    goodFor: ['木 오행 강한 사람', '성장·사업 확장 원하는 사람', '자녀 교육·건강 중요한 가정'],
    houseType: '동향(東向) — 아침 햇빛이 들어오는 집. 활기차고 진취적인 기운',
    avoid: '金 오행 강한 사람에게는 상극 방위',
  },
  '서': {
    element: '金', emoji: '⚡', color: '흰색·은색·금색',
    energy: '결실·수확·재물 안정·노년 편안',
    goodFor: ['金 오행 필요한 사람', '재물 안정 원하는 사람', '50대 이상 노년층'],
    houseType: '서향(西向) — 오후 햇빛이 강함. 안정적이고 결실의 기운',
    avoid: '木 오행 강한 사람에게는 기운 충돌',
  },
  '남': {
    element: '火', emoji: '🔥', color: '빨강·주황',
    energy: '명성·인기·활동성·빠른 성과·연애운',
    goodFor: ['火 오행 필요한 사람', '인기·명성 원하는 사람', '활발한 사회활동 원하는 사람'],
    houseType: '남향(南向) — 햇빛이 가장 많이 들어오는 최고의 방향. 활기와 성장의 기운',
    avoid: '水 오행 강한 사람과 충돌 가능. 과열 주의',
  },
  '북': {
    element: '水', emoji: '💧', color: '검정·진한 파랑',
    energy: '지혜·학문·탐구·내면 성찰·직업 안정',
    goodFor: ['水 오행 필요한 사람', '공부·연구직 종사자', '내면 성장 원하는 사람'],
    houseType: '북향(北向) — 햇빛이 적어 서늘함. 학문·연구에는 좋으나 추위 주의',
    avoid: '火 오행 강한 사람에게는 기운 충돌',
  },
  '동남': {
    element: '木火', emoji: '🌿', color: '초록·연두',
    energy: '교류·소통·재물 유입·인연 확장',
    goodFor: ['소통·영업직 종사자', '인연을 넓히고 싶은 사람', '창업 초기 단계'],
    houseType: '동남향 — 아침~오전 햇빛. 상업적 에너지와 인연의 문. 한국 최선호 방향',
    avoid: '특별한 금기 없음. 범용적으로 좋은 방향',
  },
  '남서': {
    element: '土火', emoji: '🌍', color: '노랑·갈색',
    energy: '가정화합·어머니·대지의 안정·포용력',
    goodFor: ['가정 화목 원하는 사람', '土 오행 필요한 사람', '어머니·여성 가장'],
    houseType: '남서향 — 오후 햇빛. 포근하고 안정적인 가정의 기운',
    avoid: '木 오행 강한 사람과 다소 충돌',
  },
  '북동': {
    element: '土水', emoji: '⛰️', color: '갈색·카키',
    energy: '변화·전환·귀문(鬼門)방위·영적 에너지 강함',
    goodFor: ['영적 성장·수행자', '변화 원하는 사람'],
    houseType: '북동향(艮方) — 귀문방위. 영적 에너지 강하나 안정성 낮음. 현대 생활엔 주의 필요',
    avoid: '일반 거주에는 비추천. 음기(陰氣) 강함',
  },
  '북서': {
    element: '金水', emoji: '🏔️', color: '흰색·회색',
    energy: '권위·지도력·아버지·하늘의 기운',
    goodFor: ['리더십 필요한 사람', '金 오행 필요한 사람', '아버지·남성 가장'],
    houseType: '북서향(乾方) — 하늘의 기운. 지도자·가장의 방위. 권위 있는 에너지',
    avoid: '火 오행 강한 젊은이에게는 맞지 않을 수 있음',
  },
};

/* =====================================================
   2. 사주 오행 → 길한 방위 매핑
   ===================================================== */
const OHENG_GOOD_DIR = {
  '木': { best: ['동', '동남'], good: ['남'], avoid: ['서', '북서'] },
  '火': { best: ['남', '동남'], good: ['동'], avoid: ['북', '북동'] },
  '土': { best: ['남서', '북동'], good: ['중앙', '북서'], avoid: [] },
  '金': { best: ['서', '북서'], good: ['북'], avoid: ['동', '동남'] },
  '水': { best: ['북', '북동'], good: ['서'], avoid: ['남', '동남'] },
};

/* =====================================================
   3. 2026년 이사 길흉 월별 분석 (병오년 기준)
   ===================================================== */
const MOVE_MONTH_2026 = {
  1:  { grade: '보통', desc: '병오년 시작. 큰 이사보다 소규모 이동은 괜찮음. 준비 기간으로 활용 권장' },
  2:  { grade: '길(吉)', desc: '경인월. 봄 기운 시작. 새 집에 새 기운을 담기 좋은 달. 木 오행 활성화' },
  3:  { grade: '대길(大吉)', desc: '신묘월. 봄의 정점. 이사하기 가장 좋은 달. 가정 화목과 성장 기운 가득' },
  4:  { grade: '대길(大吉)', desc: '임진월. 성장과 확장 기운. 더 넓은 집·상향 이동에 특히 길함' },
  5:  { grade: '길(吉)', desc: '계사월. 火 기운 상승. 활기차고 밝은 새 출발에 좋은 달' },
  6:  { grade: '보통', desc: '갑오월. 여름 시작. 이사 후 체력 관리 필요. 냉방 설비 미리 점검' },
  7:  { grade: '주의', desc: '을미월. 火 기운 과다. 이사보다 집 수리나 인테리어 변경에 유리' },
  8:  { grade: '길(吉)', desc: '병신월. 金 기운 활성화. 안정적인 정착에 좋음. 계약 기운도 좋음' },
  9:  { grade: '대길(大吉)', desc: '정유월. 가을 시작. 연중 최고의 이사 시기. 정착·안정·가족 화목' },
  10: { grade: '길(吉)', desc: '무술월. 土 기운 안정. 장기 거주 예정 집에 이사하기 좋은 달' },
  11: { grade: '보통', desc: '기해월. 水 기운 강함. 유동성 있는 단기 거주나 임시 이동은 괜찮음' },
  12: { grade: '흉(凶)', desc: '경자월. 연말 한파. 이사보다 계약·준비 단계에 집중. 실제 이동은 신년 이후 권장' },
};

/* =====================================================
   4. 이사 길일 요일
   ===================================================== */
const MOVE_WEEKDAY = {
  0: { name: '일요일', grade: '보통', desc: '여유 있게 이사 가능하나 이삿짐센터 비용 높음' },
  1: { name: '월요일', grade: '대길', desc: '한 주 시작 기운. 새 집에서 새 출발하기 최적' },
  2: { name: '화요일', grade: '길', desc: '화(火) 기운의 날. 활기찬 시작' },
  3: { name: '수요일', grade: '길', desc: '균형의 날. 안정적인 이동에 좋음' },
  4: { name: '목요일', grade: '대길', desc: '목(木) 기운. 성장·발전 에너지. 이사 후 번성할 기운' },
  5: { name: '금요일', grade: '보통', desc: '주말 전날. 이사는 가능하나 주말 정리시간 확보 유리' },
  6: { name: '토요일', grade: '보통', desc: '이삿짐센터 혼잡. 비용 높음. 새벽 이른 시간 추천' },
};

// 이사 길일 날짜 (음력 택일법 기반 양력 환산 길일)
const MOVE_LUCKY_DATES = [3, 5, 6, 8, 11, 13, 15, 16, 17, 21, 23, 24, 25, 29, 31];
const MOVE_AVOID_DATES = [4, 9, 10, 12, 14, 19, 20, 26, 27, 28]; // 손 없는 날 제외 흉일

/* =====================================================
   5. 집터 유형별 풍수 분석
   ===================================================== */
const HOUSE_TYPE_ANALYSIS = {
  '아파트': {
    pros: ['단열·방음 우수', '보안 양호', '커뮤니티 시설'],
    pungsu: '층수가 높을수록 하늘(天) 기운 강함. 중간 층(5~15층)이 지기(地氣)와 균형 유지',
    goodFloor: '5~12층이 이상적. 1~3층은 수기(水氣) 과다, 고층은 화기(火氣) 강함',
    dirTips: '남향·동남향 거실 배치 최우선. 주방이 북쪽이면 火와 水 충돌 주의',
  },
  '빌라': {
    pros: ['독립성 높음', '마당·테라스 가능', '가격 경쟁력'],
    pungsu: '지면과 가까워 지기(地氣) 직접 영향. 주변 땅 기운이 중요',
    goodFloor: '2~3층 최적. 1층은 습기·음기 주의. 옥탑은 天氣 강하나 냉·난방 부담',
    dirTips: '전면 도로 위치 확인 중요. T자 도로 끝 위치 절대 금기',
  },
  '단독주택': {
    pros: ['독립 공간', '마당', '층수 자유도'],
    pungsu: '배산임수(背山臨水)의 지형이 이상적. 뒤에 높은 지형, 앞에 물이나 개방 공간',
    goodFloor: '단층·복층 모두 지기 충분히 받음. 지하 공간 습기 관리 필수',
    dirTips: '대문 방향이 핵심. 동·남·동남 방향 대문이 길함. 북향 대문 가능하면 피할 것',
  },
  '오피스텔': {
    pros: ['직주근접', '편의성', '1인 가구 최적'],
    pungsu: '주거와 업무 기운 혼합. 순수 주거 기운 약함. 독립적 공간 설정 중요',
    goodFloor: '중간 층 이상 추천. 복도 방향보다 외부 창문 방향 중시',
    dirTips: '채광이 가장 중요. 햇빛이 들어오는 방향 우선 선택',
  },
  '기본': {
    pros: ['쾌적한 환경'],
    pungsu: '햇빛·바람·물의 조화가 좋은 집터의 기본. 자연 채광과 통풍이 기운을 결정',
    goodFloor: '지면과 너무 가깝거나 너무 높지 않은 곳이 적당',
    dirTips: '남향 또는 동남향이 한국 기후와 풍수상 가장 유리',
  },
};

/* =====================================================
   6. 여행 방위 × 오행 기운
   ===================================================== */
const TRAVEL_DIR_BY_OHENG = {
  '木': {
    best: ['동쪽', '동남쪽'],
    recommend: '강원도·일본 동부·동남아시아(베트남·태국)',
    avoid: '서쪽·서북쪽 방향',
    luck: '자연·산림 여행이 기운 회복에 탁월. 숲·녹지 목적지 추천',
  },
  '火': {
    best: ['남쪽', '동남쪽'],
    recommend: '제주도·부산·동남아·오세아니아',
    avoid: '북쪽·동북쪽 방향',
    luck: '따뜻하고 햇빛 가득한 곳. 바다·해변 목적지에서 에너지 충전',
  },
  '土': {
    best: ['중부·서남쪽'],
    recommend: '전라도·충청도·중국 중부·유럽 중부',
    avoid: '없음 (범용적으로 무난)',
    luck: '역사 유적·토속 음식 여행이 안정감을 높임. 대지 느낌의 목적지',
  },
  '金': {
    best: ['서쪽', '서북쪽'],
    recommend: '경상도·서해안·유럽 서부·미국 서부',
    avoid: '동쪽·동남쪽 방향',
    luck: '도시 여행·쇼핑·문화 탐방. 정돈된 도심 여행에서 활력 충전',
  },
  '水': {
    best: ['북쪽', '동북쪽'],
    recommend: '강화도·경기 북부·북유럽·캐나다·알래스카',
    avoid: '남쪽·동남쪽 방향',
    luck: '물가·강·호수·바다 여행. 조용한 자연에서 내면 재충전',
  },
};

/* =====================================================
   7. 2026년 여행 시기 분석
   ===================================================== */
const TRAVEL_SEASON_2026 = {
  '봄(3~5월)':  { grade: '⭐⭐⭐ 최적', desc: '병오년 木·火 기운 상승. 새 출발 여행, 만남 여행에 최적. 봄꽃 여행 강력 추천' },
  '여름(6~8월)': { grade: '⭐⭐ 좋음', desc: '火 기운 최고조. 활동적 여행·해외 장거리 여행에 에너지 충만. 건강 관리 주의' },
  '가을(9~11월)': { grade: '⭐⭐⭐ 최적', desc: '金 기운 활성화. 여행 후 현실 귀환 기운 좋음. 가을 단풍·추수감사 여행 최적' },
  '겨울(12~2월)': { grade: '⭐ 보통', desc: '水·金 기운 강함. 내면 탐구 여행·온천 힐링 여행 적합. 장거리 해외는 봄으로 미루길 권장' },
};

/* =====================================================
   8. 역마살(驛馬殺) 지지별 계산
   ===================================================== */
// 년지(年支)에 따른 역마 지지
const YEOKMA_BY_YEAR_ZI = {
  '子': '寅', '丑': '亥', '寅': '申', '卯': '巳',
  '辰': '寅', '巳': '亥', '午': '申', '未': '巳',
  '申': '寅', '酉': '亥', '戌': '申', '亥': '巳',
};

// 지지 → 방위
const JIJI_DIR = {
  '子': '북', '丑': '북동', '寅': '동북', '卯': '동',
  '辰': '동남', '巳': '남동', '午': '남', '未': '남서',
  '申': '서남', '酉': '서', '戌': '서북', '亥': '북서',
};

/* =====================================================
   9. 사용자 입력 파싱 (이사운·집터운·여행운 공통)
   ===================================================== */
function parseLifestyleInput(text) {
  const result = {
    found: false,
    type: null,          // 'move' | 'house' | 'travel'
    birthYear: null, birthMonth: null, birthDay: null,
    isLunar: false,
    gender: null,
    // 이사 관련
    moveFrom: null,      // 현재 거주지
    moveTo: null,        // 이사 예정지
    moveMonth: null,     // 이사 예정 월
    houseType: null,     // 집 유형 (아파트·빌라·단독·오피스텔)
    floor: null,         // 층수
    direction: null,     // 방향 (남향·북향 등)
    // 집터 관련
    nearLandmark: [],    // 주변 지형지물 (산·강·병원 등)
    // 여행 관련
    travelDest: null,    // 여행 목적지
    travelMonth: null,   // 여행 예정 월
    travelPurpose: null, // 여행 목적 (힐링·관광·출장 등)
    companions: null,    // 동행 (혼자·커플·가족 등)
  };

  // 생년월일
  const yearM  = text.match(/(\d{4})년/);
  const monM   = text.match(/(\d{1,2})월/);
  const dayM   = text.match(/(\d{1,2})일/);
  if (yearM)  result.birthYear  = parseInt(yearM[1]);
  if (monM)   result.birthMonth = parseInt(monM[1]);
  if (dayM)   result.birthDay   = parseInt(dayM[1]);
  if (/음력/.test(text)) result.isLunar = true;

  // 성별
  if (/남자|남성|남편|오빠|형|아저씨/i.test(text))  result.gender = 'male';
  if (/여자|여성|아내|언니|누나|아줌마/i.test(text)) result.gender = 'female';

  // 유형 감지
  if (/이사|이전|이주|새집|입주/.test(text))            result.type = 'move';
  else if (/집터|풍수|방향|향|층|빌라|아파트|단독/.test(text)) result.type = 'house';
  else if (/여행|출장|여행지|해외|국내|관광/.test(text)) result.type = 'travel';

  // 이사 정보
  const regions = ['서울','부산','대구','인천','광주','대전','울산','경기','강원',
    '충북','충남','전북','전남','경북','경남','제주','세종',
    '강남','강북','마포','송파','용산','영등포','성북','노원','분당','일산','수원','성남'];

  // 이사 지역
  if (result.type === 'move') {
    for (const r of regions) {
      if (text.includes(r)) {
        if (!result.moveFrom) result.moveFrom = r;
        else if (!result.moveTo) result.moveTo = r;
        else break;
      }
    }
  }

  // 집 유형
  if (/아파트/.test(text)) result.houseType = '아파트';
  else if (/빌라|연립/.test(text)) result.houseType = '빌라';
  else if (/단독|주택/.test(text)) result.houseType = '단독주택';
  else if (/오피스텔/.test(text)) result.houseType = '오피스텔';

  // 층수
  const floorM = text.match(/(\d+)\s*층/);
  if (floorM) result.floor = parseInt(floorM[1]);

  // 방향
  const dirKeywords = ['남향','북향','동향','서향','동남향','서남향','북동향','북서향'];
  for (const d of dirKeywords) {
    if (text.includes(d)) { result.direction = d; break; }
  }

  // 주변 지형
  const landmarkKeywords = ['산','강','바다','병원','묘지','학교','공원','지하철','도로','T자','고가도로'];
  landmarkKeywords.forEach(k => { if (text.includes(k)) result.nearLandmark.push(k); });

  // 여행 목적지
  const travelPlaces = ['제주','부산','경주','속초','강릉','여수','전주','춘천','설악',
    '일본','도쿄','오사카','중국','홍콩','태국','방콕','베트남','하노이','하와이',
    '미국','유럽','파리','런던','스페인','이탈리아','호주','싱가포르','말레이시아'];
  for (const p of travelPlaces) {
    if (text.includes(p)) { result.travelDest = p; break; }
  }

  // 여행 목적
  if (/힐링|휴양|쉬/.test(text))         result.travelPurpose = '힐링·휴양';
  else if (/관광|구경|투어/.test(text))   result.travelPurpose = '관광·투어';
  else if (/출장|업무|미팅/.test(text))   result.travelPurpose = '출장·업무';
  else if (/신혼|커플|데이트/.test(text)) result.travelPurpose = '연인 여행';
  else if (/가족|아이|자녀/.test(text))   result.travelPurpose = '가족 여행';

  // 동행
  if (/혼자|solo|1인/i.test(text))         result.companions = '혼자';
  else if (/커플|연인|남자친구|여자친구/.test(text)) result.companions = '커플';
  else if (/가족|부모|아이/.test(text))     result.companions = '가족';
  else if (/친구|지인/.test(text))          result.companions = '친구';

  // 이사/여행 예정 월 (두 번째 숫자 월 검출)
  const allMonths = [...text.matchAll(/(\d{1,2})월/g)].map(m => parseInt(m[1]));
  if (result.birthYear && allMonths.length >= 2) {
    // 첫 번째 월은 생월, 두 번째 이후는 이사/여행 예정월
    result.moveMonth = allMonths[1];
    result.travelMonth = allMonths[1];
  } else if (!result.birthYear && allMonths.length >= 1) {
    result.moveMonth = allMonths[0];
    result.travelMonth = allMonths[0];
  }

  if (result.birthYear || result.type || result.travelDest || result.houseType) {
    result.found = true;
  }

  return result;
}

/* =====================================================
   10. 사주 오행 → 이사 방위 분석
   ===================================================== */
function analyzeMoveDirBySaju(saju) {
  if (!saju || saju.error) return null;

  // 사주에서 용신 또는 지배 오행 추출
  let dominantOheng = null;
  if (saju.yongshin) {
    dominantOheng = saju.yongshin;
  } else if (saju.oheng) {
    dominantOheng = Object.entries(saju.oheng)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
  }
  if (!dominantOheng) dominantOheng = '土';

  const dirInfo = OHENG_GOOD_DIR[dominantOheng] || OHENG_GOOD_DIR['土'];
  const bestDirDetails = dirInfo.best.map(d => ({
    dir: d,
    ...PUNGSU_DIR[d],
  }));

  return {
    dominantOheng,
    bestDirs: dirInfo.best,
    goodDirs: dirInfo.good,
    avoidDirs: dirInfo.avoid,
    bestDirDetails,
  };
}

/* =====================================================
   11. 이사 길일 계산
   ===================================================== */
function getMovingTiming(dominant, preferMonth) {
  // 오행별 최적 이사 달
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
    ...MOVE_MONTH_2026[m],
  }));

  // 사용자가 특정 달 언급했으면 그 달 정보도 포함
  let preferMonthInfo = null;
  if (preferMonth && preferMonth >= 1 && preferMonth <= 12) {
    preferMonthInfo = { month: preferMonth + '월', ...MOVE_MONTH_2026[preferMonth] };
  }

  return {
    bestMonths: monthDetails,
    luckyDates: MOVE_LUCKY_DATES,
    avoidDates: MOVE_AVOID_DATES,
    luckyWeekday: ['월요일', '목요일'],
    preferMonthInfo,
  };
}

/* =====================================================
   12. 여행 방위·시기 분석
   ===================================================== */
function analyzeTravelBySaju(saju, input) {
  if (!saju || saju.error) return null;

  let dominantOheng = saju.yongshin ||
    (saju.oheng ? Object.entries(saju.oheng).sort((a,b)=>b[1]-a[1])[0]?.[0] : '土');

  const travelInfo = TRAVEL_DIR_BY_OHENG[dominantOheng] || TRAVEL_DIR_BY_OHENG['土'];

  // 여행 시기 판단
  let travelMonth = input?.travelMonth;
  let seasonAdvice = null;
  if (travelMonth) {
    const season = travelMonth <= 2 ? '겨울(12~2월)' :
                   travelMonth <= 5 ? '봄(3~5월)' :
                   travelMonth <= 8 ? '여름(6~8월)' :
                   travelMonth <= 11 ? '가을(9~11월)' : '겨울(12~2월)';
    seasonAdvice = TRAVEL_SEASON_2026[season];
  }

  return {
    dominantOheng,
    bestDirs: travelInfo.best,
    recommendDest: travelInfo.recommend,
    avoidDir: travelInfo.avoid,
    luckNote: travelInfo.luck,
    seasonAdvice,
    bestSeasons: ['봄(3~5월)', '가을(9~11월)'],
  };
}

/* =====================================================
   13. Gemini 프롬프트 텍스트 변환
   ===================================================== */
function lifestyleToPromptText(input, saju, category) {
  if (!input || !input.found) return '';

  let text = '\n\n【생활운 사전 분석 데이터 (이 데이터를 기반으로 상담할 것)】\n';

  // 기본 정보
  if (input.birthYear) text += '📅 생년: ' + input.birthYear + '년\n';
  if (input.gender)    text += '⚥  성별: ' + (input.gender === 'male' ? '남성' : '여성') + '\n';

  // ── 이사운 분석 ──
  if (category === '이사운') {
    text += '\n【이사운 분석 데이터】\n';
    if (input.moveFrom) text += '🏠 현재 거주지: ' + input.moveFrom + '\n';
    if (input.moveTo)   text += '🏡 이사 예정지: ' + input.moveTo + '\n';
    if (input.houseType) text += '🏢 집 유형: ' + input.houseType + '\n';
    if (input.floor)     text += '📐 층수: ' + input.floor + '층\n';
    if (input.direction) text += '🧭 방향: ' + input.direction + '\n';

    const moveDir = analyzeMoveDirBySaju(saju);
    if (moveDir) {
      text += '\n🔮 사주 오행 기반 이사 방위 분석:\n';
      text += '   지배/용신 오행: ' + moveDir.dominantOheng + '\n';
      text += '   최적 이사 방향: ' + moveDir.bestDirs.join(', ') + ' 방향\n';
      text += '   좋은 방향: ' + (moveDir.goodDirs.join(', ') || '없음') + '\n';
      text += '   피해야 할 방향: ' + (moveDir.avoidDirs.join(', ') || '없음') + '\n';
      moveDir.bestDirDetails.forEach(d => {
        text += '\n   [' + d.dir + '방] ' + d.emoji + ' ' + d.energy + '\n';
        text += '   하우스 타입: ' + d.houseType + '\n';
      });
    }

    // 이사 시기
    const dominant = (moveDir?.dominantOheng) || '土';
    const timing = getMovingTiming(dominant, input.moveMonth);
    text += '\n📅 2026년 이사 추천 시기:\n';
    timing.bestMonths.forEach(m => {
      text += '   ' + m.month + ': ' + m.grade + ' — ' + m.desc + '\n';
    });
    if (timing.preferMonthInfo) {
      text += '\n📌 사용자 희망 달(' + timing.preferMonthInfo.month + '): ' +
              timing.preferMonthInfo.grade + ' — ' + timing.preferMonthInfo.desc + '\n';
    }
    text += '   추천 요일: ' + timing.luckyWeekday.join(', ') + '\n';
    text += '   이사 길일: ' + timing.luckyDates.join('일, ') + '일\n';
    text += '   피해야 할 날: ' + timing.avoidDates.join('일, ') + '일\n';

    // 주변 지형
    if (input.nearLandmark.length > 0) {
      text += '\n⚠️ 주변 지형지물: ' + input.nearLandmark.join(', ') + '\n';
      if (input.nearLandmark.includes('병원') || input.nearLandmark.includes('묘지')) {
        text += '   ⚠️ 병원·묘지 인근은 음기(陰氣)가 강해 풍수상 거주에 주의가 필요합니다.\n';
      }
      if (input.nearLandmark.includes('T자')) {
        text += '   ⚠️ T자 도로 끝 집은 풍수상 기운이 충(衝)하여 매우 불리합니다.\n';
      }
    }

    // 집 유형 분석
    const houseAnal = HOUSE_TYPE_ANALYSIS[input.houseType || '기본'];
    text += '\n🏠 ' + (input.houseType || '집') + ' 풍수 포인트:\n';
    text += '   ' + houseAnal.pungsu + '\n';
    text += '   방향 팁: ' + houseAnal.dirTips + '\n';
    if (input.floor) {
      text += '   층수 분석: ' + houseAnal.goodFloor + '\n';
    }
  }

  // ── 집터운 분석 ──
  if (category === '집터운') {
    text += '\n【집터·풍수 분석 데이터】\n';
    if (input.houseType) text += '🏢 집 유형: ' + input.houseType + '\n';
    if (input.floor)     text += '📐 층수: ' + input.floor + '층\n';
    if (input.direction) text += '🧭 방향: ' + input.direction + '\n';
    if (input.nearLandmark.length > 0) {
      text += '🌍 주변 환경: ' + input.nearLandmark.join(', ') + '\n';
    }

    const moveDir = analyzeMoveDirBySaju(saju);
    if (moveDir) {
      text += '\n🔮 사주 기반 최적 집터 방위:\n';
      text += '   지배 오행: ' + moveDir.dominantOheng + '\n';
      text += '   최적 방향: ' + moveDir.bestDirs.join(', ') + ' 방향\n';
      text += '   피해야 할 방향: ' + (moveDir.avoidDirs.join(', ') || '없음') + '\n';
    }

    // 8방위 전체 정보 (최적 방향 중심)
    text += '\n【풍수 방위 참고 데이터】\n';
    Object.entries(PUNGSU_DIR).slice(0, 4).forEach(([dir, info]) => {
      text += '   ' + dir + '(' + info.element + ') — ' + info.energy + '\n';
    });

    text += '\n【배산임수 판단 기준】\n';
    text += '   이상적 집터: 뒤에 산·언덕(현무), 앞에 트인 공간(주작), 좌에 청룡, 우에 백호\n';
    text += '   금기 집터: T자 도로 끝, 병원·묘지 인근, 고가도로 밑, 큰 나무 바로 앞\n';
    text += '   현대 풍수: 채광·통풍·소음이 집터의 3대 핵심. 남향·동남향 최우선\n';
  }

  // ── 여행운 분석 ──
  if (category === '여행운') {
    text += '\n【여행운 분석 데이터】\n';
    if (input.travelDest)    text += '✈️ 목적지: ' + input.travelDest + '\n';
    if (input.travelPurpose) text += '🎯 여행 목적: ' + input.travelPurpose + '\n';
    if (input.companions)    text += '👫 동행: ' + input.companions + '\n';
    if (input.travelMonth)   text += '📅 예정 달: ' + input.travelMonth + '월\n';

    const travelAnal = analyzeTravelBySaju(saju, input);
    if (travelAnal) {
      text += '\n🔮 사주 기반 여행 방위 분석:\n';
      text += '   지배 오행: ' + travelAnal.dominantOheng + '\n';
      text += '   행운의 여행 방향: ' + travelAnal.bestDirs.join(', ') + '\n';
      text += '   추천 여행지: ' + travelAnal.recommendDest + '\n';
      text += '   피해야 할 방향: ' + travelAnal.avoidDir.join(', ') + '\n';
      text += '   여행 운 키워드: ' + travelAnal.luckNote + '\n';

      if (travelAnal.seasonAdvice) {
        text += '\n📅 선택하신 시기 분석: ' + travelAnal.seasonAdvice.grade + '\n';
        text += '   ' + travelAnal.seasonAdvice.desc + '\n';
      }
      text += '\n🌸 2026년 최적 여행 시기: 봄(3~5월), 가을(9~11월)\n';
    }

    // 역마살 확인
    text += '\n【역마살(驛馬煞) 참고】\n';
    text += '   역마살 활성 해: 사주 년지와 인·신·사·해(寅申巳亥)가 맞는 해에 여행·이동 기운 강함\n';
    text += '   2026년(병오년 午) 역마: 寅·申·巳·亥 지지 가진 분들은 올해 여행·이동 기운 매우 강함\n';
  }

  // AI 지침
  text += '\n【AI 상담 지침】\n';
  if (category === '이사운') {
    text += '1. 사주 오행 기반 최적 이사 방향을 가장 먼저 명확히 제시하세요.\n';
    text += '2. 2026년 이사하기 좋은 달 Top 3을 구체적으로 설명하세요.\n';
    text += '3. 이사 길일(요일·날짜)을 실용적으로 안내하세요.\n';
    text += '4. 사용자가 언급한 집 방향이나 위치가 사주와 맞는지 분석하세요.\n';
    text += '5. 이사 후 기운을 높이는 인테리어·배치 팁도 한 가지 이상 제안하세요.\n';
  } else if (category === '집터운') {
    text += '1. 사주 오행 기반 최적 집터 방향을 먼저 제시하세요.\n';
    text += '2. 배산임수·사신사(四神砂) 등 풍수 이론을 현대적으로 해석하여 설명하세요.\n';
    text += '3. 사용자가 언급한 집의 방향·층수·주변 환경에 대해 구체적으로 분석하세요.\n';
    text += '4. 풍수상 문제가 있다면 보완 방법(인테리어·식물 배치 등)도 제안하세요.\n';
    text += '5. 현대 생활에 맞는 실용적 풍수 조언을 포함하세요.\n';
  } else if (category === '여행운') {
    text += '1. 사주 오행 기반 행운의 여행 방향과 추천 여행지를 구체적으로 제시하세요.\n';
    text += '2. 2026년 최적 여행 시기를 계절별로 안내하세요.\n';
    text += '3. 사용자가 언급한 여행 목적·동행에 맞는 맞춤 여행 운세를 제공하세요.\n';
    text += '4. 여행 중 주의사항(건강·안전·지출 관련)도 사주 기반으로 안내하세요.\n';
    text += '5. 여행 후 기운 변화 기대 효과도 언급하세요.\n';
  }

  return text;
}

/* =====================================================
   14. 전역 노출
   ===================================================== */
window.parseLifestyleInput    = parseLifestyleInput;
window.analyzeMoveDirBySaju   = analyzeMoveDirBySaju;
window.analyzeTravelBySaju    = analyzeTravelBySaju;
window.getMovingTiming        = getMovingTiming;
window.lifestyleToPromptText  = lifestyleToPromptText;
window.PUNGSU_DIR             = PUNGSU_DIR;
window.OHENG_GOOD_DIR         = OHENG_GOOD_DIR;
window.MOVE_MONTH_2026        = MOVE_MONTH_2026;
window.TRAVEL_DIR_BY_OHENG    = TRAVEL_DIR_BY_OHENG;
window.TRAVEL_SEASON_2026     = TRAVEL_SEASON_2026;
window.HOUSE_TYPE_ANALYSIS    = HOUSE_TYPE_ANALYSIS;
