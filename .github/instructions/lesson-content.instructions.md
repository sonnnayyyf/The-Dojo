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

## After editing
- Build into the site: `node private-tools/build-course.mjs <python|qa|sql>`, then hard-reload the course page to verify.
