import {
  ServiceRequestService,
  CreateServiceRequestDto,
  ServiceRequestFilterParams,
} from '../contracts/serviceRequest.contract';
import { mockStore } from './mockStore';
import { ServiceRequest } from '@/types';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockServiceRequestService implements ServiceRequestService {
  async getServiceRequests(params?: ServiceRequestFilterParams): Promise<ServiceRequest[]> {
    await delay();
    let list = mockStore.getServiceRequests();

    if (!params) return list;

    if (params.citizenId) {
      list = list.filter((sr) => sr.citizenId === params.citizenId);
    }

    if (params.parcelUlpin) {
      list = list.filter(
        (sr) => sr.parcelUlpin.toLowerCase() === params.parcelUlpin!.trim().toLowerCase()
      );
    }

    if (params.status) {
      list = list.filter((sr) => sr.status === params.status);
    }

    return list;
  }

  async getServiceRequestById(id: string): Promise<ServiceRequest | null> {
    await delay();
    return mockStore.getServiceRequestById(id);
  }

  async createServiceRequest(dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    await delay(200);
    const newRequest: ServiceRequest = {
      id: `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      citizenId: dto.citizenId,
      parcelUlpin: dto.parcelUlpin,
      category: dto.category,
      description: dto.description,
      status: 'submitted',
      assignedDepartment: 'REVENUE',
      submittedDate: new Date().toISOString(),
      timeline: [
        {
          id: `sr_evt_${Date.now()}`,
          timestamp: new Date().toISOString(),
          actorId: dto.citizenId,
          actorRole: 'CITIZEN',
          action: 'Service Request Registered',
          statusChangeTo: 'submitted',
          note: 'Request received and queued for nodal department evaluation.',
        },
      ],
    };

    return mockStore.addServiceRequest(newRequest);
  }
}
