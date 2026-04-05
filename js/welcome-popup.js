/* =============================================
   운세ON — js/welcome-popup.js
   첫 방문 / 재방문 이벤트 팝업 모듈
   - 첫 방문: 24시간 이내 재표시 안 함
   - 로그인 유저: 표시 안 함 (이미 가입됨)
   - 모바일/PC 반응형
   ============================================= */

(function() {
  const POPUP_KEY    = 'unseon_popup_shown';
  const POPUP_EXPIRY = 24 * 60 * 60 * 1000; // 24시간

  function isLoggedIn() {
    try {
      const u = JSON.parse(localStorage.getItem('sajuon_current_user') || 'null');
      return !!(u && u.id);
    } catch { return false; }
  }

  function shouldShow() {
    if (isLoggedIn()) return false; // 로그인 유저에게 안 보임
    const shown = localStorage.getItem(POPUP_KEY);
    if (!shown) return true;
    return (Date.now() - parseInt(shown, 10)) > POPUP_EXPIRY;
  }

  function markShown() {
    localStorage.setItem(POPUP_KEY, String(Date.now()));
  }

  function closePopup() {
    const el = document.getElementById('welcomePopupOverlay');
    if (!el) return;
    el.style.animation = 'fadeOutPopup 0.3s ease forwards';
    setTimeout(() => { el.remove(); document.body.style.overflow = ''; }, 320);
  }

  function goRegister() {
    sessionStorage.setItem('sajuon_auth_redirect', 'chat.html');
    window.location.href = 'auth.html?tab=register';
  }

  function createPopup() {
    const overlay = document.createElement('div');
    overlay.id = 'welcomePopupOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;
      background:rgba(10,8,30,0.72);
      display:flex;align-items:center;justify-content:center;
      z-index:99990;padding:20px;
      animation:fadeInPopup 0.35s ease;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes fadeInPopup  { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeOutPopup { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(0.94)} }
        @keyframes floatStar    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(10deg)} }
        @keyframes shimmerBar   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        #welcomePopup {
          background: #fff;
          border-radius: 24px;
          max-width: 420px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.35);
          position: relative;
        }
        .wp-header {
          background: linear-gradient(135deg, #1a4838 0%, #2c5f4f 50%, #3d7a65 100%);
          padding: 32px 28px 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .wp-header::before {
          content:'';
          position:absolute;inset:0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          background-size: 200% 100%;
          animation: shimmerBar 3s infinite;
        }
        .wp-stars {
          font-size: 2.2rem;
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
          gap: 6px;
        }
        .wp-stars span { animation: floatStar 2s ease-in-out infinite; }
        .wp-stars span:nth-child(2) { animation-delay: 0.3s; }
        .wp-stars span:nth-child(3) { animation-delay: 0.6s; }
        .wp-badge {
          display: inline-block;
          background: rgba(212,175,55,0.25);
          color: #f5c842;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 20px;
          border: 1px solid rgba(212,175,55,0.4);
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .wp-title {
          font-size: 1.45rem;
          font-weight: 900;
          color: #fff;
          line-height: 1.3;
          margin-bottom: 6px;
        }
        .wp-title em { color: #f5c842; font-style: normal; }
        .wp-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.72);
          line-height: 1.6;
        }
        .wp-body { padding: 24px 28px; }
        .wp-point-box {
          background: linear-gradient(135deg, #fdf8e7, #fff9ed);
          border: 2px solid #f5c842;
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .wp-point-icon {
          font-size: 2.4rem;
          flex-shrink: 0;
        }
        .wp-point-info .label {
          font-size: 0.78rem;
          color: #888;
          font-weight: 600;
        }
        .wp-point-info .val {
          font-size: 1.6rem;
          font-weight: 900;
          color: #b8962f;
          line-height: 1;
          margin: 2px 0;
        }
        .wp-point-info .sub {
          font-size: 0.75rem;
          color: #aaa;
        }
        .wp-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }
        .wp-feature-item {
          background: #f8fdf9;
          border: 1px solid #dde8e3;
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 0.78rem;
          color: #2c5f4f;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .wp-feature-item i { color: #3d7a65; }
        .wp-cta-primary {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #1a4838, #2c5f4f);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(44,95,79,0.35);
          font-family: 'Noto Sans KR', sans-serif;
        }
        .wp-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 28px rgba(44,95,79,0.45); }
        .wp-cta-secondary {
          width: 100%;
          padding: 12px;
          background: #f5f5f5;
          color: #555;
          border: none;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Noto Sans KR', sans-serif;
          transition: background 0.2s;
        }
        .wp-cta-secondary:hover { background: #ebebeb; }
        .wp-close {
          position: absolute;
          top: 14px; right: 16px;
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          width: 30px; height: 30px;
          border-radius: 50%;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .wp-close:hover { background: rgba(255,255,255,0.3); }
        .wp-timer {
          text-align: center;
          font-size: 0.72rem;
          color: #bbb;
          margin-top: 10px;
        }
        .wp-timer strong { color: #e65100; }
      </style>

      <div id="welcomePopup">
        <!-- 헤더 -->
        <div class="wp-header">
          <button class="wp-close" onclick="document.getElementById('welcomePopupOverlay').remove();document.body.style.overflow=''">✕</button>
          <div class="wp-stars">
            <span>🌟</span><span>🔮</span><span>🌟</span>
          </div>
          <div class="wp-badge">🎁 신규 가입 이벤트</div>
          <div class="wp-title">
            지금 가입하면<br/><em>500P 무료 지급!</em>
          </div>
          <div class="wp-subtitle">
            결제 없이 바로 AI 운세 상담 시작 가능<br/>
            연애운·사주·타로·이름짓기 38가지 카테고리
          </div>
        </div>

        <!-- 바디 -->
        <div class="wp-body">
          <div class="wp-point-box">
            <div class="wp-point-icon">🪙</div>
            <div class="wp-point-info">
              <div class="label">가입 즉시 지급</div>
              <div class="val">500P</div>
              <div class="sub">= AI 상담 2~5회 무료 이용</div>
            </div>
          </div>

          <div class="wp-features">
            <div class="wp-feature-item"><i class="fas fa-heart"></i> 연애운·궁합</div>
            <div class="wp-feature-item"><i class="fas fa-briefcase"></i> 직업·취업운</div>
            <div class="wp-feature-item"><i class="fas fa-chart-line"></i> 사업·재물운</div>
            <div class="wp-feature-item"><i class="fas fa-baby"></i> 이름짓기</div>
            <div class="wp-feature-item"><i class="fas fa-moon"></i> 별자리·타로</div>
            <div class="wp-feature-item"><i class="fas fa-calendar"></i> 2026 병오년</div>
          </div>

          <button class="wp-cta-primary" onclick="goRegisterPopup()">
            <i class="fas fa-gift"></i> 무료로 500P 받고 시작하기
          </button>
          <button class="wp-cta-secondary" onclick="closeWelcomePopup()">
            괜찮아요, 나중에 할게요
          </button>
          <div class="wp-timer" id="wpTimer">⏰ 이 혜택은 오늘만 유효합니다</div>
        </div>
      </div>
    `;

    // 배경 클릭으로 닫기
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeWelcomePopup();
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    markShown();

    // 카운트다운 타이머 (자정까지)
    (function tick() {
      const timerEl = document.getElementById('wpTimer');
      if (!timerEl) return;
      const now       = new Date();
      const midnight  = new Date(now); midnight.setHours(23, 59, 59, 999);
      const left      = midnight - now;
      const h  = Math.floor(left / 3600000);
      const m  = Math.floor((left % 3600000) / 60000);
      const s  = Math.floor((left % 60000) / 1000);
      timerEl.innerHTML = `⏰ 오늘 자정 마감 — <strong>${h}시간 ${m}분 ${s}초</strong> 남음`;
      setTimeout(tick, 1000);
    })();
  }

  // 전역 함수 노출
  window.closeWelcomePopup = closePopup;
  window.goRegisterPopup   = function() {
    closePopup();
    setTimeout(() => {
      sessionStorage.setItem('sajuon_auth_redirect', 'chat.html');
      window.location.href = 'auth.html?tab=register';
    }, 200);
  };

  // 페이지 로드 후 3초 뒤에 팝업 표시
  document.addEventListener('DOMContentLoaded', function() {
    if (shouldShow()) {
      setTimeout(createPopup, 3000);
    }
  });
})();
