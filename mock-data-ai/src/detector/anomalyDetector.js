/**
 * DHARAA — Digital Public Infrastructure for Land Governance
 * Land Trust Engine: Anomaly & Conflict Detection Orchestrator
 * 
 * Aggregates normalized land parcels across departments, evaluates deterministic
 * rules, calculates composite trust ratings, and outputs structured audit results.
 */

import {
  OwnerMismatchRule,
  MutationSlaBreachRule,
  ZoningInconsistencyRule,
  AreaDiscrepancyRule,
  SatelliteLandUseDriftRule,
  ConflictSeverity
} from './rules.js';

export class AnomalyDetector {
  constructor(options = {}) {
    this.referenceDate = options.referenceDate || '2026-09-08';
    this.statutorySlaDays = options.statutorySlaDays || 30;
    this.areaTolerancePercent = options.areaTolerancePercent || 5.0;

    // Initialize rules
    this.rules = [
      new OwnerMismatchRule(),
      new MutationSlaBreachRule(this.statutorySlaDays),
      new ZoningInconsistencyRule(),
      new AreaDiscrepancyRule(this.areaTolerancePercent),
      new SatelliteLandUseDriftRule()
    ];
  }

  /**
   * Evaluates a single normalized parcel against all registered rules
   */
  evaluateParcel(parcel) {
    const anomalies = [];

    for (const rule of this.rules) {
      try {
        const flag = rule.evaluate(parcel, this.referenceDate);
        if (flag) {
          anomalies.push({
            ...flag,
            state: parcel.state,
            state_code: parcel.state_code,
            detected_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error(`Error executing rule ${rule.id} on ${parcel.ulpin}:`, err.message);
      }
    }

    const trustMetrics = this.computeTrustScore(anomalies);

    return {
      ulpin: parcel.ulpin,
      state: parcel.state,
      state_code: parcel.state_code,
      centroid: parcel.centroid,
      master_owner: parcel.master_owner,
      has_conflicts: anomalies.length > 0,
      conflict_count: anomalies.length,
      trust_score: trustMetrics.score,
      trust_tier: trustMetrics.tier,
      conflicts: anomalies
    };
  }

  /**
   * Computes composite Trust Score (0 - 100) based on conflict severities
   */
  computeTrustScore(anomalies) {
    if (!anomalies || anomalies.length === 0) {
      return { score: 100, tier: 'HIGH_TRUST' };
    }

    let penalty = 0;
    for (const a of anomalies) {
      switch (a.severity) {
        case ConflictSeverity.CRITICAL:
          penalty += 35;
          break;
        case ConflictSeverity.HIGH:
          penalty += 20;
          break;
        case ConflictSeverity.MEDIUM:
          penalty += 10;
          break;
        case ConflictSeverity.LOW:
          penalty += 5;
          break;
        default:
          penalty += 10;
      }
    }

    const score = Math.max(0, 100 - penalty);
    let tier = 'HIGH_TRUST';
    if (score < 40) {
      tier = 'DISPUTED';
    } else if (score < 60) {
      tier = 'LOW_TRUST';
    } else if (score < 85) {
      tier = 'MEDIUM_TRUST';
    }

    return { score, tier };
  }

  /**
   * Evaluates a collection of normalized parcels and computes aggregate analytics
   */
  evaluateAll(parcels) {
    const parcelResults = [];
    const allAnomalies = [];

    const stats = {
      total_parcels_evaluated: parcels.length,
      clean_parcels_count: 0,
      conflicted_parcels_count: 0,
      total_anomalies_flagged: 0,
      severity_breakdown: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0
      },
      type_breakdown: {},
      department_involvement: {},
      state_breakdown: {}
    };

    for (const parcel of parcels) {
      const res = this.evaluateParcel(parcel);
      parcelResults.push(res);

      const st = parcel.state || 'Unknown';
      if (!stats.state_breakdown[st]) {
        stats.state_breakdown[st] = {
          total: 0,
          clean: 0,
          conflicted: 0,
          anomalies: 0
        };
      }
      stats.state_breakdown[st].total++;

      if (res.has_conflicts) {
        stats.conflicted_parcels_count++;
        stats.state_breakdown[st].conflicted++;

        for (const conflict of res.conflicts) {
          allAnomalies.push(conflict);
          stats.total_anomalies_flagged++;
          stats.state_breakdown[st].anomalies++;

          // Severity count
          const sev = conflict.severity || 'MEDIUM';
          stats.severity_breakdown[sev] = (stats.severity_breakdown[sev] || 0) + 1;

          // Type count
          const cType = conflict.conflict_type || 'UNKNOWN';
          stats.type_breakdown[cType] = (stats.type_breakdown[cType] || 0) + 1;

          // Department counts
          for (const dept of (conflict.departments_involved || [])) {
            stats.department_involvement[dept] = (stats.department_involvement[dept] || 0) + 1;
          }
        }
      } else {
        stats.clean_parcels_count++;
        stats.state_breakdown[st].clean++;
      }
    }

    return {
      evaluation_timestamp: new Date().toISOString(),
      reference_date: this.referenceDate,
      statistics: stats,
      parcels: parcelResults,
      anomalies: allAnomalies
    };
  }
}
