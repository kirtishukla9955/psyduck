# DHARAA (Bhu-DPI) — Mock Data & Land Trust Engine Schema Specification

**Project:** DHARAA (GIS-Based Digital Public Infrastructure for Land Governance)  
**Smart India Hackathon (SIH) 2026** — Department of Land Resources (DoLR), Ministry of Rural Development  
**Module:** Presenter 1 (Mock Data & AI Layer)  
**Contract Version:** 1.0.0 (Production Release)  
**Target Integrations:** P2 (FastAPI Trust Engine Backend), P3 (Citizen Portal), P4 (Admin / Department Dashboard)

---

## 1. Architectural Overview

DHARAA operates as an **interoperability and conflict-detection layer** sitting above existing state land administration repositories (DILRMP, TNREGINET, Jamabandi, Bhoomi, Dharani). It **does not replace** state systems; rather, it indexes heterogeneous state records by **ULPIN** (Unique Land Parcel Identification Number) and continuously cross-evaluates them using a **State-Adapter Normalization Engine** and a **Rule-Based Land Trust Engine**.

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                 DHARAA Interoperability & Trust Layer                       │
  │                                                                             │
  │   ┌────────────────────────────────┐    ┌───────────────────────────────┐   │
  │   │  Chandigarh State Adapter      │    │  Tamil Nadu State Adapter     │   │
  │   │  (Jamabandi, Vasika, Kanal)    │    │  (Patta, TNREGINET, Grounds)  │   │
  │   └───────────────┬────────────────┘    └───────────────┬───────────────┘   │
  │                   │                                     │                   │
  │                   ▼                                     ▼                   │
  │   ┌─────────────────────────────────────────────────────────────────────┐   │
  │   │      Canonical ULPIN-Indexed Land Parcel Schema (NormalizedParcel)   │   │
  │   └──────────────────────────────────┬──────────────────────────────────┘   │
  │                                      │                                      │
  │                                      ▼                                      │
  │   ┌─────────────────────────────────────────────────────────────────────┐   │
  │   │       Rule-Based Land Trust Engine (Anomaly & Conflict Detection)    │   │
  │   │   • RULE-001: Owner Name Mismatch (Unmutated Transaction Divergence)│   │
  │   │   • RULE-002: Mutation Statutory SLA Breach (>30/90 days overdue)   │   │
  │   │   • RULE-003: Land-Use & Master Plan Zoning Inconsistency           │   │
  │   │   • RULE-004: Cadastral Boundary & Survey Discrepancy (>5%)         │   │
  │   │   • RULE-005: Satellite Land-Use Drift (Sentinel-2 Stand-in)        │   │
  │   └──────────────────────────────────┬──────────────────────────────────┘   │
  │                                      │                                      │
  │                                      ▼                                      │
  │   ┌─────────────────────────────────────────────────────────────────────┐   │
  │   │      Structured Conflict Flag Output & Audit Dossier (ConflictFlag) │   │
  │   └─────────────────────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Canonical ULPIN Data Model (`NormalizedParcel`)

Every physical land parcel, regardless of originating state, is normalized into the following standardized JSON document:

```typescript
interface NormalizedParcel {
  ulpin: string;                     // 14-digit ULPIN identifier (e.g. "IN-CH-017-00101", "IN-TN-CHN-00201")
  state: string;                     // "Chandigarh (UT)" | "Tamil Nadu"
  state_code: string;                // "CH" | "TN"
  centroid: {
    lat: number;                     // WGS84 Latitude (e.g. 30.741000)
    lon: number;                     // WGS84 Longitude (e.g. 76.785000)
  };
  polygon_coordinates: number[][][]; // GeoJSON Polygon ring [[lon, lat], ...]
  calculated_gis_area_sqm: number;   // Planar/geodesic area calculated from geometry (sq.m)
  master_owner: string;              // Primary recorded landholder
  departments: {
    revenue: RevenueDepartmentRecord | null;
    registration: RegistrationDepartmentRecord | null;
    survey: SurveyDepartmentRecord | null;
    urban_development: UrbanDevelopmentRecord | null;
    satellite: SatelliteObservationRecord | null;
  };
  metadata: {
    adapter_used: string;            // "ChandigarhAdapter" | "TamilNaduAdapter"
    normalized_at: string;           // ISO 8601 UTC timestamp
  };
}
```

### 2.1 Department Sub-Schemas

#### Revenue Department (`RevenueDepartmentRecord`)
Represents the state Record of Rights (RoR), Jamabandi, or Patta/Chitta register:
```typescript
interface RevenueDepartmentRecord {
  department: "Revenue";
  record_id: string;                 // State record identifier (e.g. "JAM-CH-2024-101", "PATTA-TN-2024-201")
  owner_name: string;                // Name of primary registered title holder
  co_owners: string[];               // Joint landholders / pattadhars
  land_use_raw: string;              // State-specific land category ("Commercial Plot", "Varthaga Manai", "Nanjai")
  land_use_normalized: LandUseEnum;  // Standardized classification (see Enum below)
  area_sqm: number;                  // Area converted to standard Square Meters
  raw_units: Record<string, number>; // State units (e.g. { kanal: 2, marla: 0 } or { grounds: 8, cents: 0 })
  mutation_status: MutationStatus;   // "MUTATED" | "PENDING" | "REJECTED" | "DISPUTED" | "NONE"
  mutation_status_raw: string;       // State term ("Manzoor", "Zer-Tajweez", "A-Register Updated", "Nilavaiyil")
  mutation_id: string | null;        // Mutation / Intiqal order number
  mutation_date: string | null;      // ISO 8601 date (YYYY-MM-DD)
  application_date: string | null;   // ISO 8601 date when mutation transfer was filed
  identifiers: {                     // State-specific land hierarchy
    khewat_no?: string;              // Northern states
    khatoni_no?: string;
    khasra_no?: string;
    patta_number?: string;           // Southern states
    survey_number?: string;
    sub_division_number?: string;
    patwar_circle?: string;
    firka?: string;
  };
  administrative_division: {
    state: string;
    district: string;
    sub_division?: string;
    taluk?: string;
    village?: string;
    sector?: string;
  };
}
```

#### Registration Department (`RegistrationDepartmentRecord`)
Represents registered conveyance deeds from the Sub-Registrar Office (SRO) / TNREGINET:
```typescript
interface RegistrationDepartmentRecord {
  department: "Registration";
  deed_number: string;               // Registered deed / Vasika number (e.g. "VAS-2024-1102", "DOC-2023-8911")
  registered_owner: string;          // Claimant / Buyer / Transferee name
  seller_name: string;               // Executant / Transferor name
  registration_date: string;         // ISO 8601 date (YYYY-MM-DD)
  deed_type: string;                 // "Sale Deed / Conveyance", "Absolute Sale Deed"
  sro_office: string;                // Sub-Registrar Office jurisdiction
  consideration_amount_inr: number;  // Transaction value in Indian Rupees
  stamp_duty_inr: number;            // Statutory stamp duty paid
  registration_fee_inr: number;      // Registration fees collected
  book_details: {
    bahi_no?: string;                // Northern registry books
    jild_no?: string;
    book_number?: string;            // Southern Book 1 / Book 2 registers
  };
}
```

#### Survey & Land Records Department (`SurveyDepartmentRecord`)
Represents the cadastral demarcation, Collabland, or Field Measurement Book (FMB):
```typescript
interface SurveyDepartmentRecord {
  department: "Survey";
  sketch_id: string;                 // Cadastral parcel / FMB sketch ID (e.g. "UT-CAD-CH-101", "FMB-TN-201")
  parcel_number: string;             // Khasra number or Survey/Sub-division number
  surveyed_area_sqm: number;         // Field surveyed physical area in Square Meters
  survey_date: string | null;        // Date of last Total Station / DGPS survey
  survey_agency: string;             // "Survey of India / UT Cadastral Wing", "TN Survey & Settlement"
  boundary_dispute: boolean;         // True if an active boundary encroachment/dispute petition exists
  geometry: GeoJSON.Polygon | null;  // Explicit boundary geometry
}
```

#### Urban Development & Planning Department (`UrbanDevelopmentRecord`)
Represents Master Plan zoning, planning permits, and municipal building sanctions:
```typescript
interface UrbanDevelopmentRecord {
  department: "Urban Development";
  authority: string;                 // "Department of Urban Planning, Chandigarh" | "CMDA"
  zoning_raw: string;                // "Commercial Core", "Water Body Buffer Zone", "Primary Residential"
  zoning_normalized: LandUseEnum;    // Standardized classification
  building_permission_status: string;// "SANCTIONED" | "APPROVED" | "VIOLATION_NOTICED" | "NOT_APPLIED"
  sanction_no: string | null;        // Building permit or planning sanction number
  violations_reported: boolean;      // True if stop-work or unauthorized development notices issued
  remarks: string;                   // Official administrative remarks
}
```

#### Satellite Earth Observation Record (`SatelliteObservationRecord`)
Stand-in change-detection signal representing multi-temporal Sentinel-2 observations:
```typescript
interface SatelliteObservationRecord {
  ulpin: string;
  epoch_baseline: string;            // Baseline observation date (e.g. "2024-01-01")
  epoch_recent: string;              // Recent monitoring date (e.g. "2026-06-01")
  baseline_ndvi: number;             // Normalized Difference Vegetation Index baseline
  recent_ndvi: number;               // Recent NDVI
  ndvi_delta: number;                // Change in vegetation cover
  built_up_index_change: number;     // Normalized Difference Built-Up Index change
  unauthorized_structure_flag: boolean;
  confidence_score: number;          // Model confidence (0.0 to 1.0)
  notes: string;                     // Automated alert narrative
}
```

---

## 3. Standardized Enums & Units

### 3.1 Land Classification Enum (`LandUseEnum`)
- `RESIDENTIAL`: Plotted housing, apartments, natham manai.
- `COMMERCIAL`: Retail markets, commercial plazas, varthaga manai, IT parks.
- `INDUSTRIAL`: Manufacturing zones, SIPCOT / SIDCO complexes, industrial estates.
- `AGRICULTURAL`: Nanji (wet land), Punji (dry land), rural agricultural periphery.
- `INSTITUTIONAL`: Schools, universities, government offices, hospitals.
- `FOREST_GREEN_BELT`: Eco-sensitive green belts, protected reserve forests, leisure valley buffers.
- `WATER_BODY`: Lakes, ponds, rivers, choe canals, coastal regulation zones (CRZ), catchment buffers.
- `MIXED_USE`: Permitted combined commercial-residential developments.
- `OTHER`: Unclassified or special jurisdiction land.

### 3.2 Unit Conversion Standards
All regional area measurements are normalized into **Square Meters ($m^2$)** using certified government standards:

| State | Regional Unit | Equivalent in Square Meters ($m^2$) | Official Conversion Basis |
|---|---|---|---|
| **Chandigarh (UT)** | 1 Kanal | **505.857005** | $20\text{ Marlas} = 1\text{ Kanal}$ |
| **Chandigarh (UT)** | 1 Marla | **25.292850** | $1/20\text{ of a Kanal}$ (approx 272.25 sq.ft) |
| **Chandigarh (UT)** | 1 Biswa | **126.464250** | $1/20\text{ of a Bigha}$ |
| **Chandigarh (UT)** | 1 Square Yard (Gaj) | **0.836127** | 9 square feet |
| **Tamil Nadu** | 1 Ground | **222.967280** | 2,400 square feet |
| **Tamil Nadu** | 1 Cent | **40.468564** | $1/100\text{ of an Acre}$ (approx 435.6 sq.ft) |
| **Tamil Nadu** | 1 Acre | **4046.856420** | 100 Cents / 43,560 sq.ft |
| **Tamil Nadu** | 1 Hectare | **10000.000000** | $2.471\text{ Acres}$ / 100 Ares |
| **Tamil Nadu** | 1 Are | **100.000000** | $1/100\text{ of a Hectare}$ |
| **National** | 1 Square Foot | **0.092903** | British Imperial standard |

---

## 4. Anomaly Output Schema Contract (`ConflictFlag`)

When the Land Trust Engine detects a discrepancy across departments, it outputs structured `ConflictFlag` audit records:

```typescript
interface ConflictFlag {
  conflict_id: string;               // Unique audit key: `CONF-${ulpin}-${TYPE_ABBR}-${SEQ}`
  ulpin: string;                     // Target land parcel identifier
  conflict_type: ConflictType;       // Standardized rule type
  rule_id: string;                   // "RULE-001" | "RULE-002" | "RULE-003" | "RULE-004" | "RULE-005"
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  departments_involved: string[];    // e.g. ["Registration", "Revenue"]
  title: string;                     // Short title for dashboard summary
  description: string;               // Explainable narrative for government officers
  details: Record<string, any>;      // Department values compared (see below)
  sla_days_overdue: number | null;   // Number of days overdue beyond statutory timeline
  recommended_action: string;        // Prescribed administrative resolution workflow
  suggested_routing_dept: string;    // Department designated for primary field verification
  state: string;                     // Originating state
  state_code: string;                // "CH" | "TN"
  detected_at: string;               // ISO 8601 UTC timestamp
}

type ConflictType =
  | "OWNER_MISMATCH"
  | "MUTATION_SLA_BREACH"
  | "ZONING_INCONSISTENCY"
  | "AREA_DISCREPANCY"
  | "SATELLITE_LAND_USE_DRIFT";
```

### 4.1 Sample Conflict Payloads

#### Example 1: Owner Name Mismatch (`RULE-001`)
```json
{
  "conflict_id": "CONF-IN-CH-022-00111-OWN-01",
  "ulpin": "IN-CH-022-00111",
  "conflict_type": "OWNER_MISMATCH",
  "rule_id": "RULE-001",
  "severity": "CRITICAL",
  "departments_involved": ["Registration", "Revenue"],
  "title": "Ownership Divergence Between Registration and Revenue",
  "description": "Sale deed #VAS-2024-2201 registered in favour of 'Sunita Sharma' at Sub-Registrar Office, Sector 17, Chandigarh UT, but Revenue record (JAM-CH-2024-111) remains registered under 'Harpreet Singh Sandhu'. Revenue mutation status is currently 'Bila-Intiqal'.",
  "details": {
    "registered_owner": "Sunita Sharma",
    "revenue_owner": "Harpreet Singh Sandhu",
    "registration_deed_number": "VAS-2024-2201",
    "registration_date": "2024-05-10",
    "revenue_record_id": "JAM-CH-2024-111",
    "revenue_mutation_status": "NONE"
  },
  "sla_days_overdue": null,
  "recommended_action": "Initiate auto-notice to Sub-Registrar and Revenue Tehsildar/VAO. Trigger digital mutation verification workflow to update Record of Rights.",
  "suggested_routing_dept": "Revenue Department",
  "state": "Chandigarh (UT)",
  "state_code": "CH",
  "detected_at": "2026-09-11T07:36:34.838Z"
}
```

#### Example 2: Statutory Mutation SLA Breach (`RULE-002`)
```json
{
  "conflict_id": "CONF-IN-TN-CHN-00212-SLA-01",
  "ulpin": "IN-TN-CHN-00212",
  "conflict_type": "MUTATION_SLA_BREACH",
  "rule_id": "RULE-002",
  "severity": "CRITICAL",
  "departments_involved": ["Revenue"],
  "title": "Mutation Overdue by 69 Days Beyond Statutory SLA",
  "description": "Mutation application initiated on 2026-06-01 has been pending for 99 days. Statutory SLA limit is 30 days. Application is currently 69 days overdue for disposal.",
  "details": {
    "application_date": "2026-06-01",
    "statutory_sla_days": 30,
    "elapsed_days": 99,
    "overdue_days": 69,
    "mutation_id": "Pending Application",
    "current_status": "Pending with Zonal Deputy Tahsildar"
  },
  "sla_days_overdue": 69,
  "recommended_action": "Escalate to Sub-Divisional Magistrate (SDM) / Revenue Divisional Officer (RDO) under Right to Public Service Guarantee. Dispatch electronic pendency summons to field Tehsildar.",
  "suggested_routing_dept": "Revenue Department",
  "state": "Tamil Nadu",
  "state_code": "TN",
  "detected_at": "2026-09-11T07:36:34.841Z"
}
```

---

## 5. Trust Rating & Composite Scoring

Each parcel receives a **Composite Trust Score** ($0$ to $100$) reflecting title integrity:
$$\text{Trust Score} = \max\left(0, 100 - \sum \text{Severity Penalties}\right)$$
- `CRITICAL` Conflict Penalty: **$-35$ points**
- `HIGH` Conflict Penalty: **$-20$ points**
- `MEDIUM` Conflict Penalty: **$-10$ points**
- `LOW` Conflict Penalty: **$-5$ points**

### Trust Tiers:
- **`HIGH_TRUST`** ($85 - 100$): Clean title, full department consensus, clear for bank mortgages and commercial transactions.
- **`MEDIUM_TRUST`** ($60 - 84$): Minor technical variations or pending routine mutation within SLA.
- **`LOW_TRUST`** ($40 - 59$): Ownership divergence or overdue statutory SLA breach; title caution flag.
- **`DISPUTED`** ($0 - 39$): Severe compound conflict (e.g. unauthorized transfer, zoning violation in water body, active boundary court injunction).

---

## 6. Integration Contract for Teammate P2 (FastAPI Backend)

Teammate P2 can consume this layer through either:
1. **Direct File Ingestion:** Load `mock-data-ai/data/normalized/all_parcels.json` and `all_anomalies.json` into the PostGIS database during database seeding (`seed.py`).
2. **REST API Microservice:** Query the running HTTP microservice on `http://localhost:3005`:
   - `GET /api/health` -> System health and summary counts
   - `GET /api/statistics` -> Executive metrics and department matrices
   - `GET /api/anomalies` -> All flagged anomalies (supports `?state=CH`, `?severity=CRITICAL`, `?type=OWNER_MISMATCH`)
   - `GET /api/anomalies/:ulpin` -> Conflict audit dossier for specific parcel
   - `GET /api/parcels` -> All parcels with trust scores
   - `GET /api/parcels/:ulpin` -> Full 4-department normalized view for specific parcel
