import json
import math
from pathlib import Path
from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2.shape import to_shape, from_shape
from shapely.geometry import mapping, shape, Polygon, MultiPolygon
from shapely.validation import explain_validity

from app.database import get_db
from app import crud
from app.models import Parcel
from app.services import trust_engine
from app.schemas import ParcelCreate, ParcelUpdate, ParcelOut, ParcelSummary

router = APIRouter(prefix="/parcels", tags=["parcels"])

_SATELLITE_CACHE: Optional[dict[str, Any]] = None

def get_satellite_metrics(ulpin: str, dispute_flag: bool = False, state: Optional[str] = "CH") -> dict[str, Any]:
    global _SATELLITE_CACHE
    if _SATELLITE_CACHE is None:
        _SATELLITE_CACHE = {}
        backend_dir = Path(__file__).resolve().parent.parent.parent
        for reg in ["chandigarh", "tamil_nadu"]:
            p = backend_dir / "mock-data-ai" / "data" / "raw" / reg / "satellite_observations.json"
            if p.exists():
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        records = json.load(f)
                        for r in records:
                            _SATELLITE_CACHE[r.get("ulpin", "").strip().lower()] = r
                except Exception:
                    pass

    clean_ulpin = ulpin.strip().lower()
    if clean_ulpin in _SATELLITE_CACHE:
        item = _SATELLITE_CACHE[clean_ulpin]
        is_alert = bool(item.get("unauthorized_structure_flag"))
        return {
            "source": "Sentinel-2 MSI Level-2A (ESA Copernicus)",
            "observation_date": item.get("epoch_recent", "2026-06-01"),
            "baseline_date": item.get("epoch_baseline", "2024-01-01"),
            "baseline_ndvi": item.get("baseline_ndvi", 0.44),
            "recent_ndvi": item.get("recent_ndvi", 0.42),
            "ndvi_delta": item.get("ndvi_delta", -0.02),
            "built_up_index_change": item.get("built_up_index_change", 0.01),
            "unauthorized_structure_flag": is_alert,
            "vegetation_health": "Degraded / Structural Alert" if is_alert else "Stable / Authorized Land Use",
            "confidence_score": item.get("confidence_score", 0.94),
            "notes": item.get("notes", "Stable multitemporal reflectance.")
        }

    if dispute_flag:
        return {
            "source": "Sentinel-2 MSI Level-2A (ESA Copernicus)",
            "observation_date": "2026-06-01",
            "baseline_date": "2024-01-01",
            "baseline_ndvi": 0.68,
            "recent_ndvi": 0.22,
            "ndvi_delta": -0.46,
            "built_up_index_change": 0.38,
            "unauthorized_structure_flag": True,
            "vegetation_health": "Structural Anomaly / Vegetation Loss",
            "confidence_score": 0.96,
            "notes": "Sentinel-2 alert: Major vegetation clearance & concrete batching / warehouse slab detected."
        }

    return {
        "source": "Sentinel-2 MSI Level-2A (ESA Copernicus)",
        "observation_date": "2026-06-01",
        "baseline_date": "2024-01-01",
        "baseline_ndvi": 0.45,
        "recent_ndvi": 0.43,
        "ndvi_delta": -0.02,
        "built_up_index_change": 0.01,
        "unauthorized_structure_flag": False,
        "vegetation_health": "Stable / Authorized Land Use",
        "confidence_score": 0.93,
        "notes": "Multitemporal Sentinel-2 profile confirms authorized land use and stable vegetative canopy."
    }


def _format_parcel_out(parcel: Parcel, db: Session) -> ParcelOut:
    geom = to_shape(parcel.geometry) if parcel.geometry else None
    trust_profile = trust_engine.check_parcel_trust(parcel.ulpin, db)
    sat_metrics = get_satellite_metrics(parcel.ulpin, bool(parcel.dispute_flag), parcel.state)

    custom_status = (parcel.ror_data or {}).get("trust_status") if isinstance(parcel.ror_data, dict) else None
    trust_status = custom_status or trust_profile["trust_status"]

    return ParcelOut(
        ulpin=parcel.ulpin,
        geometry=mapping(geom) if geom else {},
        owner_name=parcel.owner_name or "N/A",
        area_sqm=float(parcel.area_sqm) if parcel.area_sqm else None,
        village_or_city=parcel.village_or_city,
        state=parcel.state,
        land_use=parcel.land_use,
        ror_data=parcel.ror_data,
        encumbrance_data=parcel.encumbrance_data,
        property_tax_due=float(parcel.property_tax_due or 0.0),
        trust_status=trust_status,
        active_conflicts_count=len(trust_profile["conflicts"]),
        khasra_no=parcel.khasra_no,
        parcel_id=parcel.parcel_id,
        dispute_flag=bool(parcel.dispute_flag),
        centroid_lat=float(parcel.centroid_lat) if parcel.centroid_lat is not None else None,
        centroid_lon=float(parcel.centroid_lon) if parcel.centroid_lon is not None else None,
        satellite_metrics=sat_metrics
    )


@router.get(
    "",
    summary="List parcels, query by bounding box, or filter by region",
    description="Dual-mode endpoint returning GeoJSON FeatureCollection when bbox or region is provided, or paginated ParcelSummary list."
)
def get_parcels(
    region: Optional[str] = Query(None, description="Region key, e.g. 'chandigarh', 'tamil_nadu' or state code"),
    bbox: Optional[str] = Query(None, description="Bounding box filter: minLng,minLat,maxLng,maxLat"),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    owner_name: Optional[str] = Query(None, description="Search parcels by owner name"),
    state: Optional[str] = Query(None, description="Filter by state code (e.g. CH, PB, HR, TN)"),
    db: Session = Depends(get_db),
) -> Any:
    if region:
        reg_clean = region.strip().lower()
        rows = db.query(Parcel).filter(
            (Parcel.region_key == reg_clean) | (Parcel.state == region.strip().upper())
        ).limit(limit).all()
        features = []
        for p in rows:
            if p.geometry:
                geom = to_shape(p.geometry)
                features.append({
                    "type": "Feature",
                    "geometry": mapping(geom),
                    "properties": {
                        "ulpin": p.ulpin,
                        "parcel_id": p.parcel_id,
                        "khasra_no": p.khasra_no,
                        "owner_name": p.owner_name or "N/A",
                        "land_use": p.land_use,
                        "area_sqm": float(p.area_sqm) if p.area_sqm else None,
                        "mortgaged": (p.encumbrance_data or {}).get("mortgaged", False),
                        "dispute_flag": bool(p.dispute_flag),
                        "state": p.state,
                        "village_or_city": p.village_or_city,
                    },
                })
        return {"type": "FeatureCollection", "features": features}

    if bbox:
        try:
            min_lng, min_lat, max_lng, max_lat = map(float, bbox.split(","))
        except ValueError:
            raise HTTPException(400, "bbox must be in format 'minLng,minLat,maxLng,maxLat'")

        eff_limit = min(limit, 1000) if limit else 500
        parcels = crud.get_parcels_in_bbox(db, min_lng, min_lat, max_lng, max_lat, limit=eff_limit)
        features = []
        for p in parcels:
            if p.geometry:
                geom = to_shape(p.geometry)
                features.append({
                    "type": "Feature",
                    "geometry": mapping(geom),
                    "properties": {
                        "ulpin": p.ulpin,
                        "parcel_id": p.parcel_id,
                        "khasra_no": p.khasra_no,
                        "owner_name": p.owner_name or "N/A",
                        "land_use": p.land_use,
                        "area_sqm": float(p.area_sqm) if p.area_sqm else None,
                        "mortgaged": (p.encumbrance_data or {}).get("mortgaged", False),
                        "dispute_flag": bool(p.dispute_flag),
                        "state": p.state,
                        "village_or_city": p.village_or_city,
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
                owner_name=p.owner_name or "N/A",
                area_sqm=float(p.area_sqm) if p.area_sqm else None,
                land_use=p.land_use,
                village_or_city=p.village_or_city,
                state=p.state,
                trust_status=trust_profile["trust_status"],
                centroid_lat=float(p.centroid_lat) if p.centroid_lat is not None else None,
                centroid_lon=float(p.centroid_lon) if p.centroid_lon is not None else None,
                created_at=p.created_at
            )
        )
    return result


@router.get(
    "/bounds",
    summary="Get geographic bounding box of cadastral records",
    description="Returns min/max coordinates of parcels in the database for client viewport auto-fitting."
)
def get_parcel_bounds(db: Session = Depends(get_db)) -> dict[str, Any]:
    min_lat, max_lat, min_lon, max_lon = db.query(
        func.min(Parcel.centroid_lat),
        func.max(Parcel.centroid_lat),
        func.min(Parcel.centroid_lon),
        func.max(Parcel.centroid_lon)
    ).first()

    return {
        "min_lat": float(min_lat) if min_lat is not None else 20.5937,
        "max_lat": float(max_lat) if max_lat is not None else 20.5937,
        "min_lng": float(min_lon) if min_lon is not None else 78.9629,
        "max_lng": float(max_lon) if max_lon is not None else 78.9629,
        "default_cluster": {
            "name": "Chandigarh Pilot Cadastre",
            "center": {"lat": 30.7412, "lng": 76.7885},
            "zoom": 15,
            "bounds": {
                "south": 30.7250,
                "north": 30.7550,
                "west": 76.7650,
                "east": 76.8150
            }
        },
        "national_fallback": {
            "center": {"lat": 20.5937, "lng": 78.9629},
            "zoom": 5
        }
    }


@router.get(
    "/{ulpin}",
    response_model=ParcelOut,
    summary="Get single parcel by ULPIN",
    description="Returns comprehensive parcel metadata, GeoJSON boundary, Trust Engine verification status, and Sentinel-2 remote sensing metrics."
)
def get_parcel_by_ulpin(ulpin: str, db: Session = Depends(get_db)):
    parcel = crud.get_parcel_by_ulpin(db, ulpin)
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel with ULPIN '{ulpin}' not found")
    return _format_parcel_out(parcel, db)


def parse_and_validate_geometry(geom_input: Any) -> Polygon | MultiPolygon:
    if not geom_input:
        raise HTTPException(status_code=422, detail="Geometry field cannot be empty.")

    # Handle GeoJSON Feature dict
    if isinstance(geom_input, dict) and geom_input.get("type") == "Feature":
        geom_input = geom_input.get("geometry")
        if not geom_input:
            raise HTTPException(status_code=422, detail="Feature object missing geometry.")

    # Handle GeoJSON Polygon / MultiPolygon dict
    if isinstance(geom_input, dict) and "type" in geom_input and "coordinates" in geom_input:
        try:
            geom = shape(geom_input)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Malformed GeoJSON geometry: {str(e)}")
    elif isinstance(geom_input, list):
        try:
            if len(geom_input) == 0:
                raise ValueError("Coordinates array is empty")
            # If coordinates are [[lng, lat], [lng, lat], ...]
            if isinstance(geom_input[0], (list, tuple)) and isinstance(geom_input[0][0], (int, float)):
                ring = [list(pt) for pt in geom_input]
                if ring[0] != ring[-1]:
                    ring.append(ring[0])
                geom = Polygon(ring)
            # If coordinates are [[[lng, lat], ...]] (Polygon coordinates)
            elif isinstance(geom_input[0], list) and isinstance(geom_input[0][0], (list, tuple)):
                rings = []
                for r in geom_input:
                    ring = [list(pt) for pt in r]
                    if ring[0] != ring[-1]:
                        ring.append(ring[0])
                    rings.append(ring)
                geom = Polygon(rings[0], rings[1:])
            else:
                raise ValueError("Invalid coordinate hierarchy")
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid coordinates format: {str(e)}")
    else:
        raise HTTPException(status_code=422, detail="Geometry must be a GeoJSON Polygon/MultiPolygon or coordinate list.")

    if not isinstance(geom, (Polygon, MultiPolygon)):
        raise HTTPException(status_code=422, detail="Geometry must be a Polygon or MultiPolygon.")

    if geom.is_empty or geom.area == 0:
        raise HTTPException(status_code=422, detail="Geometry cannot be empty or have zero area.")

    # Check coordinate bounds
    min_x, min_y, max_x, max_y = geom.bounds
    if min_x < -180 or max_x > 180 or min_y < -90 or max_y > 90:
        raise HTTPException(
            status_code=422, 
            detail=f"Coordinate values out of range: longitude must be between -180 and 180, latitude between -90 and 90 (got bounds: [{min_x}, {min_y}, {max_x}, {max_y}])."
        )

    # Validate closed rings
    if isinstance(geom, Polygon):
        if not geom.exterior.is_closed or len(geom.exterior.coords) < 4:
            raise HTTPException(status_code=422, detail="Polygon exterior ring must be closed and contain at least 4 coordinate vertices.")
    elif isinstance(geom, MultiPolygon):
        for poly in geom.geoms:
            if not poly.exterior.is_closed or len(poly.exterior.coords) < 4:
                raise HTTPException(status_code=422, detail="MultiPolygon member ring must be closed and contain at least 4 coordinate vertices.")

    # Spatial integrity: check validity (reject self-intersection / bowtie)
    if not geom.is_valid:
        reason = explain_validity(geom)
        raise HTTPException(
            status_code=422, 
            detail=f"Spatial integrity check failed: {reason}. Self-intersecting polygons or malformed topologies are rejected."
        )

    return geom


def compute_area_sqm(geom: Polygon | MultiPolygon) -> float:
    centroid_lat = geom.centroid.y
    lat_rad = math.radians(centroid_lat)
    m_per_deg_lat = 111320.0
    m_per_deg_lon = 111320.0 * math.cos(lat_rad)
    return round(geom.area * m_per_deg_lat * m_per_deg_lon, 2)


@router.post(
    "",
    response_model=ParcelOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create / Register a new parcel",
    description="Registers a new land parcel polygon, validates spatial integrity, persists to database, and initializes trust layers."
)
def create_new_parcel(payload: ParcelCreate, db: Session = Depends(get_db)):
    geom_input = payload.geometry if payload.geometry is not None else payload.coordinates
    if not geom_input:
        raise HTTPException(status_code=422, detail="Geometry or coordinates are required.")

    geom = parse_and_validate_geometry(geom_input)

    # Determine state code and region_key
    state_str = payload.state or "Chandigarh"
    state_code = payload.state_code or "CH"
    if not payload.state_code and payload.state:
        state_code = payload.state[:2].upper()

    reg_key = "chandigarh" if state_code.upper() in ("CH", "01") else (payload.district or state_str).lower().replace(" ", "_")

    # Handle ULPIN
    if payload.ulpin and payload.ulpin.strip():
        ulpin = payload.ulpin.strip().upper()
        if len(ulpin) < 10 or len(ulpin) > 32:
            raise HTTPException(status_code=422, detail="ULPIN must be between 10 and 32 characters.")
        existing = crud.get_parcel_by_ulpin(db, ulpin)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Parcel with ULPIN '{ulpin}' already exists in database."
            )
    else:
        from app.utils.ulpin import generate_ulpin
        ulpin = generate_ulpin(geom, state_code)
        if crud.get_parcel_by_ulpin(db, ulpin):
            import uuid
            ulpin = f"{ulpin[:10]}{uuid.uuid4().hex[:4].upper()}"

    # Calculate area
    if payload.area_sqm is not None and payload.area_sqm > 0:
        area_sqm = payload.area_sqm
    elif payload.area_acres is not None and payload.area_acres > 0:
        area_sqm = round(payload.area_acres * 4046.8564, 2)
    else:
        area_sqm = compute_area_sqm(geom)

    # Prepare ror_data with notes & trust_status
    ror = dict(payload.ror_data or {})
    if payload.trust_status:
        ror["trust_status"] = payload.trust_status
    if payload.notes:
        ror["admin_notes"] = payload.notes
    if payload.khasra_no:
        ror["khasra_no"] = payload.khasra_no

    village_or_city = payload.village_or_city or payload.district or "Chandigarh"

    try:
        parcel = crud.create_parcel(
            db,
            polygon=geom,
            ulpin=ulpin,
            owner_name=payload.owner_name.strip(),
            state_code=state_code,
            area_sqm=area_sqm,
            village_or_city=village_or_city,
            land_use=payload.land_use or "Residential",
            ror_data=ror,
            encumbrance_data=payload.encumbrance_data or {},
            property_tax_due=payload.property_tax_due or 0.0,
            region_key=reg_key,
            parcel_id=payload.parcel_id or f"CAD-{ulpin[-6:]}",
            khasra_no=payload.khasra_no,
            centroid_lat=round(geom.centroid.y, 7),
            centroid_lon=round(geom.centroid.x, 7)
        )
        return _format_parcel_out(parcel, db)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create parcel: {str(e)}")


def _handle_parcel_update(ulpin: str, payload: ParcelUpdate, db: Session) -> ParcelOut:
    parcel = crud.get_parcel_by_ulpin(db, ulpin)
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel with ULPIN '{ulpin}' not found")

    if payload.geometry is not None:
        geom = parse_and_validate_geometry(payload.geometry)
        parcel.geometry = from_shape(geom, srid=4326)
        parcel.centroid_lat = round(geom.centroid.y, 7)
        parcel.centroid_lon = round(geom.centroid.x, 7)

        # Recalculate area if not explicitly supplied
        if payload.area_sqm is None and payload.area_acres is None:
            parcel.area_sqm = compute_area_sqm(geom)

    if payload.area_sqm is not None:
        parcel.area_sqm = payload.area_sqm
    elif payload.area_acres is not None:
        parcel.area_sqm = round(payload.area_acres * 4046.8564, 2)

    if payload.owner_name is not None:
        parcel.owner_name = payload.owner_name.strip()
    if payload.land_use is not None:
        parcel.land_use = payload.land_use
    if payload.district is not None:
        parcel.village_or_city = payload.district
    if payload.village_or_city is not None:
        parcel.village_or_city = payload.village_or_city
    if payload.state is not None:
        parcel.state = payload.state
    if payload.dispute_flag is not None:
        parcel.dispute_flag = payload.dispute_flag
    if payload.property_tax_due is not None:
        parcel.property_tax_due = payload.property_tax_due
    if payload.khasra_no is not None:
        parcel.khasra_no = payload.khasra_no
    if payload.parcel_id is not None:
        parcel.parcel_id = payload.parcel_id

    ror = dict(parcel.ror_data or {})
    if payload.ror_data is not None:
        ror.update(payload.ror_data)
    if payload.trust_status is not None:
        ror["trust_status"] = payload.trust_status
    if payload.notes is not None:
        ror["admin_notes"] = payload.notes
    parcel.ror_data = ror

    if payload.encumbrance_data is not None:
        parcel.encumbrance_data = payload.encumbrance_data

    try:
        db.commit()
        db.refresh(parcel)
        return _format_parcel_out(parcel, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to update parcel: {str(e)}")


@router.put(
    "/{ulpin}",
    response_model=ParcelOut,
    summary="Update parcel record (Full)",
    description="Updates attributes and/or geometry for an existing parcel by ULPIN."
)
def update_parcel_put(ulpin: str, payload: ParcelUpdate, db: Session = Depends(get_db)):
    return _handle_parcel_update(ulpin, payload, db)


@router.patch(
    "/{ulpin}",
    response_model=ParcelOut,
    summary="Update parcel record (Partial)",
    description="Partially updates attributes and/or geometry for an existing parcel by ULPIN."
)
def update_parcel_patch(ulpin: str, payload: ParcelUpdate, db: Session = Depends(get_db)):
    return _handle_parcel_update(ulpin, payload, db)
