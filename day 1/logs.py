class LogFileIterator:
    def __init__(self, file_path):
        self.file_path = file_path
        self.file = open(file_path, 'r')

    def __iter__(self):
        return self

    def __next__(self):
        line = self.file.readline()
        if line:
            return line.strip()
        else:
            self.file.close()
            raise StopIteration


# Usage
log_file_path = 'logfile.txt'
log_iterator = LogFileIterator(log_file_path)

for line in log_iterator:
    print(line)  # Process each line


def error_log_reader(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            if "Error" in line or "Exception" in line:
                yield line

# Usage example:
log_file_path = 'logfile.txt'

for error_line in error_log_reader(log_file_path):
    print(error_line)
