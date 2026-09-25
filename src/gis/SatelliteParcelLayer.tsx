import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Loader2 } from 'lucide-react';
import {
  GeoParcelRecord,
  StateIndexEntry,
  loadParcelIndex,
  loadStateParcels,
  nearestState,
  findParcelByUlpin,
} from './parcelGeoData';

export interface SatelliteParcelLayerProps {
  center: { lat: number; lng: number };
  zoom: number;
  selectedParcelUlpin?: string;
  highlightedParcels?: { ulpin: string; kind: 'selected' | 'conflict' | 'spatial-inconsistency' }[];
  onParcelClick?: (ulpin: string) => void;
}

const HIGHLIGHT_COLORS: Record<string, string> = {
  selected: '#14b8a6', // teal
  conflict: '#ef4444', // red
  'spatial-inconsistency': '#f59e0b', // amber
};
const DEFAULT_COLOR = '#e2e8f0';

export const SatelliteParcelLayer: React.FC<SatelliteParcelLayerProps> = ({
  center,
  zoom,
  selectedParcelUlpin,
  highlightedParcels = [],
  onParcelClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedState, setLoadedState] = useState<StateIndexEntry | null>(null);
  const [activeRecord, setActiveRecord] = useState<GeoParcelRecord | null>(null);
  const [parcelCount, setParcelCount] = useState(0);

  const highlightMap = React.useMemo(() => {
    const m = new Map<string, 'selected' | 'conflict' | 'spatial-inconsistency'>();
    highlightedParcels.forEach((h) => m.set(h.ulpin, h.kind));
    if (selectedParcelUlpin) m.set(selectedParcelUlpin, 'selected');
    return m;
  }, [highlightedParcels, selectedParcelUlpin]);

  const styleFor = useCallback(
    (ulpin: string): L.PathOptions => {
      const kind = highlightMap.get(ulpin);
      const color = kind ? HIGHLIGHT_COLORS[kind] : DEFAULT_COLOR;
      return {
        color,
        weight: kind ? 2.5 : 1,
        fillColor: color,
        fillOpacity: kind ? 0.45 : 0.15,
      };
    },
    [highlightMap]
  );

  // Initialize the Leaflet map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: Math.min(Math.max(zoom, 13), 18),
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS user community',
        maxZoom: 19,
      }
    ).addTo(map);

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the connected DB's parcel geometries for whichever state is closest to
  // `center` (or to the selected ULPIN, if we can resolve it), then draw them.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      const index = await loadParcelIndex();
      if (cancelled) return;

      let target: StateIndexEntry | null = nearestState(index, center.lat, center.lng);

      if (selectedParcelUlpin) {
        const found = await findParcelByUlpin(index, selectedParcelUlpin);
        if (cancelled) return;
        if (found) {
          target = index.find((e) => e.stateCode === found.stateCode) ?? target;
        }
      }
      if (!target) {
        setLoading(false);
        return;
      }

      const records = await loadStateParcels(target.stateCode);
      if (cancelled || !mapRef.current) return;

      setLoadedState(target);
      setParcelCount(records.length);

      const featureCollection: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: records.map((r) => ({
          type: 'Feature',
          geometry: r.boundary as GeoJSON.Geometry,
          properties: { ulpin: r.ulpin },
        })),
      };

      if (geoLayerRef.current) {
        geoLayerRef.current.remove();
      }

      const layer = L.geoJSON(featureCollection, {
        style: (feature) => styleFor(feature?.properties?.ulpin ?? ''),
        onEachFeature: (feature, lyr) => {
          const ulpin = feature.properties?.ulpin as string;
          lyr.on('click', () => {
            const rec = records.find((r) => r.ulpin === ulpin) || null;
            setActiveRecord(rec);
            onParcelClick?.(ulpin);
          });
          lyr.on('mouseover', () => (lyr as L.Path).setStyle({ weight: 3 }));
          lyr.on('mouseout', () => (lyr as L.Path).setStyle(styleFor(ulpin)));
        },
      }).addTo(mapRef.current);

      geoLayerRef.current = layer;

      // Focus on the selected parcel if we found one, else fit the whole state block.
      const selectedRec = selectedParcelUlpin
        ? records.find((r) => r.ulpin === selectedParcelUlpin)
        : null;
      if (selectedRec) {
        mapRef.current.setView([selectedRec.centroid.lat, selectedRec.centroid.lon], 18);
        setActiveRecord(selectedRec);
      } else if (layer.getBounds().isValid()) {
        mapRef.current.fitBounds(layer.getBounds(), { maxZoom: 17, padding: [20, 20] });
      }

      setLoading(false);
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, selectedParcelUlpin]);

  // Re-style features when highlight set changes, without refetching.
  useEffect(() => {
    if (!geoLayerRef.current) return;
    geoLayerRef.current.eachLayer((lyr) => {
      const ulpin = (lyr as any).feature?.properties?.ulpin;
      if (ulpin) (lyr as L.Path).setStyle(styleFor(ulpin));
    });
  }, [styleFor]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />

      {loading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-neutral-900/60 pointer-events-none">
          <div className="flex items-center gap-2 text-xs text-white bg-neutral-900/90 px-3 py-2 rounded shadow">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading connected parcel database…
          </div>
        </div>
      )}

      {!loading && loadedState && (
        <div className="absolute bottom-2 left-3 z-[400] text-[10px] text-neutral-200 bg-neutral-900/80 px-2 py-0.5 rounded pointer-events-none">
          Satellite | {loadedState.state} — {parcelCount.toLocaleString()} DB parcels loaded | EPSG:4326
        </div>
      )}

      {activeRecord && (
        <div className="absolute top-3 left-3 z-[500] w-64 bg-neutral-900/95 border border-neutral-700 text-xs rounded shadow-lg backdrop-blur overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700 bg-neutral-800/60">
            <div className="flex items-center gap-1.5 font-semibold text-teal-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Parcel Record</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveRecord(null)}
              className="text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3 space-y-1.5 text-neutral-200">
            <Row label="ULPIN" value={activeRecord.ulpin} mono />
            <Row label="Parcel ID" value={activeRecord.parcelId} mono />
            <Row label="Owner" value={activeRecord.ownerName} />
            <Row label="Khasra/Plot" value={activeRecord.khasraPlotNo} />
            <Row label="Land Use" value={activeRecord.landUseCategory} />
            <Row label="Status" value={activeRecord.status} />
            <Row
              label="Area"
              value={`${activeRecord.recordedArea} ${activeRecord.recordedAreaUnit}`}
            />
            <Row label="Village" value={activeRecord.village} />
            <Row label="District" value={activeRecord.district} />
            <Row label="State" value={activeRecord.state} />
          </div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex justify-between gap-2">
    <span className="text-neutral-400">{label}</span>
    <span className={`text-right ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
  </div>
);
