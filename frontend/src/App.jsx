import React, { useState, useEffect } from 'react';
import { runQuery, fetchTables, fetchTableInfo } from './services/api';

// --- Component 1: Available Tables Sidebar ---
const SidebarTables = ({ tables, onTableClick }) => (
    <div style={{ 
        padding: '24px', 
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        minWidth: '260px',
        borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        height: '100vh',
        overflowY: 'auto',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)'
    }}>
        <div style={{ marginBottom: '24px' }}>
            <div style={{ 
                fontSize: '24px', 
                marginBottom: '8px',
                filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.5))'
            }}>⚡</div>
            <h3 style={{ 
                color: '#f1f5f9', 
                fontSize: '13px', 
                fontWeight: '700',
                margin: 0,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                opacity: 0.9
            }}>Database Tables</h3>
        </div>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
            {tables.map(table => (
                <li 
                    key={table} 
                    onClick={() => onTableClick(table)}
                    style={{ 
                        cursor: 'pointer', 
                        padding: '12px 14px', 
                        margin: '0 0 8px 0', 
                        borderRadius: '8px',
                        backgroundColor: 'rgba(51, 65, 85, 0.5)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: '#cbd5e1',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                        e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                        e.target.style.transform = 'translateX(4px)';
                        e.target.style.color = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(51, 65, 85, 0.5)';
                        e.target.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                        e.target.style.transform = 'translateX(0)';
                        e.target.style.color = '#cbd5e1';
                    }}
                >
                    <span style={{ marginRight: '10px', opacity: 0.7 }}>▸</span>
                    {table}
                </li>
            ))}
        </ul>
    </div>
);

// --- Component 2: Reusable Table Component ---
const ResultsTable = ({ data }) => {
    if (!data || data.length === 0) return (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No data found.</p>
    );
    
    const headers = Object.keys(data[0]);

    return (
        <div style={{ 
            overflowX: 'auto', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    }}>
                        {headers.map(header => (
                            <th key={header} style={{ 
                                padding: '14px 18px', 
                                textAlign: 'left', 
                                fontWeight: '600',
                                color: '#ffffff',
                                fontSize: '12px',
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                borderBottom: 'none',
                                whiteSpace: 'nowrap'
                            }}>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr 
                            key={rowIndex} 
                            style={{ 
                                backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc',
                                transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc'}
                        >
                            {headers.map(header => (
                                <td key={header} style={{ 
                                    padding: '12px 18px',
                                    color: '#475569',
                                    borderBottom: '1px solid #f1f5f9',
                                    fontSize: '13px'
                                }}>
                                    {row[header]}
                                </td>
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
    if (loading) return (
        <div style={{ 
            padding: '60px', 
            textAlign: 'center'
        }}>
            <div style={{ 
                width: '48px',
                height: '48px',
                margin: '0 auto 20px',
                border: '4px solid #e2e8f0',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
            }}></div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                Executing query...
            </p>
        </div>
    );
    
    if (result && result.error) return (
        <div style={{ 
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            padding: '20px 24px', 
            borderRadius: '12px',
            borderLeft: '4px solid #ef4444',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                    <strong style={{ color: '#dc2626', display: 'block', marginBottom: '6px', fontSize: '14px' }}>
                        Query Error
                    </strong>
                    <p style={{ color: '#991b1b', margin: 0, fontSize: '13px', lineHeight: '1.6' }}>
                        {result.error}
                    </p>
                </div>
            </div>
        </div>
    );

    if (result && result.message) return (
        <div style={{ 
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            padding: '20px 24px', 
            borderRadius: '12px',
            borderLeft: '4px solid #22c55e',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>✓</span>
                <div>
                    <strong style={{ color: '#16a34a', display: 'block', marginBottom: '6px', fontSize: '14px' }}>
                        Success
                    </strong>
                    <p style={{ color: '#166534', margin: 0, fontSize: '13px', lineHeight: '1.6' }}>
                        {result.message}
                    </p>
                </div>
            </div>
        </div>
    );

    if (tableInfo) {
        return (
            <div>
                <div style={{ 
                    marginBottom: '20px',
                    padding: '16px 20px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    borderRadius: '10px',
                    border: '1px solid #bfdbfe'
                }}>
                    <h3 style={{ 
                        color: '#1e40af', 
                        margin: '0 0 12px 0',
                        fontSize: '14px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>Schema Information</h3>
                    <p style={{ 
                        margin: 0,
                        fontSize: '13px',
                        color: '#1e3a8a',
                        lineHeight: '1.8'
                    }}>
                        <strong>Columns:</strong> {tableInfo.columns.map(c => `${c.name} (${c.type})`).join(', ')}
                    </p>
                </div>
                
                <h3 style={{ 
                    color: '#0f172a', 
                    marginBottom: '16px',
                    fontSize: '15px',
                    fontWeight: '600'
                }}>Sample Data</h3>
                <ResultsTable data={tableInfo.sample_data} />
            </div>
        );
    }
    
    if (result && result.data && result.data.length >= 0) {
        return (
            <div>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ 
                        color: '#0f172a', 
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '600'
                    }}>
                        Query Results
                    </h3>
                    <span style={{ 
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }}>
                        {result.data.length} rows
                    </span>
                </div>
                <ResultsTable data={result.data} />
            </div>
        );
    }

    return (
        <div style={{ 
            padding: '80px 20px', 
            textAlign: 'center',
            borderRadius: '12px',
            border: '2px dashed #cbd5e1',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', opacity: 0.4 }}>📊</div>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>
                Run a query or select a table to view results
            </p>
        </div>
    );
};

// --- Component: Query History ---
const QueryHistory = ({ history, onQuerySelect }) => {
    if (history.length === 0) return null;
    
    return (
        <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
                color: '#475569',
                fontSize: '12px',
                fontWeight: '700',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
            }}>Recent Queries</h3>
            <div style={{ 
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap'
            }}>
                {[...history].reverse().slice(0, 5).map((q, index) => (
                    <button 
                        key={index} 
                        onClick={() => onQuerySelect(q)}
                        style={{ 
                            padding: '8px 16px', 
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            color: '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: '500',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                            e.target.style.color = 'white';
                            e.target.style.borderColor = '#3b82f6';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                            e.target.style.color = '#475569';
                            e.target.style.borderColor = '#cbd5e1';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                        }}
                        title={q}
                    >
                        {q.substring(0, 30)}{q.length > 30 ? '...' : ''}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Main App Component ---
const App = () => {
    const [query, setQuery] = useState("SELECT * FROM Customers;");
    const [results, setResults] = useState(null);
    const [tables, setTables] = useState([]);
    const [tableInfo, setTableInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [queryHistory, setQueryHistory] = useState([]);

    useEffect(() => {
        fetchTables().then(setTables).catch(err => setResults({ error: err.message }));
    }, []);

    const handleHistorySelect = (q) => {
        setQuery(q);
        handleRunQuery(q);
    }

    const handleRunQuery = async (queryToRun = query) => {
        setLoading(true);
        setResults(null);
        setTableInfo(null);

        const trimmedQuery = queryToRun.trim(); 

        try {
            const data = await runQuery(trimmedQuery);
            
            setQueryHistory(prevHistory => {
                const newHistory = prevHistory.filter(q => q !== trimmedQuery);
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
        <div style={{ 
            display: 'flex', 
            minHeight: '100vh', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
            backgroundColor: '#ffffff'
        }}>
            {/* Sidebar */}
            <SidebarTables tables={tables} onTableClick={handleTableClick} />
            
            {/* Main Content - Split Layout */}
            <div style={{ 
                flexGrow: 1, 
                display: 'flex',
                backgroundColor: '#ffffff'
            }}>
                {/* Left Panel - Query Editor */}
                <div style={{ 
                    width: '45%',
                    padding: '40px',
                    borderRight: '1px solid #e2e8f0',
                    overflowY: 'auto',
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
                }}>
                    {/* Header */}
                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ 
                            fontSize: '28px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0 0 8px 0',
                            letterSpacing: '-0.5px'
                        }}>
                            SQL Runner Pro
                        </h1>
                        <p style={{ 
                            color: '#64748b', 
                            fontSize: '14px',
                            margin: 0,
                            fontWeight: '500'
                        }}>
                            Execute queries with precision and speed
                        </p>
                    </div>

                    {/* Query History */}
                    <QueryHistory history={queryHistory} onQuerySelect={handleHistorySelect} />
                    
                    {/* Query Editor */}
                    <div style={{ 
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)'
                    }}>
                        <label style={{ 
                            display: 'block',
                            color: '#0f172a',
                            fontSize: '13px',
                            fontWeight: '700',
                            marginBottom: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Query Editor
                        </label>
                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '320px',
                                padding: '16px',
                                fontSize: '14px',
                                fontFamily: '"Fira Code", "SF Mono", Monaco, "Courier New", monospace',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                outline: 'none',
                                resize: 'vertical',
                                backgroundColor: '#f8fafc',
                                color: '#1e293b',
                                lineHeight: '1.6',
                                transition: 'all 0.2s ease',
                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.backgroundColor = '#ffffff';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.backgroundColor = '#f8fafc';
                                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                            }}
                        />
                        <button 
                            onClick={() => handleRunQuery()}
                            disabled={loading}
                            style={{
                                marginTop: '16px',
                                padding: '12px 28px',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: 'white',
                                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: loading ? 'none' : '0 4px 16px rgba(59, 130, 246, 0.3)',
                                letterSpacing: '0.3px'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                                }
                            }}
                        >
                            {loading ? '⏳ Executing...' : '▶ Run Query'}
                        </button>
                    </div>
                </div>

                {/* Right Panel - Results */}
                <div style={{ 
                    width: '55%',
                    padding: '40px',
                    backgroundColor: '#f8fafc',
                    overflowY: 'auto'
                }}>
                    <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            width: '4px',
                            height: '28px',
                            background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '2px'
                        }}></div>
                        <h2 style={{ 
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#0f172a',
                            margin: 0,
                            letterSpacing: '-0.3px'
                        }}>
                            Results
                        </h2>
                    </div>
                    <div style={{ 
                        borderRadius: '12px',
                        padding: '28px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                        border: '1px solid #e2e8f0',
                        minHeight: '400px'
                    }}>
                        <ResultsDisplay result={results} tableInfo={tableInfo} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;