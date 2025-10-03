from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class QuizQuestion(BaseModel):
    id: str
    question_key: str
    prompt: str
    question_type: str
    points: float = 1.0
    order_index: int
    options: List[Dict[str, Any]] = Field(default_factory=list)


class QuizDefinition(BaseModel):
    id: str
    title: str
    version: int
    questions: List[QuizQuestion]


class QuizResponsePayload(BaseModel):
    question_id: str
    answer_value: Any
    elapsed_ms: Optional[int] = None
    weights: Optional[Dict[str, float]] = None


class QuizSubmissionRequest(BaseModel):
    quiz_id: str
    quiz_version: int
    responses: List[QuizResponsePayload]


class QuizAttemptCreate(BaseModel):
    quiz_id: str
    quiz_version: int
    user_id: str
    summary: Dict[str, Any]
    responses: List[QuizResponsePayload]


class QuizAttemptRecord(BaseModel):
    id: str
    quiz_id: str
    user_id: str
    quiz_version: int
    summary: Dict[str, Any]
    submitted_at: datetime


class ChronotypeSummary(BaseModel):
    chronotype_type: str
    confidence_score: float
    recommended_sleep_schedule: Dict[str, str]
    analysis_details: Dict[str, Any]


class QuizSubmissionResult(BaseModel):
    attempt: QuizAttemptRecord
    responses: List[QuizResponsePayload]
    chronotype: Optional[ChronotypeSummary]
    raw_scores: Dict[str, float]
    question_breakdown: Dict[str, Dict[str, float]]
    message: Optional[str] = None
