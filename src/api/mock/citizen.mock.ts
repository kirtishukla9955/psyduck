import { CitizenService } from '../contracts/citizen.contract';
import { mockStore } from './mockStore';
import { Citizen, Parcel } from '@/types';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockCitizenService implements CitizenService {
  constructor(private currentCitizenId = 'user_cit_01') {}

  setCitizenId(id: string) {
    this.currentCitizenId = id;
  }

  async getCurrentCitizen(): Promise<Citizen> {
    await delay();
    return mockStore.getCitizenById(this.currentCitizenId);
  }

  async getMyParcels(): Promise<Parcel[]> {
    await delay();
    const citizen = mockStore.getCitizenById(this.currentCitizenId);
    const allParcels = mockStore.getParcels();
    return allParcels.filter((p) => citizen.linkedParcels.includes(p.ulpin));
  }

  async updateProfile(updates: Partial<Citizen>): Promise<Citizen> {
    await delay();
    const citizen = mockStore.getCitizenById(this.currentCitizenId);
    Object.assign(citizen, updates);
    return citizen;
  }
}
