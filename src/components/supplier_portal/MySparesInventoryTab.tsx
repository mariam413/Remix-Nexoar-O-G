import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  History,
  Edit2,
  Lock,
  ArrowUpDown,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { SupplierInventoryItem, StockMovement } from './supplierData';

interface MySparesInventoryTabProps {
  inventory: SupplierInventoryItem[];
  movements: StockMovement[];
  onAddInventory: (item: Omit<SupplierInventoryItem, 'id' | 'lastUpdated'>) => void;
  onAdjustQuantity: (id: string, delta: number, reason: string) => void;
  onReserveStock: (id: string, qty: number, reason: string) => void;
}

export const MySparesInventoryTab: React.FC<MySparesInventoryTabProps> = ({
  inventory,
  movements,
  onAddInventory,
  onAdjustQuantity,
  onReserveStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<SupplierInventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState('Stock delivery from factory batch replenishment');

  const [reserveTarget, setReserveTarget] = useState<SupplierInventoryItem | null>(null);
  const [reserveQty, setReserveQty] = useState<number>(2);
  const [reserveReason, setReserveReason] = useState('Customer quotation reservation hold');

  // New item form
  const [newItemForm, setNewItemForm] = useState({
    materialCode: '',
    materialName: '',
    category: 'Rotating Equipment',
    availableQuantity: 10,
    reservedQuantity: 0,
    availableToOffer: 10,
    unit: 'EA',
    warehouse: 'Kampala Warehouse',
    leadTimeDays: 7,
    status: 'Available' as const,
    unitPriceUGX: 2_000_000,
  });

  const warehouses = Array.from(new Set(inventory.map((i) => i.warehouse)));

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = selectedWarehouse === 'ALL' || item.warehouse === selectedWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  const totalAvailable = inventory.reduce((sum, i) => sum + i.availableQuantity, 0);
  const totalReserved = inventory.reduce((sum, i) => sum + i.reservedQuantity, 0);
  const totalToOffer = inventory.reduce((sum, i) => sum + i.availableToOffer, 0);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.materialCode || !newItemForm.materialName) return;
    onAddInventory({
      ...newItemForm,
      availableToOffer: newItemForm.availableQuantity - newItemForm.reservedQuantity,
    });
    setShowAddModal(false);
    setNewItemForm({
      materialCode: '',
      materialName: '',
      category: 'Rotating Equipment',
      availableQuantity: 10,
      reservedQuantity: 0,
      availableToOffer: 10,
      unit: 'EA',
      warehouse: 'Kampala Warehouse',
      leadTimeDays: 7,
      status: 'Available',
      unitPriceUGX: 2_000_000,
    });
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;
    onAdjustQuantity(adjustTarget.id, Number(adjustDelta), adjustReason);
    setAdjustTarget(null);
  };

  const handleExecuteReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveTarget) return;
    onReserveStock(reserveTarget.id, Number(reserveQty), reserveReason);
    setReserveTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#082746] dark:text-white tracking-tight">
              My Spares Inventory &amp; Stock Levels
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0A78B5] text-white text-xs font-bold shadow-sm">
              {inventory.length} Verified Lines
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Real-time physical inventory across ABC Industrial Supplies Ltd Ugandan depots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#082746] dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#00A6A6]" />
            <span>Movement History</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-[#0A78B5] hover:bg-[#086396] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-[#082746] dark:text-slate-400">Total Physical Stock</span>
          <div className="mt-2 text-2xl font-black text-[#082746] dark:text-white font-mono">
            {totalAvailable} <span className="text-xs font-sans font-medium text-slate-500">Units</span>
          </div>
          <span className="text-[10px] text-[#32B86A] font-semibold mt-1 block">In-warehouse verified</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-[#082746] dark:text-slate-400">Allocated / Reserved</span>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {totalReserved} <span className="text-xs font-sans font-medium text-slate-500">Units</span>
          </div>
          <span className="text-[10px] text-amber-700 font-medium mt-1 block">Committed to active orders &amp; tenders</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-[#082746] dark:text-slate-400">Available to Offer</span>
          <div className="mt-2 text-2xl font-black text-[#0A78B5] dark:text-sky-300 font-mono">
            {totalToOffer} <span className="text-xs font-sans font-medium text-slate-500">Units</span>
          </div>
          <span className="text-[10px] text-[#0A78B5] font-semibold mt-1 block">Uncommitted ready-to-sell</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material code, name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-[#082746] dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0A78B5]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-[#082746] dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#0A78B5] cursor-pointer"
          >
            <option value="ALL">All Warehouses ({warehouses.length})</option>
            {warehouses.map((wh) => (
              <option key={wh} value={wh}>
                {wh}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F4F8FA] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[#082746] dark:text-slate-200 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">Material Code</th>
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Available Qty</th>
                <th className="py-3 px-4 text-center">Reserved Qty</th>
                <th className="py-3 px-4 text-center bg-[#E0F4FA]/50 dark:bg-sky-950/40">Available to Offer</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Lead Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0A78B5] dark:text-sky-400">
                    {item.materialCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#082746] dark:text-white text-xs">
                      {item.materialName}
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-slate-400">
                      Est. Unit: UGX {item.unitPriceUGX.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#334155] dark:text-slate-300 font-medium">
                    {item.category}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#082746] dark:text-white">
                    {item.availableQuantity}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                    {item.reservedQuantity}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-sm text-[#0A78B5] dark:text-sky-300 bg-[#E0F4FA]/30 dark:bg-sky-950/20">
                    {item.availableToOffer}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] dark:text-slate-400">
                    {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-[#334155] dark:text-slate-200">
                    {item.warehouse}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#082746] dark:text-slate-200">
                    {item.leadTimeDays} days
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                        item.status === 'Available'
                          ? 'bg-[#32B86A]'
                          : 'bg-amber-500'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] dark:text-slate-400 whitespace-nowrap text-[11px]">
                    {item.lastUpdated}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setAdjustTarget(item);
                          setAdjustDelta(5);
                        }}
                        title="Adjust Quantity"
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-[#082746] dark:text-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Adjust
                      </button>
                      <button
                        onClick={() => {
                          setReserveTarget(item);
                          setReserveQty(1);
                        }}
                        title="Reserve Stock"
                        className="px-2.5 py-1 rounded-md bg-[#0A78B5] hover:bg-[#086396] text-white text-xs font-bold cursor-pointer shadow-sm"
                      >
                        Reserve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Inventory Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B63] dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0B78B5]" />
                <span>Add Spares Line to Supplier Inventory</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Material Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CV-401"
                    value={newItemForm.materialCode}
                    onChange={(e) => setNewItemForm({ ...newItemForm, materialCode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Category</label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                  >
                    <option value="Rotating Equipment">Rotating Equipment</option>
                    <option value="Bearings">Bearings</option>
                    <option value="Valves">Valves</option>
                    <option value="Filtration">Filtration</option>
                    <option value="Instrumentation">Instrumentation</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High Pressure Check Valve CV-401"
                  value={newItemForm.materialName}
                  onChange={(e) => setNewItemForm({ ...newItemForm, materialName: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Initial Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemForm.availableQuantity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, availableQuantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemForm.leadTimeDays}
                    onChange={(e) => setNewItemForm({ ...newItemForm, leadTimeDays: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Unit Price (UGX)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={newItemForm.unitPriceUGX}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unitPriceUGX: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Warehouse Depot</label>
                <select
                  value={newItemForm.warehouse}
                  onChange={(e) => setNewItemForm({ ...newItemForm, warehouse: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                >
                  <option value="Kampala Warehouse">Kampala Central Warehouse (6th Street)</option>
                  <option value="Main Warehouse">Hoima Staging Yard Depot</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[#123B63] dark:text-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B78B5] hover:bg-[#09669B] text-white font-bold cursor-pointer shadow-sm"
                >
                  Save Material to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Quantity */}
      {adjustTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B63] dark:text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[#0B78B5]" />
                <span>Adjust Stock: {adjustTarget.materialCode}</span>
              </h3>
              <button onClick={() => setAdjustTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjust} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-[#123B63] dark:text-white">{adjustTarget.materialName}</div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                  Current Physical: <strong className="text-[#123B63] dark:text-white">{adjustTarget.availableQuantity} units</strong> | Reserved: {adjustTarget.reservedQuantity}
                </div>
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">
                  Quantity Adjustment (+ to Add, - to Write-off)
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white font-mono font-bold"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  New Balance: <strong className="text-[#0B78B5]">{adjustTarget.availableQuantity + Number(adjustDelta)} units</strong>
                </span>
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Adjustment Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustTarget(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[#123B63] dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B78B5] hover:bg-[#09669B] text-white font-bold cursor-pointer"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reserve Stock */}
      {reserveTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B63] dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Reserve Stock: {reserveTarget.materialCode}</span>
              </h3>
              <button onClick={() => setReserveTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteReserve} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
                <div className="font-bold text-[#123B63] dark:text-white">{reserveTarget.materialName}</div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
                  Currently Available to Offer: <strong className="text-[#087EA4]">{reserveTarget.availableToOffer} units</strong>
                </div>
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">
                  Units to Hold / Reserve
                </label>
                <input
                  type="number"
                  min="1"
                  max={reserveTarget.availableToOffer}
                  required
                  value={reserveQty}
                  onChange={(e) => setReserveQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Reservation Reference / Purpose</label>
                <input
                  type="text"
                  required
                  value={reserveReason}
                  onChange={(e) => setReserveReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReserveTarget(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[#123B63] dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Lock Reserved Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Movement History */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B63] dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#00A6A6]" />
                <span>Simulated Warehouse Stock Movement Audit Log</span>
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {movements.map((m) => (
                <div key={m.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#123B63] dark:text-sky-300">{m.materialCode}</span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{m.materialName}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {m.reference}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">{m.reason}</p>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{m.timestamp}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-sm block ${
                        m.quantityDelta > 0 ? 'text-[#32B86A]' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta} units
                    </span>
                    <span className="text-[10px] text-slate-500 block">Balance: {m.newBalance}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#123B63] font-bold cursor-pointer"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
