/* =============================================
   운세ON — js/kakaopay.js
   카카오페이 결제 연동 (테스트 모드)
   =============================================
   ★ 실서비스 전환 시:
     KAKAO_CLIENT_ID 를 실제 CID 로 교체
     IS_TEST_MODE = false 로 변경
   ============================================= */

const IS_TEST_MODE = true;

// ★ 카카오페이 테스트 CID (공식 테스트용 고정값)
// 실서비스: 카카오페이 가맹 후 발급받은 실제 CID 로 교체
const KAKAO_CID = IS_TEST_MODE ? 'TC0ONETIME' : '여기에_실제_CID_입력';

// 결제 플랜 정의
const PLANS = {
  basic: {
    name: '베이직 플랜',
    amount: 10000,
    point: 10000,
    bonus: 0,
    desc: '10,000P 충전'
  },
  standard: {
    name: '스탠다드 플랜',
    amount: 20000,
    point: 22000,
    bonus: 2000,
    desc: '22,000P 충전 (+2,000P 보너스)'
  },
  premium: {
    name: '프리미엄 플랜',
    amount: 30000,
    point: 36000,
    bonus: 6000,
    desc: '36,000P 충전 (+6,000P 보너스)'
  },
  manual_5000: {
    name: '5,000원 충전',
    amount: 5000,
    point: 5000,
    bonus: 0,
    desc: '5,000P 충전'
  },
  manual_50000: {
    name: '50,000원 충전',
    amount: 50000,
    point: 60000,
    bonus: 10000,
    desc: '60,000P 충전 (+10,000P 보너스)'
  },
  manual_100000: {
    name: '100,000원 충전',
    amount: 100000,
    point: 130000,
    bonus: 30000,
    desc: '130,000P 충전 (+30,000P 보너스)'
  }
};

/* ── 현재 선택된 플랜 ── */
let selectedPlan = null;
let kakaoPayReady = false;

/* ── 카카오 SDK 로드 확인 ── */
function checkKakaoSDK() {
  return typeof Kakao !== 'undefined' && Kakao.isInitialized();
}

/* ── 주문번호 생성 ── */
function generateOrderId() {
  const now = Date.now();
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `UNSEON_${now}_${rand}`;
}

/* ── 플랜 선택 ── */
function selectPlan(planKey) {
  selectedPlan = planKey;
  // 카드 활성화 표시
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`[data-plan="${planKey}"]`);
  if (card) card.classList.add('selected');
}

/* ── 카카오페이 결제 시작 ── */
function startKakaoPay(planKey) {
  const plan = PLANS[planKey];
  if (!plan) { alert('플랜 정보를 찾을 수 없습니다.'); return; }

  selectedPlan = planKey;

  // 결제 확인 모달 표시
  showPaymentModal(plan);
}

/* ── 결제 확인 모달 ── */
function showPaymentModal(plan) {
  const modal = document.getElementById('kakaoPayModal');
  if (!modal) return;

  document.getElementById('kp_planName').textContent = plan.name;
  document.getElementById('kp_amount').textContent = plan.amount.toLocaleString() + '원';
  document.getElementById('kp_point').textContent = plan.point.toLocaleString() + 'P';
  document.getElementById('kp_bonus').textContent = plan.bonus > 0 ? `+${plan.bonus.toLocaleString()}P` : '없음';

  const testBadge = document.getElementById('kp_testBadge');
  if (testBadge) testBadge.style.display = IS_TEST_MODE ? 'flex' : 'none';

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeKakaoModal() {
  const modal = document.getElementById('kakaoPayModal');
  if (modal) modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ── 실제 카카오페이 결제 요청 ── */
function requestKakaoPay() {
  if (!selectedPlan) return;
  const plan = PLANS[selectedPlan];

  closeKakaoModal();

  if (IS_TEST_MODE) {
    // ── 테스트 모드: 카카오페이 팝업 시뮬레이션 ──
    runTestPayment(plan);
  } else {
    // ── 실서비스 모드: 실제 카카오페이 SDK 호출 ──
    runRealKakaoPay(plan);
  }
}

/* ── 테스트 결제 시뮬레이션 ── */
function runTestPayment(plan) {
  const orderId = generateOrderId();

  // 로딩 오버레이 표시
  showLoadingOverlay('카카오페이 결제창 연결 중...');

  setTimeout(() => {
    hideLoadingOverlay();
    // 테스트 결제 성공 처리
    showKakaoTestWindow(plan, orderId);
  }, 1500);
}

/* ── 테스트 결제창 팝업 ── */
function showKakaoTestWindow(plan, orderId) {
  const popup = document.getElementById('kakaoTestPopup');
  if (!popup) return;

  document.getElementById('kt_orderId').textContent = orderId;
  document.getElementById('kt_planName').textContent = plan.name;
  document.getElementById('kt_amount').textContent = plan.amount.toLocaleString() + '원';
  document.getElementById('kt_point').textContent = plan.point.toLocaleString() + 'P';

  popup.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // 저장: 결제 진행 중 플랜 정보
  sessionStorage.setItem('kakao_pending_plan', JSON.stringify({ planKey: selectedPlan, plan, orderId }));
}

function closeTestPopup() {
  document.getElementById('kakaoTestPopup').style.display = 'none';
  document.body.style.overflow = '';
  sessionStorage.removeItem('kakao_pending_plan');
}

/* ── 테스트 결제 승인 ── */
function approveTestPayment() {
  const pending = JSON.parse(sessionStorage.getItem('kakao_pending_plan') || 'null');
  if (!pending) return;

  document.getElementById('kakaoTestPopup').style.display = 'none';
  showLoadingOverlay('결제 승인 중...');

  setTimeout(() => {
    hideLoadingOverlay();
    completePayment(pending.plan, pending.orderId, 'KAKAO_TEST_' + Date.now());
  }, 1200);
}

/* ── 실서비스 카카오페이 SDK 호출 ── */
function runRealKakaoPay(plan) {
  const orderId = generateOrderId();
  const currentUser = getCurrentUserInfo();

  // ★ 실서비스 시 백엔드 API 로 결제 준비 요청 필요
  // 현재는 프론트엔드 직접 호출 (보안상 실서비스에서는 서버 경유 필수)
  fetch('https://kapi.kakao.com/v1/payment/ready', {
    method: 'POST',
    headers: {
      'Authorization': `KakaoAK ${KAKAO_CID}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      cid: KAKAO_CID,
      partner_order_id: orderId,
      partner_user_id: currentUser.id || 'guest',
      item_name: plan.name,
      quantity: 1,
      total_amount: plan.amount,
      vat_amount: Math.floor(plan.amount / 11),
      tax_free_amount: 0,
      approval_url: window.location.origin + '/payment-complete.html?result=success',
      fail_url: window.location.origin + '/payment-complete.html?result=fail',
      cancel_url: window.location.origin + '/payment-complete.html?result=cancel'
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.next_redirect_pc_url) {
      sessionStorage.setItem('kakao_tid', data.tid);
      sessionStorage.setItem('kakao_order_id', orderId);
      sessionStorage.setItem('kakao_pending_plan', JSON.stringify({ planKey: selectedPlan, plan, orderId }));
      window.location.href = data.next_redirect_pc_url;
    } else {
      alert('결제 준비 중 오류가 발생했습니다.\n' + (data.msg || ''));
    }
  })
  .catch(() => {
    alert('결제 서버 연결에 실패했습니다.\n잠시 후 다시 시도해주세요.');
  });
}

/* ── 결제 완료 처리 ── */
function completePayment(plan, orderId, pgToken) {
  // 포인트 지급
  const currentPts = parseInt(localStorage.getItem('sajuon_points') || '0', 10);
  const newPts = currentPts + plan.point;
  localStorage.setItem('sajuon_points', String(newPts));

  // 이용 내역 저장
  const hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
  hist.unshift({
    date: new Date().toLocaleString('ko-KR'),
    type: '충전',
    point: `+${plan.point.toLocaleString()}P`,
    memo: `카카오페이 · ${plan.name}${plan.bonus > 0 ? ` (보너스 +${plan.bonus.toLocaleString()}P 포함)` : ''}`,
    orderId: orderId,
    amount: plan.amount,
    pgToken: pgToken,
    status: IS_TEST_MODE ? '테스트완료' : '결제완료'
  });
  localStorage.setItem('sajuon_history', JSON.stringify(hist));

  // 헤더 포인트 업데이트
  const headerPt = document.getElementById('headerPointVal');
  if (headerPt) headerPt.textContent = newPts.toLocaleString();
  const myPt = document.getElementById('myPointVal');
  if (myPt) myPt.textContent = newPts.toLocaleString() + 'P';

  // 성공 모달
  showSuccessModal(plan, newPts, orderId);

  // 내역 새로고침
  if (typeof renderHistory === 'function') renderHistory();

  sessionStorage.removeItem('kakao_pending_plan');
  sessionStorage.removeItem('kakao_tid');
  sessionStorage.removeItem('kakao_order_id');
}

/* ── 성공 모달 ── */
function showSuccessModal(plan, totalPts, orderId) {
  const modal = document.getElementById('successModal');
  if (!modal) return;

  const body = document.getElementById('successBody');
  if (body) {
    body.innerHTML = `
      <div class="success-detail">
        <div class="success-row">
          <span>결제 금액</span>
          <strong>₩${plan.amount.toLocaleString()}</strong>
        </div>
        <div class="success-row">
          <span>지급 포인트</span>
          <strong class="point-highlight">+${plan.point.toLocaleString()}P</strong>
        </div>
        ${plan.bonus > 0 ? `<div class="success-row bonus-row"><span>보너스 포인트</span><strong>+${plan.bonus.toLocaleString()}P ✨</strong></div>` : ''}
        <div class="success-row total-row">
          <span>현재 보유 포인트</span>
          <strong>${totalPts.toLocaleString()}P</strong>
        </div>
        <div class="success-order">주문번호: ${orderId}</div>
        ${IS_TEST_MODE ? '<div class="test-notice">⚠️ 테스트 결제입니다 (실제 결제 아님)</div>' : ''}
      </div>
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

/* ── 로딩 오버레이 ── */
function showLoadingOverlay(msg) {
  let el = document.getElementById('kakaoLoadingOverlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'kakaoLoadingOverlay';
    el.innerHTML = `
      <div class="kp-loading-box">
        <div class="kp-loading-spinner"></div>
        <p id="kp_loading_msg">처리 중...</p>
      </div>`;
    document.body.appendChild(el);
  }
  document.getElementById('kp_loading_msg').textContent = msg || '처리 중...';
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideLoadingOverlay() {
  const el = document.getElementById('kakaoLoadingOverlay');
  if (el) el.style.display = 'none';
  document.body.style.overflow = '';
}

/* ── 현재 사용자 정보 ── */
function getCurrentUserInfo() {
  try {
    return JSON.parse(localStorage.getItem('sajuon_current_user') || '{}');
  } catch { return {}; }
}

/* ── 결제 완료 페이지에서 복귀 시 처리 ── */
function handlePaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const result = params.get('result');
  const pgToken = params.get('pg_token');

  if (!result) return;

  const pending = JSON.parse(sessionStorage.getItem('kakao_pending_plan') || 'null');

  if (result === 'success' && pending && pgToken) {
    completePayment(pending.plan, pending.orderId, pgToken);
  } else if (result === 'fail') {
    showFailModal();
  } else if (result === 'cancel') {
    showCancelToast();
  }

  // URL 파라미터 제거
  window.history.replaceState({}, '', window.location.pathname);
}

function showFailModal() {
  alert('결제에 실패했습니다.\n다시 시도해주세요.');
}

function showCancelToast() {
  const toast = document.createElement('div');
  toast.className = 'kp-toast';
  toast.textContent = '결제가 취소되었습니다.';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ── 직접 금액 입력 결제 ── */
function startCustomAmount() {
  const input = document.getElementById('customAmountInput');
  if (!input) return;
  const amount = parseInt(input.value.replace(/,/g, ''), 10);

  if (isNaN(amount) || amount < 1000) {
    alert('최소 1,000원 이상 입력해주세요.');
    return;
  }
  if (amount > 300000) {
    alert('1회 최대 충전 금액은 300,000원입니다.');
    return;
  }

  // 동적 플랜 생성
  const bonus = amount >= 100000 ? Math.floor(amount * 0.3)
              : amount >= 50000  ? Math.floor(amount * 0.2)
              : amount >= 20000  ? Math.floor(amount * 0.1)
              : 0;

  PLANS['custom'] = {
    name: `${amount.toLocaleString()}원 직접 충전`,
    amount: amount,
    point: amount + bonus,
    bonus: bonus,
    desc: `${(amount + bonus).toLocaleString()}P 충전`
  };

  selectedPlan = 'custom';
  startKakaoPay('custom');
}

/* ── 금액 입력 포맷팅 ── */
function formatAmountInput(input) {
  let val = input.value.replace(/[^0-9]/g, '');
  input.value = val ? parseInt(val, 10).toLocaleString() : '';
}

/* ── DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
  handlePaymentReturn();

  // 모달 외부 클릭 시 닫기
  document.getElementById('kakaoPayModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeKakaoModal();
  });
  document.getElementById('successModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeSuccessModal();
  });
  document.getElementById('kakaoTestPopup')?.addEventListener('click', function(e) {
    if (e.target === this) closeTestPopup();
  });
});
