from fastapi import APIRouter, HTTPException
from ..services.gemini_wrapper import GeminiWrapper
from ..models.gemini import ChatRequest, ChatResponse

router = APIRouter(prefix="/gemini", tags=["Gemini"])

# Initialize Gemini wrapper
try:
    gemini = GeminiWrapper()
except ValueError as e:
    print(f"Warning: {e}")
    gemini = None

@router.post("/chat", response_model=ChatResponse)
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

