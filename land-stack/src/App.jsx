import React from 'react';
import MapView from './components/MapView';
import LayersPanel from './components/LayersPanel';
import AnalysisToolsPanel from './components/AnalysisToolsPanel';
import ParcelExplainPanel from './components/ParcelExplainPanel';
import TopToolbar from './components/TopToolbar';
import StatusBar from './components/StatusBar';
import MiniMapInset from './components/MiniMapInset';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-navy-900 text-white font-sans selection:bg-accent-cyan/30">
      <MapView />
      
      <TopToolbar />
      <LayersPanel />
      <AnalysisToolsPanel />
      <ParcelExplainPanel />
      
      <StatusBar />
      <MiniMapInset />
    </div>
  );
}

export default App;
