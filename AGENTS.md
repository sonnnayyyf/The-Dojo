# The Dojo — Project Context (agent handoff)

> Read this first. It captures what this project is, how it's built, the conventions to follow,
> what's done, and what's next. The chat history does not sync across machines — this file does
> (the folder lives in OneDrive). Also see `CONTEXT.md` for business context.

## 1. What this is
- **The Dojo** — a bilingual (Vietnamese/English) interactive coding-course platform. Solo tutor,
  optionally co-marketed with a tutoring company. Sells self-paced 20-lesson courses; also 1-on-1 tutoring.
- **Business/access flow:** student pays (off-platform, e.g. bank/Zalo) → tutor generates a one-time
  **code** → student signs up / logs in → **redeems the code** → their **account owns that course** →
  progress saves to the account and syncs across devices.
- **3 courses:** Python (`python.html`), QA/Testing (`qa.html`), SQL (`sql.html`).
- **Runs real tools client-side:** Python via **Pyodide**, SQL via **sql.js**. Editor is **CodeMirror**.
  **Supabase** provides accounts + cloud progress + entitlements. No custom backend server.

## 2. Repo layout
- `index.html`, `about.html`, `pricing.html` — marketing pages. i18n pattern: elements have
  `data-t` / `data-t-html`, a page-local `const PAGE_I18N={vi:{...},en:{...}}`, and `window.onLang`
  renders dynamic bits. `app.js` fills them.
- `python.html` / `qa.html` / `sql.html` — course pages. Each embeds `const COURSE={...}` (the lessons
  array with bilingual titles + html) and a legacy `const KEYRING=[...]`. `app.js` renders everything.
- `app.js` — the whole engine, one IIFE. Nav/footer/i18n injection, course rendering, CodeMirror +
  live Python syntax lint, Pyodide/sql.js runners, the grading harness (`PY_HARNESS`), progress + belts,
  "Ask sensei", and the Supabase accounts module (`Cloud`).
- `styles.css` — all styles.
- `private-tools/` — LOCAL-ONLY tooling (never deploy). Contains:
  - `content/python/NN.vi.html` + `NN.en.html` — **lesson source files** (the source of truth).
  - `build-course.mjs` — assembles content files into a course's inline `COURSE`.
  - `new-code.mjs` — generates a redemption code (auto-inserts to Supabase if `.env` set).
  - `supabase-schema.sql` — the database schema (already applied to the project).
  - `.env` (gitignored) — holds `SUPABASE_SERVICE_KEY`. `.env.example` shows the format.
  - `lib/`, `keys/`, `ledger.csv`, legacy crypto scripts (`lock-course.mjs`, `issue-code.mjs`).
- `CONTEXT.md` — business/curriculum context. `MASTER-KEYS.txt` — points to private-tools.

## 3. How lessons are authored (content pipeline)
1. Write/edit `private-tools/content/<course>/NN.vi.html` and `NN.en.html` (bilingual, HTML fragments).
2. Build into the site: `node private-tools/build-course.mjs python` → sets `COURSE.lessons[i].html={vi,en}`.
3. Reload the course page in the browser to verify.

### Lesson HTML format (inside the content files)
- Section headings: `<h4>N. Title</h4>` — the numbered ones auto-generate the lesson **outline**.
- Runnable example: `<pre class="run">...python...</pre>` → becomes an editable "▶ Try it" block.
- Diagram: `<figure class="diagram"><svg ...>...</svg><figcaption>...</figcaption></figure>` (theme colors:
  ink `#0E1626`/`#121C30`, line `#22304C`, amber `#F5B942`, jade `#7FD1C0`, ember `#E2604C`, text `#E8E4D8`).
- Trace/reference tables: `<table class="res">`.
- Graded exercise (Python): `<div class="ex" data-kind="py"><span class="exq"><b>Exercise N.</b> ...</span>`
  `<template class="st">starter code</template><template class="ts">assert ...</template></div>`.
  - Print-output exercises: assert on `_OUT_` (captured stdout), e.g. `assert _OUT_.strip() == "..."`.
  - Hint-only feedback: add `data-feedback="hint"` (+ optional `<template class="hint">`).
- Quiz: `<div class="ex" data-kind="quiz" data-a="INDEX">...<ol class="opts"><li>..</li></ol></div>`.
- SQL: `<div class="ex" data-kind="sql">...<template class="st">..</template><template class="ref">answer</template></div>`.

### The agreed LESSON STANDARD (match this depth)
- Rich intro: ~3 paragraphs, "problem first" motivation before any code.
- Thorough per-section explanation + runnable worked examples + a diagram/trace table where it helps.
- **10–12 MAIN exercises**, and the last main one is an in-lesson **🔥 Stretch** (`class="ex stretch"`).
- Then a **`<h4>🏠 Homework</h4>`** section with **4 graded exercises**, the last being a stretch
  (`class="ex homework stretch"`). Homework is done at home, not in the 2-hour class.
- **Bilingual** (write both vi + en). **All variable names and string values in ENGLISH.**

## 4. Commands & gotchas
- Build a course: `node private-tools/build-course.mjs <python|qa|sql>`
- **ALWAYS after editing `app.js`: `node --check app.js`** (a syntax error blanks the whole page).
- Browser `file://` caches `app.js` hard — do a **hard reload** after changes.
- Issue a code: `node private-tools/new-code.mjs python "Student Name"` (auto-activates in DB via `.env`).
- Never commit `private-tools/.env`, `keys/`, `ledger.csv` (already gitignored).

## 5. Accounts (Supabase) — LIVE and validated
- Project URL `https://hlxadajedsymnhzgjyzv.supabase.co`; publishable key is in `app.js` `SUPABASE` const
  (safe to be public). Service key lives only in `private-tools/.env`.
- Schema (`private-tools/supabase-schema.sql`) is applied: tables `progress`, `entitlements`, `codes`,
  plus the `redeem_code()` SECURITY DEFINER function and RLS. Validated working.
- `app.js` `Cloud` module: Google + email/password auth (nav "Log in" → modal), progress upsert/merge,
  `redeem_code` rpc. When logged in, entering a code grants account ownership of the course.
- **Google sign-in only works on a deployed http(s) site, not `file://`.** Email/password works locally.
- **Content is still plaintext** (not encrypted) during authoring, so "locked" lessons are previewable.
  The real content-lock (encrypt lessons + deliver key only to entitled accounts) is a **launch task**.

## 6. Status — DONE
- Python **Lessons 1–9** authored bilingual at the rich standard, verified (incl. SVG diagrams for
  indexing/loops/nested loops, while-flow; stretch + 4-question homework each). L9 (Setup: Python +
  VS Code) is the bridge lesson: small setup section + to-do mini-project prep exercises; from L9 on,
  homework is done in real VS Code (prose tasks, not auto-graded).
- Marketing pages done: homepage (hero, how-it-works, why-different, CTA), about (About Dojo / Who's
  teaching / About me with EDIT placeholders), pricing.
- Platform features: CodeMirror + live syntax squiggles, runnable examples, auto-grading with specific
  feedback, progress + belts (white→black), Ask sensei (Zalo `0986061705`), lesson outlines, VI/EN toggle.
- Accounts/Supabase live.

## 7. Status — TODO / roadmap
1. **Author Python L10–L20** at the rich standard. Current titles/order:
   10 Mini project: to-do/task manager · 11 Dictionaries · 12 Lists of dicts & nested data · 13 Functions ·
   14 Functions in depth · 15 try/except · 16 Tuples/unpacking/enumerate · 17 Comprehensions ·
   18 Sets & sorting (sorted, key, lambda) · 19 Text & files (split/join, modules) · 20 Capstone: log/text analyzer.
2. **Author QA** (12 lessons) and **SQL** (20 lessons) content (only lesson 1 exists; rest placeholder).
3. Optional **Python Advanced** course #4 (OOP, generators, decorators, context managers, type hints,
   regex, requests/JSON, pytest) — user is considering; do NOT start until they confirm.
4. **Pre-launch:** encrypt lessons for real content-locking + wire content-key delivery via entitlement;
   deploy (Netlify/Vercel/Cloudflare Pages); set Supabase Auth → Site URL + Redirect URLs for prod;
   consider PWA (installable/offline). Then full account e2e test (signup → redeem → progress persists).

## 8. Product decisions already made (don't relitigate)
- General **IT/programming** theme (not finance/accounting).
- Bilingual bodies; English identifiers.
- Two project checkpoints (mini L10, capstone L20); gentle beginner pacing.
- Homework is graded on-site through L8; from L9 (VS Code setup) onward homework moves to real VS Code.
- Ask-sensei = copy formatted message (lesson+exercise+code+question) to clipboard + open `zalo.me/<num>`.
