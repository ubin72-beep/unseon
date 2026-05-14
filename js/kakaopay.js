/* =============================================
   운세ON — js/kakaopay.js  v4.0
   카카오페이 결제 연동 (1회 단건 결제 전용)

   ★ 카카오페이 심사 대응 — 분할 결제 제거 ★
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   카카오페이 정책: 1회 단건 결제만 허용
   → 분할 결제 상품 전면 제거 (2026-05-14)
   → plan5 / plan10 / plan20 / plan30 / plan50 만 운영

   ★ 실서비스 전환 체크리스트 ★
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. IS_TEST_MODE = false
   2. KAKAO_CID    = 발급받은 실제 CID (예: 'CZ0ONETIME')
   3. SITE_ORIGIN  = 실제 도메인 (예: 'https://unseon.co.kr')
   4. 카카오페이 가맹점 관리자 → 결제 승인 URL에
      https://unseon.co.kr/payment-complete.html 등록
   =============================================*/

/* ──────────────────────────────────────────── */
/*  ★ 설정값 — 실서비스 전환 시 여기만 수정  */
/* ──────────────────────────────────────────── */

const KAKAO_CONFIG = {
  IS_TEST: true,                        // ← false 로 바꾸면 실서비스
  CID: 'TC0ONETIME',                    // ← 실서비스: 발급받은 CID 입력
  ORIGIN: 'https://unseon.co.kr',       // ← 실제 도메인으로 변경
  get APPROVAL_URL() { return `${this.ORIGIN}/payment-complete.html?result=success`; },
  get FAIL_URL()     { return `${this.ORIGIN}/payment-complete.html?result=fail`; },
  get CANCEL_URL()   { return `${this.ORIGIN}/payment-complete.html?result=cancel`; },
};

const IS_TEST_MODE = KAKAO_CONFIG.IS_TEST;
const KAKAO_CID    = KAKAO_CONFIG.CID;
const SITE_ORIGIN  = KAKAO_CONFIG.ORIGIN;

/* ──────────────────────────────────────────── */
/*  결제 플랜 정의 (카카오페이 1회 최대 50,000원)*/
/* ──────────────────────────────────────────── */

const PLANS = {
  /* ── 1회 결제 플랜 (50,000원 이하) ── */
  plan5: {
    name:   '5,000P 충전',
    amount: 5000,
    point:  5000,
    bonus:  0,
    desc:   '5,000P 충전',
    badge:  '',
    color:  '',
    times:  1   // 결제 횟수
  },
  plan10: {
    name:   '10,000P 충전',
    amount: 10000,
    point:  10000,
    bonus:  0,
    desc:   '10,000P 충전',
    badge:  '',
    color:  '',
    times:  1
  },
  plan20: {
    name:   '22,000P 충전',
    amount: 20000,
    point:  22000,
    bonus:  2000,
    desc:   '22,000P 충전 (+2,000P 보너스)',
    badge:  '인기',
    color:  '',
    times:  1
  },
  plan30: {
    name:   '36,000P 충전',
    amount: 30000,
    point:  36000,
    bonus:  6000,
    desc:   '36,000P 충전 (+6,000P 보너스)',
    badge:  '',
    color:  '',
    times:  1
  },
  plan50: {
    name:   '60,000P 충전',
    amount: 50000,
    point:  60000,
    bonus:  10000,
    desc:   '60,000P 충전 (+10,000P 보너스)',
    badge:  '최대 단일 결제',
    color:  'gold',
    times:  1
  },

};

/* ──────────────────────────────────────────── */
/*  관리자 정책 적용 (admin.js savePricing 연동) */
/* ──────────────────────────────────────────── */
function applyAdminPolicy() {
  try {
    const raw = localStorage.getItem('sajuon_policy');
    if (!raw) return;
    const p = JSON.parse(raw);

    // ── 1회 결제 플랜 ──
    if (p.plan5Amt  !== undefined) { PLANS.plan5.amount  = p.plan5Amt;  PLANS.plan5.point  = p.plan5Pt  || PLANS.plan5.point;  PLANS.plan5.bonus  = p.plan5Bonus  ?? PLANS.plan5.bonus; }
    if (p.plan10Amt !== undefined) { PLANS.plan10.amount = p.plan10Amt; PLANS.plan10.point = p.plan10Pt || PLANS.plan10.point; PLANS.plan10.bonus = p.plan10Bonus ?? PLANS.plan10.bonus; }
    if (p.plan20Amt !== undefined) { PLANS.plan20.amount = p.plan20Amt; PLANS.plan20.point = p.plan20Pt || PLANS.plan20.point; PLANS.plan20.bonus = p.plan20Bonus ?? PLANS.plan20.bonus; }
    if (p.plan30Amt !== undefined) { PLANS.plan30.amount = p.plan30Amt; PLANS.plan30.point = p.plan30Pt || PLANS.plan30.point; PLANS.plan30.bonus = p.plan30Bonus ?? PLANS.plan30.bonus; }
    if (p.plan50Amt !== undefined) { PLANS.plan50.amount = p.plan50Amt; PLANS.plan50.point = p.plan50Pt || PLANS.plan50.point; PLANS.plan50.bonus = p.plan50Bonus ?? PLANS.plan50.bonus; }

  } catch(e) {
    console.warn('[kakaopay] applyAdminPolicy 실패:', e);
  }
}

/* ──────────────────────────────────────────── */
/*  상태                                        */
/* ──────────────────────────────────────────── */
let selectedPlan        = null;

/* ──────────────────────────────────────────── */
/*  유틸                                        */
/* ──────────────────────────────────────────── */

function generateOrderId() {
  const now  = Date.now();
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `UNSEON_${now}_${rand}`;
}

function getCurrentUserInfo() {
  try {
    const u = JSON.parse(localStorage.getItem('sajuon_current_user') || 'null');
    return u && u.id ? u : null;
  } catch { return null; }
}

/* 토스트 메시지 */
function showKakaoToast(msg, type = 'info') {
  const colors = { info: '#1b5e20', error: '#c62828', success: '#2e7d32', warn: '#e65100' };
  const t = document.createElement('div');
  t.className = 'kp-toast';
  t.textContent = msg;
  t.style.background = colors[type] || colors.info;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, 3500);
}

/* ──────────────────────────────────────────── */
/*  로그인 체크                                 */
/* ──────────────────────────────────────────── */

function requireLoginForPayment() {
  const user = getCurrentUserInfo();
  if (!user) {
    sessionStorage.setItem('sajuon_auth_redirect', 'pricing.html');
    showLoginRequiredModal();
    return false;
  }
  return true;
}

function showLoginRequiredModal() {
  let modal = document.getElementById('loginRequiredModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'loginRequiredModal';
    modal.className = 'modal-overlay kp-modal-overlay';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:40px 32px;max-width:380px;width:92%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2)">
        <div style="font-size:3rem;margin-bottom:12px">🔐</div>
        <h3 style="font-size:1.25rem;font-weight:700;color:#1a1a2e;margin-bottom:8px">로그인이 필요합니다</h3>
        <p style="font-size:0.9rem;color:#666;margin-bottom:8px">포인트 충전은 회원만 이용 가능합니다.</p>
        <p style="font-size:0.85rem;color:#999;margin-bottom:28px">가입 즉시 <strong style="color:#2e7d32">500P 무료</strong> 지급!</p>
        <div style="display:flex;gap:10px;justify-content:center">
          <a href="auth.html?tab=register" style="flex:1;padding:12px;background:#1b5e20;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:0.92rem">
            <i class="fas fa-user-plus"></i> 회원가입
          </a>
          <a href="auth.html" style="flex:1;padding:12px;background:#f5f5f5;color:#333;border-radius:10px;text-decoration:none;font-weight:600;font-size:0.92rem;border:1.5px solid #ddd">
            <i class="fas fa-sign-in-alt"></i> 로그인
          </a>
        </div>
        <button onclick="document.getElementById('loginRequiredModal').remove()"
          style="margin-top:14px;background:none;border:none;color:#aaa;font-size:0.82rem;cursor:pointer">닫기</button>
      </div>`;
    document.body.appendChild(modal);
  } else {
    modal.style.display = 'flex';
  }
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  }, { once: true });
}

/* ──────────────────────────────────────────── */
/*  플랜 선택                                   */
/* ──────────────────────────────────────────── */

function selectPlan(planKey) {
  selectedPlan = planKey;
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`[data-plan="${planKey}"]`);
  if (card) card.classList.add('selected');
}

/* ──────────────────────────────────────────── */
/*  결제 시작 진입점                            */
/* ──────────────────────────────────────────── */

function startKakaoPay(planKey) {
  const plan = PLANS[planKey];
  if (!plan) { showKakaoToast('❌ 플랜 정보를 찾을 수 없습니다.', 'error'); return; }
  if (!requireLoginForPayment()) return;
  selectedPlan = planKey;

  showPaymentModal(plan);
}

/* ──────────────────────────────────────────── */
/*  결제 확인 모달                              */
/* ──────────────────────────────────────────── */

function showPaymentModal(plan) {
  const modal = document.getElementById('kakaoPayModal');
  if (!modal) return;

  /* 분할 진행바 제거 (단일 결제용) */
  const prev = document.getElementById('kp_splitProgress');
  if (prev) prev.remove();

  document.getElementById('kp_planName').textContent = plan.name;
  document.getElementById('kp_amount').textContent   = '₩' + plan.amount.toLocaleString();
  document.getElementById('kp_point').textContent    = plan.point.toLocaleString() + 'P';
  document.getElementById('kp_bonus').textContent    = plan.bonus > 0
    ? `+${plan.bonus.toLocaleString()}P ✨`
    : '없음';

  const testBadge = document.getElementById('kp_testBadge');
  if (testBadge) testBadge.style.display = KAKAO_CONFIG.IS_TEST ? 'flex' : 'none';

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeKakaoModal() {
  const modal = document.getElementById('kakaoPayModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────── */
/*  requestKakaoPay — 모달 "결제하기" 클릭     */
/* ──────────────────────────────────────────── */

function requestKakaoPay() {
  if (!selectedPlan) return;
  const plan = PLANS[selectedPlan];
  if (!plan) return;
  closeKakaoModal();

  if (KAKAO_CONFIG.IS_TEST) {
    runTestPayment(plan);
  } else {
    runRealKakaoPay(plan);
  }
}

/* ──────────────────────────────────────────── */
/*  테스트 결제 시뮬레이션                      */
/* ──────────────────────────────────────────── */

function runTestPayment(plan) {
  const orderId = generateOrderId();
  showLoadingOverlay('카카오페이 결제창 연결 중...');
  setTimeout(() => {
    hideLoadingOverlay();
    showKakaoTestWindow(plan, orderId);
  }, 1000);
}

function showKakaoTestWindow(plan, orderId) {
  const popup = document.getElementById('kakaoTestPopup');
  if (!popup) return;

  document.getElementById('kt_amount').textContent   = '₩' + plan.amount.toLocaleString();
  document.getElementById('kt_planName').textContent = plan.name;
  document.getElementById('kt_point').textContent    = plan.point.toLocaleString() + 'P';
  document.getElementById('kt_orderId').textContent  = orderId;

  popup.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  sessionStorage.setItem('kakao_pending_plan', JSON.stringify({
    planKey: selectedPlan, plan, orderId
  }));
}

function closeTestPopup() {
  const popup = document.getElementById('kakaoTestPopup');
  if (popup) popup.style.display = 'none';
  document.body.style.overflow = '';
  sessionStorage.removeItem('kakao_pending_plan');
}

function approveTestPayment() {
  const pending = JSON.parse(sessionStorage.getItem('kakao_pending_plan') || 'null');
  if (!pending) return;

  const popup = document.getElementById('kakaoTestPopup');
  if (popup) popup.style.display = 'none';
  showLoadingOverlay('결제 승인 처리 중...');

  setTimeout(() => {
    hideLoadingOverlay();
    completePayment(pending.plan, pending.orderId, 'KAKAO_TEST_' + Date.now());
  }, 1000);
}

/* ──────────────────────────────────────────── */
/*  실서비스 카카오페이 결제                    */
/* ──────────────────────────────────────────── */

function runRealKakaoPay(plan) {
  const orderId     = generateOrderId();
  const currentUser = getCurrentUserInfo();

  sessionStorage.setItem('kakao_pending_plan', JSON.stringify({
    planKey: selectedPlan, plan, orderId
  }));
  sessionStorage.setItem('kakao_order_id', orderId);

  showLoadingOverlay('카카오페이 연결 중...');

  /* 현재: SDK/백엔드 미구성 → 테스트 모드로 폴백 */
  setTimeout(() => {
    hideLoadingOverlay();
    showKakaoToast('⚙️ 결제 서버 연동 전입니다. 테스트 모드로 진행합니다.', 'warn');
    setTimeout(() => runTestPayment(plan), 600);
  }, 800);
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

/* ──────────────────────────────────────────── */
/*  결제 완료 처리 (단일/분할 통합)             */
/* ──────────────────────────────────────────── */

function completePayment(plan, orderId, pgToken) {
  const currentUser = getCurrentUserInfo();
  const currentPts  = parseInt(localStorage.getItem('sajuon_points') || '0', 10);
  const newPts      = currentPts + plan.point;
  const isTest      = !pgToken || String(pgToken).startsWith('KAKAO_TEST_');

  /* ① localStorage 즉시 반영 */
  localStorage.setItem('sajuon_points', String(newPts));
  if (currentUser) {
    localStorage.setItem('sajuon_current_user', JSON.stringify({ ...currentUser, points: newPts }));
  }

  /* ② DB 포인트 업데이트 + 이력 */
  if (currentUser && currentUser.id) {
    fetch('tables/users/' + currentUser.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: newPts })
    }).catch(e => console.warn('[Payment] DB 포인트 업데이트 실패:', e));

    fetch('tables/point_history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id:     currentUser.id,
        email:       currentUser.email || '',
        type:        'charge',
        amount:      plan.point,
        balance:     newPts,
        description: `카카오페이 · ${plan.name}` + (plan.bonus > 0 ? ` (+${plan.bonus.toLocaleString()}P 보너스)` : ''),
        category:    isTest ? 'kakaopay_test' : 'kakaopay'
      })
    }).catch(e => console.warn('[Payment] DB 이력 저장 실패:', e));
  }

  /* ③ localStorage 이용내역 병행 저장 */
  const hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
  hist.unshift({
    date:    new Date().toLocaleString('ko-KR'),
    type:    '충전',
    point:   `+${plan.point.toLocaleString()}P`,
    memo:    `카카오페이 · ${plan.name}` + (plan.bonus > 0 ? ` (+${plan.bonus.toLocaleString()}P 보너스)` : ''),
    orderId,
    amount:  plan.point,
    userId:  currentUser ? currentUser.id : null,
    pgToken: pgToken || 'test',
    status:  isTest ? '테스트완료' : '결제완료'
  });
  localStorage.setItem('sajuon_history', JSON.stringify(hist));

  /* ④ UI 즉시 갱신 */
  const headerPt = document.getElementById('headerPointVal');
  if (headerPt) headerPt.textContent = newPts.toLocaleString();
  const myPt = document.getElementById('myPointVal');
  if (myPt) myPt.textContent = newPts.toLocaleString() + 'P';

  /* ⑤ 단건 결제 완료 */
  showSuccessModal(plan, newPts, orderId, isTest);

  /* ⑥ 이용 내역 새로고침 */
  if (typeof renderHistory === 'function') renderHistory();

  /* ⑦ 세션 정리 */
  sessionStorage.removeItem('kakao_pending_plan');
  sessionStorage.removeItem('kakao_tid');
  sessionStorage.removeItem('kakao_order_id');
}

/* ──────────────────────────────────────────── */
/*  성공 모달                                   */
/* ──────────────────────────────────────────── */

function showSuccessModal(plan, totalPts, orderId, isTest) {
  const modal = document.getElementById('successModal');
  if (!modal) return;

  const body = document.getElementById('successBody');
  if (body) {
    body.innerHTML = `
      ${isTest ? `
        <div style="background:#fff3cd;color:#856404;font-size:0.8rem;padding:10px 14px;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;gap:8px">
          <i class="fas fa-flask"></i> 테스트 결제입니다 (실제 결제 아님)
        </div>` : ''}
      <div class="success-detail">
        <div class="success-row">
          <span>결제 금액</span>
          <strong>₩${plan.amount.toLocaleString()}</strong>
        </div>
        <div class="success-row">
          <span>지급 포인트</span>
          <strong class="point-highlight">+${plan.point.toLocaleString()}P</strong>
        </div>
        ${plan.bonus > 0 ? `
        <div class="success-row bonus-row">
          <span>보너스 포인트</span>
          <strong>+${plan.bonus.toLocaleString()}P ✨</strong>
        </div>` : ''}
        <div class="success-row total-row">
          <span>현재 보유 포인트</span>
          <strong>${totalPts.toLocaleString()}P</strong>
        </div>
      </div>
      <div style="font-size:0.75rem;color:#aaa;margin-top:10px">주문번호: ${orderId}</div>
    `;
  }

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────── */
/*  로딩 오버레이                               */
/* ──────────────────────────────────────────── */

function showLoadingOverlay(msg) {
  let el = document.getElementById('kakaoLoadingOverlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'kakaoLoadingOverlay';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center';
    el.innerHTML = `
      <div style="background:#fff;border-radius:20px;padding:40px 36px;text-align:center;min-width:260px;box-shadow:0 20px 60px rgba(0,0,0,0.25)">
        <div style="width:52px;height:52px;border:5px solid #FFE812;border-top-color:#3A1D1D;border-radius:50%;animation:kp-spin 0.7s linear infinite;margin:0 auto 18px"></div>
        <p id="kp_loading_msg" style="font-size:1rem;font-weight:600;color:#1a1a2e;margin:0">처리 중...</p>
        <p style="font-size:0.8rem;color:#aaa;margin-top:6px">잠시만 기다려주세요</p>
      </div>`;
    if (!document.getElementById('kp-spin-style')) {
      const s = document.createElement('style');
      s.id = 'kp-spin-style';
      s.textContent = '@keyframes kp-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
  }
  const msgEl = document.getElementById('kp_loading_msg');
  if (msgEl) msgEl.textContent = msg || '처리 중...';
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideLoadingOverlay() {
  const el = document.getElementById('kakaoLoadingOverlay');
  if (el) el.style.display = 'none';
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────── */
/*  결제 완료 페이지 복귀 처리                  */
/* ──────────────────────────────────────────── */

function handlePaymentReturn() {
  const params  = new URLSearchParams(window.location.search);
  const result  = params.get('result');
  const pgToken = params.get('pg_token');

  if (!result) return;

  const pending = JSON.parse(sessionStorage.getItem('kakao_pending_plan') || 'null');

  if (result === 'success' && pending) {
    completePayment(pending.plan, pending.orderId,
      pgToken || 'KAKAO_TEST_' + Date.now());
  } else if (result === 'fail') {
    showKakaoToast('❌ 결제에 실패했습니다. 다시 시도해주세요.', 'error');
    sessionStorage.removeItem('kakao_pending_plan');
  } else if (result === 'cancel') {
    showKakaoToast('결제가 취소되었습니다.', 'info');
    sessionStorage.removeItem('kakao_pending_plan');
  }

  window.history.replaceState({}, '', window.location.pathname);
}

/* ──────────────────────────────────────────── */
/*  직접 금액 입력 결제 (50,000원 이하 제한)   */
/* ──────────────────────────────────────────── */

function startCustomAmount() {
  const input  = document.getElementById('customAmountInput');
  if (!input) return;
  const amount = parseInt(input.value.replace(/,/g, ''), 10);

  if (isNaN(amount) || amount < 1000) {
    showKakaoToast('❌ 최소 1,000원 이상 입력해주세요.', 'error');
    input.focus();
    return;
  }
  if (amount > 50000) {
    showKakaoToast('❌ 카카오페이 1회 최대 50,000원까지 결제 가능합니다.', 'error');
    input.value = '50,000';
    updateBonusPreview(50000);
    return;
  }
  if (!requireLoginForPayment()) return;

  const bonus = amount >= 50000 ? Math.floor(amount * 0.2)
              : amount >= 30000 ? Math.floor(amount * 0.15)
              : amount >= 20000 ? Math.floor(amount * 0.1)
              : 0;

  PLANS['custom'] = {
    name:   `${amount.toLocaleString()}원 직접 충전`,
    amount: amount,
    point:  amount + bonus,
    bonus:  bonus,
    desc:   `${(amount + bonus).toLocaleString()}P 충전`,
    times:  1
  };
  selectedPlan = 'custom';
  showPaymentModal(PLANS['custom']);
}

function formatAmountInput(input) {
  const val = input.value.replace(/[^0-9]/g, '');
  if (val) {
    let num = parseInt(val, 10);
    if (num > 50000) num = 50000;  /* 50,000원 초과 입력 방지 */
    updateBonusPreview(num);
    input.value = num.toLocaleString();
  } else {
    input.value = '';
    updateBonusPreview(0);
  }
}

function updateBonusPreview(amount) {
  const preview = document.getElementById('customBonusPreview');
  if (!preview) return;

  if (amount >= 50000) {
    const b = Math.floor(amount * 0.2);
    preview.innerHTML = `✨ <strong>${(amount + b).toLocaleString()}P</strong> 지급 (+${b.toLocaleString()}P 보너스 20%)`;
    preview.style.color = '#2e7d32';
  } else if (amount >= 30000) {
    const b = Math.floor(amount * 0.15);
    preview.innerHTML = `✨ <strong>${(amount + b).toLocaleString()}P</strong> 지급 (+${b.toLocaleString()}P 보너스 15%)`;
    preview.style.color = '#2e7d32';
  } else if (amount >= 20000) {
    const b = Math.floor(amount * 0.1);
    preview.innerHTML = `✨ <strong>${(amount + b).toLocaleString()}P</strong> 지급 (+${b.toLocaleString()}P 보너스 10%)`;
    preview.style.color = '#2e7d32';
  } else if (amount >= 1000) {
    preview.innerHTML = `<strong>${amount.toLocaleString()}P</strong> 지급`;
    preview.style.color = '#555';
  } else {
    preview.innerHTML = '';
  }
}

/* ──────────────────────────────────────────── */
/*  DOMContentLoaded 초기화                     */
/* ──────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  // ★ 관리자 페이지에서 저장한 정책을 PLANS에 반영
  applyAdminPolicy();

  handlePaymentReturn();

  const testBanner = document.getElementById('testModeBanner');
  if (testBanner) testBanner.style.display = KAKAO_CONFIG.IS_TEST ? 'flex' : 'none';

  document.getElementById('kakaoPayModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeKakaoModal();
  });
  document.getElementById('successModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeSuccessModal();
  });
  document.getElementById('kakaoTestPopup')?.addEventListener('click', function(e) {
    if (e.target === this) closeTestPopup();
  });

  document.getElementById('customAmountInput')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') startCustomAmount();
  });
});
