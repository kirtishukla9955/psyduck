import {
  Parcel,
  OwnershipVerification,
  DepartmentRecord,
  Conflict,
  ConflictEvidence,
  AuditEvent,
  Transaction,
  ServiceRequest,
  Notification,
  User,
  Citizen,
} from '@/types';

// Pilot Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'user_cit_01',
    name: 'Rajesh Kumar Sharma',
    role: 'CITIZEN',
    email: 'rajesh.sharma@example.in',
  },
  {
    id: 'user_cit_02',
    name: 'Meenakshi Sundaram',
    role: 'CITIZEN',
    email: 'meenakshi.s@example.in',
  },
  {
    id: 'user_rev_01',
    name: 'Sh. Anupam Verma',
    role: 'REVENUE_OFFICER',
    department: 'REVENUE',
    email: 'anupam.verma@rev.gov.in',
  },
  {
    id: 'user_reg_01',
    name: 'Smt. Deepa Nair',
    role: 'REGISTRATION_OFFICER',
    department: 'REGISTRATION',
    email: 'deepa.nair@reg.gov.in',
  },
  {
    id: 'user_sur_01',
    name: 'Er. Gurpreet Singh',
    role: 'SURVEY_SETTLEMENT_OFFICER',
    department: 'SURVEY_SETTLEMENT',
    email: 'gurpreet.singh@survey.gov.in',
  },
  {
    id: 'user_urb_01',
    name: 'Ar. K. Murugan',
    role: 'URBAN_DEV_OFFICER',
    department: 'URBAN_DEV',
    email: 'k.murugan@cmda.gov.in',
  },
  {
    id: 'user_sup_01',
    name: 'Dr. Sunita Deshmukh, IAS',
    role: 'DEPARTMENT_SUPERVISOR',
    email: 'sunita.deshmukh@landgov.in',
  },
  {
    id: 'user_adm_01',
    name: 'Vikramaditya Rathore',
    role: 'SYSTEM_ADMIN',
    email: 'admin@dharaa.gov.in',
  },
];

export const MOCK_CITIZENS: Citizen[] = [
  {
    id: 'user_cit_01',
    name: 'Rajesh Kumar Sharma',
    role: 'CITIZEN',
    email: 'rajesh.sharma@example.in',
    linkedParcels: ['CH-SEC17-0402', 'CH-SEC09-1108'],
    preferredLanguage: 'en',
  },
  {
    id: 'user_cit_02',
    name: 'Meenakshi Sundaram',
    role: 'CITIZEN',
    email: 'meenakshi.s@example.in',
    linkedParcels: ['TN-CH-09124', 'TN-MD-44021'],
    preferredLanguage: 'ta',
  },
];

// Initial Parcels
export const INITIAL_PARCELS: Parcel[] = [
  {
    ulpin: 'CH-SEC17-0402',
    state: 'CH',
    district: 'Chandigarh (UT)',
    locality: 'Sector 17-C, Commercial Zone',
    areaValue: 4.25, // Kanal-Marla in Chandigarh
    areaUnit: 'Kanal-Marla',
    landUseClassification: 'Commercial / Mixed Office',
    lastUpdated: '2026-09-02T10:30:00Z',
    dataFreshness: 'current',
    coordinates: { lat: 30.7398, lng: 76.7827 },
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [76.7820, 30.7390],
          [76.7834, 30.7392],
          [76.7832, 30.7405],
          [76.7818, 30.7403],
          [76.7820, 30.7390],
        ],
      ],
    },
    baseLayer: {
      cadastralSheetNumber: 'Sheet No. 17-C/1982',
      cadastralMapRef: 'CAD-CH-SEC17-BLK-C-402',
      surveyNumber: 'Khasra No. 142/1 (Min)',
      subDivisionNumber: 'Plot 402',
      geoBoundaryRef: 'EPSG:4326 Georeferenced Cadastral Polygon',
      centroid: { lat: 30.7398, lng: 76.7827 },
    },
    essentialLayers: {
      ror: {
        recordType: 'Record of Rights (Jamabandi)',
        khewatKhatauniOrPattaNo: 'Khewat No. 418, Khatauni No. 620',
        khasraOrSurveyNo: '142/1 (Min)',
        recordedExtent: '4 Kanal 5 Marla (approx. 2,150 sq.yd)',
        cultivationOrLandNature: 'Ghair Mumkin Dukan (Commercial Built-up)',
        recordedRevenueOrTax: '₹ 240 / annum',
      },
      registration: {
        deedNumber: 'REG/CH/2026/8841',
        deedType: 'Conveyance / Sale Deed',
        subRegistrarOffice: 'Sub-Registrar Office, Sector 17, Chandigarh',
        executionDate: '2026-08-25T15:30:00Z',
        partiesInvolved: 'Seller: Sh. Ramesh Sharma | Buyer: Smt. Anita Sharma',
        considerationAmount: '₹ 1,85,00,000',
      },
      masterPlanZoning: {
        zoneName: 'Sector 17 City Commercial Core (C-2)',
        permittedLandUse: 'Retail Commerce, Professional Offices & Banking',
        maxFarAllowed: 1.75,
        setbackRequirements: 'Front Setback 25 ft, Rear Setback 15 ft',
      },
      buildingPermissions: {
        sanctionNumber: 'EO/BP/2021/4099',
        approvedDate: '2021-06-18',
        approvingAuthority: 'Estate Office, UT Administration Chandigarh',
        constructionStatus: 'Completed & Certified (Occupancy Certificate Issued)',
      },
      encumbrance: {
        isEncumbered: false,
        certificateNumber: 'EC-CH-2026-003189',
        chargeStatus: 'Nil Encumbrance / Clean Title Verified',
      },
    },
    additionalLayers: {
      utilityInfrastructure: {
        waterSupplyConsumerId: 'MCC-WTR-17C-8821',
        powerGridConnectionId: 'CH-ELEC-402-COM',
        sewerageConnectionStatus: 'Connected & Verified (MCC)',
      },
      propertyTax: {
        propertyTaxId: 'PT-CH-2026-90412',
        lastPaidFinancialYear: 'FY 2025-26',
        taxDemandStatus: 'paid',
      },
      valuation: {
        circleRateGuidelineValue: '₹ 1,20,000 / sq. yard',
        assessedMarketValue: '₹ 2,10,00,000',
      },
      environmentalRestrictions: [
        'Chandigarh Architectural Heritage Zone B regulations apply',
        'Front 10 ft reserved for pedestrian arcade rights',
      ],
    },
    aiFlags: [
      {
        id: 'ai_flag_01',
        type: 'cross_dept_anomaly',
        label: 'Owner Name Mismatch Flag',
        description:
          'Automated NLP title comparison detected divergence between Jamabandi Titleholder (Sh. Rajesh Kumar Sharma) and Registered Deed #8841 Buyer (Smt. Anita Sharma).',
        confidence: 0.98,
        sourceLayer: 'Trust Engine Cross-Dept Matcher',
        detectedAt: '2026-08-26T08:15:00Z',
      },
      {
        id: 'ai_flag_02',
        type: 'nlp_normalized_text',
        label: 'Revenue Text Normalization',
        description:
          'Normalized legacy Urdu-Punjabi revenue notation into standardized National dharaa Schema v2.0.',
        confidence: 0.96,
        sourceLayer: 'Presenter-1 NLP Normalizer',
        detectedAt: '2026-08-10T11:00:00Z',
      },
    ],
  },
  {
    ulpin: 'CH-SEC09-1108',
    state: 'CH',
    district: 'Chandigarh (UT)',
    locality: 'Sector 9-D, Residential Area',
    areaValue: 2.0,
    areaUnit: 'Kanal-Marla',
    landUseClassification: 'Residential Low-Density',
    lastUpdated: '2026-08-15T14:20:00Z',
    dataFreshness: 'current',
    coordinates: { lat: 30.7450, lng: 76.7900 },
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [76.7890, 30.7445],
          [76.7910, 30.7446],
          [76.7908, 30.7455],
          [76.7888, 30.7454],
          [76.7890, 30.7445],
        ],
      ],
    },
    baseLayer: {
      cadastralSheetNumber: 'Sheet No. 9-D/1975',
      cadastralMapRef: 'CAD-CH-SEC09-BLK-D-1108',
      surveyNumber: 'Khasra No. 88/2',
      subDivisionNumber: 'Plot 1108',
      geoBoundaryRef: 'EPSG:4326 Georeferenced Polygon',
      centroid: { lat: 30.7450, lng: 76.7900 },
    },
    essentialLayers: {
      ror: {
        recordType: 'Record of Rights (Jamabandi)',
        khewatKhatauniOrPattaNo: 'Khewat No. 204, Khatauni No. 311',
        khasraOrSurveyNo: '88/2',
        recordedExtent: '2 Kanal 0 Marla',
        cultivationOrLandNature: 'Ghair Mumkin Kothi (Residential Bungalow)',
        recordedRevenueOrTax: '₹ 120 / annum',
      },
      registration: {
        deedNumber: 'REG/CH/2015/3412',
        deedType: 'Conveyance / Sale Deed',
        subRegistrarOffice: 'Sub-Registrar Office, Sector 17, Chandigarh',
        executionDate: '2015-11-20T11:00:00Z',
        partiesInvolved: 'Buyer: Sh. Rajesh Kumar Sharma',
        considerationAmount: '₹ 95,00,000',
      },
      masterPlanZoning: {
        zoneName: 'Residential Low Density (R-1)',
        permittedLandUse: 'Single-Family Residential',
        maxFarAllowed: 1.0,
      },
      encumbrance: {
        isEncumbered: false,
        certificateNumber: 'EC-CH-2026-001094',
        chargeStatus: 'Clean Title / Zero Encumbrances',
      },
    },
    additionalLayers: {
      utilityInfrastructure: {
        waterSupplyConsumerId: 'MCC-WTR-09D-1108',
        powerGridConnectionId: 'CH-ELEC-09D-DOM',
        sewerageConnectionStatus: 'Connected & Verified',
      },
      propertyTax: {
        propertyTaxId: 'PT-CH-2026-44109',
        lastPaidFinancialYear: 'FY 2025-26',
        taxDemandStatus: 'paid',
      },
      valuation: {
        circleRateGuidelineValue: '₹ 1,45,000 / sq. yard',
        assessedMarketValue: '₹ 3,20,00,000',
      },
    },
  },
  {
    ulpin: 'TN-CH-09124',
    state: 'TN',
    district: 'Chengalpattu',
    locality: 'Maraimalai Nagar, Survey No. 42/1B',
    areaValue: 0.85, // Hectare in Tamil Nadu
    areaUnit: 'Hectare - Are - Sq.m',
    landUseClassification: 'Agricultural / Wet Land (Nanjai)',
    lastUpdated: '2026-08-28T09:00:00Z',
    dataFreshness: 'stale',
    coordinates: { lat: 12.7875, lng: 80.0215 },
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [80.0205, 12.7865],
          [80.0225, 12.7868],
          [80.0222, 12.7885],
          [80.0202, 12.7882],
          [80.0205, 12.7865],
        ],
      ],
    },
    baseLayer: {
      fmbSketchRef: 'FMB-TN-CHG-42-1B',
      surveyNumber: 'Survey No. 42',
      subDivisionNumber: '1B',
      geoBoundaryRef: 'Tamil Nilam Geocoded Cadastral Polygon',
      centroid: { lat: 12.7875, lng: 80.0215 },
    },
    essentialLayers: {
      ror: {
        recordType: 'Patta & Chitta Extract (Tamil Nilam)',
        khewatKhatauniOrPattaNo: 'Patta No. 1408',
        khasraOrSurveyNo: '42/1B',
        recordedExtent: '0.85.0 Hectares (approx. 2.1 Acres)',
        cultivationOrLandNature: 'Nanjai (Wet / Agricultural)',
        recordedRevenueOrTax: 'Kist ₹ 45 / annum',
      },
      registration: {
        deedNumber: 'REG/TN/2019/3312',
        deedType: 'Partition Deed',
        subRegistrarOffice: 'Sub-Registrar Office, Guduvanchery, Chengalpattu',
        executionDate: '2019-02-14T11:00:00Z',
        partiesInvolved: 'Allottee: Smt. Meenakshi Sundaram',
      },
      masterPlanZoning: {
        zoneName: 'Chengalpattu Rural Agricultural Green Zone',
        permittedLandUse: 'Paddy / Agriculture / Horticulture',
        maxFarAllowed: 0.25,
      },
      encumbrance: {
        isEncumbered: true,
        certificateNumber: 'EC-TN-2026-99014',
        financialInstitution: 'Canara Bank, Maraimalai Nagar Branch',
        mortgageAmount: '₹ 15,00,000',
        chargeStatus: 'Active Kisan Credit Facility Lien',
      },
    },
    additionalLayers: {
      utilityInfrastructure: {
        powerGridConnectionId: 'TANGEDCO-AGRI-042',
        sewerageConnectionStatus: 'Open Drainage / Rural Septic',
      },
      propertyTax: {
        propertyTaxId: 'KIST-TN-2026-11408',
        lastPaidFinancialYear: 'FY 2025-26',
        taxDemandStatus: 'paid',
      },
      valuation: {
        circleRateGuidelineValue: '₹ 45,00,000 / acre',
        assessedMarketValue: '₹ 95,00,000',
      },
      environmentalRestrictions: [
        'Wetland Conservation Zone (Paddy Field Preservation Act)',
        'No non-agricultural conversion permitted without Collector approval',
      ],
    },
    aiFlags: [
      {
        id: 'ai_flag_03',
        type: 'land_use_drift',
        label: 'Satellite Land-Use Drift Alert',
        description:
          'Sentinel-2 surface reflectance change detection detected earthmoving and shed erection on land classified as Wet Agricultural (Nanjai).',
        confidence: 0.92,
        sourceLayer: 'Presenter-1 AI Satellite Change Detection',
        detectedAt: '2026-08-28T09:00:00Z',
      },
    ],
  },
  {
    ulpin: 'TN-MD-44021',
    state: 'TN',
    district: 'Madurai',
    locality: 'Melur Taluk, Survey No. 118/4',
    areaValue: 1.45,
    areaUnit: 'Hectare - Are - Sq.m',
    landUseClassification: 'Dry Land (Punjai)',
    lastUpdated: '2026-07-20T11:45:00Z',
    dataFreshness: 'current',
    coordinates: { lat: 10.0260, lng: 78.3380 },
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [78.3370, 10.0250],
          [78.3390, 10.0252],
          [78.3388, 10.0268],
          [78.3368, 10.0266],
          [78.3370, 10.0250],
        ],
      ],
    },
  },
  {
    ulpin: 'CH-IND02-0931',
    state: 'CH',
    district: 'Chandigarh (UT)',
    locality: 'Industrial Area Phase II, Plot 93',
    areaValue: 8.5,
    areaUnit: 'Kanal-Marla',
    landUseClassification: 'Industrial Manufacturing',
    lastUpdated: '2026-09-01T16:00:00Z',
    dataFreshness: 'current',
    coordinates: { lat: 30.7025, lng: 76.7995 },
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [76.7985, 30.7015],
          [76.8005, 30.7018],
          [76.8002, 30.7035],
          [76.7982, 30.7032],
          [76.7985, 30.7015],
        ],
      ],
    },
  },
  {
    ulpin: 'TN-CO-77192',
    state: 'TN',
    district: 'Coimbatore',
    locality: 'Peelamedu, Survey No. 512/3',
    areaValue: 0.32,
    areaUnit: 'Hectare - Are - Sq.m',
    landUseClassification: 'Commercial / Institutional',
    lastUpdated: '2026-08-30T10:15:00Z',
    dataFreshness: 'current',
    coordinates: { lat: 11.0285, lng: 77.0125 },
    boundaryGeoJson: {
      type: 'Polygon',
      coordinates: [
        [
          [77.0115, 11.0275],
          [77.0135, 11.0278],
          [77.0132, 11.0295],
          [77.0112, 11.0292],
          [77.0115, 11.0275],
        ],
      ],
    },
  },
];

// Ownership Verifications
export const INITIAL_VERIFICATIONS: Record<string, OwnershipVerification> = {
  'CH-SEC17-0402': {
    parcelUlpin: 'CH-SEC17-0402',
    status: 'conflict_detected',
    recordedOwner: {
      name: 'Sh. Rajesh Kumar Sharma',
      since: '2018-04-12',
      sourceDepartment: 'REVENUE',
    },
    verificationSource: 'REVENUE',
    lastVerifiedAt: '2026-09-02T10:30:00Z',
    conflictId: 'CONF-CH-2026-0042',
    summaryNote:
      'Mismatch detected: Jamabandi record reflects Sh. Rajesh Kumar Sharma, whereas Registered Sale Deed #REG/CH/2026/8841 recorded Smt. Anita Sharma as buyer.',
  },
  'CH-SEC09-1108': {
    parcelUlpin: 'CH-SEC09-1108',
    status: 'verified',
    recordedOwner: {
      name: 'Sh. Rajesh Kumar Sharma',
      since: '2015-11-20',
      sourceDepartment: 'REVENUE',
    },
    verificationSource: 'REVENUE',
    lastVerifiedAt: '2026-08-15T14:20:00Z',
    summaryNote: 'All departmental records reconciled. Zero encumbrances or title disputes found.',
  },
  'TN-CH-09124': {
    parcelUlpin: 'TN-CH-09124',
    status: 'conflict_detected',
    recordedOwner: {
      name: 'Smt. Meenakshi Sundaram',
      since: '2019-02-14',
      sourceDepartment: 'REVENUE',
    },
    verificationSource: 'REVENUE',
    lastVerifiedAt: '2026-08-28T09:00:00Z',
    conflictId: 'CONF-TN-2026-0189',
    summaryNote:
      'Mutation SLA Breached: Application for Patta subdivision #MUT-TN-2026-112 has exceeded the 30-day statutory SLA window.',
  },
  'TN-MD-44021': {
    parcelUlpin: 'TN-MD-44021',
    status: 'pending',
    recordedOwner: {
      name: 'Smt. Meenakshi Sundaram',
      since: '2023-06-10',
      sourceDepartment: 'REVENUE',
    },
    verificationSource: 'REVENUE',
    lastVerifiedAt: '2026-07-20T11:45:00Z',
    summaryNote: 'Tamil Nilam sync underway. Cadastral boundary verification scheduled with Firka Surveyor.',
  },
  'CH-IND02-0931': {
    parcelUlpin: 'CH-IND02-0931',
    status: 'conflict_detected',
    recordedOwner: {
      name: 'M/s Northern Precision Tools Ltd.',
      since: '2012-08-01',
      sourceDepartment: 'URBAN_DEV',
    },
    verificationSource: 'URBAN_DEV',
    lastVerifiedAt: '2026-09-01T16:00:00Z',
    conflictId: 'CONF-CH-2026-0095',
    summaryNote: 'Spatial Inconsistency: Cadastral Survey polygon overlaps 1.2 Marla into public utility right-of-way.',
  },
  'TN-CO-77192': {
    parcelUlpin: 'TN-CO-77192',
    status: 'conflict_detected',
    recordedOwner: {
      name: 'Thiru K. Senthil Nathan',
      since: '2021-01-18',
      sourceDepartment: 'REGISTRATION',
    },
    verificationSource: 'REGISTRATION',
    lastVerifiedAt: '2026-08-30T10:15:00Z',
    conflictId: 'CONF-TN-2026-0310',
    summaryNote: 'Land-Use Inconsistency: Master plan designates agricultural buffer, but registered deed specifies commercial IT facility.',
  },
};

// Department Records for Parcels
export const INITIAL_DEPT_RECORDS: Record<string, DepartmentRecord[]> = {
  'CH-SEC17-0402': [
    {
      department: 'REVENUE',
      fieldLabel: 'Recorded Titleholder (Jamabandi)',
      value: 'Sh. Rajesh Kumar Sharma s/o Late O.P. Sharma',
      recordedAt: '2026-08-10T11:00:00Z',
    },
    {
      department: 'REVENUE',
      fieldLabel: 'Khewat / Khatauni Number',
      value: 'Khewat No. 418, Khatauni No. 620',
      recordedAt: '2026-08-10T11:00:00Z',
    },
    {
      department: 'REGISTRATION',
      fieldLabel: 'Recent Transfer Deed Buyer',
      value: 'Smt. Anita Sharma w/o Sh. Ramesh Sharma',
      recordedAt: '2026-08-25T15:30:00Z',
    },
    {
      department: 'REGISTRATION',
      fieldLabel: 'Document Reference',
      value: 'Sale Deed No. REG/CH/2026/8841 (Book 1, Vol 412, Pgs 80-92)',
      recordedAt: '2026-08-25T15:30:00Z',
    },
    {
      department: 'SURVEY_SETTLEMENT',
      fieldLabel: 'Cadastral Boundary Extent',
      value: '4 Kanal 5 Marla (Standard Grid Polygon confirmed)',
      recordedAt: '2026-05-12T09:00:00Z',
    },
    {
      department: 'URBAN_DEV',
      fieldLabel: 'Sanctioned Site Plan & Zoning',
      value: 'Commercial Retail / Office, Zone C-2, FAR 1.75',
      recordedAt: '2026-07-04T14:10:00Z',
    },
  ],
  'TN-CH-09124': [
    {
      department: 'REVENUE',
      fieldLabel: 'Patta Record Holder (Tamil Nilam)',
      value: 'Smt. Meenakshi Sundaram',
      recordedAt: '2026-06-10T10:00:00Z',
    },
    {
      department: 'REVENUE',
      fieldLabel: 'Patta Number & Sub-division',
      value: 'Patta No. 1408, Survey 42/1B',
      recordedAt: '2026-06-10T10:00:00Z',
    },
    {
      department: 'REGISTRATION',
      fieldLabel: 'Registered Conveyance',
      value: 'Partition Deed 2019/3312, Sub-Registrar Guduvanchery',
      recordedAt: '2019-02-14T11:00:00Z',
    },
    {
      department: 'SURVEY_SETTLEMENT',
      fieldLabel: 'FMB (Field Measurement Book) Status',
      value: 'Subdivision sketch pending inspection by Firka Surveyor',
      recordedAt: '2026-07-01T12:00:00Z',
    },
  ],
};

// Conflicts
export const INITIAL_CONFLICTS: Conflict[] = [
  {
    id: 'CONF-CH-2026-0042',
    ulpin: 'CH-SEC17-0402',
    conflictType: 'owner_name_mismatch',
    sourceDepartments: ['REVENUE', 'REGISTRATION'],
    severity: 'critical',
    status: 'assigned',
    detectedDate: '2026-08-26T08:15:00Z',
    slaDeadline: '2026-09-12T17:00:00Z', // 3 days remaining
    assignedDepartment: 'REVENUE',
    assignedOfficerId: 'user_rev_01',
    assignedOfficerName: 'Sh. Anupam Verma',
    priority: 1,
    description:
      'Titleholder mismatch between Revenue Jamabandi (Rajesh Kumar Sharma) and Registration Sale Deed (Anita Sharma). Mutation on hold.',
    location: 'Sector 17-C, Chandigarh (UT)',
  },
  {
    id: 'CONF-TN-2026-0189',
    ulpin: 'TN-CH-09124',
    conflictType: 'mutation_sla_breach',
    sourceDepartments: ['REVENUE', 'SURVEY_SETTLEMENT'],
    severity: 'high',
    status: 'under_review',
    detectedDate: '2026-08-10T10:00:00Z',
    slaDeadline: '2026-09-08T18:00:00Z', // Breached yesterday!
    assignedDepartment: 'REVENUE',
    assignedOfficerId: 'user_rev_01',
    assignedOfficerName: 'Zonal Deputy Tahsildar',
    priority: 2,
    description:
      'Patta Transfer SLA breached (30-day statutory timeline exceeded). Awaiting field survey report from Firka Surveyor.',
    location: 'Maraimalai Nagar, Chengalpattu, TN',
  },
  {
    id: 'CONF-CH-2026-0095',
    ulpin: 'CH-IND02-0931',
    conflictType: 'spatial_inconsistency',
    sourceDepartments: ['SURVEY_SETTLEMENT', 'URBAN_DEV'],
    severity: 'medium',
    status: 'detected',
    detectedDate: '2026-09-01T11:00:00Z',
    slaDeadline: '2026-09-20T17:00:00Z',
    assignedDepartment: 'SURVEY_SETTLEMENT',
    assignedOfficerId: 'user_sur_01',
    assignedOfficerName: 'Er. Gurpreet Singh',
    priority: 3,
    description:
      'Cadastral Survey polygon overlaps 1.2 Marla into public utility reservation boundary delineated by Estate Office.',
    location: 'Industrial Area Phase II, Plot 93, Chandigarh',
  },
  {
    id: 'CONF-TN-2026-0310',
    ulpin: 'TN-CO-77192',
    conflictType: 'land_use_inconsistency',
    sourceDepartments: ['URBAN_DEV', 'REGISTRATION'],
    severity: 'medium',
    status: 'verification',
    detectedDate: '2026-08-20T14:30:00Z',
    slaDeadline: '2026-09-18T17:00:00Z',
    assignedDepartment: 'URBAN_DEV',
    assignedOfficerId: 'user_urb_01',
    assignedOfficerName: 'Ar. K. Murugan',
    priority: 4,
    description:
      'Master Plan classification designates Agricultural Green Buffer, while registration deed lists Commercial IT/ITES premises.',
    location: 'Peelamedu, Coimbatore, TN',
  },
  {
    id: 'CONF-CH-2026-0012',
    ulpin: 'CH-SEC22-0104',
    conflictType: 'outdated_record',
    sourceDepartments: ['REVENUE', 'REGISTRATION'],
    severity: 'low',
    status: 'resolved',
    detectedDate: '2026-08-01T09:00:00Z',
    slaDeadline: '2026-08-15T17:00:00Z',
    assignedDepartment: 'REVENUE',
    assignedOfficerId: 'user_rev_01',
    assignedOfficerName: 'Sh. Anupam Verma',
    priority: 5,
    description: 'Legacy mutation backfile not synchronized with central portal.',
    location: 'Sector 22-B, Chandigarh',
  },
];

// Conflict Evidence
export const INITIAL_EVIDENCES: Record<string, ConflictEvidence> = {
  'CONF-CH-2026-0042': {
    conflictId: 'CONF-CH-2026-0042',
    records: [
      {
        department: 'REVENUE',
        fieldLabel: 'Recorded Owner in Jamabandi (RoR)',
        value: 'Sh. Rajesh Kumar Sharma s/o Late O.P. Sharma',
        recordedAt: '2026-08-10T11:00:00Z',
      },
      {
        department: 'REGISTRATION',
        fieldLabel: 'Buyer Recorded in Registered Sale Deed',
        value: 'Smt. Anita Sharma w/o Sh. Ramesh Sharma',
        recordedAt: '2026-08-25T15:30:00Z',
      },
      {
        department: 'REGISTRATION',
        fieldLabel: 'Registered Document Index',
        value: 'Deed #REG/CH/2026/8841 (SR Office Chandigarh)',
        recordedAt: '2026-08-25T15:30:00Z',
      },
      {
        department: 'SURVEY_SETTLEMENT',
        fieldLabel: 'Cadastral Lot Demarcation',
        value: 'Lot 402, Block C, Sector 17 (4.25 Kanal intact)',
        recordedAt: '2026-05-12T09:00:00Z',
      },
      {
        department: 'URBAN_DEV',
        fieldLabel: 'Master Plan Zoning & Sanction',
        value: 'Zone C-2 Commercial Retail, Sanction #EO/BP/2021/4099',
        recordedAt: '2026-07-04T14:10:00Z',
      },
    ],
    discrepancySummary:
      'The Department of Revenue Jamabandi lists Sh. Rajesh Kumar Sharma as the sole titleholder. However, on 25-Aug-2026, a registered sale deed was executed naming Smt. Anita Sharma without a corresponding mutation entry or prior clearance of inheritance title in Revenue records.',
    aiFlags: [
      {
        id: 'ai_ev_01',
        type: 'cross_dept_anomaly',
        label: 'High Confidence Owner Name Mismatch',
        description:
          'Trust Engine cross-departmental correlation flagged 98% certainty of titleholder divergence between Jamabandi and Sub-Registrar deed #8841.',
        confidence: 0.98,
        sourceLayer: 'Revenue-Registration Trust Engine Layer',
        detectedAt: '2026-08-26T08:15:00Z',
      },
      {
        id: 'ai_ev_02',
        type: 'nlp_normalized_text',
        label: 'OCR/NLP Entity Normalization Match',
        description:
          'Scanned deed text normalized against Jamabandi Hindi/Urdu record confirmed party identity discrepancy.',
        confidence: 0.95,
        sourceLayer: 'Presenter-1 NLP Normalizer',
        detectedAt: '2026-08-26T08:16:00Z',
      },
    ],
  },
  'CONF-TN-2026-0189': {
    conflictId: 'CONF-TN-2026-0189',
    records: [
      {
        department: 'REVENUE',
        fieldLabel: 'Tamil Nilam Mutation Application Date',
        value: '09-Jul-2026 (Application #MUT-TN-2026-112)',
        recordedAt: '2026-07-09T09:30:00Z',
      },
      {
        department: 'SURVEY_SETTLEMENT',
        fieldLabel: 'FMB Field Measurement Inspection',
        value: 'Inspection scheduled but not filed by Firka Surveyor',
        recordedAt: '2026-07-25T10:00:00Z',
      },
    ],
    discrepancySummary:
      'The 30-day Citizen Service Delivery Guarantee SLA expired on 08-Sep-2026 without finalization of subdivision boundaries.',
    aiFlags: [
      {
        id: 'ai_ev_03',
        type: 'land_use_drift',
        label: 'Satellite Change Detection Flag',
        description:
          'Sentinel-2 spectral drift indicates non-agricultural clearing on parcel registered as Nanjai (wetland).',
        confidence: 0.91,
        sourceLayer: 'Presenter-1 AI Satellite Change-Detection Pipeline',
        detectedAt: '2026-08-28T09:00:00Z',
      },
    ],
  },
};

// Audit Trails
export const INITIAL_AUDIT_TRAILS: Record<string, AuditEvent[]> = {
  'CONF-CH-2026-0042': [
    {
      id: 'evt_01',
      timestamp: '2026-08-26T08:15:00Z',
      actorId: 'system_trust_engine',
      actorRole: 'Land Trust Engine v2.0',
      action: 'Conflict Auto-Detected',
      statusChangeTo: 'detected',
      note: 'Cross-departmental mismatch flagged between Revenue Jamabandi and Registration Deed #REG/CH/2026/8841.',
    },
    {
      id: 'evt_02',
      timestamp: '2026-08-27T11:00:00Z',
      actorId: 'user_sup_01',
      actorRole: 'DEPARTMENT_SUPERVISOR',
      department: 'REVENUE',
      action: 'Case Assigned',
      statusChangeFrom: 'detected',
      statusChangeTo: 'assigned',
      note: 'Assigned to Tehsildar (Revenue Officer) Sh. Anupam Verma for initial record reconciliation.',
    },
    {
      id: 'evt_03',
      timestamp: '2026-08-29T14:30:00Z',
      actorId: 'user_rev_01',
      actorRole: 'REVENUE_OFFICER',
      department: 'REVENUE',
      action: 'Verification Requested',
      statusChangeFrom: 'assigned',
      statusChangeTo: 'under_review',
      note: 'Sub-Registrar Office requested to provide certified copy of registered deed #8841 and identity proofs.',
    },
  ],
};

// Transactions
export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX-CH-2026-089',
    parcelUlpin: 'CH-SEC17-0402',
    type: 'mutation',
    submittedDate: '2026-08-26T10:00:00Z',
    currentDepartment: 'REVENUE',
    currentStage: 'Under Cross-Departmental Verification',
    slaDueDate: '2026-09-15T17:00:00Z',
    status: 'action_required',
    notes: 'Blocked due to pending owner mismatch conflict (CONF-CH-2026-0042).',
    applicantName: 'Smt. Anita Sharma',
    history: [
      {
        id: 'tx_h1',
        timestamp: '2026-08-26T10:00:00Z',
        actorId: 'user_cit_01',
        actorRole: 'CITIZEN',
        action: 'Mutation Application Submitted',
        statusChangeTo: 'submitted',
        note: 'Online mutation application registered post sale deed registration.',
      },
      {
        id: 'tx_h2',
        timestamp: '2026-08-27T12:00:00Z',
        actorId: 'user_rev_01',
        actorRole: 'REVENUE_OFFICER',
        department: 'REVENUE',
        action: 'Trust Engine Alert Flagged',
        statusChangeFrom: 'submitted',
        statusChangeTo: 'action_required',
        note: 'Engine detected conflict with current recorded owner in Jamabandi.',
      },
    ],
  },
  {
    id: 'TX-CH-2026-044',
    parcelUlpin: 'CH-SEC09-1108',
    type: 'registration_update',
    submittedDate: '2026-07-10T11:00:00Z',
    currentDepartment: 'REGISTRATION',
    currentStage: 'Completed & Certified',
    slaDueDate: '2026-07-25T17:00:00Z',
    status: 'resolved',
    notes: 'Address update and e-KYC deed endorsement completed.',
    applicantName: 'Sh. Rajesh Kumar Sharma',
    history: [
      {
        id: 'tx_h3',
        timestamp: '2026-07-10T11:00:00Z',
        actorId: 'user_cit_01',
        actorRole: 'CITIZEN',
        action: 'Application Submitted',
        statusChangeTo: 'submitted',
      },
      {
        id: 'tx_h4',
        timestamp: '2026-07-18T16:00:00Z',
        actorId: 'user_reg_01',
        actorRole: 'REGISTRATION_OFFICER',
        action: 'Deed Endorsed',
        statusChangeFrom: 'submitted',
        statusChangeTo: 'resolved',
      },
    ],
  },
  {
    id: 'TX-TN-2026-112',
    parcelUlpin: 'TN-CH-09124',
    type: 'mutation',
    submittedDate: '2026-07-09T09:30:00Z',
    currentDepartment: 'REVENUE',
    currentStage: 'Field Demarcation SLA Overdue',
    slaDueDate: '2026-08-08T17:00:00Z',
    status: 'in_review',
    notes: 'Application overdue. Escalated to Sub-Collector Chengalpattu.',
    applicantName: 'Smt. Meenakshi Sundaram',
    history: [
      {
        id: 'tx_h5',
        timestamp: '2026-07-09T09:30:00Z',
        actorId: 'user_cit_02',
        actorRole: 'CITIZEN',
        action: 'Patta Transfer Submitted',
        statusChangeTo: 'submitted',
      },
      {
        id: 'tx_h6',
        timestamp: '2026-08-09T09:00:00Z',
        actorId: 'system_trust_engine',
        actorRole: 'Land Trust Engine',
        action: 'SLA Breach Auto-Escalation',
        statusChangeFrom: 'submitted',
        statusChangeTo: 'in_review',
        note: 'SLA deadline of 30 days exceeded without surveyor submission.',
      },
    ],
  },
];

// Service Requests
export const INITIAL_SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: 'SR-2026-0081',
    citizenId: 'user_cit_01',
    parcelUlpin: 'CH-SEC17-0402',
    category: 'ownership_clarification',
    description: 'Inquiry regarding mismatch notice received for Sector 17 commercial parcel.',
    status: 'in_progress',
    assignedDepartment: 'REVENUE',
    submittedDate: '2026-08-28T14:00:00Z',
    timeline: [
      {
        id: 'sr_t1',
        timestamp: '2026-08-28T14:00:00Z',
        actorId: 'user_cit_01',
        actorRole: 'CITIZEN',
        action: 'Request Registered',
        statusChangeTo: 'submitted',
      },
      {
        id: 'sr_t2',
        timestamp: '2026-08-29T10:00:00Z',
        actorId: 'user_rev_01',
        actorRole: 'REVENUE_OFFICER',
        action: 'Linked to Active Conflict Investigation',
        statusChangeFrom: 'submitted',
        statusChangeTo: 'in_progress',
        note: 'Request mapped to conflict case CONF-CH-2026-0042.',
      },
    ],
  },
  {
    id: 'SR-2026-0045',
    citizenId: 'user_cit_01',
    parcelUlpin: 'CH-SEC09-1108',
    category: 'fard_issuance',
    description: 'Certified copy of digital Fard (Record of Rights extract) for bank loan verification.',
    status: 'resolved',
    assignedDepartment: 'REVENUE',
    submittedDate: '2026-08-10T09:00:00Z',
    timeline: [
      {
        id: 'sr_t3',
        timestamp: '2026-08-10T09:00:00Z',
        actorId: 'user_cit_01',
        actorRole: 'CITIZEN',
        action: 'Application Submitted',
        statusChangeTo: 'submitted',
      },
      {
        id: 'sr_t4',
        timestamp: '2026-08-11T16:00:00Z',
        actorId: 'user_rev_01',
        actorRole: 'REVENUE_OFFICER',
        action: 'Digital Fard Generated & Signed',
        statusChangeFrom: 'submitted',
        statusChangeTo: 'resolved',
      },
    ],
  },
];

// Notifications
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_01',
    userId: 'user_cit_01',
    type: 'conflict',
    message: 'Conflict alert flagged for parcel CH-SEC17-0402: Owner name mismatch detected.',
    relatedUlpin: 'CH-SEC17-0402',
    createdAt: '2026-08-26T08:30:00Z',
    read: false,
    link: '/citizen/parcels/CH-SEC17-0402/verification',
  },
  {
    id: 'notif_02',
    userId: 'user_cit_01',
    type: 'transaction',
    message: 'Mutation #TX-CH-2026-089 requires your attention. Verification in progress.',
    relatedUlpin: 'CH-SEC17-0402',
    createdAt: '2026-08-27T12:30:00Z',
    read: false,
    link: '/citizen/transactions/TX-CH-2026-089',
  },
  {
    id: 'notif_03',
    userId: 'user_cit_01',
    type: 'verification',
    message: 'Parcel CH-SEC09-1108 title and cadastral boundaries successfully re-verified.',
    relatedUlpin: 'CH-SEC09-1108',
    createdAt: '2026-08-15T14:30:00Z',
    read: true,
    link: '/citizen/parcels/CH-SEC09-1108',
  },
];
