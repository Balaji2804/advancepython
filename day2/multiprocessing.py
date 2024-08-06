import multiprocessing
import time


def print_numbers():
    for i in range(5):
        print(i)
        time.sleep(1)


def print_letters():
    for letter in 'abcde':
        print(letter)
        time.sleep(1)


# Create processes
process1 = Process(target=print_numbers)
process2 = Process(target=print_letters)

# Start processes
process1.start()
process2.start()

# Wait for processes to complete
process1.join()
process2.join()