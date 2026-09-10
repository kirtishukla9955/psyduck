import { Parcel, OwnershipVerification, DepartmentRecord, ULPIN, StateCode } from '@/types';

export interface ParcelSearchParams {
  query?: string;
  ulpin?: string;
  state?: StateCode;
  district?: string;
  locality?: string;
}

export interface ParcelService {
  searchParcels(params: ParcelSearchParams): Promise<Parcel[]>;
  getParcelByUlpin(ulpin: ULPIN): Promise<Parcel | null>;
  getOwnershipVerification(ulpin: ULPIN): Promise<OwnershipVerification | null>;
  getDepartmentRecords(ulpin: ULPIN): Promise<DepartmentRecord[]>;
}
