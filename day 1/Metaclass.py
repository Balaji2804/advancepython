#Able to create a particular controller of particular class
#It is used to create design patterns such as singleton
class MyMeta(type):
    def __new__(cls, name, bases, dct):
        print(f"Creating class {name}")
        return super().__new__(cls, name, bases, dct)


class MyClass(metaclass=MyMeta):
    def func(self):
        print("Instance method")

a=MyClass()
print(a.func())
b=MyClass()
print(b.func())