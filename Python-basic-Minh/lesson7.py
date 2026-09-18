# text = "Revenue" 

# R e v e n u e
# 0 1 2 3 4 5 6

# print(text[0])
# print(text[1])
# print(text[-1])

# length and slicing

# print(len(text))
# print(text[0:3])
# print(text[3:])
# print(text[:3])


# date = "2024-06-01"

# print("year:",date[0:4])
# print("month:",date[5:7])
# print("day:",date[8:10])

# email = "client@gmail.com"
# at_pos = email.find("@")
# print("Domain:",email[at_pos + 1:])

# code = "INV2026157"
# print("last 3 digits:", code[-3:])


# account = "ReVeNue"
# text = "  EXpeNse  "

# # account = account.lower()
# # print(account)

# text = text.strip()
# print(text)

# text = text.lower().strip()
# print(text)

# text.find("p")
# service ="Service-fee"
# service = service.replace("-", " ")
# print(service)

# number = "123a"
# if number.isdigit():
#     print("The string contains only digits.")
# else:
#     print("The string contains non-digit characters.")



#  3
# number = "1,000,000"
# number = number.replace(",","")
# print(int(number))

# answer = input("Enter do you eat banh mi this morning (yes/no): ")
# answer = answer.lower().strip()
# if answer == "yes":
#     print("Delicious")
# elif answer == "no":
#     print("What did you eat?")
# 4
# description = input("Enter your description: ")
# description = description.lower().strip()
# if "vat" in description:
#     print("There is VAT in the description")
# else:
#     print("There isn't VAT in the description")
# 5
# number = input("Enter your number: ")
# number = number.strip().replace(",","")
# if number.isdigit():
#     print(float(number))
# else:
#    print("Invalid")
6
# text ="Revenue"
# # text[start : end : step]
# print(text[::3])
# print(text[::-1])
# print(text[::-2])
# # 7
# text = "TRANSACTION"
# print(text[1::2])

# text = "INV202645"
# print("result:", text[0:3] + text[3:][::-1])

# text = "ABCDEFGHIJKLMN"
# print(text[::3])

# text = "A1B2C3D4E5"
# print(text[::2])

# text = "ABCDEFGH"
# length = len(text)//2
# print(text[length:] + text[:length])

# text = "ABCDE"
# length = len(text)//2
# print(text[:length]+text[length + 1:])

# text = "ABCDEFGH"
# print(text[::2]+ text[1::2])

# card = "1234-5678-9012-3456"
# print("****-****-****-" + card[-4:])

text = "ABCDEFGHI"
print(text[::4] + text[1::2]+ text[2::4])