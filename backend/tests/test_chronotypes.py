"""
Test-driven deployment tests written for the chronotype operation endpoints. Makes use of mocks in /conftest.py.

NOTE: these tests *SHOULD* fail, since their endpoints are not yet implemented. They simply describe the intended behaviour.
"""

import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_create_chronotype(client):
    payload = {
        "user_id": "user-chronotype-001",
        "data_points": [
            {
                "time_of_day": "08:00:00",
                "predicted_energy_level": 0.8,
                "actual_energy_level": 0.6,
                "difference_from_actual": 0.2,
                "context": {"source": "initial_quiz"}
            }
        ]
    }

    response = client.post("/chronotype", json=payload)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["user_id"] == payload["user_id"]
    assert "id" in data
    assert len(data["data_points"]) == len(payload["data_points"])


@pytest.mark.asyncio
async def test_get_chronotype(client, mock_supabase_client):
    chronotype_id = "chronotype-123"
    chronotypes_table = mock_supabase_client.table("chronotypes")
    chronotypes_table.insert({
        "id": chronotype_id,
        "user_id": "user-chronotype-123",
        "data_points": [
            {
                "time_of_day": "07:30:00",
                "predicted_energy_level": 0.7,
                "actual_energy_level": 0.65,
                "difference_from_actual": 0.05,
                "context": {"source": "baseline"}
            }
        ]
    }).execute()

    response = client.get(f"/chronotype/{chronotype_id}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == chronotype_id
    assert data["user_id"] == "user-chronotype-123"
    assert len(data["data_points"]) == 1


@pytest.mark.asyncio
async def test_update_chronotype(client, mock_supabase_client):
    chronotype_id = "chronotype-456"
    chronotypes_table = mock_supabase_client.table("chronotypes")
    chronotypes_table.insert({
        "id": chronotype_id,
        "user_id": "user-chronotype-456",
        "data_points": [
            {
                "time_of_day": "09:00:00",
                "predicted_energy_level": 0.5,
                "actual_energy_level": 0.4,
                "difference_from_actual": 0.1,
                "context": {"source": "initial"}
            }
        ]
    }).execute()

    payload = {
        "data_points": [
            {
                "time_of_day": "10:00:00",
                "predicted_energy_level": 0.9,
                "actual_energy_level": 0.8,
                "difference_from_actual": 0.1,
                "context": {"source": "manual_update"}
            }
        ]
    }

    response = client.put(f"/chronotype/{chronotype_id}", json=payload)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == chronotype_id
    assert data["data_points"][0]["predicted_energy_level"] == pytest.approx(0.9)
    assert data["data_points"][0]["context"]["source"] == "manual_update"


@pytest.mark.asyncio
async def test_delete_chronotype(client, mock_supabase_client):
    chronotype_id = "chronotype-789"
    chronotypes_table = mock_supabase_client.table("chronotypes")
    chronotypes_table.insert({
        "id": chronotype_id,
        "user_id": "user-chronotype-789",
        "data_points": []
    }).execute()

    response = client.delete(f"/chronotype/{chronotype_id}")

    assert response.status_code == status.HTTP_204_NO_CONTENT

    follow_up = client.get(f"/chronotype/{chronotype_id}")
    assert follow_up.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_predict_chronotype(client, mock_supabase_client):
    chronotype_id = "chronotype-model-001"
    chronotypes_table = mock_supabase_client.table("chronotypes")
    chronotypes_table.insert({
        "id": chronotype_id,
        "user_id": "user-for-model",
        "data_points": [
            {
                "time_of_day": "06:30:00",
                "predicted_energy_level": 0.4,
                "actual_energy_level": 0.6,
                "difference_from_actual": -0.2,
                "context": {"source": "baseline"}
            }
        ]
    }).execute()

    payload = {
        "horizon_days": 7,
        "include_context": True
    }

    response = client.post(f"/chronotype/{chronotype_id}/predict", json=payload)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["chronotype_id"] == chronotype_id
    assert isinstance(data["data_points"], list)
    assert len(data["data_points"]) > 0
    assert "predicted_energy_level" in data["data_points"][0]
