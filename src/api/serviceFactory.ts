import { AuthService } from './contracts/auth.contract';
import { CitizenService } from './contracts/citizen.contract';
import { ParcelService } from './contracts/parcel.contract';
import { ConflictService } from './contracts/conflict.contract';
import { TransactionService } from './contracts/transaction.contract';
import { ServiceRequestService } from './contracts/serviceRequest.contract';
import { NotificationService } from './contracts/notification.contract';
import { DashboardService } from './contracts/dashboard.contract';

// Mock implementations
import { MockAuthService } from './mock/auth.mock';
import { MockCitizenService } from './mock/citizen.mock';
import { MockParcelService } from './mock/parcel.mock';
import { MockConflictService } from './mock/conflict.mock';
import { MockTransactionService } from './mock/transaction.mock';
import { MockServiceRequestService } from './mock/serviceRequest.mock';
import { MockNotificationService } from './mock/notification.mock';
import { MockDashboardService } from './mock/dashboard.mock';

// HTTP implementations
import {
  HttpAuthService,
  HttpCitizenService,
  HttpParcelService,
  HttpConflictService,
  HttpTransactionService,
  HttpServiceRequestService,
  HttpNotificationService,
  HttpDashboardService,
} from './http/httpService';

const globalMode = import.meta.env.VITE_DATA_MODE || 'mock';

function useReal(serviceName: string): boolean {
  const override = import.meta.env[`VITE_DATA_MODE_${serviceName.toUpperCase()}`];
  return (override || globalMode) === 'real';
}

// Singleton service instances
export const authService: AuthService = useReal('auth') ? new HttpAuthService() : new MockAuthService();
export const citizenService: CitizenService = useReal('citizen') ? new HttpCitizenService() : new MockCitizenService();
export const parcelService: ParcelService = useReal('parcel') ? new HttpParcelService() : new MockParcelService();
export const conflictService: ConflictService = useReal('conflict') ? new HttpConflictService() : new MockConflictService();
export const transactionService: TransactionService = useReal('transaction') ? new HttpTransactionService() : new MockTransactionService();
export const serviceRequestService: ServiceRequestService = useReal('servicerequest') ? new HttpServiceRequestService() : new MockServiceRequestService();
export const notificationService: NotificationService = useReal('notification') ? new HttpNotificationService() : new MockNotificationService();
export const dashboardService: DashboardService = useReal('dashboard') ? new HttpDashboardService() : new MockDashboardService();

export const isDataModeMock = globalMode === 'mock';