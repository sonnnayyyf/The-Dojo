/* The Dojo — site engine: i18n/nav, course unlock (AES-GCM/PBKDF2), lesson viewer,
   and graded exercises (quiz / Python via Pyodide / SQL via sql.js). */
(function () {
  'use strict';

  // ---------- editable contact config ----------
  const SENSEI = {
    zalo: '0986061705',            // your Zalo phone number
    email: 'EDIT-ME@example.com',  // fallback email (edit me)
  };

  // ---------- Supabase (accounts + cloud progress) ----------
  const SUPABASE = {
    url: 'https://hlxadajedsymnhzgjyzv.supabase.co',
    anonKey: 'sb_publishable_o9tw-1K5G2pWsskY6HdW6g_mk-2ufNb',
  };

  // ---------- i18n & nav/footer ----------
  window.LANG = localStorage.getItem('dojoLang') || 'vi';

  const NAV_I18N = {
    vi: { home: 'Trang chủ', about: 'Giới thiệu', pricing: 'Học phí', python: 'Python', qa: 'QA/Testing', sql: 'SQL', langBtn: 'EN',
      login: 'Đăng nhập', logout: 'Đăng xuất', account: 'Tài khoản' },
    en: { home: 'Home', about: 'About', pricing: 'Pricing', python: 'Python', qa: 'QA/Testing', sql: 'SQL', langBtn: 'VI',
      login: 'Log in', logout: 'Log out', account: 'Account' },
  };
  const FOOTER_I18N = {
    vi: 'The Dojo — học thật, làm thật, ngay trong trình duyệt.',
    en: 'The Dojo — real practice, right in your browser.',
  };

  const PAGE_FILE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function renderNav() {
    const t = NAV_I18N[LANG];
    const links = [
      ['index.html', t.home], ['about.html', t.about], ['pricing.html', t.pricing],
      ['python.html', t.python], ['qa.html', t.qa], ['sql.html', t.sql],
    ];
    const linksHtml = links.map(([href, label]) => {
      const here = PAGE_FILE === href ? ' here' : '';
      return `<a class="${here.trim()}" href="${href}">${label}</a>`;
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
  }

  function renderFooter() {
    document.body.insertAdjacentHTML('beforeend',
      `<footer><div class="wrap">${FOOTER_I18N[LANG]}</div></footer>`);
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
  const Cloud = { client: null, user: null, ready: false };

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

  async function initAuth() {
    const sb = await getSupabase();
    if (!sb) return;
    const { data } = await sb.auth.getSession();
    Cloud.user = data?.session?.user || null;
    Cloud.ready = true;
    updateAccountUI();
    sb.auth.onAuthStateChange((_evt, session) => {
      Cloud.user = session?.user || null;
      updateAccountUI();
      if (typeof window.__dojoOnAuth === 'function') window.__dojoOnAuth();
    });
    if (typeof window.__dojoOnAuth === 'function') window.__dojoOnAuth();
  }

  function updateAccountUI() {
    const btn = document.getElementById('acctBtn');
    if (!btn) return;
    const t = NAV_I18N[LANG];
    if (Cloud.user) {
      const email = Cloud.user.email || t.account;
      btn.textContent = email.length > 18 ? email.slice(0, 16) + '…' : email;
      btn.classList.add('signedin');
    } else {
      btn.textContent = t.login;
      btn.classList.remove('signedin');
    }
  }

  function onAccountClick() {
    if (Cloud.user) {
      const t = NAV_I18N[LANG];
      if (confirm(`${Cloud.user.email}\n\n${t.logout}?`)) {
        getSupabase().then((sb) => sb && sb.auth.signOut());
      }
    } else {
      openAuthModal();
    }
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
      <button class="btn" id="authSubmit">${vi ? 'Đăng nhập' : 'Log in'}</button>
      <div class="authErr" id="authErr"></div>
      <div class="authSwitch">
        <span id="authToggle">${vi ? 'Chưa có tài khoản? Đăng ký' : "No account? Sign up"}</span>
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
    wrap.querySelector('#authToggle').addEventListener('click', () => {
      mode = mode === 'login' ? 'signup' : 'login';
      const isLogin = mode === 'login';
      wrap.querySelector('#authTitle').textContent = isLogin ? (vi ? 'Đăng nhập' : 'Log in') : (vi ? 'Đăng ký' : 'Sign up');
      wrap.querySelector('#authSubmit').textContent = isLogin ? (vi ? 'Đăng nhập' : 'Log in') : (vi ? 'Đăng ký' : 'Sign up');
      wrap.querySelector('#authToggle').textContent = isLogin
        ? (vi ? 'Chưa có tài khoản? Đăng ký' : 'No account? Sign up')
        : (vi ? 'Đã có tài khoản? Đăng nhập' : 'Have an account? Log in');
      setErr('');
    });
    wrap.querySelector('#authSubmit').addEventListener('click', async () => {
      setErr('');
      const email = wrap.querySelector('#authEmail').value.trim();
      const pw = wrap.querySelector('#authPw').value;
      if (!email || !pw) { setErr(vi ? 'Nhập email và mật khẩu.' : 'Enter email and password.'); return; }
      const sb = await getSupabase();
      if (!sb) { setErr('Cannot reach server.'); return; }
      const fn = mode === 'login'
        ? sb.auth.signInWithPassword({ email, password: pw })
        : sb.auth.signUp({ email, password: pw });
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
    const { data } = await sb.from('entitlements').select('course');
    return (data || []).map((r) => r.course);
  }

  async function cloudLoadProgress(course) {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) return null;
    const { data } = await sb.from('progress').select('data').eq('course', course).maybeSingle();
    return data?.data || null;
  }

  async function cloudSaveProgress(course, dataObj) {
    const sb = await getSupabase();
    if (!sb || !Cloud.user) return;
    await sb.from('progress').upsert({ user_id: Cloud.user.id, course, data: dataObj, updated_at: new Date().toISOString() });
  }

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
      askSensei: 'Hỏi sensei', tryExample: 'Chạy thử', outline: 'Nội dung bài học', done: 'Xong',
      senseiIntro: 'Viết câu hỏi của bạn — chúng tôi sẽ tự động kèm bài học và code của bạn.',
      questionPh: 'Bạn đang kẹt ở đâu?', sendZalo: 'Gửi qua Zalo', sendEmail: 'Gửi email',
      copied: 'Đã copy câu hỏi + code. Sang Zalo, dán (Ctrl+V) vào ô chat và gửi nhé!', progressLabel: 'Tiến độ' },
    en: { locked: 'Locked', open: 'Unlocked', free: 'Free', unlockPh: 'Enter unlock code', unlockBtn: 'Unlock',
      badCode: 'Code is invalid or not for this course.', close: 'Close', unlockedAs: 'unlocked as: ',
      run: 'Run', reset: 'Reset', pass: 'Pass', fail: 'Fail', loading: 'Loading the code runner…',
      showAnswer: 'Show sample answer', hideAnswer: 'Hide sample answer', output: 'Output', tryAgain: 'Not quite — try again',
      askSensei: 'Ask sensei', tryExample: 'Try it', outline: 'In this lesson', done: 'Done',
      senseiIntro: 'Write your question — we\'ll attach the lesson and your code automatically.',
      questionPh: 'Where are you stuck?', sendZalo: 'Send via Zalo', sendEmail: 'Send email',
      copied: 'Question + code copied. Open Zalo, paste (Ctrl+V) into the chat and send!', progressLabel: 'Progress' },
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
    key: (c) => `dojo_prog_${c}`,
    load(c) { try { return JSON.parse(localStorage.getItem(this.key(c))) || {}; } catch { return {}; } },
    save(c, d) { localStorage.setItem(this.key(c), JSON.stringify(d)); },
    entry(d, lesson) { return d[lesson] || (d[lesson] = { passed: [], total: 0 }); },
    setTotal(c, lesson, total) { const d = this.load(c); this.entry(d, lesson).total = total; this.save(c, d); },
    markPassed(c, lesson, ex) {
      const d = this.load(c); const e = this.entry(d, lesson);
      if (!e.passed.includes(ex)) { e.passed.push(ex); this.save(c, d); return true; }
      return false;
    },
    passedCount(c, lesson) { const e = this.load(c)[lesson]; return e ? e.passed.length : 0; },
    total(c, lesson) { const e = this.load(c)[lesson]; return e ? e.total : 0; },
    lessonDone(c, lesson) { const e = this.load(c)[lesson]; return !!(e && e.total > 0 && e.passed.length >= e.total); },
    completedLessons(c, n) { let done = 0; for (let i = 1; i <= n; i++) if (this.lessonDone(c, i)) done++; return done; },
    // Union incoming (cloud) progress into local so nothing already passed is lost.
    merge(c, incoming) {
      if (!incoming || typeof incoming !== 'object') return;
      const d = this.load(c);
      for (const [lesson, e] of Object.entries(incoming)) {
        const cur = this.entry(d, lesson);
        cur.total = Math.max(cur.total || 0, e.total || 0);
        for (const ex of (e.passed || [])) if (!cur.passed.includes(ex)) cur.passed.push(ex);
      }
      this.save(c, d);
    },
  };
  let progressChangedHook = null;

  function initCoursePage() {
    const course = COURSE;
    const storeKey = `dojo_ck_${course.id}`;
    let ckBytes = null;
    let entitled = false;
    const stored = localStorage.getItem(storeKey);
    if (stored) { try { ckBytes = b64ToBytesSafe(stored); } catch { ckBytes = null; } }

    function b64ToBytesSafe(b64) { return b64ToBytes(b64); }
    function isUnlocked() { return !!ckBytes || entitled; }

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
        + `<span class="pnum">${u.progressLabel}: ${done}/${n} (${pct}%)</span>`;
      document.getElementById('courseSub').textContent = course.sub[LANG];
    }

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
      ckBytes = result.ckBytes;
      localStorage.setItem(storeKey, btoa(String.fromCharCode(...ckBytes)));
      err.style.display = 'none';
      currentLabel = result.label;
      renderTop(currentLabel);
      renderList();
    }

    async function openLesson(i) {
      const u = UI[LANG];
      const lesson = course.lessons[i];
      openIndex = i;
      const html = await decryptLessonHtml(lesson, ckBytes);
      const viewer = document.getElementById('viewer');
      viewer.classList.add('show');
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
          if (!currentLabel) currentLabel = Cloud.user.email || '';
          const cloudData = await cloudLoadProgress(course.id);
          if (cloudData) Progress.merge(course.id, cloudData);
        } catch { /* offline */ }
      } else {
        entitled = false;
      }
      renderTop(currentLabel);
      renderList();
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
    makeExamplesRunnable(root);
    const exs = [...root.querySelectorAll('.ex')];
    Progress.setTotal(ctx.courseId, ctx.lessonNum, exs.length);
    exs.forEach((ex, idx) => {
      const kind = ex.dataset.kind;
      if (kind === 'quiz') wireQuiz(ex, ctx, idx);
      else if (kind === 'py') wirePyExercise(ex, ctx, idx);
      else if (kind === 'sql') wireSqlExercise(ex, ctx, idx);
    });
  }

  // Marks an exercise passed, ticks it, and refreshes progress UI.
  function recordPass(ex, ctx, exIndex) {
    ex.classList.add('done');
    if (Progress.markPassed(ctx.courseId, ctx.lessonNum, exIndex)) {
      if (progressChangedHook) progressChangedHook();
      if (Cloud.user) cloudSaveProgress(ctx.courseId, Progress.load(ctx.courseId)); // fire-and-forget
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
          loadScript(base + 'addon/edit/matchbrackets.min.js'),
          loadScript(base + 'addon/edit/closebrackets.min.js'),
          loadScript(base + 'addon/lint/lint.min.js'),
        ]);
        return window.CodeMirror;
      })();
    }
    return cmPromise;
  }
  // Returns a stable {get,set} API; upgrades the textarea to CodeMirror once it loads.
  function attachEditor(textarea, mode) {
    const api = { get: () => textarea.value, set: (v) => { textarea.value = v; } };
    const isPy = mode === 'python';
    if (isPy) getPyodide(); // warm up so the live syntax linter can run
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
      if (isPy) pyEditors.push(ed);
    }).catch(() => { /* keep textarea fallback */ });
    return api;
  }

  // Turns <pre class="run"> demo blocks into editable, runnable (ungraded) examples.
  function makeExamplesRunnable(root) {
    root.querySelectorAll('pre.run').forEach((pre) => {
      const u = UI[LANG];
      const codeText = pre.textContent.replace(/\n$/, '');
      const wrap = document.createElement('div');
      wrap.className = 'runex';
      wrap.innerHTML = `<textarea class="code"></textarea>
        <div class="exrun"><button type="button" class="btn ghost run">▶ ${u.tryExample}</button></div>
        <div class="out"></div>`;
      wrap.querySelector('textarea').value = codeText;
      pre.replaceWith(wrap);
      const code = attachEditor(wrap.querySelector('textarea'), 'python');
      const out = wrap.querySelector('.out');
      wrap.querySelector('.run').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        out.classList.add('show');
        out.innerHTML = `<span>${u.loading}</span>`;
        try {
          const py = await getPyodide();
          const ns = py.globals.get('dict')();
          let stdout = '';
          py.setStdout({ batched: (s) => { stdout += s + '\n'; } });
          let err = '';
          try { py.runPython(code.get(), { globals: ns }); } catch (ex2) { err = lastPyLine(ex2.message); }
          ns.destroy();
          const term = stdout.trim()
            ? `<div class="term"><span class="lbl">${u.output}</span>${escapeHtml(stdout.replace(/\n$/, ''))}</div>`
            : '';
          out.innerHTML = term + (err ? `<div class="verdict bad">${escapeHtml(err)}</div>` : (stdout.trim() ? '' : `<div class="term"><span class="lbl">${u.output}</span>(—)</div>`));
        } finally { btn.disabled = false; }
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

  let pyodidePromise = null;
  let pyReady = null;          // resolved Pyodide instance, for the live linter
  const pyEditors = [];        // CodeMirror python editors to re-lint once Pyodide is ready
  function getPyodide() {
    if (!pyodidePromise) {
      pyodidePromise = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        s.onload = () => window.loadPyodide().then((py) => { py.runPython(PY_HARNESS); return py; }).then((py) => {
          pyReady = py;
          // Pyodide arrived after editors were created — run the linter on them now.
          pyEditors.forEach((ed) => { try { ed.performLint(); } catch { /* editor gone */ } });
          resolve(py);
        }).catch(reject);
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return pyodidePromise;
  }

  // Live syntax checker for CodeMirror: compiles the code via Pyodide and reports the first SyntaxError.
  function pyLint(text, updateLinting) {
    if (!pyReady) { updateLinting([]); return; }
    const CM = window.CodeMirror;
    const fn = pyReady.globals.get('_dojo_lint');
    let res = null;
    try {
      const r = fn(text);
      if (r) { res = r.toJs(); if (r.destroy) r.destroy(); }
    } catch { res = null; } finally { fn.destroy(); }
    if (!res) { updateLinting([]); return; }
    const line = Math.max(0, (res[0] || 1) - 1);
    const ch = Math.max(0, (res[1] || 1) - 1);
    updateLinting([{
      message: res[2] || 'Syntax error',
      severity: 'error',
      from: CM.Pos(line, ch),
      to: CM.Pos(line, ch + 1),
    }]);
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
      </div>
      <div class="out"></div>`;
    ex.appendChild(wrap);

    const textarea = wrap.querySelector('textarea');
    const code = attachEditor(textarea, 'python');
    const out = wrap.querySelector('.out');
    const runBtn = wrap.querySelector('.run');
    const resetBtn = wrap.querySelector('.reset');
    addSenseiButton(wrap.querySelector('.exrun'), ctx, exLabelOf(ex, exIndex), code);

    resetBtn.addEventListener('click', () => {
      code.set(starter.trim());
      out.classList.remove('show');
      out.innerHTML = '';
    });

    runBtn.addEventListener('click', async () => {
      runBtn.disabled = true;
      out.classList.add('show');
      out.innerHTML = `<span>${u.loading}</span>`;
      try {
        const pyodide = await getPyodide();
        const ns = pyodide.globals.get('dict')();
        let stdout = '';
        pyodide.setStdout({ batched: (s) => { stdout += s + '\n'; } });
        let status = 'pass', message = '';
        try {
          pyodide.runPython(code.get(), { globals: ns });
        } catch (e) {
          status = 'error';
          message = lastPyLine(e.message);
        }
        if (status === 'pass') {
          ns.set('_OUT_', stdout); // expose captured stdout so tests can assert on printed output
          const runner = pyodide.globals.get('_dojo_run_tests');
          try {
            const failMsg = runner(tests, ns, LANG);
            if (failMsg) {
              status = 'fail';
              // In hint mode, don't reveal the expected value — show a nudge instead.
              message = hintMode ? (hintText || u.tryAgain) : String(failMsg);
            }
          } catch (e) {
            status = 'error';
            message = lastPyLine(e.message);
          } finally {
            runner.destroy();
          }
        }
        ns.destroy();
        const okClass = status === 'pass' ? 'ok' : 'bad';
        const label = status === 'pass' ? u.pass : u.fail;
        const termHtml = stdout.trim()
          ? `<div class="term"><span class="lbl">${u.output}</span>${escapeHtml(stdout.replace(/\n$/, ''))}</div>`
          : '';
        out.innerHTML = termHtml +
          `<div class="verdict ${okClass}">${label}${message ? ': ' + escapeHtml(message) : ''}</div>`;
        if (status === 'pass') recordPass(ex, ctx, exIndex);
      } finally {
        runBtn.disabled = false;
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
        ${ref ? `<button type="button" class="btn ghost showref">${u.showAnswer}</button>` : ''}
      </div>
      <div class="out"></div>`;
    ex.appendChild(wrap);

    const textarea = wrap.querySelector('textarea');
    const code = attachEditor(textarea, 'text/x-sql');
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

  // ---------- boot ----------
  document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    renderFooter();
    applyI18n();
    if (typeof COURSE !== 'undefined') initCoursePage();
    initAuth();
  });
})();
