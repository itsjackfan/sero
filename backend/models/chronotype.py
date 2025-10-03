from datetime import time
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ChronotypeDataPoint(BaseModel):
    """Discrete time-series entry for a chronotype signal."""

    time_of_day: time = Field(..., description="Reference time for the energy measurement")
    predicted_energy_level: float = Field(..., ge=0.0, le=1.0)
    actual_energy_level: float = Field(..., ge=0.0, le=1.0)
    difference_from_actual: float = Field(..., description="Predicted minus actual value")
    context: Dict[str, Any] = Field(default_factory=dict)


# User Quiz Results Models
class UserQuizResultCreate(BaseModel):
    """Payload for creating a user quiz result."""
    user_id: str
    quiz_id: str
    quiz_version: int
    profile_id: str
    score: float
    raw_result: Dict[str, Any]
    summary: Dict[str, Any]


class UserQuizResultRecord(BaseModel):
    """User quiz result record."""
    id: str
    user_id: str
    quiz_id: str
    quiz_version: int
    profile_id: str
    score: float
    raw_result: Dict[str, Any]
    summary: Dict[str, Any]
    created_at: str
    updated_at: str


class UserQuizAnswerCreate(BaseModel):
    """Payload for creating a user quiz answer."""
    result_id: str
    question_id: str
    answer_value: Any
    weights: Optional[Dict[str, float]] = None
    metadata: Optional[Dict[str, Any]] = None


class UserQuizAnswerRecord(BaseModel):
    """User quiz answer record."""
    id: str
    result_id: str
    question_id: str
    answer_value: Any
    weights: Optional[Dict[str, float]] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: str


# User Chronotype Models
class UserChronotypeCreate(BaseModel):
    """Payload for creating a user chronotype."""
    user_id: str
    profile_id: str
    label: Optional[str] = None
    description: Optional[str] = None
    source: str = "quiz"
    data_points: Optional[Dict[str, Any]] = None
    guidance: Optional[Dict[str, Any]] = None


class UserChronotypeRecord(BaseModel):
    """User chronotype record."""
    id: str
    user_id: str
    profile_id: str
    label: Optional[str]
    description: Optional[str]
    source: str
    data_points: Optional[Dict[str, Any]]
    guidance: Optional[Dict[str, Any]]
    created_at: str
    updated_at: str


class UserChronotypeEnergyCurveCreate(BaseModel):
    """Payload for creating user chronotype energy curve."""
    user_chronotype_id: str
    hour: int
    predicted_energy: float
    actual_energy: Optional[float] = None


class UserChronotypeEnergyCurveRecord(BaseModel):
    """User chronotype energy curve record."""
    id: str
    user_chronotype_id: str
    hour: int
    predicted_energy: float
    actual_energy: Optional[float]


class UserFocusWindowCreate(BaseModel):
    """Payload for creating user focus window."""
    user_chronotype_id: str
    window_type: str
    start_hour: int
    end_hour: int
    recommendation: Optional[str] = None


class UserFocusWindowRecord(BaseModel):
    """User focus window record."""
    id: str
    user_chronotype_id: str
    window_type: str
    start_hour: int
    end_hour: int
    recommendation: Optional[str]


# Legacy models (keeping for backward compatibility)
class ChronotypeBase(BaseModel):
    """Shared chronotype fields."""
    user_id: str
    chronotype_id: str
    data_points: List[ChronotypeDataPoint] = Field(default_factory=list)


class ChronotypeCreate(ChronotypeBase):
    """Payload for creating a chronotype entry."""
    pass


class ChronotypeUpdate(BaseModel):
    """Payload for updating chronotype data points."""
    data_points: Optional[List[ChronotypeDataPoint]] = None


class ChronotypeResponse(ChronotypeBase):
    """Chronotype representation returned from the API."""
    chronotype_id: str
