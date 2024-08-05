#Decorators are a powerful and flexible way to modify the behavior of functions or methods.They allow you to wrap another function to extend its behavior without permanently modifying it.
def greet_decorator(func):
    def wrapper():
        return f"Greetings! {func()}"

    return wrapper

def greet_decorator1(func):
    def wrapper():
        return f"Hi! {func()}"

    return wrapper

@greet_decorator
@greet_decorator1
def say_hello():
    return "Hello!"


print(say_hello())  # Output: Greetings! Hello!

#Creating a Logging decorator
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


print(add(5, 3))  # Output:
# Calling function: add
# Function add returned 8
# 8