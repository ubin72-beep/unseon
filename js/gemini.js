/* =========================================================
   운세ON — js/gemini.js
   Google Gemini API 연동 + 사주 명리 전문 AI 엔진
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
  return k && k.startsWith('AIza') && k.length > 20;
}

// ===== 모델 설정 =====
const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_API_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${key}`;

// ===== 카테고리별 한글명 =====
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

// ===== 시스템 프롬프트 빌더 =====
function buildSystemPrompt(category) {
  const catName = CAT_KR_GEMINI[category] || category;

  return `당신은 운세ON 서비스의 전문 사주 명리 상담 AI입니다.
수십 년 경력의 한국 전통 사주명리학 전문가로서 사용자에게 깊이 있고 따뜻한 운세 상담을 제공합니다.

【현재 상담 분야】: ${catName}

【핵심 원칙】
1. 사주명리(四柱命理) 기반: 천간(天干)·지지(地支)·오행(五行)·십신(十神) 이론을 정확히 활용하여 분석
2. 2026년 병오년(丙午年) 맥락: 丙(병화)·午(오화)의 강한 火 기운이 지배하는 해임을 염두에 두고 분석
3. 사용자가 생년월일시를 제공하면 반드시 사주팔자(四柱八字)를 구성하여 분석
4. 생년월일 없이 질문할 경우 일반 명리 흐름으로 분석하되, 정보 제공을 자연스럽게 유도
5. 긍정적이고 희망적인 메시지를 전달하되, 주의사항도 균형 있게 안내
6. 항상 한국어로 답변하며, 경어체(~습니다/~세요) 사용

【사주팔자 분석 방법】
- 생년: 연주(年柱) 천간·지지 도출
- 생월: 월주(月柱) 천간·지지 도출
- 생일: 일주(日柱) 천간·지지 도출 (일간이 본인의 핵심)
- 생시: 시주(時柱) 천간·지지 도출
- 오행 비율 계산 → 용신(用神)·기신(忌神) 도출
- 대운(大運)·세운(歲運) 흐름 파악

【천간 10개】: 甲(갑목) 乙(을목) 丙(병화) 丁(정화) 戊(무토) 己(기토) 庚(경금) 辛(신금) 壬(임수) 癸(계수)
【지지 12개】: 子(자수) 丑(축토) 寅(인목) 卯(묘목) 辰(진토) 巳(사화) 午(오화) 未(미토) 申(신금) 酉(유금) 戌(술토) 亥(해수)
【육십갑자 연도 기준】: 2026=병오, 2025=을사, 2024=갑진, 2023=계묘, 2022=임인, 2021=신축, 2020=경자, 2000=경진, 1990=경오, 1980=경신, 1970=경술, 1960=경자

【출력 형식】
반드시 아래 구조로 HTML 형식으로 답변하세요:

<h4>[이모지] [분야명] 분석 결과</h4>

[사주팔자가 있을 경우]
<div class="saju-pillars">
  <div class="pillar"><span class="pillar-label">연주</span><span class="pillar-gan">[천간]</span><span class="pillar-ji">[지지]</span></div>
  <div class="pillar"><span class="pillar-label">월주</span><span class="pillar-gan">[천간]</span><span class="pillar-ji">[지지]</span></div>
  <div class="pillar"><span class="pillar-label">일주</span><span class="pillar-gan">[천간]</span><span class="pillar-ji">[지지]</span></div>
  <div class="pillar"><span class="pillar-label">시주</span><span class="pillar-gan">[천간]</span><span class="pillar-ji">[지지]</span></div>
</div>
<div class="saju-ohaeng">
  <span class="oh-wood">목(木) [비율]%</span>
  <span class="oh-fire">화(火) [비율]%</span>
  <span class="oh-earth">토(土) [비율]%</span>
  <span class="oh-metal">금(金) [비율]%</span>
  <span class="oh-water">수(水) [비율]%</span>
</div>

<p>[핵심 분석 내용 — 2~3문장, 구체적이고 개인화된 내용]</p>

<ul>
<li>🌟 <strong>[포인트 1 제목]</strong>: [구체적 내용]</li>
<li>📅 <strong>[포인트 2 제목]</strong>: [구체적 내용]</li>
<li>⚠️ <strong>[포인트 3 제목]</strong>: [주의사항]</li>
<li>💡 <strong>[포인트 4 제목]</strong>: [조언]</li>
<li>🍀 <strong>행운 정보</strong>: 행운의 색 [색상] · 방향 [방향] · 숫자 [숫자]</li>
</ul>

<p class="saju-closing">[마무리 메시지 — 추가 정보 요청 또는 희망적 마무리]</p>

【주의사항】
- 의료·법률·재정 결정에 대한 확실한 보장은 절대 하지 마세요
- 불안감을 조성하는 표현은 피하세요
- 항상 "참고·오락 목적"임을 자연스럽게 유지하세요
- 마크다운(**, ##) 대신 반드시 HTML 태그를 사용하세요
- 응답은 500~800자 내외로 적절히 유지하세요`;
}

// ===== 대화 히스토리 (연속 대화 지원) =====
let conversationHistory = [];

function resetConversation() {
  conversationHistory = [];
}

function addToHistory(role, text) {
  conversationHistory.push({ role, parts: [{ text }] });
  // 최대 10턴(20개 메시지)만 유지
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(conversationHistory.length - 20);
  }
}

// ===== Gemini 스트리밍 API 호출 =====
async function callGeminiStream(category, userMessage, onChunk, onDone, onError) {
  const key = getGeminiKey();
  if (!key) {
    onError('API 키가 설정되지 않았습니다. 관리자 페이지에서 Gemini API 키를 입력해주세요.');
    return;
  }

  // 대화 히스토리에 사용자 메시지 추가
  addToHistory('user', userMessage);

  const systemPrompt = buildSystemPrompt(category);

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.85,
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

  try {
    const res = await fetch(GEMINI_API_URL(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `HTTP ${res.status}`;
      if (res.status === 400) onError(`API 요청 오류: ${errMsg}`);
      else if (res.status === 403) onError('API 키가 유효하지 않습니다. 관리자 페이지에서 키를 확인해주세요.');
      else if (res.status === 429) onError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      else onError(`Gemini 오류: ${errMsg}`);
      return;
    }

    // SSE 스트리밍 읽기
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText  = '';
    let buffer    = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 마지막 불완전 줄 보관

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const chunk  = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunk) {
            fullText += chunk;
            onChunk(fullText);
          }
        } catch (_) {
          // JSON 파싱 실패 무시
        }
      }
    }

    // 응답을 히스토리에 추가
    if (fullText) {
      addToHistory('model', fullText);
      onDone(fullText);
    } else {
      onError('응답을 받지 못했습니다. 다시 시도해주세요.');
    }

  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error('Gemini API Error:', err);
    onError(`네트워크 오류가 발생했습니다: ${err.message}`);
  }
}

// ===== 마크다운 → HTML 변환 (Gemini가 마크다운으로 응답할 경우 대비) =====
function convertMarkdownToHtml(text) {
  return text
    // 코드블록 제거
    .replace(/```[\s\S]*?```/g, '')
    // **bold**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // *italic*
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // ### 헤딩 → h4
    .replace(/^###\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^##\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^#\s+(.+)$/gm, '<h4>$1</h4>')
    // - 항목 → li (연속된 것은 ul로 감싸기)
    .replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, (m) => `<ul>${m}</ul>`)
    // 줄바꿈
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

// ===== API 연결 테스트 =====
async function testGeminiConnection() {
  const key = getGeminiKey();
  if (!key) return { ok: false, msg: 'API 키가 없습니다' };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: '안녕하세요. 테스트입니다.' }] }],
          generationConfig: { maxOutputTokens: 50 }
        })
      }
    );
    if (res.ok) {
      return { ok: true, msg: `✅ 연결 성공! 모델: ${GEMINI_MODEL}` };
    } else {
      const d = await res.json().catch(() => ({}));
      return { ok: false, msg: `❌ ${d?.error?.message || 'HTTP ' + res.status}` };
    }
  } catch (e) {
    return { ok: false, msg: `❌ 네트워크 오류: ${e.message}` };
  }
}
