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
  const base =
    '【현재 날짜】: 2026년 3월 (병오년 초봄)\n' +
    '【현재 상담 분야】: ' + catName + '\n\n' +
    '【공통 핵심 지침】\n' +
    '1. 사용자가 보낸 메시지를 정확히 읽고 그 내용에만 집중하여 답변하세요.\n' +
    '2. 현재 연도는 반드시 2026년입니다. 2024년, 2025년이라고 절대 말하지 마세요.\n' +
    '3. 매 답변은 반드시 달라야 합니다. 이전 답변과 같은 내용을 반복하지 마세요.\n' +
    '7. 한국어 경어체(~습니다, ~세요)로 답변하세요.\n' +
    '8. 마크다운(**굵게**, #제목 등) 절대 금지. HTML 태그만 사용하세요.\n' +
    '9. 답변은 완전하게 끝맺음하세요. 중간에 잘리지 않도록 간결하게 작성하세요.\n\n' +
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

  // ── 사주/운세 기본 프롬프트 ──
  return '당신은 운세ON의 전문 사주명리 상담 AI입니다. 수십 년 경력의 한국 전통 명리학 전문가입니다.\n\n' +
    base +
    '\n【사주 상담 전문 지침】\n' +
    '4. 생년월일이 있으면 실제 천간지지를 계산해서 구체적으로 분석하세요.\n' +
    '5. 생년월일이 없으면 자연스럽게 한 번만 물어보세요.\n' +
    '6. 2026년은 병오년(丙午年) — 丙=火天干, 午=火地支로 火 기운이 매우 강한 해입니다.\n\n' +
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
    '2024=갑진 2025=을사 2026=병오 2027=정미 2028=무신 2029=기유 2030=경술';
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

  addToHistory('user', userMessage);

  const requestBody = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(category) + sajuContext + tarotContext + astrologyContext + namingContext }]
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
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
          const text = parsed &&
                       parsed.candidates &&
                       parsed.candidates[0] &&
                       parsed.candidates[0].content &&
                       parsed.candidates[0].content.parts &&
                       parsed.candidates[0].content.parts[0] &&
                       parsed.candidates[0].content.parts[0].text
                       ? parsed.candidates[0].content.parts[0].text : '';
          if (text) {
            fullText += text;
            onChunk(fullText);
          }
        } catch (_) {}
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
