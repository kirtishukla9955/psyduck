/**
 * DHARAA — Digital Public Infrastructure for Land Governance
 * State Adapter Engine
 * 
 * Orchestrates multi-state record normalization, state detection from ULPIN,
 * coordinate/area parsing, and cross-department aggregation into canonical parcels.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ChandigarhAdapter } from './chandigarhAdapter.js';
import { TamilNaduAdapter } from './tamilNaduAdapter.js';

/**
 * Normalizes Indian names by stripping common titles, prefixes, and punctuation
 */
export function normalizeIndianName(name) {
  if (!name || typeof name !== 'string') return '';
  let cleaned = name.toLowerCase().trim();

  // Strip common Indian honorifics and prefixes
  const prefixes = [
    'late sh. ', 'late sh ', 'late sardar ', 'late thiru ', 'late tmt ', 'late ',
    'shri ', 'sh. ', 'smt. ', 'smt ', 'thiru ', 'tmt. ', 'tmt ', 'selvi. ', 'selvi ',
    'dr. ', 'dr ', 'er. ', 'er ', 'mr. ', 'mr ', 'mrs. ', 'mrs '
  ];

  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length).trim();
    }
  }

  // Remove non-alphanumeric characters except whitespace
  cleaned = cleaned.replace(/[^a-z0-9\s]/g, ' ');
  return cleaned.split(/\s+/).filter(Boolean).join(' ');
}

/**
 * Calculates planar/geodesic area in square meters from a GeoJSON polygon ring [[lon, lat], ...]
 */
export function calculatePolygonAreaSqm(coordinates) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
    return 0;
  }

  const ring = [...coordinates];
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
    ring.push(ring[0]);
  }

  const meanLat = ring.reduce((sum, p) => sum + p[1], 0) / ring.length;
  const latRad = (meanLat * Math.PI) / 180;

  // Meters per degree approximation (WGS84)
  const mPerDegLat = 111132.0;
  const mPerDegLon = 111412.0 * Math.cos(latRad);

  let area = 0.0;
  for (let i = 0; i < ring.length - 1; i++) {
    const x1 = ring[i][0] * mPerDegLon;
    const y1 = ring[i][1] * mPerDegLat;
    const x2 = ring[i + 1][0] * mPerDegLon;
    const y2 = ring[i + 1][1] * mPerDegLat;
    area += (x1 * y2) - (x2 * y1);
  }

  return Math.round(Math.abs(area) / 2.0 * 100) / 100;
}

/**
 * Extracts centroid [lon, lat] from a polygon ring
 */
export function calculateCentroid(coordinates) {
  if (!coordinates || coordinates.length === 0) return { lat: 0, lon: 0 };
  const pts = coordinates[0][0] ? coordinates : coordinates[0];
  let sumLon = 0;
  let sumLat = 0;
  const count = pts.length;
  for (const p of pts) {
    sumLon += p[0];
    sumLat += p[1];
  }
  return {
    lat: Math.round((sumLat / count) * 1000000) / 1000000,
    lon: Math.round((sumLon / count) * 1000000) / 1000000
  };
}

/**
 * State Adapter Engine
 */
export class StateAdapterEngine {
  constructor() {
    this.chandigarhAdapter = new ChandigarhAdapter();
    this.tamilNaduAdapter = new TamilNaduAdapter();
  }

  /**
   * Resolves the appropriate adapter instance based on state code or ULPIN
   */
  resolveAdapter(ulpinOrState) {
    if (!ulpinOrState) return null;
    const str = ulpinOrState.toUpperCase();
    if (str.includes('IN-CH') || str.includes('CHANDIGARH')) {
      return this.chandigarhAdapter;
    }
    if (str.includes('IN-TN') || str.includes('TAMIL NADU') || str.includes('TAMILNADU')) {
      return this.tamilNaduAdapter;
    }
    return null;
  }

  /**
   * Reads raw JSON or GeoJSON file safely
   */
  _readJsonSafe(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch (err) {
      console.warn(`Warning: could not read ${filePath}: ${err.message}`);
    }
    return null;
  }

  /**
   * Resolves the dataset directory path relative to project layout
   */
  findDataDirectory(preferredBaseDir) {
    const candidatePaths = [
      preferredBaseDir,
      path.resolve(process.cwd(), 'data', 'raw'),
      path.resolve(process.cwd(), 'mock-data-ai', 'data', 'raw'),
      path.resolve(process.cwd(), 'datasets', 'raw'),
      path.resolve(process.cwd(), '..', 'data', 'raw')
    ].filter(Boolean);

    for (const cand of candidatePaths) {
      if (fs.existsSync(cand) && (fs.existsSync(path.join(cand, 'chandigarh')) || fs.existsSync(path.join(cand, 'tamil_nadu')))) {
        return cand;
      }
    }
    return candidatePaths[0];
  }

  /**
   * Ingests and normalizes raw department records for all supported states
   */
  loadAndNormalizeAll(dataBaseDir = null) {
    const rawDir = this.findDataDirectory(dataBaseDir);
    const chDir = path.join(rawDir, 'chandigarh');
    const tnDir = path.join(rawDir, 'tamil_nadu');

    const chParcels = this.normalizeChandigarhDataset(chDir);
    const tnParcels = this.normalizeTamilNaduDataset(tnDir);

    const allParcels = [...chParcels, ...tnParcels];
    return {
      total_parcels: allParcels.length,
      chandigarh_parcels: chParcels,
      tamil_nadu_parcels: tnParcels,
      all_parcels: allParcels
    };
  }

  /**
   * Ingests and normalizes Chandigarh department records
   */
  normalizeChandigarhDataset(chDir) {
    const revRaw = this._readJsonSafe(path.join(chDir, 'revenue_jamabandi.json')) || [];
    const regRaw = this._readJsonSafe(path.join(chDir, 'registration_deeds.json')) || [];
    const survGeo = this._readJsonSafe(path.join(chDir, 'survey_cadastral.geojson')) || { features: [] };
    const urbRaw = this._readJsonSafe(path.join(chDir, 'urban_masterplan.json')) || [];
    const satRaw = this._readJsonSafe(path.join(chDir, 'satellite_observations.json')) || [];

    const survFeatures = survGeo.features || [];
    const ulpinSet = new Set([
      ...revRaw.map(r => r.ulpin),
      ...regRaw.map(r => r.ulpin),
      ...survFeatures.map(f => f.properties?.ulpin),
      ...urbRaw.map(u => u.ulpin)
    ].filter(Boolean));

    const normalized = [];
    for (const ulpin of ulpinSet) {
      const rev = revRaw.find(r => r.ulpin === ulpin);
      const reg = regRaw.find(r => r.ulpin === ulpin);
      const surv = survFeatures.find(f => f.properties?.ulpin === ulpin);
      const urb = urbRaw.find(u => u.ulpin === ulpin);
      const sat = satRaw.find(s => s.ulpin === ulpin);

      const normRev = this.chandigarhAdapter.adaptRevenue(rev);
      const normReg = this.chandigarhAdapter.adaptRegistration(reg);
      const normSurv = this.chandigarhAdapter.adaptSurvey(surv);
      const normUrb = this.chandigarhAdapter.adaptUrban(urb);

      const coords = surv?.geometry?.coordinates?.[0] || [];
      const computedArea = calculatePolygonAreaSqm(coords);
      const centroid = calculateCentroid(coords);

      normalized.push({
        ulpin,
        state: 'Chandigarh (UT)',
        state_code: 'CH',
        centroid,
        polygon_coordinates: coords,
        calculated_gis_area_sqm: computedArea,
        master_owner: normRev?.owner_name || normReg?.registered_owner || 'Unknown',
        departments: {
          revenue: normRev,
          registration: normReg,
          survey: normSurv,
          urban_development: normUrb,
          satellite: sat || null
        },
        metadata: {
          adapter_used: 'ChandigarhAdapter',
          normalized_at: new Date().toISOString()
        }
      });
    }

    return normalized;
  }

  /**
   * Ingests and normalizes Tamil Nadu department records
   */
  normalizeTamilNaduDataset(tnDir) {
    const revRaw = this._readJsonSafe(path.join(tnDir, 'revenue_patta_chitta.json')) || [];
    const regRaw = this._readJsonSafe(path.join(tnDir, 'registration_deeds.json')) || [];
    const survGeo = this._readJsonSafe(path.join(tnDir, 'survey_fmb.geojson')) || { features: [] };
    const urbRaw = this._readJsonSafe(path.join(tnDir, 'urban_planning.json')) || [];
    const satRaw = this._readJsonSafe(path.join(tnDir, 'satellite_observations.json')) || [];

    const survFeatures = survGeo.features || [];
    const ulpinSet = new Set([
      ...revRaw.map(r => r.ulpin),
      ...regRaw.map(r => r.ulpin),
      ...survFeatures.map(f => f.properties?.ulpin),
      ...urbRaw.map(u => u.ulpin)
    ].filter(Boolean));

    const normalized = [];
    for (const ulpin of ulpinSet) {
      const rev = revRaw.find(r => r.ulpin === ulpin);
      const reg = regRaw.find(r => r.ulpin === ulpin);
      const surv = survFeatures.find(f => f.properties?.ulpin === ulpin);
      const urb = urbRaw.find(u => u.ulpin === ulpin);
      const sat = satRaw.find(s => s.ulpin === ulpin);

      const normRev = this.tamilNaduAdapter.adaptRevenue(rev);
      const normReg = this.tamilNaduAdapter.adaptRegistration(reg);
      const normSurv = this.tamilNaduAdapter.adaptSurvey(surv);
      const normUrb = this.tamilNaduAdapter.adaptUrban(urb);

      const coords = surv?.geometry?.coordinates?.[0] || [];
      const computedArea = calculatePolygonAreaSqm(coords);
      const centroid = calculateCentroid(coords);

      normalized.push({
        ulpin,
        state: 'Tamil Nadu',
        state_code: 'TN',
        centroid,
        polygon_coordinates: coords,
        calculated_gis_area_sqm: computedArea,
        master_owner: normRev?.owner_name || normReg?.registered_owner || 'Unknown',
        departments: {
          revenue: normRev,
          registration: normReg,
          survey: normSurv,
          urban_development: normUrb,
          satellite: sat || null
        },
        metadata: {
          adapter_used: 'TamilNaduAdapter',
          normalized_at: new Date().toISOString()
        }
      });
    }

    return normalized;
  }
}
