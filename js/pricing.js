/* =========================================
   운세ON — js/pricing.js
   충전 & 이용 내역 기능
   ========================================= */

const PLANS = {
  basic:    { name: '베이직',   amount: 10000, points: 10000, bonus: 0 },
  standard: { name: '스탠다드', amount: 20000, points: 22000, bonus: 2000 },
  premium:  { name: '프리미엄', amount: 30000, points: 36000, bonus: 6000 },
};

let selectedPlan = null;

function init() {
  updateMyPoint();
  renderHistory();

  // 모바일 메뉴
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // 헤더 스크롤
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }
}

function updateMyPoint() {
  const pts = getPoints();
  const el = document.getElementById('myPointVal');
  if (el) el.textContent = pts.toLocaleString() + 'P';
  updateHeaderPoints();
}

function selectPlan(plan) {
  selectedPlan = plan;
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`[data-plan="${plan}"]`);
  if (card) card.classList.add('selected');
}

function chargePlan(plan) {
  const p = PLANS[plan];
  if (!p) return;
  selectedPlan = plan;

  // 모달 표시
  const titleEl = document.getElementById('chargeModalTitle');
  const bodyEl  = document.getElementById('chargeModalBody');
  if (titleEl) titleEl.textContent = `${p.name} 충전`;
  if (bodyEl) bodyEl.innerHTML = `
    <strong>₩${p.amount.toLocaleString()}</strong> 결제 시<br/>
    <strong style="color:var(--primary);font-size:1.2rem">${p.points.toLocaleString()}P</strong> 지급
    ${p.bonus > 0 ? ` <span style="color:var(--accent-dark);">(보너스 +${p.bonus.toLocaleString()}P 포함)</span>` : ''}<br/><br/>
    ※ 이 페이지에서는 결제 시뮬레이션이 적용됩니다.
  `;

  const confirmBtn = document.getElementById('chargeConfirmBtn');
  if (confirmBtn) {
    confirmBtn.onclick = () => confirmCharge(plan);
  }

  document.getElementById('chargeModal').style.display = 'flex';
}

function confirmCharge(plan) {
  const p = PLANS[plan];
  if (!p) return;

  const current = getPoints();
  const newPts = current + p.points;
  localStorage.setItem('sajuon_points', String(newPts));

  // 이력 저장
  const hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
  hist.unshift({
    date: new Date().toLocaleString('ko-KR'),
    type: `포인트 충전 · ${p.name}`,
    amount: p.points,
    note: `₩${p.amount.toLocaleString()} 결제`
  });
  localStorage.setItem('sajuon_history', JSON.stringify(hist));

  closeChargeModal();

  // 성공 모달
  const bodyEl = document.getElementById('successBody');
  if (bodyEl) bodyEl.innerHTML = `
    <strong>${p.name} ${p.points.toLocaleString()}P</strong> 충전 완료!<br/>
    현재 잔액: <strong style="color:var(--primary)">${newPts.toLocaleString()}P</strong>
  `;
  document.getElementById('successModal').style.display = 'flex';

  updateMyPoint();
  renderHistory();
}

function closeChargeModal() {
  document.getElementById('chargeModal').style.display = 'none';
}
function closeSuccessModal() {
  document.getElementById('successModal').style.display = 'none';
}

function renderHistory() {
  const tbody = document.getElementById('historyBody');
  if (!tbody) return;

  let hist;
  try {
    hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
  } catch { hist = []; }

  if (!hist.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-row">이용 내역이 없습니다</td></tr>`;
    return;
  }

  tbody.innerHTML = hist.slice(0, 50).map(h => `
    <tr>
      <td>${h.date}</td>
      <td>${h.type}</td>
      <td class="${h.amount > 0 ? 'history-plus' : 'history-minus'}">
        ${h.amount > 0 ? '+' : ''}${h.amount.toLocaleString()}P
      </td>
      <td>${h.note || '-'}</td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  initPoints();
  init();
});
