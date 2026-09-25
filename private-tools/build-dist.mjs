#!/usr/bin/env node
// Builds a publishable dist/ containing ONLY the public site — never private-tools, student
// materials, docs, keys or lesson sources. Refuses to build if any sold course still has a
// paid lesson in plaintext (a content-lock bypass). Publish ONLY the dist/ directory.
//
// Usage: node private-tools/build-dist.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConst, loadCourseFile } from './lib/html-json.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dist = path.join(root, 'dist');

// Explicit allowlist — anything not listed here is NOT published.
const PAGES = ['index.html', 'about.html', 'pricing.html', 'courses.html', 'course-detail.html',
  'checkout.html', 'profile.html', 'admin.html', 'progress.html', 'reset-password.html',
  'forgot-password.html', 'privacy.html',
  'python.html', 'sql.html', 'web.html', 'qa.html'];
const ASSETS = ['app.js', 'styles.css'];
const SOLD = ['python', 'sql', 'web']; // courses actually for sale — must be encrypted (QA is "coming soon")

// Safety gate: refuse to publish plaintext paid lessons.
const leaks = [];
for (const id of SOLD) {
  const p = path.join(root, `${id}.html`);
  if (!fs.existsSync(p)) { leaks.push(`${id}.html is missing`); continue; }
  const course = readConst(loadCourseFile(p), 'COURSE').value;
  const plaintextPaid = course.lessons.filter((l) => l.kind !== 'free' && l.html != null);
  if (plaintextPaid.length) leaks.push(`${id}.html has ${plaintextPaid.length} paid lesson(s) in plaintext`);
}
if (leaks.length) {
  console.error('ABORTING build — paid content would be published unencrypted:');
  leaks.forEach((m) => console.error('  - ' + m));
  console.error('Run `node private-tools/lock-course.mjs <course>` for each, then rebuild dist.');
  process.exit(1);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
let copied = 0;
for (const f of [...PAGES, ...ASSETS]) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(dist, f)); copied++; }
  else console.warn(`  (skipped, not found: ${f})`);
}

// Security headers for static hosts (Netlify / Cloudflare Pages honour a _headers file).
fs.writeFileSync(path.join(dist, '_headers'),
  '/*\n' +
  '  X-Frame-Options: DENY\n' +
  '  X-Content-Type-Options: nosniff\n' +
  '  Referrer-Policy: strict-origin-when-cross-origin\n' +
  '  Permissions-Policy: geolocation=(), microphone=(), camera=()\n');

console.log(`dist/ built — ${copied} file(s), all paid courses encrypted. Publish ONLY the dist/ directory.`);
