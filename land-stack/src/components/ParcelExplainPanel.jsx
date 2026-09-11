import React from 'react';
import { useMapStore } from '../store/mapStore';
import { X, AlertTriangle, CheckCircle, Info, Hash, FileText, Settings, ShieldAlert, Map as MapIcon, Calendar, Zap, Droplet, DollarSign } from 'lucide-react';

export default function ParcelExplainPanel() {
  const { selectedParcel, setSelectedParcel } = useMapStore();

  if (!selectedParcel) return null;

  const props = selectedParcel.properties;
  const hasConflict = props.conflict?.has_conflict;

  return (
    <div className="absolute top-20 right-[18rem] w-96 max-h-[calc(100vh-100px)] glass-panel rounded-xl flex flex-col z-20 shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-navy-800 to-navy-900">
        <div>
          <div className="text-xs text-white/50 font-medium mb-1 uppercase tracking-wider">Selected Parcel</div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {props.ulpin}
          </h2>
        </div>
        <button 
          onClick={() => setSelectedParcel(null)}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Conflict Alert */}
        {hasConflict && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3 items-start animate-pulse">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-400 mb-1">Data Conflict Detected</h3>
              <p className="text-xs text-red-200/90 leading-relaxed">
                {props.conflict.description}
              </p>
            </div>
          </div>
        )}

        {/* Base Layer */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-white border-b border-white/10 pb-2">
            <MapIcon className="w-4 h-4 text-accent-cyan" />
            1. Base Layer (Survey)
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded p-3">
              <div className="text-white/50 text-xs mb-1">Area</div>
              <div className="font-medium">{props.area_sqm} sq.m</div>
            </div>
            <div className="bg-white/5 rounded p-3">
              <div className="text-white/50 text-xs mb-1">Zone Type</div>
              <div className="font-medium capitalize flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${
                  props.zone === 'residential' ? 'bg-[#2196f3]' :
                  props.zone === 'commercial' ? 'bg-[#ffc107]' :
                  props.zone === 'agricultural' ? 'bg-[#4caf50]' : 'bg-[#9c27b0]'
                }`} />
                {props.zone}
              </div>
            </div>
            <div className="col-span-2 bg-white/5 rounded p-3 flex justify-between items-center">
              <div>
                <div className="text-white/50 text-xs mb-1">Boundary Source</div>
                <div className="font-medium text-xs">{props.base_layer.boundary_source}</div>
              </div>
              <div className="text-right">
                <div className="text-white/50 text-xs mb-1 flex items-center gap-1 justify-end"><Calendar className="w-3 h-3"/> Survey Date</div>
                <div className="font-medium text-xs">{props.base_layer.last_survey_date}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Essential Layers */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-white border-b border-white/10 pb-2">
            <FileText className="w-4 h-4 text-orange-400" />
            2. Essential Layers (Revenue & Reg.)
          </h3>
          
          <div className="space-y-2 relative">
             {/* Connection line if conflict */}
             {hasConflict && (
                <div className="absolute left-4 top-10 bottom-10 w-0.5 bg-red-500/50" />
             )}

            <div className={`p-3 rounded border ${hasConflict ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-white/50 font-medium">Record of Rights (RoR)</div>
                <div className="text-xs text-white/40 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> {props.essential_layers.record_of_rights.khata_no}
                </div>
              </div>
              <div className="font-medium text-sm text-white">
                {props.essential_layers.record_of_rights.owner_name}
              </div>
            </div>

            <div className={`p-3 rounded border ${hasConflict ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="text-xs text-white/50 font-medium">Registration (Latest Deed)</div>
                <div className="text-xs text-white/40 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {props.essential_layers.registration.deed_date}
                </div>
              </div>
              <div className="font-medium text-sm text-white">
                {props.essential_layers.registration.latest_owner_name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded bg-white/5 border border-white/5">
                <div className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Encumbrance</div>
                <div className={`text-xs font-medium ${props.essential_layers.encumbrance !== 'None' ? 'text-yellow-400' : 'text-green-400'}`}>
                  {props.essential_layers.encumbrance}
                </div>
              </div>
              <div className="p-2.5 rounded bg-white/5 border border-white/5">
                <div className="text-[10px] text-white/50 uppercase tracking-wide mb-1">Bldg. Permission</div>
                <div className={`text-xs font-medium ${props.essential_layers.building_permission.includes('Approved') ? 'text-green-400' : 'text-yellow-400'}`}>
                  {props.essential_layers.building_permission}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Layers */}
        <div className="space-y-3 pb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-white border-b border-white/10 pb-2">
            <Settings className="w-4 h-4 text-purple-400" />
            3. Additional Layers
          </h3>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded border border-white/5">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Zap className="w-3.5 h-3.5" /> Utilities Present
              </div>
              <div className="flex gap-1.5">
                {props.additional_layers.utilities.map(u => (
                  <span key={u} className="px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-white/10 text-white/90">
                    {u}
                  </span>
                ))}
                {props.additional_layers.utilities.length === 0 && <span className="text-xs text-white/40">None</span>}
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded border border-white/5">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <DollarSign className="w-3.5 h-3.5" /> Property Tax
              </div>
              <div className={`text-xs font-medium ${props.additional_layers.property_tax_status.includes('Paid') ? 'text-green-400' : 'text-yellow-400'}`}>
                {props.additional_layers.property_tax_status}
              </div>
            </div>

            {props.additional_layers.restriction_zone && (
              <div className="flex items-center justify-between p-2.5 bg-yellow-500/10 rounded border border-yellow-500/20">
                <div className="flex items-center gap-2 text-xs text-yellow-500/80">
                  <AlertTriangle className="w-3.5 h-3.5" /> Restriction
                </div>
                <div className="text-xs font-medium text-yellow-400">
                  {props.additional_layers.restriction_zone}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
