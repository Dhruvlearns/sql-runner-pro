from fastapi import APIRouter
from typing import List, Dict, Union

from app.core.db import execute_query, get_table_names, get_table_info
from app.models.query import QueryModel

# Use a prefix to define the base path for all routes in this file (e.g., /api/v1/...)
router = APIRouter(prefix="/sql", tags=["SQL Runner"])

# --- Endpoint 1: Execute SQL Query ---
@router.post("/run", response_model=Union[List[Dict], Dict[str, str]])
def run_sql_query(query_data: QueryModel):
    """
    Accepts an SQL query and executes it against the database.
    Returns the results (List[Dict]) or a message/error (Dict[str, str]).
    """
    results = execute_query(query_data.query)
    return results

# --- Endpoint 2: Get Table Names ---
@router.get("/tables", response_model=List[str])
def list_available_tables():
    """
    Fetches a list of all available table names.
    """
    tables = get_table_names()
    return tables

# --- Endpoint 3: Get Table Schema and Sample Data ---
@router.get("/tables/{table_name}", response_model=Dict)
def get_table_details(table_name: str):
    """
    Fetches the column schema (name/type) and sample rows (LIMIT 5) for a specific table.
    """
    info = get_table_info(table_name)
    return info