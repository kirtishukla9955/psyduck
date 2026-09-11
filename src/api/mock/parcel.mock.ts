import { ParcelService, ParcelSearchParams } from '../contracts/parcel.contract';
import { mockStore } from './mockStore';
import { Parcel, OwnershipVerification, DepartmentRecord, ULPIN } from '@/types';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockParcelService implements ParcelService {
  async searchParcels(params: ParcelSearchParams): Promise<Parcel[]> {
    await delay();
    let parcels = mockStore.getParcels();

    if (params.state) {
      parcels = parcels.filter((p) => p.state === params.state);
    }

    if (params.ulpin) {
      const q = params.ulpin.trim().toLowerCase();
      parcels = parcels.filter((p) => p.ulpin.toLowerCase().includes(q));
    }

    if (params.query) {
      const q = params.query.trim().toLowerCase();
      parcels = parcels.filter(
        (p) =>
          p.ulpin.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.landUseClassification.toLowerCase().includes(q)
      );
    }

    if (params.district) {
      parcels = parcels.filter((p) => p.district.toLowerCase().includes(params.district!.toLowerCase()));
    }

    return parcels;
  }

  async getParcelByUlpin(ulpin: ULPIN): Promise<Parcel | null> {
    await delay();
    return mockStore.getParcelByUlpin(ulpin);
  }

  async getOwnershipVerification(ulpin: ULPIN): Promise<OwnershipVerification | null> {
    await delay();
    return mockStore.getVerification(ulpin);
  }

  async getDepartmentRecords(ulpin: ULPIN): Promise<DepartmentRecord[]> {
    await delay();
    return mockStore.getDeptRecords(ulpin);
  }
}
