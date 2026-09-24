-- =============================================================================
-- DHARAA (Bhu-DPI) Master PostgreSQL / PostGIS & SQLite DDL Schema Specification
-- Smart India Hackathon (SIH) 2026 — Ministry of Rural Development / DoLR
-- Standard: ISO 19152 LADM & National Bhu-Aadhaar / ULPIN Standard
-- =============================================================================

-- Enable PostGIS spatial extension (for PostgreSQL deployment)
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Administrative Hierarchy: States and Union Territories (28 States + 8 UTs)
CREATE TABLE IF NOT EXISTS states (
    state_lgd_code INTEGER PRIMARY KEY,
    state_code VARCHAR(2) UNIQUE NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    state_type VARCHAR(20) NOT NULL CHECK (state_type IN ('STATE', 'UT')),
    ror_term VARCHAR(100) NOT NULL,
    primary_area_unit VARCHAR(50) NOT NULL,
    unit_multiplier_sqm NUMERIC(14,6) NOT NULL,
    official_languages TEXT NOT NULL, -- JSON array e.g. ["en", "hi"]
    statutory_mutation_sla_days INTEGER NOT NULL DEFAULT 30
);

-- 2. Administrative Hierarchy: Districts (LGD standard)
CREATE TABLE IF NOT EXISTS districts (
    district_lgd_code INTEGER PRIMARY KEY,
    state_lgd_code INTEGER NOT NULL REFERENCES states(state_lgd_code),
    district_name_en VARCHAR(100) NOT NULL,
    district_name_local VARCHAR(100)
);

-- 3. Administrative Hierarchy: Sub-Districts (Tehsil / Taluk / Mandal / Circle)
CREATE TABLE IF NOT EXISTS subdistricts (
    subdistrict_lgd_code INTEGER PRIMARY KEY,
    district_lgd_code INTEGER NOT NULL REFERENCES districts(district_lgd_code),
    subdistrict_name_en VARCHAR(100) NOT NULL,
    subdistrict_name_local VARCHAR(100),
    subdistrict_type VARCHAR(50) NOT NULL DEFAULT 'Tehsil'
);

-- 4. Administrative Hierarchy: Revenue Villages / Mouzas / Wards
CREATE TABLE IF NOT EXISTS villages (
    village_lgd_code INTEGER PRIMARY KEY,
    subdistrict_lgd_code INTEGER NOT NULL REFERENCES subdistricts(subdistrict_lgd_code),
    village_name_en VARCHAR(100) NOT NULL,
    village_name_local VARCHAR(100)
);

-- 5. Land Parcels (Canonical Spatial Land Holding)
CREATE TABLE IF NOT EXISTS parcels (
    parcel_id VARCHAR(36) PRIMARY KEY, -- UUID surrogate key
    ulpin VARCHAR(20) UNIQUE NOT NULL,  -- Canonical Bhu-Aadhaar identifier
    village_lgd_code INTEGER NOT NULL REFERENCES villages(village_lgd_code),
    khasra_plot_no VARCHAR(50) NOT NULL,
    recorded_area NUMERIC(14,4) NOT NULL,
    recorded_area_unit VARCHAR(50) NOT NULL,
    normalized_area_sqm NUMERIC(14,4) NOT NULL,
    gis_area_sqm NUMERIC(14,4),
    land_use_category VARCHAR(50) NOT NULL CHECK (land_use_category IN (
        'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL',
        'INSTITUTIONAL', 'FOREST_GREEN_BELT', 'WATER_BODY', 'MIXED_USE', 'OTHER'
    )),
    land_use_raw VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
        'ACTIVE', 'PENDING_MUTATION', 'SUBDIVIDED', 'AMALGAMATED', 'DISPUTED', 'ARCHIVED'
    )),
    cadastral_survey_status VARCHAR(30) NOT NULL DEFAULT 'SURVEYED',
    cadastral_sheet_no VARCHAR(50),
    fmb_sketch_no VARCHAR(50),
    centroid_lat NUMERIC(10,7),
    centroid_lon NUMERIC(10,7),
    boundary_geojson TEXT,
    -- In PostgreSQL with PostGIS, use:
    -- geometry GEOMETRY(MultiPolygon, 4326),
    data_freshness_status VARCHAR(20) NOT NULL DEFAULT 'CURRENT' CHECK (data_freshness_status IN ('CURRENT', 'STALE', 'UNKNOWN')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 6. Record of Rights (RoR / Jamabandi / Patta-Chitta / 7-12)
CREATE TABLE IF NOT EXISTS ror_records (
    ror_id VARCHAR(36) PRIMARY KEY,
    village_lgd_code INTEGER NOT NULL REFERENCES villages(village_lgd_code),
    state_record_id VARCHAR(100) UNIQUE NOT NULL,
    record_type VARCHAR(100) NOT NULL,
    khata_khewat_no VARCHAR(50) NOT NULL,
    khatauni_no VARCHAR(50),
    tenure_type VARCHAR(100) NOT NULL DEFAULT 'Bhumiswami / Freehold',
    total_khata_area_sqm NUMERIC(14,4) NOT NULL,
    land_revenue_tax_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax_demand_status VARCHAR(20) NOT NULL DEFAULT 'PAID' CHECK (tax_demand_status IN ('PAID', 'DUE', 'EXEMPTED')),
    mutation_status VARCHAR(30) NOT NULL DEFAULT 'MUTATED' CHECK (mutation_status IN (
        'MUTATED', 'PENDING', 'UNMUTATED_TRANSACTION', 'REJECTED', 'DISPUTED', 'NONE'
    )),
    active_mutation_id VARCHAR(50),
    recorded_date TEXT NOT NULL,
    fasli_or_rev_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'HISTORICAL_SUPERSEDED'))
);

-- 7. Many-to-Many Mapping: Parcel ↔ RoR Relationship
CREATE TABLE IF NOT EXISTS parcel_ror_mappings (
    mapping_id VARCHAR(36) PRIMARY KEY,
    parcel_id VARCHAR(36) NOT NULL REFERENCES parcels(parcel_id) ON DELETE RESTRICT,
    ror_id VARCHAR(36) NOT NULL REFERENCES ror_records(ror_id) ON DELETE RESTRICT,
    ulpin VARCHAR(20) NOT NULL,
    extent_in_ror_sqm NUMERIC(14,4) NOT NULL,
    is_primary_ror BOOLEAN NOT NULL DEFAULT 1,
    linked_at TEXT NOT NULL,
    UNIQUE(parcel_id, ror_id)
);

-- 8. Landholders and Claimants
CREATE TABLE IF NOT EXISTS owners (
    owner_id VARCHAR(36) PRIMARY KEY,
    owner_name_en VARCHAR(200) NOT NULL,
    owner_name_local VARCHAR(200),
    relation_type VARCHAR(50) NOT NULL DEFAULT 'Son of',
    relative_name_en VARCHAR(200) NOT NULL,
    relative_name_local VARCHAR(200),
    gender VARCHAR(20) NOT NULL DEFAULT 'MALE',
    owner_category VARCHAR(50) NOT NULL DEFAULT 'INDIVIDUAL' CHECK (owner_category IN (
        'INDIVIDUAL', 'JOINT', 'PRIVATE_COMPANY', 'GOVT_DEPT', 'WAQF_BOARD', 'TEMPLE_TRUST'
    )),
    pan_masked VARCHAR(20),
    aadhaar_vault_ref VARCHAR(64), -- Secure hash / token reference only
    mobile_masked VARCHAR(20),
    address_line TEXT,
    created_at TEXT NOT NULL
);

-- 9. Parcel ↔ Owner Junction (Fractional Shares & Title Holdings)
CREATE TABLE IF NOT EXISTS parcel_owners (
    parcel_owner_id VARCHAR(36) PRIMARY KEY,
    parcel_id VARCHAR(36) NOT NULL REFERENCES parcels(parcel_id) ON DELETE CASCADE,
    owner_id VARCHAR(36) NOT NULL REFERENCES owners(owner_id) ON DELETE RESTRICT,
    ownership_share_fraction VARCHAR(20) NOT NULL DEFAULT '1/1',
    ownership_share_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    ownership_type VARCHAR(50) NOT NULL DEFAULT 'SOLE_OWNER' CHECK (ownership_type IN (
        'SOLE_OWNER', 'CO_PARCENER', 'JOINT_TENANT', 'TENANT_IN_COMMON', 'LEASEHOLDER'
    )),
    is_primary_contact BOOLEAN NOT NULL DEFAULT 1,
    acquisition_mode VARCHAR(50) NOT NULL DEFAULT 'PURCHASE_SALE_DEED',
    source_department VARCHAR(50) NOT NULL DEFAULT 'REVENUE',
    UNIQUE(parcel_id, owner_id)
);

-- 10. Mutation / Dakhil-Kharij / Patta Transfer Workflow
CREATE TABLE IF NOT EXISTS mutations (
    mutation_id VARCHAR(36) PRIMARY KEY,
    parcel_id VARCHAR(36) NOT NULL REFERENCES parcels(parcel_id),
    ulpin VARCHAR(20) NOT NULL,
    ror_id VARCHAR(36) REFERENCES ror_records(ror_id),
    application_no VARCHAR(100) UNIQUE NOT NULL,
    mutation_type VARCHAR(50) NOT NULL CHECK (mutation_type IN (
        'SALE_DEED', 'INHERITANCE_FAUTI', 'PARTITION', 'GIFT_DEED', 'COURT_DECREE'
    )),
    application_date TEXT NOT NULL,
    statutory_sla_days INTEGER NOT NULL DEFAULT 30,
    sla_due_date TEXT NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN (
        'SUBMITTED', 'UNDER_VERIFICATION', 'NOTICE_PERIOD', 'HEARING_SCHEDULED',
        'APPROVED', 'REJECTED', 'SLA_BREACHED'
    )),
    days_elapsed INTEGER NOT NULL DEFAULT 0,
    days_overdue INTEGER NOT NULL DEFAULT 0,
    applicant_name VARCHAR(200) NOT NULL,
    transferor_name VARCHAR(200),
    order_no VARCHAR(100),
    order_date TEXT,
    remarks TEXT
);

-- 11. Encumbrance Certificate & Institutional Charges
CREATE TABLE IF NOT EXISTS encumbrances (
    encumbrance_id VARCHAR(36) PRIMARY KEY,
    parcel_id VARCHAR(36) NOT NULL REFERENCES parcels(parcel_id),
    ulpin VARCHAR(20) NOT NULL,
    certificate_no VARCHAR(100) NOT NULL,
    encumbrance_type VARCHAR(50) NOT NULL CHECK (encumbrance_type IN (
        'BANK_MORTGAGE', 'GOVT_REVENUE_LIEN', 'COURT_ATTACHMENT',
        'TRIBAL_NON_ALIENATION', 'LEASE_CHARGE', 'NIL'
    )),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'DISCHARGED', 'DISPUTED', 'NIL')),
    charge_holder VARCHAR(200),
    amount_inr NUMERIC(14,2) DEFAULT 0.00,
    start_date TEXT NOT NULL,
    end_date TEXT,
    document_ref VARCHAR(100),
    remarks TEXT
);

-- 12. Registration Department Conveyance Deeds (Sub-Registrar Office)
CREATE TABLE IF NOT EXISTS registration_deeds (
    deed_id VARCHAR(36) PRIMARY KEY,
    parcel_id VARCHAR(36) REFERENCES parcels(parcel_id),
    ulpin VARCHAR(20) NOT NULL,
    deed_number VARCHAR(100) NOT NULL,
    deed_type VARCHAR(100) NOT NULL,
    sro_office VARCHAR(200) NOT NULL,
    execution_date TEXT NOT NULL,
    seller_name VARCHAR(200) NOT NULL,
    buyer_name VARCHAR(200) NOT NULL,
    consideration_amount_inr NUMERIC(14,2) NOT NULL,
    stamp_duty_inr NUMERIC(14,2) NOT NULL,
    registration_fee_inr NUMERIC(14,2) NOT NULL
);

-- 13. Urban Masterplan & Town Planning Authority
CREATE TABLE IF NOT EXISTS urban_masterplans (
    plan_id VARCHAR(36) PRIMARY KEY,
    parcel_id VARCHAR(36) REFERENCES parcels(parcel_id),
    ulpin VARCHAR(20) NOT NULL,
    planning_authority VARCHAR(200) NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    permitted_land_use VARCHAR(100) NOT NULL,
    building_sanction_status VARCHAR(50) NOT NULL,
    violation_notices_issued BOOLEAN NOT NULL DEFAULT 0,
    remarks TEXT
);

-- 14. Trust Engine Audit Flags and Discrepancies
CREATE TABLE IF NOT EXISTS conflicts (
    conflict_id VARCHAR(50) PRIMARY KEY,
    ulpin VARCHAR(20) NOT NULL REFERENCES parcels(ulpin),
    conflict_type VARCHAR(50) NOT NULL CHECK (conflict_type IN (
        'OWNER_MISMATCH', 'MUTATION_SLA_BREACH', 'ZONING_INCONSISTENCY',
        'AREA_DISCREPANCY', 'SATELLITE_LAND_USE_DRIFT', 'TRIBAL_LAND_VIOLATION'
    )),
    rule_id VARCHAR(20) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    status VARCHAR(30) NOT NULL DEFAULT 'detected',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    departments_involved TEXT NOT NULL, -- JSON array
    sla_days_overdue INTEGER,
    recommended_action TEXT,
    suggested_routing_dept VARCHAR(100),
    detected_at TEXT NOT NULL
);

-- Indexes for high-throughput spatial and analytical query performance
CREATE INDEX IF NOT EXISTS idx_parcels_ulpin ON parcels(ulpin);
CREATE INDEX IF NOT EXISTS idx_parcels_village ON parcels(village_lgd_code);
CREATE INDEX IF NOT EXISTS idx_ror_village ON ror_records(village_lgd_code);
CREATE INDEX IF NOT EXISTS idx_parcel_ror_ulpin ON parcel_ror_mappings(ulpin);
CREATE INDEX IF NOT EXISTS idx_conflicts_ulpin ON conflicts(ulpin);
CREATE INDEX IF NOT EXISTS idx_mutations_ulpin ON mutations(ulpin);
CREATE INDEX IF NOT EXISTS idx_encumbrances_ulpin ON encumbrances(ulpin);
