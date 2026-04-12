/* =========================================
   운세ON — js/auth.js  v4.0
   회원가입 / 로그인 / 로그아웃
   localStorage 기반 — GitHub Pages 완벽 동작
   ========================================= */

// ===== 사용자 저장소 (localStorage) =====
const LS_USERS   = 'sajuon_users';       // 전체 회원 목록
const LS_SESSION = 'sajuon_current_user'; // 현재 로그인 사용자
const LS_POINTS  = 'sajuon_points';       // 현재 포인트

function getAllUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); } catch { return []; }
}
function saveAllUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(LS_SESSION) || 'null'); } catch { return null; }
}
function setCurrentUser(user) {
  if (user) {
    const safe = { ...user };
    delete safe.pw_hash;
    localStorage.setItem(LS_SESSION, JSON.stringify(safe));
    localStorage.setItem(LS_POINTS, String(user.points || 0));
  } else {
    localStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_POINTS);
  }
}
function findUserByEmail(email) {
  const users = getAllUsers();
  return users.find(u => u.email === email) || null;
}
function saveUser(user) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  saveAllUsers(users);
}

// ===== 포인트 차감 =====
function deductPoints(cost, description, category) {
  const cu = getCurrentUser();
  if (!cu) return false;
  const current = parseInt(localStorage.getItem(LS_POINTS) || cu.points || '0', 10);
  if (current < cost) return false;
  const next = current - cost;

  // 이력 저장
  const hist = getPointHistory();
  hist.unshift({
    id:          Date.now() + '_' + Math.random().toString(36).slice(2),
    user_id:     cu.id,
    email:       cu.email,
    type:        'use',
    amount:      -cost,
    balance:     next,
    description: description || 'AI 상담',
    category:    category || '',
    created_at:  Date.now()
  });
  localStorage.setItem('sajuon_history', JSON.stringify(hist.slice(0, 500)));

  // 사용자 포인트 업데이트
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === cu.id);
  if (idx >= 0) { users[idx].points = next; saveAllUsers(users); }
  localStorage.setItem(LS_POINTS, String(next));
  const updated = { ...cu, points: next };
  localStorage.setItem(LS_SESSION, JSON.stringify(updated));

  // UI 갱신
  document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
    el.textContent = next.toLocaleString();
  });
  return true;
}

// ===== 포인트 충전 =====
function chargePoints(amount, description) {
  const cu = getCurrentUser();
  if (!cu) return false;
  const current = parseInt(localStorage.getItem(LS_POINTS) || cu.points || '0', 10);
  const next = current + amount;

  const hist = getPointHistory();
  hist.unshift({
    id:          Date.now() + '_' + Math.random().toString(36).slice(2),
    user_id:     cu.id,
    email:       cu.email,
    type:        'charge',
    amount:      amount,
    balance:     next,
    description: description || '포인트 충전',
    category:    'charge',
    created_at:  Date.now()
  });
  localStorage.setItem('sajuon_history', JSON.stringify(hist.slice(0, 500)));

  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === cu.id);
  if (idx >= 0) { users[idx].points = next; saveAllUsers(users); }
  localStorage.setItem(LS_POINTS, String(next));
  const updated = { ...cu, points: next };
  localStorage.setItem(LS_SESSION, JSON.stringify(updated));

  document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
    el.textContent = next.toLocaleString();
  });
  return true;
}

// ===== 포인트 이력 =====
function getPointHistory() {
  try { return JSON.parse(localStorage.getItem('sajuon_history') || '[]'); } catch { return []; }
}

// ===== DB 동기화 (localStorage 버전 — 즉시 완료) =====
function syncPointsFromDB() {
  const cu = getCurrentUser();
  if (!cu) return Promise.resolve();
  const pts = parseInt(localStorage.getItem(LS_POINTS) || cu.points || '0', 10);
  document.querySelectorAll('[id$="PointVal"], .header-point-val').forEach(el => {
    el.textContent = pts.toLocaleString();
  });
  return Promise.resolve();
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

// ===== UUID 생성 =====
function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
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
    if (tabLogin)  tabLogin.classList.add('active');
  } else if (tab === 'register') {
    if (registerForm) registerForm.style.display = 'block';
    if (tabReg)       tabReg.classList.add('active');
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
  if (icon) icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// ===== 비밀번호 강도 =====
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
  const l   = levels[lvl];
  fill.style.width = l.w;
  fill.style.background = l.color;
  label.textContent = l.text;
  label.style.color = l.color;
}

// ===== 전화번호 포맷 =====
function formatPhone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length <= 3)      input.value = v;
  else if (v.length <= 7) input.value = v.slice(0,3) + '-' + v.slice(3);
  else                    input.value = v.slice(0,3) + '-' + v.slice(3,7) + '-' + v.slice(7,11);
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
let verifyTimerInt  = null;

function sendEmailVerify() {
  const email = document.getElementById('regEmail')?.value?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('regEmailErr', '올바른 이메일을 입력해주세요'); return;
  }
  clearFieldError('regEmailErr');

  // 중복 확인 (localStorage)
  if (findUserByEmail(email)) {
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
  const input     = document.getElementById('regVerifyCode')?.value?.trim();
  const successEl = document.getElementById('verifySuccess');
  const errEl     = document.getElementById('verifyErr');
  if (input === verifyCode) {
    emailVerified = true;
    if (successEl) successEl.textContent = '✅ 이메일 인증이 완료되었습니다';
    if (errEl)     errEl.textContent = '';
    document.getElementById('regEmail')?.classList.add('success');
  } else {
    emailVerified = false;
    if (errEl)     errEl.textContent = '인증 코드가 일치하지 않습니다';
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

  const user = findUserByEmail(email);
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

  // 로그인 성공
  // id 없는 구버전 사용자 자동 보정
  if (!user.id) {
    user.id = 'uid_' + Date.now() + '_' + Math.random().toString(36).slice(2);
  }
  user.lastLogin = new Date().toISOString();
  saveUser(user);
  setCurrentUser(user);

  if (remember) localStorage.setItem('sajuon_remember_email', email);
  else          localStorage.removeItem('sajuon_remember_email');

  showAuthToast(`✅ ${user.name}님 환영합니다!`, 'success');
  setTimeout(() => {
    const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
    sessionStorage.removeItem('sajuon_auth_redirect');
    window.location.href = redirect;
  }, 800);
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

  // 유효성 검사
  let valid = true;
  if (!name || name.length < 2)
    { setFieldError('regNameErr', '이름은 2자 이상 입력해주세요'); valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    { setFieldError('regEmailErr', '올바른 이메일을 입력해주세요'); valid = false; }
  if (!pw || pw.length < 8)
    { setFieldError('regPwErr', '비밀번호는 8자 이상이어야 합니다'); valid = false; }
  else if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw))
    { setFieldError('regPwErr', '영문과 숫자를 조합해주세요'); valid = false; }
  if (pw !== pwc)
    { setFieldError('regPwConfirmErr', '비밀번호가 일치하지 않습니다'); valid = false; }
  if (!document.getElementById('agreeTerms')?.checked)
    { showAuthToast('❌ 이용약관에 동의해주세요', 'error'); valid = false; }
  if (!document.getElementById('agreePrivacy')?.checked)
    { showAuthToast('❌ 개인정보 처리방침에 동의해주세요', 'error'); valid = false; }
  if (!document.getElementById('agreeAge')?.checked)
    { showAuthToast('❌ 만 14세 이상 확인이 필요합니다', 'error'); valid = false; }
  if (!document.getElementById('agreeRefund')?.checked)
    { showAuthToast('❌ 환불 정책 확인이 필요합니다', 'error'); valid = false; }
  if (!valid) return;

  // 중복 이메일 확인
  if (findUserByEmail(email)) {
    setFieldError('regEmailErr', '이미 사용 중인 이메일입니다');
    return;
  }

  toggleRegLoading(true);

  // 신규 사용자 생성
  const FREE_PT  = 500;
  const newUser  = {
    id:              genId(),
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

  // localStorage에 저장
  saveUser(newUser);

  // 가입 환영 포인트 이력
  const hist = getPointHistory();
  hist.unshift({
    id:          genId(),
    user_id:     newUser.id,
    email:       newUser.email,
    type:        'charge',
    amount:      FREE_PT,
    balance:     FREE_PT,
    description: '신규 가입 무료 포인트',
    category:    'welcome',
    created_at:  Date.now()
  });
  localStorage.setItem('sajuon_history', JSON.stringify(hist.slice(0, 500)));

  // 세션 저장
  setCurrentUser(newUser);
  localStorage.setItem(LS_POINTS, String(FREE_PT));
  localStorage.setItem('sajuon_initialized', 'true');

  toggleRegLoading(false);

  // 성공 화면 표시
  const regForm      = document.getElementById('registerForm');
  const successScreen = document.getElementById('registerSuccess');
  const nameLabel    = document.getElementById('successNameLabel');
  const tabs         = document.querySelector('.auth-tabs');
  if (regForm)        regForm.style.display = 'none';
  if (successScreen)  successScreen.style.display = 'block';
  if (tabs)           tabs.style.display = 'none';
  if (nameLabel)      nameLabel.textContent = `${name}님, 운세ON 가입을 완료했습니다 🎉`;

  // 3초 후 리다이렉트
  const savedRedirect = sessionStorage.getItem('sajuon_auth_redirect');
  const autoTarget    = savedRedirect || 'chat.html';
  sessionStorage.removeItem('sajuon_auth_redirect');

  if (successScreen) {
    const existingCount = successScreen.querySelector('.reg-countdown');
    if (!existingCount) {
      const countEl = document.createElement('p');
      countEl.className = 'reg-countdown';
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
  }
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
  const found = findUserByEmail(email);
  if (!found) { showAuthToast('❌ 가입된 이메일이 아닙니다', 'error'); return; }
  showAuthToast('📧 비밀번호 재설정 링크를 발송했습니다 (시뮬레이션)', 'success');
  setTimeout(() => switchTab('login'), 2000);
}

// ===== 소셜 로그인 =====
function socialLogin(provider) {
  showAuthToast(`🔗 ${provider === 'kakao' ? '카카오' : '네이버'} 로그인 연동 준비 중입니다`, 'info');
}

// ===== auth.html 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
  const isAuthPage = !!(document.getElementById('loginForm') || document.getElementById('registerForm'));
  if (!isAuthPage) return;

  // 기억된 이메일 복원
  const savedEmail = localStorage.getItem('sajuon_remember_email');
  if (savedEmail) {
    const loginEmail   = document.getElementById('loginEmail');
    const loginRemember = document.getElementById('loginRemember');
    if (loginEmail)    loginEmail.value = savedEmail;
    if (loginRemember) loginRemember.checked = true;
  }

  // URL 파라미터로 탭 전환
  const params = new URLSearchParams(location.search);
  if (params.get('tab') === 'register') switchTab('register');

  // 이미 로그인 상태면 바로 리다이렉트
  const user = getCurrentUser();
  if (user) {
    const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
    sessionStorage.removeItem('sajuon_auth_redirect');
    window.location.href = redirect;
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
  const pts  = user ? parseInt(localStorage.getItem(LS_POINTS) || user.points || '0', 10) : 0;

  // 포인트 표시
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

    let userMenuWrap = headerActions.querySelector('.user-menu-wrap, #userMenuWrap');
    if (userMenuWrap) {
      userMenuWrap.style.display = 'flex';
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
  localStorage.removeItem(LS_POINTS);
  localStorage.removeItem('sajuon_initialized');
  window.location.href = 'index.html';
}
function logout() { handleLogout(); }
window.logout = logout;
