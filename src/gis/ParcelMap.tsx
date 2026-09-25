import React, { useState } from 'react';
import { Layers, ZoomIn, ZoomOut, Maximize2, Compass, MapPin, Eye } from 'lucide-react';
import { INITIAL_PARCELS } from '@/api/mock/mockData';
import { SatelliteParcelLayer } from './SatelliteParcelLayer';

export interface ParcelMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  selectedParcelUlpin?: string;
  highlightedParcels?: { ulpin: string; kind: 'selected' | 'conflict' | 'spatial-inconsistency' }[];
  layers?: string[]; // toggleable overlay layers
  onParcelClick?: (ulpin: string) => void;
  interactive?: boolean; // false for small "mini map" contexts
  className?: string;
  height?: string | number;
}

export const ParcelMap: React.FC<ParcelMapProps> = ({
  center = { lat: 30.7398, lng: 76.7827 },
  zoom = 15,
  selectedParcelUlpin,
  highlightedParcels = [],
  layers = ['cadastral', 'revenue_grid'],
  onParcelClick,
  interactive = true,
  className = '',
  height = 400,
}) => {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [activeLayers, setActiveLayers] = useState<string[]>(layers);
  const [hoveredParcel, setHoveredParcel] = useState<string | null>(null);

  // Available layers
  const availableLayers = [
    { id: 'cadastral', label: 'Cadastral Boundaries (FMB/RoR)' },
    { id: 'satellite', label: 'High-Res Ortho-Satellite' },
    { id: 'revenue_grid', label: 'Revenue Sheet Grids' },
    { id: 'zoning', label: 'Master Plan Zoning Overlay' },
  ];

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId) ? prev.filter((l) => l !== layerId) : [...prev, layerId]
    );
  };

  const getParcelHighlight = (ulpin: string) => {
    if (selectedParcelUlpin === ulpin) return 'selected';
    const match = highlightedParcels.find((p) => p.ulpin === ulpin);
    return match ? match.kind : null;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-card border border-neutral-300 bg-neutral-900 text-white font-sans ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {/* High-Res Ortho-Satellite layer: real basemap + live polygons from the
          connected 20K-parcel database, rendered only when that layer is toggled on
          so every existing caller (none of which enable it by default) is unaffected. */}
      {activeLayers.includes('satellite') ? (
        <SatelliteParcelLayer
          center={center}
          zoom={currentZoom}
          selectedParcelUlpin={selectedParcelUlpin}
          highlightedParcels={highlightedParcels}
          onParcelClick={onParcelClick}
        />
      ) : (
      <div className="absolute inset-0 bg-[#1e293b] flex items-center justify-center select-none overflow-hidden">
        {/* Grid pattern */}
        <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Cadastral Polygon Simulation */}
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full absolute inset-0 cursor-crosshair transition-transform duration-300"
          style={{ transform: `scale(${currentZoom / 15})` }}
        >
          {/* Street / Infrastructure Overlay */}
          <path
            d="M 50,250 Q 250,230 400,250 T 750,270"
            stroke="#475569"
            strokeWidth="12"
            fill="none"
          />
          <path
            d="M 400,30 L 400,470"
            stroke="#475569"
            strokeWidth="10"
            fill="none"
          />

          {/* Cadastral Polygon Simulation */}
          {selectedParcelUlpin?.startsWith('TN') || center.lat < 20 ? (
            /* Tamil Nadu Pilot Cadastral FMB View */
            <>
              {/* Field Measurement Triangulation Lines */}
              <line x1="150" y1="120" x2="650" y2="380" stroke="#0e7c7b" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
              <line x1="150" y1="380" x2="650" y2="120" stroke="#0e7c7b" strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />

              {/* Main Parcel: TN-CH-09124 (Survey 42/1B) */}
              <g
                onClick={() => onParcelClick?.('TN-CH-09124')}
                onMouseEnter={() => setHoveredParcel('TN-CH-09124')}
                onMouseLeave={() => setHoveredParcel(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <polygon
                  points="280,140 480,130 510,260 290,270"
                  fill={
                    getParcelHighlight('TN-CH-09124') === 'conflict'
                      ? 'rgba(178, 58, 46, 0.4)'
                      : getParcelHighlight('TN-CH-09124') === 'selected'
                      ? 'rgba(14, 124, 123, 0.45)'
                      : 'rgba(51, 65, 85, 0.6)'
                  }
                  stroke={
                    getParcelHighlight('TN-CH-09124') === 'conflict'
                      ? '#b23a2e'
                      : getParcelHighlight('TN-CH-09124') === 'selected'
                      ? '#0e7c7b'
                      : '#94a3b8'
                  }
                  strokeWidth={
                    getParcelHighlight('TN-CH-09124') || hoveredParcel === 'TN-CH-09124' ? '3.5' : '1.5'
                  }
                />
                <text x="320" y="205" fill="#ffffff" fontSize="12" fontWeight="600" fontFamily="sans-serif">
                  TN-CH-09124
                </text>
                <text x="320" y="225" fill="#a7f3d0" fontSize="10" fontFamily="sans-serif">
                  Sy. No. 42/1B (Nanjai)
                </text>
              </g>

              {/* Adjacent Parcel: TN-MD-44021 */}
              <g
                onClick={() => onParcelClick?.('TN-MD-44021')}
                onMouseEnter={() => setHoveredParcel('TN-MD-44021')}
                onMouseLeave={() => setHoveredParcel(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <polygon
                  points="140,150 260,150 270,260 140,260"
                  fill={
                    getParcelHighlight('TN-MD-44021') === 'selected'
                      ? 'rgba(14, 124, 123, 0.45)'
                      : 'rgba(30, 122, 52, 0.25)'
                  }
                  stroke={getParcelHighlight('TN-MD-44021') === 'selected' ? '#0e7c7b' : '#1e7a34'}
                  strokeWidth="2"
                />
                <text x="155" y="210" fill="#ffffff" fontSize="11" fontWeight="500">
                  TN-MD-44021
                </text>
              </g>

              {/* Adjacent Survey boundary plots */}
              <polygon points="530,130 670,120 680,250 520,260" fill="rgba(51, 65, 85, 0.4)" stroke="#64748b" strokeWidth="1" />
              <polygon points="290,290 490,285 480,390 280,380" fill="rgba(51, 65, 85, 0.4)" stroke="#64748b" strokeWidth="1" />
            </>
          ) : (
            /* Chandigarh Pilot Cadastral View */
            <>
              {/* Parcel 1: CH-SEC17-0402 (Primary Anchor) */}
              <g
                onClick={() => onParcelClick?.('CH-SEC17-0402')}
                onMouseEnter={() => setHoveredParcel('CH-SEC17-0402')}
                onMouseLeave={() => setHoveredParcel(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <polygon
                  points="320,160 460,150 480,240 340,245"
                  fill={
                    getParcelHighlight('CH-SEC17-0402') === 'conflict'
                      ? 'rgba(178, 58, 46, 0.4)'
                      : getParcelHighlight('CH-SEC17-0402') === 'selected'
                      ? 'rgba(14, 124, 123, 0.45)'
                      : 'rgba(51, 65, 85, 0.6)'
                  }
                  stroke={
                    getParcelHighlight('CH-SEC17-0402') === 'conflict'
                      ? '#b23a2e'
                      : getParcelHighlight('CH-SEC17-0402') === 'selected'
                      ? '#0e7c7b'
                      : '#94a3b8'
                  }
                  strokeWidth={
                    getParcelHighlight('CH-SEC17-0402') || hoveredParcel === 'CH-SEC17-0402'
                      ? '3.5'
                      : '1.5'
                  }
                  strokeDasharray={
                    getParcelHighlight('CH-SEC17-0402') === 'spatial-inconsistency' ? '4,4' : 'none'
                  }
                />
                <text
                  x="345"
                  y="205"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  CH-SEC17-0402
                </text>
              </g>

              {/* Parcel 2: CH-SEC09-1108 */}
              <g
                onClick={() => onParcelClick?.('CH-SEC09-1108')}
                onMouseEnter={() => setHoveredParcel('CH-SEC09-1108')}
                onMouseLeave={() => setHoveredParcel(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <polygon
                  points="180,140 300,140 300,230 180,230"
                  fill={
                    getParcelHighlight('CH-SEC09-1108') === 'selected'
                      ? 'rgba(14, 124, 123, 0.45)'
                      : 'rgba(30, 122, 52, 0.25)'
                  }
                  stroke={
                    getParcelHighlight('CH-SEC09-1108') === 'selected' ? '#0e7c7b' : '#1e7a34'
                  }
                  strokeWidth="2"
                />
                <text x="200" y="190" fill="#ffffff" fontSize="11" fontWeight="500">
                  CH-SEC09-1108
                </text>
              </g>

              {/* Parcel 3: CH-IND02-0931 */}
              <g
                onClick={() => onParcelClick?.('CH-IND02-0931')}
                onMouseEnter={() => setHoveredParcel('CH-IND02-0931')}
                onMouseLeave={() => setHoveredParcel(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <polygon
                  points="340,265 475,265 465,360 330,350"
                  fill={
                    getParcelHighlight('CH-IND02-0931') === 'conflict'
                      ? 'rgba(178, 58, 46, 0.4)'
                      : getParcelHighlight('CH-IND02-0931') === 'selected'
                      ? 'rgba(14, 124, 123, 0.45)'
                      : 'rgba(51, 65, 85, 0.4)'
                  }
                  stroke={
                    getParcelHighlight('CH-IND02-0931') === 'conflict'
                      ? '#b23a2e'
                      : getParcelHighlight('CH-IND02-0931') === 'selected'
                      ? '#0e7c7b'
                      : '#64748b'
                  }
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
                <text x="350" y="315" fill="#ffffff" fontSize="11" fontWeight="500">
                  CH-IND02-0931
                </text>
              </g>

              {/* Adjacent Cadastral plots */}
              <polygon
                points="500,160 620,150 630,235 510,240"
                fill="rgba(51, 65, 85, 0.4)"
                stroke="#64748b"
                strokeWidth="1"
              />
              <polygon
                points="180,250 310,250 300,340 180,340"
                fill="rgba(51, 65, 85, 0.4)"
                stroke="#64748b"
                strokeWidth="1"
              />
            </>
          )}
        </svg>

        {/* Mini watermark / GIS credit */}
        <div className="absolute bottom-2 left-3 text-[10px] text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded pointer-events-none">
          P1 GIS Layer | Cadastral Grid EPSG:4326 | Lat: {center.lat.toFixed(4)}, Lng: {center.lng.toFixed(4)}
        </div>
      </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredParcel && (
        <div className="absolute top-3 left-3 z-20 bg-neutral-900/95 border border-neutral-700 text-xs px-3 py-2 rounded shadow-lg backdrop-blur">
          <div className="font-semibold text-teal-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{hoveredParcel}</span>
          </div>
          <div className="text-neutral-300 mt-0.5">
            Click to inspect departmental records & ULPIN details
          </div>
        </div>
      )}

      {/* Interactive Controls (Zoom, Layers, Center) */}
      {interactive && (
        <>
          {/* Top-Right Tools */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="bg-neutral-800/90 hover:bg-neutral-700 p-2 rounded shadow border border-neutral-600 text-white transition-colors"
                title="Toggle GIS Layers"
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* Layer Menu Dropdown */}
              {showLayerMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded bg-neutral-900 border border-neutral-700 shadow-xl p-2.5 z-30 text-xs">
                  <div className="font-semibold text-neutral-200 mb-2 pb-1 border-b border-neutral-800 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-gis" />
                    <span>GIS Overlays</span>
                  </div>
                  <div className="space-y-1.5">
                    {availableLayers.map((l) => (
                      <label
                        key={l.id}
                        className="flex items-center gap-2 text-neutral-300 hover:text-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={activeLayers.includes(l.id)}
                          onChange={() => toggleLayer(l.id)}
                          className="rounded text-gis focus:ring-0 focus:ring-offset-0 bg-neutral-800 border-neutral-600"
                        />
                        <span>{l.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCurrentZoom((z) => Math.min(20, z + 1))}
              className="bg-neutral-800/90 hover:bg-neutral-700 p-2 rounded shadow border border-neutral-600 text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentZoom((z) => Math.max(10, z - 1))}
              className="bg-neutral-800/90 hover:bg-neutral-700 p-2 rounded shadow border border-neutral-600 text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Compass */}
          <div className="absolute bottom-3 right-3 z-10">
            <div className="bg-neutral-800/80 p-1.5 rounded-full border border-neutral-600 text-neutral-400">
              <Compass className="w-5 h-5 text-gis" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
