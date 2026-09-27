import React, { useState } from 'react';
import {
  PackageSearch,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  Sliders,
  History,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  FileText,
  Boxes,
} from 'lucide-react';
import { store } from '../../services/store';
import { TransactionType } from '../../types';

interface InventoryViewProps {
  initialMaterialId?: string;
  onOpenWhatIf: (materialId?: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  initialMaterialId,
  onOpenWhatIf,
}) => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'TRANSACTIONS'>('STOCK');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const materials = store.getMaterials();
  const transactions = store.getTransactions();
  const equipment = store.getEquipment();
  const warehouses = store.getWarehouses();

  // Usage Form State
  const [usageForm, setUsageForm] = useState({
    materialId: initialMaterialId || materials[0]?.id || '',
    quantityUsed: 1,
    reason: 'Crude pump mechanical seal overhaul (WO-2026-0891)',
    equipmentId: equipment[0]?.id || '',
    workOrder: 'WO-2026-0891',
    notes: 'Routine maintenance wear replacement',
  });

  // Add Stock Form State
  const [addForm, setAddForm] = useState({
    materialId: initialMaterialId || materials[0]?.id || '',
    quantity: 2,
    source: 'Regional Supply Base Restock',
    purchaseOrder: 'PO-2026-0312',
    deliveryReference: 'DEL-UG-99120',
    notes: 'Inward goods inspection passed',
  });

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    materialId: initialMaterialId || materials[0]?.id || '',
    fromWarehouseId: warehouses[0]?.id || '',
    toWarehouseId: warehouses[1]?.id || '',
    quantity: 1,
    reason: 'Staging ready spares at CPF workshop locker',
    reference: 'TRF-WH-004',
  });

  const handleUsageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.recordMaterialUsage({
      materialId: usageForm.materialId,
      quantityUsed: Number(usageForm.quantityUsed),
      reason: usageForm.reason,
      equipmentId: usageForm.equipmentId,
      workOrder: usageForm.workOrder,
      notes: usageForm.notes,
    });

    if (!res.success) {
      alert(res.error || 'Failed to record usage');
      return;
    }

    setShowUsageModal(false);
    setActiveTab('TRANSACTIONS');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.addStock({
      materialId: addForm.materialId,
      quantity: Number(addForm.quantity),
      source: addForm.source,
      purchaseOrder: addForm.purchaseOrder,
      deliveryReference: addForm.deliveryReference,
      notes: addForm.notes,
    });

    if (!res.success) {
      alert(res.error || 'Failed to add stock');
      return;
    }

    setShowAddModal(false);
    setActiveTab('TRANSACTIONS');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.transferStock({
      materialId: transferForm.materialId,
      fromWarehouseId: transferForm.fromWarehouseId,
      toWarehouseId: transferForm.toWarehouseId,
      quantity: Number(transferForm.quantity),
      reason: transferForm.reason,
      reference: transferForm.reference,
    });

    if (!res.success) {
      alert(res.error || 'Failed to transfer stock');
      return;
    }

    setShowTransferModal(false);
    setActiveTab('TRANSACTIONS');
  };

  // Filtered lists
  const filteredMaterials = materials.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-amber-400" />
            <span>Industrial Inventory Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock ledger, immutable movements audit, and automated risk recalculation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUsageModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Record Usage (-1)</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Add Stock (+)</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/40 text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Spares</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer ${
              activeTab === 'STOCK'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Current Stock Position ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab('TRANSACTIONS')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'TRANSACTIONS'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Transaction Ledger ({transactions.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search spare or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {activeTab === 'TRANSACTIONS' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none"
            >
              <option value="all">All Movement Types</option>
              <option value="ADD">ADD (Stock Inward)</option>
              <option value="DEDUCT">DEDUCT (Usage)</option>
              <option value="TRANSFER">TRANSFER (Inter-wh)</option>
              <option value="RECEIPT">RECEIPT (PO Inward)</option>
              <option value="ADJUST">ADJUST (Correction)</option>
            </select>
          )}
        </div>
      </div>

      {/* Tab: Stock Position */}
      {activeTab === 'STOCK' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-3">Warehouse</th>
                  <th className="py-3 px-3 text-center">On Hand</th>
                  <th className="py-3 px-3 text-center">Available</th>
                  <th className="py-3 px-3 text-center">Safety Stock</th>
                  <th className="py-3 px-3">Lead Time</th>
                  <th className="py-3 px-3">Risk Assessment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredMaterials.map((mat) => {
                  const isBelowSafety = mat.currentStock <= mat.safetyStock;
                  return (
                    <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">{mat.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{mat.code} • {mat.category}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div>{mat.warehouseName}</div>
                        <div className="text-[10px] text-slate-500">{mat.storageLocation}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`font-bold text-sm ${isBelowSafety ? 'text-rose-400' : 'text-slate-100'}`}>
                          {mat.currentStock}
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">{mat.unitOfMeasurement}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-400 font-bold">
                        {mat.availableStock}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-amber-400 font-semibold">
                        {mat.safetyStock}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {mat.leadTimeDays || 21} days
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            mat.calculatedRisk === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : mat.calculatedRisk === 'HIGH'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                              : mat.calculatedRisk === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {mat.calculatedRisk}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setUsageForm({ ...usageForm, materialId: mat.id });
                              setShowUsageModal(true);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => {
                              setAddForm({ ...addForm, materialId: mat.id });
                              setShowAddModal(true);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Restock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Transaction Ledger */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tx ID &amp; Date</th>
                  <th className="py-3 px-3">Movement Type</th>
                  <th className="py-3 px-3">Material</th>
                  <th className="py-3 px-3 text-center">Quantity Delta</th>
                  <th className="py-3 px-3 text-center">New Balance</th>
                  <th className="py-3 px-3">Reason / Operational Work Order</th>
                  <th className="py-3 px-4 text-right">Authorized User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => {
                  const isDeduct = tx.type === 'DEDUCT';
                  const isAdd = tx.type === 'ADD' || tx.type === 'RECEIPT';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-300 font-bold">{tx.id.substring(0, 16)}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isAdd
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isDeduct
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{tx.materialName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{tx.materialCode}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                        <span className={isDeduct ? 'text-rose-400' : isAdd ? 'text-emerald-400' : 'text-blue-400'}>
                          {isDeduct ? `-${tx.quantity}` : `+${tx.quantity}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {tx.previousQuantity} → <strong className="text-white">{tx.newQuantity}</strong>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div>{tx.reason}</div>
                        {tx.workOrder && <div className="text-[10px] font-mono text-amber-400">WO: {tx.workOrder}</div>}
                        {tx.reference && <div className="text-[10px] font-mono text-slate-400">Ref: {tx.reference}</div>}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {tx.userName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Usage Modal (Section 22) */}
      {showUsageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-amber-400" />
                <span>Record Material Usage (Step 4 Demo)</span>
              </h3>
              <button onClick={() => setShowUsageModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUsageSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Spare Material *</label>
                <select
                  value={usageForm.materialId}
                  onChange={(e) => setUsageForm({ ...usageForm, materialId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code}) — Stock: {m.currentStock} {m.unitOfMeasurement}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Used *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={usageForm.quantityUsed}
                    onChange={(e) => setUsageForm({ ...usageForm, quantityUsed: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Equipment</label>
                  <select
                    value={usageForm.equipmentId}
                    onChange={(e) => setUsageForm({ ...usageForm, equipmentId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    {equipment.map((eq) => (
                      <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Order / Maintenance Task</label>
                <input
                  type="text"
                  value={usageForm.workOrder}
                  onChange={(e) => setUsageForm({ ...usageForm, workOrder: e.target.value })}
                  placeholder="e.g. WO-2026-0891"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Withdrawal</label>
                <textarea
                  rows={2}
                  required
                  value={usageForm.reason}
                  onChange={(e) => setUsageForm({ ...usageForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-300">
                Notice: Deducting this unit will immediately update physical inventory and trigger deterministic recalculation of supply readiness.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUsageModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Deduct &amp; Recalculate Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal (Section 21) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Add Stock (Inward Receipt)</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Material *</label>
                <select
                  value={addForm.materialId}
                  onChange={(e) => setAddForm({ ...addForm, materialId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code}) — Current: {m.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Received *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Source</label>
                  <input
                    type="text"
                    value={addForm.source}
                    onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Purchase Order Reference</label>
                  <input
                    type="text"
                    value={addForm.purchaseOrder}
                    onChange={(e) => setAddForm({ ...addForm, purchaseOrder: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Delivery / Waybill Ref</label>
                  <input
                    type="text"
                    value={addForm.deliveryReference}
                    onChange={(e) => setAddForm({ ...addForm, deliveryReference: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer"
                >
                  Confirm Inward Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal (Section 23) */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                <span>Inter-Warehouse Stock Transfer</span>
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Material to Transfer *</label>
                <select
                  value={transferForm.materialId}
                  onChange={(e) => setTransferForm({ ...transferForm, materialId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code}) — Current: {m.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">From Warehouse *</label>
                  <select
                    value={transferForm.fromWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">To Destination Warehouse *</label>
                  <select
                    value={transferForm.toWarehouseId}
                    onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Transfer Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Transfer Manifest Ref</label>
                  <input
                    type="text"
                    value={transferForm.reference}
                    onChange={(e) => setTransferForm({ ...transferForm, reference: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Transfer Justification</label>
                <textarea
                  rows={2}
                  value={transferForm.reason}
                  onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold cursor-pointer"
                >
                  Execute Transfer Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
