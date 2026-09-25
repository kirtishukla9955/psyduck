/**
 * Loader for the connected mock parcel database's geographic layer.
 *
 * Source of truth: database/mock_database_parcels_20000.csv + database/dharaa.db
 * (20,000 records, each with a real ULPIN, a UUID parcel_id, and a synthetic
 * cadastral polygon). Exported at build time into /public/data/ so the browser
 * can fetch just the state(s) currently in view instead of all 20k at once:
 *   - /data/parcels_index.json           -> one row per state/UT (count + center)
 *   - /data/parcels/<STATE_CODE>.json    -> that state's parcel records
 */

export interface GeoParcelRecord {
  ulpin: string;
  parcelId: string;
  state: string;
  stateCode: string;
  district: string;
  village: string;
  khasraPlotNo: string;
  landUseCategory: string;
  status: string;
  ownerName: string;
  recordedArea: string;
  recordedAreaUnit: string;
  centroid: { lat: number; lon: number };
  boundary: { type: 'Polygon'; coordinates: number[][][] };
}

export interface StateIndexEntry {
  stateCode: string;
  state: string;
  count: number;
  center: { lat: number; lon: number };
  file: string;
}

let indexPromise: Promise<StateIndexEntry[]> | null = null;
const stateCache = new Map<string, Promise<GeoParcelRecord[]>>();

export function loadParcelIndex(): Promise<StateIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = fetch('/data/parcels_index.json').then((res) => {
      if (!res.ok) throw new Error('Failed to load parcel index');
      return res.json();
    });
  }
  return indexPromise;
}

export function loadStateParcels(stateCode: string): Promise<GeoParcelRecord[]> {
  if (!stateCache.has(stateCode)) {
    stateCache.set(
      stateCode,
      fetch(`/data/parcels/${stateCode}.json`).then((res) => {
        if (!res.ok) throw new Error(`Failed to load parcels for ${stateCode}`);
        return res.json();
      })
    );
  }
  return stateCache.get(stateCode)!;
}

/** Nearest state (by anchor centroid) to a given map center — used to pick which
 * per-state parcel file to load for the area currently on screen. */
export function nearestState(
  index: StateIndexEntry[],
  lat: number,
  lon: number
): StateIndexEntry | null {
  if (!index.length) return null;
  let best = index[0];
  let bestDist = Infinity;
  for (const entry of index) {
    const d = (entry.center.lat - lat) ** 2 + (entry.center.lon - lon) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = entry;
    }
  }
  return best;
}

/** Find which state a ULPIN's 2-digit state prefix belongs to, using the index's
 * underlying LGD codes encoded in each record — simplest reliable way is to search
 * loaded caches first, then fall back to scanning per-state files on demand. */
export async function findParcelByUlpin(
  index: StateIndexEntry[],
  ulpin: string
): Promise<GeoParcelRecord | null> {
  // Already-loaded states first (cheap path).
  for (const [, promise] of stateCache) {
    const records = await promise;
    const hit = records.find((r) => r.ulpin === ulpin);
    if (hit) return hit;
  }
  // Fall back to loading every state's file until found (bounded: 36 small files).
  for (const entry of index) {
    const records = await loadStateParcels(entry.stateCode);
    const hit = records.find((r) => r.ulpin === ulpin);
    if (hit) return hit;
  }
  return null;
}
