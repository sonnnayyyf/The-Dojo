# 1
# number = int(input("Enter an integer: "))
# i = 1
# while i <= number:
#     if i%2 == 0 and i%3 == 0:
#         i += 1
#         continue
#     elif i%5 == 0:
#         print("Five")
#     else:
#         print(i)
#     i += 1

#2
# counter_pos = 0
# counter_neg = 0
# negative = False
# integer = float(input("Input: "))
# if integer < 0:
#     counter_neg = counter_neg + 1
# else:
#     counter_pos = counter_pos + 1
# while integer != 0:
#     integer = float(input("Input: "))
#     if integer <0:
#         negative = True
#         counter_neg += 1
#         if negative:
#             integer = float(input("Input: "))
#             if integer > 0:
#                 counter_pos += 1
#             else:
#                 break
#     else:
#         negative = False
#         counter_pos += 1
# print("output: ")
# print("Total:", counter_neg + counter_pos)
# print("Positive:", counter_pos)
# print("Negative:", counter_neg)

    
counter_pos = 0
counter_neg = 0
negative = False
while True:
    integer = float(input("Input: "))
    if integer <0:
        if negative:
            break
        negative = True
        counter_neg += 1
        
    else:
        negative = False
        counter_pos += 1
print("output: ")
print("Total:", counter_neg + counter_pos)
print("Positive:", counter_pos)
print("Negative:", counter_neg)





# 3
# integer = int(input("Enter an integer: "))
# i = 1

# while i <= integer:
#     if i == 1:
#         print( str(i) + "-> Neither")
#     else:
#         prime = True
#         for j in range(2, i):
#             if i%j == 0:
#                 prime = False
#                 break
#         if prime:
#             print(i, "-> Prime")
#         else:
#             print(i, "-> Composite")
#     i += 1

#4

# integer = int(input("Enter an integer: "))
# for i in range(1, integer + 1):
#     for j in range(1, integer + 1):
#         print(i*j, end=" ")
#     print()

        


#5

# height = int(input("Enter the height: "))
# for row in range(height):
#     for col in range(height):
#         if row == col or row == height - col - 1:
#             print("*", end="")
#         else:
#             print(" ", end="")
#     print()

# 6

# height = int(input("Enter a height: "))
# for row in range(height):
#     for col in range(height):
#         if row == col or row == height - col - 1 or row == 0 or row == height - 1:
#             print("*", end="")
#         else:
#             print(" ", end="")
#     print()