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
