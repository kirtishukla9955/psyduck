import { ApiError } from '../contracts/common';
import { AuthService, LoginRequest, AuthSessionResponse } from '../contracts/auth.contract';
import { CitizenService } from '../contracts/citizen.contract';
import { ParcelService, ParcelSearchParams } from '../contracts/parcel.contract';
import {
  ConflictService,
  ConflictFilterParams,
  ConflictActionRequest,
  ConflictActionResult,
} from '../contracts/conflict.contract';
import { TransactionService, TransactionFilterParams } from '../contracts/transaction.contract';
import {
  ServiceRequestService,
  CreateServiceRequestDto,
  ServiceRequestFilterParams,
} from '../contracts/serviceRequest.contract';
import { NotificationService } from '../contracts/notification.contract';
import { DashboardService, DepartmentWorkload, DecisionMakerAnalytics } from '../contracts/dashboard.contract';
import {
  Citizen,
  Parcel,
  OwnershipVerification,
  DepartmentRecord,
  Conflict,
  ConflictEvidence,
  AuditEvent,
  Transaction,
  ServiceRequest,
  Notification,
  DashboardMetric,
  User,
  ULPIN,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('land_stack_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errPayload = { code: 'HTTP_ERROR', message: `Server error: ${response.statusText}` };
    try {
      const json = await response.json();
      if (json.error) errPayload = json.error;
    } catch {
      // ignore
    }
    throw new ApiError(errPayload);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export class HttpAuthService implements AuthService {
  login(req: LoginRequest): Promise<AuthSessionResponse> {
    return request<AuthSessionResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
  logout(): Promise<void> {
    return request<void>('/auth/logout', { method: 'POST' });
  }
  getSession(): Promise<User | null> {
    return request<User>('/auth/session');
  }
}

export class HttpCitizenService implements CitizenService {
  getCurrentCitizen(): Promise<Citizen> {
    return request<Citizen>('/citizens/me');
  }
  getMyParcels(): Promise<Parcel[]> {
    return request<Parcel[]>('/citizens/me/parcels');
  }
  updateProfile(updates: Partial<Citizen>): Promise<Citizen> {
    return request<Citizen>('/citizens/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
}
function mapBackendParcelToFrontend(raw: any): Parcel {
  return {
    ulpin: raw.ulpin,
    state: raw.state,
    district: raw.village_or_city || '',
    locality: raw.village_or_city || '',
    areaValue: raw.area_sqm ?? 0,
    areaUnit: 'sqm',
    landUseClassification: raw.land_use || '',
    boundaryGeoJson: raw.geometry,
    lastUpdated: new Date().toISOString(),
    dataFreshness: 'current',
  };
}

export class HttpParcelService implements ParcelService {
  searchParcels(params: ParcelSearchParams): Promise<Parcel[]> {
    const query = params.query || params.ulpin;
    // Real backend has no /parcels/search route — it only supports
    // GET /parcels/{ulpin} for an exact ULPIN, or GET /parcels?owner_name=... for a name search.
    if (query && /^\d{14}$/.test(query)) {
      return this.getParcelByUlpin(query).then((p) => (p ? [p] : []));
    }
    const q = new URLSearchParams();
    if (query) q.set('owner_name', query);
    if (params.state) q.set('state', params.state);
    return request<any[]>(`/parcels?${q.toString()}`).then((list) => list.map(mapBackendParcelToFrontend));  }
  

  getParcelByUlpin(ulpin: ULPIN): Promise<Parcel | null> {
    return request<any>(`/parcels/${encodeURIComponent(ulpin)}`).then(mapBackendParcelToFrontend);
  }
  getOwnershipVerification(ulpin: ULPIN): Promise<OwnershipVerification | null> {
    return request<OwnershipVerification>(`/parcels/${encodeURIComponent(ulpin)}/ownership-verification`);
  }
  getDepartmentRecords(ulpin: ULPIN): Promise<DepartmentRecord[]> {
    return request<DepartmentRecord[]>(`/parcels/${encodeURIComponent(ulpin)}/department-records`);
  }
}

export class HttpConflictService implements ConflictService {
  getConflicts(params?: ConflictFilterParams): Promise<Conflict[]> {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'all') q.set(k, String(v));
      });
    }
    return request<Conflict[]>(`/conflicts?${q.toString()}`);
  }
  getConflictById(id: string): Promise<Conflict | null> {
    return request<Conflict>(`/conflicts/${encodeURIComponent(id)}`);
  }
  getConflictEvidence(id: string): Promise<ConflictEvidence | null> {
    return request<ConflictEvidence>(`/conflicts/${encodeURIComponent(id)}/evidence`);
  }
  getAuditTrail(id: string): Promise<AuditEvent[]> {
    return request<AuditEvent[]>(`/conflicts/${encodeURIComponent(id)}/audit-trail`);
  }
  performAction(id: string, req: ConflictActionRequest): Promise<ConflictActionResult> {
    return request<ConflictActionResult>(`/conflicts/${encodeURIComponent(id)}/actions`, {
      method: 'POST',
      body: JSON.stringify(req),
    });
  }
}

export class HttpTransactionService implements TransactionService {
  getTransactions(params?: TransactionFilterParams): Promise<Transaction[]> {
    const q = new URLSearchParams();
    if (params?.citizenId) q.set('citizenId', params.citizenId);
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    return request<Transaction[]>(`/transactions?${q.toString()}`);
  }
  getTransactionById(id: string): Promise<Transaction | null> {
    return request<Transaction>(`/transactions/${encodeURIComponent(id)}`);
  }
}

export class HttpServiceRequestService implements ServiceRequestService {
  getServiceRequests(params?: ServiceRequestFilterParams): Promise<ServiceRequest[]> {
    const q = new URLSearchParams();
    if (params?.citizenId) q.set('citizenId', params.citizenId);
    return request<ServiceRequest[]>(`/service-requests?${q.toString()}`);
  }
  getServiceRequestById(id: string): Promise<ServiceRequest | null> {
    return request<ServiceRequest>(`/service-requests/${encodeURIComponent(id)}`);
  }
  createServiceRequest(dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    return request<ServiceRequest>('/service-requests', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }
}

export class HttpNotificationService implements NotificationService {
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const q = new URLSearchParams({ userId });
    if (unreadOnly) q.set('unreadOnly', 'true');
    return request<Notification[]>(`/notifications?${q.toString()}`);
  }
  markAsRead(id: string): Promise<Notification> {
    return request<Notification>(`/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
    });
  }
  markAllAsRead(userId: string): Promise<void> {
    return request<void>(`/notifications/read-all`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
}

export class HttpDashboardService implements DashboardService {
  getMetrics(params?: { role?: any; department?: any }): Promise<DashboardMetric[]> {
    const q = new URLSearchParams();
    if (params?.role) q.set('role', params.role);
    if (params?.department) q.set('department', params.department);
    return request<DashboardMetric[]>(`/dashboard/metrics?${q.toString()}`);
  }
  getDepartmentWorkloads(): Promise<DepartmentWorkload[]> {
    return request<DepartmentWorkload[]>('/dashboard/department-workload');
  }
  getDecisionMakerAnalytics(): Promise<DecisionMakerAnalytics> {
    return request<DecisionMakerAnalytics>('/dashboard/analytics');
  }
}
