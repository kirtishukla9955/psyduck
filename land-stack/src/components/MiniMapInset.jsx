import React, { useEffect } from 'react';
import { MapContainer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '../store/mapStore';
import { REGIONS } from '../config/regions';
import SatelliteLayer from './SatelliteLayer';

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [center, map]);
  return null;
}

export default function MiniMapInset() {
  const region = REGIONS[useMapStore((s) => s.activeRegionKey)];
  return (
    <div className="absolute bottom-6 right-6 w-[300px] h-[180px] glass-panel rounded-lg overflow-hidden border border-white/20 z-20 shadow-2xl p-1 pointer-events-auto">
      <div className="w-full h-full rounded bg-navy-900 overflow-hidden relative">
        <MapContainer center={region.center} zoom={14} style={{ height: '100%', width: '100%' }}
          zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} attributionControl={false}>
          <SatelliteLayer imagery={region.imagery} />
          <Recenter center={region.center} />
        </MapContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-8 border-2 border-accent-cyan bg-accent-cyan/20 shadow-[0_0_10px_rgba(0,188,212,0.5)] z-[400] pointer-events-none" />
      </div>
    </div>
  );
}