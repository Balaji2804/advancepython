import numpy as np


def compute():
    a = np.random.rand(1000, 1000)
    return np.dot(a, a)


if __name__ == '__main__':
    import threading

    threads = [threading.Thread(target=compute) for _ in range(5)]

    for t in threads:
        t.start()

    for t in threads:
        t.join()
print(compute())