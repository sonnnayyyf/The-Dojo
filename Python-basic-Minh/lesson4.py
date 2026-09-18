# response = input("Enter your response (1/2/off): ")
# while response != "off":
#     if response == "1":
#         preference = input("Enter your preference: ")
#         if preference == "sports":
#             print("Hardcore Sports Podcast")
#         else:
#             print("Kanye West's new album")
#     elif response == "2":
#         for i in range(3):
#             musical_group = input("Enter the name of the musical group: ")
#             if musical_group == "Queen":
#                 print("You win a concert ticket!")
#                 break
#     elif response != "1" or "2":
#         print("Please enter correct response")
#     response = input("Enter your response (1/2/off): ")
   


# for i in range (3):
#     first_number = int(input("Enter the first number: "))
#     second_number = int(input("Enter the second number: "))
#     if first_number == 36 and second_number == 49:
#         print("You win")
#         break
#     elif first_number == 36 and second_number != 49:
#         print("You guess the first number")
#     elif first_number != 36 and second_number == 49:
#         print("You guess the second number")
#     else:
#         print("Better lucky next time!")


# my_coins = int(input("Enter my amount of coin: "))
# response = input("Enter your response ( 1 (buy) / 2 (watch ad +5) / 3 (Current balance) / 4 (off) ): ")
# while response != "4":
#     if response == "1":
#         goods = input("Enter your product (sticker (50) /T-shirt (100)): ")
#         if goods == "sticker":
#             my_coins = my_coins - 50
#             if my_coins < 0:
#                 print("Insufficient funds")
#             else:
#                 print("my coins", my_coins)
#         elif goods == "T-shirt":
#             my_coins = my_coins - 100
#             if my_coins < 0:
#                 print("Insufficient funds")
#             else:
#                 print("my coins:", my_coins)
#     if response == "2":
#         print("my coins:", my_coins + 5)
#         my_coins = my_coins + 5
#     if response == "3":
#         print("my coins", my_coins)
#     response = input("Enter your response ( 1 (buy) / 2 (watch ad +5) / 3 (Current balance) / 4 (off) ): ")
        

# import random

# length = int(input("Enter the password length: "))
# password = " "
# for i in range(length):
#     password = password + str(random.randint(0,9))
# print(password)


# number = int(input("Enter the number you want: "))
# while number >= 1:
#     if number %5 == 0 and number %3 == 0:
#         print("Skipjump")
#     elif number %5 == 0:
#         print("Jump")
#     elif number %3 == 0:
#         print("Skip")
#     else:
#         print(number)
#     number -= 1


# height = int(input("Enter the number you want: "))
# row = 0

# while row < height:
#     col = 0
#     while col < height:
#         if row == 0 or col == 0 or row == height - 1 or col == height - 1:
#             print("*", end="")
#         else:
#             print(" ", end="")
#         col += 1
#     print()    
#     row += 1
    

height = int(input("Enter your height: "))
i = 0
while i < height:
    print("*" * (i - height + 5) + " " * (4 - i - 1) )
    i += 1
i = height - 2
while i >= 0:
    print("*" * (i + 1) + " " * (height - i - 1) )
    i -= 1