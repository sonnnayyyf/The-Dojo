# student = {
#     "name": "John",
#     "score": 85,
#     "age": 17,
#     "food": "banhmi"
# }

# dictionary = {
#     key: value,
#     key: value
# }

# print(student["name"])   print key to get value
# print(student["age"])
# student["age"] = 16       modify: change into new value      
# print(student["age"])     
# student["ID"] = 9709      Add new key/pair
# print(student)
# del student["age"]        Delete 
# print(student)

student = {
    "name": "John",
    "score": 85,
    "age": 17,
    "food": "banhmi"
}
for key in student:
    print(key)                  #print key


# for key in student:
#     print(student[key])        # print values

# for key in student:
#     print(key + ":" , student[key])

# print(len(student))

# if "garden" in student:
#     print("yes")
# else:
#     print("no")

# print(student.get("gar"))
# 1
# student = {
#     "name": "Tom",
#     "age": 14,
#     "country": "USA"
# }
# print(student["name"])

# student["age"] = 15
# print(student["age"])

# student["grade"] = "A"
# print(student["grade"])

# del student["country"]
# print(student)

# for key in student:
#     print(key+":",student[key])

# 2

# prices ={
#     "apples": 2,
#     "banana": 1,
#     "orange": 3
# }

# for key in prices:
#     print(key, "cost", prices[key])

# print(prices["apples"] + prices["banana"] + prices["orange"])


# sum = 0
# for key in prices:
#     sum += prices[key] 
# print(sum)

# if "apples" in prices:
#     print("yes")
# else:
#     print("no")

# scores = {
#     "Alice": 85,
#     "Bob": 90,
#     "Charlie": 78
# }

# for key in scores:
#     print(key,":",scores[key])

# scores["Jess"] = 99
# print(scores["Jess"])

# scores["Alice"] = 80
# print(scores["Alice"])

# initial = 0
# for key in scores:
#     if scores[key] > initial:
#         initial = scores[key]
# print(initial)

# i = "I like python and I like coding"
# words = i.split()
# print(words)
# new_dic = {}

# for j in words:
#     if j in new_dic:
#         new_dic[j] += 1
#     else:
#         new_dic[j] = 1
# print(new_dic)

# word = "banana"
# new_dic = {}
# for i in word:
#     if i in new_dic:
#         new_dic[i] += 1
#     else:
#         new_dic[i] = 1
# print(new_dic)

# items = ["apple", "banana", "apple", "orange", "banana", "apple"]

# prices = {
#     "apple" : 2,
#     "banana": 1,
#     "orange": 3
# }

# no_items = {}
# for i in items:
#     if i in no_items:
#         no_items[i] += 1
#     else:
#         no_items[i] = 1
# print(no_items)

# price = 0
# for a in no_items:
#     for j in prices:
#         if a == j:
#             price += no_items[a] * prices[j]
# print(price)


words = ["cat", "dog", "tiger","lion","bird","elephant"]
new_dic = {}
for i in words:
    length = len(i)
    if length not in new_dic:
        new_dic[length] = []
    new_dic[length].append(i)
print(new_dic)

names = ["Alice", "Adam", "Bob", "Bella", "Charlie"]
new_dic = {}
for i in names:
    first_let = i[0]
    if first_let in new_dic:
        new_dic[first_let] += 1
    else:
        new_dic[first_let] = 1
print(new_dic)