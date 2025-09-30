from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from supabase import Client

from backend.models.chronotype import ChronotypeCreate, ChronotypeResponse, ChronotypeUpdate
from backend.dependencies import get_supabase

router = APIRouter(prefix="/chronotype", tags=["Chronotype"])


def _parse_chronotype(record: dict) -> ChronotypeResponse:
    try:
        return ChronotypeResponse(**record)
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=500, detail=f"Could not parse chronotype record: {exc}")


@router.post("", response_model=ChronotypeResponse, status_code=status.HTTP_201_CREATED)
async def create_chronotype(
    payload: ChronotypeCreate,
    db: Client = Depends(get_supabase),
):
    try:
        record = payload.model_dump()
        record.setdefault("chronotype_id", str(uuid4()))
        record["data_points"] = [dp.model_dump() for dp in payload.data_points]
        record.setdefault("created_at", datetime.utcnow().isoformat())

        response = db.table("chronotypes").insert(record).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create chronotype")

        return _parse_chronotype(response.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error creating chronotype: {exc}")


@router.get("/{chronotype_id}", response_model=ChronotypeResponse)
async def get_chronotype(
    chronotype_id: str,
    db: Client = Depends(get_supabase),
):
    try:
        response = db.table("chronotypes").select("*").eq("chronotype_id", chronotype_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Chronotype not found")

        return _parse_chronotype(response.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error retrieving chronotype: {exc}")


@router.put("/{chronotype_id}", response_model=ChronotypeResponse)
async def update_chronotype(
    chronotype_id: str,
    payload: ChronotypeUpdate,
    db: Client = Depends(get_supabase),
):
    try:
        update_data = {}
        if payload.data_points is not None:
            update_data["data_points"] = [dp.model_dump() for dp in payload.data_points]

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = db.table("chronotypes").update(update_data).eq("chronotype_id", chronotype_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Chronotype not found")

        return _parse_chronotype(response.data[0])
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error updating chronotype: {exc}")


@router.delete("/{chronotype_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chronotype(
    chronotype_id: str,
    db: Client = Depends(get_supabase),
):
    try:
        response = db.table("chronotypes").delete().eq("chronotype_id", chronotype_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Chronotype not found")

        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Error deleting chronotype: {exc}")

