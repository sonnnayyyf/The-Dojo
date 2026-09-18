# with open(
#     "poem.txt", "r", encoding = "utf-8"
# ) as file:
    # data = file.read(2)
    # print(data)
    # data = file.read()
    # print(data)

# with open(
#     "poem.txt", "w", encoding = "utf-8"
# ) as file:
#     file.write("information")

# with open(
#     "poem.txt", "a", encoding = "utf-8"
# ) as file:
#     file.write("\nabcd")

# with open(
#     "poem.txt", "r", encoding = "utf-8"
# ) as file:
#     data = file.read()    
#     print(data)



# author = input("Enter the name of the author: ")
# with open(
#     "quotes.txt", "a", encoding = "utf-8"
# )as file:
#     file.write("\n\n(" + author + ")")
# with open(
#     "quotes.txt", "r", encoding ="utf-8"
# ) as file:
#     data = file.read()
#     print(data)


# file_name = input("Enter the file name: ")
# while True:
#     if file_name != "quotes.txt":
#         print("That file does not exist! Re_enter file name")
#         file_name = input("Enter the file name: ")
#     else:
#         with open(
#             "quotes.txt", "r", encoding = "utf-8"
#         ) as file:
#             data = file.read()
#             print(data)
#         add_quote = input("Enter whether you want to add another quote: ")
#         while add_quote != "no":
#             if add_quote == "yes":
#                 another_quote = input("Enter your new quote: ")
#                 another_author = input("Enter your new author: ")
#                 with open(
#                     "quotes.txt", "a", encoding = "utf-8"
#                 ) as file:
#                     file.write("\n\n" + another_quote)
#                     file.write("\n\n(" + another_author + ")")
#                     print("Added sucessfully")
#                     add_quote = input("Enter whether you want to add another quote: ")
#             with open(
#                 "quotes.txt", "r", encoding = "utf-8"
#             ) as file:
#                 data = file.read()
#                 print(data)
#             break
#         break

# with open(
#     "poem.txt", "r"
# ) as file:
#     for line in file:
#         print(line)

# with open(
#     "score.txt", "r"
# ) as file:
#     for line in file:
#         data = line.split(" ")
#         if "5" in data[2]:
#             print(data)
#             print(data[0] , data[1])

total_expenses = 0
new_dic = {}
with open(
    "transactions.txt", "r"
) as file:
    trans_date = input("Enter the month that the transactions occur (YYYY-MM): ")
    for line in file:
        data = line.split(",")
        if data[0][:7] == trans_date:
            print(data[0] , data[1], data[2])
            total_expenses = int(data[2]) + total_expenses
            if data[1] not in new_dic:
                new_dic[data[1]] = 0
                new_dic[data[1]] += int(data[2])

    print("Summary for:", trans_date)
    print("Total expenses:", total_expenses)
    print("Category breakdown: ")
    for data[1], data[2] in new_dic.items():
        print(f"{data[1]}: {data[2]}")
