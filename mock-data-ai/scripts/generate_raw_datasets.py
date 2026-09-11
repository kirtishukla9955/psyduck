"""
Raw Dataset Generator for Land Stack
Generates realistic, heterogeneous raw datasets for Chandigarh (UT) and Tamil Nadu,
reflecting real administrative units, terminology, and seeded conflicts.
"""

import json
import os
import math

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH_DIR = os.path.join(ROOT_DIR, "datasets", "raw", "chandigarh")
TN_DIR = os.path.join(ROOT_DIR, "datasets", "raw", "tamil_nadu")

os.makedirs(CH_DIR, exist_ok=True)
os.makedirs(TN_DIR, exist_ok=True)


def make_box_poly(center_lon, center_lat, width_m, height_m):
    lat_rad = math.radians(center_lat)
    m_per_deg_lat = 111132.0
    m_per_deg_lon = 111412.0 * math.cos(lat_rad)

    d_lon = (width_m / 2.0) / m_per_deg_lon
    d_lat = (height_m / 2.0) / m_per_deg_lat

    min_lon = round(center_lon - d_lon, 6)
    max_lon = round(center_lon + d_lon, 6)
    min_lat = round(center_lat - d_lat, 6)
    max_lat = round(center_lat + d_lat, 6)

    return [[
        [min_lon, min_lat],
        [max_lon, min_lat],
        [max_lon, max_lat],
        [min_lon, max_lat],
        [min_lon, min_lat]
    ]]


# ==========================================
# 1. CHANDIGARH DATA GENERATION (16 Parcels)
# ==========================================
ch_parcels = [
    # 10 Clean Parcels
    {"ulpin": "IN-CH-017-00101", "sector": "Sector 17", "lat": 30.7410, "lon": 76.7850, "kanal": 2.0, "marla": 0.0, "w": 31.8, "h": 31.8, "owner": "Sanjay Singla", "buyer": "Sanjay Singla", "land": "Commercial Plot", "zoning": "Commercial Core", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "15/02/2024", "app_date": "10/01/2024", "deed": "VAS-2024-1102", "deed_date": "05/01/2024", "val": 25000000},
    {"ulpin": "IN-CH-017-00102", "sector": "Sector 17", "lat": 30.7425, "lon": 76.7865, "kanal": 1.5, "marla": 0.0, "w": 27.5, "h": 27.6, "owner": "Pooja Agarwal", "buyer": "Pooja Agarwal", "land": "Commercial Plot", "zoning": "Commercial Core", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "20/04/2024", "app_date": "01/03/2024", "deed": "VAS-2024-1420", "deed_date": "25/02/2024", "val": 18000000},
    {"ulpin": "IN-CH-022-00103", "sector": "Sector 22", "lat": 30.7320, "lon": 76.7720, "kanal": 1.0, "marla": 0.0, "w": 22.5, "h": 22.5, "owner": "Gurpreet Singh Ahluwalia", "buyer": "Gurpreet Singh Ahluwalia", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "12/03/2023", "app_date": "15/02/2023", "deed": "VAS-2023-0941", "deed_date": "02/02/2023", "val": 9500000},
    {"ulpin": "IN-CH-022-00104", "sector": "Sector 22", "lat": 30.7335, "lon": 76.7735, "kanal": 0.0, "marla": 10.0, "w": 15.9, "h": 15.9, "owner": "Manjit Kaur", "buyer": "Manjit Kaur", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "05/11/2023", "app_date": "10/10/2023", "deed": "VAS-2023-4122", "deed_date": "01/10/2023", "val": 6200000},
    {"ulpin": "IN-CH-022-00105", "sector": "Sector 22", "lat": 30.7350, "lon": 76.7750, "kanal": 0.0, "marla": 14.0, "w": 18.8, "h": 18.8, "owner": "Rohit Varma", "buyer": "Rohit Varma", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "19/01/2024", "app_date": "22/12/2023", "deed": "VAS-2023-5819", "deed_date": "15/12/2023", "val": 7800000},
    {"ulpin": "IN-CH-034-00106", "sector": "Sector 34", "lat": 30.7210, "lon": 76.7640, "kanal": 3.0, "marla": 0.0, "w": 39.0, "h": 38.9, "owner": "Apex Tech Infoways Pvt Ltd", "buyer": "Apex Tech Infoways Pvt Ltd", "land": "Commercial Plot", "zoning": "Commercial", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "14/06/2024", "app_date": "02/05/2024", "deed": "VAS-2024-2810", "deed_date": "20/04/2024", "val": 34000000},
    {"ulpin": "IN-CH-034-00107", "sector": "Sector 34", "lat": 30.7225, "lon": 76.7655, "kanal": 2.0, "marla": 0.0, "w": 31.8, "h": 31.8, "owner": "DAV Educational Society", "buyer": "DAV Educational Society", "land": "Institutional", "zoning": "Institutional", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "10/08/2022", "app_date": "15/07/2022", "deed": "VAS-2022-1088", "deed_date": "01/07/2022", "val": 15000000},
    {"ulpin": "IN-CH-043-00108", "sector": "Sector 43", "lat": 30.7150, "lon": 76.7480, "kanal": 1.0, "marla": 0.0, "w": 22.5, "h": 22.5, "owner": "Anand Mohan Sharma", "buyer": "Anand Mohan Sharma", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "28/02/2024", "app_date": "14/01/2024", "deed": "VAS-2024-0419", "deed_date": "08/01/2024", "val": 8900000},
    {"ulpin": "IN-CH-043-00109", "sector": "Sector 43", "lat": 30.7165, "lon": 76.7495, "kanal": 1.0, "marla": 0.0, "w": 22.5, "h": 22.5, "owner": "Lt Col Devinder Singh", "buyer": "Lt Col Devinder Singh", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "04/09/2023", "app_date": "01/08/2023", "deed": "VAS-2023-3801", "deed_date": "25/07/2023", "val": 9200000},
    {"ulpin": "IN-CH-MMJ-00110", "sector": "Manimajra", "lat": 30.7250, "lon": 76.8450, "kanal": 0.5, "marla": 0.0, "w": 15.9, "h": 15.9, "owner": "Ramesh Chand Garg", "buyer": "Ramesh Chand Garg", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "11/12/2023", "app_date": "15/11/2023", "deed": "VAS-2023-6110", "deed_date": "02/11/2023", "val": 4500000},

    # 6 Conflict Parcels
    # Conflict 1: Owner Mismatch
    {"ulpin": "IN-CH-022-00111", "sector": "Sector 22", "lat": 30.7360, "lon": 76.7760, "kanal": 1.0, "marla": 0.0, "w": 22.5, "h": 22.5, "owner": "Harpreet Singh Sandhu", "buyer": "Sunita Sharma", "seller": "Harpreet Singh Sandhu", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Bila-Intiqal", "m_date": "", "app_date": "", "deed": "VAS-2024-2201", "deed_date": "10/05/2024", "val": 11000000},
    # Conflict 2: Mutation SLA Breach (>80 days overdue)
    {"ulpin": "IN-CH-043-00112", "sector": "Sector 43", "lat": 30.7180, "lon": 76.7510, "kanal": 1.0, "marla": 0.0, "w": 22.5, "h": 22.5, "owner": "Ashok Kumar Jain", "buyer": "Pradeep Kumar Gupta", "seller": "Ashok Kumar Jain", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Zer-Tajweez", "m_date": "", "app_date": "15/06/2026", "deed": "VAS-2026-1940", "deed_date": "10/06/2026", "val": 9800000},
    # Conflict 3: Zoning Inconsistency (Green Belt violation notice)
    {"ulpin": "IN-CH-017-00113", "sector": "Sector 17", "lat": 30.7440, "lon": 76.7880, "kanal": 2.0, "marla": 0.0, "w": 31.8, "h": 31.8, "owner": "Capital Horizon Developers", "buyer": "Capital Horizon Developers", "land": "Commercial Plot", "zoning": "Green Belt / Leisure Valley", "bld": "Violation Notice Issued - Section 12", "m_status": "Manzoor", "m_date": "10/01/2024", "app_date": "15/12/2023", "deed": "VAS-2023-7741", "deed_date": "01/12/2023", "val": 45000000, "violation": True},
    # Conflict 4: Area Discrepancy (Demarcated 1650 sqm vs Declared 2023.4 sqm -> 18.5% deviation)
    {"ulpin": "IN-CH-034-00114", "sector": "Sector 34", "lat": 30.7240, "lon": 76.7670, "kanal": 4.0, "marla": 0.0, "w": 40.6, "h": 40.6, "owner": "Balkar Singh Bajwa", "buyer": "Balkar Singh Bajwa", "land": "Commercial Plot", "zoning": "Commercial", "bld": "Sanctioned", "m_status": "Manzoor", "m_date": "18/07/2023", "app_date": "20/06/2023", "deed": "VAS-2023-3112", "deed_date": "10/06/2023", "val": 38000000, "survey_override_sqm": 1650.0},
    # Conflict 5: Satellite Land Use Drift (Agricultural periphery with illegal warehouse)
    {"ulpin": "IN-CH-MMJ-00115", "sector": "Manimajra", "lat": 30.7270, "lon": 76.8480, "kanal": 5.0, "marla": 0.0, "w": 50.3, "h": 50.3, "owner": "Jaswinder Kaur", "buyer": "Jaswinder Kaur", "land": "Agricultural (Periphery)", "zoning": "Agricultural", "bld": "Not Applicable", "m_status": "Manzoor", "m_date": "12/04/2022", "app_date": "10/03/2022", "deed": "VAS-2022-2190", "deed_date": "01/03/2022", "val": 12000000, "sat_drift": True},
    # Conflict 6: Compound Conflict (Owner Mismatch + SLA Breach)
    {"ulpin": "IN-CH-043-00116", "sector": "Sector 43", "lat": 30.7195, "lon": 76.7525, "kanal": 1.0, "marla": 0.0, "w": 22.5, "h": 22.5, "owner": "Kuldeep Singh Sandhu", "buyer": "Rajesh Gupta", "seller": "Kuldeep Singh Sandhu", "land": "Residential", "zoning": "Residential", "bld": "Sanctioned", "m_status": "Zer-Tajweez", "m_date": "", "app_date": "25/05/2026", "deed": "VAS-2026-1180", "deed_date": "20/05/2026", "val": 10500000}
]

ch_rev, ch_reg, ch_surv_f, ch_urb, ch_sat = [], [], [], [], []
for idx, p in enumerate(ch_parcels):
    u = p["ulpin"]
    poly = make_box_poly(p["lon"], p["lat"], p["w"], p["h"])
    khasra = f"{idx+101}/{p['sector'].replace(' ', '')}"
    ch_rev.append({
        "ulpin": u,
        "jamabandi_record_id": f"JAM-CH-2024-{idx+101}",
        "khewat_no": f"KHW-{10 + idx}",
        "khatoni_no": f"KHT-{20 + idx}",
        "khasra_no": khasra,
        "sector": p["sector"],
        "sub_division": "Chandigarh Central",
        "jamabandi_year": "2023-2024",
        "owner_name": p["owner"],
        "father_name": "Late Sardar Singh" if "Singh" in p["owner"] else "Late Sh. R. K. Sharma",
        "co_owners": [],
        "land_use_type": p["land"],
        "area_details": {"kanal": p["kanal"], "marla": p["marla"], "sq_yards": 0.0},
        "intiqal_status": p["m_status"],
        "intiqal_no": f"INT-{8800 + idx}" if p["m_status"] == "Manzoor" else None,
        "intiqal_date": p["m_date"],
        "application_date": p["app_date"],
        "revenue_circle": "Patwar Circle Sector 17/22/34"
    })
    ch_reg.append({
        "ulpin": u,
        "vasika_number": p["deed"],
        "bahi_no": "1",
        "jild_no": f"{400 + idx}",
        "sro_office": "Sub-Registrar Office, Sector 17, Chandigarh UT",
        "deed_type": "Sale Deed / Conveyance",
        "seller_name": p.get("seller", "Chandigarh Housing Board / Allottee"),
        "buyer_name": p["buyer"],
        "execution_date": p["deed_date"],
        "consideration_amount_inr": p["val"],
        "stamp_duty_inr": round(p["val"] * 0.06, 2),
        "registration_fee_inr": round(p["val"] * 0.01, 2)
    })
    surv_sqm = p.get("survey_override_sqm", round((p["kanal"] * 505.857) + (p["marla"] * 25.29), 2))
    ch_surv_f.append({
        "type": "Feature",
        "geometry": {"type": "Polygon", "coordinates": poly},
        "properties": {
            "ulpin": u,
            "parcel_id": f"UT-CAD-CH-{idx+101}",
            "khasra_no": khasra,
            "sector": p["sector"],
            "surveyed_area_sqm": surv_sqm,
            "survey_agency": "Survey of India / UT Cadastral Wing",
            "survey_date": "15/10/2023",
            "dispute_flag": p.get("survey_override_sqm") is not None
        }
    })
    ch_urb.append({
        "ulpin": u,
        "authority": "Department of Urban Planning, Chandigarh Administration",
        "sector": p["sector"],
        "master_plan_2031_zoning": p["zoning"],
        "building_plan_status": p["bld"],
        "sanction_no": f"SAN-UT-2023-{550+idx}" if "Sanction" in p["bld"] else None,
        "violations_reported": p.get("violation", False),
        "remarks": "Standard UT Zoning Compliance" if not p.get("violation") else "Encroachment in Leisure Valley buffer zone"
    })
    if p.get("sat_drift"):
        ch_sat.append({
            "ulpin": u, "epoch_baseline": "2024-01-01", "epoch_recent": "2026-06-01",
            "baseline_ndvi": 0.68, "recent_ndvi": 0.22, "ndvi_delta": -0.46,
            "built_up_index_change": 0.38, "unauthorized_structure_flag": True, "confidence_score": 0.96,
            "notes": "Sentinel-2 alert: Major vegetation clearance & concrete warehouse slab detected on peri-urban agricultural parcel."
        })
    else:
        ch_sat.append({
            "ulpin": u, "epoch_baseline": "2024-01-01", "epoch_recent": "2026-06-01",
            "baseline_ndvi": 0.42, "recent_ndvi": 0.40, "ndvi_delta": -0.02,
            "built_up_index_change": 0.01, "unauthorized_structure_flag": False, "confidence_score": 0.93,
            "notes": "Stable land cover profile consistent with authorized land use."
        })

with open(os.path.join(CH_DIR, "revenue_jamabandi.json"), "w", encoding="utf-8") as f: json.dump(ch_rev, f, indent=2)
with open(os.path.join(CH_DIR, "registration_deeds.json"), "w", encoding="utf-8") as f: json.dump(ch_reg, f, indent=2)
with open(os.path.join(CH_DIR, "survey_cadastral.geojson"), "w", encoding="utf-8") as f: json.dump({"type": "FeatureCollection", "features": ch_surv_f}, f, indent=2)
with open(os.path.join(CH_DIR, "urban_masterplan.json"), "w", encoding="utf-8") as f: json.dump(ch_urb, f, indent=2)
with open(os.path.join(CH_DIR, "satellite_observations.json"), "w", encoding="utf-8") as f: json.dump(ch_sat, f, indent=2)

# ==========================================
# 2. TAMIL NADU DATA GENERATION (16 Parcels)
# ==========================================
tn_parcels = [
    # 10 Clean Parcels
    {"ulpin": "IN-TN-CHN-00201", "loc": "Sholinganallur", "lat": 12.9010, "lon": 80.2270, "grounds": 8.0, "cents": 0.0, "w": 42.2, "h": 42.2, "owner": "Thiru S. Sivakumar", "buyer": "Thiru S. Sivakumar", "land": "Varthaga Manai", "zoning": "Commercial Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2024-01-15", "app_date": "2023-12-05", "doc": "DOC-2023-8911", "doc_date": "2023-11-28", "val": 32000000},
    {"ulpin": "IN-TN-CHN-00202", "loc": "Sholinganallur", "lat": 12.9025, "lon": 80.2285, "grounds": 2.5, "cents": 0.0, "w": 23.6, "h": 23.6, "owner": "Tmt. Lakshmi Narayanan", "buyer": "Tmt. Lakshmi Narayanan", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2024-03-20", "app_date": "2024-02-14", "doc": "DOC-2024-1240", "doc_date": "2024-02-01", "val": 12500000},
    {"ulpin": "IN-TN-CHN-00203", "loc": "Sholinganallur", "lat": 12.9040, "lon": 80.2300, "grounds": 0.0, "cents": 5.5, "w": 14.9, "h": 14.9, "owner": "K. Venkatesan", "buyer": "K. Venkatesan", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2023-10-18", "app_date": "2023-09-12", "doc": "DOC-2023-6401", "doc_date": "2023-09-01", "val": 6500000},
    {"ulpin": "IN-TN-CHN-00204", "loc": "Guindy", "lat": 13.0070, "lon": 80.2030, "grounds": 15.0, "cents": 0.0, "w": 57.8, "h": 57.8, "owner": "Lucas TVS Auto Components Ltd", "buyer": "Lucas TVS Auto Components Ltd", "land": "SIPCOT Industrial", "zoning": "SIPCOT Industrial", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2023-05-12", "app_date": "2023-04-10", "doc": "DOC-2023-3109", "doc_date": "2023-03-25", "val": 65000000},
    {"ulpin": "IN-TN-CHN-00205", "loc": "Guindy", "lat": 13.0085, "lon": 80.2045, "grounds": 10.0, "cents": 0.0, "w": 47.2, "h": 47.2, "owner": "Prestige Tech Estates LLP", "buyer": "Prestige Tech Estates LLP", "land": "Varthaga Manai", "zoning": "Commercial Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2024-02-18", "app_date": "2024-01-10", "doc": "DOC-2024-0992", "doc_date": "2023-12-28", "val": 52000000},
    {"ulpin": "IN-TN-CHN-00206", "loc": "Tambaram", "lat": 12.9230, "lon": 80.1180, "grounds": 3.0, "cents": 0.0, "w": 25.8, "h": 25.8, "owner": "Dr. R. Balasubramanian", "buyer": "Dr. R. Balasubramanian", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2023-11-25", "app_date": "2023-10-20", "doc": "DOC-2023-7814", "doc_date": "2023-10-10", "val": 9800000},
    {"ulpin": "IN-TN-CHN-00207", "loc": "Tambaram", "lat": 12.9245, "lon": 80.1195, "grounds": 0.0, "cents": 4.0, "w": 12.7, "h": 12.7, "owner": "Selvi D. Kavitha", "buyer": "Selvi D. Kavitha", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2024-04-10", "app_date": "2024-03-05", "doc": "DOC-2024-2104", "doc_date": "2024-02-20", "val": 4800000},
    {"ulpin": "IN-TN-CHN-00208", "loc": "Velachery", "lat": 12.9780, "lon": 80.2190, "grounds": 6.0, "cents": 0.0, "w": 36.5, "h": 36.5, "owner": "Ceebros Habitat Promoters", "buyer": "Ceebros Habitat Promoters", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2023-08-14", "app_date": "2023-07-02", "doc": "DOC-2023-5201", "doc_date": "2023-06-20", "val": 28000000},
    {"ulpin": "IN-TN-CHN-00209", "loc": "Velachery", "lat": 12.9795, "lon": 80.2205, "grounds": 4.5, "cents": 0.0, "w": 31.6, "h": 31.6, "owner": "Grand Square Retails", "buyer": "Grand Square Retails", "land": "Varthaga Manai", "zoning": "Commercial Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2024-01-28", "app_date": "2023-12-15", "doc": "DOC-2023-9520", "doc_date": "2023-12-01", "val": 36000000},
    {"ulpin": "IN-TN-CHN-00210", "loc": "Karapakkam", "lat": 12.9150, "lon": 80.2310, "grounds": 20.0, "cents": 0.0, "w": 66.7, "h": 66.7, "owner": "KCG College of Technology Trust", "buyer": "KCG College of Technology Trust", "land": "Institutional", "zoning": "Institutional", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2022-09-15", "app_date": "2022-08-10", "doc": "DOC-2022-4819", "doc_date": "2022-07-28", "val": 45000000},

    # 6 Conflict Parcels
    # Conflict 1: Owner Mismatch (Patta rejected / defective parent deed, deed registered to buyer)
    {"ulpin": "IN-TN-CHN-00211", "loc": "Sholinganallur", "lat": 12.9060, "lon": 80.2320, "grounds": 4.0, "cents": 0.0, "w": 29.8, "h": 29.8, "owner": "S. Muthuswamy", "buyer": "K. Annamalai", "seller": "S. Muthuswamy", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "Application Rejected", "p_date": "", "app_date": "", "doc": "DOC-2025-4102", "doc_date": "2025-08-14", "val": 16000000},
    # Conflict 2: SLA Breach (>65 days overdue)
    {"ulpin": "IN-TN-CHN-00212", "loc": "Tambaram", "lat": 12.9260, "lon": 80.1210, "grounds": 2.0, "cents": 0.0, "w": 21.1, "h": 21.1, "owner": "M. Sundaramurthy", "buyer": "C. Ravichandran", "seller": "M. Sundaramurthy", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "Pending with Zonal Deputy Tahsildar", "p_date": "", "app_date": "2026-06-01", "doc": "DOC-2026-2840", "doc_date": "2026-05-25", "val": 8200000},
    # Conflict 3: Zoning Inconsistency (Pallikaranai water body buffer vs residential layout)
    {"ulpin": "IN-TN-CHN-00213", "loc": "Velachery", "lat": 12.9810, "lon": 80.2220, "grounds": 5.0, "cents": 0.0, "w": 33.3, "h": 33.3, "owner": "Delta Mega Infrastructures", "buyer": "Delta Mega Infrastructures", "land": "Natham / Manai", "zoning": "Water Body Buffer Zone", "bld": "Violation - Stop Work Notice Issued", "p_status": "A-Register Updated", "p_date": "2024-02-10", "app_date": "2023-12-18", "doc": "DOC-2023-9912", "doc_date": "2023-12-05", "val": 22000000, "violation": True},
    # Conflict 4: Area Discrepancy (Patta declares 10 Cents = 404.7 sqm, Survey FMB is 310 sqm -> 23.4% discrepancy)
    {"ulpin": "IN-TN-CHN-00214", "loc": "Karapakkam", "lat": 12.9170, "lon": 80.2330, "grounds": 0.0, "cents": 10.0, "w": 17.6, "h": 17.6, "owner": "V. Dhanasekaran", "buyer": "V. Dhanasekaran", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "A-Register Updated", "p_date": "2023-06-18", "app_date": "2023-05-10", "doc": "DOC-2023-4211", "doc_date": "2023-04-20", "val": 7500000, "survey_override_sqm": 310.0},
    # Conflict 5: Satellite Land Use Drift (Nanjai wetland, Sentinel-2 detects unauthorized concrete batching plant)
    {"ulpin": "IN-TN-CHN-00215", "loc": "Sholinganallur", "lat": 12.9080, "lon": 80.2340, "grounds": 12.0, "cents": 0.0, "w": 51.7, "h": 51.7, "owner": "A. Periyasamy Gounder", "buyer": "A. Periyasamy Gounder", "land": "Nanjai Agricultural", "zoning": "Agricultural Zone", "bld": "Not Applied", "p_status": "A-Register Updated", "p_date": "2022-07-20", "app_date": "2022-06-15", "doc": "DOC-2022-3841", "doc_date": "2022-05-30", "val": 18000000, "sat_drift": True},
    # Conflict 6: Compound (Owner Mismatch + SLA Breach)
    {"ulpin": "IN-TN-CHN-00216", "loc": "Tambaram", "lat": 12.9280, "lon": 80.1230, "grounds": 3.0, "cents": 0.0, "w": 25.8, "h": 25.8, "owner": "G. Venkatraman", "buyer": "Meena Ramanathan", "seller": "G. Venkatraman", "land": "Natham / Manai", "zoning": "Primary Residential Zone", "bld": "Approved", "p_status": "Pending with Zonal Deputy Tahsildar", "p_date": "", "app_date": "2026-04-18", "doc": "DOC-2026-1540", "doc_date": "2026-04-12", "val": 11200000}
]

tn_rev, tn_reg, tn_surv_f, tn_urb, tn_sat = [], [], [], [], []
for idx, p in enumerate(tn_parcels):
    u = p["ulpin"]
    poly = make_box_poly(p["lon"], p["lat"], p["w"], p["h"])
    s_no = f"{200 + idx}"
    sub_div = f"{idx % 4 + 1}A"
    tn_rev.append({
        "ulpin": u,
        "patta_passbook_id": f"PATTA-TN-2024-{idx+201}",
        "patta_number": f"{1400 + idx}",
        "survey_number": s_no,
        "sub_division_number": sub_div,
        "district": "Chennai",
        "taluk": "Sholinganallur" if "Sholinganallur" in p["loc"] or "Karapakkam" in p["loc"] else ("Tambaram" if "Tambaram" in p["loc"] else "Guindy"),
        "village": p["loc"],
        "patta_holder_name": p["owner"],
        "joint_patta_holders": [],
        "land_classification": p["land"],
        "extent": {"grounds": p["grounds"], "cents": p["cents"], "hectares": 0.0, "ares": 0.0, "sq_ft": 0.0},
        "patta_transfer_status": p["p_status"],
        "patta_issue_date": p["p_date"],
        "application_date": p["app_date"],
        "revenue_inspector_circle": f"{p['loc']} Revenue Firka"
    })
    sro_name = f"Sub-Registrar Office, {p['loc']}, Registration Zone Chennai"
    tn_reg.append({
        "ulpin": u,
        "tnreginet_doc_no": p["doc"],
        "book_number": "Book 1",
        "sub_registrar_office": sro_name,
        "document_type": "Absolute Sale Deed",
        "executant_name": p.get("seller", "Tamil Nadu Slum Clearance / Original Allottee"),
        "claimant_name": p["buyer"],
        "registration_date": p["doc_date"],
        "consideration_value_inr": p["val"],
        "stamp_duty_paid_inr": round(p["val"] * 0.07, 2),
        "registration_fee_paid_inr": round(p["val"] * 0.02, 2)
    })
    surv_sqm = p.get("survey_override_sqm", round((p["grounds"] * 222.967) + (p["cents"] * 40.468), 2))
    tn_surv_f.append({
        "type": "Feature",
        "geometry": {"type": "Polygon", "coordinates": poly},
        "properties": {
            "ulpin": u,
            "fmb_sketch_no": f"FMB-TN-{idx+201}",
            "survey_number": s_no,
            "sub_division_number": sub_div,
            "village": p["loc"],
            "fmb_extent_sqm": surv_sqm,
            "surveying_department": "Department of Survey and Settlement, Govt of Tamil Nadu",
            "fmb_survey_date": "2023-05-15",
            "boundary_dispute_flag": p.get("survey_override_sqm") is not None
        }
    })
    tn_urb.append({
        "ulpin": u,
        "authority": "Chennai Metropolitan Development Authority (CMDA)",
        "zone_locality": p["loc"],
        "master_plan_land_use": p["zoning"],
        "planning_permit_status": p["bld"],
        "pp_reference_no": f"PP/CMDA/2023/{700+idx}" if "Approved" in p["bld"] else None,
        "violations_detected": p.get("violation", False),
        "remarks": "Standard CMDA Master Plan II Compliance" if not p.get("violation") else "Buffer encroachment in Pallikaranai wetland zone"
    })
    if p.get("sat_drift"):
        tn_sat.append({
            "ulpin": u, "epoch_baseline": "2024-01-01", "epoch_recent": "2026-06-01",
            "baseline_ndvi": 0.72, "recent_ndvi": 0.24, "ndvi_delta": -0.48,
            "built_up_index_change": 0.41, "unauthorized_structure_flag": True, "confidence_score": 0.97,
            "notes": "Sentinel-2 alert: Water/Wetland drainage & heavy concrete metal structure erected on agricultural wetland."
        })
    else:
        tn_sat.append({
            "ulpin": u, "epoch_baseline": "2024-01-01", "epoch_recent": "2026-06-01",
            "baseline_ndvi": 0.48, "recent_ndvi": 0.46, "ndvi_delta": -0.02,
            "built_up_index_change": 0.01, "unauthorized_structure_flag": False, "confidence_score": 0.94,
            "notes": "Stable land cover profile consistent with CMDA permitted land use."
        })

with open(os.path.join(TN_DIR, "revenue_patta_chitta.json"), "w", encoding="utf-8") as f: json.dump(tn_rev, f, indent=2)
with open(os.path.join(TN_DIR, "registration_deeds.json"), "w", encoding="utf-8") as f: json.dump(tn_reg, f, indent=2)
with open(os.path.join(TN_DIR, "survey_fmb.geojson"), "w", encoding="utf-8") as f: json.dump({"type": "FeatureCollection", "features": tn_surv_f}, f, indent=2)
with open(os.path.join(TN_DIR, "urban_planning.json"), "w", encoding="utf-8") as f: json.dump(tn_urb, f, indent=2)
with open(os.path.join(TN_DIR, "satellite_observations.json"), "w", encoding="utf-8") as f: json.dump(tn_sat, f, indent=2)

print("Generated raw datasets for Chandigarh (16 parcels) and Tamil Nadu (16 parcels).")
