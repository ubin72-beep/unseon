/* =========================================
   운세ON — js/auth.js  v5.0
   회원가입 / 로그인 — Table API 서버 DB 기반
   localStorage는 세션(현재 로그인 상태)만 저장
   ========================================= */

const LS_SESSION = 'sajuon_current_user';
const LS_POINTS  = 'sajuon_points';

/* ─── 세션 (브라우저 탭 유지용) ─── */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(LS_SESSION) || 'null'); } catch { return null; }
}
function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(LS_SESSION, JSON.stringify(user));
    localStorage.setItem(LS_POINTS, String(user.points || 0));
  } else {
    localStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_POINTS);
  }
}

/* ─── Table API 헬퍼 ─── */
async function apiGet(table, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`tables/${table}${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('GET ' + table + ' ' + res.status);
  return res.json();
}
async function apiPost(table, body) {
  const res = await fetch(`tables/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('POST ' + table + ' ' + res.status);
  return res.json();
}
async function apiPatch(table, id, body) {
  const res = await fetch(`tables/${table}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('PATCH ' + table + ' ' + res.status);
  return res.json();
}

/* ─── 이메일로 사용자 조회 ─── */
async function findUserByEmail(email) {
  try {
    const data = await apiGet('users', { search: email, limit: 10 });
    const rows = data.data || [];
    return rows.find(u => u.email === email) || null;
  } catch { return null; }
}

/* ─── 소셜 계정으로 사용자 조회 ─── */
async function findUserBySocial(provider, socialId) {
  try {
    const data = await apiGet('users', { search: socialId, limit: 10 });
    const rows = data.data || [];
    return rows.find(u => u.social_provider === provider && u.social_id === socialId) || null;
  } catch { return null; }
}

/* ─── 비밀번호 해시 ─── */
function hashPw(pw) {
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    const c = pw.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + pw.length;
}

/* ─── UUID ─── */
function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/* ─── 토스트 ─── */
function showAuthToast(msg, type = 'info') {
  const t = document.getElementById('authToast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = type === 'error' ? '#c62828' : type === 'success' ? '#2e7d32' : 'var(--primary-dark, #5c3d99)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

/* ─── 탭 전환 ─── */
function switchTab(tab) {
  ['loginForm','registerForm','forgotForm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  ['tabLogin','tabRegister'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (tab === 'login') {
    const f = document.getElementById('loginForm');
    const t = document.getElementById('tabLogin');
    if (f) f.style.display = 'block';
    if (t) t.classList.add('active');
  } else if (tab === 'register') {
    const f = document.getElementById('registerForm');
    const t = document.getElementById('tabRegister');
    if (f) f.style.display = 'block';
    if (t) t.classList.add('active');
  }
}
function showForgot() {
  const lf = document.getElementById('loginForm');
  const ff = document.getElementById('forgotForm');
  if (lf) lf.style.display = 'none';
  if (ff) ff.style.display = 'block';
}

/* ─── 비밀번호 표시 전환 ─── */
function togglePw(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  const hide = input.type === 'password';
  input.type = hide ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) icon.className = hide ? 'fas fa-eye-slash' : 'fas fa-eye';
}

/* ─── 비밀번호 강도 ─── */
function checkPwStrength(pw) {
  const fill  = document.getElementById('pwStrengthFill');
  const label = document.getElementById('pwStrengthLabel');
  if (!fill || !label) return;
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  else if (/[a-zA-Z]/.test(pw)) score += 0.5;
  if (/\d/.test(pw))  score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;
  const levels = [
    { w: '0%',   color: '#e0e0e0', text: '' },
    { w: '25%',  color: '#c62828', text: '매우 약함' },
    { w: '50%',  color: '#e65100', text: '약함' },
    { w: '75%',  color: '#f9a825', text: '보통' },
    { w: '88%',  color: '#2e7d32', text: '강함' },
    { w: '100%', color: '#1b5e20', text: '매우 강함' },
  ];
  const lvl = pw.length === 0 ? 0 : Math.min(5, Math.ceil(score));
  fill.style.width = levels[lvl].w;
  fill.style.background = levels[lvl].color;
  label.textContent = levels[lvl].text;
  label.style.color = levels[lvl].color;
}

/* ─── 전화번호 포맷 ─── */
function formatPhone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length <= 3)      input.value = v;
  else if (v.length <= 7) input.value = v.slice(0,3) + '-' + v.slice(3);
  else                    input.value = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7,11);
}

/* ─── 전체 동의 ─── */
function toggleAllAgree(cb) {
  ['agreeTerms','agreePrivacy','agreeAge','agreeMarketing','agreeRefund'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = cb.checked;
  });
}
function checkAllAgree() {
  const all = ['agreeTerms','agreePrivacy','agreeAge','agreeMarketing','agreeRefund'];
  const el  = document.getElementById('agreeAll');
  if (el) el.checked = all.every(id => document.getElementById(id)?.checked);
}

/* ─── 유효성 메시지 ─── */
function setFieldError(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
function clearFieldError(id)    { const el = document.getElementById(id); if (el) el.textContent = ''; }
function clearAllErrors()       { document.querySelectorAll('.auth-field-error').forEach(el => el.textContent = ''); }

/* ─── 이메일 인증 (클라이언트 시뮬레이션) ─── */
let _verifyCode = '', _verifyEmail = '', _verifyTimer = null, _emailVerified = false;

function sendEmailVerify() {
  const email = document.getElementById('regEmail')?.value?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('regEmailErr', '올바른 이메일을 입력해주세요'); return;
  }
  clearFieldError('regEmailErr');
  _verifyCode  = String(Math.floor(100000 + Math.random() * 900000));
  _verifyEmail = email;
  const btn = document.getElementById('verifyEmailBtn');
  const cf  = document.getElementById('verifyCodeField');
  if (btn) { btn.disabled = true; btn.textContent = '재발송 (60s)'; }
  if (cf)  cf.style.display = 'block';
  showAuthToast(`📧 인증 코드: ${_verifyCode} (테스트 모드)`, 'info');
  let sec = 60;
  clearInterval(_verifyTimer);
  _verifyTimer = setInterval(() => {
    sec--;
    if (btn) btn.textContent = `재발송 (${sec}s)`;
    if (sec <= 0) { clearInterval(_verifyTimer); if (btn) { btn.disabled = false; btn.textContent = '재발송'; } }
  }, 1000);
}
function checkEmailVerify() {
  const input = document.getElementById('regVerifyCode')?.value?.trim();
  const ok    = document.getElementById('verifySuccess');
  const err   = document.getElementById('verifyErr');
  if (input === _verifyCode) {
    _emailVerified = true;
    if (ok)  ok.textContent  = '✅ 이메일 인증이 완료되었습니다';
    if (err) err.textContent = '';
    document.getElementById('regEmail')?.classList.add('success');
  } else {
    _emailVerified = false;
    if (err) err.textContent = '인증 코드가 일치하지 않습니다';
    if (ok)  ok.textContent  = '';
  }
}

/* ════════════════════════════════════════
   로그인
   ════════════════════════════════════════ */
async function handleLogin(e) {
  e.preventDefault();
  clearAllErrors();
  const email = document.getElementById('loginEmail')?.value?.trim();
  const pw    = document.getElementById('loginPw')?.value;
  const remember = document.getElementById('loginRemember')?.checked;

  if (!email) { setFieldError('loginEmailErr', '이메일을 입력해주세요'); return; }
  if (!pw)    { setFieldError('loginPwErr', '비밀번호를 입력해주세요'); return; }

  toggleLoginLoading(true);
  try {
    const user = await findUserByEmail(email);
    if (!user || user.pw_hash !== hashPw(pw)) {
      setFieldError('loginPwErr', '이메일 또는 비밀번호가 일치하지 않습니다');
      toggleLoginLoading(false); return;
    }
    if (user.status === 'suspended') {
      setFieldError('loginPwErr', '정지된 계정입니다. 고객센터에 문의해주세요');
      toggleLoginLoading(false); return;
    }

    // 마지막 로그인 갱신
    await apiPatch('users', user.id, { last_login: new Date().toISOString() });
    user.last_login = new Date().toISOString();

    setCurrentUser(user);
    if (remember) localStorage.setItem('sajuon_remember_email', email);
    else          localStorage.removeItem('sajuon_remember_email');

    showAuthToast(`✅ ${user.name}님 환영합니다!`, 'success');
    setTimeout(() => {
      const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
      sessionStorage.removeItem('sajuon_auth_redirect');
      window.location.href = redirect;
    }, 800);
  } catch (err) {
    console.error('[로그인]', err);
    setFieldError('loginPwErr', '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요');
    toggleLoginLoading(false);
  }
}

function toggleLoginLoading(on) {
  const btn = document.getElementById('loginSubmitBtn');
  const txt = document.getElementById('loginBtnText');
  const ld  = document.getElementById('loginBtnLoading');
  if (btn) btn.disabled = on;
  if (txt) txt.style.display = on ? 'none' : 'flex';
  if (ld)  ld.style.display  = on ? 'flex' : 'none';
}

/* ════════════════════════════════════════
   회원가입
   ════════════════════════════════════════ */
async function handleRegister(e) {
  e.preventDefault();
  clearAllErrors();

  const name      = document.getElementById('regName')?.value?.trim();
  const email     = document.getElementById('regEmail')?.value?.trim();
  const pw        = document.getElementById('regPw')?.value;
  const pwc       = document.getElementById('regPwConfirm')?.value;
  const phone     = document.getElementById('regPhone')?.value?.trim() || '';
  const birth     = document.getElementById('regBirth')?.value || '';
  const gender    = document.querySelector('input[name="gender"]:checked')?.value || 'none';
  const marketing = document.getElementById('agreeMarketing')?.checked || false;

  let valid = true;
  if (!name || name.length < 2) { setFieldError('regNameErr', '이름은 2자 이상 입력해주세요'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('regEmailErr', '올바른 이메일을 입력해주세요'); valid = false; }
  if (!pw || pw.length < 8) { setFieldError('regPwErr', '비밀번호는 8자 이상이어야 합니다'); valid = false; }
  else if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) { setFieldError('regPwErr', '영문과 숫자를 조합해주세요'); valid = false; }
  if (pw !== pwc) { setFieldError('regPwConfirmErr', '비밀번호가 일치하지 않습니다'); valid = false; }
  if (!document.getElementById('agreeTerms')?.checked)   { showAuthToast('❌ 이용약관에 동의해주세요', 'error'); valid = false; }
  if (!document.getElementById('agreePrivacy')?.checked) { showAuthToast('❌ 개인정보 처리방침에 동의해주세요', 'error'); valid = false; }
  if (!document.getElementById('agreeAge')?.checked)     { showAuthToast('❌ 만 14세 이상 확인이 필요합니다', 'error'); valid = false; }
  if (!document.getElementById('agreeRefund')?.checked)  { showAuthToast('❌ 환불 정책 확인이 필요합니다', 'error'); valid = false; }
  if (!valid) return;

  toggleRegLoading(true);
  try {
    // 이메일 중복 확인
    const existing = await findUserByEmail(email);
    if (existing) {
      setFieldError('regEmailErr', '이미 사용 중인 이메일입니다');
      toggleRegLoading(false); return;
    }

    const FREE_PT = 500;
    const newUser = {
      id:              genId(),
      name,
      email,
      pw_hash:         hashPw(pw),
      phone,
      birth,
      gender,
      agree_marketing: marketing,
      points:          FREE_PT,
      status:          'active',
      social_provider: '',
      social_id:       '',
      created_at_str:  new Date().toLocaleString('ko-KR'),
      last_login:      new Date().toISOString(),
    };

    // DB에 저장
    const saved = await apiPost('users', newUser);

    // 포인트 이력 저장
    await apiPost('point_history', {
      id:          genId(),
      user_id:     saved.id,
      email:       email,
      type:        'charge',
      amount:      FREE_PT,
      balance:     FREE_PT,
      description: '신규 가입 무료 포인트',
      category:    'welcome',
    });

    setCurrentUser(saved);
    toggleRegLoading(false);

    // 성공 화면
    const regForm       = document.getElementById('registerForm');
    const successScreen = document.getElementById('registerSuccess');
    const nameLabel     = document.getElementById('successNameLabel');
    const tabs          = document.querySelector('.auth-tabs');
    if (regForm)        regForm.style.display        = 'none';
    if (successScreen)  successScreen.style.display  = 'block';
    if (tabs)           tabs.style.display           = 'none';
    if (nameLabel)      nameLabel.textContent        = `${name}님, 운세ON 가입을 완료했습니다 🎉`;

    const autoTarget = sessionStorage.getItem('sajuon_auth_redirect') || 'chat.html';
    sessionStorage.removeItem('sajuon_auth_redirect');
    if (successScreen) {
      const countEl = document.createElement('p');
      countEl.style.cssText = 'font-size:0.82rem;color:var(--text-muted);margin-top:10px';
      countEl.textContent = '3초 후 자동으로 이동합니다...';
      successScreen.appendChild(countEl);
      let count = 3;
      const timer = setInterval(() => {
        count--;
        if (count > 0) countEl.textContent = `${count}초 후 자동으로 이동합니다...`;
        else { clearInterval(timer); window.location.href = autoTarget; }
      }, 1000);
    }
  } catch (err) {
    console.error('[회원가입]', err);
    showAuthToast('❌ 회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요', 'error');
    toggleRegLoading(false);
  }
}

function toggleRegLoading(on) {
  const btn = document.getElementById('regSubmitBtn');
  const txt = document.getElementById('regBtnText');
  const ld  = document.getElementById('regBtnLoading');
  if (btn) btn.disabled = on;
  if (txt) txt.style.display = on ? 'none' : 'flex';
  if (ld)  ld.style.display  = on ? 'flex' : 'none';
}

/* ─── 비밀번호 찾기 ─── */
async function handleForgot() {
  const email = document.getElementById('forgotEmail')?.value?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthToast('❌ 올바른 이메일을 입력해주세요', 'error'); return;
  }
  const found = await findUserByEmail(email);
  if (!found) { showAuthToast('❌ 가입된 이메일이 아닙니다', 'error'); return; }
  showAuthToast('📧 비밀번호 재설정 링크를 발송했습니다 (시뮬레이션)', 'success');
  setTimeout(() => switchTab('login'), 2000);
}

/* ════════════════════════════════════════
   포인트 차감 (서버 DB 기반)
   ════════════════════════════════════════ */
async function deductPoints(cost, description, category) {
  const cu = getCurrentUser();
  if (!cu) return false;
  const current = parseInt(localStorage.getItem(LS_POINTS) || cu.points || '0', 10);
  if (current < cost) return false;
  const next = current - cost;

  try {
    // DB 포인트 차감
    await apiPatch('users', cu.id, { points: next });

    // 이력
    await apiPost('point_history', {
      id:          genId(),
      user_id:     cu.id,
      email:       cu.email,
      type:        'use',
      amount:      -cost,
      balance:     next,
      description: description || 'AI 상담',
      category:    category || '',
    });

    // 로컬 세션 갱신
    const updated = { ...cu, points: next };
    localStorage.setItem(LS_SESSION, JSON.stringify(updated));
    localStorage.setItem(LS_POINTS, String(next));
    document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
      el.textContent = next.toLocaleString();
    });
    return true;
  } catch (err) {
    console.error('[포인트 차감]', err);
    return false;
  }
}

/* ════════════════════════════════════════
   포인트 충전 (서버 DB 기반)
   ════════════════════════════════════════ */
async function chargePoints(amount, description) {
  const cu = getCurrentUser();
  if (!cu) return false;
  const current = parseInt(localStorage.getItem(LS_POINTS) || cu.points || '0', 10);
  const next    = current + amount;

  try {
    await apiPatch('users', cu.id, { points: next });
    await apiPost('point_history', {
      id:          genId(),
      user_id:     cu.id,
      email:       cu.email,
      type:        'charge',
      amount:      amount,
      balance:     next,
      description: description || '포인트 충전',
      category:    'charge',
    });

    const updated = { ...cu, points: next };
    localStorage.setItem(LS_SESSION, JSON.stringify(updated));
    localStorage.setItem(LS_POINTS, String(next));
    document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
      el.textContent = next.toLocaleString();
    });
    return true;
  } catch (err) {
    console.error('[포인트 충전]', err);
    return false;
  }
}

/* ─── 포인트 이력 조회 ─── */
async function getPointHistory() {
  const cu = getCurrentUser();
  if (!cu) return [];
  try {
    const data = await apiGet('point_history', { search: cu.email, limit: 200, sort: 'created_at' });
    return (data.data || []).filter(r => r.user_id === cu.id || r.email === cu.email)
                            .sort((a, b) => b.created_at - a.created_at);
  } catch { return []; }
}

/* ─── DB 포인트 동기화 ─── */
async function syncPointsFromDB() {
  const cu = getCurrentUser();
  if (!cu) return;
  try {
    const data = await apiGet('users', { search: cu.email, limit: 5 });
    const rows = data.data || [];
    const user = rows.find(u => u.email === cu.email);
    if (user) {
      const pts = user.points || 0;
      localStorage.setItem(LS_POINTS, String(pts));
      const updated = { ...cu, points: pts };
      localStorage.setItem(LS_SESSION, JSON.stringify(updated));
      document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
        el.textContent = pts.toLocaleString();
      });
    }
  } catch (err) {
    console.error('[포인트 동기화]', err);
  }
}

/* ════════════════════════════════════════
   소셜 로그인
   ════════════════════════════════════════ */
function getSocialConfig() {
  try { return JSON.parse(localStorage.getItem('sajuon_social_config') || '{}'); } catch { return {}; }
}

async function handleSocialLoginSuccess(info) {
  try {
    let user = await findUserBySocial(info.provider, info.provider_id)
            || await findUserByEmail(info.email);

    if (!user) {
      // 첫 소셜 로그인 → 자동 가입
      const FREE_PT = 500;
      const newUser = {
        id:              genId(),
        name:            info.name,
        email:           info.email,
        pw_hash:         '',
        phone:           '',
        birth:           '',
        gender:          'none',
        agree_marketing: false,
        points:          FREE_PT,
        status:          'active',
        social_provider: info.provider,
        social_id:       info.provider_id,
        created_at_str:  new Date().toLocaleString('ko-KR'),
        last_login:      new Date().toISOString(),
      };
      user = await apiPost('users', newUser);
      await apiPost('point_history', {
        id:          genId(),
        user_id:     user.id,
        email:       user.email,
        type:        'charge',
        amount:      FREE_PT,
        balance:     FREE_PT,
        description: '소셜 가입 무료 포인트 (' + info.provider + ')',
        category:    'welcome',
      });
      showAuthToast(`🎉 ${info.name}님, 운세ON 가입을 환영합니다! 500P 지급!`, 'success');
    } else {
      await apiPatch('users', user.id, {
        last_login:      new Date().toISOString(),
        social_provider: info.provider,
        social_id:       info.provider_id,
      });
      showAuthToast(`✅ ${user.name}님 환영합니다!`, 'success');
    }

    setCurrentUser(user);
    setTimeout(() => {
      const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
      sessionStorage.removeItem('sajuon_auth_redirect');
      location.href = redirect;
    }, 900);
  } catch (err) {
    console.error('[소셜 로그인]', err);
    showAuthToast('❌ 소셜 로그인 중 오류가 발생했습니다', 'error');
  }
}

function kakaoLogin() {
  const cfg = getSocialConfig();
  const appKey = cfg.kakaoJsKey || '';
  if (!appKey || appKey === 'YOUR_KAKAO_JS_APP_KEY') {
    showAuthToast('⚙️ 관리자 설정에서 카카오 앱키를 먼저 등록해주세요', 'error'); return;
  }
  if (typeof Kakao === 'undefined') {
    showAuthToast('⏳ 카카오 SDK 로딩 중입니다. 잠시 후 다시 시도해주세요', 'info'); return;
  }
  if (!Kakao.isInitialized()) Kakao.init(appKey);
  Kakao.Auth.login({
    scope: 'profile_nickname,account_email',
    success: function(authObj) {
      Kakao.API.request({
        url: '/v2/user/me',
        success: function(res) {
          const acc = res.kakao_account || {};
          handleSocialLoginSuccess({
            provider:    'kakao',
            provider_id: String(res.id),
            email:       acc.email || ('kakao_' + res.id + '@kakao.social'),
            name:        (acc.profile || {}).nickname || '카카오사용자',
            avatar:      (acc.profile || {}).thumbnail_image_url || '',
          });
        },
        fail: () => showAuthToast('❌ 카카오 사용자 정보를 가져오지 못했습니다', 'error')
      });
    },
    fail: (err) => {
      if (err?.error === 'access_denied') showAuthToast('❌ 카카오 로그인이 취소되었습니다', 'error');
      else showAuthToast('❌ 카카오 로그인 중 오류가 발생했습니다', 'error');
    }
  });
}

function naverLogin() {
  const cfg = getSocialConfig();
  const clientId    = cfg.naverClientId || '';
  const redirectUri = cfg.naverRedirectUri || (location.origin + '/oauth-callback.html');
  if (!clientId || clientId === 'YOUR_NAVER_CLIENT_ID') {
    showAuthToast('⚙️ 관리자 설정에서 네이버 클라이언트 ID를 먼저 등록해주세요', 'error'); return;
  }
  const state = genId();
  sessionStorage.setItem('naver_oauth_state', state);
  sessionStorage.setItem('naver_after_login', sessionStorage.getItem('sajuon_auth_redirect') || 'index.html');
  location.href = 'https://nid.naver.com/oauth2.0/authorize?' + new URLSearchParams({
    response_type: 'code', client_id: clientId, redirect_uri: redirectUri, state
  });
}

function socialLogin(provider) {
  if (provider === 'kakao') kakaoLogin();
  else if (provider === 'naver') naverLogin();
}

/* ════════════════════════════════════════
   로그아웃
   ════════════════════════════════════════ */
function handleLogout() {
  setCurrentUser(null);
  window.location.href = 'index.html';
}
function logout() { handleLogout(); }
window.logout = logout;

/* ════════════════════════════════════════
   헤더 인증 상태 표시
   ════════════════════════════════════════ */
function initAuthHeader() {
  const headerActions = document.querySelector('.header-actions, #headerActions');
  if (!headerActions) return;
  if (headerActions.dataset.authInit === 'true') return;
  headerActions.dataset.authInit = 'true';

  const user = getCurrentUser();
  const pts  = user ? parseInt(localStorage.getItem(LS_POINTS) || user.points || '0', 10) : 0;

  const pointDisplay = headerActions.querySelector('.point-display, #headerPoints');
  if (pointDisplay) {
    pointDisplay.style.display = user ? 'flex' : 'none';
    const valEl = pointDisplay.querySelector('#headerPointVal, [id$="PointVal"]');
    if (valEl) valEl.textContent = pts.toLocaleString();
  }

  const btnLogin  = headerActions.querySelector('#btnLogin, .btn-login');
  const btnSignup = headerActions.querySelector('#btnSignup, .btn-signup');
  const btnCharge = headerActions.querySelector('#btnCharge, .btn-charge');

  if (user) {
    if (btnLogin)  btnLogin.style.display  = 'none';
    if (btnSignup) btnSignup.style.display = 'none';
    if (btnCharge) btnCharge.style.display = 'none';

    let wrap = headerActions.querySelector('.user-menu-wrap, #userMenuWrap');
    if (wrap) {
      wrap.style.display = 'flex';
      const nameLabel = wrap.querySelector('#userNameLabel, .user-name-label');
      const avatarEl  = wrap.querySelector('#userAvatar, .user-avatar');
      const dropName  = wrap.querySelector('#dropdownName, .user-dropdown-name');
      const dropEmail = wrap.querySelector('#dropdownEmail, .user-dropdown-email');
      const dropPt    = wrap.querySelector('#dropdownPtVal');
      if (nameLabel) nameLabel.textContent = user.name || '';
      if (avatarEl)  avatarEl.textContent  = (user.name || '?')[0].toUpperCase();
      if (dropName)  dropName.textContent  = user.name || '';
      if (dropEmail) dropEmail.textContent = user.email || '';
      if (dropPt)    dropPt.textContent    = pts.toLocaleString();
    } else {
      wrap = document.createElement('div');
      wrap.className = 'user-menu-wrap';
      wrap.id = 'userMenuWrap';
      wrap.style.display = 'flex';
      wrap.innerHTML = `
        <button class="user-menu-btn" onclick="toggleUserMenu(event)" aria-label="사용자 메뉴">
          <span class="user-avatar">${(user.name||'?')[0].toUpperCase()}</span>
          <span class="user-name-label">${user.name||''}</span>
          <i class="fas fa-chevron-down user-menu-arrow" style="font-size:0.7rem"></i>
        </button>
        <div class="user-dropdown" id="userDropdown" style="display:none">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${user.name||''}</div>
            <div class="user-dropdown-email">${user.email||''}</div>
            <div class="user-dropdown-pt"><i class="fas fa-coins"></i> <span id="dropdownPtVal">${pts.toLocaleString()}</span>P</div>
          </div>
          <div class="user-dropdown-links" style="padding:8px 0">
            <a href="pricing.html" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:#333;text-decoration:none;font-size:0.88rem"><i class="fas fa-bolt"></i> 포인트 충전</a>
            <a href="pricing.html#history" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:#333;text-decoration:none;font-size:0.88rem"><i class="fas fa-history"></i> 이용내역</a>
          </div>
          <button onclick="logout()" style="width:100%;padding:10px 16px;background:none;border:none;border-top:1px solid #eee;color:#c62828;font-size:0.88rem;cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px"><i class="fas fa-sign-out-alt"></i> 로그아웃</button>
        </div>`;
      headerActions.appendChild(wrap);
    }
  } else {
    if (btnLogin)  btnLogin.style.display  = '';
    if (btnSignup) btnSignup.style.display = '';
    if (btnCharge) btnCharge.style.display = '';
    const wrap = headerActions.querySelector('.user-menu-wrap, #userMenuWrap');
    if (wrap) wrap.style.display = 'none';
  }

  // 로그인 상태면 DB에서 최신 포인트 동기화
  if (user) syncPointsFromDB();
}

function toggleUserMenu(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('userDropdown');
  if (!dd) return;
  const visible = dd.style.display !== 'none' && dd.style.display !== '';
  dd.style.display = visible ? 'none' : 'block';
  dd.classList.toggle('show', !visible);
}
document.addEventListener('click', (e) => {
  const dd   = document.getElementById('userDropdown');
  const wrap = document.querySelector('.user-menu-wrap, #userMenuWrap');
  if (dd && wrap && !wrap.contains(e.target)) {
    dd.style.display = 'none';
    dd.classList.remove('show');
  }
});

/* ════════════════════════════════════════
   auth.html 초기화
   ════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const isAuthPage = !!(document.getElementById('loginForm') || document.getElementById('registerForm'));
  if (!isAuthPage) return;

  // 기억된 이메일 복원
  const savedEmail = localStorage.getItem('sajuon_remember_email');
  if (savedEmail) {
    const el = document.getElementById('loginEmail');
    const cb = document.getElementById('loginRemember');
    if (el) el.value = savedEmail;
    if (cb) cb.checked = true;
  }

  // URL 파라미터로 탭 전환
  if (new URLSearchParams(location.search).get('tab') === 'register') switchTab('register');

  // 이미 로그인 상태면 리다이렉트
  const user = getCurrentUser();
  if (user) {
    const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
    sessionStorage.removeItem('sajuon_auth_redirect');
    window.location.href = redirect;
  }
});
