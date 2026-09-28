"""
Land Trust Engine — Core business logic for Land Stack (Bhu-DPI).
Performs automated multi-department verification, conflict detection,
mutation SLA monitoring, and composite parcel trust rating.
"""
import os
import re
import math
from datetime import datetime, timezone, timedelta
from typing import Optional, Any
from sqlalchemy.orm import Session

from app.models import Parcel, DepartmentRecord, Mutation
from app import crud
from app.schemas import ConflictReport, SystemConflictSummary

# Configurable SLA default in days (override via environment variable)
DEFAULT_MUTATION_SLA_DAYS = int(os.getenv("MUTATION_SLA_DAYS", 7))
APPROACHING_SLA_THRESHOLD_DAYS = int(os.getenv("APPROACHING_SLA_THRESHOLD_DAYS", 2))


def _normalize_name(name: str) -> str:
    """Normalizes an owner name for robust multi-department comparison."""
    if not name:
        return ""
    # Lowercase, strip punctuation and collapse whitespace
    cleaned = re.sub(r"[^\w\s]", "", name.lower())
    return " ".join(cleaned.split())


def _normalize_dt(dt: Optional[datetime]) -> Optional[datetime]:
    """Ensures datetime is timezone-aware in UTC."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


# ====================================================================
# 1. OWNER NAME MISMATCH DETECTION
# ====================================================================

def check_owner_mismatch(ulpin: str, db: Session) -> ConflictReport:
    """
    Compares owner names reported by various government departments:
    - Revenue (Jamabandi / ROR)
    - Registration (Sub-Registrar Deeds)
    - Survey & Land Records
    - Urban Development / Municipal Authority
    Also compares against master Parcel record.
    """
    records = crud.get_department_records_by_ulpin(db, ulpin)
    parcel = crud.get_parcel_by_ulpin(db, ulpin)

    department_values: dict[str, str] = {}
    if parcel and parcel.owner_name:
        department_values["Master Parcel"] = parcel.owner_name

    for rec in records:
        department_values[rec.department_name] = rec.owner_name

    if len(department_values) <= 1:
        return ConflictReport(
            ulpin=ulpin,
            has_conflict=False,
            conflict_type="NONE",
            severity="NONE",
            involved_departments=list(department_values.keys()),
            conflicting_values=department_values,
            status="CLEAR",
            details="Single or no departmental records found; no discrepancy detected.",
            timestamp=datetime.now(timezone.utc)
        )

    # Check for mismatches by comparing normalized names
    normalized_map = {dept: _normalize_name(name) for dept, name in department_values.items()}
    unique_names = set(normalized_map.values())

    if len(unique_names) > 1:
        mismatched_depts = list(department_values.keys())
        dept_str = ", ".join(f"{d} ('{department_values[d]}')" for d in mismatched_depts)
        details = f"Owner name differs across department records: {dept_str}"

        return ConflictReport(
            ulpin=ulpin,
            has_conflict=True,
            conflict_type="OWNER_NAME_MISMATCH",
            severity="HIGH",
            involved_departments=mismatched_depts,
            conflicting_values=department_values,
            status="FLAGGED",
            details=details,
            timestamp=datetime.now(timezone.utc)
        )

    return ConflictReport(
        ulpin=ulpin,
        has_conflict=False,
        conflict_type="NONE",
        severity="NONE",
        involved_departments=list(department_values.keys()),
        conflicting_values=department_values,
        status="CLEAR",
        details="All departmental records agree on the registered owner name.",
        timestamp=datetime.now(timezone.utc)
    )


# ====================================================================
# 2. MUTATION SLA TIMER & STATUS EVALUATION
# ====================================================================

def evaluate_mutation_sla(mutation: Mutation) -> dict[str, Any]:
    """
    Evaluates whether a land mutation is within statutory SLA,
    approaching SLA deadline, overdue, or resolved.
    """
    now = datetime.now(timezone.utc)
    deadline = _normalize_dt(mutation.sla_deadline)
    submitted = _normalize_dt(mutation.submitted_at)

    if mutation.status in ["APPROVED", "REJECTED"]:
        return {
            "sla_status": "RESOLVED",
            "days_remaining": None,
            "days_overdue": None,
            "is_breached": False,
            "details": f"Mutation closed with status {mutation.status}."
        }

    diff = deadline - now
    total_seconds_left = diff.total_seconds()

    if total_seconds_left < 0:
        days_overdue = max(1, math.ceil(abs(total_seconds_left) / 86400))
        return {
            "sla_status": "OVERDUE",
            "days_remaining": 0,
            "days_overdue": days_overdue,
            "is_breached": True,
            "details": f"Mutation has breached statutory SLA by {days_overdue} day(s)."
        }

    days_remaining = max(0, math.ceil(total_seconds_left / 86400))
    if days_remaining <= APPROACHING_SLA_THRESHOLD_DAYS:
        return {
            "sla_status": "APPROACHING_SLA",
            "days_remaining": days_remaining,
            "days_overdue": 0,
            "is_breached": False,
            "details": f"Mutation is approaching SLA deadline ({days_remaining} days remaining)."
        }

    return {
        "sla_status": "WITHIN_SLA",
        "days_remaining": days_remaining,
        "days_overdue": 0,
        "is_breached": False,
        "details": f"Mutation is currently within statutory SLA ({days_remaining} days remaining)."
    }


# ====================================================================
# 3. COMPOSITE PARCEL TRUST ASSESSMENT
# ====================================================================

def check_parcel_trust(ulpin: str, db: Session) -> dict[str, Any]:
    """
    Generates a unified Trust Profile for a parcel.
    Aggregates:
    - Multi-department name consistency
    - PostGIS spatial overlap conflicts (fraud signals)
    - Active / Overdue mutations
    - Encumbrance & Mortgage status
    Returns: trust_status ("VERIFIED", "WARNING", "FLAGGED"), conflicts list.
    """
    parcel = crud.get_parcel_by_ulpin(db, ulpin)
    if not parcel:
        return {
            "ulpin": ulpin,
            "trust_status": "UNKNOWN",
            "conflicts": [],
            "has_conflict": False
        }

    conflicts: list[ConflictReport] = []

    # 1. Department Owner Mismatch Check
    mismatch_report = check_owner_mismatch(ulpin, db)
    if mismatch_report.has_conflict:
        conflicts.append(mismatch_report)

    # 2. Spatial Overlap Fraud Check (Geometry collisions)
    try:
        overlaps = crud.find_overlapping_parcels(db, parcel)
        if overlaps:
            conflicts.append(ConflictReport(
                ulpin=ulpin,
                has_conflict=True,
                conflict_type="GEOMETRY_OVERLAP",
                severity="HIGH",
                involved_departments=["Survey & GIS"],
                conflicting_values={"overlapping_ulpins": [o.ulpin for o in overlaps]},
                status="FLAGGED",
                details=f"Parcel geometry physically overlaps with {len(overlaps)} other parcel(s).",
                timestamp=datetime.now(timezone.utc)
            ))
    except Exception:
        # Graceful fallback if spatial function unavailable in lightweight env
        pass

    # 3. Mutation SLA Check
    mutations = crud.list_mutations(db, ulpin=ulpin)
    has_overdue_mutation = False
    for m in mutations:
        sla_info = evaluate_mutation_sla(m)
        if sla_info["sla_status"] == "OVERDUE":
            has_overdue_mutation = True
            conflicts.append(ConflictReport(
                ulpin=ulpin,
                has_conflict=True,
                conflict_type="OVERDUE_MUTATION",
                severity="MEDIUM",
                involved_departments=[m.department],
                conflicting_values={
                    "mutation_id": m.mutation_id,
                    "days_overdue": sla_info["days_overdue"]
                },
                status="ACTION_REQUIRED",
                details=f"Active mutation {m.mutation_id} is overdue by {sla_info['days_overdue']} days.",
                timestamp=datetime.now(timezone.utc)
            ))

    # Calculate final trust rating
    if any(c.severity == "HIGH" for c in conflicts):
        trust_status = "FLAGGED"
    elif conflicts or has_overdue_mutation:
        trust_status = "WARNING"
    elif (parcel.encumbrance_data or {}).get("mortgaged", False):
        trust_status = "WARNING"
    else:
        trust_status = "VERIFIED"

    return {
        "ulpin": ulpin,
        "trust_status": trust_status,
        "conflicts": conflicts,
        "has_conflict": len(conflicts) > 0,
        "summary": (
            "Verified land title with zero detected departmental discrepancies."
            if trust_status == "VERIFIED"
            else f"{len(conflicts)} integrity issue(s) detected."
        )
    }


# ====================================================================
# 4. SYSTEM-WIDE CONFLICT AGGREGATOR (ADMIN DASHBOARD / P4)
# ====================================================================

def get_system_conflicts(db: Session) -> SystemConflictSummary:
    """
    Compiles all active conflicts across all parcels for the Admin Dashboard (P4).
    """
    all_parcels = crud.list_parcels(db, limit=1000)
    all_conflicts: list[ConflictReport] = []

    owner_mismatches_count = 0
    geometry_overlaps_count = 0
    overdue_mutations_count = 0

    for p in all_parcels:
        trust = check_parcel_trust(p.ulpin, db)
        for c in trust["conflicts"]:
            all_conflicts.append(c)
            if c.conflict_type == "OWNER_NAME_MISMATCH":
                owner_mismatches_count += 1
            elif c.conflict_type == "GEOMETRY_OVERLAP":
                geometry_overlaps_count += 1
            elif c.conflict_type == "OVERDUE_MUTATION":
                overdue_mutations_count += 1

    grievances = crud.list_grievances(db)
    for g in grievances:
        if g.status == "PENDING":
            all_conflicts.append(ConflictReport(
                ulpin=g.ulpin,
                has_conflict=True,
                conflict_type="CITIZEN_GRIEVANCE",
                severity="MEDIUM",
                involved_departments=["Public Portal"],
                conflicting_values={
                    "tracking_id": g.tracking_id,
                    "discrepancy_type": g.discrepancy_type,
                    "citizen_name": g.citizen_name,
                    "phone": g.phone
                },
                status="FLAGGED",
                details=f"Citizen Reported: {g.description}",
                timestamp=g.created_at
            ))

    return SystemConflictSummary(
        total_conflicts=len(all_conflicts),
        owner_mismatches_count=owner_mismatches_count,
        overdue_mutations_count=overdue_mutations_count,
        geometry_overlaps_count=geometry_overlaps_count,
        conflicts=all_conflicts
    )
