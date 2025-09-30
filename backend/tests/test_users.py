"""
Test-driven deployment tests written for the user operation endpoints. Makes use of mocks in /conftest.py.

NOTE: these tests *SHOULD* fail, since their endpoints are not yet implemented. They simply describe the intended behaviour.
"""

import pytest
from httpx import AsyncClient

from fastapi import status

from api.main import app


@pytest.mark.asyncio
async def test_create_user(client):
    payload = {
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "timezone": "UTC"
    }
    response = client.post("/users", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == payload["email"]
    assert "id" in data


@pytest.mark.asyncio
async def test_read_user(client, mock_supabase_client):
    # Preload a user into the mock database
    users_table = mock_supabase_client.table("users")
    created = users_table.insert({
        "id": "user-123",
        "email": "existing@example.com",
        "first_name": "Existing",
        "last_name": "User",
        "timezone": "UTC"
    }).execute().data[0]

    response = client.get(f"/users/{created['id']}")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == created["id"]
    assert data["email"] == created["email"]


@pytest.mark.asyncio
async def test_update_user(client, mock_supabase_client):
    users_table = mock_supabase_client.table("users")
    created = users_table.insert({
        "id": "user-456",
        "email": "update@example.com",
        "first_name": "Update",
        "last_name": "User",
        "timezone": "UTC"
    }).execute().data[0]

    payload = {
        "first_name": "Updated",
        "last_name": "User",
        "timezone": "America/New_York"
    }

    response = client.put(f"/users/{created['id']}", json=payload)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["first_name"] == payload["first_name"]
    assert data["timezone"] == payload["timezone"]


@pytest.mark.asyncio
async def test_delete_user(client, mock_supabase_client):
    users_table = mock_supabase_client.table("users")
    created = users_table.insert({
        "id": "user-789",
        "email": "delete@example.com",
        "first_name": "Delete",
        "last_name": "User",
        "timezone": "UTC"
    }).execute().data[0]

    response = client.delete(f"/users/{created['id']}")

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Try to fetch after deletion
    response_get = client.get(f"/users/{created['id']}")
    assert response_get.status_code == status.HTTP_404_NOT_FOUND
