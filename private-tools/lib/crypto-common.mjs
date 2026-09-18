// Shared AES-GCM/PBKDF2 helpers. Must mirror the algorithm/params used in app.js exactly,
// so codes generated here can be verified by the browser's Web Crypto API.
import { webcrypto as crypto } from 'node:crypto';

export const PBKDF2_ITERATIONS = 250000;

export function toB64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

export function fromB64(b64) {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

export function randomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

// Derives the AES-GCM key used to wrap/unwrap a course's content key from a student's code.
export async function deriveWrapKey(code, saltBytes) {
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function generateContentKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

export async function aesEncrypt(key, plaintextBytes) {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintextBytes);
  return { iv: toB64(iv), data: toB64(new Uint8Array(ct)) };
}

export async function aesDecrypt(key, ivB64, dataB64) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(ivB64) }, key, fromB64(dataB64));
  return new Uint8Array(pt);
}

// Human-friendly one-time code, e.g. "K7XQ-9F3M-4WYT". Avoids ambiguous chars (0/O, 1/I/L).
export function genCode(groups = 3, groupLen = 4) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(groups * groupLen);
  const out = [];
  for (let g = 0; g < groups; g++) {
    let s = '';
    for (let i = 0; i < groupLen; i++) s += alphabet[bytes[g * groupLen + i] % alphabet.length];
    out.push(s);
  }
  return out.join('-');
}
