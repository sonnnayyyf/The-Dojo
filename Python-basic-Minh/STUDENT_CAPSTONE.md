# Capstone Project: Monthly Bookkeeping Report

## The mission

You're going to build a tool a real bookkeeper could use. It reads a month of transactions
from a CSV file and produces a clean financial report: total income, total expenses, net
profit/loss, and a breakdown of spending by category — printed nicely AND saved to a new
CSV file.

Here's the thing: **you already know how to do every single piece of this.** CSV reading
(Lesson 14), dates (Lesson 15), Decimal money (Lesson 16). Today you combine them into one
real program.

You'll build it in **6 milestones**. Finish and test each one before moving to the next —
don't try to write the whole thing at once. This is exactly how professional programmers
work: small steps, tested as you go.

Each milestone tells you the **goal**, the **function** to write, which **lesson to reach
back to**, a **hint**, and how to know you're **done**. The code itself is yours to write —
that's the whole point of a capstone. If you get stuck for more than ~10 minutes, ask for a
hint.

Your data file is `march_transactions.csv`.

---

## ⚠️ First, look at your data

Open `march_transactions.csv` in a text editor and actually read it. Real-world data is
never perfectly clean, and this file has **two problems on purpose** that you'll need to
handle:

1. **There's a junk row** — a line that's just commas with no real data (`,,,`). If you try
   to process it like a normal row (e.g. parse its date), your program will crash. You'll
   need to skip it.

2. **The categories aren't capitalised consistently.** Some say `Food`, others say `food`.
   Some say `Transport`, others `transport`. To Python, `"food"` and `"Food"` are *different
   strings* — so if you don't fix this, your report will show "Food" and "food" as two
   separate categories with split totals. That's wrong.

Learning to spot and fix problems like these is a core data skill. Real bank and accounting
exports are full of them.

---

## Milestone 1: Load the transactions

**Goal:** read the CSV into a list of dicts — but skip any row that doesn't have a date
(that's how you drop the junk `,,,` row).

**Write:** `load_transactions(filename)` -> returns a list of dicts.

**Reach back to:** Lesson 14 (`csv.DictReader` reads each row as a dict).

**Hint:** As you loop through the rows, check whether the row's date is empty before you
keep it. An empty string is "falsy" in Python — `if not row['date']:` is `True` when the
date is blank. Use `continue` to skip those rows.

**Done when:** `load_transactions('march_transactions.csv')` returns a list, the program
doesn't crash, and if you print a few rows they look like real transactions (no `,,,` junk
row in there).

---

## Milestone 2: Clean the categories

**Goal:** fix the capitalisation problem so every category is in the same format.

**Write:** `clean_transactions(transactions)` -> returns the list with categories normalised.

**Reach back to:** string methods. The `.title()` method turns `"food"` -> `"Food"`,
`"FOOD"` -> `"Food"`. (`.strip()` is also worth using to remove any stray spaces.)

**Hint:** Loop through each transaction and overwrite its `'category'` value with the
cleaned-up version.

**Done when:** every category is consistently capitalised. Confirm with:
```python
print(set(t['category'] for t in transactions))
```
You should see each category exactly **once** — no more "food" AND "Food".

---

## Milestone 3: Filter to one month

**Goal:** keep only the transactions from a specific year + month.

**Write:** `filter_by_month(transactions, year, month)` -> returns the matching transactions.

**Reach back to:** Lesson 15. Parse each date string into a real date with `strptime`, then
compare its `.year` and `.month` to what was asked for.

**Hint:** `datetime.strptime(t['date'], "%Y-%m-%d").date()` gives you a date object. Keep
the transaction only if both the year and the month match.

**Done when:** `filter_by_month(transactions, 2025, 3)` gives you only March rows.
(!) The file has a few **April** rows in it on purpose — if any show up in your March
results, your filter has a bug.

---

## Milestone 4: Calculate the totals

**Goal:** compute total income, total expenses, and net — all as **Decimal**.

**Write:** `calculate_totals(transactions)` -> returns a dict like
`{'income': ..., 'expenses': ..., 'net': ...}`.

**Reach back to:** Lesson 16 (money is **never** a float — wrap each amount in `Decimal`).

**Rules:**
- Income = sum of amounts where category is `"Income"`
- Expenses = sum of amounts where category is **not** `"Income"`
- Net = income - expenses

**Hint:** Start each running total at `Decimal('0')`. Since the amounts come from the CSV as
strings, `Decimal(t['amount'])` is exactly right — don't let them become floats.

**Done when:** for March 2025 you get income **3050.00**, expenses **686.37**, net
**2363.63**. If your income is 5450, April leaked in — go back to Milestone 3.

---

## Milestone 5: Expenses by category

**Goal:** total up spending per category (excluding Income).

**Write:** `expenses_by_category(transactions)` -> returns a dict of `category -> Decimal total`.

**Reach back to:** the **dict accumulator pattern** (your review session, and Lesson 14).

**Hint:** For each non-Income transaction, add its amount to that category's running total
in the dict. The pattern is the same `if cat in totals: ... else: ...` you've used before
(or the `.get()` shortcut).

**Done when:** you get one entry per category (no duplicates — thanks to Milestone 2) and
Groceries is the biggest at **246.95**.

---

## Milestone 6: Print the report and save it

**Goal:** wire everything together, print a clean report, and write `report.csv`.

This milestone is the **integration glue** — call the functions you already built, in order.
The skeleton below shows the *call order*; the printing and CSV-writing are yours to fill in.

```python
def main():
    YEAR, MONTH = 2025, 3

    transactions = load_transactions('march_transactions.csv')
    transactions = clean_transactions(transactions)
    month_txns   = filter_by_month(transactions, YEAR, MONTH)

    totals       = calculate_totals(month_txns)
    by_category  = expenses_by_category(month_txns)

    # TODO: print the report (aim for the target output below)
    # TODO: write report.csv

main()
```

**For the printed report**, you decide the layout — aim for the target output below. Use
`f"${amount:,.2f}"` (Lesson 16) for the currency formatting.

**For `report.csv`**, reach back to Lesson 14's `csv.writer`. Write a header row, the three
summary numbers, then one row per category.
(!) Remember to open the file with `newline=''` or you'll get blank lines between rows.

**Hint for sorting categories biggest-first:**
`sorted(by_category.items(), key=lambda x: x[1], reverse=True)`

**Done when:** your report matches the target below AND `report.csv` opens cleanly in
Excel with no blank lines between rows.

---

## Your target output

If everything works, your report should look something like this (exact spacing is up to
you — the numbers are what matter):

```
==========================================
     BOOKKEEPING REPORT - March 2025
==========================================
Total Income:               $3,050.00
Total Expenses:               $686.37
Net:                        $2,363.63
------------------------------------------
Expenses by category:
  Groceries                     $246.95
  Transport                     $121.75
  Utilities                      $97.70
  Food                           $86.10
  Health                         $73.39
  Education                       $34.50
  Entertainment                  $25.98
==========================================
```

---

## Challenge extensions (if you finish early)

1. Make the month a variable you can change at the top (or ask the user with `input()`)
2. Add a line showing your single largest expense
3. Show the *number* of transactions in each category next to the total
4. Run it for April too and compare the two months

---

## What you proved today

You took three separate skills — reading CSV files, working with dates, and handling money
correctly — and combined them into one real program that does something genuinely useful.
You also handled messy real-world data, which is most of what data work actually is.

This is the kind of script that saves an accountant hours of manual work every month.

## Coming up next

A library called **pandas** that can do most of what you just built — in about five lines.
Now that you've done it the long way, you'll understand exactly what pandas is doing under
the hood, instead of treating it as magic.
