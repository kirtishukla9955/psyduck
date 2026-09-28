from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field


# ==========================================
# PARCEL SCHEMAS
# ==========================================

class ParcelCreate(BaseModel):
    ulpin: Optional[str] = Field(None, description="Deterministic 14-character ULPIN. Auto-generated if omitted.")
    owner_name: str = Field(..., description="Full legal name of the parcel owner")
    geometry: Optional[Any] = Field(None, description="GeoJSON Polygon, MultiPolygon, Feature, or list of [lng, lat] coordinate pairs")
    coordinates: Optional[list[Any]] = Field(None, description="Alternative coordinates list for backwards compatibility")
    area_sqm: Optional[float] = Field(None, description="Parcel area in square meters")
    area_acres: Optional[float] = Field(None, description="Parcel area in acres")
    land_use: Optional[str] = Field("Residential", description="Zoning/land use category: Residential, Agricultural, Commercial, Industrial, Forest, Institutional")
    district: Optional[str] = Field(None, description="District or Tehsil name")
    village_or_city: Optional[str] = Field(None, description="Village, town, or city")
    state: Optional[str] = Field(None, description="Full state name")
    state_code: Optional[str] = Field("CH", description="Two-letter state code, e.g. CH, TN, PB, HR")
    trust_status: Optional[str] = Field("PENDING_VERIFICATION", description="Trust status: PENDING_VERIFICATION, VERIFIED, FLAGGED, WARNING")
    notes: Optional[str] = Field(None, description="Administrative notes or remarks")
    ror_data: Optional[dict[str, Any]] = Field(default_factory=dict, description="Record of Rights data")
    encumbrance_data: Optional[dict[str, Any]] = Field(default_factory=dict, description="Encumbrance / mortgage information")
    property_tax_due: Optional[float] = Field(0.0, description="Outstanding property tax liability")
    khasra_no: Optional[str] = Field(None, description="Revenue khasra / survey number")
    parcel_id: Optional[str] = Field(None, description="Administrative parcel identifier")


class ParcelUpdate(BaseModel):
    owner_name: Optional[str] = Field(None, description="Updated owner name")
    geometry: Optional[Any] = Field(None, description="Updated GeoJSON geometry or coordinates")
    area_sqm: Optional[float] = Field(None, description="Updated area in square meters")
    area_acres: Optional[float] = Field(None, description="Updated area in acres")
    land_use: Optional[str] = Field(None, description="Updated land use classification")
    district: Optional[str] = Field(None, description="Updated district name")
    village_or_city: Optional[str] = Field(None, description="Updated village, town, or city")
    state: Optional[str] = Field(None, description="Updated state name")
    state_code: Optional[str] = Field(None, description="Two-letter state code")
    trust_status: Optional[str] = Field(None, description="Updated trust status")
    notes: Optional[str] = Field(None, description="Administrative notes or remarks")
    ror_data: Optional[dict[str, Any]] = Field(None, description="Updated RoR data")
    encumbrance_data: Optional[dict[str, Any]] = Field(None, description="Updated encumbrance details")
    property_tax_due: Optional[float] = Field(None, description="Updated tax due")
    dispute_flag: Optional[bool] = Field(None, description="Flag indicating active dispute")
    khasra_no: Optional[str] = Field(None, description="Revenue khasra / survey number")
    parcel_id: Optional[str] = Field(None, description="Administrative parcel identifier")


class ParcelOut(BaseModel):
    ulpin: str = Field(..., description="Unique Land Parcel Identification Number")
    geometry: dict[str, Any] = Field(..., description="GeoJSON Polygon Geometry dict")
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
    khasra_no: Optional[str] = None
    parcel_id: Optional[str] = None
    dispute_flag: Optional[bool] = False
    centroid_lat: Optional[float] = None
    centroid_lon: Optional[float] = None
    satellite_metrics: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class ParcelSummary(BaseModel):
    ulpin: str
    owner_name: Optional[str] = None
    area_sqm: Optional[float] = None
    land_use: Optional[str] = None
    village_or_city: Optional[str] = None
    state: Optional[str] = None
    trust_status: str = "VERIFIED"
    centroid_lat: Optional[float] = None
    centroid_lon: Optional[float] = None
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


# ==========================================
# CITIZEN GRIEVANCE SCHEMAS
# ==========================================

class GrievanceCreate(BaseModel):
    ulpin: str
    name: Optional[str] = None
    phone: Optional[str] = None
    type: str = Field(..., description="Type of discrepancy")
    description: Optional[str] = None

class GrievanceOut(BaseModel):
    id: int
    tracking_id: str
    ulpin: str
    citizen_name: Optional[str] = None
    phone: Optional[str] = None
    discrepancy_type: str
    description: Optional[str] = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
