#  SQL Runner Tool: Full-Stack Database Explorer

This project is a full-stack web application designed to act as a simple SQL Runner, allowing users to execute arbitrary SQL queries against a sample SQLite database, view tabular results, and explore table schemas.
#  SQL Runner Tool Screen Shots
1.
<img width="1852" height="922" alt="sql_runner_pro" src="https://github.com/user-attachments/assets/cf91591d-b6b0-40bd-8932-2e7813df6715" />
 2.   
<img width="1800" height="923" alt="sql_runner" src="https://github.com/user-attachments/assets/4a7f5e4d-1013-42f0-99ae-bc8fddb9881c" />


##  Features Implemented

The application successfully meets all core requirements and includes bonus features for enhanced professionalism and usability.

### Core Functionality
* **Query Input Area:** A dedicated text area for typing/pasting SQL queries.
* **Query Execution:** A "Run Query" button submits the query to the Python backend for execution.
* **Results Display:** Clear, well-formatted tabular display of results, including column headers and rows.
* **Error Handling:** Robust error handling on the backend catches invalid queries and returns informative error messages to the frontend.

### Table Explorer
* **Available Tables Panel:** A sidebar displays a list of available database tables (`Customers`, `Orders`, `Shippings`).
* **Schema & Sample Data:** Clicking a table name fetches and displays its column schema (name and data type) and the first 5 sample rows.

### Bonus Features Implemented
* **Recent Run Queries (Query History):** Stores and displays the last 10 successful queries in a panel, allowing the user to click and re-run them instantly. This history is maintained in-memory.

## 💻 Technology Stack

| Component | Technology | Framework/Library |
| :--- | :--- | :--- |
| **Frontend** | React (JavaScript) | Vite, Fetch API |
| **Backend** | Python | FastAPI, Uvicorn |
| **Database** | SQLite | Python `sqlite3` module |
| **Data Format** | JSON | [cite_start]Data exchange between FE/BE is exclusively JSON[cite: 36]. |

## 🛠️ Setup and Local Execution Guide

Follow these steps to set up and run the application locally.

### Prerequisites
* Node.js (v18+)
* Python (v3.10+) and Pip
* SQLite 3 CLI (often pre-installed)

### 1. Database Initialization

The SQLite database file must be created and seeded with sample data before starting the backend.

1.  Navigate to the project root:
    ```bash
    cd sql-runner-pro
    ```
2.  Create and open the database file (`mydatabase.db` is placed inside the `root` directory):
    ```bash
    sqlite3 mydatabase.db
    ```
3.  Paste and execute the table creation and insertion commands provided in the assignment document (for `Customers`, `Orders`, and `Shippings` tables).
4.  Exit the SQLite CLI:
    ```sql
    .exit
    ```

### 2. Backend Setup (FastAPI)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install the required Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Start the FastAPI server:
    ```bash
    python -m app.main
    ```
    The API will be running on `http://localhost:8000`.

### 3. Frontend Setup (React/Vite)

1.  Open a **new terminal window** and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install JavaScript dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server:
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:5173` (or similar port).

## 💡 Quick Testing Queries

Once the app is running, you can try these queries in the editor:

| Query Type | Example Query | Expected Behavior |
| :--- | :--- | :--- |
| **SELECT** | `SELECT first_name, country FROM Customers WHERE age > 25;` | Returns 3 rows. |
| **JOIN** | `SELECT c.first_name, o.item FROM Customers c JOIN Orders o ON c.customer_id = o.customer_id;` | Returns 5 rows with customer name and item. |
| **Modification** | `INSERT INTO Customers (first_name, last_name, age, country) VALUES ('Jane', 'Smith', 40, 'CAN');` | Returns a success message, no table result. |
| **Invalid** | `SELECT * FROM NonExistentTable;` | Returns an informative error message from the backend. |
