from threading import Thread, Event
import time
import random
from queue import Queue

class Product:
    def __init__(self, name):
        self.product_name = name

    def __str__(self):
        return f"Product: {self.product_name}"

class Warehouse:
    def __init__(self, max_capacity):
        self.queue = Queue(max_capacity)

    def add_product(self, product):
        self.queue.put(product)

    def fetch_product(self):
        return self.queue.get()

    def task_done(self):
        self.queue.task_done()

class Producer(Thread):
    def __init__(self, warehouse, stop_event):
        Thread.__init__(self)
        self.warehouse = warehouse
        self.stop_event = stop_event
        self.produced_count = 0

    def run(self):
        nums = range(5)
        while not self.stop_event.is_set():
            num = random.choice(nums) 
            product = Product(f"Product-{num}")
            self.warehouse.add_product(product)
            self.produced_count += 1
            print("Produced", product)
            time.sleep(random.random())

class Consumer(Thread):
    def __init__(self, warehouse, stop_event):
        Thread.__init__(self)
        self.warehouse = warehouse
        self.stop_event = stop_event

    def run(self):
        while not self.stop_event.is_set():
            try:
                product = self.warehouse.fetch_product()
                print("Consumed", product)
                self.warehouse.task_done()
                time.sleep(random.random())
            except Queue.Empty:
                continue

class Factory:
    def __init__(self, max_capacity, num_producers, num_consumers):
        self.warehouse = Warehouse(max_capacity)
        self.stop_event = Event()
        self.producers = [Producer(self.warehouse, self.stop_event) for i in range(num_producers)]
        self.consumers = [Consumer(self.warehouse, self.stop_event) for i in range(num_consumers)]

    def start_factory(self):
        for producer in self.producers:
            producer.start()
        for consumer in self.consumers:
            consumer.start()

    def stop_factory(self):
        self.stop_event.set()
        for producer in self.producers:
            producer.join()
        for consumer in self.consumers:
            consumer.join()

def main():
    factory = Factory(10, 2, 2)
    factory.start_factory()
    time.sleep(10)
    factory.stop_factory()
    total_produced = sum(producer.produced_count for producer in factory.producers)
    print(f"Total products produced in 10 seconds: {total_produced}")

if __name__ == "__main__":
    main()
