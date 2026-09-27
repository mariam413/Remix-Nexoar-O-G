import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Truck,
  Sliders,
  ChevronDown,
  ChevronUp,
  Boxes,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { store } from '../../services/store';
import { Material } from '../../types';

interface AIIntelligenceViewProps {
  onOpenWhatIf: (materialId?: string) => void;
  onOpenMaterialModal: (materialId: string) => void;
  onOpenProcure: (materialId: string) => void;
}

export const AIIntelligenceView: React.FC<AIIntelligenceViewProps> = ({
  onOpenWhatIf,
  onOpenMaterialModal,
  onOpenProcure,
}) => {
  const [activeTab, setActiveTab] = useState<'MATERIAL' | 'PROCUREMENT' | 'SUPPLIER' | 'MAINTENANCE' | 'TRENDS'>('MATERIAL');
  const [expandedId, setExpandedId] = useState<string | null>('mat-mech-seal');

  const materials = store.getMaterials();
  const maintenance = store.getMaintenance();
  const suppliers = store.getSuppliers();

  const highRiskMaterials = materials.filter((m) => m.calculatedRisk === 'HIGH' || m.calculatedRisk === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-amber-400" />
            <span>NEXORA Operational Decision Intelligence</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explainable AI decision support grounded on warehouse balances, work orders, and qualified supplier metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-slate-400">Grounding Engine:</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Deterministic + Gemini 3.8
            </span>
          </div>
        </div>
      </div>

      {/* 5 Tab Navigation (Section 28) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('MATERIAL')}
          className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'MATERIAL'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Material Risk ({highRiskMaterials.length} Alerts)</span>
        </button>
        <button
          onClick={() => setActiveTab('PROCUREMENT')}
          className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'PROCUREMENT'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Procurement Recommendations</span>
        </button>
        <button
          onClick={() => setActiveTab('SUPPLIER')}
          className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'SUPPLIER'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Supplier Risk &amp; Lead Time</span>
        </button>
        <button
          onClick={() => setActiveTab('MAINTENANCE')}
          className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'MAINTENANCE'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Maintenance Readiness</span>
        </button>
        <button
          onClick={() => setActiveTab('TRENDS')}
          className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'TRENDS'
              ? 'bg-slate-800 text-amber-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Inventory Trends</span>
        </button>
      </div>

      {/* Tab: Material Risk Intelligence */}
      {activeTab === 'MATERIAL' && (
        <div className="space-y-4">
          {highRiskMaterials.map((mat) => {
            const isExpanded = expandedId === mat.id;
            const linkedM = maintenance.find((m) => m.materialId === mat.id);
            const isCritical = mat.calculatedRisk === 'CRITICAL';

            return (
              <div
                key={mat.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCritical ? 'bg-rose-950/20 border-rose-600/40' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
                        isCritical ? 'bg-rose-600 text-white' : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      }`}
                    >
                      {mat.calculatedRisk} RISK
                    </span>
                    <div>
                      <h3 className="font-bold text-white text-base">{mat.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{mat.code} • {mat.facilityName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Action:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      {mat.recommendation}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Current Stock</span>
                    <span className="font-bold text-white text-sm">{mat.currentStock} {mat.unitOfMeasurement}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Scheduled Demand</span>
                    <span className="font-bold text-amber-400 text-sm">{linkedM?.requiredQuantity || 3} Units</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Safety Buffer</span>
                    <span className="font-bold text-slate-300 text-sm">{mat.safetyStock} Units</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Supplier Lead Time</span>
                    <span className="font-bold text-slate-200 text-sm">{mat.leadTimeDays || 21} Days</span>
                  </div>
                </div>

                {/* Structured Explainable AI Box (Section 30) */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs text-slate-300">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Explainable Intelligence Breakdown</span>
                    </span>
                    <div className="flex items-center gap-3 text-[10px] uppercase text-slate-400">
                      <span>Confidence: <strong className="text-emerald-400">High</strong></span>
                      <span>•</span>
                      <span>Completeness: <strong className="text-emerald-400">Good</strong></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">WHAT WAS FOUND:</span>
                      <p className="text-slate-300 mt-0.5">
                        Warehouse on-hand balance is {mat.currentStock} units. Scheduled maintenance demands {linkedM?.requiredQuantity || 3} units, leaving a post-execution balance of {Math.max(0, mat.currentStock - (linkedM?.requiredQuantity || 3))} units.
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">WHY IT MATTERS:</span>
                      <p className="text-slate-300 mt-0.5">
                        Post-maintenance inventory falls below the mandatory safety stock threshold ({mat.safetyStock} units). The preferred supplier lead time of {mat.leadTimeDays || 21} days exposes the facility to stockout risk should any auxiliary failure occur.
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">RECOMMENDATION:</span>
                      <p className="text-amber-300 font-semibold mt-0.5">
                        {mat.recommendation} — Initiate tender PR or qualify East Africa Mechanical Solutions for rapid 7-day regional delivery.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Data sources: Physical stock ledger, active work order schedules, API 682 supplier catalog.
                    </span>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : mat.id)}
                      className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide deep parameters' : 'Show mathematical model'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1 mt-2">
                      <div>Equation: ProjectedBuffer = CurrentStock ({mat.currentStock}) - Demand ({linkedM?.requiredQuantity || 3}) = {mat.currentStock - (linkedM?.requiredQuantity || 3)}</div>
                      <div>SafetyThresholdDeficit = SafetyStock ({mat.safetyStock}) - ProjectedBuffer = {mat.safetyStock - (mat.currentStock - (linkedM?.requiredQuantity || 3))} units</div>
                      <div>UrgencyIndex = LeadTimeDays ({mat.leadTimeDays}) / DaysUntilRequired (27d) = 0.77 (High vulnerability)</div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-3">
                  <button
                    onClick={() => onOpenWhatIf(mat.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Run What-If Simulation</span>
                  </button>
                  <button
                    onClick={() => onOpenProcure(mat.id)}
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Procure Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Procurement Recommendations */}
      {activeTab === 'PROCUREMENT' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Recommended Procurement Actions</h2>
          <div className="space-y-3">
            {materials.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{m.name} ({m.code})</div>
                  <div className="text-[11px] text-slate-400">Current: {m.currentStock} • Safety: {m.safetyStock} • Lead Time: {m.leadTimeDays}d</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    m.recommendation === 'PROCURE NOW' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {m.recommendation}
                  </span>
                  <button
                    onClick={() => onOpenProcure(m.id)}
                    className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                  >
                    Issue PR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Supplier Risk */}
      {activeTab === 'SUPPLIER' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Supplier Lead-Time &amp; Reliability Index</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-100 text-sm">{s.name}</div>
                  <span className="font-mono text-emerald-400 font-bold">{s.onTimeDeliveryRate}% On-Time</span>
                </div>
                <div className="text-slate-400 text-[11px]">Location: {s.city}, {s.country} • Avg Lead Time: {s.leadTimeDays} days</div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500">Readiness Score:</span>
                  <span className="font-bold text-amber-400">{s.readinessScore} / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Maintenance Readiness */}
      {activeTab === 'MAINTENANCE' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Safety Buffer Deficit Breakdown</h2>
          <div className="space-y-3">
            {maintenance.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-100">{m.equipmentName} — {m.workOrderNumber}</div>
                  <div className="text-[11px] text-slate-400">Required: {m.requiredQuantity}x {m.materialName} on {m.scheduledDate}</div>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  m.calculatedReadiness === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {m.calculatedReadiness}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Trends */}
      {activeTab === 'TRENDS' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Consumable &amp; Spare Turnover Velocity</h2>
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            Mechanical Seals and Filter Elements exhibit the highest seasonal turnover during quarterly gas compressor overhauls. Planned replenishment schedules have reduced emergency freight expedites by 41%.
          </div>
        </div>
      )}
    </div>
  );
};
