import pandas as pd

df = pd.read_csv('transactions_L17.csv')

# print(df.head())
# print(df.shape)
# print(df.info())
# print(df.describe())

# print(df[['description','amount']])
# df['amount'].sum()      # total of every amount
# df['amount'].mean()     # average
# df['amount'].max()      # biggest
# df['amount'].min()      # smallest
# print(df['amount'] > 50)
# print(df['amount'][df['amount'] > 50])

# print(df[(df['category'] == 'Food') & (df['amount'] > 50)])
# print(df.groupby('category')['amount'].sum().sort_values(ascending = False))
# print(df.groupby('category').size())

# result = df.groupby('category')['amount'].sum()
# result.to_csv('category_totals.csv', index = False)

# ```python
# import pandas as pd

# df = pd.read_csv('transactions.csv')
# ```

# That's it. `df` (short for DataFrame — the conventional variable name) now holds the entire
# table. Take a look at it:

# ```python
# print(df.head())      # first 5 rows
# print(df.shape)       # (number of rows, number of columns)
# print(df.info())      # column names and types
# print(df.describe())  # quick stats (min, max, mean...) for number columns
# ```


# 1.
# print(df.head())
# print(df.shape)
# print(df.describe())

2.
# print(df['amount'].sum())
# print(df['amount'].mean())
# print(df['amount'].max())
# print(df['amount'].min())

3.

# print(df[['description','amount']])

4.

# print(df['amount'][df['amount']>50])
# print(len(df['amount'][df['amount']>50]))

5.
# print(df[(df['category'] == 'Groceries') & (df['amount'])])
# print((df[(df['category'] == 'Groceries') & (df['amount'])]).sum())
# print(df[(df['category'] == 'Food') & (df['amount'] > 50)])

6.
# print(df.groupby('category')['amount'].sum().sort_values(ascending = False))
# print(df.groupby('category').size())

# result = df.groupby('category')['amount'].sum()
# result.to_csv('category_totals.csv', index = False)


print(df.groupby('category')['amount'].sum().sort_values(ascending = False))

7
# print(df.groupby('category').size())

8

# result = df[df['category'] != "Income"]
# result.to_csv('expenses_only.csv', index = False)

9.
# def report(filename):
#     expenses = df[df['category'] != "Income"]
#     income = df[df['category'] == "Income"]
#     print(f"Total Income:               ${income['amount'].sum().round(2)}")
#     print(f"Total Expenses:               ${expenses['amount'].sum().round(2)}")
#     print(f"Net:               ${(income['amount'].sum()) - (expenses['amount'].sum()).round(2)}")
#     expenses_breakdown = expenses.groupby('category')['amount'].sum().sort_values(ascending = False)
#     print(expenses_breakdown)
#     expenses_breakdown.to_csv('expenses_only.csv', index = False)
# print(report(df))

10.
# print(df.sort_values('amount', ascending = False))

11.
# print(df.nlargest(5, 'amount'))

12.1
# print(df[(df['category'] == "Groceries") & (df['amount'] > 90)])

12.2
# print(df[(df['category'] == "Food") | (df['category'] == "Entertainment")])

13

# food_category = df[df['category'].isin(['Food', 'Groceries'])]
# print(food_category['amount'].sum())

14.

# print(df[df['description'].str.contains("Whole Foods")])
# print(df[df['description'].str.contains("Whole Foods")].sum())
# print(df[df['description'].str.contains("Amazon")])

15
# df['amount_eur'] = (df['amount'] * 0.92).round(2)
# print(df[['description','amount','amount_eur']])


16
# print(df['category'].value_counts())

17

# expenses = df[df['category'] != "Income"]
# print(expenses.groupby('category')['amount'].mean().round(2).sort_values(ascending = False))

18
expenses = df[df['category'] != "Income"]
df['date'] = pd.to_datetime(df['date'])
print(expenses.groupby(df['date'].dt.month)['amount'].sum().round(2))

19
# def expense_only(filename):
#     expenses = df[df['category'] != 'Income']
#     total_per_category = expenses.groupby('category')['amount'].sum().round(1)
#     share = (total_per_category / total_per_category.sum()*100).round(1).sort_values(ascending = False)
#     for i, j in share.items():
#         print(f"{i}  {j}%")
#     print(share.sum().round(1))

# expense_only(df)
    
20
# def report(filename):
#     expenses = df[df['category'] != "Income"]
#     print(f"max expenses:      {expenses.max()}")
#     over_50 = (df['amount'] > 50).sum()
#     over_50_percentage = over_50 / len(df) *100
#     print(f"{over_50_percentage}%")
#     print(df[(df['description'] == "Whole Foods") | (df['description'] == "Trader Joes")])




# print(report(df))

