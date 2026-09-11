import React, { useState } from 'react';
import { Ruler, ShieldAlert, TrendingUp, Layers, FileText } from 'lucide-react';

const ToolButton = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all ${
      active 
        ? 'bg-accent-cyan/20 border border-accent-cyan/30 text-white' 
        : 'hover:bg-white/5 border border-transparent text-white/70 hover:text-white'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-accent-cyan' : ''}`} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default function AnalysisToolsPanel() {
  const [activeTool, setActiveTool] = useState(null);

  const handleToolClick = (tool) => {
    setActiveTool(tool === activeTool ? null : tool);
    if (tool !== 'Measurements' && tool !== activeTool) {
      alert(`${tool} - Feature coming soon in the next sprint.`);
    }
  };

  return (
    <div className="absolute top-20 right-4 w-64 glass-panel rounded-lg overflow-hidden flex flex-col z-10 shadow-2xl">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <h2 className="text-sm font-semibold tracking-wide text-white">Analysis Tools</h2>
      </div>

      <div className="p-2 flex flex-col gap-1">
        <ToolButton 
          icon={Ruler} 
          label="Measurements" 
          active={activeTool === 'Measurements'} 
          onClick={() => handleToolClick('Measurements')} 
        />
        <ToolButton 
          icon={ShieldAlert} 
          label="Buffer Analysis" 
          active={activeTool === 'Buffer'} 
          onClick={() => handleToolClick('Buffer')} 
        />
        <ToolButton 
          icon={TrendingUp} 
          label="Elevation Profile" 
          active={activeTool === 'Elevation'} 
          onClick={() => handleToolClick('Elevation')} 
        />
        <ToolButton 
          icon={Layers} 
          label="Overlay Analysis" 
          active={activeTool === 'Overlay'} 
          onClick={() => handleToolClick('Overlay')} 
        />
        <ToolButton 
          icon={FileText} 
          label="Generate Report" 
          active={activeTool === 'Report'} 
          onClick={() => handleToolClick('Report')} 
        />
      </div>
    </div>
  );
}
