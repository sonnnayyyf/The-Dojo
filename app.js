/* The Dojo — site engine: i18n/nav, course unlock (AES-GCM/PBKDF2), lesson viewer,
   and graded exercises (quiz / Python via Pyodide / SQL via sql.js). */
(function () {
  'use strict';

  // ---------- editable contact config ----------
  const SENSEI = {
    zalo: '0986061705',            // your Zalo phone number
    email: 'tranhoangson503@gmail.com',
  };
  window.DOJO_SENSEI = SENSEI;      // read by static pages (e.g. course overview) for the "Ask about" button

  // ---------- Supabase (accounts + cloud progress) ----------
  const SUPABASE = {
    url: 'https://hlxadajedsymnhzgjyzv.supabase.co',
    anonKey: 'sb_publishable_o9tw-1K5G2pWsskY6HdW6g_mk-2ufNb',
  };

  // ---------- i18n & nav/footer ----------
  window.LANG = localStorage.getItem('dojoLang') || 'vi';

  const NAV_I18N = {
    vi: { home: 'Trang chủ', about: 'Giới thiệu', pricing: 'Học phí', courses: 'Khóa học', langBtn: 'EN',
      login: 'Đăng nhập', logout: 'Đăng xuất', account: 'Tài khoản', profile: 'Hồ sơ', admin: 'Quản trị',
      viewProfile: 'Hồ sơ của tôi' },
    en: { home: 'Home', about: 'About', pricing: 'Pricing', courses: 'Courses', langBtn: 'VI',
      login: 'Log in', logout: 'Log out', account: 'Account', profile: 'Profile', admin: 'Admin',
      viewProfile: 'My profile' },
  };
  const FOOTER_I18N = {
    vi: {
      tag: 'Học thật, làm thật, ngay trong trình duyệt.',
      explore: 'Khám phá', courses: 'Khóa học', pricing: 'Học phí', about: 'Giới thiệu',
      account: 'Tài khoản', login: 'Đăng nhập / Hồ sơ', buy: 'Mua khóa học',
      contact: 'Liên hệ',
      privacy: 'Quyền riêng tư & Điều khoản',
      rights: 'Bảo lưu mọi quyền.',
    },
    en: {
      tag: 'Real practice, right in your browser.',
      explore: 'Explore', courses: 'Courses', pricing: 'Pricing', about: 'About',
      account: 'Account', login: 'Log in / Profile', buy: 'Buy a course',
      contact: 'Contact',
      privacy: 'Privacy & Terms',
      rights: 'All rights reserved.',
    },
  };

  const PAGE_FILE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function renderNav() {
    const t = NAV_I18N[LANG];
    const coursePages = ['courses.html', 'course-detail.html', 'python.html', 'qa.html', 'sql.html', 'web.html'];
    const links = [
      ['index.html', t.home], ['courses.html', t.courses], ['pricing.html', t.pricing], ['about.html', t.about],
    ];
    const linksHtml = links.map(([href, label]) => {
      const active = PAGE_FILE === href || (href === 'courses.html' && coursePages.includes(PAGE_FILE));
      return `<a class="${active ? 'here' : ''}" href="${href}">${label}</a>`;
    }).join('');
    const html = `<nav><div class="wrap">
      <a class="logo" href="index.html">The <span>Dojo</span></a>
      <div class="links">${linksHtml}<button class="langBtn" id="langToggle">${t.langBtn}</button><button class="langBtn acct" id="acctBtn">${t.login}</button></div>
    </div></nav>`;
    document.body.insertAdjacentHTML('afterbegin', html);
    document.getElementById('langToggle').addEventListener('click', () => {
      window.LANG = LANG === 'vi' ? 'en' : 'vi';
      localStorage.setItem('dojoLang', LANG);
      document.querySelector('nav').remove();
      document.querySelector('footer')?.remove();
      renderNav();
      renderFooter();
      applyI18n();
      if (typeof window.__dojoRelang === 'function') window.__dojoRelang();
    });
    document.getElementById('acctBtn').addEventListener('click', onAccountClick);
    updateAccountUI();
    updateAdminUI();
  }

  function renderFooter() {
    const f = FOOTER_I18N[LANG];
    const zalo = (SENSEI && SENSEI.zalo) || '';
    const email = (SENSEI && SENSEI.email) || '';
    const year = new Date().getFullYear();
    document.body.insertAdjacentHTML('beforeend',
      `<footer><div class="wrap footGrid">
        <div class="footBrand">
          <a class="logo" href="index.html">The <span>Dojo</span></a>
          <p>${f.tag}</p>
        </div>
        <div class="footCol">
          <h4>${f.explore}</h4>
          <a href="courses.html">${f.courses}</a>
          <a href="pricing.html">${f.pricing}</a>
          <a href="about.html">${f.about}</a>
        </div>
        <div class="footCol">
          <h4>${f.account}</h4>
          <a href="profile.html">${f.login}</a>
          <a href="checkout.html">${f.buy}</a>
        </div>
        <div class="footCol">
          <h4>${f.contact}</h4>
          <span>Zalo: ${zalo}</span>
          <span>Email: ${email}</span>
        </div>
      </div>
      <div class="wrap footBottom">© ${year} The Dojo. ${f.rights} · <a href="privacy.html">${f.privacy}</a></div></footer>`);
  }

  function applyI18n() {
    if (typeof PAGE_I18N !== 'undefined') {
      const dict = PAGE_I18N[LANG] || PAGE_I18N.vi;
      document.querySelectorAll('[data-t]').forEach((el) => {
        const k = el.dataset.t;
        if (dict[k] != null) el.textContent = dict[k];
      });
      document.querySelectorAll('[data-t-html]').forEach((el) => {
        const k = el.dataset.tHtml;
        if (dict[k] != null) el.innerHTML = dict[k];
      });
    }
    if (typeof window.onLang === 'function') window.onLang();
  }

  // ---------- accounts + cloud progress (Supabase) ----------
  const Cloud = { client: null, user: null, profile: null, isAdmin: false, ready: false };
  const authResolvedCbs = [];
  // bumps whenever the signed-in account actually changes; used to cancel stale editor saves
  let dojoAuthGen = 0, dojoLastUid;
  function fireAuthResolved() { authResolvedCbs.forEach((cb) => { try { cb(); } catch (e) {} }); }

  async function getSupabase() {
    if (Cloud.client) return Cloud.client;
    if (!SUPABASE.url || SUPABASE.url.includes('YOUR_')) return null;
    try {
      if (!window.supabase) {
        await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
      }
      Cloud.client = window.supabase.createClient(SUPABASE.url, SUPABASE.anonKey);
      return Cloud.client;
    } catch { return null; }
  }

  async function loadProfile() {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) { Cloud.profile = null; window.DOJO_PROFILE = null; return null; }
    try {
      const { data } = await sb.from('profiles').select('*').eq('user_id', Cloud.user.id).maybeSingle();
      Cloud.profile = data || null;
    } catch { Cloud.profile = null; }
    window.DOJO_PROFILE = Cloud.profile;
    return Cloud.profile;
  }

  async function checkAdmin() {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) return false;
    try { const { data } = await sb.rpc('is_admin'); return !!data; } catch { return false; }
  }

  async function saveProfile(fields, userId) {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) throw new Error('not_logged_in');
    const target = userId || Cloud.user.id;
    const isSelf = target === Cloud.user.id;
    const row = Object.assign({ updated_at: new Date().toISOString() }, fields);
    let error;
    if (isSelf) {
      row.user_id = target;
      row.email = Cloud.user.email;
      ({ error } = await sb.from('profiles').upsert(row));
    } else {
      // admin editing another student's row (already exists from the signup trigger)
      ({ error } = await sb.from('profiles').update(row).eq('user_id', target));
    }
    if (error) throw error;
    if (isSelf) await loadProfile();
    return isSelf ? Cloud.profile : null;
  }

  async function refreshAccountState() {
    const uid = Cloud.user ? Cloud.user.id : null;
    if (uid !== dojoLastUid) { dojoAuthGen++; dojoLastUid = uid; }
    if (Cloud.user) {
      await loadProfile();
      Cloud.isAdmin = await checkAdmin();
    } else {
      Cloud.profile = null; Cloud.isAdmin = false; window.DOJO_PROFILE = null;
    }
    updateAccountUI();
    updateAdminUI();
    maybePromptProfile();
    enforceAuthGate();
  }

  function profileComplete() {
    return !!(Cloud.profile && Cloud.profile.full_name && Cloud.profile.phone);
  }

  function maybePromptProfile() {
    if (!Cloud.user) return;
    // hard onboarding gate: must fill name + phone before using anything else
    if (!profileComplete() && PAGE_FILE !== 'profile.html' && PAGE_FILE !== 'reset-password.html') {
      location.href = 'profile.html';
    }
  }

  async function initAuth() {
    const sb = await getSupabase();
    if (!sb) { Cloud.ready = true; fireAuthResolved(); return; }
    const { data } = await sb.auth.getSession();
    Cloud.user = data?.session?.user || null;
    await refreshAccountState();
    Cloud.ready = true;
    fireAuthResolved();
    sb.auth.onAuthStateChange(async (_evt, session) => {
      Cloud.user = session?.user || null;
      await refreshAccountState();
      fireAuthResolved();
      if (typeof window.__dojoOnAuth === 'function') window.__dojoOnAuth();
    });
    if (typeof window.__dojoOnAuth === 'function') window.__dojoOnAuth();
  }

  function acctInitials() {
    const p = Cloud.profile, u = Cloud.user;
    const name = (p && p.full_name) || (u && u.email) || '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const ini = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (name[0] || '?');
    return ini.toUpperCase();
  }

  function updateAccountUI() {
    const btn = document.getElementById('acctBtn');
    if (!btn) return;
    const t = NAV_I18N[LANG];
    closeAcctMenu();
    if (Cloud.user) {
      btn.classList.add('signedin', 'avatarBtn');
      const url = Cloud.profile && Cloud.profile.avatar_url;
      if (url) { btn.style.backgroundImage = `url("${url}")`; btn.textContent = ''; btn.classList.add('hasImg'); }
      else { btn.style.backgroundImage = ''; btn.textContent = acctInitials(); btn.classList.remove('hasImg'); }
      btn.title = (Cloud.profile && Cloud.profile.full_name) || Cloud.user.email || '';
    } else {
      btn.classList.remove('signedin', 'avatarBtn', 'hasImg');
      btn.style.backgroundImage = '';
      btn.textContent = t.login;
      btn.title = '';
    }
  }

  // keep legacy call sites happy: the admin link now lives in the account dropdown
  function updateAdminUI() {
    const link = document.getElementById('adminLink');
    if (link) link.remove();
  }

  function closeAcctMenu() {
    const m = document.getElementById('acctMenu');
    if (m) m.remove();
    document.removeEventListener('click', onDocClickAcct, true);
  }
  function onDocClickAcct(e) {
    const m = document.getElementById('acctMenu');
    const btn = document.getElementById('acctBtn');
    if (m && !m.contains(e.target) && e.target !== btn) closeAcctMenu();
  }
  function toggleAcctMenu() {
    if (document.getElementById('acctMenu')) { closeAcctMenu(); return; }
    const links = document.querySelector('nav .links');
    if (!links) return;
    const t = NAV_I18N[LANG];
    const items = [['profile.html', t.viewProfile]];
    if (Cloud.isAdmin) items.push(['admin.html', t.admin]);
    const menu = document.createElement('div');
    menu.id = 'acctMenu';
    menu.className = 'acctMenu';
    menu.innerHTML = items.map(([h, l]) => `<a href="${h}">${l}</a>`).join('') +
      `<button type="button" id="acctLogout">${t.logout}</button>`;
    links.appendChild(menu);
    menu.querySelector('#acctLogout').addEventListener('click', async () => {
      closeAcctMenu();
      const sb = await getSupabase();
      if (sb) await sb.auth.signOut();
      location.href = 'index.html';
    });
    setTimeout(() => document.addEventListener('click', onDocClickAcct, true), 0);
  }

  function onAccountClick() {
    if (Cloud.user) toggleAcctMenu();
    else openAuthModal();
  }

  // ---- auth gate for protected pages (page sets window.DOJO_REQUIRE_AUTH = true) ----
  function enforceAuthGate() {
    if (!window.DOJO_REQUIRE_AUTH) return;
    if (Cloud.user) { const g = document.getElementById('authGate'); if (g) g.remove(); return; }
    if (document.getElementById('authGate')) return;
    const vi = LANG === 'vi';
    const g = document.createElement('div');
    g.id = 'authGate';
    g.className = 'authGate';
    g.innerHTML = `<div class="authGateCard">
      <h3>${vi ? 'Cần đăng nhập' : 'Login required'}</h3>
      <p>${vi ? 'Vui lòng đăng nhập để tiếp tục.' : 'Please log in to continue.'}</p>
      <button class="btn" id="authGateBtn">${vi ? 'Đăng nhập' : 'Log in'}</button>
      <a class="authGateHome" href="index.html">${vi ? 'Về trang chủ' : 'Back to home'}</a>
    </div>`;
    document.body.appendChild(g);
    g.querySelector('#authGateBtn').addEventListener('click', () => openAuthModal());
  }

  function openAuthModal() {
    if (document.getElementById('authModal')) return;
    const vi = LANG === 'vi';
    const wrap = document.createElement('div');
    wrap.id = 'authModal';
    wrap.className = 'modalOverlay';
    wrap.innerHTML = `<div class="modalCard">
      <button class="modalClose" aria-label="close">×</button>
      <h3 id="authTitle">${vi ? 'Đăng nhập' : 'Log in'}</h3>
      <button class="btn gbtn" id="googleBtn">${vi ? 'Tiếp tục với Google' : 'Continue with Google'}</button>
      <div class="authOr">${vi ? 'hoặc' : 'or'}</div>
      <input type="email" id="authEmail" placeholder="Email" autocomplete="email">
      <input type="password" id="authPw" placeholder="${vi ? 'Mật khẩu' : 'Password'}" autocomplete="current-password">
      <input type="password" id="authPw2" placeholder="${vi ? 'Xác nhận mật khẩu' : 'Confirm password'}" autocomplete="new-password" hidden>
      <button class="btn" id="authSubmit">${vi ? 'Đăng nhập' : 'Log in'}</button>
      <div class="authErr" id="authErr"></div>
      <div class="authSwitch">
        <button type="button" class="authLink" id="authForgot">${vi ? 'Quên mật khẩu?' : 'Forgot password?'}</button>
        <div class="authToggleRow">
          <span id="authTogglePrompt">${vi ? 'Chưa có tài khoản?' : 'No account?'}</span>
          <button type="button" class="authLink strong" id="authToggle">${vi ? 'Đăng ký' : 'Sign up'}</button>
        </div>
      </div>
    </div>`;
    document.body.appendChild(wrap);
    let mode = 'login';
    const err = wrap.querySelector('#authErr');
    const setErr = (m) => { err.textContent = m || ''; };
    const close = () => wrap.remove();
    wrap.querySelector('.modalClose').addEventListener('click', close);
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    wrap.querySelector('#googleBtn').addEventListener('click', async () => {
      const sb = await getSupabase();
      if (!sb) { setErr('Cannot reach server.'); return; }
      await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href } });
    });
    wrap.querySelector('#authForgot').addEventListener('click', async () => {
      const email = wrap.querySelector('#authEmail').value.trim();
      if (!email) { setErr(vi ? 'Nhập email của bạn để đặt lại mật khẩu.' : 'Enter your email to reset your password.'); return; }
      const sb = await getSupabase();
      if (!sb) { setErr('Cannot reach server.'); return; }
      const dir = location.href.substring(0, location.href.lastIndexOf('/') + 1);
      const redirectTo = dir.startsWith('http') ? dir + 'reset-password.html' : undefined;
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) { setErr(error.message); return; }
      setErr(vi ? 'Đã gửi email đặt lại mật khẩu — kiểm tra hộp thư.' : 'Password reset email sent — check your inbox.');
    });
    wrap.querySelector('#authToggle').addEventListener('click', () => {
      mode = mode === 'login' ? 'signup' : 'login';
      const isLogin = mode === 'login';
      wrap.querySelector('#authTitle').textContent = isLogin ? (vi ? 'Đăng nhập' : 'Log in') : (vi ? 'Đăng ký' : 'Sign up');
      wrap.querySelector('#authSubmit').textContent = isLogin ? (vi ? 'Đăng nhập' : 'Log in') : (vi ? 'Đăng ký' : 'Sign up');
      wrap.querySelector('#authPw2').hidden = isLogin;
      wrap.querySelector('#authForgot').style.display = isLogin ? '' : 'none';
      wrap.querySelector('#authTogglePrompt').textContent = isLogin
        ? (vi ? 'Chưa có tài khoản?' : 'No account?')
        : (vi ? 'Đã có tài khoản?' : 'Have an account?');
      wrap.querySelector('#authToggle').textContent = isLogin
        ? (vi ? 'Đăng ký' : 'Sign up')
        : (vi ? 'Đăng nhập' : 'Log in');
      setErr('');
    });
    wrap.querySelector('#authSubmit').addEventListener('click', async () => {
      setErr('');
      const email = wrap.querySelector('#authEmail').value.trim();
      const pw = wrap.querySelector('#authPw').value;
      if (!email || !pw) { setErr(vi ? 'Nhập email và mật khẩu.' : 'Enter email and password.'); return; }
      if (mode === 'signup') {
        const pw2 = wrap.querySelector('#authPw2').value;
        if (pw.length < 6) { setErr(vi ? 'Mật khẩu tối thiểu 6 ký tự.' : 'Password must be at least 6 characters.'); return; }
        if (pw !== pw2) { setErr(vi ? 'Mật khẩu xác nhận không khớp.' : 'Passwords do not match.'); return; }
      }
      const sb = await getSupabase();
      if (!sb) { setErr('Cannot reach server.'); return; }
      // where the confirmation email link returns to (only meaningful on an http(s) site)
      const dir = location.href.substring(0, location.href.lastIndexOf('/') + 1);
      const emailRedirectTo = dir.startsWith('http') ? dir + 'profile.html' : undefined;
      const fn = mode === 'login'
        ? sb.auth.signInWithPassword({ email, password: pw })
        : sb.auth.signUp({ email, password: pw, options: { emailRedirectTo } });
      const { data, error } = await fn;
      if (error) { setErr(error.message); return; }
      if (mode === 'signup' && !data.session) {
        setErr(vi ? 'Đã gửi email xác nhận — kiểm tra hộp thư.' : 'Confirmation email sent — check your inbox.');
        return;
      }
      close();
    });
  }

  async function redeemCode(code) {
    const sb = await getSupabase();
    if (!sb) throw new Error('offline');
    const { data, error } = await sb.rpc('redeem_code', { p_code: code });
    if (error) throw error;
    return data; // the course id
  }

  async function fetchEntitlements() {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) return [];
    const { data } = await sb.from('entitlements').select('course').eq('user_id', Cloud.user.id);
    return (data || []).map((r) => r.course);
  }

  // Content-lock: the per-course decryption key, delivered only to entitled accounts (RLS-gated rpc).
  async function fetchCourseKey(course) {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) return null;
    try { const { data } = await sb.rpc('get_course_key', { p_course: course }); return data || null; }
    catch { return null; }
  }

  async function cloudLoadProgress(course) {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) return null;
    const { data } = await sb.from('progress').select('data').eq('course', course).eq('user_id', Cloud.user.id).maybeSingle();
    return data?.data || null;
  }

  async function cloudSaveProgress(course, dataObj) {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) return false;
    const { error } = await sb.from('progress').upsert({ user_id: Cloud.user.id, course, data: dataObj, updated_at: new Date().toISOString() });
    return !error;
  }

  // course pages register a hook to show Saving… / Saved / Not synced
  let syncStatusHook = null;
  function setSyncStatus(s) { if (syncStatusHook) syncStatusHook(s); }

  // ---------- API for standalone pages (profile.html, admin.html) ----------
  window.DOJO_CLOUD = {
    getUser: () => Cloud.user,
    getProfile: () => Cloud.profile,
    isAdmin: () => !!Cloud.isAdmin,
    isProfileComplete: () => profileComplete(),
    isReady: () => Cloud.ready,
    getClient: getSupabase,
    loadProfile,
    saveProfile,
    signOut: async () => { const sb = await getSupabase(); if (sb) await sb.auth.signOut(); },
    openAuth: () => openAuthModal(),
    onAuthResolved: (cb) => { authResolvedCbs.push(cb); if (Cloud.ready) cb(); },
  };

  // ---------- base64 / crypto helpers ----------
  function b64ToBytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function deriveWrapKey(code, saltBytes) {
    const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: saltBytes, iterations: 250000, hash: 'SHA-256' },
      baseKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt'],
    );
  }

  // Tries the code against every KEYRING entry; AES-GCM's auth tag makes wrong-code failures safe/expected.
  async function tryUnlockCode(code) {
    const keyring = typeof KEYRING !== 'undefined' ? KEYRING : [];
    for (const entry of keyring) {
      try {
        const salt = b64ToBytes(entry.salt);
        const iv = b64ToBytes(entry.iv);
        const wrapKey = await deriveWrapKey(code, salt);
        const ckBytes = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, wrapKey, b64ToBytes(entry.wk)));
        return { ckBytes, label: entry.label };
      } catch { /* not this entry, keep trying */ }
    }
    return null;
  }

  // A lesson body may be a plain string or a {vi,en} object; pick the active language.
  function resolveHtml(value) {
    if (value == null) return null;
    if (typeof value === 'string') return value;
    return value[LANG] ?? value.vi ?? Object.values(value)[0] ?? '';
  }

  async function decryptLessonHtml(lesson, ckBytes) {
    if (lesson.html != null) return resolveHtml(lesson.html); // free, or not locked yet
    if (!ckBytes) return null;
    const key = await crypto.subtle.importKey('raw', ckBytes, 'AES-GCM', false, ['decrypt']);
    const iv = b64ToBytes(lesson.iv);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, b64ToBytes(lesson.enc));
    const text = new TextDecoder().decode(pt);
    let value = text;
    try { const o = JSON.parse(text); if (o && typeof o === 'object') value = o; } catch { /* single-language string */ }
    return resolveHtml(value);
  }

  // ---------- course page ----------
  const UI = {
    vi: { locked: 'Khóa', open: 'Đã mở', free: 'Miễn phí', unlockPh: 'Nhập mã mở khóa', unlockBtn: 'Mở khóa',
      badCode: 'Mã không đúng hoặc không dùng cho khóa này.', close: 'Đóng', unlockedAs: 'đã mở khóa: ',
      run: 'Chạy', reset: 'Đặt lại', pass: 'Đạt', fail: 'Chưa đạt', loading: 'Đang tải môi trường chạy code…',
      showAnswer: 'Xem đáp án mẫu', hideAnswer: 'Ẩn đáp án mẫu', output: 'Kết quả in ra', tryAgain: 'Chưa đúng, thử lại nhé',
      askSensei: 'Hỏi giáo viên', tryExample: 'Chạy thử', outline: 'Nội dung bài học', done: 'Xong', stop: 'Dừng',
      preview: 'Xem trước', webTimeout: 'Hết thời gian chạy — kiểm tra vòng lặp vô hạn?', loadFail: 'Không tải được trình chạy code — kiểm tra kết nối mạng.',
      senseiIntro: 'Viết câu hỏi của bạn — chúng tôi sẽ tự động kèm bài học và code của bạn.',
      questionPh: 'Bạn đang kẹt ở đâu?', sendZalo: 'Gửi qua Zalo', sendEmail: 'Gửi email',
      copied: 'Đã copy câu hỏi + code. Sang Zalo, dán (Ctrl+V) vào ô chat và gửi nhé!', progressLabel: 'Tiến độ',
      syncing: 'Đang lưu…', saved: 'Đã lưu ✓', syncErr: 'Chưa đồng bộ', retry: 'Thử lại' },
    en: { locked: 'Locked', open: 'Unlocked', free: 'Free', unlockPh: 'Enter unlock code', unlockBtn: 'Unlock',
      badCode: 'Code is invalid or not for this course.', close: 'Close', unlockedAs: 'unlocked as: ',
      run: 'Run', reset: 'Reset', pass: 'Pass', fail: 'Fail', loading: 'Loading the code runner…',
      showAnswer: 'Show sample answer', hideAnswer: 'Hide sample answer', output: 'Output', tryAgain: 'Not quite — try again',
      askSensei: 'Ask teacher', tryExample: 'Try it', outline: 'In this lesson', done: 'Done', stop: 'Stop',
      preview: 'Preview', webTimeout: 'Run timed out — check for an infinite loop?', loadFail: 'Couldn\'t load the code runner — check your connection.',
      senseiIntro: 'Write your question — we\'ll attach the lesson and your code automatically.',
      questionPh: 'Where are you stuck?', sendZalo: 'Send via Zalo', sendEmail: 'Send email',
      copied: 'Question + code copied. Open Zalo, paste (Ctrl+V) into the chat and send!', progressLabel: 'Progress',
      syncing: 'Saving…', saved: 'Saved ✓', syncErr: 'Not synced', retry: 'Retry' },
  };

  const BELTS = {
    vi: ['Đai trắng', 'Đai vàng', 'Đai cam', 'Đai xanh', 'Đai nâu', 'Đai đen'],
    en: ['White belt', 'Yellow belt', 'Orange belt', 'Green belt', 'Brown belt', 'Black belt'],
  };
  function beltFor(done, total) {
    if (total > 0 && done >= total) return 5;      // black
    const frac = total ? done / total : 0;
    return Math.min(4, Math.floor(frac * 5));       // white..brown
  }

  // ---------- progress (localStorage) ----------
  const Progress = {
    // per-account namespace so two students on one browser never share saved work
    key: (c) => `dojo_prog_${c}_${(Cloud.user && Cloud.user.id) || 'guest'}`,
    load(c) { try { return JSON.parse(localStorage.getItem(this.key(c))) || {}; } catch { return {}; } },
    save(c, d) { localStorage.setItem(this.key(c), JSON.stringify(d)); },
    entry(d, lesson) { return d[lesson] || (d[lesson] = { passed: [], total: 0 }); },
    setTotal(c, lesson, total) { const d = this.load(c); this.entry(d, lesson).total = total; this.save(c, d); },
    markPassed(c, lesson, ex) {
      const d = this.load(c); const e = this.entry(d, lesson);
      if (!e.passed.includes(ex)) { e.passed.push(ex); e._t = Date.now(); this.save(c, d); return true; }
      return false;
    },
    passedCount(c, lesson) { const e = this.load(c)[lesson]; return e ? e.passed.length : 0; },
    total(c, lesson) { const e = this.load(c)[lesson]; return e ? e.total : 0; },
    lessonDone(c, lesson) { const e = this.load(c)[lesson]; return !!(e && e.total > 0 && e.passed.length >= e.total); },
    completedLessons(c, n) { let done = 0; for (let i = 1; i <= n; i++) if (this.lessonDone(c, i)) done++; return done; },
    // saved code the student typed, per exercise (like an autosaving doc)
    saveAnswer(c, lesson, ex, val) {
      const d = this.load(c); const e = this.entry(d, lesson);
      (e.answers || (e.answers = {}))[ex] = val; e._t = Date.now(); this.save(c, d);
    },
    getAnswer(c, lesson, ex) { const e = this.load(c)[lesson]; return e && e.answers ? e.answers[ex] : undefined; },
    // saved code in ungraded "try it" example blocks, per lesson
    saveExample(c, lesson, i, val) {
      const d = this.load(c); const e = this.entry(d, lesson);
      (e.examples || (e.examples = {}))[i] = val; e._t = Date.now(); this.save(c, d);
    },
    getExample(c, lesson, i) { const e = this.load(c)[lesson]; return e && e.examples ? e.examples[i] : undefined; },
    // Union incoming (cloud) progress into local; per lesson the NEWER side wins its answers/examples,
    // but completed exercises always union (a pass is never lost).
    merge(c, incoming) {
      if (!incoming || typeof incoming !== 'object') return;
      const d = this.load(c);
      for (const [lesson, e] of Object.entries(incoming)) {
        const cur = this.entry(d, lesson);
        cur.total = Math.max(cur.total || 0, e.total || 0);
        for (const ex of (e.passed || [])) if (!cur.passed.includes(ex)) cur.passed.push(ex);
        const incomingNewer = (e._t || 0) > (cur._t || 0);
        if (e.answers) cur.answers = incomingNewer
          ? Object.assign({}, cur.answers || {}, e.answers)
          : Object.assign({}, e.answers, cur.answers || {});
        if (e.examples) cur.examples = incomingNewer
          ? Object.assign({}, cur.examples || {}, e.examples)
          : Object.assign({}, e.examples, cur.examples || {});
        cur._t = Math.max(cur._t || 0, e._t || 0);
      }
      this.save(c, d);
    },
  };
  let progressChangedHook = null;

  // debounced cloud sync so autosaving code while typing doesn't spam the network
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  const cloudSaveTimers = {};
  function queueCloudSave(courseId) {
    if (!Cloud.user) return;
    const uid = Cloud.user.id; // bind this save to the user who typed it
    setSyncStatus('syncing');
    clearTimeout(cloudSaveTimers[courseId]);
    cloudSaveTimers[courseId] = setTimeout(async () => {
      if (Cloud.user && Cloud.user.id === uid) {
        const ok = await cloudSaveProgress(courseId, Progress.load(courseId));
        setSyncStatus(ok ? 'saved' : 'error');
      }
    }, 1200);
  }

  function initCoursePage() {
    const course = COURSE;
    // Content key is bound to the signed-in account — never a browser-global cache (so logout re-locks).
    const ckKeyFor = (uid) => `dojo_ck_${course.id}_${uid || 'guest'}`;
    let ckBytes = null;
    let entitled = false;

    function isUnlocked() { return !!ckBytes || entitled; }

    // Entitled accounts fetch (or reuse the per-account cached) decryption key.
    async function ensureKey() {
      if (ckBytes || !entitled || !Cloud.user) return;
      const uid = Cloud.user.id;
      const cached = localStorage.getItem(ckKeyFor(uid));
      if (cached) { try { ckBytes = b64ToBytes(cached); return; } catch { /* re-fetch below */ } }
      const b64 = await fetchCourseKey(course.id);
      if (b64) { ckBytes = b64ToBytes(b64); try { localStorage.setItem(ckKeyFor(uid), b64); } catch { /* ignore */ } }
    }

    let openIndex = null;
    let currentLabel = null;

    function hasLocked() { return course.lessons.some((l) => l.kind !== 'free' && l.html == null); }

    function renderTop(unlockedLabel) {
      const u = UI[LANG];
      const n = course.lessons.length;
      const done = Progress.completedLessons(course.id, n);
      const belt = BELTS[LANG][beltFor(done, n)];
      const pct = Math.round((done / n) * 100);
      const top = document.getElementById('courseTop');
      top.innerHTML = `<h3>${course.title[LANG]}</h3>`
        + `<span class="beltTag belt-${beltFor(done, n)}">${belt}</span>`
        + (unlockedLabel ? `<span class="unlockedAs">${u.unlockedAs}${unlockedLabel}</span>` : '');
      let bar = document.getElementById('courseProg');
      if (!bar) {
        top.insertAdjacentHTML('afterend', '<div class="courseProg" id="courseProg"></div>');
        bar = document.getElementById('courseProg');
      }
      bar.innerHTML = `<div class="pbar"><span style="width:${pct}%"></span></div>`
        + `<span class="pnum">${u.progressLabel}: ${done}/${n} (${pct}%)</span>`
        + `<span class="syncStatus" id="syncStatus"></span>`;
      document.getElementById('courseSub').textContent = course.sub[LANG];
      applySync(lastSync);
    }

    let lastSync = null;
    function applySync(s) {
      const el = document.getElementById('syncStatus');
      if (!el) return;
      const u = UI[LANG];
      if (s === 'syncing') { el.textContent = u.syncing; el.className = 'syncStatus sync'; }
      else if (s === 'saved') { el.textContent = u.saved; el.className = 'syncStatus ok'; }
      else if (s === 'error') {
        el.innerHTML = `${u.syncErr} <a href="#" id="syncRetry">${u.retry}</a>`;
        el.className = 'syncStatus err';
        el.querySelector('#syncRetry').addEventListener('click', (e) => { e.preventDefault(); queueCloudSave(course.id); });
      } else { el.textContent = ''; el.className = 'syncStatus'; }
    }
    syncStatusHook = (s) => { lastSync = s; applySync(s); };

    function renderList() {
      const u = UI[LANG];
      const list = document.getElementById('lessonList');
      const rows = course.lessons.map((lesson, i) => {
        const isFree = lesson.kind === 'free';
        const badgeClass = isFree ? 'free' : (isUnlocked() ? 'open' : 'lock');
        const badgeText = isFree ? u.free : (isUnlocked() ? u.open : u.locked);
        const lessonNum = i + 1;
        const total = Progress.total(course.id, lessonNum);
        const passed = Progress.passedCount(course.id, lessonNum);
        let prog = '';
        if (Progress.lessonDone(course.id, lessonNum)) prog = `<span class="prog done">✓</span>`;
        else if (total > 0 && passed > 0) prog = `<span class="prog">${passed}/${total}</span>`;
        return `<button type="button" class="lrow" data-i="${i}">
          <span class="n">${String(i + 1).padStart(2, '0')}</span>
          <span class="t">${lesson.t[LANG]}</span>
          ${prog}
          <span class="badge ${badgeClass}">${badgeText}</span>
        </button>`;
      }).join('');
      list.innerHTML = `<div class="lessons">${rows}</div>`;

      if (hasLocked() && !isUnlocked()) {
        list.insertAdjacentHTML('beforeend', `<div class="unlock">
          <input type="text" id="unlockInput" placeholder="${u.unlockPh}" autocomplete="off">
          <button type="button" class="btn" id="unlockBtn">${u.unlockBtn}</button>
        </div><div class="err" id="unlockErr" style="display:none"></div>`);
        document.getElementById('unlockBtn').addEventListener('click', onUnlockClick);
        document.getElementById('unlockInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') onUnlockClick(); });
      }

      list.querySelectorAll('.lrow').forEach((row) => {
        row.addEventListener('click', () => {
          const i = Number(row.dataset.i);
          const lesson = course.lessons[i];
          const isFree = lesson.kind === 'free';
          const needsCode = !isFree && lesson.html == null && !isUnlocked();
          if (needsCode) {
            document.getElementById('unlockInput')?.focus();
            return;
          }
          openLesson(i);
        });
      });
    }

    async function onUnlockClick() {
      const u = UI[LANG];
      const input = document.getElementById('unlockInput');
      const err = document.getElementById('unlockErr');
      const code = input.value.trim();
      if (!code) return;
      // Logged in: redeem the code against the account (account owns the course).
      if (Cloud.user) {
        try {
          const owned = await redeemCode(code);
          if (owned && owned !== course.id) {
            err.textContent = LANG === 'vi' ? 'Mã này dành cho khóa khác.' : 'This code is for a different course.';
            err.style.display = 'block';
            return;
          }
          entitled = true;
          await ensureKey();
          err.style.display = 'none';
          currentLabel = Cloud.user.email || '';
          renderTop(currentLabel);
          renderList();
          return;
        } catch (e) {
          const msg = String(e.message || e);
          err.textContent = msg.includes('already_redeemed')
            ? (LANG === 'vi' ? 'Mã này đã được dùng.' : 'This code has already been used.')
            : u.badCode;
          err.style.display = 'block';
          return;
        }
      }
      // Not logged in: prefer the account flow, but keep the legacy client-side unlock as fallback.
      const result = await tryUnlockCode(code);
      if (!result) {
        err.innerHTML = (LANG === 'vi' ? 'Đăng nhập để dùng mã và lưu tiến độ. ' : 'Log in to redeem your code and save progress. ')
            + `<a href="#" id="unlockLogin">${NAV_I18N[LANG].login}</a>`;
        err.style.display = 'block';
        document.getElementById('unlockLogin')?.addEventListener('click', (ev) => { ev.preventDefault(); openAuthModal(); });
        return;
      }
      ckBytes = result.ckBytes; // legacy offline unlock: keep in memory only (no browser-global cache)
      err.style.display = 'none';
      currentLabel = result.label;
      renderTop(currentLabel);
      renderList();
    }

    async function openLesson(i) {
      const u = UI[LANG];
      const lesson = course.lessons[i];
      openIndex = i;
      if (!ckBytes && entitled) await ensureKey();
      const html = await decryptLessonHtml(lesson, ckBytes);
      const viewer = document.getElementById('viewer');
      viewer.classList.add('show');
      if (html == null && lesson.html == null) {
        // entitled but key not available yet (e.g. course key not stored server-side)
        viewer.innerHTML = `<button type="button" class="close">${u.close}</button>`
          + `<p class="loadnote">${LANG === 'vi' ? 'Không tải được nội dung bài học. Hãy tải lại trang hoặc liên hệ giáo viên.' : 'Could not load this lesson. Try reloading or contact the teacher.'}</p>`;
        viewer.querySelector('.close').addEventListener('click', () => { viewer.classList.remove('show'); viewer.innerHTML = ''; openIndex = null; });
        viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      viewer.innerHTML = `<button type="button" class="close">${u.close}</button>${html || ''}`;
      viewer.querySelector('.close').addEventListener('click', () => {
        viewer.classList.remove('show');
        viewer.innerHTML = '';
        openIndex = null;
      });
      buildOutline(viewer, u);
      const ctx = { courseId: course.id, lessonNum: i + 1, lessonTitle: lesson.t[LANG] };
      wireExercises(viewer, ctx);
      viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    window.__dojoRelang = () => {
      renderTop(currentLabel);
      renderList();
      if (openIndex != null) openLesson(openIndex);
    };
    progressChangedHook = () => { renderTop(currentLabel); renderList(); };

    // When auth state changes: sync entitlement + cloud progress for this course.
    window.__dojoOnAuth = async () => {
      updateAccountUI();
      if (Cloud.user) {
        try {
          const owned = await fetchEntitlements();
          entitled = owned.includes(course.id);
          if (entitled) await ensureKey();
          if (!currentLabel) currentLabel = Cloud.user.email || '';
          const cloudData = await cloudLoadProgress(course.id);
          if (cloudData) Progress.merge(course.id, cloudData);
        } catch { /* offline */ }
      } else {
        entitled = false;
        ckBytes = null;        // logging out re-locks paid content on this browser
        currentLabel = null;
      }
      renderTop(currentLabel);
      renderList();
      if (openIndex != null) {
        const l = course.lessons[openIndex];
        const canView = l.kind === 'free' || l.html != null || isUnlocked();
        if (canView) openLesson(openIndex);
        else { const v = document.getElementById('viewer'); if (v) { v.classList.remove('show'); v.innerHTML = ''; } openIndex = null; }
      }
    };

    renderTop(null);
    renderList();
  }

  // Auto table-of-contents from the lesson's h4 headings, inserted under the title.
  function buildOutline(viewer, u) {
    const heads = [...viewer.querySelectorAll('h4')].filter((h) => /^\s*\d+\./.test(h.textContent));
    if (heads.length < 3) return;
    const items = heads.map((h, idx) => {
      const id = `sec-${idx}`;
      h.id = id;
      return `<li><a href="#${id}">${h.textContent}</a></li>`;
    }).join('');
    const h3 = viewer.querySelector('h3');
    const box = document.createElement('div');
    box.className = 'lessonOutline';
    box.innerHTML = `<div class="olabel">${u.outline}</div><ul>${items}</ul>`;
    h3.insertAdjacentElement('afterend', box);
    box.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      viewer.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  // ---------- exercises ----------
  function wireExercises(root, ctx) {
    makeExamplesRunnable(root, ctx);
    const exs = [...root.querySelectorAll('.ex')];
    Progress.setTotal(ctx.courseId, ctx.lessonNum, exs.length);
    exs.forEach((ex, idx) => {
      const kind = ex.dataset.kind;
      if (kind === 'quiz') wireQuiz(ex, ctx, idx);
      else if (kind === 'py') wirePyExercise(ex, ctx, idx);
      else if (kind === 'sql') wireSqlExercise(ex, ctx, idx);
      else if (kind === 'web') wireWebExercise(ex, ctx, idx, false);
      else if (kind === 'webjs') wireWebExercise(ex, ctx, idx, true);
    });
  }

  // Marks an exercise passed, ticks it, and refreshes progress UI.
  function recordPass(ex, ctx, exIndex) {
    ex.classList.add('done');
    if (Progress.markPassed(ctx.courseId, ctx.lessonNum, exIndex)) {
      if (progressChangedHook) progressChangedHook();
      if (Cloud.user) {
        setSyncStatus('syncing');
        cloudSaveProgress(ctx.courseId, Progress.load(ctx.courseId)).then((ok) => setSyncStatus(ok ? 'saved' : 'error'));
      }
    }
  }

  // ---------- code editor (CodeMirror, with textarea fallback) ----------
  function loadCss(href) {
    return new Promise((res) => {
      const l = document.createElement('link');
      l.rel = 'stylesheet'; l.href = href; l.onload = res; l.onerror = res;
      document.head.appendChild(l);
    });
  }
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  let cmPromise = null;
  function getCM() {
    if (!cmPromise) {
      const base = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/';
      cmPromise = (async () => {
        await loadCss(base + 'codemirror.min.css');
        await loadCss(base + 'theme/material-darker.min.css');
        await loadCss(base + 'addon/lint/lint.min.css');
        await loadScript(base + 'codemirror.min.js');
        await Promise.all([
          loadScript(base + 'mode/python/python.min.js'),
          loadScript(base + 'mode/sql/sql.min.js'),
          loadScript(base + 'mode/xml/xml.min.js'),
          loadScript(base + 'mode/javascript/javascript.min.js'),
          loadScript(base + 'mode/css/css.min.js'),
          loadScript(base + 'addon/edit/matchbrackets.min.js'),
          loadScript(base + 'addon/edit/closebrackets.min.js'),
          loadScript(base + 'addon/lint/lint.min.js'),
        ]);
        // htmlmixed depends on xml/javascript/css being present first.
        await loadScript(base + 'mode/htmlmixed/htmlmixed.min.js');
        return window.CodeMirror;
      })();
    }
    return cmPromise;
  }
  // Returns a stable {get,set} API; upgrades the textarea to CodeMirror once it loads.
  function attachEditor(textarea, mode, onChange) {
    const api = { get: () => textarea.value, set: (v) => { textarea.value = v; } };
    const isPy = mode === 'python';
    if (isPy) ensurePyWorker(); // warm up so the live syntax linter can run
    if (onChange) textarea.addEventListener('input', onChange);
    getCM().then((CM) => {
      const opts = {
        mode, theme: 'material-darker', lineNumbers: true, indentUnit: 4, tabSize: 4,
        matchBrackets: true, autoCloseBrackets: true, viewportMargin: Infinity,
      };
      if (isPy) {
        opts.gutters = ['CodeMirror-lint-markers'];
        opts.lint = { getAnnotations: pyLint, async: true };
      }
      const ed = CM.fromTextArea(textarea, opts);
      api.get = () => ed.getValue();
      api.set = (v) => ed.setValue(v);
      if (onChange) ed.on('change', () => onChange());
      if (isPy) pyEditors.push(ed);
    }).catch(() => { /* keep textarea fallback */ });
    return api;
  }

  // Turns <pre class="run"> demo blocks into editable, runnable (ungraded) examples.
  function makeExamplesRunnable(root, ctx) {
    const isSql = !!(ctx && ctx.courseId === 'sql');
    [...root.querySelectorAll('pre.run')].forEach((pre, exampleIdx) => {
      const u = UI[LANG];
      const codeText = pre.textContent.replace(/\n$/, '');
      const wrap = document.createElement('div');
      wrap.className = 'runex';
      wrap.innerHTML = `<textarea class="code"></textarea>
        <div class="exrun"><button type="button" class="btn ghost run">▶ ${u.tryExample}</button>${isSql ? '' : `<button type="button" class="btn ghost stop" hidden>${u.stop}</button>`}</div>
        <div class="out"></div>`;
      const saved = ctx && Progress.getExample(ctx.courseId, ctx.lessonNum, exampleIdx);
      wrap.querySelector('textarea').value = saved != null ? saved : codeText;
      pre.replaceWith(wrap);
      const gen = dojoAuthGen;
      const onChange = ctx ? debounce(() => { if (gen !== dojoAuthGen) return; Progress.saveExample(ctx.courseId, ctx.lessonNum, exampleIdx, code.get()); queueCloudSave(ctx.courseId); }, 500) : undefined;
      const code = attachEditor(wrap.querySelector('textarea'), isSql ? 'text/x-sql' : 'python', onChange);
      const out = wrap.querySelector('.out');

      if (isSql) {
        // SQL demo: run the query against the seed DB and show the result table.
        wrap.querySelector('.run').addEventListener('click', async (e) => {
          const btn = e.currentTarget;
          btn.disabled = true;
          out.classList.add('show');
          out.innerHTML = `<span>${u.loading}</span>`;
          try {
            const [SQL, buf] = await Promise.all([getSqlJs(), getSeedBuffer()]);
            const r = runQuery(SQL, buf, code.get());
            out.innerHTML = r.ok ? renderResultTable(r.res) : `<div class="verdict bad">${escapeHtml(r.error)}</div>`;
          } catch (ex) {
            out.innerHTML = `<div class="verdict bad">${escapeHtml(String(ex.message || ex))}</div>`;
          } finally { btn.disabled = false; }
        });
        return;
      }

      const stopBtn = wrap.querySelector('.stop');
      stopBtn.addEventListener('click', () => pyStop());
      wrap.querySelector('.run').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true; stopBtn.hidden = false;
        out.classList.add('show');
        out.innerHTML = `<span>${u.loading}</span>`;
        try {
          const r = await pyCall({ type: 'run', code: code.get() }, 10000);
          const term = r.stdout.trim()
            ? `<div class="term"><span class="lbl">${u.output}</span>${escapeHtml(r.stdout.replace(/\n$/, ''))}</div>`
            : '';
          const err = r.error ? lastPyLine(r.error) : '';
          out.innerHTML = term + (err ? `<div class="verdict bad">${escapeHtml(err)}</div>` : (r.stdout.trim() ? '' : `<div class="term"><span class="lbl">${u.output}</span>(—)</div>`));
        } catch (ex) {
          const m = /load/i.test(String(ex.message || ex)) ? u.loadFail : u.webTimeout;
          out.innerHTML = `<div class="verdict bad">${escapeHtml(m)}</div>`;
        } finally { btn.disabled = false; stopBtn.hidden = true; }
      });
    });
  }

  // ---------- Ask sensei ----------
  function senseiMessage(ctx, exLabel, codeText, question) {
    const vi = LANG === 'vi';
    return `[The Dojo] ${ctx.lessonTitle} — ${exLabel}\n`
      + (vi ? 'Câu hỏi: ' : 'Question: ') + (question || '(—)') + '\n\n'
      + (vi ? 'Code của em:\n' : 'My code:\n') + codeText;
  }
  function addSenseiButton(bar, ctx, exLabel, codeApi) {
    const u = UI[LANG];
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn ghost sensei'; btn.textContent = '🥋 ' + u.askSensei;
    bar.appendChild(btn);
    btn.addEventListener('click', () => {
      const existing = bar.parentElement.querySelector('.senseiBox');
      if (existing) { existing.remove(); return; }
      const panel = document.createElement('div');
      panel.className = 'senseiBox';
      panel.innerHTML = `<p class="sIntro">${u.senseiIntro}</p>
        <textarea class="sq" placeholder="${u.questionPh}"></textarea>
        <div class="exrun">
          <button type="button" class="btn sZalo">${u.sendZalo}</button>
        </div><div class="sNote"></div>`;
      bar.insertAdjacentElement('afterend', panel);
      const getQ = () => panel.querySelector('.sq').value.trim();
      const note = panel.querySelector('.sNote');
      panel.querySelector('.sZalo').addEventListener('click', async () => {
        const msg = senseiMessage(ctx, exLabel, codeApi.get(), getQ());
        try { await navigator.clipboard.writeText(msg); } catch { /* clipboard may be blocked */ }
        note.textContent = u.copied;
        window.open('https://zalo.me/' + SENSEI.zalo, '_blank');
      });
    });
  }
  function exLabelOf(ex, exIndex) {
    return ex.querySelector('.exq b')?.textContent?.replace(/[.:]\s*$/, '') || `#${exIndex + 1}`;
  }

  function wireQuiz(ex, ctx, exIndex) {
    const u = UI[LANG];
    const correct = Number(ex.dataset.a);
    const list = ex.querySelector('ol.opts');
    if (!list || list.dataset.wired) return;
    list.dataset.wired = '1';
    let answered = false;
    [...list.children].forEach((li, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = li.innerHTML;
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        btn.classList.add(idx === correct ? 'right' : 'wrong');
        if (idx !== correct) {
          const correctBtn = list.children[correct].querySelector('button');
          correctBtn?.classList.add('right');
        }
        let status = ex.querySelector(':scope > .st');
        if (!status) {
          status = document.createElement('span');
          status.className = 'st';
          ex.prepend(status);
        }
        status.textContent = idx === correct ? u.pass : u.fail;
        status.classList.toggle('pass', idx === correct);
        if (idx === correct) recordPass(ex, ctx, exIndex);
      });
      li.innerHTML = '';
      li.appendChild(btn);
    });
  }

  // ----- Python (Pyodide) -----
  // Grades one assert at a time and, on failure, inspects the assert's AST to report the exact
  // operands (actual vs expected), type mismatches, or undefined variables — bilingual.
  const PY_HARNESS = `
import ast

def _dojo_describe(node, ns, src, lang):
    test = node.test
    def _ev(n):
        return eval(compile(ast.Expression(body=n), '<e>', 'eval'), ns)
    def _first_false(e):
        if isinstance(e, ast.BoolOp) and isinstance(e.op, ast.And):
            for v in e.values:
                try:
                    ok = _ev(v)
                except Exception:
                    return v
                if not ok:
                    return _first_false(v)
        return e
    fe = _first_false(test)
    if isinstance(fe, ast.Compare) and len(fe.ops) == 1 and isinstance(fe.ops[0], (ast.Eq, ast.Is)):
        try:
            left = _ev(fe.left); right = _ev(fe.comparators[0])
            lsrc = ast.get_source_segment(src, fe.left)
            if lang == 'en':
                return f"{lsrc} is {left!r}, but it should be {right!r}"
            return f"{lsrc} \u0111ang l\u00e0 {left!r}, nh\u01b0ng c\u1ea7n b\u1eb1ng {right!r}"
        except Exception:
            return None
    if isinstance(fe, ast.Call) and isinstance(fe.func, ast.Name) and fe.func.id == 'isinstance':
        try:
            val = _ev(fe.args[0]); xsrc = ast.get_source_segment(src, fe.args[0])
            tname = ast.get_source_segment(src, fe.args[1])
            if lang == 'en':
                return f"{xsrc} has type {type(val).__name__}, but it should be {tname}"
            return f"{xsrc} \u0111ang c\u00f3 ki\u1ec3u {type(val).__name__}, nh\u01b0ng c\u1ea7n l\u00e0 {tname}"
        except Exception:
            return None
    return None

def _dojo_generic(node, src, lang):
    seg = ast.get_source_segment(src, node.test) if isinstance(node, ast.Assert) else ast.get_source_segment(src, node)
    if lang == 'en':
        return f"this check failed: {seg}"
    return f"ki\u1ec3m tra n\u00e0y ch\u01b0a \u0111\u1ea1t: {seg}"

def _dojo_run_tests(src, ns, lang):
    try:
        tree = ast.parse(src)
    except SyntaxError as e:
        return f"test syntax error: {e}"
    for node in tree.body:
        try:
            exec(compile(ast.Module(body=[node], type_ignores=[]), '<test>', 'exec'), ns)
        except AssertionError as e:
            author = str(e).strip()
            detail = _dojo_describe(node, ns, src, lang) if isinstance(node, ast.Assert) else None
            if detail:
                return detail
            if author:
                return author
            return _dojo_generic(node, src, lang)
        except NameError as e:
            msg = str(e)
            name = msg.split("'")[1] if "'" in msg else msg
            if lang == 'en':
                return f"variable '{name}' is not defined yet"
            return f"bi\u1ebfn '{name}' ch\u01b0a \u0111\u01b0\u1ee3c t\u1ea1o"
        except Exception as e:
            return f"{type(e).__name__}: {e}"
    return ''

def _dojo_lint(src):
    try:
        compile(src, '<lint>', 'exec')
        return None
    except SyntaxError as e:
        return (e.lineno or 1, e.offset or 1, e.msg)
    except Exception:
        return None
`;

  // ----- Pyodide runs in a Web Worker so a runaway loop (e.g. while True) can be terminated -----
  const PY_WORKER_SRC = `
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
    let pyodide;
    (async () => {
      pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
      pyodide.runPython(self.__HARNESS__);
      postMessage({ type: 'ready' });
    })();
    self.onmessage = async (e) => {
      const m = e.data;
      try {
        if (m.type === 'lint') {
          const fn = pyodide.globals.get('_dojo_lint');
          let lint = null;
          try { const r = fn(m.code); if (r) { lint = r.toJs(); if (r.destroy) r.destroy(); } } finally { fn.destroy(); }
          postMessage({ id: m.id, lint });
          return;
        }
        if (m.type === 'run') {
          let stdout = '', error = '';
          const ns = pyodide.globals.get('dict')();
          pyodide.setStdout({ batched: (s) => { stdout += s + '\\n'; } });
          try { pyodide.runPython(m.code, { globals: ns }); } catch (ex) { error = String(ex.message || ex); }
          ns.destroy();
          postMessage({ id: m.id, stdout, error });
          return;
        }
        if (m.type === 'grade') {
          let stdout = '', status = 'pass', message = '';
          const ns = pyodide.globals.get('dict')();
          pyodide.setStdout({ batched: (s) => { stdout += s + '\\n'; } });
          try { pyodide.runPython(m.code, { globals: ns }); } catch (ex) { status = 'error'; message = String(ex.message || ex); }
          if (status === 'pass') {
            ns.set('_OUT_', stdout);
            const runner = pyodide.globals.get('_dojo_run_tests');
            try { const fail = runner(m.tests, ns, m.lang); if (fail) { status = 'fail'; message = String(fail); } }
            catch (ex) { status = 'error'; message = String(ex.message || ex); }
            finally { runner.destroy(); }
          }
          ns.destroy();
          postMessage({ id: m.id, status, stdout, message });
          return;
        }
      } catch (ex) {
        postMessage({ id: m.id, status: 'error', error: String(ex.message || ex), message: String(ex.message || ex) });
      }
    };
  `;

  const pyEditors = [];        // CodeMirror python editors to re-lint once the worker is ready
  let pyWorker = null, pyWorkerReady = null;
  const pyPending = new Map();
  let pyNextId = 1;

  function makePyWorker() {
    const src = `self.__HARNESS__ = ${JSON.stringify(PY_HARNESS)};\n` + PY_WORKER_SRC;
    const url = URL.createObjectURL(new Blob([src], { type: 'application/javascript' }));
    const w = new Worker(url);
    let settled = false, rejectReady;
    pyWorkerReady = new Promise((res, rej) => {
      rejectReady = rej;
      w.__resolveReady = () => { if (!settled) { settled = true; res(); } };
    });
    w.__failReady = (msg) => { if (!settled) { settled = true; rejectReady(new Error(msg || 'worker-load-failed')); } };
    // If Pyodide never finishes loading (e.g. CDN blocked), fail instead of hanging forever.
    const startupTimer = setTimeout(() => { if (!settled) killPyWorker('load-timeout'); }, 60000);
    w.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'ready') {
        clearTimeout(startupTimer);
        w.__resolveReady();
        pyEditors.forEach((ed) => { try { ed.performLint(); } catch { /* editor gone */ } });
        return;
      }
      const p = pyPending.get(m.id);
      if (p) { pyPending.delete(m.id); if (p.timer) clearTimeout(p.timer); p.resolve(m); }
    };
    w.onerror = () => { clearTimeout(startupTimer); killPyWorker('worker-error'); };
    pyWorker = w;
  }

  function ensurePyWorker() { if (!pyWorker) makePyWorker(); return pyWorkerReady; }

  // Terminate the worker (kills any runaway code) and fail every in-flight job; it recreates lazily.
  function killPyWorker(reason) {
    if (pyWorker) {
      if (pyWorker.__failReady) pyWorker.__failReady(reason); // unblock anyone awaiting startup
      try { pyWorker.terminate(); } catch { /* ignore */ }
    }
    pyWorker = null; pyWorkerReady = null;
    pyPending.forEach((p) => { if (p.timer) clearTimeout(p.timer); p.reject(new Error(reason || 'stopped')); });
    pyPending.clear();
  }
  function pyStop() { killPyWorker('stopped'); }

  // Send a job to the Python worker; timeoutMs>0 kills a job that runs too long.
  async function pyCall(msg, timeoutMs) {
    await ensurePyWorker();
    const id = pyNextId++;
    const worker = pyWorker;
    return new Promise((resolve, reject) => {
      const timer = timeoutMs ? setTimeout(() => killPyWorker('timeout'), timeoutMs) : null;
      pyPending.set(id, { resolve, reject, timer });
      worker.postMessage({ ...msg, id });
    });
  }

  // Live syntax checker for CodeMirror (async, via the worker's compile()).
  function pyLint(text, updateLinting) {
    ensurePyWorker();
    pyCall({ type: 'lint', code: text }).then((m) => {
      const res = m.lint;
      if (!res) { updateLinting([]); return; }
      const CM = window.CodeMirror;
      const line = Math.max(0, (res[0] || 1) - 1);
      const ch = Math.max(0, (res[1] || 1) - 1);
      updateLinting([{
        message: res[2] || 'Syntax error',
        severity: 'error',
        from: CM.Pos(line, ch),
        to: CM.Pos(line, ch + 1),
      }]);
    }).catch(() => updateLinting([]));
  }

  function wirePyExercise(ex, ctx, exIndex) {
    if (ex.dataset.wired) return;
    ex.dataset.wired = '1';
    const u = UI[LANG];
    const starter = ex.querySelector('template.st')?.content.textContent ?? '';
    const tests = ex.querySelector('template.ts')?.content.textContent ?? '';
    // data-feedback="hint" hides the expected value on failure and shows only a nudge.
    const hintMode = ex.dataset.feedback === 'hint';
    const hintText = ex.querySelector('template.hint')?.content.textContent?.trim() ?? '';

    const wrap = document.createElement('div');
    wrap.innerHTML = `<textarea class="code" spellcheck="false">${escapeHtml(starter.trim())}</textarea>
      <div class="exrun">
        <button type="button" class="btn run">${u.run}</button>
        <button type="button" class="btn ghost reset">${u.reset}</button>
        <button type="button" class="btn ghost stop" hidden>${u.stop}</button>
      </div>
      <div class="out"></div>`;
    ex.appendChild(wrap);

    const textarea = wrap.querySelector('textarea');
    const savedAns = Progress.getAnswer(ctx.courseId, ctx.lessonNum, exIndex);
    if (savedAns != null) textarea.value = savedAns;
    const exGen = dojoAuthGen;
    const onChange = debounce(() => { if (exGen !== dojoAuthGen) return; Progress.saveAnswer(ctx.courseId, ctx.lessonNum, exIndex, code.get()); queueCloudSave(ctx.courseId); }, 500);
    const code = attachEditor(textarea, 'python', onChange);
    const out = wrap.querySelector('.out');
    const runBtn = wrap.querySelector('.run');
    const resetBtn = wrap.querySelector('.reset');
    addSenseiButton(wrap.querySelector('.exrun'), ctx, exLabelOf(ex, exIndex), code);

    resetBtn.addEventListener('click', () => {
      code.set(starter.trim());
      out.classList.remove('show');
      out.innerHTML = '';
    });

    const stopBtn = wrap.querySelector('.stop');
    stopBtn.addEventListener('click', () => pyStop());
    runBtn.addEventListener('click', async () => {
      runBtn.disabled = true; stopBtn.hidden = false;
      out.classList.add('show');
      out.innerHTML = `<span>${u.loading}</span>`;
      try {
        const r = await pyCall({ type: 'grade', code: code.get(), tests, lang: LANG }, 10000);
        let status = r.status, message = r.message || '';
        const stdout = r.stdout || '';
        if (status === 'error') message = lastPyLine(message);
        else if (status === 'fail' && hintMode) message = hintText || u.tryAgain; // hide expected value in hint mode
        const okClass = status === 'pass' ? 'ok' : 'bad';
        const label = status === 'pass' ? u.pass : u.fail;
        const termHtml = stdout.trim()
          ? `<div class="term"><span class="lbl">${u.output}</span>${escapeHtml(stdout.replace(/\n$/, ''))}</div>`
          : '';
        out.innerHTML = termHtml +
          `<div class="verdict ${okClass}">${label}${message ? ': ' + escapeHtml(message) : ''}</div>`;
        if (status === 'pass') recordPass(ex, ctx, exIndex);
      } catch (ex2) {
        const m = /load/i.test(String(ex2.message || ex2)) ? u.loadFail : u.webTimeout;
        out.innerHTML = `<div class="verdict bad">${escapeHtml(m)}</div>`;
      } finally {
        runBtn.disabled = false; stopBtn.hidden = true;
      }
    });
  }

  function lastPyLine(msg) {
    if (!msg) return '';
    const lines = msg.split('\n').map((s) => s.trim()).filter(Boolean);
    return lines[lines.length - 1] || msg;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  // ----- SQL (sql.js) -----
  let sqlJsPromise = null;
  function getSqlJs() {
    if (!sqlJsPromise) {
      sqlJsPromise = window.initSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}` });
    }
    return sqlJsPromise;
  }

  const SEED_SQL = `
    CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price INTEGER, stock INTEGER);
    INSERT INTO products VALUES
      (1,'Bút bi Thiên Long','Văn phòng phẩm',5000,120),
      (2,'Sổ tay A5','Văn phòng phẩm',18000,60),
      (3,'Cà phê đen đá','Đồ uống',25000,200),
      (4,'Trà đào cam sả','Đồ uống',35000,150),
      (5,'Bánh mì thịt','Đồ ăn',20000,80),
      (6,'Cơm gà xối mỡ','Đồ ăn',45000,40),
      (7,'Tai nghe Bluetooth','Điện tử',350000,15),
      (8,'Sạc dự phòng 10000mAh','Điện tử',280000,25),
      (9,'Nước suối 500ml','Đồ uống',8000,300),
      (10,'Kẹp giấy hộp 100c','Văn phòng phẩm',12000,90);

    CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT, joined_at TEXT);
    INSERT INTO customers VALUES
      (1,'Nguyễn Văn A','Hà Nội','2024-01-10'),
      (2,'Trần Thị B','TP. Hồ Chí Minh','2024-03-22'),
      (3,'Lê Văn C','Đà Nẵng','2024-06-05'),
      (4,'Phạm Thị D','Hà Nội','2025-02-14');

    CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT,
      FOREIGN KEY(customer_id) REFERENCES customers(id));
    INSERT INTO orders VALUES
      (1,1,'2025-05-01'), (2,2,'2025-05-03'), (3,1,'2025-05-10'), (4,3,'2025-06-01');

    CREATE TABLE order_items (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, qty INTEGER,
      FOREIGN KEY(order_id) REFERENCES orders(id), FOREIGN KEY(product_id) REFERENCES products(id));
    INSERT INTO order_items VALUES
      (1,1,3,2), (2,1,5,1), (3,2,4,1), (4,3,7,1), (5,4,1,5), (6,4,9,3);
  `;

  let seedBufferPromise = null;
  async function getSeedBuffer() {
    if (!seedBufferPromise) {
      seedBufferPromise = getSqlJs().then((SQL) => {
        const db = new SQL.Database();
        db.run(SEED_SQL);
        const buf = db.export();
        db.close();
        return buf;
      });
    }
    return seedBufferPromise;
  }

  function runQuery(SQL, buf, sql) {
    const db = new SQL.Database(buf);
    try {
      const res = db.exec(sql);
      return { ok: true, res };
    } catch (e) {
      return { ok: false, error: e.message };
    } finally {
      db.close();
    }
  }

  function resultsEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function renderResultTable(res) {
    if (!res || !res.length) return '<div>(0 dòng / 0 rows)</div>';
    const { columns, values } = res[0];
    const head = columns.map((c) => `<th>${escapeHtml(c)}</th>`).join('');
    const rows = values.map((row) => `<tr>${row.map((v) => `<td>${v === null ? 'NULL' : escapeHtml(String(v))}</td>`).join('')}</tr>`).join('');
    return `<table class="res"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function wireSqlExercise(ex, ctx, exIndex) {
    if (ex.dataset.wired) return;
    ex.dataset.wired = '1';
    const u = UI[LANG];
    const starter = ex.querySelector('template.st')?.content.textContent ?? '';
    const ref = ex.querySelector('template.ref')?.content.textContent ?? '';

    const wrap = document.createElement('div');
    wrap.innerHTML = `<textarea class="code" spellcheck="false">${escapeHtml(starter.trim())}</textarea>
      <div class="exrun">
        <button type="button" class="btn run">${u.run}</button>
        <button type="button" class="btn ghost reset">${u.reset}</button>
        ${ref && ctx.lessonNum === 1 ? `<button type="button" class="btn ghost showref">${u.showAnswer}</button>` : ''}
      </div>
      <div class="out"></div>`;
    ex.appendChild(wrap);

    const textarea = wrap.querySelector('textarea');
    const savedAns = Progress.getAnswer(ctx.courseId, ctx.lessonNum, exIndex);
    if (savedAns != null) textarea.value = savedAns;
    const exGen = dojoAuthGen;
    const onChange = debounce(() => { if (exGen !== dojoAuthGen) return; Progress.saveAnswer(ctx.courseId, ctx.lessonNum, exIndex, code.get()); queueCloudSave(ctx.courseId); }, 500);
    const code = attachEditor(textarea, 'text/x-sql', onChange);
    const out = wrap.querySelector('.out');
    addSenseiButton(wrap.querySelector('.exrun'), ctx, exLabelOf(ex, exIndex), code);

    wrap.querySelector('.reset').addEventListener('click', () => {
      code.set(starter.trim());
      out.classList.remove('show');
      out.innerHTML = '';
    });

    wrap.querySelector('.showref')?.addEventListener('click', (e) => {
      const box = wrap.querySelector('.refbox');
      if (box) { box.remove(); e.target.textContent = u.showAnswer; return; }
      e.target.textContent = u.hideAnswer;
      wrap.insertAdjacentHTML('beforeend', `<pre class="refbox"><code>${escapeHtml(ref.trim())}</code></pre>`);
    });

    wrap.querySelector('.run').addEventListener('click', async () => {
      out.classList.add('show');
      out.innerHTML = `<span>${u.loading}</span>`;
      const [SQL, buf] = await Promise.all([getSqlJs(), getSeedBuffer()]);
      const studentRun = runQuery(SQL, buf, code.get());
      if (!studentRun.ok) {
        out.innerHTML = `<div class="bad">${escapeHtml(studentRun.error)}</div>`;
        return;
      }
      let html = renderResultTable(studentRun.res);
      if (ref) {
        const refRun = runQuery(SQL, buf, ref);
        const pass = refRun.ok && resultsEqual(studentRun.res, refRun.res);
        html += `<div class="${pass ? 'ok' : 'bad'}">${pass ? u.pass : u.fail}</div>`;
        out.innerHTML = html;
        if (pass) recordPass(ex, ctx, exIndex);
        return;
      }
      out.innerHTML = html;
    });
  }

  // ----- Web (live HTML/CSS/JS preview + JS auto-grader) -----
  // The student's code runs only inside a sandboxed iframe (sandbox="allow-scripts", opaque origin):
  // no same-origin access to this page, no network, no top-navigation. We never eval student code here.
  // Capture script: overrides console.log so tests can assert on printed output, and records the first
  // runtime error. Injected before the student's markup so logging is captured from the start.
  const WEB_CAPTURE = `<script>
    window.__dojoOut = '';
    (function () {
      var log = console.log;
      console.log = function () {
        window.__dojoOut += Array.prototype.map.call(arguments, String).join(' ') + '\\n';
        try { log.apply(console, arguments); } catch (e) {}
      };
      window.addEventListener('error', function (e) { if (!window.__dojoErr) window.__dojoErr = e.message; });
    })();
  <\/script>`;

  // Wraps a body fragment (+ optional <head> extras like <style>) in a full document and appends the
  // grader. After load, the test block (from <template class="ts">) runs with access to document,
  // window, assert(cond,msg) and _OUT_ (captured console output). The verdict is posted back to the
  // parent, keyed by a one-time token.
  function buildGradeDoc(bodyFrag, testCode, token, headExtra) {
    return `<!doctype html><html><head><meta charset="utf-8">${headExtra || ''}</head><body>
${WEB_CAPTURE}
${bodyFrag}
<script>
window.addEventListener('load', function () {
  setTimeout(function () {
    var pass = true, message = '';
    function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
    var _OUT_ = window.__dojoOut || '';
    try {
${testCode}
    } catch (e) { pass = false; message = (e && e.message) || String(e); }
    if (!pass && !message && window.__dojoErr) message = window.__dojoErr;
    parent.postMessage({ __dojoToken: ${JSON.stringify(token)}, pass: pass, message: message, out: window.__dojoOut || '' }, '*');
  }, 30);
});
<\/script>
</body></html>`;
  }

  // Assembles a runnable document from separate HTML/CSS/JS parts (multi-file exercises).
  function partsToDoc(parts) {
    const style = parts.css != null ? `<style>\n${parts.css}\n</style>` : '';
    const script = parts.js != null ? `<script>\n${parts.js}\n<\/script>` : '';
    return `<!doctype html><html><head><meta charset="utf-8">${style}</head><body>\n${parts.html || ''}\n${script}\n</body></html>`;
  }

  // Renders the graded document in the iframe and resolves with the verdict from its postMessage.
  // event.origin is "null" (opaque sandbox) so we authenticate on the one-time token, not the origin.
  function runGradedWeb(iframe, bodyFrag, testCode, headExtra) {
    return new Promise((resolve) => {
      const token = 'dojo-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      let done = false;
      function onMsg(e) {
        const d = e.data;
        if (!d || d.__dojoToken !== token) return;
        done = true;
        window.removeEventListener('message', onMsg);
        resolve({ pass: !!d.pass, message: d.message || '', out: d.out || '' });
      }
      window.addEventListener('message', onMsg);
      iframe.srcdoc = buildGradeDoc(bodyFrag, testCode, token, headExtra);
      setTimeout(() => {
        if (done) return;
        window.removeEventListener('message', onMsg);
        resolve({ pass: false, message: UI[LANG].webTimeout, out: '' });
      }, 4000);
    });
  }

  // graded=false → live preview only ("web"); graded=true → JS auto-grader ("webjs").
  // Single-file: <template class="st"> holds a full HTML document (web) or a body fragment (webjs).
  // Multi-file: any of <template class="html"|"css"|"js"> — each becomes its own editor, combined on Run.
  function wireWebExercise(ex, ctx, exIndex, graded) {
    if (ex.dataset.wired) return;
    ex.dataset.wired = '1';
    const u = UI[LANG];
    const tests = ex.querySelector('template.ts')?.content.textContent ?? '';
    const hintMode = ex.dataset.feedback === 'hint';
    const hintText = ex.querySelector('template.hint')?.content.textContent?.trim() ?? '';

    // Which files does this exercise use?
    const fileDefs = [
      { key: 'html', label: 'HTML', mode: 'htmlmixed' },
      { key: 'css', label: 'CSS', mode: 'css' },
      { key: 'js', label: 'JavaScript', mode: 'javascript' },
    ].map((f) => ({ ...f, tpl: ex.querySelector(`template.${f.key}`) })).filter((f) => f.tpl);
    const multi = fileDefs.length > 0;

    const wrap = document.createElement('div');
    if (multi) {
      wrap.innerHTML = `<div class="webfiles">${fileDefs.map((f) =>
        `<div class="webfile"><span class="lbl">${f.label}</span><textarea class="code" spellcheck="false">${escapeHtml((f.tpl.content.textContent ?? '').trim())}</textarea></div>`).join('')}</div>
        <div class="exrun">
          <button type="button" class="btn run">${u.run}</button>
          <button type="button" class="btn ghost reset">${u.reset}</button>
        </div>
        <div class="webprev"><span class="lbl">${u.preview}</span><iframe class="prev" title="${u.preview}" sandbox="allow-scripts"></iframe></div>
        <div class="out"></div>`;
    } else {
      const initial = (ex.querySelector('template.st')?.content.textContent ?? '').trim();
      wrap.innerHTML = `<textarea class="code" spellcheck="false">${escapeHtml(initial)}</textarea>
        <div class="exrun">
          <button type="button" class="btn run">${u.run}</button>
          <button type="button" class="btn ghost reset">${u.reset}</button>
        </div>
        <div class="webprev"><span class="lbl">${u.preview}</span><iframe class="prev" title="${u.preview}" sandbox="allow-scripts"></iframe></div>
        <div class="out"></div>`;
    }
    ex.appendChild(wrap);

    const iframe = wrap.querySelector('iframe.prev');
    const out = wrap.querySelector('.out');
    const textareas = [...wrap.querySelectorAll('textarea.code')];

    // restore any autosaved code the student typed before
    const savedRaw = Progress.getAnswer(ctx.courseId, ctx.lessonNum, exIndex);
    let savedParts = null, savedSingle = null;
    if (multi) { try { savedParts = savedRaw != null ? JSON.parse(savedRaw) : null; } catch { savedParts = null; } }
    else { savedSingle = savedRaw != null ? savedRaw : null; }
    let saveAll;
    const wgen = dojoAuthGen;
    const onChange = debounce(() => { if (wgen !== dojoAuthGen) return; if (saveAll) saveAll(); }, 500);

    let editors; // [{ key, get/set, initial }] for multi, or single { get/set, initial }
    if (multi) {
      editors = fileDefs.map((f, i) => {
        const initial = textareas[i].value; // template default (used by Reset)
        if (savedParts && savedParts[f.key] != null) textareas[i].value = savedParts[f.key];
        return { key: f.key, api: attachEditor(textareas[i], f.mode, onChange), initial };
      });
      saveAll = () => {
        const parts = Object.fromEntries(editors.map((e) => [e.key, e.api.get()]));
        Progress.saveAnswer(ctx.courseId, ctx.lessonNum, exIndex, JSON.stringify(parts));
        queueCloudSave(ctx.courseId);
      };
    } else {
      const initial = textareas[0].value;
      if (savedSingle != null) textareas[0].value = savedSingle;
      editors = { api: attachEditor(textareas[0], 'htmlmixed', onChange), initial };
      saveAll = () => {
        Progress.saveAnswer(ctx.courseId, ctx.lessonNum, exIndex, editors.api.get());
        queueCloudSave(ctx.courseId);
      };
    }

    // Combined source (for Ask sensei and single-file preview).
    const combinedSource = () => multi
      ? partsToDoc(Object.fromEntries(editors.map((e) => [e.key, e.api.get()])))
      : editors.api.get();
    addSenseiButton(wrap.querySelector('.exrun'), ctx, exLabelOf(ex, exIndex), { get: combinedSource });

    const renderPreview = () => {
      iframe.srcdoc = multi
        ? partsToDoc(Object.fromEntries(editors.map((e) => [e.key, e.api.get()])))
        : editors.api.get();
    };

    wrap.querySelector('.reset').addEventListener('click', () => {
      if (multi) editors.forEach((e) => e.api.set(e.initial));
      else editors.api.set(editors.initial);
      out.classList.remove('show');
      out.innerHTML = '';
      renderPreview();
    });

    wrap.querySelector('.run').addEventListener('click', async () => {
      if (!graded) { renderPreview(); recordPass(ex, ctx, exIndex); return; } // "run & observe" completes on Run
      out.classList.add('show');
      out.innerHTML = `<span>${u.loading}</span>`;
      let bodyFrag, headExtra = '';
      if (multi) {
        const parts = Object.fromEntries(editors.map((e) => [e.key, e.api.get()]));
        if (parts.css != null) headExtra = `<style>\n${parts.css}\n</style>`;
        bodyFrag = `${parts.html || ''}\n${parts.js != null ? `<script>\n${parts.js}\n<\/script>` : ''}`;
      } else {
        bodyFrag = editors.api.get();
      }
      const r = await runGradedWeb(iframe, bodyFrag, tests, headExtra);
      const okClass = r.pass ? 'ok' : 'bad';
      const label = r.pass ? u.pass : u.fail;
      const msg = r.pass ? '' : (hintMode ? (hintText || u.tryAgain) : r.message);
      const termHtml = r.out && r.out.trim()
        ? `<div class="term"><span class="lbl">${u.output}</span>${escapeHtml(r.out.replace(/\n$/, ''))}</div>`
        : '';
      out.innerHTML = termHtml +
        `<div class="verdict ${okClass}">${label}${msg ? ': ' + escapeHtml(msg) : ''}</div>`;
      if (r.pass) recordPass(ex, ctx, exIndex);
    });

    renderPreview(); // show the starter page immediately
  }

  // ---------- boot ----------
  document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    renderFooter();
    applyI18n();
    if (typeof COURSE !== 'undefined') initCoursePage();
    initAuth();
  });
})();
