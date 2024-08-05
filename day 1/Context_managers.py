#It is used for setup and cleanup operations (with keyword)

from contextlib import contextmanager


@contextmanager
def file_manager(file_name, mode):
    file = open(file_name, mode)
    try:
        yield file
    finally:
        file.close()


# Usage
with file_manager('logfile.txt', 'r') as f:
    data = f.read()
    print(data)
# File is automatically closed after the with block

