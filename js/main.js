/* =========================================
   운세ON — js/main.js
   메인 랜딩 페이지 인터랙션
   ========================================= */

// ===== 데이터 =====
const SAJU_DATA = {
  categories: [
    { id: 'love_1',  tab: 'love', icon: '💕', name: '연애운',        pt: '200P~', hook: '그 사람 마음이 궁금해요' },
    { id: 'love_2',  tab: 'love', icon: '🔮', name: '궁합 상담',     pt: '200P~', hook: '우리 잘 맞는 인연?' },
    { id: 'love_3',  tab: 'love', icon: '💌', name: '썸·재회',       pt: '200P~', hook: '다시 만날 수 있을까요?' },
    { id: 'love_4',  tab: 'love', icon: '💍', name: '결혼운',        pt: '200P~', hook: '결혼 시기가 언제일까요?' },
    { id: 'love_5',  tab: 'love', icon: '👫', name: '배우자복',      pt: '200P~', hook: '나의 배우자는 어떤 사람?' },
    { id: 'love_6',  tab: 'love', icon: '🤝', name: '인간관계 갈등', pt: '200P~', hook: '이 관계, 어떻게 풀까요?' },
    { id: 'love_7',  tab: 'love', icon: '👨‍👩‍👧', name: '가족운·자녀운', pt: '200P~', hook: '가족 사이의 운세는?' },
    { id: 'love_8',  tab: 'love', icon: '💑', name: '소개팅 흐름',   pt: '200P~', hook: '첫 만남이 이어질까요?' },
    { id: 'job_1',   tab: 'job',  icon: '💼', name: '직업 상담',     pt: '200P~', hook: '내 적성에 맞는 직업은?' },
    { id: 'job_2',   tab: 'job',  icon: '📋', name: '취업운',        pt: '200P~', hook: '취업이 잘 될 시기는?' },
    { id: 'job_3',   tab: 'job',  icon: '🔄', name: '이직운',        pt: '200P~', hook: '이직 지금 해도 될까요?' },
    { id: 'job_4',   tab: 'job',  icon: '⬆️', name: '승진운',        pt: '200P~', hook: '승진 가능성이 있을까요?' },
    { id: 'job_5',   tab: 'job',  icon: '🎯', name: '직무 적성',     pt: '200P~', hook: '이 일이 나에게 맞나요?' },
    { id: 'job_6',   tab: 'job',  icon: '📚', name: '시험운·합격운', pt: '200P~', hook: '이번 시험 합격할까요?' },
    { id: 'job_7',   tab: 'job',  icon: '💻', name: '프리랜서 운',   pt: '200P~', hook: '독립하면 잘 될까요?' },
    { id: 'biz_1',   tab: 'biz',  icon: '📈', name: '사업운재물운',   pt: '300P~', hook: '올해 사업 어떻게 될까요?' },
    { id: 'biz_2',   tab: 'biz',  icon: '💰', name: '재물운',        pt: '300P~', hook: '올해 돈 잘 벌 수 있을까요?' },
    { id: 'biz_3',   tab: 'biz',  icon: '🏪', name: '개업시기',      pt: '300P~', hook: '개업 날짜 이때가 맞나요?' },
    { id: 'biz_3b',  tab: 'biz',  icon: '🏪', name: '개업상담',      pt: '300P~', hook: '개업 종합 전략을 세우고 싶어요' },
    { id: 'biz_4',   tab: 'biz',  icon: '🤝', name: '동업궁합',      pt: '300P~', hook: '이 사람과 동업해도 될까요?' },
    { id: 'biz_5',   tab: 'biz',  icon: '🏷️', name: '상호명상담',    pt: '300P~', hook: '이 상호명이 운에 좋을까요?' },
    { id: 'biz_5b',  tab: 'biz',  icon: '🏷️', name: '상호브랜드네이밍', pt: '300P~', hook: '브랜드명 사주로 검증해주세요' },
    { id: 'biz_6',   tab: 'biz',  icon: '🔎', name: '업종추천',      pt: '300P~', hook: '나에게 맞는 업종은?' },
    { id: 'name_1',  tab: 'name', icon: '👶', name: '아이 이름짓기', pt: '300P~', hook: '사주에 맞는 이름 추천해요' },
    { id: 'name_2',  tab: 'name', icon: '🔤', name: '개명 상담',     pt: '300P~', hook: '이 이름이 내 운을 막나요?' },
    { id: 'name_3',  tab: 'name', icon: '✨', name: '사주 보완 이름', pt: '300P~', hook: '사주의 약점을 이름으로 보완' },
    { id: 'name_4',  tab: 'name', icon: '🏷️', name: '브랜드 네이밍', pt: '300P~', hook: '브랜드명 사주 감수' },
    { id: 'life_1',  tab: 'life', icon: '🏠', name: '이사운',        pt: '200P~', hook: '이사 시기 지금이 맞나요?' },
    { id: 'life_2',  tab: 'life', icon: '🏡', name: '집터운',        pt: '200P~', hook: '이 집터 운이 어떤가요?' },
    { id: 'life_3',  tab: 'life', icon: '📝', name: '계약시기',      pt: '200P~', hook: '계약하기 좋은 날은?' },
    { id: 'life_4',  tab: 'life', icon: '✈️', name: '여행운',        pt: '100P~', hook: '여행 다녀와도 괜찮을까요?' },
    { id: 'life_5',  tab: 'life', icon: '⚠️', name: '조심할달',     pt: '200P~', hook: '올해 조심해야 할 달은?' },
    { id: 'life_6',  tab: 'life', icon: '🌟', name: '기회가오는달',  pt: '200P~', hook: '올해 기회가 오는 달은?' },
    { id: 'all_1',   tab: 'all',  icon: '🃏', name: '타로 상담',     pt: '100P~', hook: '카드가 뭐라고 하나요?',    link: 'tarot.html' },
    { id: 'all_2',   tab: 'all',  icon: '🌟', name: '점성술 상담',   pt: '무료~', hook: '별자리가 말하는 내 운명',   link: 'astrology.html' },
    { id: 'all_3',   tab: 'all',  icon: '🔥', name: '2026 병오년',   pt: '200P~', hook: '병오년 내 한 해 운세' },
    { id: 'all_4',   tab: 'all',  icon: '📅', name: '종합 운세',     pt: '300P~', hook: '올해 전체 운세 분석' },
    { id: 'tarot_1', tab: 'tarot',icon: '🃏', name: '타로 원카드',   pt: '100P~', hook: '지금 이 순간 한 장의 카드',  link: 'tarot.html' },
    { id: 'tarot_2', tab: 'tarot',icon: '🔮', name: '타로 쓰리카드', pt: '100P~', hook: '과거·현재·미래 3장 카드',   link: 'tarot.html' },
    { id: 'tarot_3', tab: 'tarot',icon: '💕', name: '관계 스프레드', pt: '100P~', hook: '두 사람의 마음을 카드로',     link: 'tarot.html' },
    { id: 'tarot_4', tab: 'tarot',icon: '💼', name: '직업재물 스프레드', pt: '100P~', hook: '커리어·재물 5장 카드', link: 'tarot.html' },
    { id: 'tarot_5', tab: 'tarot',icon: '✨', name: '켈틱 크로스',   pt: '100P~', hook: '10장 풀 스프레드 심층분석', link: 'tarot.html' },
    { id: 'astro_1', tab: 'astro',icon: '☀️', name: '출생 차트',     pt: '100P~', hook: '태양궁·달·어센던트 완전분석', link: 'astrology.html' },
    { id: 'astro_2', tab: 'astro',icon: '💕', name: '별자리 궁합',   pt: '무료',  hook: '12×12 궁합 매트릭스',       link: 'astrology.html' },
    { id: 'astro_3', tab: 'astro',icon: '📅', name: '월별 운세',     pt: '무료',  hook: '2026년 12개월 운세',         link: 'astrology.html' },
    { id: 'astro_4', tab: 'astro',icon: '🔮', name: '오늘의 별자리', pt: '무료',  hook: '오늘 내 별자리 운세',         link: 'astrology.html' },
    { id: 'astro_5', tab: 'astro',icon: '🪐', name: '행성 위치 분석', pt: '100P~', hook: '9개 행성·12하우스 분석',     link: 'astrology.html' },
    { id: 'cal_1',   tab: 'cal',  icon: '📅', name: '월별운세',      pt: '200P~', hook: '이달 연애·재물·직업·건강 분석', link: 'fortune.html?tab=monthly' },
    { id: 'cal_2',   tab: 'cal',  icon: '🌟', name: '년운세',        pt: '300P~', hook: '올해 나의 전체 운세 흐름',    link: 'fortune.html?tab=yearly' },
    { id: 'cal_3',   tab: 'cal',  icon: '🔭', name: '10년대운',      pt: '400P~', hook: '향후 10년 대운 흐름 분석',   link: 'fortune.html?tab=decade' },
    { id: 'cal_4',   tab: 'cal',  icon: '♾️', name: '평생운세',      pt: '500P~', hook: '내 인생 전체의 운세 지도',    link: 'fortune.html?tab=lifetime' },
  ],

  reviews: [
    { stars: 5, text: '재회 상담했는데 딱 한 달 뒤에 정말 연락 왔어요. 소름이 돋았습니다. 이제 운세ON 없이는 못 살 것 같아요.', name: '김지현', cat: '연애운 상담', color: '#e91e8c' },
    { stars: 5, text: '이직 고민이 있었는데 타이밍을 정확하게 짚어줬어요. 말씀하신 달에 이직했더니 정말 잘 됐습니다!', name: '이민준', cat: '직업 상담', color: '#1565c0' },
    { stars: 5, text: '아이 이름을 상담받았는데 여러 후보를 비교 분석해서 최적 이름을 찾아줬어요. 정성이 느껴졌습니다.', name: '박서연', cat: '이름짓기 상담', color: '#2c5f4f' },
    { stars: 5, text: '개업 날짜 상담했어요. 처음에는 반신반의했는데 운세ON이 추천한 날 개업하고 나서 정말 잘 풀렸습니다.', name: '최동현', cat: '개업 상담', color: '#d4af37' },
    { stars: 5, text: '궁합 상담이 이렇게 디테일할 줄 몰랐어요. 두 사람의 관계를 정말 깊게 분석해줘서 많은 도움이 됐어요.', name: '정하은', cat: '궁합 상담', color: '#9c27b0' },
    { stars: 4, text: '사업운 분석을 받았는데 올해 피해야 할 달과 공략해야 할 달을 구체적으로 알려줘서 계획 세우기 좋았어요.', name: '강태웅', cat: '사업운 상담', color: '#f57c00' },
  ],

  faqs: [
    { q: '운세ON은 어떤 서비스인가요?', a: '운세ON은 AI 기반 대화형 운세 상담 플랫폼입니다. 사주, 타로, 궁합, 이름짓기, 사업운, 직업 등 30가지 이상의 분야에서 질문하면 즉시 AI가 분석·해석해드립니다.' },
    { q: '포인트 충전은 어떻게 하나요?', a: '상단의 "충전하기" 버튼을 클릭하거나 요금 충전 페이지에서 원하는 금액을 선택해 충전하실 수 있습니다. 1만원/2만원/3만원 충전 시 각각 10,000P/22,000P/36,000P가 지급됩니다.' },
    { q: '질문당 차감되는 포인트는 얼마인가요?', a: '상담 유형에 따라 100P~300P가 차감됩니다. 타로·여행운 등 간단한 상담은 100P, 연애운·궁합·직업상담은 200P, 사업운·이름짓기·개명 등 심화 상담은 300P가 차감됩니다.' },
    { q: '신규 가입 시 무료 포인트가 있나요?', a: '네! 처음 이용하시는 분께 500P를 무료로 드립니다. 별도 결제 없이 바로 상담을 시작해보실 수 있습니다.' },
    { q: '상담 결과를 저장할 수 있나요?', a: '채팅 상담 내용은 해당 브라우저 세션 동안 유지됩니다. 중요한 상담 내용은 직접 복사·저장하시길 권장드립니다.' },
  ],
};

// 카테고리 클릭 시 링크 처리
function goCatItem(name, link) {
  if (link) {
    window.location.href = link;
  } else {
    goChatCategory(name);
  }
}

// ===== 포인트 관리 =====
function getPoints() {
  let p = parseInt(localStorage.getItem('sajuon_points') || '0', 10);
  if (isNaN(p)) p = 0;
  return p;
}
function initPoints() {
  // ★ 로그인 유저가 있으면 절대 초기화하지 않음 (레이스 컨디션 방지)
  try {
    const currentUser = JSON.parse(localStorage.getItem('sajuon_current_user') || 'null');
    if (currentUser && currentUser.id) {
      // 로그인 상태: 계정 포인트를 sajuon_points에 동기화
      const userPts = parseInt(currentUser.points || '0', 10);
      localStorage.setItem('sajuon_points', String(userPts));
      localStorage.setItem('sajuon_initialized', 'true');
      return;
    }
  } catch(e) {}
  // 비로그인 최초 방문만 500P 무료 지급
  if (!localStorage.getItem('sajuon_initialized')) {
    localStorage.setItem('sajuon_points', '500');
    localStorage.setItem('sajuon_initialized', 'true');
  }
}
function updateHeaderPoints() {
  const el = document.getElementById('headerPointVal');
  if (el) el.textContent = getPoints().toLocaleString();
}

// ===== 헤더 스크롤 =====
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ===== 모바일 메뉴 =====
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
    }
  });
}

// ===== 히어로 입력창 =====
function goChat() {
  const val = document.getElementById('heroInput')?.value.trim();
  if (val) {
    sessionStorage.setItem('sajuon_hero_q', val);
  }
  window.location.href = 'chat.html';
}
function setChip(text) {
  const input = document.getElementById('heroInput');
  if (input) {
    input.value = text;
    input.focus();
  }
}
function initHeroInput() {
  const input = document.getElementById('heroInput');
  if (!input) return;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') goChat();
  });
}

// ===== 카테고리 탭 =====
function initCatTabs() {
  const tabs = document.querySelectorAll('.cat-tab');
  const grid = document.getElementById('catGrid');
  if (!tabs.length || !grid) return;

  function render(tab) {
    const list = tab === 'all'
      ? SAJU_DATA.categories
      : SAJU_DATA.categories.filter(c => c.tab === tab || (tab === 'all' && true));
    // 카테고리 표시명 매핑 (CAT_CONFIG key → 사람이 읽기 좋은 이름)
    const CAT_DISPLAY = {
      '사업운재물운':'사업운·재물운','개업시기':'개업 시기','개업상담':'개업 상담',
      '동업궁합':'동업 궁합','상호명상담':'상호명 상담','상호브랜드네이밍':'상호·브랜드 네이밍',
      '업종추천':'업종 추천','계약시기':'계약 시기','조심할달':'조심할 달',
      '기회가오는달':'기회가 오는 달','직무적성':'직무 적성','시험운합격운':'시험운·합격운',
      '프리랜서운':'프리랜서 운','가족운자녀운':'가족운·자녀운','인간관계갈등':'인간관계 갈등',
      '소개팅흐름':'소개팅 흐름','배우자복':'배우자복','결혼운':'결혼운','썸재회':'썸·재회',
      '아이이름짓기':'아이 이름짓기','개명상담':'개명 상담','사주보완이름':'사주 보완 이름',
      '브랜드네이밍':'브랜드 네이밍','이사운':'이사운','집터운':'집터운','여행운':'여행운',
      '타로상담':'타로 상담','점성술상담':'점성술 상담','2026병오년운세':'2026 병오년',
      '종합운세상담':'종합 운세','재물운':'재물운','취업운':'취업운','이직운':'이직운','승진운':'승진운',
      '월별운세':'월별 운세','년운세':'년 운세','10년대운':'10년 대운','평생운세':'평생 운세',
    };
    grid.innerHTML = list.map(c => `
      <div class="cat-item" onclick="goCatItem('${c.name}', '${c.link||''}')">
        <div class="cat-item-icon">${c.icon}</div>
        <div class="cat-item-name">${CAT_DISPLAY[c.name] || c.name}</div>
        <div class="cat-item-pt" style="${c.link ? 'color:#764ba2;font-weight:700' : ''}">${c.pt}</div>
      </div>
    `).join('');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      render(tab.dataset.tab);
    });
  });

  render('all');
}

// ===== 후기 렌더링 =====
function renderReviews() {
  const grid = document.getElementById('reviewGrid');
  if (!grid) return;
  // 관리자 데이터 우선, 없으면 기본 데이터
  let reviews;
  try {
    const saved = localStorage.getItem('sajuon_reviews');
    reviews = saved ? JSON.parse(saved) : SAJU_DATA.reviews;
  } catch { reviews = SAJU_DATA.reviews; }

  grid.innerHTML = reviews.slice(0, 6).map(r => `
    <div class="review-card">
      <div class="review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <div class="review-avatar" style="background:${r.color || '#2c5f4f'}">${r.name[0]}</div>
        <div>
          <div class="review-name">${r.name}</div>
          <div class="review-cat">${r.cat}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== FAQ 렌더링 =====
function renderFAQ() {
  const list = document.getElementById('faqList');
  if (!list) return;
  let faqs;
  try {
    const saved = localStorage.getItem('sajuon_faqs');
    faqs = saved ? JSON.parse(saved) : SAJU_DATA.faqs;
  } catch { faqs = SAJU_DATA.faqs; }

  list.innerHTML = faqs.map((f, i) => `
    <div class="faq-item" id="faq-${i}">
      <div class="faq-q" onclick="toggleFAQ(${i})">
        <span>${f.q}</span>
        <i class="fas fa-chevron-down"></i>
      </div>
      <div class="faq-a">
        <div class="faq-a-inner">${f.a}</div>
      </div>
    </div>
  `).join('');
}

function toggleFAQ(i) {
  const item = document.getElementById('faq-' + i);
  if (!item) return;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ===== 채팅으로 이동 =====
function goChatCategory(cat) {
  sessionStorage.setItem('sajuon_category', cat);
  window.location.href = 'chat.html';
}

// ===== 초기화 =====
// ★ 각 페이지 인라인 스크립트 또는 chat.js가 직접 제어
// main.js는 함수 정의만 담당 — 자동 DOMContentLoaded 실행 없음
// (pricing.html, terms.html 등 단순 페이지에서만 아래 코드가 동작)
(function() {
  var p = location.pathname;
  // index.html, chat.html — 해당 페이지 전용 인라인 스크립트가 초기화를 담당
  var skipPages = ['/', '/index.html', '/chat.html'];
  var skip = skipPages.some(function(s) { return p === s || p.endsWith(s); });
  if (skip) return;

  // pricing.html, terms.html 등 기타 페이지 — 단 1회만 초기화
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof initPoints === 'function') initPoints();
    if (typeof updateHeaderPoints === 'function') updateHeaderPoints();
    if (typeof initAuthHeader === 'function') initAuthHeader();
    if (typeof initHeader === 'function') initHeader();
    if (typeof initHamburger === 'function') initHamburger();
  });
})();
