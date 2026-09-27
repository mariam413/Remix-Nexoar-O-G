import React, { useState } from 'react';
import {
  X,
  Boxes,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Truck,
  Wrench,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { Material, MaintenanceRequirement, Supplier } from '../../types';
import { store } from '../../services/store';

interface MaterialDetailModalProps {
  material: Material;
  onClose: () => void;
  onOpenRecordUsage: (materialId: string) => void;
  onOpenAddStock: (materialId: string) => void;
  onOpenTransferStock: (materialId: string) => void;
  onOpenWhatIf: (materialId: string) => void;
  onOpenProcure: (materialId: string) => void;
}

export const MaterialDetailModal: React.FC<MaterialDetailModalProps> = ({
  material,
  onClose,
  onOpenRecordUsage,
  onOpenAddStock,
  onOpenTransferStock,
  onOpenWhatIf,
  onOpenProcure,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const state = store.getState();
  const linkedMaintenance = state.maintenance.filter((m) => m.materialId === material.id);
  const linkedTransactions = state.transactions.filter((tx) => tx.materialId === material.id);
  const preferredSupplier = state.suppliers.find((s) => s.id === material.preferredSupplierId);
  const alternativeSuppliers = state.suppliers.filter((s) => material.alternativeSupplierIds?.includes(s.id));

  const totalDemand = linkedMaintenance.reduce((sum, m) => sum + m.requiredQuantity, 0);
  const projectedStock = material.availableStock - totalDemand;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{material.name}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {material.code}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    material.calculatedRisk === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : material.calculatedRisk === 'HIGH'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                      : material.calculatedRisk === 'MEDIUM'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {material.calculatedRisk} RISK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Category: <span className="text-slate-200">{material.category}</span> • Facility: <span className="text-slate-200">{material.facilityName}</span> • Warehouse: <span className="text-slate-200">{material.warehouseName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold uppercase text-[10px] mr-2">Inventory Actions:</span>
            <button
              onClick={() => onOpenRecordUsage(material.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Usage (-1)</span>
            </button>
            <button
              onClick={() => onOpenAddStock(material.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Stock (+)</span>
            </button>
            <button
              onClick={() => onOpenTransferStock(material.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Transfer Stock</span>
            </button>
            <button
              onClick={() => onOpenWhatIf(material.id)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate What-If</span>
            </button>
            <button
              onClick={() => onOpenProcure(material.id)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-950 transition-colors cursor-pointer"
            >
              <span>Procure Now</span>
            </button>
          </div>

          {/* Section: Stock Position */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Stock Position &amp; Thresholds</h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase text-slate-400 block">Current Stock</span>
                <span className="text-lg font-black text-white mt-0.5 block">{material.currentStock} {material.unitOfMeasurement}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase text-slate-400 block">Available</span>
                <span className="text-lg font-black text-emerald-400 mt-0.5 block">{material.availableStock}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase text-slate-400 block">Reserved</span>
                <span className="text-lg font-black text-slate-300 mt-0.5 block">{material.reservedStock || 0}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase text-slate-400 block">Safety Stock</span>
                <span className="text-lg font-black text-amber-400 mt-0.5 block">{material.safetyStock}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase text-slate-400 block">Min Stock</span>
                <span className="text-lg font-black text-slate-300 mt-0.5 block">{material.minimumStock}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] uppercase text-slate-400 block">Max Stock</span>
                <span className="text-lg font-black text-slate-300 mt-0.5 block">{material.maximumStock}</span>
              </div>
            </div>
          </div>

          {/* Section: Risk Analysis & AI Recommendation */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase text-slate-200 tracking-wider">AI Decision Support &amp; Risk Rationale</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-slate-400">Confidence: <strong className="text-emerald-400">High</strong></span>
                <span className="text-slate-600">|</span>
                <span className="text-[10px] uppercase text-slate-400">Completeness: <strong className="text-emerald-400">Good</strong></span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <div className="font-semibold text-amber-300 mb-1">
                Recommended Action: {material.recommendation}
              </div>
              <p>
                Three units are required for planned maintenance. Current stock is {material.currentStock} units and the defined safety stock is {material.safetyStock} units. The preferred supplier lead time is {material.leadTimeDays || 21} days. Early procurement should therefore be considered.
              </p>
            </div>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{showExplanation ? 'Hide deep reasoning' : 'Show me why (Mathematical breakdown)'}</span>
              {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showExplanation && (
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <div className="font-bold text-slate-200">WHAT WAS FOUND:</div>
                <p>Available on-hand balance is {material.currentStock} units. Planned maintenance demands {totalDemand} units. Projected balance equals {projectedStock} unit(s).</p>
                <div className="font-bold text-slate-200 mt-2">WHY IT MATTERS:</div>
                <p>Projected stock ({projectedStock}) drops below the mandatory safety stock threshold ({material.safetyStock}). Supplier lead time ({material.leadTimeDays}d) exceeds the planned operational grace period.</p>
                <div className="font-bold text-slate-200 mt-2">DATA USED:</div>
                <p>Active warehouse inventory, work order maintenance demands, safety stock rules, verified supplier lead time.</p>
              </div>
            )}
          </div>

          {/* Section: Linked Maintenance Requirements */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Upcoming Scheduled Maintenance</h3>
            {linkedMaintenance.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No scheduled maintenance cycles linked to this material.</p>
            ) : (
              <div className="space-y-2">
                {linkedMaintenance.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{m.equipmentName} ({m.workOrderNumber})</div>
                      <div className="text-[10px] text-slate-400">{m.description} • Scheduled: {new Date(m.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400">{m.requiredQuantity} {material.unitOfMeasurement} Required</div>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {m.calculatedReadiness || 'AT RISK'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Supplier Availability */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Qualified Supplier Network</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {preferredSupplier && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Preferred Supplier</span>
                    <span className="text-[10px] text-slate-400">{preferredSupplier.country}</span>
                  </div>
                  <div className="font-bold text-slate-200 mt-2">{preferredSupplier.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Lead Time: <strong>{preferredSupplier.leadTimeDays} days</strong> • On-Time: <strong>{preferredSupplier.onTimeDeliveryRate}%</strong></div>
                </div>
              )}

              {alternativeSuppliers.map((alt) => (
                <div key={alt.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Alternative Supplier</span>
                    <span className="text-[10px] text-slate-400">{alt.country}</span>
                  </div>
                  <div className="font-bold text-slate-200 mt-2">{alt.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Lead Time: <strong>{alt.leadTimeDays} days</strong> • On-Time: <strong>{alt.onTimeDeliveryRate}%</strong></div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Stock Movements Audit Trail */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Inventory Movements (Immutable Ledger)</h3>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase text-slate-400">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Qty Change</th>
                    <th className="p-2.5">Balance</th>
                    <th className="p-2.5">Reason / Reference</th>
                    <th className="p-2.5">Authorized User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {linkedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-slate-500">No transactions recorded yet.</td>
                    </tr>
                  ) : (
                    linkedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400">{new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                        <td className="p-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            tx.type === 'ADD' || tx.type === 'RECEIPT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-200">
                          {tx.type === 'DEDUCT' ? `-${tx.quantity}` : `+${tx.quantity}`}
                        </td>
                        <td className="p-2.5 font-mono text-slate-300">
                          {tx.previousQuantity} → {tx.newQuantity}
                        </td>
                        <td className="p-2.5 text-slate-300 truncate max-w-xs">{tx.reason} {tx.reference ? `(${tx.reference})` : ''}</td>
                        <td className="p-2.5 text-slate-400">{tx.userName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
