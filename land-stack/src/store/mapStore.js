import { DEFAULT_REGION_KEY } from '../config/regions';
import { create } from 'zustand';

export const useMapStore = create((set) => ({
  selectedParcel: null,
  setSelectedParcel: (parcel) => set({ selectedParcel: parcel }),
  
  hoveredParcelId: null,
  setHoveredParcelId: (id) => set({ hoveredParcelId: id }),
  activeRegionKey: DEFAULT_REGION_KEY,
    setActiveRegion: (key) => set({ activeRegionKey: key, selectedParcel: null, hoveredParcelId: null }),

  satelliteOpacity: 1,
    setSatelliteOpacity: (value) => set({ satelliteOpacity: value }),
  
  layerVisibility: {
    satellite:true,
    boundaries: true,
    zones: true,
    utilities_water: true,
    utilities_sewer: true,
    utilities_power: true,
  },
  toggleLayer: (layerName) => set((state) => ({
    layerVisibility: {
      ...state.layerVisibility,
      [layerName]: !state.layerVisibility[layerName]
    }
  })),
  setLayerVisibility: (layerName, value) => set((state) => ({
    layerVisibility: {
      ...state.layerVisibility,
      [layerName]: value
    }
  })),
  
  measurement: { distance: 0, area: 0 },
  setMeasurement: (dist, area) => set({ measurement: { distance: dist, area } }),
}));
