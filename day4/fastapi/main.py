# main.py
from fastapi import FastAPI, HTTPException
from typing import List
from models import Book


app = FastAPI()

# Temporary in-memory storage
books = []

@app.get("/books", response_model=List[Book])
def get_books():
    return books

@app.post("/books", response_model=Book)
def create_book(book: Book):
    books.append(book)
    return book

@app.get("/books/{book_id}", response_model=Book)
def get_book(book_id: int):
    if book_id >= len(books) or book_id < 0:
        raise HTTPException(status_code=404, detail="Book not found")
    return books[book_id]

@app.put("/books/{book_id}", response_model=Book)
def update_book(book_id: int, book: Book):
    if book_id >= len(books) or book_id < 0:
        raise HTTPException(status_code=404, detail="Book not found")
    books[book_id] = book
    return book

@app.delete("/books/{book_id}", status_code=204)
def delete_book(book_id: int):
    if book_id >= len(books) or book_id < 0:
        raise HTTPException(status_code=404, detail="Book not found")
    books.pop(book_id)
    return None
