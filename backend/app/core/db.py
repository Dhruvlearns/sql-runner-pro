# backend/app/core/db.py
import sqlite3
from typing import List, Dict, Union

# Use the path relative to where your main FastAPI application will run (app/main.py)
# Assuming sql_runner.db is in the 'backend' directory.
# If you moved it to the root, adjust this path accordingly (e.g., '../sql_runner.db')
DATABASE_URL = '../sql_runner.db'

def get_db_connection() -> sqlite3.Connection:
    """Creates and returns a database connection object."""
    conn = sqlite3.connect(DATABASE_URL)
    # This line allows columns to be accessed by name, converting rows to dictionary-like objects
    conn.row_factory = sqlite3.Row
    return conn

def execute_query(query: str) -> Union[List[Dict], Dict[str, str]]:
    """
    Executes a given SQL query against the database and returns structured results or an error.
    Handles both SELECT (returns data) and modification queries (INSERT, UPDATE, DELETE).
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        
        # Check if the query was a modification query (INSERT, UPDATE, DELETE)
        # We commit the transaction and return a success message or affected rows.
        if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
            conn.commit()
            return {"message": f"Query executed successfully. Rows affected: {cursor.rowcount}"}
        
        # For SELECT queries, fetch all results
        results = cursor.fetchall()
        
        # Convert rows to a list of dictionaries for JSON serialization [cite: 131]
        return [dict(row) for row in results]
        
    except sqlite3.Error as e:
        # Return informative error message for invalid queries or database errors [cite: 133, 134, 176]
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

def get_table_names() -> List[str]:
    """Fetches the list of all available table names in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    # Query specific to SQLite to retrieve table names [cite: 141, 178]
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    return tables

def get_table_info(table_name: str) -> Union[Dict, Dict[str, str]]:
    """
    Fetches the schema and limited sample data for a specific table.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Fetch Schema (column names and data types)
        # PRAGMA is a SQLite-specific command for table info [cite: 177]
        cursor.execute(f"PRAGMA table_info({table_name});")
        # Structure the columns as a list of dicts: [{"name": "col_name", "type": "TEXT"}, ...]
        columns = [{"name": row[1], "type": row[2]} for row in cursor.fetchall()]
        
        # 2. Fetch Sample Data (first 5 rows) [cite: 17]
        # Use a safe f-string here since table_name comes from the internal list/API call
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5;")
        sample_data = [dict(row) for row in cursor.fetchall()]

        return {"columns": columns, "sample_data": sample_data}
        
    except sqlite3.Error as e:
        return {"error": f"Error fetching info for table {table_name}: {str(e)}"}
    finally:
        if conn:
            conn.close()