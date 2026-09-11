import { Citizen, Parcel } from '@/types';

export interface CitizenService {
  getCurrentCitizen(): Promise<Citizen>;
  getMyParcels(): Promise<Parcel[]>;
  updateProfile(updates: Partial<Citizen>): Promise<Citizen>;
}
