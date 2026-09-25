import React from "react";
import { TileLayer } from "react-leaflet";

function SatelliteLayer({ opacity = 1 }) {
  return (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution='&copy; Esri'
      opacity={opacity}
    />
  );
}

export default SatelliteLayer;
