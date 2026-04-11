/* =========================================
   운세ON — js/auth.js  v3.1 (DB API 연동)
   회원가입 / 로그인 / 로그아웃 — 서버 DB 영구 저장
   ========================================= */

// ===== API 경로 =====
const API_USERS = 'tables/users';
const API_HIST  = 'tables/points_history';

async function apiGet(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error('API ' + r.status);
  return r.json();
}
async function apiPost(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('API ' + r.status);
  return r.json();
}
async function apiPatch(url, body) {
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('API ' + r.status);
  return r.json();
}

// ===== 이메일로 사용자 조회 =====
async function findUserByEmail(email) {
  try {
    const res = await apiGet(API_USERS + '?search=' + encodeURIComponent(email) + '&limit=50');
    const rows = res.data || [];
    return rows.find(u => u.email === email) || null;
  } catch { return null; }
}

// ===== 세션 (localStorage — 현재 로그인 정보만 캐시) =====
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('sajuon_current_user') || 'null'); } catch { return null; }
}
function setCurrentUser(user) {
  if (user) {
    const safe = { ...user };
    delete safe.pw_hash;
    localStorage.setItem('sajuon_current_user', JSON.stringify(safe));
    localStorage.setItem('sajuon_points', String(user.points || 0));
  } else {
    localStorage.removeItem('sajuon_current_user');
    localStorage.removeItem('sajuon_points');
  }
}

// ===== 포인트를 DB에서 최신값으로 동기화 =====
async function syncPointsFromDB() {
  const cu = getCurrentUser();
  if (!cu || !cu.id) return;
  try {
    const res = await apiGet(API_USERS + '/' + cu.id);
    if (res && res.id) {
      const pts = res.points !== undefined ? res.points : cu.points;
      localStorage.setItem('sajuon_points', String(pts));
      // DB의 최신 전체 정보로 세션 업데이트 (pw_hash 제외)
      const updated = {
        id:              res.id,
        name:            res.name || cu.name,
        email:           res.email || cu.email,
        phone:           res.phone || cu.phone || '',
        birth:           res.birth || cu.birth || '',
        gender:          res.gender || cu.gender || 'none',
        points:          pts,
        status:          res.status || cu.status || 'active',
        agree_marketing: res.agree_marketing ?? cu.agree_marketing,
        created_at_str:  res.created_at_str || cu.created_at_str || '',
      };
      setCurrentUser(updated);
      // 헤더 포인트 표시 갱신
      document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
        el.textContent = Number(pts).toLocaleString();
      });
    }
  } catch {}
}

// ===== 포인트 차감 (서버 저장) =====
async function deductPoints(cost, description, category) {
  const cu = getCurrentUser();
  if (!cu || !cu.id) return false;
  const current = parseInt(localStorage.getItem('sajuon_points') || cu.points || '0', 10);
  if (current < cost) return false;
  const next = current - cost;
  try {
    await apiPatch(API_USERS + '/' + cu.id, { points: next });
    await apiPost(API_HIST, {
      user_id: cu.id, email: cu.email,
      type: 'use', amount: -cost, balance: next,
      description: description || 'AI 상담',
      category: category || ''
    });
    localStorage.setItem('sajuon_points', String(next));
    setCurrentUser({ ...cu, points: next });
    document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
      el.textContent = next.toLocaleString();
    });
    return true;
  } catch { return false; }
}

// ===== 포인트 충전 (서버 저장) =====
async function chargePoints(amount, description) {
  const cu = getCurrentUser();
  if (!cu || !cu.id) return false;
  const current = parseInt(localStorage.getItem('sajuon_points') || cu.points || '0', 10);
  const next = current + amount;
  try {
    await apiPatch(API_USERS + '/' + cu.id, { points: next });
    await apiPost(API_HIST, {
      user_id: cu.id, email: cu.email,
      type: 'charge', amount: amount, balance: next,
      description: description || '포인트 충전',
      category: 'charge'
    });
    localStorage.setItem('sajuon_points', String(next));
    setCurrentUser({ ...cu, points: next });
    document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
      el.textContent = next.toLocaleString();
    });
    return true;
  } catch { return false; }
}

// ===== 비밀번호 해시 =====
function hashPw(pw) {
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    const char = pw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + pw.length;
}

// ===== 토스트 =====
function showAuthToast(msg, type = 'info') {
  const t = document.getElementById('authToast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = type === 'error' ? '#c62828' : type === 'success' ? '#2e7d32' : 'var(--primary-dark)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ===== 탭 전환 =====
function switchTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm   = document.getElementById('forgotForm');
  const tabLogin     = document.getElementById('tabLogin');
  const tabReg       = document.getElementById('tabRegister');
  [loginForm, registerForm, forgotForm].forEach(f => { if (f) f.style.display = 'none'; });
  [tabLogin, tabReg].forEach(t => { if (t) t.classList.remove('active'); });
  if (tab === 'login') {
    if (loginForm) loginForm.style.display = 'block';
    if (tabLogin) tabLogin.classList.add('active');
  } else if (tab === 'register') {
    if (registerForm) registerForm.style.display = 'block';
    if (tabReg) tabReg.classList.add('active');
  }
}
function showForgot() {
  const loginForm  = document.getElementById('loginForm');
  const forgotForm = document.getElementById('forgotForm');
  if (loginForm)  loginForm.style.display  = 'none';
  if (forgotForm) forgotForm.style.display = 'block';
}

// ===== 비밀번호 표시 전환 =====
function togglePw(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) { icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye'; }
}

// ===== 비밀번호 강도 =====
function checkPwStrength(pw) {
  const fill  = document.getElementById('pwStrengthFill');
  const label = document.getElementById('pwStrengthLabel');
  if (!fill || !label) return;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  else if (/[a-zA-Z]/.test(pw)) score += 0.5;
  if (/\d/.test(pw)) score++;
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
  const l = levels[lvl];
  fill.style.width = l.w;
  fill.style.background = l.color;
  label.textContent = l.text;
  label.style.color = l.color;
}

// ===== 전화번호 포맷 =====
function formatPhone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length <= 3) input.value = v;
  else if (v.length <= 7) input.value = v.slice(0,3) + '-' + v.slice(3);
  else input.value = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7,11);
}

// ===== 전체 동의 =====
function toggleAllAgree(cb) {
  ['agreeTerms','agreePrivacy','agreeAge','agreeMarketing','agreeRefund'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = cb.checked;
  });
}
function checkAllAgree() {
  const all = ['agreeTerms','agreePrivacy','agreeAge','agreeMarketing','agreeRefund'];
  const allChecked = all.every(id => document.getElementById(id)?.checked);
  const allAgree = document.getElementById('agreeAll');
  if (allAgree) allAgree.checked = allChecked;
}

// ===== 유효성 검사 유틸 =====
function setFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearFieldError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
}
function clearAllErrors() {
  document.querySelectorAll('.auth-field-error').forEach(el => el.textContent = '');
}

// ===== 이메일 인증 =====
let verifyCode = '';
let verifyEmailAddr = '';
let verifyTimerInt = null;

async function sendEmailVerify() {
  const email = document.getElementById('regEmail')?.value?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('regEmailErr', '올바른 이메일을 입력해주세요'); return;
  }
  clearFieldError('regEmailErr');

  // DB에서 중복 확인
  const existing = await findUserByEmail(email);
  if (existing) {
    setFieldError('regEmailErr', '이미 사용 중인 이메일입니다'); return;
  }

  verifyCode = String(Math.floor(100000 + Math.random() * 900000));
  verifyEmailAddr = email;
  const btn = document.getElementById('verifyEmailBtn');
  const codeField = document.getElementById('verifyCodeField');
  if (btn) { btn.disabled = true; btn.textContent = '재발송 (60s)'; }
  if (codeField) codeField.style.display = 'block';
  showAuthToast(`📧 인증 코드: ${verifyCode} (테스트 모드)`, 'info');
  let sec = 60;
  clearInterval(verifyTimerInt);
  verifyTimerInt = setInterval(() => {
    sec--;
    if (btn) btn.textContent = `재발송 (${sec}s)`;
    if (sec <= 0) { clearInterval(verifyTimerInt); if (btn) { btn.disabled = false; btn.textContent = '재발송'; } }
  }, 1000);
}

let emailVerified = false;
function checkEmailVerify() {
  const input = document.getElementById('regVerifyCode')?.value?.trim();
  const successEl = document.getElementById('verifySuccess');
  const errEl     = document.getElementById('verifyErr');
  if (input === verifyCode) {
    emailVerified = true;
    if (successEl) successEl.textContent = '✅ 이메일 인증이 완료되었습니다';
    if (errEl) errEl.textContent = '';
    document.getElementById('regEmail').classList.add('success');
  } else {
    emailVerified = false;
    if (errEl) errEl.textContent = '인증 코드가 일치하지 않습니다';
    if (successEl) successEl.textContent = '';
  }
}

// ===== 로그인 =====
function handleLogin(e) {
  e.preventDefault();
  clearAllErrors();
  const email    = document.getElementById('loginEmail')?.value?.trim();
  const pw       = document.getElementById('loginPw')?.value;
  const remember = document.getElementById('loginRemember')?.checked;
  let valid = true;
  if (!email) { setFieldError('loginEmailErr', '이메일을 입력해주세요'); valid = false; }
  if (!pw)    { setFieldError('loginPwErr', '비밀번호를 입력해주세요'); valid = false; }
  if (!valid) return;
  toggleLoginLoading(true);

  findUserByEmail(email).then(user => {
    if (!user || user.pw_hash !== hashPw(pw)) {
      setFieldError('loginPwErr', '이메일 또는 비밀번호가 일치하지 않습니다');
      toggleLoginLoading(false);
      return;
    }
    if (user.status === 'suspended') {
      setFieldError('loginPwErr', '정지된 계정입니다. 고객센터에 문의해주세요');
      toggleLoginLoading(false);
      return;
    }
    // 로그인 성공 — DB lastLogin 업데이트
    apiPatch(API_USERS + '/' + user.id, { lastLogin: new Date().toISOString() }).catch(() => {});
    setCurrentUser(user);
    if (remember) {
      localStorage.setItem('sajuon_remember_email', email);
    } else {
      localStorage.removeItem('sajuon_remember_email');
    }
    showAuthToast(`✅ ${user.name}님 환영합니다!`, 'success');
    setTimeout(() => {
      const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
      sessionStorage.removeItem('sajuon_auth_redirect');
      window.location.href = redirect;
    }, 800);
  }).catch(() => {
    setFieldError('loginPwErr', '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요');
    toggleLoginLoading(false);
  });
}

function toggleLoginLoading(loading) {
  const btn = document.getElementById('loginSubmitBtn');
  const txt = document.getElementById('loginBtnText');
  const ld  = document.getElementById('loginBtnLoading');
  if (btn) btn.disabled = loading;
  if (txt) txt.style.display = loading ? 'none' : 'flex';
  if (ld)  ld.style.display  = loading ? 'flex' : 'none';
}

// ===== 회원가입 =====
function handleRegister(e) {
  e.preventDefault();
  clearAllErrors();
  const name      = document.getElementById('regName')?.value?.trim();
  const email     = document.getElementById('regEmail')?.value?.trim();
  const pw        = document.getElementById('regPw')?.value;
  const pwc       = document.getElementById('regPwConfirm')?.value;
  const phone     = document.getElementById('regPhone')?.value?.trim();
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

  // DB 중복 확인 후 가입
  findUserByEmail(email).then(async existing => {
    if (existing) {
      setFieldError('regEmailErr', '이미 사용 중인 이메일입니다');
      toggleRegLoading(false);
      return;
    }

    const FREE_PT = 500;
    const newUser = {
      name:            name,
      email:           email,
      pw_hash:         hashPw(pw),
      phone:           phone || '',
      birth:           birth,
      gender:          gender,
      agree_marketing: marketing,
      points:          FREE_PT,
      status:          'active',
      created_at_str:  new Date().toLocaleString('ko-KR'),
      lastLogin:       new Date().toISOString(),
    };

    try {
      const created = await apiPost(API_USERS, newUser);
      if (!created || !created.id) {
        throw new Error('서버에서 사용자 ID를 반환하지 않았습니다');
      }

      // 가입 환영 포인트 이력 저장
      await apiPost(API_HIST, {
        user_id:     created.id,
        email:       created.email,
        type:        'charge',
        amount:      FREE_PT,
        balance:     FREE_PT,
        description: '신규 가입 무료 포인트',
        category:    'welcome'
      }).catch(() => {}); // 이력 저장 실패해도 가입은 완료

      // 세션에 저장 (pw_hash 제외, 로컬 birth/gender 포함)
      const sessionUser = {
        id:              created.id,
        name:            created.name || name,
        email:           created.email || email,
        phone:           created.phone || phone || '',
        birth:           created.birth || birth,
        gender:          created.gender || gender,
        points:          FREE_PT,
        status:          'active',
        agree_marketing: marketing,
        created_at_str:  created.created_at_str || newUser.created_at_str,
      };
      setCurrentUser(sessionUser);
      localStorage.setItem('sajuon_points', String(FREE_PT));
      localStorage.setItem('sajuon_initialized', 'true');
      toggleRegLoading(false);

      // 성공 화면
      const regForm = document.getElementById('registerForm');
      const successScreen = document.getElementById('registerSuccess');
      const nameLabel = document.getElementById('successNameLabel');
      if (regForm) regForm.style.display = 'none';
      if (successScreen) successScreen.style.display = 'block';
      if (nameLabel) nameLabel.textContent = `${name}님, 운세ON 가입을 완료했습니다 🎉`;
      const tabs = document.querySelector('.auth-tabs');
      if (tabs) tabs.style.display = 'none';

      const savedRedirect = sessionStorage.getItem('sajuon_auth_redirect');
      const autoTarget = savedRedirect || 'chat.html';
      sessionStorage.removeItem('sajuon_auth_redirect');
      if (successScreen) {
        // 중복 카운트다운 방지
        const existingCount = successScreen.querySelector('.reg-countdown');
        if (!existingCount) {
          const countEl = document.createElement('p');
          countEl.className = 'reg-countdown';
          countEl.style.cssText = 'font-size:0.82rem;color:var(--text-muted);margin-top:10px';
          countEl.textContent = '3초 후 자동으로 이동합니다...';
          successScreen.appendChild(countEl);
          let count = 3;
          const t = setInterval(() => {
            count--;
            if (count > 0) { countEl.textContent = `${count}초 후 자동으로 이동합니다...`; }
            else { clearInterval(t); window.location.href = autoTarget; }
          }, 1000);
        }
      }
    } catch (err) {
      console.error('[회원가입 오류]', err);
      showAuthToast('❌ 가입 처리 중 오류가 발생했습니다. 다시 시도해주세요', 'error');
      toggleRegLoading(false);
    }
  }).catch((err) => {
    console.error('[회원가입 서버 오류]', err);
    showAuthToast('❌ 서버 오류. 잠시 후 다시 시도해주세요', 'error');
    toggleRegLoading(false);
  });
}

function toggleRegLoading(loading) {
  const btn = document.getElementById('regSubmitBtn');
  const txt = document.getElementById('regBtnText');
  const ld  = document.getElementById('regBtnLoading');
  if (btn) btn.disabled = loading;
  if (txt) txt.style.display = loading ? 'none' : 'flex';
  if (ld)  ld.style.display  = loading ? 'flex' : 'none';
}

// ===== 비밀번호 찾기 =====
function handleForgot() {
  const email = document.getElementById('forgotEmail')?.value?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAuthToast('❌ 올바른 이메일을 입력해주세요', 'error'); return;
  }
  findUserByEmail(email).then(found => {
    if (!found) { showAuthToast('❌ 가입된 이메일이 아닙니다', 'error'); return; }
    showAuthToast('📧 비밀번호 재설정 링크를 발송했습니다 (시뮬레이션)', 'success');
    setTimeout(() => switchTab('login'), 2000);
  });
}

// ===== 소셜 로그인 =====
function socialLogin(provider) {
  showAuthToast(`🔗 ${provider === 'kakao' ? '카카오' : '네이버'} 로그인 연동 준비 중입니다`, 'info');
}

// ===== auth.html 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  const isAuthPage = !!(document.getElementById('loginForm') || document.getElementById('registerForm'));
  if (!isAuthPage) return;
  const savedEmail = localStorage.getItem('sajuon_remember_email');
  if (savedEmail) {
    const loginEmail = document.getElementById('loginEmail');
    const loginRemember = document.getElementById('loginRemember');
    if (loginEmail) loginEmail.value = savedEmail;
    if (loginRemember) loginRemember.checked = true;
  }
  const params = new URLSearchParams(location.search);
  if (params.get('tab') === 'register') switchTab('register');

  // 이미 로그인 상태면 DB 포인트 동기화 후 리다이렉트
  const user = getCurrentUser();
  if (user) {
    syncPointsFromDB().then(() => {
      const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
      sessionStorage.removeItem('sajuon_auth_redirect');
      window.location.href = redirect;
    });
  }
});

/* =========================================
   헤더 공통 인증 상태 관리
   ========================================= */
function initAuthHeader() {
  const headerActions = document.querySelector('.header-actions, #headerActions');
  if (!headerActions) return;
  if (headerActions.dataset.authInit === 'true') return;
  headerActions.dataset.authInit = 'true';

  const user = getCurrentUser();

  // DB에서 최신 포인트 동기화 (비동기)
  if (user && user.id) syncPointsFromDB();

  const pts = user ? parseInt(localStorage.getItem('sajuon_points') || user.points || '0', 10) : 0;

  // ── 포인트 표시 갱신 ──
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
    // ── 로그인 상태 ──
    if (btnLogin)  btnLogin.style.display  = 'none';
    if (btnSignup) btnSignup.style.display = 'none';
    if (btnCharge) btnCharge.style.display = 'none';

    // 기존 HTML에 userMenuWrap이 있으면 표시, 없으면 동적 생성
    let userMenuWrap = headerActions.querySelector('.user-menu-wrap, #userMenuWrap');
    if (userMenuWrap) {
      userMenuWrap.style.display = 'flex';
      // 기존 HTML 구조의 데이터 채우기
      const nameLabel = userMenuWrap.querySelector('#userNameLabel, .user-name-label');
      const avatarEl  = userMenuWrap.querySelector('#userAvatar, .user-avatar');
      const dropName  = userMenuWrap.querySelector('#dropdownName, .user-dropdown-name');
      const dropEmail = userMenuWrap.querySelector('#dropdownEmail, .user-dropdown-email');
      const dropPt    = userMenuWrap.querySelector('#dropdownPt, .user-dropdown-pt span, #dropdownPtVal');
      if (nameLabel) nameLabel.textContent = user.name || '';
      if (avatarEl)  avatarEl.textContent  = (user.name || '?')[0].toUpperCase();
      if (dropName)  dropName.textContent  = user.name || '';
      if (dropEmail) dropEmail.textContent = user.email || '';
      if (dropPt)    dropPt.textContent    = pts.toLocaleString();
    } else {
      // 동적으로 유저 메뉴 생성
      const userMenu = document.createElement('div');
      userMenu.className = 'user-menu-wrap';
      userMenu.id = 'userMenuWrap';
      userMenu.style.display = 'flex';
      userMenu.innerHTML = `
        <button class="user-menu-btn" onclick="toggleUserMenu(event)" aria-label="사용자 메뉴">
          <span class="user-avatar">${(user.name || '?')[0].toUpperCase()}</span>
          <span class="user-name-label">${user.name || ''}</span>
          <i class="fas fa-chevron-down user-menu-arrow" style="font-size:0.7rem"></i>
        </button>
        <div class="user-dropdown" id="userDropdown" style="display:none">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${user.name || ''}</div>
            <div class="user-dropdown-email">${user.email || ''}</div>
            <div class="user-dropdown-pt"><i class="fas fa-coins"></i> <span id="dropdownPtVal">${pts.toLocaleString()}</span>P</div>
          </div>
          <div class="user-dropdown-links" style="padding:8px 0">
            <a href="pricing.html" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:#333;text-decoration:none;font-size:0.88rem"><i class="fas fa-bolt"></i> 포인트 충전</a>
            <a href="pricing.html#history" style="display:flex;align-items:center;gap:8px;padding:10px 16px;color:#333;text-decoration:none;font-size:0.88rem"><i class="fas fa-history"></i> 이용내역</a>
          </div>
          <button class="user-logout-btn" onclick="logout()" style="width:100%;padding:10px 16px;background:none;border:none;border-top:1px solid #eee;color:#c62828;font-size:0.88rem;cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px"><i class="fas fa-sign-out-alt"></i> 로그아웃</button>
        </div>`;
      headerActions.appendChild(userMenu);
    }

  } else {
    // ── 비로그인 상태 ──
    if (btnLogin)  btnLogin.style.display  = '';
    if (btnSignup) btnSignup.style.display = '';
    if (btnCharge) btnCharge.style.display = '';
    const userMenuWrap = headerActions.querySelector('.user-menu-wrap, #userMenuWrap');
    if (userMenuWrap) userMenuWrap.style.display = 'none';
  }
}

function toggleUserMenu(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('userDropdown');
  if (!dd) return;
  const isOpen = dd.style.display !== 'none' && dd.classList.contains('show');
  // 열려있으면 닫기, 닫혀있으면 열기
  if (dd.style.display === 'none' || dd.style.display === '') {
    dd.style.display = 'block';
    dd.classList.add('show');
  } else {
    dd.style.display = 'none';
    dd.classList.remove('show');
  }
}
document.addEventListener('click', (e) => {
  const dd = document.getElementById('userDropdown');
  if (!dd) return;
  const wrap = document.querySelector('.user-menu-wrap, #userMenuWrap');
  if (wrap && !wrap.contains(e.target)) {
    dd.style.display = 'none';
    dd.classList.remove('show');
  }
});

function handleLogout() {
  setCurrentUser(null);
  localStorage.removeItem('sajuon_points');
  localStorage.removeItem('sajuon_initialized');
  // 로그아웃 후 항상 홈으로 이동
  window.location.href = 'index.html';
}

// ★ 여러 페이지에서 logout() 으로 호출하므로 별칭 등록
function logout() { handleLogout(); }
window.logout = logout; // 전역 등록 보장

// ===== 구버전 localStorage 사용자 → DB 마이그레이션 (1회) =====
async function migrateLocalUsers() {
  // ★ 이미 마이그레이션 완료 → 즉시 종료 (데이터 삭제 방지)
  if (localStorage.getItem('sajuon_migrated_v3')) return;

  const oldUsers = [];
  try {
    const raw = localStorage.getItem('sajuon_users');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) oldUsers.push(...arr);
    }
  } catch {}

  // 구버전 사용자가 없으면 플래그만 세우고 종료 (삭제는 하지 않음)
  if (oldUsers.length === 0) {
    localStorage.setItem('sajuon_migrated_v3', '1');
    return;
  }

  let migratedCount = 0;
  for (const ou of oldUsers) {
    if (!ou.email) continue;
    try {
      const existing = await findUserByEmail(ou.email);
      if (existing) { migratedCount++; continue; } // 이미 DB에 있으면 스킵
      const pts = parseInt(ou.points || 0, 10);
      const created = await apiPost(API_USERS, {
        name:            ou.name || '',
        email:           ou.email || '',
        pw_hash:         ou.pw || ou.pw_hash || '',
        phone:           ou.phone || '',
        birth:           ou.birth || '',
        gender:          ou.gender || 'none',
        status:          ou.status || 'active',
        agree_marketing: ou.marketing || false,
        points:          pts,
        created_at_str:  ou.joinDate || new Date().toLocaleString('ko-KR'),
        lastLogin:       ou.lastLogin || new Date().toISOString(),
      });
      if (pts > 0) {
        await apiPost(API_HIST, {
          user_id:     created.id,
          email:       created.email,
          type:        'charge',
          amount:      pts,
          balance:     pts,
          description: '기존 데이터 마이그레이션',
          category:    'migrate'
        }).catch(() => {});
      }
      // 현재 로그인 사용자면 세션 업데이트
      const cu = getCurrentUser();
      if (cu && cu.email === ou.email) setCurrentUser({ ...created });
      migratedCount++;
    } catch (err) {
      console.warn('[마이그레이션 실패]', ou.email, err);
    }
  }

  // 마이그레이션 완료 후 플래그 설정
  // ★ 원본 sajuon_users는 삭제하지 않음 — 혹시 모를 데이터 손실 방지
  localStorage.setItem('sajuon_migrated_v3', '1');
  if (migratedCount > 0) {
    console.log(`[마이그레이션 완료] ${migratedCount}명 DB 이전 완료`);
  }
}

// 페이지 로드 시 마이그레이션 실행
document.addEventListener('DOMContentLoaded', () => {
  migrateLocalUsers();
});
