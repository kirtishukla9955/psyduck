import { useState, useCallback } from 'react';

export interface MapLayerConfig {
  id: string;
  label: string;
  enabled: boolean;
}

export const useParcelMap = (initialLayers: string[] = ['cadastral', 'revenue_grid']) => {
  const [activeLayers, setActiveLayers] = useState<string[]>(initialLayers);

  const toggleLayer = useCallback((layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId) ? prev.filter((l) => l !== layerId) : [...prev, layerId]
    );
  }, []);

  const isLayerActive = useCallback(
    (layerId: string) => activeLayers.includes(layerId),
    [activeLayers]
  );

  return {
    activeLayers,
    toggleLayer,
    isLayerActive,
    setActiveLayers,
  };
};
