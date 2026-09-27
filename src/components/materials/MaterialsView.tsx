import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Sliders,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Material, CriticalityLevel, RiskLevel } from '../../types';
import { store } from '../../services/store';

interface MaterialsViewProps {
  onSelectMaterial: (material: Material) => void;
  onOpenRecordUsage: (materialId?: string) => void;
  onOpenWhatIf: (materialId?: string) => void;
  onOpenProcure: (materialId?: string) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  onSelectMaterial,
  onOpenRecordUsage,
  onOpenWhatIf,
  onOpenProcure,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const materials = store.getMaterials();
  const facilities = store.getFacilities();
  const warehouses = store.getWarehouses();
  const suppliers = store.getSuppliers();

  // Extract unique categories
  const categories = Array.from(new Set(materials.map((m) => m.category)));

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.facilityName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesCriticality = selectedCriticality === 'all' || m.criticality === selectedCriticality;
    const matchesRisk = selectedRisk === 'all' || m.calculatedRisk === selectedRisk;

    return matchesSearch && matchesCategory && matchesCriticality && matchesRisk;
  });

  // Add Material Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Rotating Equipment Spares',
    description: '',
    facilityId: facilities[0]?.id || '',
    warehouseId: warehouses[0]?.id || '',
    unitOfMeasurement: 'Set',
    currentStock: 4,
    minimumStock: 2,
    safetyStock: 2,
    maximumStock: 10,
    criticality: 'Critical' as CriticalityLevel,
    preferredSupplierId: suppliers[0]?.id || '',
    leadTimeDays: 21,
    unitCost: 5000,
    currency: 'USD',
    certificationRequirement: 'API / ISO Certified',
    storageLocation: 'Shelf A-01',
    notes: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Please fill in material name and code.');
      return;
    }

    const fac = facilities.find((f) => f.id === formData.facilityId);
    const wh = warehouses.find((w) => w.id === formData.warehouseId);
    const supp = suppliers.find((s) => s.id === formData.preferredSupplierId);

    store.addMaterial({
      organizationId: store.getCurrentOrganization().id,
      name: formData.name,
      code: formData.code,
      category: formData.category,
      description: formData.description,
      facilityId: formData.facilityId,
      facilityName: fac?.name || 'Central Facility',
      warehouseId: formData.warehouseId,
      warehouseName: wh?.name || 'Main Warehouse',
      unitOfMeasurement: formData.unitOfMeasurement,
      currentStock: Number(formData.currentStock),
      minimumStock: Number(formData.minimumStock),
      safetyStock: Number(formData.safetyStock),
      maximumStock: Number(formData.maximumStock),
      criticality: formData.criticality,
      preferredSupplierId: formData.preferredSupplierId,
      preferredSupplierName: supp?.name || 'Selected Supplier',
      alternativeSupplierIds: [],
      leadTimeDays: Number(formData.leadTimeDays),
      unitCost: Number(formData.unitCost),
      currency: formData.currency,
      certificationRequirement: formData.certificationRequirement,
      storageLocation: formData.storageLocation,
      notes: formData.notes,
    });

    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Code,Name,Category,Facility,CurrentStock,SafetyStock,Criticality,Risk,LeadTimeDays']
        .concat(
          filteredMaterials.map(
            (m) =>
              `"${m.code}","${m.name}","${m.category}","${m.facilityName}",${m.currentStock},${m.safetyStock},"${m.criticality}","${m.calculatedRisk}",${m.leadTimeDays}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexora_materials_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-sky-500" />
            <span>Materials Management Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking critical oil &amp; gas operational spares, safety buffers, and lead-time vulnerabilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Spares</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white text-xs font-extrabold shadow-md shadow-sky-500/20 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Material</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material code, description, equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Criticality Filter */}
          <select
            value={selectedCriticality}
            onChange={(e) => setSelectedCriticality(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Criticality</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
          >
            <option value="all">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Material Code &amp; Name</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Facility / Warehouse</th>
                <th className="py-3 px-3 text-center">Stock / Safety</th>
                <th className="py-3 px-3">Lead Time</th>
                <th className="py-3 px-3">Criticality</th>
                <th className="py-3 px-3">Deterministic Risk</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No materials match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const isCritical = mat.calculatedRisk === 'CRITICAL';
                  const isHigh = mat.calculatedRisk === 'HIGH';

                  return (
                    <tr
                      key={mat.id}
                      onClick={() => onSelectMaterial(mat)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">{mat.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{mat.code}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {mat.category}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        <div>{mat.facilityName}</div>
                        <div className="text-[10px] text-slate-500">{mat.warehouseName}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`font-bold ${mat.currentStock <= mat.safetyStock ? 'text-rose-400' : 'text-slate-100'}`}>
                          {mat.currentStock}
                        </span>
                        <span className="text-slate-500"> / </span>
                        <span className="text-slate-400">{mat.safetyStock}</span>
                        <span className="text-[10px] text-slate-500 ml-1">{mat.unitOfMeasurement}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {mat.leadTimeDays || 21} days
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            mat.criticality === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : mat.criticality === 'High'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {mat.criticality}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            isCritical
                              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                              : isHigh
                              ? 'bg-orange-600/30 text-orange-300 border border-orange-500/40'
                              : mat.calculatedRisk === 'MEDIUM'
                              ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {isCritical && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                          {mat.calculatedRisk}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onOpenRecordUsage(mat.id)}
                            title="Record Usage (-1)"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenWhatIf(mat.id)}
                            title="Run What-If"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-orange-400 transition-colors"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenProcure(mat.id)}
                            title="Procure"
                            className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition-colors"
                          >
                            Procure
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Material Modal (Section 18) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full my-8 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-400" />
                <span>Add Operational Material</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Material Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mechanical Seal Cartridge"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Material Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. MS-P101-01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Rotating Equipment Spares">Rotating Equipment Spares</option>
                    <option value="Valves & Actuation">Valves &amp; Actuation</option>
                    <option value="Piping & Flange Materials">Piping &amp; Flange Materials</option>
                    <option value="Instrumentation & Automation">Instrumentation &amp; Automation</option>
                    <option value="Electrical & Switchgear">Electrical &amp; Switchgear</option>
                    <option value="Consumables & Lubricants">Consumables &amp; Lubricants</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Criticality Level *</label>
                  <select
                    value={formData.criticality}
                    onChange={(e) => setFormData({ ...formData, criticality: e.target.value as CriticalityLevel })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Critical">Critical (Immediate shutdown on failure)</option>
                    <option value="High">High (Major operational impact)</option>
                    <option value="Medium">Medium (Auxiliary equipment)</option>
                    <option value="Low">Low (General utility)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Safety Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.safetyStock}
                    onChange={(e) => setFormData({ ...formData, safetyStock: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Lead Time (d) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.leadTimeDays}
                    onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Facility</label>
                  <select
                    value={formData.facilityId}
                    onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Warehouse</label>
                  <select
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specification &amp; Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Technical description, pressure class, metallurgy, API standard..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  Save Material to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prototype Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                <span>Import Spares Catalog</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="py-4 text-xs text-slate-300 space-y-3">
              <p>Upload a standard CSV or Excel spares file matching the NEXORA industrial catalog schema.</p>
              <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl text-center hover:border-sky-400/50 cursor-pointer bg-slate-950/40">
                <FileSpreadsheet className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <span className="font-semibold text-slate-200">Drag &amp; drop equipment spares CSV here</span>
                <p className="text-[10px] text-slate-400 mt-1">Accepts .csv, .xlsx (Max 10MB)</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg text-[10px] text-slate-400">
                Note: In this prototype, demo datasets are pre-loaded. Click below to load simulated batch template.
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
