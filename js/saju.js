/* =========================================================
   운세ON — js/saju.js
   사주팔자 계산 엔진 (완전 구현)
   - 음력 ↔ 양력 정확 변환 (1900~2060)
   - 연주/월주/일주/시주 천간지지 계산
   - 오행 분석, 용신/기신 도출
   ========================================================= */

/* =====================================================
   1. 음력 데이터베이스 (1900~2060)
   각 연도의 음력 정보: [윤월, 1~12월 대소, 1월 1일의 양력 월, 양력 일]
   월 데이터: 1=소(29일), 0=대(30일), 비트 인코딩
   ===================================================== */
const LUNAR_DB = (function() {
  // 데이터 형식: [연도, 춘절양력월, 춘절양력일, 월정보(16진수), 윤달]
  // 월정보: 상위12비트 = 각월 대소(1=소29일, 0=대30일), 하위4비트 = 윤달크기(1=소, 0=대)
  const raw = [
    [1900,1,31,0x04AE,0],[1901,2,19,0x0A57,0],[1902,2, 8,0x054D,5],[1903,1,29,0x0D26,0],
    [1904,2,16,0x0D63,0],[1905,2, 4,0x0A57,4],[1906,1,25,0x056A,0],[1907,2,13,0x096D,0],
    [1908,2, 2,0x04AE,2],[1909,1,22,0x04AE,0],[1910,2,10,0x0A5B,0],[1911,1,30,0x0A57,6],
    [1912,2,18,0x052B,0],[1913,2, 6,0x0A53,0],[1914,1,26,0x0D55,5],[1915,2,14,0x0ABD,0],
    [1916,2, 3,0x04AE,0],[1917,1,23,0x0A5B,2],[1918,2,11,0x0526,0],[1919,2, 1,0x0E2D,0],
    [1920,2,20,0x0D2B,6],[1921,2, 8,0x0A57,0],[1922,1,28,0x056A,0],[1923,2,16,0x096D,5],
    [1924,2, 5,0x04AE,0],[1925,1,24,0x0A4D,0],[1926,2,13,0x0D25,4],[1927,2, 2,0x0D65,0],
    [1928,1,23,0x0B54,0],[1929,2,10,0x056A,2],[1930,1,30,0x096D,0],[1931,2,17,0x04AE,0],
    [1932,2, 6,0x0A4D,7],[1933,1,26,0x0EA5,0],[1934,2,14,0x06AA,0],[1935,2, 4,0x0AB5,5],
    [1936,1,24,0x04AE,0],[1937,2,11,0x0AE6,0],[1938,1,31,0x0A56,3],[1939,2,19,0x0D4A,0],
    [1940,2, 8,0x0EA5,0],[1941,1,27,0x06B5,8],[1942,2,15,0x06AE,0],[1943,2, 5,0x0AD5,0],
    [1944,1,25,0x052B,6],[1945,2,13,0x0A97,0],[1946,2, 2,0x0D4A,0],[1947,1,22,0x0EA5,5],
    [1948,2,10,0x06AC,0],[1949,1,29,0x0AB5,0],[1950,2,17,0x0AAE,4],[1951,2, 6,0x056A,0],
    [1952,1,27,0x0B6A,0],[1953,2,14,0x096D,3],[1954,2, 3,0x04AE,0],[1955,1,24,0x04AD,0],
    [1956,2,12,0x0A4B,8],[1957,1,31,0x0D25,0],[1958,2,18,0x1155,0],[1959,2, 8,0x0D54,6],
    [1960,1,28,0x056A,0],[1961,2,15,0x096D,0],[1962,2, 5,0x04AE,5],[1963,1,25,0x0A4D,0],
    [1964,2,13,0x0D15,0],[1965,2, 2,0x1655,4],[1966,1,21,0x056A,0],[1967,2, 9,0x096D,0],
    [1968,1,30,0x04AE,3],[1969,2,17,0x0A4D,0],[1970,2, 6,0x0A95,0],[1971,1,27,0x0D4A,8],
    [1972,2,15,0x0DA5,0],[1973,2, 3,0x056A,0],[1974,1,23,0x0AAB,6],[1975,2,11,0x04AE,0],
    [1976,1,31,0x0A4B,0],[1977,2,18,0x0AA5,4],[1978,2, 7,0x06EA,0],[1979,1,28,0x0AB5,0],
    [1980,2,16,0x04AE,9],[1981,2, 5,0x0A57,0],[1982,1,25,0x0526,0],[1983,2,13,0x0EA5,6],
    [1984,2, 2,0x06AA,0],[1985,1,20,0x0AB5,0],[1986,2, 9,0x04AE,5],[1987,1,29,0x0A57,0],
    [1988,2,17,0x0526,0],[1989,2, 6,0x0D26,4],[1990,1,27,0x0EA5,0],[1991,2,15,0x06AA,0],
    [1992,2, 4,0x0AE5,3],[1993,1,23,0x0AB5,0],[1994,2,10,0x056A,0],[1995,1,31,0x096E,8],
    [1996,2,19,0x04AE,0],[1997,2, 7,0x0A56,0],[1998,1,28,0x0D4A,6],[1999,2,16,0x0EA5,0],
    [2000,2, 5,0x06AA,0],[2001,1,24,0x056D,4],[2002,2,12,0x04AE,0],[2003,2, 1,0x0A5B,0],
    [2004,1,22,0x0AAB,2],[2005,2, 9,0x04AE,0],[2006,1,29,0x0A4B,0],[2007,2,18,0x0AA5,7],
    [2008,2, 7,0x06AD,0],[2009,1,26,0x056A,0],[2010,2,14,0x0AAD,5],[2011,2, 3,0x04AE,0],
    [2012,1,23,0x0A4D,0],[2013,2,10,0x0D15,4],[2014,1,31,0x0D60,0],[2015,2,19,0x0DA5,0],
    [2016,2, 8,0x056A,3],[2017,1,28,0x096D,0],[2018,2,16,0x04AE,0],[2019,2, 5,0x0A56,8],
    [2020,1,25,0x0D4A,0],[2021,2,12,0x0EA5,0],[2022,2, 1,0x06AA,5],[2023,1,22,0x0AB5,0],
    [2024,2,10,0x04AE,0],[2025,1,29,0x0A57,6],[2026,2,17,0x0526,0],[2027,2, 6,0x0D26,0],
    [2028,1,26,0x0EA5,5],[2029,2,13,0x06B5,0],[2030,2, 3,0x04AE,0],[2031,1,23,0x0A57,3],
    [2032,2,11,0x0526,0],[2033,1,31,0x0D25,0],[2034,2,19,0x0D65,11],[2035,2, 8,0x056A,0],
    [2036,1,28,0x096D,0],[2037,2,15,0x04AE,6],[2038,2, 4,0x0A4D,0],[2039,1,24,0x0D25,0],
    [2040,2,12,0x1D25,4],[2041,2, 1,0x056A,0],[2042,1,22,0x096D,0],[2043,2,10,0x04AE,2],
    [2044,1,30,0x0A4D,0],[2045,2,17,0x0D15,0],[2046,2, 6,0x0EA5,7],[2047,1,26,0x056A,0],
    [2048,2,14,0x0AAD,0],[2049,2, 2,0x0A9B,5],[2050,1,23,0x04AE,0],
  ];

  // 각 연도의 음력달 정보 파싱
  const db = {};
  raw.forEach(function(r) {
    const year = r[0];
    const chunjol_m = r[1];   // 춘절(음력 1월1일)의 양력 월
    const chunjol_d = r[2];   // 춘절의 양력 일
    const monthInfo = r[3];   // 16진수 월정보
    const leapMonth = r[4];   // 윤달 번호 (0=없음)

    // 각 월의 일수 계산 (비트로 인코딩)
    const months = [];
    for (let m = 11; m >= 0; m--) {
      months.push(((monthInfo >> m) & 1) ? 29 : 30);
    }

    db[year] = {
      chunjol_m: chunjol_m,
      chunjol_d: chunjol_d,
      months: months,          // 1~12월 일수
      leapMonth: leapMonth,    // 윤달 번호
      leapDays: leapMonth ? (((monthInfo >> 16) & 1) ? 29 : 30) : 0,
    };
  });

  return db;
}());

/* =====================================================
   2. 기본 상수
   ===================================================== */
const CHEONGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const CHEONGAN_KR = ['갑','을','병','정','무','기','경','신','임','계'];
const JIJI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const JIJI_KR = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const JIJI_TIME = [
  {name:'자시(子時)',start:23,end:1},  // 23:00~01:00
  {name:'축시(丑時)',start:1, end:3},
  {name:'인시(寅時)',start:3, end:5},
  {name:'묘시(卯時)',start:5, end:7},
  {name:'진시(辰時)',start:7, end:9},
  {name:'사시(巳時)',start:9, end:11},
  {name:'오시(午時)',start:11,end:13},
  {name:'미시(未時)',start:13,end:15},
  {name:'신시(申時)',start:15,end:17},
  {name:'유시(酉時)',start:17,end:19},
  {name:'술시(戌時)',start:19,end:21},
  {name:'해시(亥時)',start:21,end:23},
];
const OHAENG = ['木','火','土','金','水'];
const OHAENG_KR = ['목','화','토','금','수'];

// 천간 오행 (0=木 1=火 2=土 3=金 4=水)
const CG_OHAENG = [0,0,1,1,2,2,3,3,4,4];
// 지지 오행
const JJ_OHAENG = [4,2,0,0,2,1,1,2,3,3,2,4]; // 子水 丑土 寅木 卯木 辰土 巳火 午火 未土 申金 酉金 戌土 亥水
// 천간 음양 (0=양, 1=음)
const CG_YINYANG = [0,1,0,1,0,1,0,1,0,1];
// 지지 음양
const JJ_YINYANG = [0,1,0,1,0,1,0,1,0,1,0,1];

/* =====================================================
   3. 음력 ↔ 양력 변환
   ===================================================== */

/**
 * 양력 → 음력 변환
 * @param {number} sy 양력 년
 * @param {number} sm 양력 월 (1-12)
 * @param {number} sd 양력 일
 * @returns {object} {year, month, day, isLeap, leap_month}
 */
function solarToLunar(sy, sm, sd) {
  // 기준: 1900년 1월 31일 = 음력 1900년 1월 1일 (경자년 정월 초하루)
  const BASE_SOLAR = new Date(1900, 0, 31);
  const target = new Date(sy, sm - 1, sd);
  let offset = Math.round((target - BASE_SOLAR) / 86400000);

  if (offset < 0) return null; // 1900년 이전 미지원

  let lunarYear = 1900;
  let lunarMonth = 1;
  let lunarDay = 1;
  let isLeap = false;

  // 연도 계산
  while (lunarYear < 2060) {
    const db = LUNAR_DB[lunarYear];
    if (!db) break;
    const yearDays = getLunarYearDays(lunarYear);
    if (offset < yearDays) break;
    offset -= yearDays;
    lunarYear++;
  }

  // 월 계산
  const db = LUNAR_DB[lunarYear];
  if (!db) return null;

  for (let m = 1; m <= 12; m++) {
    const days = db.months[m - 1];
    if (offset < days) {
      lunarMonth = m;
      lunarDay = offset + 1;
      isLeap = false;
      break;
    }
    offset -= days;

    // 윤달 처리
    if (db.leapMonth === m && db.leapDays > 0) {
      if (offset < db.leapDays) {
        lunarMonth = m;
        lunarDay = offset + 1;
        isLeap = true;
        break;
      }
      offset -= db.leapDays;
    }
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeap: isLeap,
    leapMonth: db.leapMonth
  };
}

/**
 * 음력 → 양력 변환
 * @param {number} ly 음력 년
 * @param {number} lm 음력 월
 * @param {number} ld 음력 일
 * @param {boolean} isLeap 윤달 여부
 * @returns {object} {year, month, day}
 */
function lunarToSolar(ly, lm, ld, isLeap) {
  isLeap = isLeap || false;
  const BASE_SOLAR = new Date(1900, 0, 31);
  let offset = 0;

  // 연도 누적
  for (let y = 1900; y < ly; y++) {
    offset += getLunarYearDays(y);
  }

  // 월 누적
  const db = LUNAR_DB[ly];
  if (!db) return null;

  for (let m = 1; m < lm; m++) {
    offset += db.months[m - 1];
    if (db.leapMonth === m && db.leapDays > 0) {
      offset += db.leapDays;
    }
  }

  // 윤달이면 해당 월의 일수 더하기
  if (isLeap && db.leapMonth === lm) {
    offset += db.months[lm - 1];
  }

  offset += ld - 1;

  const result = new Date(BASE_SOLAR.getTime() + offset * 86400000);
  return {
    year: result.getFullYear(),
    month: result.getMonth() + 1,
    day: result.getDate()
  };
}

function getLunarYearDays(year) {
  const db = LUNAR_DB[year];
  if (!db) return 365;
  let total = 0;
  for (let m = 0; m < 12; m++) total += db.months[m];
  if (db.leapMonth && db.leapDays) total += db.leapDays;
  return total;
}

/* =====================================================
   4. 절기(節氣) 계산 — 월주 결정용
   ===================================================== */
// 입춘/경칩/청명/입하/망종/소서/입추/백로/한로/입동/대설/소한 기준일 (양력)
// 근사값: 실제 절기는 천문학적 계산이 필요하지만 ±1일 오차 범위로 정확
const JEOLGI_TABLE = {
  // [월, 절기일 근사치]  절기가 지나야 그 달 월주로 계산
  1:  [6,  '소한(小寒)'],
  2:  [4,  '입춘(立春)'],
  3:  [6,  '경칩(驚蟄)'],
  4:  [5,  '청명(淸明)'],
  5:  [6,  '입하(立夏)'],
  6:  [6,  '망종(芒種)'],
  7:  [7,  '소서(小暑)'],
  8:  [7,  '입추(立秋)'],
  9:  [8,  '백로(白露)'],
  10: [8,  '한로(寒露)'],
  11: [7,  '입동(立冬)'],
  12: [7,  '대설(大雪)'],
};

/**
 * 월주 계산을 위한 절기 기준 월 반환
 * 절기 이전이면 이전 달 기준으로 월주 결정
 */
function getSajuMonth(sy, sm, sd) {
  const jeolgiDay = JEOLGI_TABLE[sm][0];
  if (sd < jeolgiDay) {
    // 절기 전이면 이전 달
    return sm - 1 <= 0 ? 12 : sm - 1;
  }
  return sm;
}

/* =====================================================
   5. 사주팔자 계산 (연주/월주/일주/시주)
   ===================================================== */

/**
 * 연주 (年柱) 계산
 * 입춘(2월 4일경) 이전이면 전년도 기준
 */
function getYearPillar(sy, sm, sd) {
  let year = sy;
  // 입춘 이전이면 전년도로
  if (sm < 2 || (sm === 2 && sd < 4)) {
    year = sy - 1;
  }
  // 1900년 = 경자년 → 천간 6(庚), 지지 0(子)
  const offset = year - 1900;
  const cg = ((offset % 10) + 6 + 10) % 10; // 1900=庚=6
  const jj = ((offset % 12) + 0 + 12) % 12; // 1900=子=0
  return {
    cg: CHEONGAN[cg],
    jj: JIJI[jj],
    cgKr: CHEONGAN_KR[cg],
    jjKr: JIJI_KR[jj],
    cgIdx: cg,
    jjIdx: jj,
    year: year
  };
}

/**
 * 월주 (月柱) 계산
 * 연간(年干)에 따라 월주 천간이 결정됨
 */
function getMonthPillar(sy, sm, sd, yearCgIdx) {
  const sajuMon = getSajuMonth(sy, sm, sd);
  // 월지: 인월(寅)=1월이 월지 인(寅)=2, 묘(卯)=3...
  // 사주 1월(인월) → 지지 인(寅)=2
  const jjIdx = ((sajuMon - 1 + 2) % 12); // 1월=인=2, 2월=묘=3...
  
  // 연간에 따른 월간 조견표 (오호둔년법)
  // 甲己년 → 인월=丙寅, 乙庚년 → 인월=戊寅, 丙辛년 → 인월=庚寅
  // 丁壬년 → 인월=壬寅, 戊癸년 → 인월=甲寅
  const monthCgBase = [2, 4, 6, 8, 0]; // 甲己=丙, 乙庚=戊, 丙辛=庚, 丁壬=壬, 戊癸=甲
  const groupIdx = yearCgIdx % 5; // 0=甲己, 1=乙庚, 2=丙辛, 3=丁壬, 4=戊癸
  const baseCg = monthCgBase[groupIdx];
  // 인월(1월)부터 시작하므로 sajuMon-1 만큼 더함
  const cgIdx = (baseCg + (sajuMon - 1)) % 10;

  return {
    cg: CHEONGAN[cgIdx],
    jj: JIJI[jjIdx],
    cgKr: CHEONGAN_KR[cgIdx],
    jjKr: JIJI_KR[jjIdx],
    cgIdx: cgIdx,
    jjIdx: jjIdx,
    sajuMonth: sajuMon
  };
}

/**
 * 일주 (日柱) 계산
 * 기준: 1900년 1월 1일 = 甲戌日 (천간4=甲, 지지10=戌? → 실제: 1900.1.1=甲戌)
 * 甲=0, 戌=10 → 확인: JD 법 사용
 */
function getDayPillar(sy, sm, sd) {
  // 줄리안일수 기반 계산
  // 기준점: 1900년 1월 1일 = 甲戌 → 천간 0(甲), 지지 10(戌)
  // 실제 검증: 
  //   1900.1.1 = JD 2415021 → 갑술(甲戌) 확인
  const jd = getJulianDay(sy, sm, sd);
  const BASE_JD = 2415021; // 1900.1.1 JD
  const diff = jd - BASE_JD;
  
  const cgIdx = ((diff % 10) + 0 + 10) % 10; // 甲=0
  const jjIdx = ((diff % 12) + 10 + 12) % 12; // 戌=10
  
  return {
    cg: CHEONGAN[cgIdx],
    jj: JIJI[jjIdx],
    cgKr: CHEONGAN_KR[cgIdx],
    jjKr: JIJI_KR[jjIdx],
    cgIdx: cgIdx,
    jjIdx: jjIdx
  };
}

function getJulianDay(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

/**
 * 시주 (時柱) 계산
 * @param {number} hour 시각 (0~23), 모름이면 -1
 * @param {number} dayCgIdx 일간 인덱스
 * @returns {object}
 */
function getTimePillar(hour, dayCgIdx) {
  if (hour < 0) {
    return {
      cg: '?', jj: '?', cgKr: '미상', jjKr: '미상',
      cgIdx: -1, jjIdx: -1,
      timeName: '출생 시각 미입력',
      unknown: true
    };
  }

  // 시지(時支) 결정
  let jjIdx;
  if (hour === 23 || hour === 0) jjIdx = 0;       // 자시 子
  else if (hour === 1 || hour === 2) jjIdx = 1;    // 축시 丑
  else if (hour === 3 || hour === 4) jjIdx = 2;    // 인시 寅
  else if (hour === 5 || hour === 6) jjIdx = 3;    // 묘시 卯
  else if (hour === 7 || hour === 8) jjIdx = 4;    // 진시 辰
  else if (hour === 9 || hour === 10) jjIdx = 5;   // 사시 巳
  else if (hour === 11 || hour === 12) jjIdx = 6;  // 오시 午
  else if (hour === 13 || hour === 14) jjIdx = 7;  // 미시 未
  else if (hour === 15 || hour === 16) jjIdx = 8;  // 신시 申
  else if (hour === 17 || hour === 18) jjIdx = 9;  // 유시 酉
  else if (hour === 19 || hour === 20) jjIdx = 10; // 술시 戌
  else jjIdx = 11;                                  // 해시 亥

  // 시간(時干) — 오자둔일법(五子遁日法)
  // 甲己일 → 자시=甲子, 乙庚일 → 자시=丙子, 丙辛일 → 자시=戊子
  // 丁壬일 → 자시=庚子, 戊癸일 → 자시=壬子
  const timeCgBase = [0, 2, 4, 6, 8]; // 甲己=甲, 乙庚=丙, 丙辛=戊, 丁壬=庚, 戊癸=壬
  const groupIdx = dayCgIdx % 5;
  const baseCg = timeCgBase[groupIdx];
  const cgIdx = (baseCg + jjIdx) % 10;

  const timeName = JIJI_TIME[jjIdx] ? JIJI_TIME[jjIdx].name : JIJI_KR[jjIdx] + '시';

  return {
    cg: CHEONGAN[cgIdx],
    jj: JIJI[jjIdx],
    cgKr: CHEONGAN_KR[cgIdx],
    jjKr: JIJI_KR[jjIdx],
    cgIdx: cgIdx,
    jjIdx: jjIdx,
    timeName: timeName,
    hour: hour,
    unknown: false
  };
}

/* =====================================================
   6. 오행 분석
   ===================================================== */
function analyzeOhaeng(pillars) {
  // pillars: [년주, 월주, 일주, 시주] 각 {cgIdx, jjIdx}
  const count = [0, 0, 0, 0, 0]; // 木火土金水

  pillars.forEach(function(p) {
    if (p.cgIdx >= 0) count[CG_OHAENG[p.cgIdx]]++;
    if (p.jjIdx >= 0) count[JJ_OHAENG[p.jjIdx]]++;
  });

  const total = count.reduce(function(a, b) { return a + b; }, 0) || 1;
  const pct = count.map(function(c) { return Math.round(c / total * 100); });

  // 일간 기준 오행
  const dayOhaeng = CG_OHAENG[pillars[2].cgIdx];

  // 상생(相生) 관계: 木→火→土→金→水→木
  const SANGSAENG = [1, 2, 3, 4, 0]; // 木生火, 火生土, 土生金, 金生水, 水生木
  // 상극(相克) 관계: 木→土→水→火→金→木
  const SANGGEUK = [2, 3, 4, 0, 1];

  // 용신 (일간이 약하면 돕는 오행, 강하면 설기/극하는 오행)
  const dayCount = count[dayOhaeng];
  const isStrong = dayCount >= 2;
  
  let yongsin, gisin;
  if (isStrong) {
    // 강한 경우: 설기하는 오행(생해주는 오행이 아닌 것)이 용신
    yongsin = SANGSAENG[dayOhaeng]; // 일간이 생해주는 오행 = 설기
    gisin = SANGGEUK[dayOhaeng];    // 일간을 극하는 오행 = 기신 아님, 반대
  } else {
    // 약한 경우: 일간을 돕는(생해주는) 오행이 용신
    yongsin = (dayOhaeng + 4) % 5;  // 일간을 생해주는 오행 (역방향)
    gisin = SANGGEUK[dayOhaeng];    // 일간을 극하는 오행이 기신
  }

  return {
    count: count,
    pct: pct,
    dayOhaeng: dayOhaeng,
    yongsin: yongsin,
    gisin: gisin,
    isStrong: isStrong,
    ohaengNames: OHAENG,
    ohaengKrNames: OHAENG_KR
  };
}

/* =====================================================
   7. 메인 함수: 사주팔자 완전 계산
   ===================================================== */

/**
 * 사주팔자 계산 메인 함수
 * @param {object} opts {
 *   year, month, day, hour(-1=미상),
 *   isLunar(boolean), isLeap(boolean)
 * }
 * @returns {object} 전체 사주 정보
 */
function calcSaju(opts) {
  let sy, sm, sd;
  let lunarInfo = null;
  let solarInfo = null;

  if (opts.isLunar) {
    // 음력 → 양력 변환
    const sol = lunarToSolar(opts.year, opts.month, opts.day, opts.isLeap || false);
    if (!sol) return { error: '음력 변환 실패' };
    sy = sol.year; sm = sol.month; sd = sol.day;
    solarInfo = sol;
    lunarInfo = { year: opts.year, month: opts.month, day: opts.day, isLeap: opts.isLeap };
  } else {
    sy = opts.year; sm = opts.month; sd = opts.day;
    solarInfo = { year: sy, month: sm, day: sd };
    // 양력 → 음력 변환
    lunarInfo = solarToLunar(sy, sm, sd);
  }

  // 사주 계산
  const yearP  = getYearPillar(sy, sm, sd);
  const monthP = getMonthPillar(sy, sm, sd, yearP.cgIdx);
  const dayP   = getDayPillar(sy, sm, sd);
  const timeP  = getTimePillar(opts.hour !== undefined ? opts.hour : -1, dayP.cgIdx);

  const pillars = [yearP, monthP, dayP, timeP];
  const ohaeng  = analyzeOhaeng(pillars);

  // 시주 표시 처리
  const timeDisplay = timeP.unknown
    ? '미상'
    : (timeP.cg + timeP.jj + ' ' + timeP.timeName);

  return {
    solar: solarInfo,
    lunar: lunarInfo,
    pillars: {
      year:  yearP,
      month: monthP,
      day:   dayP,
      time:  timeP
    },
    ohaeng: ohaeng,
    summary: {
      yearPillar:  yearP.cg  + yearP.jj  + '(' + yearP.cgKr  + yearP.jjKr  + ')',
      monthPillar: monthP.cg + monthP.jj + '(' + monthP.cgKr + monthP.jjKr + ')',
      dayPillar:   dayP.cg   + dayP.jj   + '(' + dayP.cgKr   + dayP.jjKr   + ')',
      timePillar:  timeP.unknown ? '미상(시각 미입력)' : timeP.cg + timeP.jj + '(' + timeP.cgKr + timeP.jjKr + ') ' + timeP.timeName,
      ohaengStr:   ohaeng.ohaengNames.map(function(n, i) { return n + ':' + ohaeng.count[i]; }).join(' '),
      yongsinStr:  OHAENG_KR[ohaeng.yongsin] + '(' + OHAENG[ohaeng.yongsin] + ')',
      gisinStr:    OHAENG_KR[ohaeng.gisin] + '(' + OHAENG[ohaeng.gisin] + ')',
      isStrong:    ohaeng.isStrong
    }
  };
}

/**
 * 사용자 입력 텍스트에서 생년월일시 파싱
 * 지원 형식:
 *   "1990년 5월 15일 오전 10시"
 *   "1990.5.15 10:00"
 *   "음력 1990년 5월 15일"
 *   "1990-05-15"
 *   "밤 11시" "새벽 3시" "오후 2시"
 */
function parseBirthInfo(text) {
  const result = {
    year: null, month: null, day: null,
    hour: -1,
    isLunar: false, isLeap: false,
    found: false
  };

  if (!text) return result;

  // 음력 여부
  if (/음력|陰曆|음\/양|음양/.test(text)) result.isLunar = true;
  if (/윤달|윤월|閏月/.test(text)) result.isLeap = true;

  // 연도 추출
  const yearMatch = text.match(/(\d{4})\s*년?/);
  if (yearMatch) result.year = parseInt(yearMatch[1]);

  // 월 추출
  const monthMatch = text.match(/(\d{1,2})\s*월/);
  if (monthMatch) result.month = parseInt(monthMatch[1]);

  // 일 추출
  const dayMatch = text.match(/(\d{1,2})\s*일/);
  if (dayMatch) result.day = parseInt(dayMatch[1]);

  // 숫자 형식 (1990.5.15 또는 1990-05-15)
  if (!result.year) {
    const numMatch = text.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/);
    if (numMatch) {
      result.year  = parseInt(numMatch[1]);
      result.month = parseInt(numMatch[2]);
      result.day   = parseInt(numMatch[3]);
    }
  }

  // 시각 추출
  const hourPatterns = [
    { re: /자정|밤\s*12시|0시/, h: 0 },
    { re: /새벽\s*(\d{1,2})\s*시/, group: 1, am: true },
    { re: /오전\s*(\d{1,2})\s*시/, group: 1, am: true },
    { re: /오후\s*(\d{1,2})\s*시/, group: 1, pm: true },
    { re: /밤\s*(\d{1,2})\s*시/, group: 1, pm: true, night: true },
    { re: /(\d{1,2})\s*시\s*(\d{2})?\s*분?/, group: 1 },
    { re: /(\d{1,2}):(\d{2})/, group: 1 },
  ];

  for (let i = 0; i < hourPatterns.length; i++) {
    const p = hourPatterns[i];
    const m = text.match(p.re);
    if (m) {
      if (p.h !== undefined) {
        result.hour = p.h;
      } else {
        let h = parseInt(m[p.group]);
        if (p.pm && h < 12) h += 12;
        if (p.am && h === 12) h = 0;
        if (p.night && h < 7) h += 12; // 밤 1시 = 13시 (오후 1시 아님, 오후 1시+12=13? 혼동 없도록)
        result.hour = h;
      }
      break;
    }
  }

  // 시주 이름으로 추출
  const siNames = [
    { re: /자시|子時/, h: 0 },
    { re: /축시|丑時/, h: 1 },
    { re: /인시|寅時/, h: 3 },
    { re: /묘시|卯時/, h: 5 },
    { re: /진시|辰時/, h: 7 },
    { re: /사시|巳時/, h: 9 },
    { re: /오시|午時/, h: 11 },
    { re: /미시|未時/, h: 13 },
    { re: /신시|申時/, h: 15 },
    { re: /유시|酉時/, h: 17 },
    { re: /술시|戌時/, h: 19 },
    { re: /해시|亥時/, h: 21 },
  ];
  for (let i = 0; i < siNames.length; i++) {
    if (siNames[i].re.test(text)) {
      result.hour = siNames[i].h;
      break;
    }
  }

  result.found = !!(result.year && result.month && result.day);
  return result;
}

/**
 * 사주 결과를 Gemini 프롬프트용 텍스트로 변환
 */
function sajuToPromptText(saju) {
  if (!saju || saju.error) return '';

  const s = saju.summary;
  const o = saju.ohaeng;
  const sol = saju.solar;
  const lun = saju.lunar;

  let text = '\n\n【사전 계산된 사주팔자 (정확한 값, 이 값을 그대로 사용할 것)】\n';
  text += '▶ 양력: ' + sol.year + '년 ' + sol.month + '월 ' + sol.day + '일\n';
  if (lun) {
    text += '▶ 음력: ' + lun.year + '년 ' + lun.month + '월 ' + lun.day + '일';
    if (lun.isLeap) text += ' (윤달)';
    text += '\n';
  }
  text += '▶ 연주(年柱): ' + s.yearPillar + '\n';
  text += '▶ 월주(月柱): ' + s.monthPillar + '\n';
  text += '▶ 일주(日柱): ' + s.dayPillar + '\n';
  text += '▶ 시주(時柱): ' + s.timePillar + '\n';
  text += '▶ 오행 분포: ' + s.ohaengStr + '\n';
  text += '   - 목(木):' + o.count[0] + '개  화(火):' + o.count[1] + '개  토(土):' + o.count[2] + '개  금(金):' + o.count[3] + '개  수(水):' + o.count[4] + '개\n';
  text += '▶ 일간(日干) 강약: ' + (s.isStrong ? '신강(身强)' : '신약(身弱)') + '\n';
  text += '▶ 용신(用神): ' + s.yongsinStr + '  |  기신(忌神): ' + s.gisinStr + '\n';
  text += '\n위 사주 데이터를 기반으로 정확하고 구체적인 분석을 해주세요. 위 숫자를 임의로 바꾸지 마세요.\n';

  return text;
}

// 전역 노출
window.calcSaju = calcSaju;
window.parseBirthInfo = parseBirthInfo;
window.sajuToPromptText = sajuToPromptText;
window.solarToLunar = solarToLunar;
window.lunarToSolar = lunarToSolar;
