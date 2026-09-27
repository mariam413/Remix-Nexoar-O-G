import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Boxes,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { store } from '../../services/store';
import { MaintenanceRequirement, CriticalityLevel } from '../../types';

interface MaintenanceViewProps {
  onOpenMaterialModal: (materialId: string) => void;
  onOpenWhatIf: (materialId: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  onOpenMaterialModal,
  onOpenWhatIf,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const maintenance = store.getMaintenance();
  const materials = store.getMaterials();
  const equipment = store.getEquipment();
  const facilities = store.getFacilities();

  // Add Maintenance Form
  const [formData, setFormData] = useState({
    equipmentId: equipment[0]?.id || '',
    materialId: materials[0]?.id || '',
    maintenanceType: 'Preventive Maintenance' as MaintenanceRequirement['maintenanceType'],
    workOrderNumber: `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    description: 'Quarterly seal replacement and inspection',
    scheduledDate: '2026-11-15',
    requiredQuantity: 2,
    criticality: 'High' as CriticalityLevel,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eq = equipment.find((e) => e.id === formData.equipmentId);
    const mat = materials.find((m) => m.id === formData.materialId);
    const fac = facilities.find((f) => f.id === eq?.facilityId);

    store.addMaintenanceRequirement({
      organizationId: store.getCurrentOrganization().id,
      equipmentId: formData.equipmentId,
      equipmentName: eq?.name || 'Production Unit',
      facilityId: eq?.facilityId || facilities[0]?.id,
      facilityName: fac?.name || 'Main Facility',
      workOrderNumber: formData.workOrderNumber,
      maintenanceType: formData.maintenanceType,
      description: formData.description,
      scheduledDate: formData.scheduledDate,
      materialId: formData.materialId,
      materialName: mat?.name || 'Critical Spare',
      requiredQuantity: Number(formData.requiredQuantity),
      criticality: formData.criticality,
      status: 'Scheduled',
    });

    setShowAddModal(false);
  };

  const filteredMaintenance = maintenance.filter((m) => {
    const matchesSearch =
      m.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.materialName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || m.maintenanceType === typeFilter;
    const matchesStatus = statusFilter === 'all' || m.calculatedReadiness === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>Maintenance Schedule &amp; Material Readiness</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconciles scheduled work orders against active warehouse inventory and vendor lead times.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-950 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule Maintenance</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search work order, equipment or spare..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Maintenance Types</option>
            <option value="Preventive">Preventive</option>
            <option value="Corrective">Corrective</option>
            <option value="Turnaround">Turnaround (TAR)</option>
            <option value="Condition-Based">Condition-Based</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Readiness States</option>
            <option value="READY">READY (100% Stocked)</option>
            <option value="AT RISK">AT RISK (Buffer Breached)</option>
            <option value="CRITICAL">CRITICAL (Deficit / Shortage)</option>
          </select>
        </div>
      </div>

      {/* Maintenance Table (Section 25) */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Work Order / Equipment</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Scheduled Date</th>
                <th className="py-3 px-3">Required Material</th>
                <th className="py-3 px-3 text-center">Req / Available</th>
                <th className="py-3 px-3">Supplier Lead Time</th>
                <th className="py-3 px-3">Readiness Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMaintenance.map((maint) => {
                const mat = materials.find((m) => m.id === maint.materialId);
                const avail = mat?.currentStock ?? 0;
                const isReady = maint.calculatedReadiness === 'READY';
                const isCritical = maint.calculatedReadiness === 'CRITICAL';

                return (
                  <tr key={maint.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{maint.equipmentName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{maint.workOrderNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                        {maint.maintenanceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {new Date(maint.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{maint.materialName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{mat?.code || 'Critical Spare'}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="font-bold text-amber-400">{maint.requiredQuantity}</span>
                      <span className="text-slate-500"> / </span>
                      <span className={avail >= maint.requiredQuantity ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {avail}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {mat?.leadTimeDays || 21} days
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          isReady
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isCritical
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isCritical && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                        {isReady && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        {maint.calculatedReadiness || 'AT RISK'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenMaterialModal(maint.materialId)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          View Spare
                        </button>
                        <button
                          onClick={() => onOpenWhatIf(maint.materialId)}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 transition-colors cursor-pointer"
                        >
                          Simulate
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

      {/* Add Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <span>Schedule Equipment Maintenance Task</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Equipment *</label>
                <select
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Required Spare Material *</label>
                <select
                  value={formData.materialId}
                  onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code}) — Current Stock: {m.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Required *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.requiredQuantity}
                    onChange={(e) => setFormData({ ...formData, requiredQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Scheduled Execution Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Order Number</label>
                  <input
                    type="text"
                    value={formData.workOrderNumber}
                    onChange={(e) => setFormData({ ...formData, workOrderNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Maintenance Type</label>
                  <select
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Preventive">Preventive</option>
                    <option value="Corrective">Corrective</option>
                    <option value="Turnaround">Turnaround (TAR)</option>
                    <option value="Condition-Based">Condition-Based</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
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
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Schedule &amp; Calculate Readiness
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
