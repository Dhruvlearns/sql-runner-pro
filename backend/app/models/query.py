# backend/app/models/query.py
from pydantic import BaseModel

class QueryModel(BaseModel):
    """Defines the expected structure for the query execution request."""
    query: str