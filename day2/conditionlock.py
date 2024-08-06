import threading
condition = threading.Condition()


def consumer():
    with condition:
        condition.wait()
        print("Consumer notified")


def producer():
    with condition:
        print("Producer notifying")
        condition.notify_all()


# Create threads
consumer_thread = threading.Thread(target=consumer)
producer_thread = threading.Thread(target=producer)

# Start threads
consumer_thread.start()
producer_thread.start()

# Wait for threads to complete
consumer_thread.join()
producer_thread.join()


"""The difference lock is normally for mutual exclusion to prevent threats.

Multiple threads from accessing that particular section that is turnitin is for you to synchronise the threads or the synchronise the threads so that you know when what threat to be released and what threat to get the term.

So we are synchronising them."""