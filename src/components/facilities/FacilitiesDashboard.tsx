import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  ChevronRight,
  FileText,
  Eye,
  Edit,
  Archive,
  X,
  ExternalLink,
  Flame,
  Droplets,
  Zap,
} from 'lucide-react';
import { Facility, FacilityMaintenanceTask, FacilityInspection, FacilityType } from '../../types';
import { store } from '../../services/store';
import { formatUGX, formatUSD } from '../../utils/currency';

const ALL_FACILITY_TYPES: FacilityType[] = [
  'Office',
  'Warehouse',
  'Factory',
  'Workshop',
  'Depot',
  'Fuel Station',
  'Oil Storage Facility',
  'Gas Facility',
  'Processing Plant',
  'Pipeline Facility',
  'Oilfield Base',
  'Camp',
  'Laboratory',
  'Retail Facility',
  'Distribution Centre',
  'Other',
];

export const FacilitiesDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'maintenance' | 'inspections'>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currency, setCurrency] = useState<'UGX' | 'USD'>('UGX');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [viewingFacility, setViewingFacility] = useState<Facility | null>(null);
  const [isAddMaintenanceModalOpen, setIsAddMaintenanceModalOpen] = useState(false);
  const [isAddInspectionModalOpen, setIsAddInspectionModalOpen] = useState(false);

  const facilities = store.getFacilities();
  const maintenanceTasks = store.getFacilityMaintenance();
  const inspections = store.getFacilityInspections();

  // KPIs
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter((f) => f.status === 'Active').length;
  const maintenanceFacilities = facilities.filter(
    (f) => f.status === 'Under Maintenance' || f.operationalStatus === 'MAINTENANCE'
  ).length;
  const attentionFacilities = facilities.filter(
    (f) =>
      f.status === 'Requiring Attention' ||
      (f.status as string) === 'Requires Attention' ||
      (f.operationalStatus as string) === 'RESTRICTED' ||
      inspections.some((i) => i.facilityId === f.id && i.isOverdue)
  ).length;

  const totalFacilityValueUGX = facilities.reduce((sum, f) => sum + (f.facilityValueUGX || 0), 0);
  const totalFacilityValueUSD = facilities.reduce((sum, f) => sum + (f.facilityValueUSD || 0), 0);

  const monthlyFacilityCostsUGX = facilities.reduce((sum, f) => sum + (f.monthlyCostsUGX || 0), 0);
  const monthlyFacilityCostsUSD = facilities.reduce((sum, f) => sum + (f.monthlyCostsUSD || 0), 0);

  const outstandingMaintenanceTasks = maintenanceTasks.filter(
    (t) => t.status !== 'Completed' && t.status !== 'Cancelled'
  ).length;
  const upcomingInspections = inspections.filter((i) => i.complianceStatus === 'Pending').length;
  const overdueInspectionsCount = inspections.filter((i) => i.isOverdue).length;

  // Filter facilities
  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.code && f.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.facilityCode && f.facilityCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.facilityManager && f.facilityManager.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'ALL' || f.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || f.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle Create/Edit Facility
  const handleSaveFacility = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const valUGX = Number(formData.get('facilityValueUGX') || 0);
    const valUSD = Number(formData.get('facilityValueUSD') || valUGX / 3750);
    const costUGX = Number(formData.get('monthlyCostsUGX') || 0);
    const costUSD = Number(formData.get('monthlyCostsUSD') || costUGX / 3750);

    const facilityData = {
      name: String(formData.get('name')),
      code: String(formData.get('code') || `FAC-${Date.now().toString().slice(-4)}`),
      type: formData.get('type') as FacilityType,
      company: String(formData.get('company') || 'Albertine Energy Corporation'),
      location: String(formData.get('location')),
      physicalAddress: String(formData.get('physicalAddress') || ''),
      gpsCoordinates: String(formData.get('gpsCoordinates') || ''),
      facilityManager: String(formData.get('facilityManager') || ''),
      contactPerson: String(formData.get('contactPerson') || ''),
      contactPhone: String(formData.get('contactPhone') || ''),
      contactEmail: String(formData.get('contactEmail') || ''),
      status: formData.get('status') as any,
      operationalStatus: formData.get('operationalStatus') as any,
      dateAcquired: String(formData.get('dateAcquired') || ''),
      commissioningDate: String(formData.get('commissioningDate') || ''),
      facilityValueUGX: valUGX,
      facilityValueUSD: valUSD,
      insurancePolicyNumber: String(formData.get('insurancePolicyNumber') || ''),
      insuranceProvider: String(formData.get('insuranceProvider') || ''),
      insuranceExpiryDate: String(formData.get('insuranceExpiryDate') || ''),
      leaseInfo: String(formData.get('leaseInfo') || ''),
      leaseStartDate: String(formData.get('leaseStartDate') || ''),
      leaseEndDate: String(formData.get('leaseEndDate') || ''),
      capacity: String(formData.get('capacity') || ''),
      notes: String(formData.get('notes') || ''),
      monthlyCostsUGX: costUGX,
      monthlyCostsUSD: costUSD,
      documents: ['Facility_Operations_Manual.pdf'],
      photos: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      ],
    };

    if (editingFacility) {
      store.updateFacility(editingFacility.id, facilityData as any);
      setEditingFacility(null);
    } else {
      store.addFacility(facilityData as any);
      setIsCreateModalOpen(false);
    }
  };

  // Handle Add Maintenance
  const handleSaveMaintenance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const costUGX = Number(formData.get('costUGX') || 0);
    const costUSD = Number(formData.get('costUSD') || costUGX / 3750);
    const facilityId = String(formData.get('facilityId'));
    const fac = facilities.find((f) => f.id === facilityId);

    store.addFacilityMaintenanceTask({
      facilityId,
      facilityName: fac ? fac.name : 'Oilfield Facility',
      organizationId: 'org-demo-oil-gas',
      title: String(formData.get('title')),
      category: formData.get('category') as any,
      assignedTechnician: String(formData.get('assignedTechnician')),
      priority: formData.get('priority') as any,
      deadline: String(formData.get('deadline')),
      status: formData.get('status') as any,
      costUGX,
      costUSD,
      invoices: [],
      photos: [],
      partsUsed: [],
      downtimeHours: Number(formData.get('downtimeHours') || 0),
    });

    setIsAddMaintenanceModalOpen(false);
  };

  // Handle Add Inspection
  const handleSaveInspection = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const facilityId = String(formData.get('facilityId'));
    const fac = facilities.find((f) => f.id === facilityId);

    store.addFacilityInspection({
      facilityId,
      facilityName: fac ? fac.name : 'Oilfield Facility',
      organizationId: 'org-demo-oil-gas',
      inspectionType: formData.get('inspectionType') as any,
      inspectionDate: String(formData.get('inspectionDate')),
      inspectorName: String(formData.get('inspectorName')),
      inspectorOrganization: String(formData.get('inspectorOrganization')),
      findings: String(formData.get('findings')),
      complianceStatus: formData.get('complianceStatus') as any,
      correctiveActions: String(formData.get('correctiveActions')),
      deadline: String(formData.get('deadline')),
      supportingDocuments: [],
      isOverdue: false,
    });

    setIsAddInspectionModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Infrastructure & Operations
            </span>
            <span className="text-xs text-slate-400">Oil & Gas Facilities Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Facilities Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage processing plants, wellpad bases, depots, pipeline stations, and safety compliance audits.
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
            onClick={() => {
              setEditingFacility(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Facility
          </button>
        </div>
      </div>

      {/* Overdue Inspection Critical Warning Banner */}
      {overdueInspectionsCount > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-center justify-between gap-3 text-rose-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-900/50 flex items-center justify-center shrink-0 border border-rose-700/50">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-300">
                Regulatory Attention Required: {overdueInspectionsCount} Overdue Facility Inspection
              </p>
              <p className="text-[11px] text-rose-300/80">
                Fire and containment compliance actions exceed designated deadlines. Review the Inspections tab to assign corrective remediations.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inspections')}
            className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shrink-0"
          >
            View Inspections
          </button>
        </div>
      )}

      {/* Regional Production & Terminal Infrastructure Visual Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col lg:flex-row shadow-lg">
        <div className="relative lg:w-72 h-44 lg:h-auto overflow-hidden bg-slate-800 shrink-0">
          <img
            src="/images/hero_refinery_operations_1790284558080.jpg"
            alt="Offshore and Onshore Processing Terminal"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-400/40 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Operational Nodes
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Albertine Graben Basin</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Integrated Extraction &amp; Pipeline Corridor</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              Central Processing Facilities, Feeder Wellpads &amp; Marine Terminals
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Full lifecycle management for upstream central processing units (CPF-1, CPF-2), remote wellpad manifolds, logistics hubs, and export crude pipeline pumping stations. Automated health tracking prevents facility-wide shutdown triggers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Active Assets: <strong className="text-slate-200">{facilities.length} Verified Facilities</strong></span>
              <span>•</span>
              <span>Compliance Index: <strong className="text-emerald-400">98.2% Regulatory Ready</strong></span>
            </div>
            <button
              onClick={() => setActiveTab('register')}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              View Asset Directory →
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Facilities</span>
          <div className="text-xl font-bold text-white mt-2">{totalFacilities}</div>
          <span className="text-[10px] text-slate-500 mt-1">Across Graben region</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Active Facilities</span>
          <div className="text-xl font-bold text-emerald-300 mt-2">{activeFacilities}</div>
          <span className="text-[10px] text-emerald-500/80 mt-1">100% operational</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">In Maintenance</span>
          <div className="text-xl font-bold text-amber-300 mt-2">{maintenanceFacilities}</div>
          <span className="text-[10px] text-amber-500/80 mt-1">Ongoing overhauls</span>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/40 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">Needs Attention</span>
          <div className="text-xl font-bold text-rose-300 mt-2">{attentionFacilities}</div>
          <span className="text-[10px] text-rose-500/80 mt-1">Action items open</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Facility Value</span>
            <span className="text-[10px] font-bold text-amber-400">{currency}</span>
          </div>
          <div className="text-lg font-bold text-slate-100 mt-1 truncate">
            {currency === 'UGX' ? formatUGX(totalFacilityValueUGX) : formatUSD(totalFacilityValueUSD)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Capital asset registry</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Monthly Operating Costs</span>
            <span className="text-[10px] font-bold text-blue-400">{currency}</span>
          </div>
          <div className="text-lg font-bold text-blue-300 mt-1 truncate">
            {currency === 'UGX' ? formatUGX(monthlyFacilityCostsUGX) : formatUSD(monthlyFacilityCostsUSD)}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>Tasks: {outstandingMaintenanceTasks}</span>
            <span>Audits: {upcomingInspections}</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'register'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Facility Register ({facilities.length})
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
          Maintenance Management ({maintenanceTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('inspections')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'inspections'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Safety & Regulatory Inspections ({inspections.length})
        </button>
      </div>

      {/* TAB 1: FACILITY REGISTER */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search facilities by name, code, location or manager..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Facility Types</option>
                  {ALL_FACILITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
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
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Requires Attention">Requires Attention</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Facility Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFacilities.map((facility) => {
              const facMaintenance = maintenanceTasks.filter((t) => t.facilityId === facility.id && t.status !== 'Completed');
              const facInspections = inspections.filter((i) => i.facilityId === facility.id);
              const hasOverdueInsp = facInspections.some((i) => i.isOverdue);

              return (
                <div
                  key={facility.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
                >
                  <div>
                    {/* Facility Header & Status */}
                    <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {facility.code}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {facility.type}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-100 text-sm mt-1.5 group-hover:text-amber-300 transition-colors">
                            {facility.name}
                          </h3>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            facility.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : facility.status === 'Under Maintenance'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : facility.status === 'Requiring Attention' || (facility.status as string) === 'Requires Attention' || hasOverdueInsp
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {hasOverdueInsp ? 'Attention Req.' : facility.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                        <span className="truncate">{facility.location}</span>
                      </div>
                    </div>

                    {/* Facility Body Details */}
                    <div className="p-4 space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-800/60">
                        <div>
                          <span className="text-slate-500 block">Asset Value</span>
                          <span className="font-semibold text-slate-200">
                            {currency === 'UGX'
                              ? formatUGX(facility.facilityValueUGX || 0)
                              : formatUSD(facility.facilityValueUSD || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Monthly Opex</span>
                          <span className="font-semibold text-slate-200">
                            {currency === 'UGX'
                              ? formatUGX(facility.monthlyCostsUGX || 0)
                              : formatUSD(facility.monthlyCostsUSD || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-slate-300 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Manager:</span>
                          <span className="font-medium text-slate-200">{facility.facilityManager || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Capacity:</span>
                          <span className="font-medium text-slate-200">{facility.capacity || 'Standard'}</span>
                        </div>
                        {facility.insuranceExpiryDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Insurance Expiry:</span>
                            <span className="font-medium text-amber-400/90">{facility.insuranceExpiryDate}</span>
                          </div>
                        )}
                        {facility.gpsCoordinates && (
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">GPS:</span>
                            <span className="font-mono text-slate-400 truncate max-w-[140px]">
                              {typeof facility.gpsCoordinates === 'object'
                                ? facility.gpsCoordinates.formatted || `${facility.gpsCoordinates.lat}, ${facility.gpsCoordinates.lng}`
                                : String(facility.gpsCoordinates)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Active Maintenance Indicator */}
                      {facMaintenance.length > 0 && (
                        <div className="mt-2 p-2 rounded bg-amber-950/30 border border-amber-800/40 flex items-center justify-between text-[11px] text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-amber-400" />
                            {facMaintenance.length} Active Work Order(s)
                          </span>
                          <span className="font-bold">{facMaintenance[0].priority}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingFacility(facility)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Dossier
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingFacility(facility);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 cursor-pointer"
                        title="Edit Facility"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Archive facility ${facility.name}?`)) {
                            store.archiveFacility(facility.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                        title="Archive Facility"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MAINTENANCE MANAGEMENT */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Facility Maintenance Work Orders</h2>
              <p className="text-xs text-slate-400">
                Track repairs, scheduled equipment servicing, technician dispatch, and costs for all infrastructure.
              </p>
            </div>
            <button
              onClick={() => setIsAddMaintenanceModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log Work Order
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Task Title / ID</th>
                    <th className="px-4 py-3">Facility</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Technician / Vendor</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Deadline</th>
                    <th className="px-4 py-3">Cost ({currency})</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {maintenanceTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">{task.title}</div>
                        <span className="text-[10px] font-mono text-slate-500">{task.id}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">{task.facilityName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                          {task.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{task.assignedTechnician}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : task.priority === 'High'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{task.deadline}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {currency === 'UGX' ? formatUGX(task.costUGX || 0) : formatUSD(task.costUSD || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            store.updateFacilityMaintenanceTask(task.id, {
                              status: e.target.value as any,
                              completionDate: e.target.value === 'Completed' ? new Date().toISOString() : undefined,
                            })
                          }
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="Open">Open</option>
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Pending Parts">Pending Parts</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            store.updateFacilityMaintenanceTask(task.id, {
                              status: 'Completed',
                              completionDate: new Date().toISOString(),
                            });
                          }}
                          disabled={task.status === 'Completed'}
                          className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-semibold transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          Mark Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY & REGULATORY INSPECTIONS */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Safety, Environmental & Regulatory Audits</h2>
              <p className="text-xs text-slate-400">
                Scheduled audits by PAU, NEMA, Police Fire Directorate, and Bureau Veritas for hydrocarbon compliance.
              </p>
            </div>
            <button
              onClick={() => setIsAddInspectionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Schedule Inspection
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspections.map((insp) => (
              <div
                key={insp.id}
                className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                  insp.isOverdue
                    ? 'border-rose-800/80 bg-rose-950/10'
                    : insp.complianceStatus === 'Compliant'
                    ? 'border-emerald-800/40'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {insp.inspectionType}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{insp.facilityName}</span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-sm mt-1">{insp.inspectorOrganization}</h3>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        insp.complianceStatus === 'Compliant'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : insp.complianceStatus === 'Conditional' || insp.isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {insp.isOverdue ? 'OVERDUE' : insp.complianceStatus}
                    </span>
                  </div>

                  <div className="mt-3 text-xs space-y-2 text-slate-300">
                    <p className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                      <span className="font-semibold text-slate-400 block mb-0.5">Findings & Protocol:</span>
                      {insp.findings}
                    </p>

                    {insp.correctiveActions && (
                      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-200">
                        <span className="font-semibold text-amber-400 block mb-0.5">Corrective Action Required:</span>
                        {insp.correctiveActions}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>
                      Date: <strong className="text-slate-200">{insp.inspectionDate}</strong>
                    </span>
                    <span>
                      Deadline: <strong className={insp.isOverdue ? 'text-rose-400' : 'text-slate-200'}>{insp.deadline}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={insp.complianceStatus}
                      onChange={(e) =>
                        store.updateFacilityInspection(insp.id, {
                          complianceStatus: e.target.value as any,
                          isOverdue: e.target.value === 'Compliant' ? false : insp.isOverdue,
                        })
                      }
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Compliant">Compliant</option>
                      <option value="Conditional">Conditional</option>
                      <option value="Non-Compliant">Non-Compliant</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT FACILITY MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">
                  {editingFacility ? 'Edit Facility Record' : 'Register New Oil & Gas Facility'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingFacility(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Facility Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingFacility?.name}
                    placeholder="e.g. Tilenga Central Processing Facility (CPF-2)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Facility Code / ID</label>
                  <input
                    name="code"
                    defaultValue={editingFacility?.code}
                    placeholder="e.g. CPF-02"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Facility Type *</label>
                  <select
                    name="type"
                    defaultValue={editingFacility?.type || 'Processing Plant'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    {ALL_FACILITY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Company / Operator</label>
                  <input
                    name="company"
                    defaultValue={editingFacility?.company || 'Albertine Energy Corporation'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Location / District *</label>
                  <input
                    name="location"
                    required
                    defaultValue={editingFacility?.location}
                    placeholder="e.g. Buliisa / Hoima, Albertine Graben"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Physical Address</label>
                  <input
                    name="physicalAddress"
                    defaultValue={editingFacility?.physicalAddress}
                    placeholder="Sector 4, Albert Basin Corridor"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">GPS Coordinates</label>
                  <input
                    name="gpsCoordinates"
                    defaultValue={
                      editingFacility?.gpsCoordinates
                        ? typeof editingFacility.gpsCoordinates === 'object'
                          ? editingFacility.gpsCoordinates.formatted ||
                            `${editingFacility.gpsCoordinates.lat}, ${editingFacility.gpsCoordinates.lng}`
                          : String(editingFacility.gpsCoordinates)
                        : ''
                    }
                    placeholder="1.8214° N, 31.3341° E"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Facility Manager</label>
                  <input
                    name="facilityManager"
                    defaultValue={editingFacility?.facilityManager}
                    placeholder="Eng. Patrick Kato"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Email</label>
                  <input
                    name="contactEmail"
                    type="email"
                    defaultValue={editingFacility?.contactEmail}
                    placeholder="ops-manager@albertine-energy.ug"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Phone</label>
                  <input
                    name="contactPhone"
                    defaultValue={editingFacility?.contactPhone}
                    placeholder="+256 772 400 110"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Facility Value (UGX)</label>
                  <input
                    type="number"
                    name="facilityValueUGX"
                    defaultValue={editingFacility?.facilityValueUGX}
                    placeholder="450000000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Monthly Operating Costs (UGX)</label>
                  <input
                    type="number"
                    name="monthlyCostsUGX"
                    defaultValue={editingFacility?.monthlyCostsUGX}
                    placeholder="650000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingFacility?.status || 'Active'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Requires Attention">Requires Attention</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Operational Status</label>
                  <select
                    name="operationalStatus"
                    defaultValue={editingFacility?.operationalStatus || 'ACTIVE'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="STANDBY">STANDBY</option>
                    <option value="DECOMMISSIONED">DECOMMISSIONED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Insurance Expiry Date</label>
                  <input
                    type="date"
                    name="insuranceExpiryDate"
                    defaultValue={editingFacility?.insuranceExpiryDate}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Capacity</label>
                  <input
                    name="capacity"
                    defaultValue={editingFacility?.capacity}
                    placeholder="e.g. 190,000 BOPD"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notes & Environmental Protocols</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingFacility?.notes}
                  placeholder="Include containment specs, PAU license terms, or special access restrictions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingFacility(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  {editingFacility ? 'Save Changes' : 'Register Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW FACILITY DOSSIER MODAL */}
      {viewingFacility && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 my-8 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {viewingFacility.code || viewingFacility.facilityCode || viewingFacility.id}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {viewingFacility.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                    {viewingFacility.status || viewingFacility.operationalStatus}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mt-1.5">{viewingFacility.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {viewingFacility.location} ({viewingFacility.physicalAddress || 'Main Field Zone'})
                </p>
              </div>
              <button
                onClick={() => setViewingFacility(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Total Facility Value</span>
                <span className="text-base font-bold text-slate-100 block">
                  {formatUGX(viewingFacility.facilityValueUGX || 0)}
                </span>
                <span className="text-xs font-mono text-amber-400">
                  {formatUSD(viewingFacility.facilityValueUSD || 0)}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Monthly Opex Budget</span>
                <span className="text-base font-bold text-slate-100 block">
                  {formatUGX(viewingFacility.monthlyCostsUGX || 0)}
                </span>
                <span className="text-xs font-mono text-blue-400">
                  {formatUSD(viewingFacility.monthlyCostsUSD || 0)}
                </span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Operating Capacity</span>
                <span className="text-base font-bold text-slate-100 block">{viewingFacility.capacity || 'N/A'}</span>
                <span className="text-xs text-slate-400">Commissioned: {viewingFacility.commissioningDate || '2024'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  Management & Contacts
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <p>
                    <span className="text-slate-500">Manager:</span>{' '}
                    <strong className="text-white">{viewingFacility.facilityManager || 'N/A'}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Contact Person:</span>{' '}
                    <strong className="text-white">{viewingFacility.contactPerson || 'Ops Center'}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Phone:</span>{' '}
                    <span className="font-mono text-slate-300">{viewingFacility.contactPhone || viewingFacility.phone || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Email:</span>{' '}
                    <span className="font-mono text-slate-300">{viewingFacility.contactEmail || viewingFacility.email || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">GPS:</span>{' '}
                    <span className="font-mono text-amber-400">
                      {viewingFacility.gpsCoordinates
                        ? typeof viewingFacility.gpsCoordinates === 'object'
                          ? viewingFacility.gpsCoordinates.formatted ||
                            `${viewingFacility.gpsCoordinates.lat}, ${viewingFacility.gpsCoordinates.lng}`
                          : String(viewingFacility.gpsCoordinates)
                        : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Insurance & Legal Leases
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <p>
                    <span className="text-slate-500">Policy:</span>{' '}
                    <span className="font-mono text-slate-200">{viewingFacility.insurancePolicyNumber || viewingFacility.insurancePolicy || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Underwriter:</span>{' '}
                    <span className="text-slate-200">{viewingFacility.insuranceProvider || 'UAP Old Mutual'}</span>
                  </p>
                  <p>
                    <span className="text-slate-500">Insurance Expiry:</span>{' '}
                    <strong className="text-amber-400">{viewingFacility.insuranceExpiryDate || viewingFacility.insuranceExpiry || 'N/A'}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Lease Terms:</span>{' '}
                    <span className="text-slate-300">
                      {typeof viewingFacility.leaseInfo === 'object'
                        ? viewingFacility.leaseInfo.isLeased
                          ? `Leased (${viewingFacility.leaseInfo.lessor || ''})`
                          : 'Freehold Title / PAU Concession'
                        : String(viewingFacility.leaseInfo || 'Freehold Title / PAU Concession')}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {viewingFacility.notes && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <h4 className="font-bold text-slate-400 mb-1">Operational & Environmental Notes</h4>
                <p className="text-slate-300 leading-relaxed">{viewingFacility.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setViewingFacility(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MAINTENANCE WORK ORDER MODAL */}
      {isAddMaintenanceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Log Facility Work Order</h3>
              </div>
              <button
                onClick={() => setIsAddMaintenanceModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Work Order Title *</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Sump Pump Seal Replacement & Line Cleanout"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Facility *</label>
                <select
                  name="facilityId"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code || f.facilityCode || f.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category</label>
                  <select
                    name="category"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Safety">Safety</option>
                    <option value="Civil">Civil</option>
                    <option value="Instrumentation">Instrumentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Priority</label>
                  <select
                    name="priority"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Assigned Technician / Contractor</label>
                  <input
                    name="assignedTechnician"
                    required
                    placeholder="Eng. Ronald Mukisa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Deadline Date</label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Estimated Cost (UGX)</label>
                  <input
                    type="number"
                    name="costUGX"
                    placeholder="18000000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Expected Downtime (Hours)</label>
                  <input
                    type="number"
                    name="downtimeHours"
                    defaultValue={0}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Initial Status</label>
                <select
                  name="status"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Parts">Pending Parts</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMaintenanceModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Create Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE INSPECTION MODAL */}
      {isAddInspectionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Schedule Safety or Regulatory Audit</h3>
              </div>
              <button
                onClick={() => setIsAddInspectionModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInspection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Facility *</label>
                <select
                  name="facilityId"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code || f.facilityCode || f.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Inspection Type *</label>
                  <select
                    name="inspectionType"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Regulatory">Regulatory (PAU)</option>
                    <option value="Environmental">Environmental (NEMA)</option>
                    <option value="Safety">Safety & Containment</option>
                    <option value="Fire">Fire & Explosion Prevention</option>
                    <option value="Electrical">Electrical & Hazardous Area</option>
                    <option value="Structural">Structural & Ultrasonic</option>
                    <option value="Facility">General Facility Audit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Audit Date</label>
                  <input
                    type="date"
                    name="inspectionDate"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Inspector Name</label>
                  <input
                    name="inspectorName"
                    placeholder="e.g. Samuel Okot"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Auditing Body / Agency</label>
                  <input
                    name="inspectorOrganization"
                    required
                    placeholder="e.g. Petroleum Authority of Uganda"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Findings / Scope Description</label>
                <textarea
                  name="findings"
                  rows={2}
                  placeholder="Details of audit scope or findings..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Compliance Status</label>
                  <select
                    name="complianceStatus"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Compliant">Compliant</option>
                    <option value="Conditional">Conditional</option>
                    <option value="Non-Compliant">Non-Compliant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Remediation Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Corrective Actions Mandated</label>
                <input
                  name="correctiveActions"
                  placeholder="Action required to achieve certification..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddInspectionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Schedule Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
