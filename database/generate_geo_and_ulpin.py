"""
Generate real ULPIN/parcel_id codes + geographic polygons for the 20,000 mock parcels,
and wire them into database/dharaa.db + database/mock_database_parcels_20000.csv,
without touching any other column/table/value.
"""
import csv, sqlite3, uuid, hashlib, json, random, os

SRC = "/home/claude/work/psyduck-main"
CSV_PATH = f"{SRC}/database/mock_database_parcels_20000.csv"
DB_PATH = f"{SRC}/database/dharaa.db"

# Approximate real-world geographic centroid for each state/UT (lat, lon)
STATE_ANCHORS = {
    "JK": (33.7782, 76.5762), "HP": (31.8000, 77.1900), "PB": (30.9000, 75.8500),
    "CH": (30.7333, 76.7794), "UK": (30.0668, 79.0193), "HR": (29.0588, 76.0856),
    "DL": (28.7041, 77.1025), "RJ": (26.9124, 74.2179), "UP": (26.8467, 80.9462),
    "BR": (25.5941, 85.1376), "SK": (27.5330, 88.5122), "AR": (28.2180, 94.7278),
    "NL": (25.6751, 94.1086), "MN": (24.6637, 93.9063), "MZ": (23.1645, 92.9376),
    "TR": (23.9408, 91.9882), "ML": (25.4670, 91.3662), "AS": (26.2006, 92.9376),
    "WB": (22.9868, 87.8550), "JH": (23.6102, 85.2799), "OD": (20.9517, 85.0985),
    "CG": (21.2787, 81.8661), "MP": (23.4733, 77.9470), "GJ": (22.2587, 71.1924),
    "DN": (20.1809, 73.0169), "MH": (19.7515, 75.7139), "AP": (15.9129, 79.7400),
    "KA": (15.3173, 75.7139), "GA": (15.2993, 74.1240), "LD": (10.5667, 72.6417),
    "KL": (10.8505, 76.2711), "TN": (11.1271, 78.6569), "PY": (11.9416, 79.8083),
    "AN": (11.7401, 92.6586), "TG": (18.1124, 79.0193), "LA": (34.1526, 77.5770),
}

def deterministic_rng(seed_str):
    h = int(hashlib.sha256(seed_str.encode()).hexdigest(), 16)
    return random.Random(h)

def generate_ulpin(state_lgd_code, lat, lon):
    """Same algorithm/shape as backend/app/utils/ulpin.py: 2-digit state prefix + 12 digits from a
    sha256 hash of the centroid, giving a stable 14-character numeric ULPIN per parcel."""
    lat_str = f"{lat:.6f}"
    lon_str = f"{lon:.6f}"
    raw = f"{state_lgd_code}{lat_str}{lon_str}"
    digest = hashlib.sha256(raw.encode()).hexdigest()
    numeric_part = "".join(filter(str.isdigit, digest))[:12].ljust(12, "0")
    prefix = f"{int(state_lgd_code):02d}"
    return f"{prefix}{numeric_part}"

def make_polygon(lat, lon, half_w=0.00022, half_h=0.00018):
    """Small rectangular cadastral-style ring (~45m x ~40m) around a centroid, closed GeoJSON ring."""
    ring = [
        [round(lon - half_w, 7), round(lat - half_h, 7)],
        [round(lon + half_w, 7), round(lat - half_h, 7)],
        [round(lon + half_w, 7), round(lat + half_h, 7)],
        [round(lon - half_w, 7), round(lat + half_h, 7)],
        [round(lon - half_w, 7), round(lat - half_h, 7)],
    ]
    return ring

def main():
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames

    print(f"Loaded {len(rows)} rows")

    # group by state_code preserving original order (so adjacent khasra subdivisions stay adjacent)
    by_state = {}
    for r in rows:
        by_state.setdefault(r["state_code"], []).append(r)

    id_map = {}  # old_parcel_id -> new_parcel_id
    ulpin_map = {}  # old_ulpin -> new_ulpin

    for state_code, group in by_state.items():
        anchor_lat, anchor_lon = STATE_ANCHORS[state_code]
        n = len(group)
        cols = max(1, int(n ** 0.5) + 1)
        cell = 0.00045  # ~50m grid pitch
        rng = deterministic_rng(f"village-jitter-{state_code}")
        # small random village-block offset so each state's parcel block isn't dead-centered on the same anchor point
        block_lat = anchor_lat + rng.uniform(-0.35, 0.35)
        block_lon = anchor_lon + rng.uniform(-0.35, 0.35)

        for i, r in enumerate(group):
            row_i, col_i = divmod(i, cols)
            lat = round(block_lat + row_i * cell, 7)
            lon = round(block_lon + col_i * cell, 7)

            state_lgd_code = r["state_lgd_code"]
            new_ulpin = generate_ulpin(state_lgd_code, lat, lon)
            new_parcel_id = str(uuid.uuid4())

            ulpin_map[r["ulpin"]] = new_ulpin
            id_map[r["parcel_id"]] = new_parcel_id

            r["_new_ulpin"] = new_ulpin
            r["_new_parcel_id"] = new_parcel_id
            r["_lat"] = lat
            r["_lon"] = lon
            ring = make_polygon(lat, lon)
            r["_ring"] = ring

    # ---- write updated CSV (same columns, only ulpin/parcel_id/centroid/polygon/boundary filled) ----
    out_rows = []
    for r in rows:
        new_r = dict(r)
        new_r["ulpin"] = r["_new_ulpin"]
        new_r["parcel_id"] = r["_new_parcel_id"]
        new_r["centroid"] = json.dumps({"lat": r["_lat"], "lon": r["_lon"]})
        new_r["polygon_coordinates"] = json.dumps(r["_ring"])
        new_r["boundary_geojson"] = json.dumps({
            "type": "Polygon",
            "coordinates": [r["_ring"]],
        })
        for k in ("_new_ulpin", "_new_parcel_id", "_lat", "_lon", "_ring"):
            new_r.pop(k, None)
        out_rows.append(new_r)

    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(out_rows)
    print("CSV updated in place.")

    # ---- update SQLite: only fill geometry columns + reformat ulpin/parcel_id, everywhere they're referenced ----
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_keys = OFF")

    lookup = {r["parcel_id"]: r for r in out_rows}  # keyed by NEW parcel_id after CSV rewrite... need old->new
    # build old_parcel_id -> row (with new values) map instead
    old_to_row = {}
    for old_pid, new_pid in id_map.items():
        pass

    # Simplest: iterate original `rows` (still has old ids as top-level keys before we mutated new_r separately)
    updates = []
    for r in rows:
        old_pid = None
    # rebuild from out_rows using id_map reverse
    new_to_old_pid = {v: k for k, v in id_map.items()}

    for new_r in out_rows:
        new_pid = new_r["parcel_id"]
        old_pid = new_to_old_pid[new_pid]
        cur.execute(
            """UPDATE parcels
               SET parcel_id = ?, ulpin = ?, centroid_lat = ?, centroid_lon = ?, boundary_geojson = ?
               WHERE parcel_id = ?""",
            (new_pid, new_r["ulpin"], json.loads(new_r["centroid"])["lat"],
             json.loads(new_r["centroid"])["lon"], new_r["boundary_geojson"], old_pid)
        )

    # propagate parcel_id rename to FK tables
    for tbl in ["parcel_ror_mappings", "parcel_owners", "mutations", "encumbrances",
                "registration_deeds", "urban_masterplans"]:
        for old_pid, new_pid in id_map.items():
            cur.execute(f"UPDATE {tbl} SET parcel_id = ? WHERE parcel_id = ?", (new_pid, old_pid))

    # propagate ulpin rename to conflicts table (references ulpin directly)
    for old_ulpin, new_ulpin in ulpin_map.items():
        cur.execute("UPDATE conflicts SET ulpin = ? WHERE ulpin = ?", (new_ulpin, old_ulpin))

    conn.commit()

    # sanity checks
    cur.execute("SELECT COUNT(*) FROM parcels WHERE centroid_lat IS NULL")
    print("parcels missing centroid_lat:", cur.fetchone()[0])
    cur.execute("SELECT COUNT(DISTINCT ulpin) FROM parcels")
    print("distinct ulpins:", cur.fetchone()[0])
    cur.execute("SELECT COUNT(DISTINCT parcel_id) FROM parcels")
    print("distinct parcel_ids:", cur.fetchone()[0])
    cur.execute("SELECT parcel_id, ulpin, centroid_lat, centroid_lon FROM parcels LIMIT 3")
    for row in cur.fetchall(): print(row)
    conn.close()

    # ---- write full GeoJSON (for Sentinel-2 overlay use) ----
    features = []
    for r in out_rows:
        props = {k: v for k, v in r.items() if k not in ("polygon_coordinates", "boundary_geojson", "centroid", "conflicts")}
        features.append({
            "type": "Feature",
            "geometry": json.loads(r["boundary_geojson"]),
            "properties": props,
        })
    geojson = {"type": "FeatureCollection", "features": features}
    with open(f"{SRC}/database/mock_database_parcels_20000.geojson", "w") as f:
        json.dump(geojson, f)
    print("GeoJSON written:", len(features), "features")

    # ---- write trimmed JSON for frontend map (lighter payload) ----
    light = []
    for r in out_rows:
        light.append({
            "ulpin": r["ulpin"],
            "parcelId": r["parcel_id"],
            "state": r["state"],
            "stateCode": r["state_code"],
            "district": r["district_name"],
            "village": r["village_name"],
            "khasraPlotNo": r["khasra_plot_no"],
            "landUseCategory": r["land_use_category"],
            "status": r["status"],
            "ownerName": r["owner_name"],
            "recordedArea": r["recorded_area"],
            "recordedAreaUnit": r["recorded_area_unit"],
            "centroid": json.loads(r["centroid"]),
            "boundary": json.loads(r["boundary_geojson"]),
        })
    os.makedirs(f"{SRC}/public/data", exist_ok=True)
    with open(f"{SRC}/public/data/parcels_geo.json", "w") as f:
        json.dump(light, f)
    print("Frontend JSON written:", len(light), "records")

if __name__ == "__main__":
    main()
