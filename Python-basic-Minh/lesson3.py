
# feedback = input("Enter the customer's feedback: ")
# while feedback != "off":
#     print("Thank you for your feedback")
#     feedback = input("Enter the customer's feedback: ")
# print("Done")


# while input("Enter the customer's feedback: ") != "off":
#     print("Thank you for your feedback")
# print("Done")

# total_price = 0
# product_price = float(input("Enter the product price (0 to finish): "))
# while product_price != 0:
#     total_price += product_price
#     product_price = float(input("Enter the product price (0 to finish): "))

# print("Without discount:", total_price)
# print("Total price of the products after discount:", total_price * 0.90)

# total_price = 0
# price = float(input("Enter the price of the product: "))
# while price != 0:
#     print("To pay:", price*0.80)
#     total_price += price
#     price = float(input("Enter the price of the product: "))
# print("Total price: ", total_price)
# print("Total price with discount:", total_price * 0.80)


# attempt = 1
# promo_code = input("Enter the promocode: ")
# while promo_code != "new year":
#     print("Error")
#     attempt += 1
#     promo_code = input("Enter the promocode: ")
# print("The code is accepted on attempt:", attempt)

# total_price = 0
# amount = 0
# price = float(input("Enter the price of the product: "))
# while price != 0:
#     total_price += price
#     amount += 1
#     price = float(input("Enter the price of the product: "))
# if amount % 2 == 0:
#     print("Cutting prices in half promotion activated")
#     print("To be paid:", total_price * 0.50)
# else:
#     print("No promotion")
#     print("Total price remains constant:", total_price)


# total_purchases = float(input("Enter the total price of all the products: "))
# while total_purchases %2 == 0:
#     total_purchases / 2
# print("Total price has to be paid:", total_purchases)

# height = int(input("Enter the height of the christmas tree: "))
# i = 0
# while i < height:
#     print(" " * (height - i - 1) + "*" * (2 * i +1))
#     i += 1



# height = int(input("Enter the height of the pyramid: "))
# i = 0
# while i < height:
#     print(" " * i + "*" * (height - i))
#     i += 1


# height = int(input("Enter the height of the pyramids: "))
# i = 0
# while i < height:
#     print(" " * (height - i - 1) + "*" * (2*i+1))
#     i += 1

# i = height - 2
# while i >= 0:
#     print(" "* (height - i - 1) + "*" *(i * 2 +1))
#     i -= 1



# for i in range(1, 3):
#     print(i)

# forbidden_symbols = "=?*^@_,;;#%$&()"
# login = input("Enter your login: ")
# for i in login:
#     if i in forbidden_symbols:
#         print("forbidden symbols:", i)

# participants = int(input("Enter the number of participants: "))
# for i in range(0, participants):
#     name = input("Enter the name of a participant: ")
#     print("Welcome", name)
# print("Group chat created")



# for i in range(2):
#     login = input("Enter the login: ")
#     password = input("Enter the password: ")
#     if login == "admin" and password == "wichmap123":
#         print("Authorisation at attempt", i + 1)
#         break



game_start = input("Enter game - 'Guess the Number' game, off - exit:\n")
while game_start != "off":
    if game_start == "game":
        for i in range(3):
            number = int(input("Enter the number: "))
            if number == 5:
                print("You have won a concert ticket!")
                break
    game_start = input("Enter game - 'Guess the Number' game, off - exit:\n")


