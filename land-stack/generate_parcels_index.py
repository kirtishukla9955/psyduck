import json
from pathlib import Path

src = Path("public/data/mock_database_parcels_20000.geojson")
out = Path("public/data/parcels_index.json")

with src.open("r", encoding="utf-16") as f:
    data = json.load(f)

groups = {}

for feature in data.get("features", []):
    p = feature.get("properties", {})

    state_code = str(
        p.get("stateCode")
        or p.get("state_code")
        or "unknown"
    )

    state = str(
        p.get("state")
        or p.get("state_name")
        or "Unknown"
    )

    lat = p.get("centroid_lat")
    lon = p.get("centroid_lon")

    if lat is None or lon is None:
        centroid = p.get("centroid")

        if isinstance(centroid, dict):
            lat = centroid.get("lat")
            lon = centroid.get("lon")

    groups.setdefault(
        state_code,
        {
            "stateCode": state_code,
            "state": state,
            "count": 0,
            "lat_sum": 0.0,
            "lon_sum": 0.0,
            "coordinates": 0,
        },
    )

    item = groups[state_code]
    item["count"] += 1

    try:
        item["lat_sum"] += float(lat)
        item["lon_sum"] += float(lon)
        item["coordinates"] += 1
    except (TypeError, ValueError):
        pass

index = []

for state_code, item in sorted(groups.items()):
    count = item["coordinates"]

    center = {
        "lat": item["lat_sum"] / count if count else 0,
        "lon": item["lon_sum"] / count if count else 0,
    }

    index.append(
        {
            "stateCode": state_code,
            "state": item["state"],
            "count": item["count"],
            "center": center,
        }
    )

with out.open("w", encoding="utf-8") as f:
    json.dump(index, f, indent=2)

print(f"Created {out}")
print(f"States/UTs: {len(index)}")

for item in index:
    print(
        f'{item["stateCode"]}: '
        f'{item["state"]} - '
        f'{item["count"]} parcels'
    )
