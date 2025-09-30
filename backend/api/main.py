import os
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client

from dependencies import get_supabase

from api.chronotype import router as chronotype_router
from api.quiz import router as quiz_router
from api.gemini import router as gemini_router

app = FastAPI(
    title="Sero Backend API",
    description="FastAPI backend with Supabase integration for Sero chronotype tracking",
    version="0.1.0"
)

# add chronotype endpoints router
app.include_router(chronotype_router)

# add quiz endpoints router
app.include_router(quiz_router)

# add gemini wrapper endpoints router
app.include_router(gemini_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    # Allow localhost and local network IPs during development
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://10.250.207.222:3000",
    ],
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
