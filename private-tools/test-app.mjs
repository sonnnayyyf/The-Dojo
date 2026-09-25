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

// 4) Legacy upgrade: pre-timestamp data used a lesson-level `_t`. Merging two legacy copies must honour
//    `_t` as a fallback, so NEWER local work is not overwritten by OLDER cloud work on a (missing-time) tie.
sandbox.Cloud.user = { id: 'C' };
mem.set('dojo_prog_python_C', JSON.stringify({ '5': { passed: [], total: 3, answers: { '0': 'newer local (legacy)' }, _t: 2000 } }));
P.merge('python', { '5': { passed: [], total: 3, answers: { '0': 'older cloud (legacy)' }, _t: 1000 } });
assert.equal(P.getAnswer('python', 5, 0), 'newer local (legacy)', 'older legacy cloud _t must NOT overwrite newer legacy local');
// and the reverse: an older local legacy answer SHOULD be replaced by newer cloud legacy work
mem.set('dojo_prog_python_C', JSON.stringify({ '6': { passed: [], total: 3, answers: { '0': 'older local (legacy)' }, _t: 1000 } }));
P.merge('python', { '6': { passed: [], total: 3, answers: { '0': 'newer cloud (legacy)' }, _t: 3000 } });
assert.equal(P.getAnswer('python', 6, 0), 'newer cloud (legacy)', 'newer legacy cloud _t should win');
ok('legacy _t is honoured as a per-answer timestamp fallback on upgrade');

console.log(`\n${passed} test group(s) passed.`);

