from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class QuizResponse(BaseModel):
    """Individual quiz question response."""
    question_id: int = Field(..., description="Index of the question (0-based)")
    question_text: str = Field(..., description="The question that was asked")
    selected_option_id: Optional[str] = Field(None, description="ID of the selected option")
    custom_response: Optional[str] = Field(None, description="Custom text response if provided")
    response_value: str = Field(..., description="The actual response value (option_id or custom_response)")


class QuizSubmission(BaseModel):
    """Complete quiz submission with all responses."""
    user_id: str = Field(..., description="ID of the user taking the quiz")
    responses: List[QuizResponse] = Field(..., description="List of all quiz responses")
    submitted_at: Optional[str] = Field(None, description="Timestamp when quiz was submitted")


class ChronotypeResult(BaseModel):
    """Result of chronotype analysis from quiz."""
    chronotype_type: str = Field(..., description="Early Bird, Night Owl, or Intermediate")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence in the classification")
    analysis_details: Dict[str, any] = Field(default_factory=dict, description="Detailed analysis breakdown")
    recommended_sleep_schedule: Dict[str, str] = Field(default_factory=dict, description="Recommended bed/wake times")


class QuizSubmissionResponse(BaseModel):
    """Response after processing quiz submission."""
    quiz_id: str = Field(..., description="Unique ID for this quiz submission")
    chronotype_result: ChronotypeResult = Field(..., description="Analysis results")
    chronotype_id: str = Field(..., description="ID of the created chronotype record")
    message: str = Field(..., description="Success message")
