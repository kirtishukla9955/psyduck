/**
 * DHARAA — Digital Public Infrastructure for Land Governance
 * Automated Test Suite for State Adapters & Anomaly Detection Engine
 * 
 * Run via:
 *   node --test mock-data-ai/test/detector.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertChandigarhArea,
  parseChandigarhDate,
  normalizeIntiqalStatus
} from '../src/adapters/chandigarhAdapter.js';
import {
  convertTamilNaduArea,
  parseTamilNaduDate,
  normalizePattaStatus
} from '../src/adapters/tamilNaduAdapter.js';
import {
  normalizeIndianName,
  StateAdapterEngine
} from '../src/adapters/adapterEngine.js';
import { areNamesEquivalent } from '../src/detector/rules.js';
import { AnomalyDetector } from '../src/detector/anomalyDetector.js';

test('1. Unit Conversion Tests', async (t) => {
  await t.test('Chandigarh Kanal & Marla to Sq.M', () => {
    // 1 Kanal = 505.86 sqm
    const kanalArea = convertChandigarhArea({ kanal: 1 });
    assert.equal(kanalArea, 505.86);

    // 20 Marla = 1 Kanal = 505.86 sqm
    const marlaArea = convertChandigarhArea({ marla: 20 });
    assert.equal(marlaArea, 505.86);

    // 2 Kanal + 10 Marla = 1264.64 sqm
    const mixed = convertChandigarhArea({ kanal: 2, marla: 10 });
    assert.equal(mixed, 1264.64);
  });

  await t.test('Tamil Nadu Grounds & Cents to Sq.M', () => {
    // 1 Ground = 222.97 sqm
    const groundArea = convertTamilNaduArea({ grounds: 1 });
    assert.equal(groundArea, 222.97);

    // 10 Cents = 404.69 sqm
    const centsArea = convertTamilNaduArea({ cents: 10 });
    assert.equal(centsArea, 404.69);

    // 1 Hectare = 10,000 sqm
    const hecArea = convertTamilNaduArea({ hectares: 1 });
    assert.equal(hecArea, 10000.0);
  });
});

test('2. Date & Terminology Parsing Tests', async (t) => {
  await t.test('Date parser handles DD/MM/YYYY and YYYY-MM-DD', () => {
    assert.equal(parseChandigarhDate('15/02/2024'), '2024-02-15');
    assert.equal(parseTamilNaduDate('2024-03-20'), '2024-03-20');
    assert.equal(parseChandigarhDate(''), null);
  });

  await t.test('Mutation status normalization', () => {
    assert.equal(normalizeIntiqalStatus('Manzoor'), 'MUTATED');
    assert.equal(normalizeIntiqalStatus('Zer-Tajweez'), 'PENDING');
    assert.equal(normalizeIntiqalStatus('Bila-Intiqal'), 'NONE');

    assert.equal(normalizePattaStatus('A-Register Updated'), 'MUTATED');
    assert.equal(normalizePattaStatus('Pending with Zonal Deputy Tahsildar'), 'PENDING');
    assert.equal(normalizePattaStatus('Application Rejected'), 'REJECTED');
  });
});

test('3. Indian Name Normalization & Equivalence Tests', async (t) => {
  await t.test('Honorific stripping and phonetic comparison', () => {
    assert.equal(normalizeIndianName('Late Sh. R. K. Sharma'), 'r k sharma');
    assert.equal(normalizeIndianName('Thiru S. Sivakumar'), 's sivakumar');
    assert.equal(normalizeIndianName('Tmt. Lakshmi Narayanan'), 'lakshmi narayanan');
    assert.equal(normalizeIndianName('Dr. R. Balasubramanian'), 'r balasubramanian');

    // Equivalent matching
    assert.equal(areNamesEquivalent('Thiru S. Sivakumar', 'Sivakumar S.'), true);
    assert.equal(areNamesEquivalent('Gurpreet Singh Ahluwalia', 'Gurpreet Singh'), true);
    assert.equal(areNamesEquivalent('Harpreet Singh Sandhu', 'Sunita Sharma'), false);
  });
});

test('4. State Adapter Integration & Ingestion Tests', async (t) => {
  const engine = new StateAdapterEngine();
  const normalized = engine.loadAndNormalizeAll();

  await t.test('Ingests 32 total parcels across Chandigarh and Tamil Nadu', () => {
    assert.equal(normalized.total_parcels, 32);
    assert.equal(normalized.chandigarh_parcels.length, 16);
    assert.equal(normalized.tamil_nadu_parcels.length, 16);
  });

  await t.test('Every parcel has valid 4-department structures and centroid geometry', () => {
    for (const p of normalized.all_parcels) {
      assert.ok(p.ulpin.startsWith('IN-CH-') || p.ulpin.startsWith('IN-TN-'));
      assert.ok(p.centroid.lat > 0);
      assert.ok(p.centroid.lon > 0);
      assert.ok(p.departments.revenue);
      assert.ok(p.departments.registration);
      assert.ok(p.departments.survey);
      assert.ok(p.departments.urban_development);
    }
  });
});

test('5. Rule-Based Anomaly & Conflict Detection Tests', async (t) => {
  const engine = new StateAdapterEngine();
  const normalized = engine.loadAndNormalizeAll();

  const detector = new AnomalyDetector({ referenceDate: '2026-09-08', statutorySlaDays: 30 });
  const results = detector.evaluateAll(normalized.all_parcels);

  await t.test('Executive statistics check', () => {
    assert.equal(results.statistics.total_parcels_evaluated, 32);
    assert.equal(results.statistics.clean_parcels_count, 20);
    assert.equal(results.statistics.conflicted_parcels_count, 12);
    assert.equal(results.statistics.total_anomalies_flagged, 16);
  });

  await t.test('Clean parcels have 0 conflicts and 100 trust score', () => {
    const cleanParcels = results.parcels.filter(p => !p.has_conflicts);
    assert.equal(cleanParcels.length, 20);
    for (const cp of cleanParcels) {
      assert.equal(cp.conflict_count, 0);
      assert.equal(cp.trust_score, 100);
      assert.equal(cp.trust_tier, 'HIGH_TRUST');
    }
  });

  await t.test('Chandigarh conflict parcels validation', () => {
    // IN-CH-022-00111: Owner Mismatch
    const p111 = results.parcels.find(p => p.ulpin === 'IN-CH-022-00111');
    assert.ok(p111.has_conflicts);
    assert.ok(p111.conflicts.some(c => c.conflict_type === 'OWNER_MISMATCH'));

    // IN-CH-043-00112: SLA Breach & Owner Mismatch
    const p112 = results.parcels.find(p => p.ulpin === 'IN-CH-043-00112');
    assert.ok(p112.has_conflicts);
    assert.ok(p112.conflicts.some(c => c.conflict_type === 'MUTATION_SLA_BREACH'));

    // IN-CH-017-00113: Zoning Inconsistency (Green Belt / Leisure Valley)
    const p113 = results.parcels.find(p => p.ulpin === 'IN-CH-017-00113');
    assert.ok(p113.has_conflicts);
    assert.ok(p113.conflicts.some(c => c.conflict_type === 'ZONING_INCONSISTENCY'));

    // IN-CH-034-00114: Area Discrepancy (18.5% deviation)
    const p114 = results.parcels.find(p => p.ulpin === 'IN-CH-034-00114');
    assert.ok(p114.has_conflicts);
    assert.ok(p114.conflicts.some(c => c.conflict_type === 'AREA_DISCREPANCY'));
  });

  await t.test('Tamil Nadu conflict parcels validation', () => {
    // IN-TN-CHN-00211: Owner Mismatch
    const p211 = results.parcels.find(p => p.ulpin === 'IN-TN-CHN-00211');
    assert.ok(p211.has_conflicts);
    assert.ok(p211.conflicts.some(c => c.conflict_type === 'OWNER_MISMATCH'));

    // IN-TN-CHN-00212: Mutation SLA breach
    const p212 = results.parcels.find(p => p.ulpin === 'IN-TN-CHN-00212');
    assert.ok(p212.has_conflicts);
    assert.ok(p212.conflicts.some(c => c.conflict_type === 'MUTATION_SLA_BREACH'));

    // IN-TN-CHN-00213: Water Body Buffer Zone violation
    const p213 = results.parcels.find(p => p.ulpin === 'IN-TN-CHN-00213');
    assert.ok(p213.has_conflicts);
    assert.ok(p213.conflicts.some(c => c.conflict_type === 'ZONING_INCONSISTENCY'));

    // IN-TN-CHN-00214: Area Discrepancy (23.4% deviation)
    const p214 = results.parcels.find(p => p.ulpin === 'IN-TN-CHN-00214');
    assert.ok(p214.has_conflicts);
    assert.ok(p214.conflicts.some(c => c.conflict_type === 'AREA_DISCREPANCY'));
  });

  await t.test('Anomaly objects conform to required schema contract', () => {
    for (const a of results.anomalies) {
      assert.ok(a.conflict_id);
      assert.ok(a.ulpin);
      assert.ok(a.conflict_type);
      assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(a.severity));
      assert.ok(Array.isArray(a.departments_involved) && a.departments_involved.length > 0);
      assert.ok(a.title);
      assert.ok(a.description);
      assert.ok(a.recommended_action);
      assert.ok(a.suggested_routing_dept);
      assert.ok(a.detected_at);
    }
  });
});
