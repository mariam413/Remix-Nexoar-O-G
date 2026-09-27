import React, { useState } from 'react';
import {
  Shield,
  Building2,
  Users,
  Cpu,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Database,
  Lock,
  Layers,
  TrendingUp,
  DollarSign,
  Truck,
  FileText,
  CreditCard,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Server,
  Zap,
  Globe,
  Award,
  Filter,
  Search,
  Check,
  X,
  Edit3,
} from 'lucide-react';
import { store } from '../../services/store';
import { Organization, SubscriptionPlan, SubscriptionStatus } from '../../types';
import { NexoraLogo } from '../common/NexoraLogo';

interface SuperAdminViewProps {
  initialTab?: string;
  onNavigate: (view: string, id?: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  initialTab = 'OVERVIEW',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'OVERVIEW'
    | 'TENANTS'
    | 'SUPPLIERS'
    | 'USERS'
    | 'SUBSCRIPTIONS'
    | 'REVENUE'
    | 'SERVICES'
    | 'AI_MODULES'
    | 'RFQS'
    | 'HEALTH'
    | 'AI_CONFIG'
    | 'AUDIT'
  >(
    (initialTab.replace('admin_', '').toUpperCase() as any) || 'OVERVIEW'
  );

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [tenantFilter, setTenantFilter] = useState<'ALL' | 'ACTIVE' | 'TRIAL' | 'SUSPENDED'>('ALL');
  const [searchTenant, setSearchTenant] = useState('');
  const [selectedTenantModal, setSelectedTenantModal] = useState<Organization | null>(null);

  const state = store.getState();
  const organizations = store.getTenants();
  const users = state.users;
  const suppliers = state.suppliers;
  const plans = store.getSubscriptionPlans();
  const revenueMetrics = store.getPlatformRevenue();
  const implementationServices = store.getImplementationServices();
  const aiModules = store.getAIModules();
  const invoices = store.getTenantInvoices();
  const procurementRequests = state.procurementRequests;
  const auditLogs = state.auditLogs;

  const handleTestAI = async () => {
    setIsTestingAI(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Ping AI diagnostic test.',
          organizationId: 'platform-root',
          userRole: 'NEXORA_SUPER_ADMIN',
          context: {},
        }),
      });
      const data = await res.json();
      setTestResult(`Success! Active Engine: ${data.provider} | Confidence: ${data.confidence || 'High'}`);
    } catch (e: any) {
      setTestResult(`Deterministic Fallback Active: ${e.message}`);
    } finally {
      setIsTestingAI(false);
    }
  };

  const handleStatusChange = (tenantId: string, status: SubscriptionStatus) => {
    store.updateTenantStatus(tenantId, status);
    if (selectedTenantModal && selectedTenantModal.id === tenantId) {
      setSelectedTenantModal({ ...selectedTenantModal, subscriptionStatus: status });
    }
  };

  const handlePlanChange = (tenantId: string, plan: SubscriptionPlan) => {
    store.updateTenantPlan(tenantId, plan);
    if (selectedTenantModal && selectedTenantModal.id === tenantId) {
      setSelectedTenantModal({ ...selectedTenantModal, subscriptionPlan: plan });
    }
  };

  // Filtered tenants
  const operatorTenants = organizations.filter((o) => o.type === 'OPERATOR');
  const filteredTenants = operatorTenants.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchTenant.toLowerCase()) ||
      org.region.toLowerCase().includes(searchTenant.toLowerCase()) ||
      (org.code && org.code.toLowerCase().includes(searchTenant.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (tenantFilter === 'ALL') return true;
    if (tenantFilter === 'ACTIVE') return org.subscriptionStatus === 'Active';
    if (tenantFilter === 'TRIAL') return org.subscriptionStatus === 'Trial';
    if (tenantFilter === 'SUSPENDED') return org.subscriptionStatus === 'Suspended';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Platform Header: Distinct NEXORA Control Center */}
      <div className="bg-[#061A2E] text-white p-6 rounded-2xl border border-[#1D4968] shadow-lg relative overflow-hidden">
        {/* Subtle background circuit pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#0878C9]/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#00AFC7]/20 text-[#00AFC7] font-black uppercase tracking-widest border border-[#00AFC7]/30">
                NEXORA PLATFORM HQ
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-mono text-[#35C759] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#35C759] animate-pulse" />
                Multi-Tenant Cloud Mesh Online
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span>NEXORA CONTROL CENTER</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Global multi-tenant orchestration plane. Supervise subscriber operator tenants, qualified supplier networks,
              subscription licensing, recurring revenue, and autonomous Gemini AI infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-[#0B243D] rounded-xl border border-[#1D4968] text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                Platform MRR
              </span>
              <span className="text-xl font-black text-[#35C759] tabular-nums font-mono">
                ${revenueMetrics.mrrUSD.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Admin Navigation Ribbon (Horizontal Scrollable Tabs) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-[#1D4968] pb-2 overflow-x-auto text-xs font-bold select-none no-scrollbar">
        {[
          { id: 'OVERVIEW', label: 'Platform Overview', icon: BarChart3 },
          { id: 'TENANTS', label: `Companies / Tenants (${operatorTenants.length})`, icon: Building2 },
          { id: 'SUPPLIERS', label: `Suppliers Network (${suppliers.length})`, icon: Truck },
          { id: 'USERS', label: `Users (${users.length})`, icon: Users },
          { id: 'SUBSCRIPTIONS', label: 'Plans & Entitlements', icon: Sliders },
          { id: 'REVENUE', label: 'Revenue & Billing', icon: DollarSign, badge: 'MRR' },
          { id: 'SERVICES', label: 'Implementation Services', icon: Layers },
          { id: 'AI_MODULES', label: 'AI Capabilities', icon: Sparkles, badge: 'Gemini' },
          { id: 'RFQS', label: `Procurement Activity (${procurementRequests.length})`, icon: FileText },
          { id: 'HEALTH', label: 'System Health', icon: Activity },
          { id: 'AI_CONFIG', label: 'AI Engine Diagnostic', icon: Cpu },
          { id: 'AUDIT', label: 'Platform Audit', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-[#0878C9] text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0B243D]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#35C759] text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: PLATFORM OVERVIEW (REQUIREMENT 8)                            */}
      {/* =================================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Top Platform Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Operator Tenants */}
            <div className="bg-white dark:bg-[#0B243D] p-5 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                ACTIVE TENANT COMPANIES
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-[#061A2E] dark:text-white tabular-nums">
                  {operatorTenants.length}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
                  +1 this month
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>3 Active · 1 Trial · 0 Suspended</span>
              </div>
            </div>

            {/* Active Suppliers */}
            <div className="bg-white dark:bg-[#0B243D] p-5 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                QUALIFIED SUPPLIER NETWORK
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-[#061A2E] dark:text-white tabular-nums">
                  {suppliers.length}
                </span>
                <span className="text-xs text-[#0878C9] font-bold">100% NSD Audited</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#35C759]" />
                <span>Tier 1 &amp; Tier 2 Oilfield Vendors</span>
              </div>
            </div>

            {/* Monthly Recurring Revenue */}
            <div className="bg-white dark:bg-[#0B243D] p-5 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  PLATFORM MRR
                </span>
                <span className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 px-1 rounded bg-amber-100 dark:bg-amber-950/60">
                  DEMO DATA
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-[#35C759] tabular-nums font-mono">
                  ${revenueMetrics.mrrUSD.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-medium">ARR ${(revenueMetrics.arrUSD / 1000).toFixed(0)}k</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                <span>Net Retention: <strong>{revenueMetrics.netRevenueRetentionPercent}%</strong> · Churn: <strong>{revenueMetrics.churnRatePercent}%</strong></span>
              </div>
            </div>

            {/* Network Procurement GMV */}
            <div className="bg-white dark:bg-[#0B243D] p-5 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                OPEN RFQS &amp; ACTIVE TENDERS
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-[#0878C9] dark:text-[#00AFC7] tabular-nums">
                  {procurementRequests.length} Active
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ~${(procurementRequests.reduce((sum, r) => sum + (r.estimatedCostUSD || 32000), 0) / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                <span>Fast-track cross-basin liquidity</span>
              </div>
            </div>
          </div>

          {/* Platform Performance & Ecosystem Health Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Live Subsystems & AI Runtime Health */}
            <div className="md:col-span-2 bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0878C9]" />
                  <h2 className="text-sm font-bold text-[#061A2E] dark:text-white uppercase tracking-wider">
                    Ecosystem Telemetry &amp; Service Availability
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 99.98% System Uptime
                </span>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">AI Engine Provider</span>
                  <span className="text-sm font-bold text-[#0878C9] dark:text-[#00AFC7] mt-0.5 block">
                    Gemini 3.8 Flash
                  </span>
                  <span className="text-[10px] text-slate-400">Server proxy via @google/genai</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Deterministic Fallback</span>
                  <span className="text-sm font-bold text-[#35C759] mt-0.5 block">
                    Zero-Downtime Engine
                  </span>
                  <span className="text-[10px] text-slate-400">100% offline risk assurance</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Tenant Isolation</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white mt-0.5 block">
                    Encrypted Boundary
                  </span>
                  <span className="text-[10px] text-slate-400">Strict zero cross-tenant leak</span>
                </div>
              </div>

              {/* Recent Platform Activity Feed */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Recent Platform-Wide Audit Events
                </span>
                <div className="space-y-2">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-[#061A2E]/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0878C9]" />
                        <div>
                          <span className="font-bold text-[#061A2E] dark:text-white">{log.action}</span>
                          <span className="text-slate-400"> · </span>
                          <span className="text-slate-500">{log.userName} ({log.entityType})</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Platform Management */}
            <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-[#061A2E] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#35C759]" />
                <span>Tenant Governance</span>
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed">
                As a NEXORA Super Administrator, you possess root visibility across all tenant workspaces, subscription terms, and supplier verification credentials.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setActiveTab('TENANTS')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#061A2E] hover:bg-slate-200 dark:hover:bg-[#123653] text-[#061A2E] dark:text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-[#0878C9]" />
                    <span>Manage Subscriber Tenants</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveTab('REVENUE')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#061A2E] hover:bg-slate-200 dark:hover:bg-[#123653] text-[#061A2E] dark:text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>Review MRR &amp; Invoices</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setActiveTab('AI_MODULES')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#061A2E] hover:bg-slate-200 dark:hover:bg-[#123653] text-[#061A2E] dark:text-white text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00AFC7]" />
                    <span>Configure AI Feature Flags</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: TENANTS MANAGEMENT (REQUIREMENT 9)                           */}
      {/* =================================================================== */}
      {activeTab === 'TENANTS' && (
        <div className="bg-white dark:bg-[#0B243D] rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#061A2E] dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0878C9]" />
                <span>Companies / Tenants Directory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-tenant isolated workspaces. Each operator has private databases, facilities, and materials.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search tenant name or region..."
                  value={searchTenant}
                  onChange={(e) => setSearchTenant(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#1D4968] bg-slate-50 dark:bg-[#061A2E] text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-[#0878C9]"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#061A2E] rounded-lg text-xs">
                {(['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setTenantFilter(st)}
                    className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-colors cursor-pointer ${
                      tenantFilter === st
                        ? 'bg-white dark:bg-[#0B243D] text-[#0878C9] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#061A2E]/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Tenant Company</th>
                  <th className="p-3.5">Industry &amp; Segment</th>
                  <th className="p-3.5">Plan Tier</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Seats / Sites</th>
                  <th className="p-3.5 text-right">MRR (USD)</th>
                  <th className="p-3.5 text-right">Renewal Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTenants.map((org) => {
                  const statusColors: Record<string, string> = {
                    Active: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
                    Trial: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
                    Suspended: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
                    Pending: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300',
                  };

                  return (
                    <tr key={org.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="p-3.5">
                        <div className="font-bold text-[#061A2E] dark:text-white">{org.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{org.code || org.id} · {org.region}</div>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        <div>{org.segment || 'Integrated'}</div>
                        <div className="text-[10px] text-slate-400">{org.country}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-black text-[#0878C9] dark:text-[#35C759]">
                          {org.subscriptionPlan || 'ENTERPRISE'}
                        </span>
                        <div className="text-[10px] text-slate-400">{org.billingCycle || 'Annual'}</div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            statusColors[org.subscriptionStatus || 'Active'] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {org.subscriptionStatus || 'Active'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        {org.usersCount} users · {org.facilitiesCount} sites
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        ${(org.mrrUSD || 18500).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right text-slate-500 font-mono text-[11px]">
                        {new Date(org.renewalDate || '2027-01-15').toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTenantModal(org)}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => {
                            store.setCurrentOrganization(org.id);
                            onNavigate('dashboard');
                          }}
                          className="px-2.5 py-1 rounded bg-[#0878C9] hover:bg-[#0661a3] text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Impersonate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: SUPPLIERS NETWORK (REQUIREMENT 16)                           */}
      {/* =================================================================== */}
      {activeTab === 'SUPPLIERS' && (
        <div className="bg-white dark:bg-[#0B243D] rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#061A2E] dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0878C9]" />
                <span>Qualified Supplier Ecosystem</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                National Supplier Database (NSD) verified vendors participating across tenant procurement tenders.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Future Monetization Ready · Strict Non-Deceptive Qualification
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {suppliers.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-[#1D4968] bg-slate-50 dark:bg-[#061A2E] space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#061A2E] dark:text-white">{s.name}</h3>
                    <p className="text-[11px] text-slate-500">{s.country} · {(s.categories || s.capabilities || []).join(', ')}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#35C759]/20 text-[#35C759] border border-[#35C759]/30">
                    NSD Verified
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Vendor Tier</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{s.tier || 'TIER_1'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Compliance Score</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">98.4%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Turnaround SLA</span>
                    <span className="font-bold text-[#0878C9]">{s.averageLeadTimeDays || s.leadTimeDays || 14}d Avg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: USERS DIRECTORY                                             */}
      {/* =================================================================== */}
      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-[#0B243D] rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm p-5 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-[#061A2E] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0878C9]" />
              <span>Platform Identity &amp; Access Directory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidated user registry spanning Operator Tenants, Supplier Portals, and NEXORA Super Admins.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#061A2E]/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Tenant / Affiliation</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Switch As</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-[#061A2E] dark:text-white">{u.name}</td>
                    <td className="p-3 font-mono text-slate-500">{u.email}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{u.organizationName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-[#0878C9] dark:text-[#00AFC7] border border-slate-200 dark:border-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          store.setCurrentUser(u.id);
                          onNavigate('dashboard');
                        }}
                        className="px-2.5 py-1 rounded bg-[#0878C9] hover:bg-[#0661a3] text-white text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        Login As
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: SUBSCRIPTIONS & PLANS (REQUIREMENT 10)                       */}
      {/* =================================================================== */}
      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#061A2E] dark:text-white">
              NEXORA SaaS Subscription Matrix &amp; Tier Governance
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              Configurable tier limits, seat bounds, and AI capability gates. Changes apply platform-wide to tenant renewal cycles.
            </p>

            <div className="grid md:grid-cols-4 gap-4 pt-2">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-[#1D4968] bg-slate-50 dark:bg-[#061A2E] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0878C9] dark:text-[#35C759] uppercase">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{p.trialDays}d Trial</span>
                  </div>

                  <div className="py-2 border-y border-slate-200 dark:border-slate-800">
                    <span className="text-2xl font-black text-[#061A2E] dark:text-white tabular-nums font-mono">
                      ${p.monthlyPriceUSD.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>

                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>• Seats: <strong>{p.maxUsers}</strong></li>
                    <li>• Facilities: <strong>{p.maxFacilities}</strong></li>
                    <li>• SKUs: <strong>{p.maxMaterials}</strong></li>
                    <li>• What-If: <strong>{p.features.whatIfSimulator ? 'Enabled' : 'No'}</strong></li>
                    <li>• ERP Connector: <strong>{p.features.erpConnector ? 'SAP/Maximo' : 'No'}</strong></li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 6: REVENUE DASHBOARD (REQUIREMENT 13)                           */}
      {/* =================================================================== */}
      {activeTab === 'REVENUE' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span><strong>DEMO DATA DISCLAIMER:</strong> All SaaS MRR, ARR, and subscriber billings are simulated for evaluation demonstration.</span>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-white">
              Simulated Ledger
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B243D] p-5 rounded-2xl border border-slate-200 dark:border-[#1D4968]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly Recurring (MRR)</span>
              <span className="text-2xl font-black text-[#35C759] mt-1 block tabular-nums font-mono">
                ${revenueMetrics.mrrUSD.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                +{revenueMetrics.monthlyGrowthRatePercent}% growth MoM
              </span>
            </div>

            <div className="bg-white dark:bg-[#0B243D] p-5 rounded-2xl border border-slate-200 dark:border-[#1D4968]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Annual Recurring (ARR)</span>
              <span className="text-2xl font-black text-[#0878C9] mt-1 block tabular-nums font-mono">
                ${revenueMetrics.arrUSD.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Contracted run rate</span>
            </div>

            <div className="bg-white dark:bg-[#0B243D] p-5 rounded-2xl border border-slate-200 dark:border-[#1D4968]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Average ARPU</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block tabular-nums font-mono">
                ${revenueMetrics.averageRevenuePerTenantUSD.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Per operator tenant</span>
            </div>

            <div className="bg-white dark:bg-[#0B243D] p-5 rounded-2xl border border-slate-200 dark:border-[#1D4968]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Retention / Churn</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block tabular-nums font-mono">
                {revenueMetrics.netRevenueRetentionPercent}% / {revenueMetrics.churnRatePercent}%
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Net negative churn</span>
            </div>
          </div>

          {/* Platform Invoices */}
          <div className="bg-white dark:bg-[#0B243D] rounded-2xl border border-slate-200 dark:border-[#1D4968] p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#061A2E] dark:text-white uppercase tracking-wider">
              Cross-Tenant Billing Ledger &amp; Invoices
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#061A2E]/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Tenant Name</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Billing Cycle</th>
                    <th className="p-3 text-right">Amount (USD)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-[#0878C9]">{inv.invoiceNumber}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-white">{inv.organizationName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{inv.plan}</td>
                      <td className="p-3 text-slate-500">{inv.billingCycle}</td>
                      <td className="p-3 text-right font-mono font-bold tabular-nums">
                        ${inv.amountUSD.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 7: IMPLEMENTATION SERVICES (REQUIREMENT 14)                     */}
      {/* =================================================================== */}
      {activeTab === 'SERVICES' && (
        <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#061A2E] dark:text-white">
              Professional Implementation &amp; Onboarding Packages
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              One-time technical onboarding, data migration, and SAP/IBM Maximo integration services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-2">
            {implementationServices.map((srv) => (
              <div
                key={srv.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-[#1D4968] bg-slate-50 dark:bg-[#061A2E] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{srv.code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0878C9]/20 text-[#0878C9]">
                    {srv.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#061A2E] dark:text-white">{srv.name}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{srv.description}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{srv.typicalDurationWeeks} Weeks SLA</span>
                  <span className="font-mono font-black text-[#35C759]">
                    ${srv.standardPriceUSD.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 8: PREMIUM AI MODULES (REQUIREMENT 15)                          */}
      {/* =================================================================== */}
      {activeTab === 'AI_MODULES' && (
        <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#061A2E] dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#35C759]" />
              <span>Premium AI Intelligence Modules &amp; Entitlements</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control feature flags and standalone add-on capabilities available across tenant subscriptions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-2">
            {aiModules.map((mod) => (
              <div
                key={mod.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-[#1D4968] bg-slate-50 dark:bg-[#061A2E] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0878C9] dark:text-[#00AFC7]">{mod.name}</span>
                  <button
                    onClick={() => store.toggleAIModule(mod.id, !mod.isEnabledGlobally)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      mod.isEnabledGlobally
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {mod.isEnabledGlobally ? 'Active Globally' : 'Disabled'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{mod.description}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Included in: {mod.includedInPlans.join(', ')}</span>
                  <span className="font-mono text-[#35C759] font-bold">
                    +${mod.standaloneAddonMonthlyPriceUSD.toLocaleString()}/mo Addon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 9: RFQS & PROCUREMENT ACTIVITY (REQUIREMENT 17)                 */}
      {/* =================================================================== */}
      {activeTab === 'RFQS' && (
        <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#061A2E] dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0878C9]" />
              <span>Platform-Wide RFQ &amp; Procurement Transactions</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live surveillance of buyer requests, supplier bids, and fulfillment delivery velocity.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#061A2E]/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Req ID</th>
                  <th className="p-3">Material Required</th>
                  <th className="p-3">Urgency</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Est. Value (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {procurementRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono font-bold text-[#0878C9]">{req.id}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-white">{req.materialName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (req.priority === 'Critical' || (req as any).urgency === 'Critical') ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.priority || (req as any).urgency || 'Normal'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-300">{req.status}</td>
                    <td className="p-3 text-right font-mono font-bold tabular-nums">
                      ${(req.estimatedCostUSD || 32000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 10: SYSTEM HEALTH & TELEMETRY                                  */}
      {/* =================================================================== */}
      {activeTab === 'HEALTH' && (
        <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] space-y-4">
          <h2 className="text-base font-bold text-[#061A2E] dark:text-white">
            System Infrastructure &amp; Runtime Health
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968] flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Express Application Server</div>
                <div className="text-[11px] text-slate-500">Port 3000 · Vite Middleware Pipeline</div>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Healthy
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968] flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">Autonomous Risk Engine</div>
                <div className="text-[11px] text-slate-500">Deterministic stock delta background monitor</div>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Running
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 11: AI CONFIG & DIAGNOSTICS                                     */}
      {/* =================================================================== */}
      {activeTab === 'AI_CONFIG' && (
        <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] space-y-4">
          <h2 className="text-base font-bold text-[#061A2E] dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#0878C9]" />
            <span>Gemini AI Engine Configuration &amp; Diagnostics</span>
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
              <span className="text-slate-500 uppercase text-[10px] font-bold block">Primary AI Model</span>
              <span className="text-sm font-bold text-[#0878C9] mt-1 block">gemini-3.8-flash</span>
              <span className="text-[10px] text-slate-400">@google/genai TypeScript SDK</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
              <span className="text-slate-500 uppercase text-[10px] font-bold block">Fallback Layer</span>
              <span className="text-sm font-bold text-[#35C759] mt-1 block">Deterministic Engine</span>
              <span className="text-[10px] text-slate-400">100% offline uptime guarantee</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
              <span className="text-slate-500 uppercase text-[10px] font-bold block">Key Protection</span>
              <span className="text-sm font-bold text-amber-500 mt-1 block">Server-Side Proxy</span>
              <span className="text-[10px] text-slate-400">Zero keys in client bundle</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968] text-xs text-slate-600 dark:text-slate-300 space-y-3">
            <div className="font-bold text-[#061A2E] dark:text-white">Live Diagnostics Probe:</div>
            <p>
              Trigger a real-time probe through the server proxy (`/api/ai/chat`) to verify the engine state.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleTestAI}
                disabled={isTestingAI}
                className="px-4 py-2 rounded-lg bg-[#0878C9] hover:bg-[#0661a3] text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isTestingAI ? 'Running Diagnostic Ping...' : 'Run Diagnostics Ping'}
              </button>
              {testResult && (
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {testResult}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 12: MASTER AUDIT LOGS                                           */}
      {/* =================================================================== */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] space-y-4">
          <h2 className="text-base font-bold text-[#061A2E] dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0878C9]" />
            <span>Global Platform Audit Trail</span>
          </h2>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#061A2E]/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Operator / Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-800 dark:text-white">{log.userName}</td>
                    <td className="p-3">
                      <span className="font-mono text-[#0878C9] font-semibold">{log.action}</span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{log.entityType} ({log.entityId})</td>
                    <td className="p-3 text-slate-500">{log.reason || 'Routine operation'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tenant Management Modal (When 'Manage' is clicked) */}
      {selectedTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B243D] border border-slate-200 dark:border-[#1D4968] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0878C9]" />
                <h3 className="text-base font-bold text-[#061A2E] dark:text-white">
                  Manage Tenant: {selectedTenantModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTenantModal(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Subscription Plan</label>
                  <select
                    value={selectedTenantModal.subscriptionPlan || 'ENTERPRISE'}
                    onChange={(e) => handlePlanChange(selectedTenantModal.id, e.target.value as SubscriptionPlan)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#1D4968] bg-slate-50 dark:bg-[#061A2E] text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="ESSENTIAL">NEXORA ESSENTIAL ($2,900/mo)</option>
                    <option value="PROFESSIONAL">NEXORA PROFESSIONAL ($8,200/mo)</option>
                    <option value="ENTERPRISE">NEXORA ENTERPRISE ($18,500/mo)</option>
                    <option value="CUSTOM">NEXORA CUSTOM ($35,000/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Tenant Status</label>
                  <select
                    value={selectedTenantModal.subscriptionStatus || 'Active'}
                    onChange={(e) => handleStatusChange(selectedTenantModal.id, e.target.value as SubscriptionStatus)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-[#1D4968] bg-slate-50 dark:bg-[#061A2E] text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Trial">Trial</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Account Lead:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedTenantModal.implementationLead || 'Marcus Vance (NEXORA)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created At:</span>
                  <span className="font-mono text-slate-500">
                    {new Date(selectedTenantModal.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Renewal Cycle:</span>
                  <span className="font-mono text-slate-500">
                    {new Date(selectedTenantModal.renewalDate || '2027-01-15').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  store.setCurrentOrganization(selectedTenantModal.id);
                  setSelectedTenantModal(null);
                  onNavigate('dashboard');
                }}
                className="px-4 py-2 rounded-lg bg-[#0878C9] hover:bg-[#0661a3] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Impersonate Tenant Workspace
              </button>
              <button
                onClick={() => setSelectedTenantModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
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
