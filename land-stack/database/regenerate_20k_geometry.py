"""
Generate realistic-looking synthetic cadastral parcel geometry.

IMPORTANT:
- Existing feature properties are preserved exactly.
- Only feature["geometry"] is replaced.
- Parcels are generated as cells of a shared boundary network.
- Parcels within a land patch do not overlap.
- Each state gets multiple separated land patches.
- Exactly the existing number of parcels is retained.

This is SYNTHETIC cadastral-style geometry, not real government cadastral data.
"""

from pathlib import Path
import json
import math
import random

from shapely.geometry import Polygon


# ============================================================
# PATHS / SETTINGS
# ============================================================

ROOT = Path(__file__).resolve().parents[1]
PARCEL_DIR = ROOT / "public" / "data" / "parcels"

SEED = 20260925


# ============================================================
# PATCH COUNT
# ============================================================

def get_patch_count(n):
    """
    Number of separate pieces of land.

    The goal is:
        state
          -> several separate land pieces
             -> parcels inside each piece
    """

    if n <= 8:
        return 2
    elif n <= 20:
        return 3
    elif n <= 50:
        return 4
    elif n <= 150:
        return 5
    elif n <= 400:
        return 6
    elif n <= 800:
        return 7
    elif n <= 1400:
        return 8
    elif n <= 2200:
        return 9
    else:
        return 10


# ============================================================
# GEOJSON HELPERS
# ============================================================

def load_geojson(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_geojson(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(
            data,
            f,
            ensure_ascii=False,
            separators=(",", ":"),
        )


def get_bounds(features):
    """
    Read the current geometry extent.

    We use the existing geometry only to determine
    the spatial canvas for that state.
    """

    xs = []
    ys = []

    def collect(obj):
        if isinstance(obj, list):
            if (
                len(obj) >= 2
                and isinstance(obj[0], (int, float))
                and isinstance(obj[1], (int, float))
            ):
                xs.append(float(obj[0]))
                ys.append(float(obj[1]))
            else:
                for item in obj:
                    collect(item)

    for feature in features:
        geometry = feature.get("geometry")

        if geometry:
            collect(geometry.get("coordinates", []))

    if not xs or not ys:
        raise RuntimeError(
            "Could not determine geometry bounds."
        )

    return min(xs), min(ys), max(xs), max(ys)


# ============================================================
# ALLOCATE PARCELS TO SEPARATE LAND PIECES
# ============================================================

def allocate_counts(total, pieces, rng):
    """
    Give every land piece at least one parcel.

    The remaining parcels are distributed randomly,
    producing different-sized land pieces.
    """

    pieces = min(pieces, total)

    counts = [1] * pieces

    remaining = total - pieces

    while remaining > 0:

        index = rng.randrange(pieces)

        # Avoid making one patch absurdly dominant.
        if counts[index] < max(
            2,
            math.ceil(total / pieces * 1.8),
        ):
            counts[index] += 1
            remaining -= 1

        else:
            # If the random choice is full, put it elsewhere.
            available = [
                i
                for i in range(pieces)
                if counts[i] < max(
                    2,
                    math.ceil(total / pieces * 1.8),
                )
            ]

            if not available:
                counts[rng.randrange(pieces)] += 1
                remaining -= 1
            else:
                i = rng.choice(available)
                counts[i] += 1
                remaining -= 1

    rng.shuffle(counts)

    return counts


# ============================================================
# CREATE A SINGLE CADASTRAL PATCH
# ============================================================

def make_patch(
    minx,
    miny,
    maxx,
    maxy,
    parcel_count,
    rng,
):
    """
    Generate one separate land piece.

    The patch is constructed from a grid of shared vertices.

    Every parcel is therefore connected to its neighbors
    through common boundaries rather than overlapping them.
    """

    width = maxx - minx
    height = maxy - miny

    if width <= 0 or height <= 0:
        raise RuntimeError("Invalid patch dimensions.")

    # --------------------------------------------------------
    # Determine grid dimensions.
    # --------------------------------------------------------

    cols = max(
        1,
        round(math.sqrt(
            parcel_count * width / max(height, 1e-12)
        )),
    )

    rows = max(
        1,
        math.ceil(parcel_count / cols),
    )

    # Make sure the grid has enough cells.
    while cols * rows < parcel_count:
        if width >= height:
            cols += 1
        else:
            rows += 1

    total_cells = cols * rows

    # --------------------------------------------------------
    # Shared grid vertices.
    #
    # Every cell uses the SAME vertices.
    # Therefore neighboring cells share boundaries.
    # --------------------------------------------------------

    x_values = [
        minx + width * c / cols
        for c in range(cols + 1)
    ]

    y_values = [
        miny + height * r / rows
        for r in range(rows + 1)
    ]

    # Controlled jitter.
    #
    # We jitter internal grid nodes, not each parcel
    # independently.
    #
    # This is the critical part that prevents overlaps.
    vertices = {}

    jitter_x = width / cols * 0.16
    jitter_y = height / rows * 0.16

    for r in range(rows + 1):

        for c in range(cols + 1):

            x = x_values[c]
            y = y_values[r]

            # Boundary vertices remain mostly stable.
            # Interior vertices get stronger variation.

            if 0 < c < cols:
                x += rng.uniform(
                    -jitter_x,
                    jitter_x,
                )

            if 0 < r < rows:
                y += rng.uniform(
                    -jitter_y,
                    jitter_y,
                )

            vertices[(r, c)] = (x, y)

    # --------------------------------------------------------
    # Create all grid cells.
    # --------------------------------------------------------

    cells = []

    for r in range(rows):

        for c in range(cols):

            p1 = vertices[(r, c)]
            p2 = vertices[(r, c + 1)]
            p3 = vertices[(r + 1, c + 1)]
            p4 = vertices[(r + 1, c)]

            polygon = Polygon([
                p1,
                p2,
                p3,
                p4,
                p1,
            ])

            if not polygon.is_valid:
                polygon = polygon.buffer(0)

            if polygon.geom_type != "Polygon":
                continue

            if polygon.area <= 0:
                continue

            cells.append(polygon)

    # --------------------------------------------------------
    # Need exactly parcel_count cells.
    #
    # If the grid created more cells, keep a connected-looking
    # subset rather than all of them.
    # --------------------------------------------------------

    if len(cells) < parcel_count:
        raise RuntimeError(
            f"Could not create enough cells: "
            f"{len(cells)} / {parcel_count}"
        )

    if len(cells) > parcel_count:

        # Prefer cells near the center so the patch doesn't
        # look like a strange collection of disconnected cells.
        center_x = (minx + maxx) / 2
        center_y = (miny + maxy) / 2

        cells.sort(
            key=lambda p: (
                (p.centroid.x - center_x) ** 2
                + (p.centroid.y - center_y) ** 2
            )
        )

        selected = cells[:parcel_count]

        # Re-sort spatially/randomly so parcel ordering doesn't
        # follow the geometry.
        rng.shuffle(selected)

        cells = selected

    # --------------------------------------------------------
    # Return cells.
    # --------------------------------------------------------

    return cells


# ============================================================
# CREATE MULTIPLE SEPARATE PATCHES
# ============================================================

def create_land_patches(bounds, counts, rng):
    """
    Place separate land pieces across the state's canvas.

    They deliberately have gaps between them.
    """

    minx, miny, maxx, maxy = bounds

    width = maxx - minx
    height = maxy - miny

    # Prevent zero-sized canvases.
    if width <= 0 or height <= 0:
        raise RuntimeError("Invalid state extent.")

    patch_number = len(counts)

    patches = []

    # --------------------------------------------------------
    # Place centers using a loose distribution.
    # --------------------------------------------------------

    centers = []

    # Use a coarse placement grid.
    placement_cols = max(
        2,
        math.ceil(math.sqrt(patch_number)),
    )

    placement_rows = max(
        2,
        math.ceil(patch_number / placement_cols),
    )

    positions = []

    for r in range(placement_rows):

        for c in range(placement_cols):

            positions.append((
                c,
                r,
            ))

    rng.shuffle(positions)

    for i in range(patch_number):

        c, r = positions[i]

        cell_w = width / placement_cols
        cell_h = height / placement_rows

        cx = (
            minx
            + (c + 0.5) * cell_w
            + rng.uniform(
                -cell_w * 0.18,
                cell_w * 0.18,
            )
        )

        cy = (
            miny
            + (r + 0.5) * cell_h
            + rng.uniform(
                -cell_h * 0.18,
                cell_h * 0.18,
            )
        )

        centers.append((cx, cy))

    # --------------------------------------------------------
    # Create each patch.
    # --------------------------------------------------------

    for i, count in enumerate(counts):

        cx, cy = centers[i]

        cell_w = width / placement_cols
        cell_h = height / placement_rows

        # Leave clear gaps between patches.
        patch_width = cell_w * rng.uniform(
            0.55,
            0.78,
        )

        patch_height = cell_h * rng.uniform(
            0.55,
            0.78,
        )

        patch_minx = cx - patch_width / 2
        patch_maxx = cx + patch_width / 2

        patch_miny = cy - patch_height / 2
        patch_maxy = cy + patch_height / 2

        # Clamp to state canvas.
        patch_minx = max(minx, patch_minx)
        patch_maxx = min(maxx, patch_maxx)

        patch_miny = max(miny, patch_miny)
        patch_maxy = min(maxy, patch_maxy)

        cells = make_patch(
            patch_minx,
            patch_miny,
            patch_maxx,
            patch_maxy,
            count,
            rng,
        )

        patches.append(cells)

    return patches


# ============================================================
# GEOJSON CONVERSION
# ============================================================

def to_geojson_geometry(polygon):
    coordinates = [
        [
            [float(x), float(y)]
            for x, y in polygon.exterior.coords
        ]
    ]

    # Preserve holes if any.
    for ring in polygon.interiors:

        coordinates.append([
            [float(x), float(y)]
            for x, y in ring.coords
        ])

    return {
        "type": "Polygon",
        "coordinates": coordinates,
    }


# ============================================================
# OVERLAP CHECK
# ============================================================

def check_overlaps(polygons):
    """
    Check that polygons do not overlap in area.

    Shared boundaries are allowed.
    """

    # Use STRtree when available.
    try:
        from shapely.strtree import STRtree

        tree = STRtree(polygons)

        for i, polygon in enumerate(polygons):

            candidates = tree.query(polygon)

            for candidate in candidates:

                # Shapely 2 returns indices.
                if isinstance(candidate, int):

                    j = candidate

                    if j <= i:
                        continue

                    other = polygons[j]

                else:

                    # Compatibility fallback.
                    try:
                        j = polygons.index(candidate)
                    except ValueError:
                        continue

                    if j <= i:
                        continue

                    other = candidate

                intersection_area = polygon.intersection(
                    other
                ).area

                tolerance = max(
                    polygon.area,
                    other.area,
                    1.0,
                ) * 1e-9

                if intersection_area > tolerance:
                    return False

        return True

    except Exception:

        # Fallback for older Shapely.
        for i in range(len(polygons)):

            for j in range(i + 1, len(polygons)):

                intersection_area = polygons[i].intersection(
                    polygons[j]
                ).area

                tolerance = max(
                    polygons[i].area,
                    polygons[j].area,
                    1.0,
                ) * 1e-9

                if intersection_area > tolerance:
                    return False

        return True


# ============================================================
# ONE STATE
# ============================================================

def regenerate_state(path):
    data = load_geojson(path)

    features = data.get("features", [])

    if not features:
        raise RuntimeError(
            f"{path.name}: no features found."
        )

    parcel_count = len(features)

    bounds = get_bounds(features)

    # State-specific deterministic random generator.
    state_seed = SEED + sum(
        ord(c)
        for c in path.stem
    )

    rng = random.Random(state_seed)

    # --------------------------------------------------------
    # Separate land pieces.
    # --------------------------------------------------------

    number_of_patches = get_patch_count(
        parcel_count
    )

    allocations = allocate_counts(
        parcel_count,
        number_of_patches,
        rng,
    )

    # --------------------------------------------------------
    # Generate patches.
    # --------------------------------------------------------

    patch_groups = create_land_patches(
        bounds,
        allocations,
        rng,
    )

    # --------------------------------------------------------
    # Flatten.
    # --------------------------------------------------------

    polygons = []

    for group in patch_groups:
        polygons.extend(group)

    # --------------------------------------------------------
    # Exact parcel count.
    # --------------------------------------------------------

    if len(polygons) != parcel_count:
        raise RuntimeError(
            f"{path.stem}: generated "
            f"{len(polygons)} / {parcel_count} parcels."
        )

    # --------------------------------------------------------
    # Geometry validity.
    # --------------------------------------------------------

    for polygon in polygons:

        if not polygon.is_valid:
            raise RuntimeError(
                f"{path.stem}: invalid polygon generated."
            )

        if polygon.area <= 0:
            raise RuntimeError(
                f"{path.stem}: zero-area polygon."
            )

    # --------------------------------------------------------
    # Overlap validation.
    # --------------------------------------------------------

    if not check_overlaps(polygons):
        raise RuntimeError(
            f"{path.stem}: overlapping parcels detected."
        )

    # Randomize geometry-to-feature assignment.
    rng.shuffle(polygons)

    # --------------------------------------------------------
    # CRITICAL:
    #
    # ONLY geometry is replaced.
    #
    # feature["properties"] is untouched.
    # --------------------------------------------------------

    for feature, polygon in zip(
        features,
        polygons,
    ):

        feature["geometry"] = to_geojson_geometry(
            polygon
        )

    save_geojson(
        path,
        data,
    )

    print(
        f"OK {path.stem}: "
        f"{parcel_count:,} parcels | "
        f"{number_of_patches} separate land pieces"
    )

    return parcel_count


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 64)
    print("REGENERATING 20K PARCEL GEOMETRIES")
    print("SEPARATE CADASTRAL LAND PATCHES")
    print("NON-OVERLAPPING SHARED BOUNDARIES")
    print("=" * 64)

    files = sorted(
        PARCEL_DIR.glob("*.geojson")
    )

    if not files:
        raise RuntimeError(
            f"No GeoJSON files found in {PARCEL_DIR}"
        )

    total = 0

    for path in files:

        count = regenerate_state(path)

        total += count

    print("=" * 64)
    print(f"TOTAL PARCELS: {total:,}")
    print("=" * 64)

    if total != 20000:
        raise RuntimeError(
            f"Expected 20,000 parcels, got {total}."
        )

    print("DONE")


if __name__ == "__main__":
    main()