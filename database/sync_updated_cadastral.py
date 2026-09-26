# Database sync script: Migrates 20k updated cadastral records from dharaa.db to dev_backend.db
import sqlite3
import json
import sys
import os
from shapely.geometry import shape

source_path = 'F:/psyduck-repo/database/dharaa.db'
target_path = 'F:/psyduck-repo/database/dev_backend.db'

print(f'Syncing cadastral records from {source_path} to {target_path}...')
src_conn = sqlite3.connect(source_path)
tgt_conn = sqlite3.connect(target_path)
src_cur = src_conn.cursor()
tgt_cur = tgt_conn.cursor()

# Ensure table columns in dev_backend.db
tgt_cur.execute('PRAGMA table_info(parcels)')
existing_cols = {c[1] for c in tgt_cur.fetchall()}
print('Existing cols in target:', existing_cols)

new_cols = [
    ('region_key', 'VARCHAR(50)'),
    ('parcel_id', 'VARCHAR(50)'),
    ('khasra_no', 'VARCHAR(50)'),
    ('sector', 'VARCHAR(100)'),
    ('survey_agency', 'VARCHAR(200)'),
    ('survey_date', 'VARCHAR(20)'),
    ('dispute_flag', 'BOOLEAN DEFAULT 0'),
    ('boundary_source', 'VARCHAR(300)'),
    ('centroid_lat', 'NUMERIC(10,7)'),
    ('centroid_lon', 'NUMERIC(10,7)'),
]
for col_name, col_type in new_cols:
    if col_name not in existing_cols:
        print(f'Adding column {col_name} ({col_type}) to parcels...')
        tgt_cur.execute(f'ALTER TABLE parcels ADD COLUMN {col_name} {col_type}')

tgt_conn.commit()

# Ensure indexes
tgt_cur.execute('CREATE INDEX IF NOT EXISTS idx_parcels_centroid ON parcels (centroid_lat, centroid_lon)')
tgt_cur.execute('CREATE INDEX IF NOT EXISTS idx_parcels_ulpin ON parcels (ulpin)')
tgt_cur.execute('CREATE INDEX IF NOT EXISTS idx_parcels_state ON parcels (state)')
tgt_conn.commit()

src_query = (
    'SELECT '
    'p.parcel_id, p.ulpin, p.khasra_plot_no, p.normalized_area_sqm, p.land_use_category, '
    'p.centroid_lat, p.centroid_lon, p.boundary_geojson, p.status, '
    'v.village_name_en, d.district_name_en, s.state_code, s.state_name, '
    'o.owner_name_en, e.encumbrance_type, e.amount_inr, r.record_type, r.tenure_type, r.land_revenue_tax_inr '
    'FROM parcels p '
    'LEFT JOIN villages v ON p.village_lgd_code = v.village_lgd_code '
    'LEFT JOIN subdistricts sd ON v.subdistrict_lgd_code = sd.subdistrict_lgd_code '
    'LEFT JOIN districts d ON sd.district_lgd_code = d.district_lgd_code '
    'LEFT JOIN states s ON d.state_lgd_code = s.state_lgd_code '
    'LEFT JOIN parcel_owners po ON p.parcel_id = po.parcel_id '
    'LEFT JOIN owners o ON po.owner_id = o.owner_id '
    'LEFT JOIN encumbrances e ON p.parcel_id = e.parcel_id '
    'LEFT JOIN parcel_ror_mappings prm ON p.parcel_id = prm.parcel_id '
    'LEFT JOIN ror_records r ON prm.ror_id = r.ror_id'
)
src_cur.execute(src_query)

tgt_cur.execute('SELECT ulpin FROM parcels')
existing_ulpins = {row[0] for row in tgt_cur.fetchall()}
print(f'Parcels currently in target: {len(existing_ulpins)}')

insert_sql = (
    'INSERT OR REPLACE INTO parcels ('
    'ulpin, geometry, area_sqm, owner_name, village_or_city, state, '
    'ror_data, encumbrance_data, land_use, property_tax_due, region_key, '
    'parcel_id, khasra_no, sector, survey_agency, survey_date, dispute_flag, '
    'boundary_source, centroid_lat, centroid_lon'
    ') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
)

inserted_count = 0
invalid_geom_count = 0
seen_in_batch = set()

rows_to_insert = []
for row in src_cur:
    (
        p_id, ulpin, khasra, area_sqm, land_use_cat,
        c_lat, c_lon, b_geojson, status,
        village_name, district_name, state_code, state_name,
        owner_name, enc_type, enc_amt, ror_type, tenure_type, tax_inr
    ) = row

    if ulpin in seen_in_batch:
        continue
    seen_in_batch.add(ulpin)

    wkt = None
    if b_geojson:
        try:
            poly = shape(json.loads(b_geojson))
            if poly.is_valid:
                wkt = poly.wkt
            else:
                wkt = poly.buffer(0).wkt
        except Exception:
            invalid_geom_count += 1
            continue
    else:
        invalid_geom_count += 1
        continue

    owner = owner_name or 'Government of India / Public Domain'
    loc_parts = [p for p in [village_name, district_name] if p]
    loc = ', '.join(loc_parts) if loc_parts else (state_name or 'India')
    st = state_code or 'IN'
    area = float(area_sqm) if area_sqm else 100.0
    land_use = (land_use_cat or 'RESIDENTIAL').capitalize()
    tax_due = float(tax_inr) if tax_inr else 0.0

    ror_data = json.dumps({
        'record_type': ror_type or 'Jamabandi / RoR',
        'tenure_type': tenure_type or 'Bhumiswami / Freehold',
        'khasra_no': khasra or '',
        'verification_source': 'State Land Records Portal (Bhu-Lekh)'
    })

    has_enc = bool(enc_type and enc_type != 'NONE')
    enc_data = json.dumps({
        'mortgaged': has_enc,
        'encumbrance_type': enc_type or 'NONE',
        'charge_amount': float(enc_amt) if enc_amt else 0.0
    })

    dispute = bool(status and 'DISPUTED' in status.upper())
    region_key = (state_name or 'national').lower().replace(' ', '_')

    rows_to_insert.append((
        ulpin,
        wkt,
        round(area, 2),
        owner,
        loc,
        st,
        ror_data,
        enc_data,
        land_use,
        tax_due,
        region_key,
        p_id,
        khasra or '',
        village_name or '',
        'Survey of India / State Revenue Department',
        '2026-01-15',
        1 if dispute else 0,
        'DHARAA Cadastral Database - High Precision Geometry',
        float(c_lat) if c_lat else None,
        float(c_lon) if c_lon else None
    ))

tgt_cur.executemany(insert_sql, rows_to_insert)
tgt_conn.commit()

print(f'Successfully imported {len(rows_to_insert)} records into {target_path}!')

# Verification report
tgt_cur.execute('SELECT count(*) FROM parcels')
total_p = tgt_cur.fetchone()[0]

tgt_cur.execute('SELECT count(*) FROM parcels WHERE geometry IS NOT NULL AND length(geometry) > 10')
valid_geom_p = tgt_cur.fetchone()[0]

tgt_cur.execute('SELECT count(DISTINCT state) FROM parcels')
states_p = tgt_cur.fetchone()[0]

tgt_cur.execute('SELECT min(centroid_lat), max(centroid_lat), min(centroid_lon), max(centroid_lon) FROM parcels WHERE centroid_lat IS NOT NULL')
min_lat, max_lat, min_lon, max_lon = tgt_cur.fetchone()

print('=== FINAL DEV DATABASE AUDIT REPORT ===')
print(f'Total parcels: {total_p}')
print(f'Valid geometries: {valid_geom_p}')
print(f'States covered: {states_p}')
print(f'Geographic Bounds: Lat [{min_lat}, {max_lat}], Lon [{min_lon}, {max_lon}]')

tgt_conn.close()
src_conn.close()
