#!/usr/bin/env node
// Assembles lesson bodies from editable source files into a course's inline COURSE constant.
// Source files live in private-tools/content/<course>/NN.<lang>.html (NN = 1-based lesson number).
// A lesson with both languages becomes html:{vi,en}; with one language becomes that string.
// Lessons without source files keep whatever is already in the file (placeholder or locked).
//
// Usage: node build-course.mjs <course-id>       e.g. node build-course.mjs python
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConst, replaceConst, loadCourseFile, saveCourseFile } from './lib/html-json.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const courseId = process.argv[2];
if (!courseId) {
  console.error('Usage: node build-course.mjs <course-id>');
  process.exit(1);
}

const root = path.resolve(here, '..');
const htmlPath = path.join(root, `${courseId}.html`);
const contentDir = path.join(here, 'content', courseId);

let html = loadCourseFile(htmlPath);
const { value: course } = readConst(html, 'COURSE');

let built = 0;
course.lessons.forEach((lesson, i) => {
  const nn = String(i + 1).padStart(2, '0');
  const viPath = path.join(contentDir, `${nn}.vi.html`);
  const enPath = path.join(contentDir, `${nn}.en.html`);
  const hasVi = fs.existsSync(viPath);
  const hasEn = fs.existsSync(enPath);
  if (!hasVi && !hasEn) return;

  const body = {};
  if (hasVi) body.vi = fs.readFileSync(viPath, 'utf8').trim();
  if (hasEn) body.en = fs.readFileSync(enPath, 'utf8').trim();
  lesson.html = (hasVi && hasEn) ? body : (body.vi ?? body.en);
  delete lesson.enc;
  delete lesson.iv;
  built++;
});

html = replaceConst(html, 'COURSE', course);
saveCourseFile(htmlPath, html);
console.log(`${courseId}.html — built ${built} lesson(s) from ${path.relative(root, contentDir)}/.`);
