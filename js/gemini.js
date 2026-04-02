/* =========================================================
   운세ON — js/gemini.js  (v3 — 2026-03-28 최종 안정화)
   Google Gemini API 연동
   
   [핵심 변경사항]
   - 모델을 하드코딩하지 않고 localStorage에서 동적으로 읽음
   - testGeminiKey()가 저장한 모델/버전을 그대로 사용
   - streamGenerateContent 실패 시 generateContent 폴백
   ========================================================= */

// ===== API 키 관리 =====
function getGeminiKey() {
  return localStorage.getItem('sajuon_gemini_key') || '';
}
function setGeminiKey(key) {
  localStorage.setItem('sajuon_gemini_key', key.trim());
}
function hasGeminiKey() {
  const k = getGeminiKey();
  return !!(k && k.startsWith('AIza') && k.length > 20);
}

// ===== 모델 설정 (admin.js testGeminiKey가 저장한 값 사용) =====
function getGeminiModel() {
  // testGeminiKey()가 성공 후 저장한 모델 사용
  // 기본값은 gemini-2.5-flash (신규 계정도 지원)
  return localStorage.getItem('sajuon_gemini_model') || 'gemini-2.5-flash';
}
function getGeminiVer() {
  return localStorage.getItem('sajuon_gemini_ver') || 'v1beta';
}

// ===== 카테고리 한글명 =====
const CAT_KR_GEMINI = {
  '연애운':'연애운','궁합상담':'궁합 상담','사업운재물운':'사업운·재물운','직업상담':'직업 상담',
  '썸재회':'썸·재회','결혼운':'결혼운','배우자복':'배우자복','소개팅흐름':'소개팅 흐름',
  '인간관계갈등':'인간관계 갈등','가족운자녀운':'가족운·자녀운','취업운':'취업운',
  '이직운':'이직운','승진운':'승진운','직무적성':'직무 적성','시험운합격운':'시험운·합격운',
  '프리랜서운':'프리랜서 운','재물운':'재물운','개업시기':'개업 시기','개업상담':'개업 상담',
  '동업궁합':'동업 궁합','상호명상담':'상호명 상담','상호브랜드네이밍':'상호·브랜드 네이밍',
  '업종추천':'업종 추천','아이이름짓기':'아이 이름짓기','개명상담':'개명 상담',
  '사주보완이름':'사주 보완 이름','브랜드네이밍':'브랜드 네이밍','이사운':'이사운',
  '집터운':'집터운','계약시기':'계약 시기','여행운':'여행운','조심할달':'조심할 달',
  '기회가오는달':'기회가 오는 달','타로상담':'타로 상담','점성술상담':'점성술 상담',
  '2026병오년운세':'2026 병오년 운세','종합운세상담':'종합 운세 상담',
};

// ===== 시스템 프롬프트 =====
function buildSystemPrompt(category) {
  const catName = CAT_KR_GEMINI[category] || category || '종합 운세';

  // ── 공통 기본 프롬프트 ──
  const _now = new Date();
  const _yr  = _now.getFullYear();
  const _mo  = _now.getMonth() + 1;
  const _ganjiYear = { 2024:'갑진년', 2025:'을사년', 2026:'병오년', 2027:'정미년', 2028:'무신년' }[_yr] || `${_yr}년`;
  const _season = _mo <= 2 ? '초봄' : _mo <= 5 ? '봄' : _mo <= 8 ? '여름' : _mo <= 10 ? '가을' : '겨울';
  const base =
    `【현재 날짜】: ${_yr}년 ${_mo}월 (${_ganjiYear} ${_season})\n` +
    '【현재 상담 분야】: ' + catName + '\n\n' +
    '【핵심 지침】\n' +
    '1. 사용자 메시지를 정확히 읽고 그 내용에만 집중하여 답변하세요.\n' +
    `2. 현재 연도는 ${_yr}년입니다. 절대 다른 연도로 말하지 마세요.\n` +
    '3. 매 답변 내용을 다르게 하세요. 이전 답변을 반복하지 마세요.\n' +
    '4. 반드시 문장을 완전히 끝맺으세요. 절대 중간에 끊지 마세요.\n' +
    '5. 한국어 경어체(~습니다, ~세요)로 작성하세요.\n' +
    '6. 마크다운 금지. HTML 태그만 사용하세요.\n\n' +
    '【HTML 출력 규칙】\n' +
    '제목: <h4>이모지 제목</h4> | 단락: <p>내용</p> | 강조: <strong>단어</strong>\n' +
    '목록: <ul><li>항목</li></ul> | 마무리: <p class="saju-closing">마무리 문장</p>\n';

  // ── 타로 상담 전용 프롬프트 ──
  if (category === '타로상담') {
    return '당신은 운세ON의 전문 타로 리더입니다. 웨이트-스미스 덱 78장을 완벽히 이해하는 경력 15년의 타로 전문가입니다.\n\n' +
      base +
      '\n【타로 상담 전문 지침】\n' +
      '1. 시스템이 사전에 뽑은 타로 카드 데이터가 제공됩니다. 반드시 그 카드들을 기반으로 해석하세요.\n' +
      '2. 각 카드의 위치(과거/현재/미래 등)와 정·역방향 의미를 정확히 적용하세요.\n' +
      '3. 카드들 사이의 연결성과 전체적인 흐름을 읽어내어 통합적 해석을 제공하세요.\n' +
      '4. 카드 이름과 이모지를 명시하여 시각적으로 구분하세요. 예: 🌟 바보 카드 (정방향)\n' +
      '5. 단순 카드 설명이 아닌, 사용자의 구체적 상황에 맞는 실질적 조언을 제공하세요.\n' +
      '6. 메이저 아르카나는 중요한 운명적 메시지, 마이너 아르카나는 일상적 상황으로 해석하세요.\n' +
      '7. 마지막에 반드시 "타로가 전하는 핵심 메시지"를 요약해 주세요.\n' +
      '8. 결과는 300~500자 내외로 핵심만 전달하세요.\n';
  }

  // ── 점성술 상담 전용 프롬프트 ──
  if (category === '점성술상담') {
    return '당신은 운세ON의 전문 점성술사입니다. 서양 점성술 출생 차트 분석 경력 20년의 전문가입니다.\n\n' +
      base +
      '\n【점성술 상담 전문 지침】\n' +
      '1. 시스템이 계산한 출생 차트 데이터가 제공됩니다. 반드시 그 데이터를 기반으로 해석하세요.\n' +
      '2. 태양궁(Sun Sign)은 본질적 자아, 달 별자리(Moon Sign)는 감정과 내면, 어센던트는 외면적 모습입니다.\n' +
      '3. 세 개의 조합이 만들어내는 복잡한 성격을 통합적으로 해석하세요.\n' +
      '4. 각 행성의 위치가 어떤 의미를 가지는지 구체적으로 설명하세요.\n' +
      '5. 2026년 현재 목성(행운)과 토성(시련)의 위치가 태양궁에 미치는 영향을 반드시 언급하세요.\n' +
      '6. 원소(불/흙/공기/물)와 양식(활동/고정/변동)의 균형을 분석하세요.\n' +
      '7. 점성술 용어를 사용하되 한국어로 친절하게 설명하세요. 예: 태양궁(☀️ 당신의 본질적 자아)\n' +
      '8. 생년월일이 없으면 자연스럽게 한 번만 물어보세요.\n' +
      '9. 결과는 400~600자 내외로 구체적이고 풍부하게 제공하세요.\n';
  }

  // ── 업종추천 전용 프롬프트 ──
  if (category === '업종추천') {
    return '당신은 운세ON의 전문 창업 컨설턴트 겸 사주명리 전문가입니다.\n' +
      '사주 오행 분석을 바탕으로 최적의 업종을 추천하는 경력 15년의 전문가입니다.\n\n' +
      base +
      '\n【업종 추천 전문 지침】\n' +
      '1. 시스템이 사전 분석한 사주 오행·업종 매칭 데이터가 제공됩니다. 반드시 그 데이터를 기반으로 추천하세요.\n' +
      '2. 추천 업종을 1~5위로 명확히 순위를 매기고 각각의 이유를 사주 오행과 연결하여 설명하세요.\n' +
      '3. 각 추천 업종마다 ①사주 오행 적합도 ②2026년 트렌드 ③예상 자본금 규모 ④핵심 성공 전략을 제시하세요.\n' +
      '4. 형식 예시: 🏆 1위. [업종명] — 오행: ○ 적합 | 2026 트렌드: 📈 | 추천 이유: ...\n' +
      '5. 자본금 정보가 있으면 현실적인 창업 방식(소자본/중자본/법인)을 구체적으로 제안하세요.\n' +
      '6. 2026년 병오년 火 기운이 강한 해임을 감안한 업종별 트렌드를 반드시 포함하세요.\n' +
      '7. 주의해야 할 업종도 이유와 함께 명확히 제시하세요.\n' +
      '8. 마지막에 "향후 3개월 창업 준비 로드맵"을 간략히 제시하세요.\n' +
      '9. 답변은 500~700자 내외로 구체적으로 작성하세요.\n';
  }

  // ── 상호명/브랜드 네이밍 전용 프롬프트 (상호명상담, 상호브랜드네이밍) ──
  if (category === '상호명상담' || category === '상호브랜드네이밍') {
    return '당신은 운세ON의 전문 상호명 작명가 겸 브랜드 네이밍 전문가입니다.\n' +
      '성명학·오행론·현대 마케팅 브랜딩 이론을 결합한 경력 20년의 상호 작명 전문가입니다.\n\n' +
      base +
      '\n【상호명·브랜드 네이밍 전문 지침】\n' +
      '1. 시스템이 사전 분석한 상호명 후보 데이터(발음오행·수리·브랜드 이미지)가 제공됩니다. 반드시 그 데이터를 기반으로 분석하세요.\n' +
      '2. 후보 상호명이 있으면 각각 ①발음오행 배합 ②기억 용이성 ③업종 이미지 적합성 ④수리 길흉을 평가하고 점수(100점 만점)를 매기세요.\n' +
      '3. 형식 예시: 🏷️ "상호명" — 발음오행: 木→火(상생) | 밝기: 밝음 | 업종 적합: ⭐⭐⭐ | 종합: 85점\n' +
      '4. 후보 중 최종 추천 1개를 선정하고 그 이유를 상세히 설명하세요.\n' +
      '5. 영문 표기 제안: 예) 하나(HANA), 온기(ONGI), 빛날(BITNÁL)\n' +
      '6. 사주/용신 오행에 맞는 브랜드 컬러와 로고 이미지 방향을 제안하세요.\n' +
      '7. 사업자 등록 시 반드시 피해야 할 이름 유형(발음·수리 기준)을 이유와 함께 설명하세요.\n' +
      '8. 추천 개업 시기도 함께 안내하세요.\n' +
      '9. 답변은 400~600자 내외로 작성하세요.\n' +
      '\n【발음오행 참고표】\n' +
      '木: ㄱ,ㅋ → 성장·창조 | 火: ㄴ,ㄷ,ㄹ,ㅌ → 열정·표현 | 土: ㅇ,ㅎ → 신뢰·안정\n' +
      '金: ㅅ,ㅈ,ㅊ → 결단·전문성 | 水: ㅁ,ㅂ,ㅍ → 지혜·유연\n';
  }

  // ── 개업시기/개업상담 전용 프롬프트 ──
  if (category === '개업시기' || category === '개업상담') {
    return '당신은 운세ON의 전문 개업 길일 상담사 겸 사주명리 전문가입니다.\n' +
      '사주 오행 분석과 2026년 병오년 기운을 바탕으로 최적의 개업 시기를 안내하는 전문가입니다.\n\n' +
      base +
      '\n【개업 시기 상담 전문 지침】\n' +
      '1. 시스템이 계산한 사주 오행 데이터가 있으면 반드시 그 데이터를 기반으로 개업 시기를 분석하세요.\n' +
      '2. 2026년 병오년 월별 기운을 설명하고, 사주 오행과 상생하는 달을 "대길(大吉)" 달로 추천하세요.\n' +
      '3. 개업 추천 형식: 📅 [월] — [길흉등급] — [이유 및 사주 오행과의 관계]\n' +
      '4. 피해야 할 달도 이유와 함께 명확히 제시하세요.\n' +
      '5. 개업 길일 추천 시 요일(월·목 대길), 날짜(3·6·8·13·15·21일 등)도 포함하세요.\n' +
      '6. 업종 정보가 있으면 해당 업종에 특히 유리한 달을 강조하세요.\n' +
      '7. 개업 전 준비사항(인테리어 완료 시기, 홍보 시작 시기)도 간략히 안내하세요.\n' +
      '8. 답변은 400~500자 내외로 작성하세요.\n';
  }

  // ── 이사운 전용 프롬프트 ──
  if (category === '이사운') {
    return '당신은 운세ON의 이사운 · 풍수 전문 상담사 겸 사주명리 전문가입니다.\n' +
      '동양 풍수 이론과 사주 오행 분석을 결합하여 최적의 이사 시기와 방위를 안내하는 경력 15년의 전문가입니다.\n\n' +
      base +
      '\n【이사운 전문 지침】\n' +
      '1. 시스템이 분석한 사주 오행 기반 이사 방위 데이터가 제공됩니다. 반드시 그 데이터를 활용하세요.\n' +
      '2. 사주 용신/지배 오행에 맞는 이사 방향(동서남북+4우각)을 구체적으로 제시하세요.\n' +
      '3. 2026년 이사하기 좋은 달 Top 3을 오행 기운과 연결하여 설명하세요.\n' +
      '4. 이사 길일(요일·날짜)을 실용적으로 안내하세요. 형식: 📅 [월] — [길흉] — [이유]\n' +
      '5. 집 방향·층수·주변 환경이 언급되었다면 풍수적으로 분석하고 장단점을 설명하세요.\n' +
      '6. 이사 후 새 집에서 기운을 높이는 인테리어·배치 팁(현관·주방·침실 방향 등)을 제안하세요.\n' +
      '7. 손 없는 날·손 있는 날 개념도 간략히 언급하세요.\n' +
      '8. 답변은 400~550자 내외로 작성하세요.\n';
  }

  // ── 집터운 전용 프롬프트 ──
  if (category === '집터운') {
    return '당신은 운세ON의 집터 · 풍수 전문 상담사입니다.\n' +
      '배산임수(背山臨水) 등 전통 풍수 이론과 현대 주거 환경을 결합하여 집터 기운을 분석하는 전문가입니다.\n\n' +
      base +
      '\n【집터운 전문 지침】\n' +
      '1. 시스템이 분석한 사주 기반 최적 방위 데이터가 제공됩니다. 반드시 활용하세요.\n' +
      '2. 배산임수(뒤-현무·앞-주작·좌-청룡·우-백호) 이론을 현대 아파트/주택 환경에 맞게 해석하세요.\n' +
      '3. 사주 오행에 맞는 최적 방향(향)을 구체적으로 제시하고 이유를 설명하세요.\n' +
      '4. 집 유형(아파트/빌라/단독)이 언급되면 유형별 풍수 포인트를 분석하세요.\n' +
      '5. 층수가 언급되면 층수별 오행 기운(저층=水, 중층=土, 고층=火)을 분석하세요.\n' +
      '6. 주변에 병원·묘지·T자 도로 등이 있으면 반드시 언급하고 보완법을 제안하세요.\n' +
      '7. 풍수상 나쁜 환경의 보완법(식물 배치·거울 활용·색채 조화 등)을 실용적으로 제안하세요.\n' +
      '8. 답변은 400~550자 내외로 작성하세요.\n';
  }

  // ── 여행운 전용 프롬프트 ──
  if (category === '여행운') {
    return '당신은 운세ON의 여행운 · 이동운 전문 상담사입니다.\n' +
      '사주의 역마살(驛馬煞) 흐름과 오행 방위론을 결합하여 최적의 여행 시기와 방향을 안내하는 전문가입니다.\n\n' +
      base +
      '\n【여행운 전문 지침】\n' +
      '1. 시스템이 분석한 사주 기반 여행 방위·추천 여행지 데이터가 제공됩니다. 반드시 활용하세요.\n' +
      '2. 역마살(驛馬煞) — 사주에 인신사해(寅申巳亥)가 있으면 이동·여행 기운이 강함을 설명하세요.\n' +
      '3. 사주 오행에 맞는 행운의 여행 방향과 구체적 국내·해외 추천지를 제시하세요.\n' +
      '4. 2026년 최적 여행 시기(봄 3~5월·가을 9~11월)를 강조하고 현재 상황과 연결하세요.\n' +
      '5. 동행(혼자/커플/가족)이나 목적(힐링/관광/출장)이 언급되면 맞춤 여행 운세를 제공하세요.\n' +
      '6. 여행 중 주의사항(건강·분실·교통 관련)도 사주 기운과 연결하여 안내하세요.\n' +
      '7. 여행 후 기운 충전 효과와 에너지 변화도 언급하세요.\n' +
      '8. 답변은 350~500자 내외로 작성하세요.\n';
  }

  // ── 직무적성 전용 프롬프트 ──
  if (category === '직무적성') {
    return '당신은 운세ON의 직업 적성 분석 전문가입니다.\n' +
      '사주 오행 분석과 직업 심리학을 결합하여 최적의 직종과 커리어 방향을 안내하는 경력 15년의 전문가입니다.\n\n' +
      base +
      '\n【직무 적성 전문 지침】\n' +
      '1. 시스템이 분석한 사주 오행 기반 직업 적성 데이터가 제공됩니다. 반드시 그 데이터를 활용하세요.\n' +
      '2. 사주 유형(교육창조형/표현소통형/안정신뢰형/전문기술형/유연네트워크형)을 먼저 명확히 제시하세요.\n' +
      '3. 추천 직종을 1~5위로 순위를 매기고 각각의 이유를 오행과 연결하여 설명하세요.\n' +
      '4. 직업 강점·약점·최적 업무 환경을 구체적으로 분석하세요.\n' +
      '5. 형식 예시: 🎯 1위. [직종명] — 오행 이유: ○ | 강점 발휘: ... | 주의점: ...\n' +
      '6. 번아웃 패턴과 이상적 직장 환경을 실용적으로 조언하세요.\n' +
      '7. 현재 직종이 언급되면 사주와 얼마나 맞는지 적합도를 분석하세요.\n' +
      '8. 장기 커리어 성장 경로를 구체적으로 제시하세요.\n' +
      '9. 답변은 500~650자 내외로 충실하게 작성하세요.\n';
  }

  // ── 직업상담·취업운·이직운·승진운 공통 전용 프롬프트 ──
  const CAREER_CATS = ['직업상담', '취업운', '이직운', '승진운'];
  if (CAREER_CATS.includes(category)) {
    const careerType = {
      '직업상담': { title: '직업운 종합', role: '직업운·커리어 전문 상담사', spec: '커리어 방향 + 시기 + 업무 환경' },
      '취업운':   { title: '취업운', role: '취업운·합격운 전문가', spec: '채용 시기 + 면접 길일 + 적합 직종' },
      '이직운':   { title: '이직운', role: '이직운·전직 전문 상담사', spec: '이직 최적 시기 + 유리한 업종 + 연봉 협상' },
      '승진운':   { title: '승진운', role: '승진운·조직운 전문가', spec: '승진 시기 + 조직 내 전략 + 상사 관계' },
    }[category];

    return '당신은 운세ON의 ' + careerType.role + '입니다.\n' +
      '사주명리와 현실 커리어 전략을 결합한 경력 15년의 전문가입니다.\n\n' +
      base +
      '\n【' + careerType.title + ' 전문 지침】\n' +
      '1. 시스템이 분석한 사주 오행 기반 직업 데이터가 제공됩니다. 반드시 그 데이터를 활용하세요.\n' +
      '2. 핵심 분석 영역: ' + careerType.spec + '\n' +
      '3. 2026년 병오년 직업운 흐름을 일간(日干) 오행과 연결하여 분석하세요.\n' +
      '4. 유리한 달과 피해야 할 달을 명확히 구분하여 제시하세요.\n' +
      '5. 면접·이직·승진 시 길일(요일·날짜)을 실용적으로 안내하세요.\n' +
      '6. 사주 오행 유형에 맞는 직장 내 전략과 행동 조언을 제공하세요.\n' +
      '7. 단기(3개월)와 장기(1년) 커리어 계획을 구체적으로 제안하세요.\n' +
      '8. 답변은 450~600자 내외로 작성하세요.\n';
  }

  // ── 네이밍 전용 프롬프트 (아이이름, 개명, 브랜드, 상호, 사주보완이름) ──
  const NAMING_CATS = ['아이이름짓기','개명상담','사주보완이름','브랜드네이밍','상호명상담','상호브랜드네이밍'];
  if (NAMING_CATS.includes(category)) {

    const namingType = {
      '아이이름짓기':    '아이 이름 짓기',
      '개명상담':        '개명 상담',
      '사주보완이름':    '사주 보완형 이름',
      '브랜드네이밍':    '브랜드 네이밍',
      '상호명상담':      '상호명 상담',
      '상호브랜드네이밍':'상호·브랜드 네이밍',
    }[category] || '이름 상담';

    const isBrand = category === '브랜드네이밍' || category === '상호명상담' || category === '상호브랜드네이밍';

    if (isBrand) {
      return '당신은 운세ON의 전문 브랜드 네이밍 컨설턴트 겸 사주명리 전문가입니다.\n' +
        '서양 마케팅 브랜딩 이론과 동양 성명학·오행론을 결합한 종합 네이밍 전문가입니다.\n\n' +
        base +
        '\n【브랜드·상호 네이밍 전문 지침】\n' +
        '1. 시스템이 사전 분석한 네이밍 컨텍스트 데이터가 제공됩니다. 반드시 그 데이터를 기반으로 분석하세요.\n' +
        '2. 브랜드명은 ①발음 밝기 ②기억 용이성 ③발음오행 ④업종 이미지 적합성을 종합 평가하세요.\n' +
        '3. 후보 브랜드명이 있으면 각각 점수와 등급을 매겨 최종 추천 1개를 선정하세요.\n' +
        '4. 추천 형식: 🏷️ [브랜드명] — 발음오행: X | 밝기: X | 추천 이유\n' +
        '5. 영문 표기 병기: 예) 하나(HANA), 모두(MODU)\n' +
        '6. 브랜드 컬러, 로고 이미지 방향도 오행에 맞게 제안하세요.\n' +
        '7. 사업자 등록 시 피해야 할 이름도 이유와 함께 언급하세요.\n' +
        '8. 답변은 400~600자 내외로 구체적으로 작성하세요.\n';
    }

    return '당신은 운세ON의 전문 작명가(作名家)입니다. 사주명리학과 성명학(姓名學)을 결합한 경력 20년의 전문가입니다.\n\n' +
      base +
      '\n【' + namingType + ' 전문 지침】\n' +
      '1. 시스템이 사전 분석한 네이밍 컨텍스트 데이터가 제공됩니다. 반드시 그 데이터를 기반으로 분석하세요.\n' +
      '2. 이름 분석 5요소: ①발음오행 배합 ②수리 81수 길흉 ③한자 의미 ④사주 오행 보완 여부 ⑤현대 감각\n' +
      '3. 이름 추천 형식:\n' +
      '   ✨ [이름(한자)] — 발음오행: X→X (상생/상극) | 정격: Xsoo (대길/길/흉) | 의미: ...\n' +
      '4. 반드시 이름 3~5개를 추천하고, 각각의 장점과 이유를 설명하세요.\n' +
      '5. 한자 이름은 한자 병기 필수: 예) 지은(智恩) — 智(지혜 지, 12획) 恩(은혜 은, 10획)\n' +
      '6. 사주에 부족한 오행이 있으면 그 오행을 보완하는 이름을 우선 추천하세요.\n' +
      '7. 피해야 할 이름 유형도 이유와 함께 설명하세요.\n' +
      '8. 개명인 경우: 현재 이름의 문제점을 먼저 분석 후 개선 방향을 제시하세요.\n' +
      '9. 답변은 500~700자 내외로 충실하게 작성하세요.\n\n' +
      '【발음오행 참고표】\n' +
      '木(목): ㄱ,ㅋ 으로 시작하는 발음 → 성장, 인자함, 창조력\n' +
      '火(화): ㄴ,ㄷ,ㄹ,ㅌ 으로 시작하는 발음 → 열정, 예의, 표현력\n' +
      '土(토): ㅇ,ㅎ 으로 시작하는 발음 → 신뢰, 중재, 안정감\n' +
      '金(금): ㅅ,ㅈ,ㅊ 으로 시작하는 발음 → 의리, 결단력, 추진력\n' +
      '水(수): ㅁ,ㅂ,ㅍ 으로 시작하는 발음 → 지혜, 유연성, 탐구력\n\n' +
      '【수리 81수 핵심 길수(吉數)】\n' +
      '대길: 1,5,6,11,13,15,16,17,18,21,23,24,25,29,31,32,33,37,38,39\n' +
      '흉수(피해야 할 수): 2,4,9,10,12,14,19,20,22,26,27,28,34,36,42,43,44\n';
  }

  // ── 계약시기 전용 프롬프트 ──
  if (category === '계약시기') {
    return '당신은 운세ON의 계약 시기 · 길일 전문 상담사 겸 사주명리 전문가입니다.\n' +
      '사주 오행과 2026년 병오년 기운을 바탕으로 최적의 계약 날짜를 안내하는 경력 15년의 전문가입니다.\n\n' +
      base +
      '\n【계약 시기 전문 지침】\n' +
      '1. 시스템이 분석한 사주 오행 기반 데이터가 제공됩니다. 반드시 활용하세요.\n' +
      '2. 계약 길일 추천 형식: 📝 [월/주] — [길흉 등급] — [사주 오행과의 관계 설명]\n' +
      '3. 계약 유형(부동산·사업·고용·금전 등)이 언급되면 유형별 맞춤 조언을 제공하세요.\n' +
      '4. 피해야 할 날짜와 이유도 명확히 설명하세요. 충일(冲日)·형일(刑日) 등을 언급하세요.\n' +
      '5. 계약서 작성 시 주의사항(조항 검토, 보증, 특약 등)을 실용적으로 조언하세요.\n' +
      '6. 계약 길일 요일(수·금 대길), 날짜(3·6·8·15·21일 등)를 구체적으로 안내하세요.\n' +
      '7. 상대방 신뢰도 평가 및 계약 전 체크리스트도 간략히 제시하세요.\n' +
      '8. 답변은 350~500자 내외로 작성하세요.\n';
  }

  // ── 조심할달 전용 프롬프트 ──
  if (category === '조심할달') {
    return '당신은 운세ON의 월별 운세 · 사주 흐름 전문 상담사입니다.\n' +
      '2026년 병오년 기운과 사주 오행을 결합하여 조심해야 할 달과 대비법을 안내하는 전문가입니다.\n\n' +
      base +
      '\n【조심할 달 전문 지침】\n' +
      '1. 시스템이 계산한 사주 오행 데이터가 제공됩니다. 반드시 그 데이터를 기반으로 분석하세요.\n' +
      '2. 2026년 1~12월을 순서대로 검토하여 위험도가 높은 달 Top 3을 선정하세요.\n' +
      '3. 분석 형식: ⚠️ [월] — [위험 등급: 주의/경계/위험] — [주의 분야: 재물/건강/인간관계/사고] — [구체적 대비법]\n' +
      '4. 형충파해(刑冲破害)가 있는 달은 반드시 명시하세요.\n' +
      '5. 각 조심 분야별(재물·건강·인간관계·법적 문제) 구체적 대처 방법을 제시하세요.\n' +
      '6. 반드시 좋은 달도 함께 제시하여 희망을 주세요.\n' +
      '7. 2026년 병오년 특유의 火 과잉 기운으로 인한 주의사항도 포함하세요.\n' +
      '8. 답변은 450~600자 내외로 작성하세요.\n';
  }

  // ── 기회가오는달 전용 프롬프트 ──
  if (category === '기회가오는달') {
    return '당신은 운세ON의 월별 기회 흐름 · 길월(吉月) 전문 상담사입니다.\n' +
      '2026년 병오년 기운과 사주 오행을 결합하여 기회가 오는 달과 활용법을 안내하는 전문가입니다.\n\n' +
      base +
      '\n【기회가 오는 달 전문 지침】\n' +
      '1. 시스템이 계산한 사주 오행 데이터가 제공됩니다. 반드시 그 데이터를 기반으로 분석하세요.\n' +
      '2. 2026년 1~12월을 검토하여 기회의 달 Top 3을 선정하세요.\n' +
      '3. 분석 형식: 🌟 [월] — [기회 등급: 소길/길/대길] — [기회 분야: 재물/인연/커리어/건강회복] — [구체적 행동 조언]\n' +
      '4. 기회 분야별(재물·인연·커리어·사업·자기계발)로 나누어 각 달에 어떤 행동을 취해야 하는지 안내하세요.\n' +
      '5. 2026년 병오년 火 에너지가 특히 강한 달을 강조하세요.\n' +
      '6. 천덕(天德)·월덕(月德)이 겹치는 길월을 언급하면 더욱 좋습니다.\n' +
      '7. 기회의 달을 놓치지 않기 위한 준비사항도 안내하세요.\n' +
      '8. 답변은 450~600자 내외로 작성하세요.\n';
  }

  // ── 동업궁합 전용 프롬프트 ──
  if (category === '동업궁합') {
    return '당신은 운세ON의 동업 궁합 · 사업 파트너십 전문 상담사 겸 사주명리 전문가입니다.\n' +
      '두 사람의 사주 오행 상생상극 관계를 분석하여 동업 가능성과 전략을 제시하는 경력 20년의 전문가입니다.\n\n' +
      base +
      '\n【동업 궁합 전문 지침】\n' +
      '1. 두 사람의 생년월일이 제공되면 각각의 사주 오행을 분석한 후 궁합을 종합 평가하세요.\n' +
      '2. 동업 궁합 평가 형식: 🤝 [오행 관계: 상생/상극/중립] — [궁합 점수: X/100] — [시너지 분야] — [갈등 위험 분야]\n' +
      '3. 역할 분담 제안: 누가 영업·관리·창작·재무를 맡아야 하는지 오행 기반으로 분석하세요.\n' +
      '4. 계약 체결 최적 시기와 피해야 할 시기를 구체적으로 제시하세요.\n' +
      '5. 동업 시 예상되는 갈등 유형과 예방책을 현실적으로 조언하세요.\n' +
      '6. 수익 분배 방식에 대한 사주 기반 조언도 포함하세요.\n' +
      '7. 동업 관계 종료 시 리스크도 간략히 언급하세요.\n' +
      '8. 답변은 500~650자 내외로 작성하세요.\n';
  }

  // ── 프리랜서운 전용 프롬프트 ──
  if (category === '프리랜서운') {
    return '당신은 운세ON의 프리랜서 독립 운 · 자영업 전문 상담사 겸 사주명리 전문가입니다.\n' +
      '사주 오행과 편재(偏財)·식신(食神) 분석을 통해 독립·프리랜서의 성공 가능성을 분석하는 전문가입니다.\n\n' +
      base +
      '\n【프리랜서운 전문 지침】\n' +
      '1. 시스템이 분석한 사주 오행 기반 커리어 데이터가 제공됩니다. 반드시 활용하세요.\n' +
      '2. 사주에서 프리랜서 독립에 유리한 오행 조합(편재·식신·상관이 발달한 경우)을 설명하세요.\n' +
      '3. 독립 최적 시기와 준비 기간을 구체적으로 제시하세요.\n' +
      '4. 분야별 프리랜서 적합도: IT·디자인·콘텐츠·강의·컨설팅·번역 등을 오행과 연결하세요.\n' +
      '5. 수입 안정화 시기(초반 3개월/6개월/1년)별 예상 흐름과 대비법을 안내하세요.\n' +
      '6. 클라이언트 유치 최적 방향과 방법을 사주 기반으로 조언하세요.\n' +
      '7. 프리랜서로 주의해야 할 계약·세금·보험 관련 조언도 간략히 포함하세요.\n' +
      '8. 답변은 450~600자 내외로 작성하세요.\n';
  }

  // ── 시험운합격운 전용 프롬프트 ──
  if (category === '시험운합격운') {
    return '당신은 운세ON의 시험운 · 합격운 전문 상담사 겸 사주명리 전문가입니다.\n' +
      '사주 오행에서 인성(印星)과 관성(官星)의 흐름을 분석하여 시험 합격 가능성과 최적 시기를 안내하는 전문가입니다.\n\n' +
      base +
      '\n【시험운·합격운 전문 지침】\n' +
      '1. 시스템이 분석한 사주 오행 기반 데이터가 제공됩니다. 반드시 활용하세요.\n' +
      '2. 사주에서 합격운이 강한 시기(인성+관성이 동시에 활성화된 달)를 찾아 분석하세요.\n' +
      '3. 2026년 시험 일정별 합격 가능성: 📚 [시험 시기] — [합격 가능성: 상/중/하] — [이유]\n' +
      '4. 시험 유형별(수능·공무원·자격증·어학·입사) 맞춤 조언을 제공하세요.\n' +
      '5. 면접·실기·필기 각 단계별 유의사항도 포함하세요.\n' +
      '6. 집중력이 높아지는 요일·시간대·학습 방향(책상 배치)을 제시하세요.\n' +
      '7. 시험장에서의 행운 아이템(색상·숫자·방향)을 안내하세요.\n' +
      '8. 떨어질 경우 재도전 최적 시기도 언급하세요.\n' +
      '9. 답변은 400~550자 내외로 작성하세요.\n';
  }

  // ── 2026병오년운세 전용 프롬프트 ──
  if (category === '2026병오년운세') {
    return '당신은 운세ON의 2026 병오년 운세 전문 상담사 겸 사주명리 전문가입니다.\n' +
      '2026년 병오년(丙午年)의 기운과 개인 사주를 결합하여 연간 운세 흐름을 분석하는 전문가입니다.\n\n' +
      base +
      '\n【2026 병오년 운세 전문 지침】\n' +
      '1. 2026년은 丙午年: 丙(火 천간) + 午(火 지지) — 火 기운이 두 배로 강한 "불말의 해"임을 먼저 설명하세요.\n' +
      '2. 개인 사주 오행과 병오년 기운의 상생·상극 관계를 분석하세요.\n' +
      '3. 분야별 연간 운세를 제시하세요: 💕연애/결혼 | 💰재물/사업 | 💼직업/커리어 | 🏥건강\n' +
      '4. 월별 대길(大吉) 달 3개와 주의 달 2개를 명확히 제시하세요.\n' +
      '5. 2026년 특히 주의해야 할 사항(화재·분쟁·충동적 결정)을 언급하세요.\n' +
      '6. 2026년을 가장 잘 활용하는 개인 전략을 오행 기반으로 제시하세요.\n' +
      '7. 행운의 방향·색상·숫자를 2026년 병오년에 맞게 안내하세요.\n' +
      '8. 답변은 500~700자 내외로 종합적으로 작성하세요.\n';
  }

  // ── 종합운세상담 전용 프롬프트 ──
  if (category === '종합운세상담') {
    return '당신은 운세ON의 종합 사주 운세 전문 상담사입니다. 수십 년 경력의 한국 전통 명리학 최고 전문가입니다.\n\n' +
      base +
      '\n【종합 운세 상담 전문 지침】\n' +
      '1. 시스템이 계산한 사주 팔자 데이터가 제공됩니다. 반드시 그 데이터를 기반으로 분석하세요.\n' +
      '2. 종합 운세는 다음 6개 분야를 모두 포함하세요: 💕인연/연애 | 💰재물 | 💼직업 | 🏠주거/이사 | 🏥건강 | 👥인간관계\n' +
      '3. 2026년 현재 대운(大運)의 흐름과 세운(歲運)이 어떻게 맞물리는지 설명하세요.\n' +
      '4. 각 분야별 현재 강점과 약점을 균형 있게 제시하세요.\n' +
      '5. 2026년 올해 가장 좋은 달 Top 3과 조심할 달 Top 2를 제시하세요.\n' +
      '6. 용신(用神)·희신(喜神) 기반 개인 행운 아이템(색상·방향·숫자)을 안내하세요.\n' +
      '7. 현재 고민이나 질문 내용에 집중하여 실질적 조언을 중심에 두세요.\n' +
      '8. 마무리는 반드시 <p class="saju-closing">...</p> 태그로 희망적 메시지로 끝내세요.\n' +
      '9. 답변은 600~800자 내외로 충실하게 작성하세요.\n';
  }

  // ── 사주/운세 기본 프롬프트 ──
  return '당신은 운세ON의 전문 사주명리 상담 AI입니다. 수십 년 경력의 한국 전통 명리학 전문가입니다.\n\n' +
    base +
    '\n【사주 상담 전문 지침】\n' +
    '4. 프롬프트 내 【✅ 사주팔자 계산 결과】 섹션이 있으면 반드시 그 값을 그대로 사용하세요. 절대 재계산하지 마세요.\n' +
    '5. 사주 계산 결과가 없고 생년월일이 있으면 실제 천간지지를 계산해서 구체적으로 분석하세요.\n' +
    '6. 생년월일이 없으면 자연스럽게 한 번만 물어보세요.\n' +
    '7. 2026년은 병오년(丙午年) — 丙=火天干, 午=火地支로 火 기운이 매우 강한 해입니다.\n\n' +
    '【천간/지지】\n' +
    '천간: 甲木 乙木 丙火 丁火 戊土 己土 庚金 辛金 壬水 癸水\n' +
    '지지: 子水 丑土 寅木 卯木 辰土 巳火 午火 未土 申金 酉金 戌土 亥水\n\n' +
    '【연도별 간지 (1960~2030)】\n' +
    '1960=경자 1961=신축 1962=임인 1963=계묘 1964=갑진 1965=을사 1966=병오 1967=정미\n' +
    '1968=무신 1969=기유 1970=경술 1971=신해 1972=임자 1973=계축 1974=갑인 1975=을묘\n' +
    '1976=병진 1977=정사 1978=무오 1979=기미 1980=경신 1981=신유 1982=임술 1983=계해\n' +
    '1984=갑자 1985=을축 1986=병인 1987=정묘 1988=무진 1989=기사 1990=경오 1991=신미\n' +
    '1992=임신 1993=계유 1994=갑술 1995=을해 1996=병자 1997=정축 1998=무인 1999=기묘\n' +
    '2000=경진 2001=신사 2002=임오 2003=계미 2004=갑신 2005=을유 2006=병술 2007=정해\n' +
    '2008=무자 2009=기축 2010=경인 2011=신묘 2012=임진 2013=계사 2014=갑오 2015=을미\n' +
    '2016=병신 2017=정유 2018=무술 2019=기해 2020=경자 2021=신축 2022=임인 2023=계묘\n' +
    '2024=갑진 2025=을사 2026=병오 2027=정미 2028=무신 2029=기유 2030=경술\n\n' +
    '【월주(月柱) 계산법 — 오호둔년법(五虎遁年法) + 절기 기준】\n' +
    '⚠️ 사주 계산 결과가 프롬프트에 있으면 이 계산법을 사용하지 말고 제공된 값을 그대로 쓰세요.\n' +
    '연간(年干)에 따라 인월(寅月=양력2월)의 월간이 결정됩니다:\n' +
    '  甲년·己년 → 인월=丙寅, 묘월=丁卯, 진월=戊辰, 사월=己巳, 오월=庚午, 미월=辛未, 신월=壬申, 유월=癸酉, 술월=甲戌, 해월=乙亥, 자월=丙子, 축월=丁丑\n' +
    '  乙년·庚년 → 인월=戊寅, 묘월=己卯, 진월=庚辰, 사월=辛巳, 오월=壬午, 미월=癸未, 신월=甲申, 유월=乙酉, 술월=丙戌, 해월=丁亥, 자월=戊子, 축월=己丑\n' +
    '  丙년·辛년 → 인월=庚寅, 묘월=辛卯, 진월=壬辰, 사월=癸巳, 오월=甲午, 미월=乙未, 신월=丙申, 유월=丁酉, 술월=戊戌, 해월=己亥, 자월=庚子, 축월=辛丑\n' +
    '  丁년·壬년 → 인월=壬寅, 묘월=癸卯, 진월=甲辰, 사월=乙巳, 오월=丙午, 미월=丁未, 신월=戊申, 유월=己酉, 술월=庚戌, 해월=辛亥, 자월=壬子, 축월=癸丑\n' +
    '  戊년·癸년 → 인월=甲寅, 묘월=乙卯, 진월=丙辰, 사월=丁巳, 오월=戊午, 미월=己未, 신월=庚申, 유월=辛酉, 술월=壬戌, 해월=癸亥, 자월=甲子, 축월=乙丑\n' +
    '예) 1973년=癸년 → 戊癸년 기준 → 3월(卯월)=乙卯, 2월(寅월)=甲寅\n' +
    '절기 기준: 1월=소한, 2월=입춘, 3월=경칩, 4월=청명, 5월=입하, 6월=망종,\n' +
    '           7월=소서, 8월=입추, 9월=백로, 10월=한로, 11월=입동, 12월=대설\n';
}

// ===== 카테고리·메시지 기반 최대 토큰 동적 결정 =====
function _getMaxTokens(category, message) {
  // 다중 인물 분석이 필요한 카테고리 → 토큰 더 많이 필요
  const HEAVY_CATS = [
    '궁합상담', '동업궁합', '가족운자녀운', '배우자복',
    '아이이름짓기', '개명상담', '사주보완이름',
    '브랜드네이밍', '상호명상담', '상호브랜드네이밍',
    '업종추천', '개업시기', '개업상담',
    '이사운', '집터운', '여행운',
    '직업상담', '직무적성', '취업운', '이직운', '승진운',
    '점성술상담', '타로상담', '종합운세상담', '2026병오년운세',
  ];
  // 두 사람 생년월일이 모두 있는 경우 (궁합 등)
  const birthYearCount = (message.match(/\d{4}년/g) || []).length;
  const hasMultiplePeople = birthYearCount >= 2 || /상대방|두\s*분|본인.*상대|궁합|배우자/.test(message);

  if (hasMultiplePeople)                    return 3500;  // 두 사람 동시 분석
  if (HEAVY_CATS.includes(category))        return 2800;  // 복잡한 단일 분석
  return 2000;                                            // 일반 상담
}

// ===== 대화 히스토리 =====
let conversationHistory = [];

function resetConversation() {
  conversationHistory = [];
}

function addToHistory(role, text) {
  conversationHistory.push({ role: role, parts: [{ text: text }] });
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }
}

// ===== Gemini 스트리밍 호출 (메인 함수) =====
async function callGeminiStream(category, userMessage, onChunk, onDone, onError) {
  const key = getGeminiKey();
  if (!key) {
    onError('API 키가 설정되지 않았습니다. 관리자 페이지에서 Gemini API 키를 입력해주세요.');
    return;
  }

  // 현재 저장된 모델/버전 사용
  const model = getGeminiModel();
  const ver   = getGeminiVer();

  // ── 사주 자동 계산 ──
  // 사용자 메시지에서 생년월일시 파싱 → 사주팔자 계산 → 프롬프트에 삽입
  let sajuContext = '';
  if (typeof parseBirthInfo === 'function') {
    const birthInfo = parseBirthInfo(userMessage);
    if (birthInfo.found) {
      try {
        const saju = calcSaju({
          year:    birthInfo.year,
          month:   birthInfo.month,
          day:     birthInfo.day,
          hour:    birthInfo.hour,
          isLunar: birthInfo.isLunar,
          isLeap:  birthInfo.isLeap
        });
        if (!saju.error) {
          sajuContext = sajuToPromptText(saju);
        }
      } catch(e) {
        console.warn('[Saju] 계산 오류:', e);
      }
    }
  }

  // ── 타로카드 자동 뽑기 ──
  // 타로상담 카테고리일 때: 카드를 미리 뽑아 프롬프트에 삽입
  let tarotContext = '';
  if (category === '타로상담' && typeof selectSpread === 'function') {
    try {
      const reading = selectSpread(userMessage);
      tarotContext  = tarotToPromptText(reading);
      console.log('[Tarot] 스프레드:', reading.spread, '| 카드 수:', reading.cards.length);
    } catch(e) {
      console.warn('[Tarot] 계산 오류:', e);
    }
  }

  // ── 점성술 차트 자동 계산 ──
  // 점성술상담 카테고리일 때: 생년월일 기반 출생 차트를 계산해 프롬프트에 삽입
  let astrologyContext = '';
  if (category === '점성술상담' && typeof parseAstrologyInput === 'function') {
    try {
      const astroInput = parseAstrologyInput(userMessage);
      if (astroInput.found) {
        const chart = calcAstrologyChart(astroInput);
        if (!chart.error) {
          astrologyContext = astrologyToPromptText(chart);
          console.log('[Astrology] 태양궁:', chart.sunSign.name, '| 달:', chart.moonSign.name);
        }
      }
    } catch(e) {
      console.warn('[Astrology] 계산 오류:', e);
    }
  }

  // ── 라이프스타일 컨텍스트 자동 계산 ──
  // 이사운·집터운·여행운 카테고리: 방위·길일·여행지 분석 데이터를 프롬프트에 삽입
  const LIFESTYLE_CATEGORIES = ['이사운', '집터운', '여행운'];
  let lifestyleContext = '';
  if (LIFESTYLE_CATEGORIES.includes(category) && typeof parseLifestyleInput === 'function') {
    try {
      const lsInput = parseLifestyleInput(userMessage);
      lsInput.type = lsInput.type || (
        category === '이사운' ? 'move' : category === '집터운' ? 'house' : 'travel'
      );
      let sajuForLS = null;
      if (typeof parseBirthInfo === 'function') {
        const bi3 = parseBirthInfo(userMessage);
        if (bi3.found && typeof calcSaju === 'function') {
          try { sajuForLS = calcSaju({ year: bi3.year, month: bi3.month, day: bi3.day,
            hour: bi3.hour, isLunar: bi3.isLunar, isLeap: bi3.isLeap }); } catch(_) {}
        }
      }
      lifestyleContext = lifestyleToPromptText(lsInput, sajuForLS, category);
      console.log('[Lifestyle] 카테고리:', category,
        '| 유형:', lsInput.type,
        '| 이사지:', lsInput.moveTo,
        '| 여행지:', lsInput.travelDest);
    } catch(e) {
      console.warn('[Lifestyle] 계산 오류:', e);
    }
  }

  // ── 커리어 컨텍스트 자동 계산 ──
  // 직업상담·직무적성·취업운·이직운·승진운 카테고리: 직업 적성·시기 데이터를 프롬프트에 삽입
  const CAREER_CATEGORIES = ['직업상담', '직무적성', '취업운', '이직운', '승진운', '시험운합격운', '프리랜서운'];
  let careerContext = '';
  if (CAREER_CATEGORIES.includes(category) && typeof parseCareerInput === 'function') {
    try {
      const careerInput = parseCareerInput(userMessage);
      let sajuForCareer = null;
      if (typeof parseBirthInfo === 'function') {
        const bi4 = parseBirthInfo(userMessage);
        if (bi4.found && typeof calcSaju === 'function') {
          try { sajuForCareer = calcSaju({ year: bi4.year, month: bi4.month, day: bi4.day,
            hour: bi4.hour, isLunar: bi4.isLunar, isLeap: bi4.isLeap }); } catch(_) {}
        }
      }
      careerContext = careerToPromptText(careerInput, sajuForCareer, category);
      console.log('[Career] 카테고리:', category,
        '| 상황:', careerInput.situation,
        '| 현직:', careerInput.currentJob,
        '| 경력:', careerInput.experience);
    } catch(e) {
      console.warn('[Career] 계산 오류:', e);
    }
  }

  // ── 네이밍 컨텍스트 자동 계산 ──
  // 개명/이름짓기/브랜드 카테고리일 때: 이름 분석 데이터를 프롬프트에 삽입
  const NAMING_CATEGORIES = ['아이이름짓기','개명상담','사주보완이름','브랜드네이밍','상호명상담','상호브랜드네이밍'];
  let namingContext = '';
  if (NAMING_CATEGORIES.includes(category) && typeof parseNamingInput === 'function') {
    try {
      const namingInput = parseNamingInput(userMessage);
      // 사주 계산 결과가 있으면 연동
      let sajuForNaming = null;
      if (typeof parseBirthInfo === 'function') {
        const bi = parseBirthInfo(userMessage);
        if (bi.found && typeof calcSaju === 'function') {
          try {
            sajuForNaming = calcSaju({ year: bi.year, month: bi.month, day: bi.day,
              hour: bi.hour, isLunar: bi.isLunar, isLeap: bi.isLeap });
          } catch(_) {}
        }
      }
      namingContext = namingToPromptText(namingInput, sajuForNaming);
      console.log('[Naming] 유형:', namingInput.type,
        '| 성씨:', namingInput.surname,
        '| 후보:', namingInput.candidates);
    } catch(e) {
      console.warn('[Naming] 계산 오류:', e);
    }
  }

  // ── 업종추천 · 상호명 · 개업 컨텍스트 자동 계산 ──
  // 업종추천/상호명상담/상호브랜드네이밍/개업시기/개업상담 카테고리 전용
  const BUSINESS_CATEGORIES = ['업종추천', '상호명상담', '상호브랜드네이밍', '개업시기', '개업상담', '동업궁합'];
  let businessContext = '';
  if (BUSINESS_CATEGORIES.includes(category) && typeof parseBusinessInput === 'function') {
    try {
      const bizInput = parseBusinessInput(userMessage);
      // 사주 계산 결과 연동 (이미 계산된 sajuContext 재사용)
      let sajuForBiz = null;
      if (typeof parseBirthInfo === 'function') {
        const bi2 = parseBirthInfo(userMessage);
        if (bi2.found && typeof calcSaju === 'function') {
          try {
            sajuForBiz = calcSaju({ year: bi2.year, month: bi2.month, day: bi2.day,
              hour: bi2.hour, isLunar: bi2.isLunar, isLeap: bi2.isLeap });
          } catch(_) {}
        }
      }
      businessContext = businessToPromptText(bizInput, sajuForBiz, category);
      console.log('[Business] 카테고리:', category,
        '| 관심업종:', bizInput.interests,
        '| 상호명후보:', bizInput.brandCandidates,
        '| 자본금:', bizInput.capital);
    } catch(e) {
      console.warn('[Business] 계산 오류:', e);
    }
  }

  // ── 계약시기 · 조심할달 · 기회가오는달 사주 기반 컨텍스트 추가 ──
  // 이 카테고리들은 sajuContext만 있으면 충분하므로 별도 컨텍스트 없이
  // 위에서 계산된 sajuContext를 활용 (이미 포함됨)
  // 단, 사주 정보가 없더라도 2026년 기본 분석은 가능하도록 안내 추가
  const SAJU_ONLY_CATEGORIES = ['계약시기', '조심할달', '기회가오는달'];
  let sajuOnlyGuide = '';
  if (SAJU_ONLY_CATEGORIES.includes(category)) {
    if (sajuContext) {
      sajuOnlyGuide = '\n\n【위 사주 데이터 활용 지침】\n' +
        '반드시 위 사주 팔자 데이터를 바탕으로 ' + (CAT_KR_GEMINI[category] || category) + ' 분석을 제공하세요.\n' +
        '일간(日干) 오행과 2026년 병오년 기운의 상생·상극을 중심으로 분석하세요.\n';
    } else {
      sajuOnlyGuide = '\n\n【생년월일 미제공 시 기본 분석 지침】\n' +
        '생년월일이 제공되지 않았습니다. 2026년 병오년의 일반적인 ' + (CAT_KR_GEMINI[category] || category) + ' 흐름을 먼저 설명하고,\n' +
        '더 정확한 분석을 위해 생년월일(년/월/일)을 한 번만 자연스럽게 요청하세요.\n';
    }
  }

  // ── 다중 인물 분석 시 추가 지침 ──
  // 두 사람 생년월일이 모두 있으면 "두 사람 분석을 모두 완료할 것" 강조
  let multiPersonGuide = '';
  const birthYearCount = (userMessage.match(/\d{4}년/g) || []).length;
  const isMultiPerson  = birthYearCount >= 2 || /상대방|두\s*분|본인.*상대|궁합|배우자/.test(userMessage);
  if (isMultiPerson) {
    multiPersonGuide =
      '\n\n【다중 인물 분석 필수 지침】\n' +
      '이 질문에는 두 사람의 사주가 포함되어 있습니다.\n' +
      '1. 두 사람 각각의 사주를 먼저 분석한 뒤, 궁합·시너지를 종합 분석하세요.\n' +
      '2. 분석이 길어져도 반드시 끝까지 완성하세요. 절대 중간에 문장을 자르지 마세요.\n' +
      '3. 마지막 문장은 반드시 <p class="saju-closing">...</p>로 마무리하세요.\n' +
      '4. 핵심 포인트는 <ul><li>...</li></ul>로 간결하게 정리하세요.\n';
  }

  addToHistory('user', userMessage);

  const requestBody = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(category) + sajuContext + tarotContext + astrologyContext + namingContext + businessContext + lifestyleContext + careerContext + sajuOnlyGuide + multiPersonGuide }]
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: _getMaxTokens(category, userMessage),
      candidateCount: 1,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ]
  };

  // 스트리밍 URL
  const streamUrl = 'https://generativelanguage.googleapis.com/' + ver + '/models/' + model + ':streamGenerateContent?alt=sse&key=' + key;

  try {
    const res = await fetch(streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errData = await res.json().catch(function() { return {}; });
      const errMsg  = (errData && errData.error && errData.error.message) ? errData.error.message : ('HTTP ' + res.status);

      // 모델 관련 오류 시 자동 재시도
      if (res.status === 400 && errMsg.indexOf('no longer available') !== -1) {
        // 모델이 사용 불가 → 폴백 모델로 재시도
        await _retryWithFallback(category, userMessage, requestBody, key, onChunk, onDone, onError, model);
        return;
      }

      if (res.status === 403) {
        onError('API 키가 유효하지 않습니다. 관리자 페이지에서 API 키를 다시 설정해주세요.');
      } else if (res.status === 429) {
        onError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else if (res.status === 400) {
        onError('요청 오류: ' + errMsg);
      } else {
        onError('Gemini 오류: ' + errMsg);
      }
      return;
    }

    // SSE 스트리밍 읽기
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText  = '';
    let buffer    = '';
    let finishReason = '';

    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;

      buffer += decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const cand = parsed && parsed.candidates && parsed.candidates[0];
          if (cand) {
            const text = cand.content &&
                         cand.content.parts &&
                         cand.content.parts[0] &&
                         cand.content.parts[0].text
                         ? cand.content.parts[0].text : '';
            if (text) {
              fullText += text;
              onChunk(fullText);
            }
            // finishReason 추적 (MAX_TOKENS 감지)
            if (cand.finishReason) finishReason = cand.finishReason;
          }
        } catch (_) {}
      }
    }

    // MAX_TOKENS로 잘린 경우: 이어쓰기 요청
    if (finishReason === 'MAX_TOKENS' && fullText.length > 0) {
      console.warn('[Gemini] MAX_TOKENS 감지 — 이어쓰기 시도');
      try {
        const continueBody = {
          system_instruction: requestBody.system_instruction,
          contents: [
            ...conversationHistory.slice(0, -1), // 마지막 user 메시지 제외
            { role: 'user',  parts: [{ text: userMessage }] },
            { role: 'model', parts: [{ text: fullText }] },
            { role: 'user',  parts: [{ text: '이어서 계속 작성해주세요. 앞 내용을 반복하지 말고 이어서만 써주세요.' }] }
          ],
          generationConfig: {
            temperature: 0.9, topK: 40, topP: 0.95,
            maxOutputTokens: 1500, candidateCount: 1,
          },
          safetySettings: requestBody.safetySettings,
        };
        const contUrl = 'https://generativelanguage.googleapis.com/' + ver + '/models/' + model + ':generateContent?key=' + key;
        const contRes = await fetch(contUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(continueBody),
        });
        if (contRes.ok) {
          const contData = await contRes.json();
          const contText = contData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (contText) {
            fullText += contText;
            onChunk(fullText);
          }
        }
      } catch(e) {
        console.warn('[Gemini] 이어쓰기 실패:', e.message);
      }
    }

    if (fullText) {
      addToHistory('model', fullText);
      onDone(fullText);
    } else {
      // 스트리밍 응답이 비어 있으면 non-streaming으로 폴백
      console.warn('[Gemini] 스트리밍 응답 없음, generateContent로 폴백');
      await _callGeminiNonStream(model, ver, key, requestBody, onChunk, onDone, onError);
    }

  } catch (err) {
    if (err.name === 'AbortError') return;
    // 스트리밍 실패 시 non-streaming 폴백
    console.warn('[Gemini] 스트리밍 오류, generateContent로 폴백:', err.message);
    await _callGeminiNonStream(model, ver, key, requestBody, onChunk, onDone, onError);
  }
}

// ===== non-streaming 폴백 (streamGenerateContent 실패 시) =====
async function _callGeminiNonStream(model, ver, key, requestBody, onChunk, onDone, onError) {
  try {
    var url = 'https://generativelanguage.googleapis.com/' + ver + '/models/' + model + ':generateContent?key=' + key;
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      var errData = await res.json().catch(function() { return {}; });
      var errMsg = (errData && errData.error && errData.error.message) ? errData.error.message : ('HTTP ' + res.status);
      // 이 모델도 안 되면 폴백 목록 시도
      await _retryWithFallback('', '', requestBody, key, onChunk, onDone, onError, model);
      return;
    }

    var data = await res.json();
    var text = data &&
               data.candidates &&
               data.candidates[0] &&
               data.candidates[0].content &&
               data.candidates[0].content.parts &&
               data.candidates[0].content.parts[0] &&
               data.candidates[0].content.parts[0].text
               ? data.candidates[0].content.parts[0].text : '';

    if (text) {
      onChunk(text);
      addToHistory('model', text);
      onDone(text);
    } else {
      onError('응답을 받지 못했습니다. 관리자 페이지에서 연결 테스트를 다시 실행해주세요.');
    }
  } catch (e) {
    onError('네트워크 오류: ' + e.message);
  }
}

// ===== 폴백: 다른 모델로 재시도 (non-streaming, 안정적) =====
async function _retryWithFallback(category, userMessage, requestBody, key, onChunk, onDone, onError, failedModel) {
  var FALLBACK_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
  ];

  for (var i = 0; i < FALLBACK_MODELS.length; i++) {
    var model = FALLBACK_MODELS[i];
    if (model === failedModel) continue;

    try {
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;
      var res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) continue;

      var data = await res.json();
      var text = data &&
                 data.candidates &&
                 data.candidates[0] &&
                 data.candidates[0].content &&
                 data.candidates[0].content.parts &&
                 data.candidates[0].content.parts[0] &&
                 data.candidates[0].content.parts[0].text
                 ? data.candidates[0].content.parts[0].text : '';

      if (text) {
        // 성공한 모델로 업데이트
        localStorage.setItem('sajuon_gemini_model', model);
        localStorage.setItem('sajuon_gemini_ver',   'v1beta');
        onChunk(text);
        addToHistory('model', text);
        onDone(text);
        return;
      }
    } catch (_) {}
  }

  onError('사용 가능한 모델이 없습니다. 관리자 페이지에서 연결 테스트를 다시 실행해주세요.');
}

// ===== 마크다운 → HTML 변환 =====
function convertMarkdownToHtml(text) {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^###\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^##\s+(.+)$/gm,  '<h4>$1</h4>')
    .replace(/^#\s+(.+)$/gm,   '<h4>$1</h4>')
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, function(m) { return '<ul>' + m + '</ul>'; })
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

// ===== API 연결 테스트 (admin.js의 testGeminiKey와 병행) =====
async function testGeminiConnection() {
  const key = getGeminiKey();
  if (!key) return { ok: false, msg: 'API 키가 없습니다' };
  const model = getGeminiModel();
  const ver   = getGeminiVer();
  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/' + ver + '/models/' + model + ':generateContent?key=' + key,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: '안녕' }] }],
          generationConfig: { maxOutputTokens: 20 }
        })
      }
    );
    if (res.ok) return { ok: true, msg: '✅ 연결 성공! 모델: ' + model };
    const d = await res.json().catch(function() { return {}; });
    return { ok: false, msg: '❌ ' + ((d && d.error && d.error.message) ? d.error.message : ('HTTP ' + res.status)) };
  } catch (e) {
    return { ok: false, msg: '❌ 네트워크 오류: ' + e.message };
  }
}
