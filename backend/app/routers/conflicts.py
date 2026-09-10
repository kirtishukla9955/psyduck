"""
Conflict APIs — consumed by the Admin & Department Dashboard (P4).
Provides system-level and parcel-level auditing of owner mismatches,
boundary overlaps, and overdue mutations.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud
from app.services import trust_engine
from app.schemas import ConflictReport, SystemConflictSummary

router = APIRouter(prefix="/conflicts", tags=["conflicts"])


@router.get(
    "",
    response_model=SystemConflictSummary,
    summary="List all system conflicts",
    description="Aggregates all active owner mismatches, spatial overlaps, and overdue mutations across the state."
)
def get_all_conflicts(db: Session = Depends(get_db)):
    return trust_engine.get_system_conflicts(db)


@router.get(
    "/{ulpin}",
    response_model=ConflictReport,
    summary="Check conflicts for a specific parcel ULPIN",
    description="Inspects multi-department data for the given ULPIN and returns structured mismatch or integrity reports."
)
def get_parcel_conflicts(ulpin: str, db: Session = Depends(get_db)):
    parcel = crud.get_parcel_by_ulpin(db, ulpin)
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel with ULPIN '{ulpin}' not found")

    trust_profile = trust_engine.check_parcel_trust(ulpin, db)
    conflicts = trust_profile["conflicts"]

    if conflicts:
        # Return the highest severity conflict
        return conflicts[0]

    return ConflictReport(
        ulpin=ulpin,
        has_conflict=False,
        conflict_type="NONE",
        severity="NONE",
        involved_departments=[],
        conflicting_values={},
        status="CLEAR",
        details="No conflicts or discrepancies detected for this parcel title."
    )
