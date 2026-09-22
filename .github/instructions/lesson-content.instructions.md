---
description: "Lesson HTML format rules for The Dojo course content fragments"
applyTo: "private-tools/content/**/*.html"
---
These files are bilingual course-lesson HTML fragments (the source of truth). Author both the `.vi.html` and `.en.html` variant for every lesson. See `AGENTS.md` (root) for full context.

## Rules
- **Bilingual bodies, English identifiers.** Prose is Vietnamese or English per file; all variable names and string values in code are ENGLISH.
- Match the established **lesson standard**: rich problem-first intro (~3 paragraphs), thorough per-section explanations, runnable worked examples, and a diagram or trace table where it helps.
- **10–12 MAIN exercises**; the last main one is an in-lesson **🔥 Stretch** (`class="ex stretch"`).
- Then a **`<h4>🏠 Homework</h4>`** section with **4 graded exercises**, the last a stretch (`class="ex homework stretch"`).

## HTML formats
- Section heading (numbered ones auto-build the outline): `<h4>N. Title</h4>`.
- Runnable example: `<pre class="run">...python...</pre>`.
- Diagram: `<figure class="diagram"><svg ...>...</svg><figcaption>...</figcaption></figure>` — theme colors: ink `#0E1626`/`#121C30`, line `#22304C`, amber `#F5B942`, jade `#7FD1C0`, ember `#E2604C`, text `#E8E4D8`.
- Trace/reference table: `<table class="res">`.
- Graded Python exercise: `<div class="ex" data-kind="py"><span class="exq"><b>Exercise N.</b> ...</span><template class="st">starter code</template><template class="ts">assert ...</template></div>`.
  - Print-output exercises assert on `_OUT_` (captured stdout).
  - Add `data-feedback="hint"` (+ optional `<template class="hint">`) for hint-only feedback.
- Quiz: `<div class="ex" data-kind="quiz" data-a="INDEX">...<ol class="opts"><li>..</li></ol></div>`.
- SQL exercise: `<div class="ex" data-kind="sql">...<template class="st">..</template><template class="ref">answer</template></div>`.
- Live web preview (ungraded): `<div class="ex" data-kind="web">...<template class="st">a full HTML document</template></div>`.
  - The student edits the page and presses **Run**; their code renders in a **sandboxed iframe** (`sandbox="allow-scripts"`, opaque origin — no network, no access to the host page). Use for "run and observe" pages. Starter is a complete `<!doctype html>…</html>` document. An ungraded `web` exercise **counts toward progress and is marked complete when the student first presses Run** (it's a run-and-observe task). For a purely illustrative preview that should NOT count, don't wrap it in `class="ex"`.
- **Multi-file** (either kind): instead of `st`, provide any of `<template class="html">`, `<template class="css">`, `<template class="js">`. Each becomes its own labelled editor; a single **Run** combines them (`<style>` from css into `<head>`, html into `<body>`, js into a `<script>`). Use this whenever HTML and CSS (and later JS) are taught together. Omit the files you don't need (e.g. HTML + CSS only for a styling lesson).
- Graded JS exercise: `<div class="ex" data-kind="webjs">...<template class="st">HTML fragment + &lt;script&gt;</template><template class="ts">assert(...)</template></div>`.
  - Starter is either single-file (`class="st"` HTML fragment + `<script>`) or multi-file (`html`/`css`/`js` templates as above); the engine wraps it in a full document.
  - Test block (`class="ts"`) is **JavaScript** run inside the sandbox after `load`. In scope: `assert(cond, msg)` (throws `msg` when `cond` is falsy), `_OUT_` (captured `console.log` output, string), plus the live `document` and `window` (e.g. `getComputedStyle(...)`). Example: `assert(typeof greet === 'function', 'define greet'); assert(greet('World') === 'Hello, World!', 'wrong greeting'); assert(_OUT_.trim() === 'Hi', 'log Hi');`.
  - Supports `data-feedback="hint"` (+ optional `<template class="hint">`) exactly like `py`. Add `class="ex stretch"` / `class="ex homework stretch"` for stretches.
  - Student JS is **never eval'd in the host page** — it runs only in the sandboxed iframe and reports the verdict back via `postMessage`.

## After editing
- Build into the site: `node private-tools/build-course.mjs <python|qa|sql>`, then hard-reload the course page to verify.
