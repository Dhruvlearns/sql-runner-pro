# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI
from app.api.sql_router import router as sql_router


# Initialize the FastAPI application
app = FastAPI(
    title="SQL Runner API",
    description="Backend service for executing SQL queries and fetching table info.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend origin like ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the SQL router for the main functionality
# All routes will be prefixed with /api/v1
app.include_router(sql_router, prefix="/api/v1")

@app.get("/")
def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "SQL Runner API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    # This block allows you to run the server directly for testing
    import uvicorn
    # Set host/port for local development
    uvicorn.run(app, host="0.0.0.0", port=8000)