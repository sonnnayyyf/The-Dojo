#!/usr/bin/env node
// Generates a one-time unlock code for one student for ONE course, appends the wrapped-key
// entry into <course>.html's KEYRING, and logs it to ledger.csv for your own records.
//
// Usage: node issue-code.mjs <course-id> <student label>
//   e.g. node issue-code.mjs python "Nguyen Van A - 2026-09-18"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readConst, replaceConst, loadCourseFile, saveCourseFile } from './lib/html-json.mjs';
import { deriveWrapKey, aesEncrypt, randomBytes, toB64, genCode } from './lib/crypto-common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [, , courseId, ...labelParts] = process.argv;
const label = labelParts.join(' ').trim();

if (!courseId || !label) {
  console.error('Usage: node issue-code.mjs <course-id> <student label>');
  process.exit(1);
}

const root = path.resolve(here, '..');
const htmlPath = path.join(root, `${courseId}.html`);
const keyPath = path.join(here, 'keys', `${courseId}.ck`);
const ledgerPath = path.join(here, 'ledger.csv');

if (!fs.existsSync(keyPath)) {
  console.error(`No content key for "${courseId}" yet. Run: node lock-course.mjs ${courseId}`);
  process.exit(1);
}
if (!fs.existsSync(htmlPath)) {
  console.error(`Not found: ${htmlPath}`);
  process.exit(1);
}

const ckRaw = Buffer.from(fs.readFileSync(keyPath, 'utf8').trim(), 'base64');
const code = genCode();
const salt = randomBytes(16);
const wrapKey = await deriveWrapKey(code, salt);
const { iv, data: wk } = await aesEncrypt(wrapKey, ckRaw);

let html = loadCourseFile(htmlPath);
const { value: keyring } = readConst(html, 'KEYRING');
keyring.push({ label, salt: toB64(salt), iv, wk });
html = replaceConst(html, 'KEYRING', keyring);
saveCourseFile(htmlPath, html);

if (!fs.existsSync(ledgerPath)) {
  fs.writeFileSync(ledgerPath, 'issued_at,course,label,code\n', 'utf8');
}
fs.appendFileSync(ledgerPath, `${new Date().toISOString()},${courseId},"${label.replace(/"/g, '""')}",${code}\n`, 'utf8');

console.log(`\nCourse:  ${courseId}`);
console.log(`Student: ${label}`);
console.log(`CODE:    ${code}\n`);
console.log(`Appended to ${htmlPath} and logged in ${ledgerPath}.`);
console.log(`Re-upload/redeploy the updated ${courseId}.html, then send the code to the student.`);
