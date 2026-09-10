import { ServiceRequest, ULPIN } from '@/types';

export interface CreateServiceRequestDto {
  citizenId: string;
  parcelUlpin: ULPIN;
  category: string;
  description: string;
}

export interface ServiceRequestFilterParams {
  citizenId?: string;
  parcelUlpin?: ULPIN;
  status?: string;
}

export interface ServiceRequestService {
  getServiceRequests(params?: ServiceRequestFilterParams): Promise<ServiceRequest[]>;
  getServiceRequestById(id: string): Promise<ServiceRequest | null>;
  createServiceRequest(dto: CreateServiceRequestDto): Promise<ServiceRequest>;
}
