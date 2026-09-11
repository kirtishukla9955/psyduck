import { StateConfiguration } from '@/types';

export const tamilNaduConfig: StateConfiguration = {
  code: 'TN',
  displayName: 'Tamil Nadu',
  departmentLabels: {
    REVENUE: 'Revenue and Disaster Management Department, Govt of Tamil Nadu',
    REGISTRATION: 'Commercial Taxes and Registration Department',
    SURVEY_SETTLEMENT: 'Directorate of Survey and Settlement (Tamil Nilam)',
    URBAN_DEV: 'Chennai Metropolitan Development Authority (CMDA) / DTCP',
  },
  rorTerm: 'Patta & Chitta Extract',
  areaUnit: 'Hectare - Are - Sq.m',
  areaUnitMultiplierToSqMeters: 10000, // 1 Hectare = 10,000 sq meters
  supportedLanguages: ['en', 'ta'],
  enabledCitizenServices: [
    'patta_transfer',
    'chitta_extract',
    'fmb_sketch_download',
    'encumbrance_certificate',
    'sub_division_request',
  ],
  workflowStageLabels: {
    detected: 'Trust Engine Alert Generated',
    assigned: 'Assigned to VAO / Zonal Deputy Tahsildar',
    under_review: 'Tamil Nilam & Star 2.0 Reconciliation',
    verification: 'Field Survey by Firka Surveyor',
    decision: 'Tahsildar / RDO Hearing',
    resolved: 'Patta Corrected & Registered in Tamil Nilam',
    rejected: 'Clarification Provided / Discarded',
  },
  districts: [
    'Chennai',
    'Chengalpattu',
    'Coimbatore',
    'Madurai',
    'Kancheepuram',
    'Tiruvallur',
    'Salem',
  ],
};
