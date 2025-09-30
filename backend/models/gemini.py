from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    model: str = "gemini-2.5-flash"

class ChatResponse(BaseModel):
    response: str
    success: bool