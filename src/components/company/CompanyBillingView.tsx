import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Download,
  ExternalLink,
  Zap,
  Building2,
  Users,
  Boxes,
  Warehouse,
  Sparkles,
  ArrowUpRight,
  Clock,
  FileText,
} from 'lucide-react';
import { store } from '../../services/store';
import { SubscriptionPlan } from '../../types';
import { NexoraLogo } from '../common/NexoraLogo';

export const CompanyBillingView: React.FC = () => {
  const currentOrg = store.getCurrentOrganization();
  const plans = store.getSubscriptionPlans();
  const invoices = store.getTenantInvoices(currentOrg.id);
  const currentPlan = currentOrg.subscriptionPlan || 'ENTERPRISE';
  const planDetails = plans.find((p) => p.id === currentPlan) || plans[2];

  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Annual'>(
    currentOrg.billingCycle || 'Annual'
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);

  // Tenant usage metrics
  const materialsCount = store.getMaterials().length;
  const usersCount = store.getState().users.filter((u) => u.organizationId === currentOrg.id).length;
  const facilitiesCount = store.getFacilities().length;
  const warehousesCount = store.getWarehouses().length;

  const handleRequestUpgrade = (planId: SubscriptionPlan) => {
    setSelectedPlanForUpgrade(planId);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = () => {
    if (selectedPlanForUpgrade) {
      store.updateTenantPlan(currentOrg.id, selectedPlanForUpgrade, billingCycle);
      setUpgradeSuccess(`Successfully upgraded tenant subscription to ${selectedPlanForUpgrade}!`);
      setShowUpgradeModal(false);
      setTimeout(() => setUpgradeSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#E0F4FA] dark:bg-[#0B243D] p-6 rounded-2xl border border-[#65C7E5]/50 dark:border-[#1D4968] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A78B5] dark:text-[#35C759]">
              Enterprise Subscription &amp; Licensing
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Tenant ID: {currentOrg.code || currentOrg.id}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#061A2E] dark:text-white tracking-tight">
            {currentOrg.name} — Subscription Plan
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Current Tier:{' '}
            <strong className="text-[#0878C9] dark:text-[#35C759]">{planDetails.name}</strong> ·{' '}
            Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentOrg.subscriptionStatus || 'Active'}</span>
            {' '}· Renewal Date:{' '}
            <span className="font-mono">{new Date(currentOrg.renewalDate || '2027-01-15').toLocaleDateString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-white dark:bg-[#061A2E] rounded-xl border border-slate-200 dark:border-[#1D4968] text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Current Billing
            </span>
            <span className="text-lg font-black text-[#061A2E] dark:text-white tabular-nums">
              ${(currentOrg.mrrUSD || 18500).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">/ mo</span>
            </span>
          </div>
        </div>
      </div>

      {upgradeSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{upgradeSuccess}</span>
        </div>
      )}

      {/* Usage Against Plan Limits */}
      <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#061A2E] dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0878C9]" />
            <span>Plan Capacity &amp; Resource Consumption</span>
          </h2>
          <span className="text-xs text-slate-500">
            Governed by <strong className="text-[#0878C9]">{planDetails.name}</strong> SLA
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Users */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0878C9]" /> Users
              </span>
              <span className="font-mono text-[10px]">{usersCount} / {planDetails.maxUsers}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#0878C9] h-full rounded-full"
                style={{
                  width:
                    planDetails.maxUsers === 'Unlimited'
                      ? '35%'
                      : `${Math.min(100, (usersCount / Number(planDetails.maxUsers)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">
              {planDetails.maxUsers === 'Unlimited' ? 'Enterprise Unlimited Seats' : `${planDetails.maxUsers} Authorized Seats`}
            </span>
          </div>

          {/* Facilities */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#35C759]" /> Facilities
              </span>
              <span className="font-mono text-[10px]">{facilitiesCount} / {planDetails.maxFacilities}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#35C759] h-full rounded-full"
                style={{
                  width:
                    planDetails.maxFacilities === 'Unlimited'
                      ? '40%'
                      : `${Math.min(100, (facilitiesCount / Number(planDetails.maxFacilities)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">
              Operational CPFs, well pads &amp; pipe yards
            </span>
          </div>

          {/* Warehouses */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-[#00AFC7]" /> Warehouses
              </span>
              <span className="font-mono text-[10px]">{warehousesCount} / {planDetails.maxWarehouses}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#00AFC7] h-full rounded-full"
                style={{
                  width:
                    planDetails.maxWarehouses === 'Unlimited'
                      ? '50%'
                      : `${Math.min(100, (warehousesCount / Number(planDetails.maxWarehouses)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">
              Central &amp; remote field spares depots
            </span>
          </div>

          {/* Materials */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-[#1D4968]">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-amber-500" /> Catalog SKUs
              </span>
              <span className="font-mono text-[10px]">{materialsCount} / {planDetails.maxMaterials}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{
                  width:
                    planDetails.maxMaterials === 'Unlimited'
                      ? '25%'
                      : `${Math.min(100, (materialsCount / Number(planDetails.maxMaterials)) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-2 block">
              Active critical materials &amp; spares
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Plans Comparison */}
      <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#061A2E] dark:text-white">
              NEXORA SaaS Subscription Tiers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select or upgrade your plan to unlock expanded basin capacity, AI capabilities, and ERP connectors.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#061A2E] rounded-xl border border-slate-200 dark:border-[#1D4968] text-xs">
            <button
              onClick={() => setBillingCycle('Monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                billingCycle === 'Monthly'
                  ? 'bg-white dark:bg-[#0B243D] text-[#0878C9] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('Annual')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                billingCycle === 'Annual'
                  ? 'bg-[#0878C9] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded bg-[#35C759] text-white text-[9px] font-black uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isCurrent = p.id === currentPlan;
            const price = billingCycle === 'Annual' ? Math.round(p.annualPriceUSD / 12) : p.monthlyPriceUSD;

            return (
              <div
                key={p.id}
                className={`p-5 rounded-xl flex flex-col justify-between transition-all border ${
                  isCurrent
                    ? 'border-[#0878C9] bg-[#E0F4FA]/40 dark:bg-[#0B243D]/90 shadow-md ring-2 ring-[#0878C9]/30'
                    : 'border-slate-200 dark:border-[#1D4968] bg-white dark:bg-[#061A2E]/60 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0878C9] dark:text-[#35C759] uppercase tracking-wider">
                      {p.name}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-[#0878C9] text-white text-[9px] font-black uppercase">
                        Current Plan
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 min-h-[36px]">
                    {p.tagline}
                  </p>

                  <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#061A2E] dark:text-white tabular-nums">
                        ${price.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">/ month</span>
                    </div>
                    {billingCycle === 'Annual' && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                        Billed annually (${p.annualPriceUSD.toLocaleString()} / yr)
                      </span>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2 text-[11px] pt-1">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-[#35C759] shrink-0" />
                      <span>{p.maxUsers === 'Unlimited' ? 'Unlimited Users' : `Up to ${p.maxUsers} Users`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-[#35C759] shrink-0" />
                      <span>{p.maxFacilities === 'Unlimited' ? 'Unlimited Facilities' : `Up to ${p.maxFacilities} Facilities`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-[#35C759] shrink-0" />
                      <span>{p.maxMaterials === 'Unlimited' ? 'Unlimited Materials' : `${p.maxMaterials.toLocaleString()} SKUs`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      {p.features.whatIfSimulator ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#35C759] shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                      )}
                      <span className={p.features.whatIfSimulator ? '' : 'text-slate-400 line-through'}>
                        What-If Simulator
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      {p.features.erpConnector ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#35C759] shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                      )}
                      <span className={p.features.erpConnector ? '' : 'text-slate-400'}>
                        {p.features.erpConnector ? 'SAP & Maximo Connectors' : 'Manual / CSV Export'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                      {p.features.supportSLA}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold text-center cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRequestUpgrade(p.id)}
                      className="w-full py-2 px-3 rounded-lg bg-[#0878C9] hover:bg-[#0661a3] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>Switch to {p.name.replace('NEXORA ', '')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-[#0B243D] rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-[#1D4968] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#061A2E] dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0878C9]" />
              <span>Tenant Invoices &amp; Receipts</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Isolated financial history for {currentOrg.name}.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
            Account in Good Standing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#061A2E]/60 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Billing Period</th>
                <th className="p-3.5">Plan</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5 text-right">Amount (USD)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No historical invoices on file for this tenant.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono font-bold text-[#0878C9]">{inv.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {new Date(inv.issueDate).toLocaleDateString()} — {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {inv.plan} ({inv.billingCycle})
                    </td>
                    <td className="p-3.5 text-slate-500">{inv.paymentMethod}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      ${inv.amountUSD.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => alert(`Downloading formal PDF tax invoice: ${inv.invoiceNumber}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B243D] border border-slate-200 dark:border-[#1D4968] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0878C9]/10 text-[#0878C9] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#061A2E] dark:text-white">
                  Confirm Subscription Change
                </h3>
                <p className="text-xs text-slate-500">
                  Switching to {selectedPlanForUpgrade} tier
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your tenant account will immediately gain access to the features and capacity limits of the{' '}
              <strong>{selectedPlanForUpgrade}</strong> tier on a <strong>{billingCycle}</strong> schedule.
              Prorated adjustments will be calculated on your next billing cycle.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                className="px-4 py-2 rounded-lg bg-[#0878C9] hover:bg-[#0661a3] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Plan Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
