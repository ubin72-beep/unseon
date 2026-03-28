/* =========================================================
   운세ON — js/astrology.js
   서양 점성술 완전 구현 (정밀 행성 위치 계산)
   
   [포함 기능]
   - 12 태양궁(별자리) 정확한 날짜 기반 판별
   - 어센던트(상승궁) 계산 (출생 시간 기반)
   - 행성 위치 추정 (태양·달·수성·금성·화성·목성·토성)
   - 출생 차트 생성 및 원소/양식 분석
   - 행성 배치 → Gemini 프롬프트 텍스트 변환
   ========================================================= */

/* =====================================================
   1. 황도 12궁 (별자리) 데이터
   ===================================================== */
const ZODIAC_SIGNS = [
  {
    id: 0, name: '양자리', en: 'Aries', symbol: '♈', emoji: '🐏',
    element: '불', quality: '활동궁', ruler: '화성',
    dates: { start: { m: 3, d: 21 }, end: { m: 4, d: 19 } },
    traits: '열정적, 개척정신, 충동적, 리더십, 용감함',
    strength: '결단력, 추진력, 용기, 독립심',
    weakness: '충동성, 인내심 부족, 이기심',
    love: '독립적이지만 열정적인 연애를 즐깁니다. 상대에게 적극적으로 접근합니다.',
    career: '리더십이 필요한 분야, 군인, 운동선수, 기업가에 적합합니다.',
    health: '두통, 열, 과로에 주의하세요.',
    lucky: { color: '빨강', number: 1, day: '화요일', stone: '루비' }
  },
  {
    id: 1, name: '황소자리', en: 'Taurus', symbol: '♉', emoji: '🐂',
    element: '흙', quality: '고정궁', ruler: '금성',
    dates: { start: { m: 4, d: 20 }, end: { m: 5, d: 20 } },
    traits: '안정적, 인내심, 물질적, 감각적, 완고함',
    strength: '신뢰성, 인내, 실용성, 감각적 즐거움 추구',
    weakness: '고집, 변화 저항, 물질주의, 게으름',
    love: '안정적이고 헌신적인 관계를 원합니다. 천천히 신뢰를 쌓아갑니다.',
    career: '금융, 예술, 요리, 부동산, 농업 분야에 적합합니다.',
    health: '목, 갑상선, 목 부위에 주의하세요.',
    lucky: { color: '초록', number: 6, day: '금요일', stone: '에메랄드' }
  },
  {
    id: 2, name: '쌍둥이자리', en: 'Gemini', symbol: '♊', emoji: '👯',
    element: '공기', quality: '변동궁', ruler: '수성',
    dates: { start: { m: 5, d: 21 }, end: { m: 6, d: 20 } },
    traits: '호기심, 적응력, 소통 능력, 이중성, 변덕',
    strength: '지적 호기심, 의사소통, 유연성, 다재다능',
    weakness: '일관성 부족, 피상적, 불안정, 우유부단',
    love: '지적인 교류와 대화를 중요시합니다. 다양한 경험을 원합니다.',
    career: '저널리즘, 교육, 판매, 통신, IT 분야에 적합합니다.',
    health: '폐, 손, 팔, 신경계에 주의하세요.',
    lucky: { color: '노랑', number: 5, day: '수요일', stone: '진주' }
  },
  {
    id: 3, name: '게자리', en: 'Cancer', symbol: '♋', emoji: '🦀',
    element: '물', quality: '활동궁', ruler: '달',
    dates: { start: { m: 6, d: 21 }, end: { m: 7, d: 22 } },
    traits: '감수성, 모성애, 직관, 가정적, 집착',
    strength: '공감 능력, 보호 본능, 충성심, 직관력',
    weakness: '감정 기복, 집착, 예민함, 과거 집착',
    love: '깊은 감정적 유대를 원합니다. 가정과 안정을 중요시합니다.',
    career: '간호, 교육, 요리사, 심리 상담사, 부동산에 적합합니다.',
    health: '위장, 가슴, 감정적 스트레스에 주의하세요.',
    lucky: { color: '은색', number: 2, day: '월요일', stone: '문스톤' }
  },
  {
    id: 4, name: '사자자리', en: 'Leo', symbol: '♌', emoji: '🦁',
    element: '불', quality: '고정궁', ruler: '태양',
    dates: { start: { m: 7, d: 23 }, end: { m: 8, d: 22 } },
    traits: '카리스마, 자신감, 창조성, 관대함, 자만심',
    strength: '리더십, 창의성, 열정, 너그러움',
    weakness: '자만심, 오만함, 고집, 주목 욕구',
    love: '로맨틱하고 열정적입니다. 상대를 왕처럼 대우받고 싶어합니다.',
    career: '연예, 예술, 경영, 정치, 교육 분야에 적합합니다.',
    health: '심장, 등, 과로에 주의하세요.',
    lucky: { color: '금색', number: 1, day: '일요일', stone: '루비' }
  },
  {
    id: 5, name: '처녀자리', en: 'Virgo', symbol: '♍', emoji: '👧',
    element: '흙', quality: '변동궁', ruler: '수성',
    dates: { start: { m: 8, d: 23 }, end: { m: 9, d: 22 } },
    traits: '분석적, 완벽주의, 실용적, 섬세함, 비판적',
    strength: '꼼꼼함, 분석력, 건강 의식, 헌신',
    weakness: '완벽주의, 과도한 비판, 걱정, 소심함',
    love: '신중하고 헌신적입니다. 실질적인 방법으로 사랑을 표현합니다.',
    career: '의료, 영양사, 편집자, 데이터 분석, 회계에 적합합니다.',
    health: '소화기, 복부, 영양에 주의하세요.',
    lucky: { color: '갈색', number: 6, day: '수요일', stone: '사파이어' }
  },
  {
    id: 6, name: '천칭자리', en: 'Libra', symbol: '♎', emoji: '⚖️',
    element: '공기', quality: '활동궁', ruler: '금성',
    dates: { start: { m: 9, d: 23 }, end: { m: 10, d: 22 } },
    traits: '균형, 공정함, 심미적, 사교적, 우유부단',
    strength: '외교력, 공정함, 아름다움 감각, 협력',
    weakness: '우유부단, 의존성, 갈등 회피, 피상적',
    love: '파트너십과 조화를 중요시합니다. 로맨틱하고 세련됩니다.',
    career: '법률, 외교, 예술, 패션, 심리 상담에 적합합니다.',
    health: '신장, 허리, 피부에 주의하세요.',
    lucky: { color: '분홍', number: 7, day: '금요일', stone: '다이아몬드' }
  },
  {
    id: 7, name: '전갈자리', en: 'Scorpio', symbol: '♏', emoji: '🦂',
    element: '물', quality: '고정궁', ruler: '명왕성',
    dates: { start: { m: 10, d: 23 }, end: { m: 11, d: 21 } },
    traits: '강렬함, 통찰력, 신비로움, 변혁, 집착',
    strength: '직관력, 결단력, 깊이, 연구력',
    weakness: '집착, 질투, 복수심, 비밀주의',
    love: '강렬하고 깊은 감정적 유대를 원합니다. 독점욕이 강합니다.',
    career: '심리학, 탐정, 외과의, 연구원, 금융에 적합합니다.',
    health: '생식기, 배설기, 스트레스에 주의하세요.',
    lucky: { color: '검정', number: 9, day: '화요일', stone: '오닉스' }
  },
  {
    id: 8, name: '사수자리', en: 'Sagittarius', symbol: '♐', emoji: '🏹',
    element: '불', quality: '변동궁', ruler: '목성',
    dates: { start: { m: 11, d: 22 }, end: { m: 12, d: 21 } },
    traits: '낙관주의, 모험, 철학적, 자유로움, 무책임',
    strength: '낙관주의, 열린 마음, 유머, 여행 본능',
    weakness: '무책임, 과장, 인내심 부족, 직설적',
    love: '자유와 모험을 원합니다. 속박을 싫어하고 친구 같은 연애를 즐깁니다.',
    career: '여행사, 철학자, 교육자, 법조인, 스포츠에 적합합니다.',
    health: '엉덩이, 허벅지, 간에 주의하세요.',
    lucky: { color: '보라', number: 3, day: '목요일', stone: '터키석' }
  },
  {
    id: 9, name: '염소자리', en: 'Capricorn', symbol: '♑', emoji: '🐐',
    element: '흙', quality: '활동궁', ruler: '토성',
    dates: { start: { m: 12, d: 22 }, end: { m: 1, d: 19 } },
    traits: '야망, 인내, 책임감, 현실적, 냉정함',
    strength: '목표 지향, 인내, 책임감, 조직력',
    weakness: '냉담함, 비관주의, 지나친 일 중심, 고집',
    love: '신중하고 오래가는 관계를 선호합니다. 책임감 있는 파트너를 원합니다.',
    career: '경영, 정치, 건축, 금융, 행정에 적합합니다.',
    health: '무릎, 뼈, 피부, 치아에 주의하세요.',
    lucky: { color: '회색', number: 10, day: '토요일', stone: '오닉스' }
  },
  {
    id: 10, name: '물병자리', en: 'Aquarius', symbol: '♒', emoji: '🏺',
    element: '공기', quality: '고정궁', ruler: '천왕성',
    dates: { start: { m: 1, d: 20 }, end: { m: 2, d: 18 } },
    traits: '독창적, 인도주의적, 반항적, 지적, 고집',
    strength: '창의성, 진보성, 사회 의식, 독립심',
    weakness: '냉담함, 고집, 예측 불가, 반사회성',
    love: '우정에서 시작되는 연애를 즐깁니다. 지적이고 독립적인 파트너를 원합니다.',
    career: 'IT, 과학, 사회활동가, 발명가, 미래학자에 적합합니다.',
    health: '발목, 순환계, 신경에 주의하세요.',
    lucky: { color: '파랑', number: 4, day: '토요일', stone: '자수정' }
  },
  {
    id: 11, name: '물고기자리', en: 'Pisces', symbol: '♓', emoji: '🐟',
    element: '물', quality: '변동궁', ruler: '해왕성',
    dates: { start: { m: 2, d: 19 }, end: { m: 3, d: 20 } },
    traits: '공감 능력, 직관, 예술적, 이상주의, 현실 도피',
    strength: '공감력, 창의성, 직관력, 영적 감수성',
    weakness: '현실 도피, 우유부단, 희생 과잉, 피해 의식',
    love: '깊은 감정적 연결과 영적 교감을 원합니다. 로맨틱하고 헌신적입니다.',
    career: '예술, 음악, 의료, 영적 지도자, 심리 치료에 적합합니다.',
    health: '발, 면역계, 중독에 주의하세요.',
    lucky: { color: '바다색', number: 7, day: '목요일', stone: '아쿠아마린' }
  }
];

/* =====================================================
   2. 행성 데이터
   ===================================================== */
const PLANETS = [
  { name: '태양', en: 'Sun', emoji: '☀️',
    meaning: '자아, 생명력, 의식, 정체성, 아버지상' },
  { name: '달',   en: 'Moon', emoji: '🌙',
    meaning: '감정, 무의식, 본능, 어머니상, 습관' },
  { name: '수성', en: 'Mercury', emoji: '☿',
    meaning: '사고, 소통, 학습, 이동, 상업' },
  { name: '금성', en: 'Venus', emoji: '♀️',
    meaning: '사랑, 아름다움, 예술, 가치관, 여성성' },
  { name: '화성', en: 'Mars', emoji: '♂️',
    meaning: '행동력, 욕망, 에너지, 용기, 경쟁' },
  { name: '목성', en: 'Jupiter', emoji: '♃',
    meaning: '확장, 행운, 지혜, 철학, 풍요' },
  { name: '토성', en: 'Saturn', emoji: '♄',
    meaning: '규율, 제한, 책임, 시간, 카르마' },
];

/* =====================================================
   3. 태양궁(별자리) 계산
   - 실제 황도 경도 기반으로 정확히 계산
   ===================================================== */

/**
 * 율리우스 일수 계산
 * @param {number} year, month, day
 * @returns {number} JD
 */
function toJulianDay(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) +
         Math.floor(30.6001 * (month + 1)) +
         day + B - 1524.5;
}

/**
 * 태양의 황도 경도(도) 계산 (VSOP87 간소화)
 * @param {number} jd 율리우스 일수
 * @returns {number} 0~360도 황도 경도
 */
function getSunLongitude(jd) {
  // 율리우스 세기
  const T = (jd - 2451545.0) / 36525.0;

  // 태양의 평균 경도 (도)
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  L0 = L0 % 360;
  if (L0 < 0) L0 += 360;

  // 태양의 평균 근점 이각 (도)
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = M % 360;
  if (M < 0) M += 360;
  const Mr = M * Math.PI / 180;

  // 태양 중심 방정식
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
          + 0.000289 * Math.sin(3 * Mr);

  // 태양의 참 경도
  let sunLon = L0 + C;
  sunLon = sunLon % 360;
  if (sunLon < 0) sunLon += 360;

  return sunLon;
}

/**
 * 황도 경도 → 별자리 인덱스 (0=양자리 ~ 11=물고기자리)
 */
function lonToSignIndex(lon) {
  return Math.floor(lon / 30) % 12;
}

/**
 * 생년월일 → 태양궁 (정밀 계산)
 */
function getSunSign(year, month, day) {
  const jd  = toJulianDay(year, month, day);
  const lon = getSunLongitude(jd);
  const idx = lonToSignIndex(lon);
  return { ...ZODIAC_SIGNS[idx], longitude: lon.toFixed(2) };
}

/* =====================================================
   4. 달의 위치 계산 (간소화)
   ===================================================== */
function getMoonSign(year, month, day) {
  const jd = toJulianDay(year, month, day);
  const T  = (jd - 2451545.0) / 36525.0;

  // 달의 평균 경도
  let L = 218.316 + 481267.881 * T;
  L = L % 360;
  if (L < 0) L += 360;

  // 달의 평균 근점
  let M = 134.963 + 477198.868 * T;
  M = M % 360;
  if (M < 0) M += 360;

  // 달의 위도 인수
  let F = 93.272 + 483202.018 * T;
  F = F % 360;
  if (F < 0) F += 360;

  const Mr = M * Math.PI / 180;
  const Fr = F * Math.PI / 180;

  // 달의 황도 경도 보정
  let moonLon = L
    + 6.289 * Math.sin(Mr)
    - 1.274 * Math.sin(2 * (L - F) * Math.PI / 180)
    + 0.658 * Math.sin(2 * F * Math.PI / 180)
    - 0.186 * Math.sin(2 * M * Math.PI / 180)
    - 0.059 * Math.sin(2 * (F - M) * Math.PI / 180);

  moonLon = moonLon % 360;
  if (moonLon < 0) moonLon += 360;

  const idx = lonToSignIndex(moonLon);
  return { ...ZODIAC_SIGNS[idx], longitude: moonLon.toFixed(2), planet: '달' };
}

/* =====================================================
   5. 행성 위치 계산 (간소화된 케플러 방정식)
   ===================================================== */

// 궤도 요소 (J2000.0 기준)
const ORBITAL_ELEMENTS = {
  mercury: {
    L: [252.250324, 149472.674986], // 평균 경도
    a: 0.387098,                    // 반장축 (AU)
    e: 0.205635,                    // 이심률
    i: 7.005,                       // 궤도 경사각
    omega: 29.125,                  // 근일점 경도
  },
  venus: {
    L: [181.979801, 58517.815676],
    a: 0.723330, e: 0.006773, i: 3.395, omega: 54.884,
  },
  mars: {
    L: [355.433, 19140.299],
    a: 1.523688, e: 0.093405, i: 1.850, omega: 286.502,
  },
  jupiter: {
    L: [34.351519, 3034.905675],
    a: 5.202561, e: 0.048498, i: 1.303, omega: 14.753,
  },
  saturn: {
    L: [50.077444, 1222.113795],
    a: 9.554747, e: 0.055546, i: 2.489, omega: 92.432,
  },
};

function getPlanetLongitude(planetKey, jd) {
  const el = ORBITAL_ELEMENTS[planetKey];
  if (!el) return 0;

  const T = (jd - 2451545.0) / 36525.0;

  // 평균 경도
  let L = el.L[0] + el.L[1] * T / 36525;
  L = L % 360;
  if (L < 0) L += 360;

  // 평균 근점 이각
  const M = (L - el.omega + 360) % 360;
  const Mr = M * Math.PI / 180;

  // 케플러 방정식 (1차 근사)
  const e  = el.e;
  const Ec = M + (180 / Math.PI) * e * Math.sin(Mr) *
             (1 + e * Math.cos(Mr));

  // 진 근점 이각
  const Ecr = Ec * Math.PI / 180;
  const v = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(Ecr / 2));

  // 황도 경도
  let lon = (v * 180 / Math.PI + el.omega) % 360;
  if (lon < 0) lon += 360;

  return lon;
}

/**
 * 모든 행성 위치 계산
 */
function getAllPlanetPositions(year, month, day) {
  const jd = toJulianDay(year, month, day);
  const sunLon   = getSunLongitude(jd);
  const moonData = getMoonSign(year, month, day);

  const positions = [
    {
      planet: '태양', emoji: '☀️',
      longitude: sunLon,
      sign: ZODIAC_SIGNS[lonToSignIndex(sunLon)].name,
      signEmoji: ZODIAC_SIGNS[lonToSignIndex(sunLon)].emoji,
    },
    {
      planet: '달', emoji: '🌙',
      longitude: parseFloat(moonData.longitude),
      sign: moonData.name,
      signEmoji: moonData.emoji,
    },
  ];

  const planetMap = {
    mercury: { name: '수성', emoji: '☿' },
    venus:   { name: '금성', emoji: '♀' },
    mars:    { name: '화성', emoji: '♂' },
    jupiter: { name: '목성', emoji: '♃' },
    saturn:  { name: '토성', emoji: '♄' },
  };

  Object.entries(planetMap).forEach(([key, info]) => {
    const lon  = getPlanetLongitude(key, jd);
    const sign = ZODIAC_SIGNS[lonToSignIndex(lon)];
    positions.push({
      planet: info.name, emoji: info.emoji,
      longitude: lon,
      sign: sign.name, signEmoji: sign.emoji,
    });
  });

  return positions;
}

/* =====================================================
   6. 어센던트(상승궁) 계산
   - 출생 시간 + 위도 기반
   ===================================================== */

/**
 * 항성시 계산 (그리니치)
 */
function getGMST(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  let GMST = 280.46061837 +
             360.98564736629 * (jd - 2451545.0) +
             0.000387933 * T * T -
             T * T * T / 38710000;
  GMST = GMST % 360;
  if (GMST < 0) GMST += 360;
  return GMST;
}

/**
 * 어센던트 계산
 * @param {number} year, month, day, hour (소수 시간, UT 기준)
 * @param {number} lat 위도, lon 경도 (한국: 37.5, 127.0)
 */
function calcAscendant(year, month, day, hourUT, lat, lonObs) {
  const jd = toJulianDay(year, month, day) + hourUT / 24;

  // 지방 항성시 (도)
  const GMST = getGMST(jd);
  const LST  = (GMST + lonObs + 360) % 360;

  // 황도 경사각
  const T    = (jd - 2451545.0) / 36525.0;
  const eps  = (23.439291111 - 0.013004167 * T) * Math.PI / 180;
  const LSTR = LST * Math.PI / 180;
  const latR = lat * Math.PI / 180;

  // 어센던트 경도
  let ascLon = Math.atan2(
    Math.cos(LSTR),
    -(Math.sin(LSTR) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps))
  ) * 180 / Math.PI;

  ascLon = ascLon % 360;
  if (ascLon < 0) ascLon += 360;

  const idx = lonToSignIndex(ascLon);
  return {
    longitude: ascLon,
    sign:      ZODIAC_SIGNS[idx],
    signName:  ZODIAC_SIGNS[idx].name,
  };
}

/* =====================================================
   7. 출생 차트 생성 (메인 함수)
   ===================================================== */

/**
 * 사용자 입력에서 생년월일 & 시간 파싱
 */
function parseAstrologyInput(text) {
  const result = {
    found: false,
    year: null, month: null, day: null,
    hour: null, minute: 0,
    lat: 37.5, lonObs: 127.0   // 기본값: 서울
  };

  // 연도 패턴
  const yearMatch = text.match(/(\d{4})년/);
  if (yearMatch) result.year = parseInt(yearMatch[1]);

  // 월 패턴
  const monthMatch = text.match(/(\d{1,2})월/);
  if (monthMatch) result.month = parseInt(monthMatch[1]);

  // 일 패턴
  const dayMatch = text.match(/(\d{1,2})일/);
  if (dayMatch) result.day = parseInt(dayMatch[1]);

  // 시간 패턴 (오전/오후 포함)
  const ampmMatch = text.match(/(오전|오후|am|pm|AM|PM)/i);
  const hourMatch = text.match(/(\d{1,2})시/);
  if (hourMatch) {
    let h = parseInt(hourMatch[1]);
    if (ampmMatch) {
      const ampm = ampmMatch[1];
      if (/오후|pm/i.test(ampm) && h < 12) h += 12;
      if (/오전|am/i.test(ampm) && h === 12) h = 0;
    }
    result.hour = h;
  }

  // 자시/축시 등 한국 시진 패턴
  const sijiMap = {
    '자시': 0, '축시': 2, '인시': 4, '묘시': 6,
    '진시': 8, '사시': 10, '오시': 12, '미시': 14,
    '신시': 16, '유시': 18, '술시': 20, '해시': 22
  };
  for (const [siName, siHour] of Object.entries(sijiMap)) {
    if (text.includes(siName)) {
      result.hour = siHour;
      break;
    }
  }

  const minMatch = text.match(/(\d{1,2})분/);
  if (minMatch) result.minute = parseInt(minMatch[1]);

  // 출생지 파싱 (기본: 서울)
  if (text.includes('부산')) { result.lat = 35.1; result.lonObs = 129.0; }
  else if (text.includes('대구')) { result.lat = 35.9; result.lonObs = 128.6; }
  else if (text.includes('인천')) { result.lat = 37.5; result.lonObs = 126.7; }
  else if (text.includes('대전')) { result.lat = 36.4; result.lonObs = 127.4; }
  else if (text.includes('광주')) { result.lat = 35.2; result.lonObs = 126.9; }
  else if (text.includes('제주')) { result.lat = 33.5; result.lonObs = 126.5; }

  if (result.year && result.month && result.day) {
    result.found = true;
  }

  return result;
}

/**
 * 완전한 출생 차트 생성
 */
function calcAstrologyChart(input) {
  const { year, month, day, hour, minute, lat, lonObs } = input;

  if (!year || !month || !day) {
    return { error: '생년월일이 필요합니다.' };
  }

  // 태양궁
  const sunSign = getSunSign(year, month, day);

  // 달 별자리
  const moonSign = getMoonSign(year, month, day);

  // 모든 행성 위치
  const planets = getAllPlanetPositions(year, month, day);

  // 어센던트 (출생 시간이 있을 때만)
  let ascendant = null;
  if (hour !== null && hour !== undefined) {
    const hourUT = hour + (minute || 0) / 60 - 9; // KST → UT
    ascendant = calcAscendant(year, month, day, hourUT, lat || 37.5, lonObs || 127.0);
  }

  // 원소 분석 (태양, 달, 어센던트 기준)
  const elementCount = { '불': 0, '흙': 0, '공기': 0, '물': 0 };
  [sunSign, moonSign].forEach(s => {
    if (s && s.element) elementCount[s.element]++;
  });
  if (ascendant && ascendant.sign) {
    elementCount[ascendant.sign.element]++;
  }

  // 지배적 원소
  const dominantElement = Object.entries(elementCount)
    .sort((a, b) => b[1] - a[1])[0][0];

  // 양식 분석
  const qualityCount = { '활동궁': 0, '고정궁': 0, '변동궁': 0 };
  [sunSign, moonSign].forEach(s => {
    if (s && s.quality) qualityCount[s.quality]++;
  });

  // 현재 목성 위치 (2026년 기준: 쌍둥이자리 ~ 게자리 이동기)
  // 2026년 목성: 쌍둥이자리(2025년 6월 ~ 2026년 6월) → 게자리(2026년 6월 이후)
  const currentJupiter = '쌍둥이자리 → 게자리';

  // 2026년 토성: 물고기자리 종료(2026년 5월) → 양자리(2026년 5월 이후)
  const currentSaturn = '물고기자리 → 양자리';

  return {
    year, month, day, hour, minute,
    sunSign,
    moonSign: { ...ZODIAC_SIGNS[lonToSignIndex(parseFloat(moonSign.longitude))], longitude: moonSign.longitude },
    ascendant,
    planets,
    elementCount,
    dominantElement,
    qualityCount,
    currentJupiter,
    currentSaturn,
    // 태양궁 기반 2026년 운세 키워드
    yearForecast2026: getYearForecast2026(sunSign.name)
  };
}

/* =====================================================
   8. 2026년 별자리별 운세 키워드
   ===================================================== */
function getYearForecast2026(signName) {
  const forecasts = {
    '양자리':    { love: '새로운 만남의 기회', career: '적극적 도전으로 승진 가능', money: '투자 신중하게', health: '과로 주의', lucky: '3~5월' },
    '황소자리':  { love: '안정적 관계 발전', career: '재능 인정받는 시기', money: '저축 늘어남', health: '목 건강 챙기기', lucky: '4~6월' },
    '쌍둥이자리':{ love: '소통으로 관계 발전', career: '다양한 프로젝트 기회', money: '예상외 수입', health: '수면 부족 주의', lucky: '5~7월' },
    '게자리':    { love: '깊은 감정 교류', career: '가정과 일 균형 중요', money: '부동산 운 좋음', health: '위장 관리', lucky: '6~8월' },
    '사자자리':  { love: '로맨틱한 시간들', career: '리더십 발휘 기회', money: '창의적 수입', health: '심장 건강 챙기기', lucky: '7~9월' },
    '처녀자리':  { love: '섬세한 배려로 관계 깊어짐', career: '전문성 인정받음', money: '꼼꼼한 재정 관리', health: '소화기 주의', lucky: '8~10월' },
    '천칭자리':  { love: '조화로운 파트너십', career: '협업에서 성과', money: '균형 잡힌 재정', health: '신장 건강', lucky: '9~11월' },
    '전갈자리':  { love: '강렬한 감정의 해', career: '변혁과 새로운 시작', money: '투자 성과', health: '스트레스 관리', lucky: '10~12월' },
    '사수자리':  { love: '자유로운 연애', career: '해외 관련 기회', money: '교육 투자 효과', health: '허리 관리', lucky: '11~1월' },
    '염소자리':  { love: '진지한 관계 진전', career: '경력 최고점 도달', money: '장기 투자 결실', health: '무릎 건강', lucky: '12~2월' },
    '물병자리':  { love: '독특하고 신선한 만남', career: 'IT·혁신 분야 기회', money: '예상외 행운', health: '순환계 주의', lucky: '1~3월' },
    '물고기자리':{ love: '영적 교감', career: '창조적 작업 성과', money: '직관을 믿는 투자', health: '면역력 관리', lucky: '2~4월' },
  };
  return forecasts[signName] || {};
}

/* =====================================================
   9. 출생 차트 → Gemini 프롬프트 텍스트 변환
   ===================================================== */
function astrologyToPromptText(chart) {
  if (!chart || chart.error) return '';

  let text = '\n\n【서양 점성술 출생 차트 (이 데이터를 기반으로 해석할 것)】\n';

  // 태양궁
  text += '☀️ 태양궁: ' + chart.sunSign.name + ' (' + chart.sunSign.en + ') ';
  text += '| 황도 ' + chart.sunSign.longitude + '°\n';
  text += '   원소: ' + chart.sunSign.element;
  text += ' | 양식: ' + chart.sunSign.quality;
  text += ' | 지배행성: ' + chart.sunSign.ruler + '\n';
  text += '   특성: ' + chart.sunSign.traits + '\n\n';

  // 달 별자리
  text += '🌙 달 별자리: ' + chart.moonSign.name + ' | 황도 ' + chart.moonSign.longitude + '°\n';
  text += '   달의 영향: 감정, 본능, 무의식 — ' + chart.moonSign.traits + '\n\n';

  // 어센던트
  if (chart.ascendant) {
    text += '⬆️ 어센던트(상승궁): ' + chart.ascendant.signName + '\n';
    text += '   외면적 성격, 타인에게 보이는 모습 — ' + chart.ascendant.sign.traits + '\n\n';
  }

  // 행성 위치 요약
  text += '🪐 행성 위치:\n';
  chart.planets.forEach(p => {
    text += '   ' + p.emoji + ' ' + p.planet + ': ' + p.sign + p.signEmoji + '\n';
  });

  // 원소 분석
  text += '\n🔥 원소 분포: ';
  Object.entries(chart.elementCount).forEach(([el, cnt]) => {
    if (cnt > 0) text += el + '(' + cnt + ') ';
  });
  text += '\n   지배 원소: ' + chart.dominantElement + '\n';

  // 2026년 행성 위치
  text += '\n📅 2026년 주요 행성:\n';
  text += '   목성(행운): ' + chart.currentJupiter + '\n';
  text += '   토성(시련): ' + chart.currentSaturn + '\n';

  // 2026년 태양궁별 운세 키워드
  if (chart.yearForecast2026 && Object.keys(chart.yearForecast2026).length > 0) {
    const f = chart.yearForecast2026;
    text += '\n🗓️ 2026년 ' + chart.sunSign.name + ' 핵심 키워드:\n';
    text += '   💕 연애: ' + (f.love || '') + '\n';
    text += '   💼 직업: ' + (f.career || '') + '\n';
    text += '   💰 재물: ' + (f.money || '') + '\n';
    text += '   🏥 건강: ' + (f.health || '') + '\n';
    text += '   ✨ 행운 시기: ' + (f.lucky || '') + '\n';
  }

  text += '\n위 출생 차트를 바탕으로 사용자의 질문에 맞는 깊이 있는 점성술 해석을 해주세요.\n';
  text += '태양궁, 달 별자리, 어센던트의 조합이 사람의 복잡한 성격을 만들어낸다는 점을 반영하세요.\n';

  return text;
}

/* =====================================================
   10. 전역 노출
   ===================================================== */
window.getSunSign              = getSunSign;
window.getMoonSign             = getMoonSign;
window.getAllPlanetPositions    = getAllPlanetPositions;
window.calcAscendant           = calcAscendant;
window.calcAstrologyChart      = calcAstrologyChart;
window.parseAstrologyInput     = parseAstrologyInput;
window.astrologyToPromptText   = astrologyToPromptText;
window.getYearForecast2026     = getYearForecast2026;
window.ZODIAC_SIGNS            = ZODIAC_SIGNS;
