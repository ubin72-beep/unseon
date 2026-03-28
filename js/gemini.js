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

  return '당신은 운세ON의 전문 사주명리 상담 AI입니다. 수십 년 경력의 한국 전통 명리학 전문가입니다.\n\n' +
    '현재 상담 분야: ' + catName + '\n\n' +
    '핵심 지침:\n' +
    '- 사용자가 보낸 메시지를 정확히 읽고 그 내용에만 집중하여 답변하세요\n' +
    '- 매 답변은 반드시 달라야 합니다. 이전 답변과 같은 내용을 반복하지 마세요\n' +
    '- 생년월일이 있으면 실제 천간지지를 계산해서 구체적으로 분석하세요\n' +
    '- 생년월일이 없으면 자연스럽게 한 번만 물어보세요 (매번 묻지 말 것)\n' +
    '- 2026년은 병오년(丙午年), 丙=火, 午=火로 火 기운이 매우 강한 해입니다\n' +
    '- 한국어 경어체로 답변하세요\n' +
    '- 마크다운(**굵게**, #제목 등) 절대 금지. HTML 태그만 사용하세요\n\n' +
    'HTML 출력 규칙:\n' +
    '- 제목: <h4>이모지 제목</h4>\n' +
    '- 단락: <p>내용</p>\n' +
    '- 강조: <strong>강조어</strong>\n' +
    '- 목록: <ul><li>항목</li></ul>\n' +
    '- 마무리: <p class="saju-closing">마무리 문장</p>\n\n' +
    '천간: 甲木 乙木 丙火 丁火 戊土 己土 庚金 辛金 壬水 癸水\n' +
    '지지: 子水 丑土 寅木 卯木 辰土 巳火 午火 未土 申金 酉金 戌土 亥水\n' +
    '연도별 간지: 1990=경오 1991=신미 1992=임신 1993=계유 1994=갑술 1995=을해\n' +
    '1996=병자 1997=정축 1998=무인 1999=기묘 2000=경진 2001=신사 2002=임오\n' +
    '2003=계미 2004=갑신 2005=을유 2006=병술 2007=정해 2008=무자 2009=기축\n' +
    '2010=경인 2011=신묘 2012=임진 2013=계사 2014=갑오 2015=을미 2016=병신\n' +
    '2017=정유 2018=무술 2019=기해 2020=경자 2021=신축 2022=임인 2023=계묘\n' +
    '2024=갑진 2025=을사 2026=병오';
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

  addToHistory('user', userMessage);

  const requestBody = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(category) }]
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1500,
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
