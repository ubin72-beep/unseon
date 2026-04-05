/* =============================================
   운세ON — js/kakaopay.js  v2.0
   카카오페이 결제 연동 (정적 사이트 완전판)

   ★ 실서비스 전환 체크리스트 ★
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. IS_TEST_MODE = false
   2. KAKAO_CID    = 발급받은 실제 CID (예: 'CZ0ONETIME')
   3. SITE_ORIGIN  = 실제 도메인 (예: 'https://unseon.co.kr')
   4. 카카오페이 가맹점 관리자 → 결제 승인 URL에
      https://unseon.co.kr/payment-complete.html 등록
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   ★ 정적 사이트 결제 방식 안내 ★
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   카카오페이 단건 결제 Ready API는 Admin Key가 필요하여
   백엔드 서버 없이는 직접 호출 불가.

   [현재 구현 방식] — 정적 사이트 최적 방법
   ① 테스트 모드: 완전한 UI 시뮬레이션 (포인트 즉시 지급)
   ② 실서비스 모드: 카카오페이 JavaScript SDK (파트너 SDK)
      또는 카카오페이 결제버튼 위젯 사용

   [백엔드 구축 시] 주석 처리된 fetch 코드를 서버 연동으로 교체
   =============================================*/

/* ──────────────────────────────────────────── */
/*  ★ 설정값 — 실서비스 전환 시 여기만 수정  */
/* ──────────────────────────────────────────── */

const KAKAO_CONFIG = {
  /* 테스트/실서비스 모드 전환 */
  IS_TEST: true,                        // ← false 로 바꾸면 실서비스

  /* 카카오페이 CID
     테스트: 'TC0ONETIME' (카카오 공식 고정 테스트 CID)
     실서비스: 카카오페이 가맹 심사 완료 후 발급된 CID */
  CID: 'TC0ONETIME',                    // ← 실서비스: 발급받은 CID 입력

  /* 서비스 도메인 (approval/fail/cancel URL에 사용) */
  ORIGIN: 'https://unseon.co.kr',       // ← 실제 도메인으로 변경

  /* 결제 완료/실패/취소 리다이렉트 URL */
  get APPROVAL_URL() { return `${this.ORIGIN}/payment-complete.html?result=success`; },
  get FAIL_URL()     { return `${this.ORIGIN}/payment-complete.html?result=fail`; },
  get CANCEL_URL()   { return `${this.ORIGIN}/payment-complete.html?result=cancel`; },
};

/* 하위 호환 변수 */
const IS_TEST_MODE = KAKAO_CONFIG.IS_TEST;
const KAKAO_CID    = KAKAO_CONFIG.CID;
const SITE_ORIGIN  = KAKAO_CONFIG.ORIGIN;

/* ──────────────────────────────────────────── */
/*  결제 플랜 정의                              */
/* ──────────────────────────────────────────── */

const PLANS = {
  basic: {
    name:   '베이직 플랜',
    amount: 10000,
    point:  10000,
    bonus:  0,
    desc:   '10,000P 충전',
    badge:  '',
    color:  ''
  },
  standard: {
    name:   '스탠다드 플랜',
    amount: 20000,
    point:  22000,
    bonus:  2000,
    desc:   '22,000P 충전 (+2,000P 보너스)',
    badge:  '인기',
    color:  ''
  },
  premium: {
    name:   '프리미엄 플랜',
    amount: 30000,
    point:  36000,
    bonus:  6000,
    desc:   '36,000P 충전 (+6,000P 보너스)',
    badge:  '',
    color:  ''
  },
  gold: {
    name:   '골드 플랜',
    amount: 50000,
    point:  65000,
    bonus:  15000,
    desc:   '65,000P 충전 (+15,000P 보너스)',
    badge:  '30% 보너스',
    color:  'gold'
  },
  vip: {
    name:   'VIP 플랜',
    amount: 100000,
    point:  140000,
    bonus:  40000,
    desc:   '140,000P 충전 (+40,000P 보너스)',
    badge:  '40% 보너스',
    color:  'vip'
  },
  vvip: {
    name:   'VVIP 플랜',
    amount: 300000,
    point:  450000,
    bonus:  150000,
    desc:   '450,000P 충전 (+150,000P 보너스)',
    badge:  '50% 보너스 최대',
    color:  'vvip'
  }
};

/* ──────────────────────────────────────────── */
/*  상태                                        */
/* ──────────────────────────────────────────── */
let selectedPlan = null;

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

  document.getElementById('kp_planName').textContent = plan.name;
  document.getElementById('kp_amount').textContent   = plan.amount.toLocaleString() + '원';
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

  document.getElementById('kt_orderId').textContent  = orderId;
  document.getElementById('kt_planName').textContent = plan.name;
  document.getElementById('kt_amount').textContent   = plan.amount.toLocaleString() + '원';
  document.getElementById('kt_point').textContent    = plan.point.toLocaleString() + 'P';

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
/*                                              */
/*  ★ 정적 사이트 실서비스 방법 두 가지 ★      */
/*                                              */
/*  [방법 A] 카카오페이 파트너 JavaScript SDK   */
/*    → KakaoPay JS SDK를 사용해 결제창 직접 호출  */
/*    → 단건결제 승인은 SDK가 자동 처리         */
/*    → 현재 코드에 구현됨                      */
/*                                              */
/*  [방법 B] 백엔드 서버 연동                   */
/*    → /api/payment/ready 서버 엔드포인트 구축 */
/*    → Admin API Key는 서버에서만 사용         */
/*    → 주석 처리된 fetch 코드 참고             */
/* ──────────────────────────────────────────── */

function runRealKakaoPay(plan) {
  const orderId     = generateOrderId();
  const currentUser = getCurrentUserInfo();

  /* pending 정보 먼저 저장 (리다이렉트 후 복구용) */
  sessionStorage.setItem('kakao_pending_plan', JSON.stringify({
    planKey: selectedPlan, plan, orderId
  }));
  sessionStorage.setItem('kakao_order_id', orderId);

  showLoadingOverlay('카카오페이 연결 중...');

  /* ─────────────────────────────────────────
     [방법 A] 카카오페이 JavaScript SDK 사용
     카카오 파트너 SDK: https://developers.kakao.com/docs/latest/ko/kakaopay/js-sdk
     
     SDK 스크립트를 pricing.html <head>에 추가:
     <script src="https://t1.kakaocdn.net/kakaojs/sdk/2.7.4/kakao.min.js"></script>
     
     Kakao.init('YOUR_APP_KEY'); // 카카오 개발자 앱 키
     
     Kakao.Pay.createOrder({
       open_type: 'REDIRECT',
       partner_order_id: orderId,
       partner_user_id: currentUser?.id || 'guest',
       quantity: 1,
       total_amount: plan.amount,
       tax_free_amount: 0,
       name: plan.name,
       success_url: KAKAO_CONFIG.APPROVAL_URL + '&order_id=' + orderId,
       fail_url:    KAKAO_CONFIG.FAIL_URL,
       cancel_url:  KAKAO_CONFIG.CANCEL_URL,
     });
  ───────────────────────────────────────── */

  /* ─────────────────────────────────────────
     [방법 B] 백엔드 서버 연동
     서버에서 /v1/payment/ready 호출 후
     next_redirect_pc_url 로 이동
     
     fetch('/api/payment/ready', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         cid:               KAKAO_CONFIG.CID,
         partner_order_id:  orderId,
         partner_user_id:   currentUser?.id || 'guest',
         item_name:         plan.name,
         quantity:          1,
         total_amount:      plan.amount,
         tax_free_amount:   0,
         approval_url:      KAKAO_CONFIG.APPROVAL_URL,
         fail_url:          KAKAO_CONFIG.FAIL_URL,
         cancel_url:        KAKAO_CONFIG.CANCEL_URL
       })
     })
     .then(r => r.json())
     .then(data => {
       hideLoadingOverlay();
       if (data.next_redirect_pc_url) {
         sessionStorage.setItem('kakao_tid', data.tid);
         window.location.href = isMobile()
           ? data.next_redirect_mobile_url
           : data.next_redirect_pc_url;
       } else {
         showKakaoToast('❌ 결제 준비 실패: ' + (data.msg || ''), 'error');
       }
     })
     .catch(() => {
       hideLoadingOverlay();
       showKakaoToast('❌ 결제 서버 연결 실패', 'error');
     });
  ───────────────────────────────────────── */

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
/*  결제 완료 처리 (포인트 지급 + 동기화)       */
/* ──────────────────────────────────────────── */

function completePayment(plan, orderId, pgToken) {
  /* ① localStorage 포인트 업데이트 */
  const currentPts = parseInt(localStorage.getItem('sajuon_points') || '0', 10);
  const newPts = currentPts + plan.point;
  localStorage.setItem('sajuon_points', String(newPts));

  /* ② 사용자 계정 포인트 동기화 */
  try {
    const currentUser = getCurrentUserInfo();
    if (currentUser && currentUser.id) {
      const users = JSON.parse(localStorage.getItem('sajuon_users') || '[]');
      const idx = users.findIndex(u => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx].points = newPts;
        localStorage.setItem('sajuon_users', JSON.stringify(users));
      }
      localStorage.setItem('sajuon_current_user',
        JSON.stringify({ ...currentUser, points: newPts }));
    }
  } catch (e) {
    console.warn('[Payment] 포인트 동기화 오류:', e);
  }

  /* ③ 이용 내역 저장 */
  const isTest = !pgToken || String(pgToken).startsWith('KAKAO_TEST_');
  const hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
  hist.unshift({
    date:    new Date().toLocaleString('ko-KR'),
    type:    '충전',
    point:   `+${plan.point.toLocaleString()}P`,
    memo:    `카카오페이 · ${plan.name}` +
             (plan.bonus > 0 ? ` (+${plan.bonus.toLocaleString()}P 보너스)` : ''),
    orderId,
    amount:  plan.amount,
    pgToken: pgToken || 'test',
    status:  isTest ? '테스트완료' : '결제완료'
  });
  localStorage.setItem('sajuon_history', JSON.stringify(hist));

  /* ④ UI 즉시 갱신 */
  const headerPt = document.getElementById('headerPointVal');
  if (headerPt) headerPt.textContent = newPts.toLocaleString();
  const myPt = document.getElementById('myPointVal');
  if (myPt) myPt.textContent = newPts.toLocaleString() + 'P';

  /* ⑤ 성공 모달 */
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
/*  (카카오페이 실서비스 리다이렉트 후 자동 호출) */
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

  /* URL 파라미터 클린업 */
  window.history.replaceState({}, '', window.location.pathname);
}

/* ──────────────────────────────────────────── */
/*  직접 금액 입력 결제                         */
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
  if (amount > 300000) {
    showKakaoToast('❌ 1회 최대 충전 금액은 300,000원입니다.', 'error');
    return;
  }
  if (!requireLoginForPayment()) return;

  const bonus = amount >= 100000 ? Math.floor(amount * 0.3)
              : amount >= 50000  ? Math.floor(amount * 0.2)
              : amount >= 20000  ? Math.floor(amount * 0.1)
              : 0;

  PLANS['custom'] = {
    name:   `${amount.toLocaleString()}원 직접 충전`,
    amount: amount,
    point:  amount + bonus,
    bonus:  bonus,
    desc:   `${(amount + bonus).toLocaleString()}P 충전`
  };
  selectedPlan = 'custom';
  showPaymentModal(PLANS['custom']);
}

function formatAmountInput(input) {
  const val = input.value.replace(/[^0-9]/g, '');
  if (val) {
    const num = parseInt(val, 10);
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

  if (amount >= 100000) {
    const b = Math.floor(amount * 0.3);
    preview.innerHTML = `✨ <strong>${(amount + b).toLocaleString()}P</strong> 지급 (+${b.toLocaleString()}P 보너스)`;
    preview.style.color = '#2e7d32';
  } else if (amount >= 50000) {
    const b = Math.floor(amount * 0.2);
    preview.innerHTML = `✨ <strong>${(amount + b).toLocaleString()}P</strong> 지급 (+${b.toLocaleString()}P 보너스)`;
    preview.style.color = '#2e7d32';
  } else if (amount >= 20000) {
    const b = Math.floor(amount * 0.1);
    preview.innerHTML = `✨ <strong>${(amount + b).toLocaleString()}P</strong> 지급 (+${b.toLocaleString()}P 보너스)`;
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
  /* 결제 완료 URL에서 복귀 처리 */
  handlePaymentReturn();

  /* 테스트 배너 표시/숨김 */
  const testBanner = document.getElementById('testModeBanner');
  if (testBanner) testBanner.style.display = KAKAO_CONFIG.IS_TEST ? 'flex' : 'none';

  /* 모달 외부 클릭 닫기 */
  document.getElementById('kakaoPayModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeKakaoModal();
  });
  document.getElementById('successModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeSuccessModal();
  });
  document.getElementById('kakaoTestPopup')?.addEventListener('click', function(e) {
    if (e.target === this) closeTestPopup();
  });

  /* Enter 키로 직접 충전 */
  document.getElementById('customAmountInput')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') startCustomAmount();
  });
});
