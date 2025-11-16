import sqlite3
from typing import List, Dict, Union

# Use the path relative to the app/ directory. 
# Assuming sql_runner.db is one level up in the 'backend' directory.
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
        # NOTE: Using executemany() for robust query execution might be safer, 
        # but execute() is fine for single-statement runner queries.
        cursor.execute(query)
        
        # Check if the query was a modification query (INSERT, UPDATE, DELETE)
        if query.strip().upper().startswith(("INSERT", "UPDATE", "DELETE")):
            conn.commit()
            # Return rows affected for a clear success message on the frontend
            return {"message": f"Query executed successfully. Rows affected: {cursor.rowcount}"}
        
        # For SELECT queries, fetch all results
        results = cursor.fetchall()
        
        # Convert rows to a list of dictionaries for JSON serialization
        return [dict(row) for row in results]
        
    except sqlite3.Error as e:
        # Return informative error message for invalid queries or database errors
        return {"error": str(e)}
    finally:
        # Ensure the connection is closed in all cases
        if conn:
            conn.close()

def get_table_names() -> List[str]:
    """Fetches the list of all available table names in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Query specific to SQLite to retrieve table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        return tables
    except sqlite3.Error as e:
        # Should rarely happen, but good to handle connection errors
        return {"error": str(e)}
    finally:
        if conn:
            conn.close()

def get_table_info(table_name: str) -> Union[Dict, Dict[str, str]]:
    """
    Fetches the schema and limited sample data for a specific table.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Fetch Schema (column names and data types)
        # PRAGMA is a SQLite-specific command for table info
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = [{"name": row[1], "type": row[2]} for row in cursor.fetchall()]
        
        # 2. Fetch Sample Data (first 5 rows)
        # NOTE: f-string interpolation is acceptable here since table_name 
        # is expected to come from the list returned by get_table_names().
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5;")
        sample_data = [dict(row) for row in cursor.fetchall()]

        return {"columns": columns, "sample_data": sample_data}
        
    except sqlite3.Error as e:
        return {"error": f"Error fetching info for table {table_name}: {str(e)}"}
    finally:
        if conn:
            conn.close()