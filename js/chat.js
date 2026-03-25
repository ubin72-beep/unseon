/* =========================================
   운세ON — js/chat.js
   AI 채팅 상담 기능
   ========================================= */

// ===== 카테고리별 설정 =====
const CAT_CONFIG = {
  '종합운세상담':      { icon: '🔮', cost: 300, persona: '종합 사주 분석가' },
  '연애운':            { icon: '💕', cost: 200, persona: '연애운 전문 상담사' },
  '궁합상담':          { icon: '💞', cost: 200, persona: '궁합 전문 분석가' },
  '썸재회':            { icon: '💌', cost: 200, persona: '재회·썸 전문 상담사' },
  '결혼운':            { icon: '💍', cost: 200, persona: '결혼운 분석가' },
  '배우자복':          { icon: '👫', cost: 200, persona: '인연·배우자 전문가' },
  '인간관계갈등':      { icon: '🤝', cost: 200, persona: '인간관계 상담사' },
  '가족운자녀운':      { icon: '👨‍👩‍👧', cost: 200, persona: '가족운 전문가' },
  '소개팅흐름':        { icon: '💑', cost: 200, persona: '만남·소개팅 전문가' },
  '직업상담':          { icon: '💼', cost: 200, persona: '직업운 전문 상담사' },
  '취업운':            { icon: '📋', cost: 200, persona: '취업운 전문가' },
  '이직운':            { icon: '🔄', cost: 200, persona: '이직운 분석가' },
  '승진운':            { icon: '⬆️', cost: 200, persona: '승진·조직운 전문가' },
  '직무적성':          { icon: '🎯', cost: 200, persona: '적성 전문 분석가' },
  '시험운합격운':      { icon: '📚', cost: 200, persona: '시험·합격운 전문가' },
  '프리랜서운':        { icon: '💻', cost: 200, persona: '독립·프리랜서 전문가' },
  '사업운재물운':      { icon: '📈', cost: 300, persona: '사업·재물운 전문 분석가' },
  '재물운':            { icon: '💰', cost: 300, persona: '재물운 전문 분석가' },
  '개업시기':          { icon: '🏪', cost: 300, persona: '개업 날짜 전문가' },
  '개업상담':          { icon: '🏪', cost: 300, persona: '개업 전문 상담사' },
  '동업궁합':          { icon: '🤝', cost: 300, persona: '동업 궁합 전문가' },
  '상호명상담':        { icon: '🏷️', cost: 300, persona: '상호·네이밍 전문가' },
  '상호브랜드네이밍':  { icon: '🏷️', cost: 300, persona: '브랜드 네이밍 전문가' },
  '업종추천':          { icon: '🔎', cost: 300, persona: '업종 적성 분석가' },
  '아이이름짓기':      { icon: '👶', cost: 300, persona: '이름 전문 작명가' },
  '개명상담':          { icon: '🔤', cost: 300, persona: '개명 전문 작명가' },
  '사주보완이름':      { icon: '✨', cost: 300, persona: '사주 보완형 작명가' },
  '브랜드네이밍':      { icon: '🏷️', cost: 300, persona: '브랜드 네이밍 전문가' },
  '이사운':            { icon: '🏠', cost: 200, persona: '이사운 전문가' },
  '집터운':            { icon: '🏡', cost: 200, persona: '집터·풍수 전문가' },
  '계약시기':          { icon: '📝', cost: 200, persona: '계약 시기 전문가' },
  '여행운':            { icon: '✈️', cost: 100, persona: '여행운 전문가' },
  '조심할달':          { icon: '⚠️', cost: 200, persona: '월별 운세 전문가' },
  '기회가오는달':      { icon: '🌟', cost: 200, persona: '기회 흐름 전문가' },
  '타로상담':          { icon: '🃏', cost: 100, persona: '타로 전문 리더' },
  '점성술상담':        { icon: '🌙', cost: 200, persona: '점성술 전문가' },
  '2026병오년운세':    { icon: '🔥', cost: 200, persona: '2026 병오년 전문가' },
};

const DEFAULT_CAT = '종합운세상담';

// ===== AI 응답 생성 =====
const AI_RESPONSES = {
  '연애운': [
    (q) => `<h4>💕 연애운 분석 결과</h4>
<p>사주를 통해 현재의 연애 흐름을 살펴보겠습니다.</p>
<p>지금 이 시기는 <span class="highlight">감정의 흐름이 활발하게 움직이는 시기</span>입니다. 상대방과의 인연은 끊어진 것이 아니라 잠시 정체된 상태로 볼 수 있습니다.</p>
<ul>
<li>현재 인연의 흐름: 상대방도 당신을 의식하고 있을 가능성이 높습니다</li>
<li>접근 최적 시기: 이달 중순 ~ 다음 달 초가 가장 유리한 시기입니다</li>
<li>주의할 점: 너무 급하게 결론을 내려 하지 말고 자연스럽게 흘려보내는 것이 좋습니다</li>
</ul>
<p>추가로 상대방의 생년월일을 알려주시면 더 정확한 궁합 분석이 가능합니다. 💕</p>`,
  ],
  '사업운재물운': [
    (q) => `<h4>💰 사업운 · 재물운 분석</h4>
<p>2026년 병오년의 사업·재물 흐름을 분석해드리겠습니다.</p>
<p>올해는 <span class="highlight">변화와 도전의 에너지가 강한 해</span>입니다. 새로운 시작이나 확장에 좋은 기운이 흐릅니다.</p>
<ul>
<li>재물 흐름 최고점: 3~5월, 9~10월</li>
<li>주의 시기: 7월 ~ 8월은 큰 투자나 계약은 잠시 보류하는 것이 좋습니다</li>
<li>개업 추천 시기: 3월 말 ~ 4월 초, 혹은 10월 중순</li>
<li>동업 관련: 파트너의 사주를 함께 분석하는 것을 권장드립니다</li>
</ul>
<p>구체적인 사업 분야나 생년월일을 알려주시면 더 정밀한 분석이 가능합니다. 📈</p>`,
  ],
  '직업상담': [
    (q) => `<h4>💼 직업운 분석 결과</h4>
<p>직업과 커리어의 흐름을 사주로 살펴보겠습니다.</p>
<p>현재 당신의 사주 흐름은 <span class="highlight">새로운 도약을 준비하는 시기</span>로 읽힙니다. 지금의 불안감은 도약 직전의 자연스러운 신호입니다.</p>
<ul>
<li>이직·전직 최적 시기: 봄(3~4월)과 가을(9~10월)이 유리합니다</li>
<li>직무 적성: 창의성과 커뮤니케이션이 요구되는 분야에서 강점을 발휘합니다</li>
<li>시험·자격증 운: 상반기가 하반기보다 합격 가능성이 높습니다</li>
</ul>
<p>생년월일을 알려주시면 더 구체적인 직업 적성 분석을 해드릴 수 있습니다. 🎯</p>`,
  ],
  '아이이름짓기': [
    (q) => `<h4>✍️ 이름 분석 · 추천</h4>
<p>아이의 사주와 조화를 이루는 이름을 찾아드리겠습니다.</p>
<p>좋은 이름은 단순히 예쁜 것을 넘어 <span class="highlight">사주의 부족한 오행을 채워주는 역할</span>을 합니다.</p>
<ul>
<li>이름 선택 기준: 오행 균형, 발음 흐름, 획수 조화를 종합적으로 검토합니다</li>
<li>피해야 할 글자: 사주에 따라 특정 오행이 과다할 경우 해당 기운을 더하는 글자는 피합니다</li>
<li>추천 방향: 부드러우면서도 강한 의지가 담긴 이름이 이 아이의 사주와 잘 맞습니다</li>
</ul>
<p>아이의 생년월일시를 알려주시면 구체적인 이름 후보를 분석해드리겠습니다. 👶</p>`,
  ],
  'default': [
    (q) => `<h4>🔮 사주 분석 결과</h4>
<p>질문해 주신 내용을 바탕으로 운세를 살펴보겠습니다.</p>
<p>현재의 흐름은 <span class="highlight">새로운 변화를 앞두고 있는 전환점</span>으로 읽힙니다. 지금 느끼는 불안과 기대는 모두 자연스러운 신호입니다.</p>
<ul>
<li>현재 운의 흐름: 상승 기운이 감지되며 긍정적인 변화가 예상됩니다</li>
<li>행운의 시기: 이달 하순부터 다음 달이 가장 좋은 시기입니다</li>
<li>주의할 점: 중요한 결정은 충분히 생각하고 신중하게 내리는 것이 좋습니다</li>
<li>2026 병오년 조언: 에너지를 분산시키지 말고 하나에 집중하세요</li>
</ul>
<p>더 정확한 분석을 원하시면 생년월일시를 알려주시거나 더 구체적인 질문을 해주세요. 🌟</p>`,
  ]
};

function getAIResponse(category, question) {
  const key = category.replace(/[\s·]/g, '');
  const responses = AI_RESPONSES[key] || AI_RESPONSES['default'];
  const fn = responses[Math.floor(Math.random() * responses.length)];
  return fn(question);
}

// ===== 상태 =====
let currentCat = DEFAULT_CAT;
let currentCatConfig = CAT_CONFIG[DEFAULT_CAT];
let isTyping = false;

// ===== 초기화 =====
function chatInit() {
  // 헤더 포인트
  updateHeaderPoints();

  // 카테고리 파라미터 처리
  const fromSession = sessionStorage.getItem('sajuon_category');
  const fromHeroQ   = sessionStorage.getItem('sajuon_hero_q');
  if (fromSession) {
    const key = fromSession.replace(/[\s·]/g, '');
    if (CAT_CONFIG[key]) {
      currentCat = key;
      currentCatConfig = CAT_CONFIG[key];
    } else {
      // 부분 매칭
      const found = Object.keys(CAT_CONFIG).find(k => k.includes(fromSession.replace(/\s/g, '').slice(0, 4)));
      if (found) { currentCat = found; currentCatConfig = CAT_CONFIG[found]; }
    }
    sessionStorage.removeItem('sajuon_category');
  }

  // 사이드바 렌더링
  renderSidebar();

  // 상단바 업데이트
  updateTopbar();

  // 포인트 정보 업데이트
  updatePointInfo();

  // 환영 메시지
  renderWelcome();

  // 히어로 질문 자동 입력
  if (fromHeroQ) {
    const ta = document.getElementById('chatInput');
    if (ta) ta.value = fromHeroQ;
    sessionStorage.removeItem('sajuon_hero_q');
  }

  // 이벤트
  initChatEvents();
}

function renderSidebar() {
  const inner = document.getElementById('sidebarInner');
  if (!inner) return;

  const groups = [
    { label: '인기 상담', keys: ['연애운', '궁합상담', '사업운재물운', '직업상담'] },
    { label: '연애·인간관계', keys: ['연애운', '궁합상담', '썸재회', '결혼운', '배우자복', '소개팅흐름', '인간관계갈등', '가족운자녀운'] },
    { label: '직업·취업', keys: ['직업상담', '취업운', '이직운', '승진운', '직무적성', '시험운합격운', '프리랜서운'] },
    { label: '사업·재물', keys: ['사업운재물운', '재물운', '개업시기', '동업궁합', '상호명상담', '업종추천'] },
    { label: '이름·작명', keys: ['아이이름짓기', '개명상담', '사주보완이름', '브랜드네이밍'] },
    { label: '라이프', keys: ['이사운', '집터운', '계약시기', '여행운', '조심할달', '기회가오는달'] },
    { label: '운세·타로', keys: ['타로상담', '점성술상담', '2026병오년운세', '종합운세상담'] },
  ];

  inner.innerHTML = groups.map(g => {
    const items = g.keys.map(k => {
      const c = CAT_CONFIG[k];
      if (!c) return '';
      return `<div class="sidebar-item${currentCat === k ? ' active' : ''}" onclick="selectCategory('${k}')">
        <span class="sidebar-item-icon">${c.icon}</span>
        <span class="sidebar-item-name">${k.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span class="sidebar-item-pt">${c.cost}P</span>
      </div>`;
    }).join('');
    return `<div class="sidebar-group-title">${g.label}</div>${items}`;
  }).join('');

  // 사이드바 이름 표시 수정 (한글명 사용)
  const CAT_KR = {
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

  // 사이드바 아이템 이름 재적용
  inner.querySelectorAll('.sidebar-item').forEach(el => {
    const key = el.getAttribute('onclick').replace(/selectCategory\('(.+)'\)/, '$1');
    const nameEl = el.querySelector('.sidebar-item-name');
    if (nameEl && CAT_KR[key]) nameEl.textContent = CAT_KR[key];
  });
}

const CAT_KR_MAP = {
  '연애운':'연애운','궁합상담':'궁합 상담','사업운재물운':'사업운·재물운','직업상담':'직업 상담',
  '썸재회':'썸·재회','결혼운':'결혼운','배우자복':'배우자복','소개팅흐름':'소개팅 흐름',
  '인관계갈등':'인간관계 갈등','가족운자녀운':'가족운·자녀운','취업운':'취업운',
  '이직운':'이직운','승진운':'승진운','직무적성':'직무 적성','시험운합격운':'시험운·합격운',
  '프리랜서운':'프리랜서 운','재물운':'재물운','개업시기':'개업 시기','개업상담':'개업 상담',
  '동업궁합':'동업 궁합','상호명상담':'상호명 상담','상호브랜드네이밍':'상호·브랜드 네이밍',
  '업종추천':'업종 추천','아이이름짓기':'아이 이름짓기','개명상담':'개명 상담',
  '사주보완이름':'사주 보완 이름','브랜드네이밍':'브랜드 네이밍','이사운':'이사운',
  '집터운':'집터운','계약시기':'계약 시기','여행운':'여행운','조심할달':'조심할 달',
  '기회가오는달':'기회가 오는 달','타로상담':'타로 상담','점성술상담':'점성술 상담',
  '2026병오년운세':'2026 병오년 운세','종합운세상담':'종합 운세 상담',
  '인간관계갈등':'인간관계 갈등',
};

function updateTopbar() {
  const iconEl = document.getElementById('catIconSm');
  const nameEl = document.getElementById('catNameLabel');
  if (iconEl) iconEl.textContent = currentCatConfig?.icon || '🔮';
  if (nameEl) nameEl.textContent = CAT_KR_MAP[currentCat] || currentCat;

  // 사이드바 active 업데이트
  document.querySelectorAll('.sidebar-item').forEach(el => {
    const key = el.getAttribute('onclick').replace(/selectCategory\('(.+)'\)/, '$1');
    el.classList.toggle('active', key === currentCat);
  });
}

function updatePointInfo() {
  const pts = getPoints();
  const costEl = document.getElementById('chatCostVal');
  const ptEl   = document.getElementById('chatPointVal');
  if (costEl) costEl.textContent = currentCatConfig?.cost || 200;
  if (ptEl)   ptEl.textContent   = pts.toLocaleString();
  updateHeaderPoints();
}

function renderWelcome() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const catName = CAT_KR_MAP[currentCat] || currentCat;
  const examples = getExamples(currentCat);
  msgs.innerHTML = `
    <div class="chat-welcome">
      <div class="welcome-icon">${currentCatConfig?.icon || '🔮'}</div>
      <h2 class="welcome-title">운세ON ${catName} 상담</h2>
      <p class="welcome-sub">
        궁금한 것을 자유롭게 질문해주세요.<br/>
        생년월일시를 함께 알려주시면 더 정확한 분석이 가능합니다.<br/>
        <strong>상담 1건 ${currentCatConfig?.cost || 200}P 차감</strong>
      </p>
      <div class="welcome-examples">
        ${examples.map(ex => `<button class="welcome-example-btn" onclick="setExample('${ex.replace(/'/g,'&#39;')}')">${ex}</button>`).join('')}
      </div>
    </div>
  `;
}

function getExamples(cat) {
  const map = {
    '연애운': ['그 사람이 저를 좋아하는 건지 궁금해요', '재회 가능성이 있을까요?', '언제쯤 새로운 인연이 생길까요?'],
    '궁합상담': ['저와 상대방의 궁합을 봐주세요', '결혼 상대로 잘 맞을까요?', '동업을 하려는데 이 분과 궁합이 어떤가요?'],
    '사업운재물운': ['올해 사업을 시작해도 좋을까요?', '지금 투자해도 괜찮을까요?', '올해 재물운이 어떤가요?'],
    '직업상담': ['이직을 고민 중인데 지금이 좋은 시기인가요?', '제 직무 적성이 궁금합니다', '승진 가능성이 있을까요?'],
    '아이이름짓기': ['사주에 맞는 아이 이름을 추천해주세요', '이름의 획수도 함께 분석해주세요', '남자/여자 이름 후보를 알려주세요'],
    '개명상담': ['현재 이름이 사주와 맞지 않는 것 같아요', '개명하면 운이 바뀔까요?', '어떤 이름이 좋을까요?'],
    '타로상담': ['현재 상황에 대한 타로 한 장 뽑아주세요', '이 결정, 어떻게 생각하세요?', '지금 이 관계의 흐름은?'],
    '2026병오년운세': ['2026년 전체 운세가 궁금합니다', '올해 조심해야 할 달은 언제인가요?', '올해 가장 좋은 달은 언제인가요?'],
    'default': ['지금 상황에 대해 분석해주세요', '올해 운세가 궁금합니다', '제 생년월일로 사주를 봐주세요'],
  };
  return (map[cat] || map['default']);
}

function setExample(text) {
  const ta = document.getElementById('chatInput');
  if (ta) {
    ta.value = text;
    ta.focus();
    autoResizeTextarea(ta);
  }
}

function selectCategory(key) {
  currentCat = key;
  currentCatConfig = CAT_CONFIG[key] || CAT_CONFIG[DEFAULT_CAT];
  renderSidebar();
  updateTopbar();
  updatePointInfo();
  renderWelcome();

  // 모바일 사이드바 닫기
  document.getElementById('chatSidebar')?.classList.remove('open');
}

// ===== 메시지 전송 =====
function sendMessage() {
  if (isTyping) return;
  const ta = document.getElementById('chatInput');
  const text = ta?.value.trim();
  if (!text) return;

  const pts = getPoints();
  const cost = currentCatConfig?.cost || 200;

  if (pts < cost) {
    showModal(pts, cost);
    return;
  }

  // 포인트 차감
  const newPts = pts - cost;
  localStorage.setItem('sajuon_points', String(newPts));
  updatePointInfo();

  // 이용 내역 저장
  saveHistory(CAT_KR_MAP[currentCat] || currentCat, cost, text);

  // 사용자 메시지
  appendUserMsg(text);
  ta.value = '';
  autoResizeTextarea(ta);

  // 타이핑
  isTyping = true;
  const btn = document.getElementById('chatSendBtn');
  if (btn) btn.disabled = true;

  const typingId = appendTyping();

  const delay = 1200 + Math.random() * 1000;
  setTimeout(() => {
    removeTyping(typingId);
    const resp = getAIResponse(currentCat, text);
    appendAIMsg(resp, cost);
    isTyping = false;
    if (btn) btn.disabled = false;
    updatePointInfo();

    // 포인트 부족 경고
    if (newPts < cost) {
      setTimeout(() => appendSystemMsg(`⚠️ 포인트가 ${newPts}P 남았습니다. <a href="pricing.html" style="color:var(--accent-dark);font-weight:700;">충전하러 가기</a>`), 300);
    }
  }, delay);
}

function appendUserMsg(text) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg-row msg-row--user';
  div.innerHTML = `
    <div class="msg-avatar">나</div>
    <div class="msg-content">
      <div class="msg-meta">
        <span class="msg-name">나</span>
        <span>${getTimeStr()}</span>
      </div>
      <div class="msg-bubble">${escHtml(text)}</div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
}

function appendAIMsg(html, cost) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const catName = CAT_KR_MAP[currentCat] || currentCat;
  const div = document.createElement('div');
  div.className = 'msg-row msg-row--ai';
  div.innerHTML = `
    <div class="msg-avatar">🔮</div>
    <div class="msg-content">
      <div class="msg-meta">
        <span class="msg-name">운세ON · ${catName}</span>
        <span>${getTimeStr()}</span>
        <span class="msg-cost-badge">-${cost}P</span>
      </div>
      <div class="msg-bubble">${html}</div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
}

function appendSystemMsg(html) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.style.cssText = 'text-align:center;font-size:0.82rem;color:var(--text-muted);padding:4px 0';
  div.innerHTML = html;
  msgs.appendChild(div);
  scrollToBottom();
}

function appendTyping() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const id = 'typing_' + Date.now();
  const div = document.createElement('div');
  div.className = 'msg-row msg-row--ai typing-indicator';
  div.id = id;
  div.innerHTML = `
    <div class="msg-avatar">🔮</div>
    <div class="msg-content">
      <div class="msg-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function scrollToBottom() {
  const msgs = document.getElementById('chatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function getTimeStr() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

// ===== 채팅 리셋 =====
function resetChat() {
  renderWelcome();
}

// ===== 모달 =====
function showModal(current, need) {
  document.getElementById('modalCurrentPt').textContent = current.toLocaleString();
  document.getElementById('modalNeedPt').textContent = need;
  document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

// ===== 이벤트 초기화 =====
function initChatEvents() {
  // 텍스트에어리어
  const ta = document.getElementById('chatInput');
  if (ta) {
    ta.addEventListener('input', () => autoResizeTextarea(ta));
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // 모바일 사이드바
  const menuBtn = document.getElementById('chatMenuBtn');
  const sidebar = document.getElementById('chatSidebar');
  const sidebarClose = document.getElementById('sidebarClose');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // 모달 오버레이 클릭
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  // 모바일 메뉴
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

// ===== 이용 내역 저장 =====
function saveHistory(cat, cost, question) {
  try {
    const hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
    hist.unshift({
      date: new Date().toLocaleString('ko-KR'),
      type: `AI 상담 · ${cat}`,
      amount: -cost,
      note: question.slice(0, 30) + (question.length > 30 ? '...' : '')
    });
    if (hist.length > 100) hist.splice(100);
    localStorage.setItem('sajuon_history', JSON.stringify(hist));
  } catch(e) {}
}

// ===== 실행 =====
document.addEventListener('DOMContentLoaded', () => {
  initPoints();
  chatInit();
});
