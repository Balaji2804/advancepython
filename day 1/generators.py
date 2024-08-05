def my_generator(start, end):
    current = start
    while current <= end:
        yield current
        current += 1

for value in my_generator(1, 5):
    print(value)  # Output: 1, 2, 3, 4, 5

#Another way to create a generator using generator expressions

generator = (x * x for x in range(5))
for value in generator:
   print(value)  # Output: 0, 1, 4, 9, 16

