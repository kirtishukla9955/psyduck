import type { Geometry } from 'geojson';

// Core Data Models as specified in Land Stack Spec Section 15

export type ULPIN = string;

// Helper to check valid ULPIN pattern e.g., CH-SEC17-0402 or TN-CH-09124
export const ULPIN_REGEX = /^[A-Z]{2}-[A-Z0-9]{2,8}-[0-9]{4,6}$/;
export const isValidULPIN = (ulpin: string): boolean => ULPIN_REGEX.test(ulpin.trim());

export type StateCode = "CH" | "TN";

export type DepartmentCode = "REVENUE" | "REGISTRATION" | "SURVEY_SETTLEMENT" | "URBAN_DEV";

export interface AIFlag {
  id: string;
  type: 'land_use_drift' | 'cross_dept_anomaly' | 'spatial_inconsistency' | 'nlp_normalized_text' | string;
  label: string;
  description: string;
  confidence?: number;
  sourceLayer: string;
  detectedAt: string;
}

export interface ParcelBaseLayer {
  cadastralSheetNumber?: string;
  cadastralMapRef?: string;
  fmbSketchRef?: string;
  surveyNumber?: string;
  subDivisionNumber?: string;
  geoBoundaryRef?: string;
  centroid?: { lat: number; lng: number };
}

export interface ParcelEssentialLayers {
  ror?: {
    recordType: string; // e.g., "Record of Rights (Jamabandi)" or "Patta & Chitta"
    khewatKhatauniOrPattaNo: string;
    khasraOrSurveyNo: string;
    recordedExtent: string;
    cultivationOrLandNature: string;
    recordedRevenueOrTax?: string;
  };
  registration?: {
    deedNumber: string;
    deedType: string;
    subRegistrarOffice: string;
    executionDate: string;
    partiesInvolved: string;
    considerationAmount?: string;
  };
  masterPlanZoning?: {
    zoneName: string;
    permittedLandUse: string;
    maxFarAllowed: number;
    setbackRequirements?: string;
  };
  buildingPermissions?: {
    sanctionNumber?: string;
    approvedDate?: string;
    approvingAuthority?: string;
    constructionStatus?: string;
  };
  encumbrance?: {
    isEncumbered: boolean;
    certificateNumber?: string;
    financialInstitution?: string;
    mortgageAmount?: string;
    chargeStatus?: string;
  };
}

export interface ParcelAdditionalLayers {
  utilityInfrastructure?: {
    waterSupplyConsumerId?: string;
    powerGridConnectionId?: string;
    sewerageConnectionStatus?: string;
  };
  propertyTax?: {
    propertyTaxId?: string;
    lastPaidFinancialYear?: string;
    taxDemandStatus?: 'paid' | 'due' | 'exempted';
  };
  valuation?: {
    circleRateGuidelineValue?: string;
    assessedMarketValue?: string;
  };
  environmentalRestrictions?: string[];
}

export interface Owner {
  name: string;
  since?: string;
  sourceDepartment: DepartmentCode;
}

export type OwnershipVerificationStatus =
  | "verified"
  | "pending"
  | "conflict_detected"
  | "unavailable";

export interface OwnershipVerification {
  parcelUlpin: ULPIN;
  status: OwnershipVerificationStatus;
  recordedOwner: Owner;
  verificationSource: DepartmentCode;
  lastVerifiedAt?: string;
  conflictId?: string;
  summaryNote?: string;
}

export interface Parcel {
  ulpin: ULPIN;
  state: StateCode;
  district: string;
  locality: string;
  areaValue: number;
  areaUnit: string; // from StateConfiguration
  landUseClassification: string;
  boundaryGeoJson?: Geometry;
  lastUpdated: string; // ISO date
  dataFreshness: "current" | "stale" | "unknown";
  coordinates?: { lat: number; lng: number };
  baseLayer?: ParcelBaseLayer;
  essentialLayers?: ParcelEssentialLayers;
  additionalLayers?: ParcelAdditionalLayers;
  aiFlags?: AIFlag[];
}

export type ParcelDetails = Parcel;

export interface DepartmentRecord {
  department: DepartmentCode;
  fieldLabel: string;
  value: string;
  recordedAt: string;
}

export type TransactionStatus =
  | "submitted"
  | "in_review"
  | "action_required"
  | "resolved"
  | "rejected";

export interface Transaction {
  id: string;
  parcelUlpin: ULPIN;
  type: "mutation" | "registration_update" | "other";
  submittedDate: string;
  currentDepartment: DepartmentCode;
  currentStage: string;
  slaDueDate: string;
  status: TransactionStatus;
  history: AuditEvent[];
  applicantName?: string;
  notes?: string;
}

export type ConflictType =
  | "owner_name_mismatch"
  | "mutation_sla_breach"
  | "outdated_record"
  | "spatial_inconsistency"
  | "cross_department_mismatch"
  | "land_use_inconsistency";

export type ConflictSeverity = "low" | "medium" | "high" | "critical";

export type ConflictStatus =
  | "detected"
  | "assigned"
  | "under_review"
  | "verification"
  | "decision"
  | "resolved"
  | "rejected";

export interface Conflict {
  id: string;
  ulpin: ULPIN;
  conflictType: ConflictType;
  sourceDepartments: DepartmentCode[];
  severity: ConflictSeverity;
  status: ConflictStatus;
  detectedDate: string;
  slaDeadline: string;
  assignedDepartment?: DepartmentCode;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  priority: number;
  description?: string;
  location?: string;
}

export interface ConflictEvidence {
  conflictId: string;
  records: DepartmentRecord[];
  discrepancySummary: string;
  aiFlags?: AIFlag[];
  departmentalBreakdown?: Partial<Record<DepartmentCode, DepartmentRecord[]>>;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  department?: DepartmentCode;
  action: string;
  statusChangeFrom?: string;
  statusChangeTo?: string;
  note?: string;
}

export interface ConflictResolution {
  conflictId: string;
  action: "assign" | "request_verification" | "add_note" | "escalate" | "resolve" | "reject";
  actorId: string;
  note?: string;
  timestamp: string;
}

export interface ServiceRequest {
  id: string;
  citizenId: string;
  parcelUlpin: ULPIN;
  category: string;
  description: string;
  status: "submitted" | "in_progress" | "resolved" | "closed";
  assignedDepartment?: DepartmentCode;
  submittedDate: string;
  timeline: AuditEvent[];
}

export interface Notification {
  id: string;
  userId: string;
  type: "verification" | "transaction" | "sla" | "service_request" | "conflict" | "reminder";
  message: string;
  relatedUlpin?: ULPIN;
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface DashboardMetric {
  key: string;
  label: string;
  value: number;
  trend?: { direction: "up" | "down" | "flat"; changePct: number };
}

export type Role =
  | "CITIZEN"
  | "REVENUE_OFFICER"
  | "REGISTRATION_OFFICER"
  | "SURVEY_SETTLEMENT_OFFICER"
  | "URBAN_DEV_OFFICER"
  | "DEPARTMENT_SUPERVISOR"
  | "SYSTEM_ADMIN";

export type Permission =
  | "conflict:view"
  | "conflict:assign"
  | "conflict:resolve"
  | "conflict:escalate"
  | "dashboard:decision_maker_view"
  | "admin:manage_users";

export interface User {
  id: string;
  name: string;
  role: Role;
  department?: DepartmentCode;
  email?: string;
}

export interface Citizen extends User {
  role: "CITIZEN";
  linkedParcels: ULPIN[];
  preferredLanguage: "en" | "hi" | "ta";
}

export interface StateConfiguration {
  code: StateCode;
  displayName: string;
  departmentLabels: Record<DepartmentCode, string>;
  rorTerm: string; // e.g. "Record of Rights" / "Patta & Chitta"
  areaUnit: string;
  areaUnitMultiplierToSqMeters: number;
  supportedLanguages: ("en" | "hi" | "ta")[];
  enabledCitizenServices: string[];
  workflowStageLabels: Record<ConflictStatus, string>;
  districts: string[];
}
