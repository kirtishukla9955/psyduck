import { mockParcels } from './mockParcels';

export const api = {
  getParcels: async () => {
    // Simulate network delay
    return new Promise(resolve => setTimeout(() => resolve(mockParcels), 300));
  },
  
  getParcelByUlpin: async (ulpin) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const feature = mockParcels.features.find(f => f.properties.ulpin === ulpin);
        resolve(feature || null);
      }, 200);
    });
  }
};
