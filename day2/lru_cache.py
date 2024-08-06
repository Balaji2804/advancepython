from functools import lru_cache


@lru_cache(maxsize=32)
def fibonacci(n):
    if n < 2:
        return n
    print("Function called")
    return fibonacci(n - 1) + fibonacci(n - 2)


print(fibonacci(10))  # Output: 55

def fibonacci1(n):
    if n < 2:
        return n
    print("Function called")
    return fibonacci1(n - 1) + fibonacci1(n - 2)


print(fibonacci1(10))  # Output: 55