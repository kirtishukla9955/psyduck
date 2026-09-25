"""
Pydantic schemas for request validation and response serialization.
Designed for clean OpenAPI documentation (/docs) and seamless consumption
by P1 (GIS/Map), P3 (Citizen Portal), and P4 (Admin Dashboard).
"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


# ==========================================
# PARCEL SCHEMAS
# ==========================================

class ParcelCreate(BaseModel):
    coordinates: list[tuple[float, float]] = Field(
        ...,
        description="List of (longitude, latitude) coordinates forming a closed polygon ring"
    )
    owner_name: str = Field(..., description="Full legal name of the parcel owner")
    state_code: str = Field("CH", description="Two-letter state code, e.g. CH, PB, HR, TN")
    village_or_city: Optional[str] = Field("Chandigarh", description="Village, town, or city")
    land_use: Optional[str] = Field("Residential", description="Zoning classification")
    ror_data: Optional[dict[str, Any]] = Field(
        default_factory=dict,
        description="Record of Rights data (tenure, khatoni, khasra number)"
    )
    encumbrance_data: Optional[dict[str, Any]] = Field(
        default_factory=dict,
        description="Encumbrance / mortgage information"
    )
    property_tax_due: Optional[float] = Field(0.0, description="Outstanding property tax liability")


class ParcelOut(BaseModel):
    ulpin: str = Field(..., description="Unique Land Parcel Identification Number")
    geometry: dict[str, Any] = Field(..., description="GeoJSON Polygon Geometry dict")
    # Optional: imported cadastral rows (see backend/import_cadastral.py) carry geometry +
    # survey metadata but no owner — that still comes from the Trust Engine's DepartmentRecord
    # table, or from the frontend's records.json join, exactly as before this change.
    owner_name: Optional[str] = None
    area_sqm: Optional[float] = None
    village_or_city: Optional[str] = None
    state: Optional[str] = None
    land_use: Optional[str] = None
    ror_data: Optional[dict[str, Any]] = None
    encumbrance_data: Optional[dict[str, Any]] = None
    property_tax_due: float = 0.0
    trust_status: str = Field("VERIFIED", description="Calculated Trust Engine status: VERIFIED, WARNING, FLAGGED")
    active_conflicts_count: int = Field(0, description="Number of unresolved conflicts detected")

    model_config = {"from_attributes": True}


class ParcelSummary(BaseModel):
    ulpin: str
    owner_name: str
    area_sqm: Optional[float] = None
    land_use: Optional[str] = None
    village_or_city: Optional[str] = None
    state: Optional[str] = None
    trust_status: str = "VERIFIED"
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ==========================================
# DEPARTMENT RECORD SCHEMAS
# ==========================================

class DepartmentRecordCreate(BaseModel):
    ulpin: str = Field(..., description="Target parcel ULPIN")
    department_name: str = Field(..., description="Department: Revenue, Registration, Survey, Urban Development")
    owner_name: str = Field(..., description="Owner name in department's database")
    land_use: Optional[str] = None
    area_sqm: Optional[float] = None
    record_status: Optional[str] = "ACTIVE"
    record_details: Optional[dict[str, Any]] = None


class DepartmentRecordOut(BaseModel):
    id: int
    ulpin: str
    department_name: str
    owner_name: str
    land_use: Optional[str] = None
    area_sqm: Optional[float] = None
    record_status: str
    record_details: Optional[dict[str, Any]] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ==========================================
# MUTATION SCHEMAS
# ==========================================

class MutationCreate(BaseModel):
    ulpin: str = Field(..., description="Target parcel ULPIN")
    proposed_new_owner: str = Field(..., description="Name of buyer / proposed new owner")
    old_owner: Optional[str] = Field(None, description="Current owner name (auto-filled if omitted)")
    department: Optional[str] = Field("Revenue", description="Processing department")
    sla_days: Optional[int] = Field(7, description="Statutory SLA timeframe in days")
    remarks: Optional[str] = Field(None, description="Application notes or registry deed ref")


class MutationUpdate(BaseModel):
    status: Optional[str] = Field(
        None,
        description="Updated status: PENDING, UNDER_REVIEW, APPROVED, REJECTED"
    )
    remarks: Optional[str] = Field(None, description="Administrative remarks or reason")


class MutationOut(BaseModel):
    id: int
    mutation_id: str
    ulpin: str
    old_owner: str
    proposed_new_owner: str
    department: str
    submitted_at: datetime
    sla_days: int
    sla_deadline: datetime
    status: str
    resolved_at: Optional[datetime] = None
    remarks: Optional[str] = None
    sla_status: str = Field(..., description="WITHIN_SLA, APPROACHING_SLA, OVERDUE, RESOLVED")
    days_remaining: Optional[int] = Field(None, description="Days remaining before breach (if active)")
    days_overdue: Optional[int] = Field(None, description="Days exceeded beyond SLA deadline (if overdue)")

    model_config = {"from_attributes": True}


# ==========================================
# TRUST ENGINE & CONFLICT SCHEMAS
# ==========================================

class ConflictReport(BaseModel):
    ulpin: str
    has_conflict: bool
    conflict_type: str = Field(..., description="OWNER_NAME_MISMATCH, OVERDUE_MUTATION, GEOMETRY_OVERLAP, MULTIPLE_CONFLICTS, NONE")
    severity: str = Field("NONE", description="HIGH, MEDIUM, LOW, NONE")
    involved_departments: list[str] = Field(default_factory=list)
    conflicting_values: dict[str, Any] = Field(default_factory=dict)
    status: str = Field("CLEAR", description="FLAGGED, ACTION_REQUIRED, CLEAR")
    details: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SystemConflictSummary(BaseModel):
    total_conflicts: int
    owner_mismatches_count: int
    overdue_mutations_count: int
    geometry_overlaps_count: int
    conflicts: list[ConflictReport]


# ==========================================
# BANK LOAN CHECK (INTEROPERABILITY)
# ==========================================

class LoanCheckResponse(BaseModel):
    ulpin: str
    owner_name: str
    mortgaged: bool
    fraud_risk: bool
    overlapping_ulpins: list[str]
    decision: str
    reason: str
