"""
LAND STACK — GIS-Based Digital Public Infrastructure for Land Governance
P2 Module: Backend & Trust Engine
FastAPI application gateway and routing coordinator.
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping

from app.database import get_db, engine, Base
from app import crud
from app.routers import parcels, mutations, conflicts, bank
from app.services import trust_engine
from app.schemas import ParcelOut

# Initialize tables safely upon startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:
    # Log database initialization warning if container is not yet ready
    print(f"[WARN] Database initialization notice: {exc}")

app = FastAPI(
    title="LAND STACK — GIS-Based Digital Public Infrastructure for Land Governance",
    description=(
        "Smart India Hackathon 2026 Core DPI Engine (Module P2: Backend & Trust Engine).\n\n"
        "### Key Capabilities:\n"
        "- **ULPIN Land Indexing**: Deterministic 14-digit geo-coded parcel identifier.\n"
        "- **Land Trust Engine**: Cross-department owner name mismatch detection (Revenue vs Registration vs Survey).\n"
        "- **Mutation SLA Engine**: Statutory mutation countdown timer with automatic breach detection.\n"
        "- **Interoperability APIs**: Ready for P1 (GIS/Map), P3 (Citizen Portal), and P4 (Admin Dashboard)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

import os

# Permissive local dev & production CORS allowlist (wildcard '*' is invalid with allow_credentials=True)
default_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5500",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5500",
    "https://dharaa01.netlify.app",
]

allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]
else:
    allowed_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Registration
app.include_router(parcels.router)
app.include_router(mutations.router)
app.include_router(conflicts.router)
app.include_router(bank.router)


@app.get(
    "/",
    tags=["health"],
    summary="Backend health check",
    description="Returns service health, version, and module status."
)
def root():
    return {
        "status": "healthy",
        "service": "Land Stack Backend & Trust Engine (P2)",
        "framework": "FastAPI + PostGIS",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get(
    "/parcel/{ulpin}",
    response_model=ParcelOut,
    tags=["parcels"],
    summary="Get parcel details by ULPIN (Direct alias)",
    description="Returns single parcel as GeoJSON-ready data with full ROR, encumbrance, and Trust Engine status."
)
def get_parcel_alias(ulpin: str, db: Session = Depends(get_db)):
    parcel = crud.get_parcel_by_ulpin(db, ulpin)
    if not parcel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parcel with ULPIN '{ulpin}' not found"
        )

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
