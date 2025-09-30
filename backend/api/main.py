import os
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client

from dependencies import get_supabase

from api.chronotype import router as chronotype_router

app = FastAPI(
    title="Sero Backend API",
    description="FastAPI backend with Supabase integration for Sero chronotype tracking",
    version="0.1.0"
)

# add chronotype endpoints router
app.include_router(chronotype_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Sero Backend API is running!", "timestamp": datetime.now()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
