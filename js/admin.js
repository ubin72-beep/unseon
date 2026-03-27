/* =========================================
   운세ON — js/admin.js
   관리자 대시보드 기능
   ========================================= */

// ===== 섹션 정의 =====
const SECTIONS = {
  dash:     { title: '대시보드',         render: renderDash },
  banner:   { title: '배너·카피 관리',   render: renderBanner },
  category: { title: '카테고리 관리',    render: renderCategory },
  pricing:  { title: '요금 정책 관리',   render: renderPricing },
  reviews:  { title: '후기 관리',        render: renderReviewsAdmin },
  faq:      { title: 'FAQ 관리',         render: renderFAQAdmin },
  history:  { title: '이용 내역 조회',   render: renderHistoryAdmin },
  members:  { title: '회원 관리',        render: renderMembersAdmin },
  points:   { title: '포인트 조작',      render: renderPointsAdmin },
  ai:       { title: 'AI 설정',          render: renderAISettings },
};

let currentSection = 'dash';

// ===== 토스트 =====
function showToast(msg, duration = 2500) {
  const t = document.getElementById('adminToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ===== 네비 초기화 =====
function initAdminNav() {
  // 모바일 토글
  const toggle = document.getElementById('adminMenuToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) && !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

function switchSection(key) {
  currentSection = key;
  const s = SECTIONS[key];
  if (!s) return;

  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === key);
  });

  const titleEl = document.getElementById('adminPageTitle');
  if (titleEl) titleEl.textContent = s.title;

  const content = document.getElementById('adminContent');
  if (content) {
    content.innerHTML = '';
    s.render(content);
  }

  // 해시 업데이트
  history.replaceState(null, '', '#' + key);

  // 모바일 사이드바 닫기
  document.getElementById('adminSidebar')?.classList.remove('open');
}

// ===== 포인트 표시 =====
function updateAdminPt() {
  const el = document.getElementById('adminPtVal');
  if (el) el.textContent = getPoints().toLocaleString();
}

// =========================================
// 섹션 1: 대시보드
// =========================================
function renderDash(container) {
  const hist = getHistory();
  const totalCharge = hist.filter(h => h.amount > 0).reduce((s, h) => s + h.amount, 0);
  const totalDeduct = Math.abs(hist.filter(h => h.amount < 0).reduce((s, h) => s + h.amount, 0));
  const totalConsult = hist.filter(h => h.amount < 0).length;
  const currentPt = getPoints();

  container.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background:#e8f5e9">💰</div>
        <div class="stat-val">${totalCharge.toLocaleString()}P</div>
        <div class="stat-label">총 충전 포인트</div>
        <div class="stat-change">누적 기준</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fce4ec">📉</div>
        <div class="stat-val">${totalDeduct.toLocaleString()}P</div>
        <div class="stat-label">총 차감 포인트</div>
        <div class="stat-change">상담 이용 합계</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#e3f2fd">💬</div>
        <div class="stat-val">${totalConsult}</div>
        <div class="stat-label">총 상담 건수</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--accent-pale)">🪙</div>
        <div class="stat-val">${currentPt.toLocaleString()}P</div>
        <div class="stat-label">현재 보유 포인트</div>
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">최근 이용 내역 (최근 10건)</div>
        </div>
        <button class="admin-add-btn" onclick="switchSection('history')">전체 보기 →</button>
      </div>
      ${renderHistoryTable(hist.slice(0, 10))}
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div class="admin-card-title">빠른 링크</div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="index.html" target="_blank" class="admin-save-btn" style="text-decoration:none"><i class="fas fa-home"></i> 메인 페이지</a>
        <a href="chat.html" target="_blank" class="admin-save-btn" style="text-decoration:none;background:linear-gradient(135deg,#1565c0,#42a5f5)"><i class="fas fa-comments"></i> 채팅 페이지</a>
        <a href="pricing.html" target="_blank" class="admin-save-btn" style="text-decoration:none;background:linear-gradient(135deg,var(--accent-dark),var(--accent))"><i class="fas fa-coins"></i> 요금 페이지</a>
      </div>
    </div>
  `;
}

// =========================================
// 섹션 2: 배너·카피 관리
// =========================================
function renderBanner(container) {
  let banner = {};
  try { banner = JSON.parse(localStorage.getItem('sajuon_banner') || '{}'); } catch {}

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">히어로 섹션 카피</div>
          <div class="admin-card-subtitle">메인 화면 상단 문구를 수정합니다</div>
        </div>
      </div>
      <div class="admin-form-row">
        <label>히어로 뱃지 문구 <span class="hint">(신규 가입 배지 옆 텍스트)</span></label>
        <input class="admin-input" id="bannerBadge" value="${banner.heroBadge || '신규 가입 시 500P 무료 지급'}" placeholder="예: 신규 가입 시 500P 무료 지급"/>
      </div>
      <div class="admin-form-row">
        <label>시즌 뱃지 문구 <span class="hint">(병오년 옆 배지)</span></label>
        <input class="admin-input" id="bannerSeasonBadge" value="${banner.seasonBadge || '2026 병오년 운세 오픈'}" placeholder="예: 2026 병오년 운세 오픈"/>
      </div>
      <div class="admin-form-row">
        <label>히어로 타이틀 <span class="hint">(HTML 허용, &lt;br/&gt; 사용 가능)</span></label>
        <textarea class="admin-textarea" id="bannerTitle" placeholder="예: 지금 이 순간,&lt;br/&gt;당신이 가장 궁금한 것을&lt;br/&gt;바로 물어보세요">${banner.heroTitle || '지금 이 순간,<br/>당신이 가장 궁금한 것을<br/>바로 물어보세요'}</textarea>
      </div>
      <div class="admin-form-row">
        <label>히어로 서브 텍스트</label>
        <textarea class="admin-textarea" id="bannerSub" placeholder="예: 연애, 궁합, 사업, 직업, 이름까지...">${banner.heroSub || '연애, 궁합, 사업, 직업, 이름까지 — 운세ON이 지금 바로 해석해드립니다'}</textarea>
      </div>
      <button class="admin-save-btn" onclick="saveBanner()"><i class="fas fa-save"></i> 저장하기</button>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">병오년 배너 섹션</div>
        </div>
      </div>
      <div class="admin-form-row">
        <label>배너 제목</label>
        <input class="admin-input" id="seasonTitle" value="${banner.seasonTitle || '2026년 병오년, 내 운세는?'}" placeholder="예: 2026년 병오년, 내 운세는?"/>
      </div>
      <div class="admin-form-row">
        <label>배너 설명</label>
        <textarea class="admin-textarea" id="seasonDesc" placeholder="설명 텍스트...">${banner.seasonDesc || '불말띠의 해 — 변화와 에너지가 폭발하는 2026년'}</textarea>
      </div>
      <button class="admin-save-btn" onclick="saveBanner()"><i class="fas fa-save"></i> 저장하기</button>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">CTA 하단 배너</div>
        </div>
      </div>
      <div class="admin-form-row">
        <label>CTA 제목</label>
        <input class="admin-input" id="ctaTitle" value="${banner.ctaTitle || '지금 바로 상담을 시작해보세요'}" placeholder="예: 지금 바로 상담을 시작해보세요"/>
      </div>
      <div class="admin-form-row">
        <label>CTA 설명</label>
        <input class="admin-input" id="ctaSub" value="${banner.ctaSub || '신규 가입 시 500P 무료 지급 · 첫 질문 언제든 가능'}" placeholder="예: 신규 가입 시 500P 무료 지급"/>
      </div>
      <button class="admin-save-btn" onclick="saveBanner()"><i class="fas fa-save"></i> 저장하기</button>
    </div>
  `;
}

function saveBanner() {
  const banner = {
    heroBadge:    document.getElementById('bannerBadge')?.value || '',
    seasonBadge:  document.getElementById('bannerSeasonBadge')?.value || '',
    heroTitle:    document.getElementById('bannerTitle')?.value || '',
    heroSub:      document.getElementById('bannerSub')?.value || '',
    seasonTitle:  document.getElementById('seasonTitle')?.value || '',
    seasonDesc:   document.getElementById('seasonDesc')?.value || '',
    ctaTitle:     document.getElementById('ctaTitle')?.value || '',
    ctaSub:       document.getElementById('ctaSub')?.value || '',
  };
  localStorage.setItem('sajuon_banner', JSON.stringify(banner));
  showToast('✅ 배너·카피가 저장되었습니다');
}

// =========================================
// 섹션 3: 카테고리 관리
// =========================================
function renderCategory(container) {
  const cats = getCats();
  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">카테고리 목록 (${cats.length}개)</div>
          <div class="admin-card-subtitle">상담 카테고리 아이콘·이름·차감 포인트를 수정합니다</div>
        </div>
        <button class="admin-add-btn" onclick="addCat()"><i class="fas fa-plus"></i> 추가</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table" id="catTable">
          <thead>
            <tr>
              <th>아이콘</th>
              <th>카테고리명</th>
              <th>키(내부ID)</th>
              <th>차감P</th>
              <th>탭 분류</th>
              <th>질문 예시</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody id="catTbody">
            ${cats.map((c, i) => catRow(c, i)).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function catRow(c, i) {
  return `<tr id="cat-row-${i}">
    <td><input class="admin-input" style="width:60px" value="${c.icon}" id="c-icon-${i}"/></td>
    <td><input class="admin-input" style="min-width:110px" value="${c.name}" id="c-name-${i}"/></td>
    <td><input class="admin-input" style="min-width:130px" value="${c.id}" id="c-id-${i}"/></td>
    <td><input class="admin-input" style="width:70px" type="number" value="${c.pt.replace('P~','')}" id="c-pt-${i}"/></td>
    <td>
      <select class="admin-select" style="width:120px" id="c-tab-${i}">
        ${['all','love','job','biz','name','life'].map(t => `<option value="${t}"${c.tab===t?' selected':''}>${t}</option>`).join('')}
      </select>
    </td>
    <td><input class="admin-input" style="min-width:160px" value="${c.hook}" id="c-hook-${i}"/></td>
    <td>
      <button class="admin-save-btn" style="padding:6px 12px;font-size:0.78rem" onclick="saveCat(${i})">저장</button>
      <button class="admin-del-btn" style="margin-top:4px" onclick="delCat(${i})">삭제</button>
    </td>
  </tr>`;
}

function getCats() {
  try {
    const saved = localStorage.getItem('sajuon_cats');
    if (saved) return JSON.parse(saved);
  } catch {}
  return SAJU_DATA.categories.map(c => ({
    id: c.id, tab: c.tab, icon: c.icon, name: c.name, pt: c.pt, hook: c.hook
  }));
}

function saveCat(i) {
  const cats = getCats();
  cats[i] = {
    id:   document.getElementById(`c-id-${i}`)?.value || cats[i].id,
    tab:  document.getElementById(`c-tab-${i}`)?.value || cats[i].tab,
    icon: document.getElementById(`c-icon-${i}`)?.value || cats[i].icon,
    name: document.getElementById(`c-name-${i}`)?.value || cats[i].name,
    pt:   (document.getElementById(`c-pt-${i}`)?.value || '100') + 'P~',
    hook: document.getElementById(`c-hook-${i}`)?.value || cats[i].hook,
  };
  localStorage.setItem('sajuon_cats', JSON.stringify(cats));
  showToast(`✅ "${cats[i].name}" 저장 완료`);
}

function delCat(i) {
  const cats = getCats();
  if (!confirm(`"${cats[i].name}" 카테고리를 삭제하시겠습니까?`)) return;
  cats.splice(i, 1);
  localStorage.setItem('sajuon_cats', JSON.stringify(cats));
  showToast('🗑️ 카테고리가 삭제되었습니다');
  renderCategory(document.getElementById('adminContent'));
}

function addCat() {
  const cats = getCats();
  cats.push({ id: 'new_' + Date.now(), tab: 'all', icon: '🌟', name: '새 카테고리', pt: '200P~', hook: '질문 예시를 입력하세요' });
  localStorage.setItem('sajuon_cats', JSON.stringify(cats));
  renderCategory(document.getElementById('adminContent'));
  showToast('➕ 카테고리가 추가되었습니다');
}

// =========================================
// 섹션 4: 요금 정책 관리
// =========================================
function renderPricing(container) {
  let policy = {};
  try { policy = JSON.parse(localStorage.getItem('sajuon_policy') || '{}'); } catch {}

  const defaults = {
    basicAmt: 10000, basicPt: 10000, basicBonus: 0,
    stdAmt: 20000,   stdPt: 22000,   stdBonus: 2000,
    premAmt: 30000,  premPt: 36000,  premBonus: 6000,
    freePt: 500,
    costBasic: 100,  costNormal: 200, costAdvanced: 300,
  };
  const p = { ...defaults, ...policy };

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">충전 플랜 설정</div>
          <div class="admin-card-subtitle">플랜별 금액, 포인트, 보너스를 설정합니다</div>
        </div>
      </div>
      <div style="margin-bottom:20px">
        <h4 style="font-size:0.88rem;font-weight:700;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px">베이직 플랜</h4>
        <div class="admin-form-2col">
          <div class="admin-form-row">
            <label>결제금액 (원)</label>
            <input class="admin-input" type="number" id="basicAmt" value="${p.basicAmt}"/>
          </div>
          <div class="admin-form-row">
            <label>지급 포인트</label>
            <input class="admin-input" type="number" id="basicPt" value="${p.basicPt}"/>
          </div>
        </div>
      </div>
      <div style="margin-bottom:20px">
        <h4 style="font-size:0.88rem;font-weight:700;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px">스탠다드 플랜 ⭐</h4>
        <div class="admin-form-2col">
          <div class="admin-form-row">
            <label>결제금액 (원)</label>
            <input class="admin-input" type="number" id="stdAmt" value="${p.stdAmt}"/>
          </div>
          <div class="admin-form-row">
            <label>지급 포인트</label>
            <input class="admin-input" type="number" id="stdPt" value="${p.stdPt}"/>
          </div>
          <div class="admin-form-row">
            <label>보너스 포인트</label>
            <input class="admin-input" type="number" id="stdBonus" value="${p.stdBonus}"/>
          </div>
        </div>
      </div>
      <div style="margin-bottom:24px">
        <h4 style="font-size:0.88rem;font-weight:700;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px">프리미엄 플랜</h4>
        <div class="admin-form-2col">
          <div class="admin-form-row">
            <label>결제금액 (원)</label>
            <input class="admin-input" type="number" id="premAmt" value="${p.premAmt}"/>
          </div>
          <div class="admin-form-row">
            <label>지급 포인트</label>
            <input class="admin-input" type="number" id="premPt" value="${p.premPt}"/>
          </div>
          <div class="admin-form-row">
            <label>보너스 포인트</label>
            <input class="admin-input" type="number" id="premBonus" value="${p.premBonus}"/>
          </div>
        </div>
      </div>
      <button class="admin-save-btn" onclick="savePricing()"><i class="fas fa-save"></i> 저장하기</button>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">상담 차감 포인트 설정</div>
        </div>
      </div>
      <div class="admin-form-2col">
        <div class="admin-form-row">
          <label>기본 상담 (타로·여행운 등)</label>
          <input class="admin-input" type="number" id="costBasic" value="${p.costBasic}"/>
        </div>
        <div class="admin-form-row">
          <label>일반 상담 (연애운·궁합·직업 등)</label>
          <input class="admin-input" type="number" id="costNormal" value="${p.costNormal}"/>
        </div>
        <div class="admin-form-row">
          <label>심화 상담 (사업운·이름·개명 등)</label>
          <input class="admin-input" type="number" id="costAdvanced" value="${p.costAdvanced}"/>
        </div>
        <div class="admin-form-row">
          <label>신규 무료 포인트</label>
          <input class="admin-input" type="number" id="freePt" value="${p.freePt}"/>
        </div>
      </div>
      <button class="admin-save-btn" onclick="savePricing()"><i class="fas fa-save"></i> 저장하기</button>
    </div>
  `;
}

function savePricing() {
  const policy = {
    basicAmt: +document.getElementById('basicAmt')?.value || 10000,
    basicPt:  +document.getElementById('basicPt')?.value  || 10000,
    basicBonus: 0,
    stdAmt:   +document.getElementById('stdAmt')?.value   || 20000,
    stdPt:    +document.getElementById('stdPt')?.value    || 22000,
    stdBonus: +document.getElementById('stdBonus')?.value || 2000,
    premAmt:  +document.getElementById('premAmt')?.value  || 30000,
    premPt:   +document.getElementById('premPt')?.value   || 36000,
    premBonus:+document.getElementById('premBonus')?.value|| 6000,
    freePt:   +document.getElementById('freePt')?.value   || 500,
    costBasic:   +document.getElementById('costBasic')?.value    || 100,
    costNormal:  +document.getElementById('costNormal')?.value   || 200,
    costAdvanced:+document.getElementById('costAdvanced')?.value || 300,
  };
  localStorage.setItem('sajuon_policy', JSON.stringify(policy));
  showToast('✅ 요금 정책이 저장되었습니다');
}

// =========================================
// 섹션 5: 후기 관리
// =========================================
function renderReviewsAdmin(container) {
  let reviews = [];
  try {
    const saved = localStorage.getItem('sajuon_reviews');
    reviews = saved ? JSON.parse(saved) : SAJU_DATA.reviews;
  } catch { reviews = SAJU_DATA.reviews; }

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">후기 목록 (${reviews.length}개)</div>
          <div class="admin-card-subtitle">메인 화면에 표시되는 후기를 관리합니다 (최대 6개 표시)</div>
        </div>
        <button class="admin-add-btn" onclick="addReview()"><i class="fas fa-plus"></i> 후기 추가</button>
      </div>
      <div id="reviewAdminList">
        ${reviews.map((r, i) => reviewAdminRow(r, i)).join('')}
      </div>
    </div>
  `;
}

function reviewAdminRow(r, i) {
  return `
    <div class="admin-card" style="border:1px dashed var(--border);margin-bottom:14px;padding:18px" id="review-row-${i}">
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
        <span style="font-weight:700;color:var(--text-muted);font-size:0.82rem">#${i+1}</span>
        <div style="display:flex;gap:4px">
          ${[1,2,3,4,5].map(s => `<span style="cursor:pointer;font-size:1rem;color:${s<=r.stars?'var(--accent)':'#ccc'}" onclick="setReviewStar(${i},${s})" id="rstar-${i}-${s}">★</span>`).join('')}
        </div>
        <input type="hidden" id="r-stars-${i}" value="${r.stars}"/>
        <button class="admin-del-btn" style="margin-left:auto" onclick="delReview(${i})">삭제</button>
      </div>
      <div class="admin-form-2col">
        <div class="admin-form-row">
          <label>작성자</label>
          <input class="admin-input" id="r-name-${i}" value="${r.name}"/>
        </div>
        <div class="admin-form-row">
          <label>상담 분야</label>
          <input class="admin-input" id="r-cat-${i}" value="${r.cat}"/>
        </div>
      </div>
      <div class="admin-form-row">
        <label>후기 내용</label>
        <textarea class="admin-textarea" id="r-text-${i}" style="min-height:60px">${r.text}</textarea>
      </div>
      <button class="admin-save-btn" style="margin-top:4px" onclick="saveReview(${i})"><i class="fas fa-save"></i> 저장</button>
    </div>
  `;
}

function setReviewStar(i, stars) {
  document.getElementById(`r-stars-${i}`).value = stars;
  for (let s = 1; s <= 5; s++) {
    const el = document.getElementById(`rstar-${i}-${s}`);
    if (el) el.style.color = s <= stars ? 'var(--accent)' : '#ccc';
  }
}

function getReviews() {
  try {
    const saved = localStorage.getItem('sajuon_reviews');
    if (saved) return JSON.parse(saved);
  } catch {}
  return SAJU_DATA.reviews;
}

function saveReview(i) {
  const reviews = getReviews();
  reviews[i] = {
    stars: parseInt(document.getElementById(`r-stars-${i}`)?.value || '5'),
    name:  document.getElementById(`r-name-${i}`)?.value || '',
    cat:   document.getElementById(`r-cat-${i}`)?.value  || '',
    text:  document.getElementById(`r-text-${i}`)?.value || '',
    color: reviews[i]?.color || '#2c5f4f',
  };
  localStorage.setItem('sajuon_reviews', JSON.stringify(reviews));
  showToast(`✅ "${reviews[i].name}" 후기 저장 완료`);
}

function delReview(i) {
  const reviews = getReviews();
  if (!confirm(`후기를 삭제하시겠습니까?`)) return;
  reviews.splice(i, 1);
  localStorage.setItem('sajuon_reviews', JSON.stringify(reviews));
  showToast('🗑️ 후기가 삭제되었습니다');
  renderReviewsAdmin(document.getElementById('adminContent'));
}

function addReview() {
  const reviews = getReviews();
  reviews.push({ stars: 5, name: '새 이용자', cat: '종합 운세 상담', text: '후기 내용을 입력하세요.', color: '#2c5f4f' });
  localStorage.setItem('sajuon_reviews', JSON.stringify(reviews));
  renderReviewsAdmin(document.getElementById('adminContent'));
  showToast('➕ 후기가 추가되었습니다');
}

// =========================================
// 섹션 6: FAQ 관리
// =========================================
function renderFAQAdmin(container) {
  let faqs = [];
  try {
    const saved = localStorage.getItem('sajuon_faqs');
    faqs = saved ? JSON.parse(saved) : SAJU_DATA.faqs;
  } catch { faqs = SAJU_DATA.faqs; }

  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">FAQ 목록 (${faqs.length}개)</div>
          <div class="admin-card-subtitle">메인 화면 FAQ 섹션을 관리합니다</div>
        </div>
        <button class="admin-add-btn" onclick="addFAQ()"><i class="fas fa-plus"></i> FAQ 추가</button>
      </div>
      <div id="faqAdminList">
        ${faqs.map((f, i) => faqAdminRow(f, i)).join('')}
      </div>
    </div>
  `;
}

function faqAdminRow(f, i) {
  return `
    <div class="admin-card" style="border:1px dashed var(--border);margin-bottom:12px;padding:16px" id="faq-admin-row-${i}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-weight:700;color:var(--text-muted);font-size:0.82rem">Q${i+1}</span>
        <button class="admin-del-btn" style="margin-left:auto" onclick="delFAQ(${i})">삭제</button>
      </div>
      <div class="admin-form-row">
        <label>질문</label>
        <input class="admin-input" id="faq-q-${i}" value="${f.q}"/>
      </div>
      <div class="admin-form-row">
        <label>답변</label>
        <textarea class="admin-textarea" id="faq-a-${i}">${f.a}</textarea>
      </div>
      <button class="admin-save-btn" style="margin-top:4px" onclick="saveFAQ(${i})"><i class="fas fa-save"></i> 저장</button>
    </div>
  `;
}

function getFAQs() {
  try {
    const saved = localStorage.getItem('sajuon_faqs');
    if (saved) return JSON.parse(saved);
  } catch {}
  return SAJU_DATA.faqs;
}

function saveFAQ(i) {
  const faqs = getFAQs();
  faqs[i] = {
    q: document.getElementById(`faq-q-${i}`)?.value || '',
    a: document.getElementById(`faq-a-${i}`)?.value || '',
  };
  localStorage.setItem('sajuon_faqs', JSON.stringify(faqs));
  showToast('✅ FAQ가 저장되었습니다');
}

function delFAQ(i) {
  const faqs = getFAQs();
  if (!confirm('FAQ를 삭제하시겠습니까?')) return;
  faqs.splice(i, 1);
  localStorage.setItem('sajuon_faqs', JSON.stringify(faqs));
  showToast('🗑️ FAQ가 삭제되었습니다');
  renderFAQAdmin(document.getElementById('adminContent'));
}

function addFAQ() {
  const faqs = getFAQs();
  faqs.push({ q: '새 질문을 입력하세요', a: '답변 내용을 입력하세요.' });
  localStorage.setItem('sajuon_faqs', JSON.stringify(faqs));
  renderFAQAdmin(document.getElementById('adminContent'));
  showToast('➕ FAQ가 추가되었습니다');
}

// =========================================
// 섹션 7: 이용 내역 조회
// =========================================
function renderHistoryAdmin(container) {
  const hist = getHistory();
  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">전체 이용 내역 (${hist.length}건)</div>
        </div>
        <button class="admin-del-btn" onclick="clearHistory()">내역 초기화</button>
      </div>
      ${renderHistoryTable(hist)}
    </div>
  `;
}

function renderHistoryTable(hist) {
  if (!hist.length) {
    return `<p style="text-align:center;color:var(--text-light);padding:32px">이용 내역이 없습니다</p>`;
  }
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr><th>일시</th><th>구분</th><th>포인트 변동</th><th>메모</th></tr>
        </thead>
        <tbody>
          ${hist.map(h => `
            <tr>
              <td>${h.date}</td>
              <td>${h.type}</td>
              <td class="${h.amount > 0 ? 'amount-plus' : 'amount-minus'}">${h.amount > 0 ? '+' : ''}${h.amount.toLocaleString()}P</td>
              <td>${h.note || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('sajuon_history') || '[]'); } catch { return []; }
}

function clearHistory() {
  if (!confirm('모든 이용 내역을 초기화하시겠습니까?')) return;
  localStorage.removeItem('sajuon_history');
  showToast('🗑️ 이용 내역이 초기화되었습니다');
  renderHistoryAdmin(document.getElementById('adminContent'));
}

// =========================================
// 섹션 8: 포인트 조작
// =========================================
function renderPointsAdmin(container) {
  const current = getPoints();
  container.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">포인트 직접 조작</div>
          <div class="admin-card-subtitle">테스트 및 관리 목적으로 포인트를 직접 설정합니다</div>
        </div>
      </div>
      <div style="font-size:2rem;font-weight:800;color:var(--primary);margin-bottom:24px">
        현재: <span id="curPtDisplay">${current.toLocaleString()}</span>P
      </div>
      <h4 style="font-size:0.85rem;font-weight:700;color:var(--text-muted);margin-bottom:14px">빠른 충전</h4>
      <div class="point-control-grid">
        ${[500, 1000, 5000, 10000, 22000, 36000].map(amt => `
          <div class="point-btn" onclick="quickAddPoint(${amt})">
            <div class="point-btn-amount">+${amt.toLocaleString()}P</div>
            <div class="point-btn-label">바로 충전</div>
          </div>
        `).join('')}
      </div>
      <div class="admin-form-2col" style="margin-top:24px">
        <div class="admin-form-row">
          <label>포인트 직접 설정 (P)</label>
          <input class="admin-input" type="number" id="manualPt" value="${current}" placeholder="숫자 입력"/>
        </div>
        <div class="admin-form-row" style="display:flex;align-items:flex-end">
          <button class="admin-save-btn" onclick="setManualPoint()"><i class="fas fa-edit"></i> 포인트 설정</button>
        </div>
      </div>
      <button class="admin-del-btn" style="margin-top:16px" onclick="resetPoints()">포인트 초기화 (0P)</button>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div class="admin-card-title">전체 데이터 초기화</div>
      </div>
      <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:20px">
        사이트의 저장된 데이터를 초기화합니다. 포인트, 이용 내역, 관리자 설정이 모두 삭제됩니다.
      </p>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="admin-del-btn" onclick="resetAllData()">⚠️ 전체 데이터 초기화</button>
        <button class="admin-save-btn" onclick="exportData()"><i class="fas fa-download"></i> 데이터 내보내기</button>
      </div>
    </div>
  `;
}

function quickAddPoint(amt) {
  const current = getPoints();
  const newPts = current + amt;
  localStorage.setItem('sajuon_points', String(newPts));
  const hist = getHistory();
  hist.unshift({
    date: new Date().toLocaleString('ko-KR'),
    type: '관리자 포인트 지급',
    amount: amt,
    note: '관리자 직접 충전'
  });
  localStorage.setItem('sajuon_history', JSON.stringify(hist));
  const el = document.getElementById('curPtDisplay');
  if (el) el.textContent = newPts.toLocaleString();
  updateAdminPt();
  showToast(`✅ ${amt.toLocaleString()}P 충전 완료! (총 ${newPts.toLocaleString()}P)`);
}

function setManualPoint() {
  const val = parseInt(document.getElementById('manualPt')?.value || '0', 10);
  if (isNaN(val) || val < 0) { showToast('❌ 올바른 숫자를 입력해주세요'); return; }
  localStorage.setItem('sajuon_points', String(val));
  const el = document.getElementById('curPtDisplay');
  if (el) el.textContent = val.toLocaleString();
  updateAdminPt();
  showToast(`✅ 포인트가 ${val.toLocaleString()}P로 설정되었습니다`);
}

function resetPoints() {
  if (!confirm('포인트를 0으로 초기화하시겠습니까?')) return;
  localStorage.setItem('sajuon_points', '0');
  const el = document.getElementById('curPtDisplay');
  if (el) el.textContent = '0';
  updateAdminPt();
  showToast('🗑️ 포인트가 초기화되었습니다');
}

function resetAllData() {
  if (!confirm('⚠️ 모든 데이터(포인트, 내역, 설정)를 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
  const keys = ['sajuon_points','sajuon_history','sajuon_banner','sajuon_cats','sajuon_policy','sajuon_reviews','sajuon_faqs','sajuon_initialized'];
  keys.forEach(k => localStorage.removeItem(k));
  updateAdminPt();
  showToast('🗑️ 전체 데이터가 초기화되었습니다');
  renderPointsAdmin(document.getElementById('adminContent'));
}

function exportData() {
  const data = {
    points:   getPoints(),
    history:  getHistory(),
    banner:   JSON.parse(localStorage.getItem('sajuon_banner') || '{}'),
    policy:   JSON.parse(localStorage.getItem('sajuon_policy') || '{}'),
    reviews:  JSON.parse(localStorage.getItem('sajuon_reviews') || '[]'),
    faqs:     JSON.parse(localStorage.getItem('sajuon_faqs') || '[]'),
    exported: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sajuon_data_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('📤 데이터 내보내기 완료!');
}

// =========================================
// 섹션 8: 회원 관리
// =========================================
function renderMembersAdmin(container) {
  let users = [];
  try { users = JSON.parse(localStorage.getItem('sajuon_users') || '[]'); } catch {}

  // 이용 내역에서 상담 통계 집계
  let history = [];
  try { history = JSON.parse(localStorage.getItem('sajuon_history') || '[]'); } catch {}

  const totalMembers  = users.length;
  const activeMembers = users.filter(u => u.status === 'active').length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayNew = users.filter(u => u.joinDate && u.joinDate.slice(0, 10) === todayStr).length;
  const mktAgree = users.filter(u => u.marketing).length;

  // 상담 통계
  const consultHistory = history.filter(h => h.type && h.type.includes('AI 상담'));
  const totalConsults  = consultHistory.length;
  const totalPtUsed    = consultHistory.reduce((s, h) => s + Math.abs(h.amount || 0), 0);
  const todayConsults  = consultHistory.filter(h => h.date && h.date.includes(new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', ''))).length;

  // 카테고리별 상담 횟수
  const catCount = {};
  consultHistory.forEach(h => {
    const cat = (h.type || '').replace('AI 상담 · ', '').trim();
    catCount[cat] = (catCount[cat] || 0) + 1;
  });
  const topCats = Object.entries(catCount).sort((a,b) => b[1]-a[1]).slice(0, 5);

  container.innerHTML = `
    <!-- 회원 통계 -->
    <div style="margin-bottom:8px;font-size:0.85rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">👥 회원 현황</div>
    <div class="stat-grid" style="margin-bottom:20px">
      <div class="stat-card">
        <div class="stat-icon" style="background:#e8f5e9">👥</div>
        <div class="stat-val">${totalMembers}</div>
        <div class="stat-label">전체 회원 수</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#e3f2fd">✅</div>
        <div class="stat-val">${activeMembers}</div>
        <div class="stat-label">활성 회원</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--accent-pale)">🆕</div>
        <div class="stat-val">${todayNew}</div>
        <div class="stat-label">오늘 가입</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fce4ec">📢</div>
        <div class="stat-val">${mktAgree}</div>
        <div class="stat-label">마케팅 동의</div>
      </div>
    </div>

    <!-- 상담 통계 -->
    <div style="margin-bottom:8px;font-size:0.85rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">💬 상담 현황</div>
    <div class="stat-grid" style="margin-bottom:20px">
      <div class="stat-card">
        <div class="stat-icon" style="background:#e8f4fd">💬</div>
        <div class="stat-val">${totalConsults.toLocaleString()}</div>
        <div class="stat-label">총 상담 건수</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fff8e1">💰</div>
        <div class="stat-val">${totalPtUsed.toLocaleString()}P</div>
        <div class="stat-label">총 포인트 사용</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#f3e5f5">📅</div>
        <div class="stat-val">${todayConsults}</div>
        <div class="stat-label">오늘 상담 건수</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#e8f5e9">📊</div>
        <div class="stat-val">${totalMembers ? Math.round(totalPtUsed / Math.max(totalMembers, 1)).toLocaleString() : 0}P</div>
        <div class="stat-label">회원당 평균 사용</div>
      </div>
    </div>

    <!-- 인기 상담 분야 -->
    ${topCats.length > 0 ? `
    <div class="admin-card" style="margin-bottom:20px">
      <div class="admin-card-header">
        <div class="admin-card-title">🏆 인기 상담 분야 TOP 5</div>
      </div>
      <div style="padding:0 20px 16px">
        ${topCats.map(([cat, cnt], idx) => {
          const maxCnt = topCats[0][1];
          const pct = Math.round((cnt / maxCnt) * 100);
          const colors = ['#2c5f4f','#3d7a65','#5a9e86','#d4af37','#b8962f'];
          return `
            <div style="margin-bottom:12px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.85rem">
                <span><strong>${idx+1}위</strong> ${cat || '기타'}</span>
                <span style="color:var(--primary);font-weight:600">${cnt}건</span>
              </div>
              <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${colors[idx]};border-radius:4px;transition:width 0.5s"></div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
    ` : `
    <div class="admin-card" style="margin-bottom:20px;padding:24px;text-align:center;color:var(--text-muted)">
      <p>💬 아직 상담 기록이 없습니다. 사용자가 AI 상담을 시작하면 통계가 표시됩니다.</p>
    </div>
    `}

    <!-- 회원 목록 -->
    <div class="admin-card">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">회원 목록 (${totalMembers}명)</div>
          <div class="admin-card-subtitle">가입 회원 정보를 조회하고 관리합니다</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input class="admin-input" id="memberSearch" style="width:200px" placeholder="이름·이메일 검색" oninput="filterMembers()"/>
          <button class="admin-save-btn" onclick="exportMembersCSV()" style="background:var(--primary)"><i class="fas fa-download"></i> CSV</button>
          <button class="admin-del-btn" onclick="clearAllMembers()">전체 초기화</button>
        </div>
      </div>
      <div class="admin-table-wrap" id="memberTableWrap">
        ${renderMemberTable(users)}
      </div>
    </div>

    <div class="admin-card">
      <div class="admin-card-header">
        <div class="admin-card-title">테스트 회원 생성</div>
      </div>
      <div class="admin-form-2col">
        <div class="admin-form-row">
          <label>이름</label>
          <input class="admin-input" id="testName" value="테스트회원" />
        </div>
        <div class="admin-form-row">
          <label>이메일</label>
          <input class="admin-input" id="testEmail" value="test@sajuon.kr" />
        </div>
        <div class="admin-form-row">
          <label>비밀번호</label>
          <input class="admin-input" id="testPw" value="test1234" />
        </div>
        <div class="admin-form-row">
          <label>초기 포인트</label>
          <input class="admin-input" type="number" id="testPt" value="500" />
        </div>
      </div>
      <button class="admin-save-btn" onclick="createTestMember()"><i class="fas fa-user-plus"></i> 테스트 회원 생성</button>
    </div>
  `;
}

// CSV 내보내기
function exportMembersCSV() {
  let users = [];
  try { users = JSON.parse(localStorage.getItem('sajuon_users') || '[]'); } catch {}
  if (!users.length) { showToast('❌ 내보낼 회원 데이터가 없습니다'); return; }

  const rows = [
    ['이름', '이메일', '전화', '성별', '포인트', '마케팅동의', '가입일', '상태'],
    ...users.map(u => [
      u.name || '',
      u.email || '',
      u.phone || '',
      u.gender === 'female' ? '여성' : u.gender === 'male' ? '남성' : '미설정',
      u.points || 0,
      u.marketing ? '동의' : '미동의',
      u.joinDate ? new Date(u.joinDate).toLocaleDateString('ko-KR') : '',
      u.status === 'active' ? '활성' : '정지',
    ])
  ];

  const csv = '\uFEFF' + rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `운세ON_회원목록_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`✅ ${users.length}명 CSV 다운로드 완료`);
}

function renderMemberTable(users) {
  if (!users.length) {
    return `<p style="text-align:center;color:var(--text-light);padding:40px">가입된 회원이 없습니다</p>`;
  }
  // 이용내역에서 각 회원의 마지막 상담 날짜 추출
  let history = [];
  try { history = JSON.parse(localStorage.getItem('sajuon_history') || '[]'); } catch {}
  const consultHistory = history.filter(h => h.type && h.type.includes('AI 상담'));

  return `
    <table class="admin-table">
      <thead>
        <tr>
          <th>이름</th>
          <th>이메일</th>
          <th>포인트</th>
          <th>성별</th>
          <th>마케팅</th>
          <th>가입일</th>
          <th>최근로그인</th>
          <th>상태</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        ${users.map((u, i) => `
          <tr id="member-row-${i}">
            <td><strong>${u.name || '-'}</strong><br/><span style="font-size:0.72rem;color:var(--text-muted)">${u.phone || ''}</span></td>
            <td>${u.email || '-'}</td>
            <td><span class="badge-gold">${(u.points || 0).toLocaleString()}P</span></td>
            <td>${u.gender === 'female' ? '여성' : u.gender === 'male' ? '남성' : '미설정'}</td>
            <td>${u.marketing ? '<span class="badge-green">동의</span>' : '<span class="badge-red">미동의</span>'}</td>
            <td style="font-size:0.78rem">${u.joinDate ? new Date(u.joinDate).toLocaleDateString('ko-KR') : '-'}</td>
            <td style="font-size:0.78rem">${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('ko-KR') : '-'}</td>
            <td>
              ${u.status === 'active'
                ? '<span class="badge-green">활성</span>'
                : '<span class="badge-red">정지</span>'}
            </td>
            <td>
              <button class="admin-save-btn" style="padding:4px 10px;font-size:0.75rem;margin-bottom:3px" onclick="toggleMemberStatus(${i})">
                ${u.status === 'active' ? '정지' : '활성화'}
              </button><br/>
              <button class="admin-del-btn" onclick="deleteMember(${i})">삭제</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterMembers() {
  const keyword = document.getElementById('memberSearch')?.value?.toLowerCase() || '';
  let users = [];
  try { users = JSON.parse(localStorage.getItem('sajuon_users') || '[]'); } catch {}
  const filtered = keyword
    ? users.filter(u => (u.name||'').toLowerCase().includes(keyword) || (u.email||'').toLowerCase().includes(keyword))
    : users;
  const wrap = document.getElementById('memberTableWrap');
  if (wrap) wrap.innerHTML = renderMemberTable(filtered);
}

function toggleMemberStatus(i) {
  let users = [];
  try { users = JSON.parse(localStorage.getItem('sajuon_users') || '[]'); } catch {}
  if (!users[i]) return;
  users[i].status = users[i].status === 'active' ? 'suspended' : 'active';
  localStorage.setItem('sajuon_users', JSON.stringify(users));
  showToast(`✅ ${users[i].name} 회원 상태: ${users[i].status === 'active' ? '활성' : '정지'}`);
  renderMembersAdmin(document.getElementById('adminContent'));
}

function deleteMember(i) {
  let users = [];
  try { users = JSON.parse(localStorage.getItem('sajuon_users') || '[]'); } catch {}
  if (!users[i]) return;
  if (!confirm(`"${users[i].name}" 회원을 삭제하시겠습니까?`)) return;
  users.splice(i, 1);
  localStorage.setItem('sajuon_users', JSON.stringify(users));
  showToast('🗑️ 회원이 삭제되었습니다');
  renderMembersAdmin(document.getElementById('adminContent'));
}

function clearAllMembers() {
  if (!confirm('⚠️ 모든 회원 데이터를 삭제하시겠습니까?')) return;
  localStorage.removeItem('sajuon_users');
  localStorage.removeItem('sajuon_current_user');
  showToast('🗑️ 회원 데이터가 초기화되었습니다');
  renderMembersAdmin(document.getElementById('adminContent'));
}

function createTestMember() {
  const name  = document.getElementById('testName')?.value?.trim() || '테스트회원';
  const email = document.getElementById('testEmail')?.value?.trim() || 'test@sajuon.kr';
  const pw    = document.getElementById('testPw')?.value || 'test1234';
  const pts   = parseInt(document.getElementById('testPt')?.value || '500', 10);

  let users = [];
  try { users = JSON.parse(localStorage.getItem('sajuon_users') || '[]'); } catch {}

  if (users.find(u => u.email === email)) {
    showToast('❌ 이미 존재하는 이메일입니다'); return;
  }

  const hashFn = (s) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) { hash = ((hash << 5) - hash) + s.charCodeAt(i); hash = hash & hash; }
    return 'h_' + Math.abs(hash).toString(36) + '_' + s.length;
  };

  users.push({
    id: 'u_' + Date.now(), name, email, pw: hashFn(pw),
    phone: '', birth: '', gender: 'none', marketing: false,
    points: pts, joinDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(), status: 'active',
  });
  localStorage.setItem('sajuon_users', JSON.stringify(users));
  showToast(`✅ 테스트 회원 "${name}" 생성 완료 (비밀번호: ${pw})`);
  renderMembersAdmin(document.getElementById('adminContent'));
}

// =========================================
// 섹션 10: AI 설정 (Gemini API 관리)
// =========================================
function renderAISettings(container) {
  const currentKey = getGeminiKey ? getGeminiKey() : '';
  const maskedKey  = currentKey
    ? currentKey.slice(0, 8) + '••••••••••••••••' + currentKey.slice(-4)
    : '미설정';
  const isSet = currentKey && currentKey.startsWith('AIza');

  container.innerHTML = `
    <!-- 상태 카드 -->
    <div class="stat-grid" style="margin-bottom:24px">
      <div class="stat-card">
        <div class="stat-icon" style="background:${isSet ? '#e8f5e9' : '#fce4ec'}">${isSet ? '✅' : '❌'}</div>
        <div class="stat-val" style="font-size:1rem">${isSet ? '연결됨' : '미설정'}</div>
        <div class="stat-label">Gemini API 상태</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#e3f2fd">🤖</div>
        <div class="stat-val" style="font-size:0.85rem">gemini-2.0-flash</div>
        <div class="stat-label">사용 모델</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#fff8e1">💰</div>
        <div class="stat-val" style="font-size:0.85rem">무료 (한도 내)</div>
        <div class="stat-label">Flash 티어</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#f3e5f5">📊</div>
        <div class="stat-val" style="font-size:0.85rem">1M 토큰</div>
        <div class="stat-label">컨텍스트 윈도우</div>
      </div>
    </div>

    <!-- API 키 설정 -->
    <div class="admin-card" style="margin-bottom:20px">
      <div class="admin-card-header">
        <div>
          <div class="admin-card-title">🔑 Gemini API 키 설정</div>
          <div class="admin-card-subtitle">Google AI Studio에서 발급한 API 키를 입력합니다</div>
        </div>
        ${isSet ? `<span style="background:#e8f5e9;color:#2e7d32;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:700">✅ 활성</span>` : `<span style="background:#fce4ec;color:#c62828;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:700">❌ 미설정</span>`}
      </div>
      <div style="padding:0 20px 20px">

        ${isSet ? `
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:0.78rem;color:#166534;font-weight:600;margin-bottom:2px">현재 저장된 키</div>
            <code style="font-size:0.88rem;color:#14532d">${maskedKey}</code>
          </div>
          <button class="admin-del-btn" onclick="deleteGeminiKey()">🗑️ 삭제</button>
        </div>
        ` : ''}

        <div class="admin-form-row" style="margin-bottom:12px">
          <label style="margin-bottom:6px;display:block;font-weight:600">${isSet ? '새 키로 교체' : 'API 키 입력'}</label>
          <div style="display:flex;gap:8px;align-items:center">
            <div style="position:relative;flex:1">
              <input type="password" id="geminiKeyInput" class="admin-input" placeholder="AIzaSy..." style="width:100%;font-family:monospace;padding-right:44px" />
              <button id="toggleKeyBtn" type="button" onclick="toggleKeyVisibility()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#888;font-size:1rem;padding:4px"><i class="fas fa-eye"></i></button>
            </div>
            <button class="admin-save-btn" onclick="saveGeminiKey()" style="white-space:nowrap"><i class="fas fa-save"></i> 저장</button>
          </div>
          <small id="geminiKeyMsg" style="display:block;margin-top:6px;color:var(--text-muted)">🔒 키는 이 브라우저의 localStorage에만 저장됩니다. 서버로 전송되지 않습니다.</small>
        </div>

        <button class="admin-save-btn" onclick="testGeminiKey()" style="background:#1565c0">
          <i class="fas fa-plug"></i> 연결 테스트
        </button>
        <span id="geminiTestResult" style="margin-left:10px;font-size:0.88rem"></span>
      </div>
    </div>

    <!-- API 키 발급 안내 -->
    <div class="admin-card" style="margin-bottom:20px">
      <div class="admin-card-header">
        <div class="admin-card-title">📖 Gemini API 키 발급 방법</div>
      </div>
      <div style="padding:0 20px 20px">
        <ol style="padding-left:20px;line-height:2;color:var(--text-body)">
          <li><a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--primary);font-weight:600">aistudio.google.com</a> 접속 (Google 계정 필요)</li>
          <li>"Create API Key" 클릭</li>
          <li>"Create API key in new project" 선택</li>
          <li>생성된 키 (AIzaSy...) 복사</li>
          <li>위 입력창에 붙여넣기 후 저장</li>
        </ol>
        <div style="background:#fffde7;border:1px solid #f9a825;border-radius:10px;padding:14px 18px;margin-top:12px">
          <strong>💰 비용 안내</strong><br/>
          <small style="color:var(--text-body);line-height:1.7">
            • Gemini 2.0 Flash: <strong>무료 티어</strong> — 분당 15회, 일 1,500회 무료 요청<br/>
            • 무료 한도 초과 시: 입력 1M 토큰당 $0.075 (약 100원)<br/>
            • 상담 1건 평균 약 500~800 토큰 → 약 0.07원/건<br/>
            • 월 10,000건 기준 약 700원 수준으로 매우 저렴
          </small>
        </div>
      </div>
    </div>

    <!-- 프롬프트 미리보기 -->
    <div class="admin-card">
      <div class="admin-card-header">
        <div class="admin-card-title">🧠 AI 사주 상담 프롬프트 설정</div>
        <div class="admin-card-subtitle">현재 적용 중인 AI 페르소나 및 분석 방식</div>
      </div>
      <div style="padding:0 20px 20px">
        <div style="background:#f8f9fa;border-radius:10px;padding:16px;font-size:0.82rem;line-height:1.8;color:var(--text-body);max-height:300px;overflow-y:auto">
          <strong>📌 현재 AI 페르소나:</strong><br/>
          수십 년 경력의 한국 전통 사주명리학 전문가<br/><br/>
          <strong>📌 분석 방법:</strong><br/>
          • 천간(天干)·지지(地支)·오행(五行)·십신(十神) 기반 분석<br/>
          • 사주팔자(四柱八字) 완전 구성 및 오행 비율 계산<br/>
          • 용신(用神)·기신(忌神) 도출<br/>
          • 2026년 병오년(丙午年) 세운 흐름 반영<br/>
          • 대화 연속성 지원 (최대 10턴 기억)<br/><br/>
          <strong>📌 사용 모델:</strong> gemini-2.0-flash (스트리밍)<br/>
          <strong>📌 응답 온도:</strong> 0.85 (창의적이되 일관성 있는 응답)<br/>
          <strong>📌 최대 토큰:</strong> 1,500 토큰/응답
        </div>
      </div>
    </div>
  `;
}

function saveGeminiKey() {
  const val = document.getElementById('geminiKeyInput')?.value?.trim();
  const msg = document.getElementById('geminiKeyMsg');
  if (!val) {
    if (msg) { msg.textContent = '❌ API 키를 입력해주세요.'; msg.style.color='#c62828'; }
    return;
  }
  if (!val.startsWith('AIza')) {
    if (msg) { msg.textContent = '❌ 올바른 형식이 아닙니다. AIzaSy...로 시작하는 키를 입력하세요.'; msg.style.color='#c62828'; }
    return;
  }
  setGeminiKey(val);
  showToast('✅ Gemini API 키가 저장되었습니다! 연결 테스트를 진행합니다...');
  // 저장 후 UI 재렌더링
  renderAISettings(document.getElementById('adminContent'));
  // 저장 후 자동 테스트 (1초 후)
  setTimeout(() => testGeminiKey(), 1000);
}

function toggleKeyVisibility() {
  const inp = document.getElementById('geminiKeyInput');
  const btn = document.getElementById('toggleKeyBtn');
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    if (btn) btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    inp.type = 'password';
    if (btn) btn.innerHTML = '<i class="fas fa-eye"></i>';
  }
}

function deleteGeminiKey() {
  if (!confirm('API 키를 삭제하시겠습니까? AI 상담이 비활성화됩니다.')) return;
  localStorage.removeItem('sajuon_gemini_key');
  showToast('🗑️ API 키가 삭제되었습니다');
  renderAISettings(document.getElementById('adminContent'));
}

async function testGeminiKey() {
  const result = document.getElementById('geminiTestResult');
  if (result) result.textContent = '⏳ 테스트 중...';
  const res = await testGeminiConnection();
  if (result) {
    result.textContent = res.msg;
    result.style.color = res.ok ? '#2e7d32' : '#c62828';
  }
  showToast(res.msg);
}

// =========================================
// 전역 함수 노출 (HTML onclick 속성에서 직접 호출)
// =========================================
window.switchSection      = switchSection;
window.saveGeminiKey      = saveGeminiKey;
window.deleteGeminiKey    = deleteGeminiKey;
window.testGeminiKey      = testGeminiKey;
window.toggleKeyVisibility = toggleKeyVisibility;

// =========================================
// 초기화
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  initPoints();
  updateAdminPt();
  initAdminNav();

  // URL 해시로 섹션 결정
  const hash = location.hash.replace('#', '') || 'dash';
  switchSection(SECTIONS[hash] ? hash : 'dash');
});
