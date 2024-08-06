from itertools import islice

items = range(10)
sliced = islice(items, 2, 8, 2)
print(list(sliced))  # Output: [2, 4, 6]