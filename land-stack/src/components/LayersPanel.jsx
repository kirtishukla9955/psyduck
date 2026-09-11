import React, { useState } from 'react';
import { useMapStore } from '../store/mapStore';
import { Layers, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CheckboxRow = ({ label, checked, onChange, swatch, icon }) => (
  <label className="flex items-center gap-3 py-1.5 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors group">
    <div className="relative flex items-center justify-center w-4 h-4 border border-white/30 rounded bg-navy-800/50 group-hover:border-white/50">
      {checked && <div className="w-2 h-2 rounded-sm bg-white" />}
    </div>
    <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
    {swatch && <div className="w-4 h-4 rounded-sm border border-white/20" style={{ backgroundColor: swatch }} />}
    {icon && <div className="text-white/60">{icon}</div>}
    <span className="text-sm text-white/90 font-medium select-none flex-1">{label}</span>
    {checked ? <Eye className="w-3.5 h-3.5 text-white/40" /> : <EyeOff className="w-3.5 h-3.5 text-white/20" />}
  </label>
);

export default function LayersPanel() {
  const { layerVisibility, toggleLayer, setLayerVisibility } = useMapStore();
  const [expandedGroups, setExpandedGroups] = useState({ networks: true, zones: true });

  const toggleGroup = (group) => setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));

  const toggleNetworks = (e) => {
    const isChecked = !layerVisibility.utilities_water; // simplified logic
    setLayerVisibility('utilities_water', isChecked);
    setLayerVisibility('utilities_sewer', isChecked);
    setLayerVisibility('utilities_power', isChecked);
  };

  return (
    <div className="absolute top-20 left-4 w-64 glass-panel rounded-lg overflow-hidden flex flex-col z-10 shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <Layers className="w-5 h-5 text-accent-cyan" />
        <h2 className="text-sm font-semibold tracking-wide text-white">Layers</h2>
      </div>

      <div className="p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
        
        <CheckboxRow 
          label="Parcel Boundaries" 
          checked={layerVisibility.boundaries} 
          onChange={() => toggleLayer('boundaries')} 
          swatch="#ff5722"
        />
        
        <div className="mt-2">
          <div 
            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-white/5 rounded"
            onClick={() => toggleGroup('zones')}
          >
            {expandedGroups.zones ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
            <span className="text-sm font-medium text-white/90">Zoning / Land Use</span>
          </div>
          
          {expandedGroups.zones && (
            <div className="pl-6 pr-2 flex flex-col gap-1 mt-1 border-l border-white/10 ml-3">
              <CheckboxRow 
                label="Zone Fill Colors" 
                checked={layerVisibility.zones} 
                onChange={() => toggleLayer('zones')} 
                icon={<div className="w-4 h-4 rounded flex overflow-hidden"><div className="w-1/2 bg-[#2196f3]" /><div className="w-1/2 bg-[#ffc107]" /></div>}
              />
              <div className="pl-6 text-xs text-white/50 flex flex-col gap-1 mb-2">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2196f3]" /> Residential</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ffc107]" /> Commercial</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#4caf50]" /> Agricultural</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#9c27b0]" /> Industrial</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-1">
          <div 
            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-white/5 rounded"
            onClick={() => toggleGroup('networks')}
          >
            {expandedGroups.networks ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
            <span className="text-sm font-medium text-white/90">Route Networks</span>
            <div className="ml-auto" onClick={e => e.stopPropagation()}>
               <input type="checkbox" checked={layerVisibility.utilities_water} onChange={toggleNetworks} className="w-3 h-3 cursor-pointer" />
            </div>
          </div>
          
          {expandedGroups.networks && (
            <div className="pl-6 pr-2 flex flex-col gap-1 mt-1 border-l border-white/10 ml-3">
              <CheckboxRow 
                label="Water Lines" 
                checked={layerVisibility.utilities_water} 
                onChange={() => toggleLayer('utilities_water')} 
                swatch="#00bcd4"
              />
              <CheckboxRow 
                label="Sewer Lines" 
                checked={layerVisibility.utilities_sewer} 
                onChange={() => toggleLayer('utilities_sewer')} 
                swatch="#8d6e63"
              />
              <CheckboxRow 
                label="Power Lines" 
                checked={layerVisibility.utilities_power} 
                onChange={() => toggleLayer('utilities_power')} 
                swatch="#ffeb3b"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
