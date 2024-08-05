from contextlib import contextmanager
import sqlite3


@contextmanager
def database_connection(db_name):
    connection = sqlite3.connect(db_name)
    try:
        yield connection
    finally:
        connection.close()


# Usage
with database_connection('example.db') as conn:
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS my_table (id INTEGER PRIMARY KEY, name TEXT)')
    cursor.execute('INSERT INTO my_table (name) VALUES (?)', ('Alice',))
    cursor.execute('SELECT * FROM my_table')
    results = cursor.fetchall()
    print(results)
# Connection is automatically closed after the with block