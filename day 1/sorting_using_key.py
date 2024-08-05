students = [
    {'name': 'Alice', 'grade': 'A', 'age':40},
    {'name': 'Bob', 'grade': 'B', 'age':20},
    {'name': 'Charlie', 'grade': 'C', 'age':50}
]

sorted_students = sorted(students, key=lambda student: student['age'])
sorted_students1 = sorted(students, key=lambda student: student['age']*-1)
print(sorted_students) # Ascending
print(sorted_students1) # Descending