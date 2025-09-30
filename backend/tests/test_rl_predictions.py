"""Test-driven deployment for chronotype RL pipeline endpoints.

All tests currently fail until the API and model orchestration are implemented.
"""

import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_rl_prediction_happy_path(client, mock_supabase_client, mock_rl_engine):
    chronotype_id = "chronotype-rl-123"

    # Seed mock Supabase table with an existing chronotype record
    chronotypes_table = mock_supabase_client.table("chronotypes")
    chronotypes_table.insert(
        {
            "chronotype_id": chronotype_id,
            "user_id": "user-rl-123",
            "label": "Baseline pattern",
            "data_points": [
                {
                    "time_of_day": "08:00:00",
                    "predicted_energy_level": 0.6,
                    "actual_energy_level": 0.5,
                    "difference_from_actual": -0.1,
                    "context": {"source": "initial"},
                }
            ],
        }
    ).execute()

    # Configure the RL engine mock to return deterministic results
    mock_rl_engine.next_data_points = [
        {
            "time_of_day": "08:30:00",
            "predicted_energy_level": 0.65,
            "actual_energy_level": 0.55,
            "difference_from_actual": -0.1,
            "context": {"source": "rl-pipeline"},
        }
    ]
    mock_rl_engine.next_training_metadata = {
        "epochs": 3,
        "training_time_seconds": 1.2,
        "reward": 0.78,
    }

    payload = {
        "feedback": [
            {
                "time_of_day": "08:10:00",
                "actual_energy_level": 0.52,
                "difference_from_actual": 0.02,
                "context": {"note": "slightly more energetic"},
            }
        ],
        "training_config": {
            "max_epochs": 5,
            "learning_rate": 0.01,
            "batch_size": 16,
        },
    }

    response = client.post(f"/chronotype/{chronotype_id}/predict", json=payload)

    assert response.status_code == status.HTTP_200_OK
    body = response.json()

    assert body["chronotype_id"] == chronotype_id
    assert body["training_metadata"] == mock_rl_engine.next_training_metadata
    assert body["updated_chronotype"]["data_points"] == mock_rl_engine.next_data_points

    # Ensure the RL engine was called with the expected inputs for inspection
    assert len(mock_rl_engine.train_calls) == 1
    call = mock_rl_engine.train_calls[0]
    assert call["chronotype"]["chronotype_id"] == chronotype_id
    assert call["feedback"] == payload["feedback"]
    assert call["config"] == payload["training_config"]


@pytest.mark.asyncio
async def test_rl_prediction_missing_chronotype(client, mock_rl_engine):
    payload = {
        "feedback": [],
        "training_config": {},
    }

    response = client.post("/chronotype/nonexistent-id/predict", json=payload)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    body = response.json()
    assert body["detail"].lower().startswith("chronotype not found")


@pytest.mark.asyncio
async def test_rl_prediction_invalid_feedback(client, mock_supabase_client, mock_rl_engine):
    chronotype_id = "chronotype-rl-invalid"
    mock_supabase_client.table("chronotypes").insert(
        {
            "chronotype_id": chronotype_id,
            "user_id": "user-invalid",
            "label": "Baseline pattern",
            "data_points": [],
        }
    ).execute()

    payload = {
        "feedback": [
            {
                "time_of_day": "not-a-time",
                "actual_energy_level": 1.5,
                "difference_from_actual": "bad-data",
            }
        ]
    }

    response = client.post(f"/chronotype/{chronotype_id}/predict", json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
