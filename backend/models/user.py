from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

class User(BaseModel):
    user_id: str
    email: EmailStr
    
    # Authentication fields
    google_user_id: Optional[str] = None  # For Google OAuth users
    password_hash: Optional[str] = None  # For email signup users
    
    # Basic user information
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    # Profile information
    timezone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    
    # Onboarding and preferences
    onboarding_quiz_responses: Optional[Dict[str, Any]] = None
    onboarding_completed: bool = False
    
    # Account metadata
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    email_verified: bool = False
