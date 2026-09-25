import json
from pathlib import Path

src = Path("public/data/mock_database_parcels_20000.geojson")
out = Path("public/data/parcels")
out.mkdir(parents=True, exist_ok=True)

# Read the file using the encoding PowerShell used when extracting it.
with src.open("r", encoding="utf-16") as f:
    data = json.load(f)

groups = {}

for feature in data.get("features", []):
    p = feature.get("properties", {})
    state_code = str(p.get("stateCode") or p.get("state_code") or "unknown")
    groups.setdefault(state_code, []).append(feature)

for state_code, features in groups.items():
    output = {
        "type": "FeatureCollection",
        "features": features
    }

    with (out / f"{state_code}.geojson").open("w", encoding="utf-8") as f:
        json.dump(output, f, separators=(",", ":"))

print(f"Generated {len(groups)} state files.")
for state_code, features in sorted(groups.items()):
    print(f"{state_code}: {len(features)} parcels")
