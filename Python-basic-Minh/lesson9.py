# def sum_of_2no(a,b):
#     result = a + b
#     print(result)
# sum_of_2no(2,9)

# print("Label printing machine")
# no_of_stu = input("Enter the number of student: ")
# def student():
#     print("THE SUCCESS CENTER")
#     print("Name: ___")
#     print("Course: ___")
#     print("Group: ___")
# for i in range(int(no_of_stu)):
#     student()
# print("Done!Take your labels")





# def student(name):
#     print("THE SUCCESS CENTER")
#     print("Name:", name)
#     print("Course: English")


# print("Test worksheets printing")
# no_of_stu = int(input("Enter a number of student: "))
# for i in range(no_of_stu):
#     name = input("Enter a student name: ")
#     student(name)


# def student(name):
#     i = 0
#     n = 0
#     grade = input("Enter the student's grade: (off-end input)")
#     while grade != "off":
#         i += int(grade)
#         n += 1
#         grade = input("Enter the student's grade: (off-end input)")
#     print(name,"-","the average is","-", i/n)
        
# number = int(input("Enter the number of students: "))
# for i in range(number):
#     name = input("Enter student's name: ")
#     student(name)


# def discount(points):
#     if points <= 49 and points >= 0:
#         print("10% discount")
#     elif points >49 and points <=99:
#         print("15% discount")
#     elif points > 99:
#         print("20% discount")

# points = int(input("Enter the points: "))
# discount(points)


# def student(name):
#     i = 0
#     n = 0
#     grade = input("Enter the student's grade: (off-end input)")
#     while grade != "off":
#         i += int(grade)
#         n += 1
#         grade = input("Enter the student's grade: (off-end input)")
#     average = i/n
#     return average

# name = input("Enter student's name: ")
# a = student(name)
# print(a)

# def participants(name, points):
#     if points >= 50 and points <= 99:
#         print(name,"- grade III certificates")
#     elif points >=100 and points <=199:
#         print(name,"- grade II certificates")
#     elif points >=200:
#         print(name,"- grade I certificates")
#     else:
#         print(name,"-appreciation letters")

# name = input("Enter your name: ")
# points = int(input("Enter your points: "))
# participants(name,points)

# def participants(points):

#     if points >= 50 and points <= 99:
#         award = "grade III cert"
#     elif points >=100 and points <=199:
#         award = "grade II cert"
#     elif points >=200:
#         award = "grade I cert"
#     else:
#         award = "appreciation letter"
#     return award

# name = input("Enter your name: ")
# points = int(input("Enter your points: "))
# result = participants(name, points)
# print(name, "-", result)

# def is_ok(score):
#     if score == 100:
#         return True
#     else:
#         return False
    
# score = int(input("Enter the score: "))
# a = is_ok(score)
# print("Merch available:", a)

# def student(grade):
#     if grade > 50:
#         return True
#     else:
#         return False

# student_number = int(input("Enter the number of students: "))
# for i in range(student_number):
#     grade = int(input("Enter the grade: "))
#     print("Admitted",student(grade))

# def average_grade():
#     total = 0
#     frequency = 0
#     grade = input("Enter the grade: ")
#     while grade != "off":
#         total += int(grade)
#         frequency += 1
#         grade = input("Enter the grade: ")
#     average = total/frequency
#     return average
    
# def discount():
#     avg = average_grade()
#     if avg >= 4.7:
#         return 15
#     else:
#         return 0

# print("Season Pass discount (%):", discount())

# def BMI(weight, height):
#     BMI = weight / (height * height)
#     return BMI

# def state():
#     if BMI(weight, height) <= 18.5:
#         return "Underweight"
#     if BMI(weight, height) >= 18.5 and BMI <= 25:
#         return "Normal weight"
#     if BMI(weight, height) > 25:
#         return "Overweight"

# weight = float(input("Enter your weight (in kg): "))
# height = float(input("Enter your height (in m): "))
# print("The BMI:",BMI(weight, height), "-", state())

def total_score(amount):
    
    total_score = 0
    for i in range(amount):
        grade = int(input("Enter the grade: "))
        total_score += grade
    print("Total score:", total_score)
    return total_score

def award(subjects_number):
    score = total_score(subjects_number)
    if score > 80:
        return "award with a diploma"
    elif score > 50:
        return "Award with a certificate of commendation"
    else:
        return "Issue a certificate of partcipation"
    
name = input("Enter the name of the participant (off - finish): ")
while name != "off":
    subjects_number = int(input("Enter the number of subjects studied: "))
    print(award(subjects_number))
    name = input("Enter the name of the participant (off - finish): ")
