import { useAuth } from './useAuth';
import { Permission, Conflict } from '@/types';
import {
  hasPermission as checkPermission,
  canViewConflict as checkCanView,
  canActOnConflict as checkCanAct,
} from '@/config/rbac';

export const usePermission = () => {
  const { user } = useAuth();

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    return checkPermission(user.role, permission);
  };

  const canView = (conflict: Conflict): boolean => {
    if (!user) return false;
    return checkCanView(user.role, conflict);
  };

  const canAct = (
    conflict: Conflict,
    action: 'assign' | 'request_verification' | 'add_note' | 'escalate' | 'resolve' | 'reject'
  ): boolean => {
    if (!user) return false;
    return checkCanAct(user.role, conflict, action);
  };

  return {
    can,
    canView,
    canAct,
    userRole: user?.role,
    userDepartment: user?.department,
  };
};
