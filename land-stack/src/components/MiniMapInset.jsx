import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MiniMapInset() {
  return (
    <div className="absolute bottom-6 right-6 w-[300px] h-[180px] glass-panel rounded-lg overflow-hidden border border-white/20 z-20 shadow-2xl p-1 pointer-events-auto">
      <div className="w-full h-full rounded bg-navy-900 overflow-hidden relative">
        <MapContainer 
          center={[30.7335, 76.7725]} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </MapContainer>
        
        {/* Viewport Highlight (Fake representation of main viewport) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-8 border-2 border-accent-cyan bg-accent-cyan/20 shadow-[0_0_10px_rgba(0,188,212,0.5)] z-[400] pointer-events-none" />
      </div>
    </div>
  );
}
