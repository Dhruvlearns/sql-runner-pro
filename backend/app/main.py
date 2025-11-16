from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.sql_router import router as sql_router


# Initialize the FastAPI application
app = FastAPI(
    title="SQL Runner API",
    description="Backend service for executing SQL queries and fetching table info.",
    version="1.0.0",
)

# Configuration for Cross-Origin Resource Sharing (CORS)
# This is necessary because the frontend (e.g., localhost:5173) 
# and backend (localhost:8000) run on different ports/origins.
origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173",  # Include the IP version as a fallback
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

if __name__ == "__main__":
    # This block allows you to run the server directly for testing
    import uvicorn
    # Set host/port for local development
    uvicorn.run(app, host="0.0.0.0", port=8000)