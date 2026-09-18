transaction = [
    {
        "type": "revenue",
        "category": "food",
        "amount": 123,
        "date": "2026-12-31"
    },
    {
        "type": "expense",
        "category": "wage",
        "amount": 100,
        "date": "2026-12-04"
    },
    {
        "type": "revenue",
        "category": "food",
        "amount": 100,
        "date": "2026-10-31"
    }
]

def show_menu():
    print("Main menu")
    print("1. Add transaction")
    print("2. View all transactions")
    print("3. View balance")
    print("4. View summary report")
    print("5. View summary report by month")
    print("6. Delete transaction")
    print("7. Search by category")
    print("8. Exit")

def add_trans():
    trans_type = input("Enter the transaction type: ")
    category = input("Enter the category of the transaction: ")
    amount = float(input("Enter the amount of the transaction: "))
    date = input("Enter the date (YYYY-MM-DD): ")
    transaction_dic = {
        "type": trans_type,
        "category": category,
        "amount": amount,
        "date": date
    }
    transaction.append(transaction_dic)

def view_trans():
    if len(transaction) == 0:
        print("No transaction yet")
    index = 1
    for j in transaction:
        print(str(index)+".", j["type"], "|",j["category"], "|",j["amount"],"|", j["date"])
        index += 1



def cal_balance():
    expense = 0
    revenue = 0
    for i in transaction:
        if i["type"] == "expense":
            expense += i["amount"]
        elif i["type"] == "revenue":
            revenue += i["amount"]
    total = revenue - expense
    print("Current balance: ", total)

def sum_report():
    expense = 0
    revenue = 0
    for i in transaction:
        if i["type"] == "expense":
            expense += i["amount"]
        elif i["type"] == "revenue":
            revenue += i["amount"]
    print("----------Balance report----------")
    print("current revenue:", revenue)
    print("current expenses:", expense)
    print("current balance:", revenue - expense)

    
def date_trans():
    revenue = 0
    expense = 0
    year_month = input("Enter month and year of transaction (YYYY-MM): ")
    for a in transaction:
        date = a["date"]
        if date[:7] == year_month:
            if a["type"] == "expense":
                expense += a["amount"]
            elif a["type"] == "revenue":
                revenue += a["amount"]
    print("----------Balance report----------")
    print("current revenue:", revenue)
    print("current expenses:", expense)
    print("current balance:", revenue - expense)    
            

    

def del_trans():
    delete_trans = int(input("Enter the transaction you want to delete: "))
    
    if delete_trans <= 0 or delete_trans > len(transaction):
        print("Transaction does not exist")
    else:
        delete_trans = delete_trans - 1
        del(transaction[delete_trans])
        print("Delete successfully")

def search_trans():
    category = input("Enter the category you want: ")
    index = 1
    for b in transaction:
        if b["category"] == category:
            print(str(index)+".", b["type"], "|",b["category"], "|",b["amount"],"|", b["date"])
            index += 1
   




def main():
    show_menu()
    
    while True:
        command = int(input("Enter a number to determine (5-exit): "))
        if command == 1:
            add_trans()
            show_menu()
        elif command == 2:
            view_trans()
            show_menu()
        elif command == 3:
            cal_balance()
            show_menu()
        elif command == 4:
            sum_report()
            show_menu()
        elif command == 5:
            date_trans()
            show_menu()
        elif command == 6:
            del_trans()
            show_menu()
        elif command == 7:
            search_trans()
            show_menu()
        elif command == 8:
            print("Goodbye")
            break
        else:
            print("Invalid choice, please try again")
            show_menu()
            
main()
