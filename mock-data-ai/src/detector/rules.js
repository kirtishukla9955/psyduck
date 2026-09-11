/**
 * DHARAA — Digital Public Infrastructure for Land Governance
 * Rule-Based Anomaly & Conflict Detection Rules
 * 
 * Implements explainable, deterministic government compliance rules:
 * - RULE-001: Owner Name Mismatch (Unmutated Transaction Divergence)
 * - RULE-002: Mutation Statutory SLA Breach
 * - RULE-003: Land-Use & Zoning Inconsistency
 * - RULE-004: Demarcated Cadastral Area Discrepancy
 * - RULE-005: Satellite Land-Use Drift / Unauthorized Encroachment
 */

import { normalizeIndianName } from '../adapters/adapterEngine.js';

export const ConflictSeverity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

export const ConflictType = {
  OWNER_MISMATCH: 'OWNER_MISMATCH',
  MUTATION_SLA_BREACH: 'MUTATION_SLA_BREACH',
  ZONING_INCONSISTENCY: 'ZONING_INCONSISTENCY',
  AREA_DISCREPANCY: 'AREA_DISCREPANCY',
  SATELLITE_LAND_USE_DRIFT: 'SATELLITE_LAND_USE_DRIFT'
};

/**
 * Calculates days elapsed between two dates (YYYY-MM-DD)
 */
export function calculateDaysElapsed(fromDateStr, toDateStr = '2026-09-08') {
  if (!fromDateStr) return 0;
  try {
    const d1 = new Date(fromDateStr);
    const d2 = new Date(toDateStr);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

/**
 * Checks if two normalized names match or have significant token overlap
 */
export function areNamesEquivalent(nameA, nameB, coOwners = []) {
  const normA = normalizeIndianName(nameA);
  const normB = normalizeIndianName(nameB);

  if (!normA || !normB) return false;
  if (normA === normB) return true;

  // Check if either is contained in the other for abbreviated/middle names
  if (normA.includes(normB) || normB.includes(normA)) return true;

  // Check co-owners
  for (const co of coOwners) {
    const normCo = normalizeIndianName(co);
    if (normCo === normB || normCo.includes(normB) || normB.includes(normCo)) {
      return true;
    }
  }

  // Token set comparison
  const tokensA = normA.split(' ').filter(Boolean);
  const tokensB = normB.split(' ').filter(Boolean);
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  // If sorted tokens are identical (e.g. "sivakumar s" vs "s sivakumar")
  const sortedA = [...tokensA].sort().join(' ');
  const sortedB = [...tokensB].sort().join(' ');
  if (sortedA === sortedB) return true;

  // Significant tokens (words with >2 letters)
  const sigA = tokensA.filter(t => t.length > 2);
  const sigB = tokensB.filter(t => t.length > 2);

  if (sigA.length > 0 && sigB.length > 0) {
    const allSigMatch = sigA.every(t => setB.has(t)) || sigB.every(t => setA.has(t));
    if (allSigMatch) return true;
  }

  // Token set intersection check
  let matchCount = 0;
  for (const t of setB) {
    if (setA.has(t) && t.length > 2) {
      matchCount++;
    }
  }
  return matchCount >= 2;
}

/**
 * RULE-001: Owner Name Mismatch (Unmutated Transaction)
 * Flags when Registration (Sale Deed) records a buyer but Revenue (RoR/Patta)
 * has not mutated the parcel and still reflects the prior owner.
 */
export class OwnerMismatchRule {
  constructor() {
    this.id = 'RULE-001';
    this.name = 'Owner Name Mismatch (Unmutated Transaction)';
    this.conflictType = ConflictType.OWNER_MISMATCH;
  }

  evaluate(parcel, refDate = '2026-09-08') {
    const reg = parcel.departments?.registration;
    const rev = parcel.departments?.revenue;

    if (!reg || !rev) return null;
    if (!reg.registered_owner || !rev.owner_name) return null;

    const namesMatch = areNamesEquivalent(
      rev.owner_name,
      reg.registered_owner,
      rev.co_owners || []
    );

    // If names match, no ownership divergence
    if (namesMatch) return null;

    // Discrepancy detected: deed is registered to buyer, but Revenue still shows seller/prior owner
    const isMutated = rev.mutation_status === 'MUTATED';

    // If Revenue has not recognized the mutation, it is a CRITICAL mismatch
    if (!isMutated) {
      return {
        conflict_id: `CONF-${parcel.ulpin}-OWN-01`,
        ulpin: parcel.ulpin,
        conflict_type: this.conflictType,
        rule_id: this.id,
        severity: ConflictSeverity.CRITICAL,
        departments_involved: ['Registration', 'Revenue'],
        title: 'Ownership Divergence Between Registration and Revenue',
        description: `Sale deed #${reg.deed_number} registered in favour of '${reg.registered_owner}' at ${reg.sro_office}, but Revenue record (${rev.record_id}) remains registered under '${rev.owner_name}'. Revenue mutation status is currently '${rev.mutation_status_raw || rev.mutation_status}'.`,
        details: {
          registered_owner: reg.registered_owner,
          revenue_owner: rev.owner_name,
          registration_deed_number: reg.deed_number,
          registration_date: reg.registration_date,
          revenue_record_id: rev.record_id,
          revenue_mutation_status: rev.mutation_status
        },
        sla_days_overdue: null,
        recommended_action: 'Initiate auto-notice to Sub-Registrar and Revenue Tehsildar/VAO. Trigger digital mutation verification workflow to update Record of Rights.',
        suggested_routing_dept: 'Revenue Department'
      };
    }

    return null;
  }
}

/**
 * RULE-002: Mutation Statutory SLA Breach
 * Evaluates pending mutation requests against statutory disposal timelines.
 * Standard SLA is 30 days under State Right to Public Service Acts.
 */
export class MutationSlaBreachRule {
  constructor(statutorySlaDays = 30) {
    this.id = 'RULE-002';
    this.name = 'Mutation Statutory SLA Breach';
    this.conflictType = ConflictType.MUTATION_SLA_BREACH;
    this.statutorySlaDays = statutorySlaDays;
  }

  evaluate(parcel, refDate = '2026-09-08') {
    const rev = parcel.departments?.revenue;
    const reg = parcel.departments?.registration;
    if (!rev) return null;

    // Only evaluates unfinalized mutations
    const isPending = rev.mutation_status === 'PENDING' ||
                      rev.mutation_status_raw?.toLowerCase().includes('pending') ||
                      rev.mutation_status_raw?.toLowerCase().includes('zer-tajweez') ||
                      rev.mutation_status_raw?.toLowerCase().includes('deputy tahsildar');

    if (!isPending) return null;

    // Benchmark start date: application_date or registration_date
    const startDate = rev.application_date || reg?.registration_date;
    if (!startDate) return null;

    const elapsedDays = calculateDaysElapsed(startDate, refDate);
    if (elapsedDays <= this.statutorySlaDays) return null;

    const overdueDays = elapsedDays - this.statutorySlaDays;
    let severity = ConflictSeverity.MEDIUM;
    if (overdueDays > 60) {
      severity = ConflictSeverity.CRITICAL;
    } else if (overdueDays > 15) {
      severity = ConflictSeverity.HIGH;
    }

    return {
      conflict_id: `CONF-${parcel.ulpin}-SLA-01`,
      ulpin: parcel.ulpin,
      conflict_type: this.conflictType,
      rule_id: this.id,
      severity,
      departments_involved: ['Revenue'],
      title: `Mutation Overdue by ${overdueDays} Days Beyond Statutory SLA`,
      description: `Mutation application initiated on ${startDate} has been pending for ${elapsedDays} days. Statutory SLA limit is ${this.statutorySlaDays} days. Application is currently ${overdueDays} days overdue for disposal.`,
      details: {
        application_date: startDate,
        statutory_sla_days: this.statutorySlaDays,
        elapsed_days: elapsedDays,
        overdue_days: overdueDays,
        mutation_id: rev.mutation_id || 'Pending Application',
        current_status: rev.mutation_status_raw || rev.mutation_status
      },
      sla_days_overdue: overdueDays,
      recommended_action: 'Escalate to Sub-Divisional Magistrate (SDM) / Revenue Divisional Officer (RDO) under Right to Public Service Guarantee. Dispatch electronic pendency summons to field Tehsildar.',
      suggested_routing_dept: 'Revenue Department'
    };
  }
}

/**
 * RULE-003: Land-Use & Master Plan Zoning Inconsistency
 * Flags mismatches between Master Plan zoning and Revenue land classification
 * or building sanction violations.
 */
export class ZoningInconsistencyRule {
  constructor() {
    this.id = 'RULE-003';
    this.name = 'Land-Use & Master Plan Zoning Inconsistency';
    this.conflictType = ConflictType.ZONING_INCONSISTENCY;
  }

  evaluate(parcel, refDate = '2026-09-08') {
    const rev = parcel.departments?.revenue;
    const urb = parcel.departments?.urban_development;

    if (!rev || !urb) return null;

    const revUse = rev.land_use_normalized;
    const urbZone = urb.zoning_normalized;
    const violationReported = urb.violations_reported;

    // Check for severe ecological or zoning incompatibility
    const isBufferOrWaterViolation =
      urbZone === 'WATER_BODY' ||
      urbZone === 'FOREST_GREEN_BELT' ||
      urb.zoning_raw?.toLowerCase().includes('green belt') ||
      urb.zoning_raw?.toLowerCase().includes('buffer') ||
      urb.zoning_raw?.toLowerCase().includes('leisure valley');

    const isNonConformingCommercialOrResidential =
      revUse === 'COMMERCIAL' ||
      revUse === 'RESIDENTIAL';

    if ((isBufferOrWaterViolation && isNonConformingCommercialOrResidential) || violationReported) {
      const severity = isBufferOrWaterViolation ? ConflictSeverity.CRITICAL : ConflictSeverity.HIGH;

      return {
        conflict_id: `CONF-${parcel.ulpin}-ZON-01`,
        ulpin: parcel.ulpin,
        conflict_type: this.conflictType,
        rule_id: this.id,
        severity,
        departments_involved: ['Revenue', 'Urban Development'],
        title: 'Master Plan Zoning Inconsistency & Unauthorized Use',
        description: `Land designated as '${urb.zoning_raw}' under Master Plan regulations (${urb.authority}), but Revenue records recognize activity as '${rev.land_use_raw}'. Urban Authority remarks: '${urb.remarks}'. Building sanction status: '${urb.building_permission_status}'.`,
        details: {
          master_plan_zoning: urb.zoning_raw,
          normalized_zoning: urbZone,
          revenue_land_use: rev.land_use_raw,
          normalized_land_use: revUse,
          planning_authority: urb.authority,
          building_status: urb.building_permission_status,
          violations_reported: urb.violations_reported
        },
        sla_days_overdue: null,
        recommended_action: 'Issue immediate halt-construction / show-cause notice. Refer to Town & Country Planning Directorate and District Environmental Committee for zone verification.',
        suggested_routing_dept: 'Urban Development Authority'
      };
    }

    return null;
  }
}

/**
 * RULE-004: Demarcated Cadastral Area Discrepancy
 * Compares physical ground demarcation from Survey (Cadastral / FMB) against
 * declared area in Revenue and Registration records.
 */
export class AreaDiscrepancyRule {
  constructor(tolerancePercent = 5.0) {
    this.id = 'RULE-004';
    this.name = 'Demarcated Cadastral Area Discrepancy';
    this.conflictType = ConflictType.AREA_DISCREPANCY;
    this.tolerancePercent = tolerancePercent;
  }

  evaluate(parcel, refDate = '2026-09-08') {
    const surv = parcel.departments?.survey;
    const rev = parcel.departments?.revenue;

    if (!surv || !rev) return null;

    const surveyedArea = surv.surveyed_area_sqm || parcel.calculated_gis_area_sqm;
    const declaredArea = rev.area_sqm;

    if (!surveyedArea || !declaredArea || declaredArea <= 0) return null;

    const areaDelta = Math.abs(surveyedArea - declaredArea);
    const deviationPercent = Math.round((areaDelta / declaredArea) * 10000) / 100;

    const disputeFlag = surv.boundary_dispute;

    if (deviationPercent > this.tolerancePercent || disputeFlag) {
      let severity = ConflictSeverity.MEDIUM;
      if (deviationPercent > 15.0) {
        severity = ConflictSeverity.CRITICAL;
      } else if (deviationPercent > 8.0) {
        severity = ConflictSeverity.HIGH;
      }

      return {
        conflict_id: `CONF-${parcel.ulpin}-ARA-01`,
        ulpin: parcel.ulpin,
        conflict_type: this.conflictType,
        rule_id: this.id,
        severity,
        departments_involved: ['Survey', 'Revenue'],
        title: `Cadastral Boundary Discrepancy of ${deviationPercent}%`,
        description: `Demarcated survey boundary (${surv.survey_agency}) measures ${surveyedArea} sq.m, diverging by ${deviationPercent}% (${areaDelta.toFixed(1)} sq.m) from Revenue declared area of ${declaredArea} sq.m. Boundary dispute marker: ${disputeFlag ? 'ACTIVE' : 'NONE'}.`,
        details: {
          survey_demarcated_sqm: surveyedArea,
          revenue_declared_sqm: declaredArea,
          area_delta_sqm: Math.round(areaDelta * 100) / 100,
          deviation_percent: deviationPercent,
          tolerance_threshold_percent: this.tolerancePercent,
          survey_agency: surv.survey_agency,
          survey_date: surv.survey_date,
          boundary_dispute_flag: disputeFlag
        },
        sla_days_overdue: null,
        recommended_action: 'Order joint electronic boundary resurvey (ETS / DGPS) by Survey Inspector in presence of Revenue Patwari / VAO and recorded landholders.',
        suggested_routing_dept: 'Survey and Land Records Department'
      };
    }

    return null;
  }
}

/**
 * RULE-005: Satellite Land-Use Drift
 * Stand-in rule evaluating earth observation / satellite alerts against declared land records.
 */
export class SatelliteLandUseDriftRule {
  constructor() {
    this.id = 'RULE-005';
    this.name = 'Satellite Land-Use Drift';
    this.conflictType = ConflictType.SATELLITE_LAND_USE_DRIFT;
  }

  evaluate(parcel, refDate = '2026-09-08') {
    const sat = parcel.departments?.satellite;
    if (!sat) return null;

    if (sat.unauthorized_structure_flag || (sat.ndvi_delta && sat.ndvi_delta < -0.35)) {
      return {
        conflict_id: `CONF-${parcel.ulpin}-SAT-01`,
        ulpin: parcel.ulpin,
        conflict_type: this.conflictType,
        rule_id: this.id,
        severity: ConflictSeverity.HIGH,
        departments_involved: ['Survey', 'Urban Development', 'Space Applications Center (ISRO)'],
        title: 'Satellite Detected Unauthorized Land-Use Drift',
        description: `Multitemporal Sentinel-2 observation flagged structural anomaly: NDVI vegetation index change of ${sat.ndvi_delta} with built-up index shift of +${sat.built_up_index_change}. Notes: '${sat.notes}' (Confidence: ${Math.round((sat.confidence_score || 0.9) * 100)}%).`,
        details: {
          baseline_ndvi: sat.baseline_ndvi,
          recent_ndvi: sat.recent_ndvi,
          ndvi_delta: sat.ndvi_delta,
          built_up_index_change: sat.built_up_index_change,
          confidence_score: sat.confidence_score,
          alert_notes: sat.notes
        },
        sla_days_overdue: null,
        recommended_action: 'Deploy Municipal Drone Verification Wing to ground-truth unauthorized development and serve Section 338 stop-work summons.',
        suggested_routing_dept: 'Urban Development Authority'
      };
    }

    return null;
  }
}
