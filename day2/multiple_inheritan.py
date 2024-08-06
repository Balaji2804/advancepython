class Mammal:
   def feed_milk(self):
       print("Mammal feeds milk")

class Bird:
   def lay_eggs(self):
       print("Bird lays eggs")

class Platypus(Mammal, Bird):
   pass

# Usage
platypus = Platypus()
platypus.feed_milk()  # Output: Mammal feeds milk
platypus.lay_eggs()   # Output: Bird lays eggs