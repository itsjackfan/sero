import copy
import os
import sys
from dataclasses import dataclass
from types import SimpleNamespace
from typing import Any, Callable, Dict, List, Optional
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient


# Ensure required environment variables exist for settings import
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")


class _StubSupabaseClient:
    def table(self, *_args, **_kwargs):
        raise RuntimeError("Stub supabase client should not be used directly in tests")


if "supabase" not in sys.modules:
    sys.modules["supabase"] = SimpleNamespace(
        create_client=lambda *args, **kwargs: _StubSupabaseClient(),
        Client=_StubSupabaseClient,
    )


from api.main import app, get_supabase


@dataclass
class MockResponse:
    data: List[Dict[str, Any]]


class MockRequest:
    def __init__(self, executor: Optional[Callable[[], List[Dict[str, Any]]]] = None):
        self._executor = executor or (lambda: [])

    def execute(self) -> MockResponse:
        return MockResponse(self._executor())

    def eq(self, field: str, value: Any) -> "MockRequest":
        raise NotImplementedError("eq should be implemented by specific table operations")

    def range(self, start: int, end: int) -> "MockRequest":
        return MockRequest(lambda: self._executor()[start : end + 1])


class MockSupabaseTable:
    def __init__(self):
        self.records: Dict[str, Dict[str, Any]] = {}

    def _clone_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        return copy.deepcopy(record)

    def insert(self, data: Dict[str, Any]) -> MockRequest:
        record = self._clone_record(data)
        record.setdefault("id", str(uuid4()))
        self.records[record["id"]] = record
        return MockRequest(lambda: [self._clone_record(record)])

    def select(self, columns: str = "*") -> MockRequest:
        def executor() -> List[Dict[str, Any]]:
            return [self._clone_record(record) for record in self.records.values()]

        request = MockRequest(executor)

        def eq(field: str, value: Any) -> MockRequest:
            return MockRequest(
                lambda: [
                    self._clone_record(record)
                    for record in self.records.values()
                    if record.get(field) == value
                ]
            )

        request.eq = eq  # type: ignore[attr-defined]
        return request

    def update(self, data: Dict[str, Any]) -> MockRequest:
        def eq(field: str, value: Any) -> MockRequest:
            def executor() -> List[Dict[str, Any]]:
                updated: List[Dict[str, Any]] = []
                for record_id, record in self.records.items():
                    if record.get(field) == value:
                        record.update(data)
                        updated.append(self._clone_record(record))
                return updated

            return MockRequest(executor)

        request = MockRequest(lambda: [])
        request.eq = eq  # type: ignore[attr-defined]
        return request

    def delete(self) -> MockRequest:
        def eq(field: str, value: Any) -> MockRequest:
            def executor() -> List[Dict[str, Any]]:
                deleted: List[Dict[str, Any]] = []
                for record_id, record in list(self.records.items()):
                    if record.get(field) == value:
                        deleted.append(self._clone_record(record))
                        del self.records[record_id]
                return deleted

            return MockRequest(executor)

        request = MockRequest(lambda: [])
        request.eq = eq  # type: ignore[attr-defined]
        return request


class MockSupabaseClient:
    def __init__(self):
        self.tables: Dict[str, MockSupabaseTable] = {}

    def table(self, name: str) -> MockSupabaseTable:
        if name not in self.tables:
            self.tables[name] = MockSupabaseTable()
        return self.tables[name]


@pytest.fixture
def mock_supabase_client():
    mock_client = MockSupabaseClient()

    async def override_get_supabase():
        return mock_client

    app.dependency_overrides[get_supabase] = override_get_supabase
    yield mock_client
    app.dependency_overrides.clear()


@pytest.fixture
def client(mock_supabase_client):
    return TestClient(app)
