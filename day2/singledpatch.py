from functools import singledispatch


@singledispatch
def process(arg):
    print("Default implementation")


@process.register(int)
def _(arg):
    print("Processing an integer")


@process.register(str)
def _(arg):
    print("Processing a string")


process(42)  # Output: Processing an integer
process("hello")  # Output: Processing a string
process([1, 2, 3])  # Output: Default implementation