import React, { useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  CheckCircle,
  Truck,
  DollarSign,
  Clock,
  Boxes,
} from 'lucide-react';
import { store } from '../../services/store';
import { simulateWhatIfScenario } from '../../services/riskEngine';
import { Material } from '../../types';

interface WhatIfSimulatorProps {
  initialMaterialId?: string;
  onOpenProcure: (materialId: string, initialQty?: number) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  initialMaterialId,
  onOpenProcure,
}) => {
  const materials = store.getMaterials();
  const maintenance = store.getMaintenance();
  const suppliers = store.getSuppliers();

  // Selected Material
  const defaultMat = materials.find((m) => m.code === 'MS-P101-01') || materials[0];
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialMaterialId || defaultMat?.id || ''
  );

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId) || defaultMat;
  const linkedMaint = maintenance.find((m) => m.materialId === selectedMaterial?.id);
  const preferredSupplier = suppliers.find((s) => s.id === selectedMaterial?.preferredSupplierId);

  // Scenario Slider States
  const [supplierDelayDays, setSupplierDelayDays] = useState<number>(10); // Default to +10 days for immediate demo impact
  const [demandSpike, setDemandSpike] = useState<number>(0);
  const [maintenanceAdvanceDays, setMaintenanceAdvanceDays] = useState<number>(0);
  const [supplierUnavailable, setSupplierUnavailable] = useState<boolean>(false);
  const [enableRegionalTransfer, setEnableRegionalTransfer] = useState<boolean>(false);

  // Run simulation
  const simResult = selectedMaterial
    ? simulateWhatIfScenario(
        selectedMaterial,
        linkedMaint ? [linkedMaint] : [],
        {
          materialId: selectedMaterial.id,
          supplierDelayDays,
          demandIncreaseQty: demandSpike,
          maintenanceAdvanceDays,
          supplierUnavailable,
          stockTransferDelta: enableRegionalTransfer ? 2 : 0,
        },
        preferredSupplier ? [preferredSupplier] : []
      )
    : null;

  const handleResetSliders = () => {
    setSupplierDelayDays(0);
    setDemandSpike(0);
    setMaintenanceAdvanceDays(0);
    setSupplierUnavailable(false);
    setEnableRegionalTransfer(false);
  };

  if (!selectedMaterial || !simResult) {
    return <div className="p-8 text-center text-slate-400">Loading What-If Sandbox...</div>;
  }

  const isDowntimePredicted = simResult.after.projectedStock < 0 || simResult.after.leadTimeDays > 25;
  const estimatedDowntimeCostUSD = isDowntimePredicted ? 65000 * Math.max(1, Math.round(supplierDelayDays / 3)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>NEXORA What-If Disruption Simulator</span>
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Signature Feature
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate operational disruptions, demand spikes, and supplier delays to assess risk impact and evaluate mitigation options.
          </p>
        </div>

        <button
          onClick={handleResetSliders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Scenario</span>
        </button>
      </div>

      {/* Main Grid: Sandbox Controls vs Live Results */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Scenario Controls (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Disruption Parameters
            </h2>
            <span className="text-[10px] text-amber-400 font-medium">Real-time dynamic recalculation</span>
          </div>

          {/* Material Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Select Material &amp; Target Equipment
            </label>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code}) — Stock: {m.currentStock}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
              <span>Facility: {selectedMaterial.facilityName}</span>
              <span>Lead Time: {selectedMaterial.leadTimeDays || 21}d</span>
            </div>
          </div>

          {/* Baseline Summary Card */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Baseline Position</div>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">Stock</span>
                <span className="font-bold text-white text-sm">{selectedMaterial.currentStock}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Planned Demand</span>
                <span className="font-bold text-amber-400 text-sm">{linkedMaint?.requiredQuantity || 3}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Safety Stock</span>
                <span className="font-bold text-slate-300 text-sm">{selectedMaterial.safetyStock}</span>
              </div>
            </div>
          </div>

          {/* Slider 1: Supplier Delay */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Supplier Delivery Delay</span>
              </label>
              <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                +{supplierDelayDays} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={supplierDelayDays}
              onChange={(e) => setSupplierDelayDays(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>On Time (0d)</span>
              <span>+10d (Supply Chain Hitch)</span>
              <span>+30d (Port Congestion)</span>
            </div>
          </div>

          {/* Slider 2: Unplanned Demand Surge */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
                <span>Unplanned Demand Surge</span>
              </label>
              <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                +{demandSpike} Units
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={demandSpike}
              onChange={(e) => setDemandSpike(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Planned (0)</span>
              <span>+2 (Adjacent train failure)</span>
              <span>+5 (Major turnaround)</span>
            </div>
          </div>

          {/* Slider 3: Maintenance Advanced */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Advance Maintenance Window</span>
              </label>
              <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                {maintenanceAdvanceDays} Days Earlier
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={maintenanceAdvanceDays}
              onChange={(e) => setMaintenanceAdvanceDays(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>As Scheduled</span>
              <span>10d Earlier</span>
              <span>20d Urgent Fast-track</span>
            </div>
          </div>

          {/* Toggle 1: Supplier Stockout / Force Alternative */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Preferred Supplier Out-of-Stock</div>
              <div className="text-[10px] text-slate-400">Forces reliance on alternative or regional spot stock</div>
            </div>
            <input
              type="checkbox"
              checked={supplierUnavailable}
              onChange={(e) => setSupplierUnavailable(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          {/* Toggle 2: Mitigation - Regional Transfer */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/20">
            <div>
              <div className="text-xs font-semibold text-emerald-300">Test Mitigation: Transfer +2 Spares from Base</div>
              <div className="text-[10px] text-slate-400">Simulate inter-depot buffer replenishment</div>
            </div>
            <input
              type="checkbox"
              checked={enableRegionalTransfer}
              onChange={(e) => setEnableRegionalTransfer(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column: Dynamic Simulation Results & Mitigation (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Before vs After Comparison Card */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Simulation Impact Analysis
              </h2>
              <span className="text-xs text-slate-400">
                Material: <strong className="text-white">{selectedMaterial.name}</strong>
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* BEFORE CARD */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Baseline (Pre-Disruption)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Risk Assessment:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {simResult.before.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Supplier Lead Time:</span>
                  <span className="font-mono font-bold text-slate-200 text-xs">
                    {simResult.before.leadTimeDays} Days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Post-Maint Balance:</span>
                  <span className="font-mono font-bold text-slate-200 text-xs">
                    {simResult.before.projectedStock} Units
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Safety Buffer Status:</span>
                  <span className="text-amber-400 font-semibold text-xs">Below threshold</span>
                </div>
              </div>

              {/* AFTER CARD */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                simResult.after.riskLevel === 'CRITICAL'
                  ? 'bg-rose-950/30 border-rose-600/50'
                  : 'bg-amber-950/30 border-amber-600/50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                    Simulated Disruption Outcome
                  </span>
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Risk Assessment:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white animate-pulse">
                    {simResult.after.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Simulated Lead Time:</span>
                  <span className="font-mono font-bold text-rose-300 text-xs">
                    {simResult.after.leadTimeDays} Days ({supplierDelayDays > 0 ? `+${supplierDelayDays}d` : '0d'})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Post-Maint Balance:</span>
                  <span className={`font-mono font-bold text-xs ${simResult.after.projectedStock < 0 ? 'text-rose-400 text-sm' : 'text-amber-300'}`}>
                    {simResult.after.projectedStock} Units {simResult.after.projectedStock < 0 ? '(STOCKOUT)' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Recommendation:</span>
                  <span className="font-bold text-rose-300 text-xs uppercase">
                    {simResult.after.recommendation}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated Downtime Exposure Callout */}
            {estimatedDowntimeCostUSD > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/40 flex items-center justify-between text-xs text-rose-200">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Production Downtime Risk: ~${estimatedDowntimeCostUSD.toLocaleString()} USD</div>
                    <div className="text-[11px] text-rose-300/80">Crude export pump shutdown exposure if spare is unavailable on schedule date.</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-black text-xs">
                  SEVERE
                </span>
              </div>
            )}
          </div>

          {/* AI Recommended Mitigation Plan */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Evaluated Mitigation Actions
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              {/* Option 1 */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">Fast-Track Procurement with East Africa Mechanical Solutions</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Local stockist in Kampala has certified API 682 seals with rapid 7-day turnaround, circumventing the 31-day overseas delay.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenProcure(selectedMaterial.id, 2)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-sm"
                >
                  Issue RFQ Now
                </button>
              </div>

              {/* Option 2 */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-slate-100">Inter-Facility Logistics Transfer</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Central Logistics Hub (Warehouse B) holds 2 standby units. Execute internal transfer manifest to CPF-1 (2-day transport).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEnableRegionalTransfer(!enableRegionalTransfer)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs shrink-0 cursor-pointer"
                >
                  {enableRegionalTransfer ? 'Mitigation Active' : 'Simulate Transfer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
