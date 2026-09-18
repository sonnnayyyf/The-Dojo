# name = "muz beo phi"
# length = len(name)
# print(length)

# symbol = name[0:7]
# print(symbol)

# a part of a string is called a substring.E.g. "muz" is a substring of "muz beo phi"
# m _ u _ z _ b _ e _ o
# 0 1 2 3 4 5 6 7 8 9 10
# the start is the index 0 while the end point is the index (10 + 1)

# position = name.find("phi")
# print(position)

# name2 = "T La mAp Muz"
# name2 = name2.lower()
# print(name2*2)


# fb1 = len(input("what was your favourite food: "))
# fb2 = len(input("what did you dislike: "))
# total_length = fb1 + fb2
# print("Total length:", total_length)

'''
banh mi ngon
nhung no map
'''

# 4th data type : boolean : True or False

# checked = True
# is_sent = False
# print(checked)
# print(is_sent)

# amount_shop = int(input("in stock: "))
# booked = int(input("Bought: "))
# ok = amount_shop > booked
# print(ok)


# chocolate_amount = int(input("amount of chocolate: "))
# stock_error = chocolate_amount < 50 or chocolate_amount > 300
# print(stock_error)

# taste = input("Enter your favourite taste: ")
# taste = taste.lower()
# if taste == "vanilla":
#     print("Taste our signature ice cream")
# else: 
#     print("Try the new ice cream")

# money_amount = int(input("Enter your amount of money in the card: "))
# price = int(input("Enter the price of goods: "))
# if money_amount < price:
#     print("not enough funds")
# elif money_amount == price:
#     print("Purchased approved, just enough amount.")
# else:
#     print("Purchased approved.", "Remaining money:", money_amount - price)


# category = input("Enter your category: ")
# wish = input("Enter your wish: ")
# if category == "fruits":
#     if wish == "seedless":
#         print("Pineapples")
#     else:
#         print("Apples")
# else:
#     if wish == "seasonal":
#         print("Broccoli")
#     else:
#         print("Potatoes")

# meal = input("Enter your meal: ")
# if meal == "breakfast":
#     print("Porridge")
# else: 
#     wish = input("Enter your wish: ")
#     if wish == "hearty meal":
#         print("Pilaf")
#     else: 
#         print("Cutlet with mashed potatoes")


# unsual_assortment = input("State yes or no: ")
# if unsual_assortment == "yes":
#     product_type = input("Enter your product type: ")
#     if product_type == "drink":
#         flavour = input("Enter your flavour: ")
#         if flavour == "lemon":
#             print("Try the lime Cactus lemonade")
#         elif flavour == "apple":
#             print("Try the baked apple soda")
#         else:
#             print("Try the Naughty Blackberry drink")
#     else:
#         print("Try the juniper pie!")
# else:
#     print("Oh well! We'll be waiting for you")


# day1 = int(input("Enter the number of buyers in day 1: "))
# day2 = int(input("Enter the number of buyers in day 2: "))
# day3 = int(input("Enter the number of buyers in day 3: "))
# day4 = int(input("Enter the number of buyers in day 4: "))
# mean_difference = ((day2 - day1) + (day3 - day2) + (day4 - day3))/3
# predicted_day5 = day4 + mean_difference
# print("The predicted number of buyers in day 5:", predicted_day5)


# disability_stat = input("Disability status? (yes/no): ")
# if disability_stat == "yes":
#     income = int(input("Enter your income: "))
#     if income <= 1200:
#         print("Full welfare")
#     else:
#         print("Partial welfare")
# else:
#     age = int(input("Enter your age: "))
#     if age >= 65:
#         income = int(input("Enter your income: "))
#         if income <= 1500:
#             print("Senior welfare")
#         else:
#             print("No welfare")
#     else:
#         unemployment_stat = input("Employment status? (yes/no): ")
#         if unemployment_stat == "yes":
#             income = int(input("Enter your income: "))
#             if income <= 800:
#                 print("Temporary welfare")
#             else:
#                 print("No welfare")
#         else:
#             print("No welfare")
        


symptoms_severity = int(input("Enter the symptoms severity: "))
if symptoms_severity >= 8:
    print("Emergency")
else:
    chronic_disease = input("Chronic disease (yes/no): ")
    if chronic_disease == "yes":
        if symptoms_severity >= 5:
            print("Priority")
        else:
            print("Normal")
    else:
        age = int(input("Enter your age: "))
        if age >= 65:
            print("Priority")
        else:
            print("Normal")