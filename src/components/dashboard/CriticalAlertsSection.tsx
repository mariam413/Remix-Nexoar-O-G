import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Truck,
  Sparkles,
  Sliders,
  Package,
  ArrowRight,
  Eye,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  TrendingDown,
  ExternalLink,
  DollarSign,
  Layers,
  Compass,
} from 'lucide-react';
import { Material, MaintenanceRequirement, Supplier, Order, Equipment } from '../../types';
import {
  PredictedSupplyChainDelayAlert,
  getPredictedSupplyChainDelayAlerts,
} from '../../services/riskEngine';

interface CriticalAlertsSectionProps {
  materials: Material[];
  maintenance: MaintenanceRequirement[];
  suppliers: Supplier[];
  orders: Order[];
  equipment: Equipment[];
  onNavigate: (view: string, id?: string) => void;
  onOpenMaterialModal: (material: Material) => void;
  onOpenWhatIf?: (materialId: string) => void;
  onOpenProcureModal?: (materialId: string) => void;
  selectedFacilityId?: string;
}

export const CriticalAlertsSection: React.FC<CriticalAlertsSectionProps> = ({
  materials,
  maintenance,
  suppliers,
  orders,
  equipment,
  onNavigate,
  onOpenMaterialModal,
  onOpenWhatIf,
  onOpenProcureModal,
  selectedFacilityId = 'all',
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'TRANSIT' | 'BUFFER'>('ALL');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  // Compute live alerts using deterministic AI intelligence engine
  const allAlerts = getPredictedSupplyChainDelayAlerts(
    materials,
    maintenance,
    suppliers,
    orders,
    equipment
  );

  // Filter by facility if selected
  const facilityAlerts = selectedFacilityId === 'all'
    ? allAlerts
    : allAlerts.filter((a) => a.facilityId === selectedFacilityId);

  // Filter by category tab
  const filteredAlerts = facilityAlerts.filter((alert) => {
    if (filterType === 'CRITICAL') return alert.urgency === 'CRITICAL';
    if (filterType === 'TRANSIT') return alert.alertType === 'ACTIVE_TRANSIT';
    if (filterType === 'BUFFER') return alert.alertType === 'BUFFER_DEPLETION' || alert.alertType === 'DEADLINE_CLASH';
    return true;
  });

  const totalDowntimeRisk = facilityAlerts.reduce((sum, a) => sum + a.downtimeCostPerDayUsd, 0);
  const criticalCount = facilityAlerts.filter((a) => a.urgency === 'CRITICAL').length;
  const transitDelayCount = facilityAlerts.filter((a) => a.alertType === 'ACTIVE_TRANSIT').length;

  const handleToggleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (facilityAlerts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-900 shadow-2xl overflow-hidden transition-all duration-200">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 border-b border-rose-900/40 bg-rose-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-rose-950/50">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Critical Alerts: Predicted Supply Chain Delays</span>
                </h2>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  AI Intelligence Active
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold">
                  {facilityAlerts.length} Materials At Risk
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Deterministic AI models identified predicted supplier delivery variances, cross-border corridor friction, and maintenance buffer breaches.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Collapse Toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end lg:self-center">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
              <span className="text-slate-400">Total Downtime Exposure:</span>
              <span className="font-mono font-bold text-rose-400">
                ${totalDowntimeRisk.toLocaleString()}/day
              </span>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{isCollapsed ? 'Expand Alerts' : 'Collapse'}</span>
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        {!isCollapsed && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-rose-900/30 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterType === 'ALL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span>All Delay Forecasts ({facilityAlerts.length})</span>
            </button>
            <button
              onClick={() => setFilterType('CRITICAL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterType === 'CRITICAL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Critical Deadline Clashes ({criticalCount})</span>
            </button>
            <button
              onClick={() => setFilterType('TRANSIT')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterType === 'TRANSIT'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Truck className="w-3 h-3 text-amber-400" />
              <span>Active Transit Delays ({transitDelayCount})</span>
            </button>
            <button
              onClick={() => setFilterType('BUFFER')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterType === 'BUFFER'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <TrendingDown className="w-3 h-3 text-orange-400" />
              <span>Buffer Exhaustion Spares</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Alerts Cards Grid */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5 space-y-4">
          {filteredAlerts.map((alert) => {
            const material = materials.find((m) => m.id === alert.materialId);
            const isAcknowledged = acknowledgedIds.has(alert.id);
            const isCritical = alert.urgency === 'CRITICAL';

            return (
              <div
                key={alert.id}
                className={`rounded-xl border transition-all ${
                  isAcknowledged
                    ? 'bg-slate-900/60 border-slate-800 opacity-75'
                    : isCritical
                    ? 'bg-slate-950/80 border-rose-500/50 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800'
                } p-4 sm:p-5 space-y-4`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1.5 ${
                        isCritical
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{alert.urgency} DELAY RISK</span>
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {alert.materialName}
                        </h3>
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          ({alert.materialCode})
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>Equipment: <strong className="text-slate-200">{alert.equipmentName}</strong></span>
                        <span>•</span>
                        <span>Facility: <span className="text-slate-300">{alert.facilityName}</span></span>
                        {alert.workOrderNumber && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-mono">WO: {alert.workOrderNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Right Badges */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>+{alert.predictedDelayDays} Days Delay Forecast</span>
                    </div>
                    <button
                      onClick={() => handleToggleAcknowledge(alert.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1 ${
                        isAcknowledged
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title={isAcknowledged ? 'Mark as active' : 'Acknowledge alert'}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isAcknowledged ? 'Reviewed' : 'Acknowledge'}</span>
                    </button>
                  </div>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Nominal Lead Time
                    </span>
                    <span className="text-base font-mono font-bold text-slate-200 mt-0.5 block">
                      {alert.nominalLeadTimeDays} Days
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                      Via {alert.supplierName}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/50">
                    <span className="text-[10px] uppercase font-semibold text-rose-300 block">
                      AI Projected Lead Time
                    </span>
                    <span className="text-base font-mono font-black text-rose-400 mt-0.5 block">
                      {alert.totalProjectedLeadTimeDays} Days
                    </span>
                    <span className="text-[10px] text-rose-300 font-bold block mt-0.5">
                      +{alert.predictedDelayDays}d logistics variance
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Warehouse Stock Balance
                    </span>
                    <span className="text-base font-mono font-bold text-slate-100 mt-0.5 block">
                      {alert.currentStock} {alert.unitOfMeasurement}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Safety Reserve: {alert.safetyStock} {alert.unitOfMeasurement}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Schedule Buffer Delta
                    </span>
                    <span
                      className={`text-base font-mono font-bold mt-0.5 block ${
                        alert.bufferImpactDays != null && alert.bufferImpactDays < 0
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {alert.bufferImpactDays != null
                        ? alert.bufferImpactDays < 0
                          ? `${alert.bufferImpactDays} Days (Late)`
                          : `+${alert.bufferImpactDays} Days Buffer`
                        : 'Immediate Demand'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {alert.workOrderDate ? `Required: ${alert.workOrderDate}` : 'Operational Spare'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Downtime Cost Exposure
                    </span>
                    <span className="text-base font-mono font-black text-amber-400 mt-0.5 block">
                      ${alert.downtimeCostPerDayUsd.toLocaleString()}/day
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Asset downtime exposure
                    </span>
                  </div>
                </div>

                {/* Explainable AI Intelligence Rationale Box */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Predictive Intelligence Rationale</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      Model Confidence: {alert.aiExplanation.confidenceScore}%
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Predictive Choke Point:
                      </span>
                      <p className="text-slate-200 mt-0.5 leading-relaxed text-[11px]">
                        {alert.aiExplanation.predictiveSignal}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Operational Impact:
                      </span>
                      <p className="text-slate-300 mt-0.5 leading-relaxed text-[11px]">
                        {alert.aiExplanation.whyItMatters}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">
                        Recommended Mitigation:
                      </span>
                      <p className="text-amber-200 font-medium mt-0.5 leading-relaxed text-[11px]">
                        {alert.aiExplanation.recommendedMitigation}
                      </p>
                    </div>
                  </div>

                  {/* Signal Tags */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      Telemetry Signals Grounded:
                    </span>
                    {alert.aiExplanation.keySignals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700/60"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {material && (
                      <button
                        onClick={() => onOpenMaterialModal(material)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inspect Material Spec</span>
                      </button>
                    )}

                    {alert.activeOrderId && (
                      <button
                        onClick={() => onNavigate('orders', alert.activeOrderId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track PO ({alert.activeOrderNumber})</span>
                      </button>
                    )}

                    <button
                      onClick={() => onNavigate('suppliers')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-slate-400" />
                      <span>Qualified Suppliers</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Run What-If Scenario with this material */}
                    <button
                      onClick={() => {
                        if (onOpenWhatIf) {
                          onOpenWhatIf(alert.materialId);
                        } else {
                          onNavigate('whatif');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 text-xs font-bold border border-sky-400/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-sky-400" />
                      <span>Simulate +{alert.predictedDelayDays}d Delay in What-If</span>
                    </button>

                    {/* Fast-Track Procurement / Issue PR */}
                    {onOpenProcureModal && (
                      <button
                        onClick={() => onOpenProcureModal(alert.materialId)}
                        className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-sky-500/20 transition-colors cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Fast-Track Procurement</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
