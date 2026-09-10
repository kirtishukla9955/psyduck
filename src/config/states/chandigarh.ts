import { StateConfiguration } from '@/types';

export const chandigarhConfig: StateConfiguration = {
  code: 'CH',
  displayName: 'Chandigarh (UT)',
  departmentLabels: {
    REVENUE: 'Department of Revenue & Land Records, UT Chandigarh',
    REGISTRATION: 'Sub-Registrar Office, Chandigarh',
    SURVEY_SETTLEMENT: 'Directorate of Land Settlement & Cadastral Mapping',
    URBAN_DEV: 'Chandigarh Estate Office & Urban Development',
  },
  rorTerm: 'Record of Rights (Jamabandi)',
  areaUnit: 'Kanal-Marla',
  areaUnitMultiplierToSqMeters: 505.857, // 1 Kanal ~ 505.86 sq meters
  supportedLanguages: ['en', 'hi'],
  enabledCitizenServices: [
    'mutation_request',
    'fard_issuance',
    'demarcation_request',
    'encumbrance_certificate',
    'grievance_redressal',
  ],
  workflowStageLabels: {
    detected: 'Detected by Engine',
    assigned: 'Assigned to Tehsildar / Officer',
    under_review: 'Verification of Records',
    verification: 'Field Demarcation / In-Person Inquiry',
    decision: 'Sub-Divisional Magistrate / Tehsildar Review',
    resolved: 'Record Reconciled & Order Issued',
    rejected: 'Case Dismissed / Clarified',
  },
  districts: ['Chandigarh (UT)'],
};
