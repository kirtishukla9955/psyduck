# DHARAA — Mock Data & Land Trust Engine AI Layer

**Digital Public Infrastructure for Land Governance (Bhu-DPI)**  
**Smart India Hackathon (SIH) 2026** — Department of Land Resources, Ministry of Rural Development  
**Module:** Presenter 1 (Mock Data & AI Layer)  
**Package:** `dharaa-mock-data-ai`

---

## 1. Executive Summary

In Indian land administration, records for the exact same physical parcel are fragmented across four distinct departments:
1. **Revenue Department:** Record of Rights (RoR) / Jamabandi / Patta-Chitta & Mutations
2. **Registration Department:** Sub-Registrar Office (SRO) / TNREGINET registered sale deeds
3. **Survey & Land Records Department:** Cadastral GIS boundaries / Field Measurement Book (FMB)
4. **Urban Development Authority:** Municipal Corporation / Town Planning Master Plans & Building Sanctions

Furthermore, every Indian state structures its land administration differently:
- **Chandigarh (UT):** Uses Punjab/Haryana revenue terminology (Jamabandi, Khewat, Khatoni, Khasra, Intiqal, Vasika) and regional units (**Kanal**, **Marla**, **Biswa**).
- **Tamil Nadu:** Uses Tamil administrative terminology (Patta/Chitta, A-Register, Taluk, Firka, TNREGINET) and regional units (**Grounds**, **Cents**, **Ares**, **Hectares**).

This module delivers:
1. **Realistic Multi-State, Multi-Department Mock Datasets:** Covering 32 parcels across Chandigarh and Tamil Nadu with authentic terminology, regional units, clean consensus records, and realistic planted conflicts.
2. **State-Adapter Normalization Engine:** Transparently maps heterogeneous state schemas into a single canonical, ULPIN-indexed schema (`NormalizedParcel`) with standardized units ($m^2$) and normalized land-use enums.
3. **Rule-Based Anomaly & Conflict Detection Engine:** Continuously cross-verifies departmental records for each ULPIN to detect owner name mismatches, statutory mutation SLA breaches, zoning inconsistencies, and cadastral area discrepancies.
4. **Zero-Dependency Runnable CLI & REST Microservice:** Provides instant command-line evaluation, ANSI terminal dashboards, JSON exports, and high-performance REST endpoints for teammate integration.

---

## 2. Directory Structure

```
mock-data-ai/
├── data/
│   ├── raw/
│   │   ├── chandigarh/                # Raw Northern state records (Kanal, Jamabandi, Vasika)
│   │   │   ├── revenue_jamabandi.json
│   │   │   ├── registration_deeds.json
│   │   │   ├── survey_cadastral.geojson
│   │   │   ├── urban_masterplan.json
│   │   │   └── satellite_observations.json
│   │   └── tamil_nadu/                # Raw Southern state records (Grounds, Cents, Patta, FMB)
│   │       ├── revenue_patta_chitta.json
│   │       ├── registration_deeds.json
│   │       ├── survey_fmb.geojson
│   │       ├── urban_planning.json
│   │       └── satellite_observations.json
│   └── normalized/                    # Generated canonical datasets & audit trail
│       ├── all_parcels.json           # All 32 normalized parcels with 4-department views
│       ├── all_anomalies.json         # Structured conflict audit flags
│       ├── chandigarh_normalized.json # Chandigarh normalized slice
│       └── tamil_nadu_normalized.json # Tamil Nadu normalized slice
├── src/
│   ├── adapters/
│   │   ├── chandigarhAdapter.js       # Normalizes Urdu/Punjabi revenue terms & Kanal/Marla
│   │   ├── tamilNaduAdapter.js        # Normalizes Tamil revenue terms & Grounds/Cents
│   │   └── adapterEngine.js           # ULPIN state detection, GIS area & name normalizer
│   ├── detector/
│   │   ├── rules.js                   # Explainable rules (RULE-001 through RULE-005)
│   │   └── anomalyDetector.js         # Evaluator, Trust Scorer & aggregate metrics
│   ├── index.js                       # CLI entrypoint with ANSI dashboard & exports
│   └── server.js                      # High-performance HTTP REST microservice
├── test/
│   └── detector.test.js               # Automated test suite (17 tests, 100% pass)
├── docs/
│   └── mock-data-schema.md            # Comprehensive schema specification & API contract
├── package.json
└── README.md
```

---

## 3. Quickstart & Usage

### 3.1 Run from Module Directory
```bash
cd mock-data-ai

# Run evaluation, display terminal dashboard, and export normalized JSONs
npm start
# or
npm run detect

# Compact executive KPI summary
npm run detect:summary

# Run automated test suite
npm test

# Launch local REST API microservice (port 3005)
npm run serve
```

### 3.2 Run from Repository Root
```bash
# Evaluate and display dashboard from project root
npm run mock-data:detect

# Run automated tests from project root
npm run mock-data:test

# Launch microservice from project root
npm run mock-data:serve
```

---

## 4. CLI Capabilities & Flags

| Flag | Description | Example |
|---|---|---|
| *(default)* | Normalizes all data, executes rules, displays full audit trail, and exports JSON | `node src/index.js` |
| `--summary` | Displays executive KPI cards and state breakdown without full anomaly list | `node src/index.js --summary` |
| `--ulpin=<ID>` | Generates a complete 4-department dossier and conflict report for a specific parcel | `node src/index.js --ulpin=IN-CH-022-00111` |
| `--json` | Outputs clean, machine-readable JSON to stdout for pipeline chaining | `node src/index.js --json` |
| `--serve` | Starts the zero-dependency REST microservice on port 3005 (or `--port=PORT`) | `node src/index.js --serve --port=3005` |
| `--no-export`| Skips writing files to `data/normalized/` | `node src/index.js --no-export` |

---

## 5. Detected Anomaly Types & Rules

### `RULE-001: OWNER_MISMATCH` (Severity: CRITICAL)
- **Condition:** Sub-Registrar sale deed has been executed and registered to a new buyer, but Revenue Record of Rights (RoR/Patta) still lists the prior owner, and mutation has not been finalized.
- **Example:** In Chandigarh parcel `IN-CH-022-00111`, Sale Deed `#VAS-2024-2201` is registered to *Sunita Sharma*, but Revenue Jamabandi remains registered to *Harpreet Singh Sandhu* under unmutated (*Bila-Intiqal*) status.
- **Administrative Action:** Auto-notice dispatched to Sub-Registrar and Revenue Tehsildar; digital mutation verification workflow initiated.

### `RULE-002: MUTATION_SLA_BREACH` (Severity: HIGH to CRITICAL)
- **Condition:** A mutation transfer application has remained unfinalized past statutory deadlines (default: 30 days under State Right to Public Service Acts).
- **Example:** In Tamil Nadu parcel `IN-TN-CHN-00212`, mutation application initiated on 2026-06-01 is 69 days overdue beyond the 30-day statutory SLA.
- **Administrative Action:** Escalated to Sub-Divisional Magistrate (SDM) / Revenue Divisional Officer (RDO); pendency show-cause summons issued.

### `RULE-003: ZONING_INCONSISTENCY` (Severity: HIGH to CRITICAL)
- **Condition:** Revenue records or registered activities conflict with Master Plan environmental zoning or active building sanction violations.
- **Example:** In Tamil Nadu parcel `IN-TN-CHN-00213`, land is zoned as *Water Body Buffer Zone* under the Chennai Metropolitan Development Authority (CMDA) Master Plan II, but Revenue records recognize residential layout with active stop-work violation notices.
- **Administrative Action:** Immediate freeze on commercial building permits; referred to Town Planning Directorate and District Environmental Committee.

### `RULE-004: AREA_DISCREPANCY` (Severity: MEDIUM to CRITICAL)
- **Condition:** Demarcated physical boundary area from Survey (Total Station / Cadastral / FMB) diverges by $>5\%$ from declared revenue/deed extent.
- **Example:** In Chandigarh parcel `IN-CH-034-00114`, Cadastral surveyed boundary measures $1,650\text{ m}^2$, diverging by $18.5\%$ ($373.4\text{ m}^2$) from declared Revenue extent of $2,023.4\text{ m}^2$ with an active boundary dispute marker.
- **Administrative Action:** Joint electronic boundary resurvey (ETS / DGPS) ordered by Survey Inspector with Revenue Patwari present.

### `RULE-005: SATELLITE_LAND_USE_DRIFT` (Severity: HIGH)
- **Condition:** Stand-in change-detection signal representing multi-temporal Sentinel-2 observations detects significant vegetation reduction ($\Delta \text{NDVI} < -0.35$) or unauthorized concrete structures on agricultural land or wetland buffers.
- **Administrative Action:** Municipal Drone Inspection Wing deployed for physical ground-truthing.

---

## 6. HTTP REST API Microservice

When running `node src/index.js --serve` (or `npm run serve`), the service exposes:

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check, uptime, total parcels and anomalies |
| `/api/statistics` | GET | Full executive KPIs, severity breakdown, and department matrices |
| `/api/anomalies` | GET | List of all flagged anomalies (supports `?state=CH`, `?severity=CRITICAL`, `?type=OWNER_MISMATCH`, `?department=Revenue`) |
| `/api/anomalies/:ulpin` | GET | Conflict audit dossier and trust score for a specific ULPIN |
| `/api/parcels` | GET | All normalized parcels with trust scores (supports `?clean=true`, `?conflicted=true`, `?state=TN`) |
| `/api/parcels/:ulpin` | GET | Full 4-department normalized view for a specific ULPIN |
| `/api/recalculate` | POST | Triggers live re-normalization and re-evaluation |

All endpoints support cross-origin requests (`Access-Control-Allow-Origin: *`) for seamless local development with teammates P2 (FastAPI), P3 (Citizen Portal), and P4 (Admin Dashboard).

---

## 7. Automated Test Suite

The test suite runs with Node's native test runner (`node --test`), requiring zero external test libraries:

```bash
npm test
```

### Verified Test Cases (17/17 Passing):
- **Unit Conversion Tests:** Chandigarh Kanal/Marla/Biswa and Tamil Nadu Grounds/Cents/Acre conversion accuracy.
- **Date & Terminology Tests:** Multi-format date parsing (`DD/MM/YYYY` and `YYYY-MM-DD`) and state mutation status normalization.
- **Indian Name Normalization:** Honorific stripping, initials transposition, and phonetic token equivalence.
- **Adapter Ingestion Tests:** Ingestion of all 32 parcels with valid geometries and 4-department representations.
- **Anomaly Detection Tests:** Verification of 20 clean consensus parcels (100 Trust Score) and 12 conflicted parcels with exact rule validation.
- **Schema Validation:** Strict compliance of output anomaly objects with the `ConflictFlag` contract.

---

## 8. Schema Documentation Reference

For complete field-by-field definitions, TypeScript interfaces, and integration guidelines for teammates, refer to:  
👉 **[docs/mock-data-schema.md](../docs/mock-data-schema.md)**
