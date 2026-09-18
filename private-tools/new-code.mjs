#!/usr/bin/env node
// Generates a one-time redemption code. If a service key is configured in private-tools/.env
// it inserts the code straight into Supabase (one command, no manual paste). Otherwise it
// prints an INSERT statement for you to paste into the Supabase SQL Editor.
//
// Usage: node new-code.mjs <course-id> "<student label>"
//   e.g. node new-code.mjs python "Nguyen Van A"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { genCode } from './lib/crypto-common.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [, , course, ...labelParts] = process.argv;
const label = labelParts.join(' ').trim();

if (!course || !label) {
  console.error('Usage: node new-code.mjs <course-id> "<student label>"');
  process.exit(1);
}

// Minimal .env loader (no dependency).
function loadEnv() {
  const p = path.join(here, '.env');
  const env = {};
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2];
    }
  }
  return env;
}

const env = loadEnv();
const code = genCode();
const insertSql = `insert into public.codes(code, course, label) values ('${code}', '${course}', '${label.replace(/'/g, "''")}');`;

const ledger = path.join(here, 'ledger.csv');
if (!fs.existsSync(ledger)) fs.writeFileSync(ledger, 'issued_at,course,label,code\n', 'utf8');
fs.appendFileSync(ledger, `${new Date().toISOString()},${course},"${label.replace(/"/g, '""')}",${code}\n`, 'utf8');

console.log(`\nCODE:    ${code}`);
console.log(`Course:  ${course}`);
console.log(`Student: ${label}\n`);

const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_KEY;
if (url && key && !key.includes('paste-your')) {
  const res = await fetch(`${url}/rest/v1/codes`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ code, course, label }),
  });
  if (res.ok) {
    console.log('✓ Code activated in the database. Just send the CODE to the student.');
  } else {
    console.log(`✗ Could not insert automatically (HTTP ${res.status}): ${await res.text()}`);
    console.log('Fallback — paste this into the Supabase SQL Editor:');
    console.log(insertSql);
  }
} else {
  console.log('No service key in private-tools/.env — paste this into the Supabase SQL Editor:');
  console.log(insertSql);
  console.log('\n(To activate codes with one command, copy .env.example to .env and add your service_role key.)');
}
