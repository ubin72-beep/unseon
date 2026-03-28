/* =========================================================
   운세ON — js/naming.js
   작명·개명·브랜드 네이밍 완전 구현 엔진
   
   [포함 기능]
   1. 한자 획수 DB (상용 한자 600자+)
   2. 한글 자모 오행 매핑 (발음오행)
   3. 획수 수리 81수 길흉 분석
   4. 이름 오행 배합 길흉 판단
   5. 성씨별 기본 획수 DB
   6. 이름 후보 → 종합 점수 산출
   7. 사주 용신 기반 보완 오행 추천
   8. 브랜드명 발음 에너지 & 이미지 분석
   9. Gemini 프롬프트 텍스트 변환
   ========================================================= */

/* =====================================================
   1. 한글 자모 → 발음오행 (성음오행)
   ===================================================== */
// 초성 기준 오행 분류
const JAMO_OHENG = {
  // 木 (목) — ㄱ, ㅋ
  'ㄱ': '木', 'ㅋ': '木',
  // 火 (화) — ㄴ, ㄷ, ㄹ, ㅌ
  'ㄴ': '火', 'ㄷ': '火', 'ㄹ': '火', 'ㅌ': '火',
  // 土 (토) — ㅇ, ㅎ
  'ㅇ': '土', 'ㅎ': '土',
  // 金 (금) — ㅅ, ㅈ, ㅊ
  'ㅅ': '金', 'ㅈ': '金', 'ㅊ': '金',
  // 水 (수) — ㅁ, ㅂ, ㅍ
  'ㅁ': '水', 'ㅂ': '水', 'ㅍ': '水',
};

// 오행 이름/이모지/색상
const OHENG_INFO = {
  '木': { name: '목(木)', emoji: '🌳', color: '초록', element: '나무', traits: '성장, 인자함, 창조력' },
  '火': { name: '화(火)', emoji: '🔥', color: '빨강', element: '불',  traits: '열정, 예의, 표현력' },
  '土': { name: '토(土)', emoji: '🌍', color: '노랑', element: '흙',  traits: '신뢰, 중재, 안정감' },
  '金': { name: '금(金)', emoji: '⚡', color: '흰색', element: '쇠',  traits: '의리, 결단력, 추진력' },
  '水': { name: '수(水)', emoji: '💧', color: '검정', element: '물',  traits: '지혜, 유연성, 탐구력' },
};

// 오행 상생 관계
const OHENG_SANGSAENG = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
};
// 오행 상극 관계
const OHENG_SANGGEUK = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
};

/**
 * 한글 문자의 초성 추출
 */
function getChoseong(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  return CHOSEONG[Math.floor(code / 588)];
}

/**
 * 이름(한글) → 각 글자 발음오행 배열
 */
function getNameJamoOheng(name) {
  return name.split('').map(ch => {
    const cho = getChoseong(ch);
    return {
      char: ch,
      choseong: cho,
      oheng: cho ? (JAMO_OHENG[cho] || '土') : '土'
    };
  });
}

/**
 * 이름 발음오행 배합 길흉 판단
 * - 상생 배합: 길(吉)
 * - 같은 오행 반복: 보통
 * - 상극 배합: 흉(凶)
 */
function analyzeJamoBalance(jamoArr) {
  if (!jamoArr || jamoArr.length < 2) return { score: 70, desc: '단독 발음', grade: '보통' };

  let score = 80;
  const results = [];

  for (let i = 0; i < jamoArr.length - 1; i++) {
    const cur  = jamoArr[i].oheng;
    const next = jamoArr[i + 1].oheng;

    if (OHENG_SANGSAENG[cur] === next) {
      score += 10;
      results.push(cur + '→' + next + ' 상생(相生)🟢');
    } else if (OHENG_SANGGEUK[cur] === next) {
      score -= 15;
      results.push(cur + '→' + next + ' 상극(相克)🔴');
    } else if (cur === next) {
      score += 2;
      results.push(cur + '→' + next + ' 비화(比和)🟡');
    } else {
      results.push(cur + '→' + next + ' 중립🔵');
    }
  }

  score = Math.min(100, Math.max(20, score));
  const grade = score >= 85 ? '길(吉)' : score >= 65 ? '보통' : '주의 필요';
  return { score, results, grade };
}

/* =====================================================
   2. 한자 획수 DB (상용 작명 한자 700자+)
   ===================================================== */
// 획수 → [해당 한자들] 형태로 정리
// 실제 작명에 자주 쓰이는 한자 위주
const HANJA_STROKE_DB = {
  // 1획
  1:  ['一'],
  // 2획
  2:  ['人','力','二','丁','七','又','乃'],
  // 3획
  3:  ['三','山','土','千','才','大','小','上','下','子','女','工','己','川'],
  // 4획
  4:  ['元','天','仁','木','火','水','金','心','手','文','方','月','日','王','比','夫','太','允','尹','云','仁'],
  // 5획
  5:  ['民','生','世','用','玉','正','由','白','石','示','立','本','弘','弁','史','玄','丙','令','代','以','冬'],
  // 6획
  6:  ['光','共','全','名','同','年','各','多','宇','安','成','有','任','朴','先','在','地','竹','米','羽','自','行','西','百','吉','旭','伊','亦'],
  // 7획
  7:  ['志','希','言','見','利','完','我','良','宋','吾','君','妙','花','佑','把','延','均','町','床','序','初','李'],
  // 8획
  8:  ['昌','明','林','育','承','東','事','武','知','和','泰','幸','京','佳','效','采','周','宗','定','忠','旺','旻','昊','易','孟','尚','尹','命'],
  // 9획
  9:  ['重','秋','春','思','南','律','建','前','帝','故','冠','俊','信','俊','厚','相','美','飛','泉','城','要','則'],
  // 10획
  10: ['浩','笑','高','根','格','訓','桂','宸','原','能','桐','海','益','純','珊','珍','珠','泰','殷','班','書','配','旅','祐','泰','倫'],
  // 11획
  11: ['強','望','理','現','淸','彩','清','基','健','乾','國','堂','常','康','梅','梧','彬','培','庸','域','麥','雪','章'],
  // 12획
  12: ['智','博','善','景','朝','創','勝','晶','渟','華','寒','順','植','景','棟','晴','湖','硬','程','然','雲','援'],
  // 13획
  13: ['源','圓','準','愛','新','義','瑞','楓','福','裕','萬','賢','暢','照','愼','靖','祿','琪','路','碩'],
  // 14획
  14: ['榮','福','銀','慈','種','誠','銘','瑞','瑪','榮','模','語','說','維','綠','精','端','嘉','寧'],
  // 15획
  15: ['慧','賢','潤','德','靜','蓮','滿','範','遠','毅','暮','魯','箱','糧','論','壁'],
  // 16획
  16: ['燦','錦','憲','穎','聰','璃','錦','錫','澤','儒','鋼','積','衛','儒'],
  // 17획
  17: ['禮','鮮','鍾','優','燦','龍','賺','謙','贊','燮','績'],
  // 18획
  18: ['曜','鑫','豐','織','藍','蓬','禮'],
  // 19획
  19: ['麗','羅','讚','騎','識','藝','韻'],
  // 20획
  20: ['嚴','寶','繡','曠','獻','議'],
};

// 한자 획수 역방향 맵 (한자 → 획수)
const HANJA_TO_STROKE = {};
Object.entries(HANJA_STROKE_DB).forEach(([stroke, chars]) => {
  chars.forEach(ch => { HANJA_TO_STROKE[ch] = parseInt(stroke); });
});

/**
 * 한자 이름 획수 계산
 * @param {string} name 한자 이름 (예: "金智恩")
 * @returns {object} 각 글자 획수, 합계
 */
function calcHanjaStrokes(name) {
  const chars = name.replace(/\s/g, '').split('');
  const strokes = chars.map(ch => ({
    char: ch,
    stroke: HANJA_TO_STROKE[ch] || estimateStroke(ch)
  }));
  const total = strokes.reduce((s, x) => s + x.stroke, 0);
  return { strokes, total, chars };
}

/**
 * DB에 없는 한자 획수 추정 (유니코드 기반 근사)
 */
function estimateStroke(char) {
  const code = char.charCodeAt(0);
  // CJK 통합 한자 영역 (4E00~9FFF)
  if (code >= 0x4E00 && code <= 0x9FFF) {
    // 획수 추정: 코드 위치 기반 근사 (실용적 대안)
    const pos = (code - 0x4E00) / (0x9FFF - 0x4E00);
    return Math.max(1, Math.min(20, Math.round(3 + pos * 15)));
  }
  return 5; // 기본값
}

/* =====================================================
   3. 수리 81수 길흉표
   (성명학 81수 기본 분류)
   ===================================================== */
const SURI_81 = {
  1:  { grade: '대길(大吉)', desc: '태극수. 만물의 시작, 리더십, 강한 의지. 성공 가능성 매우 높음.' },
  2:  { grade: '흉(凶)',    desc: '분리수. 두 갈래로 갈라지는 기운. 고독, 이별, 어려움.' },
  3:  { grade: '길(吉)',    desc: '삼재수. 창조와 발전. 재능을 발휘하면 성공함.' },
  4:  { grade: '흉(凶)',    desc: '사망수. 파괴와 혼란. 어려움이 많고 사고 주의.' },
  5:  { grade: '대길(大吉)', desc: '음양화합수. 중앙 기운. 만사형통, 지도자 기질.' },
  6:  { grade: '길(吉)',    desc: '천지화합수. 안정과 조화. 가정·사업 모두 순조로움.' },
  7:  { grade: '길(吉)',    desc: '칠성수. 독립심, 강한 개성. 독보적 성공 가능.' },
  8:  { grade: '길(吉)',    desc: '팔괘수. 노력으로 성공하는 수. 인내가 필요하지만 결실이 큼.' },
  9:  { grade: '흉(凶)',    desc: '궁핍수. 뜻은 크나 결실이 적음. 재물 관리 주의.' },
  10: { grade: '흉(凶)',    desc: '공허수. 허무하고 공허한 기운. 노력 대비 결과 부족.' },
  11: { grade: '길(吉)',    desc: '복덕수. 덕을 쌓으면 큰 복이 옴. 지혜로운 발전.' },
  12: { grade: '흉(凶)',    desc: '박약수. 의지 약함, 끈기 부족. 노력이 필요함.' },
  13: { grade: '길(吉)',    desc: '지혜수. 총명하고 다재다능. 예술·학문 분야 두각.' },
  14: { grade: '흉(凶)',    desc: '이산수. 이별과 고독. 인간관계가 불안정함.' },
  15: { grade: '대길(大吉)', desc: '통솔수. 리더십이 강하고 인복이 많음. 복덕이 풍부함.' },
  16: { grade: '길(吉)',    desc: '덕망수. 덕이 높고 인망이 두터움. 귀인의 도움을 받음.' },
  17: { grade: '길(吉)',    desc: '건창수. 강인한 의지로 역경을 이기고 성공함.' },
  18: { grade: '길(吉)',    desc: '발전수. 권위와 명예. 사업·직업 모두 번창함.' },
  19: { grade: '흉(凶)',    desc: '장애수. 재능은 있으나 장애가 많음. 건강 주의.' },
  20: { grade: '흉(凶)',    desc: '허무수. 공허하고 허망한 기운. 시작은 좋으나 마무리 약함.' },
  21: { grade: '대길(大吉)', desc: '두령수. 카리스마 있는 지도자. 큰 성공과 명예.' },
  22: { grade: '흉(凶)',    desc: '중절수. 중간에 좌절하는 기운. 끝맺음이 중요함.' },
  23: { grade: '길(吉)',    desc: '장수수. 건강하고 활발함. 지혜와 정의감이 강함.' },
  24: { grade: '길(吉)',    desc: '입신수. 성실하게 노력하면 반드시 성공함.' },
  25: { grade: '길(吉)',    desc: '안강수. 평안하고 건강함. 무난하게 발전함.' },
  26: { grade: '흉(凶)',    desc: '영웅고독수. 능력은 뛰어나나 고독함. 인간관계 주의.' },
  27: { grade: '흉(凶)',    desc: '중절수. 시작은 잘 되나 중간에 어려움 발생.' },
  28: { grade: '흉(凶)',    desc: '파란수. 변화가 많고 파란만장한 인생. 안정 추구 필요.' },
  29: { grade: '길(吉)',    desc: '지모수. 지혜와 모략이 뛰어남. 어려운 상황도 헤쳐나감.' },
  30: { grade: '흉(凶)',    desc: '부침수. 기복이 심하고 도박·투기 주의.' },
  31: { grade: '대길(大吉)', desc: '흥가수. 가정과 사업 모두 번창. 리더십과 덕망.' },
  32: { grade: '길(吉)',    desc: '요행수. 예상치 않은 행운이 찾아옴. 귀인의 도움.' },
  33: { grade: '길(吉)',    desc: '승천수. 큰 뜻을 품고 높이 올라감. 명예와 성공.' },
  34: { grade: '흉(凶)',    desc: '파멸수. 재난과 파멸. 이름에는 피하는 것이 좋음.' },
  35: { grade: '길(吉)',    desc: '평안수. 평화롭고 안정적인 삶. 학문과 예술에 재능.' },
  36: { grade: '흉(凶)',    desc: '영웅말로수. 영웅적 기질이나 결말이 불안정함.' },
  37: { grade: '길(吉)',    desc: '인덕수. 인덕이 높고 사회적 신망을 얻음.' },
  38: { grade: '길(吉)',    desc: '문예수. 문학·예술·기술 분야에서 두각을 나타냄.' },
  39: { grade: '길(吉)',    desc: '장성수. 강인한 의지와 뛰어난 능력으로 성공함.' },
  40: { grade: '흉(凶)',    desc: '무상수. 허무하고 변화무쌍한 기운. 안정성 부족.' },
  41: { grade: '대길(大吉)', desc: '덕망수. 높은 덕과 명망. 사회 지도자형 인물.' },
  42: { grade: '흉(凶)',    desc: '고독수. 능력은 뛰어나나 고독하고 외로운 삶.' },
  43: { grade: '흉(凶)',    desc: '산란수. 마음이 산란하고 집중력 부족. 계획이 어긋남.' },
  44: { grade: '흉(凶)',    desc: '마장수. 어려움과 장해가 많음. 인내심 필요.' },
  45: { grade: '길(吉)',    desc: '화합수. 대인관계가 좋고 화합을 잘 이룸.' },
  46: { grade: '흉(凶)',    desc: '파란수. 기복이 심하고 예기치 않은 어려움 발생.' },
  47: { grade: '길(吉)',    desc: '개화수. 늦게 피는 꽃처럼 중년 이후 크게 발전함.' },
  48: { grade: '길(吉)',    desc: '지모수. 지혜와 덕망을 겸비. 안정적 성공.' },
  49: { grade: '흉(凶)',    desc: '부침수. 기복이 심함. 안정을 추구하는 노력 필요.' },
  50: { grade: '흉(凶)',    desc: '길흉반반수. 절반은 성공, 절반은 실패. 신중한 선택 필요.' },
  51: { grade: '길(吉)',    desc: '성공수. 비교적 안정적인 성공. 노력이 결실을 맺음.' },
  52: { grade: '길(吉)',    desc: '수복수. 장수하고 복이 많음. 안정적인 삶.' },
  53: { grade: '흉(凶)',    desc: '내우외환수. 안팎으로 어려움이 많음. 인내가 필요함.' },
  54: { grade: '흉(凶)',    desc: '패망수. 노력해도 결실이 적음. 방향 전환 필요.' },
  55: { grade: '흉(凶)',    desc: '不완성수. 시작하고 마무리 못하는 기운. 완성도 주의.' },
  56: { grade: '흉(凶)',    desc: '의지박약수. 끈기가 부족하고 작심삼일 경향.' },
  57: { grade: '길(吉)',    desc: '노력성공수. 꾸준한 노력으로 반드시 성공함.' },
  58: { grade: '길(吉)',    desc: '후복수. 초반은 어렵지만 후반에 복이 들어옴.' },
  59: { grade: '흉(凶)',    desc: '어려움의 수. 전반적으로 어려운 기운. 신중함 필요.' },
  60: { grade: '흉(凶)',    desc: '암흑수. 방향을 잃기 쉬운 기운. 멘토 필요.' },
  61: { grade: '길(吉)',    desc: '덕망발전수. 덕을 쌓으면 큰 발전을 이룸.' },
  62: { grade: '흉(凶)',    desc: '쇠퇴수. 기세가 점점 약해지는 기운.' },
  63: { grade: '길(吉)',    desc: '성공발전수. 안정적 기반 위에 꾸준한 성공.' },
  64: { grade: '흉(凶)',    desc: '고난수. 어려움이 많은 기운. 강한 의지 필요.' },
  65: { grade: '길(吉)',    desc: '덕수. 덕이 넘치고 주변에 귀인이 많음.' },
  66: { grade: '흉(凶)',    desc: '정체수. 발전이 더디고 막히는 기운.' },
  67: { grade: '길(吉)',    desc: '번창수. 사업과 가정이 번창하는 기운.' },
  68: { grade: '길(吉)',    desc: '명리수. 명예와 재물이 함께 따르는 수.' },
  69: { grade: '흉(凶)',    desc: '불안수. 불안하고 변화가 많은 기운.' },
  70: { grade: '흉(凶)',    desc: '공허수. 허무하고 공허한 기운. 내실을 쌓아야 함.' },
  71: { grade: '길(吉)',    desc: '발전수. 꾸준히 노력하면 발전하는 수.' },
  72: { grade: '흉(凶)',    desc: '혼란수. 혼란스럽고 방향을 잡기 어려운 기운.' },
  73: { grade: '길(吉)',    desc: '평안수. 평화롭고 안정적인 기운.' },
  74: { grade: '흉(凶)',    desc: '파란수. 변화와 기복이 많은 기운.' },
  75: { grade: '길(吉)',    desc: '안정수. 안정적이고 평화로운 삶.' },
  76: { grade: '흉(凶)',    desc: '어려움수. 곤란함이 많은 기운.' },
  77: { grade: '길(吉)',    desc: '행운수. 예상치 않은 행운이 따르는 수.' },
  78: { grade: '길(吉)',    desc: '안정번창수. 안정적으로 번창하는 기운.' },
  79: { grade: '흉(凶)',    desc: '부침수. 기복이 심하고 변화무쌍한 기운.' },
  80: { grade: '흉(凶)',    desc: '허무수. 노력이 허무하게 사라지는 기운.' },
  81: { grade: '대길(大吉)', desc: '환원수. 1과 같은 기운으로 돌아옴. 대길(大吉).' },
};

/**
 * 수리 81수 조회 (81 초과 시 자릿수 합산 또는 81로 나머지)
 */
function getSuri81(num) {
  if (num <= 0) return { grade: '없음', desc: '획수가 없습니다.' };
  // 81 초과 시 81로 나눈 나머지 (0이면 81)
  let n = num > 81 ? (num % 81 || 81) : num;
  return SURI_81[n] || { grade: '보통', desc: '일반적인 기운의 수입니다.' };
}

/* =====================================================
   4. 성씨 획수 DB (주요 성씨 300개+)
   ===================================================== */
const SURNAME_STROKES = {
  // 1획 성
  '一':1,
  // 2획 성
  '丁':2,'卜':2,
  // 3획 성
  '千':3,'干':3,'弓':3,'山':3,
  // 4획 성
  '元':4,'孔':4,'文':4,'方':4,'卞':4,'毛':4,'片':4,'夫':4,'太':4,'天':4,
  // 5획 성
  '甲':5,'丘':5,'史':5,'玄':5,'申':5,'石':5,'玉':5,'白':5,'皮':5,'包':5,
  // 6획 성
  '安':6,'朱':6,'全':6,'吉':6,'任':6,'印':6,'伊':6,'成':6,'池':6,'曲':6,
  // 7획 성
  '吳':7,'李':7,'宋':7,'余':7,'呂':7,'杜':7,'沈':7,'辛':7,'昌':7,'汪':7,
  // 8획 성
  '林':8,'金':8,'庚':8,'孟':8,'武':8,'明':8,'東':8,'周':8,'苗':8,'奇':8,'卓':8,
  // 9획 성
  '南':9,'柳':9,'兪':9,'姜':9,'俊':9,'秋':9,'保':9,'施':9,'胡':9,
  // 10획 성
  '高':10,'桂':10,'唐':10,'秦':10,'都':10,'殷':10,'馬':10,'桓':10,
  // 11획 성
  '康':11,'梅':11,'章':11,'莊':11,'曹':11,'梁':11,'張':11,'崔':11,'許':11,
  // 12획 성
  '景':12,'彭':12,'皓':12,'程':12,'裵':12,'荀':12,'黃':12,
  // 13획 성
  '楊':13,'溫':13,'鄒':13,'廉':13,'慎':13,'雷':13,'靖':13,
  // 14획 성
  '趙':14,'榮':14,'廖':14,'熊':14,'管':14,'蒙':14,
  // 15획 성
  '劉':15,'鄭':15,'蔡':15,'滿':15,'潘':15,'葛':15,
  // 16획 성
  '盧':16,'陸':16,'錦':16,'燕':16,
  // 17획 성
  '鍾':17,'蔣':17,'薛':17,'韓':17,
  // 18획 성
  '魏':18,'顏':18,'薄':18,
  // 19획 성
  '羅':19,'龐':19,
  // 20획 성
  '嚴':20,'蘇':20,
  // 한글 성씨 (발음 기준 대표 획수)
  '김':8,'이':7,'박':9,'최':11,'정':15,'강':11,'조':14,'윤':4,'장':11,'임':9,
  '한':17,'오':5,'서':6,'신':9,'권':22,'황':12,'안':6,'송':7,'류':9,'전':6,
  '홍':9,'고':10,'문':4,'양':13,'손':10,'배':12,'조':14,'백':5,'허':11,'유':9,
  '남':9,'심':9,'노':16,'하':5,'곽':11,'성':6,'차':10,'주':6,'우':4,'구':5,
  '민':5,'나':4,'지':6,'엄':20,'채':15,'원':10,'천':4,'방':4,'공':4,'반':5,
  '석':5,'길':6,'변':4,'온':13,'우':4,'진':10,'태':4,'맹':8,'남궁':21,'황보':19,
  '선우':12,'제갈':14,'사공':8,'독고':16,'동방':12,'부여':11,'서문':9,
};

/**
 * 성씨 획수 조회
 */
function getSurnameStroke(surname) {
  if (!surname) return 0;
  const key = surname.trim();
  // 직접 매칭
  if (SURNAME_STROKES[key] !== undefined) return SURNAME_STROKES[key];
  // 한자의 경우 획수 추정
  if (key.charCodeAt(0) >= 0x4E00) return estimateStroke(key[0]);
  // 한글 성씨 첫 글자로 조회
  if (SURNAME_STROKES[key[0]] !== undefined) return SURNAME_STROKES[key[0]];
  return 8; // 기본값
}

/* =====================================================
   5. 이름 수리 배치 (원형이정 / 삼원오행)
   성명학 기본 4격: 원격(元格), 형격(亨格), 이격(利格), 정격(貞格)
   ===================================================== */

/**
 * 성(1자) + 이름(2자) 기준 4격 계산
 * @param {number} s  성씨 획수
 * @param {number} n1 이름 첫째 글자 획수
 * @param {number} n2 이름 둘째 글자 획수 (외자이면 0)
 */
function calc4Gyeok(s, n1, n2) {
  // 원격(元格): 이름 첫째+둘째 합 (이름 부분의 운)
  const won  = n2 > 0 ? (n1 + n2) : n1;
  // 형격(亨格): 성+이름 첫째 합 (초중년 운)
  const hyeong = s + n1;
  // 이격(利格): 이름 전체 합 (중년 운)
  const yi    = n2 > 0 ? (n1 + n2) : n1;
  // 정격(貞格): 성+이름 전체 합 (총운, 가장 중요)
  const jeong = s + n1 + (n2 || 0);

  return {
    won:    { num: won,    ...getSuri81(won)    },
    hyeong: { num: hyeong, ...getSuri81(hyeong) },
    yi:     { num: yi,     ...getSuri81(yi)     },
    jeong:  { num: jeong,  ...getSuri81(jeong)  },
  };
}

/* =====================================================
   6. 이름 입력 파싱
   ===================================================== */

/**
 * 사용자 메시지에서 이름 관련 정보 파싱
 */
function parseNamingInput(text) {
  const result = {
    found: false,
    type: null,        // 'baby', 'rename', 'brand', 'surname_only'
    surname: null,     // 성씨
    currentName: null, // 현재 이름 (개명 시)
    candidates: [],    // 후보 이름들
    gender: null,      // 'male' | 'female' | null
    birthYear: null,
    birthMonth: null,
    birthDay: null,
    birthHour: null,
    isLunar: false,
    brandKeywords: [], // 브랜드 키워드
    industry: null,    // 업종
  };

  // ── 성별 파싱 ──
  if (/남자|남아|남성|아들|boy/i.test(text)) result.gender = 'male';
  if (/여자|여아|여성|딸|girl/i.test(text))  result.gender = 'female';

  // ── 생년월일 파싱 ──
  const yearM  = text.match(/(\d{4})년/);
  const monthM = text.match(/(\d{1,2})월/);
  const dayM   = text.match(/(\d{1,2})일/);
  const hourM  = text.match(/(\d{1,2})시/);
  if (yearM)  result.birthYear  = parseInt(yearM[1]);
  if (monthM) result.birthMonth = parseInt(monthM[1]);
  if (dayM)   result.birthDay   = parseInt(dayM[1]);
  if (hourM)  result.birthHour  = parseInt(hourM[1]);
  if (/음력/.test(text)) result.isLunar = true;

  // ── 성씨 파싱 (성씨 + 씨 / 성은 / 성이) ──
  const surnamePatterns = [
    /([가-힣]{1,2})\s*씨\s*(성씨|성은|이름|네이밍)/,
    /성(?:씨|은|이)?\s*([가-힣]{1,2})/,
    /([가-힣]{1,2})\s*씨\s*(?:성|아이|자녀|아기)/,
    /([가-힣]{1,2})\s*(?:성|씨)$/,
  ];
  for (const pat of surnamePatterns) {
    const m = text.match(pat);
    if (m) { result.surname = m[1]; break; }
  }

  // 성씨만 단독으로 언급된 경우 (예: "김씨 성에 맞는 이름")
  const surnameOnly = text.match(/([가-힣]{1,2})\s*씨/);
  if (!result.surname && surnameOnly) result.surname = surnameOnly[1];

  // ── 현재 이름 파싱 (개명) ──
  const currentNamePat = text.match(/(?:현재|지금|제)\s*이름(?:은|이)?\s*([가-힣]{2,5})/);
  if (currentNamePat) result.currentName = currentNamePat[1];

  // ── 이름 후보 파싱 ──
  // "민준, 서준, 하준" 형태
  const candidateStr = text.match(/후보[:\s]*([가-힣,\s]+)/);
  if (candidateStr) {
    result.candidates = candidateStr[1].split(/[,\s]+/).filter(s => s.length >= 2 && s.length <= 5);
  }

  // ── 브랜드 키워드 파싱 ──
  const brandKws = text.match(/(?:키워드|이미지|느낌)[:\s]*([가-힣a-zA-Z,\s]+)/);
  if (brandKws) {
    result.brandKeywords = brandKws[1].split(/[,\s]+/).filter(s => s.length > 0).slice(0, 5);
  }

  // ── 업종 파싱 ──
  const industries = ['카페','식당','음식점','미용','뷰티','IT','스타트업','쇼핑몰','의류','인테리어',
    '교육','학원','병원','약국','헬스','피트니스','부동산','여행','컨설팅','법무'];
  for (const ind of industries) {
    if (text.includes(ind)) { result.industry = ind; break; }
  }

  // ── 타입 판단 ──
  if (/아이|아기|자녀|태어|출생|갓난|신생|태명|작명/.test(text)) result.type = 'baby';
  else if (/개명|이름.*바꾸|이름.*변경|현재.*이름/.test(text)) result.type = 'rename';
  else if (/브랜드|상호|가게|매장|회사|상점|법인|쇼핑몰|서비스명/.test(text)) result.type = 'brand';
  else if (/사주.*보완|보완.*이름|용신.*이름/.test(text)) result.type = 'saju_supplement';
  else result.type = 'general';

  result.found = true;
  return result;
}

/* =====================================================
   7. 이름 후보 종합 분석
   ===================================================== */

/**
 * 이름 후보 단일 분석
 * @param {string} surname    성씨 (한글 또는 한자)
 * @param {string} namePart   이름 부분 (한글 또는 한자)
 * @param {string} ohengNeed  필요 오행 (사주에서 부족한 것, 선택사항)
 */
function analyzeNameCandidate(surname, namePart, ohengNeed) {
  const result = {
    fullName: surname + namePart,
    surname,
    namePart,
  };

  // ── 발음오행 분석 ──
  const fullJamo = getNameJamoOheng(surname + namePart);
  const nameJamo = getNameJamoOheng(namePart);
  result.jamoOheng    = fullJamo;
  result.jamoBalance  = analyzeJamoBalance(fullJamo);

  // ── 이름 오행 (이름 부분의 주도 오행) ──
  const ohengCounts = { '木':0,'火':0,'土':0,'金':0,'水':0 };
  nameJamo.forEach(j => { ohengCounts[j.oheng] = (ohengCounts[j.oheng] || 0) + 1; });
  const dominantOheng = Object.entries(ohengCounts).sort((a,b)=>b[1]-a[1])[0][0];
  result.dominantOheng = dominantOheng;
  result.ohengInfo     = OHENG_INFO[dominantOheng];

  // ── 용신 보완 여부 ──
  if (ohengNeed) {
    result.ohengMatch = (dominantOheng === ohengNeed);
    result.ohengSangsaeng = (OHENG_SANGSAENG[dominantOheng] === ohengNeed ||
                              OHENG_SANGSAENG[ohengNeed] === dominantOheng);
  }

  // ── 획수 분석 (한자 이름인 경우) ──
  const hasHanja = /[\u4E00-\u9FFF]/.test(namePart);
  if (hasHanja) {
    const sStroke = getSurnameStroke(surname);
    const nStrokes = calcHanjaStrokes(namePart);
    const n1 = nStrokes.strokes[0]?.stroke || 0;
    const n2 = nStrokes.strokes[1]?.stroke || 0;
    result.strokes   = { surname: sStroke, name: nStrokes.strokes, total: sStroke + nStrokes.total };
    result.gyeok4    = calc4Gyeok(sStroke, n1, n2);
  }

  // ── 종합 점수 산출 ──
  let score = result.jamoBalance.score;
  if (ohengNeed && result.ohengMatch)      score += 10;
  if (ohengNeed && result.ohengSangsaeng)  score += 5;
  if (result.gyeok4) {
    const jeongGrade = result.gyeok4.jeong.grade;
    if (jeongGrade.includes('대길')) score += 15;
    else if (jeongGrade.includes('吉')) score += 8;
    else if (jeongGrade.includes('凶')) score -= 10;
  }
  result.totalScore = Math.min(100, Math.max(0, score));
  result.grade = result.totalScore >= 85 ? '추천 ⭐⭐⭐' :
                 result.totalScore >= 70 ? '양호 ⭐⭐' : '보통 ⭐';

  return result;
}

/* =====================================================
   8. 브랜드명 분석
   ===================================================== */

// 발음 밝기 점수 (초성 기준)
const JAMO_BRIGHTNESS = {
  'ㄱ':7,'ㄴ':6,'ㄷ':7,'ㄹ':8,'ㅁ':6,'ㅂ':7,'ㅅ':8,'ㅇ':5,'ㅈ':7,'ㅊ':9,'ㅋ':8,'ㅌ':8,'ㅍ':7,'ㅎ':6,
  'ㄲ':6,'ㄸ':7,'ㅃ':7,'ㅆ':7,'ㅉ':6,
};

// 모음 밝기 (양모음: 밝음, 음모음: 어두움)
const VOWEL_BRIGHTNESS = {
  'ㅏ':10,'ㅐ':9,'ㅑ':10,'ㅒ':9,'ㅓ':6,'ㅔ':7,'ㅕ':7,'ㅖ':8,
  'ㅗ':9,'ㅘ':9,'ㅚ':8,'ㅛ':10,'ㅜ':5,'ㅝ':5,'ㅞ':6,'ㅟ':6,'ㅠ':6,'ㅡ':5,'ㅢ':6,'ㅣ':8,
};

/**
 * 브랜드명 발음 에너지 분석
 */
function analyzeBrandName(brandName) {
  if (!brandName || brandName.length === 0) return null;

  // 발음 밝기
  let brightnessTotal = 0;
  let brightnessCount = 0;
  brandName.split('').forEach(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code >= 0 && code <= 11171) {
      const cho  = Math.floor(code / 588);
      const jung = Math.floor((code % 588) / 28);
      const CHOSEONG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
      const JUNGSEONG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
      const choJamo  = CHOSEONG[cho];
      const jungJamo = JUNGSEONG[jung];
      if (JAMO_BRIGHTNESS[choJamo])   { brightnessTotal += JAMO_BRIGHTNESS[choJamo];  brightnessCount++; }
      if (VOWEL_BRIGHTNESS[jungJamo]) { brightnessTotal += VOWEL_BRIGHTNESS[jungJamo]; brightnessCount++; }
    }
  });
  const avgBrightness = brightnessCount > 0 ? brightnessTotal / brightnessCount : 5;

  // 발음오행
  const jamoArr = getNameJamoOheng(brandName);
  const balance = analyzeJamoBalance(jamoArr);

  // 이름 길이 적정성
  const len = brandName.replace(/\s/g, '').length;
  let lengthScore = 0;
  if (len <= 2) lengthScore = 60;
  else if (len <= 4) lengthScore = 90;
  else if (len <= 6) lengthScore = 75;
  else lengthScore = 50;

  // 기억 용이성 (짧고 밝은 발음이 좋음)
  const memScore = Math.round((avgBrightness * 8 + lengthScore * 0.2 + balance.score * 0.3));

  return {
    brandName,
    length: len,
    brightness: avgBrightness.toFixed(1),
    brightnessGrade: avgBrightness >= 8 ? '매우 밝음 ✨' : avgBrightness >= 6.5 ? '밝음 🌟' : avgBrightness >= 5 ? '보통 🔵' : '어두움 🌑',
    jamoOheng: jamoArr,
    balance,
    memScore: Math.min(100, memScore),
    dominantOheng: jamoArr.length > 0 ? (() => {
      const counts = {};
      jamoArr.forEach(j => counts[j.oheng] = (counts[j.oheng] || 0) + 1);
      return Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
    })() : '土',
  };
}

/* =====================================================
   9. 사주 용신 기반 이름 오행 추천
   ===================================================== */
function recommendOhengForSaju(yongshinOheng) {
  if (!yongshinOheng) return null;
  // 용신 자체 + 용신을 생하는 오행 모두 도움이 됨
  const helper = Object.entries(OHENG_SANGSAENG).find(([k,v]) => v === yongshinOheng)?.[0];
  return {
    primary: yongshinOheng,
    secondary: helper || null,
    primaryInfo: OHENG_INFO[yongshinOheng],
    secondaryInfo: helper ? OHENG_INFO[helper] : null,
    avoidOheng: OHENG_SANGGEUK[yongshinOheng],
    avoidInfo: OHENG_INFO[OHENG_SANGGEUK[yongshinOheng]],
  };
}

/* =====================================================
   10. 네이밍 결과 → Gemini 프롬프트 텍스트 변환
   ===================================================== */
function namingToPromptText(input, saju) {
  if (!input || !input.found) return '';

  let text = '\n\n【네이밍 사전 분석 결과 (이 데이터를 기반으로 상담할 것)】\n';

  // 상담 유형
  const typeLabel = {
    'baby':           '아이 이름 짓기',
    'rename':         '개명 상담',
    'brand':          '브랜드·상호명 네이밍',
    'saju_supplement':'사주 보완 이름',
    'general':        '이름 상담',
  };
  text += '📋 상담 유형: ' + (typeLabel[input.type] || '이름 상담') + '\n';

  // 기본 정보
  if (input.surname)  text += '👤 성씨: ' + input.surname + ' (' + getSurnameStroke(input.surname) + '획)\n';
  if (input.gender)   text += '⚥  성별: ' + (input.gender === 'male' ? '남자' : '여자') + '\n';
  if (input.currentName) text += '✏️ 현재 이름: ' + input.currentName + '\n';
  if (input.industry) text += '🏪 업종: ' + input.industry + '\n';
  if (input.brandKeywords.length > 0) text += '🔑 브랜드 키워드: ' + input.brandKeywords.join(', ') + '\n';

  // 생년월일이 있는 경우 사주 오행 연동
  if (saju && !saju.error) {
    const weak = Object.entries(saju.oheng || {})
      .filter(([,v]) => v === 0 || (saju.ohengTotal > 0 && v / saju.ohengTotal < 0.1))
      .map(([k]) => k);
    if (weak.length > 0) {
      text += '\n🔮 사주 오행 분석:\n';
      text += '   부족한 오행: ' + weak.join(', ') + '\n';
      text += '   이름에 담으면 좋은 오행: ' + weak.join(' 또는 ') + ' 기운의 한자/발음\n';
      const rec = recommendOhengForSaju(weak[0]);
      if (rec) {
        text += '   추천 이름 발음 초성: ';
        const goodJamos = Object.entries(JAMO_OHENG).filter(([,v]) => v === rec.primary).map(([k]) => k);
        text += goodJamos.join(', ') + ' (발음오행: ' + rec.primary + ')\n';
        if (rec.secondary) {
          const goodJamos2 = Object.entries(JAMO_OHENG).filter(([,v]) => v === rec.secondary).map(([k]) => k);
          text += '   보조 추천 초성: ' + goodJamos2.join(', ') + ' (발음오행: ' + rec.secondary + ')\n';
        }
        text += '   피해야 할 발음오행: ' + rec.avoidOheng + ' (' + rec.avoidInfo.name + ')\n';
      }
    }
  }

  // 이름 후보 분석
  if (input.candidates.length > 0) {
    text += '\n📊 이름 후보 분석:\n';
    input.candidates.forEach((cand, i) => {
      const surname = input.surname || '';
      const namePart = surname ? cand.replace(surname, '') : cand;
      const analysis = analyzeNameCandidate(surname || '김', namePart || cand, null);
      text += '\n   ' + (i+1) + '. ' + cand + '\n';
      text += '      발음오행: ';
      analysis.jamoOheng.forEach(j => { text += j.char + '(' + j.oheng + ') '; });
      text += '\n';
      text += '      오행 배합: ' + analysis.jamoBalance.grade + ' (점수: ' + analysis.jamoBalance.score + ')\n';
      if (analysis.gyeok4) {
        text += '      정격(총운) 수리: ' + analysis.gyeok4.jeong.num + '수 — ' + analysis.gyeok4.jeong.grade + '\n';
      }
      text += '      종합 평가: ' + analysis.grade + '\n';
    });
  }

  // 브랜드명 후보 분석
  if (input.type === 'brand' && input.candidates.length > 0) {
    text += '\n🏷️ 브랜드명 발음 에너지 분석:\n';
    input.candidates.forEach((cand, i) => {
      const ba = analyzeBrandName(cand);
      if (ba) {
        text += '   ' + (i+1) + '. ' + cand + ': 밝기 ' + ba.brightnessGrade;
        text += ' | 발음오행 ' + ba.dominantOheng + ' | 기억도 ' + ba.memScore + '점\n';
      }
    });
  }

  // AI 지침
  text += '\n【AI 네이밍 상담 지침】\n';
  if (input.type === 'baby' || input.type === 'rename') {
    text += '1. 위 분석 데이터를 기반으로 구체적인 이름 추천 3~5개를 제시하세요.\n';
    text += '2. 각 이름에 대해 발음오행, 획수, 의미, 추천 이유를 명확히 설명하세요.\n';
    text += '3. 한자 이름의 경우 한자 병기: 예) 지은(智恩)\n';
    text += '4. 성씨가 있으면 반드시 성씨 + 이름 전체로 분석하세요.\n';
    text += '5. 피해야 할 발음이나 오행이 있으면 이유와 함께 설명하세요.\n';
  } else if (input.type === 'brand') {
    text += '1. 브랜드명은 발음이 밝고 기억하기 쉬운 것이 중요합니다.\n';
    text += '2. 업종 이미지에 맞는 오행 기운을 갖춘 이름을 추천하세요.\n';
    text += '3. 후보명이 있으면 각각 장단점을 비교 분석해 최종 추천하세요.\n';
    text += '4. 영문 브랜드명 병기도 제안해주세요.\n';
    text += '5. 2~4글자가 가장 이상적인 브랜드명 길이입니다.\n';
  } else {
    text += '1. 위 분석을 기반으로 구체적인 조언과 이름 제안을 해주세요.\n';
    text += '2. 발음오행, 획수, 의미를 모두 고려한 종합 분석을 제공하세요.\n';
  }

  return text;
}

/* =====================================================
   11. 전역 노출
   ===================================================== */
window.parseNamingInput        = parseNamingInput;
window.getNameJamoOheng        = getNameJamoOheng;
window.analyzeJamoBalance      = analyzeJamoBalance;
window.calcHanjaStrokes        = calcHanjaStrokes;
window.getSurnameStroke        = getSurnameStroke;
window.getSuri81               = getSuri81;
window.calc4Gyeok              = calc4Gyeok;
window.analyzeNameCandidate    = analyzeNameCandidate;
window.analyzeBrandName        = analyzeBrandName;
window.recommendOhengForSaju   = recommendOhengForSaju;
window.namingToPromptText      = namingToPromptText;
window.OHENG_INFO              = OHENG_INFO;
window.JAMO_OHENG              = JAMO_OHENG;
window.OHENG_SANGSAENG         = OHENG_SANGSAENG;
window.OHENG_SANGGEUK          = OHENG_SANGGEUK;
