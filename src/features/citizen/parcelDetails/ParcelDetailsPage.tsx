import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parcelService } from '@/api/serviceFactory';
import { useStateConfig } from '@/hooks/useStateConfig';
import { ParcelSummary } from '@/features/parcels/ParcelSummary';
import { VerificationBadge } from '@/components/VerificationBadge';
import { DepartmentBadge } from '@/features/conflicts/DepartmentBadge';
import { ParcelMap } from '@/gis/ParcelMap';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { PlainLanguageTooltip } from '@/components/PlainLanguageTooltip';
import {
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  Landmark,
  Compass,
  Building,
  AlertTriangle,
  Layers,
  Sparkles,
  Cpu,
  Home,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  Droplet,
  DollarSign,
  Shield,
  FileCheck2,
  Scale,
} from 'lucide-react';

export const ParcelDetailsPage: React.FC = () => {
  const { ulpin } = useParams<{ ulpin: string }>();
  const { getRorTerm, formatArea } = useStateConfig();
  const [activeTab, setActiveTab] = useState<'all' | 'essential' | 'base' | 'additional' | 'ai'>('all');

  const targetUlpin = ulpin || 'CH-SEC17-0402';

  const { data: parcel, isLoading: parcelLoading, error: parcelError, refetch } = useQuery({
    queryKey: ['parcel', targetUlpin],
    queryFn: () => parcelService.getParcelByUlpin(targetUlpin),
  });

  const { data: verification, isLoading: verLoading } = useQuery({
    queryKey: ['verification', targetUlpin],
    queryFn: () => parcelService.getOwnershipVerification(targetUlpin),
  });

  const { data: deptRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['deptRecords', targetUlpin],
    queryFn: () => parcelService.getDepartmentRecords(targetUlpin),
  });

  if (parcelLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton type="detail" />
      </div>
    );
  }

  if (parcelError || !parcel) {
    return (
      <ErrorState
        title="Parcel Not Found"
        message={`Unable to retrieve cadastral record for ULPIN ${targetUlpin}.`}
        onRetry={() => refetch()}
      />
    );
  }

  const hasEssential = !!parcel.essentialLayers;
  const hasBase = !!parcel.baseLayer;
  const hasAdditional = !!parcel.additionalLayers;
  const hasAi = !!(parcel.aiFlags && parcel.aiFlags.length > 0);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Citizen Portal', href: '/citizen/dashboard' },
          { label: 'Parcel Search', href: '/citizen/parcels/search' },
          { label: parcel.ulpin },
        ]}
      />

      {/* Parcel Summary Header */}
      <ParcelSummary parcel={parcel} />

      {/* Verification Status Banner */}
      {verification && (
        <div
          className={`rounded-card border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            verification.status === 'conflict_detected'
              ? 'bg-rose-50/80 border-rose-200'
              : verification.status === 'verified'
              ? 'bg-emerald-50/80 border-emerald-200'
              : 'bg-amber-50/80 border-amber-200'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                Title Status:
              </span>
              <VerificationBadge status={verification.status} />
            </div>
            <p className="text-xs text-neutral-700 max-w-2xl mt-1 leading-relaxed">
              {verification.summaryNote ||
                `Recorded titleholder: ${verification.recordedOwner.name} via Department of ${verification.verificationSource}.`}
            </p>
          </div>

          <Link
            to={`/citizen/parcels/${parcel.ulpin}/verification`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded border border-neutral-300 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 shadow-subtle flex-shrink-0 transition-colors"
          >
            <span>View Verification Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3-Layer Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Integrated Feeds ({deptRecords?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('essential')}
          className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeTab === 'essential'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Essential Layers (Rights & RoR)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('base')}
          className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeTab === 'base'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Base Layer (Spatial & Cadastre)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('additional')}
          className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
            activeTab === 'additional'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Additional Layers (Utilities & Valuation)</span>
        </button>

        {hasAi && (
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 transition-colors ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Diagnostics ({parcel.aiFlags?.length})</span>
          </button>
        )}
      </div>

      {/* Main Grid: Details Tab Content & Cadastral Mini Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Selected Tab View */}
        <div className="lg:col-span-7 space-y-4">
          {/* TAB 1: Integrated Department Records */}
          {activeTab === 'all' && (
            <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Integrated Multi-Departmental Records
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Direct data feeds from Revenue, Registration, Survey & Urban Development
                  </p>
                </div>
              </div>

              {recordsLoading ? (
                <LoadingSkeleton type="list" count={4} />
              ) : deptRecords && deptRecords.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {deptRecords.map((rec, idx) => (
                    <div key={idx} className="py-3 flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <DepartmentBadge department={rec.department} size="sm" />
                          <span className="text-xs font-semibold text-neutral-700">
                            {rec.fieldLabel}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-neutral-900 pl-1">{rec.value}</div>
                      </div>
                      <div className="text-[10px] text-neutral-400 whitespace-nowrap pt-1">
                        {new Date(rec.recordedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 py-4">No departmental feeds registered yet.</p>
              )}
            </div>
          )}

          {/* TAB 2: Essential Layers (Rights & Governance) */}
          {activeTab === 'essential' && (
            <div className="space-y-4">
              {parcel.essentialLayers?.ror && (
                <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">
                        {parcel.essentialLayers.ror.recordType}
                      </h4>
                      <PlainLanguageTooltip term="RoR" showIconOnly />
                    </div>
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold">
                      Revenue RoR
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Holding / Patta Number:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.ror.khewatKhatauniOrPattaNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Khasra / Survey Number:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.ror.khasraOrSurveyNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Recorded Extent:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.ror.recordedExtent}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Land Nature / Cultivation:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.ror.cultivationOrLandNature}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {parcel.essentialLayers?.registration && (
                <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <h4 className="text-sm font-bold text-neutral-900">Sub-Registrar Conveyance Record</h4>
                    <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                      Registration Office
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Deed Reference Number:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.registration.deedNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Deed Type:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.registration.deedType}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-neutral-500 block">Parties Involved:</span>
                      <span className="font-medium text-neutral-800">
                        {parcel.essentialLayers.registration.partiesInvolved}
                      </span>
                    </div>
                    {parcel.essentialLayers.registration.considerationAmount && (
                      <div>
                        <span className="text-neutral-500 block">Consideration Amount:</span>
                        <span className="font-semibold text-emerald-700">
                          {parcel.essentialLayers.registration.considerationAmount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {parcel.essentialLayers?.encumbrance && (
                <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">Encumbrance & Mortgage Status</h4>
                      <PlainLanguageTooltip term="Encumbrance" showIconOnly />
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                        parcel.essentialLayers.encumbrance.isEncumbered
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {parcel.essentialLayers.encumbrance.isEncumbered ? 'Encumbered' : 'Nil Encumbrance'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-neutral-800">
                      {parcel.essentialLayers.encumbrance.chargeStatus}
                    </div>
                    {parcel.essentialLayers.encumbrance.certificateNumber && (
                      <div className="text-neutral-500">
                        Certificate: {parcel.essentialLayers.encumbrance.certificateNumber}
                      </div>
                    )}
                    {parcel.essentialLayers.encumbrance.financialInstitution && (
                      <div className="text-neutral-600 font-medium">
                        Lien Holder: {parcel.essentialLayers.encumbrance.financialInstitution} (Amount: {parcel.essentialLayers.encumbrance.mortgageAmount})
                      </div>
                    )}
                  </div>
                </div>
              )}

              {parcel.essentialLayers?.masterPlanZoning && (
                <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">Master Plan & Zoning</h4>
                      <PlainLanguageTooltip term="FAR" showIconOnly />
                    </div>
                    <span className="text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded font-semibold">
                      Urban Development
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Sanctioned Zone:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.masterPlanZoning.zoneName}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Permitted Use:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.masterPlanZoning.permittedLandUse}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Max FAR Allowed:</span>
                      <span className="font-semibold text-neutral-800">
                        {parcel.essentialLayers.masterPlanZoning.maxFarAllowed}
                      </span>
                    </div>
                    {parcel.essentialLayers.masterPlanZoning.setbackRequirements && (
                      <div>
                        <span className="text-neutral-500 block">Setbacks:</span>
                        <span className="font-semibold text-neutral-800">
                          {parcel.essentialLayers.masterPlanZoning.setbackRequirements}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Base Layer (Spatial & Cadastre) */}
          {activeTab === 'base' && (
            <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Spatial Foundation Layer (Base Layer)
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Cadastral boundaries georeferenced from Survey & Settlement Department
                  </p>
                </div>
                <DepartmentBadge department="SURVEY_SETTLEMENT" size="sm" />
              </div>

              {parcel.baseLayer ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-neutral-50 rounded border border-neutral-100 space-y-1">
                    <span className="text-neutral-500 block">Cadastral Sheet / FMB Ref:</span>
                    <span className="font-bold text-neutral-900">
                      {parcel.baseLayer.cadastralSheetNumber || parcel.baseLayer.fmbSketchRef || 'Survey Grid 2026'}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded border border-neutral-100 space-y-1">
                    <span className="text-neutral-500 block">Survey / Khasra Identifier:</span>
                    <span className="font-bold text-neutral-900">
                      {parcel.baseLayer.surveyNumber || 'Plot Standard Ref'}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded border border-neutral-100 space-y-1">
                    <span className="text-neutral-500 block">Geocoded Polygon Ref:</span>
                    <span className="font-mono font-medium text-neutral-800 text-[11px]">
                      {parcel.baseLayer.geoBoundaryRef || 'EPSG:4326 GeoJSON Poly'}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded border border-neutral-100 space-y-1">
                    <span className="text-neutral-500 block">Centroid Coordinates:</span>
                    <span className="font-mono font-medium text-neutral-800 text-[11px]">
                      Lat: {parcel.coordinates?.lat.toFixed(4)}, Lng: {parcel.coordinates?.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-500 py-4">No Base Layer data provided by P1 GIS layer.</p>
              )}
            </div>
          )}

          {/* TAB 4: Additional Layers (Utilities, Tax & Valuation) */}
          {activeTab === 'additional' && (
            <div className="space-y-4">
              {parcel.additionalLayers?.utilityInfrastructure && (
                <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-3">
                  <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-cyan-600" />
                    <span>Civic Utility Infrastructure IDs</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {parcel.additionalLayers.utilityInfrastructure.waterSupplyConsumerId && (
                      <div>
                        <span className="text-neutral-500 block">Water Supply ID:</span>
                        <span className="font-mono font-bold text-neutral-800">
                          {parcel.additionalLayers.utilityInfrastructure.waterSupplyConsumerId}
                        </span>
                      </div>
                    )}
                    {parcel.additionalLayers.utilityInfrastructure.powerGridConnectionId && (
                      <div>
                        <span className="text-neutral-500 block">Power Grid Service ID:</span>
                        <span className="font-mono font-bold text-neutral-800">
                          {parcel.additionalLayers.utilityInfrastructure.powerGridConnectionId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {parcel.additionalLayers?.propertyTax && (
                <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-3">
                  <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Municipal Property Tax</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Property Tax ID:</span>
                      <span className="font-mono font-semibold text-neutral-800">
                        {parcel.additionalLayers.propertyTax.propertyTaxId}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Demand Status:</span>
                      <span className="font-bold text-emerald-700 capitalize">
                        {parcel.additionalLayers.propertyTax.taxDemandStatus} ({parcel.additionalLayers.propertyTax.lastPaidFinancialYear})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {parcel.additionalLayers?.valuation && (
                <div className="bg-white rounded-card border border-neutral-200 p-5 shadow-subtle space-y-3">
                  <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <span>Valuation & Circle Rate Guidelines</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 block">Circle Rate Guideline:</span>
                      <span className="font-bold text-neutral-900">
                        {parcel.additionalLayers.valuation.circleRateGuidelineValue}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Assessed Valuation:</span>
                      <span className="font-bold text-emerald-700">
                        {parcel.additionalLayers.valuation.assessedMarketValue}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {parcel.additionalLayers?.environmentalRestrictions && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-card p-4 space-y-2 text-xs">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>Environmental & Heritage Zone Constraints</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1">
                    {parcel.additionalLayers.environmentalRestrictions.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI Diagnostics */}
          {activeTab === 'ai' && hasAi && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-700" />
                  <h3 className="text-sm font-bold text-indigo-950">
                    Automated AI / ML Diagnostic Alerts (Presenter-1)
                  </h3>
                </div>
                <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                  {parcel.aiFlags?.length} Alert{parcel.aiFlags && parcel.aiFlags.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {parcel.aiFlags?.map((flag) => (
                  <div
                    key={flag.id}
                    className="bg-white rounded border border-indigo-200 p-4 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                        <span>{flag.label}</span>
                      </span>
                      {flag.confidence !== undefined && (
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {Math.round(flag.confidence * 100)}% Confidence
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-700 leading-relaxed">{flag.description}</p>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>Source: {flag.sourceLayer}</span>
                      <span>Flagged: {new Date(flag.detectedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Cadastral Boundary Mini Map & Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-card border border-neutral-200 p-4 shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Cadastral Boundary Extent
              </h3>
              <PlainLanguageTooltip term="CadastralMap" showIconOnly />
            </div>
            <ParcelMap
              height={260}
              interactive={false}
              selectedParcelUlpin={parcel.ulpin}
              highlightedParcels={[
                {
                  ulpin: parcel.ulpin,
                  kind: verification?.status === 'conflict_detected' ? 'conflict' : 'selected',
                },
              ]}
            />
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>Cadastral Area:</span>
              <span className="font-semibold text-neutral-900">{formatArea(parcel.areaValue)}</span>
            </div>
          </div>

          {/* Quick Action Navigation Card */}
          <div className="bg-neutral-50 rounded-card border border-neutral-200 p-4 space-y-2">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-1">
              Available Citizen Actions
            </span>

            <Link
              to={`/citizen/parcels/${parcel.ulpin}/verification`}
              className="w-full flex items-center justify-between p-2.5 bg-white rounded border border-neutral-200 hover:border-primary text-xs font-medium text-neutral-800 transition-colors"
            >
              <span>Ownership Reconciliation Audit</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Link>

            <Link
              to={`/citizen/service-requests/new?ulpin=${parcel.ulpin}`}
              className="w-full flex items-center justify-between p-2.5 bg-white rounded border border-neutral-200 hover:border-primary text-xs font-medium text-neutral-800 transition-colors"
            >
              <span>Request Boundary Demarcation or Fard</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
