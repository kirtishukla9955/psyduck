"""
Cadastral Data Ingestion & Geometry Synthesis Pipeline
DHARAA - Digital Hub for Aggregated Records And Administration

1. Ingests all 32 verified cross-departmental cadastral survey records from all_parcels.json
   (16 in Chandigarh UT + 16 in Tamil Nadu).
2. Synthesizes a contiguous, high-density cadastral survey grid (160 contiguous parcels)
   in Central Chandigarh (Sector 17 Commercial Core & Sector 22 Residential Zone).
3. Connects all department records (Revenue, Registration, Survey, Urban Development)
   and ROR / Encumbrance data.
"""
import sys
import os
import json
import random
import hashlib
from datetime import datetime, timezone, timedelta

sys.path.insert(0, "F:/DHARAA/backend")
from app.database import SessionLocal, engine
from app.models import Parcel, DepartmentRecord, Mutation
from geoalchemy2.elements import WKTElement
from shapely.geometry import Polygon

db = SessionLocal()

print("=" * 60)
print("STARTING CADASTRAL INGESTION & GEOMETRY SYNTHESIS")
print("=" * 60)

# Helper: format coordinates list to WKT POLYGON
def coords_to_wkt(coords):
    # Ensure closed ring
    if coords[0] != coords[-1]:
        coords = list(coords) + [coords[0]]
    pts = ", ".join(f"{c[0]:.7f} {c[1]:.7f}" for c in coords)
    return f"POLYGON (({pts}))"

# Helper: generate deterministic ULPIN from lat/lon
def make_ulpin(state_prefix, lat, lon):
    raw = f"{state_prefix}{lat:.6f}{lon:.6f}"
    digest = hashlib.sha256(raw.encode()).hexdigest()
    digits = "".join(filter(str.isdigit, digest))[:12].ljust(12, "0")
    return f"{state_prefix}{digits}"

# -------------------------------------------------------------
# STEP 1: Ingest 32 Normalized Parcels from all_parcels.json
# -------------------------------------------------------------
norm_path = "F:/psyduck-repo/data/normalized/all_parcels.json"
ingested_count = 0

if os.path.exists(norm_path):
    with open(norm_path, "r", encoding="utf-8") as f:
        norm_parcels = json.load(f)

    for p in norm_parcels:
        ulpin = p.get("ulpin")
        existing = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
        if existing:
            continue

        state_code = p.get("state_code", "CH")
        coords = p.get("polygon_coordinates")
        centroid = p.get("centroid", {})
        cent_lat = centroid.get("lat")
        cent_lon = centroid.get("lon")
        area_sqm = p.get("calculated_gis_area_sqm") or 1000.0
        owner = p.get("master_owner") or "Allottee / Landowner"
        depts = p.get("departments", {})

        rev = depts.get("revenue", {})
        survey = depts.get("survey", {})
        urban = depts.get("urban_development", {})
        reg = depts.get("registration", {})

        wkt = coords_to_wkt(coords)
        land_use = rev.get("land_use_normalized", "RESIDENTIAL").title()
        khasra = rev.get("identifiers", {}).get("khasra_no") or survey.get("parcel_number") or "N/A"
        sector = rev.get("administrative_division", {}).get("sector") or rev.get("administrative_division", {}).get("village") or "Chandigarh"
        dispute = bool(survey.get("boundary_dispute", False))

        ror = {
            "tenure": "Freehold",
            "khasra_no": khasra,
            "jamabandi_year": rev.get("identifiers", {}).get("jamabandi_year", "2023-2024"),
            "khewat_no": rev.get("identifiers", {}).get("khewat_no", "KHW-01"),
            "patwar_circle": rev.get("identifiers", {}).get("patwar_circle", "Patwar Circle Central")
        }

        encumbrance = {
            "mortgaged": False,
            "liens": []
        }

        new_parcel = Parcel(
            ulpin=ulpin,
            geometry=WKTElement(wkt, srid=4326),
            area_sqm=round(float(area_sqm), 2),
            owner_name=owner,
            village_or_city=sector,
            state=state_code,
            ror_data=ror,
            encumbrance_data=encumbrance,
            land_use=land_use,
            property_tax_due=0.0,
            region_key="chandigarh" if state_code == "CH" else "tamil_nadu",
            parcel_id=survey.get("sketch_id") or f"PARCEL-{ulpin}",
            khasra_no=khasra,
            sector=sector,
            survey_agency=survey.get("survey_agency", "Survey of India / Cadastral Wing"),
            survey_date=survey.get("survey_date", "2023-10-15"),
            dispute_flag=dispute,
            boundary_source="Cadastral Survey Map (Survey of India)",
            centroid_lat=cent_lat,
            centroid_lon=cent_lon
        )
        db.add(new_parcel)

        # Department records
        for dname, ddata in [("Revenue", rev), ("Registration", reg), ("Survey & GIS", survey), ("Urban Development", urban)]:
            if ddata:
                db.add(DepartmentRecord(
                    ulpin=ulpin,
                    department_name=dname,
                    owner_name=owner,
                    land_use=land_use,
                    area_sqm=float(area_sqm)
                ))

        ingested_count += 1

    db.commit()
    print(f"[OK] Ingested {ingested_count} normalized surveyed parcels from all_parcels.json")

# -------------------------------------------------------------
# STEP 2: Synthesize Contiguous Cadastral Lots in Sector 17 & 22
# -------------------------------------------------------------
# Sector 17 Commercial Core:
# Anchor: Lat 30.7390, Lon 76.7820. 8 rows x 10 cols = 80 parcels.
# Each cell: width = 0.00032 deg (~31m), height = 0.00028 deg (~31m).
# Area ~950 sqm.
SEC17_NAMES = [
    "Punjab & Haryana High Court Society", "UT Administration / General Pool",
    "Mohan Lal Bansal", "Harish Chander Sharma", "Deepak Gupta & Sons",
    "Chandigarh Commercial Holdings Ltd", "Rajiv Aggarwal", "Sanjay Singla",
    "Meenakshi Mahajan", "Sunil Dutt & Bros", "Life Insurance Corp of India",
    "State Bank of India Corporate", "Anil Malhotra", "Rohit Sachdeva",
    "Kamla Devi Trust", "Gurdev Singh Dhillon", "Vandana Sethi",
    "Ashok Kumar Jain", "Pardeep Grover", "Neelam Theatre Commercial Complex"
]

SEC22_NAMES = [
    "Jaswinder Singh Sodhi", "Balwinder Kaur", "Paramjit Singh Chahal",
    "Rajinder Kumar Sood", "Surinder Mohan", "Kavita Aggarwal",
    "Col. R. S. Sandhu (Retd)", "Manpreet Kaur Bawa", "Ajay Mittal",
    "Nirmal Singh Brar", "Sarla Sharma", "Bhupinder Singh Walia",
    "Tarun Goyal", "Anoop Kumar Verma", "Sangeeta Rani",
    "Daljit Singh Kalsi", "Amrik Singh", "Jagmohan Singh",
    "Asha Rani", "Vikramaditya Chawla"
]

synthesized_count = 0
rng = random.Random(42)  # Deterministic seed for repeatable cadastre

def generate_grid_cluster(sector_name, start_lat, start_lon, rows, cols, cell_w, cell_h, name_pool, start_khasra, default_use):
    global synthesized_count
    for r in range(rows):
        for c in range(cols):
            # Contiguous polygon corners
            w = start_lon + c * cell_w
            e = start_lon + (c + 1) * cell_w
            s = start_lat + r * cell_h
            n = start_lat + (r + 1) * cell_h

            cent_lat = round((s + n) / 2.0, 7)
            cent_lon = round((w + e) / 2.0, 7)

            ulpin = make_ulpin("01", cent_lat, cent_lon)
            existing = db.query(Parcel).filter(Parcel.ulpin == ulpin).first()
            if existing:
                continue

            coords = [[w, s], [e, s], [e, n], [w, n], [w, s]]
            wkt = coords_to_wkt(coords)

            khasra = f"{start_khasra}/{r*cols + c + 1}"
            owner = rng.choice(name_pool)

            # Special categorical attributes for cadastral visual diversity:
            # 10% disputed (RED), 15% mortgaged (AMBER), 20% Government (GREEN), 55% Freehold (BLUE)
            rand_val = rng.random()
            is_dispute = rand_val < 0.10
            is_mortgaged = 0.10 <= rand_val < 0.25
            is_gov = 0.25 <= rand_val < 0.45

            if is_gov:
                owner = "UT Administration / Directorate of Land Records"
                land_use = "Government / Public Utility"
            elif is_dispute:
                land_use = default_use
            elif is_mortgaged:
                land_use = default_use
            else:
                land_use = default_use

            area_sqm = round(cell_w * 111320 * cell_h * 111320, 1)

            ror = {
                "tenure": "Government Leasehold" if is_gov else "Freehold",
                "khasra_no": khasra,
                "jamabandi_year": "2023-2024",
                "khewat_no": f"KHW-{10 + r}",
                "khatoni_no": f"KHT-{20 + c}",
                "patwar_circle": f"Patwar Circle {sector_name}"
            }

            encumbrance = {
                "mortgaged": is_mortgaged,
                "liens": [{"bank": "State Bank of India", "amount_inr": 4500000}] if is_mortgaged else []
            }

            p_obj = Parcel(
                ulpin=ulpin,
                geometry=WKTElement(wkt, srid=4326),
                area_sqm=area_sqm,
                owner_name=owner,
                village_or_city=f"Chandigarh {sector_name}",
                state="CH",
                ror_data=ror,
                encumbrance_data=encumbrance,
                land_use=land_use,
                property_tax_due=0.0 if is_gov else round(rng.uniform(1200, 8500), 2),
                region_key="chandigarh",
                parcel_id=f"CAD-CH-{sector_name.replace(' ', '')}-{r+1:02d}{c+1:02d}",
                khasra_no=khasra,
                sector=sector_name,
                survey_agency="Survey of India / UT Cadastral Wing",
                survey_date="2023-11-20",
                dispute_flag=is_dispute,
                boundary_source="Total Station Cadastral Field Survey",
                centroid_lat=cent_lat,
                centroid_lon=cent_lon
            )
            db.add(p_obj)

            # Department records
            db.add(DepartmentRecord(ulpin=ulpin, department_name="Revenue", owner_name=owner, land_use=land_use, area_sqm=area_sqm))
            reg_owner = ("Disputed Claim: Sub-Registrar Mismatch" if is_dispute else owner)
            db.add(DepartmentRecord(ulpin=ulpin, department_name="Registration", owner_name=reg_owner, land_use=land_use, area_sqm=area_sqm))
            db.add(DepartmentRecord(ulpin=ulpin, department_name="Survey & GIS", owner_name=owner, land_use=land_use, area_sqm=area_sqm))
            db.add(DepartmentRecord(ulpin=ulpin, department_name="Urban Development", owner_name=owner, land_use=land_use, area_sqm=area_sqm))

            synthesized_count += 1

# Generate Sector 17 grid (8 rows x 9 cols = 72 parcels) around Lat 30.7400, Lon 76.7820
generate_grid_cluster(
    sector_name="Sector 17",
    start_lat=30.7380,
    start_lon=76.7815,
    rows=8,
    cols=9,
    cell_w=0.00035,
    cell_h=0.00030,
    name_pool=SEC17_NAMES,
    start_khasra=101,
    default_use="Commercial"
)

# Generate Sector 22 grid (8 rows x 9 cols = 72 parcels) around Lat 30.7310, Lon 76.7710
generate_grid_cluster(
    sector_name="Sector 22",
    start_lat=30.7290,
    start_lon=76.7710,
    rows=8,
    cols=9,
    cell_w=0.00032,
    cell_h=0.00028,
    name_pool=SEC22_NAMES,
    start_khasra=201,
    default_use="Residential"
)

db.commit()
print(f"[OK] Synthesized {synthesized_count} contiguous survey parcels in Chandigarh Sectors 17 & 22")

# Summary check
cur = db.connection().connection.cursor()
cur.execute("SELECT COUNT(*) FROM parcels")
tot = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM parcels WHERE state='CH'")
ch_tot = cur.fetchone()[0]
print(f"Total Parcels in dev_backend.db: {tot}")
print(f"Total Parcels in Chandigarh (CH): {ch_tot}")

db.close()
