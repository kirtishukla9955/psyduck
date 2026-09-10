import { Role, Permission, DepartmentCode, Conflict } from '@/types';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  CITIZEN: [],
  REVENUE_OFFICER: ['conflict:view', 'conflict:assign', 'conflict:resolve'],
  REGISTRATION_OFFICER: ['conflict:view', 'conflict:assign', 'conflict:resolve'],
  SURVEY_SETTLEMENT_OFFICER: ['conflict:view', 'conflict:assign', 'conflict:resolve'],
  URBAN_DEV_OFFICER: ['conflict:view', 'conflict:assign', 'conflict:resolve'],
  DEPARTMENT_SUPERVISOR: [
    'conflict:view',
    'conflict:assign',
    'conflict:resolve',
    'conflict:escalate',
    'dashboard:decision_maker_view',
  ],
  SYSTEM_ADMIN: [
    'conflict:view',
    'conflict:assign',
    'conflict:resolve',
    'conflict:escalate',
    'dashboard:decision_maker_view',
    'admin:manage_users',
  ],
};

export const ROLE_DEPARTMENT_MAP: Partial<Record<Role, DepartmentCode>> = {
  REVENUE_OFFICER: 'REVENUE',
  REGISTRATION_OFFICER: 'REGISTRATION',
  SURVEY_SETTLEMENT_OFFICER: 'SURVEY_SETTLEMENT',
  URBAN_DEV_OFFICER: 'URBAN_DEV',
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

export const canViewConflict = (role: Role, conflict: Conflict): boolean => {
  if (role === 'DEPARTMENT_SUPERVISOR' || role === 'SYSTEM_ADMIN') {
    return true;
  }
  const dept = ROLE_DEPARTMENT_MAP[role];
  if (!dept) return false;

  // Officer can see if case is assigned to their dept or sourced from their dept
  if (conflict.assignedDepartment === dept) return true;
  if (conflict.sourceDepartments.includes(dept)) return true;

  // Survey officer can view spatial inconsistency
  if (role === 'SURVEY_SETTLEMENT_OFFICER' && conflict.conflictType === 'spatial_inconsistency') {
    return true;
  }

  // Urban dev officer can view land use inconsistency
  if (role === 'URBAN_DEV_OFFICER' && conflict.conflictType === 'land_use_inconsistency') {
    return true;
  }

  return false;
};

export const canActOnConflict = (
  role: Role,
  conflict: Conflict,
  action: 'assign' | 'request_verification' | 'add_note' | 'escalate' | 'resolve' | 'reject'
): boolean => {
  if (role === 'SYSTEM_ADMIN' || role === 'DEPARTMENT_SUPERVISOR') {
    return true;
  }

  const dept = ROLE_DEPARTMENT_MAP[role];
  if (!dept) return false;

  const isResponsibleDept =
    conflict.assignedDepartment === dept ||
    (!conflict.assignedDepartment && conflict.sourceDepartments.includes(dept));

  if (action === 'escalate') {
    // Only supervisor/admin can escalate across departments
    return false;
  }

  if (action === 'resolve' || action === 'reject') {
    return isResponsibleDept;
  }

  // Assign, request_verification, and add_note are allowed if officer can view
  return canViewConflict(role, conflict);
};
