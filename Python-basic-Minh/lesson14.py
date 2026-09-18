from decimal import Decimal, ROUND_HALF_UP

# print(Decimal('0.1') + Decimal('0.2'))
# print(float('0.1') + float('0.2'))
# result = Decimal('2.667').quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
# print(result)

1. 

# def float_is_broken():
#     if (0.1 + 0.2) == 3:
#         return True
#     else:
#         return False
# def decimal_is_correct():
#     if Decimal('0.1') + Decimal('0.2') == Decimal('0.3'):
#         return True
#     else:
#         return False
    
# print(float_is_broken())
# print(decimal_is_correct())
2
# def to_money(value_str):
#     decimal_no = Decimal(value_str).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
#     return decimal_no

# print(to_money(5.1))

3
# def sum_prices(price_strings):
#     total = Decimal('0')
#     for i in price_strings:
#         total += Decimal(i)
#     return total

# print(sum_prices(["19.99", "5.50", "3.25"]))

4

# def add_tax(amount_str, tax_rate_percent):
#     amount = Decimal(amount_str)
#     total_amount = amount + amount * Decimal(str(tax_rate_percent)) / 100
#     total = Decimal(total_amount).quantize(Decimal('0.01'), rounding= ROUND_HALF_UP)
#     return total

# print(add_tax("100.00", 8.5))

5
# def apply_discount(amount_str, discount_percent):
#     amount = Decimal(amount_str)
#     total_amount = amount - amount * Decimal(str(discount_percent)) / 100
#     total = Decimal(total_amount).quantize(Decimal('0.01'), rounding= ROUND_HALF_UP)
#     return total

# print(apply_discount("100.00", 20))

6
# def split_bill(total_str, num_people):
#     shared_bill = []
#     total = int(Decimal(total_str)) * 100
#     split_amount = total // num_people
#     remainder = total % num_people
#     for i in range(num_people):
#         if i < remainder:
#             cents = split_amount + 1
#         else:
#             cents = split_amount
#         dollars = Decimal((cents)/100).quantize(Decimal('0.01'), rounding= ROUND_HALF_UP)
#         shared_bill.append(dollars)
#     return shared_bill

# print(split_bill("20.00", 3))

7.
# def format_currency(amount_str):
#     amount = Decimal(amount_str).quantize(Decimal('0.01'), rounding= ROUND_HALF_UP)
#     return f"${amount:,.2f}"

# print(format_currency('1000000'))

8
# def invoice_total(line_items):
#     total_price = 0
#     for i in line_items:
#         price = Decimal(i["price"])
#         total = price * int(i["quantity"])
#         total_price += total
#     return total_price

# items = [
#     {"price": "19.99", "quantity": "3"},
#     {"price": "5.50",  "quantity": "2"},
#     {"price": "100.00","quantity": "1"},
# ]
# print(invoice_total(items))

9
# def reconcile(amounts_str, expected_total_str):
#     list_amounts = []
#     for i in amounts_str:
#         amount = Decimal(i).quantize(Decimal('0.01'), rounding = ROUND_HALF_UP)
#         list_amounts.append(amount)
#     total_amount = 0
#     expected_total = Decimal(expected_total_str).quantize(Decimal('0.01'), rounding = ROUND_HALF_UP)
    
    
#     for j in list_amounts:
#         total_amount += j
#     if total_amount == expected_total:
#         return True
#     else:
#         return False
    
# print(reconcile(["3.33", "3.33", "3.33"], "10.00"))

10
# def running_total_report(amounts_str):
#     total_list = []
#     balance = 0
#     for i in amounts_str:
#         amount = Decimal(i).quantize(Decimal('0.01'), rounding = ROUND_HALF_UP)
#         balance += amount
#         total_list.append((i,balance))
#     return total_list

# print(running_total_report(["100.00", "-30.50", "50.25"]))


11

def generate_invoice(line_items, tax_rate_percent, tip_percent):
    print("================ INVOICE ================")
    subtotal = 0
    for i in line_items:
        price = Decimal(i["price"]).quantize(Decimal('0.01'), rounding = ROUND_HALF_UP)
        total_per_item = price * int(i["quantity"])
        subtotal += total_per_item
        print(f"{i["description"]:12s} {int(i["quantity"])} x ${price:>8,.2f}  = ${total_per_item:>10,.2f}")
    tax = Decimal(tax_rate_percent).quantize(Decimal('0.01'), rounding = ROUND_HALF_UP)
    tax_amount = (subtotal * tax)/100
    tip = Decimal(tip_percent).quantize(Decimal('0.01'), rounding = ROUND_HALF_UP)
    tip_amount = (subtotal * tip)/100
    total = subtotal + tax_amount + tip_amount
    print("-----------------------------------------")
    print(f"Subtotal:                          ${subtotal}")
    print(f"Tax ({tax_rate_percent}%):                         ${tax_amount}")
    print(f"Tip ({tip_percent}%):                         ${tip_amount}")
    print("-----------------------------------------")
    print(f"TOTAL:                             ${total}")
    print("=========================================")




# Invoice A — Office supplies (clean, simple — good first test)
invoice_a = [
    {"description": "Printer Paper", "price": "8.50",  "quantity": "5"},
    {"description": "Ink Cartridge", "price": "34.99", "quantity": "2"},
    {"description": "Stapler",       "price": "12.00", "quantity": "3"},
]
# generate_invoice(invoice_a, 7)

# Invoice B — Freelance services (large amounts, tests thousands separator)
invoice_b = [
    {"description": "Web Design",    "price": "85.00",  "quantity": "10"},
    {"description": "Logo Design",   "price": "250.00", "quantity": "1"},
    {"description": "Hosting Setup", "price": "45.50",  "quantity": "1"},
]
generate_invoice(invoice_b, 8.5, 5)

# Invoice C — Cafe / retail (tax lands on a tricky decimal — tests rounding)
invoice_c = [
    {"description": "Coffee Beans",  "price": "13.99", "quantity": "3"},
    {"description": "Mug",           "price": "8.25",  "quantity": "4"},
    {"description": "Gift Card",     "price": "25.00", "quantity": "2"},
]
# generate_invoice(invoice_c, 6.25)

# Invoice D — Bigger mixed invoice (more lines, larger quantities)
invoice_d = [
    {"description": "Consulting",    "price": "120.00", "quantity": "8"},
    {"description": "Travel",        "price": "47.33",  "quantity": "1"},
    {"description": "Software Lic",  "price": "29.99",  "quantity": "5"},
    {"description": "Support Plan",  "price": "15.00",  "quantity": "12"},
]
# generate_invoice(invoice_d, 9)