# DHARAA (Bhu-DPI) — Database & Data Model Technical Specification

**Author:** DHARAA Database & Data Architecture Team  
**Audience:** Frontend Team (Psyduck UI/UX), Backend Team (FastAPI / Land Trust Engine), GIS Team  
**Standard Compliance:** Digital India Land Records Modernization Programme (DILRMP), ISO 19152 Land Administration Domain Model (LADM), Local Government Directory (LGD) Ministry of Panchayati Raj, DoLR Bhu-Aadhaar (ULPIN) Standard.  
**Version:** 2.0.0 (Production Master Contract)  
**Status:** Locked for Development & System Integration  

---

## Executive Summary & Architectural Notice

> [!IMPORTANT]
> **Canonical Contract Freeze:**  
> The identifiers (`ulpin`, `parcel_id`, `ror_id`, `mapping_id`, `owner_id`), administrative codes (`state_lgd_code`, `district_lgd_code`, `subdistrict_lgd_code`, `village_lgd_code`), and response payloads defined herein are **LOCKED**. As requested, these core fields and relational contracts will not be altered without prior bilateral sign-off with both frontend and backend leads.

> [!NOTE]
> **Spatial Geometry / Satellite Decoupling:**  
> In accordance with project instructions, **coordinates and parcel geometries are currently stored as empty/null (`centroid_lat: null`, `centroid_lon: null`, `boundary_geojson: null`, `polygon_coordinates: []`)** across all mock records. Satellite observation imagery and Earth Observation raster/vector layers will be linked in a later phase once end-to-end data pipeline workflows are completed.

---

# SECTION A: LAND PARCEL DATA

### 1. What is the database entity/table/model used for a land parcel?
* **Table / Model Name:** `parcels` (Relational SQL entity) / `NormalizedParcel` (ORM / API DTO).
* **Primary Key:** `parcel_id` (`VARCHAR(36)` / UUIDv4 surrogate primary key).
* **Canonical Natural Key:** `ulpin` (`VARCHAR(20)` UNIQUE NOT NULL — 14-digit Bhu-Aadhaar).
* **Important Fields & Data Types:**

| Field Name | SQL Data Type | Nullable | Description / Business Rule |
|---|---|---|---|
| `parcel_id` | `VARCHAR(36)` | No | Surrogate UUIDv4 Primary Key. |
| `ulpin` | `VARCHAR(20)` | No | Unique Land Parcel Identification Number (Bhu-Aadhaar). |
| `village_lgd_code` | `INTEGER` | No | Local Government Directory (LGD) Village code (MoPR). |
| `khasra_plot_no` | `VARCHAR(50)` | No | State-specific Survey / Khasra / Dag / Gut number. |
| `recorded_area` | `NUMERIC(14,4)` | No | Parcel extent as declared in primary RoR. |
| `recorded_area_unit`| `VARCHAR(50)` | No | Native unit (e.g. Kanal, Bigha, Ground, Guntha, Acre). |
| `normalized_area_sqm`| `NUMERIC(14,4)`| No | Extent converted to standard Square Meters ($m^2$). |
| `gis_area_sqm` | `NUMERIC(14,4)` | Yes | Surface area computed from georeferenced boundary. |
| `land_use_category` | `VARCHAR(50)` | No | Standardized classification enum. |
| `land_use_raw` | `VARCHAR(100)` | No | Native land use term (e.g. Nanjai, Chahi, Gair Mumkin). |
| `status` | `VARCHAR(30)` | No | Lifecycle status (`ACTIVE`, `PENDING_MUTATION`, `DISPUTED`). |
| `cadastral_survey_status`| `VARCHAR(30)`| No | `SURVEYED`, `RE_SURVEY_IN_PROGRESS`, `UNSURVEYED`. |
| `cadastral_sheet_no`| `VARCHAR(50)` | Yes | Collabland / Cadastral map sheet reference. |
| `fmb_sketch_no` | `VARCHAR(50)` | Yes | Field Measurement Book (FMB) sketch identifier. |
| `centroid_lat` | `NUMERIC(10,7)`| Yes | WGS84 Latitude (Kept `NULL` during mock phase). |
| `centroid_lon` | `NUMERIC(10,7)`| Yes | WGS84 Longitude (Kept `NULL` during mock phase). |
| `boundary_geojson` | `TEXT` / `JSON`| Yes | GeoJSON representation (Kept `NULL` during mock phase). |
| `data_freshness_status`| `VARCHAR(20)`| No | `CURRENT`, `STALE`, `UNKNOWN`. |
| `created_at` | `TIMESTAMPTZ` | No | ISO 8601 UTC creation timestamp. |
| `updated_at` | `TIMESTAMPTZ` | No | ISO 8601 UTC last update timestamp. |

---

### 2. What fields are stored for each parcel?
Confirmed database field mappings:
* **Parcel ID:** `parcel_id` (`VARCHAR(36)`)
* **ULPIN:** `ulpin` (`VARCHAR(20)`)
* **Khasra / Plot Number:** `khasra_plot_no` (`VARCHAR(50)`)
* **State:** `state_name` (`VARCHAR(100)`), `state_code` (`VARCHAR(2)`), `state_lgd_code` (`INTEGER`)
* **District:** `district_name` (`VARCHAR(100)`), `district_lgd_code` (`INTEGER`)
* **Tehsil / Taluk:** `subdistrict_name` (`VARCHAR(100)`), `subdistrict_lgd_code` (`INTEGER`), `subdistrict_type` (`VARCHAR(50)`)
* **Village:** `village_name` (`VARCHAR(100)`), `village_lgd_code` (`INTEGER`)
* **Area:** `recorded_area` (raw value), `normalized_area_sqm` (standard metric $m^2$), `gis_area_sqm` (demarcated GIS extent)
* **Area Unit:** `recorded_area_unit` (`VARCHAR(50)`)
* **Land-use / Type:** `land_use_category` (Normalized enum) and `land_use_raw` (State-specific vernacular term)
* **Survey Information:** `cadastral_sheet_no`, `fmb_sketch_no`, `cadastral_survey_status`
* **Status:** `status` (`ACTIVE`, `PENDING_MUTATION`, `SUBDIVIDED`, `AMALGAMATED`, `DISPUTED`, `ARCHIVED`)
* **Other Important Fields:** `data_freshness_status`, `centroid_lat`, `centroid_lon`, `boundary_geojson`, `created_at`, `updated_at`.

---

### 3. What is the canonical identifier of a parcel?
* **Canonical Interoperability / Business Key:** **`ulpin`** (Unique Land Parcel Identification Number).
  * All public portals, citizen logins, QR codes, cross-departmental APIs, and frontend search queries query by **`ulpin`**.
* **Database Relational Foreign Key:** **`parcel_id`** (UUIDv4) is used for database-level surrogate indexing and foreign key constraints to guarantee immutability even in rare cases where an administrative re-survey re-computes an ULPIN geocode.
* **Why Khasra is NOT canonical:** Khasra numbers (e.g. "Plot 14/2") are neither state-wide nor district-wide unique. They repeat in virtually every village.

---

### 4. Is ULPIN currently stored?
* **Field Name:** `ulpin`
* **Data Type:** `VARCHAR(20)`
* **Is it Unique?** **YES.** Enforced via `UNIQUE NOT NULL` constraint on `parcels(ulpin)`.
* **Is it Always Present?** **YES.** Every parcel record in DHARAA contains an ULPIN. For legacy unsurveyed parcels where geo-coordinates are pending, a provisional ULPIN is generated: `PROV-<STATE_CODE>-<VILLAGE_LGD>-<SEQ>`.
* **Validation Rules:**
  * **National Bhu-Aadhaar Standard:** 14-character alphanumeric string generated from longitude and latitude coordinates of the parcel's bounding polygon vertices: `^[0-9A-Z]{14}$`.
  * **Pilot Platform Schema:** `^[A-Z]{2}-[A-Z0-9]{2,8}-[0-9]{4,6}$` or `^IN-[A-Z]{2}-[A-Z0-9]{3,5}-[0-9]{5}$`.

---

# SECTION B: GIS / CADASTRAL DATA

### 5. Where is the actual parcel geometry stored?
* **Production Database:** PostgreSQL with the **PostGIS** extension enabled (`geometry` column in `parcels` table).
* **Storage Architecture:**
  * PostGIS spatial binary (`GEOMETRY`) inside the database for fast bounding-box spatial indexing (`GIST`).
  * Cached Vector Tiles (MVT) generated via tile servers (`pg_tileserv` / `Martin`).
  * Static GeoJSON archives stored in object storage (MinIO / S3).
* **Current Mock Phase:** As requested, **coordinates and geometries are intentionally left empty/null** (`centroid: null`, `polygon_coordinates: []`, `boundary_geojson: null`).

---

### 6. What geometry types are supported?
* Supported types: **`Polygon`** and **`MultiPolygon`**.
* Single-part parcels are stored as standard `Polygon`.
* Disjoint parcels, enclaves, parcels severed by a railway line or canal, and undivided coparcenary agricultural shares are stored as `MultiPolygon`.
* Spatial column type: `GEOMETRY(MultiPolygon, 4326)` (allows transparent storage of both single and multi-polygons).
* Center points are extracted via `ST_Centroid(geom)` into `Point`.

---

### 7. What coordinate reference system (CRS) is used?
* **Canonical CRS & EPSG Code:** **`EPSG:4326`** (WGS 84 — World Geodetic System 1984, decimal degrees Latitude/Longitude).
* **Geodesic Calculation Engine:** For precise metric area and perimeter measurements, PostGIS uses `geography` type casting (`ST_Area(geom::geography)`) or dynamic local UTM projection (UTM Zone 43N / 44N, EPSG:32643 / EPSG:32644).
* **Frontend Web Map Tiles:** Projected to **`EPSG:3857`** (Web Mercator) on the fly by the map renderer.

---

### 8. What is the geometry field/type?
* **PostgreSQL / PostGIS Definition:**
  ```sql
  geometry GEOMETRY(MultiPolygon, 4326) NULL
  ```
* **Spatial Index Definition:**
  ```sql
  CREATE INDEX idx_parcels_geometry ON parcels USING GIST(geometry);
  ```
* **API / JSON Representation:** RFC 7946 compliant GeoJSON object (`boundary_geojson`).

---

### 9. Is the cadastral geometry actual/official data or currently sample/demo data?
* **Classification:**
  * **Pilot Baseline (Chandigarh & parts of Tamil Nadu):** Digitized vector boundaries derived from official Urban Master Plans, UT Estate Office cadastral maps, and Tamil Nilam FMB sheets (Sample/Official Hybrid).
  * **All-States Mock Dataset (36 States & UTs):** **Generated/Demo data** adhering to the official DoLR schema, with coordinates left empty/null as instructed.
  * **Status:** Coordinates not connected to satellite images at this time.

---

### 10. What is the approximate parcel volume?
* **Empirical Administrative Parcel Counts in India:**
  * **One Village:** ~500 to 3,500 parcels (Average: ~1,200 parcels).
  * **One Tehsil / Taluk:** 50 to 200 villages = ~60,000 to 250,000 parcels.
  * **One District:** 4 to 12 tehsils = ~500,000 to 2,500,000 parcels.
  * **Entire System (National scale):** ~140,000,000+ parcels across India.
* **Frontend Architecture Mandate:**
  * The frontend **MUST NOT** attempt to load raw GeoJSON files at Tehsil, District, or State levels. Browsers will freeze or crash if rendering >5,000 SVG/Canvas vector paths.
  * **Strategy:** Use Mapbox Vector Tiles (MVT / Protocol Buffers) with level-of-detail simplification for zoom levels 1–14.
  * For village-level cadastre (zoom $\ge 15$), the backend provides BBOX-filtered GeoJSON with strict pagination (`LIMIT 500`).

---

# SECTION C: PARCEL ↔ RECORD OF RIGHTS (RoR) RELATIONSHIP

### 11. What database entity represents the Record of Rights (RoR)?
* **Table / Model Name:** `ror_records`
* **Primary Key:** `ror_id` (`VARCHAR(36)` / UUIDv4).
* **Important Fields:**
  * `ror_id` (UUID Primary Key)
  * `village_lgd_code` (LGD Village)
  * `state_record_id` (Official state register number, e.g. `JAM-UP-2024-9102`, `PATTA-TN-2024-201`)
  * `record_type` (`Jamabandi`, `Patta & Chitta`, `7/12 Extract`, `Khatiyan`, `Adangal`, `Pahani / RTC`)
  * `khata_khewat_no` (Proprietary / ownership Khata or Khewat account number)
  * `khatauni_no` (Cultivator / holding Khatoni number)
  * `tenure_type` (e.g. `Bhumiswami with Transferable Rights`, `Raiyati`, `Government Leasehold`)
  * `total_khata_area_sqm` (Aggregated area of all parcels listed under this Khata)
  * `land_revenue_tax_inr` (Assessed annual land revenue, cesses, and water charges)
  * `mutation_status` (`MUTATED`, `PENDING`, `UNMUTATED_TRANSACTION`, `REJECTED`, `DISPUTED`)
  * `active_mutation_id` (Reference to in-flight mutation application if pending)
  * `recorded_date` (Date of last official record entry)
  * `fasli_or_rev_year` (Revenue Fasli year, e.g. "1433 Fasli" or "2025-2026")
  * `status` (`ACTIVE`, `HISTORICAL_SUPERSEDED`)

---

### 12. What is the exact relationship between a parcel and its RoR?
* **Relationship:** **Many-to-Many ($M:N$)**, resolved through a normalized junction entity `parcel_ror_mappings`.
* **Relational Schema:**
  ```sql
  CREATE TABLE parcel_ror_mappings (
      mapping_id VARCHAR(36) PRIMARY KEY,
      parcel_id VARCHAR(36) NOT NULL REFERENCES parcels(parcel_id) ON DELETE RESTRICT,
      ror_id VARCHAR(36) NOT NULL REFERENCES ror_records(ror_id) ON DELETE RESTRICT,
      ulpin VARCHAR(20) NOT NULL REFERENCES parcels(ulpin),
      extent_in_ror_sqm NUMERIC(14,4) NOT NULL,
      is_primary_ror BOOLEAN NOT NULL DEFAULT 1,
      linked_at TEXT NOT NULL,
      UNIQUE(parcel_id, ror_id)
  );
  ```
* **Canonical Query Path:**
  $$\text{ULPIN} \longrightarrow \text{parcels} \longrightarrow \text{parcel\_ror\_mappings} \longrightarrow \text{ror\_records} \longrightarrow \text{parcel\_owners} \longrightarrow \text{owners}$$

---

### 13. Can one parcel have multiple RoR records?
* **YES.** Supported scenarios:
  1. **Historical Versioning / Audit Chain:** When a sale or mutation occurs, the previous RoR record is marked `status = 'HISTORICAL_SUPERSEDED'` and preserved for legal traceability.
  2. **Joint Non-Partitioned Holdings (Min Khasras):** A physical cadastral parcel may be co-owned under separate individual Khatas prior to formal field partition.
  3. **Multi-Department Divergence:** A parcel may have an active Revenue RoR and a conflicting Urban Estate Office Allotment Register.

---

### 14. Can one RoR contain multiple parcels?
* **YES.** Extremely common across all states.
  * In Indian revenue administration, a single **Khata / Patta** (e.g. Patta No. 240) belongs to a landholder or joint family and frequently encompasses 3 to 10 distinct, non-contiguous Khasra plots across the village (e.g. Khasra 12/1 agricultural, Khasra 15/4 tube-well, Khasra 22/9 residential plot).
  * `total_khata_area_sqm` in `ror_records` equals the sum of `extent_in_ror_sqm` across all mapped parcels.

---

### 15. Can a parcel have multiple owners/co-owners?
* **YES.** Over 60% of rural land parcels in India are jointly held.
* **Representation:** Normalized Many-to-Many relationship using `parcel_owners` linked to `owners`.
* **Fields Captured:**
  * `ownership_share_fraction` (e.g., `"1/2"`, `"1/4"`, `"3/8"`)
  * `ownership_share_percentage` (e.g., `50.00`, `25.00`)
  * `ownership_type` (`SOLE_OWNER`, `CO_PARCENER`, `JOINT_TENANT`, `TENANT_IN_COMMON`, `LEASEHOLDER`)
  * `is_primary_contact` (`BOOLEAN` flag)

---

# SECTION D: OWNER DATA

### 16. What fields are stored for owners?
* **Entity / Model:** `owners`
* **Primary Key:** `owner_id` (`VARCHAR(36)` / UUIDv4).
* **Fields:**

| Field Name | Data Type | Description |
|---|---|---|
| `owner_id` | `VARCHAR(36)` | Unique Owner UUID. |
| `owner_name_en` | `VARCHAR(200)` | Full name in English (Roman script). |
| `owner_name_local` | `VARCHAR(200)` | Full legal name in Native Indian script. |
| `relation_type` | `VARCHAR(50)` | Relationship (`Son of`, `Daughter of`, `Spouse of`, `Director`). |
| `relative_name_en` | `VARCHAR(200)` | Father/Husband name in English. |
| `relative_name_local`| `VARCHAR(200)` | Father/Husband name in Native script. |
| `gender` | `VARCHAR(20)` | `MALE`, `FEMALE`, `TRANSGENDER`, `ENTITY_CORPORATE`, `TRUST`. |
| `owner_category` | `VARCHAR(50)` | `INDIVIDUAL`, `JOINT`, `PRIVATE_COMPANY`, `GOVT_DEPT`, `WAQF_BOARD`. |
| `pan_masked` | `VARCHAR(20)` | Masked PAN (e.g. `XXXXXX784A`). |
| `aadhaar_vault_ref`| `VARCHAR(64)` | Secure SHA-256 vault token reference (NO raw Aadhaar stored). |
| `mobile_masked` | `VARCHAR(20)` | Masked mobile (e.g. `XXXXXX9821`). |
| `address_line` | `TEXT` | Domicile / residential address. |
| `created_at` | `TIMESTAMPTZ` | Timestamp of creation. |

---

### 17. How are multiple owners represented?
* **In the Database:** **One-to-Many / Many-to-Many** via the relational junction table `parcel_owners`.
* **In the API Response:** Returned as a structured list:
  ```json
  "owners": [
    {
      "owner_id": "own-tn-565-001",
      "name_en": "M. Sivasankaran",
      "name_local": "எம். சிவசங்கரன்",
      "relationship": "Son of Late K. Muthukumar",
      "share_fraction": "1/2",
      "share_percentage": 50.0,
      "ownership_type": "CO_PARCENER",
      "is_primary": true
    },
    {
      "owner_id": "own-tn-565-002",
      "name_en": "M. Rajendran",
      "name_local": "எம். ராஜேந்திரன்",
      "relationship": "Son of Late K. Muthukumar",
      "share_fraction": "1/2",
      "share_percentage": 50.0,
      "ownership_type": "CO_PARCENER",
      "is_primary": false
    }
  ]
  ```

---

### 18. Are owner names stored in English, Native Indian script, Both, or Transliteration?
* **Stored In:** **BOTH English and Native Script** (`owner_name_en` and `owner_name_local`).
* **Legal Context:** In Indian land revenue courts, the spelling in the **native official script** (Devanagari, Tamil, Telugu, Gurmukhi, Bengali, Kannada, etc.) is the legal ground truth.
* English spelling is provided for multilingual UI indexing, search, and inter-state cross-referencing.

---

# SECTION E: RoR / LAND RECORD FIELDS

### 19. What exact fields are available in the RoR?
* **Khata Number:** `khata_khewat_no` (`VARCHAR(50)`)
* **Khatauni Number:** `khatauni_no` (`VARCHAR(50)`)
* **Khasra Number:** `khasra_no` (`VARCHAR(50)`)
* **Owner(s):** Linked via `parcel_owners` (`owner_name_en`, `owner_name_local`, share details)
* **Area:** `total_khata_area_sqm`, `recorded_area`, `recorded_area_unit`
* **Land Use:** `land_use_raw` (Native category) and `land_use_normalized`
* **Tenure:** `tenure_type` (`Bhumiswami`, `Raiyati`, `Occupancy Tenant`, `Government Lessee`)
* **Mutation Status:** `mutation_status` (`MUTATED`, `PENDING`, `UNMUTATED_TRANSACTION`, `REJECTED`, `DISPUTED`)
* **Encumbrance Status:** `encumbrance.is_encumbered`, `certificate_no`, `encumbrance_type`
* **Registration / Deed:** `deed_number`, `sro_office`, `execution_date`, `consideration_amount_inr`
* **Tax / Revenue:** `land_revenue_tax_inr`, `tax_demand_status` (`PAID`, `DUE`, `EXEMPTED`)
* **Other Information:** `fasli_or_rev_year`, `recorded_date`, `remarks`

---

### 20. Which fields are state-specific?
State land terminologies vary fundamentally across India and **must not** be homogenized into single rigid labels:

| Administrative Region | Representative States | Primary RoR Term | Holding / Account Term | Parcel / Survey Term | Mutation Term | Regional Area Units |
|---|---|---|---|---|---|---|
| **Northern States** | UP, MP, Bihar, Punjab, Haryana, Rajasthan, HP, UK, Delhi, Chandigarh | `Jamabandi` / `Khatauni` / `Nakal` | `Khewat` / `Khatauni` / `Khata` | `Khasra` / `Gata` / `Killa` / `Murabba` | `Intiqal` / `Dakhil-Kharij` | Kanal-Marla, Bigha-Biswa, Gaj |
| **Southern States** | Tamil Nadu, Karnataka, Andhra Pradesh, Telangana, Kerala | `Patta & Chitta` / `RTC (Pahani)` / `Adangal` / `Thandaper` | `Patta No` / `Khata` / `Thandaper` | `Survey No` / `Sub-Division` / `Hissa` | `Patta Transfer` / `Fauti` | Ground, Cent, Guntha, Acre, Are, Hectare |
| **Western States** | Maharashtra, Gujarat, Goa | `7/12 (Saat-Baara)` / `Form I & XIV` | `8-A Khata` | `Gut No` / `Survey / Block No` | `Ferfar (Form VI)` | Guntha, Vigha, Hectare, Acre |
| **Eastern States** | West Bengal, Odisha, Assam, Tripura, Jharkhand | `Khatian & Porcha` / `Register-II` / `Dharitree` | `Khata No` / `Khatian` | `Dag No` / `Daag` / `Plot` | `Namjari` / `Mutation` | Bigha-Katha-Chhatak, Decimal, Lessa |

---

# SECTION F: ADMINISTRATIVE HIERARCHY

### 21. How is the administrative hierarchy represented?
```
State (LGD Code, ISO-3166-2:IN Code)
  └── District (LGD Code)
        └── Sub-District / Tehsil / Taluka / Mandal / Circle (LGD Code)
              └── Revenue Village / Mouza / Ward / Sector (LGD Code)
                    └── Land Parcel (ULPIN / Khasra-Plot)
```

---

### 22. What are the IDs/codes for each level?
* **State:** `state_lgd_code` (`INTEGER` e.g., 04 for Chandigarh, 33 for Tamil Nadu, 09 for Uttar Pradesh) + `state_code` (`VARCHAR(2)` e.g., `"CH"`, `"TN"`, `"UP"`).
* **District:** `district_lgd_code` (`INTEGER` e.g., 565 for Chennai, 024 for Chandigarh).
* **Sub-District / Tehsil:** `subdistrict_lgd_code` (`INTEGER` e.g., 5350 for Guindy, 201 for Chandigarh Central).
* **Village / Mouza:** `village_lgd_code` (`INTEGER`, official 6-digit MoPR LGD code e.g., 628101 for Alandur).
* **Parcel:** `ulpin` (`VARCHAR(20)` Bhu-Aadhaar alphanumeric code).

---

### 23. Are these IDs stable and unique?
* **YES.** Ministry of Panchayati Raj **LGD (Local Government Directory) codes** are national standard, persistent, immutable integer identifiers.
* Even if a district splits or a village changes its official name, the LGD code persists uniquely.

---

### 24. Can the same village name occur under different districts/tehsils?
* **YES.** Extremely frequent across all states (e.g. "Rampur", "Kalyanpur", "Shivpur", "Sector 17").
* **Mandate for Frontend:** The frontend **MUST** pass `village_lgd_code` and `subdistrict_lgd_code` as API parameters and state selector values, **NEVER plain text names**.

---

# SECTION G: MUTATION / ENCUMBRANCE / STATUS

### 25. Where is mutation information stored?
* **Entity / Table:** `mutations`
* **Relationship:** Many-to-One with `parcels` and `ror_records`.
* **Fields:** `mutation_id`, `parcel_id`, `ulpin`, `ror_id`, `application_no`, `mutation_type`, `application_date`, `statutory_sla_days`, `sla_due_date`, `status`, `days_elapsed`, `days_overdue`, `applicant_name`, `transferor_name`, `order_no`, `order_date`, `remarks`.

---

### 26. What mutation statuses exist?
Canonical lifecycle statuses:
* `SUBMITTED`: Newly applied online by citizen or auto-triggered post SRO deed registration.
* `UNDER_VERIFICATION`: Field inquiry, Patwari report, or VAO verification underway.
* `NOTICE_PERIOD`: Statutory public notice period (15 to 30 days) for raising objections.
* `HEARING_SCHEDULED`: Objection received; case posted for hearing before Tehsildar / SDM.
* `APPROVED` (or `MUTATED`): Mutation approved, order generated, RoR updated.
* `REJECTED`: Application rejected with formal speaking order citing legal grounds.
* `SLA_BREACHED`: Application pending past the statutory Citizen's Charter timeline (30/45/90 days).

---

### 27. Where is encumbrance information stored?
* **Entity / Table:** `encumbrances` table.
* **Relationship:** Foreign key `parcel_id` / `ulpin` referencing `parcels`.
* **Summary Projection:** Denormalized in `departments.encumbrance` on the parcel DTO for rapid dashboard and property search display.

---

### 28. What encumbrance statuses/types exist?
* **Encumbrance Types:**
  * `BANK_MORTGAGE`: Commercial / agricultural loan mortgage (Equitable or Registered).
  * `GOVERNMENT_REVENUE_LIEN`: Statutory charge for unpaid tax, cess, or revenue recovery.
  * `COURT_ATTACHMENT`: Civil court interim injunction or attachment before judgment.
  * `TRIBAL_NON_ALIENATION`: Statutory bar on transfer (e.g., CNT/SPT Act, Chota Nagpur).
  * `LEASE_CHARGE`: Long-term 99-year registered leasehold charge.
  * `NIL`: Clean title with zero active charges (Non-Encumbrance Certificate issued).
* **Encumbrance Statuses:** `ACTIVE`, `DISCHARGED`, `DISPUTED`, `NIL`.

---

# SECTION H: MULTILINGUAL DATA

### 29. Which database fields are language-dependent?
* **Geographical Entities:** `village_name_en` / `village_name_local`, `district_name_en` / `district_name_local`.
* **Person Names:** `owner_name_en` / `owner_name_local`, `relative_name_en` / `relative_name_local`.
* **Classification Labels:** `land_use_raw` (State term e.g. "நஞ்சை நிலம்" / "Nanjai").

---

### 30. Are translations stored in the database or will frontend/backend handle UI translations?
* **Domain Record Data:** Stored directly in the database in both languages (`_en` and `_local`).
* **Static UI Labels & Badges:** Handled entirely by the frontend using `i18next` localized string files (`en.json`, `hi.json`, `ta.json`, etc.).
* **Legal Terms & Explanations:** Served dynamically via the backend terminology dictionary (`GET /api/v1/meta/glossary`).

---

### 31. Are official names available in native scripts?
* **YES.** Stored under `owner_name_local`, `village_name_local`, and `relative_name_local` with Unicode UTF-8 encoding.

---

### 32. Should the frontend preserve the original official spelling exactly as stored?
* **YES, MANDATORY.**
* Land ownership titles and court orders depend on verbatim orthography.
* The frontend must never apply client-side text transformations (such as `toLowerCase()`, sentence case normalization, or auto-complete substitutions) to `owner_name_en` or `owner_name_local`.

---

# SECTION I: SAMPLE LINKED DATA (5 REALISTIC USE CASES)

Below are 5 fully linked parcels with corresponding RoRs, owners, mutations, and encumbrances. All coordinates are kept null/empty as requested.

```json
[
  {
    "use_case": "Clean Urban Commercial Title with Single Owner",
    "ulpin": "IN-CH-101-00102",
    "parcel_id": "pcl-ch-20101-002",
    "state": "Chandigarh (UT)",
    "state_code": "CH",
    "administrative_division": {
      "state_lgd_code": 4,
      "district_lgd_code": 24,
      "subdistrict_lgd_code": 201,
      "village_lgd_code": 20101,
      "village_name": "Sector 17 Commercial Core"
    },
    "khasra_plot_no": "Plot 402/Sector 17-C",
    "recorded_area": 4.25,
    "recorded_area_unit": "Kanal-Marla",
    "normalized_area_sqm": 2149.89,
    "gis_area_sqm": 2149.89,
    "land_use_category": "COMMERCIAL",
    "land_use_raw": "Commercial Plot",
    "status": "ACTIVE",
    "centroid": null,
    "polygon_coordinates": [],
    "boundary_geojson": null,
    "departments": {
      "revenue": {
        "record_id": "ROR-CH-2025-1002",
        "record_type": "Record of Rights (Jamabandi)",
        "khata_khewat_no": "KHT-52",
        "khatauni_no": "KHN-152",
        "owner_name": "Sanjay Singla & Sons Enterprise",
        "owner_name_local": "संजय सिंगला",
        "co_owners": [],
        "tenure_type": "Estate Office Commercial Leasehold",
        "mutation_status": "MUTATED",
        "tax_demand_status": "PAID"
      },
      "registration": {
        "deed_number": "DEED-CH-2024-402",
        "deed_type": "Sale Deed / Conveyance",
        "sro_office": "Sub-Registrar Office, Sector 17",
        "execution_date": "2024-05-10",
        "registered_owner": "Sanjay Singla & Sons Enterprise",
        "consideration_amount_inr": 35000000.0
      },
      "encumbrance": {
        "is_encumbered": false,
        "status": "NIL",
        "certificate_number": "EC-NIL-CH-2026-102"
      }
    }
  },
  {
    "use_case": "Agricultural Parcel with Multiple Co-Owners (Coparcenary)",
    "ulpin": "IN-TN-101-00123",
    "parcel_id": "pcl-tn-628101-023",
    "state": "Tamil Nadu",
    "state_code": "TN",
    "administrative_division": {
      "state_lgd_code": 33,
      "district_lgd_code": 565,
      "subdistrict_lgd_code": 5350,
      "village_lgd_code": 628101,
      "village_name": "Alandur Block"
    },
    "khasra_plot_no": "T.S. No. 102/3, Block 12",
    "recorded_area": 3.5,
    "recorded_area_unit": "Ground-Cent",
    "normalized_area_sqm": 780.39,
    "gis_area_sqm": 780.39,
    "land_use_category": "COMMERCIAL",
    "land_use_raw": "Varthaga Manai",
    "status": "ACTIVE",
    "centroid": null,
    "polygon_coordinates": [],
    "boundary_geojson": null,
    "departments": {
      "revenue": {
        "record_id": "ROR-TN-2025-1023",
        "record_type": "Patta & Chitta Extract (Tamil Nilam)",
        "khata_khewat_no": "KHT-73",
        "khatauni_no": "KHN-173",
        "owner_name": "M. Sivasankaran",
        "owner_name_local": "எம். சிவசங்கரன்",
        "co_owners": ["M. Sivasankaran Rajendra / Co-owner"],
        "tenure_type": "Ryotwari Freehold",
        "mutation_status": "MUTATED",
        "tax_demand_status": "PAID"
      },
      "encumbrance": {
        "is_encumbered": false,
        "status": "NIL",
        "certificate_number": "EC-NIL-TN-2026-123"
      }
    }
  },
  {
    "use_case": "Owner Mismatch (Unmutated Sale Deed)",
    "ulpin": "IN-HR-402-00108",
    "parcel_id": "pcl-hr-61402-008",
    "state": "Haryana",
    "state_code": "HR",
    "administrative_division": {
      "state_lgd_code": 6,
      "district_lgd_code": 80,
      "subdistrict_lgd_code": 620,
      "village_lgd_code": 61402,
      "village_name": "Badshahpur"
    },
    "khasra_plot_no": "Murabba 45, Killa 12/2",
    "recorded_area": 4.0,
    "recorded_area_unit": "Kanal-Marla",
    "normalized_area_sqm": 2023.43,
    "gis_area_sqm": 2023.43,
    "land_use_category": "COMMERCIAL",
    "land_use_raw": "Gair Mumkin Plotted Commercial",
    "status": "ACTIVE",
    "centroid": null,
    "polygon_coordinates": [],
    "boundary_geojson": null,
    "departments": {
      "revenue": {
        "record_id": "ROR-HR-2025-1008",
        "record_type": "Jamabandi Nakal",
        "owner_name": "Satish Chand Mittal",
        "owner_name_local": "सतीश चंद मित्तल",
        "mutation_status": "UNMUTATED_TRANSACTION"
      },
      "registration": {
        "deed_number": "DEED-HR-2024-408",
        "registered_owner": "Sunita Sharma / Aditi Verma",
        "seller_name": "Previous Landholder"
      },
      "encumbrance": {
        "is_encumbered": false,
        "status": "NIL",
        "certificate_number": "EC-NIL-HR-2026-108"
      }
    }
  },
  {
    "use_case": "Statutory Mutation SLA Breach (84 Days Overdue)",
    "ulpin": "IN-MH-010-00114",
    "parcel_id": "pcl-mh-542010-014",
    "state": "Maharashtra",
    "state_code": "MH",
    "administrative_division": {
      "state_lgd_code": 27,
      "district_lgd_code": 490,
      "subdistrict_lgd_code": 4610,
      "village_lgd_code": 542010,
      "village_name": "Wagholi"
    },
    "khasra_plot_no": "Gut No. 1204/1",
    "recorded_area": 22.0,
    "recorded_area_unit": "Guntha-Hectare",
    "normalized_area_sqm": 2225.74,
    "gis_area_sqm": 2225.74,
    "land_use_category": "AGRICULTURAL",
    "land_use_raw": "Sheti Jameen (Bagayat)",
    "status": "PENDING_MUTATION",
    "centroid": null,
    "polygon_coordinates": [],
    "boundary_geojson": null,
    "departments": {
      "revenue": {
        "record_id": "ROR-MH-2025-1014",
        "record_type": "7/12 Extract (Saat-Baara)",
        "owner_name": "Dnyaneshwar Vitthalrao Patil",
        "owner_name_local": "ज्ञानेश्वर विठ्ठलराव पाटील",
        "mutation_status": "PENDING",
        "active_mutation_id": "MUT-APP-MH-9801"
      },
      "encumbrance": {
        "is_encumbered": false,
        "status": "NIL",
        "certificate_number": "EC-NIL-MH-2026-114"
      }
    }
  },
  {
    "use_case": "Active Commercial Bank Mortgage Encumbrance (State Bank of India)",
    "ulpin": "IN-GJ-201-00107",
    "parcel_id": "pcl-gj-489201-007",
    "state": "Gujarat",
    "state_code": "GJ",
    "administrative_division": {
      "state_lgd_code": 24,
      "district_lgd_code": 440,
      "subdistrict_lgd_code": 4102,
      "village_lgd_code": 489201,
      "village_name": "Mani Nagar (Sanand)"
    },
    "khasra_plot_no": "Block 319",
    "recorded_area": 3.2,
    "recorded_area_unit": "Vigha-Guntha",
    "normalized_area_sqm": 7609.6,
    "gis_area_sqm": 7609.6,
    "land_use_category": "INDUSTRIAL",
    "land_use_raw": "Bin-Kheti (Industrial)",
    "status": "ACTIVE",
    "centroid": null,
    "polygon_coordinates": [],
    "boundary_geojson": null,
    "departments": {
      "revenue": {
        "record_id": "ROR-GJ-2025-1007",
        "record_type": "7/12 (Satbara) & 8-A",
        "owner_name": "Vanguard Precision Forge LLP",
        "owner_name_local": "વાનગાર્ડ પ્રિસિઝન ફોર્જ એલએલપી",
        "mutation_status": "MUTATED"
      },
      "encumbrance": {
        "is_encumbered": true,
        "status": "ACTIVE",
        "certificate_number": "EC-GJ-2024-107",
        "encumbrance_type": "BANK_MORTGAGE",
        "financial_institution": "State Bank of India, Commercial Branch",
        "mortgage_amount": 4500000.0
      }
    }
  }
]
```

---

# SECTION J: FINAL DATABASE DELIVERABLE & ARTIFACT REPOSITORY

### 1. File Artifact Locations
The DHARAA database and mock artifacts have been provisioned in the workspace:
* **Master Specification Document:** `c:\Users\Lenovo\Desktop\DHARAA\database\DATABASE_DATA_MODEL_SPECIFICATION.md`
* **Active SQLite Database:** `c:\Users\Lenovo\Desktop\DHARAA\database\dharaa.db`
* **PostgreSQL / PostGIS & SQLite DDL Script:** `c:\Users\Lenovo\Desktop\DHARAA\database\schema.sql`
* **All-States Mock Dataset (36 States/UTs, 0 empty coordinates):**
  * `c:\Users\Lenovo\Desktop\DHARAA\database\mock_dataset_all_states_uts.json`
  * `c:\Users\Lenovo\Desktop\DHARAA\psyduck\mock-data-ai\data\normalized\all_states_uts_parcels.json`

### 2. State & Union Territory Coverage Matrix
All **28 States and 8 Union Territories** (36 total) are represented in `dharaa.db` and the JSON dataset:

| S.No | Entity Name | Type | LGD Code | State Code | Regional RoR Name | Native Area Unit |
|---|---|---|---|---|---|---|
| 1 | Andhra Pradesh | State | 28 | AP | Adangal / 1-B Record (Meebhoomi) | Acre-Cent |
| 2 | Arunachal Pradesh | State | 12 | AR | Land Possession Certificate (LPC) | Square Meter |
| 3 | Assam | State | 18 | AS | Jamabandi (Dharitree Chitha) | Bigha-Katha-Lessa |
| 4 | Bihar | State | 10 | BR | Jamabandi Register-II (BiharBhumi) | Bigha-Katha-Dhur |
| 5 | Chhattisgarh | State | 22 | CG | B-1 Khasra Khatauni (Bhuiyan) | Hectare |
| 6 | Goa | State | 30 | GA | Form I & XIV (DSLR Goa) | Square Meter |
| 7 | Gujarat | State | 24 | GJ | 7/12 (Satbara) & 8-A (AnyRoR) | Vigha-Guntha |
| 8 | Haryana | State | 6 | HR | Jamabandi Nakal (Haryana Jamabandi) | Kanal-Marla |
| 9 | Himachal Pradesh | State | 2 | HP | Jamabandi (HimBhoomi) | Bigha-Biswa |
| 10 | Jharkhand | State | 20 | JH | Khatian (Jharbhoomi Register-II) | Bigha-Katha |
| 11 | Karnataka | State | 29 | KA | RTC / Pahani Form 16 (Bhoomi) | Acre-Guntha |
| 12 | Kerala | State | 32 | KL | Thandaper Register (E-Rekha) | Are-Cent |
| 13 | Madhya Pradesh | State | 23 | MP | Khasra Khatauni (MPBhulekh) | Hectare |
| 14 | Maharashtra | State | 27 | MH | 7/12 Extract & 8-A (Mahabhulekh) | Guntha-Hectare |
| 15 | Manipur | State | 14 | MN | Jamabandi (Loucha Pathap) | Pari-Lou |
| 16 | Meghalaya | State | 17 | ML | Autonomous District Council Certificate | Square Meter |
| 17 | Mizoram | State | 15 | MZ | Land Settlement Certificate (LSC) | Square Meter |
| 18 | Nagaland | State | 13 | NL | Village Council Land Holding Record | Hectare |
| 19 | Odisha | State | 21 | OD | Record of Rights - Khatiyan (Bhulekh) | Acre-Decimal |
| 20 | Punjab | State | 3 | PB | Jamabandi (PLRS Punjab) | Kanal-Marla |
| 21 | Rajasthan | State | 8 | RJ | Jamabandi (Apna Khata / E-Dharti) | Bigha-Biswa |
| 22 | Sikkim | State | 11 | SK | Parcha Khatiyan (LR&DMD Sikkim) | Square Meter |
| 23 | Tamil Nadu | State | 33 | TN | Patta & Chitta Extract (Tamil Nilam) | Ground-Cent |
| 24 | Telangana | State | 36 | TG | Pattadar Passbook / RoR-1B (Dharani) | Acre-Gunta |
| 25 | Tripura | State | 16 | TR | E-Khatian (Jatan Portal Tripura) | Ganda-Kani |
| 26 | Uttar Pradesh | State | 9 | UP | Khatauni (UP Bhulekh 13-Column) | Hectare |
| 27 | Uttarakhand | State | 5 | UK | Khatauni (Devbhoomi Uttarakhand) | Bigha-Nali |
| 28 | West Bengal | State | 19 | WB | Khatian & Plot Info (Banglarbhumi) | Bigha-Katha-Chhatak |
| 29 | Andaman & Nicobar | UT | 35 | AN | Andaman Land Revenue Record | Hectare |
| 30 | Chandigarh | UT | 4 | CH | Record of Rights (Jamabandi) | Kanal-Marla |
| 31 | Dadra & Nagar Haveli | UT | 26 | DN | Form I & XIV Land Record | Hectare-Are |
| 32 | Delhi (NCT) | UT | 7 | DL | Khasra Khatauni (Delhi Bhulekh) | Bigha-Biswa |
| 33 | Jammu & Kashmir | UT | 1 | JK | Jamabandi (Aapki Zameen Aapki Nigrani)| Kanal-Marla |
| 34 | Ladakh | UT | 37 | LA | Jamabandi (Ladakh Revenue) | Kanal-Marla |
| 35 | Lakshadweep | UT | 31 | LD | Jenmam & Pandaram Land Register | Square Meter |
| 36 | Puducherry | UT | 34 | PY | Patta Register (Nilamagal) | Are-Cent |

---

### 3. Summary of Seeded Governance Use Cases
* **Clean Single Ownership Titles:** Chandigarh (CH), Andaman & Nicobar (AN), Delhi (DL), Puducherry (PY).
* **Joint Family & Coparcenary Titles:** Tamil Nadu (TN), Punjab (PB), Andhra Pradesh (AP), Karnataka (KA), Uttar Pradesh (UP).
* **Statutory Mutation SLA Breaches (>75 Days Overdue):** Maharashtra (MH), Bihar (BR).
* **Unmutated Registration Transactions (Owner Mismatches):** Haryana (HR), Chandigarh (CH).
* **Active Commercial Bank Mortgages (SBI / BoB):** Gujarat (GJ), Chhattisgarh (CG).
* **Civil Court Injunctions & Stay Orders:** West Bengal (WB).
* **Tribal Non-Alienation Acts (CNT / SPT Act / 5th Schedule):** Jharkhand (JH), Tripura (TR).
* **Zoning Inconsistency & Unauthorized Commercial Conversion:** Uttar Pradesh (UP), Delhi (DL).
* **Cadastral Boundary Survey Area Discrepancies (>5% tolerance):** Rajasthan (RJ).
