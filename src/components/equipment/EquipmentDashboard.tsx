import React, { useState } from 'react';
import {
  Cog,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingDown,
  Layers,
  FileText,
  Eye,
  Edit,
  Archive,
  X,
  ChevronRight,
  Activity,
  Calculator,
  Compass,
  Cpu,
  Flame,
  Award,
} from 'lucide-react';
import {
  Equipment,
  EquipmentMaintenanceRecord,
  OilGasSegment,
  EquipmentCriticality,
  EquipmentStatus,
  DepreciationMethod,
} from '../../types';
import { store } from '../../services/store';
import { formatUGX, formatUSD, convertUsdToUgx } from '../../utils/currency';

const OG_SEGMENTS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All Segments' },
  { id: 'Upstream', label: 'Upstream' },
  { id: 'Midstream', label: 'Midstream' },
  { id: 'Downstream', label: 'Downstream' },
  { id: 'Drilling', label: 'Drilling' },
  { id: 'Production', label: 'Production' },
  { id: 'Processing', label: 'Processing' },
  { id: 'Pipeline', label: 'Pipeline' },
  { id: 'Storage', label: 'Storage' },
  { id: 'Refining', label: 'Refining' },
];

export const EquipmentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'oilgas' | 'maintenance' | 'depreciation'>('register');
  const [currency, setCurrency] = useState<'UGX' | 'USD'>('UGX');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isNewEquipmentModalOpen, setIsNewEquipmentModalOpen] = useState(false);
  const [isLogMaintenanceModalOpen, setIsLogMaintenanceModalOpen] = useState(false);
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const equipmentList = store.getEquipment();
  const maintenanceRecords = store.getEquipmentMaintenanceRecords();
  const facilities = store.getFacilities();

  // KPIs
  const totalEquipment = equipmentList.length;
  const activeEquipment = equipmentList.filter((e) => e.status === 'Active' || e.status === 'Available').length;
  const underMaintenance = equipmentList.filter((e) => e.status === 'Under Maintenance' || e.operationalStatus === 'Under Maintenance').length;
  const outOfService = equipmentList.filter((e) => e.status === 'Out of Service' || e.operationalStatus === 'Offline').length;
  const criticalEquipment = equipmentList.filter((e) => e.criticality === 'Critical' || e.criticalityRank === 'CRITICAL').length;

  const totalEquipmentValueUGX = equipmentList.reduce(
    (sum, e) => sum + (e.currentValueUGX || convertUsdToUgx(e.currentValueUSD || 0)),
    0
  );
  const totalEquipmentValueUSD = equipmentList.reduce(
    (sum, e) => sum + (e.currentValueUSD || (e.currentValueUGX ? e.currentValueUGX / 3750 : 0)),
    0
  );

  const totalMaintenanceCostUGX = maintenanceRecords.reduce((sum, r) => sum + r.totalCostUGX, 0);
  const totalMaintenanceCostUSD = maintenanceRecords.reduce((sum, r) => sum + r.totalCostUSD, 0);

  // Expired certifications
  const nowStr = '2026-09-23';
  const expiredCertifications = equipmentList.filter(
    (e) => e.certificationExpiryDate && e.certificationExpiryDate < nowStr
  ).length;

  const upcomingMaintenance = equipmentList.filter(
    (e) => e.nextMaintenanceDate && e.nextMaintenanceDate >= nowStr && e.nextMaintenanceDate <= '2026-11-30'
  ).length;

  const avgUtilization = Math.round(
    equipmentList.reduce((sum, e) => sum + (e.utilizationRatePercent || 85), 0) / (equipmentList.length || 1)
  );

  // Filtered equipment
  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesSearch =
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eq.assetNumber && eq.assetNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (eq.manufacturer && eq.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSegment = selectedSegment === 'ALL' || eq.oilGasSegment === selectedSegment || eq.category?.includes(selectedSegment);
    const matchesCrit = selectedCriticality === 'ALL' || eq.criticality === selectedCriticality;
    const matchesStatus = selectedStatus === 'ALL' || eq.status === selectedStatus;

    return matchesSearch && matchesSegment && matchesCrit && matchesStatus;
  });

  // Handle Save Equipment
  const handleSaveEquipment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const costUGX = Number(formData.get('purchaseCostUGX') || 0);
    const costUSD = Number(formData.get('purchaseCostUSD') || costUGX / 3750);
    const curValUGX = Number(formData.get('currentValueUGX') || costUGX);
    const curValUSD = Number(formData.get('currentValueUSD') || curValUGX / 3750);

    const eqData = {
      name: String(formData.get('name')),
      code: String(formData.get('code') || `EQ-${Date.now().toString().slice(-4)}`),
      assetNumber: String(formData.get('assetNumber') || `AST-${Date.now().toString().slice(-4)}`),
      type: String(formData.get('type') || 'Industrial Rotating Machinery'),
      category: String(formData.get('category') || 'Production Equipment'),
      oilGasSegment: formData.get('oilGasSegment') as OilGasSegment,
      criticality: formData.get('criticality') as EquipmentCriticality,
      facilityId: String(formData.get('facilityId') || 'fac-cpf'),
      facilityName: 'Central Processing Facility (CPF-1)',
      department: String(formData.get('department') || 'Production & Maintenance'),
      manufacturer: String(formData.get('manufacturer') || ''),
      model: String(formData.get('model') || ''),
      serialNumber: String(formData.get('serialNumber') || ''),
      yearOfManufacture: Number(formData.get('yearOfManufacture') || 2023),
      purchaseDate: String(formData.get('purchaseDate') || '2024-01-15'),
      purchaseCostUGX: costUGX,
      purchaseCostUSD: costUSD,
      currentValueUGX: curValUGX,
      currentValueUSD: curValUSD,
      usefulLifeYears: Number(formData.get('usefulLifeYears') || 15),
      salvageValueUGX: costUGX * 0.1,
      depreciationMethod: formData.get('depreciationMethod') as DepreciationMethod,
      accumulatedDepreciationUGX: costUGX - curValUGX,
      status: formData.get('status') as EquipmentStatus,
      operationalStatus: 'Operational' as any,
      condition: formData.get('condition') as any,
      assignedEmployee: String(formData.get('assignedEmployee') || 'Eng. Patrick Kato'),
      maintenanceSchedule: String(formData.get('maintenanceSchedule') || 'Monthly Preventive'),
      lastMaintenanceDate: String(formData.get('lastMaintenanceDate') || '2026-06-15'),
      nextMaintenanceDate: String(formData.get('nextMaintenanceDate') || '2026-10-20'),
      certificationNumber: String(formData.get('certificationNumber') || 'CERT-API-682'),
      certificationExpiryDate: String(formData.get('certificationExpiryDate') || '2027-08-15'),
      warrantyExpiryDate: String(formData.get('warrantyExpiryDate') || '2028-01-15'),
      notes: String(formData.get('notes') || ''),
      organizationId: 'org-demo-oil-gas',
    };

    if (editingEquipment) {
      store.updateEquipment(editingEquipment.id, eqData);
      setEditingEquipment(null);
    } else {
      store.addEquipment(eqData);
      setIsNewEquipmentModalOpen(false);
    }
  };

  // Handle Log Maintenance Record
  const handleSaveMaintenanceRecord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eqId = String(formData.get('equipmentId'));
    const eq = equipmentList.find((item) => item.id === eqId);

    const labourUGX = Number(formData.get('labourCostUGX') || 0);
    const partsUGX = Number(formData.get('partsCostUGX') || 0);
    const totalUGX = labourUGX + partsUGX;

    store.addEquipmentMaintenanceRecord({
      equipmentId: eqId,
      equipmentName: eq ? eq.name : 'Oilfield Equipment',
      organizationId: 'org-demo-oil-gas',
      maintenanceType: formData.get('maintenanceType') as any,
      maintenanceDate: String(formData.get('maintenanceDate')),
      technician: String(formData.get('technician')),
      workPerformed: String(formData.get('workPerformed')),
      partsUsed: [],
      labourCostUGX: labourUGX,
      labourCostUSD: labourUGX / 3750,
      partsCostUGX: partsUGX,
      partsCostUSD: partsUGX / 3750,
      totalCostUGX: totalUGX,
      totalCostUSD: totalUGX / 3750,
      downtimeHours: Number(formData.get('downtimeHours') || 0),
      nextServiceDate: String(formData.get('nextServiceDate')),
      documents: ['Service_Report.pdf'],
    });

    setIsLogMaintenanceModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Heavy Assets & Reliability
            </span>
            <span className="text-xs text-slate-400">Plant Machinery & Drilling Rigs</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Cog className="w-6 h-6 text-amber-400" />
            Asset & Equipment Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete lifecycle tracking, preventive servicing, API/ASME certifications, and depreciation accounting for upstream and midstream operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs font-semibold">
            <button
              onClick={() => setCurrency('UGX')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                currency === 'UGX' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              UGX
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                currency === 'USD' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD
            </button>
          </div>

          <button
            onClick={() => setIsLogMaintenanceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            Log Service
          </button>

          <button
            onClick={() => {
              setEditingEquipment(null);
              setIsNewEquipmentModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Asset
          </button>
        </div>
      </div>

      {/* Critical Alerts Banner (Maintenance Due / Expired Certifications) */}
      {(expiredCertifications > 0 || upcomingMaintenance > 0) && (
        <div className="bg-sky-950/30 border border-sky-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sky-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-900/50 flex items-center justify-center shrink-0 border border-sky-700/50">
              <AlertTriangle className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-sky-300">
                Equipment Compliance &amp; Readiness Notice: {expiredCertifications} Expired Certification(s), {upcomingMaintenance} Servicing Window(s)
              </p>
              <p className="text-[11px] text-sky-300/80">
                Critical turbomachinery and pressure barrier equipment require scheduled calibration to prevent unplanned deferment.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('oilgas')}
            className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold cursor-pointer shrink-0"
          >
            View O&amp;G Critical Matrix
          </button>
        </div>
      )}

      {/* Featured Tier-1 Turbomachinery & Precision Hardware Visual Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col lg:flex-row shadow-lg">
        <div className="relative lg:w-72 h-44 lg:h-auto overflow-hidden bg-slate-800 shrink-0">
          <img
            src="/images/equipment_subsea_valve_1790284568008.jpg"
            alt="High-Pressure Subsea Choke Valve"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-400/40 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            API 682 Verified
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Spotlight Machinery Asset</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">High-Pressure Subsea Choke Assembly (CPF-1)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              Deterministic Wear Analysis &amp; Preventive Seal Scheduling
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Real-time vibration, differential pressure, and seal flush diagnostics. NEXORA links scheduled preventative work orders with inventory safety buffers to prevent field trip events.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Assigned Lead: <strong className="text-slate-200">Eng. Patrick Kato</strong></span>
              <span>•</span>
              <span>Next Overhaul: <strong className="text-emerald-400">2026-10-20</strong></span>
            </div>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Open Maintenance Logs →
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Equipment Value</span>
            <span className="text-[10px] font-bold text-amber-400">{currency}</span>
          </div>
          <div className="text-xl font-bold text-white mt-1.5 truncate">
            {currency === 'UGX' ? formatUGX(totalEquipmentValueUGX) : formatUSD(totalEquipmentValueUSD)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Capital net book value</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Assets</span>
          <div className="text-xl font-bold text-slate-100 mt-1">{totalEquipment}</div>
          <span className="text-[10px] text-slate-500 mt-1">Machines & rigs</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Active</span>
          <div className="text-xl font-bold text-emerald-300 mt-1">{activeEquipment}</div>
          <span className="text-[10px] text-emerald-500/80 mt-1">Operational</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Maintenance</span>
          <div className="text-xl font-bold text-amber-300 mt-1">{underMaintenance}</div>
          <span className="text-[10px] text-amber-500/80 mt-1">In overhaul</span>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">Out of Service</span>
          <div className="text-xl font-bold text-rose-300 mt-1">{outOfService}</div>
          <span className="text-[10px] text-rose-500/80 mt-1">Offline</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">Critical Units</span>
          <div className="text-xl font-bold text-purple-300 mt-1">{criticalEquipment}</div>
          <span className="text-[10px] text-purple-400/80 mt-1">Tier-1 priority</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Maintenance Spend</span>
            <span className="text-[10px] font-bold text-blue-400">{currency}</span>
          </div>
          <div className="text-lg font-bold text-blue-300 mt-1 truncate">
            {currency === 'UGX' ? formatUGX(totalMaintenanceCostUGX) : formatUSD(totalMaintenanceCostUSD)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Recorded services</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">Avg Utilization</span>
          <div className="text-xl font-bold text-cyan-300 mt-1">{avgUtilization}%</div>
          <span className="text-[10px] text-cyan-400/80 mt-1">Uptime index</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'register'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cog className="w-4 h-4" />
          Equipment Register ({equipmentList.length})
        </button>
        <button
          onClick={() => setActiveTab('oilgas')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'oilgas'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          Dedicated Oil & Gas Criticality View
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'maintenance'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Maintenance & Calibrations ({maintenanceRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('depreciation')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'depreciation'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Depreciation & Financial Accounting
        </button>
      </div>

      {/* TAB 1: EQUIPMENT REGISTER */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          {/* Segment Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {OG_SEGMENTS.map((seg) => {
              const isActive = selectedSegment === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => setSelectedSegment(seg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {seg.label}
                </button>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search equipment by name, code, asset #, manufacturer or serial #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Criticality:</span>
                <select
                  value={selectedCriticality}
                  onChange={(e) => setSelectedCriticality(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Levels</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Under Inspection">Under Inspection</option>
                  <option value="Out of Service">Out of Service</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Asset # & Equipment Name</th>
                    <th className="px-4 py-3">Segment / Category</th>
                    <th className="px-4 py-3">Facility / Location</th>
                    <th className="px-4 py-3">Criticality</th>
                    <th className="px-4 py-3">Current Value ({currency})</th>
                    <th className="px-4 py-3">Next Service</th>
                    <th className="px-4 py-3">Certification Expiry</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredEquipment.map((eq) => {
                    const isCertExpired = eq.certificationExpiryDate && eq.certificationExpiryDate < nowStr;
                    const valUGX = eq.currentValueUGX || convertUsdToUgx(eq.currentValueUSD || 0);
                    const valUSD = eq.currentValueUSD || (eq.currentValueUGX ? eq.currentValueUGX / 3750 : 0);

                    return (
                      <tr key={eq.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-100">{eq.name}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>{eq.assetNumber || eq.code}</span>
                            {eq.manufacturer && <span>• {eq.manufacturer}</span>}
                            {eq.model && <span>• {eq.model}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-200 font-medium">{eq.oilGasSegment || 'Upstream'}</div>
                          <span className="text-[10px] text-slate-500">{eq.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-200 font-medium truncate max-w-[140px]">{eq.facilityName}</div>
                          <span className="text-[10px] text-slate-400">{eq.department}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              eq.criticality === 'Critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : eq.criticality === 'High'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                : eq.criticality === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {eq.criticality || 'Medium'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-100">
                          {currency === 'UGX' ? formatUGX(valUGX) : formatUSD(valUSD)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-300">{eq.nextMaintenanceDate || '2026-10-20'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-mono text-xs ${
                              isCertExpired ? 'text-rose-400 font-bold' : 'text-slate-300'
                            }`}
                          >
                            {eq.certificationExpiryDate || '—'}
                          </span>
                          {isCertExpired && (
                            <span className="text-[9px] font-bold text-rose-400 block">EXPIRED</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              eq.status === 'Active' || eq.status === 'Available'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : eq.status === 'Under Maintenance'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {eq.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setViewingEquipment(eq)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEDICATED OIL & GAS CRITICALITY VIEW */}
      {activeTab === 'oilgas' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Oil & Gas Critical Asset Matrix & Production Protection
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              High-consequence assets categorized across Exploration, Drilling, Wellhead, Processing, Pipelines, and Custody Transfer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipmentList
              .filter((e) => e.criticality === 'Critical' || e.criticality === 'High')
              .map((eq) => {
                const isCertExpired = eq.certificationExpiryDate && eq.certificationExpiryDate < nowStr;

                return (
                  <div
                    key={eq.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                            {eq.oilGasSegment || 'Upstream'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{eq.assetNumber || eq.code}</span>
                        </div>
                        <h3 className="font-bold text-slate-100 text-base mt-1">{eq.name}</h3>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          eq.criticality === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        }`}
                      >
                        {eq.criticality}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Location</span>
                        <span className="font-medium text-slate-200">{eq.facilityName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Manufacturer & Model</span>
                        <span className="font-medium text-slate-200">
                          {eq.manufacturer} {eq.model}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Next Maintenance</span>
                        <span className="font-medium text-amber-400 font-mono">{eq.nextMaintenanceDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Certification Expiry</span>
                        <span
                          className={`font-medium font-mono ${
                            isCertExpired ? 'text-rose-400 font-bold' : 'text-emerald-400'
                          }`}
                        >
                          {eq.certificationExpiryDate || 'Compliant'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>
                        Assigned: <strong className="text-slate-200">{eq.assignedEmployee || 'Field Ops Team'}</strong>
                      </span>
                      <button
                        onClick={() => setViewingEquipment(eq)}
                        className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Dossier <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: MAINTENANCE & CALIBRATIONS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Equipment Servicing & Calibration History</h2>
              <p className="text-xs text-slate-400">
                API 682 seal flushes, hydrotests, acoustic meter calibrations, and lube oil ferrography logs.
              </p>
            </div>
            <button
              onClick={() => setIsLogMaintenanceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log Servicing
            </button>
          </div>

          <div className="space-y-3">
            {maintenanceRecords.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {rec.maintenanceType}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{rec.maintenanceDate}</span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm mt-1">{rec.equipmentName}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-100">
                      {currency === 'UGX' ? formatUGX(rec.totalCostUGX) : formatUSD(rec.totalCostUSD)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Downtime: {rec.downtimeHours} hrs</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="font-semibold text-slate-400 block mb-0.5">Work Performed:</span>
                  {rec.workPerformed}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
                  <span>
                    Technician: <strong className="text-slate-200">{rec.technician}</strong>
                  </span>
                  <span>
                    Next Servicing Date: <strong className="text-amber-400 font-mono">{rec.nextServiceDate}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEPRECIATION & FINANCIAL ACCOUNTING */}
      {activeTab === 'depreciation' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              Capital Asset Depreciation & Ledger Integration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automated Straight-Line and Declining-Balance schedules feeding directly into Nexora Financial Reports.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Asset Number & Name</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-center">Life (Yrs)</th>
                    <th className="px-4 py-3">Purchase Cost ({currency})</th>
                    <th className="px-4 py-3">Accumulated Depr. ({currency})</th>
                    <th className="px-4 py-3 font-bold text-amber-400">Net Book Value ({currency})</th>
                    <th className="px-4 py-3">Salvage Value ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {equipmentList.map((eq) => {
                    const costUGX = eq.purchaseCostUGX || convertUsdToUgx(eq.purchaseCostUSD || 0);
                    const costUSD = eq.purchaseCostUSD || costUGX / 3750;
                    const deprUGX = eq.accumulatedDepreciationUGX || costUGX * 0.25;
                    const deprUSD = eq.accumulatedDepreciationUSD || deprUGX / 3750;
                    const nbvUGX = costUGX - deprUGX;
                    const nbvUSD = costUSD - deprUSD;
                    const salvageUGX = eq.salvageValueUGX || costUGX * 0.1;
                    const salvageUSD = salvageUGX / 3750;

                    return (
                      <tr key={eq.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-100">{eq.name}</div>
                          <span className="text-[10px] font-mono text-slate-500">{eq.assetNumber || eq.code}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                            {eq.depreciationMethod || 'Straight-line'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono">{eq.usefulLifeYears || 15}</td>
                        <td className="px-4 py-3 font-medium text-slate-300">
                          {currency === 'UGX' ? formatUGX(costUGX) : formatUSD(costUSD)}
                        </td>
                        <td className="px-4 py-3 text-rose-400 font-medium">
                          -{currency === 'UGX' ? formatUGX(deprUGX) : formatUSD(deprUSD)}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-100">
                          {currency === 'UGX' ? formatUGX(nbvUGX) : formatUSD(nbvUSD)}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400">
                          {currency === 'UGX' ? formatUGX(salvageUGX) : formatUSD(salvageUSD)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EQUIPMENT MODAL */}
      {isNewEquipmentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cog className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">
                  {editingEquipment ? 'Edit Asset Record' : 'Register Oil & Gas Asset / Machine'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsNewEquipmentModalOpen(false);
                  setEditingEquipment(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Equipment Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingEquipment?.name}
                    placeholder="e.g. Wellhead Multiphase Booster Pump P-204"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Asset Tag / Asset Number *</label>
                  <input
                    name="assetNumber"
                    required
                    defaultValue={editingEquipment?.assetNumber}
                    placeholder="AST-P204-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">O&G Segment *</label>
                  <select
                    name="oilGasSegment"
                    defaultValue={editingEquipment?.oilGasSegment || 'Upstream'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Upstream">Upstream</option>
                    <option value="Midstream">Midstream</option>
                    <option value="Downstream">Downstream</option>
                    <option value="Drilling">Drilling</option>
                    <option value="Production">Production</option>
                    <option value="Pipeline">Pipeline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Criticality Level</label>
                  <select
                    name="criticality"
                    defaultValue={editingEquipment?.criticality || 'Critical'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Critical">Critical (Direct Production Impact)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Manufacturer</label>
                  <input
                    name="manufacturer"
                    defaultValue={editingEquipment?.manufacturer}
                    placeholder="e.g. Sulzer / Baker Hughes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Model & Serial Number</label>
                  <input
                    name="model"
                    defaultValue={editingEquipment?.model}
                    placeholder="Model 10x12 MSD-3"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Facility Assignment *</label>
                  <select
                    name="facilityId"
                    defaultValue={editingEquipment?.facilityId}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Assigned Maintenance Lead</label>
                  <input
                    name="assignedEmployee"
                    defaultValue={editingEquipment?.assignedEmployee}
                    placeholder="Eng. Patrick Kato"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Purchase Cost (UGX)</label>
                  <input
                    type="number"
                    name="purchaseCostUGX"
                    defaultValue={editingEquipment?.purchaseCostUGX}
                    placeholder="1200000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Useful Life (Years)</label>
                  <input
                    type="number"
                    name="usefulLifeYears"
                    defaultValue={editingEquipment?.usefulLifeYears || 15}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Depreciation Method</label>
                  <select
                    name="depreciationMethod"
                    defaultValue={editingEquipment?.depreciationMethod || 'Straight-line'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Straight-line">Straight-line</option>
                    <option value="Declining balance">Declining balance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Operational Status</label>
                  <select
                    name="status"
                    defaultValue={editingEquipment?.status || 'Active'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Available">Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Under Inspection">Under Inspection</option>
                    <option value="Out of Service">Out of Service</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Certification Expiry Date</label>
                  <input
                    type="date"
                    name="certificationExpiryDate"
                    defaultValue={editingEquipment?.certificationExpiryDate}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Next Service Date</label>
                  <input
                    type="date"
                    name="nextMaintenanceDate"
                    defaultValue={editingEquipment?.nextMaintenanceDate}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Equipment Notes & Pressure Rating</label>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={editingEquipment?.notes}
                  placeholder="Design specs, ASME / API standards, operating pressures..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewEquipmentModalOpen(false);
                    setEditingEquipment(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  {editingEquipment ? 'Save Asset' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG SERVICING MODAL */}
      {isLogMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Log Equipment Servicing & Calibration</h3>
              </div>
              <button
                onClick={() => setIsLogMaintenanceModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenanceRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Equipment *</label>
                <select
                  name="equipmentId"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.assetNumber || eq.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Maintenance Type</label>
                  <select
                    name="maintenanceType"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Preventive maintenance">Preventive maintenance</option>
                    <option value="Corrective maintenance">Corrective maintenance</option>
                    <option value="Emergency maintenance">Emergency maintenance</option>
                    <option value="Scheduled servicing">Scheduled servicing</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Calibration">Calibration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Service Date</label>
                  <input
                    type="date"
                    name="maintenanceDate"
                    required
                    defaultValue="2026-09-23"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Technician / Specialist</label>
                  <input
                    name="technician"
                    required
                    placeholder="Eng. Patrick Kato"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Downtime (Hours)</label>
                  <input
                    type="number"
                    name="downtimeHours"
                    defaultValue={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Labour Cost (UGX)</label>
                  <input
                    type="number"
                    name="labourCostUGX"
                    placeholder="4500000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Parts Cost (UGX)</label>
                  <input
                    type="number"
                    name="partsCostUGX"
                    placeholder="12000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Work Description & Parts Used</label>
                <textarea
                  name="workPerformed"
                  rows={2}
                  required
                  placeholder="Replaced mechanical seal cartridge, flushed oil barrier..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Next Scheduled Service Date</label>
                <input
                  type="date"
                  name="nextServiceDate"
                  required
                  defaultValue="2026-12-20"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogMaintenanceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EQUIPMENT DOSSIER MODAL */}
      {viewingEquipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {viewingEquipment.assetNumber || viewingEquipment.code}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    {viewingEquipment.oilGasSegment}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    {viewingEquipment.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-white mt-1">{viewingEquipment.name}</h3>
                <p className="text-xs text-slate-400">{viewingEquipment.facilityName} • {viewingEquipment.department}</p>
              </div>
              <button
                onClick={() => setViewingEquipment(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Current Asset Value</span>
                <span className="text-sm font-bold text-slate-100">
                  {formatUGX(viewingEquipment.currentValueUGX || convertUsdToUgx(viewingEquipment.currentValueUSD || 0))}
                </span>
                <span className="text-[10px] text-amber-400 block">
                  {formatUSD(viewingEquipment.currentValueUSD || 0)}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Criticality</span>
                <span className="text-sm font-bold text-rose-400">{viewingEquipment.criticality}</span>
                <span className="text-[10px] text-slate-400 block">Direct Wellhead Impact</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Next Service</span>
                <span className="text-sm font-bold text-amber-300">{viewingEquipment.nextMaintenanceDate}</span>
                <span className="text-[10px] text-slate-400 block">Last: {viewingEquipment.lastMaintenanceDate}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Certification</span>
                <span className="text-xs font-bold text-emerald-300 truncate block">
                  {viewingEquipment.certificationNumber || 'API 682'}
                </span>
                <span className="text-[10px] text-slate-400 block">Exp: {viewingEquipment.certificationExpiryDate}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5">
              <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1">Asset Specifications</h4>
              <p>
                <span className="text-slate-500">Manufacturer & Model:</span>{' '}
                <span className="text-slate-200">
                  {viewingEquipment.manufacturer} {viewingEquipment.model} ({viewingEquipment.yearOfManufacture || 2023})
                </span>
              </p>
              <p>
                <span className="text-slate-500">Serial Number:</span>{' '}
                <span className="font-mono text-slate-300">{viewingEquipment.serialNumber || 'SN-UNKNOWN'}</span>
              </p>
              <p>
                <span className="text-slate-500">Assigned Engineer:</span>{' '}
                <span className="text-slate-200">{viewingEquipment.assignedEmployee || 'Unassigned'}</span>
              </p>
              <p>
                <span className="text-slate-500">Depreciation Profile:</span>{' '}
                <span className="text-slate-300">
                  {viewingEquipment.depreciationMethod || 'Straight-line'} ({viewingEquipment.usefulLifeYears || 15} Year Life)
                </span>
              </p>
            </div>

            {viewingEquipment.notes && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-1 font-semibold">Engineering Notes</span>
                <p className="text-slate-300 leading-relaxed">{viewingEquipment.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setViewingEquipment(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
