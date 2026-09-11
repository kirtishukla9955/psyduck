/**
 * DHARAA — Digital Public Infrastructure for Land Governance
 * State Adapter: Chandigarh (Union Territory)
 * 
 * Maps Northern India / Punjab-Haryana land record terminology:
 * - Revenue: Jamabandi (RoR), Khewat/Khatoni/Khasra, Intiqal (Mutation)
 * - Units: Kanal, Marla, Biswa, Sq. Yards -> Standard Square Meters (sqm)
 * - Registration: Vasika, Bahi/Jild, SRO Chandigarh
 * - Urban: Chandigarh Master Plan 2031, UT Urban Planning Department
 */

export const CH_UNIT_FACTORS = {
  KANAL_TO_SQM: 505.857005,
  MARLA_TO_SQM: 25.29285025, // 20 Marlas in 1 Kanal
  SQ_YARDS_TO_SQM: 0.83612736,
  BISWA_TO_SQM: 126.46425
};

/**
 * Converts Chandigarh area units (Kanal, Marla, Sq. Yards) to Square Meters
 */
export function convertChandigarhArea({ kanal = 0, marla = 0, sq_yards = 0, biswa = 0 } = {}) {
  const total = (Number(kanal) * CH_UNIT_FACTORS.KANAL_TO_SQM) +
                (Number(marla) * CH_UNIT_FACTORS.MARLA_TO_SQM) +
                (Number(sq_yards) * CH_UNIT_FACTORS.SQ_YARDS_TO_SQM) +
                (Number(biswa) * CH_UNIT_FACTORS.BISWA_TO_SQM);
  return Math.round(total * 100) / 100;
}

/**
 * Parses dates in DD/MM/YYYY or YYYY-MM-DD format to standardized YYYY-MM-DD
 */
export function parseChandigarhDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // DD/MM/YYYY
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Normalizes Chandigarh Intiqal (Mutation) status to standard enum
 */
export function normalizeIntiqalStatus(status) {
  if (!status) return 'NONE';
  const s = status.trim().toLowerCase();
  if (s === 'manzoor' || s === 'approved' || s === 'sanctioned') return 'MUTATED';
  if (s === 'zer-tajweez' || s === 'pending' || s === 'under review') return 'PENDING';
  if (s === 'bila-intiqal' || s === 'unmutated' || s === 'none') return 'NONE';
  if (s === 'kharij' || s === 'rejected') return 'REJECTED';
  return 'PENDING';
}

/**
 * Normalizes Chandigarh Land Use / Zoning classifications
 */
export function normalizeChandigarhLandUse(rawType) {
  if (!rawType) return 'OTHER';
  const t = rawType.trim().toLowerCase();
  if (t.includes('commercial') || t.includes('market') || t.includes('shop')) return 'COMMERCIAL';
  if (t.includes('residential') || t.includes('housing')) return 'RESIDENTIAL';
  if (t.includes('institution') || t.includes('school') || t.includes('college')) return 'INSTITUTIONAL';
  if (t.includes('industrial') || t.includes('factory')) return 'INDUSTRIAL';
  if (t.includes('agricultural') || t.includes('periphery') || t.includes('rural')) return 'AGRICULTURAL';
  if (t.includes('green belt') || t.includes('forest') || t.includes('leisure valley')) return 'FOREST_GREEN_BELT';
  if (t.includes('water') || t.includes('lake') || t.includes('choe')) return 'WATER_BODY';
  return 'MIXED_USE';
}

/**
 * Chandigarh State Adapter
 */
export class ChandigarhAdapter {
  constructor() {
    this.stateCode = 'CH';
    this.stateName = 'Chandigarh (UT)';
  }

  /**
   * Normalizes raw Revenue Jamabandi record
   */
  adaptRevenue(raw) {
    if (!raw) return null;
    const areaDetails = raw.area_details || {};
    const areaSqm = convertChandigarhArea({
      kanal: areaDetails.kanal || 0,
      marla: areaDetails.marla || 0,
      sq_yards: areaDetails.sq_yards || 0
    });

    return {
      department: 'Revenue',
      record_id: raw.jamabandi_record_id || `JAM-CH-${raw.ulpin}`,
      owner_name: raw.owner_name?.trim() || '',
      co_owners: Array.isArray(raw.co_owners) ? raw.co_owners : [],
      land_use_raw: raw.land_use_type || 'Unknown',
      land_use_normalized: normalizeChandigarhLandUse(raw.land_use_type),
      area_sqm: areaSqm,
      raw_units: {
        kanal: areaDetails.kanal || 0,
        marla: areaDetails.marla || 0,
        sq_yards: areaDetails.sq_yards || 0
      },
      mutation_status: normalizeIntiqalStatus(raw.intiqal_status),
      mutation_status_raw: raw.intiqal_status || 'Bila-Intiqal',
      mutation_id: raw.intiqal_no || null,
      mutation_date: parseChandigarhDate(raw.intiqal_date),
      application_date: parseChandigarhDate(raw.application_date),
      identifiers: {
        khewat_no: raw.khewat_no,
        khatoni_no: raw.khatoni_no,
        khasra_no: raw.khasra_no,
        jamabandi_year: raw.jamabandi_year,
        patwar_circle: raw.revenue_circle
      },
      administrative_division: {
        state: this.stateName,
        district: 'Chandigarh',
        sub_division: raw.sub_division || 'Chandigarh Central',
        sector: raw.sector || ''
      }
    };
  }

  /**
   * Normalizes raw Registration Deed (Vasika)
   */
  adaptRegistration(raw) {
    if (!raw) return null;
    return {
      department: 'Registration',
      deed_number: raw.vasika_number || '',
      registered_owner: raw.buyer_name?.trim() || '',
      seller_name: raw.seller_name?.trim() || '',
      registration_date: parseChandigarhDate(raw.execution_date),
      deed_type: raw.deed_type || 'Sale Deed',
      sro_office: raw.sro_office || 'Sub-Registrar Office, Sector 17, Chandigarh UT',
      consideration_amount_inr: raw.consideration_amount_inr || 0,
      stamp_duty_inr: raw.stamp_duty_inr || 0,
      registration_fee_inr: raw.registration_fee_inr || 0,
      book_details: {
        bahi_no: raw.bahi_no || '1',
        jild_no: raw.jild_no || ''
      }
    };
  }

  /**
   * Normalizes raw Cadastral Survey record
   */
  adaptSurvey(rawFeature) {
    if (!rawFeature) return null;
    const props = rawFeature.properties || {};
    const geom = rawFeature.geometry || null;

    return {
      department: 'Survey',
      sketch_id: props.parcel_id || `UT-CAD-${props.ulpin}`,
      parcel_number: props.khasra_no || '',
      surveyed_area_sqm: props.surveyed_area_sqm || 0,
      survey_date: parseChandigarhDate(props.survey_date),
      survey_agency: props.survey_agency || 'Survey of India / UT Cadastral Wing',
      boundary_dispute: Boolean(props.dispute_flag),
      geometry: geom
    };
  }

  /**
   * Normalizes raw Urban Planning / Master Plan record
   */
  adaptUrban(raw) {
    if (!raw) return null;
    return {
      department: 'Urban Development',
      authority: raw.authority || 'Department of Urban Planning, Chandigarh Administration',
      zoning_raw: raw.master_plan_2031_zoning || 'Residential',
      zoning_normalized: normalizeChandigarhLandUse(raw.master_plan_2031_zoning),
      building_permission_status: (raw.building_plan_status || 'Sanctioned').toUpperCase(),
      sanction_no: raw.sanction_no || null,
      violations_reported: Boolean(raw.violations_reported),
      remarks: raw.remarks || ''
    };
  }
}
