"""
Deterministic ULPIN-style ID generator.
Same parcel geometry -> same 14-character code, every time.
"""
import hashlib
from shapely.geometry.base import BaseGeometry

STATE_PREFIX = {"CH": "01", "TN": "33"}


def generate_ulpin(geom: BaseGeometry, state_code: str = "CH") -> str:
    centroid = geom.centroid
    lat_str = f"{centroid.y:.6f}"
    lng_str = f"{centroid.x:.6f}"
    raw = f"{state_code}{lat_str}{lng_str}"

    digest = hashlib.sha256(raw.encode()).hexdigest()
    numeric_part = "".join(filter(str.isdigit, digest))[:12].ljust(12, "0")

    prefix = STATE_PREFIX.get(state_code, "00")
    return f"{prefix}{numeric_part}"  # 2 + 12 = 14 chars
