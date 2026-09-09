"""
POST /bank/check-loan/{ulpin} — the demo centerpiece. A bank submits a ULPIN
and instantly gets back ownership, mortgage status, an overlap-based fraud
check, and a loan decision. This is what makes "interoperability" concrete
in your demo instead of just a slide.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud

router = APIRouter(prefix="/bank", tags=["bank"])


@router.post("/check-loan/{ulpin}")
def check_loan_eligibility(ulpin: str, db: Session = Depends(get_db)):
    parcel = crud.get_parcel_by_ulpin(db, ulpin)
    if not parcel:
        raise HTTPException(404, "Parcel not found")

    encumbrance = parcel.encumbrance_data or {}
    already_mortgaged = encumbrance.get("mortgaged", False)

    overlaps = crud.find_overlapping_parcels(db, parcel)
    fraud_risk = len(overlaps) > 0

    if already_mortgaged:
        decision = "REJECTED"
        reason = (
            f"Parcel already mortgaged with {encumbrance.get('bank', 'another bank')} "
            f"(loan {encumbrance.get('loan_id', 'unknown')})"
        )
    elif fraud_risk:
        decision = "FLAGGED FOR REVIEW"
        reason = (
            f"Parcel geometry overlaps {len(overlaps)} other registered parcel(s) — "
            "possible duplicate/fraudulent record"
        )
    else:
        decision = "APPROVED"
        reason = "No existing mortgage, no geometry conflicts"

    return {
        "ulpin": parcel.ulpin,
        "owner_name": parcel.owner_name,
        "mortgaged": already_mortgaged,
        "fraud_risk": fraud_risk,
        "overlapping_ulpins": [o.ulpin for o in overlaps],
        "decision": decision,
        "reason": reason,
    }
