# 1
# nums = [4, -2, 7, -5, 9]
# for i in range(len(nums)):
#     if nums[i] < 0:
#         nums[i] = 0

# print(nums)

# 2
# words = ["apple", "hi", "banana", "cat", "elephant"]
# for i in words:
#     if len(i) >= 5:
#         print(i)

# 3
# scores = [45, 67, 89, 32, 74, 58]
# pass_number = 0
# fail_number = 0
# for i in range(len(scores)):
#     if scores[i] >= 50:
#         pass_number += 1
#     else:
#         fail_number += 1
# print("Number of students passed", pass_number)
# print("Number of students failed", fail_number)

# 4
# scores = [45, 67, 89, 32, 74, 58]
# reversed_scores = []
# i = len(scores) - 1
# while i >= 0:
#     reversed_scores.append(scores[i])
#     i -= 1
# print(reversed_scores)


# 5
# max = 0
# second_max = 0
# scores = [45, 67, 89, 32, 74, 58]
# for i in scores:
#     if i > max:
#         second_max = max
#         max = i
#     elif i > second_max and i != max:
#         second_max = i
# print(second_max)



# 6


# nums = [1, 2, 3, 2, 4, 1, 5]
# new_nums = []

# for i in nums:
#     if i not in new_nums:
#         new_nums.append(i)
# print(new_nums)


# nums.sort()
# new_nums = []
# for i in range(len(nums)):
#     if nums[i] != nums[i - 1]:
#         new_nums.append(nums[i])
# print(new_nums)

# nums.sort()
# i = len(nums) - 1
# while i >= 0:
#     if nums[i] == nums[i - 1]:
#         del(nums[i])
#     i -= 1
# print(nums)


# 7

# nums = [3, 5, 5, 2, 8, 8, 1]
# adj_counts = 0
# for i in range(len(nums) - 1):
#     if nums[i] == nums[i + 1]:
#         adj_counts = adj_counts + 1
#     i += 1
# print(adj_counts)


# # 8
# stars = [1, 3, 5, 7, 5, 3, 1]
# height = len(stars) // 2 + 1
# i = 0
# while i < height:
#     print( " " * (height - i - 1),  "*" * (height + 2*i - 3), " " * (height - i - 1))
#     i += 1
# i = height - 2
# while i >= 0:
#     print(" " * (height - i - 1), "*" * (height + 2*i - 3), " " * (height - i - 1))
#     i -= 1

# 9
# max_width = max(stars)

# for i in stars:
#     spaces = (max_width - i) // 2

#     print(" " * spaces + "*" * i)

# 10
# stars = [5, 5, 5, 5, 5, 5, 5]
# for i in range(len(stars)):
#     if i == 0 or i == len(stars) -1:
#         print("*" * stars[i])
#     else:
#         print("*" + " " * (stars[i] - 2) + "*")



11
pattern = [0, 1, 0, 1, 0]
for i in pattern:
    if i == 0:
        print(" ", end="")
    elif i == 1:
        print("*", end="")
print()
for i in pattern:
    if i == 0:
        print("*", end='')
    elif i == 1:
        print(" ", end="")
print()
for i in pattern:
    if i == 0:
        print(" ", end="")
    elif i == 1:
        print("*", end="")