def logging_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"Calling function: {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Function {func.__name__} returned {result}")
        return result

    return wrapper


@logging_decorator
def add(a, b):
    return a + b


@logging_decorator
def subtract(a, b):
    return a - b


@logging_decorator
def multiply(a, b):
    return a * b


@logging_decorator
def divide(a, b):
    if b == 0:
        return "Error: Division by zero"
    return a / b


# Example usage
print(add(5, 3))
print(subtract(10, 4))
print(multiply(2, 3))
print(divide(8, 2))
print(divide(8, 0))