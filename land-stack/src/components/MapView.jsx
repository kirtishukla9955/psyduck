import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl, ScaleControl, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../data/api';
import { useMapStore } from '../store/mapStore';
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

export default function MapView() {
  const [parcels, setParcels] = useState(null);
  const { 
    selectedParcel, 
    setSelectedParcel, 
    layerVisibility,
    hoveredParcelId,
    setHoveredParcelId 
  } = useMapStore();

  useEffect(() => {
    api.getParcels().then(data => setParcels(data));
  }, []);

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
             key={`water-${idx}`}
             data={{type: "LineString", coordinates: [coords[0], coords[2]]}} 
             style={{ color: '#00bcd4', weight: 3, dashArray: '5, 5' }} 
           />
         );
      }
      if (layerVisibility.utilities_power && feature.properties.additional_layers.utilities.includes('power')) {
         lines.push(
           <GeoJSON 
             key={`power-${idx}`}
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
      <MapContainer 
        center={[30.7335, 76.7725]} 
        zoom={18} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        className="cursor-crosshair"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          maxZoom={19}
        />
        
        {parcels && (
          <GeoJSON 
            data={parcels} 
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
        
        {renderUtilityLines()}

        {/* Floating Grid Labels (Issue 5) */}
        <Marker position={[30.7339, 76.7715]} icon={createLabelIcon("Sector 22-A")} interactive={false} />
        <Marker position={[30.7329, 76.7735]} icon={createLabelIcon("Sector 22-B")} interactive={false} />
        <Marker position={[30.7342, 76.7732]} icon={createLabelIcon("Block 640")} interactive={false} />

        <MapController selectedParcel={selectedParcel} />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
      </MapContainer>
    </div>
  );
}
