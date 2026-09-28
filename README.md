# dharaa — GIS-Based Digital Public Infrastructure for Land Governance

**Smart India Hackathon (SIH) 2026**  
**Module:** **P2 — Backend & Land Trust Engine**  
**Repository:** [https://github.com/kirtishukla9955/psyduck](https://github.com/kirtishukla9955/psyduck)

---

## 1. Executive Summary

**dharaa (Bhu-DPI)** is an open, interoperable Digital Public Infrastructure for modern land administration and governance. 

This repository houses the **P2: Backend & Trust Engine** core module, providing:
1. **Deterministic ULPIN Indexing:** 14-digit Unique Land Parcel Identification Numbers generated directly from centroid geometry and state codes.
2. **Land Trust Engine:** Automated cross-verification of multi-department land records (Revenue vs. Registration vs. Survey vs. Urban Development) to instantly flag owner name mismatches.
3. **Mutation SLA Timer:** Statutory countdown monitoring for land mutation applications (7-day SLA compliance) with automatic breach and overdue detection.
4. **Interoperable REST API Gateway:** High-performance FastAPI endpoints designed for integration with:
   - **P1:** GIS / Leaflet Map Module (Bounding-box GeoJSON queries)
   - **P3:** Citizen Portal (Parcel search, title verification, property tax status)
   - **P4:** Admin & Department Dashboard (Conflict auditing, mutation processing, spatial analytics)
   - **Financial Institutions:** Instant title encumbrance & fraud risk checks for loan eligibility.

---

## 2. System Architecture

```
land-stack/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI entry point & API gateway
│   │   ├── database.py           # SQLAlchemy session and engine management
│   │   ├── models.py             # Parcel, DepartmentRecord, Mutation ORM models
│   │   ├── schemas.py            # Pydantic request/response validation models
│   │   ├── crud.py               # Data access layer & PostGIS spatial queries
│   │   │
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── parcels.py        # /parcels and /parcel/{ulpin} endpoints
│   │   │   ├── mutations.py      # /mutations lifecycle & SLA endpoints
│   │   │   ├── conflicts.py      # /conflicts audit & dashboard endpoints
│   │   │   └── bank.py           # /bank/check-loan mock financial gateway
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── trust_engine.py   # Land Trust Engine (Mismatch, SLA, Trust scoring)
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       └── ulpin.py          # Deterministic 14-char ULPIN generator
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_trust_engine.py  # Unit tests for Trust Engine logic
│   │   └── test_api.py           # API integration tests with TestClient
│   │
│   ├── seed.py                   # Multi-department SIH mock dataset generator
│   ├── requirements.txt          # Production & test dependencies
│   └── README.md                 # Backend documentation
│
├── mock-data-ai/                  # Presenter 1: Mock Data & Land Trust Engine AI Layer
│   ├── data/
│   │   ├── raw/                  # Heterogeneous multi-department state datasets (CH & TN)
│   │   └── normalized/           # Canonical ULPIN-indexed datasets & anomaly audit logs
│   ├── src/
│   │   ├── adapters/             # State-adapter normalization engine (Chandigarh & Tamil Nadu)
│   │   ├── detector/             # Rule-based conflict detection engine (RULE-001 to RULE-005)
│   │   ├── index.js              # Command-line dashboard runner & JSON exporter
│   │   └── server.js             # High-performance REST API microservice (port 3005)
│   ├── test/
│   │   └── detector.test.js      # Automated test suite (17 tests, 100% pass)
│   ├── docs/
│   │   └── mock-data-schema.md   # Complete schema specification & API contract
│   ├── package.json
│   └── README.md
│
├── docs/
│   └── mock-data-schema.md       # Root schema specification & API contract
│
├── docker-compose.yml            # PostgreSQL 16 + PostGIS 3.4 database container
├── .env.example                  # Environment variable configuration template
├── .gitignore                    # Git tracking exclusions
└── README.md                     # Project documentation
```

---

## 3. Technology Stack

- **Framework:** Python 3.10+ / FastAPI (Asynchronous high-performance REST API)
- **Database:** PostgreSQL 16 with PostGIS 3.4 Extension
- **ORM & Spatial Tools:** SQLAlchemy 2.0, GeoAlchemy2, Shapely 2.0
- **Validation & Docs:** Pydantic v2, Swagger UI (`/docs`), ReDoc (`/redoc`)
- **Containerization:** Docker & Docker Compose
- **Testing:** Pytest, HTTPX

---

## 4. Step-by-Step Setup & Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/kirtishukla9955/psyduck.git
cd psyduck
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**
```bash
cp .env.example .env
```

The default database connection string in `.env` is:
```env
DATABASE_URL=postgresql://postgres:devpass@localhost:5432/landstack
MUTATION_SLA_DAYS=7
APPROACHING_SLA_THRESHOLD_DAYS=2
```

### Step 3: Start PostGIS Database via Docker
Ensure Docker Desktop is running, then execute:
```bash
docker compose up -d
```
*This starts the `landstack-db` container running PostgreSQL 16 with PostGIS enabled on port `5432`.*

### Step 4: Setup Python Virtual Environment
Navigate to the `backend` directory:
```bash
cd backend
```

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 5: Install Requirements
```bash
pip install -r requirements.txt
```

### Step 6: Seed Demo Data
Populate the database with realistic mock multi-department parcels and mutations:
```bash
python seed.py
```

### Step 7: Run Automated Tests
Verify all components, Trust Engine rules, and endpoints:
```bash
python -m pytest tests -v
```

### Step 8: Start the FastAPI Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 9: Explore Interactive API Documentation
Open your browser and navigate to:
- **Swagger Interactive UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc UI:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Endpoint:** [http://localhost:8000/](http://localhost:8000/)

---

## 5. API Reference & Contracts

### A. Health Check
- `GET /`: Returns service health status and API version.

### B. Parcel Endpoints (P1 & P3 Integration)
- `GET /parcels`:
  - **List Mode:** `GET /parcels?skip=0&limit=50&owner_name=Ramesh` (Returns parcel summaries for Citizen/Admin portals).
  - **GIS Map Viewport Mode:** `GET /parcels?bbox=76.77,30.73,76.80,30.75` (Returns GeoJSON FeatureCollection for Leaflet/Mapbox).
- `GET /parcel/{ulpin}`: Returns comprehensive parcel details including polygon GeoJSON boundary, owner, ROR data, encumbrance status, and real-time `trust_status`.
- `POST /parcels`: Registers a new polygon parcel and deterministically generates its 14-digit ULPIN.

### C. Land Trust Engine & Conflicts (P4 Admin Dashboard)
- `GET /conflicts`: Returns state-wide conflict audit summary:
  - Total active conflicts
  - Count of owner name mismatches across departments
  - Count of overdue mutations breaching SLA
  - Count of physical geometry overlaps
  - Full itemized conflict records
- `GET /conflicts/{ulpin}`: Returns detailed audit report for a specific parcel ULPIN.

### D. Mutation Lifecycle & SLA Monitoring
- `GET /mutations`: Lists mutations with optional filters:
  - `?status=PENDING`
  - `?ulpin=01837492817201`
  - `?overdue_only=true` (Instantly filters only SLA-breached applications)
- `GET /mutations/{mutation_id}`: Returns mutation details with live SLA countdown (`days_remaining` or `days_overdue`).
- `POST /mutations`: Submits a new ownership mutation request with statutory SLA deadline.
- `PATCH /mutations/{mutation_id}`: Updates mutation status (`UNDER_REVIEW`, `APPROVED`, `REJECTED`) and auto-logs resolution timestamp.

### E. Financial Interoperability (Bank Loan Gateway)
- `POST /bank/check-loan/{ulpin}`: Evaluates mortgage status and spatial overlap fraud risk to issue an immediate `APPROVED`, `REJECTED`, or `FLAGGED FOR REVIEW` recommendation.

---

## 6. Simulated Mock Data Scenarios

The `seed.py` script provisions 5 distinct governance scenarios:

| Scenario | ULPIN / ID | Owner | Key Features | Trust Engine Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **1. Normal Title** | `01837492817201` | Ramesh Kumar | All 4 departments agree; zero encumbrance. | `VERIFIED` (Clear title) |
| **2. Owner Mismatch** | `01928475819202` | Priya Singh | Revenue shows *Priya Singh*; Registration shows *Vikram Singh*. | `FLAGGED` (`HIGH` severity `OWNER_NAME_MISMATCH`) |
| **3. Mutation Within SLA** | `MUT-2026-0001` | Sunita Sharma | Submitted 2 days ago; 7-day SLA. | `WITHIN_SLA` (5 days remaining) |
| **4. Overdue Mutation** | `MUT-2026-0002` | Harpreet Kaur | Submitted 18 days ago; 7-day SLA. | `OVERDUE` (Breached by 11 days) |
| **5. Spatial Lien / Overlap** | `01938475819205` | Rajesh Verma | Physically overlaps Parcel 1; Active SBI loan (₹75L). | `FLAGGED` (Geometry overlap & Lien) |

*Disclaimer: All names, numbers, coordinates, and survey entries are simulated mock data strictly for Smart India Hackathon 2026 demonstration purposes.*

---

## 7. Presenter 1: Mock Data & Land Trust Engine AI Layer

The **Mock Data & AI Layer** (`mock-data-ai/`) simulates fragmented state land records across two pilot states (**Chandigarh** and **Tamil Nadu**), demonstrates the **State-Adapter concept**, and runs an automated **Rule-Based Anomaly Detection Engine**:

- **Multi-Department Mock Datasets:** 32 parcels (16 CH + 16 TN) covering Revenue, Registration, Survey, and Urban Development with authentic state-specific terminology and regional land units (Kanal/Marla vs. Grounds/Cents).
- **State-Adapter Normalization:** Standardizes heterogeneous state data into canonical ULPIN-indexed JSON records.
- **Explainable Conflict Rules:** Automatically flags Owner Name Mismatches (`RULE-001`), Statutory Mutation SLA Breaches (`RULE-002`), Master Plan Zoning Inconsistencies (`RULE-003`), Cadastral Area Discrepancies (`RULE-004`), and Satellite Land-Use Drift (`RULE-005`).
- **Schema & API Documentation:** Detailed contract in [`docs/mock-data-schema.md`](docs/mock-data-schema.md).

### Quick Commands:
```bash
# Ingest raw records, evaluate conflicts, display executive dashboard & export JSON
npm run mock-data:detect

# Run automated test suite (17/17 tests passing)
npm run mock-data:test

# Launch high-performance REST microservice (port 3005)
npm run mock-data:serve
```

---

## 8. Team Integration Contract

- **For P1 (GIS / Map):** Consume `GET /parcels?bbox=minLng,minLat,maxLng,maxLat` to render polygons with dynamic styling based on `mortgaged` and `trust_status`.
- **For P2 (Backend & Trust Engine):** Reference `docs/mock-data-schema.md` to align FastAPI schemas or ingest `mock-data-ai/data/normalized/all_parcels.json`.
- **For P3 (Citizen Portal):** Query `GET /parcel/{ulpin}` for instant title verification, ownership breakdown, and tax liability dues.
- **For P4 (Admin Dashboard):** Call `GET /conflicts` to monitor integrity anomalies and `GET /mutations?overdue_only=true` to escalate delayed government files.

---

## 9. License & Project Rights

Developed for **Smart India Hackathon 2026** by the dharaa Development Team.
