class Mammal:
    def feed_milk(self):
        print("Mammal feeds milk")

    def breathe(self):
        print("mammal breathe")

class Bird:
    def lay_eggs(self):
        print("Bird lays eggs")

    def breathe(self):
        print("bird breathe")

class Platypus(Bird, Mammal):
    def breathe(self):
        print("bird platy")

# Usage
platypus = Platypus()
platypus.feed_milk()  # Output: Mammal feeds milk
platypus.lay_eggs()   # Output: Bird lays eggs
platypus.breathe()