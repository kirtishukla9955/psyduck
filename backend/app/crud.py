from datetime import datetime, timezone, timedelta
from typing import Optional, Any
from shapely.geometry import Polygon, box
from geoalchemy2.shape import from_shape, to_shape
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Parcel, DepartmentRecord, Mutation
from app.utils.ulpin import generate_ulpin


# ==========================================
# PARCEL CRUD
# ==========================================

def create_parcel(
    db: Session,
    polygon: Any = None,
    coordinates: Optional[list] = None,
    owner_name: Optional[str] = None,
    state_code: str = "CH",
    ulpin: Optional[str] = None,
    centroid_lat: Optional[float] = None,
    centroid_lon: Optional[float] = None,
    area_sqm: Optional[float] = None,
    **kwargs
) -> Parcel:
    if polygon is None and coordinates:
        polygon = Polygon(coordinates)

    if polygon is None:
        raise ValueError("Either polygon or coordinates must be provided.")

    if not ulpin:
        ulpin = generate_ulpin(polygon, state_code)

    if centroid_lat is None:
        centroid_lat = round(polygon.centroid.y, 7)
    if centroid_lon is None:
        centroid_lon = round(polygon.centroid.x, 7)

    if area_sqm is None:
        area_sqm = round(polygon.area * 111320 * 111320, 2)

    parcel = Parcel(
        ulpin=ulpin,
        geometry=from_shape(polygon, srid=4326),
        area_sqm=round(area_sqm, 2),
        owner_name=owner_name.strip() if owner_name else None,
        state=state_code,
        centroid_lat=centroid_lat,
        centroid_lon=centroid_lon,
        **kwargs
    )
    db.add(parcel)
    db.commit()
    db.refresh(parcel)
    return parcel


def update_parcel(
    db: Session,
    parcel: Parcel,
    update_data: dict
) -> Parcel:
    for key, val in update_data.items():
        if val is not None and hasattr(parcel, key):
            setattr(parcel, key, val)
    db.commit()
    db.refresh(parcel)
    return parcel


def get_parcel_by_ulpin(db: Session, ulpin: str) -> Optional[Parcel]:
    clean = ulpin.strip().lower()
    return db.query(Parcel).filter(func.lower(func.trim(Parcel.ulpin)) == clean).first()


def list_parcels(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    owner_name: Optional[str] = None,
    state: Optional[str] = None
) -> list[Parcel]:
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
    max_lat: float,
    limit: int = 500
) -> list[Parcel]:
    if db.bind and db.bind.dialect.name == "sqlite":
        pad_lat = (max_lat - min_lat) * 0.15 + 0.002
        pad_lng = (max_lng - min_lng) * 0.15 + 0.002
        candidates = db.query(Parcel).filter(
            Parcel.centroid_lat >= (min_lat - pad_lat),
            Parcel.centroid_lat <= (max_lat + pad_lat),
            Parcel.centroid_lon >= (min_lng - pad_lng),
            Parcel.centroid_lon <= (max_lng + pad_lng)
        ).limit(limit).all()

        if not candidates:
            candidates = db.query(Parcel).filter(Parcel.centroid_lat.is_(None)).limit(limit).all()

        bbox_poly = box(min_lng, min_lat, max_lng, max_lat)
        result = []
        for p in candidates:
            if p.geometry:
                try:
                    geom = to_shape(p.geometry)
                    if geom.intersects(bbox_poly):
                        result.append(p)
                except Exception:
                    pass
        return result

    bbox = func.ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    return db.query(Parcel).filter(func.ST_Intersects(Parcel.geometry, bbox)).limit(limit).all()


def find_overlapping_parcels(db: Session, parcel: Parcel) -> list[Parcel]:
    if db.bind and db.bind.dialect.name == "sqlite":
        target_geom = to_shape(parcel.geometry) if parcel.geometry else None
        if not target_geom:
            return []
        all_other = db.query(Parcel).filter(Parcel.id != parcel.id).limit(100).all()
        result = []
        for other in all_other:
            if other.geometry:
                try:
                    other_geom = to_shape(other.geometry)
                    if other_geom.overlaps(target_geom) or other_geom.intersects(target_geom):
                        result.append(other)
                except Exception:
                    pass
        return result

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
    clean = ulpin.strip().lower()
    return db.query(DepartmentRecord).filter(func.lower(func.trim(DepartmentRecord.ulpin)) == clean).all()


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
    if not old_owner:
        parcel = get_parcel_by_ulpin(db, ulpin)
        old_owner = parcel.owner_name if parcel else "Unknown"

    now = submitted_at or datetime.now(timezone.utc)
    deadline = now + timedelta(days=sla_days)

    if not mutation_id:
        count = db.query(func.count(Mutation.id)).scalar() or 0
        mutation_id = f"MUT-2026-{(count + 1):04d}"

    mutation = Mutation(
        mutation_id=mutation_id,
        ulpin=ulpin,
        old_owner=old_owner.strip() if old_owner else "Unknown",
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
    return db.query(Mutation).filter(Mutation.mutation_id == mutation_id).first()


def list_mutations(
    db: Session,
    ulpin: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> list[Mutation]:
    query = db.query(Mutation)
    if ulpin:
        query = query.filter(func.lower(func.trim(Mutation.ulpin)) == ulpin.strip().lower())
    if status:
        query = query.filter(Mutation.status == status.upper())
    return query.order_by(Mutation.submitted_at.desc()).offset(skip).limit(limit).all()


def update_mutation(
    db: Session,
    mutation: Mutation,
    status: Optional[str] = None,
    remarks: Optional[str] = None
) -> Mutation:
    if status:
        status_upper = status.upper()
        mutation.status = status_upper
        if status_upper in ["APPROVED", "REJECTED"]:
            mutation.resolved_at = datetime.now(timezone.utc)
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


# ==========================================
# CITIZEN GRIEVANCE CRUD
# ==========================================

from app.models import CitizenGrievance

def create_grievance(
    db: Session,
    ulpin: str,
    citizen_name: Optional[str] = None,
    phone: Optional[str] = None,
    discrepancy_type: str = "OTHER",
    description: Optional[str] = None
) -> CitizenGrievance:
    count = db.query(func.count(CitizenGrievance.id)).scalar() or 0
    tracking_id = f"GRV-{(count + 1):04d}"

    grievance = CitizenGrievance(
        tracking_id=tracking_id,
        ulpin=ulpin,
        citizen_name=citizen_name,
        phone=phone,
        discrepancy_type=discrepancy_type,
        description=description
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)
    return grievance

def list_grievances(db: Session, limit: int = 100) -> list[CitizenGrievance]:
    return db.query(CitizenGrievance).order_by(CitizenGrievance.created_at.desc()).limit(limit).all()
