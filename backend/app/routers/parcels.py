"""
Parcel APIs — consumed by:
- P1 (GIS/Map): Region GeoJSON (?region=...) and viewport bounding box queries (?bbox=...)
- P3 (Citizen Portal): Parcel lookup, title verification, property tax view
- P4 (Admin Dashboard): Full land parcel inventory and registration
"""
import json
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping

from app.database import get_db
from app import crud
from app.models import Parcel
from app.services import trust_engine
from app.schemas import ParcelCreate, ParcelOut, ParcelSummary

router = APIRouter(prefix="/parcels", tags=["parcels"])


def _format_parcel_out(parcel, db: Session) -> ParcelOut:
    """Helper to convert DB Parcel to ParcelOut with GeoJSON geometry and trust status."""
    geom = to_shape(parcel.geometry)
    trust_profile = trust_engine.check_parcel_trust(parcel.ulpin, db)

    return ParcelOut(
        ulpin=parcel.ulpin,
        geometry=mapping(geom),
        owner_name=parcel.owner_name,
        area_sqm=float(parcel.area_sqm) if parcel.area_sqm else None,
        village_or_city=parcel.village_or_city,
        state=parcel.state,
        land_use=parcel.land_use,
        ror_data=parcel.ror_data,
        encumbrance_data=parcel.encumbrance_data,
        property_tax_due=float(parcel.property_tax_due or 0.0),
        trust_status=trust_profile["trust_status"],
        active_conflicts_count=len(trust_profile["conflicts"])
    )


def _region_feature_collection(db: Session, region_key: str, limit: int) -> dict:
    """
    Builds a GeoJSON FeatureCollection for one region straight from PostGIS, using
    ST_AsGeoJSON() for the geometry so coordinate conversion/ordering is handled by
    PostGIS itself rather than re-implemented in Python.

    owner_name / land_use / ror_data / encumbrance_data are included whenever this row
    has them (e.g. the seeded demo parcels), but are left null for imported cadastral
    rows that don't carry ownership — the frontend still joins owner/Record-of-Rights
    data from data/records.json by ULPIN, exactly as it did before this change.
    """
    rows = (
        db.query(Parcel, func.ST_AsGeoJSON(Parcel.geometry))
        .filter(Parcel.region_key == region_key)
        .order_by(Parcel.id)
        .limit(limit)
        .all()
    )

    features = []
    for p, geojson_str in rows:
        features.append({
            "type": "Feature",
            "geometry": json.loads(geojson_str),
            "properties": {
                "ulpin": p.ulpin,
                "parcel_id": p.parcel_id,
                "khasra_no": p.khasra_no,
                "sector": p.sector,
                "village_or_city": p.village_or_city,
                "region": p.region_key,
                "state": p.state,
                "area_sqm": float(p.area_sqm) if p.area_sqm is not None else None,
                "survey_agency": p.survey_agency,
                "survey_date": p.survey_date,
                "dispute_flag": p.dispute_flag,
                "boundary_source": p.boundary_source
                or "Simplified demo rectangle — not a certified cadastral boundary",
                "owner_name": p.owner_name,
                "land_use": p.land_use,
                "ror_data": p.ror_data,
                "encumbrance_data": p.encumbrance_data,
            },
        })
    return {"type": "FeatureCollection", "features": features}


@router.get(
    "",
    summary="List parcels, fetch a region's GeoJSON, or query by map bounding box",
    description=(
        "Three modes on the same endpoint:\n"
        "1. `?region=chandigarh` (or any config/regions.js key) returns a GeoJSON "
        "FeatureCollection for that region, sourced from PostGIS via ST_AsGeoJSON().\n"
        "2. `?bbox=minLng,minLat,maxLng,maxLat` returns a GeoJSON FeatureCollection for "
        "that viewport (used by ad-hoc map queries).\n"
        "3. With neither, returns a paginated list of parcels for the citizen/admin portals."
    )
)
def get_parcels(
    region: Optional[str] = Query(None, description="Region key from the frontend's config/regions.js, e.g. 'chandigarh', 'tamil_nadu'"),
    bbox: Optional[str] = Query(None, description="Bounding box filter: minLng,minLat,maxLng,maxLat"),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    owner_name: Optional[str] = Query(None, description="Search parcels by owner name"),
    state: Optional[str] = Query(None, description="Filter by state code (e.g. CH, PB, HR, TN)"),
    db: Session = Depends(get_db),
) -> Any:
    if region:
        return _region_feature_collection(db, region, limit)

    if bbox:
        try:
            min_lng, min_lat, max_lng, max_lat = map(float, bbox.split(","))
        except ValueError:
            raise HTTPException(400, "bbox must be in format 'minLng,minLat,maxLng,maxLat'")

        parcels = crud.get_parcels_in_bbox(db, min_lng, min_lat, max_lng, max_lat)
        features = []
        for p in parcels:
            geom = to_shape(p.geometry)
            features.append({
                "type": "Feature",
                "geometry": mapping(geom),
                "properties": {
                    "ulpin": p.ulpin,
                    "owner_name": p.owner_name,
                    "land_use": p.land_use,
                    "area_sqm": float(p.area_sqm) if p.area_sqm else None,
                    "mortgaged": (p.encumbrance_data or {}).get("mortgaged", False),
                },
            })
        return {"type": "FeatureCollection", "features": features}

    parcels = crud.list_parcels(db, skip=skip, limit=limit, owner_name=owner_name, state=state)
    result = []
    for p in parcels:
        trust_profile = trust_engine.check_parcel_trust(p.ulpin, db)
        result.append(
            ParcelSummary(
                ulpin=p.ulpin,
                owner_name=p.owner_name,
                area_sqm=float(p.area_sqm) if p.area_sqm else None,
                land_use=p.land_use,
                village_or_city=p.village_or_city,
                state=p.state,
                trust_status=trust_profile["trust_status"],
                created_at=p.created_at
            )
        )
    return result


@router.get(
    "/{ulpin}",
    response_model=ParcelOut,
    summary="Get single parcel by ULPIN",
    description="Returns comprehensive parcel metadata, GeoJSON boundary, and Trust Engine verification status."
)
def get_parcel_by_ulpin(ulpin: str, db: Session = Depends(get_db)):
    parcel = crud.get_parcel_by_ulpin(db, ulpin)
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel with ULPIN '{ulpin}' not found")
    return _format_parcel_out(parcel, db)


@router.post(
    "",
    response_model=ParcelOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new parcel",
    description="Registers a new land parcel polygon, auto-computes 14-digit ULPIN, and initializes trust layers."
)
def create_new_parcel(payload: ParcelCreate, db: Session = Depends(get_db)):
    if len(payload.coordinates) < 4:
        raise HTTPException(
            status_code=422,
            detail="A polygon ring must contain at least 4 coordinate tuples (first and last matching)."
        )

    try:
        parcel = crud.create_parcel(
            db,
            coordinates=payload.coordinates,
            owner_name=payload.owner_name,
            state_code=payload.state_code,
            village_or_city=payload.village_or_city,
            land_use=payload.land_use,
            ror_data=payload.ror_data,
            encumbrance_data=payload.encumbrance_data,
            property_tax_due=payload.property_tax_due or 0.0
        )
        return _format_parcel_out(parcel, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to register parcel: {str(e)}")
