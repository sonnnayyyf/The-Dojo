import csv
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
def load_transactions(filename):
    transactions = []
    with open(filename) as f:
        reader = csv.DictReader(f)
        for i in reader:
            if not i['date']:
                continue
            transactions.append(i)
        return transactions

def clean_transactions(transactions):
    for i in transactions:
        i['category'] = i['category'].lower()
    return transactions


def filter_by_month(transactions, year, month):
    trans_by_month_year = []
    for i in transactions:
        date = datetime.strptime(i['date'], "%Y-%m-%d").date()
        if date.month == month and date.year == year:
            trans_by_month_year.append(i)
    return trans_by_month_year

def calculate_totals(transactions):
    income = Decimal('0')
    expenses = Decimal('0')
    for i in transactions:
        amount = Decimal(i['amount'])
        if i['category'] == "income":
            income += amount
        else:
            expenses += amount
    net = income - expenses
    return {
        'income': income,
        'expenses': expenses,
        'net':net
    }

def expenses_by_category(transactions):
    expenses_dict = {}
    for i in transactions:
        if i['category'] == "income":
            continue
        if i['category'] in expenses_dict:
            expenses_dict[i['category']] += Decimal(i['amount'])
        else:
            expenses_dict[i['category']] = Decimal(i['amount'])
    return expenses_dict

def main():
    YEAR, MONTH = 2025, 3

    transactions = load_transactions('march_transactions.csv')
    transactions = clean_transactions(transactions)
    month_txns   = filter_by_month(transactions, YEAR, MONTH)

    totals       = calculate_totals(month_txns)
    by_category  = expenses_by_category(month_txns)
    print("==========================================")
    print("     BOOKKEEPING REPORT - March 2025")
    print("==========================================")
    print(f"Total Income:               ${totals['income']}")
    print(f"Total Expenses:               ${totals['expenses']}")
    print(f"Net:               ${totals['net']}")
    print("------------------------------------------")
    print("Expenses by category:")
    print(f" Groceries:                     ${by_category["groceries"]}")
    print(f" Transport:                     ${by_category["transport"]}")
    print(f" Utilities:                     ${by_category["utilities"]}")
    print(f" Food:                     ${by_category["food"]}")
    print(f" Health:                     ${by_category["health"]}")
    print(f" Education:                     ${by_category["education"]}")
    print(f" Entertainment:                     ${by_category["entertainment"]}")
    print("==========================================")
    # TODO: print the report (aim for the target output below)
    # TODO: write report.csv
    with open('summary_transaction.csv', 'w', newline = '') as f:

        writer = csv.DictWriter(f, fieldnames=['section', 'item', 'amount'])
        writer.writeheader()
        writer.writerow({"section": 'summary', "item": income, "amount": amount})
    


main()



