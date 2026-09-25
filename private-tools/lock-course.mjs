#!/usr/bin/env node
// Encrypts every non-free lesson's HTML in <course>.html with a per-course content key (CK).
// Run this ONCE per course when its content is ready to sell. Safe to re-run later after
// adding new lessons — already-locked lessons are left alone, only new plaintext ones get locked.
//
// Usage: node lock-course.mjs <course-id>      e.g. node lock-course.mjs python
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { webcrypto as crypto } from 'node:crypto';
import { readConst, replaceConst, loadCourseFile, saveCourseFile } from './lib/html-json.mjs';
import { generateContentKey, aesEncrypt } from './lib/crypto-common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const courseId = process.argv[2];

if (!courseId) {
  console.error('Usage: node lock-course.mjs <course-id>   (e.g. python | qa | sql)');
  process.exit(1);
}

const root = path.resolve(here, '..');
const htmlPath = path.join(root, `${courseId}.html`);
const keyDir = path.join(here, 'keys');
const keyPath = path.join(keyDir, `${courseId}.ck`);

if (!fs.existsSync(htmlPath)) {
  console.error(`Not found: ${htmlPath}`);
  process.exit(1);
}
fs.mkdirSync(keyDir, { recursive: true });

let html = loadCourseFile(htmlPath);
const { value: course } = readConst(html, 'COURSE');

// Safety: never mint a fresh key when ciphertext already exists — it would orphan those lessons.
if (!fs.existsSync(keyPath) && course.lessons.some((l) => l.enc)) {
  console.error(`ABORTING: ${courseId}.html already has encrypted lessons, but the content key`);
  console.error(`  ${keyPath}`);
  console.error('is missing. Generating a new key would make those lessons impossible to decrypt.');
  console.error('Restore the original key file from your secure backup, then re-run.');
  process.exit(1);
}

let ckKey, ckRawB64, isNewKey = false;
if (fs.existsSync(keyPath)) {
  ckRawB64 = fs.readFileSync(keyPath, 'utf8').trim();
  ckKey = await crypto.subtle.importKey('raw', Buffer.from(ckRawB64, 'base64'), 'AES-GCM', true, ['encrypt', 'decrypt']);
  console.log(`Reusing existing content key: ${keyPath}`);
} else {
  isNewKey = true;
  ckKey = await generateContentKey();
  ckRawB64 = Buffer.from(await crypto.subtle.exportKey('raw', ckKey)).toString('base64');
  fs.writeFileSync(keyPath, ckRawB64, 'utf8');
  console.log(`Generated new content key -> ${keyPath}\n(KEEP THIS FILE PRIVATE — never publish/upload it, and don't lose it: it's needed to issue future codes.)`);
}


let locked = 0, alreadyLocked = 0, free = 0;
for (const lesson of course.lessons) {
  if (lesson.kind === 'free') { free++; continue; }
  if (lesson.enc) { alreadyLocked++; continue; }
  // Bilingual bodies are stored as {vi,en}; serialize so both languages survive encryption.
  const payload = typeof lesson.html === 'string' ? lesson.html : JSON.stringify(lesson.html);
  const bytes = new TextEncoder().encode(payload);
  const { iv, data } = await aesEncrypt(ckKey, bytes);
  lesson.enc = data;
  lesson.iv = iv;
  delete lesson.html;
  locked++;
}

html = replaceConst(html, 'COURSE', course);
if (isNewKey) {
  html = replaceConst(html, 'KEYRING', []); // old entries wrapped a key that no longer exists
  console.log('KEYRING reset (old demo/stale entries cleared) — issue fresh codes with issue-code.mjs.');
}
saveCourseFile(htmlPath, html);
console.log(`${courseId}.html — locked ${locked} lesson(s), ${alreadyLocked} already locked, ${free} free lesson(s) left as-is.`);
console.log(`Next: node private-tools/issue-code.mjs ${courseId} "Student Name" to generate a code.`);
