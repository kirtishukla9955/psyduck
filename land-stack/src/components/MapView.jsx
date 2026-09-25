import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, useMap, ZoomControl, ScaleControl, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../data/api';
import { useMapStore } from '../store/mapStore';
import { REGIONS } from '../config/regions';
import SatelliteLayer from './SatelliteLayer';
import * as turf from '@turf/turf';

// Helper to create text labels on the map
const createLabelIcon = (text) => divIcon({
  html: `<div style="color: rgba(255,255,255,0.9); font-weight: 700; font-size: 14px; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">${text}</div>`,
  className: 'custom-label-icon bg-transparent border-0',
  iconSize: [40, 20],
  iconAnchor: [20, 10]
});

// Component to handle programmatic map movements
function MapController({ selectedParcel }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedParcel) {
      const bbox = turf.bbox(selectedParcel);
      map.fitBounds([
        [bbox[1], bbox[0]],
        [bbox[3], bbox[2]]
      ], { padding: [50, 50], maxZoom: 19, animate: true });
    }
  }, [selectedParcel, map]);

  return null;
}

// Jumps the map to the chosen state/region whenever it changes.
// (animate: false on purpose - flying 1000+ km would download hundreds of tiles on the way)
function RegionController({ region }) {
  const map = useMap();

  useEffect(() => {
    map.setView(region.center, region.zoom, { animate: false });
  }, [region, map]);

  return null;
}

export default function MapView() {
  const [loaded, setLoaded] = useState({ key: null, data: null });
  const { 
    selectedParcel, 
    setSelectedParcel, 
    layerVisibility,
    hoveredParcelId,
    setHoveredParcelId,
    activeRegionKey,
    satelliteOpacity
  } = useMapStore();
  const region = REGIONS[activeRegionKey];

  // Reload the parcels whenever the state changes.
  // Parcels from the previous state are ignored until the new ones arrive.
  const parcels = loaded.key === activeRegionKey ? loaded.data : null;
  const parcelApiUnreachable = parcels?.error === 'API_UNREACHABLE';
  useEffect(() => {
    let cancelled = false;
    api.getParcels(activeRegionKey).then(data => {
      if (!cancelled) setLoaded({ key: activeRegionKey, data });
    });
    return () => { cancelled = true; };
  }, [activeRegionKey]);

  const getZoneColor = (zone) => {
    switch(zone) {
      case 'residential': return '#2196f3';
      case 'commercial': return '#ffc107';
      case 'agricultural': return '#4caf50';
      case 'industrial': return '#9c27b0';
      default: return '#ffffff';
    }
  };

  const styleFeature = (feature) => {
    const isSelected = selectedParcel?.properties?.ulpin === feature.properties.ulpin;
    const isHovered = hoveredParcelId === feature.properties.ulpin;
    
    return {
      fillColor: getZoneColor(feature.properties.zone),
      weight: isSelected || isHovered ? 4 : 2,
      opacity: layerVisibility.boundaries ? 1 : 0,
      color: isSelected ? '#fff' : isHovered ? '#ffeb3b' : '#ff5722',
      fillOpacity: layerVisibility.zones ? (isSelected ? 0.6 : 0.4) : 0,
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.on({
      mouseover: () => setHoveredParcelId(feature.properties.ulpin),
      mouseout: () => setHoveredParcelId(null),
      click: () => setSelectedParcel(feature)
    });
  };

  const renderUtilityLines = () => {
    if (!parcels) return null;
    
    const lines = [];
    parcels.features.forEach((feature, idx) => {
      if (idx % 3 !== 0) return;
      
      const coords = feature.geometry.coordinates[0];
      if (!coords || coords.length < 2) return;
      
      if (layerVisibility.utilities_water && feature.properties.additional_layers.utilities.includes('water')) {
         lines.push(
           <GeoJSON 
             key={`${activeRegionKey}-water-${idx}`}
             data={{type: "LineString", coordinates: [coords[0], coords[2]]}} 
             style={{ color: '#00bcd4', weight: 3, dashArray: '5, 5' }} 
           />
         );
      }
      if (layerVisibility.utilities_power && feature.properties.additional_layers.utilities.includes('power')) {
         lines.push(
           <GeoJSON 
             key={`${activeRegionKey}-power-${idx}`}
             data={{type: "LineString", coordinates: [coords[1], coords[3]]}} 
             style={{ color: '#ffeb3b', weight: 2 }} 
           />
         );
      }
    });
    return lines;
  };

  return (
    <div className="absolute inset-0 z-0 bg-navy-900">
      {parcelApiUnreachable && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-red-900/90 border border-red-500/50 text-red-100 text-xs px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
          Parcel service unreachable — showing satellite imagery only. Start the backend and refresh.
        </div>
      )}
      <MapContainer 
        center={region.center} 
        zoom={region.zoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="cursor-crosshair"
      >
        {/* Must come BEFORE the imagery layer so the map jumps to the new state first, then loads tiles there */}
        <RegionController region={region} />

        {/* Satellite imagery: base layer, sits under the parcels. Toggle + opacity come from the Layers panel. */}
        {layerVisibility.satellite && (
          <SatelliteLayer imagery={region.imagery} opacity={satelliteOpacity} />
        )}
        
        {parcels && (
          <GeoJSON 
            key={activeRegionKey}
            data={parcels} 
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
        
        {renderUtilityLines()}

        {/* Floating grid labels (defined per region in config/regions.js) */}
        {region.labels.map(label => (
          <Marker
            key={`${activeRegionKey}-${label.text}`}
            position={label.position}
            icon={createLabelIcon(label.text)}
            interactive={false}
          />
        ))}

        <MapController selectedParcel={selectedParcel} />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
      </MapContainer>
    </div>
  );
}
