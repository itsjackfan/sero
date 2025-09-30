from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from gemini_wrapper import GeminiWrapper
import os

app = FastAPI(title="Sero Backend API", version="0.1.0")

# Initialize Gemini wrapper
try:
    gemini = GeminiWrapper()
except ValueError as e:
    print(f"Warning: {e}")
    gemini = None


class ChatRequest(BaseModel):
    message: str
    model: str = "gemini-2.5-flash"


class ChatResponse(BaseModel):
    response: str
    success: bool


@app.get("/")
async def root():
    return {"message": "Sero Backend API", "status": "running"}


@app.post("/chat", response_model=ChatResponse)
async def chat_with_gemini(request: ChatRequest):
    """
    Chat endpoint for frontend to interact with Gemini.
    """
    if gemini is None:
        raise HTTPException(
            status_code=500, 
            detail="Gemini API not configured. Please set GOOGLE_API_KEY environment variable."
        )
    
    try:
        response = gemini.chat(request.message, request.model)
        return ChatResponse(response=response, success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "gemini_configured": gemini is not None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
