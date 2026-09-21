---
description: "Scaffold a new bilingual Dojo lesson (NN.vi.html + NN.en.html) with the standard section skeleton"
argument-hint: "course (python|qa|sql), lesson number NN, and lesson title"
---
Scaffold a new lesson for **The Dojo**. Read `AGENTS.md` in the workspace root first for full context and the lesson standard.

Given the course, lesson number `NN`, and title from the arguments:

1. Create both `private-tools/content/<course>/NN.vi.html` and `private-tools/content/<course>/NN.en.html`.
2. Populate each with the standard skeleton (bilingual prose per file, English identifiers):
   - A rich problem-first intro (~3 paragraphs) placeholder.
   - Several `<h4>N. Title</h4>` sections, each with explanation + a runnable `<pre class="run">` example, and a `<figure class="diagram">` or `<table class="res">` placeholder where useful.
   - **10–12 MAIN exercises** (`<div class="ex" data-kind="py">` with `<template class="st">` starter + `<template class="ts">` asserts), the last being an in-lesson **🔥 Stretch** (`class="ex stretch"`).
   - A `<h4>🏠 Homework</h4>` section with **4 graded exercises**, the last a stretch (`class="ex homework stretch"`).
3. Follow the exact HTML formats and theme colors documented in `AGENTS.md` section 3.
4. Do NOT run the build yet — leave the fragments ready for the author to fill in real content, then remind the user to run `node private-tools/build-course.mjs <course>` and hard-reload to verify.

Keep placeholders clearly marked (e.g. `TODO:`) so the author knows what to complete.
