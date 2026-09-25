#!/usr/bin/env node
// Focused regression tests for the account-boundary / progress-merge logic that external
// reviews reproduced. Runs the Progress store from app.js in an isolated VM sandbox.
// Usage: node private-tools/test-app.mjs   (exits non-zero on failure)
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const start = src.indexOf('  const Progress = {');
const end = src.indexOf('  function initCoursePage()');
if (start < 0 || end < 0) { console.error('Could not locate Progress module in app.js'); process.exit(1); }
const slice = src.slice(start, end) + '\nglobalThis.Progress = Progress;';

const mem = new Map();
const sandbox = {
  Cloud: { user: { id: 'A' } },
  localStorage: {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
  },
  setTimeout: () => 0, clearTimeout() {}, cloudSaveProgress: async () => true, setSyncStatus() {},
};
vm.createContext(sandbox);
vm.runInContext(slice, sandbox);
const P = sandbox.Progress;

let passed = 0;
function ok(name) { console.log('  PASS:', name); passed++; }

// 1) Per-answer merge: a NEWER answer must survive an unrelated quiz pass on the other device.
P.saveAnswer('python', 1, 0, 'old laptop answer');   // A wrote answer 0 now
P.markPassed('python', 1, 2);                        // A later passes quiz #2 (unrelated)
const later = Date.now() + 10000;
P.merge('python', { '1': { passed: [], total: 3, answers: { '0': 'newer phone answer' }, answerTimes: { '0': later } } });
assert.equal(P.getAnswer('python', 1, 0), 'newer phone answer', 'newer answer should win per-answer');
assert.ok(P.load('python')['1'].passed.includes(2), 'the unrelated pass must be preserved');
ok('per-answer merge keeps the newer answer AND unions passes');

// 2) Older incoming answer must NOT overwrite a newer local one.
P.saveAnswer('python', 2, 0, 'fresh local answer');  // newest
P.merge('python', { '2': { answers: { '0': 'stale cloud answer' }, answerTimes: { '0': 1 } } });
assert.equal(P.getAnswer('python', 2, 0), 'fresh local answer', 'stale cloud answer must not win');
ok('older incoming answer does not clobber newer local answer');

// 3) Progress is namespaced per account.
sandbox.Cloud.user = { id: 'B' };
assert.equal(P.getAnswer('python', 1, 0), undefined, 'account B must not see account A data');
sandbox.Cloud.user = { id: 'A' };
assert.equal(P.getAnswer('python', 1, 0), 'newer phone answer', 'account A still sees its own data');
ok('progress is isolated per account');

console.log(`\n${passed} test group(s) passed.`);
