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
    { id: 'biz_1',   tab: 'biz',  icon: '📈', name: '사업운',        pt: '300P~', hook: '올해 사업 어떻게 될까요?' },
    { id: 'biz_2',   tab: 'biz',  icon: '💰', name: '재물운',        pt: '300P~', hook: '올해 돈 잘 벌 수 있을까요?' },
    { id: 'biz_3',   tab: 'biz',  icon: '🏪', name: '개업 시기',     pt: '300P~', hook: '개업 날짜 이때가 맞나요?' },
    { id: 'biz_4',   tab: 'biz',  icon: '🤝', name: '동업 궁합',     pt: '300P~', hook: '이 사람과 동업해도 될까요?' },
    { id: 'biz_5',   tab: 'biz',  icon: '🏷️', name: '상호명 상담',   pt: '300P~', hook: '이 상호명이 운에 좋을까요?' },
    { id: 'biz_6',   tab: 'biz',  icon: '🔎', name: '업종 추천',     pt: '300P~', hook: '나에게 맞는 업종은?' },
    { id: 'name_1',  tab: 'name', icon: '👶', name: '아이 이름짓기', pt: '300P~', hook: '사주에 맞는 이름 추천해요' },
    { id: 'name_2',  tab: 'name', icon: '🔤', name: '개명 상담',     pt: '300P~', hook: '이 이름이 내 운을 막나요?' },
    { id: 'name_3',  tab: 'name', icon: '✨', name: '사주 보완 이름', pt: '300P~', hook: '사주의 약점을 이름으로 보완' },
    { id: 'name_4',  tab: 'name', icon: '🏷️', name: '브랜드 네이밍', pt: '300P~', hook: '브랜드명 사주 감수' },
    { id: 'life_1',  tab: 'life', icon: '🏠', name: '이사운',        pt: '200P~', hook: '이사 시기 지금이 맞나요?' },
    { id: 'life_2',  tab: 'life', icon: '🏡', name: '집터운',        pt: '200P~', hook: '이 집터 운이 어떤가요?' },
    { id: 'life_3',  tab: 'life', icon: '📝', name: '계약 시기',     pt: '200P~', hook: '계약하기 좋은 날은?' },
    { id: 'life_4',  tab: 'life', icon: '✈️', name: '여행운',        pt: '100P~', hook: '여행 다녀와도 괜찮을까요?' },
    { id: 'life_5',  tab: 'life', icon: '⚠️', name: '조심할 달',    pt: '200P~', hook: '올해 조심해야 할 달은?' },
    { id: 'life_6',  tab: 'life', icon: '🌟', name: '기회가 오는 달',pt: '200P~', hook: '올해 기회가 오는 달은?' },
    { id: 'all_1',   tab: 'all',  icon: '🃏', name: '타로 상담',     pt: '100P~', hook: '카드가 뭐라고 하나요?' },
    { id: 'all_2',   tab: 'all',  icon: '🌙', name: '점성술 상담',   pt: '200P~', hook: '별자리가 말하는 내 운명' },
    { id: 'all_3',   tab: 'all',  icon: '🔥', name: '2026 병오년',   pt: '200P~', hook: '병오년 내 한 해 운세' },
    { id: 'all_4',   tab: 'all',  icon: '📅', name: '종합 운세',     pt: '300P~', hook: '올해 전체 운세 분석' },
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
  ]
};

// ===== 포인트 관리 =====
function getPoints() {
  let p = parseInt(localStorage.getItem('sajuon_points') || '0', 10);
  if (isNaN(p)) p = 0;
  return p;
}
function initPoints() {
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
    grid.innerHTML = list.map(c => `
      <div class="cat-item" onclick="goChatCategory('${c.name}')">
        <div class="cat-item-icon">${c.icon}</div>
        <div class="cat-item-name">${c.name}</div>
        <div class="cat-item-pt">${c.pt}</div>
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
document.addEventListener('DOMContentLoaded', () => {
  initPoints();
  updateHeaderPoints();
  initHeader();
  initHamburger();
  initHeroInput();
  initCatTabs();
  renderReviews();
  renderFAQ();

  // 배너 문구 관리자 설정 반영
  try {
    const bannerSettings = localStorage.getItem('sajuon_banner');
    if (bannerSettings) {
      const b = JSON.parse(bannerSettings);
      if (b.heroTitle) {
        const el = document.querySelector('.hero-title');
        if (el) el.innerHTML = b.heroTitle;
      }
      if (b.heroBadge) {
        const el = document.querySelector('.hero-badge:first-child');
        if (el) el.innerHTML = '<i class="fas fa-gift"></i> ' + b.heroBadge;
      }
    }
  } catch(e) {}
});
