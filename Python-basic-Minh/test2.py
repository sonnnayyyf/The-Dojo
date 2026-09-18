# 1
# transactions = ["100", "200.5", " ", "abc", "50"]
# numbers = []

# def money(transactions):
#     for i in transactions:
#         if i == " ":
#             continue
#         elif i.isalpha() == True:
#             continue
#         else:
#             numbers.append(i)

#     print(numbers)
#     initial = 0
#     for j in numbers:
#         initial += float(j)
#     print("Total: ", initial )

# money(transactions)


# 2
# categories = ["food", "transport", "food"]
# amounts = [50, 20, 30]

# new_dic = {}
# for i in range(len(categories)):
#     cat = categories[i]
#     amt = amounts[i]
#     if cat in new_dic:
#         new_dic[cat] += amt
#     else:
#         new_dic[cat] = amt
# print(new_dic)


# 3
# transactions = [100, -50, 200, -30, 150]
# positive = []
# negative = []

# for i in transactions:
#     if i > 0:
#         positive.append(i)
#     elif i < 0:
#         negative.append(i)
# print(positive)
# print(negative)

# 4.
# data = ["+100", "-50", "+200", "-30"]
# income = 0
# expenses = 0
# for i in data:
#     if i[0] == "+":
#         income += int(i)
#     if i[0] == "-":
#         expenses += int(i)
# print("income:", income)
# print("expenses:", expenses)


# 5
# def calculate_final_amount(amount):
#     if amount > 200:
#         amount -= amount * 0.10
#         amount += amount * 0.05
#         print(amount)
#     else:
#         print("No discount")



# amount = int(input("Enter the amount of money: "))
# calculate_final_amount(amount)


# 6.
# data = [
#     {"type": "income", "amount": "100"},
#     {"type": "expense", "amount": "200"},
#     {"type": "income", "amount": "300"},
#     {"type": "expense", "amount": "150"}
# ]

# income = 0
# expense = 0

# for i in data:
#     if i["type"] == "income":
#         income += int(i["amount"])
#     elif i["type"] == "expense":
#         expense += int(i["amount"])
# print("income: ",income)
# print("expense: ",expense)
# print("net",income - expense)


# 7
# transactions = ["100", "200", "abc", "300", "xyz"]
# invalid = []
# for i in transactions:
#     if i.isdigit() == True:
#         continue
#     else:
#         invalid.append(i)
# print(invalid[0])


# 8
# data = "100, 200.5, abc, , 50, xyz, 75"
# data = data.split(', ')
# number = []
# print(data)
# for i in data:
#     if i.isalpha() == True or i == "":
#         continue
#     else:
#         number.append(float(i))
# print(number)
