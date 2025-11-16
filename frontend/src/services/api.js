// frontend/src/services/api.js

// Base URL for the FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Executes a POST request to run an SQL query.
 * @param {string} query The SQL query string.
 */
export const runQuery = async (query) => {
    const response = await fetch(`${API_BASE_URL}/sql/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });

    const data = await response.json();
    if (!response.ok) {
        // Throw an error with the server's error message
        throw new Error(data.error || 'Failed to execute query');
    }
    return data;
};

/**
 * Fetches the list of all available tables.
 * @returns {Promise<string[]>}
 */
export const fetchTables = async () => {
    const response = await fetch(`${API_BASE_URL}/sql/tables`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error('Failed to fetch table list');
    }
    // Filter out internal SQLite system tables
    return data.filter(name => !name.startsWith('sqlite_'));
};

/**
 * Fetches schema and sample data for a given table.
 * @param {string} tableName The name of the table.
 */
export const fetchTableInfo = async (tableName) => {
    const response = await fetch(`${API_BASE_URL}/sql/tables/${tableName}`);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `Failed to fetch info for table ${tableName}`);
    }
    return data;
};