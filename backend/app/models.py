"""
SQLAlchemy models for Land Stack (Bhu-DPI) Backend & Trust Engine.
Includes base parcel records, multi-department records, and land mutation lifecycle models.
"""
from datetime import datetime, timezone
from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    Numeric,
    JSON,
    TIMESTAMP,
    ForeignKey,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    # Widened from 14 to fit source-system identifiers like "IN-CH-017-00101" (imported
    # cadastral rows) alongside the original 14-char generated codes (demo/seeded rows).
    ulpin = Column(String(32), unique=True, index=True, nullable=False)
    geometry = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)

    area_sqm = Column(Numeric, nullable=True)
    # Imported cadastral rows don't carry an owner (that still comes from the Trust Engine's
    # DepartmentRecord table / the frontend's records.json), so this is nullable now.
    owner_name = Column(String(200), nullable=True)
    village_or_city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)

    # --- Essential Public Infrastructure Layers ---
    ror_data = Column(JSON, nullable=True)          # Record of Rights: tenure, ownership history
    encumbrance_data = Column(JSON, nullable=True)  # Mortgage/loan status, lender info
    land_use = Column(String(100), nullable=True)   # Zoning: Residential, Commercial, Agricultural, etc.

    # --- Use-case layer ---
    property_tax_due = Column(Numeric, default=0)

    # --- Cadastral/survey metadata (added for the PostGIS-backed parcel import) ---
    region_key = Column(String(50), index=True, nullable=True)  # matches frontend config/regions.js key
    parcel_id = Column(String(50), nullable=True)                # source system's parcel identifier
    khasra_no = Column(String(50), nullable=True)                # khasra / survey-subdivision number
    sector = Column(String(100), nullable=True)                  # sector / village / locality
    survey_agency = Column(String(200), nullable=True)
    survey_date = Column(String(20), nullable=True)               # kept as the source's own date string
    dispute_flag = Column(Boolean, default=False, nullable=False)
    boundary_source = Column(String(300), nullable=True)          # provenance note for this geometry

    created_at = Column(TIMESTAMP, server_default=func.now())

    # --- Relationships ---
    department_records = relationship(
        "DepartmentRecord",
        back_populates="parcel",
        cascade="all, delete-orphan",
        lazy="joined"
    )
    mutations = relationship(
        "Mutation",
        back_populates="parcel",
        cascade="all, delete-orphan",
        lazy="joined"
    )


class DepartmentRecord(Base):
    """
    Simulates multi-department records for land governance:
    - Revenue Department (ROR / Jamabandi)
    - Registration Department (Sub-Registrar deed records)
    - Survey & Land Records Department (Cadastral / GIS survey)
    - Urban Development / Municipal Authority
    Used by the Trust Engine to detect Owner Name Mismatch anomalies.
    """
    __tablename__ = "department_records"

    id = Column(Integer, primary_key=True, index=True)
    ulpin = Column(String(32), ForeignKey("parcels.ulpin", ondelete="CASCADE"), index=True, nullable=False)
    department_name = Column(String(100), nullable=False, index=True)
    owner_name = Column(String(200), nullable=False)
    land_use = Column(String(100), nullable=True)
    area_sqm = Column(Numeric, nullable=True)
    record_status = Column(String(50), default="ACTIVE")
    record_details = Column(JSON, nullable=True)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    parcel = relationship("Parcel", back_populates="department_records")


class Mutation(Base):
    """
    Tracks parcel ownership transfer requests (Mutations) and monitors
    compliance against statutory SLA deadlines (e.g. 7-day guarantee).
    """
    __tablename__ = "mutations"

    id = Column(Integer, primary_key=True, index=True)
    mutation_id = Column(String(50), unique=True, index=True, nullable=False)
    ulpin = Column(String(32), ForeignKey("parcels.ulpin", ondelete="CASCADE"), index=True, nullable=False)
    old_owner = Column(String(200), nullable=False)
    proposed_new_owner = Column(String(200), nullable=False)
    department = Column(String(100), default="Revenue", nullable=False)
    submitted_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc), nullable=False)
    sla_days = Column(Integer, default=7, nullable=False)
    sla_deadline = Column(TIMESTAMP, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)
    resolved_at = Column(TIMESTAMP, nullable=True)
    remarks = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    parcel = relationship("Parcel", back_populates="mutations")
