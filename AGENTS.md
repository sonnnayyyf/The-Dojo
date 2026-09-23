# The Dojo — Project Context (agent handoff)

> Read this first. It captures what this project is, how it's built, the conventions to follow,
> what's done, and what's next. The chat history does not sync across machines — this file does
> (the folder lives in OneDrive). Also see `CONTEXT.md` for business context.

## 0. Working rules — MULTI-SESSION / BRANCHES (read before editing anything)
- **Multiple Copilot sessions may be open on this SAME folder at once.** They edit the same files on
  disk with **no merge** — whoever saves last silently overwrites the other. This has already caused a
  clobber (a content session overwrote `app.js` platform edits). Avoid it:
- **Do all new work on its OWN git branch**, not directly on `main`. Create one per task/session:
  `git checkout -b <topic>` (e.g. `web-course`, `content-lock`). Only merge to `main` when done.
  `main` is the shared integration branch — don't do live parallel editing on it from two sessions.
- **Stay in your lane / don't touch files another session owns.** If a session is only authoring
  lessons, it must edit ONLY its `private-tools/content/<course>/*.html` + that course's built page
  (e.g. `web.html`) — **never** `app.js`, `styles.css`, or other shared pages. If you think you need a
  shared-file change, STOP and coordinate with the user instead of editing it.
- **Commit + push often** (each commit is a recovery point). If a file gets clobbered, restore it with
  `git checkout -- <file>`.
- **Stage only your own files** when committing (`git add <specific files>`); never `git add -A` /
  `git add .` from a scoped session — it sweeps up another session's edits.

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
- `index.html`, `about.html`, `pricing.html`, `courses.html` (browse/list), `course-detail.html`
  (single course detail, `?c=<id>`), `checkout.html` (VietQR payment), `profile.html` (student info +
  owned courses), `admin.html` (tutor-only dashboard) — marketing/app pages. i18n pattern: elements
  have `data-t` / `data-t-html`, a page-local `const PAGE_I18N={vi:{...},en:{...}}`, and `window.onLang`
  renders dynamic bits. `app.js` fills them.
- `python.html` / `qa.html` / `sql.html` / `web.html` — course pages. Each embeds `const COURSE={...}`
  (the lessons array with bilingual titles + html) and a legacy `const KEYRING=[...]`. `app.js` renders it.
- `app.js` — the whole engine, one IIFE. Nav/footer/i18n injection, course rendering, CodeMirror +
  live Python syntax lint, Pyodide/sql.js runners, the grading harness (`PY_HARNESS`), progress + belts,
  "Ask sensei", and the Supabase accounts module (`Cloud`). Exposes `window.DOJO_CLOUD` (getUser,
  getProfile, isAdmin, saveProfile, signOut, openAuth, onAuthResolved) for `profile.html`/`admin.html`,
  and `window.DOJO_PROFILE` for prefill. Nav account button → `profile.html` when signed in; an `Admin`
  nav link appears for admins (via `is_admin()` rpc). Fresh sign-ups are routed to `profile.html`.
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
  plus the `redeem_code()` SECURITY DEFINER function and RLS. Validated working. **NEW (not yet applied —
  re-run the schema file in the Supabase SQL editor):** `profiles` table (student info), `admins` table
  + `is_admin()` rpc, admin-read RLS on `profiles`/`entitlements`/`progress`, and an `on_auth_user_created`
  trigger that auto-creates a profile row on sign-up. To become admin: sign up, then in SQL editor
  `insert into public.admins(user_id) values ('<your-uuid>')`.
- `app.js` `Cloud` module: Google + email/password auth (nav "Log in" → modal; sign-up requires a
  confirm-password match, min 6 chars), progress upsert/merge, `redeem_code` rpc. When logged in,
  entering a code grants account ownership of the course. Also loads the student `profile`, checks
  `is_admin()`, and exposes `window.DOJO_CLOUD` for `profile.html`/`admin.html`. After sign-in, an
  incomplete profile (missing name/phone) is force-redirected to `profile.html` (hard onboarding gate).
- **Payment flow (manual reconciliation):** `checkout.html` builds a **VietQR** via `img.vietqr.io`
  (bank VIB `970441`, acc `021704060240035`, TRAN HOANG SON) with the **amount pre-filled** and a
  **memo** like `DOJO PYTHON <name>`. Student scans → pays → messages the tutor a screenshot on Zalo →
  tutor confirms in their bank app → issues an unlock code (`new-code.mjs`). Auto-notification (Casso/
  SePay webhook → Supabase Edge Function → auto-grant) is a **future** add-on. `admin.html` tracks
  signups / owned courses / progress.
- **Google sign-in only works on a deployed http(s) site, not `file://`.** Email/password works locally.
- **Content is still plaintext** (not encrypted) during authoring, so "locked" lessons are previewable.
  The real content-lock (encrypt lessons + deliver key only to entitled accounts) is a **launch task**.

## 6. Status — DONE
- **Python Fundamentals COMPLETE: Lessons 1–20** authored bilingual at the rich standard, built into
  `python.html`, and verified (SVG diagrams throughout; stretch + homework each; answers validated).
  L9 (Setup) & L10 (mini-project: task manager) are the two VS Code lessons: homework done in real
  VS Code and **submitted to the tutor (code file + screenshot)**. **L11 onward = on-site auto-graded
  homework** (4 graded exercises, last a stretch). L20 capstone = 3 project options, submitted via
  VS Code. Course stays fundamentals-only (comprehensions, lambda/`key` sorting deferred to Intermediate).
- Marketing pages done: homepage (hero, how-it-works, why-different, CTA), about (About Dojo / Who's
  teaching / About me with EDIT placeholders), pricing.
- Platform features: CodeMirror + live syntax squiggles, runnable examples, auto-grading with specific
  feedback, progress + belts (white→black), Ask sensei (Zalo `0986061705`), lesson outlines, VI/EN toggle.
- Accounts/Supabase live.
- **SQL Fundamentals COMPLETE: Lessons 1–15** (bilingual, rich standard, built into `sql.html`, all `ref`
  queries verified against the seed data, end-to-end grading confirmed in-browser — including the
  INSERT/UPDATE/DELETE and CREATE-TABLE lessons, which grade via a modification statement + a verifying
  `SELECT` run on a fresh DB copy). Course is **15 lessons** (fundamentals only). 1 SELECT & WHERE ·
  2 ORDER BY, LIMIT & DISTINCT · 3 Calculations & AS · 4 Aggregates · 5 GROUP BY & HAVING ·
  6 CASE WHEN (conditional logic) · 7 Text & number functions · 8 Dates & time · 9 JOIN ·
  10 LEFT JOIN & NULL · 11 Subqueries · 12 Mini project: sales report · 13 INSERT, UPDATE & DELETE ·
  14 CREATE TABLE & data types · 15 Capstone: customer analysis.

## 7. Status — TODO / roadmap
1. **Python Fundamentals (L1–L20) is done.** Do not re-author. If revisiting, keep it fundamentals-only:
   comprehensions, lambda/`key` sorting, OOP, generators, decorators etc. belong to the planned
   **Python Intermediate** / **Python Advanced** courses, not here.
2. **Author QA** (12 lessons). **SQL is COMPLETE** — a 15-lesson fundamentals course, all lessons authored
   bilingually (`private-tools/content/sql/NN.{vi,en}.html`) and built into `sql.html`. Advanced SQL
   (UNION, CTEs, window functions, self-joins, indexes) is deferred to a future SQL Intermediate/Advanced
   course. QA can be delegated to the **Dojo Builder** agent or the dedicated
   **SQL Course Builder** agent (`.github/agents/sql-course-builder.agent.md`) in a separate session.
3. Planned follow-on courses — **Python Intermediate** (13 lessons), **Python Advanced**, a standalone
   **Python DSA / Algorithms** course, and **Web Programming Fundamentals** (15 lessons). Full outlines
   in **section 9**. Keep the Fundamentals course from bloating — push advanced topics to these.
   Do NOT start authoring any of them until the user confirms per-course.
4. **Pre-launch:** encrypt lessons for real content-locking + wire content-key delivery via entitlement;
   deploy (Netlify/Vercel/Cloudflare Pages); set Supabase Auth → Site URL + Redirect URLs for prod
   (fixes the confirmation-link → `localhost:3000` "unreachable" landing; verification already succeeds
   server-side, only the redirect target is missing on `file://`); set up **Custom SMTP** (Resend/Brevo
   free tier) to remove the built-in email rate limit (~2–3/hr) and set a branded sender; edit the
   **Confirm signup** email template (free, no SMTP needed) with Dojo branding; consider PWA
   (installable/offline). Then full account e2e test (signup → redeem → progress persists).
5. **Accounts / payments — build now DONE, config pending:** checkout.html (VietQR), profile.html
   (forced onboarding: name+phone required before using the site), admin.html (dashboard) are built.
   **You must (a) re-run `private-tools/supabase-schema.sql` in the SQL editor** to create the
   `profiles`/`admins` tables + policies + trigger, and **(b) make yourself admin** (`insert into
   public.admins(user_id) values ('<uuid>')`). For local testing, turn OFF Authentication → Email
   → "Confirm email" so signup logs in instantly on `file://`. Future: Casso/SePay webhook →
   Supabase Edge Function for auto-grant on payment.

## 8. Product decisions already made (don't relitigate)
- General **IT/programming** theme (not finance/accounting).
- Bilingual bodies; English identifiers.
- Two project checkpoints (mini L10, capstone L20); gentle beginner pacing.
- Homework: auto-graded on-site through L8; **L9 (setup) & L10 (mini-project) done in real VS Code and
  submitted to the tutor (code + screenshot); L11 onward returns to on-site auto-graded homework**
  (auto-grading is the product's differentiator). Capstone is submitted via VS Code (code + screenshot).
- Later lessons **de-emphasise files**; L19 is a review / capstone-prep lesson (not a files lesson).
- **Python Fundamentals stays fundamentals**: comprehensions, lambda/`key` sorting and other advanced
  topics belong to the future Python Intermediate/Advanced courses, not this one.
- Ask-sensei = copy formatted message (lesson+exercise+code+question) to clipboard + open `zalo.me/<num>`.

## 9. Future course plans (brainstorm — confirmed outlines, NOT yet authored)
All follow the house standard: bilingual VI/EN, English identifiers, rich problem-first intros, SVG
diagrams, 10–12 graded exercises + a 🔥 stretch each, on-site auto-graded homework (4, last a stretch),
a mini-project checkpoint + a capstone. Do NOT author until the user confirms the specific course.

### 9a. Python Intermediate — 13 lessons ("job-ready" tier; price above Fundamentals)
Bridges Fundamentals → Advanced: clean, Pythonic code + real tooling.
1. Comprehensions (list/dict/set, filtering, nested) · 2. Sorting like a pro (`key=`, `lambda`, `reverse`) ·
3. Functions II (`*args`, `**kwargs`, keyword-only, `*`/`**` unpacking) · 4. Files & filesystem
(`with open`, `pathlib`, line-by-line) · 5. JSON & structured data (`json` load/dump, nested) ·
6. Standard library & modules (own module; `random`/`datetime`/`collections` `Counter`,`defaultdict`) ·
7. OOP 1 — classes (`class`, `__init__`, attributes, methods) · 8. OOP 2 — behaviour
(`__str__`/`__repr__`/`__eq__`, class vs dict, encapsulation) · 9. OOP 3 — inheritance & composition
(`super()`, overriding, is-a vs has-a) · 10. Clean records: dataclasses & namedtuple ·
11. Iterators & generators (`yield`, generator expressions, lazy) · 12. Robust code (exceptions in
depth, custom exception classes, intro `logging`) · 13. Testing & type hints + Capstone (type hints,
first `pytest`; capstone = a small tested module, submitted via VS Code). Mini-project checkpoint ~L6–7
(e.g. a JSON-backed manager). **Deferred to Advanced:** decorators, custom context managers,
async/asyncio & concurrency, advanced typing/mypy, regex, requests/APIs, packaging & publishing,
performance/profiling, design patterns, descriptors/metaclasses, advanced pytest (fixtures/mocking).

### 9b. Python Advanced — topics (lesson count TBD, ~12–15)
Decorators & closures · context managers (own `__enter__`/`__exit__`) · advanced generators/`itertools`
& coroutines · `async`/`await` + concurrency (threads/processes/asyncio) · advanced typing
(generics, `Protocol`, `TypedDict`) + mypy · regex · `requests`/REST APIs & web data · packaging &
publishing (pip-installable, venv deep) · performance & profiling · design patterns ·
descriptors/metaclasses · advanced testing (pytest fixtures, mocking).

### 9c. Python DSA / Algorithms — standalone course (idea, count TBD)
Sorting & searching, Big-O, recursion, stacks/queues, linked lists, trees/graphs, hashing, common
interview patterns (two-pointer, sliding window, etc.). Kept separate from Intermediate on purpose.

### 9d. Web Programming Fundamentals — 16 lessons (front-end) — CONFIRMED, IN PROGRESS
Beginner front-end: HTML → CSS → JavaScript → interactivity. **9 structure/style + 7 JS**, Lesson 1 free.
Content files live in `private-tools/content/web/NN.{vi,en}.html`; build with
`node private-tools/build-course.mjs web` into `web.html`. **Prioritise heavy visualisation**: lots of
live website previews (`web` kind), SVG diagrams, and show the rendered result itself wherever possible.
Part 1 — HTML + CSS: 1. How the web works (browser, HTML/CSS/JS roles, request/response — conceptual) ·
2. HTML essentials (elements, text, links, images) · 3. HTML structure (lists, tables, forms & semantic
layout) · 4. CSS essentials (selectors, colours, text, the box model) · 5. CSS layout with flexbox ·
6. CSS positioning & moving things (`position`, `z-index`, centering, containers) · 7. CSS grid &
responsive design (media queries, units) · 8. CSS transitions, transforms & animations (`@keyframes`) ·
9. **Mini-project:** build & style a landing page.
Part 2 — JavaScript: 10. JS basics (variables, types, operators, `console.log`) · 11. JS control flow &
data (if, loops, arrays, objects) · 12. JS functions · 13. The DOM (select & change elements) ·
14. Events & interactivity (clicks, input) · 15. Forms, validation & `fetch` (JSON/APIs, light) ·
16. **Capstone:** a small interactive web app, submitted via VS Code.

**PLATFORM PREREQUISITE (DONE):** the engine now supports exercise kinds `quiz`, `py` (Pyodide),
`sql` (sql.js), plus **`web`** (live HTML/CSS/JS preview in a sandboxed `<iframe>`) and **`webjs`**
(JS auto-grader — runs student JS in the sandbox and asserts on `document`/`window`/`_OUT_` via an
`assert(cond,msg)` + `<template class="ts">` block, verdict returned by `postMessage`). Both reuse the
existing render/grade/progress/i18n plumbing in `app.js`; student code is only ever run inside the
sandboxed iframe (never eval'd in the host page). Formats documented in
`.github/instructions/lesson-content.instructions.md`. A dedicated **Web Course Builder** agent can be
created once the platform approach is decided.
