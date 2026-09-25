# Connected Parcel Database ↔ Satellite Map — Integration Notes

## What changed
- `database/mock_database_parcels_20000.csv` and `database/dharaa.db` — the
  `ulpin`, `parcel_id`, `centroid_lat`, `centroid_lon` and `boundary_geojson`
  columns were filled in / reformatted **in place**. No other column, row, table
  structure or FK relationship was added, removed or recalculated.
- `database/mock_database_parcels_20000.geojson` (new) — the full 20,000-parcel
  FeatureCollection (all CSV columns as `properties`, the polygon as `geometry`).
  This is the file to hand your friend for the Sentinel-2 overlay work — load it
  directly in QGIS, geopandas (`gpd.read_file(...)`), or any GIS tool that reads
  GeoJSON.
- `public/data/parcels_index.json` + `public/data/parcels/<STATE_CODE>.json`
  (new) — the same data, split by state and trimmed to the fields the map UI
  needs, so the app lazy-loads ~a few hundred KB per state instead of the full
  20k up front.
- `src/gis/parcelGeoData.ts`, `src/gis/SatelliteParcelLayer.tsx` (new),
  `src/gis/ParcelMap.tsx` (edited) — the "High-Res Ortho-Satellite" layer
  checkbox (already in the layer menu, previously inert) now renders a real
  Leaflet map on Esri World Imagery satellite tiles, draws every DB parcel for
  the state in view as a clickable polygon, and shows the full DB record for
  whichever parcel is clicked. All other layers/pages are byte-for-byte
  unchanged (verified: full test suite + a fresh `npm run build` both pass).

## ULPIN format
Reformatted to match the 14-character scheme already used by the real backend
(`backend/app/utils/ulpin.py`): a 2-digit LGD state code + a 12-digit numeric
hash of the parcel's centroid, e.g. `28095606320895` for an Andhra Pradesh
(`state_lgd_code=28`) parcel. `parcel_id` is now a standard UUID4, matching the
`VARCHAR(36) -- UUID surrogate key` comment in `database/schema.sql`.

## ⚠️ Important caveat for the Sentinel-2 integration
The polygons are **synthetic, not surveyed**. Each state's ~550 parcels were
laid out as a small uniform grid (~50 m pitch) around one approximate anchor
point for that state — there was no real cadastral geometry anywhere in the
existing dataset to draw from (the DB's `centroid_lat/lon`/`boundary_geojson`
columns were previously empty). That's enough to demo "click a polygon → see
its DB record" convincingly, but the shapes will **not** line up with real
field boundaries visible in actual Sentinel-2 imagery — they're a stand-in
cluster near a real place, not that place's real parcels.

If your friend needs the polygons to actually register against Sentinel-2
imagery (e.g. for real change-detection demos), the realistic options are:
1. Digitize a small number of real-looking parcels by hand over real imagery
   (in QGIS) for the pilot districts (Chandigarh/Tamil Nadu) and only rely on
   the synthetic grid for the "other 34 states" breadth demo.
2. Treat the current synthetic layer explicitly as illustrative in the demo
   narrative — e.g. label it "representative sample geometry" — rather than
   implying it's real surveyed cadastral data.

## Regenerating
`database/generate_geo_and_ulpin.py` reproduces all of the above (grid layout
+ ULPIN/parcel_id reformat, applied in place to the CSV and `dharaa.db`, plus
the GeoJSON/frontend exports). It's deterministic — same output every run.
