class Descriptor:
    def __init__(self, name=None):
        self.name = name

    def __get__(self, instance, owner):
        return instance.__dict__[self.name]

    def __set__(self, instance, value):
        instance.__dict__[self.name] = value


class MyClass:
    attr = Descriptor('attr')

    def __init__(self, attr):
        self.attr = attr

obj=MyClass('des attr')
print(obj)
print(obj.attr)