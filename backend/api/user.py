from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Header, HTTPException, status
from supabase import Client

from backend.dependencies import get_supabase
from backend.models.chronotype import (
    UserChronotypeEnergyCurveRecord,
    UserFocusWindowRecord,
)

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/chronotype/{chronotype_id}/energy-curve", response_model=List[UserChronotypeEnergyCurveRecord])
async def get_user_energy_curve(
    chronotype_id: str,
    db: Client = Depends(get_supabase),
    authorization: str | None = Header(default=None),
) -> List[UserChronotypeEnergyCurveRecord]:
    """Get the user's energy curve data."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")

    try:
        db.postgrest.auth(token)
        user_result = db.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid authorization token: {exc}")

    user_data = getattr(user_result, "user", None)
    user_id = getattr(user_data, "id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not resolve authenticated user")

    # Verify the chronotype belongs to the user
    chronotype_check = (
        db.table("user_chronotypes")
        .select("id")
        .eq("id", chronotype_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not chronotype_check.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chronotype not found")

    # Get energy curve data
    energy_curve_response = (
        db.table("user_chronotype_energy_curve")
        .select("id, user_chronotype_id, hour, predicted_energy, actual_energy")
        .eq("user_chronotype_id", chronotype_id)
        .order("hour")
        .execute()
    )

    try:
        return [UserChronotypeEnergyCurveRecord(**record) for record in energy_curve_response.data]
    except Exception as e:
        print(f"Validation error for energy curve: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Data validation error: {str(e)}")


@router.get("/chronotype/{chronotype_id}/focus-windows", response_model=List[UserFocusWindowRecord])
async def get_user_focus_windows(
    chronotype_id: str,
    db: Client = Depends(get_supabase),
    authorization: str | None = Header(default=None),
) -> List[UserFocusWindowRecord]:
    """Get the user's focus windows data."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")

    try:
        db.postgrest.auth(token)
        user_result = db.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid authorization token: {exc}")

    user_data = getattr(user_result, "user", None)
    user_id = getattr(user_data, "id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not resolve authenticated user")

    # Verify the chronotype belongs to the user
    chronotype_check = (
        db.table("user_chronotypes")
        .select("id")
        .eq("id", chronotype_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not chronotype_check.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chronotype not found")

    # Get focus windows data
    focus_windows_response = (
        db.table("user_focus_windows")
        .select("id, user_chronotype_id, window_type, start_hour, end_hour, recommendation")
        .eq("user_chronotype_id", chronotype_id)
        .order("start_hour")
        .execute()
    )

    try:
        return [UserFocusWindowRecord(**record) for record in focus_windows_response.data]
    except Exception as e:
        print(f"Validation error for focus windows: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Data validation error: {str(e)}")
