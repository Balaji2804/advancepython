from pydantic import BaseModel
from typing import Optional


class BookBase(BaseModel):
    title: str
    author: str
    published_date: Optional[str] = None
    isbn: Optional[str] = None
    pages: Optional[int] = None
    cover: Optional[str] = None
    language: Optional[str] = None


class BookCreate(BookBase):
    pass


class BookUpdate(BookBase):
    title: Optional[str] = None
    author: Optional[str] = None
    published_date: Optional[str] = None
    isbn: Optional[str] = None
    pages: Optional[int] = None
    cover: Optional[str] = None
    language: Optional[str] = None


class Book(BookBase):
    id: int

    class Config:
        orm_mode = True
