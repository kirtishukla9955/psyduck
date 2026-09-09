"""
CRUD functions — data access layer between API routes and PostgreSQL/PostGIS.
Keeps route handlers thin and facilitates automated testing.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
from shapely.geometry import Polygon
from geoalchemy2.shape import from_shape
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Parcel, DepartmentRecord, Mutation
from app.utils.ulpin import generate_ulpin


# ==========================================
# PARCEL CRUD
# ==========================================

def create_parcel(
    db: Session,
    coordinates: list,
    owner_name: str,
    state_code: str = "CH",
    **kwargs
) -> Parcel:
    """
    Creates a new Parcel from coordinate ring and auto-generates deterministic ULPIN.
    coordinates: list of (lng, lat) tuples forming a closed polygon ring.
    """
    polygon = Polygon(coordinates)
    ulpin = generate_ulpin(polygon, state_code)

    # Approximate sqm calculation: 1 deg lat/lng approx 111,000m
    area_sqm = kwargs.pop("area_sqm", None) or (polygon.area * 111000 * 111000)

    parcel = Parcel(
        ulpin=ulpin,
        geometry=from_shape(polygon, srid=4326),
        area_sqm=round(area_sqm, 2),
        owner_name=owner_name.strip(),
        state=state_code,
        **kwargs
    )
    db.add(parcel)
    db.commit()
    db.refresh(parcel)
    return parcel


def get_parcel_by_ulpin(db: Session, ulpin: str) -> Optional[Parcel]:
    """Fetch parcel by unique 14-character ULPIN."""
    return db.query(Parcel).filter(Parcel.ulpin == ulpin).first()


def list_parcels(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    owner_name: Optional[str] = None,
    state: Optional[str] = None
) -> list[Parcel]:
    """Retrieve paginated list of parcels with optional filters."""
    query = db.query(Parcel)
    if owner_name:
        query = query.filter(Parcel.owner_name.ilike(f"%{owner_name}%"))
    if state:
        query = query.filter(Parcel.state == state)
    return query.offset(skip).limit(limit).all()


def get_parcels_in_bbox(
    db: Session,
    min_lng: float,
    min_lat: float,
    max_lng: float,
    max_lat: float
) -> list[Parcel]:
    """
    Parcels whose geometry falls inside a bounding box viewport.
    Consumed by P1 (GIS/Leaflet map module) for viewport rendering.
    """
    bbox = func.ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    return db.query(Parcel).filter(func.ST_Intersects(Parcel.geometry, bbox)).all()


def find_overlapping_parcels(db: Session, parcel: Parcel) -> list[Parcel]:
    """
    Finds other parcels whose polygon intersects or overlaps this one.
    Used as an automated spatial fraud signal (double registration / encroachment).
    """
    return (
        db.query(Parcel)
        .filter(Parcel.id != parcel.id, func.ST_Overlaps(Parcel.geometry, parcel.geometry))
        .all()
    )


# ==========================================
# DEPARTMENT RECORD CRUD
# ==========================================

def create_department_record(
    db: Session,
    ulpin: str,
    department_name: str,
    owner_name: str,
    land_use: Optional[str] = None,
    area_sqm: Optional[float] = None,
    record_status: str = "ACTIVE",
    record_details: Optional[dict] = None
) -> DepartmentRecord:
    """Adds a department-specific land record for cross-verification."""
    record = DepartmentRecord(
        ulpin=ulpin,
        department_name=department_name.strip(),
        owner_name=owner_name.strip(),
        land_use=land_use,
        area_sqm=area_sqm,
        record_status=record_status,
        record_details=record_details or {}
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_department_records_by_ulpin(db: Session, ulpin: str) -> list[DepartmentRecord]:
    """Get all departmental records registered for a ULPIN."""
    return db.query(DepartmentRecord).filter(DepartmentRecord.ulpin == ulpin).all()


# ==========================================
# MUTATION CRUD
# ==========================================

def create_mutation(
    db: Session,
    ulpin: str,
    proposed_new_owner: str,
    old_owner: Optional[str] = None,
    department: str = "Revenue",
    sla_days: int = 7,
    status: str = "PENDING",
    remarks: Optional[str] = None,
    submitted_at: Optional[datetime] = None,
    mutation_id: Optional[str] = None
) -> Mutation:
    """Creates a new mutation application with statutory SLA deadline."""
    if not old_owner:
        parcel = get_parcel_by_ulpin(db, ulpin)
        old_owner = parcel.owner_name if parcel else "Unknown"

    now = submitted_at or datetime.now(timezone.utc)
    deadline = now + timedelta(days=sla_days)

    if not mutation_id:
        # Generate readable sequential mutation ID
        count = db.query(func.count(Mutation.id)).scalar() or 0
        mutation_id = f"MUT-2026-{(count + 1):04d}"

    mutation = Mutation(
        mutation_id=mutation_id,
        ulpin=ulpin,
        old_owner=old_owner.strip(),
        proposed_new_owner=proposed_new_owner.strip(),
        department=department.strip(),
        submitted_at=now,
        sla_days=sla_days,
        sla_deadline=deadline,
        status=status,
        remarks=remarks
    )
    db.add(mutation)
    db.commit()
    db.refresh(mutation)
    return mutation


def get_mutation_by_id(db: Session, mutation_id: str) -> Optional[Mutation]:
    """Fetch mutation by its business identifier (e.g. MUT-2026-0001)."""
    return db.query(Mutation).filter(Mutation.mutation_id == mutation_id).first()


def list_mutations(
    db: Session,
    ulpin: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> list[Mutation]:
    """List mutations with optional ULPIN and status filters."""
    query = db.query(Mutation)
    if ulpin:
        query = query.filter(Mutation.ulpin == ulpin)
    if status:
        query = query.filter(Mutation.status == status.upper())
    return query.order_by(Mutation.submitted_at.desc()).offset(skip).limit(limit).all()


def update_mutation(
    db: Session,
    mutation: Mutation,
    status: Optional[str] = None,
    remarks: Optional[str] = None
) -> Mutation:
    """Updates mutation status (e.g. APPROVED, REJECTED) and logs resolution timestamp."""
    if status:
        status_upper = status.upper()
        mutation.status = status_upper
        if status_upper in ["APPROVED", "REJECTED"]:
            mutation.resolved_at = datetime.now(timezone.utc)
            # If approved, update parcel owner
            if status_upper == "APPROVED":
                parcel = get_parcel_by_ulpin(db, mutation.ulpin)
                if parcel:
                    parcel.owner_name = mutation.proposed_new_owner
                    db.add(parcel)

    if remarks is not None:
        mutation.remarks = remarks

    db.add(mutation)
    db.commit()
    db.refresh(mutation)
    return mutation
