import React from 'react';
import { useMapStore } from '../store/mapStore';
import { Compass } from 'lucide-react';
import { REGIONS } from '../config/regions';

export default function StatusBar() {
  const { selectedParcel, hoveredParcelId, activeRegionKey} = useMapStore();
  const [lat, lng] = REGIONS[activeRegionKey].center;
  const coords = { lat, lng };
  
  return (
    <>
      {/* Bottom Left Readouts (Distance/Area) - Moved up slightly to not clash with leaflet controls */}
      <div className="absolute bottom-10 left-6 z-20 flex gap-4 pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3 pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Distance</span>
            <span className="text-sm font-mono font-medium">15.35 m</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="flex flex-col">
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Area</span>
            <span className="text-sm font-mono font-medium">
              {selectedParcel ? selectedParcel.properties.area_sqm : (hoveredParcelId ? 'Dynamic' : '--')} sq.m
            </span>
          </div>
        </div>
      </div>

      {/* Coordinate Readout Pill (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-4 text-xs text-white/80 font-mono shadow-lg border border-white/20 pointer-events-auto">
          <Compass className="w-4 h-4 text-accent-cyan" />
          <span>{coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E</span>
          <div className="w-px h-4 bg-white/20" />
          <span>EPSG:4326</span>
        </div>
      </div>
    </>
  );
}
