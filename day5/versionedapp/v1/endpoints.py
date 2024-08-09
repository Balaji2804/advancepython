from fastapi import APIRouter

router = APIRouter()

@router.get("/books/")
def read_books():
    return [{"book_id": 1, "title": "Book 1 (v1)"}]

@router.get("/books/{book_id}")
def read_book(book_id: int):
    return {"book_id": book_id, "title": f"Book {book_id} (v1)"}
