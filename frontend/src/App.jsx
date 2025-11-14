// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { runQuery, fetchTables, fetchTableInfo } from './services/api';

// --- Component 1: Available Tables Sidebar ---
const SidebarTables = ({ tables, onTableClick }) => (
    <div style={{ padding: '20px', borderRight: '1px solid #ccc', minWidth: '200px', backgroundColor: '#315659' }}>
        <h3>Available Tables</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tables.map(table => (
                <li 
                    key={table} 
                    onClick={() => onTableClick(table)}
                    style={{ 
                        cursor: 'pointer', 
                        padding: '8px 10px', 
                        margin: '5px 0', 
                        borderRadius: '4px',
                        backgroundColor: '#ddd',
                        transition: 'background-color 0.2s',
                    }}
                >
                    {table}
                </li>
            ))}
        </ul>
    </div>
);

// --- Component 2: Reusable Table Component ---
const ResultsTable = ({ data }) => {
    if (!data || data.length === 0) return <p>No data found.</p>;
    
    // Get column headers from the first row keys
    const headers = Object.keys(data[0]);

    const tableStyle = { 
        width: '100%', 
        borderCollapse: 'collapse', 
        border: '1px solid #ddd', 
        fontSize: '14px' 
    };
    const tableHeaderStyle = { 
        padding: '12px', 
        textAlign: 'left', 
        backgroundColor: '#434371', 
        color: 'yellow' 
    };
    const tableCellStyle = { 
        padding: '10px', 
        border: '1px solid #eee' 
    };

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        {headers.map(header => (
                            <th key={header} style={tableHeaderStyle}>{header.toUpperCase()}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? '#49111C' : '#49111C' }}>
                            {headers.map(header => (
                                <td key={header} style={tableCellStyle}>{row[header]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// --- Component 3: Results Display Area ---
const ResultsDisplay = ({ result, tableInfo, loading }) => {
    if (loading) return <div style={{ padding: '20px' }}><p>Running query or fetching data...</p></div>;
    
    // Display error
    if (result && result.error) return <div style={{ color: '#d9534f', backgroundColor: '#f2dede', padding: '15px', borderRadius: '4px' }}><strong>ERROR:</strong> {result.error}</div>;

    // Display success message for modification queries (INSERT/UPDATE/DELETE)
    if (result && result.message) return <div style={{ color: '#5cb85c', backgroundColor: '#dff0d8', padding: '15px', borderRadius: '4px' }}><strong>SUCCESS:</strong> {result.message}</div>;

    // Display table schema and sample data
    if (tableInfo) {
        return (
            <div style={{ padding: '20px' }}>
                <h3>Table Schema</h3>
                <p><strong>Columns:</strong> {tableInfo.columns.map(c => `${c.name} (${c.type})`).join(' | ')}</p>
                
                <h3>Sample Data (First 5 Rows)</h3>
                <ResultsTable data={tableInfo.sample_data} />
            </div>
        );
    }
    
    // Display query results
    if (result && result.data && result.data.length >= 0) {
        return (
            <div style={{ padding: '20px' }}>
                <h3>Query Results ({result.data.length} rows)</h3>
                <ResultsTable data={result.data} />
            </div>
        );
    }

    return <div style={{ padding: '20px', color: '#6c757d' }}>Run a query or click a table name to explore the database.</div>;
};



// --- Component: Query History Sidebar Panel ---
const QueryHistory = ({ history, onQuerySelect }) => {
    if (history.length === 0) {
        return <p style={{ padding: '10px', color: '#BCAB79' }}>No queries run yet.</p>;
    }
    return (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #ddd', marginTop: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Query History</h3>
            <ul style={{ listStyleType: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                {/* Reverse the array to show the newest query first */}
                {[...history].reverse().map((q, index) => (
                    <li 
                        key={index} 
                        onClick={() => onQuerySelect(q)}
                        style={{ 
                            cursor: 'pointer', 
                            padding: '6px', 
                            margin: '4px 0', 
                            borderRadius: '4px',
                            backgroundColor: '#93748A', //Background for history items
                            fontSize: '0.9em',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                        title={q} // Show full query on hover
                    >
                        {q.substring(0, 50)}{q.length > 50 ? '...' : ''}
                    </li>
                ))}
            </ul>
        </div>
    );
};


// // (Inside frontend/src/App.jsx, around line 120)

// --- Main App Component ---
const App = () => {
    // 1. ADD queryHistory state
    const [query, setQuery] = useState("SELECT * FROM Customers;");
    const [results, setResults] = useState(null);
    const [tables, setTables] = useState([]);
    const [tableInfo, setTableInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [queryHistory, setQueryHistory] = useState([]); // New state for history

    // ... (useEffect to fetch tables remains the same) ...
    useEffect(() => {
        fetchTables().then(setTables).catch(err => setResults({ error: err.message }));
    }, []);

    // Handler for selecting a history query (updates editor and runs)
    const handleHistorySelect = (q) => {
        setQuery(q); // Load query into the editor
        handleRunQuery(q); // Automatically run it
    }

    // 2. MODIFIED Handler for "Run Query" button
    // It now accepts an optional query string (for history select) or uses the editor state
    const handleRunQuery = async (queryToRun = query) => { // Use queryToRun or current state
        setLoading(true);
        setResults(null);
        setTableInfo(null);

        // Trim the query for cleaner history storage
        const trimmedQuery = queryToRun.trim(); 

        try {
            const data = await runQuery(trimmedQuery);
            
            // 3. HISTORY UPDATE LOGIC: Only store successful queries
            setQueryHistory(prevHistory => {
                // Prevent storing duplicates near the top
                const newHistory = prevHistory.filter(q => q !== trimmedQuery);
                // Prepend new query and limit to max 10 entries
                return [trimmedQuery, ...newHistory].slice(0, 10); 
            });

            if (data.message) {
                 setResults({ message: data.message });
            } else {
                 setResults({ data: data });
            }
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    // ... (handleTableClick remains the same) ...
    const handleTableClick = async (tableName) => {
        setLoading(true);
        setResults(null);
        setTableInfo(null);
        try {
            const info = await fetchTableInfo(tableName);
            setTableInfo(info);
        } catch (error) {
            setResults({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
            {/* Left Sidebar: Available Tables Panel */}
            <SidebarTables tables={tables} onTableClick={handleTableClick} />
            
            <div style={{ flexGrow: 1, padding: '20px' }}>
                <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>SQL Runner Tool</h2>
                
                {/* Query Input Area */}
                <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        // ... (styles remain the same) ...
                    />
                    <button 
                        onClick={() => handleRunQuery()} // Call without argument to use current editor state
                        // ... (styles remain the same) ...
                    >
                        {loading ? 'Running...' : 'Run Query'}
                    </button>
                </div>

                {/* 4. INTEGRATE Query History */}
                <QueryHistory history={queryHistory} onQuerySelect={handleHistorySelect} />

                {/* Results Display Area */}
                <div style={{ marginTop: '20px' }}>
                    <ResultsDisplay result={results} tableInfo={tableInfo} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default App;