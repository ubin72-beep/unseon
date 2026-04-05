/* =========================================
   운세ON — js/admin.js
   관리자 대시보드 기능
   ========================================= */

// =========================================
// 관리자 인증 시스템
// =========================================
const ADMIN_SESSION_KEY = 'sajuon_admin_auth';
const ADMIN_SESSION_TTL = 2 * 60 * 60 * 1000; // 2시간

// ★ 기본 관리자 계정
// localStorage에 'sajuon_admin_cred' 가 있으면 커스텀 계정 우선 사용
function getAdminCredentials() {
  try {
    const saved = localStorage.getItem('sajuon_admin_cred');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.pw) return parsed;
    }
  } catch(_) {}
  // ★ 기본값 — 반드시 로그인 후 변경하세요!
  return { id: 'unseon_admin', pw: hashAdminPw('Unseon@2026!') };
}

function hashAdminPw(pw) {
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    const c = pw.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
  }
  return 'adm_' + Math.abs(hash).toString(36) + '_' + pw.length;
}

function isAdminLoggedIn() {
  try {
    const s = JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) || 'null');
    if (!s || !s.ts) return false;
    if (Date.now() - s.ts > ADMIN_SESSION_TTL) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return s.ok === true;
  } catch(_) { return false; }
}

function setAdminSession() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ ok: true, ts: Date.now() }));
}

function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

function showAdminOverlay() {
  const layout = document.getElementById('adminLayout');
  if (layout) layout.classList.remove('auth-ok');
  const overlay = document.getElementById('adminLoginOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideAdminOverlay() {
  const overlay = document.getElementById('adminLoginOverlay');
  if (overlay) {
    overlay.style.animation = 'adminOverlayOut 0.3s ease forwards';
    setTimeout(() => { overlay.style.display = 'none'; }, 280);
  }
  // ★ 레이아웃 표시 (auth-ok 클래스 추가)
  const layout = document.getElementById('adminLayout');
  if (layout) layout.classList.add('auth-ok');
}

function adminLogin() {
  const idEl  = document.getElementById('adminIdInput');
  const pwEl  = document.getElementById('adminPwInput');
  const errEl = document.getElementById('adminLoginError');
  const btn   = document.getElementById('adminLoginBtn');
  const btnTxt = document.getElementById('adminLoginBtnText');
  const btnLd  = document.getElementById('adminLoginBtnLoading');

  const id = idEl?.value?.trim();
  const pw = pwEl?.value;

  if (errEl) errEl.textContent = '';

  if (!id || !pw) {
    if (errEl) errEl.textContent = '아이디와 비밀번호를 입력해주세요.';
    if (!id) idEl?.focus(); else pwEl?.focus();
    return;
  }

  // 로딩
  if (btn) btn.disabled = true;
  if (btnTxt) btnTxt.style.display = 'none';
  if (btnLd)  btnLd.style.display  = 'inline';

  setTimeout(() => {
    const cred = getAdminCredentials();
    if (id === cred.id && hashAdminPw(pw) === cred.pw) {
      // 성공
      setAdminSession();
      hideAdminOverlay();
      showToast('✅ 관리자로 로그인되었습니다');
      // 대시보드 초기화
      initAdminDashboard();
    } else {
      // 실패
      if (errEl) errEl.textContent = '❌ 아이디 또는 비밀번호가 올바르지 않습니다.';
      if (pwEl)  { pwEl.value = ''; pwEl.focus(); }
      if (btn)   btn.disabled = false;
      if (btnTxt) btnTxt.style.display = 'inline';
      if (btnLd)  btnLd.style.display  = 'none';
      // 입력창 흔들기
      const box = document.querySelector('.admin-login-box');
      if (box) { box.style.animation = 'none'; setTimeout(() => { box.style.animation = 'adminShake 0.4s ease'; }, 10); }
    }
  }, 700);
}

function toggleAdminPw() {
  const input = document.getElementById('adminPwInput');
  const icon  = document.getElementById('adminPwEyeIcon');
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  if (icon) icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
}

function adminLogout() {
  if (!confirm('관리자 로그아웃 하시겠습니까?')) return;
  clearAdminSession();
  showAdminOverlay();
  const idEl = document.getElementById('adminIdInput');
  const pwEl = document.getElementById('adminPwInput');
  if (idEl) idEl.value = '';
  if (pwEl) pwEl.value = '';
}

// 관리자 비밀번호 변경 (대시보드 내에서 사용)
function changeAdminPassword(newId, newPw) {
  if (!newId || !newPw || newPw.length < 8) {
    alert('아이디와 8자 이상의 비밀번호를 입력해주세요.'); return false;
  }
  localStorage.setItem('sajuon_admin_cred', JSON.stringify({ id: newId, pw: hashAdminPw(newPw) }));
  return true;
}

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
  security: { title: '보안·계정 설정',   render: renderSecurity },
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
    try {
      s.render(content);
    } catch(err) {
      console.error('[switchSection] render error:', key, err);
      content.innerHTML = `<div style="padding:40px;text-align:center;color:#c62828">
        <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
        <div style="font-weight:700;margin-bottom:8px">섹션 로드 중 오류가 발생했습니다</div>
        <div style="font-size:0.85rem;color:#666">${err.message}</div>
        <button onclick="switchSection('${key}')" style="margin-top:16px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem">다시 시도</button>
      </div>`;
    }
  }

  // 해시 업데이트
  history.replaceState(null, '', '#' + key);

  // 모바일 사이드바 닫기
  document.getElementById('adminSidebar')?.classList.remove('open');
}

// ===== 포인트 표시 =====
function updateAdminPt() {
  const el = document.getElementById('adminPtVal');
  if (el) el.textContent = (Number(getPoints()) || 0).toLocaleString();
}

// =========================================
// 섹션 1: 대시보드
// =========================================
function renderDash(container) {
  const hist = getHistory();
  // amount가 undefined/NaN일 수 있으므로 Number() 변환 후 처리
  const totalCharge  = hist.filter(h => Number(h.amount) > 0).reduce((s, h) => s + Number(h.amount || 0), 0);
  const totalDeduct  = Math.abs(hist.filter(h => Number(h.amount) < 0).reduce((s, h) => s + Number(h.amount || 0), 0));
  const totalConsult = hist.filter(h => Number(h.amount) < 0).length;
  const currentPt    = Number(getPoints()) || 0;

  // 결제 금액(원화) 집계 — kakaopay.js completePayment가 저장한 amount 필드
  const payHist = hist.filter(h => h.type === '충전' && typeof h.amount === 'number' && h.amount > 0);
  const totalKRW = payHist.reduce((s, h) => s + (h.amount || 0), 0); // amount는 포인트(P=₩1)
  // 이번 달 매출
  const nowYM = new Date().toISOString().slice(0, 7); // "2026-04"
  const monthKRW = payHist
    .filter(h => h.date && (h.date.includes(nowYM.replace('-', '.')) || (h.date >= nowYM)))
    .reduce((s, h) => s + (h.amount || 0), 0);

  // 타로/점성술 사용 건수 (localStorage 기반)
  let tarotCount = 0, astroCount = 0;
  try {
    const tarotLog = JSON.parse(localStorage.getItem('sajuon_tarot_log') || '[]');
    tarotCount = Array.isArray(tarotLog) ? tarotLog.length : 0;
    const astroLog = JSON.parse(localStorage.getItem('sajuon_astro_log') || '[]');
    astroCount = Array.isArray(astroLog) ? astroLog.length : 0;
  } catch(e) {}

  // 회원 수
  let memberCount = 0;
  try { memberCount = JSON.parse(localStorage.getItem('sajuon_users') || '[]').length; } catch(e) {}

  container.innerHTML = `
    <!-- 매출 요약 카드 -->
    <div style="background:linear-gradient(135deg,#1a4838,#2c5f4f);border-radius:16px;padding:20px 24px;margin-bottom:20px;color:#fff;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
      <div>
        <div style="font-size:0.78rem;font-weight:600;opacity:0.75;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">💰 이번 달 누적 매출 (테스트 포함)</div>
        <div style="font-size:2rem;font-weight:800">₩${monthKRW.toLocaleString()}</div>
        <div style="font-size:0.8rem;opacity:0.7;margin-top:4px">누적 총 매출: ₩${totalKRW.toLocaleString()} · 회원 ${memberCount}명</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:0.78rem;opacity:0.75;margin-bottom:4px">목표 달성률</div>
        <div style="font-size:1.4rem;font-weight:800">${Math.round((monthKRW/2000000)*100)}%</div>
        <div style="font-size:0.75rem;opacity:0.6">월 200만원 목표 기준</div>
      </div>
    </div>
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
      <div class="stat-card">
        <div class="stat-icon" style="background:#f3e5f5">🃏</div>
        <div class="stat-val">${tarotCount}</div>
        <div class="stat-label">타로카드 이용</div>
        <div class="stat-change"><a href="tarot.html" target="_blank" style="color:#9c27b0;font-size:11px">페이지 바로가기 →</a></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:#e8eaf6">🌙</div>
        <div class="stat-val">${astroCount}</div>
        <div class="stat-label">점성술 이용</div>
        <div class="stat-change"><a href="astrology.html" target="_blank" style="color:#1a73e8;font-size:11px">페이지 바로가기 →</a></div>
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
        <a href="tarot.html" target="_blank" class="admin-save-btn" style="text-decoration:none;background:linear-gradient(135deg,#4a1a6b,#9c27b0)"><i class="fas fa-magic"></i> 타로카드</a>
        <a href="astrology.html" target="_blank" class="admin-save-btn" style="text-decoration:none;background:linear-gradient(135deg,#0d2060,#1a73e8)"><i class="fas fa-star"></i> 점성술</a>
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
    goldAmt: 50000,  goldPt: 65000,  goldBonus: 15000,
    vipAmt: 100000,  vipPt: 140000,  vipBonus: 40000,
    vvipAmt: 300000, vvipPt: 450000, vvipBonus: 150000,
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
      <div style="margin-bottom:20px">
        <h4 style="font-size:0.88rem;font-weight:700;color:var(--text-muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px">프리미엄 플랜</h4>
        <div class="admin-form-2col">
          <div class="admin-form-row"><label>결제금액 (원)</label><input class="admin-input" type="number" id="premAmt" value="${p.premAmt}"/></div>
          <div class="admin-form-row"><label>지급 포인트</label><input class="admin-input" type="number" id="premPt" value="${p.premPt}"/></div>
          <div class="admin-form-row"><label>보너스 포인트</label><input class="admin-input" type="number" id="premBonus" value="${p.premBonus}"/></div>
        </div>
      </div>
      <div style="border-top:2px dashed #d4af37;margin:20px 0;padding-top:16px">
        <div style="font-size:0.82rem;font-weight:700;color:#b8962f;margin-bottom:14px">💎 고액 플랜 (신규 추가)</div>
        <h4 style="font-size:0.88rem;font-weight:700;color:#b8962f;margin-bottom:10px">💛 골드 플랜 (30% 보너스)</h4>
        <div class="admin-form-2col" style="margin-bottom:14px">
          <div class="admin-form-row"><label>결제금액 (원)</label><input class="admin-input" type="number" id="goldAmt" value="${p.goldAmt}"/></div>
          <div class="admin-form-row"><label>지급 포인트</label><input class="admin-input" type="number" id="goldPt" value="${p.goldPt}"/></div>
          <div class="admin-form-row"><label>보너스 포인트</label><input class="admin-input" type="number" id="goldBonus" value="${p.goldBonus}"/></div>
        </div>
        <h4 style="font-size:0.88rem;font-weight:700;color:#6d28d9;margin-bottom:10px">👑 VIP 플랜 (40% 보너스)</h4>
        <div class="admin-form-2col" style="margin-bottom:14px">
          <div class="admin-form-row"><label>결제금액 (원)</label><input class="admin-input" type="number" id="vipAmt" value="${p.vipAmt}"/></div>
          <div class="admin-form-row"><label>지급 포인트</label><input class="admin-input" type="number" id="vipPt" value="${p.vipPt}"/></div>
          <div class="admin-form-row"><label>보너스 포인트</label><input class="admin-input" type="number" id="vipBonus" value="${p.vipBonus}"/></div>
        </div>
        <h4 style="font-size:0.88rem;font-weight:700;color:#e040fb;margin-bottom:10px">🌟 VVIP 플랜 (50% 보너스)</h4>
        <div class="admin-form-2col">
          <div class="admin-form-row"><label>결제금액 (원)</label><input class="admin-input" type="number" id="vvipAmt" value="${p.vvipAmt}"/></div>
          <div class="admin-form-row"><label>지급 포인트</label><input class="admin-input" type="number" id="vvipPt" value="${p.vvipPt}"/></div>
          <div class="admin-form-row"><label>보너스 포인트</label><input class="admin-input" type="number" id="vvipBonus" value="${p.vvipBonus}"/></div>
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
  const g = id => +document.getElementById(id)?.value || 0;
  const policy = {
    basicAmt: g('basicAmt') || 10000, basicPt: g('basicPt') || 10000, basicBonus: 0,
    stdAmt:   g('stdAmt')  || 20000,  stdPt:   g('stdPt')  || 22000,  stdBonus:  g('stdBonus')  || 2000,
    premAmt:  g('premAmt') || 30000,  premPt:  g('premPt') || 36000,  premBonus: g('premBonus') || 6000,
    goldAmt:  g('goldAmt') || 50000,  goldPt:  g('goldPt') || 65000,  goldBonus: g('goldBonus') || 15000,
    vipAmt:   g('vipAmt')  || 100000, vipPt:   g('vipPt')  || 140000, vipBonus:  g('vipBonus')  || 40000,
    vvipAmt:  g('vvipAmt') || 300000, vvipPt:  g('vvipPt') || 450000, vvipBonus: g('vvipBonus') || 150000,
    freePt:   g('freePt')  || 500,
    costBasic:    g('costBasic')    || 100,
    costNormal:   g('costNormal')   || 200,
    costAdvanced: g('costAdvanced') || 300,
  };
  localStorage.setItem('sajuon_policy', JSON.stringify(policy));
  // kakaopay.js PLANS 런타임 동기화
  if (typeof PLANS !== 'undefined') {
    PLANS.basic.amount    = policy.basicAmt; PLANS.basic.point    = policy.basicPt;
    PLANS.standard.amount = policy.stdAmt;   PLANS.standard.point = policy.stdPt;   PLANS.standard.bonus = policy.stdBonus;
    PLANS.premium.amount  = policy.premAmt;  PLANS.premium.point  = policy.premPt;  PLANS.premium.bonus  = policy.premBonus;
    PLANS.gold.amount     = policy.goldAmt;  PLANS.gold.point     = policy.goldPt;  PLANS.gold.bonus     = policy.goldBonus;
    PLANS.vip.amount      = policy.vipAmt;   PLANS.vip.point      = policy.vipPt;   PLANS.vip.bonus      = policy.vipBonus;
    PLANS.vvip.amount     = policy.vvipAmt;  PLANS.vvip.point     = policy.vvipPt;  PLANS.vvip.bonus     = policy.vvipBonus;
  }
  showToast('✅ 요금 정책이 저장되었습니다 (골드·VIP·VVIP 포함)');
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
          ${hist.map(h => {
            const amt = Number(h.amount || 0);
            return `
            <tr>
              <td>${h.date || '-'}</td>
              <td>${h.type || '-'}</td>
              <td class="${amt > 0 ? 'amount-plus' : 'amount-minus'}">${amt > 0 ? '+' : ''}${amt.toLocaleString()}P</td>
              <td>${h.note || '-'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('sajuon_history') || '[]'); } catch { return []; }
}

// admin.js 전용 getPoints (main.js와 독립 동작 보장)
function getPoints() {
  const p = parseInt(localStorage.getItem('sajuon_points') || '0', 10);
  return isNaN(p) ? 0 : p;
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
  const current = Number(getPoints()) || 0;
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
  const keys = ['sajuon_points','sajuon_history','sajuon_banner','sajuon_cats','sajuon_policy','sajuon_reviews','sajuon_faqs','sajuon_initialized','unseon_popup_shown'];
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
  // 직접 localStorage에서 읽기 (gemini.js 의존성 제거)
  var currentKey = '';
  try { currentKey = localStorage.getItem('sajuon_gemini_key') || ''; } catch(e) {}
  var isSet = (currentKey.length > 20 && currentKey.indexOf('AIza') === 0);
  var maskedKey = isSet
    ? currentKey.slice(0,8) + '••••••••••••••••' + currentKey.slice(-4)
    : '미설정';

  var statusColor = isSet ? '#e8f5e9' : '#fce4ec';
  var statusEmoji = isSet ? '✅' : '❌';
  var statusText  = isSet ? '연결됨' : '미설정';
  var badgeBg     = isSet ? '#e8f5e9' : '#fce4ec';
  var badgeColor  = isSet ? '#2e7d32' : '#c62828';
  var badgeText   = isSet ? '✅ 활성' : '❌ 미설정';
  var labelText   = isSet ? '새 키로 교체' : 'API 키 입력';

  var savedKeyBlock = isSet ? (
    '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">' +
      '<div>' +
        '<div style="font-size:0.78rem;color:#166534;font-weight:600;margin-bottom:2px">현재 저장된 키</div>' +
        '<code style="font-size:0.88rem;color:#14532d">' + maskedKey + '</code>' +
      '</div>' +
      '<button onclick="deleteGeminiKey()" style="padding:6px 14px;background:#fce4ec;color:#c62828;border:1px solid #f48fb1;border-radius:8px;cursor:pointer;font-size:0.82rem;font-weight:600">🗑️ 삭제</button>' +
    '</div>'
  ) : '';

  container.innerHTML =
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px">' +
      '<div class="stat-card"><div class="stat-icon" style="background:' + statusColor + '">' + statusEmoji + '</div><div class="stat-val" style="font-size:1rem">' + statusText + '</div><div class="stat-label">Gemini API 상태</div></div>' +
      '<div class="stat-card"><div class="stat-icon" style="background:#e3f2fd">🤖</div><div class="stat-val" style="font-size:0.75rem">' + (localStorage.getItem('sajuon_gemini_model') || '미설정') + '</div><div class="stat-label">사용 모델</div></div>' +
      '<div class="stat-card"><div class="stat-icon" style="background:#fff8e1">💰</div><div class="stat-val" style="font-size:0.85rem">무료 (한도 내)</div><div class="stat-label">Flash 티어</div></div>' +
      '<div class="stat-card"><div class="stat-icon" style="background:#f3e5f5">📊</div><div class="stat-val" style="font-size:0.85rem">1M 토큰</div><div class="stat-label">컨텍스트 윈도우</div></div>' +
    '</div>' +

    '<div class="admin-card" style="margin-bottom:20px">' +
      '<div class="admin-card-header">' +
        '<div><div class="admin-card-title">🔑 Gemini API 키 설정</div><div class="admin-card-subtitle">Google AI Studio에서 발급한 API 키를 입력합니다</div></div>' +
        '<span style="background:' + badgeBg + ';color:' + badgeColor + ';padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:700">' + badgeText + '</span>' +
      '</div>' +
      '<div style="padding:0 20px 20px">' +
        savedKeyBlock +
        '<div style="margin-bottom:16px">' +
          '<label style="display:block;margin-bottom:8px;font-weight:600;font-size:0.9rem">' + labelText + '</label>' +
          '<div style="display:flex;gap:10px;align-items:center">' +
            '<div style="position:relative;flex:1">' +
              '<input type="password" id="geminiKeyInput" placeholder="AIzaSy..." style="width:100%;padding:10px 44px 10px 14px;border:1.5px solid #ddd;border-radius:8px;font-family:monospace;font-size:0.9rem;box-sizing:border-box" />' +
              '<button id="toggleKeyBtn" type="button" onclick="toggleKeyVisibility()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#888;font-size:1rem">👁️</button>' +
            '</div>' +
            '<button onclick="saveGeminiKey()" style="padding:10px 20px;background:#1b5e20;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;font-weight:600;white-space:nowrap">💾 저장</button>' +
          '</div>' +
          '<small id="geminiKeyMsg" style="display:block;margin-top:8px;color:#666">🔒 키는 이 브라우저의 localStorage에만 저장됩니다. 서버로 전송되지 않습니다.</small>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">' +
          '<button onclick="testGeminiKey()" style="padding:10px 20px;background:#1565c0;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;font-weight:600">🔌 연결 테스트</button>' +
          '<button onclick="listGeminiModels()" style="padding:10px 16px;background:#37474f;color:white;border:none;border-radius:8px;cursor:pointer;font-size:0.85rem">📋 모델 목록 조회</button>' +
        '</div>' +
        '<div id="geminiTestResult" style="font-size:0.88rem;margin-bottom:4px"></div>' +
        '<div id="geminiModelInfo" style="font-size:0.8rem;color:#888"></div>' +
      '</div>' +
    '</div>' +

    '<div class="admin-card" style="margin-bottom:20px">' +
      '<div class="admin-card-header"><div class="admin-card-title">📖 API 키 발급 방법</div></div>' +
      '<div style="padding:0 20px 20px">' +
        '<ol style="padding-left:20px;line-height:2.2;color:#444;margin:0 0 16px">' +
          '<li><a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#1b5e20;font-weight:600">aistudio.google.com</a> 접속 (Google 계정 필요)</li>' +
          '<li>"Create API Key" 클릭 → "Create API key in new project" 선택</li>' +
          '<li>생성된 키 <code style="background:#f5f5f5;padding:2px 6px;border-radius:4px">AIzaSy...</code> 복사</li>' +
          '<li>위 입력란에 붙여넣기 후 💾 저장 클릭</li>' +
        '</ol>' +
        '<div style="background:#fffde7;border:1px solid #f9a825;border-radius:10px;padding:14px 18px">' +
          '<strong>💰 비용 안내</strong><br>' +
          '<span style="font-size:0.85rem;color:#555;line-height:2;display:block;margin-top:4px">' +
            '• Gemini 2.0 Flash: <strong>무료 티어</strong> — 분당 15회, 일 1,500회 무료<br>' +
            '• 무료 초과 시: 입력 1M 토큰당 $0.075 (약 100원)<br>' +
            '• 상담 1건 ≈ 500~800 토큰 → 약 0.07원/건' +
          '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="admin-card">' +
      '<div class="admin-card-header"><div class="admin-card-title">🧠 AI 페르소나 설정</div><div class="admin-card-subtitle">현재 적용 중인 분석 방식</div></div>' +
      '<div style="padding:0 20px 20px">' +
        '<div style="background:#f8f9fa;border-radius:10px;padding:16px;font-size:0.85rem;line-height:2;color:#444">' +
          '<strong>📌 AI 페르소나:</strong> 수십 년 경력의 한국 전통 사주명리학 전문가<br>' +
          '<strong>📌 분석 방법:</strong> 천간·지지·오행·십신 기반, 사주팔자 완전 구성, 용신·기신 도출<br>' +
          '<strong>📌 세운 반영:</strong> 2026년 병오년(丙午年) 흐름 적용<br>' +
          '<strong>📌 사용 모델:</strong> ' + (localStorage.getItem('sajuon_gemini_model') || '미설정') + ' (스트리밍)<br>' +
          '<strong>📌 응답 온도:</strong> 0.85 &nbsp;|&nbsp; <strong>최대 토큰:</strong> 1,500/응답' +
        '</div>' +
      '</div>' +
    '</div>';
}

function saveGeminiKey() {
  const val = document.getElementById('geminiKeyInput')?.value?.trim();
  const msg = document.getElementById('geminiKeyMsg');
  if (!val) {
    if (msg) { msg.textContent = '❌ API 키를 입력해주세요.'; msg.style.color='#c62828'; }
    return;
  }
  if (!val.startsWith('AIza') || val.length < 20) {
    if (msg) { msg.textContent = '❌ 올바른 형식이 아닙니다. AIzaSy...로 시작하는 키를 입력하세요.'; msg.style.color='#c62828'; }
    return;
  }
  // gemini.js 함수 또는 직접 저장
  try { if (typeof setGeminiKey === 'function') setGeminiKey(val); else localStorage.setItem('sajuon_gemini_key', val); } catch(e) { localStorage.setItem('sajuon_gemini_key', val); }
  showToast('✅ Gemini API 키가 저장되었습니다!');
  // 저장 후 UI 재렌더링
  renderAISettings(document.getElementById('adminContent'));
  // 저장 후 자동 테스트 (800ms 후)
  setTimeout(() => testGeminiKey(), 800);
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
  var result = document.getElementById('geminiTestResult');
  if (result) { result.innerHTML = '⏳ 사용 가능한 모델 조회 중...'; result.style.color = '#666'; }

  var key = localStorage.getItem('sajuon_gemini_key') || '';
  if (!key) {
    if (result) { result.innerHTML = '❌ 저장된 API 키가 없습니다.'; result.style.color = '#c62828'; }
    showToast('❌ API 키 없음'); return;
  }

  var reqBody = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: '안녕' }] }],
    generationConfig: { maxOutputTokens: 10 }
  });

  // ── 1단계: 모델 목록 조회 ──
  var availableModels = [];
  try {
    var listRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + key + '&pageSize=100'
    );
    if (listRes.ok) {
      var listData = await listRes.json();
      availableModels = (listData.models || [])
        .filter(function(m) {
          return (m.supportedGenerationMethods || []).indexOf('generateContent') !== -1;
        })
        .map(function(m) { return m.name.replace('models/', ''); });
      if (result) result.innerHTML = '⏳ 사용 가능한 모델 ' + availableModels.length + '개 발견. 연결 테스트 중...';
    } else {
      var errD = await listRes.json().catch(function() { return {}; });
      var errMsg = (errD && errD.error && errD.error.message) ? errD.error.message : ('HTTP ' + listRes.status);
      if (result) { result.innerHTML = '❌ API 오류: ' + errMsg; result.style.color = '#c62828'; }
      showToast('❌ API 키 오류');
      return;
    }
  } catch(e) {
    if (result) { result.innerHTML = '❌ 네트워크 오류: ' + e.message; result.style.color = '#c62828'; }
    showToast('❌ 네트워크 오류'); return;
  }

  // ── 2단계: 우선순위 순으로 실제 연결 테스트 ──
  // 신규 계정은 gemini-2.0-flash 사용 불가 → 목록에서 실제 있는 것 우선
  var PRIORITY = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-001',
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  // 우선순위 목록 중 실제 가용 모델만 추출, 없으면 가용 모델 전체 시도
  var toTest = PRIORITY.filter(function(m) { return availableModels.indexOf(m) !== -1; });
  if (toTest.length === 0) toTest = availableModels.slice(0, 5); // 최대 5개

  var successModel = null;
  var lastErr = '';

  for (var i = 0; i < toTest.length; i++) {
    var model = toTest[i];
    try {
      if (result) result.innerHTML = '⏳ 테스트 중: <b>' + model + '</b>...';
      // generateContent로 먼저 테스트 (빠르고 안정적)
      var r = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reqBody }
      );
      if (r.ok) { successModel = model; break; }
      var d = await r.json().catch(function() { return {}; });
      lastErr = (d && d.error && d.error.message) ? d.error.message : ('HTTP ' + r.status);
    } catch(e2) { lastErr = e2.message; }
  }

  if (successModel) {
    localStorage.setItem('sajuon_gemini_model', successModel);
    localStorage.setItem('sajuon_gemini_ver',   'v1beta');
    if (result) {
      result.innerHTML = '✅ 연결 성공! 사용 모델: <b>' + successModel + '</b> (전체 ' + availableModels.length + '개 모델 중 선택)';
      result.style.color = '#2e7d32';
    }
    showToast('✅ 연결 성공: ' + successModel);
    setTimeout(function() { renderAISettings(document.getElementById('adminContent')); }, 600);
  } else {
    if (result) {
      result.innerHTML = '❌ 연결 실패: ' + lastErr +
        '<br><small style="color:#888">사용 가능한 모델: ' + (availableModels.length > 0 ? availableModels.join(', ') : '없음') + '</small>';
      result.style.color = '#c62828';
    }
    showToast('❌ 연결 실패');
  }
}

// ── 사용 가능한 모델 목록 조회 및 표시 ──
async function listGeminiModels() {
  const result = document.getElementById('geminiTestResult');
  const info   = document.getElementById('geminiModelInfo');
  if (result) { result.innerHTML = '⏳ 모델 목록 조회 중...'; result.style.color = '#666'; }

  const key = localStorage.getItem('sajuon_gemini_key') || '';
  if (!key) { if (result) { result.innerHTML = '❌ API 키가 없습니다'; result.style.color = '#c62828'; } return; }

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=50`);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      if (result) { result.innerHTML = `❌ ${d?.error?.message || 'HTTP ' + r.status}`; result.style.color = '#c62828'; }
      return;
    }
    const data = await r.json();
    const models = (data.models || []).filter(m => (m.supportedGenerationMethods||[]).includes('generateContent'));
    if (models.length === 0) {
      if (result) { result.innerHTML = '❌ generateContent 지원 모델이 없습니다. <a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com" target="_blank" style="color:#1565c0">API 활성화 →</a>'; result.style.color = '#c62828'; }
      return;
    }
    const listHtml = models.map(m => `<span style="display:inline-block;background:#e3f2fd;color:#1565c0;padding:2px 8px;border-radius:4px;margin:2px;font-size:0.8rem">${m.name.replace('models/','')}</span>`).join('');
    if (result) { result.innerHTML = `✅ 사용 가능한 모델 ${models.length}개 발견`; result.style.color = '#2e7d32'; }
    if (info)   { info.innerHTML = listHtml; }
  } catch(e) {
    if (result) { result.innerHTML = `❌ 네트워크 오류: ${e.message}`; result.style.color = '#c62828'; }
  }
}

// =========================================
// 전역 함수 노출 (HTML onclick 속성에서 직접 호출)
// =========================================
window.switchSection      = switchSection;
window.saveGeminiKey      = saveGeminiKey;
window.deleteGeminiKey    = deleteGeminiKey;
window.testGeminiKey      = testGeminiKey;
window.toggleKeyVisibility = toggleKeyVisibility;
window.listGeminiModels   = listGeminiModels;
window.adminLogin         = adminLogin;
window.adminLogout        = adminLogout;
window.toggleAdminPw      = toggleAdminPw;
window.changeAdminPassword = changeAdminPassword;

// =========================================
// 대시보드 초기화 (로그인 성공 후 실행)
// =========================================
function initAdminDashboard() {
  initPoints();
  updateAdminPt();
  initAdminNav();
  const hash = location.hash.replace('#', '') || 'dash';
  switchSection(SECTIONS[hash] ? hash : 'dash');
}

// =========================================
// 보안·계정 설정 섹션
// =========================================
function renderSecurity(container) {
  const cred = getAdminCredentials();
  container.innerHTML = `
    <div style="max-width:560px;margin:0 auto;padding:8px 0">

      <!-- 현재 계정 정보 -->
      <div class="admin-card" style="margin-bottom:24px;border-left:4px solid #2e7d32">
        <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px">
          <i class="fas fa-user-shield" style="color:#2e7d32"></i> 현재 관리자 계정
        </h3>
        <div style="background:#f8fafb;border-radius:10px;padding:16px 20px;font-size:0.9rem;line-height:2.2">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:8px">
            <span style="color:#888">아이디</span>
            <strong style="font-family:monospace;color:#1a1a2e">${cred.id}</strong>
          </div>
          <div style="display:flex;justify-content:space-between">
            <span style="color:#888">비밀번호</span>
            <strong style="color:#1a1a2e">••••••••••</strong>
          </div>
        </div>
        <div style="background:#e8f5e9;border-radius:8px;padding:10px 14px;margin-top:12px;font-size:0.82rem;color:#1b5e20">
          <i class="fas fa-info-circle"></i> 세션 유효 시간: <strong>2시간</strong> (브라우저 닫으면 자동 로그아웃)
        </div>
      </div>

      <!-- 계정 변경 폼 -->
      <div class="admin-card" style="border-left:4px solid #1565c0">
        <h3 style="font-size:1rem;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:8px">
          <i class="fas fa-key" style="color:#1565c0"></i> 관리자 계정 변경
        </h3>
        <p style="font-size:0.83rem;color:#888;margin-bottom:20px">변경 후 즉시 새 계정으로 재로그인이 필요합니다.</p>

        <div style="display:flex;flex-direction:column;gap:14px">
          <div>
            <label style="font-size:0.85rem;font-weight:600;color:#444;display:block;margin-bottom:6px">
              <i class="fas fa-user"></i> 새 아이디 (영문·숫자·언더바, 4~20자)
            </label>
            <input type="text" id="secNewId" placeholder="새 아이디 입력"
              maxlength="20"
              style="width:100%;padding:12px 16px;border:1.5px solid #ddd;border-radius:10px;font-size:0.9rem;outline:none;transition:border 0.2s"
              onfocus="this.style.borderColor='#2e7d32'" onblur="this.style.borderColor='#ddd'"/>
          </div>
          <div>
            <label style="font-size:0.85rem;font-weight:600;color:#444;display:block;margin-bottom:6px">
              <i class="fas fa-lock"></i> 새 비밀번호 (영문+숫자+특수문자, 8자 이상)
            </label>
            <div style="position:relative">
              <input type="password" id="secNewPw" placeholder="새 비밀번호 입력"
                maxlength="50"
                style="width:100%;padding:12px 48px 12px 16px;border:1.5px solid #ddd;border-radius:10px;font-size:0.9rem;outline:none;transition:border 0.2s"
                onfocus="this.style.borderColor='#2e7d32'" onblur="this.style.borderColor='#ddd'"
                oninput="checkSecPwStrength(this.value)"/>
              <button type="button" onclick="toggleSecPw('secNewPw','secPwEye')"
                style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#aaa;font-size:1rem">
                <i class="fas fa-eye" id="secPwEye"></i>
              </button>
            </div>
            <!-- 비밀번호 강도 바 -->
            <div style="margin-top:8px">
              <div style="height:4px;background:#eee;border-radius:4px;overflow:hidden">
                <div id="secPwBar" style="height:100%;width:0%;transition:width 0.3s,background 0.3s;border-radius:4px"></div>
              </div>
              <span id="secPwLabel" style="font-size:0.78rem;color:#aaa"></span>
            </div>
          </div>
          <div>
            <label style="font-size:0.85rem;font-weight:600;color:#444;display:block;margin-bottom:6px">
              <i class="fas fa-lock"></i> 비밀번호 확인
            </label>
            <input type="password" id="secNewPwConfirm" placeholder="비밀번호 다시 입력"
              maxlength="50"
              style="width:100%;padding:12px 16px;border:1.5px solid #ddd;border-radius:10px;font-size:0.9rem;outline:none;transition:border 0.2s"
              onfocus="this.style.borderColor='#2e7d32'" onblur="this.style.borderColor='#ddd'"/>
          </div>

          <div id="secErrMsg" style="font-size:0.85rem;color:#c62828;min-height:20px"></div>

          <!-- 현재 비밀번호 확인 -->
          <div style="background:#fff8e1;border-radius:10px;padding:14px 16px">
            <label style="font-size:0.85rem;font-weight:600;color:#e65100;display:block;margin-bottom:6px">
              <i class="fas fa-shield-alt"></i> 현재 비밀번호 (본인 확인)
            </label>
            <div style="position:relative">
              <input type="password" id="secCurrentPw" placeholder="현재 비밀번호 입력"
                style="width:100%;padding:12px 48px 12px 16px;border:1.5px solid #ffcc80;border-radius:10px;font-size:0.9rem;outline:none;background:#fffde7;transition:border 0.2s"
                onfocus="this.style.borderColor='#e65100'" onblur="this.style.borderColor='#ffcc80'"/>
              <button type="button" onclick="toggleSecPw('secCurrentPw','secCurPwEye')"
                style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#aaa;font-size:1rem">
                <i class="fas fa-eye" id="secCurPwEye"></i>
              </button>
            </div>
          </div>

          <button onclick="doChangeAdminAccount()"
            style="width:100%;padding:14px;background:linear-gradient(135deg,#1b5e20,#2e7d32);color:#fff;border:none;border-radius:12px;font-size:0.95rem;font-weight:700;cursor:pointer;transition:opacity 0.2s;display:flex;align-items:center;justify-content:center;gap:8px"
            onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">
            <i class="fas fa-save"></i> 계정 정보 변경하기
          </button>
        </div>
      </div>

      <!-- 보안 주의사항 -->
      <div class="admin-card" style="border-left:4px solid #c62828;margin-top:24px">
        <h3 style="font-size:0.95rem;font-weight:700;margin-bottom:12px;color:#c62828">
          <i class="fas fa-exclamation-triangle"></i> 보안 주의사항
        </h3>
        <ul style="list-style:none;padding:0;font-size:0.85rem;color:#555;line-height:2">
          <li>🔴 기본 계정(admin/unseon2026!) 그대로 사용하지 마세요</li>
          <li>🔴 비밀번호는 영문+숫자+특수문자 조합 8자 이상 권장</li>
          <li>🟡 브라우저 자동완성에 비밀번호 저장 후 관리 필요</li>
          <li>🟡 admin.html URL을 외부에 공유하지 마세요</li>
          <li>🟢 세션은 2시간 후 자동 만료됩니다</li>
        </ul>
      </div>

    </div>
  `;
}

/* 보안 섹션 헬퍼 함수들 */
function toggleSecPw(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!input) return;
  const hidden = input.type === 'password';
  input.type = hidden ? 'text' : 'password';
  if (icon) icon.className = hidden ? 'fas fa-eye-slash' : 'fas fa-eye';
}

function checkSecPwStrength(pw) {
  const bar   = document.getElementById('secPwBar');
  const label = document.getElementById('secPwLabel');
  if (!bar || !label) return;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw))   score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;
  const levels = [
    { w:'0%',   c:'#eee',    t:'' },
    { w:'25%',  c:'#c62828', t:'매우 약함' },
    { w:'50%',  c:'#e65100', t:'약함' },
    { w:'75%',  c:'#f9a825', t:'보통' },
    { w:'90%',  c:'#2e7d32', t:'강함' },
    { w:'100%', c:'#1b5e20', t:'매우 강함' },
  ];
  const lvl = pw.length === 0 ? 0 : Math.min(5, Math.ceil(score));
  const l = levels[lvl];
  bar.style.width = l.w; bar.style.background = l.c;
  label.textContent = l.t; label.style.color = l.c;
}

function doChangeAdminAccount() {
  const newId      = document.getElementById('secNewId')?.value?.trim();
  const newPw      = document.getElementById('secNewPw')?.value;
  const newPwConf  = document.getElementById('secNewPwConfirm')?.value;
  const currentPw  = document.getElementById('secCurrentPw')?.value;
  const errEl      = document.getElementById('secErrMsg');

  const setErr = (msg) => { if (errEl) errEl.textContent = msg; };
  setErr('');

  // 현재 비밀번호 확인
  if (!currentPw) { setErr('❌ 현재 비밀번호를 입력해주세요.'); return; }
  const cred = getAdminCredentials();
  if (hashAdminPw(currentPw) !== cred.pw) { setErr('❌ 현재 비밀번호가 올바르지 않습니다.'); return; }

  // 새 아이디 검증
  if (!newId || newId.length < 4) { setErr('❌ 아이디는 4자 이상 입력해주세요.'); return; }
  if (!/^[a-zA-Z0-9_가-힣]+$/.test(newId)) { setErr('❌ 아이디는 영문·숫자·언더바·한글만 사용 가능합니다.'); return; }

  // 새 비밀번호 검증
  if (!newPw || newPw.length < 8) { setErr('❌ 비밀번호는 8자 이상 입력해주세요.'); return; }
  if (!/[a-zA-Z]/.test(newPw))   { setErr('❌ 비밀번호에 영문을 포함해주세요.'); return; }
  if (!/\d/.test(newPw))         { setErr('❌ 비밀번호에 숫자를 포함해주세요.'); return; }
  if (newPw !== newPwConf)       { setErr('❌ 비밀번호가 일치하지 않습니다.'); return; }

  // 저장
  const newCred = { id: newId, pw: hashAdminPw(newPw) };
  localStorage.setItem('sajuon_admin_cred', JSON.stringify(newCred));

  showToast('✅ 계정 정보가 변경되었습니다. 새 계정으로 재로그인해주세요.', 3500);

  // 1.5초 후 로그아웃 처리
  setTimeout(() => {
    clearAdminSession();
    showAdminOverlay();
    // 입력창 초기화 및 포커스
    const idEl = document.getElementById('adminIdInput');
    const pwEl = document.getElementById('adminPwInput');
    if (idEl) { idEl.value = newId; }
    if (pwEl) { pwEl.value = ''; pwEl.focus(); }
    // 에러 초기화
    const errLogin = document.getElementById('adminLoginError');
    if (errLogin) errLogin.textContent = `새 아이디(${newId})로 로그인해주세요.`;
  }, 1500);
}

// =========================================
// 초기화
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  // ★ 가장 먼저 레이아웃 완전 차단 상태 확인 (CSS display:none 이므로 추가 처리 불필요)

  // 인증 확인 — 세션 유효 시 대시보드 표시, 아니면 오버레이
  if (isAdminLoggedIn()) {
    hideAdminOverlay();
    initAdminDashboard();
  } else {
    showAdminOverlay();
    setTimeout(() => {
      document.getElementById('adminIdInput')?.focus();
    }, 300);
  }
});
