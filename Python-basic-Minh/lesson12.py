1
# def count_vowels(text):
#     vowels = "aeiou"
#     text = text.lower()
#     no_vowels = 0
#     for i in text:
#         if i in vowels:
#             no_vowels += 1
#     print(no_vowels)
# text = input("Enter a word: ")
# count_vowels(text)


2

# def is_strong_password(password):
#     has_upper = False
#     has_lower = False
#     has_digit = False
#     if len(password) >= 8:
#         for i in password:
#             if i.isupper():
#                 has_upper = True
#             elif i.islower():
#                 has_lower = True
#             elif i.isdigit():
#                 has_digit = True
#         return has_upper and has_lower and has_digit
#     else:
#         return False
    
# print(is_strong_password("Hello123"))

3

# def fizzbuzz(n):
#     list = []
#     for i in range(1,n+1):
#         if i%3 == 0 and i%5 == 0:
#             list.append("FizzBuzz")
#         elif i%3 == 0:
#             list.append("Fizz")
#         elif i%5 == 0:
#             list.append("Buzz")
#         else:
#             list.append(i)
#     return list

# print(fizzbuzz(15))
        
4

# def word_frequency(sentence):
#     sentence = sentence.split()
#     new_dic = {}
#     for i in sentence:
#         if i in new_dic:
#             new_dic[i] += 1
#         else:
#             new_dic[i] = 1
#     return new_dic

# print(word_frequency("Python is great and Python is fun"))
    

5
# def average_above_zero(numbers):
#     count = 0
#     total = 0
#     for i in numbers:
#         if i > 0:
#             count += 1
#             total += i
#     if count == 0:
#         return 0
#     average = total/count
#     return average

# print(average_above_zero([-1, -2, -3]))

6.
# def menu_choice(options):
#     print("Displays: ")
#     for i in range(len(options)):
#         print(str(i+1) + ". " + options[i]) 
#     while True:
#         option = input("Enter your option: ")
#         if not option.isdigit():
#             print("Error, please enter a digit")
#             continue
#         if int(option) > len(options) or int(option) < 1:
#             print("Error, please enter a digit that is within 1 and", len(options))
#             continue
#         return options[int(option) - 1]
    
# print(menu_choice(["Pizza", "Burger", "Salad"]))


7

# def running_balance(transactions):
#     balance = 0
#     balance_list = []
#     for i in transactions:
#         balance += i
#         balance_list.append(balance)
#     return balance_list


# print(running_balance([100, -30, 50, -20]))

8

# def expense_summary(expenses):
#     new_dic = {}
#     for i in expenses:
#         cate = i["category"]
#         amount = i["amount"]
#         if cate in new_dic:
#             new_dic[cate] += amount
#         else:
#             new_dic[cate] = amount
#     return new_dic
# print(expense_summary([
#     {"category": "Food", "amount": 12.50},
#     {"category": "Transport", "amount": 8.00},
#     {"category": "Food", "amount": 7.25},
#     {"category": "Transport", "amount": 15.00},
#     {"category": "Food", "amount": 22.00},
# ]))


# Working with CSV files

import csv

with open('transactions.csv') as f:
    reader = csv.DictReader(f)
    # total_expenses = 0
    # for i in reader:
    #     if i["category"] != "Income":
    #         total_expenses += float(i["amount"])
    # print(total_expenses)

    # new_dic = {}
    # for i in reader:
    #     category = i["category"]
    #     total_amount = float(i["amount"])
    #     if category in new_dic:
    #         new_dic[category] += total_amount
    #     else:
    #         new_dic[category] = total_amount
    # for j in new_dic:
    #     print(j + ":", new_dic[j])

    # for i in reader:
    #     if i["date"].startswith("2025-01"):
    #         print(i)

    new_dic = {}
    for i in reader:
        category = i["category"]
        total_amount = float(i["amount"])
        if category in new_dic:
            new_dic[category] += total_amount
        else:
            new_dic[category] = total_amount
    for j in new_dic:
        print(j + ":", new_dic[j])

with open('summary.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['category', 'total'])
    writer.writeheader()
    for cat, total in new_dic.items():
        writer.writerow({'category': cat, 'total': total})
    
print("\nWrote summary.csv")