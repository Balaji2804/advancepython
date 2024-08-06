import threading

lock = threading.Lock()


def safe_print():
    with lock:
        print("Thread-safe print")


# Create threads
threads = [threading.Thread(target=safe_print) for _ in range(5)]

# Start threads
for thread in threads:
    thread.start()

# Wait for threads to complete
for thread in threads:
    thread.join()