"""
LAND STACK (Bhu-DPI) Mock Seed Data Script
Smart India Hackathon 2026 — P2: Backend & Trust Engine

Populates the database with realistic demo scenarios:
1. Normal Case: All departments agree on ownership (VERIFIED).
2. Owner Mismatch Case: Revenue vs Registration discrepancy (HIGH SEVERITY FLAGGED).
3. Mutation Within SLA: Submitted 2 days ago with 7-day statutory limit (WITHIN_SLA).
4. Overdue Mutation: Submitted 18 days ago with 7-day limit (OVERDUE by 11 days).
5. Interoperability & Mortgage Case: Spatial overlap with bank lien (SBI loan).

NOTE: All names, numbers, and coordinates are strictly simulated MOCK DATA for hackathon demonstration.
"""
import sys
from datetime import datetime, timezone, timedelta
from app.database import SessionLocal, Base, engine
from app.models import Parcel, DepartmentRecord, Mutation
from app import crud
from app.services import trust_engine

print("=" * 70)
print(" LAND STACK — SEEDING MOCK PUBLIC INFRASTRUCTURE DATA")
print("=" * 70)

# Create tables
Base.metadata.create_all(bind=engine)
db = SessionLocal()

try:
    # Clean up previous mock data for idempotent seeding
    db.query(Mutation).delete()
    db.query(DepartmentRecord).delete()
    db.query(Parcel).delete()
    db.commit()
    print("[INFO] Cleared previous mock records for clean seed run.")

    now = datetime.now(timezone.utc)

    # -------------------------------------------------------------
    # 1. NORMAL PARCEL (Title Verified, zero discrepancies)
    # -------------------------------------------------------------
    p1 = crud.create_parcel(
        db,
        coordinates=[(76.780, 30.740), (76.782, 30.740), (76.782, 30.742), (76.780, 30.742), (76.780, 30.740)],
        owner_name="Ramesh Kumar",
        state_code="CH",
        village_or_city="Chandigarh Sector 17",
        land_use="Residential",
        ror_data={"tenure": "Freehold", "khasra_no": "412/1", "jamabandi_year": "2021-22"},
        encumbrance_data={"mortgaged": False, "liens": []},
        property_tax_due=0.0
    )
    # Department records all agree
    for dept in ["Revenue", "Registration", "Survey & GIS", "Urban Development"]:
        crud.create_department_record(
            db,
            ulpin=p1.ulpin,
            department_name=dept,
            owner_name="Ramesh Kumar",
            land_use="Residential",
            area_sqm=float(p1.area_sqm or 2500)
        )
    print(f"[OK] Seeded Normal Parcel: ULPIN {p1.ulpin} (Owner: Ramesh Kumar) -> VERIFIED")

    # -------------------------------------------------------------
    # 2. CONFLICT PARCEL: OWNER NAME MISMATCH
    # -------------------------------------------------------------
    p2 = crud.create_parcel(
        db,
        coordinates=[(76.785, 30.740), (76.787, 30.740), (76.787, 30.742), (76.785, 30.742), (76.785, 30.740)],
        owner_name="Priya Singh",
        state_code="CH",
        village_or_city="Chandigarh Sector 22",
        land_use="Commercial",
        ror_data={"tenure": "Freehold", "khasra_no": "108/4"},
        encumbrance_data={"mortgaged": False},
        property_tax_due=4200.0
    )
    # Department records show mismatch: Registration has Vikram Singh!
    crud.create_department_record(db, ulpin=p2.ulpin, department_name="Revenue", owner_name="Priya Singh")
    crud.create_department_record(db, ulpin=p2.ulpin, department_name="Registration", owner_name="Vikram Singh") # MISMATCH!
    crud.create_department_record(db, ulpin=p2.ulpin, department_name="Survey & GIS", owner_name="Priya Singh")
    crud.create_department_record(db, ulpin=p2.ulpin, department_name="Urban Development", owner_name="Priya Singh")
    print(f"[OK] Seeded Conflict Parcel (Owner Mismatch): ULPIN {p2.ulpin} -> FLAGGED HIGH")

    # -------------------------------------------------------------
    # 3. PARCEL WITH MUTATION WITHIN SLA (5 days remaining)
    # -------------------------------------------------------------
    p3 = crud.create_parcel(
        db,
        coordinates=[(76.790, 30.740), (76.792, 30.740), (76.792, 30.742), (76.790, 30.742), (76.790, 30.740)],
        owner_name="Sunita Sharma",
        state_code="CH",
        village_or_city="Chandigarh Sector 35",
        land_use="Residential",
        ror_data={"tenure": "Freehold", "khasra_no": "512/9"},
        encumbrance_data={"mortgaged": False},
        property_tax_due=0.0
    )
    for dept in ["Revenue", "Registration", "Survey & GIS", "Urban Development"]:
        crud.create_department_record(db, ulpin=p3.ulpin, department_name=dept, owner_name="Sunita Sharma")

    m1 = crud.create_mutation(
        db,
        mutation_id="MUT-2026-0001",
        ulpin=p3.ulpin,
        old_owner="Sunita Sharma",
        proposed_new_owner="Amit Sharma",
        department="Revenue",
        sla_days=7,
        status="PENDING",
        remarks="Family partition deed registered with sub-registrar",
        submitted_at=now - timedelta(days=2)
    )
    print(f"[OK] Seeded Mutation Within SLA: {m1.mutation_id} for ULPIN {p3.ulpin} (5 days left)")

    # -------------------------------------------------------------
    # 4. PARCEL WITH OVERDUE MUTATION (11 days overdue)
    # -------------------------------------------------------------
    p4 = crud.create_parcel(
        db,
        coordinates=[(76.795, 30.740), (76.797, 30.740), (76.797, 30.742), (76.795, 30.742), (76.795, 30.740)],
        owner_name="Harpreet Kaur",
        state_code="CH",
        village_or_city="Chandigarh Sector 43",
        land_use="Agricultural",
        ror_data={"tenure": "Freehold", "khasra_no": "901/2"},
        encumbrance_data={"mortgaged": False},
        property_tax_due=1500.0
    )
    for dept in ["Revenue", "Registration", "Survey & GIS", "Urban Development"]:
        crud.create_department_record(db, ulpin=p4.ulpin, department_name=dept, owner_name="Harpreet Kaur")

    m2 = crud.create_mutation(
        db,
        mutation_id="MUT-2026-0002",
        ulpin=p4.ulpin,
        old_owner="Harpreet Kaur",
        proposed_new_owner="Gurpreet Singh",
        department="Revenue",
        sla_days=7,
        status="PENDING",
        remarks="Agricultural land sale transfer — Tehsildar report delayed",
        submitted_at=now - timedelta(days=18)
    )
    print(f"[OK] Seeded Overdue Mutation: {m2.mutation_id} for ULPIN {p4.ulpin} (OVERDUE 11 days)")

    # -------------------------------------------------------------
    # 5. PARCEL WITH MORTGAGE & SPATIAL OVERLAP (Bank Lien Check)
    # -------------------------------------------------------------
    p5 = crud.create_parcel(
        db,
        # Overlaps slightly with p1: (76.781, 30.741)
        coordinates=[(76.781, 30.741), (76.783, 30.741), (76.783, 30.743), (76.781, 30.743), (76.781, 30.741)],
        owner_name="Rajesh Verma",
        state_code="CH",
        village_or_city="Chandigarh Sector 17",
        land_use="Commercial",
        ror_data={"tenure": "Leasehold", "last_transaction": "2022-11-10"},
        encumbrance_data={
            "mortgaged": True,
            "bank": "State Bank of India",
            "loan_id": "SBI-AGR-2024-8841",
            "amount_inr": 7500000
        },
        property_tax_due=9800.0
    )
    for dept in ["Revenue", "Registration", "Survey & GIS", "Urban Development"]:
        crud.create_department_record(db, ulpin=p5.ulpin, department_name=dept, owner_name="Rajesh Verma")
    print(f"[OK] Seeded Mortgaged Parcel: ULPIN {p5.ulpin} (SBI Loan & Overlap)")

    print("-" * 70)
    print("MOCK SEED SUMMARY:")
    print(f"Total Parcels Seeded: 5")
    print(f"Total Mutations Seeded: 2 (1 Within SLA, 1 Overdue)")
    print(f"Total Department Records: {db.query(DepartmentRecord).count()}")
    print("=" * 70)

except Exception as err:
    db.rollback()
    print(f"[ERROR] Seeding failed: {err}", file=sys.stderr)
    raise
finally:
    db.close()
