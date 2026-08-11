import copy

import pytest
from fastapi.testclient import TestClient

from src import app as app_module


# Keep a deep copy of the initial activities so tests can reset state
original_activities = copy.deepcopy(app_module.activities)


@pytest.fixture(autouse=True)
def reset_activities():
    # Reset the in-memory activities before each test
    app_module.activities.clear()
    app_module.activities.update(copy.deepcopy(original_activities))
    yield


@pytest.fixture
def client():
    with TestClient(app_module.app) as c:
        yield c
