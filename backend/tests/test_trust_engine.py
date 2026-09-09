"""
Unit tests for Land Stack P2 Trust Engine logic.
Tests:
- Owner name mismatch detection
- Normal / no-conflict verification
- Mutation within SLA
- Mutation overdue detection
- Mutation approaching SLA
- Mutation resolved lifecycle
"""
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, patch
import pytest

from app.models import Mutation, DepartmentRecord, Parcel
from app.services import trust_engine


def test_normalize_name():
    assert trust_engine._normalize_name("  Ramesh Kumar ") == "ramesh kumar"
    assert trust_engine._normalize_name("RAMESH   KUMAR.") == "ramesh kumar"
    assert trust_engine._normalize_name("Priya  Singh") == "priya singh"


def test_mutation_within_sla():
    """Mutation submitted 2 days ago with 7-day SLA -> WITHIN_SLA (5 days left)"""
    now = datetime.now(timezone.utc)
    mutation = Mutation(
        mutation_id="MUT-TEST-001",
        ulpin="01837492817201",
        old_owner="Sunita Sharma",
        proposed_new_owner="Amit Sharma",
        department="Revenue",
        submitted_at=now - timedelta(days=2),
        sla_days=7,
        sla_deadline=now + timedelta(days=5),
        status="PENDING"
    )

    result = trust_engine.evaluate_mutation_sla(mutation)
    assert result["sla_status"] == "WITHIN_SLA"
    assert result["is_breached"] is False
    assert result["days_remaining"] == 5
    assert result["days_overdue"] == 0


def test_mutation_overdue():
    """Mutation submitted 18 days ago with 7-day SLA -> OVERDUE by 11 days"""
    now = datetime.now(timezone.utc)
    mutation = Mutation(
        mutation_id="MUT-TEST-002",
        ulpin="01837492817202",
        old_owner="Harpreet Kaur",
        proposed_new_owner="Gurpreet Singh",
        department="Revenue",
        submitted_at=now - timedelta(days=18),
        sla_days=7,
        sla_deadline=now - timedelta(days=11),
        status="PENDING"
    )

    result = trust_engine.evaluate_mutation_sla(mutation)
    assert result["sla_status"] == "OVERDUE"
    assert result["is_breached"] is True
    assert result["days_overdue"] >= 11
    assert result["days_remaining"] == 0


def test_mutation_approaching_sla():
    """Mutation with 1 day remaining -> APPROACHING_SLA"""
    now = datetime.now(timezone.utc)
    mutation = Mutation(
        mutation_id="MUT-TEST-003",
        ulpin="01837492817203",
        old_owner="Devendra",
        proposed_new_owner="Kunal",
        department="Revenue",
        submitted_at=now - timedelta(days=6),
        sla_days=7,
        sla_deadline=now + timedelta(days=1),
        status="UNDER_REVIEW"
    )

    result = trust_engine.evaluate_mutation_sla(mutation)
    assert result["sla_status"] == "APPROACHING_SLA"
    assert result["is_breached"] is False


def test_mutation_resolved():
    """Approved mutation should be classified as RESOLVED"""
    now = datetime.now(timezone.utc)
    mutation = Mutation(
        mutation_id="MUT-TEST-004",
        ulpin="01837492817204",
        old_owner="Anil",
        proposed_new_owner="Sunil",
        department="Revenue",
        submitted_at=now - timedelta(days=10),
        sla_days=7,
        sla_deadline=now - timedelta(days=3),
        status="APPROVED",
        resolved_at=now - timedelta(days=4)
    )

    result = trust_engine.evaluate_mutation_sla(mutation)
    assert result["sla_status"] == "RESOLVED"
    assert result["is_breached"] is False


@patch("app.crud.get_department_records_by_ulpin")
@patch("app.crud.get_parcel_by_ulpin")
def test_owner_mismatch_detected(mock_get_parcel, mock_get_dept_records):
    """When Revenue shows 'Priya Singh' and Registration shows 'Vikram Singh' -> FLAGGED HIGH"""
    mock_db = MagicMock()
    mock_get_parcel.return_value = MagicMock(owner_name="Priya Singh")
    mock_get_dept_records.return_value = [
        MagicMock(department_name="Revenue", owner_name="Priya Singh"),
        MagicMock(department_name="Registration", owner_name="Vikram Singh"),
        MagicMock(department_name="Survey", owner_name="Priya Singh"),
    ]

    report = trust_engine.check_owner_mismatch("01928475819202", mock_db)
    assert report.has_conflict is True
    assert report.conflict_type == "OWNER_NAME_MISMATCH"
    assert report.severity == "HIGH"
    assert report.status == "FLAGGED"
    assert "Registration" in report.involved_departments
    assert report.conflicting_values["Registration"] == "Vikram Singh"


@patch("app.crud.get_department_records_by_ulpin")
@patch("app.crud.get_parcel_by_ulpin")
def test_no_conflict_case(mock_get_parcel, mock_get_dept_records):
    """When all departments agree on 'Ramesh Kumar' -> CLEAR / NO CONFLICT"""
    mock_db = MagicMock()
    mock_get_parcel.return_value = MagicMock(owner_name="Ramesh Kumar")
    mock_get_dept_records.return_value = [
        MagicMock(department_name="Revenue", owner_name="Ramesh Kumar"),
        MagicMock(department_name="Registration", owner_name="Ramesh Kumar"),
        MagicMock(department_name="Survey", owner_name="Ramesh Kumar"),
    ]

    report = trust_engine.check_owner_mismatch("01837492817201", mock_db)
    assert report.has_conflict is False
    assert report.conflict_type == "NONE"
    assert report.severity == "NONE"
    assert report.status == "CLEAR"
