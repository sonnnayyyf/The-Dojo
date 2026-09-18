# private-tools — course locking & code issuing

**Never publish or upload this folder (especially `keys/` and `ledger.csv`) to the hosted
site or any public repo.** It contains the secret content keys and a private log of every
code you've ever issued, with which student/course it belongs to.

## One-time setup per course
When a course's lessons are finished and ready to sell:

```
node private-tools/lock-course.mjs python
```

This encrypts every non-free lesson's HTML in `python.html` with a fresh random content key
(saved to `private-tools/keys/python.ck`) and clears any leftover demo unlock entries. Re-run
it later if you add new lessons — already-locked ones are left untouched.

## Issuing a code after a student pays
```
node private-tools/issue-code.mjs python "Nguyen Van A"
```

Prints a one-time code (e.g. `K7XQ-9F3M-4WYT`), appends the wrapped-key entry to
`python.html`'s `KEYRING`, and logs it in `private-tools/ledger.csv`. Then:

1. Re-upload/redeploy the updated `python.html`.
2. Send the printed code to the student (that course only — codes don't work on other courses).

## How it works
- Each course has one random AES-256 **content key (CK)**. Locked lessons are encrypted with it.
- Each issued code derives a wrapping key via PBKDF2(code, per-entry salt), which wraps CK.
  The student's browser tries every entry in `KEYRING` with the code they typed; the entry that
  unwraps successfully reveals CK, which then decrypts every locked lesson client-side.
- This is a static site with no server — there's no way to remotely revoke a code once given
  out. Treat sharing it as a manual/trust issue (per your pricing page wording), not a technical
  guarantee.
