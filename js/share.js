/* =============================================
   운세ON — js/share.js
   카카오톡 / URL 복사 / 공유 기능 공통 모듈
   ============================================= */

/* ── 카카오 SDK 초기화 (한 번만) ── */
function initKakaoSDK() {
  if (typeof Kakao === 'undefined') return false;
  if (!Kakao.isInitialized()) {
    // 카카오 JavaScript 앱키 (https://developers.kakao.com 에서 발급)
    // 발급 후 아래 키를 교체하세요
    try { Kakao.init('YOUR_KAKAO_JS_KEY'); } catch(e) {}
  }
  return Kakao.isInitialized();
}

/* ── 공통 공유 시트 HTML 생성 ── */
function buildShareSheet(opts) {
  // opts: { title, desc, url, imageUrl, hashtags[] }
  const url       = opts.url      || window.location.href;
  const title     = opts.title    || '운세ON — AI 운세 상담';
  const desc      = opts.desc     || '나의 운세를 AI가 분석해줬어요!';
  const hashtags  = (opts.hashtags || ['운세ON','AI운세','타로','사주']).join(' #');
  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title + '\n' + desc + '\n\n' + url);

  return `
  <div id="shareSheet" style="
    position:fixed;bottom:0;left:0;right:0;
    background:#fff;border-radius:24px 24px 0 0;
    box-shadow:0 -8px 40px rgba(0,0,0,0.18);
    padding:24px 20px 36px;z-index:9999;
    animation:slideUpSheet 0.28s cubic-bezier(.22,1,.36,1);
  ">
    <div style="width:40px;height:4px;background:#e0e0e0;border-radius:4px;margin:0 auto 20px;"></div>
    <div style="font-size:1rem;font-weight:800;color:#1a1a2e;margin-bottom:6px;text-align:center">
      📤 결과 공유하기
    </div>
    <div style="font-size:0.8rem;color:#888;text-align:center;margin-bottom:20px">
      친구에게 내 운세 결과를 공유해보세요!
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">

      <!-- 카카오톡 -->
      <button onclick="shareKakao()" style="
        display:flex;flex-direction:column;align-items:center;gap:6px;
        background:none;border:none;cursor:pointer;padding:0
      ">
        <div style="width:52px;height:52px;background:#FFE812;border-radius:16px;
          display:flex;align-items:center;justify-content:center;font-size:1.6rem;
          box-shadow:0 2px 10px rgba(255,232,18,0.4)">💬</div>
        <span style="font-size:0.75rem;font-weight:600;color:#3A1D1D">카카오톡</span>
      </button>

      <!-- 라인 -->
      <button onclick="shareLine('${encodedTitle}')" style="
        display:flex;flex-direction:column;align-items:center;gap:6px;
        background:none;border:none;cursor:pointer;padding:0
      ">
        <div style="width:52px;height:52px;background:#06C755;border-radius:16px;
          display:flex;align-items:center;justify-content:center;font-size:1.6rem;
          box-shadow:0 2px 10px rgba(6,199,85,0.3)">💚</div>
        <span style="font-size:0.75rem;font-weight:600;color:#333">라인</span>
      </button>

      <!-- 트위터(X) -->
      <button onclick="shareTwitter('${encodedTitle}')" style="
        display:flex;flex-direction:column;align-items:center;gap:6px;
        background:none;border:none;cursor:pointer;padding:0
      ">
        <div style="width:52px;height:52px;background:#000;border-radius:16px;
          display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:1.2rem;
          box-shadow:0 2px 10px rgba(0,0,0,0.2)">𝕏</div>
        <span style="font-size:0.75rem;font-weight:600;color:#333">X(트위터)</span>
      </button>

      <!-- URL 복사 -->
      <button onclick="copyShareUrl('${encodedUrl}')" style="
        display:flex;flex-direction:column;align-items:center;gap:6px;
        background:none;border:none;cursor:pointer;padding:0
      ">
        <div style="width:52px;height:52px;background:#f0f4ff;border-radius:16px;
          display:flex;align-items:center;justify-content:center;font-size:1.6rem;
          box-shadow:0 2px 10px rgba(100,130,255,0.15)">🔗</div>
        <span style="font-size:0.75rem;font-weight:600;color:#333">링크 복사</span>
      </button>
    </div>

    <!-- 초대 문구 -->
    <div style="background:#f8f5ff;border-radius:12px;padding:12px 16px;margin-bottom:16px;
      border:1px solid #e8e0ff;font-size:0.82rem;color:#4c1d95;line-height:1.6">
      🎁 <strong>친구가 내 링크로 가입하면 둘 다 +500P 추가!</strong><br/>
      지금 공유하고 포인트 받아가세요
    </div>

    <button onclick="closeShareSheet()" style="
      width:100%;padding:13px;background:#f5f5f5;border:none;border-radius:12px;
      font-size:0.9rem;font-weight:600;color:#666;cursor:pointer
    ">닫기</button>
  </div>
  <div id="shareSheetBg" onclick="closeShareSheet()" style="
    position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9998;
    animation:fadeInBg 0.2s ease
  "></div>
  <style>
    @keyframes slideUpSheet { from{transform:translateY(100%)} to{transform:translateY(0)} }
    @keyframes fadeInBg     { from{opacity:0} to{opacity:1} }
  </style>`;
}

/* ── 공유 시트 열기 ── */
let _shareOpts = {};
function openShareSheet(opts) {
  _shareOpts = opts || {};
  closeShareSheet(); // 중복 방지
  document.body.insertAdjacentHTML('beforeend', buildShareSheet(opts));
  document.body.style.overflow = 'hidden';
}

function closeShareSheet() {
  const s  = document.getElementById('shareSheet');
  const bg = document.getElementById('shareSheetBg');
  if (s)  s.remove();
  if (bg) bg.remove();
  document.body.style.overflow = '';
}

/* ── 카카오톡 공유 ── */
function shareKakao() {
  const opts  = _shareOpts;
  const title = opts.title   || '운세ON — AI 운세 상담 결과';
  const desc  = opts.desc    || '나의 운세를 AI가 분석해줬어요! 당신도 지금 바로 확인해보세요 ✨';
  const url   = opts.url     || 'https://unseon.co.kr/';
  const img   = opts.imageUrl|| 'https://unseon.co.kr/images/og-image.png';

  if (initKakaoSDK() && typeof Kakao.Share !== 'undefined') {
    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title,
        description: desc,
        imageUrl: img,
        link: { mobileWebUrl: url, webUrl: url }
      },
      buttons: [{
        title: '지금 바로 확인하기',
        link: { mobileWebUrl: url, webUrl: url }
      }]
    });
    closeShareSheet();
  } else {
    // SDK 없으면 카카오톡 앱 링크로 fallback
    const text = encodeURIComponent(title + '\n' + desc + '\n\n' + url);
    window.open('https://story.kakao.com/share?url=' + encodeURIComponent(url), '_blank');
    closeShareSheet();
  }
}

/* ── 라인 공유 ── */
function shareLine(encodedText) {
  const text = encodedText || encodeURIComponent(_shareOpts.title + '\n' + (_shareOpts.url || location.href));
  window.open('https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(_shareOpts.url || location.href), '_blank', 'width=600,height=500');
  closeShareSheet();
}

/* ── X(트위터) 공유 ── */
function shareTwitter(encodedText) {
  const text = encodeURIComponent(
    (_shareOpts.title || '운세ON AI 운세 결과') + '\n' +
    (_shareOpts.desc  || '') + '\n#운세ON #AI운세 #타로 #사주\n' +
    (_shareOpts.url   || location.href)
  );
  window.open('https://twitter.com/intent/tweet?text=' + text, '_blank', 'width=600,height=500');
  closeShareSheet();
}

/* ── URL 복사 ── */
function copyShareUrl(encodedUrl) {
  const url = decodeURIComponent(encodedUrl || location.href);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showShareToast('🔗 링크가 복사되었습니다!');
      closeShareSheet();
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showShareToast('🔗 링크가 복사되었습니다!');
    closeShareSheet();
  }
}

/* ── 공유 토스트 ── */
function showShareToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)',
    background:'#1a1a2e', color:'#fff', padding:'10px 22px', borderRadius:'30px',
    fontSize:'0.88rem', fontWeight:'600', zIndex:'10000',
    boxShadow:'0 4px 20px rgba(0,0,0,0.25)', whiteSpace:'nowrap',
    transition:'opacity 0.3s', opacity:'0'
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 2500);
}
