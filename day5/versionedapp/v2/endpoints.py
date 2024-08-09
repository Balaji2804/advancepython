from fastapi import APIRouter

router = APIRouter()

@router.get("/books/")
def read_books():
    return [{"book_id": 1, "title": "Book 1 (v2)"}]

@router.get("/books/{book_id}")
def read_book(book_id: int):
    return {"book_id": book_id, "title": f"Book {book_id} (v2)"}

@router.post("/books/")
def create_book(book: dict):
    return {"book_id": 2, "title": book["title"]}
