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

const isMockMode = (import.meta.env.VITE_DATA_MODE || 'mock') === 'mock';

// Singleton service instances
export const authService: AuthService = isMockMode ? new MockAuthService() : new HttpAuthService();
export const citizenService: CitizenService = isMockMode ? new MockCitizenService() : new HttpCitizenService();
export const parcelService: ParcelService = isMockMode ? new MockParcelService() : new HttpParcelService();
export const conflictService: ConflictService = isMockMode ? new MockConflictService() : new HttpConflictService();
export const transactionService: TransactionService = isMockMode ? new MockTransactionService() : new HttpTransactionService();
export const serviceRequestService: ServiceRequestService = isMockMode ? new MockServiceRequestService() : new HttpServiceRequestService();
export const notificationService: NotificationService = isMockMode ? new MockNotificationService() : new HttpNotificationService();
export const dashboardService: DashboardService = isMockMode ? new MockDashboardService() : new HttpDashboardService();

export const isDataModeMock = isMockMode;
