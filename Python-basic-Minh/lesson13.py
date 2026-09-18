import csv
from datetime import date, datetime, timedelta

# today = date.today()
# print(today)

# birthday = date(2003, 6, 15)
# print(birthday)

# print(today.year)
# print(birthday.month)
# print(today.day)

# print(today.weekday())

# in_30_days = today + timedelta(days=30)
# last_week = today - timedelta(days=7)
# print(in_30_days)
# print(last_week)

# due_date = date(2026, 12, 31)
# days_left = (due_date - today).days
# print(days_left)

# date_str = "2025-01-15"
# real_date = datetime.strptime(date_str, "%Y-%m-%d").date()
# print(real_date)

# print(today.strftime("%Y/%m/%d"))

1
# def days_until(day):
#     due_date = datetime.strptime(day, "%Y-%m-%d").date()
#     today = date.today()
#     days_until = (due_date - today).days
#     return days_until
# day = input("Enter the due date (YYYY-MM-DD): ")
# print(days_until(day))

2

# def age_in_days(birthday):
#     today = date.today()
#     birthday_date = datetime.strptime(birthday, "%Y-%m-%d").date()
#     days_old = (today - birthday_date).days
#     return days_old



# birthday = input("Enter your birthday (YYYY-MM-DD): ")
# print(age_in_days(birthday))

3.
# def is_weekend(day): 
#     day = datetime.strptime(some_date, "%Y-%m-%d").date()
#     if day.weekday() == 5 or day.weekday() == 6:
#         day_name = day.strftime("%A")
#         return f"True ({day_name})"
#     else:
#         day_name = day.strftime("%A")
#         return f"False ({day_name})"




# some_date = input("Enter your day (YYYY-MM-DD): ")
# print(is_weekend(some_date))

4

5
# def format_pretty(some_date):
#     real_date = datetime.strptime(some_date, "%Y-%m-%d").date()
#     day = real_date.strftime("%A, %B %d, %Y")
#     return day

# some_date = input("Enter your day (YYYY-MM-DD): ")
# print(format_pretty(some_date))

6
# def days_between(date1, date2):
#     real_date1 = datetime.strptime(date1, "%Y-%m-%d").date()
#     real_date2 = datetime.strptime(date2, "%Y-%m-%d").date()
#     days_between =  abs((real_date2 - real_date1).days)
#     return days_between

# date1 = input("Enter the date (YYYY-MM-DD): ")
# date2 = input("Enter the date (YYYY-MM-DD): ")
# print(days_between(date1, date2))

7
# def due_date(invoice_date, payment_terms_days):
#     invoice = datetime.strptime(invoice_date, "%Y-%m-%d").date()
#     payment_duration = int(payment_terms_days)
#     due_date = invoice + timedelta(days=payment_duration)
#     return due_date

# invoice_date = input("Enter the invoice date (YYYY-MM-DD): ")
# payment_terms_days = input("Enter the duration of payment in days: ")
# print(due_date(invoice_date, payment_terms_days))


8, 9
# def is_overdue(due_date):
#     today = date.today()
#     due = datetime.strptime(due_date, "%Y-%m-%d").date()
#     days_overdue = (today - due).days
#     days_overdue = int(days_overdue)
#     if days_overdue >= 0:
#         return f"True, {days_overdue}"
#     else:
#         return f"False, 0 (not yet due)"




# due_date = input("Enter the due_date (YYYY-MM-DD): ")
# print(is_overdue(due_date))

10

def aging_bucket(days_overdue):
    # due = datetime.strptime(due_date, "%Y-%m-%d").date()
    # today = date.today()
    # days_overdue = (today-due).days
    # days_overdue = int(days_overdue)
    if days_overdue <= 0:
        return "Current"
    elif days_overdue > 0 and days_overdue <= 30:
        return "1-30 days"
    elif days_overdue >30 and days_overdue <= 60:
        return "31-60 days"
    elif days_overdue >60 and days_overdue <= 90:
        return "61-90 days"
    elif days_overdue > 90:
        return "90+ days"


# due_date = input("Enter the due date (YYYY-MM-DD): ")
# print(aging_bucket(due_date))

11

# def transactions_in_month(transaction, year, month):
#     trans = []
#     for i in transaction:
#         i["date"] = datetime.strptime(i["date"], "%Y-%m-%d").date()
#         if i["date"].year == year and i["date"].month == month:
#             trans.append(i)
#     return trans



# transactions = [
#     {"date": "2025-01-15", "amount": 100},
#     {"date": "2025-02-03", "amount": 50},
#     {"date": "2025-01-28", "amount": 75},
#     {"date": "2025-03-10", "amount": 200},
# ]
# print(transactions_in_month(transactions, 2025, 1))

13
# def monthly_totals(transactions):
#     new_dic = {}
#     for i in transactions:
#         i["date"] = datetime.strptime(i["date"], "%Y-%m-%d")
#         day = i["date"].strftime("%Y-%m")
#         if day in new_dic:
#             new_dic[day] += i["amount"]
#         else:
#             new_dic[day] = i["amount"]
#     return new_dic

# transactions = [
#     {"date": "2025-01-15", "amount": 100},
#     {"date": "2025-02-03", "amount": 50},
#     {"date": "2025-01-28", "amount": 75},
#     {"date": "2025-03-10", "amount": 200},
# ]
# print(monthly_totals(transactions))


14

def invoice_aging_report(invoices):
    total = 0
    invoice_dic = {
        "Current" : [],
        "1-30 days" : [],
        "31-60 days" : [],
        "61-90 days" : [],
        "90+ days" : []
    }
    today = date.today()
    for i in invoices:
        due_date = datetime.strptime(i["due_date"], "%Y-%m-%d").date()
        days_overdue = (today - due_date).days
        bucket = aging_bucket(days_overdue)
        invoice_dic[bucket].append(i)
    print("========== AR AGING REPORT ==========")
    for bucket_name, j in invoice_dic.items():
        if not j:
            continue
        print(f"{bucket_name}:")
        subtotal = 0
        for i in j:
            subtotal += i["amount"]      
            print(f"  {i["invoice_id"]}  {i["customer"]}   ${i["amount"]}")
        print(f"  Subtotal: ${subtotal:,.2f}\n")
        total += subtotal
    print("=====================================")
    print(f"TOTAL OUTSTANDING: ${total:,.2f}")

invoices = [
    {"invoice_id": "INV-001", "customer": "Acme Corp",        "due_date": "2026-05-20", "amount": 1500.00},
    {"invoice_id": "INV-002", "customer": "Bright Media",     "due_date": "2026-04-15", "amount": 3200.00},
    {"invoice_id": "INV-003", "customer": "Coastal Supplies", "due_date": "2026-05-05", "amount": 800.00},
    {"invoice_id": "INV-004", "customer": "Delta Logistics",  "due_date": "2025-12-01", "amount": 5000.00},
    {"invoice_id": "INV-005", "customer": "Evergreen Co",     "due_date": "2026-06-30", "amount": 2000.00},
    {"invoice_id": "INV-006", "customer": "Summit Partners",  "due_date": "2026-03-20", "amount": 1200.00},
    {"invoice_id": "INV-007", "customer": "Harbor Foods",     "due_date": "2026-01-15", "amount": 4250.00},
    {"invoice_id": "INV-008", "customer": "Pinnacle Tech",    "due_date": "2026-05-29", "amount": 675.50},
]

invoice_aging_report(invoices)