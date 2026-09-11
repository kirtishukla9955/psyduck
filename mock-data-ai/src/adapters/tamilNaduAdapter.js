/**
 * DHARAA — Digital Public Infrastructure for Land Governance
 * State Adapter: Tamil Nadu
 * 
 * Maps Southern India / Tamil Nadu land record terminology:
 * - Revenue: Patta / Chitta, A-Register, Taluk / Firka / Village, Survey/Sub-division
 * - Units: Grounds, Cents, Ares, Hectares, Sq. Ft -> Standard Square Meters (sqm)
 * - Registration: TNREGINET, Sub-Registrar Office (SRO), Kraya Pathiram (Sale Deed)
 * - Survey: Field Measurement Book (FMB), Collabland cadastral survey
 * - Urban: Chennai Metropolitan Development Authority (CMDA) / DTCP Master Plan II
 */

export const TN_UNIT_FACTORS = {
  GROUND_TO_SQM: 222.96728, // 1 Ground = 2,400 sq.ft
  CENT_TO_SQM: 40.4685642,   // 100 Cents = 1 Acre
  ACRE_TO_SQM: 4046.85642,
  HECTARE_TO_SQM: 10000.0,
  ARE_TO_SQM: 100.0,
  SQ_FT_TO_SQM: 0.092903
};

/**
 * Converts Tamil Nadu area units (Grounds, Cents, Hectares, Ares, Sq.Ft) to Square Meters
 */
export function convertTamilNaduArea({
  grounds = 0,
  cents = 0,
  hectares = 0,
  ares = 0,
  sq_ft = 0
} = {}) {
  const total = (Number(grounds) * TN_UNIT_FACTORS.GROUND_TO_SQM) +
                (Number(cents) * TN_UNIT_FACTORS.CENT_TO_SQM) +
                (Number(hectares) * TN_UNIT_FACTORS.HECTARE_TO_SQM) +
                (Number(ares) * TN_UNIT_FACTORS.ARE_TO_SQM) +
                (Number(sq_ft) * TN_UNIT_FACTORS.SQ_FT_TO_SQM);
  return Math.round(total * 100) / 100;
}

/**
 * Parses dates in YYYY-MM-DD or DD/MM/YYYY format to standardized YYYY-MM-DD
 */
export function parseTamilNaduDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      return `${y.padStart(4, '20')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Normalizes Tamil Nadu Patta Transfer status to standard enum
 */
export function normalizePattaStatus(status) {
  if (!status) return 'NONE';
  const s = status.trim().toLowerCase();
  if (s.includes('updated') || s.includes('patta issued') || s.includes('approved')) return 'MUTATED';
  if (s.includes('pending') || s.includes('nilavaiyil') || s.includes('under scrutiny') || s.includes('deputy tahsildar')) return 'PENDING';
  if (s.includes('rejected') || s.includes('niragirikkappattadhu')) return 'REJECTED';
  if (s.includes('disputed') || s.includes('vivadathil')) return 'DISPUTED';
  return 'PENDING';
}

/**
 * Normalizes Tamil Nadu Land Classification / Master Plan Zoning
 */
export function normalizeTamilNaduLandUse(rawType) {
  if (!rawType) return 'OTHER';
  const t = rawType.trim().toLowerCase();
  if (t.includes('varthaga') || t.includes('commercial') || t.includes('retail') || t.includes('mall')) return 'COMMERCIAL';
  if (t.includes('natham') || t.includes('manai') || t.includes('residential') || t.includes('housing')) return 'RESIDENTIAL';
  if (t.includes('sipcot') || t.includes('sidco') || t.includes('industrial') || t.includes('factory')) return 'INDUSTRIAL';
  if (t.includes('nanji') || t.includes('nanjai') || t.includes('punji') || t.includes('punjai') || t.includes('agricultural') || t.includes('wet land') || t.includes('dry land')) return 'AGRICULTURAL';
  if (t.includes('institution') || t.includes('college') || t.includes('trust') || t.includes('university')) return 'INSTITUTIONAL';
  if (t.includes('water') || t.includes('neer') || t.includes('wetland') || t.includes('lake') || t.includes('buffer') || t.includes('pallikaranai')) return 'WATER_BODY';
  if (t.includes('forest') || t.includes('poramboke')) return 'FOREST_GREEN_BELT';
  return 'MIXED_USE';
}

/**
 * Tamil Nadu State Adapter
 */
export class TamilNaduAdapter {
  constructor() {
    this.stateCode = 'TN';
    this.stateName = 'Tamil Nadu';
  }

  /**
   * Normalizes raw Revenue Patta / Chitta record
   */
  adaptRevenue(raw) {
    if (!raw) return null;
    const extent = raw.extent || {};
    const areaSqm = convertTamilNaduArea({
      grounds: extent.grounds || 0,
      cents: extent.cents || 0,
      hectares: extent.hectares || 0,
      ares: extent.ares || 0,
      sq_ft: extent.sq_ft || 0
    });

    return {
      department: 'Revenue',
      record_id: raw.patta_passbook_id || `PATTA-TN-${raw.ulpin}`,
      owner_name: raw.patta_holder_name?.trim() || '',
      co_owners: Array.isArray(raw.joint_patta_holders) ? raw.joint_patta_holders : [],
      land_use_raw: raw.land_classification || 'Unknown',
      land_use_normalized: normalizeTamilNaduLandUse(raw.land_classification),
      area_sqm: areaSqm,
      raw_units: {
        grounds: extent.grounds || 0,
        cents: extent.cents || 0,
        hectares: extent.hectares || 0,
        ares: extent.ares || 0,
        sq_ft: extent.sq_ft || 0
      },
      mutation_status: normalizePattaStatus(raw.patta_transfer_status),
      mutation_status_raw: raw.patta_transfer_status || 'Pending',
      mutation_id: raw.patta_number ? `PATTA-${raw.patta_number}` : null,
      mutation_date: parseTamilNaduDate(raw.patta_issue_date),
      application_date: parseTamilNaduDate(raw.application_date),
      identifiers: {
        patta_number: raw.patta_number,
        survey_number: raw.survey_number,
        sub_division_number: raw.sub_division_number,
        firka: raw.revenue_inspector_circle
      },
      administrative_division: {
        state: this.stateName,
        district: raw.district || 'Chennai',
        taluk: raw.taluk || '',
        village: raw.village || ''
      }
    };
  }

  /**
   * Normalizes raw TNREGINET Registration Deed
   */
  adaptRegistration(raw) {
    if (!raw) return null;
    return {
      department: 'Registration',
      deed_number: raw.tnreginet_doc_no || '',
      registered_owner: raw.claimant_name?.trim() || '',
      seller_name: raw.executant_name?.trim() || '',
      registration_date: parseTamilNaduDate(raw.registration_date),
      deed_type: raw.document_type || 'Absolute Sale Deed',
      sro_office: raw.sub_registrar_office || 'Sub-Registrar Office, Tamil Nadu',
      consideration_amount_inr: raw.consideration_value_inr || 0,
      stamp_duty_inr: raw.stamp_duty_paid_inr || 0,
      registration_fee_inr: raw.registration_fee_paid_inr || 0,
      book_details: {
        book_number: raw.book_number || 'Book 1'
      }
    };
  }

  /**
   * Normalizes raw Field Measurement Book (FMB) survey record
   */
  adaptSurvey(rawFeature) {
    if (!rawFeature) return null;
    const props = rawFeature.properties || {};
    const geom = rawFeature.geometry || null;

    return {
      department: 'Survey',
      sketch_id: props.fmb_sketch_no || `FMB-TN-${props.ulpin}`,
      parcel_number: `${props.survey_number || ''}/${props.sub_division_number || ''}`,
      surveyed_area_sqm: props.fmb_extent_sqm || 0,
      survey_date: parseTamilNaduDate(props.fmb_survey_date),
      survey_agency: props.surveying_department || 'Department of Survey and Settlement, Govt of Tamil Nadu',
      boundary_dispute: Boolean(props.boundary_dispute_flag),
      geometry: geom
    };
  }

  /**
   * Normalizes raw CMDA / DTCP Urban Development record
   */
  adaptUrban(raw) {
    if (!raw) return null;
    return {
      department: 'Urban Development',
      authority: raw.authority || 'Chennai Metropolitan Development Authority (CMDA)',
      zoning_raw: raw.master_plan_land_use || 'Primary Residential Zone',
      zoning_normalized: normalizeTamilNaduLandUse(raw.master_plan_land_use),
      building_permission_status: (raw.planning_permit_status || 'Approved').toUpperCase(),
      sanction_no: raw.pp_reference_no || null,
      violations_reported: Boolean(raw.violations_detected),
      remarks: raw.remarks || ''
    };
  }
}
