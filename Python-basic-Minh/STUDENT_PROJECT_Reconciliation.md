# Final Project: Invoice Reconciliation Tool

This is your final Python project before we move to SQL. It's a real accounting task —
**reconciliation** — and it pulls together everything you've learned: CSV reading, cleaning
data, `datetime` comparisons, dict accumulation, and writing a formatted Excel report.

Unlike the practice exercises, this project doesn't hand you function signatures for every
step. You'll design some of the structure yourself. Read the whole brief first, then build
it piece by piece.

---

## The scenario

A small business sends **invoices** to clients and receives **payments** against them. In
the real world, payments are messy:
- Some invoices are paid in full, on time.
- Some are paid **late** (after the due date).
- Some are **partially paid** — the client sent less than they owe.
- Some are **overpaid** — the client sent too much (needs a refund).
- Some are never paid at all.
- And one invoice might be paid by **several separate payments** that add up.

Your job: write a tool that reads both files, matches each payment to its invoice, works out
the status of every invoice, and produces a clear report — ending in a formatted Excel file.

---

## Your data

**`invoices.csv`** — one row per invoice:

| Column | Meaning |
|---|---|
| `invoice_id` | Unique ID, e.g. `INV-1001` |
| `client` | Client name |
| `amount_due` | How much they owe |
| `date_issued` | When the invoice was sent |
| `due_date` | When payment is due |

**`payments.csv`** — one row per payment received:

| Column | Meaning |
|---|---|
| `payment_id` | Unique ID, e.g. `PAY-5001` |
| `invoice_id` | Which invoice this payment is for |
| `amount_paid` | How much was paid |
| `date_paid` | When it was paid |

The link between the two files is `invoice_id` — that's how you know which payment belongs to
which invoice. (Hold onto that idea. In SQL, this is called a **join**, and it's most of what
the next lessons are about.)

> ⚠️ Each file has **one junk row** (blank or bad values). Handle it when loading — this is
> the one place `try/except` earns its keep.

---

## Milestone 1: Load the invoices

Write a function `load_invoices(filepath)` that reads `invoices.csv` and returns a
**dictionary** keyed by `invoice_id`, where each value is the invoice's data. Convert
`amount_due` to `float` and `due_date` to a `datetime`. Skip the junk row.

Why a dict keyed by ID? Because in the next milestone you'll need to look up an invoice by
its ID quickly when you process payments.

**✅ Done when:** you've loaded **12 invoices** (the junk row skipped).

---

## Milestone 2: Total up the payments per invoice

Write a function `total_payments(filepath)` that reads `payments.csv` and returns a
dictionary mapping each `invoice_id` to the **total amount paid** for it (summing multiple
payments), plus a way to know the **latest payment date** for each invoice (you'll need that
for the "late" check later).

You can return two dicts, or one dict of small dicts — your design choice. Skip the junk row.

**Hint:** This is the dict-accumulator pattern. For each valid payment row, add its amount to
that invoice's running total, and track the most recent `date_paid`.

**✅ Done when:** the totals look right — e.g. `INV-1004` should show the sum of its two
payments.

---

## Milestone 3: Classify each invoice

Now the core logic. Go through every invoice and decide its status by comparing what's owed
(`amount_due`) against what was paid (the total from Milestone 2):

- **Unpaid** — no payment at all
- **Paid in full** — paid total equals the amount due
- **Partially paid** — paid something, but less than owed (record the **shortfall**)
- **Overpaid** — paid more than owed (record the **excess**)

Separately, flag **late** invoices: any invoice where the latest payment date is *after* the
due date. (An invoice can be both "paid in full" and "late".)

> 💡 **Watch out for floating-point:** don't test `paid == due` directly — tiny rounding
> errors can make two "equal" amounts differ by a fraction of a cent. Instead, treat them as
> equal if the difference is smaller than one cent:
> ```python
> if abs(paid - due) < 0.01:
>     # paid in full
> ```

**✅ Done when:** your counts match this:

| Status | Count |
|---|---|
| Paid in full | 6 |
| Partially paid | 3 |
| Unpaid | 2 |
| Overpaid | 1 |
| Late | 3 |

---

## Milestone 4: Print a readable summary

Before making Excel, print a clear text report to the terminal so you can check your work.
Something like:

```
=== INVOICE RECONCILIATION ===

PAID IN FULL (6):
  INV-1001, INV-1002, ...

PARTIALLY PAID (3):
  INV-1003 — short by $883.65
  ...

UNPAID (2):
  INV-1005, INV-1009

OVERPAID (1):
  INV-1006 — over by $150.00

LATE PAYMENTS (3):
  INV-1002, INV-1007, INV-1010

Total invoiced: $28062.55
Total received: $19863.28
Outstanding:    $8199.27
```

**✅ Done when:** your totals match the three figures above.

---

## Milestone 5: The Excel report

Produce a formatted `reconciliation_report.xlsx` with **openpyxl**. Design it however looks
clearest to you, but it should include:

1. A **bold title row** — "Invoice Reconciliation Report"
2. A **styled header row** (bold, coloured background) with columns like:
   `Invoice ID | Client | Amount Due | Amount Paid | Status | Days Late`
3. **One row per invoice**, filled in with its status and (if late) how many days late
4. **Currency formatting** (`$#,##0.00`) on the money columns
5. A **TOTAL row** at the bottom using a `=SUM()` formula for the Amount Due and Amount Paid
   columns
6. Sensible column widths

**Hint for "days late":** subtract the due date from the latest payment date; the result is a
`timedelta`, and `.days` gives you the number. (Callback to Lesson 15.) For invoices that
aren't late, leave it blank or put `0`.

**✅ Done when:** the file opens in Excel, looks like a person made it, and the SUM totals
match your Milestone 4 figures.

---

## Stretch Goal: A second summary sheet

Add a **second worksheet** to the same workbook called `Summary` that shows, per status
category, how many invoices and the total dollar value. E.g.:

```
Status            Count    Total Amount Due
Paid in full        6         $ ...
Partially paid      3         $ ...
Unpaid              2         $ ...
Overpaid            1         $ ...
```

**Hint:** `wb.create_sheet('Summary')` makes a new tab. You already have all the numbers from
Milestone 3.

---

## What this project proves you can do

- Read and clean **two related datasets** from CSV
- **Match records across files** by a shared key (invoice ID) — the exact idea behind SQL joins
- Use `datetime` to answer a real business question ("was this late?")
- Apply the dict-accumulator pattern to real aggregation
- Produce a **professional, formatted Excel deliverable** with live formulas

This is genuinely the kind of tool a junior accountant might be asked to build. Nice work
getting here.

## Coming up: SQL

Everything you just did by hand — matching payments to invoices, grouping by status, summing
totals — SQL does with a few lines. When we start, remember this project: `WHERE`, `GROUP BY`,
and especially `JOIN` will feel like shortcuts for work you already understand.
