from functools import partial


def multiply(x, y):
    return x * y


double = partial(multiply, 2)
print(double(5))  # Output: 10

def multipl1(x, y,z):
    return x * y*z


double = partial(multipl1, 2)
print(double(5,10))  # Output: 10