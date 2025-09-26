import os
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from config import settings

app = FastAPI(
    title="Sero Backend API",
    description="FastAPI backend with Supabase integration for Sero chronotype tracking",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
supabase: Client = create_client(settings.supabase_url, settings.supabase_anon_key)

def get_supabase() -> Client:
    """Dependency to get Supabase client"""
    return supabase


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Sero Backend API is running!", "timestamp": datetime.now()}


@app.get("/test/read")
async def test_read(supabase: Client = Depends(get_supabase)):
    """Test endpoint to read from Supabase"""
    try:
        # Try to read from a test table or any existing table
        response = supabase.table('test_table').select("*").limit(5).execute()
        return {
            "message": "Successfully read from Supabase",
            "data": response.data,
            "count": len(response.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read error: {str(e)}")


@app.post("/test/write")
async def test_write(supabase: Client = Depends(get_supabase)):
    """Test endpoint to write to Supabase"""
    try:
        # Create a test record
        test_data = {
            "name": "Test Entry",
            "created_at": datetime.now().isoformat(),
            "test_value": "Hello from FastAPI"
        }
        
        response = supabase.table('test_table').insert(test_data).execute()
        return {
            "message": "Successfully wrote to Supabase",
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database write error: {str(e)}")




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
