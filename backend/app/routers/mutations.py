"""
Mutation APIs — handles land title ownership transfer requests,
enforces statutory SLA timers, and exposes administrative action endpoints.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud
from app.services import trust_engine
from app.schemas import MutationCreate, MutationUpdate, MutationOut

router = APIRouter(prefix="/mutations", tags=["mutations"])


def _format_mutation_out(mutation) -> MutationOut:
    sla_info = trust_engine.evaluate_mutation_sla(mutation)
    return MutationOut(
        id=mutation.id,
        mutation_id=mutation.mutation_id,
        ulpin=mutation.ulpin,
        old_owner=mutation.old_owner,
        proposed_new_owner=mutation.proposed_new_owner,
        department=mutation.department,
        submitted_at=mutation.submitted_at,
        sla_days=mutation.sla_days,
        sla_deadline=mutation.sla_deadline,
        status=mutation.status,
        resolved_at=mutation.resolved_at,
        remarks=mutation.remarks,
        sla_status=sla_info["sla_status"],
        days_remaining=sla_info["days_remaining"],
        days_overdue=sla_info["days_overdue"]
    )


@router.get(
    "",
    response_model=list[MutationOut],
    summary="List land mutations",
    description="Lists mutation applications with live SLA tracking. Supports filtering by ULPIN, status, and overdue breach."
)
def get_mutations(
    ulpin: Optional[str] = Query(None, description="Filter by parcel ULPIN"),
    status: Optional[str] = Query(None, description="Filter by status (PENDING, UNDER_REVIEW, APPROVED, REJECTED)"),
    overdue_only: bool = Query(False, description="Filter only mutations that have breached statutory SLA"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    mutations = crud.list_mutations(db, ulpin=ulpin, status=status, skip=skip, limit=limit)
    formatted = [_format_mutation_out(m) for m in mutations]

    if overdue_only:
        formatted = [m for m in formatted if m.sla_status == "OVERDUE"]

    return formatted


@router.get(
    "/{mutation_id}",
    response_model=MutationOut,
    summary="Get mutation details",
    description="Fetches full details for a mutation including live SLA timer countdown."
)
def get_mutation(mutation_id: str, db: Session = Depends(get_db)):
    mutation = crud.get_mutation_by_id(db, mutation_id)
    if not mutation:
        raise HTTPException(status_code=404, detail=f"Mutation '{mutation_id}' not found")
    return _format_mutation_out(mutation)


@router.post(
    "",
    response_model=MutationOut,
    status_code=201,
    summary="Submit new land mutation application",
    description="Registers an ownership change request. Automatically calculates SLA deadline based on state statutory policy."
)
def create_mutation(payload: MutationCreate, db: Session = Depends(get_db)):
    parcel = crud.get_parcel_by_ulpin(db, payload.ulpin)
    if not parcel:
        raise HTTPException(
            status_code=404,
            detail=f"Cannot initiate mutation: Parcel '{payload.ulpin}' does not exist"
        )

    mutation = crud.create_mutation(
        db,
        ulpin=payload.ulpin,
        proposed_new_owner=payload.proposed_new_owner,
        old_owner=payload.old_owner or parcel.owner_name,
        department=payload.department or "Revenue",
        sla_days=payload.sla_days or trust_engine.DEFAULT_MUTATION_SLA_DAYS,
        remarks=payload.remarks
    )
    return _format_mutation_out(mutation)


@router.patch(
    "/{mutation_id}",
    response_model=MutationOut,
    summary="Update or resolve mutation",
    description="Allows administrative officers to update status (UNDER_REVIEW, APPROVED, REJECTED) or append remarks."
)
def update_mutation_status(
    mutation_id: str,
    payload: MutationUpdate,
    db: Session = Depends(get_db)
):
    mutation = crud.get_mutation_by_id(db, mutation_id)
    if not mutation:
        raise HTTPException(status_code=404, detail=f"Mutation '{mutation_id}' not found")

    valid_statuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]
    if payload.status and payload.status.upper() not in valid_statuses:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid status '{payload.status}'. Allowed values: {valid_statuses}"
        )

    updated = crud.update_mutation(
        db,
        mutation=mutation,
        status=payload.status,
        remarks=payload.remarks
    )
    return _format_mutation_out(updated)
