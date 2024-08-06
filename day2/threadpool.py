from concurrent.futures import ThreadPoolExecutor
import time


def task(name):
    print(f"Starting task {name}")
    time.sleep(2)
    print(f"Task {name} completed")


# Create a ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=2) as executor:
    futures = [executor.submit(task, i) for i in range(5)]

    for future in futures:
        future.result()
