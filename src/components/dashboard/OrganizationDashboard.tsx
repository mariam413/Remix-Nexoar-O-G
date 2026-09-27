import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  ShieldCheck,
  Wrench,
  Truck,
  ArrowRight,
  Sparkles,
  Sliders,
  Package,
  Layers,
  ChevronRight,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { store } from '../../services/store';
import { Material, MaintenanceRequirement } from '../../types';
import { CriticalAlertsSection } from './CriticalAlertsSection';
import { PredictiveTrendsWidget } from './PredictiveTrendsWidget';
import { ASSET_IMAGES } from '../../assets/images';

interface OrganizationDashboardProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenMaterialModal: (material: Material) => void;
  onOpenRecordUsageModal: (materialId?: string) => void;
  onOpenProcureModal: (materialId?: string) => void;
  onOpenWhatIf?: (materialId?: string) => void;
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({
  onNavigate,
  onOpenMaterialModal,
  onOpenRecordUsageModal,
  onOpenProcureModal,
  onOpenWhatIf,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('all');

  const currentOrg = store.getCurrentOrganization();
  const currentUser = store.getCurrentUser();
  const facilities = store.getFacilities();
  const allMaterials = store.getMaterials();
  const allMaintenance = store.getMaintenance();
  const allEquipment = store.getEquipment();
  const allOrders = store.getOrders();

  // Filter by facility if selected
  const materials = selectedFacilityId === 'all'
    ? allMaterials
    : allMaterials.filter((m) => m.facilityId === selectedFacilityId);

  const maintenance = selectedFacilityId === 'all'
    ? allMaintenance
    : allMaintenance.filter((m) => m.facilityId === selectedFacilityId);

  // Compute live KPIs from deterministic engine results
  const criticalCount = materials.filter((m) => m.criticality === 'Critical').length;
  const highRiskCount = materials.filter((m) => m.calculatedRisk === 'HIGH' || m.calculatedRisk === 'CRITICAL').length;
  const shortageCount = materials.filter((m) => {
    const demand = maintenance
      .filter((req) => req.materialId === m.id)
      .reduce((sum, r) => sum + r.requiredQuantity, 0);
    return m.currentStock - demand <= 0 && demand > 0;
  }).length;
  const upcomingMaintenanceCount = maintenance.filter((m) => m.status === 'Scheduled').length;
  const delayedOrdersCount = allOrders.filter((o) => o.deliveryDetails?.isDelayed).length;

  // Supply readiness index: percentage of scheduled maintenance items that are READY
  const readyMaintCount = maintenance.filter((m) => m.calculatedReadiness === 'READY').length;
  const supplyReadiness = maintenance.length > 0
    ? Math.round((readyMaintCount / maintenance.length) * 100)
    : 88;

  // Priority Critical Material (Mechanical Seal P-101 target scenario)
  const priorityMaterial = materials.find((m) => m.code === 'MS-P101-01') || materials.find((m) => m.calculatedRisk === 'CRITICAL') || materials[0];
  const priorityMaintenance = maintenance.find((m) => m.materialId === priorityMaterial?.id) || maintenance[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Facility Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-white tracking-tight">Executive Operations Briefing</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
              Live Tenant State
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic material risk &amp; proactive procurement decision intelligence for {currentOrg.name}.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Facility:</label>
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="all">All Operational Facilities ({facilities.length})</option>
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Executive Command & Operations Center Visual Briefing */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group shadow-lg min-h-[160px] flex flex-col justify-end p-5">
          <img
            src={ASSET_IMAGES.operationsCenter}
            alt="Operations Control Room"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent" />
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Production &amp; Telemetry Stream</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Active Control Telemetry &amp; Critical Spares Surveillance
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Continuous monitoring across Kingfisher, Tilenga, and CPF-1 facilities. Algorithmic safety buffer calibration prevents unplanned extraction deferrals.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-sky-400/40 shrink-0">
              <img
                src={ASSET_IMAGES.avatarDirector}
                alt="Lead Operations Controller"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">{currentUser.name}</div>
              <div className="text-[11px] text-sky-400 font-semibold">{currentUser.role === 'ORGANIZATION_ADMIN' ? 'Lead Operations Director' : currentUser.role}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Shift Duty: Operational Integrity</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
            <span>Overall Facility Integrity</span>
            <span className="font-bold text-emerald-400">NOMINAL (99.4%)</span>
          </div>
        </div>
      </div>

      {/* Critical Alerts: Predicted Supply Chain Delays */}
      <CriticalAlertsSection
        materials={materials}
        maintenance={maintenance}
        suppliers={store.getSuppliers()}
        orders={allOrders}
        equipment={allEquipment}
        onNavigate={onNavigate}
        onOpenMaterialModal={onOpenMaterialModal}
        onOpenWhatIf={onOpenWhatIf}
        onOpenProcureModal={onOpenProcureModal}
        selectedFacilityId={selectedFacilityId}
      />

      {/* KPI Cards Row (Section 12) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Supply Readiness</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black ${supplyReadiness >= 85 ? 'text-emerald-400' : supplyReadiness >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
              {supplyReadiness}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Target 95%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${supplyReadiness >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${supplyReadiness}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Critical Materials</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-100">{criticalCount}</span>
            <span className="text-[10px] text-slate-400">Classified Tier-1</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Zero tolerated downtime</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">High-Risk Spares</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black ${highRiskCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {highRiskCount}
            </span>
            <span className="text-[10px] text-rose-400 font-semibold">Action Required</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Breaching safety buffer</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Projected Shortfalls</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black ${shortageCount > 0 ? 'text-orange-400' : 'text-slate-100'}`}>
              {shortageCount}
            </span>
            <span className="text-[10px] text-slate-400">Next 60 Days</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Demand &gt; stock</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Upcoming Maint.</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-100">{upcomingMaintenanceCount}</span>
            <span className="text-[10px] text-slate-400">Active WOs</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Scheduled cycles</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Supplier Delays</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-black ${delayedOrdersCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {delayedOrdersCount}
            </span>
            <span className="text-[10px] text-slate-400">Active Shipments</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">In transit tracking</p>
        </div>
      </div>

      {/* Predictive Trends Widget (12-Month Recharts Consumption Forecast) */}
      <PredictiveTrendsWidget
        materials={materials}
        maintenance={maintenance}
        orders={allOrders}
        facilities={facilities}
        selectedFacilityId={selectedFacilityId}
        onNavigate={onNavigate}
        onOpenMaterialModal={onOpenMaterialModal}
        onOpenProcureModal={onOpenProcureModal}
      />

      {/* AI Priority Alerts Section (Section 13) */}
      {priorityMaterial && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-600/40 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-rose-900/40">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-black text-xs uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>CRITICAL</span>
              </span>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{priorityMaterial.name}</span>
                  <span className="text-xs font-mono text-slate-400">({priorityMaterial.code})</span>
                </h3>
                <p className="text-xs text-rose-300 font-medium mt-0.5">
                  Assigned Equipment: <span className="text-white font-semibold">{priorityMaintenance?.equipmentName || 'Crude Transfer Pump P-101'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-slate-400 font-semibold">AI Recommendation:</span>
              <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-extrabold tracking-wider">
                {priorityMaterial.recommendation || 'PROCURE NOW'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-4 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Current Stock</span>
              <span className="text-base font-bold text-white mt-0.5 block">{priorityMaterial.currentStock} {priorityMaterial.unitOfMeasurement}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Required for Maint.</span>
              <span className="text-base font-bold text-amber-400 mt-0.5 block">{priorityMaintenance?.requiredQuantity || 3} {priorityMaterial.unitOfMeasurement}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Safety Stock Level</span>
              <span className="text-base font-bold text-slate-200 mt-0.5 block">{priorityMaterial.safetyStock} {priorityMaterial.unitOfMeasurement}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Supplier Lead Time</span>
              <span className="text-base font-bold text-slate-200 mt-0.5 block">{priorityMaterial.leadTimeDays || 21} Days</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Required Date</span>
              <span className="text-base font-bold text-rose-300 mt-0.5 block">
                {priorityMaintenance?.scheduledDate ? new Date(priorityMaintenance.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '20 Oct 2026'}
              </span>
            </div>
          </div>

          {/* AI Explanation Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Deterministic Intelligence Rationale: </span>
              Three units are required for planned maintenance. Current stock is {priorityMaterial.currentStock} units and the defined safety stock is {priorityMaterial.safetyStock} units. The preferred supplier lead time is {priorityMaterial.leadTimeDays || 21} days. Early procurement should therefore be considered immediately to prevent deferred export production.
            </div>
          </div>

          {/* Action Buttons as requested in Section 13 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenMaterialModal(priorityMaterial)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                View Material Details
              </button>
              <button
                onClick={() => onNavigate('suppliers')}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                View Qualified Suppliers
              </button>
              <button
                onClick={() => onNavigate('whatif')}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Run What-If Scenario</span>
              </button>
            </div>

            <button
              onClick={() => onOpenProcureModal(priorityMaterial.id)}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-950 transition-colors cursor-pointer"
            >
              <span>Initiate Procurement Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Maintenance Readiness vs Critical Equipment */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Maintenance & Material Readiness (Section 25) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>Maintenance Schedule &amp; Material Readiness</span>
              </h2>
              <p className="text-xs text-slate-400">Comparing required spares against warehouse inventory &amp; supplier lead time.</p>
            </div>
            <button
              onClick={() => onNavigate('maintenance')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Equipment / Work Order</th>
                  <th className="py-2.5 px-3">Required Material</th>
                  <th className="py-2.5 px-3 text-center">Req / Avail</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Readiness</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {maintenance.map((req) => {
                  const mat = materials.find((m) => m.id === req.materialId);
                  const avail = mat?.currentStock ?? 0;
                  const isReady = req.calculatedReadiness === 'READY';
                  const isCritical = req.calculatedReadiness === 'CRITICAL';

                  return (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{req.equipmentName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{req.workOrderNumber} • {req.maintenanceType}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-300">{req.materialName}</div>
                        <div className="text-[10px] text-slate-400">Lead time: {mat?.leadTimeDays || 14} days</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="font-bold text-amber-400">{req.requiredQuantity}</span>
                        <span className="text-slate-500"> / </span>
                        <span className={avail >= req.requiredQuantity ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {avail}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {new Date(req.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            isReady
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isCritical
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {req.calculatedReadiness || 'AT RISK'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            if (mat) onOpenMaterialModal(mat);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Quick Actions & Critical Equipment Status */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Quick Operational Actions</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onOpenRecordUsageModal('mat-mech-seal')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <TrendingDown className="w-4 h-4 text-amber-400 mb-1" />
                <div className="font-semibold text-slate-200">Record Usage</div>
                <div className="text-[10px] text-slate-400">Step 4 of demo script</div>
              </button>

              <button
                onClick={() => onNavigate('whatif')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-orange-400 mb-1" />
                <div className="font-semibold text-slate-200">What-If Sandbox</div>
                <div className="text-[10px] text-slate-400">Simulate lead time delay</div>
              </button>

              <button
                onClick={() => onOpenProcureModal()}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4 text-emerald-400 mb-1" />
                <div className="font-semibold text-slate-200">New Tender</div>
                <div className="text-[10px] text-slate-400">Issue RFQ to suppliers</div>
              </button>

              <button
                onClick={() => onNavigate('assistant')}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 mb-1" />
                <div className="font-semibold text-slate-200">AI Assistant</div>
                <div className="text-[10px] text-slate-400">Grounded inquiry</div>
              </button>
            </div>
          </div>

          {/* Critical Assets Status */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Critical Assets Tracked</h3>
              <button
                onClick={() => onNavigate('equipment')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                View all ({allEquipment.length})
              </button>
            </div>

            <div className="space-y-2">
              {allEquipment.slice(0, 4).map((eq) => (
                <div
                  key={eq.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{eq.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{eq.code} • {eq.type}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      eq.criticality === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : eq.criticality === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {eq.criticality}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
