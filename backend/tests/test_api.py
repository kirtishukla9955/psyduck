"""
API Integration & Endpoint tests for Land Stack P2.
Uses FastAPI TestClient to test status codes, schemas, and error handling.
"""
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from shapely.geometry import Polygon
from geoalchemy2.shape import from_shape

from app.main import app
from app.database import get_db

client = TestClient(app)


def test_health_endpoint():
    """1. Health endpoint test: GET / -> 200 OK"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Land Stack" in data["service"]


def test_parcel_not_found():
    """3. Non-existent parcel -> 404 NOT FOUND"""
    # Override get_db to return empty
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    with patch("app.crud.get_parcel_by_ulpin", return_value=None):
        response = client.get("/parcel/UNKNOWN_ULPIN_99")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    app.dependency_overrides.clear()


def test_mutation_not_found():
    """8. Non-existent mutation -> 404 NOT FOUND"""
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    with patch("app.crud.get_mutation_by_id", return_value=None):
        response = client.get("/mutations/MUT-NON-EXISTENT")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    app.dependency_overrides.clear()


def test_parcel_retrieval_success():
    """2. Parcel retrieval test: GET /parcel/{ulpin} -> 200 OK with GeoJSON"""
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    poly = Polygon([(76.78, 30.74), (76.781, 30.74), (76.781, 30.741), (76.78, 30.741), (76.78, 30.74)])
    mock_parcel = MagicMock(
        ulpin="01837492817201",
        geometry=from_shape(poly, srid=4326),
        owner_name="Ramesh Kumar",
        area_sqm=2450.0,
        village_or_city="Chandigarh Sector 17",
        state="CH",
        land_use="Residential",
        ror_data={"tenure": "Freehold"},
        encumbrance_data={"mortgaged": False},
        property_tax_due=1200.0,
        created_at=datetime.now(timezone.utc)
    )

    with patch("app.crud.get_parcel_by_ulpin", return_value=mock_parcel):
        with patch("app.services.trust_engine.check_parcel_trust", return_value={
            "trust_status": "VERIFIED",
            "conflicts": [],
            "has_conflict": False
        }):
            response = client.get(f"/parcel/{mock_parcel.ulpin}")
            assert response.status_code == 200
            data = response.json()
            assert data["ulpin"] == "01837492817201"
            assert data["owner_name"] == "Ramesh Kumar"
            assert data["trust_status"] == "VERIFIED"
            assert data["geometry"]["type"] == "Polygon"

    app.dependency_overrides.clear()


def test_mutation_retrieval_with_sla():
    """Mutation retrieval includes calculated SLA countdown"""
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    now = datetime.now(timezone.utc)
    mock_mutation = MagicMock(
        id=1,
        mutation_id="MUT-2026-0001",
        ulpin="01837492817201",
        old_owner="Sunita Sharma",
        proposed_new_owner="Amit Sharma",
        department="Revenue",
        submitted_at=now - timedelta(days=2),
        sla_days=7,
        sla_deadline=now + timedelta(days=5),
        status="PENDING",
        resolved_at=None,
        remarks="Partition deed"
    )

    with patch("app.crud.get_mutation_by_id", return_value=mock_mutation):
        response = client.get("/mutations/MUT-2026-0001")
        assert response.status_code == 200
        data = response.json()
        assert data["mutation_id"] == "MUT-2026-0001"
        assert data["sla_status"] == "WITHIN_SLA"
        assert data["days_remaining"] == 5

    app.dependency_overrides.clear()


def test_conflict_parcel_endpoint():
    """GET /conflicts/{ulpin} returns structured conflict report"""
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    poly = Polygon([(76.78, 30.74), (76.781, 30.74), (76.781, 30.741), (76.78, 30.741), (76.78, 30.74)])
    mock_parcel = MagicMock(
        ulpin="01928475819202",
        geometry=from_shape(poly, srid=4326),
        owner_name="Priya Singh"
    )

    with patch("app.crud.get_parcel_by_ulpin", return_value=mock_parcel):
        with patch("app.services.trust_engine.check_parcel_trust", return_value={
            "trust_status": "FLAGGED",
            "conflicts": [{
                "ulpin": "01928475819202",
                "has_conflict": True,
                "conflict_type": "OWNER_NAME_MISMATCH",
                "severity": "HIGH",
                "involved_departments": ["Revenue", "Registration"],
                "conflicting_values": {"Revenue": "Priya Singh", "Registration": "Vikram Singh"},
                "status": "FLAGGED",
                "details": "Owner name differs between Revenue and Registration",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }],
            "has_conflict": True
        }):
            response = client.get("/conflicts/01928475819202")
            assert response.status_code == 200
            data = response.json()
            assert data["has_conflict"] is True
            assert data["conflict_type"] == "OWNER_NAME_MISMATCH"
            assert data["severity"] == "HIGH"

    app.dependency_overrides.clear()


def test_post_grievance_and_get_conflicts():
    """POST /conflicts -> 200 OK, GET /conflicts -> includes the grievance"""
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db

    poly = Polygon([(76.78, 30.74), (76.781, 30.74), (76.781, 30.741), (76.78, 30.741), (76.78, 30.74)])
    mock_parcel = MagicMock(ulpin="01928475819202", geometry=from_shape(poly, srid=4326), owner_name="Priya Singh")

    # Mock create_grievance
    mock_grievance = MagicMock(
        id=1,
        tracking_id="GRV-0001",
        ulpin="01928475819202",
        citizen_name="John Doe",
        phone="555-0192",
        discrepancy_type="Area Mismatch",
        description="The area is wrong",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    )

    with patch("app.crud.get_parcel_by_ulpin", return_value=mock_parcel):
        with patch("app.crud.create_grievance", return_value=mock_grievance):
            response = client.post("/conflicts", json={
                "ulpin": "01928475819202",
                "name": "John Doe",
                "phone": "555-0192",
                "type": "Area Mismatch",
                "description": "The area is wrong"
            })
            assert response.status_code == 200
            data = response.json()
            assert data["tracking_id"] == "GRV-0001"
            assert data["citizen_name"] == "John Doe"

    # Now test if get_system_conflicts returns it (by mocking list_grievances and list_parcels)
    with patch("app.crud.list_parcels", return_value=[]):
        with patch("app.crud.list_grievances", return_value=[mock_grievance]):
            response = client.get("/conflicts")
            assert response.status_code == 200
            data = response.json()
            assert data["total_conflicts"] == 1
            assert data["conflicts"][0]["conflict_type"] == "CITIZEN_GRIEVANCE"
            assert data["conflicts"][0]["conflicting_values"]["tracking_id"] == "GRV-0001"

    app.dependency_overrides.clear()
