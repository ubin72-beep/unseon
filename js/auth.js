/* =========================================
   운세ON — js/auth.js
   회원가입 / 로그인 / 약관 동의 시스템
   ========================================= */

// ===== 사용자 스토리지 =====
function getUsers() {
  try { return JSON.parse(localStorage.getItem('sajuon_users') || '[]'); } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem('sajuon_users', JSON.stringify(users));
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('sajuon_current_user') || 'null'); } catch { return null; }
}
function setCurrentUser(user) {
  if (user) {
    const safe = { ...user };
    delete safe.pw;
    localStorage.setItem('sajuon_current_user', JSON.stringify(safe));
    // 포인트 동기화
    localStorage.setItem('sajuon_points', String(user.points || 0));
  } else {
    localStorage.removeItem('sajuon_current_user');
  }
}

// ===== 토스트 =====
function showAuthToast(msg, type = 'info') {
  const t = document.getElementById('authToast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = type === 'error' ? '#c62828' : type === 'success' ? '#2e7d32' : 'var(--primary-dark)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
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
  const loginForm = document.getElementById('loginForm');
  const forgotForm = document.getElementById('forgotForm');
  if (loginForm) loginForm.style.display = 'none';
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
  const required = ['agreeTerms','agreePrivacy','agreeAge','agreeRefund'];
  const optional = ['agreeMarketing'];
  const all = [...required, ...optional];
  const allChecked = all.every(id => document.getElementById(id)?.checked);
  const allAgree = document.getElementById('agreeAll');
  if (allAgree) allAgree.checked = allChecked;
}

// ===== 이메일 인증 시뮬레이션 =====
let verifyCode = '';
let verifyEmailAddr = '';
let verifyTimerInt = null;

function sendEmailVerify() {
  const email = document.getElementById('regEmail')?.value?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('regEmailErr', '올바른 이메일을 입력해주세요');
    return;
  }
  clearFieldError('regEmailErr');

  // 중복 확인
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    setFieldError('regEmailErr', '이미 사용 중인 이메일입니다');
    return;
  }

  // 6자리 코드 생성 (시뮬레이션)
  verifyCode = String(Math.floor(100000 + Math.random() * 900000));
  verifyEmailAddr = email;

  const btn = document.getElementById('verifyEmailBtn');
  const codeField = document.getElementById('verifyCodeField');
  if (btn) { btn.disabled = true; btn.textContent = '재발송 (60s)'; }
  if (codeField) codeField.style.display = 'block';

  showAuthToast(`📧 인증 코드가 발송되었습니다: ${verifyCode} (시뮬레이션)`, 'info');

  // 60초 카운트다운
  let sec = 60;
  clearInterval(verifyTimerInt);
  verifyTimerInt = setInterval(() => {
    sec--;
    if (btn) btn.textContent = `재발송 (${sec}s)`;
    if (sec <= 0) {
      clearInterval(verifyTimerInt);
      if (btn) { btn.disabled = false; btn.textContent = '재발송'; }
    }
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
    if (errEl)     errEl.textContent = '';
    document.getElementById('regEmail').classList.add('success');
  } else {
    emailVerified = false;
    if (errEl) errEl.textContent = '인증 코드가 일치하지 않습니다';
    if (successEl) successEl.textContent = '';
  }
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

  // 로딩 상태
  toggleLoginLoading(true);

  setTimeout(() => {
    const users = getUsers();
    const user  = users.find(u => u.email === email && u.pw === hashPw(pw));

    if (!user) {
      setFieldError('loginPwErr', '이메일 또는 비밀번호가 일치하지 않습니다');
      toggleLoginLoading(false);
      return;
    }

    // 로그인 성공
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    setCurrentUser(user);

    if (remember) {
      localStorage.setItem('sajuon_remember_email', email);
    } else {
      localStorage.removeItem('sajuon_remember_email');
    }

    // 포인트 동기화
    localStorage.setItem('sajuon_points', String(user.points || 0));

    showAuthToast(`✅ ${user.name}님 환영합니다!`, 'success');
    setTimeout(() => {
      const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
      sessionStorage.removeItem('sajuon_auth_redirect');
      window.location.href = redirect;
    }, 800);
  }, 900);
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

  const name  = document.getElementById('regName')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const pw    = document.getElementById('regPw')?.value;
  const pwc   = document.getElementById('regPwConfirm')?.value;
  const phone = document.getElementById('regPhone')?.value?.trim();
  const birth = document.getElementById('regBirth')?.value;
  const gender= document.querySelector('input[name="gender"]:checked')?.value || 'none';
  const marketing = document.getElementById('agreeMarketing')?.checked;

  let valid = true;

  if (!name || name.length < 2) {
    setFieldError('regNameErr', '이름은 2자 이상 입력해주세요'); valid = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('regEmailErr', '올바른 이메일을 입력해주세요'); valid = false;
  } else {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      setFieldError('regEmailErr', '이미 사용 중인 이메일입니다'); valid = false;
    }
  }
  if (!pw || pw.length < 8) {
    setFieldError('regPwErr', '비밀번호는 8자 이상이어야 합니다'); valid = false;
  } else if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) {
    setFieldError('regPwErr', '영문과 숫자를 조합해주세요'); valid = false;
  }
  if (pw !== pwc) {
    setFieldError('regPwConfirmErr', '비밀번호가 일치하지 않습니다'); valid = false;
  }
  if (!document.getElementById('agreeTerms')?.checked) {
    showAuthToast('❌ 이용약관에 동의해주세요', 'error'); valid = false;
  }
  if (!document.getElementById('agreePrivacy')?.checked) {
    showAuthToast('❌ 개인정보 처리방침에 동의해주세요', 'error'); valid = false;
  }
  if (!document.getElementById('agreeAge')?.checked) {
    showAuthToast('❌ 만 14세 이상 확인이 필요합니다', 'error'); valid = false;
  }
  if (!document.getElementById('agreeRefund')?.checked) {
    showAuthToast('❌ 환불 정책 확인이 필요합니다', 'error'); valid = false;
  }
  if (!valid) return;

  // 로딩
  toggleRegLoading(true);

  setTimeout(() => {
    const FREE_PT = parseInt(localStorage.getItem('sajuon_free_pt') || '500', 10);
    const newUser = {
      id:         'u_' + Date.now(),
      name,
      email,
      pw:         hashPw(pw),
      phone:      phone || '',
      birth:      birth || '',
      gender,
      marketing,
      points:     FREE_PT,
      joinDate:   new Date().toISOString(),
      lastLogin:  new Date().toISOString(),
      status:     'active',
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    localStorage.setItem('sajuon_points', String(FREE_PT));
    localStorage.setItem('sajuon_initialized', 'true');

    // 가입 이력 저장
    const hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
    hist.unshift({
      date: new Date().toLocaleString('ko-KR'),
      type: '신규 가입 무료 포인트',
      amount: FREE_PT,
      note: `${name}님 가입 환영 포인트`
    });
    localStorage.setItem('sajuon_history', JSON.stringify(hist));

    toggleRegLoading(false);

    // 성공 화면
    const regForm = document.getElementById('registerForm');
    const successScreen = document.getElementById('registerSuccess');
    const nameLabel = document.getElementById('successNameLabel');
    if (regForm) regForm.style.display = 'none';
    if (successScreen) successScreen.style.display = 'block';
    if (nameLabel) nameLabel.textContent = `${name}님, 운세ON 가입을 완료했습니다 🎉`;

    // 탭 숨기기
    const tabs = document.querySelector('.auth-tabs');
    if (tabs) tabs.style.display = 'none';

    // ★ 3초 후 자동으로 리다이렉트 (savedRedirect 또는 chat.html)
    const savedRedirect = sessionStorage.getItem('sajuon_auth_redirect');
    const autoTarget = savedRedirect || 'chat.html';
    sessionStorage.removeItem('sajuon_auth_redirect');

    // 카운트다운 표시
    if (successScreen) {
      const countEl = document.createElement('p');
      countEl.id = 'regAutoRedirect';
      countEl.style.cssText = 'font-size:0.82rem;color:var(--text-muted);margin-top:10px';
      countEl.textContent = '3초 후 자동으로 이동합니다...';
      successScreen.appendChild(countEl);
      let count = 3;
      const countTimer = setInterval(() => {
        count--;
        if (count > 0) {
          countEl.textContent = `${count}초 후 자동으로 이동합니다...`;
        } else {
          clearInterval(countTimer);
          window.location.href = autoTarget;
        }
      }, 1000);
    }
  }, 1100);
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
  const users = getUsers();
  const found = users.find(u => u.email === email);
  if (!found) {
    showAuthToast('❌ 가입된 이메일이 아닙니다', 'error'); return;
  }
  showAuthToast('📧 비밀번호 재설정 링크를 발송했습니다 (시뮬레이션)', 'success');
  setTimeout(() => switchTab('login'), 2000);
}

// ===== 소셜 로그인 시뮬레이션 =====
function socialLogin(provider) {
  showAuthToast(`🔗 ${provider === 'kakao' ? '카카오' : '네이버'} 로그인 연동 준비 중입니다`, 'info');
}

// ===== 단순 해시 (시뮬레이션용) =====
function hashPw(pw) {
  // 실제 서비스에서는 bcrypt 등 서버사이드 해시 필요
  let hash = 0;
  for (let i = 0; i < pw.length; i++) {
    const char = pw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + pw.length;
}

// ===== 초기화 (auth.html 전용) =====
document.addEventListener('DOMContentLoaded', () => {
  // auth.html 페이지에서만 실행 — 다른 페이지에서 auth.js가 로드돼도 리다이렉트하지 않음
  const isAuthPage = !!(document.getElementById('loginForm') || document.getElementById('registerForm'));
  if (!isAuthPage) return;

  // 저장된 이메일 자동 입력
  const savedEmail = localStorage.getItem('sajuon_remember_email');
  if (savedEmail) {
    const loginEmail = document.getElementById('loginEmail');
    const loginRemember = document.getElementById('loginRemember');
    if (loginEmail) loginEmail.value = savedEmail;
    if (loginRemember) loginRemember.checked = true;
  }

  // URL 파라미터로 탭 결정
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  if (tab === 'register') switchTab('register');

  // 이미 로그인 상태면 저장된 이동 대상 또는 index.html로 리다이렉트
  const user = getCurrentUser();
  if (user) {
    const redirect = sessionStorage.getItem('sajuon_auth_redirect') || 'index.html';
    sessionStorage.removeItem('sajuon_auth_redirect');
    window.location.href = redirect;
  }
});

/* =========================================
   헤더 공통 인증 상태 관리 (다른 페이지에서도 사용)
   ========================================= */
function initAuthHeader() {
  // ★ DOM 기반 중복 실행 방지 — 같은 페이지에서 여러 번 호출해도 1회만 동작
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;
  if (headerActions.dataset.authInit === 'true') return;
  headerActions.dataset.authInit = 'true';

  // ★ 로그인 상태 재확인 및 포인트 동기화
  const user = getCurrentUser();

  // 포인트를 계정 데이터와 동기화 (로그인 시)
  if (user && user.id) {
    const userPts = parseInt(user.points || '0', 10);
    const storedPts = parseInt(localStorage.getItem('sajuon_points') || '0', 10);
    // 계정 포인트가 더 정확함 — 동기화
    if (userPts !== storedPts) {
      localStorage.setItem('sajuon_points', String(userPts));
    }
  }

  const pts = user ? parseInt(localStorage.getItem('sajuon_points') || (user.points || '0'), 10) : 0;

  // 기존 포인트 표시 업데이트
  const pointDisplay = headerActions.querySelector('.point-display');
  const chargeBtn = headerActions.querySelector('.btn-charge');
  if (pointDisplay) {
    const valEl = pointDisplay.querySelector('[id$="PointVal"]') || pointDisplay.querySelector('span');
    if (valEl) valEl.textContent = pts.toLocaleString();
  }

  if (user) {
    // ★ 로그인 상태 — 유저 메뉴 추가 (이미 있으면 패스)
    if (!headerActions.querySelector('.user-menu-wrap')) {
      const userMenu = document.createElement('div');
      userMenu.className = 'user-menu-wrap';
      userMenu.innerHTML = `
        <button class="user-menu-btn" onclick="toggleUserMenu()">
          <div class="user-avatar">${user.name[0]}</div>
          <span class="user-name-label">${user.name}</span>
          <i class="fas fa-chevron-down" style="font-size:0.7rem;color:var(--text-muted)"></i>
        </button>
        <div class="user-dropdown" id="userDropdown" style="display:none">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${user.name}</div>
            <div class="user-dropdown-email">${user.email}</div>
            <div class="user-dropdown-pt"><i class="fas fa-coins"></i> ${pts.toLocaleString()}P</div>
          </div>
          <div class="user-dropdown-links">
            <a href="pricing.html"><i class="fas fa-coins"></i> 포인트 충전</a>
            <a href="pricing.html#history"><i class="fas fa-history"></i> 이용 내역</a>
            <a href="mypage.html"><i class="fas fa-user-cog"></i> 내 정보</a>
            <a href="admin.html"><i class="fas fa-cog"></i> 관리자</a>
          </div>
          <button class="user-logout-btn" onclick="logout()"><i class="fas fa-sign-out-alt"></i> 로그아웃</button>
        </div>
      `;
      if (chargeBtn) {
        headerActions.insertBefore(userMenu, chargeBtn);
      } else {
        headerActions.appendChild(userMenu);
      }
    }
  } else {
    // ★ 비로그인 상태 — 로그인/회원가입 버튼 추가 (이미 있으면 패스)
    if (!headerActions.querySelector('.btn-login')) {
      const loginBtn = document.createElement('a');
      loginBtn.href = 'auth.html';
      loginBtn.className = 'btn btn-outline btn-login';
      loginBtn.style.cssText = 'padding:8px 16px;font-size:0.88rem';
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 로그인';

      const signupBtn = document.createElement('a');
      signupBtn.href = 'auth.html?tab=register';
      signupBtn.className = 'btn btn-primary btn-signup';
      signupBtn.style.cssText = 'padding:8px 16px;font-size:0.88rem';
      signupBtn.innerHTML = '<i class="fas fa-user-plus"></i> 회원가입';

      if (chargeBtn) {
        headerActions.insertBefore(signupBtn, chargeBtn);
        headerActions.insertBefore(loginBtn, signupBtn);
      } else {
        headerActions.appendChild(loginBtn);
        headerActions.appendChild(signupBtn);
      }
    }
  }
}

function toggleUserMenu() {
  const dd = document.getElementById('userDropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}

function logout() {
  if (!confirm('로그아웃 하시겠습니까?')) return;
  setCurrentUser(null);
  // 포인트·초기화 플래그 제거 (다음 로그인 시 계정 포인트로 복원)
  localStorage.removeItem('sajuon_points');
  localStorage.removeItem('sajuon_initialized');
  // 이용 내역도 세션 초기화 (계정 로그인 시 계정 데이터 사용)
  // ※ sajuon_history는 유지 (비회원도 볼 수 있도록)
  window.location.href = 'index.html';
}

// 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.user-menu-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.style.display = 'none';
  }
});
